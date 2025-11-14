import { X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface PaymentFilterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedStatus: string;
  onStatusChange: (status: string) => void;
  selectedPeriodFrom: string;
  onPeriodFromChange: (date: string) => void;
  selectedPeriodTo: string;
  onPeriodToChange: (date: string) => void;
  onReset: () => void;
  onApply: () => void;
}

export function PaymentFilterDialog({
  open,
  onOpenChange,
  selectedStatus,
  onStatusChange,
  selectedPeriodFrom,
  onPeriodFromChange,
  selectedPeriodTo,
  onPeriodToChange,
  onReset,
  onApply,
}: PaymentFilterDialogProps) {
  const handleClose = () => {
    onOpenChange(false);
  };

  const handleReset = () => {
    onReset();
    onOpenChange(false);
  };

  const handleApply = () => {
    onApply();
    onOpenChange(false);
  };

  // Validate period range - check if From > To
  const isPeriodInvalid = selectedPeriodFrom && selectedPeriodTo && selectedPeriodFrom > selectedPeriodTo;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md gap-6" showCloseButton={false}>
        <DialogHeader className="gap-1.5">
          <DialogTitle className="text-lg font-semibold leading-none">Filter</DialogTitle>
        </DialogHeader>

        <button
          onClick={handleClose}
          className="absolute right-4 top-4 rounded-xs opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>

        <div className="flex flex-col gap-4">
          {/* Period Filter - Date Range */}
          <div className="flex flex-col gap-3">
            <p className="text-sm font-medium leading-5">Period</p>
            <div className="flex gap-3 items-center">
              <Select value={selectedPeriodFrom || undefined} onValueChange={(value) => onPeriodFromChange(value)}>
                <SelectTrigger className={`h-9 flex-1 ${isPeriodInvalid ? 'border-destructive' : ''}`}>
                  <SelectValue placeholder="YYYY. MM" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__CLEAR__">ALL</SelectItem>
                  <SelectItem value="2025. 10">2025. 10</SelectItem>
                  <SelectItem value="2025. 09">2025. 09</SelectItem>
                  <SelectItem value="2025. 08">2025. 08</SelectItem>
                  <SelectItem value="2025. 07">2025. 07</SelectItem>
                  <SelectItem value="2025. 06">2025. 06</SelectItem>
                  <SelectItem value="2025. 05">2025. 05</SelectItem>
                  <SelectItem value="2025. 04">2025. 04</SelectItem>
                  <SelectItem value="2025. 03">2025. 03</SelectItem>
                  <SelectItem value="2025. 02">2025. 02</SelectItem>
                  <SelectItem value="2025. 01">2025. 01</SelectItem>
                  <SelectItem value="2024. 12">2024. 12</SelectItem>
                  <SelectItem value="2024. 11">2024. 11</SelectItem>
                  <SelectItem value="2024. 10">2024. 10</SelectItem>
                  <SelectItem value="2024. 09">2024. 09</SelectItem>
                  <SelectItem value="2024. 08">2024. 08</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-sm font-medium text-foreground">-</span>
              <Select value={selectedPeriodTo || undefined} onValueChange={(value) => onPeriodToChange(value)}>
                <SelectTrigger className={`h-9 flex-1 ${isPeriodInvalid ? 'border-destructive' : ''}`}>
                  <SelectValue placeholder="YYYY. MM" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__CLEAR__">ALL</SelectItem>
                  <SelectItem value="2025. 10">2025. 10</SelectItem>
                  <SelectItem value="2025. 09">2025. 09</SelectItem>
                  <SelectItem value="2025. 08">2025. 08</SelectItem>
                  <SelectItem value="2025. 07">2025. 07</SelectItem>
                  <SelectItem value="2025. 06">2025. 06</SelectItem>
                  <SelectItem value="2025. 05">2025. 05</SelectItem>
                  <SelectItem value="2025. 04">2025. 04</SelectItem>
                  <SelectItem value="2025. 03">2025. 03</SelectItem>
                  <SelectItem value="2025. 02">2025. 02</SelectItem>
                  <SelectItem value="2025. 01">2025. 01</SelectItem>
                  <SelectItem value="2024. 12">2024. 12</SelectItem>
                  <SelectItem value="2024. 11">2024. 11</SelectItem>
                  <SelectItem value="2024. 10">2024. 10</SelectItem>
                  <SelectItem value="2024. 09">2024. 09</SelectItem>
                  <SelectItem value="2024. 08">2024. 08</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {isPeriodInvalid && (
              <p className="text-sm text-destructive leading-5">
                From date must be earlier than or equal to To date
              </p>
            )}
          </div>

          {/* Status Filter - Dropdown */}
          <div className="flex flex-col gap-3">
            <p className="text-sm font-medium leading-5">Status</p>
            <Select value={selectedStatus} onValueChange={onStatusChange}>
              <SelectTrigger className="h-9 w-full">
                <SelectValue placeholder="ALL" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">ALL</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="partial">Partial</SelectItem>
                <SelectItem value="unpaid">Unpaid</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter className="flex items-center justify-between sm:justify-between">
          <Button variant="outline" className="h-9 px-4 text-sm" onClick={handleReset}>
            Reset
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" className="h-9 px-4 text-sm" onClick={handleClose}>
              Cancel
            </Button>
            <Button className="h-9 px-4 text-sm" onClick={handleApply} disabled={isPeriodInvalid}>
              Apply
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
