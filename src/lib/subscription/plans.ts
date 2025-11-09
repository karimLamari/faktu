import { PlanFeatures } from '@/types/subscription';

export const PLANS: Record<string, PlanFeatures> = {
  free: {
    name: 'Gratuit',
    price: 0,
    priceAnnual: 0,
    invoicesPerMonth: 5,
    quotesPerMonth: 5,
    expensesPerMonth: 5,
    clients: 5,
    clientsLimit: 10,
    ocrScans: false,
    emailAutomation: false,
    paymentReminders: false,
    advancedStats: false,
    templates: 1,
    multiUser: false,
    apiAccess: false,
    support: 'community',
    electronicSignature: false,
    csvExport: false,
    advancedOCR: false, // OCR Basique (Tesseract)
  },
  pro: {
    name: 'Pro',
    price: 10,
    priceAnnual: 100,
    invoicesPerMonth: 50,
    quotesPerMonth: 50,
    expensesPerMonth: 50,
    clients: 'unlimited',
    clientsLimit: 'unlimited',
    ocrScans: true,
    emailAutomation: true,
    paymentReminders: true,
    advancedStats: true,
    templates: 'unlimited',
    multiUser: false,
    apiAccess: false,
    support: 'priority',
    electronicSignature: true,
    csvExport: true,
    advancedOCR: true, // OCR Intelligent Google AI
  },
  business: {
    name: 'Business',
    price: 25,
    priceAnnual: 250,
    invoicesPerMonth: 'unlimited',
    quotesPerMonth: 'unlimited',
    expensesPerMonth: 'unlimited',
    clients: 'unlimited',
    clientsLimit: 'unlimited',
    ocrScans: true,
    emailAutomation: true,
    paymentReminders: true,
    advancedStats: true,
    templates: 'unlimited',
    multiUser: true,
    apiAccess: true,
    support: 'premium',
    electronicSignature: true,
    csvExport: true,
    advancedOCR: true, // OCR Intelligent Google AI
  }
};

export const STRIPE_PRICES = {
  pro_monthly: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY || '',
  pro_annual: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_ANNUAL || '',
  business_monthly: process.env.NEXT_PUBLIC_STRIPE_PRICE_BUSINESS_MONTHLY || '',
  business_annual: process.env.NEXT_PUBLIC_STRIPE_PRICE_BUSINESS_ANNUAL || '',
};
