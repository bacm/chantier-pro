import { useState } from 'react';
import { Plus, FileText, AlertTriangle, Check, Euro, Building2, Link, Image } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Decision, DecisionType, Company } from '@/types';
import { createDecision } from '@/lib/projects';
import { DECISION_TYPE_LABELS, calculateDecisionImpact } from '@/lib/scoring';

interface AddDecisionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDecisionAdded: (decision: Decision) => void;
  companies?: Company[];
}

export const AddDecisionDialog = ({ open, onOpenChange, onDecisionAdded, companies = [] }: AddDecisionDialogProps) => {
  const [type, setType] = useState<DecisionType>('modification');
  const [description, setDescription] = useState('');
  const [companyId, setCompanyId] = useState<string>('none');
  const [hasWrittenValidation, setHasWrittenValidation] = useState(false);
  const [hasFinancialImpact, setHasFinancialImpact] = useState(false);
  const [amount, setAmount] = useState<string>('');
  const [hasProofAttached, setHasProofAttached] = useState(false);
  const [proofLabel, setProofLabel] = useState('');
  const [proofUrl, setProofUrl] = useState('');

  const previewImpact = calculateDecisionImpact({
    type,
    description,
    hasWrittenValidation,
    hasFinancialImpact,
    hasProofAttached,
    companyId: companyId === 'none' ? undefined : companyId,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    const decision = createDecision(
      type,
      description.trim(),
      hasWrittenValidation,
      hasFinancialImpact,
      hasProofAttached,
      companyId === 'none' ? undefined : companyId,
      amount ? parseFloat(amount) : undefined,
      proofLabel.trim() || undefined,
      proofUrl.trim() || undefined
    );
    
    onDecisionAdded(decision);

    // Reset form
    setType('modification');
    setDescription('');
    setCompanyId('none');
    setHasWrittenValidation(false);
    setHasFinancialImpact(false);
    setAmount('');
    setHasProofAttached(false);
    setProofLabel('');
    setProofUrl('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Ajouter une décision</DialogTitle>
          <DialogDescription>
            Chaque décision impacte le score de traçabilité du projet.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Type de décision</Label>
              <Select value={type} onValueChange={(v) => setType(v as DecisionType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(DECISION_TYPE_LABELS) as DecisionType[]).map((key) => (
                    <SelectItem key={key} value={key}>
                      {DECISION_TYPE_LABELS[key]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {companies.length > 0 && (
              <div className="space-y-2">
                <Label htmlFor="company">Entreprise concernée</Label>
                <Select value={companyId} onValueChange={setCompanyId}>
                  <SelectTrigger className="w-full">
                    <div className="flex items-center gap-2 truncate">
                      <Building2 className="h-4 w-4 opacity-50" />
                      <SelectValue placeholder="Aucune" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Aucune / Général</SelectItem>
                    {companies.map((company) => (
                      <SelectItem key={company.id} value={company.id}>
                        {company.trade} - {company.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Décrivez brièvement la décision prise..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              required
            />
          </div>

          <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
            <p className="text-sm font-medium text-foreground">Traçabilité & Preuves</p>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <Label htmlFor="validation" className="font-normal cursor-pointer">
                  Validation écrite / OS signé
                </Label>
              </div>
              <Switch
                id="validation"
                checked={hasWrittenValidation}
                onCheckedChange={setHasWrittenValidation}
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Euro className="h-4 w-4 text-muted-foreground" />
                  <Label htmlFor="financial" className="font-normal cursor-pointer">
                    Impact financier / Avenant
                  </Label>
                </div>
                <Switch
                  id="financial"
                  checked={hasFinancialImpact}
                  onCheckedChange={setHasFinancialImpact}
                />
              </div>
              
              {hasFinancialImpact && (
                <div className="ml-6 space-y-2 animate-in fade-in slide-in-from-top-2">
                  <Label htmlFor="amount" className="text-xs">Montant (HT) - Positif (Avenant) ou Négatif (Moins-value)</Label>
                  <div className="relative">
                    <span className="absolute left-2.5 top-2.5 text-sm text-muted-foreground">€</span>
                    <Input
                      id="amount"
                      type="number"
                      className="pl-8 h-8"
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-muted-foreground" />
                  <Label htmlFor="proof" className="font-normal cursor-pointer">
                    Preuve jointe (Visa, Photo, Constat)
                  </Label>
                </div>
                <Switch
                  id="proof"
                  checked={hasProofAttached}
                  onCheckedChange={setHasProofAttached}
                />
              </div>

              {hasProofAttached && (
                <div className="ml-6 space-y-3 animate-in fade-in slide-in-from-top-2">
                  <div className="space-y-1">
                    <Label htmlFor="proofLabel" className="text-xs">Description de la preuve</Label>
                    <div className="relative">
                      <Image className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                      <Input
                        id="proofLabel"
                        className="pl-8 h-8 text-xs"
                        placeholder="Ex: Photo fissure n°3 / Email client du 12/04"
                        value={proofLabel}
                        onChange={(e) => setProofLabel(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="proofUrl" className="text-xs">Lien vers le document (optionnel)</Label>
                    <div className="relative">
                      <Link className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                      <Input
                        id="proofUrl"
                        className="pl-8 h-8 text-xs"
                        placeholder="https://drive.google.com/..."
                        value={proofUrl}
                        onChange={(e) => setProofUrl(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Impact preview */}
          <div className={`p-3 rounded-lg border ${previewImpact > 0 
              ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
              : previewImpact < 0 
                ? 'bg-red-50 border-red-200 text-red-700'
                : 'bg-muted border-border text-muted-foreground'
          }`}>
            <div className="flex items-center gap-2">
              {previewImpact < 0 ? (
                <AlertTriangle className="h-4 w-4" />
              ) : previewImpact > 0 ? (
                <Check className="h-4 w-4" />
              ) : null}
              <span className="text-sm font-medium">
                {previewImpact > 0 
                  ? `Impact positif (+${previewImpact} points)` 
                  : previewImpact < 0 
                    ? `Impact négatif (${previewImpact} points)` 
                    : 'Impact neutre'}
              </span>
            </div>
            <p className="text-xs mt-1 opacity-80">
              {previewImpact < 0 
                ? 'Cette décision n\'est pas suffisamment documentée.'
                : previewImpact > 0
                  ? 'Cette décision renforce votre traçabilité.'
                  : 'Ajoutez de la documentation pour améliorer le score.'}
            </p>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={!description.trim()}>
              <Plus className="h-4 w-4 mr-2" />
              Ajouter la décision
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};