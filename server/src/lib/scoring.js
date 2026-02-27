// server/src/lib/scoring.js

export const DECISION_TYPE_WEIGHTS = {
  modification: 2,
  validation: 2,
  counsel: 4,
  financial: 3,
  reception: 3,
};

export const calculateDecisionImpact = (decision) => {
  const weight = DECISION_TYPE_WEIGHTS[decision.type] || 2;
  let impact = 0;

  const validationFactor = decision.hasWrittenValidation ? 1 : -1;
  const proofFactor = decision.hasProofAttached ? 0.5 : -0.5;
  
  const financialMultiplier = decision.hasFinancialImpact ? 1.5 : 1;

  impact = (validationFactor + proofFactor) * weight * financialMultiplier;
  
  return Math.round(impact);
};

export const getScoreRiskLevel = (score) => {
  if (score >= 75) return 'low';
  if (score >= 50) return 'medium';
  return 'high';
};

const scoreResponse = (response, yesPoints, noPoints) => {
  switch (response) {
    case 'yes': return yesPoints;
    case 'no': return noPoints;
    case 'unknown': return Math.floor(noPoints / 2);
    default: return 0;
  }
};

const calculateContractualScore = (calibration) => {
  let score = 0;
  score += scoreResponse(calibration.contractSigned, 5, -10);
  score += scoreResponse(calibration.scopeDefined, 5, -8);
  score += scoreResponse(calibration.crFormalized, 3, -5);
  score += scoreResponse(calibration.writtenValidationRequired, 5, -7);
  return score;
};

const calculateNewProjectScore = (calibration) => {
  let score = 0;
  score += scoreResponse(calibration.insuranceVerified, 8, -15);
  score += scoreResponse(calibration.docFiled, 4, -8);
  score += scoreResponse(calibration.pcDisplayed, 3, -6);
  return score;
};

const calculateOngoingProjectScore = (calibration) => {
  let score = 0;
  score += scoreResponse(calibration.decisionsWithoutValidation, -15, 5);
  score += scoreResponse(calibration.workStarted, -5, 0);
  score += scoreResponse(calibration.oralChanges, -12, 5);
  return score;
};

const calculateDocumentaryScore = (calibration) => {
  let score = 0;
  score += scoreResponse(calibration.proofsCentralized, 5, -8);
  score += scoreResponse(calibration.decisionsTraceable, 5, -10);
  score += scoreResponse(calibration.financialImpactsDocumented, 4, -6);
  return score;
};

export const calculateInitialScore = (status, projectType, calibration) => {
  let score = status === 'new' ? 75 : 50;
  
  const typeModifier = {
    individual: 0,
    renovation: -5,
    tertiary: -3,
  };
  score += typeModifier[projectType] || 0;
  
  if (!calibration) return score;

  score += calculateContractualScore(calibration);
  
  if (status === 'new') {
    score += calculateNewProjectScore(calibration);
  } else {
    score += calculateOngoingProjectScore(calibration);
  }
  
  score += calculateDocumentaryScore(calibration);
  
  return Math.max(0, Math.min(100, Math.round(score)));
};

export const calculateProjectScoreFromDecisions = (project) => {
  const baseScore = project.initialScore;
  
  if (!project.decisions || project.decisions.length === 0) {
    return {
      score: baseScore,
      riskLevel: getScoreRiskLevel(baseScore),
    };
  }

  const totalImpact = project.decisions.reduce((sum, d) => {
    // Ensure each decision has its impact calculated if missing or for verification
    const impact = calculateDecisionImpact(d);
    return sum + impact;
  }, 0);
  
  const normalizedImpact = totalImpact / (project.decisions.length * 0.5);
  let finalScore = baseScore + normalizedImpact;
  finalScore = Math.max(0, Math.min(100, Math.round(finalScore)));
  
  return {
    score: finalScore,
    riskLevel: getScoreRiskLevel(finalScore),
  };
};
