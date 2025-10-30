import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
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
  return (
    <Card>
      <CardHeader>
        <CardTitle>Contracts Expiring Soon</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {contracts.map((contract) => (
            <div
              key={contract.id}
              className="flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <Avatar className="w-10 h-10">
                  <AvatarFallback className="bg-muted text-muted-foreground">
                    {getInitials(contract.name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="text-sm font-medium text-foreground">
                    {contract.name}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {contract.email}
                  </div>
                </div>
              </div>
              <Badge variant="outline" className="text-xs">
                {formatDaysLeft(contract.daysLeft)}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
