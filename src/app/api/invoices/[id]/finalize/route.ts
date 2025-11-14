import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import dbConnect from '@/lib/db/mongodb';
import Invoice from '@/models/Invoice';
import Client from '@/models/Client';
import User from '@/models/User';
import InvoiceTemplate from '@/models/InvoiceTemplate';
import { generateInvoicePdf } from '@/lib/services/pdf-generator';
import { 
  saveInvoicePdfToServer, 
  calculatePdfHash 
} from '@/lib/invoices/storage';
import { logInvoiceAction } from '@/lib/services/audit-logger';
import { DEFAULT_TEMPLATE } from '@/lib/invoice-templates';
import { isProfileComplete, getMissingProfileFields } from '@/lib/utils/profile';
import mongoose from 'mongoose';

/**
 * POST /api/invoices/[id]/finalize
 * 
 * Finalise une facture et la verrouille définitivement :
 * 1. Vérifie que la facture est complète et valide
 * 2. Génère le PDF final avec le template actuel
 * 3. Stocke le PDF de manière permanente sur disque
 * 4. Calcule le hash SHA-256 pour vérification d'intégrité
 * 5. Marque la facture comme finalisée (isFinalized = true)
 * 6. Enregistre dans l'audit trail
 * 
 * ⚠️ APRÈS FINALISATION, LA FACTURE NE PEUT PLUS ÊTRE MODIFIÉE
 * (Conformité Article L123-22 du Code de commerce)
 */
export async function POST(
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

    // 3. Vérifier si déjà finalisée
    if (invoice.isFinalized) {
      return NextResponse.json(
        {
          error: 'Facture déjà finalisée',
          message: 'Cette facture a déjà été finalisée et verrouillée.',
          finalizedAt: invoice.finalizedAt,
        },
        { status: 400 }
      );
    }

    // 4. Récupérer l'utilisateur et vérifier profil complet
    const user: any = await User.findById(session.user.id).lean();
    if (!user) {
      return NextResponse.json(
        { error: 'Utilisateur introuvable' },
        { status: 404 }
      );
    }

    if (!isProfileComplete(user)) {
      const missingFields = getMissingProfileFields(user);
      return NextResponse.json({
        error: 'Profil incomplet',
        message: `Impossible de finaliser la facture. Veuillez compléter votre profil professionnel. Champs manquants : ${missingFields.join(', ')}`,
        missingFields,
      }, { status: 400 });
    }

    // 5. Valider la facture (vérifications business)
    const validationErrors: string[] = [];

    if (!invoice.invoiceNumber) {
      validationErrors.push('Numéro de facture manquant');
    }
    if (!invoice.items || invoice.items.length === 0) {
      validationErrors.push('Aucun article/service dans la facture');
    }
    if (!invoice.total || invoice.total <= 0) {
      validationErrors.push('Montant total invalide (doit être > 0)');
    }
    if (!invoice.clientId) {
      validationErrors.push('Client non défini');
    }
    if (!invoice.issueDate) {
      validationErrors.push('Date d\'émission manquante');
    }
    if (!invoice.dueDate) {
      validationErrors.push('Date d\'échéance manquante');
    }

    if (validationErrors.length > 0) {
      return NextResponse.json({
        error: 'Facture incomplète',
        message: 'Impossible de finaliser une facture incomplète.',
        validationErrors,
      }, { status: 400 });
    }

    // 6. Récupérer le client
    const client: any = await Client.findById(invoice.clientId).lean();
    if (!client) {
      return NextResponse.json(
        { error: 'Client introuvable' },
        { status: 404 }
      );
    }

    // 7. Récupérer le template actif de l'utilisateur
    const userTemplate = await InvoiceTemplate.findOne({
      userId: user._id,
      isDefault: true,
    }).lean();
    const template = userTemplate || DEFAULT_TEMPLATE;

    // 8. Générer le PDF final
    console.log(`📄 Génération PDF final pour facture ${invoice.invoiceNumber}...`);
    const pdfBuffer = await generateInvoicePdf({
      invoice,
      client,
      user,
      template: template as any,
    });

    // 9. Calculer le hash SHA-256 pour intégrité
    const pdfHash = calculatePdfHash(pdfBuffer);
    console.log(`🔐 Hash PDF calculé: ${pdfHash.substring(0, 16)}...`);

    // 10. Stocker le PDF de manière permanente
    const issueYear = new Date(invoice.issueDate).getFullYear();
    const pdfPath = await saveInvoicePdfToServer(
      pdfBuffer,
      session.user.id,
      issueYear,
      invoice.invoiceNumber
    );
    console.log(`💾 PDF stocké: ${pdfPath}`);

    // 11. Mettre à jour la facture (finalisation)
    const now = new Date();
    await Invoice.updateOne(
      { _id: id },
      {
        $set: {
          isFinalized: true,
          finalizedAt: now,
          finalizedBy: new mongoose.Types.ObjectId(session.user.id),
          pdfPath,
          pdfHash,
          // Mettre à jour status si encore en draft
          status: invoice.status === 'draft' ? 'sent' : invoice.status,
        },
      }
    );

    // 12. Logger dans l'audit trail
    await logInvoiceAction(
      id,
      session.user.id,
      'finalized',
      session.user.id,
      request,
      [],
      {
        invoiceNumber: invoice.invoiceNumber,
        pdfPath,
        pdfHash,
        total: invoice.total,
        clientName: client.name,
      }
    );

    console.log(`✅ Facture ${invoice.invoiceNumber} finalisée et verrouillée`);

    // 13. Retourner confirmation
    return NextResponse.json({
      success: true,
      message: 'Facture finalisée et verrouillée avec succès',
      invoice: {
        _id: invoice._id,
        invoiceNumber: invoice.invoiceNumber,
        isFinalized: true,
        finalizedAt: now,
        pdfPath,
        pdfHash,
      },
      warning: '⚠️ Cette facture est maintenant immutable. Toute modification est désormais impossible (conformité légale).',
    }, { status: 200 });

  } catch (error: any) {
    console.error('❌ Erreur finalisation facture:', error);
    
    return NextResponse.json(
      {
        error: 'Erreur lors de la finalisation',
        message: error.message || 'Une erreur est survenue',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
