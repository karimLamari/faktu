'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { PlanBadge } from './PlanBadge';
import { X, Check, Zap, Crown } from 'lucide-react';
import { PLANS } from '@/lib/subscription/plans';
import { SubscriptionPlan } from '@/types/subscription';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  feature: string;
  currentPlan: SubscriptionPlan;
  requiredPlan: 'pro' | 'business';
}

export function UpgradeModal({ isOpen, onClose, feature, currentPlan, requiredPlan }: UpgradeModalProps) {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  
  if (!isOpen) return null;

  const plan = PLANS[requiredPlan];
  const price = billingCycle === 'monthly' ? plan.price : plan.priceAnnual / 12;
  const totalPrice = billingCycle === 'monthly' ? plan.price : plan.priceAnnual;
  const savings = billingCycle === 'annual' ? Math.round(((plan.price * 12 - plan.priceAnnual) / (plan.price * 12)) * 100) : 0;

  const features = [
    requiredPlan === 'pro' ? '50 factures/mois' : 'Factures illimitées',
    'Clients illimités',
    'Scan OCR des factures',
    'Envoi email automatique',
    'Rappels de paiement',
    'Statistiques avancées',
    'Tous les modèles',
    ...(requiredPlan === 'business' ? ['Multi-utilisateurs', 'Accès API', 'Support premium'] : []),
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in p-4">
      <div className="bg-gray-900/95 backdrop-blur-lg rounded-2xl shadow-2xl border border-gray-700/50 w-full max-w-lg max-h-[90vh] overflow-y-auto animate-slide-in-up">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white relative rounded-t-2xl">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white hover:bg-white/10 p-2 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-3 mb-2">
            {requiredPlan === 'pro' ? <Zap className="w-8 h-8" /> : <Crown className="w-8 h-8" />}
            <h2 className="text-2xl font-bold">Passez à {plan.name}</h2>
          </div>
          <p className="text-indigo-100">
            Pour accéder à <span className="font-semibold">"{feature}"</span>
          </p>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-2 bg-gray-800/50 rounded-xl p-1">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-gray-700 text-white shadow-sm'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              Mensuel
            </button>
            <button
              onClick={() => setBillingCycle('annual')}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all relative ${
                billingCycle === 'annual'
                  ? 'bg-gray-700 text-white shadow-sm'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              Annuel
              {savings > 0 && (
                <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  -{savings}%
                </span>
              )}
            </button>
          </div>

          {/* Price */}
          <div className="text-center py-4">
            <div className="flex items-baseline justify-center gap-2">
              <span className="text-5xl font-bold text-white">{price.toFixed(0)}€</span>
              <span className="text-gray-400">/mois</span>
            </div>
            {billingCycle === 'annual' && (
              <p className="text-sm text-gray-400 mt-2">
                Soit {totalPrice}€ facturé annuellement
              </p>
            )}
          </div>

          {/* Features */}
          <div className="space-y-3">
            {features.map((feature, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="w-5 h-5 bg-green-900/30 border border-green-700/50 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="w-3 h-3 text-green-400" />
                </div>
                <span className="text-sm text-gray-300">{feature}</span>
              </div>
            ))}
          </div>

          {/* Current Plan Badge */}
          <div className="flex items-center justify-between p-3 bg-gray-800/50 border border-gray-700/50 rounded-lg">
            <span className="text-sm text-gray-400">Plan actuel</span>
            <PlanBadge plan={currentPlan} size="sm" />
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-700/50 p-6 bg-gray-800/50">
          <Button
            onClick={() => {
              window.location.href = `/api/subscription/create-checkout?plan=${requiredPlan}&cycle=${billingCycle}`;
            }}
            className="w-full h-12 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-lg font-semibold shadow-lg shadow-indigo-500/20"
          >
            Commencer maintenant
          </Button>
          <p className="text-xs text-center text-gray-500 mt-3">
            Annulez à tout moment • Garantie satisfait ou remboursé 30 jours
          </p>
        </div>
      </div>
    </div>
  );
}
