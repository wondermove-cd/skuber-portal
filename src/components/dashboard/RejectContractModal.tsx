import { useState } from 'react';
import { X } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';

interface ContractDetails {
  reseller: string;
  customer: string;
  contractId: string;
  service: string;
  pricingModel: string;
  contractPeriod: string;
  vcpuUnitPrice?: string;
  minimumCharge?: string;
  amount?: string;
  includedAllocation?: string;
  taxIncluded: string;
}

interface RejectContractModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contract: ContractDetails | null;
  onSubmit: (reason: string) => void;
}

export function RejectContractModal({
  open,
  onOpenChange,
  contract,
  onSubmit,
}: RejectContractModalProps) {
  const [reason, setReason] = useState('');
  const maxLength = 280;

  const handleSubmit = () => {
    if (reason.trim()) {
      onSubmit(reason);
      setReason('');
      onOpenChange(false);
    }
  };

  const handleCancel = () => {
    setReason('');
    onOpenChange(false);
  };

  if (!contract) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[448px] p-6 gap-4">
        {/* Close button */}
        <button
          onClick={handleCancel}
          className="absolute right-4 top-4 rounded-xs opacity-70 hover:opacity-100 transition-opacity"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Header */}
        <div className="flex flex-col gap-1.5">
          <h2 className="text-lg font-semibold leading-none text-foreground">
            Reject Contract
          </h2>
        </div>

        {/* Content */}
        <div className="flex flex-col gap-6 py-4">
          {/* Reseller and Customer */}
          <div className="flex items-center">
            <div className="flex flex-col flex-1 border-l-2 border-border pl-6">
              <p className="text-base leading-6 text-foreground">
                {contract.reseller} → {contract.customer}
              </p>
            </div>
          </div>

          {/* Contract Details */}
          <div className="flex flex-col gap-3.5">
            <div className="flex items-center justify-between text-sm leading-5">
              <p className="text-muted-foreground">Contract ID</p>
              <p className="text-card-foreground">{contract.contractId}</p>
            </div>
            <div className="flex items-center justify-between text-sm leading-5">
              <p className="text-muted-foreground">Service</p>
              <p className="text-card-foreground">{contract.service}</p>
            </div>
            <div className="flex items-center justify-between text-sm leading-5">
              <p className="text-muted-foreground">Pricing Model</p>
              <p className="text-card-foreground">{contract.pricingModel}</p>
            </div>
            <div className="flex items-center justify-between text-sm leading-5">
              <p className="text-muted-foreground">Contract Period</p>
              <p className="text-card-foreground">{contract.contractPeriod}</p>
            </div>
            {/* Pay-as-you-go specific fields */}
            {contract.vcpuUnitPrice && (
              <div className="flex items-center justify-between text-sm leading-5">
                <p className="text-muted-foreground">vCPU Unit Price</p>
                <p className="text-card-foreground">{contract.vcpuUnitPrice}</p>
              </div>
            )}
            {contract.minimumCharge && (
              <div className="flex items-center justify-between text-sm leading-5">
                <p className="text-muted-foreground">Minimum Charge</p>
                <p className="text-card-foreground">{contract.minimumCharge}</p>
              </div>
            )}
            {/* Fixed Rate specific fields */}
            {contract.amount && (
              <div className="flex items-center justify-between text-sm leading-5">
                <p className="text-muted-foreground">Amount to WM</p>
                <p className="text-card-foreground">{contract.amount}</p>
              </div>
            )}
            {contract.includedAllocation && (
              <div className="flex items-center justify-between text-sm leading-5">
                <p className="text-muted-foreground">Included Allocation</p>
                <p className="text-card-foreground">{contract.includedAllocation}</p>
              </div>
            )}
            <div className="flex items-center justify-between text-sm leading-5">
              <p className="text-muted-foreground">Tax Included</p>
              <p className="text-card-foreground">{contract.taxIncluded}</p>
            </div>
          </div>

          {/* Separator */}
          <Separator />

          {/* Rejection Reason */}
          <div className="flex flex-col gap-3">
            <label className="text-sm font-medium leading-5 text-foreground">
              Rejection Reason
            </label>
            <div className="relative">
              <Textarea
                value={reason}
                onChange={(e) => {
                  if (e.target.value.length <= maxLength) {
                    setReason(e.target.value);
                  }
                }}
                placeholder="Please enter notes regarding the contract"
                className="min-h-[120px] resize-none pb-10"
              />
              <div className="absolute bottom-3 left-3 text-sm font-medium text-muted-foreground">
                {reason.length}/{maxLength} characters
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="outline"
            onClick={handleCancel}
            className="h-9 px-4 py-2"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!reason.trim()}
            className="h-9 px-4 py-2"
          >
            Submit
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
