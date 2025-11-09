import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { auth } from '@/lib/auth/auth';
import dbConnect from '@/lib/db/mongodb';
import Quote from '@/models/Quote';
import User from '@/models/User';
import { PLANS } from '@/lib/subscription/plans';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    await dbConnect();

    // Vérifier le plan de l'utilisateur
    const user: any = await User.findById(session.user.id).lean();
    const plan = user?.subscription?.plan || 'free';
    const planFeatures = PLANS[plan];

    if (!planFeatures.electronicSignature) {
      return NextResponse.json({
        error: 'Fonctionnalité non disponible',
        message: 'La signature électronique est disponible uniquement pour les plans Pro et Business.',
        featureBlocked: true,
        plan: plan,
        requiredPlan: 'pro',
        upgradeUrl: '/dashboard/pricing'
      }, {
        status: 403,
        headers: {
          'X-Feature-Required': 'electronicSignature',
          'X-Upgrade-Plan': 'pro'
        }
      });
    }

    // Récupérer le devis
    const quote: any = await Quote.findOne({
      _id: id,
      userId: session.user.id,
    });

    if (!quote) {
      return NextResponse.json({ error: 'Devis introuvable' }, { status: 404 });
    }

    // Vérifier que le devis est envoyé
    if (quote.status === 'draft') {
      return NextResponse.json({
        error: 'Le devis doit être envoyé avant de pouvoir être signé'
      }, { status: 400 });
    }

    // Vérifier qu'il n'est pas déjà signé
    if (quote.status === 'accepted' || quote.signedAt) {
      return NextResponse.json({
        error: 'Ce devis est déjà signé'
      }, { status: 400 });
    }

    // Générer le token de signature
    const signatureToken = crypto.randomBytes(32).toString('hex');
    const signatureTokenExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 jours

    // Sauvegarder le token
    quote.signatureToken = signatureToken;
    quote.signatureTokenExpiry = signatureTokenExpiry;
    await quote.save();

    // Générer l'URL de signature
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL;
    const signatureUrl = `${baseUrl}/sign?token=${signatureToken}`;

    return NextResponse.json({
      success: true,
      signatureUrl,
      expiresAt: signatureTokenExpiry,
    });

  } catch (error: any) {
    console.error('Erreur génération lien signature:', error);
    return NextResponse.json(
      { error: 'Erreur serveur', details: error.message },
      { status: 500 }
    );
  }
}
