import { useParams, useNavigate } from 'react-router-dom';
import { useProject, useUpdateProject } from '@/hooks/useProjects';
import { ProjectDetail } from '@/components/ProjectDetail';
import { AppLayout } from '@/components/AppLayout';
import { Decision, Company, SiteReport, Snag, PaymentApplication, Project } from '@/types';
import { toast } from 'sonner';
import { addDecisionToProject, addCompanyToProject, addReportToProject, updateProjectPlanning, addSnagToProject, toggleSnagStatus } from '@/lib/projects';
import { savePaymentToProject } from '@/lib/finance';

const ProjectDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: project, isLoading, error } = useProject(id || null);
  const updateProject = useUpdateProject();

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

  const handleProjectUpdate = async (projectId: string, updates: Partial<Project>) => {
    try {
      await updateProject.mutateAsync({ id: projectId, data: updates });
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleDecisionAdded = async (decision: Decision) => {
    const updatedProject = addDecisionToProject(project, decision);
    await handleProjectUpdate(project.id, {
      decisions: updatedProject.decisions,
      currentScore: updatedProject.currentScore,
      currentRiskLevel: updatedProject.currentRiskLevel,
    });

    toast.success('Décision ajoutée', {
      description: `Impact sur le score: ${decision.scoreImpact >= 0 ? '+' : ''}${decision.scoreImpact}`,
    });
  };

  const handleCompanyAdded = async (company: Company) => {
    const updatedProject = addCompanyToProject(project, company);
    await handleProjectUpdate(project.id, {
      companies: updatedProject.companies,
    });

    toast.success('Entreprise ajoutée', {
      description: `${company.name} (${company.trade})`,
    });
  };

  const handleReportAdded = async (report: SiteReport) => {
    const updatedProject = addReportToProject(project, report);
    await handleProjectUpdate(project.id, {
      reports: updatedProject.reports,
    });

    toast.success('Rapport ajouté', {
      description: `CR du ${report.date.toLocaleDateString()}`,
    });
  };

  const handleSnagAdded = async (snag: Snag) => {
    const updatedProject = addSnagToProject(project, snag);
    await handleProjectUpdate(project.id, {
      snags: updatedProject.snags,
    });

    toast.success('Réserve ajoutée');
  };

  const handleSnagToggled = async (snagId: string) => {
    const updatedProject = toggleSnagStatus(project, snagId);
    await handleProjectUpdate(project.id, {
      snags: updatedProject.snags,
    });
  };

  const handlePaymentAdded = async (payment: PaymentApplication) => {
    const updatedProject = savePaymentToProject(project, payment);
    await handleProjectUpdate(project.id, {
      payments: updatedProject.payments,
    });

    toast.success('Situation enregistrée', {
      description: `Situation n°${payment.number} validée`,
    });
  };

  const handlePlanningUpdated = async (startDate?: Date, contractualEndDate?: Date, estimatedEndDate?: Date) => {
    const updatedProject = updateProjectPlanning(project, startDate, contractualEndDate, estimatedEndDate);
    await handleProjectUpdate(project.id, {
      startDate: updatedProject.startDate,
      contractualEndDate: updatedProject.contractualEndDate,
      estimatedEndDate: updatedProject.estimatedEndDate,
    });

    toast.success('Planning mis à jour');
  };

  return (
    <AppLayout>
      <ProjectDetail
        project={project}
        onBack={() => navigate('/')}
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
};

export default ProjectDetails;
