import { Project, PaymentApplication } from '@/types';
import { formatDate } from '@/lib/projects';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Download, FileText } from 'lucide-react';

interface PaymentListProps {
  project: Project;
  payments: PaymentApplication[];
  onGenerateCertificate: (payment: PaymentApplication) => void;
}

export const PaymentList = ({ project, payments, onGenerateCertificate }: PaymentListProps) => {
  if (payments.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground bg-muted/30 rounded-lg border border-dashed">
        Aucune situation de travaux enregistrée.
      </div>
    );
  }

  // Sort by date desc
  const sortedPayments = [...payments].sort((a, b) => b.date.getTime() - a.date.getTime());

  const getStatusBadge = (status: PaymentApplication['status']) => {
    switch (status) {
      case 'draft': return <Badge variant="outline">Brouillon</Badge>;
      case 'submitted': return <Badge variant="secondary">Soumis</Badge>;
      case 'validated': return <Badge className="bg-emerald-600 hover:bg-emerald-700">Validé</Badge>;
      case 'paid': return <Badge className="bg-blue-600 hover:bg-blue-700">Payé</Badge>;
      case 'rejected': return <Badge variant="destructive">Rejeté</Badge>;
      default: return null;
    }
  };

  return (
    <div className="space-y-4">
      {sortedPayments.map((payment) => {
        const company = project.companies.find(c => c.id === payment.companyId);
        return (
          <Card key={payment.id} className="overflow-hidden">
            <div className="flex items-center justify-between p-4 bg-muted/20">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 p-2 rounded-full">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm">
                    Situation n°{payment.number} - {company?.name || 'Entreprise inconnue'}
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Période : {payment.period.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="font-bold text-sm">
                    {payment.validatedAmount.toLocaleString('fr-FR')} € HT
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {payment.validatedPercentage.toFixed(2)}% d'avancement
                  </div>
                </div>
                {getStatusBadge(payment.status)}
              </div>
            </div>
            
            <div className="px-4 py-3 bg-white border-t flex justify-between items-center text-xs text-muted-foreground">
              <div>
                Validé le {formatDate(payment.date)}
                {payment.hasRetenueGarantie && (
                  <span className="ml-2 px-1.5 py-0.5 bg-amber-50 text-amber-700 rounded text-[10px] font-medium border border-amber-200">
                    Retenue 5% appliquée
                  </span>
                )}
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-7 text-xs gap-1"
                onClick={() => onGenerateCertificate(payment)}
              >
                <Download className="h-3 w-3" />
                Certificat de Paiement
              </Button>
            </div>
          </Card>
        );
      })}
    </div>
  );
};
