import { useState } from 'react';
import { Check, X, ChevronLeft as ChevronLeftIcon, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface PendingContract {
  id: string;
  reseller: string;
  customer: string;
  service: string;
  model: string;
  minimumCharge: string;
  contractAmount: string;
  vcpuUnitPrice: string;
  includedAllocation: string;
  submitted: string;
}

interface ContractPendingApprovalListProps {
  contracts: PendingContract[];
  onApprove?: (contractId: string) => void;
  onReject?: (contractId: string) => void;
}

export function ContractPendingApprovalList({
  contracts,
  onApprove,
  onReject
}: ContractPendingApprovalListProps) {
  const { t } = useTranslation();
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5;

  const handleApprove = (contractId: string) => {
    if (onApprove) {
      onApprove(contractId);
    }
  };

  const handleReject = (contractId: string) => {
    if (onReject) {
      onReject(contractId);
    }
  };

  // Pagination
  const totalPages = Math.ceil(contracts.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const currentContracts = contracts.slice(startIndex, endIndex);

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-xl font-semibold leading-none text-foreground h-8 flex items-center">
          Contract Pending Approval
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 px-6">
        <div className="w-full overflow-x-auto">
          <div className="w-full">
            {/* Table Header */}
            <div className="flex w-full">
              <div className="flex-1 min-w-[100px] border-b border-border h-10 px-2 flex items-center">
                <p className="text-sm font-medium leading-5 text-muted-foreground">Reseller</p>
              </div>
              <div className="flex-1 min-w-[100px] border-b border-border h-10 px-2 flex items-center">
                <p className="text-sm font-medium leading-5 text-muted-foreground">Customer</p>
              </div>
              <div className="flex-1 min-w-[130px] border-b border-border h-10 px-2 flex items-center">
                <p className="text-sm font-medium leading-5 text-muted-foreground">Service</p>
              </div>
              <div className="flex-1 min-w-[170px] border-b border-border h-10 px-2 flex items-center">
                <p className="text-sm font-medium leading-5 text-muted-foreground">Model</p>
              </div>
              <div className="flex-1 min-w-[140px] border-b border-border h-10 px-2 flex items-center">
                <p className="text-sm font-medium leading-5 text-muted-foreground">Minimum Charge</p>
              </div>
              <div className="flex-1 min-w-[140px] border-b border-border h-10 px-2 flex items-center">
                <p className="text-sm font-medium leading-5 text-muted-foreground">Contract Amount</p>
              </div>
              <div className="flex-1 min-w-[140px] border-b border-border h-10 px-2 flex items-center">
                <p className="text-sm font-medium leading-5 text-muted-foreground">vCPU Unit Price</p>
              </div>
              <div className="flex-1 min-w-[150px] border-b border-border h-10 px-2 flex items-center">
                <p className="text-sm font-medium leading-5 text-muted-foreground">Included Allocation</p>
              </div>
              <div className="flex-1 min-w-[110px] border-b border-border h-10 px-2 flex items-center">
                <p className="text-sm font-medium leading-5 text-muted-foreground">Submitted</p>
              </div>
              <div className="w-[85px] shrink-0 border-b border-border h-10 px-2" />
            </div>

            {/* Table Body */}
            {currentContracts.map((contract) => (
              <div key={contract.id} className="flex w-full">
                <div className="flex-1 min-w-[100px] border-b border-border h-[72px] p-2 flex items-center">
                  <p className="text-sm leading-5 overflow-hidden text-ellipsis whitespace-nowrap">
                    {contract.reseller}
                  </p>
                </div>
                <div className="flex-1 min-w-[100px] border-b border-border h-[72px] p-2 flex items-center">
                  <p className="text-sm leading-5 overflow-hidden text-ellipsis whitespace-nowrap">
                    {contract.customer}
                  </p>
                </div>
                <div className="flex-1 min-w-[130px] border-b border-border h-[72px] p-2 flex items-center">
                  <Badge variant="outline" className="bg-background border-border">
                    {contract.service}
                  </Badge>
                </div>
                <div className="flex-1 min-w-[170px] border-b border-border h-[72px] p-2 flex items-center">
                  <p className="text-sm leading-5 overflow-hidden text-ellipsis whitespace-nowrap">
                    {contract.model}
                  </p>
                </div>
                <div className="flex-1 min-w-[140px] border-b border-border h-[72px] p-2 flex items-center">
                  <p className="text-sm leading-5 overflow-hidden text-ellipsis whitespace-nowrap">
                    {contract.minimumCharge}
                  </p>
                </div>
                <div className="flex-1 min-w-[140px] border-b border-border h-[72px] p-2 flex items-center">
                  <p className="text-sm leading-5 overflow-hidden text-ellipsis whitespace-nowrap">
                    {contract.contractAmount}
                  </p>
                </div>
                <div className="flex-1 min-w-[140px] border-b border-border h-[72px] p-2 flex items-center">
                  <p className="text-sm leading-5 overflow-hidden text-ellipsis whitespace-nowrap">
                    {contract.vcpuUnitPrice}
                  </p>
                </div>
                <div className="flex-1 min-w-[150px] border-b border-border h-[72px] p-2 flex items-center">
                  <p className="text-sm leading-5 overflow-hidden text-ellipsis whitespace-nowrap">
                    {contract.includedAllocation}
                  </p>
                </div>
                <div className="flex-1 min-w-[110px] border-b border-border h-[72px] p-2 flex items-center">
                  <p className="text-sm leading-5 overflow-hidden text-ellipsis whitespace-nowrap">
                    {contract.submitted}
                  </p>
                </div>
                <div className="w-[85px] shrink-0 border-b border-border h-[72px] p-2 flex items-center justify-end gap-2">
                  <button
                    onClick={() => handleApprove(contract.id)}
                    className="bg-primary rounded-md size-8 flex items-center justify-center hover:bg-primary/90 transition-colors"
                    aria-label="Approve"
                  >
                    <Check className="size-4 text-primary-foreground" />
                  </button>
                  <button
                    onClick={() => handleReject(contract.id)}
                    className="bg-background border border-input rounded-md size-8 flex items-center justify-center hover:bg-secondary transition-colors"
                    aria-label="Reject"
                  >
                    <X className="size-4 text-foreground" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-end mt-4 pb-6">
          {totalPages > 1 && (
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="h-9 gap-1 pl-2.5 pr-4 text-sm font-medium disabled:opacity-50"
              >
                <ChevronLeftIcon className="h-4 w-4" />
                {t('common.previous')}
              </Button>
              <span className="text-sm text-muted-foreground px-2">
                {currentPage} / {totalPages}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="h-9 gap-1 pl-4 pr-2.5 text-sm font-medium disabled:opacity-50"
              >
                {t('common.next')}
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
