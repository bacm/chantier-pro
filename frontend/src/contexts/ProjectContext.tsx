import React, { createContext, useContext } from 'react';
import { Project } from '@/types';

interface ProjectContextType {
  project: Project;
  projectId: string;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider: React.FC<{ project: Project; children: React.ReactNode }> = ({ project, children }) => {
  return (
    <ProjectContext.Provider value={{ project, projectId: project.id }}>
      {children}
    </ProjectContext.Provider>
  );
};

export const useCurrentProject = () => {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useCurrentProject must be used within a ProjectProvider');
  }
  return context;
};
