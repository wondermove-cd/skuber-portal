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
    <Card>
      <CardHeader>
        <CardTitle>Pending Payments</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Contract Name</TableHead>
              <TableHead>Contract ID</TableHead>
              <TableHead>Contract Type</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payments.map((payment) => (
              <TableRow key={payment.id}>
                <TableCell className="font-medium">
                  {payment.contractName}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {payment.contractId}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      payment.contractType === 'Direct' ? 'default' : 'secondary'
                    }
                  >
                    {payment.contractType}
                  </Badge>
                </TableCell>
                <TableCell className="text-right font-medium">
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
