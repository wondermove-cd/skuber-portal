import { TrendingUp, TrendingDown, type LucideIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatNumber, formatCurrency, formatPercentage } from '@/lib/utils/format';

interface StatsCardProps {
  title: string;
  value: number;
  change: number;
  changeType: 'increase' | 'percentage';
  changeLabel: string;
  isCurrency?: boolean;
  icon?: LucideIcon;
}

export function StatsCard({
  title,
  value,
  change,
  changeType,
  changeLabel,
  isCurrency = false,
  icon: Icon,
}: StatsCardProps) {
  const isPositive = change > 0;
  const formattedValue = isCurrency ? formatCurrency(value) : formatNumber(value);
  const formattedChange =
    changeType === 'percentage'
      ? formatPercentage(change)
      : `${isPositive ? '+' : ''}${formatNumber(change)}`;

  return (
    <Card className="bg-zinc-900 border-zinc-800">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-zinc-400">
            {title}
          </CardTitle>
          {Icon && (
            <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center">
              <Icon className="w-4 h-4 text-zinc-400" />
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-1">
          <div className="text-2xl font-bold text-white">
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
            <span className="text-zinc-500">{changeLabel}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
