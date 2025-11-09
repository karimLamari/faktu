import { SubscriptionPlan } from '@/types/subscription';
import { Crown, Zap, Sparkles } from 'lucide-react';

interface PlanBadgeProps {
  plan: SubscriptionPlan;
  size?: 'sm' | 'md' | 'lg';
}

export function PlanBadge({ plan, size = 'md' }: PlanBadgeProps) {
  const config = {
    free: {
      label: 'Gratuit',
      icon: Sparkles,
      className: 'bg-gray-100 text-gray-700 border-gray-300',
    },
    pro: {
      label: 'Pro',
      icon: Zap,
      className: 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white border-0',
    },
    business: {
      label: 'Business',
      icon: Crown,
      className: 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0',
    },
  };

  const { label, icon: Icon, className } = config[plan];
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-1.5',
  };

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-semibold border ${className} ${sizeClasses[size]}`}>
      <Icon className={size === 'sm' ? 'w-3 h-3' : size === 'md' ? 'w-4 h-4' : 'w-5 h-5'} />
      {label}
    </span>
  );
}
