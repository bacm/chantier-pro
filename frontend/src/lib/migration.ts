// Script de migration des données LocalStorage vers le backend
import { loadProjects } from './projects';
import { projectsApi } from './api';
import { Project } from '@/types';
import { toast } from 'sonner';

export async function migrateProjectsToBackend(organizationId: string, userId: string) {
  try {
    // Load projects from LocalStorage
    const localProjects = loadProjects();
    
    if (localProjects.length === 0) {
      toast.info('Aucun projet à migrer');
      return { migrated: 0, failed: 0 };
    }
    
    let migrated = 0;
    let failed = 0;
    
    // Migrate each project
    for (const project of localProjects) {
      try {
        // Prepare project data for backend
        const projectData: Partial<Project> = {
          name: project.name,
          address: project.address,
          projectType: project.projectType,
          status: project.status,
          calibration: project.calibration,
          startDate: project.startDate,
          contractualEndDate: project.contractualEndDate,
          estimatedEndDate: project.estimatedEndDate,
          companies: project.companies,
          decisions: project.decisions,
          reports: project.reports,
          snags: project.snags,
          payments: project.payments,
          initialScore: project.initialScore,
          currentScore: project.currentScore,
          currentRiskLevel: project.currentRiskLevel,
          referentMoeId: userId, // Set creator as referent MOE
        };
        
        await projectsApi.create(organizationId, projectData);
        migrated++;
      } catch (error) {
        console.error(`Failed to migrate project ${project.name}:`, error);
        failed++;
      }
    }
    
    if (migrated > 0) {
      toast.success(`Migration terminée`, {
        description: `${migrated} projet(s) migré(s)${failed > 0 ? `, ${failed} échec(s)` : ''}`,
      });
    }
    
    if (failed > 0) {
      toast.warning(`${failed} projet(s) n'ont pas pu être migrés`);
    }
    
    return { migrated, failed };
  } catch (error) {
    console.error('Migration error:', error);
    toast.error('Erreur lors de la migration', {
      description: (error as Error).message,
    });
    return { migrated: 0, failed: 0 };
  }
}
