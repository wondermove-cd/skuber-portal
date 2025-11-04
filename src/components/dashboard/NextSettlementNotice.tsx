import { DollarSign } from 'lucide-react';
import { formatCurrency } from '@/lib/utils/format';

interface NextSettlementNoticeProps {
  amount: number;
  dueDate: string;
}

export function NextSettlementNotice({ amount, dueDate }: NextSettlementNoticeProps) {
  return (
    <div className="bg-card border border-border rounded-lg p-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-muted rounded-md flex items-center justify-center">
          <DollarSign className="w-5 h-5 text-muted-foreground" />
        </div>
        <div>
          <div className="text-sm font-medium text-foreground">
            Next Settlement Notice
          </div>
          <div className="text-sm text-muted-foreground">
            Settlement due date {dueDate}
          </div>
        </div>
      </div>
      <div className="text-lg font-semibold text-foreground">
        {formatCurrency(amount)}
      </div>
    </div>
  );
}
