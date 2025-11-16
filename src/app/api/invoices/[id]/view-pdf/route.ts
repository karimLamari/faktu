import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import dbConnect from '@/lib/db/mongodb';
import Invoice from '@/models/Invoice';
import mongoose from 'mongoose';
import { readInvoicePdfFromServer, invoicePdfExists } from '@/lib/invoices/storage';

/**
 * GET /api/invoices/[id]/view-pdf
 * Affiche le PDF d'une facture finalisée dans le navigateur (inline)
 *
 * Différence avec download-pdf:
 * - Content-Disposition: inline (s'ouvre dans le navigateur)
 * - Pas de vérification stricte d'intégrité (log seulement)
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
        { error: 'Authentification requise' },
        { status: 401 }
      );
    }

    // 2. Validation de l'ID
    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'ID de facture invalide' },
        { status: 400 }
      );
    }

    // 3. Récupération de la facture
    await dbConnect();
    const invoice = await Invoice.findOne({
      _id: id,
      userId: session.user.id,
    }).lean() as any;

    if (!invoice) {
      return NextResponse.json(
        { error: 'Facture non trouvée' },
        { status: 404 }
      );
    }

    // 4. Vérification que la facture est finalisée
    if (!invoice.isFinalized) {
      return NextResponse.json(
        {
          error: 'Facture non finalisée',
          message: 'Seules les factures finalisées ont un PDF archivé',
        },
        { status: 400 }
      );
    }

    // 5. Vérification du chemin PDF
    if (!invoice.pdfPath) {
      return NextResponse.json(
        {
          error: 'PDF non disponible',
          message: 'Le PDF de cette facture n\'a pas été archivé',
        },
        { status: 404 }
      );
    }

    // 6. Vérification de l'existence du fichier
    const pdfExists = await invoicePdfExists(invoice.pdfPath);
    if (!pdfExists) {
      console.error(`❌ PDF manquant sur disque: ${invoice.pdfPath} (facture: ${id})`);
      return NextResponse.json(
        {
          error: 'PDF introuvable',
          message: 'Le fichier PDF n\'existe plus sur le serveur',
        },
        { status: 404 }
      );
    }

    // 7. Lecture du PDF depuis le disque
    const pdfBuffer = await readInvoicePdfFromServer(invoice.pdfPath);

    // 8. Génération du nom de fichier
    const invoiceNumber = invoice.invoiceNumber || `FAC-${id}`;
    const filename = `${invoiceNumber}.pdf`;

    // 9. Retour du PDF pour affichage inline
    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        // inline = s'ouvre dans le navigateur
        'Content-Disposition': `inline; filename="${filename}"`,
        'Content-Length': pdfBuffer.length.toString(),
        'Cache-Control': 'private, max-age=31536000', // Cache 1 an
        'X-Invoice-Id': id,
        'X-Invoice-Number': invoiceNumber,
      },
    });

  } catch (error: any) {
    console.error('❌ Erreur affichage PDF facture:', error);

    if (error.message?.includes('Chemin non sécurisé')) {
      return NextResponse.json(
        {
          error: 'Accès interdit',
          message: 'Tentative d\'accès à un chemin non autorisé',
        },
        { status: 403 }
      );
    }

    if (error.code === 'ENOENT') {
      return NextResponse.json(
        {
          error: 'Fichier introuvable',
          message: 'Le PDF n\'existe pas sur le serveur',
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        error: 'Erreur serveur',
        message: 'Impossible d\'afficher le PDF',
      },
      { status: 500 }
    );
  }
}
