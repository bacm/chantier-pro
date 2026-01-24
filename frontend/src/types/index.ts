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
  
  // MOE Specifics (Step 3 - Démarrage)
  insuranceVerified?: CalibrationResponse; // RC Pro + Décennale entreprises
  docFiled?: CalibrationResponse; // Déclaration d'Ouverture de Chantier
  pcDisplayed?: CalibrationResponse; // Permis de Construire affiché
  
  // Ongoing project questions (Step 4 - if status = 'ongoing')
  decisionsWithoutValidation?: CalibrationResponse;
  workStarted?: CalibrationResponse;
  oralChanges?: CalibrationResponse;
  
  // Documentary maturity (Step 5)
  proofsCentralized: CalibrationResponse;
  decisionsTraceable: CalibrationResponse;
  financialImpactsDocumented: CalibrationResponse;
}

// Decision types for ongoing project tracking
export type DecisionType = 
  | 'modification'      // Demande de modification (TMA/Client)
  | 'validation'        // Validation technique / Visa
  | 'counsel'           // Devoir de conseil / Alerte
  | 'financial'         // Impact financier / Avenant
  | 'reception';        // Réception / Livraison

export interface Company {
  id: string;
  name: string;
  trade: string; // Corps d'état (ex: Maçonnerie, Plomberie)
  contactName?: string;
  email?: string;
  phone?: string;
  hasInsurance: boolean; // Attestation décennale / RC à jour
  hasContract: boolean; // Marché signé
  contractAmount?: number; // Montant du marché HT
}

export interface Decision {
  id: string;
  type: DecisionType;
  description: string;
  companyId?: string; // Link to a specific company
  hasWrittenValidation: boolean;
  hasFinancialImpact: boolean;
  amount?: number; // Montant de l'avenant/impact HT
  hasProofAttached: boolean;
  proofLabel?: string; // Ex: "Photo n°12" ou "Email du 12/01"
  proofUrl?: string; // Lien externe vers le document
  createdAt: Date;
  scoreImpact: number;
}

export type WeatherType = 'sunny' | 'cloudy' | 'rain' | 'storm' | 'snow';

export interface SiteObservation {
  id: string;
  companyId?: string; // Optionnel (pourrait être général)
  text: string;
  isDone: boolean;
}

export interface SiteReport {
  id: string;
  date: Date;
  weather: WeatherType;
  temperature?: number; // °C
  isValidatedBadWeather: boolean; // Si coché, décale le planning contractuel
  presentCompanyIds: string[]; // List of companies present
  generalRemarks: string;
  observations: SiteObservation[]; // Observations par lot
  createdAt: Date;
}

export interface Snag {
  id: string;
  description: string;
  companyId: string;
  isCleared: boolean;
  foundDate: Date;
  clearedDate?: Date;
  location?: string; // Ex: "Chambre 1", "Façade Nord"
}

export type PaymentStatus = 'draft' | 'submitted' | 'validated' | 'rejected' | 'paid';

export interface PaymentApplication {
  id: string;
  projectId: string;
  companyId: string;
  number: number; // Situation n°1, 2...
  date: Date;
  period: Date; // Mois concerné
  
  // Amounts
  claimedAmount: number; // Montant demandé HT
  claimedPercentage: number; // % demandé cumulé
  
  validatedAmount: number; // Montant validé HT
  validatedPercentage: number; // % validé cumulé
  
  previousCumulativeAmount: number; // Montant cumulé précédent
  
  status: PaymentStatus;
  comments?: string;
  
  // Retenue de garantie (5% standard in France)
  hasRetenueGarantie: boolean;
  retenueAmount?: number;
}

export interface Project {
  id: string;
  organizationId: string; // NOUVEAU: Organisation propriétaire
  createdBy: string; // NOUVEAU: User ID du créateur
  referentMoeId?: string; // NOUVEAU: User ID du MOE référent (optionnel)
  name: string;
  address: string;
  projectType: 'individual' | 'tertiary' | 'renovation';
  status: ProjectStatus;
  calibration: ProjectCalibration;
  createdAt: Date;
  updatedAt?: Date; // NOUVEAU: Date de dernière modification
  startDate?: Date; // Date réelle ou prévue de démarrage
  contractualEndDate?: Date; // Date de fin prévue au contrat
  estimatedEndDate?: Date; // Date de fin réelle estimée
  companies: Company[];
  decisions: Decision[];
  reports: SiteReport[]; // Comptes-rendus
  snags: Snag[]; // Liste des réserves (OPR / Réception)
  payments: PaymentApplication[]; // Situations de travaux
  initialScore: number;
  currentScore: number;
  currentRiskLevel: RiskLevel;
}

// ===== Types pour la collaboration multi-utilisateurs =====

export type OrganizationRole = 'owner' | 'moe' | 'assistant' | 'read_only';
export type ProjectRole = 'owner' | 'editor' | 'viewer';
export type MembershipStatus = 'pending' | 'active' | 'suspended';
export type ActivityAction = 
  | 'created' 
  | 'updated' 
  | 'deleted' 
  | 'decision_added' 
  | 'company_added'
  | 'report_added'
  | 'snag_added'
  | 'payment_added'
  | 'planning_updated';

export interface Organization {
  id: string;
  name: string;
  slug: string; // Identifiant URL-friendly (unique)
  description?: string;
  logoUrl?: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string; // User ID du créateur
  settings: {
    allowPublicInvites: boolean;
    defaultRole: OrganizationRole;
  };
}

export interface Membership {
  id: string;
  organizationId: string;
  userId: string;
  role: OrganizationRole;
  invitedBy?: string; // User ID de l'inviteur
  invitedAt?: Date;
  joinedAt: Date;
  status: MembershipStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectAccess {
  id: string;
  projectId: string;
  userId: string;
  role: ProjectRole;
  grantedBy: string; // User ID qui a accordé l'accès
  grantedAt: Date;
  createdAt: Date;
}

export interface ProjectActivity {
  id: string;
  projectId: string;
  userId: string; // Auteur de l'action
  action: ActivityAction;
  entityType: string; // 'project' | 'decision' | 'company' | 'report' | 'snag' | 'payment'
  entityId?: string; // ID de l'entité concernée
  description: string; // Description lisible de l'action
  metadata?: Record<string, any>; // Données additionnelles
  createdAt: Date;
}

// Types pour les réponses API
export interface OrganizationWithStats extends Organization {
  memberCount: number;
  projectCount: number;
  role: OrganizationRole; // Rôle de l'utilisateur connecté dans cette organisation
}

export interface MembershipWithUser extends Membership {
  user: {
    id: string;
    email: string;
    name: string;
    avatar?: string;
  };
}

export interface ProjectWithAccess extends Project {
  access?: {
    role: ProjectRole;
    grantedAt?: Date;
  };
}
