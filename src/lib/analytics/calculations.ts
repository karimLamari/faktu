/**
 * Business Calculations for Analytics
 * Financial formulas and metric calculations
 */

export interface FinancialMetrics {
  revenue: number;
  expenses: number;
  netProfit: number;
  grossMargin: number;
  vatCollected: number;
  vatDeductible: number;
  vatPayable: number;
}

/**
 * Calculate comprehensive financial metrics
 */
export function calculateFinancialMetrics(
  revenue: number,
  vatCollected: number,
  expenses: number,
  vatDeductible: number
): FinancialMetrics {
  const netProfit = revenue - expenses;
  const grossMargin = revenue > 0 ? ((revenue - expenses) / revenue) * 100 : 0;
  const vatPayable = vatCollected - vatDeductible;

  return {
    revenue,
    expenses,
    netProfit,
    grossMargin,
    vatCollected,
    vatDeductible,
    vatPayable: Math.max(0, vatPayable), // VAT payable cannot be negative
  };
}

/**
 * Calculate percentage change between two values
 */
export function calculatePercentageChange(
  current: number,
  previous: number
): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

/**
 * Calculate trend direction
 */
export function getTrendDirection(
  current: number,
  previous: number
): 'up' | 'down' | 'stable' {
  const change = calculatePercentageChange(current, previous);
  if (Math.abs(change) < 1) return 'stable'; // Less than 1% change
  return change > 0 ? 'up' : 'down';
}

/**
 * Format currency for display
 */
export function formatCurrency(amount: number, currency: string = 'EUR'): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format percentage for display
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Format large numbers with K, M suffixes
 */
export function formatCompactNumber(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toFixed(0);
}

/**
 * Calculate collection rate (paid vs total)
 */
export function calculateCollectionRate(
  paidAmount: number,
  totalAmount: number
): number {
  if (totalAmount === 0) return 100;
  return (paidAmount / totalAmount) * 100;
}

/**
 * Calculate average payment delay in days
 */
export function calculateAveragePaymentDelay(
  invoices: Array<{ dueDate: Date; paymentDate?: Date }>
): number {
  const paidInvoices = invoices.filter((inv) => inv.paymentDate);
  if (paidInvoices.length === 0) return 0;

  const totalDelay = paidInvoices.reduce((sum, inv) => {
    const due = new Date(inv.dueDate).getTime();
    const paid = new Date(inv.paymentDate!).getTime();
    const delayInMs = paid - due;
    const delayInDays = delayInMs / (1000 * 60 * 60 * 24);
    return sum + Math.max(0, delayInDays); // Only count positive delays
  }, 0);

  return totalDelay / paidInvoices.length;
}

/**
 * Calculate cash flow health score (0-100)
 */
export function calculateCashFlowScore(
  cashInflow: number,
  cashOutflow: number,
  pendingAmount: number,
  overdueAmount: number
): number {
  // Base score on cash flow ratio
  const flowRatio = cashOutflow > 0 ? cashInflow / cashOutflow : 1;
  let score = Math.min(100, flowRatio * 50);

  // Penalize for high overdue amounts
  const overdueRatio = cashInflow > 0 ? overdueAmount / cashInflow : 0;
  score -= overdueRatio * 30;

  // Bonus for low pending ratio
  const pendingRatio = cashInflow > 0 ? pendingAmount / cashInflow : 0;
  if (pendingRatio < 0.2) score += 10;

  return Math.max(0, Math.min(100, score));
}

/**
 * Determine financial health status
 */
export function getFinancialHealthStatus(
  netProfit: number,
  revenue: number
): 'excellent' | 'good' | 'warning' | 'critical' {
  if (revenue === 0) return 'critical';

  const profitMargin = (netProfit / revenue) * 100;

  if (profitMargin >= 20) return 'excellent';
  if (profitMargin >= 10) return 'good';
  if (profitMargin >= 0) return 'warning';
  return 'critical';
}

/**
 * Calculate working capital
 */
export function calculateWorkingCapital(
  currentAssets: number,
  currentLiabilities: number
): number {
  return currentAssets - currentLiabilities;
}

/**
 * Get color for metric based on value and trend
 */
export function getMetricColor(
  metricType: 'positive' | 'negative',
  trend: 'up' | 'down' | 'stable'
): string {
  if (trend === 'stable') return 'text-gray-400';

  if (metricType === 'positive') {
    return trend === 'up' ? 'text-green-500' : 'text-red-500';
  } else {
    return trend === 'up' ? 'text-red-500' : 'text-green-500';
  }
}
