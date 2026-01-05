import { Project, Decision, Attachment } from '@/types';

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

// Local storage helpers
const STORAGE_KEY = 'chantier-decisions-projects';

export const loadProjects = (): Project[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    const projects = JSON.parse(data);
    return projects.map((p: any) => ({
      ...p,
      createdAt: new Date(p.createdAt),
      decisions: p.decisions.map((d: any) => ({
        ...d,
        createdAt: new Date(d.createdAt),
      })),
    }));
  } catch {
    return [];
  }
};

export const saveProjects = (projects: Project[]): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
};

export const createProject = (name: string, address: string, client: string): Project => {
  return {
    id: generateId(),
    name,
    address,
    client,
    createdAt: new Date(),
    decisions: [],
  };
};

export const createDecision = (content: string, author: string, attachments: Attachment[] = []): Decision => {
  return {
    id: generateId(),
    content,
    author,
    createdAt: new Date(),
    attachments,
  };
};
