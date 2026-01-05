import { useState } from 'react';
import { Plus } from 'lucide-react';
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
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Decision, Attachment } from '@/types';
import { createDecision } from '@/lib/projects';
import { AttachmentUploader } from './AttachmentUploader';

interface AddDecisionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDecisionAdded: (decision: Decision) => void;
}

export const AddDecisionDialog = ({ open, onOpenChange, onDecisionAdded }: AddDecisionDialogProps) => {
  const [content, setContent] = useState('');
  const [author, setAuthor] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !author.trim()) return;

    setIsSubmitting(true);
    const decision = createDecision(content.trim(), author.trim(), attachments);
    onDecisionAdded(decision);
    
    // Reset form
    setContent('');
    setAuthor('');
    setAttachments([]);
    setIsSubmitting(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Nouvelle décision</DialogTitle>
          <DialogDescription>
            Enregistrez une décision avec horodatage automatique.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="content">Décision prise</Label>
            <Textarea
              id="content"
              placeholder="Décrivez la décision : quoi et pourquoi..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="author">Auteur de la décision</Label>
            <Input
              id="author"
              placeholder="Ex: Jean Dupont (MOE)"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Pièces jointes (optionnel)</Label>
            <AttachmentUploader
              attachments={attachments}
              onAttachmentsChange={setAttachments}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              <Plus className="h-4 w-4 mr-2" />
              Enregistrer la décision
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
