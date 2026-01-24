import { MapPin, Shield, AlertTriangle, FileText } from 'lucide-react';
import { Project } from '@/types';
import { getProjectTypeLabel, getProjectStatusLabel } from '@/lib/projects';
import { getRiskLevelColor, getRiskLevelLabel, calculateScoreEvolution } from '@/lib/scoring';
import { cn } from '@/lib/utils';

interface ProjectCardProps {
  project: Project;
  onClick: () => void;
}

export const ProjectCard = ({ project, onClick }: ProjectCardProps) => {
  const evolution = calculateScoreEvolution(project);

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-card border border-border rounded-lg p-5 hover:border-primary/30 hover:shadow-md transition-all duration-200 group"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="font-display text-lg text-foreground truncate group-hover:text-primary transition-colors">
            {project.name}
          </h3>
          <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
            <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
            <span className="truncate">{project.address}</span>
          </div>
        </div>
        
        {/* Score badge */}
        <div className="flex flex-col items-end ml-4">
          <div className="text-2xl font-display font-bold text-foreground">
            {project.currentScore}
          </div>
          {evolution !== 0 && (
            <div className={cn(
              "text-xs font-medium",
              evolution > 0 ? "text-emerald-600" : "text-red-600"
            )}>
              {evolution > 0 ? '+' : ''}{evolution}
            </div>
          )}
        </div>
      </div>

      {/* Info row */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
        <span className="bg-muted px-2 py-0.5 rounded">
          {getProjectTypeLabel(project.projectType)}
        </span>
        <span className="bg-muted px-2 py-0.5 rounded">
          {getProjectStatusLabel(project.status)}
        </span>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className={cn(
          "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border",
          getRiskLevelColor(project.currentRiskLevel)
        )}>
          {project.currentRiskLevel === 'low' && <Shield className="h-3 w-3" />}
          {project.currentRiskLevel !== 'low' && <AlertTriangle className="h-3 w-3" />}
          {getRiskLevelLabel(project.currentRiskLevel)}
        </div>
        
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <FileText className="h-3.5 w-3.5" />
          <span>{project.decisions.length} décision{project.decisions.length !== 1 ? 's' : ''}</span>
        </div>
      </div>
    </button>
  );
};
