import { Building2, MapPin, User, ShieldCheck, Shield, ShieldAlert, ClipboardList } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Project } from '@/types';
import { formatDate, getProjectTypeLabel } from '@/lib/projects';
import { getRiskLevelLabel } from '@/lib/audit';
import { cn } from '@/lib/utils';

interface ProjectCardProps {
  project: Project;
  onClick: () => void;
}

export const ProjectCard = ({ project, onClick }: ProjectCardProps) => {
  const hasAudit = !!project.auditResult;

  const getRiskBadge = () => {
    if (!project.auditResult) return null;
    
    const { riskLevel, score } = project.auditResult;
    const styles = {
      low: 'bg-green-100 text-green-700 border-green-200',
      medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      high: 'bg-red-100 text-red-700 border-red-200',
    };
    const icons = {
      low: <ShieldCheck className="h-3 w-3" />,
      medium: <Shield className="h-3 w-3" />,
      high: <ShieldAlert className="h-3 w-3" />,
    };

    return (
      <Badge variant="outline" className={cn('gap-1', styles[riskLevel])}>
        {icons[riskLevel]}
        {score}% - Risque {getRiskLevelLabel(riskLevel)}
      </Badge>
    );
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
            </div>

            <div className="flex items-center gap-2 pt-1">
              {hasAudit ? (
                getRiskBadge()
              ) : (
                <Badge variant="outline" className="gap-1 bg-muted/50">
                  <ClipboardList className="h-3 w-3" />
                  Audit à réaliser
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
