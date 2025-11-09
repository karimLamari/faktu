'use client';

import { AlertCircle, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

interface UsageBarProps {
  current: number;
  limit: number | 'unlimited';
  label: string;
  upgradeLink?: string;
}

export function UsageBar({ current, limit, label, upgradeLink }: UsageBarProps) {
  const router = useRouter();

  if (limit === 'unlimited') {
    return (
      <div className="bg-gradient-to-r from-green-900/30 to-emerald-900/30 rounded-lg p-4 border border-green-700/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-400" />
            <span className="text-sm font-medium text-green-300">{label}</span>
          </div>
          <span className="text-sm font-bold text-green-400">Illimité ∞</span>
        </div>
      </div>
    );
  }

  const percentage = Math.min((current / limit) * 100, 100);
  const isNearLimit = percentage >= 80;
  const isAtLimit = current >= limit;

  return (
    <div className={`rounded-lg p-4 border ${isAtLimit ? 'bg-red-900/30 border-red-700/50' : isNearLimit ? 'bg-orange-900/30 border-orange-700/50' : 'bg-gray-800/50 border-gray-700/50'}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-300">{label}</span>
        <span className={`text-sm font-bold ${isAtLimit ? 'text-red-400' : isNearLimit ? 'text-orange-400' : 'text-gray-100'}`}>
          {current} / {limit}
        </span>
      </div>
      
      <div className="relative w-full">
        <div className={`h-2 w-full rounded-full overflow-hidden ${isAtLimit ? 'bg-red-900/50' : isNearLimit ? 'bg-orange-900/50' : 'bg-gray-700/50'}`}>
          <div 
            className={`h-full transition-all duration-300 ${isAtLimit ? 'bg-red-500' : isNearLimit ? 'bg-orange-500' : 'bg-indigo-500'}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
      
      {isNearLimit && (
        <div className="mt-3 flex items-start gap-2">
          <AlertCircle className={`w-4 h-4 mt-0.5 flex-shrink-0 ${isAtLimit ? 'text-red-400' : 'text-orange-400'}`} />
          <div className="flex-1">
            <p className={`text-xs ${isAtLimit ? 'text-red-300' : 'text-orange-300'}`}>
              {isAtLimit ? 'Limite atteinte ! Passez à Pro pour continuer.' : 'Vous approchez de votre limite mensuelle.'}
            </p>
            {upgradeLink && isAtLimit && (
              <Button 
                onClick={() => router.push(upgradeLink)}
                size="sm"
                className="mt-2 w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 shadow-lg shadow-blue-500/20"
              >
                Passer à Pro maintenant
              </Button>
            )}
            {upgradeLink && !isAtLimit && (
              <a href={upgradeLink} className={`text-xs font-semibold underline ${isAtLimit ? 'text-red-300' : 'text-orange-300'}`}>
                Voir les plans →
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
