export type RiskLevel = 'low' | 'medium' | 'high';
export type AuditResponse = 'yes' | 'no' | 'na';

export interface AuditQuestion {
  id: string;
  category: string;
  question: string;
  riskWeight: number; // 1-3, higher = more critical
  recommendation: string;
}

export interface AuditAnswer {
  questionId: string;
  response: AuditResponse;
}

export interface AuditResult {
  score: number; // 0-100
  riskLevel: RiskLevel;
  answeredAt: Date;
  answers: AuditAnswer[];
}

export interface Project {
  id: string;
  name: string;
  address: string;
  client: string;
  projectType: 'individual' | 'tertiary' | 'renovation';
  createdAt: Date;
  auditResult?: AuditResult;
}
