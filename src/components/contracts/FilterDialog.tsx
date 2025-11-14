import { useState } from 'react';
import { X, Check, ChevronsUpDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { cn } from '@/lib/utils';

interface FilterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedServices: string[];
  onServicesChange: (services: string[]) => void;
  selectedPricingModel: string;
  onPricingModelChange: (model: string) => void;
  selectedStatus: string;
  onStatusChange: (status: string) => void;
  selectedReseller: string;
  onResellerChange: (reseller: string) => void;
  showResellerFilter: boolean;
  selectedApprovalStatus?: string;
  onApprovalStatusChange?: (status: string) => void;
  showApprovalStatusFilter?: boolean;
  onReset: () => void;
  onApply: () => void;
}

const resellers = [
  { value: 'all', label: 'ALL' },
  { value: 'N/A', label: 'N/A' },
  { value: 'Megazone', label: 'Megazone' },
  { value: 'Bespin Global', label: 'Bespin Global' },
  { value: 'Samsung SDS', label: 'Samsung SDS' },
  { value: 'LG CNS', label: 'LG CNS' },
  { value: 'SK C&C', label: 'SK C&C' },
  { value: 'Kakao Enterprise', label: 'Kakao Enterprise' },
  { value: 'Naver Cloud', label: 'Naver Cloud' },
  { value: 'KT Cloud', label: 'KT Cloud' },
  { value: 'NHN Cloud', label: 'NHN Cloud' },
  { value: 'Gabia', label: 'Gabia' },
  { value: 'Hostway', label: 'Hostway' },
  { value: 'aaa', label: 'aaa' },
  { value: 'vdfghj', label: 'vdfghj' },
  { value: 'Cafe24', label: 'Cafe24' },
  { value: 'Douzone', label: 'Douzone' },
  { value: 'Samsungfire', label: 'Samsungfire' },
  { value: 'Hyundai AutoEver', label: 'Hyundai AutoEver' },
  { value: 'Posco ICT', label: 'Posco ICT' },
];

export function FilterDialog({
  open,
  onOpenChange,
  selectedServices,
  onServicesChange,
  selectedPricingModel,
  onPricingModelChange,
  selectedStatus,
  onStatusChange,
  selectedReseller,
  onResellerChange,
  showResellerFilter,
  selectedApprovalStatus,
  onApprovalStatusChange,
  showApprovalStatusFilter,
  onReset,
  onApply,
}: FilterDialogProps) {
  const { t } = useTranslation();
  const [resellerOpen, setResellerOpen] = useState(false);

  const handleServiceToggle = (service: string) => {
    if (selectedServices.includes(service)) {
      onServicesChange(selectedServices.filter((s) => s !== service));
    } else {
      onServicesChange([...selectedServices, service]);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
  };

  const handleReset = () => {
    // Call the parent's reset handler (which resets both selected and applied filters)
    onReset();

    // Close the dialog
    onOpenChange(false);
  };

  const handleApply = () => {
    onApply();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md gap-6" showCloseButton={false}>
        <DialogHeader className="gap-1.5">
          <DialogTitle className="text-lg font-semibold leading-none">{t('common.filter')}</DialogTitle>
        </DialogHeader>

        <button
          onClick={handleClose}
          className="absolute right-4 top-4 rounded-xs opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">{t('common.close')}</span>
        </button>

        <div className="flex flex-col gap-4">
          {/* Reseller Filter - WM users only */}
          {showResellerFilter && (
            <div className="flex flex-col gap-3">
              <p className="text-sm font-medium leading-5">{t('contracts.reseller')}</p>
              <Popover open={resellerOpen} onOpenChange={setResellerOpen} modal={true}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={resellerOpen}
                    className="h-9 w-full justify-between font-normal"
                  >
                    {selectedReseller
                      ? resellers.find((reseller) => reseller.value === selectedReseller)?.label
                      : t('common.all')}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="p-0 z-[60]"
                  align="start"
                  sideOffset={4}
                  style={{ width: 'var(--radix-popover-trigger-width)' }}
                >
                  <Command>
                    <CommandInput placeholder={t('contracts.searchReseller')} />
                    <CommandList className="max-h-[200px]">
                      <CommandEmpty>{t('contracts.noResellerFound')}</CommandEmpty>
                      <CommandGroup>
                        {resellers.map((reseller) => (
                          <CommandItem
                            key={reseller.value}
                            value={reseller.value}
                            onSelect={(currentValue) => {
                              onResellerChange(currentValue === selectedReseller ? 'all' : currentValue);
                              setResellerOpen(false);
                            }}
                          >
                            <Check
                              className={cn(
                                'mr-2 h-4 w-4',
                                selectedReseller === reseller.value ? 'opacity-100' : 'opacity-0'
                              )}
                            />
                            {reseller.label}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
          )}

          {/* Service Filter - Checkboxes */}
          <div className="flex flex-col gap-3">
            <p className="text-sm font-medium leading-5">{t('contracts.service')}</p>
            <div className="flex flex-col gap-1 p-1">
              {['Observability', 'Management', 'Optimization'].map((service) => {
                const isSelected = selectedServices.includes(service);
                return (
                  <div
                    key={service}
                    className={`flex items-center gap-2 px-2 py-1.5 rounded-sm ${
                      isSelected ? 'bg-accent' : ''
                    }`}
                  >
                    <Checkbox
                      id={service}
                      checked={isSelected}
                      onCheckedChange={() => handleServiceToggle(service)}
                    />
                    <label
                      htmlFor={service}
                      className="text-sm leading-5 flex-1 cursor-pointer select-none"
                    >
                      {service}
                    </label>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Pricing Model Filter - Dropdown */}
          <div className="flex flex-col gap-3">
            <p className="text-sm font-medium leading-5">{t('contracts.pricingModel')}</p>
            <Select value={selectedPricingModel} onValueChange={onPricingModelChange}>
              <SelectTrigger className="h-9 w-full">
                <SelectValue placeholder={t('common.all')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('common.all')}</SelectItem>
                <SelectItem value="Fixed Rate">{t('pricing.fixedRate')}</SelectItem>
                <SelectItem value="Pay-as-you-go">{t('pricing.payAsYouGo')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Status Filter - Dropdown */}
          <div className="flex flex-col gap-3">
            <p className="text-sm font-medium leading-5">{t('common.status')}</p>
            <Select value={selectedStatus} onValueChange={onStatusChange}>
              <SelectTrigger className="h-9 w-full">
                <SelectValue placeholder={t('common.all')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('common.all')}</SelectItem>
                <SelectItem value="active">{t('status.active')}</SelectItem>
                <SelectItem value="inactive">{t('status.inactive')}</SelectItem>
                <SelectItem value="expired">{t('status.expired')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Approval Status Filter - Resellers only */}
          {showApprovalStatusFilter && selectedApprovalStatus !== undefined && onApprovalStatusChange && (
            <div className="flex flex-col gap-3">
              <p className="text-sm font-medium leading-5">{t('contracts.approvalStatus')}</p>
              <Select value={selectedApprovalStatus} onValueChange={onApprovalStatusChange}>
                <SelectTrigger className="h-9 w-full">
                  <SelectValue placeholder={t('common.all')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('common.all')}</SelectItem>
                  <SelectItem value="pending">{t('contracts.pending')}</SelectItem>
                  <SelectItem value="approved">{t('contracts.approved')}</SelectItem>
                  <SelectItem value="rejected">{t('contracts.rejected')}</SelectItem>
                  <SelectItem value="cancelled">{t('contracts.canceled')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <DialogFooter className="flex items-center justify-between sm:justify-between">
          <Button variant="outline" className="h-9 px-4 text-sm" onClick={handleReset}>
            {t('common.reset')}
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" className="h-9 px-4 text-sm" onClick={handleClose}>
              {t('common.cancel')}
            </Button>
            <Button className="h-9 px-4 text-sm" onClick={handleApply}>
              {t('common.apply')}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
