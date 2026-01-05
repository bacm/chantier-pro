import { Decision } from '@/types';
import { formatDateTime } from '@/lib/projects';
import { DECISION_TYPE_LABELS } from '@/lib/scoring';
import { FileText, AlertTriangle, Check, Euro, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface DecisionTimelineProps {
  decisions: Decision[];
}

export const DecisionTimeline = ({ decisions }: DecisionTimelineProps) => {
  if (decisions.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">Aucune décision enregistrée</p>
        <p className="text-xs mt-1">Ajoutez des décisions pour suivre l'évolution du score</p>
      </div>
    );
  }

  // Sort by date, most recent first
  const sortedDecisions = [...decisions].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div className="space-y-3">
      {sortedDecisions.map((decision, index) => (
        <div
          key={decision.id}
          className={`p-4 rounded-lg border transition-colors ${
            decision.scoreImpact < 0
              ? 'bg-red-50/50 border-red-200 dark:bg-red-950/20 dark:border-red-900'
              : decision.scoreImpact > 0
                ? 'bg-emerald-50/50 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-900'
                : 'bg-muted/50 border-border'
          }`}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline" className="text-xs font-normal">
                  {DECISION_TYPE_LABELS[decision.type]}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {formatDateTime(new Date(decision.createdAt))}
                </span>
              </div>
              <p className="text-sm">{decision.description}</p>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                {decision.hasWrittenValidation && (
                  <span className="flex items-center gap-1">
                    <FileText className="h-3 w-3" />
                    Validation écrite
                  </span>
                )}
                {decision.hasFinancialImpact && (
                  <span className="flex items-center gap-1">
                    <Euro className="h-3 w-3" />
                    Impact financier
                  </span>
                )}
                {decision.hasProofAttached && (
                  <span className="flex items-center gap-1">
                    <Check className="h-3 w-3" />
                    Preuve jointe
                  </span>
                )}
              </div>
            </div>
            <div className={`flex items-center gap-1 text-sm font-medium ${
              decision.scoreImpact < 0
                ? 'text-red-600'
                : decision.scoreImpact > 0
                  ? 'text-emerald-600'
                  : 'text-muted-foreground'
            }`}>
              {decision.scoreImpact < 0 ? (
                <AlertTriangle className="h-4 w-4" />
              ) : decision.scoreImpact > 0 ? (
                <Check className="h-4 w-4" />
              ) : null}
              <span>
                {decision.scoreImpact > 0 ? '+' : ''}{decision.scoreImpact}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
