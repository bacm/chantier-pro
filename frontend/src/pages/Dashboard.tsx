import { Plus, FolderOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProjectCard } from '@/components/ProjectCard';
import { OrganizationDashboard } from '@/components/OrganizationDashboard';
import { AppLayout } from '@/components/AppLayout';
import { useProjects } from '@/hooks/useProjects';
import { useOrganization } from '@/contexts/OrganizationContext';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();
  const { currentOrganization, isLoading: orgLoading } = useOrganization();
  const { data: projectsData, isLoading: projectsLoading } = useProjects(currentOrganization?.id || null);

  const projects = projectsData?.projects || [];

  if (orgLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </AppLayout>
    );
  }

  if (!currentOrganization) {
    return (
      <AppLayout>
        <div className="text-center py-16">
          <FolderOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="font-display text-xl text-foreground mb-2">
            Aucune organisation sélectionnée
          </h2>
          <p className="text-muted-foreground mb-6">
            Créez ou sélectionnez une organisation pour commencer.
          </p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="font-display text-3xl md:text-4xl text-foreground mb-2">
            {currentOrganization.name}
          </h1>
          <p className="text-muted-foreground">
            Tableau de bord de l'organisation
          </p>
        </div>

        {/* Organization Dashboard */}
        <OrganizationDashboard />

        {/* Action bar */}
        <div className="flex justify-between items-center">
          <h2 className="font-display text-xl text-foreground">
            Projets
          </h2>
          <Button onClick={() => navigate('/projects/new')}>
            <Plus className="h-4 w-4 mr-2" />
            Nouveau projet
          </Button>
        </div>

        {/* Projects grid */}
        {projectsLoading ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground">Chargement des projets...</p>
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-16 bg-card border border-border rounded-lg">
            <FolderOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-display text-lg text-foreground mb-2">
              Aucun projet
            </h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Créez votre premier projet pour commencer à suivre sa traçabilité juridique.
            </p>
            <Button onClick={() => navigate('/projects/new')}>
              <Plus className="h-4 w-4 mr-2" />
              Créer un projet
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onClick={() => navigate(`/projects/${project.id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default Dashboard;
