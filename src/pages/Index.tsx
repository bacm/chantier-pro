import { useState, useEffect } from 'react';
import { Project, Decision } from '@/types';
import { loadProjects, saveProjects, formatDate } from '@/lib/projects';
import { generatePDF } from '@/lib/pdf';
import { Plus, ArrowLeft, Download, MapPin, User, Calendar, FileText, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProjectCard } from '@/components/ProjectCard';
import { DecisionTimeline } from '@/components/DecisionTimeline';
import { CreateProjectDialog } from '@/components/CreateProjectDialog';
import { AddDecisionDialog } from '@/components/AddDecisionDialog';
import { toast } from 'sonner';

const Index = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showDecisionDialog, setShowDecisionDialog] = useState(false);

  // Load projects on mount
  useEffect(() => {
    setProjects(loadProjects());
  }, []);

  // Save projects when they change
  useEffect(() => {
    saveProjects(projects);
  }, [projects]);

  const handleProjectCreated = (project: Project) => {
    setProjects(prev => [...prev, project]);
    setSelectedProject(project);
    toast.success('Chantier créé avec succès');
  };

  const handleDecisionAdded = (decision: Decision) => {
    if (!selectedProject) return;
    
    const updatedProject = {
      ...selectedProject,
      decisions: [...selectedProject.decisions, decision],
    };
    
    setProjects(prev => prev.map(p => 
      p.id === selectedProject.id ? updatedProject : p
    ));
    setSelectedProject(updatedProject);
    toast.success('Décision enregistrée avec horodatage');
  };

  const handleExportPDF = async () => {
    if (!selectedProject) return;
    await generatePDF(selectedProject);
    toast.success('Export PDF généré');
  };

  // Project detail view
  if (selectedProject) {
    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border">
          <div className="container max-w-3xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedProject(null)}
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Retour
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportPDF}
                className="gap-2"
              >
                <Download className="w-4 h-4" />
                Export PDF
              </Button>
            </div>
          </div>
        </header>

        {/* Project info */}
        <div className="container max-w-3xl mx-auto px-4 py-6">
          <div className="document-card p-6 mb-6">
            <h1 className="font-display text-2xl font-bold text-foreground mb-4">
              {selectedProject.name}
            </h1>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="w-4 h-4 flex-shrink-0" />
                <span>{selectedProject.address}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <User className="w-4 h-4 flex-shrink-0" />
                <span>{selectedProject.client}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="w-4 h-4 flex-shrink-0" />
                <span>{formatDate(selectedProject.createdAt)}</span>
              </div>
            </div>
          </div>

          {/* Timeline header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-muted-foreground" />
              <h2 className="font-display text-lg font-semibold">
                Journal des décisions
              </h2>
              <span className="text-sm text-muted-foreground">
                ({selectedProject.decisions.length})
              </span>
            </div>
            
            <Button onClick={() => setShowDecisionDialog(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              Nouvelle décision
            </Button>
          </div>

          {/* Timeline */}
          <DecisionTimeline decisions={selectedProject.decisions} />
        </div>

        <AddDecisionDialog
          open={showDecisionDialog}
          onOpenChange={setShowDecisionDialog}
          onDecisionAdded={handleDecisionAdded}
        />
      </div>
    );
  }

  // Dashboard view
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container max-w-3xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <Shield className="w-5 h-5 text-primary-foreground" />
            </div>
            <h1 className="font-display text-2xl font-bold text-foreground">
              Décisions Chantier
            </h1>
          </div>
          <p className="text-muted-foreground">
            Journal horodaté de vos décisions de chantier. Sécurisez votre responsabilité.
          </p>
        </div>
      </header>

      {/* Main content */}
      <main className="container max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-lg font-semibold">Vos chantiers</h2>
          <Button onClick={() => setShowCreateDialog(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Nouveau chantier
          </Button>
        </div>

        {projects.length === 0 ? (
          <div className="document-card p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-display text-lg font-semibold text-foreground mb-2">
              Aucun chantier
            </h3>
            <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
              Créez votre premier chantier pour commencer à enregistrer vos décisions.
            </p>
            <Button onClick={() => setShowCreateDialog(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              Créer mon premier chantier
            </Button>
          </div>
        ) : (
          <div className="grid gap-4">
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onClick={() => setSelectedProject(project)}
              />
            ))}
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
};

export default Index;
