import { Building2, MapPin, User, ShieldCheck, Shield, ShieldAlert, ClipboardList, FileEdit } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Project } from '@/types';
import { formatDate, getProjectTypeLabel } from '@/lib/projects';
import { getRiskLevelLabel } from '@/lib/scoring';
import { cn } from '@/lib/utils';

interface ProjectCardProps {
  project: Project;
  onClick: () => void;
}

export const ProjectCard = ({ project, onClick }: ProjectCardProps) => {
  const hasAudit = !!project.auditResult;
  const { currentScore, currentRiskLevel, decisions } = project;

  const getRiskStyles = () => {
    switch (currentRiskLevel) {
      case 'low':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800';
      case 'medium':
        return 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-800';
      case 'high':
        return 'bg-red-100 text-red-700 border-red-200 dark:bg-red-950/50 dark:text-red-400 dark:border-red-800';
    }
  };

  const getRiskIcon = () => {
    switch (currentRiskLevel) {
      case 'low':
        return <ShieldCheck className="h-3.5 w-3.5" />;
      case 'medium':
        return <Shield className="h-3.5 w-3.5" />;
      case 'high':
        return <ShieldAlert className="h-3.5 w-3.5" />;
    }
  };

  return (
    <Card
      className="group cursor-pointer transition-all duration-200 hover:shadow-md hover:border-primary/30"
      onClick={onClick}
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0 space-y-3">
            <div>
              <h3 className="font-display text-lg font-semibold truncate group-hover:text-primary transition-colors">
                {project.name}
              </h3>
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1">
                <MapPin className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{project.address}</span>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <User className="h-3.5 w-3.5" />
                <span>{project.client}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Building2 className="h-3.5 w-3.5" />
                <span>{getProjectTypeLabel(project.projectType)}</span>
              </div>
              {decisions.length > 0 && (
                <div className="flex items-center gap-1.5">
                  <FileEdit className="h-3.5 w-3.5" />
                  <span>{decisions.length} décision{decisions.length > 1 ? 's' : ''}</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 pt-1">
              {hasAudit ? (
                <Badge variant="outline" className={cn('gap-1.5', getRiskStyles())}>
                  {getRiskIcon()}
                  <span className="font-bold">{currentScore}%</span>
                  <span>—</span>
                  <span>{getRiskLevelLabel(currentRiskLevel)}</span>
                </Badge>
              ) : (
                <Badge variant="outline" className="gap-1 bg-muted/50">
                  <ClipboardList className="h-3 w-3" />
                  Audit initial à réaliser
                </Badge>
              )}
            </div>
          </div>

          <div className="text-right shrink-0">
            <p className="text-xs text-muted-foreground">
              Créé le {formatDate(project.createdAt)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
