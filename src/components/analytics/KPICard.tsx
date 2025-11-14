'use client';

import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { formatCurrency, formatPercentage } from '@/lib/analytics/calculations';

interface KPICardProps {
  title: string;
  value: number;
  change?: number;
  format?: 'currency' | 'percentage' | 'number';
  currency?: string;
  icon?: React.ReactNode;
  isPositiveGood?: boolean; // If true, positive change is green, negative is red
}

export function KPICard({
  title,
  value,
  change,
  format = 'currency',
  currency = 'EUR',
  icon,
  isPositiveGood = true,
}: KPICardProps) {
  // Format the main value
  const formattedValue =
    format === 'currency'
      ? formatCurrency(value, currency)
      : format === 'percentage'
      ? formatPercentage(value, 1)
      : value.toLocaleString('fr-FR');

  // Determine trend
  const hasTrend = change !== undefined && change !== null;
  const isPositive = hasTrend && change > 0;
  const isNegative = hasTrend && change < 0;
  const isStable = hasTrend && Math.abs(change) < 1;

  // Determine color based on trend and whether positive is good
  let trendColor = 'text-gray-400';
  if (!isStable && hasTrend) {
    if (isPositiveGood) {
      trendColor = isPositive ? 'text-green-500' : 'text-red-500';
    } else {
      trendColor = isPositive ? 'text-red-500' : 'text-green-500';
    }
  }

  // Select icon
  const TrendIcon = isStable ? Minus : isPositive ? TrendingUp : TrendingDown;

  return (
    <div className="bg-gray-900/80 backdrop-blur-lg border border-gray-700/50 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-400 mb-2">{title}</p>
          <p className="text-3xl font-bold text-white mb-2">{formattedValue}</p>

          {hasTrend && (
            <div className={`flex items-center gap-1 text-sm ${trendColor}`}>
              <TrendIcon className="w-4 h-4" />
              <span className="font-medium">
                {Math.abs(change).toFixed(1)}%
              </span>
              <span className="text-gray-500 text-xs ml-1">vs période précédente</span>
            </div>
          )}
        </div>

        {icon && (
          <div className="flex-shrink-0 w-12 h-12 bg-indigo-500/10 rounded-lg flex items-center justify-center text-indigo-400">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
