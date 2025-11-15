'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Lock, FileCheck, Mail, CreditCard, XCircle, Clock } from 'lucide-react';

interface InvoiceStatusBadgeProps {
  invoice: any;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function InvoiceStatusBadge({ 
  invoice, 
  showIcon = true,
  size = 'md' 
}: InvoiceStatusBadgeProps) {
  // Priorité d'affichage : isFinalized > status > paymentStatus
  
  // 1. Si finalisée, c'est la priorité (conformité légale)
  if (invoice.isFinalized) {
    return (
      <Badge 
        variant="outline" 
        className={`
          bg-green-900/30 border-green-700 text-green-400
          ${size === 'sm' ? 'text-xs py-0.5' : size === 'lg' ? 'text-base py-1.5' : 'text-sm py-1'}
        `}
      >
        {showIcon && <Lock className={`${size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} mr-1.5`} />}
        <span className="font-semibold">Finalisée</span>
      </Badge>
    );
  }

  // 2. Status principal (workflow)
  switch (invoice.status) {
    case 'draft':
      return (
        <Badge 
          variant="outline" 
          className={`
            bg-gray-800/50 border-gray-600 text-gray-300
            ${size === 'sm' ? 'text-xs py-0.5' : size === 'lg' ? 'text-base py-1.5' : 'text-sm py-1'}
          `}
        >
          {showIcon && <FileCheck className={`${size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} mr-1.5`} />}
          Brouillon
        </Badge>
      );

    case 'sent':
      return (
        <Badge 
          variant="outline" 
          className={`
            bg-blue-900/30 border-blue-700 text-blue-400
            ${size === 'sm' ? 'text-xs py-0.5' : size === 'lg' ? 'text-base py-1.5' : 'text-sm py-1'}
          `}
        >
          {showIcon && <Mail className={`${size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} mr-1.5`} />}
          Envoyée
        </Badge>
      );

    case 'cancelled':
      return (
        <Badge 
          variant="outline" 
          className={`
            bg-yellow-900/30 border-yellow-700 text-yellow-400
            ${size === 'sm' ? 'text-xs py-0.5' : size === 'lg' ? 'text-base py-1.5' : 'text-sm py-1'}
          `}
        >
          {showIcon && <XCircle className={`${size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} mr-1.5`} />}
          Annulée
        </Badge>
      );

    case 'overdue':
      return (
        <Badge 
          variant="outline" 
          className={`
            bg-red-900/30 border-red-700 text-red-400
            ${size === 'sm' ? 'text-xs py-0.5' : size === 'lg' ? 'text-base py-1.5' : 'text-sm py-1'}
          `}
        >
          {showIcon && <Clock className={`${size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} mr-1.5`} />}
          En retard
        </Badge>
      );

    case 'paid':
    case 'partially_paid':
      return (
        <Badge 
          variant="outline" 
          className={`
            bg-green-900/30 border-green-700 text-green-400
            ${size === 'sm' ? 'text-xs py-0.5' : size === 'lg' ? 'text-base py-1.5' : 'text-sm py-1'}
          `}
        >
          {showIcon && <CreditCard className={`${size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} mr-1.5`} />}
          {invoice.status === 'paid' ? 'Payée' : 'Partiellement payée'}
        </Badge>
      );

    default:
      return (
        <Badge 
          variant="outline" 
          className={`
            bg-gray-800/50 border-gray-600 text-gray-400
            ${size === 'sm' ? 'text-xs py-0.5' : size === 'lg' ? 'text-base py-1.5' : 'text-sm py-1'}
          `}
        >
          {invoice.status}
        </Badge>
      );
  }
}

// Composant pour afficher plusieurs badges (finalisée + status)
export function InvoiceStatusBadges({ invoice }: { invoice: any }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Badge finalisée en priorité */}
      {invoice.isFinalized && (
        <Badge 
          variant="outline" 
          className="bg-green-900/30 border-green-700 text-green-400"
        >
          <Lock className="w-3 h-3 mr-1.5" />
          <span className="font-semibold">Finalisée</span>
        </Badge>
      )}

      {/* Badge status unique */}
      {!invoice.isFinalized && invoice.status && (
        <InvoiceStatusBadge invoice={invoice} showIcon={true} size="sm" />
      )}
    </div>
  );
}
