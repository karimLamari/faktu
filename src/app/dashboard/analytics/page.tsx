'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  CreditCard,
  Wallet,
  Receipt,
  FileText,
  ArrowUpRight,
  Loader2,
  Lock,
} from 'lucide-react';
import { KPICard } from '@/components/analytics/KPICard';
import { DateRangeSelector } from '@/components/analytics/DateRangeSelector';
import { RevenueExpenseChart } from '@/components/analytics/RevenueExpenseChart';
import { ExpenseByCategoryChart } from '@/components/analytics/ExpenseByCategoryChart';
import { TopClientsChart } from '@/components/analytics/TopClientsChart';
import { VATBreakdownChart } from '@/components/analytics/VATBreakdownChart';
import { PeriodType } from '@/lib/analytics/utils';
import { useSubscription } from '@/hooks/useSubscription';
import { UpgradeModal } from '@/components/subscription/UpgradeModal';

interface AnalyticsData {
  kpis: {
    revenue: { value: number; change: number };
    expenses: { value: number; change: number };
    netProfit: { value: number; change: number };
    vatCollected: { value: number; change: number };
    vatDeductible: { value: number; change: number };
    vatPayable: { value: number; change: number };
    averageInvoiceValue: { value: number; change: number };
    outstandingAmount: { value: number; change: number };
  };
  trends: Array<{
    year: number;
    month: number;
    revenue: number;
    expenses: number;
    profit: number;
  }>;
  expenses: {
    byCategory: Array<{
      category: string;
      amount: number;
      taxAmount: number;
      count: number;
    }>;
  };
  topClients: Array<{
    id: string;
    name: string;
    revenue: number;
    invoiceCount: number;
    averageValue: number;
  }>;
  vatBreakdown: Array<{
    rate: number;
    totalVAT: number;
    baseAmount: number;
    count: number;
  }>;
  quotes: {
    total: number;
    converted: number;
    conversionRate: number;
  };
}

export default function AnalyticsPage() {
  const router = useRouter();
  const { data: subscriptionData, loading: subscriptionLoading } = useSubscription();
  const [period, setPeriod] = useState<PeriodType>('this_month');
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // Vérifier l'accès aux analytics (Pro/Business uniquement)
  const hasAccess = subscriptionData?.plan && ['pro', 'business'].includes(subscriptionData.plan);

  useEffect(() => {
    if (!subscriptionLoading) {
      if (!hasAccess) {
        // Afficher la modale d'upgrade
        setShowUpgradeModal(true);
        setLoading(false);
      } else {
        fetchAnalytics();
      }
    }
  }, [period, hasAccess, subscriptionLoading]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({ period });
      const response = await fetch(`/api/analytics/overview?${params}`);

      if (!response.ok) {
        throw new Error('Erreur lors du chargement des données');
      }

      const result = await response.json();
      setData(result);
    } catch (err: any) {
      console.error('Analytics fetch error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (subscriptionLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-indigo-500 mx-auto mb-4" />
          <p className="text-gray-400">Vérification de votre abonnement...</p>
        </div>
      </div>
    );
  }

  // Afficher la modale d'upgrade si pas d'accès
  if (!hasAccess) {
    return (
      <>
        <div className="min-h-screen flex items-center justify-center px-4">
          <div className="max-w-4xl w-full">
            {/* Aperçu flou des analytiques */}
            <div className="relative">
              {/* Overlay de flou */}
              <div className="absolute inset-0 backdrop-blur-xl bg-gray-900/60 z-10 flex items-center justify-center rounded-2xl border-2 border-indigo-500/30">
                <div className="text-center">
                  <div className="w-20 h-20 bg-indigo-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-indigo-500/50">
                    <Lock className="w-10 h-10 text-indigo-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">
                    Analytiques Avancées
                  </h2>
                  <p className="text-gray-300 mb-6 max-w-md mx-auto">
                    Débloquez les statistiques en temps réel, l'analyse par client, la gestion TVA et bien plus encore
                  </p>
                  <div className="flex items-center justify-center gap-2">
                    <span className="px-3 py-1 bg-indigo-500/20 border border-indigo-500/50 rounded-full text-sm text-indigo-300 font-semibold">
                      Pro
                    </span>
                    <span className="text-gray-400">ou</span>
                    <span className="px-3 py-1 bg-purple-500/20 border border-purple-500/50 rounded-full text-sm text-purple-300 font-semibold">
                      Business
                    </span>
                  </div>
                </div>
              </div>

              {/* Contenu fantôme en arrière-plan */}
              <div className="p-8 space-y-6 opacity-40">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6 h-32" />
                  ))}
                </div>
                <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6 h-64" />
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6 h-64" />
                  <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6 h-64" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modale d'upgrade */}
        <UpgradeModal
          isOpen={showUpgradeModal}
          onClose={() => {
            setShowUpgradeModal(false);
            router.push('/dashboard');
          }}
          feature="Analytiques avancées"
          currentPlan={(subscriptionData?.plan as any) || 'free'}
          requiredPlan="pro"
        />
      </>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-indigo-500 mx-auto mb-4" />
          <p className="text-gray-400">Chargement des analytiques...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error || 'Erreur de chargement'}</p>
          <button
            onClick={fetchAnalytics}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Analytiques</h1>
          <p className="mt-2 text-gray-400">
            Vue d'ensemble de votre activité et performance financière
          </p>
        </div>
      </div>

      {/* Date Range Selector */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <DateRangeSelector value={period} onChange={setPeriod} />
      </div>

      {/* KPIs Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Chiffre d'affaires"
          value={data.kpis.revenue.value}
          change={data.kpis.revenue.change}
          format="currency"
          icon={<DollarSign className="w-6 h-6" />}
          isPositiveGood={true}
        />
        <KPICard
          title="Dépenses"
          value={data.kpis.expenses.value}
          change={data.kpis.expenses.change}
          format="currency"
          icon={<CreditCard className="w-6 h-6" />}
          isPositiveGood={false}
        />
        <KPICard
          title="Bénéfice net"
          value={data.kpis.netProfit.value}
          change={data.kpis.netProfit.change}
          format="currency"
          icon={<Wallet className="w-6 h-6" />}
          isPositiveGood={true}
        />
        <KPICard
          title="TVA à payer"
          value={data.kpis.vatPayable.value}
          change={data.kpis.vatPayable.change}
          format="currency"
          icon={<Receipt className="w-6 h-6" />}
          isPositiveGood={false}
        />
      </div>

      {/* Secondary KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="TVA collectée"
          value={data.kpis.vatCollected.value}
          change={data.kpis.vatCollected.change}
          format="currency"
          isPositiveGood={true}
        />
        <KPICard
          title="TVA déductible"
          value={data.kpis.vatDeductible.value}
          change={data.kpis.vatDeductible.change}
          format="currency"
          isPositiveGood={true}
        />
        <KPICard
          title="Valeur moyenne facture"
          value={data.kpis.averageInvoiceValue.value}
          change={data.kpis.averageInvoiceValue.change}
          format="currency"
          isPositiveGood={true}
        />
        <KPICard
          title="En attente"
          value={data.kpis.outstandingAmount.value}
          change={data.kpis.outstandingAmount.change}
          format="currency"
          isPositiveGood={false}
        />
      </div>

      {/* Charts - Row 1 */}
      <div className="grid grid-cols-1 gap-6">
        <RevenueExpenseChart data={data.trends} />
      </div>

      {/* Charts - Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ExpenseByCategoryChart data={data.expenses.byCategory} />
        <TopClientsChart data={data.topClients} />
      </div>

      {/* Charts - Row 3 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <VATBreakdownChart data={data.vatBreakdown} />

        {/* Quote Conversion Card */}
        <div className="bg-gray-900/80 backdrop-blur-lg border border-gray-700/50 rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-white mb-6">
            Taux de conversion devis
          </h3>

          <div className="space-y-6">
            <div className="text-center">
              <div className="text-5xl font-bold text-indigo-400 mb-2">
                {data.quotes.conversionRate.toFixed(1)}%
              </div>
              <p className="text-gray-400 text-sm">
                {data.quotes.converted} devis convertis sur {data.quotes.total}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700/50 text-center">
                <p className="text-2xl font-bold text-white">{data.quotes.total}</p>
                <p className="text-xs text-gray-400 mt-1">Total devis</p>
              </div>
              <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700/50 text-center">
                <p className="text-2xl font-bold text-green-500">{data.quotes.converted}</p>
                <p className="text-xs text-gray-400 mt-1">Convertis</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-4">
        <p className="text-sm text-gray-400 text-center">
          Les données sont actualisées en temps réel. Dernière mise à jour :{' '}
          {new Date().toLocaleString('fr-FR')}
        </p>
      </div>
    </div>
  );
}
