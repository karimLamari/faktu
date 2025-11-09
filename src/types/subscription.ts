export type SubscriptionPlan = 'free' | 'pro' | 'business';
export type SubscriptionStatus = 'active' | 'cancelled' | 'past_due' | 'trialing';

export interface SubscriptionData {
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  currentPeriodStart?: Date;
  currentPeriodEnd?: Date;
  cancelAtPeriodEnd?: boolean;
  trialEndsAt?: Date;
}

export interface UsageData {
  invoicesThisMonth: number;
  quotesThisMonth: number;
  expensesThisMonth: number;
  clientsCount: number;
  lastResetDate: Date;
}

export interface PlanFeatures {
  name: string;
  price: number;
  priceAnnual: number;
  invoicesPerMonth: number | 'unlimited';
  quotesPerMonth: number | 'unlimited';
  expensesPerMonth: number | 'unlimited';
  clients: number | 'unlimited';
  clientsLimit?: number | 'unlimited'; // Alias pour retrocompatibilité
  ocrScans: boolean;
  emailAutomation: boolean;
  paymentReminders: boolean;
  advancedStats: boolean;
  templates: number | 'unlimited';
  multiUser: boolean;
  apiAccess: boolean;
  support: 'community' | 'priority' | 'premium';
  electronicSignature?: boolean; // Signature électronique (Pro+)
  csvExport?: boolean; // Export CSV comptable (Pro+)
  advancedOCR?: boolean; // OCR Intelligent Google AI (Pro+)
}
