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
import { Checkbox } from '@/components/ui/checkbox';
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

interface AddServiceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  existingServices: string[];
  onSave: (serviceName: string, pricingData: PricingData) => void;
}

const AVAILABLE_SERVICES = [
  'Skuber⁺ Management',
  'Skuber⁺ Observability',
  'Skuber⁺ Optimization',
];

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

export function AddServiceModal({
  open,
  onOpenChange,
  existingServices,
  onSave,
}: AddServiceModalProps) {
  const { toast } = useToast();
  const [step, setStep] = useState<'select' | 'pricing'>('select');
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [currentServiceIndex, setCurrentServiceIndex] = useState(0);
  const [servicePricingData, setServicePricingData] = useState<Record<string, PricingData>>({});
  const [formData, setFormData] = useState<PricingData>(emptyPricingData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [applyToAll, setApplyToAll] = useState(false);

  // Get available services (not already added)
  const availableServices = AVAILABLE_SERVICES.filter(
    service => !existingServices.includes(service)
  );

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      setStep('select');
      setSelectedServices([]);
      setCurrentServiceIndex(0);
      setServicePricingData({});
      setFormData(emptyPricingData);
      setErrors({});
      setApplyToAll(false);
    }
  }, [open]);

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

  const handleNext = () => {
    // Validate service selection
    if (selectedServices.length === 0) {
      toast({
        title: 'Validation Error',
        description: 'Please select at least one service',
        variant: 'destructive',
      });
      return;
    }

    // Move to pricing step
    setStep('pricing');
    setCurrentServiceIndex(0);
    setFormData(emptyPricingData);
  };

  const handlePricingNext = () => {
    // Validate all pricing fields
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
        description: 'Please fix the errors before continuing',
        variant: 'destructive',
      });
      return;
    }

    // If "Apply to all" is checked or only one service selected, apply to all services
    if (applyToAll || selectedServices.length === 1) {
      // Apply current pricing to all selected services
      selectedServices.forEach(serviceName => {
        onSave(serviceName, formData);
      });
      onOpenChange(false);
    } else {
      // Save current service pricing
      const currentService = selectedServices[currentServiceIndex];
      const updatedPricingData = {
        ...servicePricingData,
        [currentService]: formData,
      };
      setServicePricingData(updatedPricingData);

      // Check if this is the last service
      if (currentServiceIndex < selectedServices.length - 1) {
        // Move to next service
        setCurrentServiceIndex(prev => prev + 1);
        // Load existing data for next service if available, otherwise start with empty form
        const nextService = selectedServices[currentServiceIndex + 1];
        setFormData(updatedPricingData[nextService] || {
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
        setErrors({});
      } else {
        // All services done, save all
        Object.entries(updatedPricingData).forEach(([serviceName, pricingData]) => {
          onSave(serviceName, pricingData);
        });
        onOpenChange(false);
      }
    }
  };

  const handleBack = () => {
    if (step === 'pricing' && currentServiceIndex > 0) {
      // Save current service data before going back
      const currentService = selectedServices[currentServiceIndex];
      const updatedPricingData = {
        ...servicePricingData,
        [currentService]: formData,
      };
      setServicePricingData(updatedPricingData);

      // Go to previous service
      const prevIndex = currentServiceIndex - 1;
      setCurrentServiceIndex(prevIndex);
      const prevService = selectedServices[prevIndex];
      setFormData(updatedPricingData[prevService] || {
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
      setErrors({});
    } else if (step === 'pricing' && currentServiceIndex === 0) {
      // Save current service data before going back to selection
      const currentService = selectedServices[currentServiceIndex];
      const updatedPricingData = {
        ...servicePricingData,
        [currentService]: formData,
      };
      setServicePricingData(updatedPricingData);

      // Go back to service selection
      setStep('select');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold leading-none">Add Service</DialogTitle>
        </DialogHeader>

        <button
          onClick={() => onOpenChange(false)}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>

        {step === 'select' ? (
          // Step 1: Service Selection
          <div className="flex flex-col gap-5">
            <p className="text-sm font-medium text-foreground">
              Which services are you planning to add to this reseller?
            </p>

            {availableServices.length === 0 ? (
              <p className="text-sm text-muted-foreground">All services have already been added to this reseller.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {availableServices.map((service) => {
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
                        onCheckedChange={() => {
                          setSelectedServices(prev =>
                            prev.includes(service)
                              ? prev.filter(s => s !== service)
                              : [...prev, service]
                          );
                        }}
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
            )}
          </div>
        ) : (
          // Step 2: Pricing Input
          <div className="flex flex-col gap-5">
            {/* Service progress indicator */}
            {selectedServices.length > 1 && (
              <div className="text-sm text-muted-foreground">
                Service {currentServiceIndex + 1} of {selectedServices.length}
              </div>
            )}

            {/* Pay-as-you-go Section */}
            <div className="flex flex-col gap-5">
              <div className="flex items-center border-l-2 border-border pl-6">
                <p className="text-base font-normal flex-1">{selectedServices[currentServiceIndex]}</p>
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
                      placeholder="Enter amount"
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
                <p className="text-base font-normal flex-1">{selectedServices[currentServiceIndex]}</p>
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
                      placeholder="Enter amount"
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
                      placeholder="Enter amount"
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

            {/* Apply to all checkbox - only show on first service if multiple services */}
            {currentServiceIndex === 0 && selectedServices.length > 1 && (
              <div className="flex items-center gap-2 p-3 rounded-md bg-muted/50 mt-4">
                <Checkbox
                  id="apply-to-all"
                  variant="box"
                  checked={applyToAll}
                  onCheckedChange={(checked) => setApplyToAll(!!checked)}
                />
                <label
                  htmlFor="apply-to-all"
                  className="text-sm font-medium leading-none cursor-pointer select-none"
                >
                  Apply to all remaining services
                </label>
              </div>
            )}
          </div>
        )}

        <DialogFooter className="flex items-center justify-between sm:justify-between">
          {step === 'select' ? (
            <>
              <Button type="button" variant="outline" className="h-9 px-4 text-sm" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button
                type="button"
                className="h-9 px-4 text-sm"
                onClick={handleNext}
                disabled={selectedServices.length === 0 || availableServices.length === 0}
              >
                Next
              </Button>
            </>
          ) : (
            <>
              <Button type="button" variant="outline" className="h-9 px-4 text-sm" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <div className="flex gap-2">
                <Button type="button" variant="outline" className="h-9 px-4 text-sm" onClick={handleBack}>
                  Prev
                </Button>
                <Button
                  type="button"
                  className="h-9 px-4 text-sm"
                  onClick={handlePricingNext}
                  disabled={
                    !formData.payAsYouGo.vcpuUnitPrice &&
                    !formData.payAsYouGo.minimumCharge &&
                    !formData.fixedRate.oneYear.contractAmount &&
                    !formData.fixedRate.oneYear.includedAllocation &&
                    !formData.fixedRate.threeYear.contractAmount &&
                    !formData.fixedRate.threeYear.includedAllocation &&
                    !formData.fixedRate.fiveYear.contractAmount &&
                    !formData.fixedRate.fiveYear.includedAllocation
                  }
                >
                  {currentServiceIndex === selectedServices.length - 1 ? 'Add Service' : 'Next'}
                </Button>
              </div>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
