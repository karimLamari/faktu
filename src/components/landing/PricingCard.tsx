'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, X, Sparkles, Zap, Crown } from 'lucide-react';
import { PlanFeatures } from '@/types/subscription';

interface PricingCardProps {
  plan: PlanFeatures;
  planKey: 'free' | 'pro' | 'business';
  highlighted?: boolean;
  badge?: string;
  topRightBadge?: string; // Badge en haut à droite (ex: "🚀 BIENTÔT")
  ctaText: string;
  ctaHref: string;
  disabled?: boolean;
  className?: string;
}

// Map planKey to icon
const iconMap = {
  free: Sparkles,
  pro: Zap,
  business: Crown,
};

export function PricingCard({
  plan,
  planKey,
  highlighted = false,
  badge,
  topRightBadge,
  disabled = false,
  ctaText,
  ctaHref,
  className = '',
}: PricingCardProps) {
  const Icon = iconMap[planKey];
  const features = [
    {
      label: plan.invoicesPerMonth === 'unlimited'
        ? 'Factures illimitées'
        : `${plan.invoicesPerMonth} factures par mois`,
      included: true,
    },
    {
      label: plan.quotesPerMonth === 'unlimited'
        ? 'Devis illimités'
        : `${plan.quotesPerMonth} devis par mois`,
      included: true,
    },
    {
      label: plan.expensesPerMonth === 'unlimited'
        ? 'Dépenses illimitées'
        : `${plan.expensesPerMonth} dépenses par mois`,
      included: true,
    },
    {
      label: plan.clients === 'unlimited'
        ? 'Clients illimités'
        : `${plan.clients} clients maximum`,
      included: true,
    },
    {
      label: plan.templates === 'unlimited'
        ? 'Modèles de facture illimités'
        : `${plan.templates} modèle de facture`,
      included: true,
    },
    {
      label: 'Export PDF professionnel',
      included: true,
    },
    {
      label: plan.advancedOCR
        ? '🤖 Scan factures IA (Google Vision)'
        : '📸 Scan factures (précision 70%)',
      included: true,
      description: plan.advancedOCR
        ? 'Reconnaissance automatique 90-95%'
        : 'Reconnaissance automatique basique',
    },
    {
      label: '📧 Envoi email automatique',
      included: plan.emailAutomation,
    },
    {
      label: '🔔 Rappels de paiement auto',
      included: plan.paymentReminders,
    },
    {
      label: '📊 Tableaux de bord avancés',
      included: plan.advancedStats,
    },
    {
      label: '✍️ Signature électronique client',
      included: plan.electronicSignature ?? false,
    },
    {
      label: '📄 Export comptable FEC',
      included: plan.csvExport ?? false,
    },
  ];

  return (
    <Card
      className={`border-2 ${
        highlighted
          ? 'border-blue-500 bg-gray-900/60 hover:shadow-2xl transition-all hover:-translate-y-2 relative scale-105 h-full'
          : planKey === 'business'
          ? 'border-purple-500/30 bg-gray-900/60 hover:shadow-xl hover:shadow-purple-500/10 transition-all hover:-translate-y-1 h-full backdrop-blur-sm'
          : 'border-gray-700/50 bg-gray-900/60 hover:shadow-xl hover:shadow-blue-500/10 transition-all hover:-translate-y-1 h-full backdrop-blur-sm'
      } ${className}`}
    >
      {badge && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg z-10">
          {badge}
        </div>
      )}

      {topRightBadge && (
        <div className="absolute top-4 right-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg z-10">
          {topRightBadge}
        </div>
      )}

      <CardHeader className={`text-center pb-6 ${badge ? 'pt-8' : ''}`}>
        <div
          className={`w-14 h-14 ${
            highlighted
              ? 'bg-gradient-to-br from-blue-600 to-indigo-600'
              : planKey === 'business'
              ? 'bg-gradient-to-br from-purple-600 to-pink-600'
              : 'bg-gray-800'
          } rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg`}
        >
          <Icon className={`w-7 h-7 ${highlighted || planKey === 'business' ? 'text-white' : 'text-gray-300'}`} />
        </div>
        <CardTitle className="text-2xl mb-3 text-white">{plan.name}</CardTitle>
        <div className="text-5xl font-bold text-white mb-2">{plan.price}€</div>
        <p className={highlighted ? 'text-gray-500' : 'text-gray-400'}>
          {planKey === 'free' ? 'Pour toujours' : 'par mois'}
        </p>
        {planKey !== 'free' && (
          <div className={`mt-2 text-sm font-semibold ${highlighted ? 'text-green-600' : 'text-green-400'}`}>
            {plan.priceAnnual}€/an (-17%)
          </div>
        )}
      </CardHeader>

      <CardContent>
        <ul className="space-y-4 mb-8">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start gap-3">
              {feature.included ? (
                <>
                  <Check
                    className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                      highlighted ? 'text-green-600' : 'text-green-400'
                    }`}
                  />
                  <span className={highlighted ? 'text-white' : 'text-gray-300'}>
                    {feature.label.includes('par mois') || feature.label.includes('maximum') ? (
                      <>
                        <strong className="text-white">
                          {feature.label.split(' ')[0]}{' '}
                          {feature.label.includes('illimité') ? feature.label.split(' ')[1] : ''}
                        </strong>
                        {' '}
                        {feature.label.split(' ').slice(feature.label.includes('illimité') ? 2 : 1).join(' ')}
                      </>
                    ) : (
                      feature.label
                    )}
                  </span>
                </>
              ) : (
                <>
                  <span className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0">✗</span>
                  <span className="text-gray-500 line-through">{feature.label}</span>
                </>
              )}
            </li>
          ))}
        </ul>

        <Button
          asChild={!disabled}
          disabled={disabled}
          className={`w-full h-12 rounded-xl ${
            highlighted
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg text-white font-bold'
              : disabled
              ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
              : 'border-gray-600 hover:bg-gray-800 text-white'
          }`}
          variant={highlighted ? 'default' : disabled ? 'default' : 'outline'}
        >
          {disabled ? (
            ctaText
          ) : (
            <Link href={ctaHref}>
              {ctaText}
            </Link>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
