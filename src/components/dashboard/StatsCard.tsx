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
    <Card className={`p-4 bg-white rounded-lg shadow border ${className}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="text-sm text-gray-500 mb-1">{label}</div>
          <div className="text-2xl font-bold">{value}</div>
          
          {/* Tendance optionnelle */}
          {trend && (
            <div className={`text-sm mt-1 flex items-center gap-1 ${
              trend.isPositive ? 'text-green-600' : 'text-red-600'
            }`}>
              <span>{trend.isPositive ? '↑' : '↓'}</span>
              <span>{Math.abs(trend.value)}%</span>
            </div>
          )}
        </div>
        
        {/* Icône optionnelle */}
        {icon && (
          <div className="text-gray-400 ml-2">
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
};

export default StatsCard;
