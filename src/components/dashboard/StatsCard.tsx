import { TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatNumber, formatCurrency, formatPercentage } from '@/lib/utils/format';

interface StatsCardProps {
  title: string;
  value: number;
  change: number;
  changeType: 'increase' | 'percentage';
  changeLabel: string;
  isCurrency?: boolean;
}

export function StatsCard({
  title,
  value,
  change,
  changeType,
  changeLabel,
  isCurrency = false,
}: StatsCardProps) {
  const isPositive = change > 0;
  const formattedValue = isCurrency ? formatCurrency(value) : formatNumber(value);
  const formattedChange =
    changeType === 'percentage'
      ? formatPercentage(change)
      : `${isPositive ? '+' : ''}${formatNumber(change)}`;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-1">
          <div className="text-2xl font-bold text-foreground">
            {formattedValue}
          </div>
          <div className="flex items-center gap-1 text-xs">
            {isPositive ? (
              <TrendingUp className="w-3 h-3 text-green-500" />
            ) : (
              <TrendingDown className="w-3 h-3 text-red-500" />
            )}
            <span className={isPositive ? 'text-green-500' : 'text-red-500'}>
              {formattedChange}
            </span>
            <span className="text-muted-foreground">{changeLabel}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
