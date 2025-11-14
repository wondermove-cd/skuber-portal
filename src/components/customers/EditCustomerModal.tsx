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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Customer, mockCustomers } from '@/lib/mock/customers';
import { COUNTRIES } from '@/lib/constants/countries';
import { validateBusinessRegNo } from '@/lib/utils/validators';

interface EditCustomerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer: Customer | null;
  onSave: (updatedCustomer: Customer) => void;
}

export function EditCustomerModal({
  open,
  onOpenChange,
  customer,
  onSave,
}: EditCustomerModalProps) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    companyName: '',
    country: '',
    businessRegNo: '',
    ceo: '',
    contactPerson: '',
    email: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load customer data when modal opens
  useEffect(() => {
    if (open && customer) {
      setFormData({
        companyName: customer.companyName || '',
        country: customer.country || '',
        businessRegNo: customer.businessRegNo || '',
        ceo: customer.ceo || '',
        contactPerson: customer.contactPerson || '',
        email: customer.email || '',
      });
      setErrors({});
    }
  }, [open, customer]);

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

    // If company name changes, check for duplicates
    if (field === 'companyName' && value.trim()) {
      const storedCustomers = JSON.parse(localStorage.getItem('customers') || '[]');
      const allCustomers = [...storedCustomers, ...mockCustomers];
      const isDuplicate = allCustomers.some(
        (c) => c.id !== customer?.id && c.companyName.toLowerCase() === value.trim().toLowerCase()
      );
      if (isDuplicate) {
        setErrors((prev) => ({
          ...prev,
          companyName: t('editCustomerModal.companyNameExists'),
        }));
      } else {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors.companyName;
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

    if (!formData.companyName.trim()) {
      newErrors.companyName = t('editCustomerModal.companyNameRequired');
    } else {
      // Check for duplicate company name
      const storedCustomers = JSON.parse(localStorage.getItem('customers') || '[]');
      const allCustomers = [...storedCustomers, ...mockCustomers];
      const isDuplicate = allCustomers.some(
        (c) => c.id !== customer?.id && c.companyName.toLowerCase() === formData.companyName.trim().toLowerCase()
      );
      if (isDuplicate) {
        newErrors.companyName = t('editCustomerModal.companyNameExists');
      }
    }

    if (!formData.country) {
      newErrors.country = t('editCustomerModal.countryRequired');
    }

    if (!formData.businessRegNo.trim()) {
      newErrors.businessRegNo = t('editCustomerModal.businessRegNoRequired');
    } else {
      const countryCode = COUNTRIES.find((c) => c.name === formData.country)?.code || '';
      const validation = validateBusinessRegNo(countryCode, formData.businessRegNo);
      if (!validation.isValid && validation.error) {
        newErrors.businessRegNo = validation.error;
      }
    }

    if (!formData.ceo.trim()) {
      newErrors.ceo = t('editCustomerModal.ceoRequired');
    }

    if (!formData.contactPerson.trim()) {
      newErrors.contactPerson = t('editCustomerModal.contactPersonRequired');
    }

    if (!formData.email.trim()) {
      newErrors.email = t('editCustomerModal.emailRequired');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t('editCustomerModal.invalidEmailFormat');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!customer || !validateForm()) return;

    const updatedCustomer: Customer = {
      ...customer,
      companyName: formData.companyName.trim(),
      country: formData.country,
      businessRegNo: formData.businessRegNo.trim(),
      ceo: formData.ceo.trim(),
      contactPerson: formData.contactPerson.trim(),
      email: formData.email.trim(),
    };

    onSave(updatedCustomer);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] gap-8 p-6">
        <DialogHeader className="gap-1.5">
          <DialogTitle className="text-lg font-semibold leading-none">
            {t('editCustomerModal.title')}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-5">
          {/* Company Name */}
          <div className="flex flex-col gap-3">
            <Label htmlFor="companyName" className="text-sm font-medium leading-5">
              {t('editCustomerModal.companyName')}
            </Label>
            <div>
              <Input
                id="companyName"
                value={formData.companyName}
                onChange={(e) => handleChange('companyName', e.target.value)}
                className="h-9"
              />
              {errors.companyName && (
                <p className="text-sm text-destructive mt-1">{errors.companyName}</p>
              )}
            </div>
          </div>

          {/* Country */}
          <div className="flex flex-col gap-3">
            <Label htmlFor="country" className="text-sm font-medium leading-5">
              {t('editCustomerModal.country')}
            </Label>
            <div>
              <Select
                value={formData.country}
                onValueChange={(value) => handleChange('country', value)}
              >
                <SelectTrigger className="h-9 w-full">
                  <SelectValue placeholder={t('editCustomerModal.selectCountry')} />
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
              {t('editCustomerModal.businessRegNo')}
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

          {/* CEO / Representative */}
          <div className="flex flex-col gap-3">
            <Label htmlFor="ceo" className="text-sm font-medium leading-5">
              {t('editCustomerModal.ceoRepresentative')}
            </Label>
            <div>
              <Input
                id="ceo"
                value={formData.ceo}
                onChange={(e) => handleChange('ceo', e.target.value)}
                className="h-9"
              />
              {errors.ceo && (
                <p className="text-sm text-destructive mt-1">{errors.ceo}</p>
              )}
            </div>
          </div>

          {/* Contact Person */}
          <div className="flex flex-col gap-3">
            <Label htmlFor="contactPerson" className="text-sm font-medium leading-5">
              {t('editCustomerModal.contactPerson')}
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
            <Label htmlFor="email" className="text-sm font-medium leading-5">
              {t('editCustomerModal.contactPersonEmail')}
            </Label>
            <div>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className="h-9"
              />
              {errors.email && (
                <p className="text-sm text-destructive mt-1">{errors.email}</p>
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
