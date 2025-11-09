'use client';

import React, { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Notification as NotificationType } from '@/hooks/useNotification';
import { Notification } from './Notification';
import { PageHeader } from './PageHeader';
import { LucideIcon, Plus } from 'lucide-react';

interface StatCard {
  label: string;
  value: number | string;
  bgColor: string;
  textColor: string;
  borderColor: string;
  icon?: ReactNode;
}

interface ManagementLayoutProps {
  // Header
  title: string;
  subtitle?: string;
  buttonLabel: string;
  onButtonClick: () => void;
  icon?: LucideIcon; // Nouvel icône pour le PageHeader
  
  // Stats (optionnel)
  stats?: StatCard[];
  
  // Filters (optionnel)
  filters?: ReactNode;
  
  // Content
  isEmpty: boolean;
  emptyMessage?: string;
  emptyDescription?: string;
  children: ReactNode;
  
  // Notification
  notification?: NotificationType | null;
  
  // Banner optionnel (pour profil incomplet par exemple)
  banner?: ReactNode;
  
  // Grid layout (par défaut 3 colonnes)
  gridCols?: 'grid-cols-1 md:grid-cols-2' | 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
}

export  function ManagementLayout({
  title,
  subtitle,
  buttonLabel,
  onButtonClick,
  icon,
  stats,
  filters,
  isEmpty,
  emptyMessage = 'Aucun élément pour l\'instant',
  emptyDescription,
  children,
  notification,
  banner,
  gridCols = 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
}: ManagementLayoutProps) {
  return (
    <div className="max-w-7xl mx-auto">
      {/* Notification */}
      {notification && (
        <div className="mb-4">
          <Notification notification={notification} />
        </div>
      )}

      {/* Banner optionnel */}
      {banner && <div className="mb-6">{banner}</div>}

      {/* Header with PageHeader component */}
      <div className="mb-6">
        <PageHeader
          title={title}
          description={subtitle}
          icon={icon}
          actionLabel={buttonLabel}
          actionIcon={Plus}
          onActionClick={onButtonClick}
        />
      </div>

      {/* Stats Cards (optionnel) */}
      {stats && stats.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-700 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm text-white mb-1">{stat.label}</p>
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                </div>
                {stat.icon && (
                  <div className="w-10 h-10  rounded-lg flex items-center justify-center flex-shrink-0">
                    <div className="text-white">
                      {stat.icon}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Filters (optionnel) */}
      {filters && <div className="mb-6">{filters}</div>}

      {/* Content ou Empty State */}
      {isEmpty ? (
        <div className="text-center py-12 bg-gray-900/80 backdrop-blur-lg rounded-lg shadow-2xl border border-gray-700/50">
          <p className="text-gray-300 text-lg">{emptyMessage}</p>
          {emptyDescription && (
            <p className="text-gray-400 text-sm mt-2">{emptyDescription}</p>
          )}
          <Button onClick={onButtonClick} className="mt-4" size="lg">
            {buttonLabel}
          </Button>
        </div>
      ) : (
        <div className={`grid ${gridCols} gap-6`}>
          {children}
        </div>
      )}
    </div>
  );
}
