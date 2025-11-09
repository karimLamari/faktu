import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { createCustomerPortalSession } from '@/lib/subscription/stripe';
import dbConnect from '@/lib/db/mongodb';
import User from '@/models/User';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    await dbConnect();
    const user = await User.findById(session.user.id);

    if (!user || !user.subscription?.stripeCustomerId) {
      return NextResponse.json({ error: 'No active subscription' }, { status: 400 });
    }

    const searchParams = req.nextUrl.searchParams;
    const returnUrl = searchParams.get('returnUrl') || `${process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL}/dashboard/billing`;

    const portalSession = await createCustomerPortalSession(
      user.subscription.stripeCustomerId,
      returnUrl
    );

    return NextResponse.redirect(portalSession.url);
  } catch (error: any) {
    console.error('Portal error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
