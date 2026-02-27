import { useState } from 'react';
import { Plus, Building2, User, Phone, Mail, FileCheck, Shield } from 'lucide-react';
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
import { createCompany } from '@/lib/projects';
import { useProjectOperations } from '@/hooks/useProjectOperations';
import { useCurrentProject } from '@/contexts/ProjectContext';

interface AddCompanyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AddCompanyDialog = ({ open, onOpenChange }: AddCompanyDialogProps) => {
  const { projectId } = useCurrentProject();
  const { addCompany } = useProjectOperations(projectId);
  const [name, setName] = useState('');
  const [trade, setTrade] = useState('');
  const [contactName, setContactName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [contractAmount, setContractAmount] = useState<string>('');
  const [hasInsurance, setHasInsurance] = useState(false);
  const [hasContract, setHasContract] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !trade.trim()) return;

    const company = createCompany(
      name.trim(),
      trade.trim(),
      hasInsurance,
      hasContract,
      contactName.trim() || undefined,
      email.trim() || undefined,
      phone.trim() || undefined,
      contractAmount ? parseFloat(contractAmount) : undefined
    );
    
    addCompany(company);

    // Reset form
    setName('');
    setTrade('');
    setContactName('');
    setEmail('');
    setPhone('');
    setContractAmount('');
    setHasInsurance(false);
    setHasContract(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Ajouter une entreprise</DialogTitle>
          <DialogDescription>
            Ajoutez un intervenant au projet pour suivre ses documents et ses interventions.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="trade">Lot / Corps d'état</Label>
              <Input
                id="trade"
                placeholder="Ex: 03 - Maçonnerie"
                value={trade}
                onChange={(e) => setTrade(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Entreprise</Label>
              <Input
                id="name"
                placeholder="Ex: SARL BatiFort"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact">Contact principal (optionnel)</Label>
            <div className="relative">
              <User className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="contact"
                className="pl-9"
                placeholder="Nom du conducteur de travaux"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  className="pl-9"
                  placeholder="contact@exemple.fr"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Téléphone</Label>
              <div className="relative">
                <Phone className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="phone"
                  type="tel"
                  className="pl-9"
                  placeholder="06 12 34 56 78"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
            <p className="text-sm font-medium text-foreground">Documents administratifs</p>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileCheck className="h-4 w-4 text-muted-foreground" />
                  <Label htmlFor="contract" className="font-normal cursor-pointer">
                    Marché de travaux signé
                  </Label>
                </div>
                <Switch
                  id="contract"
                  checked={hasContract}
                  onCheckedChange={setHasContract}
                />
              </div>

              {hasContract && (
                <div className="ml-6 space-y-2 animate-in fade-in slide-in-from-top-2">
                  <Label htmlFor="amount" className="text-xs">Montant du marché (HT)</Label>
                  <div className="relative">
                    <span className="absolute left-2.5 top-2.5 text-sm text-muted-foreground">€</span>
                    <Input
                      id="amount"
                      type="number"
                      className="pl-8 h-8"
                      placeholder="0.00"
                      value={contractAmount}
                      onChange={(e) => setContractAmount(e.target.value)}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-muted-foreground" /> {/* Assuming Shield is imported, but it is not. Let's fix import */}
                <Label htmlFor="insurance" className="font-normal cursor-pointer">
                  Assurances à jour (RC + Décennale)
                </Label>
              </div>
              <Switch
                id="insurance"
                checked={hasInsurance}
                onCheckedChange={setHasInsurance}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={!name.trim() || !trade.trim()}>
              <Plus className="h-4 w-4 mr-2" />
              Ajouter l'entreprise
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
