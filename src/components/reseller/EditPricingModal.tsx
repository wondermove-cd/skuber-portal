import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
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
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';

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

interface Reseller {
  id: string;
  name: string;
  pricing?: Record<string, PricingData>;
  [key: string]: any;
}

interface EditPricingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reseller: Reseller;
  serviceName: string;
  onSave: (serviceName: string, pricingData: PricingData) => void;
}

const emptyPricingData: PricingData = {
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
};

export function EditPricingModal({
  open,
  onOpenChange,
  reseller,
  serviceName,
  onSave,
}: EditPricingModalProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState<PricingData>(emptyPricingData);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize form data when modal opens or service changes
  useEffect(() => {
    if (open && reseller.pricing && reseller.pricing[serviceName]) {
      setFormData(reseller.pricing[serviceName]);
    } else if (open) {
      setFormData(emptyPricingData);
    }
  }, [open, reseller, serviceName]);

  const validateNumber = (value: string, fieldName: string): boolean => {
    if (!value || value.trim() === '') {
      return true; // Optional fields
    }
    const num = parseFloat(value);
    if (isNaN(num) || num < 0) {
      setErrors((prev) => ({ ...prev, [fieldName]: 'Must be a valid positive number' }));
      return false;
    }
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[fieldName];
      return newErrors;
    });
    return true;
  };

  const handleInputChange = (field: string, value: string) => {
    const keys = field.split('.');
    setFormData((prev) => {
      const newData = { ...prev };
      let current: any = newData;
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;
      return newData;
    });
    validateNumber(value, field);
  };

  const handleSave = () => {
    // Validate all fields
    const fieldsToValidate = [
      { path: 'payAsYouGo.vcpuUnitPrice', value: formData.payAsYouGo.vcpuUnitPrice },
      { path: 'payAsYouGo.minimumCharge', value: formData.payAsYouGo.minimumCharge },
      { path: 'fixedRate.oneYear.contractAmount', value: formData.fixedRate.oneYear.contractAmount },
      { path: 'fixedRate.oneYear.includedAllocation', value: formData.fixedRate.oneYear.includedAllocation },
      { path: 'fixedRate.threeYear.contractAmount', value: formData.fixedRate.threeYear.contractAmount },
      { path: 'fixedRate.threeYear.includedAllocation', value: formData.fixedRate.threeYear.includedAllocation },
      { path: 'fixedRate.fiveYear.contractAmount', value: formData.fixedRate.fiveYear.contractAmount },
      { path: 'fixedRate.fiveYear.includedAllocation', value: formData.fixedRate.fiveYear.includedAllocation },
    ];

    let hasError = false;
    fieldsToValidate.forEach((field) => {
      if (!validateNumber(field.value, field.path)) {
        hasError = true;
      }
    });

    if (hasError) {
      toast({
        title: 'Validation Error',
        description: 'Please fix the errors before saving',
        variant: 'destructive',
      });
      return;
    }

    onSave(serviceName, formData);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold leading-none">Edit Pricing</DialogTitle>
        </DialogHeader>

        <button
          onClick={() => onOpenChange(false)}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>

        <div className="flex flex-col gap-5">
          {/* Pay-as-you-go Section */}
          <div className="flex flex-col gap-5">
            <div className="flex items-center border-l-2 border-border pl-6">
              <p className="text-base font-normal flex-1">{serviceName}</p>
              <Badge variant="default" className="text-xs font-semibold shrink-0">Pay-as-you-go</Badge>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex gap-3 items-center">
                <Label className="text-sm font-medium flex-1">vCPU Unit Price</Label>
                <div className="flex-1 relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground">$</span>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.payAsYouGo.vcpuUnitPrice}
                    onChange={(e) => handleInputChange('payAsYouGo.vcpuUnitPrice', e.target.value)}
                    className={`h-9 pl-7 pr-16 ${errors['payAsYouGo.vcpuUnitPrice'] ? 'border-destructive' : ''}`}
                    placeholder="Enter amount"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground">/hour</span>
                </div>
              </div>
              {errors['payAsYouGo.vcpuUnitPrice'] && (
                <p className="text-xs text-destructive">{errors['payAsYouGo.vcpuUnitPrice']}</p>
              )}

              <div className="flex gap-3 items-center">
                <Label className="text-sm font-medium flex-1">Minimum Charge</Label>
                <div className="flex-1 relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground">$</span>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.payAsYouGo.minimumCharge}
                    onChange={(e) => handleInputChange('payAsYouGo.minimumCharge', e.target.value)}
                    className={`h-9 pl-7 pr-20 ${errors['payAsYouGo.minimumCharge'] ? 'border-destructive' : ''}`}
                    placeholder="Enter amou..."
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground">/Month</span>
                </div>
              </div>
              {errors['payAsYouGo.minimumCharge'] && (
                <p className="text-xs text-destructive">{errors['payAsYouGo.minimumCharge']}</p>
              )}
            </div>
          </div>

          <Separator />

          {/* Fixed Rate Section */}
          <div className="flex flex-col gap-5">
            <div className="flex items-center border-l-2 border-border pl-6">
              <p className="text-base font-normal flex-1">{serviceName}</p>
              <Badge variant="default" className="text-xs font-semibold shrink-0">Fixed Rate</Badge>
            </div>

            <div className="flex flex-col gap-2">
              {/* 1 Year */}
              <Label className="text-sm font-medium">1 Year</Label>

              <div className="flex gap-3 items-center">
                <Label className="text-sm font-medium flex-1 pl-4">Contract Amount</Label>
                <div className="flex-1 relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground">$</span>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.fixedRate.oneYear.contractAmount}
                    onChange={(e) => handleInputChange('fixedRate.oneYear.contractAmount', e.target.value)}
                    className={`h-9 pl-7 pr-20 ${errors['fixedRate.oneYear.contractAmount'] ? 'border-destructive' : ''}`}
                    placeholder="Enter amount"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground">/1 year</span>
                </div>
              </div>
              {errors['fixedRate.oneYear.contractAmount'] && (
                <p className="text-xs text-destructive">{errors['fixedRate.oneYear.contractAmount']}</p>
              )}

              <div className="flex gap-3 items-center">
                <Label className="text-sm font-medium flex-1 pl-4">Included Allocation</Label>
                <div className="flex-1 relative">
                  <Input
                    type="number"
                    step="1"
                    value={formData.fixedRate.oneYear.includedAllocation}
                    onChange={(e) => handleInputChange('fixedRate.oneYear.includedAllocation', e.target.value)}
                    className={`h-9 pr-14 ${errors['fixedRate.oneYear.includedAllocation'] ? 'border-destructive' : ''}`}
                    placeholder="Enter amount"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground">vCPU</span>
                </div>
              </div>
              {errors['fixedRate.oneYear.includedAllocation'] && (
                <p className="text-xs text-destructive">{errors['fixedRate.oneYear.includedAllocation']}</p>
              )}

              {/* 3 Year */}
              <Label className="text-sm font-medium mt-2">3 Year</Label>

              <div className="flex gap-3 items-center">
                <Label className="text-sm font-medium flex-1 pl-4">Contract Amount</Label>
                <div className="flex-1 relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground">$</span>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.fixedRate.threeYear.contractAmount}
                    onChange={(e) => handleInputChange('fixedRate.threeYear.contractAmount', e.target.value)}
                    className={`h-9 pl-7 pr-20 ${errors['fixedRate.threeYear.contractAmount'] ? 'border-destructive' : ''}`}
                    placeholder="Enter amo..."
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground">/3 years</span>
                </div>
              </div>
              {errors['fixedRate.threeYear.contractAmount'] && (
                <p className="text-xs text-destructive">{errors['fixedRate.threeYear.contractAmount']}</p>
              )}

              <div className="flex gap-3 items-center">
                <Label className="text-sm font-medium flex-1 pl-4">Included Allocation</Label>
                <div className="flex-1 relative">
                  <Input
                    type="number"
                    step="1"
                    value={formData.fixedRate.threeYear.includedAllocation}
                    onChange={(e) => handleInputChange('fixedRate.threeYear.includedAllocation', e.target.value)}
                    className={`h-9 pr-14 ${errors['fixedRate.threeYear.includedAllocation'] ? 'border-destructive' : ''}`}
                    placeholder="Enter amount"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground">vCPU</span>
                </div>
              </div>
              {errors['fixedRate.threeYear.includedAllocation'] && (
                <p className="text-xs text-destructive">{errors['fixedRate.threeYear.includedAllocation']}</p>
              )}

              {/* 5 Year */}
              <Label className="text-sm font-medium mt-2">5 Year</Label>

              <div className="flex gap-3 items-center">
                <Label className="text-sm font-medium flex-1 pl-4">Contract Amount</Label>
                <div className="flex-1 relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground">$</span>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.fixedRate.fiveYear.contractAmount}
                    onChange={(e) => handleInputChange('fixedRate.fiveYear.contractAmount', e.target.value)}
                    className={`h-9 pl-7 pr-20 ${errors['fixedRate.fiveYear.contractAmount'] ? 'border-destructive' : ''}`}
                    placeholder="Enter amo..."
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground">/5 years</span>
                </div>
              </div>
              {errors['fixedRate.fiveYear.contractAmount'] && (
                <p className="text-xs text-destructive">{errors['fixedRate.fiveYear.contractAmount']}</p>
              )}

              <div className="flex gap-3 items-center">
                <Label className="text-sm font-medium flex-1 pl-4">Included Allocation</Label>
                <div className="flex-1 relative">
                  <Input
                    type="number"
                    step="1"
                    value={formData.fixedRate.fiveYear.includedAllocation}
                    onChange={(e) => handleInputChange('fixedRate.fiveYear.includedAllocation', e.target.value)}
                    className={`h-9 pr-14 ${errors['fixedRate.fiveYear.includedAllocation'] ? 'border-destructive' : ''}`}
                    placeholder="Enter amount"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground">vCPU</span>
                </div>
              </div>
              {errors['fixedRate.fiveYear.includedAllocation'] && (
                <p className="text-xs text-destructive">{errors['fixedRate.fiveYear.includedAllocation']}</p>
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="flex items-center justify-between sm:justify-between">
          <Button type="button" variant="outline" className="h-9 px-4 text-sm" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" className="h-9 px-4 text-sm" onClick={handleSave}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
