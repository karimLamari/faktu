'use client';

import { useState } from 'react';
import { Calendar } from 'lucide-react';
import { PeriodType, getPeriodLabel } from '@/lib/analytics/utils';

interface DateRangeSelectorProps {
  value: PeriodType;
  onChange: (period: PeriodType) => void;
}

const periods: PeriodType[] = [
  'this_month',
  'last_month',
  'this_quarter',
  'this_year',
  'last_year',
];

export function DateRangeSelector({ value, onChange }: DateRangeSelectorProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Calendar className="w-5 h-5 text-gray-400" />

      {periods.map((period) => (
        <button
          key={period}
          onClick={() => onChange(period)}
          className={`
            px-4 py-2 rounded-lg text-sm font-medium transition-all
            ${
              value === period
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 border border-gray-700/50'
            }
          `}
        >
          {getPeriodLabel(period)}
        </button>
      ))}
    </div>
  );
}
