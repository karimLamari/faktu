'use client';

import { useRouter } from 'next/navigation';
import { X, AlertCircle, Zap, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PLANS } from '@/lib/subscription/plans';

interface LimitReachedModalProps {
  isOpen: boolean;
  onClose: () => void;
  limitType: 'invoices' | 'quotes' | 'expenses' | 'clients';
  currentUsage: number;
  limit: number;
  currentPlan: 'free' | 'pro' | 'business';
}

const LIMIT_MESSAGES = {
  invoices: {
    title: 'Limite de factures atteinte',
    message: 'Vous avez atteint votre limite mensuelle de factures.',
    icon: '📄',
  },
  quotes: {
    title: 'Limite de devis atteinte',
    message: 'Vous avez atteint votre limite mensuelle de devis.',
    icon: '📋',
  },
  expenses: {
    title: 'Limite de dépenses atteinte',
    message: 'Vous avez atteint votre limite mensuelle de dépenses.',
    icon: '💳',
  },
  clients: {
    title: 'Limite de clients atteinte',
    message: 'Vous avez atteint votre limite de clients.',
    icon: '👥',
  },
};

/**
 * Modal affiché quand un utilisateur atteint sa limite de plan
 * Affiche un message clair et propose de passer au plan supérieur
 */
export function LimitReachedModal({
  isOpen,
  onClose,
  limitType,
  currentUsage,
  limit,
  currentPlan,
}: LimitReachedModalProps) {
  const router = useRouter();
  const config = LIMIT_MESSAGES[limitType];
  const proPlan = PLANS.pro;

  if (!isOpen) {
    return null;
  }

  const handleUpgrade = () => {
    router.push('/dashboard/pricing');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in p-4">
      <div className="bg-gray-900/95 backdrop-blur-lg rounded-2xl shadow-2xl border border-gray-700/50 w-full max-w-md max-h-[90vh] overflow-y-auto animate-slide-in-up">
        {/* Header avec gradient rouge/orange */}
        <div className="bg-gradient-to-r from-red-600 to-orange-600 p-6 text-white relative rounded-t-2xl">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white hover:bg-white/10 p-2 rounded-lg transition-colors"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 mb-2">
            <div className="text-4xl">{config.icon}</div>
            <div>
              <h2 className="text-2xl font-bold">{config.title}</h2>
              <p className="text-red-100 text-sm mt-1">
                {currentUsage} / {limit} utilisé{currentUsage > 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Message principal */}
          <div className="bg-red-900/20 border border-red-700/50 rounded-xl p-4 space-y-2">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div className="space-y-2">
                <p className="text-sm text-red-200 font-medium">
                  {config.message}
                </p>
                <p className="text-sm text-gray-300">
                  Pour continuer à utiliser cette fonctionnalité, passez au plan <span className="font-bold text-white">Pro</span>.
                </p>
              </div>
            </div>
          </div>

          {/* Plan Pro features highlight */}
          <div className="bg-gradient-to-br from-blue-900/30 to-indigo-900/30 border border-blue-700/50 rounded-xl p-5 space-y-4">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-blue-400" />
              <h3 className="text-base font-semibold text-white">Plan Pro</h3>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="space-y-1">
                <p className="text-gray-400">Factures</p>
                <p className="text-xl font-bold text-white">
                  {proPlan.invoicesPerMonth === 'unlimited' ? '∞' : proPlan.invoicesPerMonth}
                  <span className="text-sm text-gray-400 font-normal">/mois</span>
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-gray-400">Devis</p>
                <p className="text-xl font-bold text-white">
                  {proPlan.quotesPerMonth === 'unlimited' ? '∞' : proPlan.quotesPerMonth}
                  <span className="text-sm text-gray-400 font-normal">/mois</span>
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-gray-400">Dépenses</p>
                <p className="text-xl font-bold text-white">
                  {proPlan.expensesPerMonth === 'unlimited' ? '∞' : proPlan.expensesPerMonth}
                  <span className="text-sm text-gray-400 font-normal">/mois</span>
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-gray-400">Clients</p>
                <p className="text-xl font-bold text-white">
                  {proPlan.clients === 'unlimited' ? '∞' : proPlan.clients}
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-blue-700/30 space-y-2 text-sm text-gray-300">
              <p className="flex items-center gap-2">
                <span className="text-green-400">✓</span> OCR intelligent Google AI
              </p>
              <p className="flex items-center gap-2">
                <span className="text-green-400">✓</span> Envoi email automatique
              </p>
              <p className="flex items-center gap-2">
                <span className="text-green-400">✓</span> Rappels de paiement
              </p>
              <p className="flex items-center gap-2">
                <span className="text-green-400">✓</span> Signature électronique
              </p>
            </div>
          </div>

          {/* Prix */}
          <div className="text-center">
            <div className="flex items-baseline justify-center gap-2">
              <span className="text-4xl font-bold text-white">{proPlan.price}€</span>
              <span className="text-gray-400">/mois</span>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              ou {proPlan.priceAnnual}€/an (2 mois offerts)
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-700/50 bg-gray-800/50 space-y-3">
          <Button
            onClick={handleUpgrade}
            className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-base font-semibold shadow-lg shadow-blue-500/20"
          >
            Passer au plan Pro
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>

          <button
            onClick={onClose}
            className="w-full py-2 text-sm text-gray-400 hover:text-gray-300 transition-colors"
          >
            Peut-être plus tard
          </button>

          <p className="text-xs text-center text-gray-500">
            14 jours d'essai gratuit • Annulation à tout moment
          </p>
        </div>
      </div>
    </div>
  );
}
