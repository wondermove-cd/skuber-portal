import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Reseller, mockResellers } from '@/lib/mock/resellers';
import { COUNTRIES } from '@/lib/constants/countries';
import { validateBusinessRegNo } from '@/lib/utils/validators';

interface EditResellerInfoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reseller: Reseller | null;
  onSave: (updatedReseller: Reseller) => void;
}

export function EditResellerInfoModal({
  open,
  onOpenChange,
  reseller,
  onSave,
}: EditResellerInfoModalProps) {
  const { t } = useTranslation();

  const [formData, setFormData] = useState({
    name: '',
    country: '',
    businessRegNo: '',
    contactPerson: '',
    contactEmail: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load reseller data when modal opens
  useEffect(() => {
    if (open && reseller) {
      setFormData({
        name: reseller.name || '',
        country: reseller.country || '',
        businessRegNo: reseller.businessRegNo || '',
        contactPerson: reseller.contactPerson || '',
        contactEmail: reseller.contactEmail || '',
      });
      setErrors({});
    }
  }, [open, reseller]);

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

    // If reseller name changes, check for duplicates
    if (field === 'name' && value.trim()) {
      const storedResellers = JSON.parse(localStorage.getItem('resellers') || '[]');
      const allResellers = [...storedResellers, ...mockResellers];
      const isDuplicate = allResellers.some(
        (r) => r.id !== reseller?.id && r.name.toLowerCase() === value.trim().toLowerCase()
      );
      if (isDuplicate) {
        setErrors((prev) => ({
          ...prev,
          name: t('editResellerInfo.resellerNameExists'),
        }));
      } else {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors.name;
          return newErrors;
        });
      }
    }

    // If country changes and business reg no exists, revalidate it
    if (field === 'country' && formData.businessRegNo.trim()) {
      const countryCode = COUNTRIES.find((c) => c.name === value)?.code || '';
      const validation = validateBusinessRegNo(countryCode, formData.businessRegNo);
      if (!validation.isValid && validation.error) {
        setErrors((prev) => ({
          ...prev,
          businessRegNo: validation.error,
        }));
      } else {
        // Clear businessRegNo error if it's now valid
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors.businessRegNo;
          return newErrors;
        });
      }
    }

    // If business reg no changes and country exists, validate it
    if (field === 'businessRegNo' && formData.country) {
      const countryCode = COUNTRIES.find((c) => c.name === formData.country)?.code || '';
      const validation = validateBusinessRegNo(countryCode, value);
      if (!validation.isValid && validation.error) {
        setErrors((prev) => ({
          ...prev,
          businessRegNo: validation.error,
        }));
      } else {
        // Clear businessRegNo error if it's now valid
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors.businessRegNo;
          return newErrors;
        });
      }
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = t('editResellerInfo.resellerNameRequired');
    } else {
      // Check for duplicate reseller name
      const storedResellers = JSON.parse(localStorage.getItem('resellers') || '[]');
      const allResellers = [...storedResellers, ...mockResellers];
      const isDuplicate = allResellers.some(
        (r) => r.id !== reseller?.id && r.name.toLowerCase() === formData.name.trim().toLowerCase()
      );
      if (isDuplicate) {
        newErrors.name = t('editResellerInfo.resellerNameExists');
      }
    }

    if (!formData.country) {
      newErrors.country = t('editResellerInfo.countryRequired');
    }

    if (!formData.businessRegNo.trim()) {
      newErrors.businessRegNo = t('editResellerInfo.businessRegNoRequired');
    } else {
      const countryCode = COUNTRIES.find((c) => c.name === formData.country)?.code || '';
      const validation = validateBusinessRegNo(countryCode, formData.businessRegNo);
      if (!validation.isValid && validation.error) {
        newErrors.businessRegNo = validation.error;
      }
    }

    if (!formData.contactPerson.trim()) {
      newErrors.contactPerson = t('editResellerInfo.contactPersonRequired');
    }

    if (!formData.contactEmail.trim()) {
      newErrors.contactEmail = t('editResellerInfo.emailRequired');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contactEmail)) {
      newErrors.contactEmail = t('editResellerInfo.invalidEmailFormat');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!reseller || !validateForm()) return;

    const updatedReseller: Reseller = {
      ...reseller,
      name: formData.name.trim(),
      country: formData.country,
      businessRegNo: formData.businessRegNo.trim(),
      contactPerson: formData.contactPerson.trim(),
      contactEmail: formData.contactEmail.trim(),
    };

    onSave(updatedReseller);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] gap-8 p-6">
        <DialogHeader className="gap-1.5">
          <DialogTitle className="text-lg font-semibold leading-none">
            {t('editResellerInfo.title')}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-5">
          {/* Reseller Name */}
          <div className="flex flex-col gap-3">
            <Label htmlFor="name" className="text-sm font-medium leading-5">
              {t('editResellerInfo.resellerName')}
            </Label>
            <div>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className="h-9"
              />
              {errors.name && (
                <p className="text-sm text-destructive mt-1">{errors.name}</p>
              )}
            </div>
          </div>

          {/* Country */}
          <div className="flex flex-col gap-3">
            <Label htmlFor="country" className="text-sm font-medium leading-5">
              {t('editResellerInfo.country')}
            </Label>
            <div>
              <Select
                value={formData.country}
                onValueChange={(value) => handleChange('country', value)}
              >
                <SelectTrigger className="h-9 w-full">
                  <SelectValue placeholder={t('editResellerInfo.countryPlaceholder')} />
                </SelectTrigger>
                <SelectContent className="max-h-[200px]">
                  {COUNTRIES.map((country) => (
                    <SelectItem key={country.code} value={country.name}>
                      {country.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.country && (
                <p className="text-sm text-destructive mt-1">{errors.country}</p>
              )}
            </div>
          </div>

          {/* Business Reg. No. */}
          <div className="flex flex-col gap-3">
            <Label htmlFor="businessRegNo" className="text-sm font-medium leading-5">
              {t('editResellerInfo.businessRegNo')}
            </Label>
            <div>
              <Input
                id="businessRegNo"
                value={formData.businessRegNo}
                onChange={(e) => handleChange('businessRegNo', e.target.value)}
                className="h-9"
              />
              {errors.businessRegNo && (
                <p className="text-sm text-destructive mt-1">{errors.businessRegNo}</p>
              )}
            </div>
          </div>

          {/* Contact Person */}
          <div className="flex flex-col gap-3">
            <Label htmlFor="contactPerson" className="text-sm font-medium leading-5">
              {t('editResellerInfo.contactPerson')}
            </Label>
            <div>
              <Input
                id="contactPerson"
                value={formData.contactPerson}
                onChange={(e) => handleChange('contactPerson', e.target.value)}
                className="h-9"
              />
              {errors.contactPerson && (
                <p className="text-sm text-destructive mt-1">{errors.contactPerson}</p>
              )}
            </div>
          </div>

          {/* Contact Person Email */}
          <div className="flex flex-col gap-3">
            <Label htmlFor="contactEmail" className="text-sm font-medium leading-5">
              {t('editResellerInfo.contactPersonEmail')}
            </Label>
            <div>
              <Input
                id="contactEmail"
                type="email"
                value={formData.contactEmail}
                onChange={(e) => handleChange('contactEmail', e.target.value)}
                className="h-9"
              />
              {errors.contactEmail && (
                <p className="text-sm text-destructive mt-1">{errors.contactEmail}</p>
              )}
            </div>
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
            onClick={handleSave}
            className="h-9 px-4 py-2 text-sm font-medium"
          >
            {t('common.save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
