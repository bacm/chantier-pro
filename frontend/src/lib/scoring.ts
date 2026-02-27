import { Decision, DecisionType, Project, RiskLevel, ProjectStatus, ProjectCalibration, CalibrationResponse } from '@/types';

// Weight of each decision type (higher = more critical)
export const DECISION_TYPE_WEIGHTS: Record<DecisionType, number> = {
  modification: 2,
  validation: 2,
  counsel: 4, // Devoir de conseil is critical for MOE
  financial: 3,
  reception: 3,
};

// Labels for decision types
export const DECISION_TYPE_LABELS: Record<DecisionType, string> = {
  modification: 'Modification (Client/TMA)',
  validation: 'Visa technique / Validation',
  counsel: 'Devoir de conseil / Alerte',
  financial: 'Impact financier / Avenant',
  reception: 'Réception / Livraison',
};

// Score response helper
const scoreResponse = (response: CalibrationResponse, yesPoints: number, noPoints: number): number => {
  switch (response) {
    case 'yes': return yesPoints;
    case 'no': return noPoints;
    case 'unknown': return Math.floor(noPoints / 2); // Uncertainty = partial risk
  }
};

// Contractual score (Step 2)
const calculateContractualScore = (calibration: ProjectCalibration): number => {
  let score = 0;
  score += scoreResponse(calibration.contractSigned, 5, -10);
  score += scoreResponse(calibration.scopeDefined, 5, -8);
  score += scoreResponse(calibration.crFormalized, 3, -5);
  score += scoreResponse(calibration.writtenValidationRequired, 5, -7);
  return score;
};

// New project score (Step 3 - Démarrage)
const calculateNewProjectScore = (calibration: ProjectCalibration): number => {
  let score = 0;
  if (calibration.insuranceVerified) {
    // Insurances are vital for MOE protection
    score += scoreResponse(calibration.insuranceVerified, 8, -15);
  }
  if (calibration.docFiled) {
    // DOC is a legal requirement to start
    score += scoreResponse(calibration.docFiled, 4, -8);
  }
  if (calibration.pcDisplayed) {
    // PC display is a risk for third-party appeals
    score += scoreResponse(calibration.pcDisplayed, 3, -6);
  }
  return score;
};

// Ongoing project score (Step 3)
const calculateOngoingProjectScore = (calibration: ProjectCalibration): number => {
  let score = 0;
  if (calibration.decisionsWithoutValidation) {
    // Decisions without validation = major risk
    score += scoreResponse(calibration.decisionsWithoutValidation, -15, 5);
  }
  if (calibration.workStarted) {
    // Work started = can't go back
    score += scoreResponse(calibration.workStarted, -5, 0);
  }
  if (calibration.oralChanges) {
    // Oral changes = very risky
    score += scoreResponse(calibration.oralChanges, -12, 5);
  }
  return score;
};

// Documentary maturity score (Step 4)
const calculateDocumentaryScore = (calibration: ProjectCalibration): number => {
  let score = 0;
  score += scoreResponse(calibration.proofsCentralized, 5, -8);
  score += scoreResponse(calibration.decisionsTraceable, 5, -10);
  score += scoreResponse(calibration.financialImpactsDocumented, 4, -6);
  return score;
};

// Calculate initial score based on calibration
export const calculateInitialScore = (
  status: ProjectStatus,
  projectType: Project['projectType'],
  calibration: ProjectCalibration
): number => {
  // Base score depends on project status
  let score = status === 'new' ? 75 : 50;
  
  // Project type risk modifier
  const typeModifier = {
    individual: 0,
    renovation: -5, // Slightly more risky
    tertiary: -3,
  };
  score += typeModifier[projectType];
  
  // Contractual calibration scoring
  const contractualScore = calculateContractualScore(calibration);
  score += contractualScore;
  
  // Status-specific scoring
  if (status === 'new') {
    score += calculateNewProjectScore(calibration);
  }
  else {
    score += calculateOngoingProjectScore(calibration);
  }
  
  // Documentary maturity scoring
  score += calculateDocumentaryScore(calibration);
  
  // Clamp between 0 and 100
  return Math.max(0, Math.min(100, Math.round(score)));
};

// Calculate score based on initial calibration + decisions
export const calculateProjectScoreFromDecisions = (project: Project): { score: number; riskLevel: RiskLevel } => {
  const baseScore = project.initialScore;
  
  if (project.decisions.length === 0) {
    return {
      score: baseScore,
      riskLevel: getScoreRiskLevel(baseScore),
    };
  }

  // Calculate cumulative impact from decisions
  const totalImpact = project.decisions.reduce((sum, d) => sum + d.scoreImpact, 0);
  
  // Normalize impact
  const normalizedImpact = totalImpact / (project.decisions.length * 0.5);
  
  // Apply impact to base score
  let finalScore = baseScore + normalizedImpact;
  
  // Clamp between 0 and 100
  finalScore = Math.max(0, Math.min(100, Math.round(finalScore)));
  
  return {
    score: finalScore,
    riskLevel: getScoreRiskLevel(finalScore),
  };
};

// Calculate the impact of a single decision on the score
export const calculateDecisionImpact = (decision: Omit<Decision, 'id' | 'createdAt' | 'scoreImpact'>): number => {
  const weight = DECISION_TYPE_WEIGHTS[decision.type];
  let impact = 0;

  const validationFactor = decision.hasWrittenValidation ? 1 : -1;
  const proofFactor = decision.hasProofAttached ? 0.5 : -0.5;
  
  const financialMultiplier = decision.hasFinancialImpact ? 1.5 : 1;

  impact = (validationFactor + proofFactor) * weight * financialMultiplier;
  
  return Math.round(impact);
};

// Get risk level from score
export const getScoreRiskLevel = (score: number): RiskLevel => {
  if (score >= 75) return 'low';
  if (score >= 50) return 'medium';
  return 'high';
};

// Get decisions that are causing score degradation
export const getProblematicDecisions = (decisions: Decision[]): Decision[] => {
  return decisions
    .filter((d) => d.scoreImpact < 0)
    .sort((a, b) => a.scoreImpact - b.scoreImpact);
};

// Get well-documented decisions
export const getPositiveDecisions = (decisions: Decision[]): Decision[] => {
  return decisions
    .filter((d) => d.scoreImpact > 0)
    .sort((a, b) => b.scoreImpact - a.scoreImpact);
};

// Get risk level styling
export const getRiskLevelColor = (level: RiskLevel): string => {
  switch (level) {
    case 'low':
      return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    case 'medium':
      return 'text-amber-600 bg-amber-50 border-amber-200';
    case 'high':
      return 'text-red-600 bg-red-50 border-red-200';
  }
};

export const getRiskLevelLabel = (level: RiskLevel): string => {
  switch (level) {
    case 'low':
      return 'Sécurisé';
    case 'medium':
      return 'Vigilance';
    case 'high':
      return 'À risque';
  }
};

export const getRiskLevelDescription = (level: RiskLevel): string => {
  switch (level) {
    case 'low':
      return 'Ce projet est bien documenté. La traçabilité est suffisante.';
    case 'medium':
      return 'Certaines décisions manquent de documentation. Attention recommandée.';
    case 'high':
      return 'Plusieurs décisions à risque détectées. Action corrective nécessaire.';
  }
};

// Calculate score evolution (percentage change from initial)
export const calculateScoreEvolution = (project: Project): number => {
  return project.currentScore - project.initialScore;
};
