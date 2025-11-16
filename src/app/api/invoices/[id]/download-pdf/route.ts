import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import dbConnect from '@/lib/db/mongodb';
import Invoice from '@/models/Invoice';
import mongoose from 'mongoose';
import { readInvoicePdfFromServer, invoicePdfExists, verifyPdfIntegrity } from '@/lib/invoices/storage';

/**
 * GET /api/invoices/[id]/download-pdf
 * Télécharge le PDF d'une facture finalisée de manière sécurisée
 *
 * Sécurité:
 * - Authentification requise
 * - Vérifie que l'utilisateur est propriétaire de la facture
 * - Vérifie que la facture est finalisée
 * - Vérifie l'intégrité du PDF (hash SHA-256)
 * - Protection contre path traversal
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

    // 5. Vérification que le PDF existe
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

    // 7. Vérification de l'intégrité du PDF (si hash disponible)
    if (invoice.pdfHash) {
      const integrity = await verifyPdfIntegrity(invoice.pdfPath, invoice.pdfHash);

      if (!integrity.verified) {
        console.error(`⚠️ Intégrité PDF compromise: ${invoice.pdfPath}`);
        console.error(`   Hash attendu: ${invoice.pdfHash}`);
        console.error(`   Hash actuel:  ${integrity.currentHash}`);

        // En production, vous pouvez choisir de bloquer le téléchargement
        // Pour l'instant, on log et on continue avec un warning
        return NextResponse.json(
          {
            error: 'PDF altéré',
            message: 'L\'intégrité du PDF ne peut pas être vérifiée. Contactez le support.',
          },
          { status: 500 }
        );
      }
    }

    // 8. Lecture du PDF depuis le disque
    const pdfBuffer = await readInvoicePdfFromServer(invoice.pdfPath);

    // 9. Génération du nom de fichier pour le téléchargement
    const invoiceNumber = invoice.invoiceNumber || `FAC-${id}`;
    const filename = `${invoiceNumber}.pdf`;

    // 10. Retour du PDF avec les bons headers
    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': pdfBuffer.length.toString(),
        'Cache-Control': 'private, max-age=31536000', // Cache 1 an (PDF immuable)
        'X-Invoice-Id': id,
        'X-Invoice-Number': invoiceNumber,
        'X-PDF-Verified': invoice.pdfHash ? 'true' : 'false',
      },
    });

  } catch (error: any) {
    console.error('❌ Erreur téléchargement PDF facture:', error);

    // Gestion des erreurs spécifiques
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
        message: 'Impossible de télécharger le PDF',
      },
      { status: 500 }
    );
  }
}
