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
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';

interface PricingData {
  payAsYouGo: {
    vcpuUnitPrice: string;
    minimumCharge: string;
  };
  fixedRate: {
    oneYear: {
      contractAmount: string;
      includedAllocation: string;
    };
    threeYear: {
      contractAmount: string;
      includedAllocation: string;
    };
    fiveYear: {
      contractAmount: string;
      includedAllocation: string;
    };
  };
}

interface AddResellerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: {
    name: string;
    contactEmail: string;
    services: string[];
    pricing: Record<string, PricingData>;
    billingEmails: string[];
    note: string;
  }) => void;
}

export function AddResellerModal({ open, onOpenChange, onSubmit }: AddResellerModalProps) {
  const { t } = useTranslation();

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    contactEmail: '',
  });
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [pricingData, setPricingData] = useState<Record<string, PricingData>>({});
  const [applyToAll, setApplyToAll] = useState(false);
  const [currentServiceIndex, setCurrentServiceIndex] = useState(0);
  const [billingEmails, setBillingEmails] = useState<string[]>([]);
  const [newEmail, setNewEmail] = useState('');
  const [newEmailError, setNewEmailError] = useState<string>('');
  const [note, setNote] = useState('');

  const [formErrors, setFormErrors] = useState<{
    name?: string;
    contactEmail?: string;
  }>({});

  const handleClose = () => {
    setCurrentStep(1);
    setFormData({ name: '', contactEmail: '' });
    setSelectedServices([]);
    setPricingData({});
    setApplyToAll(false);
    setCurrentServiceIndex(0);
    setBillingEmails([]);
    setNewEmail('');
    setNewEmailError('');
    setNote('');
    setFormErrors({});
    onOpenChange(false);
  };

  const validateField = (field: keyof typeof formData, value: string): string | undefined => {
    switch (field) {
      case 'name':
        if (!value.trim()) return t('addReseller.resellerNameRequired');
        if (value.trim().length < 2) return t('addReseller.resellerNameMinLength');
        return undefined;

      case 'contactEmail':
        if (!value.trim()) return t('addReseller.emailRequired');
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return t('addReseller.invalidEmailFormat');
        return undefined;

      default:
        return undefined;
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (formErrors[field as keyof typeof formErrors]) {
      setFormErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field as keyof typeof formErrors];
        return newErrors;
      });
    }
  };

  const handleFieldBlur = (field: keyof typeof formData) => {
    const error = validateField(field, formData[field]);
    if (error) {
      setFormErrors((prev) => ({ ...prev, [field]: error }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: typeof formErrors = {};

    Object.keys(formData).forEach((key) => {
      const field = key as keyof typeof formData;
      const error = validateField(field, formData[field]);
      if (error) {
        newErrors[field] = error;
      }
    });

    setFormErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isFormValid = () => {
    return (
      formData.name.trim() !== '' &&
      formData.contactEmail.trim() !== '' &&
      Object.keys(formErrors).length === 0
    );
  };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();

    if (currentStep === 1) {
      if (!validateForm()) {
        return;
      }
      setCurrentStep(2);
    } else if (currentStep === 2) {
      // Skip pricing step and go directly to billing emails and note
      setCurrentStep(3);
    } else if (currentStep === 3) {
      // Submit the form with all data (without pricing)
      onSubmit({
        ...formData,
        services: selectedServices,
        pricing: {},
        billingEmails,
        note,
      });
      handleClose();
    }
  };

  const handlePrev = () => {
    if (currentStep === 3) {
      // Go back to service selection
      setCurrentStep(2);
    } else if (currentStep === 2) {
      setCurrentStep(1);
    }
  };

  const handleServiceToggle = (service: string) => {
    setSelectedServices((prev) =>
      prev.includes(service)
        ? prev.filter((s) => s !== service)
        : [...prev, service]
    );
  };

  const initializePricingForService = (service: string): PricingData => ({
    payAsYouGo: {
      vcpuUnitPrice: '',
      minimumCharge: '',
    },
    fixedRate: {
      oneYear: {
        contractAmount: '',
        includedAllocation: '',
      },
      threeYear: {
        contractAmount: '',
        includedAllocation: '',
      },
      fiveYear: {
        contractAmount: '',
        includedAllocation: '',
      },
    },
  });

  const handlePricingChange = (
    service: string,
    category: 'payAsYouGo' | 'fixedRate',
    field: string,
    value: string
  ) => {
    setPricingData((prev) => {
      const servicePricing = prev[service] || initializePricingForService(service);

      if (category === 'payAsYouGo') {
        return {
          ...prev,
          [service]: {
            ...servicePricing,
            payAsYouGo: {
              ...servicePricing.payAsYouGo,
              [field]: value,
            },
          },
        };
      } else {
        // Parse field like "oneYear.contractAmount"
        const [yearKey, priceField] = field.split('.');
        return {
          ...prev,
          [service]: {
            ...servicePricing,
            fixedRate: {
              ...servicePricing.fixedRate,
              [yearKey]: {
                ...servicePricing.fixedRate[yearKey as keyof typeof servicePricing.fixedRate],
                [priceField]: value,
              },
            },
          },
        };
      }
    });
  };

  const validateEmail = (email: string): string => {
    if (!email.trim()) return t('addReseller.emailRequired');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return t('addReseller.invalidEmailFormat');
    if (billingEmails.includes(email)) return t('addReseller.emailAlreadyAdded');
    return '';
  };

  const handleAddEmail = () => {
    const error = validateEmail(newEmail);
    if (error) {
      setNewEmailError(error);
      return;
    }
    setBillingEmails([...billingEmails, newEmail]);
    setNewEmail('');
    setNewEmailError('');
  };

  const handleRemoveEmail = (emailToRemove: string) => {
    setBillingEmails(billingEmails.filter((email) => email !== emailToRemove));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">{t('common.close')}</span>
        </button>
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold leading-none">{t('addReseller.title')}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleNext} className="flex flex-col gap-5">
          {currentStep === 1 ? (
            <>
              {/* Step 1: Reseller Name and Email */}
              {/* Reseller Name */}
              <div className="flex flex-col gap-3">
                <Label htmlFor="name" className="text-sm font-medium">
                  {t('addReseller.resellerName')}
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  onBlur={() => handleFieldBlur('name')}
                  className="h-9"
                  placeholder={t('addReseller.resellerNamePlaceholder')}
                  aria-invalid={!!formErrors.name}
                />
                {formErrors.name && (
                  <p className="text-sm text-destructive -mt-1">{formErrors.name}</p>
                )}
              </div>

              {/* Contact Person Email */}
              <div className="flex flex-col gap-3">
                <Label htmlFor="contactEmail" className="text-sm font-medium">
                  {t('addReseller.contactPersonEmail')}
                </Label>
                <Input
                  id="contactEmail"
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                  onBlur={() => handleFieldBlur('contactEmail')}
                  className="h-9"
                  placeholder={t('addReseller.emailPlaceholder')}
                  aria-invalid={!!formErrors.contactEmail}
                />
                {formErrors.contactEmail && (
                  <p className="text-sm text-destructive -mt-1">{formErrors.contactEmail}</p>
                )}
              </div>

              <DialogFooter className="flex items-center justify-between sm:justify-between">
                <Button type="button" variant="outline" className="h-9 px-4 text-sm" onClick={handleClose}>
                  {t('common.cancel')}
                </Button>
                <Button
                  type="submit"
                  className="h-9 px-4 text-sm"
                  disabled={!isFormValid()}
                >
                  {t('addReseller.next')}
                </Button>
              </DialogFooter>
            </>
          ) : currentStep === 2 ? (
            <>
              {/* Step 2: Service Selection */}
              <div className="flex flex-col gap-5">
                <p className="text-sm font-medium text-foreground">
                  {t('addReseller.selectServices')}
                </p>

                <div className="flex flex-col gap-3">
                  {['Skuber⁺ Management', 'Skuber⁺ Observability', 'Skuber⁺ Optimization'].map((service) => {
                    const isSelected = selectedServices.includes(service);
                    return (
                      <div
                        key={service}
                        className={`flex items-center gap-2 p-4 rounded-md ${
                          isSelected ? 'bg-primary/5 border border-primary' : ''
                        }`}
                      >
                        <Checkbox
                          id={service}
                          variant="box"
                          checked={isSelected}
                          onCheckedChange={() => handleServiceToggle(service)}
                        />
                        <label
                          htmlFor={service}
                          className="text-sm font-medium leading-none flex-1 cursor-pointer select-none"
                        >
                          {service}
                        </label>
                      </div>
                    );
                  })}
                </div>
              </div>

              <DialogFooter className="flex items-center justify-between sm:justify-between">
                <Button type="button" variant="outline" className="h-9 px-4 text-sm" onClick={handleClose}>
                  {t('common.cancel')}
                </Button>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" className="h-9 px-4 text-sm" onClick={handlePrev}>
                    {t('addReseller.prev')}
                  </Button>
                  <Button type="submit" className="h-9 px-4 text-sm">
                    {t('addReseller.next')}
                  </Button>
                </div>
              </DialogFooter>
            </>
          ) : (
            <>
              {/* Step 3: Billing Email and Note */}
              <div className="flex flex-col gap-5">
                {/* Billing Email Address Section */}
                <div className="flex flex-col gap-3">
                  <p className="text-sm font-medium leading-5 min-w-full w-min">{t('addReseller.billingEmailAddress')}</p>

                  {/* Existing emails list */}
                  {billingEmails.map((email, index) => (
                    <div key={index} className="bg-card border border-input flex gap-2 h-9 items-center px-3 py-1 rounded-md w-full">
                      <p className="basis-0 grow font-normal leading-5 text-sm text-foreground overflow-hidden text-ellipsis whitespace-nowrap min-h-px min-w-px">
                        {email}
                      </p>
                      <button
                        type="button"
                        onClick={() => handleRemoveEmail(email)}
                        className="flex items-center justify-center shrink-0 size-6 hover:bg-secondary rounded-sm transition-colors"
                      >
                        <X className="size-4" />
                      </button>
                    </div>
                  ))}

                  {/* Add new email input */}
                  <div className="flex flex-col gap-2">
                    <div className={`bg-card border flex gap-2 h-9 items-center px-3 py-1 rounded-md w-full ${newEmailError ? 'border-destructive' : 'border-input'}`}>
                      <input
                        type="email"
                        value={newEmail}
                        onChange={(e) => {
                          setNewEmail(e.target.value);
                          if (newEmailError) setNewEmailError('');
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddEmail();
                          }
                        }}
                        placeholder={t('addReseller.enterEmail')}
                        className="basis-0 grow bg-transparent border-0 font-normal leading-5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none min-h-px min-w-px overflow-hidden text-ellipsis whitespace-nowrap"
                      />
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={handleAddEmail}
                        className="h-6 px-2 py-0 text-sm shrink-0"
                      >
                        {t('addReseller.add')}
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground leading-5">{t('addReseller.pressEnter')}</p>
                    {newEmailError && (
                      <p className="text-sm text-destructive -mt-1">{newEmailError}</p>
                    )}
                  </div>
                </div>

                {/* Note */}
                <div className="flex flex-col gap-3">
                  <p className="text-sm font-medium leading-5 min-w-full w-min">{t('addReseller.note')}</p>
                  <div className="border border-input rounded-md bg-background flex flex-col">
                    <Textarea
                      value={note}
                      onChange={(e) => setNote(e.target.value.slice(0, 280))}
                      placeholder={t('addReseller.notePlaceholder')}
                      className="h-[120px] resize-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-3 text-sm overflow-auto shadow-none"
                    />
                    <div className="flex items-center justify-between px-3 pb-3 pt-1.5">
                      <p className="text-sm text-muted-foreground font-medium leading-5">
                        {t('addReseller.charactersCount', { count: note.length })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <DialogFooter className="flex items-center justify-between sm:justify-between">
                <Button type="button" variant="outline" className="h-9 px-4 text-sm" onClick={handleClose}>
                  {t('common.cancel')}
                </Button>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" className="h-9 px-4 text-sm" onClick={handlePrev}>
                    {t('addReseller.prev')}
                  </Button>
                  <Button type="submit" className="h-9 px-4 text-sm" disabled={billingEmails.length === 0}>
                    {t('addReseller.submit')}
                  </Button>
                </div>
              </DialogFooter>
            </>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}
