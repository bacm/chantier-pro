import { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
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
import { Project } from '@/types';
import { useProjectOperations } from '@/hooks/useProjectOperations';
import { useCurrentProject } from '@/contexts/ProjectContext';

interface AddPlanningDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: Project;
}

export const AddPlanningDialog = ({ open, onOpenChange, project }: AddPlanningDialogProps) => {
  const { projectId } = useCurrentProject();
  const { updateProjectPlanning } = useProjectOperations(projectId);
  const [startDate, setStartDate] = useState<string>('');
  const [contractualEndDate, setContractualEndDate] = useState<string>('');
  const [estimatedEndDate, setEstimatedEndDate] = useState<string>('');

  useEffect(() => {
    if (open) {
      setStartDate(project.startDate ? project.startDate.toISOString().split('T')[0] : '');
      setContractualEndDate(project.contractualEndDate ? project.contractualEndDate.toISOString().split('T')[0] : '');
      setEstimatedEndDate(project.estimatedEndDate ? project.estimatedEndDate.toISOString().split('T')[0] : '');
    }
  }, [open, project]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    updateProjectPlanning(
      startDate ? new Date(startDate) : undefined,
      contractualEndDate ? new Date(contractualEndDate) : undefined,
      estimatedEndDate ? new Date(estimatedEndDate) : undefined
    );
    
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Mise à jour du planning</DialogTitle>
          <DialogDescription>
            Ajustez les dates clés du projet pour suivre les délais.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="startDate">Date de démarrage (OS)</Label>
            <Input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contractualEndDate">Fin contractuelle</Label>
            <Input
              id="contractualEndDate"
              type="date"
              value={contractualEndDate}
              onChange={(e) => setContractualEndDate(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="estimatedEndDate">Fin prévisionnelle (estimée)</Label>
            <Input
              id="estimatedEndDate"
              type="date"
              value={estimatedEndDate}
              onChange={(e) => setEstimatedEndDate(e.target.value)}
              className={
                estimatedEndDate && contractualEndDate && new Date(estimatedEndDate) > new Date(contractualEndDate)
                  ? 'border-red-500 bg-red-50'
                  : ''
              }
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit">
              <Save className="h-4 w-4 mr-2" />
              Enregistrer
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
