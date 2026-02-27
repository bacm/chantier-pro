import { useParams, useNavigate } from 'react-router-dom';
import { useProject } from '@/hooks/useProjects';
import { ProjectDetail } from '@/components/ProjectDetail';
import { AppLayout } from '@/components/AppLayout';
import { ProjectProvider } from '@/contexts/ProjectContext';

const ProjectDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: project, isLoading, error } = useProject(id || null);

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-muted-foreground">Chargement du projet...</p>
        </div>
      </AppLayout>
    );
  }

  if (error || !project) {
    return (
      <AppLayout>
        <div className="text-center py-16">
          <h2 className="font-display text-xl text-foreground mb-2">
            Projet non trouvé
          </h2>
          <button 
            onClick={() => navigate('/')}
            className="text-primary hover:underline"
          >
            Retour au tableau de bord
          </button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <ProjectProvider project={project}>
        <ProjectDetail
          project={project}
          onBack={() => navigate('/')}
        />
      </ProjectProvider>
    </AppLayout>
  );
};

export default ProjectDetails;


export default ProjectDetails;
