import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { cancelSubscription } from '@/lib/subscription/stripe';
import dbConnect from '@/lib/db/mongodb';
import User from '@/models/User';

export async function POST() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    await dbConnect();
    const user = await User.findById(session.user.id);

    if (!user || !user.subscription?.stripeSubscriptionId) {
      return NextResponse.json({ error: 'No active subscription' }, { status: 400 });
    }

    // Annuler l'abonnement Stripe (cancel_at_period_end = true)
    await cancelSubscription(user.subscription.stripeSubscriptionId);

    // Mettre à jour le user dans la DB
    await User.findByIdAndUpdate(user._id, {
      'subscription.cancelAtPeriodEnd': true
    });

    return NextResponse.json({ 
      success: true,
      message: 'Votre abonnement sera annulé à la fin de la période en cours.'
    });
  } catch (error: any) {
    console.error('Cancel subscription error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
