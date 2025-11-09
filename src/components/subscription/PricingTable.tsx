'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { PlanBadge } from './PlanBadge';
import { PLANS } from '@/lib/subscription/plans';
import { Check, Sparkles, Zap, Crown } from 'lucide-react';
import { SubscriptionPlan } from '@/types/subscription';

interface PricingTableProps {
  currentPlan?: SubscriptionPlan;
}

export function PricingTable({ currentPlan = 'free' }: PricingTableProps) {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [isLoading, setIsLoading] = useState(false);

  const handleUpgrade = async (plan: 'free' | 'pro' | 'business') => {
    if (plan === 'free') {
      window.location.href = '/register';
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch('/api/subscription/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          plan,
          cycle: billingCycle,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la création du checkout');
      }

      // Rediriger vers Stripe Checkout
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert('Pas d\'URL de redirection reçue');
      }
    } catch (error) {
      console.error('Erreur lors de la création du checkout:', error);
      alert('Une erreur est survenue. Veuillez réessayer.');
      setIsLoading(false);
    }
  };

  const plansList = [
    {
      key: 'free' as const,
      icon: Sparkles,
      popular: false,
      cta: 'Commencer gratuitement',
    },
    {
      key: 'pro' as const,
      icon: Zap,
      popular: true,
      cta: 'Commencer l\'essai gratuit',
    },
    // Business plan temporairement caché
    // {
    //   key: 'business' as const,
    //   icon: Crown,
    //   popular: false,
    //   cta: 'Commencer l\'essai gratuit',
    // },
  ];

  return (
    <div className="space-y-8">
      {/* Billing Toggle */}
      <div className="flex justify-center">
        <div className="inline-flex items-center gap-2 bg-gray-800/50 rounded-xl p-1">
          <button
            onClick={() => setBillingCycle('monthly')}
            className={`py-2 px-6 rounded-lg text-sm font-medium transition-all ${
              billingCycle === 'monthly'
                ? 'bg-gray-700 text-white shadow-sm'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            Mensuel
          </button>
          <button
            onClick={() => setBillingCycle('annual')}
            className={`py-2 px-6 rounded-lg text-sm font-medium transition-all relative ${
              billingCycle === 'annual'
                ? 'bg-gray-700 text-white shadow-sm'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            Annuel
            <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              -17%
            </span>
          </button>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
        {plansList.map(({ key, icon: Icon, popular, cta }) => {
          const plan = PLANS[key];
          const price = billingCycle === 'monthly' ? plan.price : plan.priceAnnual / 12;
          const isCurrent = currentPlan === key;

          return (
            <div
              key={key}
              className={`relative rounded-2xl border-2 p-8 ${
                popular
                  ? 'border-indigo-500 bg-gradient-to-b from-indigo-900/30 to-gray-900/80 shadow-xl scale-105 backdrop-blur-lg'
                  : 'border-gray-700/50 bg-gray-900/80 backdrop-blur-lg'
              }`}
            >
              {popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-bold px-4 py-1 rounded-full shadow-lg">
                    Le plus populaire
                  </span>
                </div>
              )}

              {/* Header */}
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-800/50 rounded-xl mb-4">
                  <Icon className={`w-6 h-6 ${popular ? 'text-indigo-400' : 'text-gray-400'}`} />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-bold text-white">{price.toFixed(0)}€</span>
                  <span className="text-gray-400">/mois</span>
                </div>
                {billingCycle === 'annual' && key !== 'free' && (
                  <p className="text-sm text-gray-600 mt-1">
                    {plan.priceAnnual}€ /an
                  </p>
                )}
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-white">
                    {plan.invoicesPerMonth === 'unlimited' ? 'Factures illimitées' : `${plan.invoicesPerMonth} factures/mois`}
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-white">
                    {plan.quotesPerMonth === 'unlimited' ? 'Devis illimités' : `${plan.quotesPerMonth} devis/mois`}
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-white">
                    {plan.expensesPerMonth === 'unlimited' ? 'Dépenses illimitées' : `${plan.expensesPerMonth} dépenses/mois`}
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-white">
                    {plan.clients === 'unlimited' ? 'Clients illimités' : `${plan.clients} clients max`}
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-white">
                    {plan.templates === 'unlimited' ? 'Modèles illimités' : `${plan.templates} modèle de facture`}
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className={`w-5 h-5 flex-shrink-0 mt-0.5 ${plan.emailAutomation ? 'text-green-600' : 'text-gray-300'}`} />
                  <span className={`text-sm ${plan.emailAutomation ? 'text-white' : 'text-gray-400'}`}>
                    Envoi email automatique
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className={`w-5 h-5 flex-shrink-0 mt-0.5 ${plan.paymentReminders ? 'text-green-600' : 'text-gray-300'}`} />
                  <span className={`text-sm ${plan.paymentReminders ? 'text-white' : 'text-gray-400'}`}>
                    Rappels de paiement
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className={`w-5 h-5 flex-shrink-0 mt-0.5 ${plan.advancedStats ? 'text-green-600' : 'text-gray-300'}`} />
                  <span className={`text-sm ${plan.advancedStats ? 'text-white' : 'text-gray-400'}`}>
                    Statistiques avancées
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className={`w-5 h-5 flex-shrink-0 mt-0.5 ${plan.multiUser ? 'text-green-600' : 'text-gray-300'}`} />
                  <span className={`text-sm ${plan.multiUser ? 'text-white' : 'text-gray-400'}`}>
                    Multi-utilisateurs
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className={`w-5 h-5 flex-shrink-0 mt-0.5 ${plan.electronicSignature ? 'text-green-600' : 'text-gray-300'}`} />
                  <span className={`text-sm ${plan.electronicSignature ? 'text-white' : 'text-gray-400'}`}>
                    Signature électronique
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className={`w-5 h-5 flex-shrink-0 mt-0.5 ${plan.csvExport ? 'text-green-600' : 'text-gray-300'}`} />
                  <span className={`text-sm ${plan.csvExport ? 'text-white' : 'text-gray-400'}`}>
                    Export CSV comptable
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className={`w-5 h-5 flex-shrink-0 mt-0.5 ${plan.advancedOCR ? 'text-green-600' : 'text-yellow-500'}`} />
                  <span className={`text-sm ${plan.advancedOCR ? 'text-white' : 'text-gray-400'}`}>
                    {plan.advancedOCR ? '🤖 Scan factures IA (Google Vision)' : '📸 Scan factures (70% précision)'}
                  </span>
                </li>
              </ul>

              {/* CTA */}
              {isCurrent ? (
                <Button
                  disabled
                  variant="outline"
                  className="w-full text-white"
                >
                  Plan actuel
                </Button>
              ) : (
                <Button
                  onClick={() => handleUpgrade(key)}
                  disabled={isLoading}
                  className={`w-full ${
                    popular
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700'
                      : ''
                  }`}
                  variant={popular ? 'default' : 'outline'}
                >
                  {isLoading ? 'Chargement...' : cta}
                </Button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
