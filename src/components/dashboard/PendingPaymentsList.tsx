import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils/format';

interface PendingPayment {
  id: string;
  contractName: string;
  contractId: string;
  contractType: 'Direct' | 'Reseller';
  amount: number;
}

interface PendingPaymentsListProps {
  payments: PendingPayment[];
}

export function PendingPaymentsList({ payments }: PendingPaymentsListProps) {
  return (
    <Card className="bg-zinc-900 border-zinc-800">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white">Pending Payments List</CardTitle>
          <button className="h-8 px-3 py-2 text-sm rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors flex items-center justify-center gap-2">
            View All
          </button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow className="border-zinc-800 hover:bg-transparent">
              <TableHead className="text-zinc-500">Contract</TableHead>
              <TableHead className="text-zinc-500">Contract Type</TableHead>
              <TableHead className="text-right text-zinc-500">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payments.map((payment) => (
              <TableRow key={payment.id} className="border-zinc-800">
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium text-white">
                      {payment.contractName}
                    </span>
                    <span className="text-xs text-zinc-500">
                      {payment.contractId}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      payment.contractType === 'Direct' ? 'default' : 'secondary'
                    }
                    className="bg-zinc-800 text-zinc-300 border-zinc-700"
                  >
                    {payment.contractType}
                  </Badge>
                </TableCell>
                <TableCell className="text-right font-medium text-white">
                  {formatCurrency(payment.amount)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
