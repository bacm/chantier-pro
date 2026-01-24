import { useState } from 'react';
import { useAuth } from '@/auth/AuthProvider';
import { useOrganization } from '@/contexts/OrganizationContext';
import { Plus, FolderOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Project, Decision, Company, SiteReport, Snag, PaymentApplication } from '@/types';
import { ProjectCard } from '@/components/ProjectCard';
import { ProjectCreationWizard } from '@/components/ProjectCreationWizard';
import { ProjectDetail } from '@/components/ProjectDetail';
import { OrganizationDashboard } from '@/components/OrganizationDashboard';
import { AppLayout } from '@/components/AppLayout';
import { useProjects, useCreateProject, useUpdateProject } from '@/hooks/useProjects';
import { toast } from 'sonner';
import { addDecisionToProject, addCompanyToProject, addReportToProject, updateProjectPlanning, addSnagToProject, toggleSnagStatus } from '@/lib/projects';
import { savePaymentToProject } from '@/lib/finance';

type ViewState = 'dashboard' | 'create' | 'detail';

const Index = () => {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { currentOrganization, isLoading: orgLoading } = useOrganization();
  const { data: projectsData, isLoading: projectsLoading } = useProjects(currentOrganization?.id || null);
  const createProject = useCreateProject();
  const updateProject = useUpdateProject();
  
  const [view, setView] = useState<ViewState>('dashboard');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  const projects = projectsData?.projects || [];
  const selectedProject = projects.find(p => p.id === selectedProjectId) || null;

  // Wait for auth and org to load
  if (authLoading || orgLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </AppLayout>
    );
  }

  // Show message if no organization
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

  const handleProjectCreated = async (projectData: Partial<Project>) => {
    try {
      const newProject = await createProject.mutateAsync({
        orgId: currentOrganization.id,
        data: projectData,
      });
      setSelectedProjectId(newProject.id);
      setView('detail');
      toast.success('Projet créé', {
        description: `Score initial: ${newProject.initialScore}/100`,
      });
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleProjectSelect = (project: Project) => {
    setSelectedProjectId(project.id);
    setView('detail');
  };

  const handleProjectUpdate = async (projectId: string, updates: Partial<Project>) => {
    try {
      await updateProject.mutateAsync({ id: projectId, data: updates });
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleDecisionAdded = async (decision: Decision) => {
    if (!selectedProject) return;

    const updatedProject = addDecisionToProject(selectedProject, decision);
    await handleProjectUpdate(selectedProject.id, {
      decisions: updatedProject.decisions,
      currentScore: updatedProject.currentScore,
      currentRiskLevel: updatedProject.currentRiskLevel,
    });

    toast.success('Décision ajoutée', {
      description: `Impact sur le score: ${decision.scoreImpact >= 0 ? '+' : ''}${decision.scoreImpact}`,
    });
  };

  const handleCompanyAdded = async (company: Company) => {
    if (!selectedProject) return;

    const updatedProject = addCompanyToProject(selectedProject, company);
    await handleProjectUpdate(selectedProject.id, {
      companies: updatedProject.companies,
    });

    toast.success('Entreprise ajoutée', {
      description: `${company.name} (${company.trade})`,
    });
  };

  const handleReportAdded = async (report: SiteReport) => {
    if (!selectedProject) return;

    const updatedProject = addReportToProject(selectedProject, report);
    await handleProjectUpdate(selectedProject.id, {
      reports: updatedProject.reports,
    });

    toast.success('Rapport ajouté', {
      description: `CR du ${report.date.toLocaleDateString()}`,
    });
  };

  const handleSnagAdded = async (snag: Snag) => {
    if (!selectedProject) return;

    const updatedProject = addSnagToProject(selectedProject, snag);
    await handleProjectUpdate(selectedProject.id, {
      snags: updatedProject.snags,
    });

    toast.success('Réserve ajoutée');
  };

  const handleSnagToggled = async (snagId: string) => {
    if (!selectedProject) return;

    const updatedProject = toggleSnagStatus(selectedProject, snagId);
    await handleProjectUpdate(selectedProject.id, {
      snags: updatedProject.snags,
    });
  };

  const handlePaymentAdded = async (payment: PaymentApplication) => {
    if (!selectedProject) return;

    const updatedProject = savePaymentToProject(selectedProject, payment);
    await handleProjectUpdate(selectedProject.id, {
      payments: updatedProject.payments,
    });

    toast.success('Situation enregistrée', {
      description: `Situation n°${payment.number} validée`,
    });
  };

  const handlePlanningUpdated = async (startDate?: Date, contractualEndDate?: Date, estimatedEndDate?: Date) => {
    if (!selectedProject) return;

    const updatedProject = updateProjectPlanning(selectedProject, startDate, contractualEndDate, estimatedEndDate);
    await handleProjectUpdate(selectedProject.id, {
      startDate: updatedProject.startDate,
      contractualEndDate: updatedProject.contractualEndDate,
      estimatedEndDate: updatedProject.estimatedEndDate,
    });

    toast.success('Planning mis à jour');
  };

  const handleBackToDashboard = () => {
    setView('dashboard');
    setSelectedProjectId(null);
  };

  // Dashboard view
  if (view === 'dashboard') {
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
            <Button onClick={() => setView('create')}>
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
              <Button onClick={() => setView('create')}>
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
                  onClick={() => handleProjectSelect(project)}
                />
              ))}
            </div>
          )}
        </div>
      </AppLayout>
    );
  }

  // Creation wizard
  if (view === 'create') {
    return (
      <AppLayout>
        <ProjectCreationWizard
          onComplete={handleProjectCreated}
          onCancel={() => setView('dashboard')}
        />
      </AppLayout>
    );
  }

  // Project detail view
  if (view === 'detail' && selectedProject) {
    return (
      <AppLayout>
        <ProjectDetail
          project={selectedProject}
          onBack={handleBackToDashboard}
          onDecisionAdded={handleDecisionAdded}
          onCompanyAdded={handleCompanyAdded}
          onReportAdded={handleReportAdded}
          onPlanningUpdated={handlePlanningUpdated}
          onSnagAdded={handleSnagAdded}
          onSnagToggled={handleSnagToggled}
          onPaymentAdded={handlePaymentAdded}
        />
      </AppLayout>
    );
  }

  return null;
};

export default Index;
