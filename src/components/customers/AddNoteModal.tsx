import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface AddNoteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddNote: (content: string) => void;
  editMode?: boolean;
  initialContent?: string;
  onEditNote?: (content: string) => void;
}

export function AddNoteModal({
  open,
  onOpenChange,
  onAddNote,
  editMode = false,
  initialContent = '',
  onEditNote
}: AddNoteModalProps) {
  const { t } = useTranslation();
  const [noteContent, setNoteContent] = useState('');
  const maxCharacters = 280;

  // Update content when modal opens with initial content
  useEffect(() => {
    if (open && editMode && initialContent) {
      setNoteContent(initialContent);
    } else if (open && !editMode) {
      setNoteContent('');
    }
  }, [open, editMode, initialContent]);

  const handleSubmit = () => {
    if (noteContent.trim()) {
      if (editMode && onEditNote) {
        onEditNote(noteContent.trim());
      } else {
        onAddNote(noteContent.trim());
      }
      // Clear content before closing to avoid flicker
      setNoteContent('');
      onOpenChange(false);
    }
  };

  const handleCancel = () => {
    // Clear content immediately to avoid flicker
    setNoteContent('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] gap-4 p-6">
        <DialogHeader className="gap-1.5">
          <DialogTitle className="text-lg font-semibold leading-none">
            {editMode ? t('addNoteModal.editNote') : t('addNoteModal.addNote')}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-3">
          <Label htmlFor="note" className="text-sm font-medium leading-5">
            {t('addNoteModal.note')}
          </Label>
          <div className="border border-input rounded-md bg-background flex flex-col">
            <Textarea
              id="note"
              placeholder={t('addNoteModal.placeholder')}
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value.slice(0, maxCharacters))}
              className="h-[120px] resize-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-3 text-sm overflow-auto shadow-none"
            />
            <div className="flex items-center justify-between px-3 pb-3 pt-1.5">
              <div className="text-sm font-medium text-muted-foreground">
                {t('addNoteModal.characters', { count: noteContent.length, max: maxCharacters })}
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            className="h-9 px-4 py-2 text-sm font-medium"
          >
            {t('common.cancel')}
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={!noteContent.trim()}
            className="h-9 px-4 py-2 text-sm font-medium"
          >
            {editMode ? t('common.save') : t('common.add')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
