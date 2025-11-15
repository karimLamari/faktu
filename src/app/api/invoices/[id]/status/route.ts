import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import dbConnect from '@/lib/db/mongodb';
import Invoice from '@/models/Invoice';
import { z } from 'zod';
import mongoose from 'mongoose';

const statusChangeSchema = z.object({
  status: z.enum(['draft', 'sent', 'paid', 'overdue', 'cancelled', 'partially_paid']),
  paymentDate: z.string().optional(),
  note: z.string().optional(),
});

/**
 * PATCH /api/invoices/[id]/status
 * 
 * Modifie le statut d'une facture.
 * Pour les factures finalisées, seuls les statuts de paiement sont autorisés.
 */
export async function PATCH(
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

    // 2. Valider les données
    const body = await request.json();
    const validation = statusChangeSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Données invalides', details: validation.error.issues },
        { status: 400 }
      );
    }

    const { status: newStatus, paymentDate, note } = validation.data;

    await dbConnect();

    // 3. Récupérer la facture
    const invoice = await Invoice.findOne({
      _id: id,
      userId: session.user.id,
    });

    if (!invoice) {
      return NextResponse.json(
        { error: 'Facture non trouvée' },
        { status: 404 }
      );
    }

    // 4. Vérifier si la facture est finalisée
    if (invoice.isFinalized) {
      // Pour les factures finalisées, seuls les changements de statut de paiement sont autorisés
      const allowedStatuses = ['paid', 'partially_paid', 'overdue', 'cancelled'];
      
      if (!allowedStatuses.includes(newStatus)) {
        return NextResponse.json({
          error: 'Modification interdite',
          message: 'Cette facture est finalisée. Seuls les statuts de paiement peuvent être modifiés.',
          allowedStatuses,
        }, { status: 403 });
      }
    }

    // 5. Préparer les mises à jour
    const updateData: any = {
      status: newStatus,
    };

    // Ajouter paymentStatus en fonction du nouveau statut
    if (newStatus === 'paid') {
      updateData.paymentStatus = 'paid';
      updateData.paymentDate = paymentDate ? new Date(paymentDate) : new Date();
      updateData.amountPaid = invoice.total;
      updateData.balanceDue = 0;
    } else if (newStatus === 'partially_paid') {
      updateData.paymentStatus = 'partially_paid';
      if (paymentDate) updateData.paymentDate = new Date(paymentDate);
      // L'utilisateur devra mettre à jour amountPaid manuellement via l'édition
    } else if (newStatus === 'cancelled') {
      updateData.paymentStatus = 'cancelled';
    } else if (newStatus === 'overdue') {
      updateData.paymentStatus = 'overdue';
    } else if (newStatus === 'sent') {
      updateData.paymentStatus = 'pending';
      if (!invoice.sentAt) {
        updateData.sentAt = new Date();
      }
    } else if (newStatus === 'draft') {
      updateData.paymentStatus = 'pending';
    }

    // Ajouter la note dans privateNotes si fournie
    if (note) {
      const timestamp = new Date().toLocaleString('fr-FR');
      const noteEntry = `\n[${timestamp}] Changement statut: ${invoice.status} → ${newStatus}\n${note}`;
      updateData.privateNotes = (invoice.privateNotes || '') + noteEntry;
    }

    // 6. Mettre à jour la facture
    const updatedInvoice = await Invoice.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    console.log(`✅ Statut facture ${invoice.invoiceNumber} mis à jour: ${invoice.status} → ${newStatus}`);

    // 7. Retourner la facture mise à jour
    return NextResponse.json({
      success: true,
      message: 'Statut mis à jour avec succès',
      invoice: {
        _id: updatedInvoice._id,
        invoiceNumber: updatedInvoice.invoiceNumber,
        status: updatedInvoice.status,
        paymentStatus: updatedInvoice.paymentStatus,
        paymentDate: updatedInvoice.paymentDate,
      },
    });

  } catch (error: any) {
    console.error('❌ Erreur changement statut facture:', error);
    
    return NextResponse.json(
      {
        error: 'Erreur lors du changement de statut',
        message: error.message || 'Une erreur est survenue',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
