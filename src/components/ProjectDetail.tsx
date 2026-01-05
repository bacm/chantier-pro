import { useState } from 'react';
import { Plus, Download, ArrowLeft, AlertTriangle, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Project, Decision } from '@/types';
import { formatDate, getProjectTypeLabel } from '@/lib/projects';
import { getProblematicDecisions, calculateScoreEvolution, DECISION_TYPE_LABELS } from '@/lib/scoring';
import { generateProjectStatusPDF } from '@/lib/pdf';
import { ScoreDisplay } from './ScoreDisplay';
import { DecisionTimeline } from './DecisionTimeline';
import { AddDecisionDialog } from './AddDecisionDialog';

interface ProjectDetailProps {
  project: Project;
  onBack: () => void;
  onDecisionAdded: (decision: Decision) => void;
}

export const ProjectDetail = ({ project, onBack, onDecisionAdded }: ProjectDetailProps) => {
  const [showAddDecision, setShowAddDecision] = useState(false);
  
  const problematicDecisions = getProblematicDecisions(project.decisions);
  const scoreEvolution = calculateScoreEvolution(project);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <Button variant="ghost" size="sm" onClick={onBack} className="mb-2 -ml-2">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Retour
          </Button>
          <h1 className="font-display text-2xl font-semibold">{project.name}</h1>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <span>{project.address}</span>
            <span>•</span>
            <span>{project.client}</span>
            <span>•</span>
            <Badge variant="outline">{getProjectTypeLabel(project.projectType)}</Badge>
          </div>
        </div>
        <Button variant="outline" onClick={() => generateProjectStatusPDF(project)}>
          <Download className="h-4 w-4 mr-2" />
          Exporter PDF
        </Button>
      </div>

      {/* Score Section */}
      <ScoreDisplay 
        score={project.currentScore}
        riskLevel={project.currentRiskLevel}
        evolution={scoreEvolution}
      />

      {/* Problematic Decisions Alert */}
      {problematicDecisions.length > 0 && (
        <Card className="p-4 bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-900">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
            <div className="space-y-2 flex-1">
              <h3 className="font-medium text-red-700 dark:text-red-400">
                {problematicDecisions.length} décision{problematicDecisions.length > 1 ? 's' : ''} à risque
              </h3>
              <p className="text-sm text-red-600/80 dark:text-red-400/80">
                Ces décisions manquent de documentation et dégradent votre score de traçabilité.
              </p>
              <ul className="text-sm space-y-1">
                {problematicDecisions.slice(0, 3).map((d) => (
                  <li key={d.id} className="flex items-center gap-2 text-red-700 dark:text-red-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                    <span className="font-medium">{DECISION_TYPE_LABELS[d.type]}</span>
                    <span className="text-red-600/70">— {d.description.slice(0, 50)}...</span>
                  </li>
                ))}
                {problematicDecisions.length > 3 && (
                  <li className="text-red-600/70">
                    Et {problematicDecisions.length - 3} autres...
                  </li>
                )}
              </ul>
            </div>
          </div>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold">{project.decisions.length}</div>
          <div className="text-sm text-muted-foreground">Décisions</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-red-600">{problematicDecisions.length}</div>
          <div className="text-sm text-muted-foreground">À risque</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-emerald-600">
            {project.decisions.filter(d => d.scoreImpact > 0).length}
          </div>
          <div className="text-sm text-muted-foreground">Conformes</div>
        </Card>
      </div>

      {/* Decisions Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-medium">Décisions du projet</h2>
          <Button onClick={() => setShowAddDecision(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Ajouter une décision
          </Button>
        </div>
        <DecisionTimeline decisions={project.decisions} />
      </div>

      <AddDecisionDialog
        open={showAddDecision}
        onOpenChange={setShowAddDecision}
        onDecisionAdded={onDecisionAdded}
      />
    </div>
  );
};
