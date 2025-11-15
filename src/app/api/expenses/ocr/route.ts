import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import dbConnect from '@/lib/db/mongodb';
import User from '@/models/User';
import { processOCR } from '@/lib/services/ocr';

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

    // 4. Traiter avec le service OCR unifié (type: expense)
    const result = await processOCR(file, {
      userId: session.user.id,
      plan: userPlan,
      type: 'expense',
    });

    // 5. Formater la réponse au format attendu par expenseService.ts
    return NextResponse.json({
      supplierName: result.parsed?.vendor || '',
      amount: result.parsed?.amount || 0,
      taxAmount: result.parsed?.taxAmount || 0,
      date: result.parsed?.date || new Date(),
      invoiceNumber: result.parsed?.invoiceNumber || '',
      confidence: result.confidence,
    });

  } catch (error: any) {
    console.error('❌ Erreur API OCR Expenses:', error);

    return NextResponse.json(
      { error: error.message || 'Erreur lors du traitement OCR' },
      { status: 500 }
    );
  }
}
