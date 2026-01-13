import { useState, useEffect } from 'react';
import { Plus, FolderOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Project, Decision, Company, SiteReport } from '@/types';
import { loadProjects, saveProjects, addDecisionToProject, addCompanyToProject, addReportToProject, updateProjectPlanning } from '@/lib/projects';
import { ProjectCard } from '@/components/ProjectCard';
import { ProjectCreationWizard } from '@/components/ProjectCreationWizard';
import { ProjectDetail } from '@/components/ProjectDetail';
import { toast } from 'sonner';

type ViewState = 'dashboard' | 'create' | 'detail';

const Index = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [view, setView] = useState<ViewState>('dashboard');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  useEffect(() => {
    const loaded = loadProjects();
    setProjects(loaded);
  }, []);

  useEffect(() => {
    if (projects.length > 0) {
      saveProjects(projects);
    }
  }, [projects]);

  const handleProjectCreated = (project: Project) => {
    setProjects((prev) => [...prev, project]);
    setSelectedProject(project);
    setView('detail');
    toast.success('Projet créé', {
      description: `Score initial: ${project.initialScore}/100`,
    });
  };

  const handleProjectSelect = (project: Project) => {
    setSelectedProject(project);
    setView('detail');
  };

  const handleDecisionAdded = (decision: Decision) => {
    if (!selectedProject) return;

    const updatedProject = addDecisionToProject(selectedProject, decision);

    setProjects((prev) => prev.map((p) => (p.id === updatedProject.id ? updatedProject : p)));
    setSelectedProject(updatedProject);

    toast.success('Décision ajoutée', {
      description: `Impact sur le score: ${decision.scoreImpact >= 0 ? '+' : ''}${decision.scoreImpact}`,
    });
  };

  const handleCompanyAdded = (company: Company) => {
    if (!selectedProject) return;

    const updatedProject = addCompanyToProject(selectedProject, company);

    setProjects((prev) => prev.map((p) => (p.id === updatedProject.id ? updatedProject : p)));
    setSelectedProject(updatedProject);

    toast.success('Entreprise ajoutée', {
      description: `${company.name} (${company.trade})`,
    });
  };

  const handleReportAdded = (report: SiteReport) => {
    if (!selectedProject) return;

    const updatedProject = addReportToProject(selectedProject, report);

    setProjects((prev) => prev.map((p) => (p.id === updatedProject.id ? updatedProject : p)));
    setSelectedProject(updatedProject);

    toast.success('Rapport ajouté', {
      description: `CR du ${report.date.toLocaleDateString()}`,
    });
  };

  const handlePlanningUpdated = (startDate?: Date, contractualEndDate?: Date, estimatedEndDate?: Date) => {
    if (!selectedProject) return;

    const updatedProject = updateProjectPlanning(selectedProject, startDate, contractualEndDate, estimatedEndDate);

    setProjects((prev) => prev.map((p) => (p.id === updatedProject.id ? updatedProject : p)));
    setSelectedProject(updatedProject);

    toast.success('Planning mis à jour');
  };

  const handleBackToDashboard = () => {
    setView('dashboard');
    setSelectedProject(null);
  };

  // Dashboard view
  if (view === 'dashboard') {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* Header */}
          <header className="mb-12">
            <h1 className="font-display text-3xl md:text-4xl text-foreground mb-2">
              Traçabilité Chantier
            </h1>
            <p className="text-muted-foreground">
              Maîtrisez le risque juridique de vos projets
            </p>
          </header>

          {/* Action bar */}
          <div className="flex justify-between items-center mb-8">
            <h2 className="font-display text-xl text-foreground">
              Mes projets
            </h2>
            <Button onClick={() => setView('create')}>
              <Plus className="h-4 w-4 mr-2" />
              Nouveau projet
            </Button>
          </div>

          {/* Projects grid */}
          {projects.length === 0 ? (
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
      </div>
    );
  }

  // Creation wizard
  if (view === 'create') {
    return (
      <ProjectCreationWizard
        onComplete={handleProjectCreated}
        onCancel={() => setView('dashboard')}
      />
    );
  }

  // Project detail view
  if (view === 'detail' && selectedProject) {
    return (
      <ProjectDetail
        project={selectedProject}
        onBack={handleBackToDashboard}
        onDecisionAdded={handleDecisionAdded}
        onCompanyAdded={handleCompanyAdded}
        onReportAdded={handleReportAdded}
        onPlanningUpdated={handlePlanningUpdated}
      />
    );
  }

  return null;
};

export default Index;
