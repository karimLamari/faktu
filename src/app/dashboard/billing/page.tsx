import { auth } from '@/lib/auth/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { PlanBadge } from '@/components/subscription/PlanBadge';
import { UsageBar } from '@/components/subscription/UsageBar';
import dbConnect from '@/lib/db/mongodb';
import User from '@/models/User';
import { PLANS } from '@/lib/subscription/plans';
import { SubscriptionPlan } from '@/types/subscription';

export default async function BillingPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/login');
  }

  await dbConnect();
  const user = await User.findById(session.user.id);

  const plan = (user?.subscription?.plan || 'free') as SubscriptionPlan;
  const currentPlan = PLANS[plan];
  const usage = user?.usage || {
    invoicesThisMonth: 0,
    quotesThisMonth: 0,
    clientsCount: 0,
    lastResetDate: new Date(),
  };

  const subscription = user?.subscription;
  const isActive = subscription?.status === 'active';
  const isTrialing = subscription?.status === 'trialing';
  const isCanceled = subscription?.cancelAtPeriodEnd;
  const nextBillingDate = subscription?.currentPeriodEnd;
  const trialEndsAt = subscription?.trialEndsAt;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Facturation & Abonnement</h1>
        <p className="mt-2 text-gray-400">
          Gérez votre plan d'abonnement et consultez votre utilisation
        </p>
      </div>

      {/* Current Plan Card */}
      <div className="bg-gray-900/80 backdrop-blur-lg border border-gray-700/50 rounded-xl p-6 shadow-sm">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold text-white">Plan actuel</h2>
            <div className="flex items-center gap-3">
              <PlanBadge plan={plan} size="lg" />
              {isCanceled && (
                <span className="text-sm text-orange-600 font-medium">
                  Annulation programmée
                </span>
              )}
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-white">
              {currentPlan.price === 0 ? (
                'Gratuit'
              ) : (
                <>
                  {currentPlan.price}€
                  <span className="text-sm font-normal text-gray-500">/mois</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Status Messages */}
        {isTrialing && trialEndsAt && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              🎉 <strong>Essai gratuit actif !</strong> Votre période d'essai se termine le{' '}
              <strong>{new Date(trialEndsAt).toLocaleDateString('fr-FR')}</strong>.
              Vous ne serez facturé qu'après cette date.
            </p>
          </div>
        )}

        {isCanceled && nextBillingDate && (
          <div className="mt-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <p className="text-sm text-orange-800">
              Votre abonnement sera annulé le{' '}
              <strong>{new Date(nextBillingDate).toLocaleDateString('fr-FR')}</strong>.
              Vous conserverez l'accès à vos fonctionnalités jusqu'à cette date.
            </p>
          </div>
        )}

        {isActive && !isCanceled && nextBillingDate && plan !== 'free' && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-800">
              Prochain renouvellement le{' '}
              <strong>{new Date(nextBillingDate).toLocaleDateString('fr-FR')}</strong>
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-6 flex flex-wrap gap-3">
          {plan === 'free' ? (
            <Link
              href="/dashboard/pricing"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
            >
              Passer à Pro ou Business
            </Link>
          ) : (
            <>
              <Link
                href="/dashboard/pricing"
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-300 bg-gray-800/50 hover:bg-gray-700/50 transition-colors"
              >
                Changer de plan
              </Link>
              {subscription?.stripeCustomerId && (
                <form action="/api/subscription/portal" method="POST" className="inline">
                  <button
                    type="submit"
                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-300 bg-gray-800/50 hover:bg-gray-700/50 transition-colors"
                  >
                    Gérer mon abonnement
                  </button>
                </form>
              )}
            </>
          )}
        </div>
      </div>

      {/* Usage Stats */}
      <div className="bg-gray-900/80 backdrop-blur-lg border border-gray-700/50 rounded-xl p-6 shadow-sm space-y-6">
        <h2 className="text-lg font-semibold text-white">Utilisation ce mois-ci</h2>

        {/* Invoices Usage */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-gray-700">Factures</span>
            <span className="text-gray-500">
              {usage.invoicesThisMonth} / {currentPlan.invoicesPerMonth === 'unlimited' ? '∞' : currentPlan.invoicesPerMonth}
            </span>
          </div>
          <UsageBar
            current={usage.invoicesThisMonth}
            limit={currentPlan.invoicesPerMonth === 'unlimited' ? 'unlimited' : currentPlan.invoicesPerMonth}
            label="Factures ce mois"
            upgradeLink="/dashboard/pricing"
          />
        </div>

        {/* Quotes Usage */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-gray-700">Devis</span>
            <span className="text-gray-500">
              {usage.quotesThisMonth} / {currentPlan.invoicesPerMonth === 'unlimited' ? '∞' : currentPlan.invoicesPerMonth}
            </span>
          </div>
          <UsageBar
            current={usage.quotesThisMonth}
            limit={currentPlan.invoicesPerMonth === 'unlimited' ? 'unlimited' : currentPlan.invoicesPerMonth}
            label="Devis ce mois"
            upgradeLink="/dashboard/pricing"
          />
        </div>

        {/* Clients Usage */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-gray-700">Clients</span>
            <span className="text-gray-500">
              {usage.clientsCount} / {currentPlan.clients === 'unlimited' ? '∞' : currentPlan.clients}
            </span>
          </div>
          <UsageBar
            current={usage.clientsCount}
            limit={currentPlan.clients === 'unlimited' ? 'unlimited' : currentPlan.clients}
            label="Clients"
            upgradeLink="/dashboard/pricing"
          />
        </div>

        <p className="text-xs text-gray-500 pt-4 border-t border-gray-200">
          Les compteurs se réinitialisent automatiquement chaque mois à la date anniversaire de votre abonnement.
        </p>
      </div>

      {/* Features Overview */}
      <div className="bg-gray-900/80 backdrop-blur-lg border border-gray-700/50 rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-white mb-4">
          Fonctionnalités de votre plan
        </h2>
        <ul className="space-y-3">
          <li className="flex items-start gap-3">
            <svg
              className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            <span className="text-sm text-gray-700">
              {currentPlan.invoicesPerMonth === 'unlimited' ? 'Factures illimitées' : `${currentPlan.invoicesPerMonth} factures par mois`}
            </span>
          </li>
          <li className="flex items-start gap-3">
            <svg
              className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            <span className="text-sm text-gray-700">
              {currentPlan.clients === 'unlimited' ? 'Clients illimités' : `${currentPlan.clients} clients maximum`}
            </span>
          </li>
          {currentPlan.ocrScans && (
            <li className="flex items-start gap-3">
              <svg
                className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <span className="text-sm text-gray-700">Scan OCR des factures</span>
            </li>
          )}
          {currentPlan.emailAutomation && (
            <li className="flex items-start gap-3">
              <svg
                className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <span className="text-sm text-gray-700">Envoi email automatique</span>
            </li>
          )}
          {currentPlan.paymentReminders && (
            <li className="flex items-start gap-3">
              <svg
                className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <span className="text-sm text-gray-700">Rappels de paiement</span>
            </li>
          )}
          {currentPlan.multiUser && (
            <li className="flex items-start gap-3">
              <svg
                className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <span className="text-sm text-gray-700">Multi-utilisateurs</span>
            </li>
          )}
          {currentPlan.apiAccess && (
            <li className="flex items-start gap-3">
              <svg
                className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <span className="text-sm text-gray-700">Accès API</span>
            </li>
          )}
         
        </ul>
      </div>

      {/* Payment History */}
      {subscription?.stripeCustomerId && (
        <div className="bg-gray-900/80 backdrop-blur-lg border border-gray-700/50 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Historique des paiements</h2>
            <form action="/api/subscription/portal" method="POST" className="inline">
              <button
                type="submit"
                className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
              >
                Voir tout →
              </button>
            </form>
          </div>
          <p className="text-sm text-gray-400">
            Consultez vos factures et l'historique de vos paiements dans le portail client Stripe.
          </p>
        </div>
      )}

      {/* Help Section */}
      <div className="bg-gray-900/80 backdrop-blur-lg border border-gray-700/50 rounded-xl p-6">
        <h3 className="text-sm font-semibold text-white mb-2">Besoin d'aide ?</h3>
        <p className="text-sm text-gray-400 mb-4">
          Si vous avez des questions sur votre facturation ou votre abonnement, notre équipe est là pour vous aider.
        </p>
        <a
          href="mailto:support@blink.app"
          className="text-sm text-indigo-400 hover:text-indigo-300 font-medium"
        >
          Contacter le support →
        </a>
      </div>
    </div>
  );
}
