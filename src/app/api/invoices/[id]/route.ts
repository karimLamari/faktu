import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import dbConnect from '@/lib/db/mongodb';
import Invoice from '@/models/Invoice';
import { invoiceSchema } from '@/lib/validations';
import { z } from 'zod';
import mongoose from 'mongoose';

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
      await dbConnect();
      const existingInvoice = await Invoice.findOne({ _id: id, userId: session.user.id });
      if (!existingInvoice) {
        return NextResponse.json({ error: 'Facture non trouvée ou non autorisé à modifier' }, { status: 404 });
      }

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

    await dbConnect();
    const updatedInvoice = await Invoice.findOneAndUpdate(
      { _id: id, userId: session.user.id },
      { $set: validatedData },
      { new: true, runValidators: true }
    );
    if (!updatedInvoice) {
      return NextResponse.json({ error: 'Facture non trouvée ou non autorisé à modifier' }, { status: 404 });
    }
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
    const deletedInvoice = await Invoice.findOneAndDelete({ _id: id, userId: session.user.id });
    if (!deletedInvoice) {
      return NextResponse.json({ error: 'Facture non trouvée ou non autorisé à supprimer' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Facture supprimée avec succès' }, { status: 200 });
  } catch (error) {
    console.error('Erreur suppression facture:', error);
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}
