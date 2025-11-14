import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleViewAll = () => {
    navigate('/payments?showUnpaid=true&period=all');
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <div className="flex items-center justify-between h-8">
          <CardTitle className="text-xl font-semibold leading-none text-foreground flex items-center">{t('dashboard.pendingPaymentsList')}</CardTitle>
          <button
            onClick={handleViewAll}
            className="h-8 px-3 py-2 text-xs font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
          >
            {t('dashboard.viewAll')}
          </button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-muted-foreground">{t('dashboard.contract')}</TableHead>
              <TableHead className="text-muted-foreground">{t('common.contractType')}</TableHead>
              <TableHead className="text-right text-muted-foreground">{t('customers.amount')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payments.map((payment) => (
              <TableRow key={payment.id} className="border-border h-18">
                <TableCell className="py-2">
                  <div className="flex flex-col">
                    <span className="font-medium text-foreground">
                      {payment.contractName}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {payment.contractId}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="py-2 text-foreground">
                  {payment.contractType}
                </TableCell>
                <TableCell className="text-right font-medium text-foreground py-2">
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
