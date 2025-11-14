'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { formatCurrency } from '@/lib/analytics/calculations';

interface ClientData {
  id: string;
  name: string;
  revenue: number;
  invoiceCount: number;
  averageValue: number;
}

interface TopClientsChartProps {
  data: ClientData[];
}

export function TopClientsChart({ data }: TopClientsChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-gray-900/80 backdrop-blur-lg border border-gray-700/50 rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-white mb-6">
          Top 5 Clients par CA
        </h3>
        <div className="flex items-center justify-center h-64 text-gray-400">
          Aucune donnée disponible
        </div>
      </div>
    );
  }

  const chartData = data.map((client) => ({
    name: client.name.length > 20 ? client.name.substring(0, 20) + '...' : client.name,
    fullName: client.name,
    'Chiffre d\'affaires': client.revenue,
    invoiceCount: client.invoiceCount,
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-3 shadow-xl">
          <p className="text-sm font-medium text-white mb-2">{payload[0].payload.fullName}</p>
          <div className="space-y-1 text-sm">
            <div className="flex items-center justify-between gap-4">
              <span className="text-gray-300">CA:</span>
              <span className="font-semibold text-white">
                {formatCurrency(payload[0].value)}
              </span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-gray-300">Factures:</span>
              <span className="font-semibold text-white">
                {payload[0].payload.invoiceCount}
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
      <h3 className="text-lg font-semibold text-white mb-6">
        Top 5 Clients par CA
      </h3>

      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={chartData} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis
            type="number"
            stroke="#9CA3AF"
            style={{ fontSize: '12px' }}
            tickFormatter={(value) => `${(value / 1000).toFixed(0)}k€`}
          />
          <YAxis
            type="category"
            dataKey="name"
            stroke="#9CA3AF"
            style={{ fontSize: '12px' }}
            width={120}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="Chiffre d'affaires" fill="#6366f1" radius={[0, 8, 8, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
