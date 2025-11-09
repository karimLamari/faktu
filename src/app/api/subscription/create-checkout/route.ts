import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { createCheckoutSession } from '@/lib/subscription/stripe';
import { STRIPE_PRICES } from '@/lib/subscription/plans';
import dbConnect from '@/lib/db/mongodb';
import User from '@/models/User';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Si l'email n'est pas dans la session, le récupérer depuis la DB
    let userEmail = session.user.email;
    if (!userEmail) {
      await dbConnect();
      const dbUser = await User.findById(session.user.id).select('email');
      if (!dbUser?.email) {
        return NextResponse.json({ error: 'User email not found' }, { status: 400 });
      }
      userEmail = dbUser.email;
    }

    const body = await req.json();
    const { plan, cycle } = body;

    if (!plan || !cycle) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    const priceKey = `${plan}_${cycle}` as keyof typeof STRIPE_PRICES;
    const priceId = STRIPE_PRICES[priceKey];

    if (!priceId) {
      return NextResponse.json({ error: 'Invalid plan or missing Stripe price ID' }, { status: 400 });
    }

    const checkoutSession = await createCheckoutSession({
      userId: session.user.id,
      email: userEmail as string,
      priceId,
      successUrl: `${process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL}/dashboard/billing?success=true`,
      cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL}/dashboard/pricing`,
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error: any) {
    console.error('Checkout error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    
    // Log pour debug
    console.log('GET /api/subscription/create-checkout - Session:', {
      hasSession: !!session,
      hasUser: !!session?.user,
      userId: session?.user?.id,
      hasEmail: !!session?.user?.email,
    });
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    
    // Si l'email n'est pas dans la session, le récupérer depuis la DB
    let userEmail = session.user.email;
    if (!userEmail) {
      await dbConnect();
      const dbUser = await User.findById(session.user.id).select('email');
      if (!dbUser?.email) {
        return NextResponse.json({ error: 'User email not found' }, { status: 400 });
      }
      userEmail = dbUser.email;
    }

    const searchParams = req.nextUrl.searchParams;
    const plan = searchParams.get('plan') as 'pro' | 'business';
    const cycle = searchParams.get('cycle') as 'monthly' | 'annual';

    if (!plan || !cycle) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    const priceKey = `${plan}_${cycle}` as keyof typeof STRIPE_PRICES;
    const priceId = STRIPE_PRICES[priceKey];

    if (!priceId) {
      return NextResponse.json({ error: 'Invalid plan or missing Stripe price ID' }, { status: 400 });
    }

    const checkoutSession = await createCheckoutSession({
      userId: session.user.id,
      email: userEmail as string,
      priceId,
      successUrl: `${process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL}/dashboard/billing?success=true`,
      cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL}/dashboard/pricing`,
    });

    return NextResponse.redirect(checkoutSession.url!);
  } catch (error: any) {
    console.error('Checkout error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
