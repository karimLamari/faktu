'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Check, ChevronRight, X } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  link: string;
  icon: string;
}

interface OnboardingChecklistProps {
  user: {
    firstName?: string;
    companyName?: string;
    address?: any;
    iban?: string;
    subscription?: {
      plan?: 'free' | 'pro' | 'business';
      status?: string;
    };
  };
  stats: {
    clientCount: number;
    invoiceCount: number;
  };
}

export default function OnboardingChecklist({ user, stats }: OnboardingChecklistProps) {
  const [dismissed, setDismissed] = useState(false);
  
  // Get plan from subscription (same logic as UsageBar)
  const plan = user.subscription?.plan || 'free';

  // DEBUG LOGS
  useEffect(() => {
    console.log('🔍 OnboardingChecklist - User data:', user);
    console.log('🔍 OnboardingChecklist - Subscription:', user.subscription);
    console.log('🔍 OnboardingChecklist - Plan détecté:', plan);
    console.log('🔍 OnboardingChecklist - Stats:', stats);
  }, [user, plan, stats]);

  // Check if onboarding was dismissed previously
  useEffect(() => {
    const wasDismissed = localStorage.getItem('onboarding-dismissed');
    if (wasDismissed === 'true') {
      setDismissed(true);
    }
  }, []);

  // Calculate progress
  const isProfileComplete = Boolean(
    user.companyName && 
    user.address?.street && 
    user.iban
  );
  const hasClients = stats.clientCount > 0;
  const hasInvoices = stats.invoiceCount > 0;

  const steps: OnboardingStep[] = [
    {
      id: 'profile',
      title: 'Complétez votre profil',
      description: 'Ajoutez vos informations d\'entreprise pour créer des factures conformes',
      completed: isProfileComplete,
      link: '/dashboard/settings?edit=true',
      icon: '👤',
    },
    {
      id: 'client',
      title: 'Créez votre premier client',
      description: 'Ajoutez un client pour pouvoir lui envoyer des factures',
      completed: hasClients,
      link: '/dashboard/clients',
      icon: '👥',
    },
    {
      id: 'invoice',
      title: 'Générez votre première facture',
      description: 'Créez et envoyez votre première facture en moins de 2 minutes',
      completed: hasInvoices,
      link: '/dashboard/invoices',
      icon: '📄',
    },
  ];

  const completedSteps = steps.filter(s => s.completed).length;
  const totalSteps = steps.length;
  const progressPercentage = (completedSteps / totalSteps) * 100;
  const isComplete = completedSteps === totalSteps;

  // DEBUG LOGS
  console.log('🔍 OnboardingChecklist - Dismissed:', dismissed);
  console.log('🔍 OnboardingChecklist - Is Complete:', isComplete);
  console.log('🔍 OnboardingChecklist - Progress:', `${completedSteps}/${totalSteps}`);
  console.log('🔍 OnboardingChecklist - Should show:', !dismissed && !isComplete && plan === 'free');

  // Don't show if dismissed, complete, or not on free plan
  if (dismissed || isComplete || plan !== 'free') {
    console.log('❌ OnboardingChecklist - MASQUÉ car:', {
      dismissed,
      isComplete,
      isPro: plan !== 'free',
      plan
    });
    return null;
  }

  console.log('✅ OnboardingChecklist - AFFICHÉ');


  const handleDismiss = () => {
    localStorage.setItem('onboarding-dismissed', 'true');
    setDismissed(true);
  };

  return (
    <Card className="relative border-purple-500/30 bg-gradient-to-br from-purple-900/20 via-gray-900/90 to-gray-900/90 backdrop-blur-xl p-6 mb-6">
      {/* Close button */}
      <button
        onClick={handleDismiss}
        className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        aria-label="Fermer"
      >
        <X className="w-5 h-5" />
      </button>

      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">
          👋 Bienvenue {user.firstName || 'sur BLINK'} !
        </h2>
        <p className="text-gray-300 text-sm">
          Suivez ces étapes pour commencer à facturer en quelques minutes
        </p>
      </div>

      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-300">
            Progression
          </span>
          <span className="text-sm font-semibold text-purple-400">
            {completedSteps}/{totalSteps} étapes complétées
          </span>
        </div>
        <div className="w-full bg-gray-800 rounded-full h-3 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-purple-600 to-pink-600 transition-all duration-500 ease-out"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Steps */}
      <div className="space-y-3">
        {steps.map((step, index) => (
          <Link
            key={step.id}
            href={step.link}
            className={`
              block p-4 rounded-lg border transition-all duration-200
              ${step.completed
                ? 'border-green-500/30 bg-green-900/10'
                : 'border-gray-700/50 bg-gray-800/30 hover:border-purple-500/50 hover:bg-purple-900/10'
              }
            `}
          >
            <div className="flex items-center gap-4">
              {/* Step number or checkmark */}
              <div className={`
                flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-lg font-semibold
                ${step.completed
                  ? 'bg-green-500/20 text-green-400'
                  : 'bg-purple-500/20 text-purple-400'
                }
              `}>
                {step.completed ? (
                  <Check className="w-6 h-6" />
                ) : (
                  <span>{step.icon}</span>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <h3 className={`
                  font-semibold mb-1
                  ${step.completed ? 'text-green-400 line-through' : 'text-white'}
                `}>
                  {step.title}
                </h3>
                <p className={`
                  text-sm
                  ${step.completed ? 'text-green-400/60' : 'text-gray-400'}
                `}>
                  {step.description}
                </p>
              </div>

              {/* Arrow */}
              {!step.completed && (
                <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
              )}
            </div>
          </Link>
        ))}
      </div>

      {/* Footer CTA */}
      {completedSteps > 0 && completedSteps < totalSteps && (
        <div className="mt-6 pt-6 border-t border-gray-700/50">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-400">
              Plus que {totalSteps - completedSteps} étape{totalSteps - completedSteps > 1 ? 's' : ''} !
            </p>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              className="text-gray-400 hover:text-white"
            >
              Je le ferai plus tard
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
