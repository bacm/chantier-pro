import { useState } from 'react';
import { Plus, MapPin, Building2, AlignLeft } from 'lucide-react';
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
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Company } from '@/types';
import { createSnag } from '@/lib/projects';
import { useProjectOperations } from '@/hooks/useProjectOperations';
import { useCurrentProject } from '@/contexts/ProjectContext';

interface AddSnagDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companies: Company[];
}

export const AddSnagDialog = ({ open, onOpenChange, companies }: AddSnagDialogProps) => {
  const { projectId } = useCurrentProject();
  const { addSnag } = useProjectOperations(projectId);
  const [description, setDescription] = useState('');
  const [companyId, setCompanyId] = useState<string>('');
  const [location, setLocation] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || !companyId) return;

    const snag = createSnag(description.trim(), companyId, location.trim() || undefined);
    addSnag(snag);

    // Reset form
    setDescription('');
    setCompanyId('');
    setLocation('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Ajouter une réserve</DialogTitle>
          <DialogDescription>
            Décrivez le défaut constaté pour le suivi des OPR.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="company">Entreprise responsable</Label>
            <Select value={companyId} onValueChange={setCompanyId} required>
              <SelectTrigger>
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 opacity-50" />
                  <SelectValue placeholder="Choisir une entreprise" />
                </div>
              </SelectTrigger>
              <SelectContent>
                {companies.map((company) => (
                  <SelectItem key={company.id} value={company.id}>
                    {company.trade} - {company.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Localisation (optionnel)</Label>
            <div className="relative">
              <MapPin className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="location"
                className="pl-9"
                placeholder="Ex: Chambre 1, RDC, Plafond..."
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description du défaut</Label>
            <div className="relative">
              <AlignLeft className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Textarea
                id="description"
                className="pl-9 min-h-[100px]"
                placeholder="Ex: Impact sur le placo, manque une couche de peinture..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={!description.trim() || !companyId}>
              <Plus className="h-4 w-4 mr-2" />
              Ajouter la réserve
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
