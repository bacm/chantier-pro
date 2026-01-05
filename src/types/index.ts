export type RiskLevel = 'low' | 'medium' | 'high';
export type CalibrationResponse = 'yes' | 'no' | 'unknown';
export type ProjectStatus = 'new' | 'ongoing';

// Calibration data collected during project creation
export interface ProjectCalibration {
  // Contractual calibration (Step 2)
  contractSigned: CalibrationResponse;
  scopeDefined: CalibrationResponse;
  crFormalized: CalibrationResponse;
  writtenValidationRequired: CalibrationResponse;
  
  // New project questions (Step 3 - if status = 'new')
  companiesChosen?: CalibrationResponse;
  budgetFixed?: CalibrationResponse;
  planningCommitted?: CalibrationResponse;
  
  // Ongoing project questions (Step 3 - if status = 'ongoing')
  decisionsWithoutValidation?: CalibrationResponse;
  workStarted?: CalibrationResponse;
  oralChanges?: CalibrationResponse;
  
  // Documentary maturity (Step 4)
  proofsCentralized: CalibrationResponse;
  decisionsTraceable: CalibrationResponse;
  financialImpactsDocumented: CalibrationResponse;
}

// Decision types for ongoing project tracking
export type DecisionType = 
  | 'modification'      // Modification demandée
  | 'validation'        // Validation technique
  | 'alert'             // Alerte ou réserve
  | 'financial'         // Impact financier
  | 'reception';        // Réception/livraison

export interface Decision {
  id: string;
  type: DecisionType;
  description: string;
  hasWrittenValidation: boolean;
  hasFinancialImpact: boolean;
  hasProofAttached: boolean;
  createdAt: Date;
  scoreImpact: number;
}

export interface Project {
  id: string;
  name: string;
  address: string;
  projectType: 'individual' | 'tertiary' | 'renovation';
  status: ProjectStatus;
  calibration: ProjectCalibration;
  createdAt: Date;
  decisions: Decision[];
  initialScore: number;
  currentScore: number;
  currentRiskLevel: RiskLevel;
}
