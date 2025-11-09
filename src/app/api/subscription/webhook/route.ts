import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/subscription/stripe';
import dbConnect from '@/lib/db/mongodb';
import User from '@/models/User';
import Stripe from 'stripe';

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  await dbConnect();

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.client_reference_id || session.metadata?.userId;
        
        if (!userId) break;

        const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
        const priceId = subscription.items.data[0].price.id;
        
        // Déterminer le plan basé sur le price ID
        let plan: 'pro' | 'business' = 'pro';
        if (priceId.includes('business') || 
            priceId === process.env.NEXT_PUBLIC_STRIPE_PRICE_BUSINESS_MONTHLY ||
            priceId === process.env.NEXT_PUBLIC_STRIPE_PRICE_BUSINESS_ANNUAL) {
          plan = 'business';
        }

        await User.findByIdAndUpdate(userId, {
          'subscription.plan': plan,
          'subscription.status': subscription.status === 'trialing' ? 'trialing' : 'active',
          'subscription.stripeCustomerId': session.customer,
          'subscription.stripeSubscriptionId': session.subscription,
          'subscription.currentPeriodStart': new Date(subscription.current_period_start * 1000),
          'subscription.currentPeriodEnd': new Date(subscription.current_period_end * 1000),
          'subscription.trialEndsAt': subscription.trial_end ? new Date(subscription.trial_end * 1000) : null,
        });
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        
        await User.findOneAndUpdate(
          { 'subscription.stripeSubscriptionId': subscription.id },
          {
            'subscription.status': subscription.status,
            'subscription.currentPeriodStart': new Date(subscription.current_period_start * 1000),
            'subscription.currentPeriodEnd': new Date(subscription.current_period_end * 1000),
            'subscription.cancelAtPeriodEnd': subscription.cancel_at_period_end,
          }
        );
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        
        await User.findOneAndUpdate(
          { 'subscription.stripeSubscriptionId': subscription.id },
          {
            'subscription.plan': 'free',
            'subscription.status': 'cancelled',
          }
        );
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        
        await User.findOneAndUpdate(
          { 'subscription.stripeCustomerId': invoice.customer },
          {
            'subscription.status': 'past_due',
          }
        );
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        
        await User.findOneAndUpdate(
          { 'subscription.stripeCustomerId': invoice.customer },
          {
            'subscription.status': 'active',
          }
        );
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Webhook handler error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
