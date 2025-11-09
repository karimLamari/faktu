import React from 'react';
import { Button } from '@/components/ui/button';
import { LucideIcon } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  actionLabel: string;
  onActionClick: () => void;
  actionIcon?: LucideIcon;
}

export function PageHeader({ 
  title, 
  description, 
  icon: Icon, 
  actionLabel, 
  onActionClick,
  actionIcon: ActionIcon 
}: PageHeaderProps) {
  return (
    <div className="border-l-4 border-indigo-500 bg-gray-900/80 backdrop-blur-lg rounded-xl p-4 sm:p-6 mb-6 shadow-2xl border border-gray-700/50">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div className="flex items-center gap-3 sm:gap-4">
          {Icon && (
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20 flex-shrink-0">
              <Icon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent truncate">{title}</h1>
            {description && <p className="text-sm sm:text-base text-gray-400 mt-0.5">{description}</p>}
          </div>
        </div>
        <Button 
          size="lg" 
          onClick={onActionClick} 
          className="w-full sm:w-auto whitespace-nowrap bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg shadow-indigo-500/20 hover:shadow-xl hover:shadow-indigo-500/30 transition-all duration-200 gap-2"
        >
          {ActionIcon && <ActionIcon className="w-5 h-5" />}
          {actionLabel}
        </Button>
      </div>
    </div>
  );
}
