import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types/auth';
import { useTranslation } from 'react-i18next';

interface CreateAccountModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (account: {
    email: string;
    name: string;
    role: UserRole;
    resellerId?: string;
    resellerName?: string;
  }) => void;
  existingEmails: string[];
}

// Role display configuration
type RoleOption = {
  value: string;
  labelKey: string;
  descriptionKey: string;
};

const wmRoleOptions: RoleOption[] = [
  {
    value: 'wm_admin',
    labelKey: 'settings.administrator',
    descriptionKey: 'settings.adminDesc',
  },
  {
    value: 'wm_editor',
    labelKey: 'settings.editor',
    descriptionKey: 'settings.editorDesc',
  },
  {
    value: 'wm_viewer',
    labelKey: 'settings.viewer',
    descriptionKey: 'settings.viewerDesc',
  },
];

const resellerRoleOptions: RoleOption[] = [
  {
    value: 'reseller_admin',
    labelKey: 'settings.administrator',
    descriptionKey: 'settings.adminDesc',
  },
  {
    value: 'reseller_editor',
    labelKey: 'settings.editor',
    descriptionKey: 'settings.editorDesc',
  },
  {
    value: 'reseller_viewer',
    labelKey: 'settings.viewer',
    descriptionKey: 'settings.viewerDesc',
  },
];

export function CreateAccountModal({
  open,
  onOpenChange,
  onSave,
  existingEmails,
}: CreateAccountModalProps) {
  const { user } = useAuth();
  const { t } = useTranslation();

  // Determine available role options based on current user's role
  const isWMAdmin = user?.role === 'wm_admin';
  const isResellerAdmin = user?.role === 'reseller_admin';
  const roleOptions = isWMAdmin ? wmRoleOptions : resellerRoleOptions;
  const defaultRole = isWMAdmin ? 'wm_admin' : 'reseller_admin';

  const [formData, setFormData] = useState({
    email: '',
    name: '',
    role: defaultRole as UserRole,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      setFormData({
        email: '',
        name: '',
        role: defaultRole as UserRole,
      });
      setErrors({});
    }
  }, [open, defaultRole]);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Real-time validation for email
    if (field === 'email') {
      if (!value.trim()) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors.email;
          return newErrors;
        });
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) {
        setErrors((prev) => ({
          ...prev,
          email: t('settings.invalidEmailFormat'),
        }));
      } else {
        // Check for duplicate email
        const isDuplicate = existingEmails.some(
          (existingEmail) => existingEmail.toLowerCase() === value.trim().toLowerCase()
        );
        if (isDuplicate) {
          setErrors((prev) => ({
            ...prev,
            email: t('settings.emailAlreadyRegistered'),
          }));
        } else {
          // Clear error if email is valid
          setErrors((prev) => {
            const newErrors = { ...prev };
            delete newErrors.email;
            return newErrors;
          });
        }
      }
    }

    // Clear error for other fields
    if (field !== 'email' && errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.email.trim()) {
      newErrors.email = t('settings.emailRequired');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t('settings.invalidEmailFormat');
    } else {
      // Check for duplicate email
      const isDuplicate = existingEmails.some(
        (existingEmail) => existingEmail.toLowerCase() === formData.email.trim().toLowerCase()
      );
      if (isDuplicate) {
        newErrors.email = t('settings.emailAlreadyRegistered');
      }
    }

    if (!formData.name.trim()) {
      newErrors.name = t('settings.nameRequired');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleComplete = () => {
    if (!validateForm()) return;

    // Prepare account data based on user type
    const accountData: {
      email: string;
      name: string;
      role: UserRole;
      resellerId?: string;
      resellerName?: string;
    } = {
      email: formData.email.trim(),
      name: formData.name.trim(),
      role: formData.role,
    };

    // Add reseller information if creating a reseller account
    if (isResellerAdmin && user?.resellerId && user?.resellerName) {
      accountData.resellerId = user.resellerId;
      accountData.resellerName = user.resellerName;
    }

    onSave(accountData);
    onOpenChange(false);
  };

  // Don't render if user doesn't have permission
  if (!isWMAdmin && !isResellerAdmin) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] gap-8 p-6">
        <DialogHeader className="gap-1.5">
          <DialogTitle className="text-lg font-semibold leading-none">
            {t('settings.createNewAccount')}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          {/* Email Field */}
          <div className="flex flex-col gap-3">
            <Label htmlFor="email" className="text-sm font-medium leading-5">
              {t('settings.email')}
            </Label>
            <div>
              <Input
                id="email"
                type="email"
                placeholder={t('settings.enterEmail')}
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className={`h-9 ${errors.email ? 'border-destructive focus-visible:ring-destructive' : ''}`}
              />
              {errors.email && (
                <p className="text-sm text-destructive mt-1">{errors.email}</p>
              )}
            </div>
          </div>

          {/* Name Field */}
          <div className="flex flex-col gap-3">
            <Label htmlFor="name" className="text-sm font-medium leading-5">
              {t('settings.name')}
            </Label>
            <div>
              <Input
                id="name"
                placeholder={t('settings.enterName')}
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className={`h-9 ${errors.name ? 'border-destructive focus-visible:ring-destructive' : ''}`}
              />
              {errors.name && (
                <p className="text-sm text-destructive mt-1">{errors.name}</p>
              )}
            </div>
          </div>

          {/* Permission Type */}
          <div className="flex flex-col gap-3">
            <Label className="text-sm font-medium leading-5">
              {t('settings.permissionType')}
            </Label>
            <RadioGroup
              value={formData.role}
              onValueChange={(value) => handleChange('role', value)}
              className="flex flex-col gap-3"
            >
              {roleOptions.map((option) => (
                <label
                  key={option.value}
                  className={`
                    flex gap-3 items-start p-4 rounded-lg border cursor-pointer transition-colors
                    ${
                      formData.role === option.value
                        ? 'bg-primary/5 border-primary'
                        : 'border-border hover:bg-accent'
                    }
                  `}
                >
                  <RadioGroupItem value={option.value} className="mt-0.5" />
                  <div className="flex flex-col gap-1.5 flex-1">
                    <p className="text-sm font-medium leading-none text-foreground">
                      {t(option.labelKey)}
                    </p>
                    <p className="text-sm font-normal leading-5 text-muted-foreground">
                      {t(option.descriptionKey)}
                    </p>
                  </div>
                </label>
              ))}
            </RadioGroup>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="h-9 px-4 py-2 text-sm font-medium"
          >
            {t('common.cancel')}
          </Button>
          <Button
            type="button"
            onClick={handleComplete}
            className="h-9 px-4 py-2 text-sm font-medium"
          >
            {t('settings.complete')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
