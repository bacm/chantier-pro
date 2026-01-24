import { useState, useEffect } from 'react';
import { Plus, Euro, Calendar, Building2, Calculator, Percent } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Project, PaymentApplication, PaymentStatus } from '@/types';
import { generateId } from '@/lib/projects';
import { getCompanyContractTotal, getNextPaymentNumber } from '@/lib/finance';

interface AddPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: Project;
  onPaymentAdded: (payment: PaymentApplication) => void;
  preselectedCompanyId?: string;
}

export const AddPaymentDialog = ({ 
  open, 
  onOpenChange, 
  project, 
  onPaymentAdded,
  preselectedCompanyId 
}: AddPaymentDialogProps) => {
  const [companyId, setCompanyId] = useState<string>(preselectedCompanyId || '');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [period, setPeriod] = useState<string>(new Date().toISOString().slice(0, 7)); // YYYY-MM
  const [percentage, setPercentage] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [hasRetenue, setHasRetenue] = useState(true);
  const [status, setStatus] = useState<PaymentStatus>('validated');

  // Update company if preselected changes
  useEffect(() => {
    if (preselectedCompanyId) setCompanyId(preselectedCompanyId);
  }, [preselectedCompanyId]);

  // Calculate amount when percentage changes
  const handlePercentageChange = (val: string) => {
    setPercentage(val);
    if (!companyId) return;
    
    const contractTotal = getCompanyContractTotal(project, companyId);
    if (contractTotal && val) {
      const calculatedAmount = (parseFloat(val) / 100) * contractTotal;
      setAmount(calculatedAmount.toFixed(2));
    }
  };

  // Calculate percentage when amount changes
  const handleAmountChange = (val: string) => {
    setAmount(val);
    if (!companyId) return;
    
    const contractTotal = getCompanyContractTotal(project, companyId);
    if (contractTotal && val) {
      const calculatedPercent = (parseFloat(val) / contractTotal) * 100;
      setPercentage(calculatedPercent.toFixed(2));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyId || !amount || !percentage) return;

    // Find previous cumulative amount
    const previousPayments = (project.payments || [])
      .filter(p => p.companyId === companyId && p.status === 'validated')
      .sort((a, b) => b.number - a.number);
      
    const previousCumulative = previousPayments.length > 0 ? previousPayments[0].validatedAmount : 0;

    const payment: PaymentApplication = {
      id: generateId(),
      projectId: project.id,
      companyId,
      number: getNextPaymentNumber(project, companyId),
      date: new Date(date),
      period: new Date(period + '-01'), // Force 1st of month
      
      claimedAmount: parseFloat(amount), // Assuming validated = claimed for simplicity in this UI
      claimedPercentage: parseFloat(percentage),
      
      validatedAmount: parseFloat(amount),
      validatedPercentage: parseFloat(percentage),
      
      previousCumulativeAmount: previousCumulative,
      
      status,
      hasRetenueGarantie: hasRetenue,
    };

    onPaymentAdded(payment);
    
    // Reset form partial
    setAmount('');
    setPercentage('');
    onOpenChange(false);
  };

  const selectedCompany = project.companies.find(c => c.id === companyId);
  const contractTotal = selectedCompany ? getCompanyContractTotal(project, companyId) : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Nouvelle Situation</DialogTitle>
          <DialogDescription>
            Saisissez l'avancement validé pour une entreprise.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="company">Entreprise</Label>
            <Select 
              value={companyId} 
              onValueChange={setCompanyId} 
              disabled={!!preselectedCompanyId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner une entreprise" />
              </SelectTrigger>
              <SelectContent>
                {project.companies.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.trade} - {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date de validation</Label>
              <div className="relative">
                <Calendar className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="date"
                  type="date"
                  className="pl-9"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="period">Mois concerné</Label>
              <Input
                id="period"
                type="month"
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="p-4 bg-muted/30 rounded-lg space-y-4 border border-border/50">
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Marché + Avenants (HT) :</span>
              <span className="font-semibold">{contractTotal.toLocaleString('fr-FR')} €</span>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="percentage" className="text-xs font-medium">Avancement Cumulé (%)</Label>
                <div className="relative">
                  <Percent className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    id="percentage"
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    className="pl-8"
                    placeholder="0.00"
                    value={percentage}
                    onChange={(e) => handlePercentageChange(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount" className="text-xs font-medium">Montant Cumulé (HT)</Label>
                <div className="relative">
                  <Euro className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    className="pl-8"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => handleAmountChange(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Label htmlFor="rg" className="font-normal cursor-pointer">
                Appliquer Retenue de Garantie (5%)
              </Label>
            </div>
            <Switch
              id="rg"
              checked={hasRetenue}
              onCheckedChange={setHasRetenue}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={!companyId || !amount}>
              <Plus className="h-4 w-4 mr-2" />
              Valider la situation
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
