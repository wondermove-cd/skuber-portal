import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

interface EditBillingEmailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  emails: string[];
  onSave: (emails: string[]) => void;
}

export function EditBillingEmailsModal({
  open,
  onOpenChange,
  emails,
  onSave,
}: EditBillingEmailsModalProps) {
  const { t } = useTranslation();
  const [emailList, setEmailList] = useState<string[]>(emails);
  const [newEmail, setNewEmail] = useState('');
  const [emailError, setEmailError] = useState('');

  // Reset emailList when modal opens with new emails
  useEffect(() => {
    if (open) {
      setEmailList(emails);
    }
  }, [open, emails]);

  const validateEmail = (email: string): string => {
    if (!email.trim()) return t('editBillingEmailsModal.emailRequired');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return t('editBillingEmailsModal.invalidEmailFormat');
    if (emailList.includes(email)) return t('editBillingEmailsModal.emailAlreadyAdded');
    return '';
  };

  const handleAdd = () => {
    const error = validateEmail(newEmail);
    if (error) {
      setEmailError(error);
      return;
    }

    setEmailList([...emailList, newEmail]);
    setNewEmail('');
    setEmailError('');
  };

  const handleRemove = (index: number) => {
    if (emailList.length <= 1) {
      setEmailError(t('editBillingEmailsModal.atLeastOneEmailRequired'));
      return;
    }
    setEmailList(emailList.filter((_, i) => i !== index));
    setEmailError('');
  };

  const handleSave = () => {
    onSave(emailList);
    onOpenChange(false);
  };

  const handleClose = () => {
    setEmailList(emails); // Reset to original
    setNewEmail('');
    setEmailError('');
    onOpenChange(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[448px]">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold leading-none">
            {t('editBillingEmailsModal.title')}
          </DialogTitle>
          <DialogDescription className="text-sm leading-5 text-muted-foreground">
            {t('editBillingEmailsModal.description')}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-3">
            <Label htmlFor="billing-emails" className="text-sm font-medium leading-5">
              {t('editBillingEmailsModal.billingEmailAddress')}
            </Label>

            {/* Existing emails */}
            {emailList.map((email, index) => (
              <div
                key={index}
                className="flex items-center gap-2 h-9 px-3 py-1 bg-background border border-input rounded-md"
              >
                <span className="flex-1 text-sm text-foreground overflow-hidden text-ellipsis whitespace-nowrap">
                  {email}
                </span>
                <button
                  onClick={() => handleRemove(index)}
                  className="flex items-center justify-center size-6 hover:bg-accent rounded-sm transition-colors"
                >
                  <X className="size-4" />
                </button>
              </div>
            ))}

            {/* New email input with inline Add button */}
            <div className="flex flex-col gap-2">
              <div className={`bg-background border flex gap-2 h-9 items-center px-3 py-1 rounded-md w-full ${emailError ? 'border-destructive' : 'border-input'}`}>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => {
                    setNewEmail(e.target.value);
                    if (emailError) setEmailError('');
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder={t('editBillingEmailsModal.enterEmail')}
                  className="basis-0 grow bg-transparent border-0 font-normal leading-5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none min-h-px min-w-px overflow-hidden text-ellipsis whitespace-nowrap"
                />
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={handleAdd}
                  className="h-6 px-2 py-0 text-sm shrink-0"
                >
                  {t('common.add')}
                </Button>
              </div>
              <p className="text-sm text-muted-foreground leading-5">{t('editBillingEmailsModal.pressEnter')}</p>
              {emailError && (
                <p className="text-sm text-destructive -mt-1">{emailError}</p>
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleClose}
            className="h-9"
          >
            {t('common.close')}
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            className="h-9"
          >
            {t('common.save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
