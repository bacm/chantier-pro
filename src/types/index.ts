export type RiskLevel = 'low' | 'medium' | 'high';
export type AuditResponse = 'yes' | 'no' | 'na';

export interface AuditQuestion {
  id: string;
  category: string;
  question: string;
  riskWeight: number;
  recommendation: string;
}

export interface AuditAnswer {
  questionId: string;
  response: AuditResponse;
}

export interface AuditResult {
  score: number;
  riskLevel: RiskLevel;
  answeredAt: Date;
  answers: AuditAnswer[];
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
  scoreImpact: number; // Calculated impact on project score
}

export interface Project {
  id: string;
  name: string;
  address: string;
  client: string;
  projectType: 'individual' | 'tertiary' | 'renovation';
  createdAt: Date;
  auditResult?: AuditResult;
  decisions: Decision[];
  currentScore: number; // Live score based on audit + decisions
  currentRiskLevel: RiskLevel;
}
