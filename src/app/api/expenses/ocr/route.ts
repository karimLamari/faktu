import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { PLANS } from '@/lib/subscription/plans';
import dbConnect from '@/lib/db/mongodb';
import User from '@/models/User';
import { parseExpenseFromOCR, ParsedExpenseData } from '@/lib/services/expense-parser';
import { parseGoogleVisionText } from '@/lib/services/google-vision-ocr';
import { createWorker } from 'tesseract.js';

/**
 * API Route pour l'OCR des dépenses
 * POST /api/expenses/ocr
 *
 * Traite une image de facture/reçu et extrait automatiquement:
 * - Fournisseur
 * - Montant TTC
 * - Montant TVA
 * - Date
 * - Numéro de facture
 *
 * Plan FREE: Tesseract.js (70-75% précision)
 * Plan PRO/BUSINESS: Google Cloud Vision (90-95% précision)
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

    console.log(`🎯 OCR Expenses - User: ${session.user.email}, Plan: ${userPlan}`);

    // 3. Récupérer le fichier
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
        { error: 'Le fichier doit être une image (JPG, PNG, etc.)' },
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

    // 4. Déterminer quel provider OCR utiliser
    const shouldUseGoogleVision = planFeatures.advancedOCR &&
                                  (userPlan === 'pro' || userPlan === 'business');

    let extractedText = '';
    let parsedData: ParsedExpenseData;

    if (shouldUseGoogleVision) {
      // === PLAN PRO/BUSINESS: Google Cloud Vision ===
      console.log('🚀 Utilisation de Google Cloud Vision (PRO)');

      extractedText = await processGoogleVisionOCR(file);

      // Parser avec les patterns avancés de Google Vision
      const googleParsed = parseGoogleVisionText(extractedText);

      // Parser complet avec le parser standard (pour les champs manquants)
      const fullParsed = parseExpenseFromOCR(extractedText);

      // Fusionner les résultats (Google Vision prend priorité)
      parsedData = {
        vendor: googleParsed.vendor || fullParsed.vendor,
        amount: googleParsed.amount || fullParsed.amount,
        taxAmount: googleParsed.taxAmount || fullParsed.taxAmount,
        date: googleParsed.date || fullParsed.date,
        invoiceNumber: googleParsed.invoiceNumber || fullParsed.invoiceNumber,
        confidence: 90, // Google Vision a une confiance de base plus élevée
      };

      console.log('✅ OCR Google Vision terminé - Confiance: 90%');

    } else {
      // === PLAN FREE: Tesseract.js ===
      console.log('📸 Utilisation de Tesseract.js (FREE)');

      extractedText = await processTesseractOCR(file);

      // Parser le texte extrait
      parsedData = parseExpenseFromOCR(extractedText);

      console.log(`✅ OCR Tesseract terminé - Confiance: ${parsedData.confidence}%`);
    }

    // 5. Formater la réponse au format attendu par expenseService.ts
    return NextResponse.json({
      supplierName: parsedData.vendor,
      amount: parsedData.amount,
      taxAmount: parsedData.taxAmount,
      date: parsedData.date,
      invoiceNumber: parsedData.invoiceNumber,
      confidence: parsedData.confidence,
    });

  } catch (error: any) {
    console.error('❌ Erreur API OCR Expenses:', error);

    return NextResponse.json(
      { error: error.message || 'Erreur lors du traitement OCR' },
      { status: 500 }
    );
  }
}

/**
 * Traite une image avec Tesseract.js (côté serveur pour plan FREE)
 */
async function processTesseractOCR(file: File): Promise<string> {
  console.log('🔧 Initialisation de Tesseract.js (serveur)...');

  // Convertir le File en Buffer
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Créer le worker Tesseract
  const worker = await createWorker(['fra', 'eng']);

  try {
    // Effectuer l'OCR
    console.log('🔍 Reconnaissance OCR en cours (Tesseract)...');
    const { data: { text } } = await worker.recognize(buffer);

    console.log('📝 Texte extrait (Tesseract):', text.substring(0, 200) + '...');

    return text;
  } finally {
    await worker.terminate();
  }
}

/**
 * Traite une image avec Google Cloud Vision (côté serveur pour plan PRO/BUSINESS)
 */
async function processGoogleVisionOCR(file: File): Promise<string> {
  const apiKey = process.env.GOOGLE_CLOUD_VISION_API_KEY;

  if (!apiKey) {
    console.error('❌ Google Cloud Vision API key not configured');
    throw new Error('Service OCR PRO non configuré. Veuillez contacter le support.');
  }

  // Convertir en base64
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const base64Image = buffer.toString('base64');

  console.log('🚀 Appel Google Cloud Vision API...');

  // Appeler l'API Google Cloud Vision
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
    throw new Error('Erreur Google Vision API');
  }

  const data: GoogleVisionResponse = await visionResponse.json();

  // Vérifier les erreurs dans la réponse
  if (data.responses[0]?.error) {
    console.error('❌ Google Vision Response Error:', data.responses[0].error);
    throw new Error(data.responses[0].error.message);
  }

  // Extraire le texte
  const fullText =
    data.responses[0]?.fullTextAnnotation?.text ||
    data.responses[0]?.textAnnotations?.[0]?.description ||
    '';

  if (!fullText) {
    throw new Error('Aucun texte détecté dans l\'image');
  }

  console.log('✅ Google Cloud Vision - Texte extrait:', fullText.substring(0, 200) + '...');

  return fullText;
}
