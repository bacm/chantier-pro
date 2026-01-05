import { Decision } from '@/types';
import { formatDate, formatTime } from '@/lib/projects';
import { Clock, User, Image, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DecisionTimelineProps {
  decisions: Decision[];
}

export const DecisionTimeline = ({ decisions }: DecisionTimelineProps) => {
  if (decisions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
          <Clock className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="font-display text-lg font-semibold text-foreground mb-2">
          Aucune décision enregistrée
        </h3>
        <p className="text-muted-foreground max-w-sm">
          Ajoutez votre première décision pour commencer à constituer le journal de ce chantier.
        </p>
      </div>
    );
  }

  // Sort decisions by date, most recent first
  const sortedDecisions = [...decisions].sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
  );

  return (
    <div className="relative">
      {sortedDecisions.map((decision, index) => (
        <div key={decision.id} className="decision-entry animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
          {/* Timeline line */}
          <div className="timeline-line" />
          
          {/* Timeline dot */}
          <div className="timeline-dot" />
          
          {/* Decision content */}
          <div className="document-card p-4 space-y-3">
            {/* Timestamp badge */}
            <div className="flex items-center justify-between">
              <div className="timestamp-badge">
                <Clock className="w-3.5 h-3.5" />
                <span>{formatDate(decision.createdAt)} à {formatTime(decision.createdAt)}</span>
              </div>
            </div>
            
            {/* Decision text */}
            <p className="text-foreground leading-relaxed">
              {decision.content}
            </p>
            
            {/* Author */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <User className="w-3.5 h-3.5" />
              <span>{decision.author}</span>
            </div>
            
            {/* Attachments */}
            {decision.attachments.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
                {decision.attachments.map((attachment) => (
                  <div
                    key={attachment.id}
                    className={cn(
                      "flex items-center gap-1.5 px-2.5 py-1 rounded text-xs",
                      "bg-secondary text-secondary-foreground"
                    )}
                  >
                    {attachment.type === 'photo' ? (
                      <Image className="w-3 h-3" />
                    ) : (
                      <FileText className="w-3 h-3" />
                    )}
                    <span className="max-w-[100px] truncate">{attachment.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
