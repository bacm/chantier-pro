import { useNavigate } from 'react-router-dom';
import { ProjectCreationWizard } from '@/components/ProjectCreationWizard';
import { AppLayout } from '@/components/AppLayout';
import { useCreateProject } from '@/hooks/useProjects';
import { useOrganization } from '@/contexts/OrganizationContext';
import { toast } from 'sonner';
import { Project } from '@/types';

const CreateProject = () => {
  const navigate = useNavigate();
  const { currentOrganization } = useOrganization();
  const createProject = useCreateProject();

  const handleProjectCreated = async (projectData: Partial<Project>) => {
    if (!currentOrganization) return;
    
    try {
      const newProject = await createProject.mutateAsync({
        orgId: currentOrganization.id,
        data: projectData,
      });
      toast.success('Projet créé', {
        description: `Score initial: ${newProject.initialScore}/100`,
      });
      navigate(`/projects/${newProject.id}`);
    } catch (error) {
      // Error handled by mutation
    }
  };

  return (
    <AppLayout>
      <ProjectCreationWizard
        onComplete={handleProjectCreated}
        onCancel={() => navigate('/')}
      />
    </AppLayout>
  );
};

export default CreateProject;
