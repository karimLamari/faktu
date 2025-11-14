'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { getShortMonthName } from '@/lib/analytics/utils';
import { formatCurrency } from '@/lib/analytics/calculations';

interface TrendData {
  year: number;
  month: number;
  revenue: number;
  expenses: number;
  profit: number;
}

interface RevenueExpenseChartProps {
  data: TrendData[];
}

export function RevenueExpenseChart({ data }: RevenueExpenseChartProps) {
  const chartData = data.map((item) => ({
    name: `${getShortMonthName(item.month)} ${item.year}`,
    'Chiffre d\'affaires': item.revenue,
    Dépenses: item.expenses,
    Bénéfice: item.profit,
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-3 shadow-xl">
          <p className="text-sm font-medium text-white mb-2">{payload[0].payload.name}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-gray-300">{entry.name}:</span>
              <span className="font-semibold text-white">
                {formatCurrency(entry.value)}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-gray-900/80 backdrop-blur-lg border border-gray-700/50 rounded-xl p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-white mb-6">
        Évolution Revenus vs Dépenses
      </h3>

      <ResponsiveContainer width="100%" height={350}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis
            dataKey="name"
            stroke="#9CA3AF"
            style={{ fontSize: '12px' }}
          />
          <YAxis
            stroke="#9CA3AF"
            style={{ fontSize: '12px' }}
            tickFormatter={(value) => `${(value / 1000).toFixed(0)}k€`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ color: '#9CA3AF', fontSize: '14px' }}
            iconType="circle"
          />
          <Line
            type="monotone"
            dataKey="Chiffre d'affaires"
            stroke="#10b981"
            strokeWidth={3}
            dot={{ fill: '#10b981', r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line
            type="monotone"
            dataKey="Dépenses"
            stroke="#ef4444"
            strokeWidth={3}
            dot={{ fill: '#ef4444', r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line
            type="monotone"
            dataKey="Bénéfice"
            stroke="#6366f1"
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={{ fill: '#6366f1', r: 3 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
