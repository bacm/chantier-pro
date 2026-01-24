import { Company } from '@/types';
import { Building2, User, Phone, Mail, Check, AlertTriangle, FileText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface CompanyListProps {
  companies: Company[];
  onAddCompany: () => void;
}

export const CompanyList = ({ companies, onAddCompany }: CompanyListProps) => {
  if (companies.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground border border-dashed rounded-lg">
        <Building2 className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">Aucune entreprise assignée</p>
        <p className="text-xs mt-1 mb-4">Ajoutez les intervenants pour suivre leurs documents</p>
        <Button variant="outline" size="sm" onClick={onAddCompany}>
          <Plus className="h-3 w-3 mr-2" />
          Ajouter une entreprise
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {companies.map((company) => (
          <div key={company.id} className="p-4 rounded-lg border bg-card text-card-foreground shadow-sm">
            <div className="flex justify-between items-start mb-2">
              <div>
                <Badge variant="outline" className="mb-2">{company.trade}</Badge>
                <h3 className="font-semibold text-lg">{company.name}</h3>
              </div>
            </div>

            <div className="space-y-2 text-sm text-muted-foreground mb-4">
              {company.contactName && (
                <div className="flex items-center gap-2">
                  <User className="h-3.5 w-3.5" />
                  <span>{company.contactName}</span>
                </div>
              )}
              {company.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5" />
                  <a href={`tel:${company.phone}`} className="hover:underline">{company.phone}</a>
                </div>
              )}
              {company.email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-3.5 w-3.5" />
                  <a href={`mailto:${company.email}`} className="hover:underline truncate max-w-[200px]">{company.email}</a>
                </div>
              )}
            </div>

            <div className="space-y-2 pt-3 border-t">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <FileText className="h-3.5 w-3.5" />
                  Marché signé
                </span>
                {company.hasContract ? (
                  <Check className="h-4 w-4 text-emerald-600" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                )}
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <Building2 className="h-3.5 w-3.5" />
                  Assurances à jour
                </span>
                {company.hasInsurance ? (
                  <Check className="h-4 w-4 text-emerald-600" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                )}
              </div>
            </div>
          </div>
        ))}
        
        {/* Add button card */}
        <button
          onClick={onAddCompany}
          className="flex flex-col items-center justify-center p-4 rounded-lg border border-dashed hover:bg-muted/50 transition-colors min-h-[200px]"
        >
          <Plus className="h-8 w-8 text-muted-foreground mb-2" />
          <span className="font-medium text-muted-foreground">Ajouter une entreprise</span>
        </button>
      </div>
    </div>
  );
};
