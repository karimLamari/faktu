import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { PLANS } from '@/lib/subscription/plans';
import dbConnect from '@/lib/db/mongodb';
import User from '@/models/User';

/**
 * API Route sécurisée pour l'OCR
 * POST /api/ocr/process
 *
 * Gère l'appel à Google Cloud Vision côté serveur pour sécuriser la clé API
 */

interface GoogleVisionTextAnnotation {
  description: string;
  locale?: string;
}

interface GoogleVisionResponse {
  responses: Array<{
    textAnnotations: GoogleVisionTextAnnotation[];
    fullTextAnnotation?: {
      text: string;
    };
    error?: {
      code: number;
      message: string;
    };
  }>;
}

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

    // Vérifier le type de fichier
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'Le fichier doit être une image' },
        { status: 400 }
      );
    }

    // Vérifier la taille (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'L\'image ne doit pas dépasser 10MB' },
        { status: 400 }
      );
    }

    // 6. Convertir en base64
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Image = buffer.toString('base64');

    // 7. Appeler Google Cloud Vision (sécurisé côté serveur)
    const apiKey = process.env.GOOGLE_CLOUD_VISION_API_KEY;

    if (!apiKey) {
      console.error('❌ Google Cloud Vision API key not configured');
      return NextResponse.json(
        {
          error: 'Service OCR non configuré',
          provider: 'tesseract',
          fallback: true
        },
        { status: 503 }
      );
    }

    console.log('🚀 Appel Google Cloud Vision API...');

    const visionResponse = await fetch(
      `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requests: [
            {
              image: {
                content: base64Image,
              },
              features: [
                {
                  type: 'DOCUMENT_TEXT_DETECTION',
                  maxResults: 1,
                },
              ],
              imageContext: {
                languageHints: ['fr', 'en'],
              },
            },
          ],
        }),
      }
    );

    if (!visionResponse.ok) {
      const errorData = await visionResponse.json();
      console.error('❌ Google Vision API Error:', errorData);

      return NextResponse.json(
        {
          error: 'Erreur Google Vision API',
          provider: 'tesseract',
          fallback: true,
        },
        { status: 500 }
      );
    }

    const data: GoogleVisionResponse = await visionResponse.json();

    // 8. Vérifier les erreurs dans la réponse
    if (data.responses[0]?.error) {
      console.error('❌ Google Vision Response Error:', data.responses[0].error);

      return NextResponse.json(
        {
          error: data.responses[0].error.message,
          provider: 'tesseract',
          fallback: true,
        },
        { status: 500 }
      );
    }

    // 9. Extraire le texte
    const fullText =
      data.responses[0]?.fullTextAnnotation?.text ||
      data.responses[0]?.textAnnotations?.[0]?.description ||
      '';

    if (!fullText) {
      return NextResponse.json(
        { error: 'Aucun texte détecté dans l\'image' },
        { status: 400 }
      );
    }

    console.log('✅ Google Cloud Vision - Texte extrait:', fullText.substring(0, 100));

    // 10. Retourner le texte extrait
    return NextResponse.json({
      provider: 'google-vision',
      text: fullText,
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
