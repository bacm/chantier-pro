import { useState, useEffect } from 'react';
import { Plus, ClipboardCheck, Building2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Project, AuditResult } from '@/types';
import { loadProjects, saveProjects } from '@/lib/projects';
import { CreateProjectDialog } from '@/components/CreateProjectDialog';
import { ProjectCard } from '@/components/ProjectCard';
import { AuditQuestionnaire } from '@/components/AuditQuestionnaire';
import { AuditResults } from '@/components/AuditResults';
import { useToast } from '@/hooks/use-toast';

type View = 'dashboard' | 'audit' | 'results';

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
      title: 'Chantier créé',
      description: "Répondez maintenant au questionnaire d'audit.",
    });
  };

  const handleProjectClick = (project: Project) => {
    setSelectedProject(project);
    if (project.auditResult) {
      setView('results');
    } else {
      setView('audit');
    }
  };

  const handleAuditComplete = (result: AuditResult) => {
    if (!selectedProject) return;

    const updatedProject = { ...selectedProject, auditResult: result };
    setProjects((prev) =>
      prev.map((p) => (p.id === selectedProject.id ? updatedProject : p))
    );
    setSelectedProject(updatedProject);
    setView('results');
    toast({
      title: 'Audit terminé',
      description: `Score de traçabilité : ${result.score}%`,
    });
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
                <h1 className="font-display text-xl font-semibold">Audit Chantier</h1>
                <p className="text-xs text-muted-foreground">Évaluation des risques juridiques</p>
              </div>
            </div>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nouveau chantier
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
                  <h2 className="font-display text-xl font-semibold">Aucun chantier</h2>
                  <p className="text-muted-foreground text-sm">
                    Créez votre premier chantier pour évaluer sa traçabilité juridique
                    et identifier les risques potentiels.
                  </p>
                </div>
                <Button onClick={() => setShowCreateDialog(true)} className="mt-4">
                  <Plus className="h-4 w-4 mr-2" />
                  Créer un chantier
                </Button>
              </div>
            </Card>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-lg font-medium">
                  Vos chantiers ({projects.length})
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
                <p className="text-xs text-muted-foreground">Audit de traçabilité</p>
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

  // Results view
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
          <AuditResults project={selectedProject} onBack={handleBackToDashboard} />
        </main>
      </div>
    );
  }

  return null;
};

export default Index;
