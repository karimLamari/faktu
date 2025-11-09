import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import dbConnect from '@/lib/db/mongodb';
import User from '@/models/User';
import { PLANS } from '@/lib/subscription/plans';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    await dbConnect();
    const user = await User.findById(session.user.id);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const plan = user.subscription?.plan || 'free';
    const limits = PLANS[plan];

    return NextResponse.json({
      plan,
      usage: {
        invoices: {
          current: user.usage?.invoicesThisMonth || 0,
          limit: limits.invoicesPerMonth,
        },
        quotes: {
          current: user.usage?.quotesThisMonth || 0,
          limit: limits.quotesPerMonth,
        },
        expenses: {
          current: user.usage?.expensesThisMonth || 0,
          limit: limits.expensesPerMonth,
        },
        clients: {
          current: user.usage?.clientsCount || 0,
          limit: limits.clients,
        },
      },
      subscription: {
        status: user.subscription?.status || 'active',
        currentPeriodEnd: user.subscription?.currentPeriodEnd,
        cancelAtPeriodEnd: user.subscription?.cancelAtPeriodEnd || false,
        trialEndsAt: user.subscription?.trialEndsAt,
      },
    });
  } catch (error: any) {
    console.error('Usage API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
