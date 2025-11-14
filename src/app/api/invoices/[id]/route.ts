import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import dbConnect from '@/lib/db/mongodb';
import Invoice from '@/models/Invoice';
import { invoiceSchema } from '@/lib/validations';
import { z } from 'zod';
import mongoose from 'mongoose';
import { logInvoiceAction, detectInvoiceChanges } from '@/lib/services/audit-logger';

// GET a single invoice by ID
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }
    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'ID de facture invalide' }, { status: 400 });
    }
    await dbConnect();
    const invoice = await Invoice.findOne({ _id: id, userId: session.user.id });
    if (!invoice) {
      return NextResponse.json({ error: 'Facture non trouvée' }, { status: 404 });
    }
    return NextResponse.json(invoice, { status: 200 });
  } catch (error) {
    console.error('Erreur récupération facture:', error);
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}

// PATCH (update) an invoice by ID
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }
    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'ID de facture invalide' }, { status: 400 });
    }
    const body = await request.json();
    const validatedData = invoiceSchema.partial().parse(body);

    await dbConnect();
    
    // 🔒 VÉRIFICATION CONFORMITÉ LÉGALE
    // Récupérer la facture existante AVANT modification
    const existingInvoice = await Invoice.findOne({ _id: id, userId: session.user.id });
    if (!existingInvoice) {
      return NextResponse.json({ 
        error: 'Facture non trouvée ou non autorisé à modifier' 
      }, { status: 404 });
    }

    // ⚠️ BLOQUER MODIFICATION SI FACTURE FINALISÉE (Article L123-22 Code de commerce)
    if (existingInvoice.isFinalized || existingInvoice.sentAt) {
      // Logger la tentative de modification dans l'audit trail
      await logInvoiceAction(
        id,
        session.user.id,
        'modification_attempt',
        session.user.id,
        request,
        detectInvoiceChanges(existingInvoice.toObject(), validatedData),
        { 
          blocked: true, 
          reason: existingInvoice.isFinalized ? 'facture_finalisée' : 'facture_envoyée',
          attemptedChanges: Object.keys(validatedData)
        }
      );

      return NextResponse.json({ 
        error: 'Modification interdite par la loi',
        message: existingInvoice.isFinalized 
          ? 'Cette facture est finalisée et verrouillée. Modification impossible (conformité légale Article L123-22).'
          : 'Cette facture a été envoyée au client. Pour la modifier, vous devez créer une facture d\'avoir.',
        isFinalized: existingInvoice.isFinalized,
        finalizedAt: existingInvoice.finalizedAt,
        sentAt: existingInvoice.sentAt,
      }, { 
        status: 403,
        headers: {
          'X-Invoice-Finalized': existingInvoice.isFinalized ? 'true' : 'false',
          'X-Invoice-Sent': existingInvoice.sentAt ? 'true' : 'false',
        }
      });
    }

    // Recalculate totals if items are being updated
    if (validatedData.items && validatedData.items.length > 0) {
      let subtotal = 0;
      let taxAmount = 0;

      for (const item of validatedData.items) {
        const itemTotal = item.quantity * item.unitPrice;
        subtotal += itemTotal;
        taxAmount += itemTotal * (item.taxRate / 100);
      }

      const total = subtotal + taxAmount;

      validatedData.subtotal = subtotal;
      validatedData.taxAmount = taxAmount;
      validatedData.total = total;
    }

    // Calcul automatique de balanceDue si les champs pertinents sont modifiés
    if (validatedData.total !== undefined || validatedData.amountPaid !== undefined) {
      const total = validatedData.total !== undefined ? validatedData.total : existingInvoice.total;
      const amountPaid = validatedData.amountPaid !== undefined ? validatedData.amountPaid : existingInvoice.amountPaid;

      // Validation métier
      if (amountPaid > total) {
        return NextResponse.json({ 
          error: 'Le montant payé ne peut pas dépasser le total' 
        }, { status: 400 });
      }

      validatedData.balanceDue = Math.max(0, total - amountPaid);
    }

    // Détecter les changements pour l'audit trail
    const changes = detectInvoiceChanges(existingInvoice.toObject(), validatedData);

    const updatedInvoice = await Invoice.findOneAndUpdate(
      { _id: id, userId: session.user.id },
      { $set: validatedData },
      { new: true, runValidators: true }
    );
    if (!updatedInvoice) {
      return NextResponse.json({ error: 'Facture non trouvée ou non autorisé à modifier' }, { status: 404 });
    }

    // Logger la modification réussie dans l'audit trail
    await logInvoiceAction(
      id,
      session.user.id,
      'updated',
      session.user.id,
      request,
      changes,
      { updatedFields: Object.keys(validatedData) }
    );

    return NextResponse.json(updatedInvoice, { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        error: 'Données invalides',
        errors: error.issues.map((issue: any) => issue.message),
        details: error.issues
      }, { status: 400 });
    }
    console.error('Erreur update facture:', error);
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}

// DELETE an invoice by ID
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }
    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'ID de facture invalide' }, { status: 400 });
    }
    await dbConnect();
    
    // Récupérer la facture pour vérifier si elle est finalisée
    const invoice = await Invoice.findOne({ _id: id, userId: session.user.id });
    if (!invoice) {
      return NextResponse.json({ error: 'Facture non trouvée ou non autorisé à supprimer' }, { status: 404 });
    }

    // 🔒 SOFT DELETE si facture finalisée (obligation légale d'archivage 10 ans)
    if (invoice.isFinalized || invoice.sentAt) {
      // Soft delete: marquer comme supprimée sans supprimer physiquement
      await Invoice.updateOne(
        { _id: id },
        { 
          $set: { 
            deletedAt: new Date(),
            deletedBy: new mongoose.Types.ObjectId(session.user.id),
            status: 'cancelled'
          }
        }
      );

      // Logger dans l'audit trail
      await logInvoiceAction(
        id,
        session.user.id,
        'deleted',
        session.user.id,
        request,
        [],
        { 
          softDelete: true, 
          reason: invoice.isFinalized ? 'facture_finalisée' : 'facture_envoyée',
          invoiceNumber: invoice.invoiceNumber
        }
      );

      return NextResponse.json({ 
        message: 'Facture archivée avec succès',
        softDelete: true,
        info: 'La facture a été archivée mais conservée pour conformité légale (obligation d\'archivage 10 ans).',
        deletedAt: new Date(),
      }, { status: 200 });
    }

    // 🗑️ HARD DELETE si facture brouillon (non finalisée)
    const deletedInvoice = await Invoice.findOneAndDelete({ _id: id, userId: session.user.id });
    
    // Logger la suppression physique
    await logInvoiceAction(
      id,
      session.user.id,
      'deleted',
      session.user.id,
      request,
      [],
      { 
        softDelete: false, 
        reason: 'facture_brouillon',
        invoiceNumber: deletedInvoice?.invoiceNumber
      }
    );

    return NextResponse.json({ 
      message: 'Facture supprimée avec succès',
      softDelete: false
    }, { status: 200 });
  } catch (error) {
    console.error('Erreur suppression facture:', error);
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}
