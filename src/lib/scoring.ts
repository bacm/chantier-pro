import { Decision, DecisionType, Project, RiskLevel } from '@/types';

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
