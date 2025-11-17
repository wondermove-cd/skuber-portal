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
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Mail } from 'lucide-react';
import { getInitials, formatDaysLeft } from '@/lib/utils/format';

interface ExpiringContract {
  id: string;
  name: string;
  email: string;
  daysLeft: number;
}

interface ExpiringContractsListProps {
  contracts: ExpiringContract[];
}

export function ExpiringContractsList({
  contracts,
}: ExpiringContractsListProps) {
  const { t } = useTranslation();

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-xl font-semibold leading-none text-foreground h-8 flex items-center">{t('dashboard.contactsWithExpiringContracts')}</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-muted-foreground">{t('dashboard.contact')}</TableHead>
              <TableHead className="text-muted-foreground">{t('dashboard.daysLeft')}</TableHead>
              <TableHead className="w-10"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {contracts.map((contract) => (
              <TableRow key={contract.id} className="border-border h-18">
                <TableCell className="py-2">
                  <div className="flex items-center gap-2">
                    <Avatar className="w-10 h-10">
                      <AvatarFallback className="bg-muted text-foreground text-sm">
                        {getInitials(contract.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="text-sm font-medium text-foreground">
                        {contract.name}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {contract.email}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-sm py-2">
                  {contract.daysLeft < 0 ? (
                    <span className="text-destructive font-medium">{t('status.expired')}</span>
                  ) : contract.daysLeft < 30 ? (
                    <span className="text-orange-600 font-medium">{formatDaysLeft(contract.daysLeft, t)}</span>
                  ) : (
                    <span className="text-foreground">{formatDaysLeft(contract.daysLeft, t)}</span>
                  )}
                </TableCell>
                <TableCell className="text-right py-2">
                  <button className="w-8 h-8 flex items-center justify-center rounded-md border border-input bg-background hover:bg-accent transition-colors">
                    <Mail className="w-4 h-4 text-foreground" />
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
