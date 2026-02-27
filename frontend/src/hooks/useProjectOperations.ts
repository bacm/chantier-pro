import { useMutation, useQueryClient } from '@tanstack/react-query';
import { projectsApi } from '@/lib/api';
import { Project, Decision, Company, SiteReport, Snag, PaymentApplication } from '@/types';
import { 
  addDecisionToProject, 
  addCompanyToProject, 
  addReportToProject, 
  updateProjectPlanning as updatePlanning, 
  addSnagToProject, 
  toggleSnagStatus as toggleSnag 
} from '@/lib/projects';
import { savePaymentToProject } from '@/lib/finance';
import { toast } from 'sonner';

export function useProjectOperations(projectId: string) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (updates: Partial<Project>) => {
      return await projectsApi.update(projectId, updates);
    },
    onSuccess: (updatedProject) => {
      queryClient.setQueryData(['projects', projectId], updatedProject);
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
    onError: (error: Error) => {
      toast.error('Erreur', { description: error.message });
    },
  });

  const getProject = () => {
    return queryClient.getQueryData<Project>(['projects', projectId]);
  };

  const addDecision = async (decision: Decision) => {
    const project = getProject();
    if (!project) return;
    
    const updatedProject = addDecisionToProject(project, decision);
    await mutation.mutateAsync({
      decisions: updatedProject.decisions,
      currentScore: updatedProject.currentScore,
      currentRiskLevel: updatedProject.currentRiskLevel,
    });
    
    toast.success('Décision ajoutée', {
      description: `Impact sur le score: ${decision.scoreImpact >= 0 ? '+' : ''}${decision.scoreImpact}`,
    });
  };

  const addCompany = async (company: Company) => {
    const project = getProject();
    if (!project) return;
    
    const updatedProject = addCompanyToProject(project, company);
    await mutation.mutateAsync({
      companies: updatedProject.companies,
    });
    
    toast.success('Entreprise ajoutée', {
      description: `${company.name} (${company.trade})`,
    });
  };

  const addReport = async (report: SiteReport) => {
    const project = getProject();
    if (!project) return;
    
    const updatedProject = addReportToProject(project, report);
    await mutation.mutateAsync({
      reports: updatedProject.reports,
    });
    
    toast.success('Rapport ajouté', {
      description: `CR du ${report.date.toLocaleDateString()}`,
    });
  };

  const addSnag = async (snag: Snag) => {
    const project = getProject();
    if (!project) return;
    
    const updatedProject = addSnagToProject(project, snag);
    await mutation.mutateAsync({
      snags: updatedProject.snags,
    });
    
    toast.success('Réserve ajoutée');
  };

  const toggleSnagStatus = async (snagId: string) => {
    const project = getProject();
    if (!project) return;
    
    const updatedProject = toggleSnag(project, snagId);
    await mutation.mutateAsync({
      snags: updatedProject.snags,
    });
  };

  const addPayment = async (payment: PaymentApplication) => {
    const project = getProject();
    if (!project) return;
    
    const updatedProject = savePaymentToProject(project, payment);
    await mutation.mutateAsync({
      payments: updatedProject.payments,
    });
    
    toast.success('Situation enregistrée', {
      description: `Situation n°${payment.number} validée`,
    });
  };

  const updateProjectPlanning = async (startDate?: Date, contractualEndDate?: Date, estimatedEndDate?: Date) => {
    const project = getProject();
    if (!project) return;
    
    const updatedProject = updatePlanning(project, startDate, contractualEndDate, estimatedEndDate);
    await mutation.mutateAsync({
      startDate: updatedProject.startDate,
      contractualEndDate: updatedProject.contractualEndDate,
      estimatedEndDate: updatedProject.estimatedEndDate,
    });
    
    toast.success('Planning mis à jour');
  };

  return {
    addDecision,
    addCompany,
    addReport,
    addSnag,
    toggleSnagStatus,
    addPayment,
    updateProjectPlanning,
    isPending: mutation.isPending
  };
}
