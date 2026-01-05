import { Project } from '@/types';

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
      return 'Tertiaire';
    case 'renovation':
      return 'Rénovation';
  }
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
      auditResult: p.auditResult
        ? {
            ...p.auditResult,
            answeredAt: new Date(p.auditResult.answeredAt),
          }
        : undefined,
    }));
  } catch {
    return [];
  }
};

export const saveProjects = (projects: Project[]): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
};

export const createProject = (
  name: string,
  address: string,
  client: string,
  projectType: Project['projectType']
): Project => {
  return {
    id: generateId(),
    name,
    address,
    client,
    projectType,
    createdAt: new Date(),
  };
};
