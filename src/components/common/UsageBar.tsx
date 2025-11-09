'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { TrendingUp, AlertCircle } from 'lucide-react';
import { PLANS } from '@/lib/subscription/plans';

interface UsageBarProps {
  user: {
    subscription?: {
      plan?: 'free' | 'pro' | 'business';
      status?: string;
    };
  };
  stats: {
    invoiceCount: number;
    clientCount: number;
  };
}

export default function UsageBar({ user, stats }: UsageBarProps) {
  const plan = user.subscription?.plan || 'free';
  const planLimits = PLANS[plan];

  // Calculer les usages avec gestion des types 'unlimited'
  const invoiceLimitRaw = planLimits.invoicesPerMonth;
  const invoiceLimit = typeof invoiceLimitRaw === 'number' ? invoiceLimitRaw : Infinity;
  const invoiceUsage = stats.invoiceCount;
  const invoicePercentage = invoiceLimit === Infinity ? 0 : (invoiceUsage / invoiceLimit) * 100;

  const clientLimitRaw = planLimits.clientsLimit || planLimits.clients;
  const clientLimit = typeof clientLimitRaw === 'number' ? clientLimitRaw : Infinity;
  const clientUsage = stats.clientCount;
  const clientPercentage = clientLimit === Infinity ? 0 : (clientUsage / clientLimit) * 100;

  // Déterminer si proche de la limite (>80%)
  const invoiceNearLimit = invoicePercentage > 80;
  const clientNearLimit = clientPercentage > 80;
  const anyNearLimit = invoiceNearLimit || clientNearLimit;

  // Déterminer la couleur de la barre
  const getBarColor = (percentage: number) => {
    if (percentage >= 100) return 'bg-red-500';
    if (percentage >= 80) return 'bg-orange-500';
    if (percentage >= 60) return 'bg-yellow-500';
    return 'bg-gradient-to-r from-blue-500 to-indigo-500';
  };

  // Ne pas afficher pour le plan Pro (illimité)
  if (plan !== 'free') {
    return null;
  }

  return (
    <div className={`
      rounded-2xl p-6 mb-6 border backdrop-blur-xl transition-all duration-300
      ${anyNearLimit 
        ? 'bg-gradient-to-br from-orange-900/30 via-gray-900/90 to-gray-900/90 border-orange-500/50' 
        : 'bg-gradient-to-br from-blue-900/20 via-gray-900/90 to-gray-900/90 border-blue-500/30'
      }
    `}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className={`
            p-2.5 rounded-xl
            ${anyNearLimit ? 'bg-orange-500/20' : 'bg-blue-500/20'}
          `}>
            {anyNearLimit ? (
              <AlertCircle className="w-5 h-5 text-orange-400" />
            ) : (
              <TrendingUp className="w-5 h-5 text-blue-400" />
            )}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">
              {anyNearLimit ? 'Limite bientôt atteinte' : 'Utilisation du plan'}
            </h3>
            <p className="text-sm text-gray-400">
              Plan <span className="font-semibold text-white capitalize">{plan}</span>
            </p>
          </div>
        </div>

        {anyNearLimit && (
          <Link href="/dashboard/pricing">
            <button className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-sm font-semibold rounded-lg transition-all duration-200 shadow-lg hover:shadow-blue-500/50">
              Passer au Pro
            </button>
          </Link>
        )}
      </div>

      {/* Usage bars */}
      <div className="space-y-5">
        {/* Factures */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-300">
              📄 Factures ce mois
            </span>
            <span className={`text-sm font-bold ${
              invoicePercentage >= 100 ? 'text-red-400' :
              invoicePercentage >= 80 ? 'text-orange-400' :
              'text-blue-400'
            }`}>
              {invoiceUsage} / {invoiceLimit === Infinity ? '∞' : invoiceLimit}
            </span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-3 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${getBarColor(invoicePercentage)}`}
              style={{ width: `${Math.min(invoicePercentage, 100)}%` }}
            />
          </div>
          {invoicePercentage >= 80 && invoicePercentage < 100 && (
            <p className="text-xs text-orange-400 mt-1.5">
              ⚠️ Plus que {invoiceLimit - invoiceUsage} facture{invoiceLimit - invoiceUsage > 1 ? 's' : ''} disponible{invoiceLimit - invoiceUsage > 1 ? 's' : ''}
            </p>
          )}
          {invoicePercentage >= 100 && (
            <p className="text-xs text-red-400 mt-1.5 font-semibold">
              🚫 Limite atteinte - Passez au Pro pour continuer
            </p>
          )}
        </div>

        {/* Clients */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-300">
              👥 Clients actifs
            </span>
            <span className={`text-sm font-bold ${
              clientPercentage >= 100 ? 'text-red-400' :
              clientPercentage >= 80 ? 'text-orange-400' :
              'text-blue-400'
            }`}>
              {clientUsage} / {clientLimit === Infinity ? '∞' : clientLimit}
            </span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-3 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${getBarColor(clientPercentage)}`}
              style={{ width: `${Math.min(clientPercentage, 100)}%` }}
            />
          </div>
          {clientPercentage >= 80 && clientPercentage < 100 && (
            <p className="text-xs text-orange-400 mt-1.5">
              ⚠️ Plus que {clientLimit - clientUsage} client{clientLimit - clientUsage > 1 ? 's' : ''} disponible{clientLimit - clientUsage > 1 ? 's' : ''}
            </p>
          )}
          {clientPercentage >= 100 && (
            <p className="text-xs text-red-400 mt-1.5 font-semibold">
              🚫 Limite atteinte - Passez au Pro pour continuer
            </p>
          )}
        </div>
      </div>

      {/* Footer CTA */}
      {!anyNearLimit && (
        <div className="mt-6 pt-5 border-t border-gray-700/50">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-400">
              Besoin de plus ? Débloquez toutes les fonctionnalités
            </p>
            <Link href="/dashboard/pricing">
              <button className="text-sm text-blue-400 hover:text-blue-300 font-medium transition-colors">
                Voir les plans →
              </button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
