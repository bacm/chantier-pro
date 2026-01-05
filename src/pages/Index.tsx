import { useState, useEffect } from 'react';
import { Plus, ClipboardCheck, Building2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Project, AuditResult, Decision } from '@/types';
import { loadProjects, saveProjects, addDecisionToProject, updateProjectAfterAudit } from '@/lib/projects';
import { CreateProjectDialog } from '@/components/CreateProjectDialog';
import { ProjectCard } from '@/components/ProjectCard';
import { AuditQuestionnaire } from '@/components/AuditQuestionnaire';
import { AuditResults } from '@/components/AuditResults';
import { ProjectDetail } from '@/components/ProjectDetail';
import { useToast } from '@/hooks/use-toast';

type View = 'dashboard' | 'audit' | 'results' | 'detail';

const Index = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [view, setView] = useState<View>('dashboard');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const { toast } = useToast();

  // Load projects on mount
  useEffect(() => {
    setProjects(loadProjects());
  }, []);

  // Save projects when they change
  useEffect(() => {
    if (projects.length > 0) {
      saveProjects(projects);
    }
  }, [projects]);

  const handleProjectCreated = (project: Project) => {
    setProjects((prev) => [...prev, project]);
    setSelectedProject(project);
    setView('audit');
    toast({
      title: 'Projet créé',
      description: "Répondez aux questions pour établir le score initial.",
    });
  };

  const handleProjectClick = (project: Project) => {
    setSelectedProject(project);
    if (project.auditResult) {
      setView('detail');
    } else {
      setView('audit');
    }
  };

  const handleAuditComplete = (result: AuditResult) => {
    if (!selectedProject) return;

    const updatedProject = updateProjectAfterAudit({ 
      ...selectedProject, 
      auditResult: result,
      currentScore: result.score,
      currentRiskLevel: result.riskLevel,
    });
    
    setProjects((prev) =>
      prev.map((p) => (p.id === selectedProject.id ? updatedProject : p))
    );
    setSelectedProject(updatedProject);
    setView('results');
    toast({
      title: 'Audit terminé',
      description: `Score initial : ${result.score}%`,
    });
  };

  const handleDecisionAdded = (decision: Decision) => {
    if (!selectedProject) return;

    const updatedProject = addDecisionToProject(selectedProject, decision);
    setProjects((prev) =>
      prev.map((p) => (p.id === selectedProject.id ? updatedProject : p))
    );
    setSelectedProject(updatedProject);
    
    const impactText = decision.scoreImpact > 0 
      ? `+${decision.scoreImpact} points` 
      : `${decision.scoreImpact} points`;
    
    toast({
      title: 'Décision ajoutée',
      description: `Impact : ${impactText} — Score actuel : ${updatedProject.currentScore}%`,
    });
  };

  const handleContinueToProject = () => {
    setView('detail');
  };

  const handleBackToDashboard = () => {
    setSelectedProject(null);
    setView('dashboard');
  };

  // Dashboard view
  if (view === 'dashboard') {
    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
                <ClipboardCheck className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="font-display text-xl font-semibold">Traçabilité Chantier</h1>
                <p className="text-xs text-muted-foreground">Score de risque juridique en temps réel</p>
              </div>
            </div>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nouveau projet
            </Button>
          </div>
        </header>

        {/* Main content */}
        <main className="container mx-auto px-4 py-8">
          {projects.length === 0 ? (
            <Card className="p-12 text-center">
              <div className="max-w-sm mx-auto space-y-4">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  <Building2 className="h-8 w-8 text-primary" />
                </div>
                <div className="space-y-2">
                  <h2 className="font-display text-xl font-semibold">Aucun projet</h2>
                  <p className="text-muted-foreground text-sm">
                    Créez votre premier projet pour évaluer et suivre sa traçabilité juridique en temps réel.
                  </p>
                </div>
                <Button onClick={() => setShowCreateDialog(true)} className="mt-4">
                  <Plus className="h-4 w-4 mr-2" />
                  Créer un projet
                </Button>
              </div>
            </Card>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-lg font-medium">
                  Vos projets ({projects.length})
                </h2>
              </div>
              <div className="grid gap-4">
                {projects.map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    onClick={() => handleProjectClick(project)}
                  />
                ))}
              </div>
            </div>
          )}
        </main>

        <CreateProjectDialog
          open={showCreateDialog}
          onOpenChange={setShowCreateDialog}
          onProjectCreated={handleProjectCreated}
        />
      </div>
    );
  }

  // Audit questionnaire view
  if (view === 'audit' && selectedProject) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={handleBackToDashboard}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="font-display text-lg font-semibold">{selectedProject.name}</h1>
                <p className="text-xs text-muted-foreground">Audit initial de traçabilité</p>
              </div>
            </div>
          </div>
        </header>
        <main className="container mx-auto px-4 py-8 max-w-2xl">
          <AuditQuestionnaire
            onComplete={handleAuditComplete}
            onCancel={handleBackToDashboard}
          />
        </main>
      </div>
    );
  }

  // Results view (after initial audit)
  if (view === 'results' && selectedProject) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
                <ClipboardCheck className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="font-display text-xl font-semibold">Résultats de l'audit</h1>
                <p className="text-xs text-muted-foreground">{selectedProject.name}</p>
              </div>
            </div>
          </div>
        </header>
        <main className="container mx-auto px-4 py-8 max-w-3xl">
          <AuditResults 
            project={selectedProject} 
            onBack={handleBackToDashboard}
            onContinueToProject={handleContinueToProject}
          />
        </main>
      </div>
    );
  }

  // Project detail view
  if (view === 'detail' && selectedProject) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
                <ClipboardCheck className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="font-display text-xl font-semibold">Traçabilité Chantier</h1>
                <p className="text-xs text-muted-foreground">Suivi du projet</p>
              </div>
            </div>
          </div>
        </header>
        <main className="container mx-auto px-4 py-8 max-w-4xl">
          <ProjectDetail
            project={selectedProject}
            onBack={handleBackToDashboard}
            onDecisionAdded={handleDecisionAdded}
          />
        </main>
      </div>
    );
  }

  return null;
};

export default Index;
