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

interface EditAccountModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (account: {
    id: string;
    name: string;
    role: UserRole;
  }) => void;
  account: {
    id: string;
    email: string;
    name: string;
    role: 'Super Administrator' | 'Administrator' | 'Editor' | 'Viewer';
  } | null;
}

// Role display configuration
type RoleOption = {
  value: string;
  label: string;
  description: string;
};

const wmRoleOptions: RoleOption[] = [
  {
    value: 'wm_admin',
    label: 'Administrator',
    description: 'Administrators have access and editing permissions for all menus.',
  },
  {
    value: 'wm_editor',
    label: 'Editor',
    description:
      'Editors have access and editing permissions to all menus except for the account management menu.',
  },
  {
    value: 'wm_viewer',
    label: 'Viewer',
    description:
      'Viewers cannot access the account management menu, but they have permission to view the rest of the menus.',
  },
];

const resellerRoleOptions: RoleOption[] = [
  {
    value: 'reseller_admin',
    label: 'Administrator',
    description: 'Administrators have access and editing permissions for all menus.',
  },
  {
    value: 'reseller_editor',
    label: 'Editor',
    description:
      'Editors have access and editing permissions to all menus except for the account management menu.',
  },
  {
    value: 'reseller_viewer',
    label: 'Viewer',
    description:
      'Viewers cannot access the account management menu, but they have permission to view the rest of the menus.',
  },
];

export function EditAccountModal({
  open,
  onOpenChange,
  onSave,
  account,
}: EditAccountModalProps) {
  const { user } = useAuth();

  // Determine available role options based on current user's role
  const isWMAdmin = user?.role === 'wm_admin';
  const isResellerAdmin = user?.role === 'reseller_admin';
  const roleOptions = isWMAdmin ? wmRoleOptions : resellerRoleOptions;

  // Map display role to UserRole
  const mapDisplayRoleToUserRole = (displayRole: string): UserRole => {
    if (isWMAdmin) {
      switch (displayRole) {
        case 'Administrator':
          return 'wm_admin';
        case 'Editor':
          return 'wm_editor';
        case 'Viewer':
          return 'wm_viewer';
        default:
          return 'wm_viewer';
      }
    } else {
      switch (displayRole) {
        case 'Administrator':
          return 'reseller_admin';
        case 'Editor':
          return 'reseller_editor';
        case 'Viewer':
          return 'reseller_viewer';
        default:
          return 'reseller_viewer';
      }
    }
  };

  const [formData, setFormData] = useState({
    name: '',
    role: '' as UserRole,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize form when account changes
  useEffect(() => {
    if (open && account) {
      setFormData({
        name: account.name,
        role: mapDisplayRoleToUserRole(account.role),
      });
      setErrors({});
    }
  }, [open, account]);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleComplete = () => {
    if (!validateForm() || !account) return;

    onSave({
      id: account.id,
      name: formData.name.trim(),
      role: formData.role,
    });
    onOpenChange(false);
  };

  // Don't render if no account or user doesn't have permission
  if (!account || (!isWMAdmin && !isResellerAdmin)) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] gap-8 p-6">
        <DialogHeader className="gap-1.5">
          <DialogTitle className="text-lg font-semibold leading-none">
            Edit Account
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          {/* Email Field (Disabled) */}
          <div className="flex flex-col gap-3">
            <Label htmlFor="email" className="text-sm font-medium leading-5">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={account.email}
              disabled
              className="h-9 opacity-50"
            />
          </div>

          {/* Name Field */}
          <div className="flex flex-col gap-3">
            <Label htmlFor="name" className="text-sm font-medium leading-5">
              Name
            </Label>
            <div>
              <Input
                id="name"
                placeholder="Enter name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className="h-9"
              />
              {errors.name && (
                <p className="text-sm text-destructive mt-1">{errors.name}</p>
              )}
            </div>
          </div>

          {/* Permission Type */}
          <div className="flex flex-col gap-3">
            <Label className="text-sm font-medium leading-5">
              Permission Type
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
                      {option.label}
                    </p>
                    <p className="text-sm font-normal leading-5 text-muted-foreground">
                      {option.description}
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
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleComplete}
            className="h-9 px-4 py-2 text-sm font-medium"
          >
            Complete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
