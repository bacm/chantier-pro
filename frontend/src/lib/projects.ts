import { Project, Decision, Company, DecisionType, ProjectStatus, ProjectCalibration, SiteReport, WeatherType, SiteObservation, Snag } from '@/types';
import { getScoreRiskLevel, calculateInitialScore, calculateProjectScoreFromDecisions, calculateDecisionImpact } from './scoring';

// Generate unique IDs
export const generateId = (): string => {
  return crypto.randomUUID();
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

// Create project from calibration wizard
export const createProjectFromCalibration = (
  name: string,
  address: string,
  projectType: Project['projectType'],
  status: ProjectStatus,
  calibration: ProjectCalibration,
  startDate?: Date,
  contractualEndDate?: Date
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
    startDate,
    contractualEndDate,
    estimatedEndDate: contractualEndDate, // By default, estimated = contractual
    companies: [],
    decisions: [],
    reports: [],
    snags: [],
    payments: [],
    initialScore,
    currentScore: initialScore,
    currentRiskLevel: getScoreRiskLevel(initialScore),
  };
};

export const createSnag = (
  description: string,
  companyId: string,
  location?: string
): Snag => {
  return {
    id: generateId(),
    description,
    companyId,
    location,
    isCleared: false,
    foundDate: new Date(),
  };
};

export const addSnagToProject = (project: Project, snag: Snag): Project => {
  return {
    ...project,
    snags: [...(project.snags || []), snag],
  };
};

export const toggleSnagStatus = (project: Project, snagId: string): Project => {
  return {
    ...project,
    snags: (project.snags || []).map(s => {
      if (s.id === snagId) {
        const isCleared = !s.isCleared;
        return {
          ...s,
          isCleared,
          clearedDate: isCleared ? new Date() : undefined,
        };
      }
      return s;
    }),
  };
};

export const createCompany = (
  name: string,
  trade: string,
  hasInsurance: boolean,
  hasContract: boolean,
  contactName?: string,
  email?: string,
  phone?: string,
  contractAmount?: number
): Company => {
  return {
    id: generateId(),
    name,
    trade,
    hasInsurance,
    hasContract,
    contactName,
    email,
    phone,
    contractAmount,
  };
};

export const addCompanyToProject = (project: Project, company: Company): Project => {
  return {
    ...project,
    companies: [...project.companies, company],
  };
};

export const createDecision = (
  type: DecisionType,
  description: string,
  hasWrittenValidation: boolean,
  hasFinancialImpact: boolean,
  hasProofAttached: boolean,
  companyId?: string,
  amount?: number,
  proofLabel?: string,
  proofUrl?: string
): Decision => {
  const scoreImpact = calculateDecisionImpact({
    type,
    description,
    hasWrittenValidation,
    hasFinancialImpact,
    hasProofAttached,
    companyId,
  });

  return {
    id: generateId(),
    type,
    description,
    hasWrittenValidation,
    hasFinancialImpact,
    hasProofAttached,
    companyId,
    amount,
    proofLabel,
    proofUrl,
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

export const createSiteReport = (
  date: Date,
  weather: WeatherType,
  presentCompanyIds: string[],
  generalRemarks: string,
  observations: Omit<SiteObservation, 'id'>[],
  temperature?: number,
  isValidatedBadWeather: boolean = false
): SiteReport => {
  return {
    id: generateId(),
    date,
    weather,
    temperature,
    isValidatedBadWeather,
    presentCompanyIds,
    generalRemarks,
    observations: observations.map(obs => ({ ...obs, id: generateId() })),
    createdAt: new Date(),
  };
};

export const addReportToProject = (project: Project, report: SiteReport): Project => {
  return {
    ...project,
    reports: [...(project.reports || []), report],
  };
};

export const updateProjectPlanning = (
  project: Project,
  startDate?: Date,
  contractualEndDate?: Date,
  estimatedEndDate?: Date
): Project => {
  return {
    ...project,
    startDate,
    contractualEndDate,
    estimatedEndDate,
  };
};
