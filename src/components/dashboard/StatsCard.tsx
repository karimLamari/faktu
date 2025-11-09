import React from 'react';
import { Card } from '@/components/ui/card';

interface StatsCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ 
  label, 
  value, 
  icon, 
  trend,
  className = '' 
}) => {
  return (
    <Card className={`p-4 bg-gray-900/80 backdrop-blur-lg rounded-lg shadow-2xl border border-gray-700/50 ${className}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="text-sm text-gray-400 mb-1">{label}</div>
          <div className="text-2xl font-bold text-white">{value}</div>
          
          {/* Tendance optionnelle */}
          {trend && (
            <div className={`text-sm mt-1 flex items-center gap-1 ${
              trend.isPositive ? 'text-green-400' : 'text-red-400'
            }`}>
              <span>{trend.isPositive ? '↑' : '↓'}</span>
              <span>{Math.abs(trend.value)}%</span>
            </div>
          )}
        </div>
        
        {/* Icône optionnelle */}
        {icon && (
          <div className="text-gray-500 ml-2">
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
};

export default StatsCard;
