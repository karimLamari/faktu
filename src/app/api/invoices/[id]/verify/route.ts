import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import dbConnect from '@/lib/db/mongodb';
import Invoice from '@/models/Invoice';
import { verifyPdfIntegrity } from '@/lib/invoices/storage';
import mongoose from 'mongoose';

/**
 * GET /api/invoices/[id]/verify
 * 
 * Vérifie l'intégrité d'une facture finalisée :
 * 1. Lit le PDF stocké sur disque
 * 2. Recalcule le hash SHA-256
 * 3. Compare avec le hash stocké en base de données
 * 4. Retourne le résultat de la vérification
 * 
 * ✅ verified = true : PDF intact, aucune altération
 * ⚠️ verified = false : PDF modifié ou corrompu
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Authentification
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'ID de facture invalide' },
        { status: 400 }
      );
    }

    await dbConnect();

    // 2. Récupérer la facture
    const invoice: any = await Invoice.findOne({
      _id: id,
      userId: session.user.id,
    }).lean();

    if (!invoice) {
      return NextResponse.json(
        { error: 'Facture non trouvée' },
        { status: 404 }
      );
    }

    // 3. Vérifier si la facture est finalisée
    if (!invoice.isFinalized) {
      return NextResponse.json(
        {
          error: 'Facture non finalisée',
          message: 'La vérification d\'intégrité ne peut être effectuée que sur des factures finalisées.',
          isFinalized: false,
        },
        { status: 400 }
      );
    }

    // 4. Vérifier que pdfPath et pdfHash existent
    if (!invoice.pdfPath || !invoice.pdfHash) {
      return NextResponse.json(
        {
          error: 'Données de vérification manquantes',
          message: 'Cette facture finalisée ne possède pas les informations nécessaires à la vérification (pdfPath ou pdfHash manquant).',
          pdfPath: invoice.pdfPath,
          pdfHash: invoice.pdfHash,
        },
        { status: 400 }
      );
    }

    // 5. Vérifier l'intégrité du PDF
    console.log(`🔍 Vérification intégrité PDF: ${invoice.pdfPath}`);
    const verificationResult = await verifyPdfIntegrity(
      invoice.pdfPath,
      invoice.pdfHash
    );

    // 6. Préparer la réponse
    const response = {
      invoiceId: invoice._id,
      invoiceNumber: invoice.invoiceNumber,
      isFinalized: invoice.isFinalized,
      finalizedAt: invoice.finalizedAt,
      pdfPath: invoice.pdfPath,
      storedHash: invoice.pdfHash,
      currentHash: verificationResult.currentHash,
      verified: verificationResult.verified,
      message: verificationResult.message,
      verifiedAt: new Date(),
    };

    // 7. Si le PDF est altéré, retourner un warning
    if (!verificationResult.verified) {
      return NextResponse.json(
        {
          ...response,
          warning: '⚠️ ALERTE SÉCURITÉ : Le PDF de cette facture a été modifié ou est corrompu !',
          recommendation: 'Contactez l\'administrateur système immédiatement. Cette facture ne peut plus être considérée comme authentique.',
        },
        { 
          status: 200,  // 200 car la requête a réussi, mais avec warning
          headers: {
            'X-PDF-Integrity': 'compromised',
            'X-Security-Alert': 'true',
          }
        }
      );
    }

    // 8. Tout est OK
    return NextResponse.json(
      {
        ...response,
        success: true,
        info: '✅ PDF intact et authentique. Aucune modification détectée.',
      },
      { 
        status: 200,
        headers: {
          'X-PDF-Integrity': 'valid',
        }
      }
    );

  } catch (error: any) {
    console.error('❌ Erreur vérification intégrité:', error);
    
    return NextResponse.json(
      {
        error: 'Erreur lors de la vérification',
        message: error.message || 'Une erreur est survenue',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
