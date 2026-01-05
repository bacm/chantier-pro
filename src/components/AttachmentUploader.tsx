import { useState, useRef } from 'react';
import { Plus, Image, FileText, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Attachment } from '@/types';
import { generateId } from '@/lib/projects';
import { cn } from '@/lib/utils';

interface AttachmentUploaderProps {
  attachments: Attachment[];
  onAttachmentsChange: (attachments: Attachment[]) => void;
}

export const AttachmentUploader = ({ attachments, onAttachmentsChange }: AttachmentUploaderProps) => {
  const photoInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>, type: 'photo' | 'document') => {
    const files = event.target.files;
    if (!files) return;

    const newAttachments: Attachment[] = Array.from(files).map(file => ({
      id: generateId(),
      name: file.name,
      type,
      url: URL.createObjectURL(file),
    }));

    onAttachmentsChange([...attachments, ...newAttachments]);
    event.target.value = '';
  };

  const removeAttachment = (id: string) => {
    onAttachmentsChange(attachments.filter(a => a.id !== id));
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <input
          ref={photoInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleFileSelect(e, 'photo')}
        />
        <input
          ref={docInputRef}
          type="file"
          accept=".pdf,.doc,.docx,.dwg"
          multiple
          className="hidden"
          onChange={(e) => handleFileSelect(e, 'document')}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => photoInputRef.current?.click()}
          className="gap-2"
        >
          <Image className="h-4 w-4" />
          Photo
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => docInputRef.current?.click()}
          className="gap-2"
        >
          <FileText className="h-4 w-4" />
          Document
        </Button>
      </div>

      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {attachments.map((attachment) => (
            <div
              key={attachment.id}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm",
                "bg-secondary border border-border"
              )}
            >
              {attachment.type === 'photo' ? (
                <Image className="h-3.5 w-3.5 text-muted-foreground" />
              ) : (
                <FileText className="h-3.5 w-3.5 text-muted-foreground" />
              )}
              <span className="max-w-[120px] truncate">{attachment.name}</span>
              <button
                type="button"
                onClick={() => removeAttachment(attachment.id)}
                className="text-muted-foreground hover:text-destructive transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
