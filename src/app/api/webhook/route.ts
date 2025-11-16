import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import dbConnect from '@/lib/db/mongodb';
import User from '@/models/User';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const headersList = await headers();
    const signature = headersList.get('stripe-signature');

    if (!signature) {
      console.error('❌ Stripe signature manquante');
      return NextResponse.json(
        { error: 'Signature manquante' },
        { status: 400 }
      );
    }

    // Vérifier la signature Stripe
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
      console.error('❌ Erreur de vérification webhook:', err.message);
      return NextResponse.json(
        { error: `Webhook Error: ${err.message}` },
        { status: 400 }
      );
    }

    console.log('📥 Webhook reçu:', event.type);

    await dbConnect();

    // Traiter les différents événements
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session);
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdated(subscription);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(subscription);
        break;
      }

      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaid(invoice);
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaid(invoice); // Même logique
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaymentFailed(invoice);
        break;
      }

      default:
        console.log(`ℹ️ Événement non géré: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('❌ Erreur webhook:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

/**
 * Gère la création d'un nouvel abonnement après checkout
 */
async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  try {
    // Récupérer userId depuis client_reference_id OU metadata
    const userId = session.client_reference_id || session.metadata?.userId;

    if (!userId) {
      console.error('❌ userId manquant dans checkout session');
      return;
    }

    // Récupérer les détails de l'abonnement
    const subscriptionId = session.subscription as string;
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);

    // Déterminer le plan
    const priceId = subscription.items.data[0]?.price.id;
    let plan: 'free' | 'pro' | 'business' = 'free';

    // Vérifier contre vos price IDs
    if (priceId === process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID ||
        priceId === process.env.STRIPE_PRICE_PRO_MONTHLY ||
        priceId === process.env.STRIPE_PRICE_PRO_ANNUAL) {
      plan = 'pro';
    } else if (priceId === process.env.NEXT_PUBLIC_STRIPE_BUSINESS_PRICE_ID ||
               priceId === process.env.STRIPE_PRICE_BUSINESS_MONTHLY ||
               priceId === process.env.STRIPE_PRICE_BUSINESS_ANNUAL) {
      plan = 'business';
    }

    // Mettre à jour l'utilisateur
    const user = await User.findByIdAndUpdate(
      userId,
      {
        'subscription.plan': plan,
        'subscription.status': 'active',
        'subscription.stripeSubscriptionId': subscription.id,
        'subscription.stripeCustomerId': session.customer as string,
        'subscription.currentPeriodStart': new Date(subscription.current_period_start * 1000),
        'subscription.currentPeriodEnd': new Date(subscription.current_period_end * 1000),
        'subscription.cancelAtPeriodEnd': subscription.cancel_at_period_end,
      },
      { new: true }
    );

    console.log(`✅ Abonnement créé pour user ${userId}: plan ${plan}`);
    console.log('Subscription ID:', subscription.id);

  } catch (error: any) {
    console.error('❌ Erreur handleCheckoutCompleted:', error);
    throw error;
  }
}

/**
 * Gère les mises à jour d'abonnement (upgrade, downgrade, renouvellement)
 */
async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  try {
    const customerId = subscription.customer as string;

    // Trouver l'utilisateur par Stripe customer ID
    const user = await User.findOne({ 'subscription.stripeCustomerId': customerId });
    if (!user) {
      console.error('❌ Utilisateur introuvable pour customer:', customerId);
      return;
    }

    // Déterminer le nouveau plan
    const priceId = subscription.items.data[0]?.price.id;
    let plan: 'free' | 'pro' | 'business' = 'free';

    if (priceId === process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID ||
        priceId === process.env.STRIPE_PRICE_PRO_MONTHLY ||
        priceId === process.env.STRIPE_PRICE_PRO_ANNUAL) {
      plan = 'pro';
    } else if (priceId === process.env.NEXT_PUBLIC_STRIPE_BUSINESS_PRICE_ID ||
               priceId === process.env.STRIPE_PRICE_BUSINESS_MONTHLY ||
               priceId === process.env.STRIPE_PRICE_BUSINESS_ANNUAL) {
      plan = 'business';
    }

    // Déterminer le statut
    let status: 'active' | 'canceled' | 'past_due' = 'active';
    if (subscription.status === 'canceled' || subscription.status === 'unpaid') {
      status = 'canceled';
    } else if (subscription.status === 'past_due') {
      status = 'past_due';
    }

    // Mettre à jour
    user.subscription = {
      ...user.subscription,
      plan,
      status,
      stripeSubscriptionId: subscription.id,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    };

    await user.save();

    console.log(`✅ Abonnement mis à jour pour user ${user._id}: ${plan} (${status})`);

  } catch (error: any) {
    console.error('❌ Erreur handleSubscriptionUpdated:', error);
    throw error;
  }
}

/**
 * Gère la suppression/annulation d'un abonnement
 */
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  try {
    const customerId = subscription.customer as string;

    const user = await User.findOne({ 'subscription.stripeCustomerId': customerId });
    if (!user) {
      console.error('❌ Utilisateur introuvable pour customer:', customerId);
      return;
    }

    // Réinitialiser au plan gratuit
    user.subscription = {
      plan: 'free',
      status: 'canceled',
      stripeCustomerId: user.subscription?.stripeCustomerId,
      stripeSubscriptionId: undefined,
      currentPeriodStart: undefined,
      currentPeriodEnd: undefined,
      cancelAtPeriodEnd: false,
    };

    await user.save();

    console.log(`✅ Abonnement annulé pour user ${user._id}, retour au plan free`);

  } catch (error: any) {
    console.error('❌ Erreur handleSubscriptionDeleted:', error);
    throw error;
  }
}

/**
 * Gère le paiement réussi d'une facture d'abonnement
 */
async function handleInvoicePaid(invoice: Stripe.Invoice) {
  try {
    const customerId = invoice.customer as string;

    const user = await User.findOne({ 'subscription.stripeCustomerId': customerId });
    if (!user) {
      console.error('❌ Utilisateur introuvable pour customer:', customerId);
      return;
    }

    // S'assurer que le statut est actif
    if (user.subscription && user.subscription.status !== 'active') {
      user.subscription.status = 'active';
      await user.save();
      console.log(`✅ Paiement réussi pour user ${user._id}, statut: active`);
    }

  } catch (error: any) {
    console.error('❌ Erreur handleInvoicePaid:', error);
    throw error;
  }
}

/**
 * Gère l'échec de paiement d'une facture
 */
async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  try {
    const customerId = invoice.customer as string;

    const user = await User.findOne({ 'subscription.stripeCustomerId': customerId });
    if (!user) {
      console.error('❌ Utilisateur introuvable pour customer:', customerId);
      return;
    }

    // Marquer comme past_due
    if (user.subscription) {
      user.subscription.status = 'past_due';
      await user.save();
      console.log(`⚠️ Échec de paiement pour user ${user._id}, statut: past_due`);
    }

    // TODO: Envoyer un email de notification à l'utilisateur

  } catch (error: any) {
    console.error('❌ Erreur handleInvoicePaymentFailed:', error);
    throw error;
  }
}
