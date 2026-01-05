import { useState } from 'react';
import { Plus, FileText, AlertTriangle, Check, Euro } from 'lucide-react';
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
import { Decision, DecisionType } from '@/types';
import { createDecision } from '@/lib/projects';
import { DECISION_TYPE_LABELS, calculateDecisionImpact } from '@/lib/scoring';

interface AddDecisionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDecisionAdded: (decision: Decision) => void;
}

export const AddDecisionDialog = ({ open, onOpenChange, onDecisionAdded }: AddDecisionDialogProps) => {
  const [type, setType] = useState<DecisionType>('modification');
  const [description, setDescription] = useState('');
  const [hasWrittenValidation, setHasWrittenValidation] = useState(false);
  const [hasFinancialImpact, setHasFinancialImpact] = useState(false);
  const [hasProofAttached, setHasProofAttached] = useState(false);

  const previewImpact = calculateDecisionImpact({
    type,
    description,
    hasWrittenValidation,
    hasFinancialImpact,
    hasProofAttached,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    const decision = createDecision(
      type,
      description.trim(),
      hasWrittenValidation,
      hasFinancialImpact,
      hasProofAttached
    );
    
    onDecisionAdded(decision);

    // Reset form
    setType('modification');
    setDescription('');
    setHasWrittenValidation(false);
    setHasFinancialImpact(false);
    setHasProofAttached(false);
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
            <p className="text-sm font-medium text-foreground">Documentation de la décision</p>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <Label htmlFor="validation" className="font-normal cursor-pointer">
                  Validation écrite (mail, CR, avenant)
                </Label>
              </div>
              <Switch
                id="validation"
                checked={hasWrittenValidation}
                onCheckedChange={setHasWrittenValidation}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Euro className="h-4 w-4 text-muted-foreground" />
                <Label htmlFor="financial" className="font-normal cursor-pointer">
                  Impact financier
                </Label>
              </div>
              <Switch
                id="financial"
                checked={hasFinancialImpact}
                onCheckedChange={setHasFinancialImpact}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-muted-foreground" />
                <Label htmlFor="proof" className="font-normal cursor-pointer">
                  Preuve jointe (photo, document)
                </Label>
              </div>
              <Switch
                id="proof"
                checked={hasProofAttached}
                onCheckedChange={setHasProofAttached}
              />
            </div>
          </div>

          {/* Impact preview */}
          <div className={`p-3 rounded-lg border ${
            previewImpact > 0 
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
