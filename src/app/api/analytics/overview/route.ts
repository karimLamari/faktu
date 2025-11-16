import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import dbConnect from '@/lib/db/mongodb';
import User, { type ISubscription } from '@/models/User';
import {
  getRevenueOverview,
  getExpenseOverview,
  getMonthlyTrends,
  getTopClients,
  getVATBreakdown,
  getQuoteConversionMetrics,
  getPaymentMethodDistribution,
} from '@/lib/analytics/queries';
import { calculateFinancialMetrics } from '@/lib/analytics/calculations';
import { getDateRangeForPeriod, getPreviousPeriod, type PeriodType } from '@/lib/analytics/utils';

/**
 * GET /api/analytics/overview
 * Returns comprehensive analytics data for the dashboard
 * RESTRICTION: Pro et Business uniquement
 *
 * Query params:
 * - period: 'this_month' | 'last_month' | 'this_quarter' | 'this_year' | 'last_year' | 'custom'
 * - startDate: ISO string (required if period === 'custom')
 * - endDate: ISO string (required if period === 'custom')
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    await dbConnect();

    // Vérifier l'abonnement (Pro/Business uniquement)
    const user = await User.findById(session.user.id).select('subscription').lean<{
      subscription?: ISubscription;
    }>();
    const plan = user?.subscription?.plan || 'free';
    
    if (!['pro', 'business'].includes(plan)) {
      return NextResponse.json({ 
        error: 'Fonctionnalité Premium', 
        message: 'Les analytiques avancées sont disponibles uniquement pour les abonnements Pro et Business.',
        requiredPlan: ['pro', 'business']
      }, { status: 403 });
    }

    // Parse query parameters
    const { searchParams } = request.nextUrl;
    const period = (searchParams.get('period') || 'this_month') as PeriodType;
    const startDateParam = searchParams.get('startDate');
    const endDateParam = searchParams.get('endDate');

    // Get date range
    let dateRange;
    if (period === 'custom' && startDateParam && endDateParam) {
      dateRange = {
        startDate: new Date(startDateParam),
        endDate: new Date(endDateParam),
      };
    } else {
      dateRange = getDateRangeForPeriod(period);
    }

    // Get previous period for comparison
    const previousDateRange = getPreviousPeriod(dateRange);

    // Fetch all analytics data in parallel
    const [
      revenueData,
      expenseData,
      monthlyTrends,
      topClients,
      vatBreakdown,
      quoteMetrics,
      paymentMethodDist,
      previousRevenueData,
      previousExpenseData,
    ] = await Promise.all([
      getRevenueOverview(session.user.id, dateRange),
      getExpenseOverview(session.user.id, dateRange),
      getMonthlyTrends(session.user.id, dateRange),
      getTopClients(session.user.id, dateRange, 5),
      getVATBreakdown(session.user.id, dateRange),
      getQuoteConversionMetrics(session.user.id, dateRange),
      getPaymentMethodDistribution(session.user.id, dateRange),
      getRevenueOverview(session.user.id, previousDateRange),
      getExpenseOverview(session.user.id, previousDateRange),
    ]);

    // Calculate financial metrics
    const metrics = calculateFinancialMetrics(
      revenueData.totalRevenue,
      revenueData.totalVAT,
      expenseData.totalExpenses,
      expenseData.totalDeductibleVAT
    );

    const previousMetrics = calculateFinancialMetrics(
      previousRevenueData.totalRevenue,
      previousRevenueData.totalVAT,
      previousExpenseData.totalExpenses,
      previousExpenseData.totalDeductibleVAT
    );

    // Calculate percentage changes
    const calculateChange = (current: number, previous: number): number => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return ((current - previous) / previous) * 100;
    };

    const response = {
      period,
      dateRange: {
        startDate: dateRange.startDate.toISOString(),
        endDate: dateRange.endDate.toISOString(),
      },

      // KPIs with changes
      kpis: {
        revenue: {
          value: metrics.revenue,
          change: calculateChange(metrics.revenue, previousMetrics.revenue),
          previous: previousMetrics.revenue,
        },
        expenses: {
          value: metrics.expenses,
          change: calculateChange(metrics.expenses, previousMetrics.expenses),
          previous: previousMetrics.expenses,
        },
        netProfit: {
          value: metrics.netProfit,
          change: calculateChange(metrics.netProfit, previousMetrics.netProfit),
          previous: previousMetrics.netProfit,
        },
        vatCollected: {
          value: metrics.vatCollected,
          change: calculateChange(metrics.vatCollected, previousMetrics.vatCollected),
          previous: previousMetrics.vatCollected,
        },
        vatDeductible: {
          value: metrics.vatDeductible,
          change: calculateChange(metrics.vatDeductible, previousMetrics.vatDeductible),
          previous: previousMetrics.vatDeductible,
        },
        vatPayable: {
          value: metrics.vatPayable,
          change: calculateChange(metrics.vatPayable, previousMetrics.vatPayable),
          previous: previousMetrics.vatPayable,
        },
        averageInvoiceValue: {
          value: revenueData.averageInvoiceValue,
          change: calculateChange(
            revenueData.averageInvoiceValue,
            previousRevenueData.averageInvoiceValue
          ),
          previous: previousRevenueData.averageInvoiceValue,
        },
        outstandingAmount: {
          value: revenueData.pendingAmount + revenueData.overdueAmount,
          change: calculateChange(
            revenueData.pendingAmount + revenueData.overdueAmount,
            previousRevenueData.pendingAmount + previousRevenueData.overdueAmount
          ),
          previous: previousRevenueData.pendingAmount + previousRevenueData.overdueAmount,
        },
      },

      // Detailed revenue data
      revenue: {
        total: revenueData.totalRevenue,
        vat: revenueData.totalVAT,
        paid: revenueData.paidAmount,
        pending: revenueData.pendingAmount,
        overdue: revenueData.overdueAmount,
        invoiceCount: revenueData.count,
      },

      // Detailed expense data
      expenses: {
        total: expenseData.totalExpenses,
        deductibleVAT: expenseData.totalDeductibleVAT,
        count: expenseData.count,
        byCategory: expenseData.byCategory,
      },

      // Monthly trends
      trends: monthlyTrends.map((trend) => ({
        year: trend.year,
        month: trend.month,
        revenue: trend.revenue,
        expenses: trend.expenses,
        profit: trend.revenue - trend.expenses,
        vat: trend.vat,
        invoiceCount: trend.invoiceCount,
        expenseCount: trend.expenseCount,
      })),

      // Top clients
      topClients: topClients.map((client) => ({
        id: client.clientId,
        name: client.clientName,
        revenue: client.totalRevenue,
        invoiceCount: client.invoiceCount,
        averageValue: client.averageInvoiceValue,
      })),

      // VAT breakdown
      vatBreakdown: vatBreakdown.map((item) => ({
        rate: item.rate,
        totalVAT: item.totalVAT,
        baseAmount: item.baseAmount,
        count: item.count,
      })),

      // Quote conversion metrics
      quotes: {
        total: quoteMetrics.totalQuotes,
        converted: quoteMetrics.convertedQuotes,
        conversionRate: quoteMetrics.conversionRate,
        accepted: quoteMetrics.acceptedQuotes,
        rejected: quoteMetrics.rejectedQuotes,
        expired: quoteMetrics.expiredQuotes,
      },

      // Payment method distribution
      paymentMethods: paymentMethodDist.map((item) => ({
        method: item.method,
        count: item.count,
        totalAmount: item.totalAmount,
      })),

      // Financial health indicators
      health: {
        grossMargin: metrics.grossMargin,
        profitMargin: metrics.revenue > 0 ? (metrics.netProfit / metrics.revenue) * 100 : 0,
      },
    };

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Analytics overview error:', error);
    return NextResponse.json(
      { error: 'Erreur lors du chargement des analytiques', details: error.message },
      { status: 500 }
    );
  }
}
