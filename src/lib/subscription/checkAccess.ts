import { auth } from '@/lib/auth/auth';
import User from '@/models/User';
import { PLANS } from './plans';
import dbConnect from '@/lib/db/mongodb';

export async function checkInvoiceLimit(): Promise<{
  allowed: boolean;
  current: number;
  limit: number | 'unlimited';
  plan: string;
}> {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('Not authenticated');
  }

  await dbConnect();
  const user = await User.findById(session.user.id);
  
  if (!user) {
    throw new Error('User not found');
  }

  const plan = user.subscription?.plan || 'free';
  const limit = PLANS[plan].invoicesPerMonth;
  const current = user.usage?.invoicesThisMonth || 0;

  // Reset usage si nouveau mois
  const lastReset = user.usage?.lastResetDate || new Date();
  const now = new Date();
  
  // Calculer la différence en mois
  const monthsDiff = (now.getFullYear() - lastReset.getFullYear()) * 12 
                   + (now.getMonth() - lastReset.getMonth());

  if (monthsDiff >= 1) {
    // Reset usage au 1er du mois actuel
    await User.findByIdAndUpdate(user._id, {
      'usage.invoicesThisMonth': 0,
      'usage.quotesThisMonth': 0,
      'usage.lastResetDate': new Date(now.getFullYear(), now.getMonth(), 1)
    });
    return { allowed: true, current: 0, limit, plan };
  }

  const allowed = limit === 'unlimited' || current < limit;
  
  return { allowed, current, limit, plan };
}

export async function incrementInvoiceUsage() {
  const session = await auth();
  if (!session?.user?.id) return;

  await dbConnect();
  await User.findByIdAndUpdate(session.user.id, {
    $inc: { 'usage.invoicesThisMonth': 1 }
  });
}

export async function checkQuoteLimit(): Promise<{
  allowed: boolean;
  current: number;
  limit: number | 'unlimited';
  plan: string;
}> {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('Not authenticated');
  }

  await dbConnect();
  const user = await User.findById(session.user.id);
  
  if (!user) {
    throw new Error('User not found');
  }

  const plan = user.subscription?.plan || 'free';
  const limit = PLANS[plan].quotesPerMonth; // ✅ FIX: Use quotesPerMonth, not invoicesPerMonth
  const current = user.usage?.quotesThisMonth || 0;

  // Reset usage si nouveau mois (même logique que checkInvoiceLimit)
  const lastReset = user.usage?.lastResetDate || new Date();
  const now = new Date();
  
  const monthsDiff = (now.getFullYear() - lastReset.getFullYear()) * 12 
                   + (now.getMonth() - lastReset.getMonth());

  if (monthsDiff >= 1) {
    await User.findByIdAndUpdate(user._id, {
      'usage.invoicesThisMonth': 0,
      'usage.quotesThisMonth': 0,
      'usage.lastResetDate': new Date(now.getFullYear(), now.getMonth(), 1)
    });
    return { allowed: true, current: 0, limit, plan };
  }

  const allowed = limit === 'unlimited' || current < limit;
  
  return { allowed, current, limit, plan };
}

export async function incrementQuoteUsage() {
  const session = await auth();
  if (!session?.user?.id) return;

  await dbConnect();
  await User.findByIdAndUpdate(session.user.id, {
    $inc: { 'usage.quotesThisMonth': 1 }
  });
}

export async function incrementExpenseUsage() {
  const session = await auth();
  if (!session?.user?.id) return;

  await dbConnect();
  await User.findByIdAndUpdate(session.user.id, {
    $inc: { 'usage.expensesThisMonth': 1 }
  });
}

export async function checkExpenseLimit(): Promise<{
  allowed: boolean;
  current: number;
  limit: number | 'unlimited';
  plan: string;
}> {
  const session = await auth();
  if (!session?.user?.id) {
    return { allowed: false, current: 0, limit: 5, plan: 'free' };
  }

  await dbConnect();
  const user = await User.findById(session.user.id);
  
  if (!user) {
    return { allowed: false, current: 0, limit: 5, plan: 'free' };
  }

  const plan = user.subscription?.plan || 'free';
  const limit = PLANS[plan].expensesPerMonth;
  const current = user.usage?.expensesThisMonth || 0;
  
  // Reset automatique si nouveau mois
  const lastReset = user.usage?.lastResetDate ? new Date(user.usage.lastResetDate) : null;
  const now = new Date();
  
  if (!lastReset || lastReset.getMonth() !== now.getMonth() || lastReset.getFullYear() !== now.getFullYear()) {
    await User.findByIdAndUpdate(user._id, {
      'usage.expensesThisMonth': 0,
      'usage.invoicesThisMonth': 0,
      'usage.quotesThisMonth': 0,
      'usage.lastResetDate': new Date(now.getFullYear(), now.getMonth(), 1)
    });
    return { allowed: true, current: 0, limit, plan };
  }

  const allowed = limit === 'unlimited' || current < limit;
  
  return { allowed, current, limit, plan };
}

/**
 * Vérifie si l'utilisateur peut ajouter un nouveau client
 */
export async function checkClientLimit(): Promise<{
  allowed: boolean;
  current: number;
  limit: number | 'unlimited';
  plan: string;
}> {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('Not authenticated');
  }

  await dbConnect();
  const user = await User.findById(session.user.id);
  
  if (!user) {
    throw new Error('User not found');
  }

  const plan = user.subscription?.plan || 'free';
  const limit = PLANS[plan].clients;
  const current = user.usage?.clientsCount || 0;

  const allowed = limit === 'unlimited' || current < limit;
  
  return { allowed, current, limit, plan };
}

export async function incrementClientUsage() {
  const session = await auth();
  if (!session?.user?.id) return;

  await dbConnect();
  await User.findByIdAndUpdate(session.user.id, {
    $inc: { 'usage.clientsCount': 1 }
  });
}

export async function decrementClientUsage() {
  const session = await auth();
  if (!session?.user?.id) return;

  await dbConnect();
  await User.findByIdAndUpdate(session.user.id, {
    $inc: { 'usage.clientsCount': -1 }
  });
}

/**
 * Vérifie si l'utilisateur a accès à une fonctionnalité spécifique
 */
export async function checkFeatureAccess(feature: 'ocrScans' | 'emailAutomation' | 'paymentReminders' | 'advancedStats' | 'multiUser' | 'apiAccess'): Promise<{
  allowed: boolean;
  plan: string;
  featureName: string;
}> {
  const session = await auth();
  if (!session?.user?.id) {
    return { allowed: false, plan: 'none', featureName: feature };
  }

  await dbConnect();
  const user = await User.findById(session.user.id);
  const plan = user?.subscription?.plan || 'free';
  const planConfig = PLANS[plan];

  const featureNames: Record<string, string> = {
    ocrScans: 'Scan OCR des factures',
    emailAutomation: 'Envoi email automatique',
    paymentReminders: 'Rappels de paiement',
    advancedStats: 'Statistiques avancées',
    multiUser: 'Multi-utilisateurs',
    apiAccess: 'Accès API'
  };

  return {
    allowed: planConfig[feature] === true,
    plan,
    featureName: featureNames[feature] || feature
  };
}
