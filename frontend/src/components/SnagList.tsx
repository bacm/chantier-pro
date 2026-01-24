import { Snag, Company, Project } from '@/types';
import { CheckCircle2, Circle, MapPin, Building2, Calendar, ClipboardCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/projects';
import { cn } from '@/lib/utils';

interface SnagListProps {
  project: Project;
  onToggleSnag: (snagId: string) => void;
  onAddSnag: () => void;
}

export const SnagList = ({ project, onToggleSnag, onAddSnag }: SnagListProps) => {
  const snags = project.snags || [];
  const openSnags = snags.filter(s => !s.isCleared);
  const clearedSnags = snags.filter(s => s.isCleared);

  const getCompanyName = (id: string) => {
    const company = project.companies.find(c => c.id === id);
    return company ? company.trade : 'Inconnue';
  };

  if (snags.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground border border-dashed rounded-lg">
        <ClipboardCheck className="h-12 w-12 mx-auto mb-4 opacity-20" />
        <h3 className="text-lg font-medium mb-2">Aucune réserve (OPR)</h3>
        <p className="text-sm mb-6 max-w-xs mx-auto">
          Préparez la réception en listant les défauts constatés par lot.
        </p>
        <Button onClick={onAddSnag}>
          <Plus className="h-4 w-4 mr-2" />
          Ajouter une réserve
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats summary */}
      <div className="flex gap-4 mb-6">
        <div className="flex-1 bg-muted/30 p-3 rounded-lg text-center">
          <div className="text-2xl font-bold text-red-600">{openSnags.length}</div>
          <div className="text-[10px] uppercase text-muted-foreground font-semibold">Réserves Ouvertes</div>
        </div>
        <div className="flex-1 bg-muted/30 p-3 rounded-lg text-center">
          <div className="text-2xl font-bold text-emerald-600">{clearedSnags.length}</div>
          <div className="text-[10px] uppercase text-muted-foreground font-semibold">Réserves Levées</div>
        </div>
        <div className="flex-1 bg-muted/30 p-3 rounded-lg text-center">
          <div className="text-2xl font-bold">
            {snags.length > 0 ? Math.round((clearedSnags.length / snags.length) * 100) : 0}%
          </div>
          <div className="text-[10px] uppercase text-muted-foreground font-semibold">Taux de Levée</div>
        </div>
      </div>

      <div className="space-y-4">
        {/* Open Snags Section */}
        {openSnags.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <Circle className="h-3 w-3 text-red-500 fill-red-500" /> À corriger
            </h3>
            {openSnags.map((snag) => (
              <SnagItem 
                key={snag.id} 
                snag={snag} 
                companyTrade={getCompanyName(snag.companyId)} 
                onToggle={() => onToggleSnag(snag.id)} 
              />
            ))}
          </div>
        )}

        {/* Cleared Snags Section */}
        {clearedSnags.length > 0 && (
          <div className="space-y-3 pt-4 border-t">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <CheckCircle2 className="h-3 w-3 text-emerald-500" /> Réserves levées
            </h3>
            {clearedSnags.map((snag) => (
              <SnagItem 
                key={snag.id} 
                snag={snag} 
                companyTrade={getCompanyName(snag.companyId)} 
                onToggle={() => onToggleSnag(snag.id)} 
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

interface SnagItemProps {
  snag: Snag;
  companyTrade: string;
  onToggle: () => void;
}

const SnagItem = ({ snag, companyTrade, onToggle }: SnagItemProps) => {
  return (
    <div className={cn(
      "p-4 rounded-lg border flex items-start gap-4 transition-all group",
      snag.isCleared ? "bg-muted/20 border-muted opacity-75" : "bg-card hover:border-primary/30"
    )}>
      <button 
        onClick={onToggle}
        className={cn(
          "mt-1 p-0.5 rounded-full transition-colors",
          snag.isCleared ? "text-emerald-600 hover:text-emerald-700" : "text-muted-foreground hover:text-primary"
        )}
      >
        {snag.isCleared ? <CheckCircle2 className="h-6 w-6" /> : <Circle className="h-6 w-6" />}
      </button>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <Badge variant="outline" className="text-[10px] uppercase font-bold py-0 h-5">
            {companyTrade}
          </Badge>
          {snag.location && (
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <MapPin className="h-3 w-3" /> {snag.location}
            </span>
          )}
        </div>
        <p className={cn("text-sm", snag.isCleared && "line-through text-muted-foreground")}>
          {snag.description}
        </p>
        <div className="flex items-center gap-3 mt-2 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" /> Constatée le {formatDate(snag.foundDate)}
          </span>
          {snag.isCleared && snag.clearedDate && (
            <span className="flex items-center gap-1 text-emerald-600 font-medium">
              <CheckCircle2 className="h-3 w-3" /> Levée le {formatDate(snag.clearedDate)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

import { Plus } from 'lucide-react';
