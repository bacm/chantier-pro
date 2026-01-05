import { Decision, DecisionType, Project, RiskLevel, AuditResult } from '@/types';

// Weight of each decision type (higher = more critical)
export const DECISION_TYPE_WEIGHTS: Record<DecisionType, number> = {
  modification: 3,
  validation: 2,
  alert: 3,
  financial: 3,
  reception: 2,
};

// Labels for decision types
export const DECISION_TYPE_LABELS: Record<DecisionType, string> = {
  modification: 'Modification demandée',
  validation: 'Validation technique',
  alert: 'Alerte ou réserve',
  financial: 'Impact financier',
  reception: 'Réception / livraison',
};

// Calculate the impact of a single decision on the score
export const calculateDecisionImpact = (decision: Omit<Decision, 'id' | 'createdAt' | 'scoreImpact'>): number => {
  const weight = DECISION_TYPE_WEIGHTS[decision.type];
  let impact = 0;

  // Well-documented decision = positive impact
  // Poorly documented = negative impact
  const validationFactor = decision.hasWrittenValidation ? 1 : -1;
  const proofFactor = decision.hasProofAttached ? 0.5 : -0.5;
  
  // Financial decisions without proper documentation are more risky
  const financialMultiplier = decision.hasFinancialImpact ? 1.5 : 1;

  impact = (validationFactor + proofFactor) * weight * financialMultiplier;
  
  return Math.round(impact);
};

// Calculate the current project score based on initial audit and all decisions
export const calculateProjectScore = (project: Project): { score: number; riskLevel: RiskLevel } => {
  // Start with initial audit score or 50 if no audit
  const baseScore = project.auditResult?.score ?? 50;
  
  if (project.decisions.length === 0) {
    return {
      score: baseScore,
      riskLevel: getScoreRiskLevel(baseScore),
    };
  }

  // Calculate cumulative impact from decisions
  const totalImpact = project.decisions.reduce((sum, d) => sum + d.scoreImpact, 0);
  
  // Normalize impact: each decision can affect score by up to ~5 points
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
    .sort((a, b) => a.scoreImpact - b.scoreImpact); // Most negative first
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

// Calculate score evolution (percentage change)
export const calculateScoreEvolution = (project: Project): number => {
  if (!project.auditResult) return 0;
  return project.currentScore - project.auditResult.score;
};
