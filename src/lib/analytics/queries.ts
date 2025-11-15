/**
 * MongoDB Aggregation Queries for Analytics
 * Optimized queries for financial metrics and business intelligence
 */

import Invoice from '@/models/Invoice';
import Expense from '@/models/Expense';
import Quote from '@/models/Quote';
import Client from '@/models/Client';
import mongoose from 'mongoose';

export interface DateRange {
  startDate: Date;
  endDate: Date;
}

export interface RevenueData {
  totalRevenue: number;
  totalVAT: number;
  count: number;
  averageInvoiceValue: number;
  paidAmount: number;
  pendingAmount: number;
  overdueAmount: number;
}

export interface ExpenseData {
  totalExpenses: number;
  totalDeductibleVAT: number;
  count: number;
  byCategory: Array<{ category: string; amount: number; taxAmount: number; count: number }>;
}

export interface MonthlyTrend {
  year: number;
  month: number;
  revenue: number;
  expenses: number;
  vat: number;
  invoiceCount: number;
  expenseCount: number;
}

export interface ClientMetric {
  clientId: string;
  clientName: string;
  totalRevenue: number;
  invoiceCount: number;
  averageInvoiceValue: number;
}

/**
 * Get revenue overview for a date range
 */
export async function getRevenueOverview(
  userId: string,
  dateRange: DateRange
): Promise<RevenueData> {
  const { startDate, endDate } = dateRange;

  const result = await Invoice.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        issueDate: { $gte: startDate, $lte: endDate },
      },
    },
    {
      $group: {
        _id: null,
        totalRevenue: {
          $sum: {
            $cond: [
              { $in: ['\$status', ['paid', 'partially_paid']] },
              '$total',
              0,
            ],
          },
        },
        totalVAT: {
          $sum: {
            $cond: [
              { $in: ['\$status', ['paid', 'partially_paid']] },
              '$taxAmount',
              0,
            ],
          },
        },
        paidAmount: {
          $sum: '$amountPaid',
        },
        pendingAmount: {
          $sum: {
            $cond: [{ $eq: ['\$status', 'pending'] }, '$balanceDue', 0],
          },
        },
        overdueAmount: {
          $sum: {
            $cond: [{ $eq: ['\$status', 'overdue'] }, '$balanceDue', 0],
          },
        },
        count: { $sum: 1 },
        paidCount: {
          $sum: {
            $cond: [
              { $in: ['\$status', ['paid', 'partially_paid']] },
              1,
              0,
            ],
          },
        },
      },
    },
  ]);

  if (result.length === 0) {
    return {
      totalRevenue: 0,
      totalVAT: 0,
      count: 0,
      averageInvoiceValue: 0,
      paidAmount: 0,
      pendingAmount: 0,
      overdueAmount: 0,
    };
  }

  const data = result[0];
  return {
    totalRevenue: data.totalRevenue || 0,
    totalVAT: data.totalVAT || 0,
    count: data.count || 0,
    averageInvoiceValue:
      data.paidCount > 0 ? data.totalRevenue / data.paidCount : 0,
    paidAmount: data.paidAmount || 0,
    pendingAmount: data.pendingAmount || 0,
    overdueAmount: data.overdueAmount || 0,
  };
}

/**
 * Get expense overview for a date range
 */
export async function getExpenseOverview(
  userId: string,
  dateRange: DateRange
): Promise<ExpenseData> {
  const { startDate, endDate } = dateRange;

  // Total expenses
  const totalResult = await Expense.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        date: { $gte: startDate, $lte: endDate },
      },
    },
    {
      $group: {
        _id: null,
        totalExpenses: { $sum: '$amount' },
        totalDeductibleVAT: { $sum: '$taxAmount' },
        count: { $sum: 1 },
      },
    },
  ]);

  // Expenses by category
  const categoryResult = await Expense.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        date: { $gte: startDate, $lte: endDate },
      },
    },
    {
      $group: {
        _id: '$category',
        amount: { $sum: '$amount' },
        taxAmount: { $sum: '$taxAmount' },
        count: { $sum: 1 },
      },
    },
    {
      $sort: { amount: -1 },
    },
    {
      $project: {
        _id: 0,
        category: '$_id',
        amount: 1,
        taxAmount: 1,
        count: 1,
      },
    },
  ]);

  const total =
    totalResult.length > 0
      ? totalResult[0]
      : { totalExpenses: 0, totalDeductibleVAT: 0, count: 0 };

  return {
    totalExpenses: total.totalExpenses || 0,
    totalDeductibleVAT: total.totalDeductibleVAT || 0,
    count: total.count || 0,
    byCategory: categoryResult,
  };
}

/**
 * Get monthly trends for revenue and expenses
 */
export async function getMonthlyTrends(
  userId: string,
  dateRange: DateRange
): Promise<MonthlyTrend[]> {
  const { startDate, endDate } = dateRange;

  // Revenue by month
  const revenueByMonth = await Invoice.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        issueDate: { $gte: startDate, $lte: endDate },
        paymentStatus: { $in: ['paid', 'partially_paid'] },
      },
    },
    {
      $group: {
        _id: {
          year: { $year: '$issueDate' },
          month: { $month: '$issueDate' },
        },
        revenue: { $sum: '$total' },
        vat: { $sum: '$taxAmount' },
        invoiceCount: { $sum: 1 },
      },
    },
    {
      $sort: { '_id.year': 1, '_id.month': 1 },
    },
  ]);

  // Expenses by month
  const expensesByMonth = await Expense.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        date: { $gte: startDate, $lte: endDate },
      },
    },
    {
      $group: {
        _id: {
          year: { $year: '$date' },
          month: { $month: '$date' },
        },
        expenses: { $sum: '$amount' },
        expenseCount: { $sum: 1 },
      },
    },
  ]);

  // Merge revenue and expenses by month
  const monthMap = new Map<string, MonthlyTrend>();

  revenueByMonth.forEach((item) => {
    const key = `${item._id.year}-${item._id.month}`;
    monthMap.set(key, {
      year: item._id.year,
      month: item._id.month,
      revenue: item.revenue || 0,
      expenses: 0,
      vat: item.vat || 0,
      invoiceCount: item.invoiceCount || 0,
      expenseCount: 0,
    });
  });

  expensesByMonth.forEach((item) => {
    const key = `${item._id.year}-${item._id.month}`;
    const existing = monthMap.get(key);
    if (existing) {
      existing.expenses = item.expenses || 0;
      existing.expenseCount = item.expenseCount || 0;
    } else {
      monthMap.set(key, {
        year: item._id.year,
        month: item._id.month,
        revenue: 0,
        expenses: item.expenses || 0,
        vat: 0,
        invoiceCount: 0,
        expenseCount: item.expenseCount || 0,
      });
    }
  });

  return Array.from(monthMap.values()).sort((a, b) => {
    if (a.year !== b.year) return a.year - b.year;
    return a.month - b.month;
  });
}

/**
 * Get top clients by revenue
 */
export async function getTopClients(
  userId: string,
  dateRange: DateRange,
  limit: number = 10
): Promise<ClientMetric[]> {
  const { startDate, endDate } = dateRange;

  const result = await Invoice.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        issueDate: { $gte: startDate, $lte: endDate },
        paymentStatus: { $in: ['paid', 'partially_paid'] },
      },
    },
    {
      $group: {
        _id: '$clientId',
        totalRevenue: { $sum: '$total' },
        invoiceCount: { $sum: 1 },
      },
    },
    {
      $sort: { totalRevenue: -1 },
    },
    {
      $limit: limit,
    },
    {
      $lookup: {
        from: 'clients',
        localField: '_id',
        foreignField: '_id',
        as: 'client',
      },
    },
    {
      $unwind: '$client',
    },
    {
      $project: {
        clientId: { $toString: '$_id' },
        clientName: '$client.name',
        totalRevenue: 1,
        invoiceCount: 1,
        averageInvoiceValue: {
          $divide: ['$totalRevenue', '$invoiceCount'],
        },
      },
    },
  ]);

  return result;
}

/**
 * Get VAT breakdown by rate
 */
export async function getVATBreakdown(
  userId: string,
  dateRange: DateRange
): Promise<Array<{ rate: number; totalVAT: number; baseAmount: number; count: number }>> {
  const { startDate, endDate } = dateRange;

  const result = await Invoice.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        issueDate: { $gte: startDate, $lte: endDate },
        paymentStatus: { $in: ['paid', 'partially_paid'] },
      },
    },
    {
      $unwind: '$items',
    },
    {
      $group: {
        _id: '$items.taxRate',
        totalVAT: {
          $sum: {
            $multiply: [
              '$items.quantity',
              '$items.unitPrice',
              { $divide: ['$items.taxRate', 100] },
            ],
          },
        },
        baseAmount: {
          $sum: {
            $multiply: ['$items.quantity', '$items.unitPrice'],
          },
        },
        count: { $sum: 1 },
      },
    },
    {
      $sort: { _id: 1 },
    },
    {
      $project: {
        _id: 0,
        rate: '$_id',
        totalVAT: 1,
        baseAmount: 1,
        count: 1,
      },
    },
  ]);

  return result;
}

/**
 * Get quote conversion metrics
 */
export async function getQuoteConversionMetrics(
  userId: string,
  dateRange: DateRange
): Promise<{
  totalQuotes: number;
  convertedQuotes: number;
  conversionRate: number;
  acceptedQuotes: number;
  rejectedQuotes: number;
  expiredQuotes: number;
}> {
  const { startDate, endDate } = dateRange;

  const result = await Quote.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        issueDate: { $gte: startDate, $lte: endDate },
      },
    },
    {
      $group: {
        _id: null,
        totalQuotes: { $sum: 1 },
        convertedQuotes: {
          $sum: {
            $cond: [{ $eq: ['$status', 'converted'] }, 1, 0],
          },
        },
        acceptedQuotes: {
          $sum: {
            $cond: [{ $eq: ['$status', 'accepted'] }, 1, 0],
          },
        },
        rejectedQuotes: {
          $sum: {
            $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0],
          },
        },
        expiredQuotes: {
          $sum: {
            $cond: [{ $eq: ['$status', 'expired'] }, 1, 0],
          },
        },
      },
    },
  ]);

  if (result.length === 0) {
    return {
      totalQuotes: 0,
      convertedQuotes: 0,
      conversionRate: 0,
      acceptedQuotes: 0,
      rejectedQuotes: 0,
      expiredQuotes: 0,
    };
  }

  const data = result[0];
  return {
    totalQuotes: data.totalQuotes || 0,
    convertedQuotes: data.convertedQuotes || 0,
    conversionRate:
      data.totalQuotes > 0 ? (data.convertedQuotes / data.totalQuotes) * 100 : 0,
    acceptedQuotes: data.acceptedQuotes || 0,
    rejectedQuotes: data.rejectedQuotes || 0,
    expiredQuotes: data.expiredQuotes || 0,
  };
}

/**
 * Get payment method distribution
 */
export async function getPaymentMethodDistribution(
  userId: string,
  dateRange: DateRange
): Promise<Array<{ method: string; count: number; totalAmount: number }>> {
  const { startDate, endDate } = dateRange;

  const result = await Invoice.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        issueDate: { $gte: startDate, $lte: endDate },
        paymentStatus: { $in: ['paid', 'partially_paid'] },
        paymentMethod: { $exists: true, $ne: null },
      },
    },
    {
      $group: {
        _id: '$paymentMethod',
        count: { $sum: 1 },
        totalAmount: { $sum: '$amountPaid' },
      },
    },
    {
      $sort: { totalAmount: -1 },
    },
    {
      $project: {
        _id: 0,
        method: '$_id',
        count: 1,
        totalAmount: 1,
      },
    },
  ]);

  return result;
}
