import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { PLANS } from '@/lib/subscription/plans';
import dbConnect from '@/lib/db/mongodb';
import User from '@/models/User';
import { processOCR } from '@/lib/services/ocr';

/**
 * API Route sécurisée pour l'OCR générique
 * POST /api/ocr/process
 *
 * Gère l'extraction de texte depuis une image avec:
 * - Google Cloud Vision (plans PRO/BUSINESS)
 * - Tesseract (plan FREE)
 */

export async function POST(request: NextRequest) {
  try {
    // 1. Vérifier l'authentification
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    // 2. Récupérer l'utilisateur et son plan
    await dbConnect();
    const user: any = await User.findById(session.user.id).lean();
    const userPlan = user?.subscription?.plan || 'free';
    const planFeatures = PLANS[userPlan];

    // 3. Déterminer quel provider OCR utiliser
    const shouldUseGoogleVision = planFeatures.advancedOCR &&
                                  (userPlan === 'pro' || userPlan === 'business');

    console.log(`🎯 OCR API - User: ${session.user.email}, Plan: ${userPlan}, Provider: ${shouldUseGoogleVision ? 'Google Vision' : 'Tesseract'}`);

    // 4. Si FREE ou OCR basique, retourner indication pour utiliser Tesseract client-side
    if (!shouldUseGoogleVision) {
      return NextResponse.json({
        provider: 'tesseract',
        message: 'Utilisez Tesseract.js côté client pour le plan FREE',
      });
    }

    // 5. Récupérer l'image du body
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'Aucun fichier fourni' },
        { status: 400 }
      );
    }

    // 6. Traiter avec le service OCR unifié
    const result = await processOCR(file, {
      userId: session.user.id,
      plan: userPlan,
      type: 'generic',
    });

    // 7. Retourner le texte extrait
    return NextResponse.json({
      provider: result.provider,
      text: result.text,
      confidence: result.confidence,
      success: true,
    });

  } catch (error: any) {
    console.error('❌ Erreur API OCR:', error);

    return NextResponse.json(
      {
        error: error.message || 'Erreur serveur',
        provider: 'tesseract',
        fallback: true,
      },
      { status: 500 }
    );
  }
}
