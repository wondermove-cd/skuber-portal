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
    <Card className="bg-zinc-900 border-zinc-800">
      <CardHeader>
        <CardTitle className="text-white">Contracts Expiring Soon</CardTitle>
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
                  <AvatarFallback className="bg-zinc-700 text-white text-sm">
                    {getInitials(contract.name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="text-sm font-medium text-white">
                    {contract.name}
                  </div>
                  <div className="text-xs text-zinc-500">
                    {contract.email}
                  </div>
                </div>
              </div>
              <Badge variant="outline" className="text-xs border-zinc-700 text-zinc-400">
                {formatDaysLeft(contract.daysLeft)}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
