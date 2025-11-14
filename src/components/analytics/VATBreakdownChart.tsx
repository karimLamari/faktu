'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { formatCurrency } from '@/lib/analytics/calculations';

interface VATData {
  rate: number;
  totalVAT: number;
  baseAmount: number;
  count: number;
}

interface VATBreakdownChartProps {
  data: VATData[];
}

export function VATBreakdownChart({ data }: VATBreakdownChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-gray-900/80 backdrop-blur-lg border border-gray-700/50 rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-white mb-6">Répartition TVA</h3>
        <div className="flex items-center justify-center h-64 text-gray-400">
          Aucune donnée TVA disponible
        </div>
      </div>
    );
  }

  const chartData = data.map((item) => ({
    name: `TVA ${item.rate.toFixed(1)}%`,
    'Montant HT': item.baseAmount,
    TVA: item.totalVAT,
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-3 shadow-xl">
          <p className="text-sm font-medium text-white mb-2">{payload[0].payload.name}</p>
          <div className="space-y-1 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-indigo-500" />
              <span className="text-gray-300">Montant HT:</span>
              <span className="font-semibold text-white">
                {formatCurrency(payload[0].value)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="text-gray-300">TVA:</span>
              <span className="font-semibold text-white">
                {formatCurrency(payload[1].value)}
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-gray-900/80 backdrop-blur-lg border border-gray-700/50 rounded-xl p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-white mb-6">Répartition TVA</h3>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey="name" stroke="#9CA3AF" style={{ fontSize: '12px' }} />
          <YAxis
            stroke="#9CA3AF"
            style={{ fontSize: '12px' }}
            tickFormatter={(value) => `${(value / 1000).toFixed(0)}k€`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ color: '#9CA3AF', fontSize: '14px' }} iconType="circle" />
          <Bar dataKey="Montant HT" fill="#6366f1" radius={[4, 4, 0, 0]} />
          <Bar dataKey="TVA" fill="#10b981" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>

      {/* Summary table */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-3 bg-gray-800/50 rounded-lg border border-gray-700/50">
          <p className="text-xs text-gray-400 mb-1">TVA Collectée</p>
          <p className="text-lg font-bold text-white">
            {formatCurrency(data.reduce((sum, item) => sum + item.totalVAT, 0))}
          </p>
        </div>
        <div className="p-3 bg-gray-800/50 rounded-lg border border-gray-700/50">
          <p className="text-xs text-gray-400 mb-1">Montant HT Total</p>
          <p className="text-lg font-bold text-white">
            {formatCurrency(data.reduce((sum, item) => sum + item.baseAmount, 0))}
          </p>
        </div>
        <div className="p-3 bg-gray-800/50 rounded-lg border border-gray-700/50">
          <p className="text-xs text-gray-400 mb-1">Transactions</p>
          <p className="text-lg font-bold text-white">
            {data.reduce((sum, item) => sum + item.count, 0)}
          </p>
        </div>
      </div>
    </div>
  );
}
