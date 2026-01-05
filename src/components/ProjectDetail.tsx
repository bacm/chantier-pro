import { useState } from 'react';
import { ArrowLeft, Plus, Download, Shield, AlertTriangle, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Project, Decision } from '@/types';
import { formatDate, getProjectTypeLabel, getProjectStatusLabel } from '@/lib/projects';
import { generateProjectStatusPDF } from '@/lib/pdf';
import {
  getRiskLevelColor,
  getRiskLevelLabel,
  getRiskLevelDescription,
  getProblematicDecisions,
  calculateScoreEvolution,
} from '@/lib/scoring';
import { DecisionTimeline } from './DecisionTimeline';
import { AddDecisionDialog } from './AddDecisionDialog';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface ProjectDetailProps {
  project: Project;
  onBack: () => void;
  onDecisionAdded: (decision: Decision) => void;
}

export const ProjectDetail = ({ project, onBack, onDecisionAdded }: ProjectDetailProps) => {
  const [showAddDecision, setShowAddDecision] = useState(false);
  
  const evolution = calculateScoreEvolution(project);
  const problematicDecisions = getProblematicDecisions(project.decisions);

  const handleExportPDF = () => {
    generateProjectStatusPDF(project);
    toast.success('PDF généré', {
      description: 'Le rapport a été téléchargé.',
    });
  };

  const handleDecisionAdded = (decision: Decision) => {
    onDecisionAdded(decision);
    setShowAddDecision(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" size="icon" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <h1 className="font-display text-2xl text-foreground">{project.name}</h1>
            <p className="text-sm text-muted-foreground">{project.address}</p>
          </div>
          <Button variant="outline" onClick={handleExportPDF}>
            <Download className="h-4 w-4 mr-2" />
            Exporter PDF
          </Button>
        </div>

        {/* Score card */}
        <div className="bg-card border border-border rounded-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            {/* Score display */}
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="text-5xl font-display font-bold text-foreground">
                  {project.currentScore}
                </div>
                <div className="text-sm text-muted-foreground mt-1">Score actuel</div>
              </div>
              
              {/* Evolution indicator */}
              <div className="flex flex-col items-center">
                {evolution > 0 && (
                  <div className="flex items-center gap-1 text-emerald-600">
                    <TrendingUp className="h-5 w-5" />
                    <span className="font-medium">+{evolution}</span>
                  </div>
                )}
                {evolution < 0 && (
                  <div className="flex items-center gap-1 text-red-600">
                    <TrendingDown className="h-5 w-5" />
                    <span className="font-medium">{evolution}</span>
                  </div>
                )}
                {evolution === 0 && (
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Minus className="h-5 w-5" />
                    <span className="font-medium">0</span>
                  </div>
                )}
                <div className="text-xs text-muted-foreground mt-1">
                  vs. initial ({project.initialScore})
                </div>
              </div>
            </div>

            {/* Risk level */}
            <div className="flex flex-col items-start md:items-end gap-2">
              <div className={cn(
                "inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium",
                getRiskLevelColor(project.currentRiskLevel)
              )}>
                {project.currentRiskLevel === 'low' && <Shield className="h-4 w-4" />}
                {project.currentRiskLevel !== 'low' && <AlertTriangle className="h-4 w-4" />}
                {getRiskLevelLabel(project.currentRiskLevel)}
              </div>
              <p className="text-sm text-muted-foreground max-w-xs text-right">
                {getRiskLevelDescription(project.currentRiskLevel)}
              </p>
            </div>
          </div>
        </div>

        {/* Project info */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="text-xs text-muted-foreground mb-1">Type</div>
            <div className="font-medium text-sm">{getProjectTypeLabel(project.projectType)}</div>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="text-xs text-muted-foreground mb-1">Statut</div>
            <div className="font-medium text-sm">{getProjectStatusLabel(project.status)}</div>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="text-xs text-muted-foreground mb-1">Créé le</div>
            <div className="font-medium text-sm">{formatDate(project.createdAt)}</div>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="text-xs text-muted-foreground mb-1">Décisions</div>
            <div className="font-medium text-sm">{project.decisions.length}</div>
          </div>
        </div>

        {/* Alerts */}
        {problematicDecisions.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
              <div>
                <h3 className="font-medium text-red-900 mb-1">
                  {problematicDecisions.length} décision{problematicDecisions.length > 1 ? 's' : ''} à risque
                </h3>
                <p className="text-sm text-red-700">
                  Ces décisions impactent négativement votre score. Ajoutez des preuves ou validations pour les sécuriser.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Decisions section */}
        <div className="bg-card border border-border rounded-lg">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h2 className="font-display text-lg">Décisions</h2>
            <Button onClick={() => setShowAddDecision(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Ajouter
            </Button>
          </div>
          
          <div className="p-4">
            {project.decisions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>Aucune décision enregistrée.</p>
                <p className="text-sm mt-1">Ajoutez des décisions pour suivre l'évolution du score.</p>
              </div>
            ) : (
              <DecisionTimeline decisions={project.decisions} />
            )}
          </div>
        </div>

        {/* Add decision dialog */}
        <AddDecisionDialog
          open={showAddDecision}
          onOpenChange={setShowAddDecision}
          onDecisionAdded={handleDecisionAdded}
        />
      </div>
    </div>
  );
};
