import { useState } from 'react';
import { Search, X, ChevronRight } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

// Mock customers data - will be replaced with actual data
interface Customer {
  id: string;
  companyName: string;
}

const mockCustomers: Customer[] = [
  { id: '1', companyName: 'Leadingpoint' },
  { id: '2', companyName: 'Leadingpoint' },
  { id: '3', companyName: 'Leadingpoint' },
  { id: '4', companyName: 'Leadingpoint' },
  { id: '5', companyName: 'Leadingpoint' },
  { id: '6', companyName: 'Leadingpoint' },
  { id: '7', companyName: 'Leadingpoint' },
  { id: '8', companyName: 'Leadingpoint' },
  { id: '9', companyName: 'Leadingpoint' },
  { id: '10', companyName: 'Leadingpoint' },
];

interface AddContractModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddContractModal({ open, onOpenChange }: AddContractModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');

  // Filter customers based on search query
  const filteredCustomers = mockCustomers.filter((customer) =>
    customer.companyName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleNext = () => {
    if (!selectedCustomerId) return;
    // TODO: Move to step 2
    console.log('Selected customer:', selectedCustomerId);
  };

  const handleCancel = () => {
    setSearchQuery('');
    setSelectedCustomerId('');
    onOpenChange(false);
  };

  const handleAddCustomer = () => {
    // TODO: Open Add Customer modal
    console.log('Open Add Customer modal');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg gap-4 p-6" showCloseButton={false}>
        {/* Header */}
        <DialogHeader className="gap-1.5">
          <DialogTitle className="text-lg font-semibold leading-none">
            Add Contract
          </DialogTitle>
          <p className="text-sm text-muted-foreground leading-5">
            Please select a customer
          </p>
        </DialogHeader>

        {/* Close button */}
        <button
          onClick={handleCancel}
          className="absolute right-4 top-4 rounded-xs opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>

        {/* Content wrapper */}
        <div className="flex flex-col gap-6">
          {/* Search */}
          <div className="flex items-center w-full">
            <Input
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 rounded-r-none border-r-0 h-9 focus-visible:ring-0 focus-visible:ring-offset-0"
            />
            <button
              type="button"
              className="flex items-center justify-center h-9 w-9 border border-input bg-card rounded-r-md hover:bg-accent transition-colors"
            >
              <Search className="h-4 w-4" />
            </button>
          </div>

          {/* Customer List */}
          <div className="border border-border rounded-md h-[288px] overflow-y-auto">
            <RadioGroup
              value={selectedCustomerId}
              onValueChange={setSelectedCustomerId}
              className="p-4"
            >
              {filteredCustomers.map((customer, index) => (
                <div key={customer.id}>
                  <div className="flex items-center gap-3 py-0">
                    <RadioGroupItem value={customer.id} id={customer.id} />
                    <Label
                      htmlFor={customer.id}
                      className="flex-1 cursor-pointer font-medium text-sm leading-none py-1"
                    >
                      {customer.companyName}
                    </Label>
                  </div>
                  {index < filteredCustomers.length - 1 && (
                    <Separator className="my-4" />
                  )}
                </div>
              ))}
            </RadioGroup>

            {/* Empty state */}
            {filteredCustomers.length === 0 && (
              <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
                No customers found
              </div>
            )}
          </div>

          {/* Add Customer Card */}
          <div className="border border-border rounded-md p-4 flex items-start gap-4">
            <div className="flex-1">
              <p className="font-medium text-sm leading-4">
                Can't find the customer?
              </p>
              <p className="text-sm text-muted-foreground leading-5 mt-1">
                Please add the customer before adding a contract
              </p>
            </div>
            <Button
              variant="outline"
              className="h-9 px-4 text-sm gap-2 shrink-0"
              onClick={handleAddCustomer}
            >
              Add Customer
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2">
          <Button variant="outline" className="h-9 px-4 text-sm" onClick={handleCancel}>
            Cancel
          </Button>
          <Button
            className="h-9 px-4 text-sm"
            onClick={handleNext}
            disabled={!selectedCustomerId}
          >
            Next
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
