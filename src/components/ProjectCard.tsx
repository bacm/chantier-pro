import { Project } from '@/types';
import { formatDate } from '@/lib/projects';
import { MapPin, User, Calendar, FileText, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProjectCardProps {
  project: Project;
  onClick: () => void;
}

export const ProjectCard = ({ project, onClick }: ProjectCardProps) => {
  const decisionCount = project.decisions.length;

  return (
    <button
      onClick={onClick}
      className={cn(
        "document-card w-full text-left p-5 transition-all duration-200",
        "hover:shadow-soft hover:border-primary/20 group"
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <h3 className="font-display text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
            {project.name}
          </h3>
          
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="truncate">{project.address}</span>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <User className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="truncate">{project.client}</span>
            </div>
            
            <div className="flex items-center gap-4 pt-2">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Calendar className="w-3 h-3" />
                <span>{formatDate(project.createdAt)}</span>
              </div>
              
              <div className="flex items-center gap-1.5 text-xs">
                <FileText className="w-3 h-3" />
                <span className={cn(
                  decisionCount > 0 ? "text-timestamp font-medium" : "text-muted-foreground"
                )}>
                  {decisionCount} décision{decisionCount !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all flex-shrink-0 mt-1" />
      </div>
    </button>
  );
};
