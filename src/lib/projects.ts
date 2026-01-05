import { Project, Decision, DecisionType, ProjectStatus, ProjectCalibration, CalibrationResponse } from '@/types';
import { calculateDecisionImpact, getScoreRiskLevel } from './scoring';

// Generate unique IDs
export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
};

// Format date for display
export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(date);
};

// Format time for display
export const formatTime = (date: Date): string => {
  return new Intl.DateTimeFormat('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

// Format full datetime
export const formatDateTime = (date: Date): string => {
  return `${formatDate(date)} à ${formatTime(date)}`;
};

// Get project type label
export const getProjectTypeLabel = (type: Project['projectType']): string => {
  switch (type) {
    case 'individual':
      return 'Maison individuelle';
    case 'tertiary':
      return 'Petit tertiaire';
    case 'renovation':
      return 'Rénovation';
  }
};

// Get project status label
export const getProjectStatusLabel = (status: ProjectStatus): string => {
  return status === 'new' ? 'Nouveau projet' : 'Projet en cours';
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
  } else {
    score += calculateOngoingProjectScore(calibration);
  }
  
  // Documentary maturity scoring
  score += calculateDocumentaryScore(calibration);
  
  // Clamp between 0 and 100
  return Math.max(0, Math.min(100, Math.round(score)));
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

// New project score (Step 3)
const calculateNewProjectScore = (calibration: ProjectCalibration): number => {
  let score = 0;
  if (calibration.companiesChosen) {
    // Companies chosen = more commitments = more risk
    score += scoreResponse(calibration.companiesChosen, -2, 2);
  }
  if (calibration.budgetFixed) {
    // Fixed budget = potential for issues
    score += scoreResponse(calibration.budgetFixed, -3, 3);
  }
  if (calibration.planningCommitted) {
    // Committed planning = pressure
    score += scoreResponse(calibration.planningCommitted, -3, 2);
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

// Local storage helpers
const STORAGE_KEY = 'chantier-audit-projects';

export const loadProjects = (): Project[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    const projects = JSON.parse(data);
    return projects.map((p: any) => ({
      ...p,
      createdAt: new Date(p.createdAt),
      decisions: (p.decisions || []).map((d: any) => ({
        ...d,
        createdAt: new Date(d.createdAt),
      })),
      status: p.status || 'new',
      calibration: p.calibration || {
        contractSigned: 'unknown',
        scopeDefined: 'unknown',
        crFormalized: 'unknown',
        writtenValidationRequired: 'unknown',
        proofsCentralized: 'unknown',
        decisionsTraceable: 'unknown',
        financialImpactsDocumented: 'unknown',
      },
      initialScore: p.initialScore ?? p.currentScore ?? 50,
      currentScore: p.currentScore ?? 50,
      currentRiskLevel: p.currentRiskLevel ?? 'medium',
    }));
  } catch {
    return [];
  }
};

export const saveProjects = (projects: Project[]): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
};

// Create project from calibration wizard
export const createProjectFromCalibration = (
  name: string,
  address: string,
  projectType: Project['projectType'],
  status: ProjectStatus,
  calibration: ProjectCalibration
): Project => {
  const initialScore = calculateInitialScore(status, projectType, calibration);
  
  return {
    id: generateId(),
    name,
    address,
    projectType,
    status,
    calibration,
    createdAt: new Date(),
    decisions: [],
    initialScore,
    currentScore: initialScore,
    currentRiskLevel: getScoreRiskLevel(initialScore),
  };
};

export const createDecision = (
  type: DecisionType,
  description: string,
  hasWrittenValidation: boolean,
  hasFinancialImpact: boolean,
  hasProofAttached: boolean
): Decision => {
  const scoreImpact = calculateDecisionImpact({
    type,
    description,
    hasWrittenValidation,
    hasFinancialImpact,
    hasProofAttached,
  });

  return {
    id: generateId(),
    type,
    description,
    hasWrittenValidation,
    hasFinancialImpact,
    hasProofAttached,
    createdAt: new Date(),
    scoreImpact,
  };
};

export const addDecisionToProject = (project: Project, decision: Decision): Project => {
  const updatedProject = {
    ...project,
    decisions: [...project.decisions, decision],
  };
  
  const { score, riskLevel } = calculateProjectScoreFromDecisions(updatedProject);
  updatedProject.currentScore = score;
  updatedProject.currentRiskLevel = riskLevel;
  
  return updatedProject;
};

// Calculate score based on initial calibration + decisions
export const calculateProjectScoreFromDecisions = (project: Project): { score: number; riskLevel: Project['currentRiskLevel'] } => {
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
