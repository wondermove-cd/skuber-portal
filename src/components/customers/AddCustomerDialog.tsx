import { useState } from 'react';
import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { COUNTRIES } from '@/lib/constants/countries';
import { validateBusinessRegNo } from '@/lib/utils/validators';
import { Customer } from '@/lib/mock/customers';

interface AddCustomerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (customer: Omit<Customer, 'id' | 'createdAt' | 'services' | 'resellerId'>) => void;
  showAddContractCheckbox?: boolean;
}

export function AddCustomerDialog({
  open,
  onOpenChange,
  onSubmit,
  showAddContractCheckbox = true
}: AddCustomerDialogProps) {
  const { t } = useTranslation();

  const [customerFormData, setCustomerFormData] = useState({
    countryCode: 'KR',
    companyName: '',
    businessRegNo: '',
    ceoName: '',
    contactPerson: '',
    contactEmail: '',
    note: '',
  });

  const [formErrors, setFormErrors] = useState<{
    countryCode?: string;
    companyName?: string;
    businessRegNo?: string;
    ceoName?: string;
    contactPerson?: string;
    contactEmail?: string;
  }>({});

  const [addContractAfter, setAddContractAfter] = useState(true);

  const selectedCountry = COUNTRIES.find((c) => c.code === customerFormData.countryCode);

  const validateField = (field: keyof typeof customerFormData, value: string): string | undefined => {
    switch (field) {
      case 'countryCode':
        if (!value) return t('validation.countryRequired');
        return undefined;

      case 'companyName':
        if (!value.trim()) return t('validation.companyNameRequired');
        if (value.trim().length < 2) return t('validation.companyNameMinLength');
        return undefined;

      case 'businessRegNo':
        const validation = validateBusinessRegNo(customerFormData.countryCode, value);
        return validation.error;

      case 'ceoName':
        if (!value.trim()) return t('validation.nameRequired');
        if (value.trim().length < 2) return t('validation.nameMinLength');
        return undefined;

      case 'contactPerson':
        if (!value.trim()) return t('validation.contactPersonRequired');
        if (value.trim().length < 2) return t('validation.nameMinLength');
        return undefined;

      case 'contactEmail':
        if (!value.trim()) return t('validation.emailRequired');
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return t('validation.invalidEmailFormat');
        return undefined;

      default:
        return undefined;
    }
  };

  const validateForm = (): boolean => {
    const newErrors: typeof formErrors = {};

    Object.keys(customerFormData).forEach((key) => {
      const field = key as keyof typeof customerFormData;
      const error = validateField(field, customerFormData[field]);
      if (error) {
        newErrors[field] = error;
      }
    });

    setFormErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: string) => {
    setCustomerFormData((prev) => ({ ...prev, [field]: value }));
    if (formErrors[field as keyof typeof formErrors]) {
      setFormErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field as keyof typeof formErrors];
        return newErrors;
      });
    }
  };

  const handleFieldBlur = (field: keyof typeof customerFormData) => {
    const error = validateField(field, customerFormData[field]);
    if (error) {
      setFormErrors((prev) => ({ ...prev, [field]: error }));
    }
  };

  const isFormValid = () => {
    return (
      customerFormData.countryCode !== '' &&
      customerFormData.companyName.trim() !== '' &&
      customerFormData.businessRegNo.trim() !== '' &&
      customerFormData.ceoName.trim() !== '' &&
      customerFormData.contactPerson.trim() !== '' &&
      customerFormData.contactEmail.trim() !== '' &&
      Object.keys(formErrors).length === 0
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    onSubmit({
      companyName: customerFormData.companyName,
      businessRegNo: customerFormData.businessRegNo,
      contactPerson: customerFormData.contactPerson,
    });

    // Reset form
    setCustomerFormData({
      countryCode: 'KR',
      companyName: '',
      businessRegNo: '',
      ceoName: '',
      contactPerson: '',
      contactEmail: '',
      note: '',
    });
    setFormErrors({});
    setAddContractAfter(true);
  };

  const handleClose = () => {
    setCustomerFormData({
      countryCode: 'KR',
      companyName: '',
      businessRegNo: '',
      ceoName: '',
      contactPerson: '',
      contactEmail: '',
      note: '',
    });
    setFormErrors({});
    setAddContractAfter(true);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] gap-6 p-6">
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">{t('common.close')}</span>
        </button>
        <DialogHeader className="gap-1.5">
          <DialogTitle className="text-lg font-semibold leading-none">{t('customers.addCustomer')}</DialogTitle>
        </DialogHeader>

        {/* Scrollable form area */}
        <div className="max-h-[calc(100vh-280px)] overflow-y-auto px-1">
          <form id="customer-form" onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Company Name */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="companyName" className="text-sm font-medium">
              {t('customers.companyName')}
            </Label>
            <Input
              id="companyName"
              value={customerFormData.companyName}
              onChange={(e) => handleInputChange('companyName', e.target.value)}
              onBlur={() => handleFieldBlur('companyName')}
              className="h-9"
              placeholder={t('customers.enterCompanyName')}
              aria-invalid={!!formErrors.companyName}
            />
            {formErrors.companyName && (
              <p className="text-sm text-destructive -mt-1">{formErrors.companyName}</p>
            )}
          </div>

          {/* Country */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="country" className="text-sm font-medium">
              {t('customers.country')}
            </Label>
            <Select
              value={customerFormData.countryCode}
              onValueChange={(value) => {
                setCustomerFormData((prev) => ({
                  ...prev,
                  countryCode: value,
                  businessRegNo: '',
                }));
                if (formErrors.businessRegNo) {
                  setFormErrors((prev) => {
                    const newErrors = { ...prev };
                    delete newErrors.businessRegNo;
                    return newErrors;
                  });
                }
              }}
            >
              <SelectTrigger className="h-9 w-full">
                <SelectValue placeholder={t('common.selectCountry')} />
              </SelectTrigger>
              <SelectContent className="max-h-[240px]">
                {COUNTRIES.map((country) => (
                  <SelectItem key={country.code} value={country.code}>
                    {country.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {formErrors.countryCode && (
              <p className="text-sm text-destructive -mt-1">{formErrors.countryCode}</p>
            )}
          </div>

          {/* Business Reg. No. */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="businessRegNo" className="text-sm font-medium">
              {t('customers.businessRegNo')}
            </Label>
            <Input
              id="businessRegNo"
              value={customerFormData.businessRegNo}
              onChange={(e) => handleInputChange('businessRegNo', e.target.value)}
              onBlur={() => handleFieldBlur('businessRegNo')}
              className="h-9"
              placeholder={selectedCountry?.businessRegNoFormat || ''}
              aria-invalid={!!formErrors.businessRegNo}
            />
            {formErrors.businessRegNo && (
              <p className="text-sm text-destructive -mt-1">{formErrors.businessRegNo}</p>
            )}
          </div>

          {/* CEO / Representative */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="ceoName" className="text-sm font-medium">
              {t('customers.ceo')}
            </Label>
            <Input
              id="ceoName"
              value={customerFormData.ceoName}
              onChange={(e) => handleInputChange('ceoName', e.target.value)}
              onBlur={() => handleFieldBlur('ceoName')}
              className="h-9"
              placeholder={t('customers.enterCeo')}
              aria-invalid={!!formErrors.ceoName}
            />
            {formErrors.ceoName && (
              <p className="text-sm text-destructive -mt-1">{formErrors.ceoName}</p>
            )}
          </div>

          {/* Contact Person */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="contactPerson" className="text-sm font-medium">
              {t('customers.contactPerson')}
            </Label>
            <Input
              id="contactPerson"
              value={customerFormData.contactPerson}
              onChange={(e) => handleInputChange('contactPerson', e.target.value)}
              onBlur={() => handleFieldBlur('contactPerson')}
              className="h-9"
              placeholder={t('customers.enterContactPerson')}
              aria-invalid={!!formErrors.contactPerson}
            />
            {formErrors.contactPerson && (
              <p className="text-sm text-destructive -mt-1">{formErrors.contactPerson}</p>
            )}
          </div>

          {/* Contact Person Email */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="contactEmail" className="text-sm font-medium">
              {t('customers.contactEmail')}
            </Label>
            <Input
              id="contactEmail"
              type="email"
              value={customerFormData.contactEmail}
              onChange={(e) => handleInputChange('contactEmail', e.target.value)}
              onBlur={() => handleFieldBlur('contactEmail')}
              className="h-9"
              placeholder={t('customers.enterEmail')}
              aria-invalid={!!formErrors.contactEmail}
            />
            {formErrors.contactEmail && (
              <p className="text-sm text-destructive -mt-1">{formErrors.contactEmail}</p>
            )}
          </div>

          {/* Note Field */}
          <div className="flex flex-col gap-3">
            <Label htmlFor="note" className="text-sm font-medium">
              {t('customers.note')}
            </Label>
            <div className="relative">
              <Textarea
                id="note"
                value={customerFormData.note}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value.length <= 280) {
                    handleInputChange('note', value);
                  }
                }}
                className="min-h-[64px] resize-none"
                placeholder={t('customers.enterNote')}
              />
              <div className="flex items-center justify-between pt-1.5 px-3 pb-3">
                <p className="text-sm text-muted-foreground">
                  {customerFormData.note.length}/280 {t('customers.characters')}
                </p>
              </div>
            </div>
          </div>
        </form>
        </div>

        {/* Fixed checkbox and footer */}
        {showAddContractCheckbox && (
          <div className="flex items-start gap-2 pt-1 pb-0">
            <Checkbox
              id="add-contract-customer"
              checked={addContractAfter}
              onCheckedChange={(checked) => setAddContractAfter(checked === true)}
            />
            <Label
              htmlFor="add-contract-customer"
              className="text-sm font-medium cursor-pointer select-none"
            >
              {t('common.addContractAfterSaving')}
            </Label>
          </div>
        )}

        <DialogFooter className="flex items-center justify-end gap-2 sm:justify-end">
          <Button type="button" variant="outline" className="h-9 px-4 text-sm" onClick={handleClose}>
            {t('common.cancel')}
          </Button>
          <Button
            type="submit"
            form="customer-form"
            className="h-9 px-4 text-sm"
            disabled={!isFormValid()}
          >
            {t('common.submit')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
