'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { formatCurrency } from '@/lib/analytics/calculations';

interface CategoryData {
  category: string;
  amount: number;
  taxAmount: number;
  count: number;
}

interface ExpenseByCategoryChartProps {
  data: CategoryData[];
}

const COLORS = [
  '#6366f1', // Indigo
  '#10b981', // Green
  '#f59e0b', // Amber
  '#ef4444', // Red
  '#8b5cf6', // Purple
  '#06b6d4', // Cyan
  '#ec4899', // Pink
  '#14b8a6', // Teal
];

export function ExpenseByCategoryChart({ data }: ExpenseByCategoryChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-gray-900/80 backdrop-blur-lg border border-gray-700/50 rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-white mb-6">
          Dépenses par catégorie
        </h3>
        <div className="flex items-center justify-center h-64 text-gray-400">
          Aucune dépense pour cette période
        </div>
      </div>
    );
  }

  const chartData = data.map((item, index) => ({
    name: item.category || 'Non catégorisé',
    value: item.amount,
    percentage: 0, // Will be calculated below
    color: COLORS[index % COLORS.length],
  }));

  // Calculate percentages
  const total = chartData.reduce((sum, item) => sum + item.value, 0);
  chartData.forEach((item) => {
    item.percentage = (item.value / total) * 100;
  });

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-3 shadow-xl">
          <p className="text-sm font-medium text-white mb-1">{data.name}</p>
          <p className="text-sm text-gray-300">
            {formatCurrency(data.value)} ({data.percentage.toFixed(1)}%)
          </p>
        </div>
      );
    }
    return null;
  };

  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    if (percent < 0.05) return null; // Don't show label if less than 5%

    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
    const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        fontSize="12"
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="bg-gray-900/80 backdrop-blur-lg border border-gray-700/50 rounded-xl p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-white mb-6">
        Dépenses par catégorie
      </h3>

      <ResponsiveContainer width="100%" height={350}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomLabel}
            outerRadius={120}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="bottom"
            height={36}
            wrapperStyle={{ color: '#9CA3AF', fontSize: '12px' }}
          />
        </PieChart>
      </ResponsiveContainer>

      {/* Category breakdown table */}
      <div className="mt-6 space-y-2">
        {chartData.map((item, index) => (
          <div
            key={index}
            className="flex items-center justify-between text-sm py-2 border-t border-gray-700/50"
          >
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-gray-300">{item.name}</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-gray-400">{item.percentage.toFixed(1)}%</span>
              <span className="font-semibold text-white">
                {formatCurrency(item.value)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
