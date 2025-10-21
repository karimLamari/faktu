import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/config';
import dbConnect from '@/lib/db/mongodb';
import Invoice from '@/models/Invoice';
import { invoiceSchema } from '@/lib/validations';
import { z } from 'zod';
import mongoose from 'mongoose';

interface Params {
  params: { id: string };
}

// GET a single invoice by ID
export async function GET(request: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }
  const { id } = params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: 'ID de facture invalide' }, { status: 400 });
  }
  try {
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
export async function PATCH(request: NextRequest, context: any) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }
  // Correction Next.js App Router : params doit être await si async
  const params = context?.params ? (typeof context.params.then === 'function' ? await context.params : context.params) : {};
  const { id } = params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: 'ID de facture invalide' }, { status: 400 });
  }
  try {
    const body = await request.json();
    const validatedData = invoiceSchema.partial().parse(body);
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
      return NextResponse.json({ error: 'Données invalides', details: error.issues }, { status: 400 });
    }
    console.error('Erreur mise à jour facture:', error);
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}

// DELETE an invoice by ID
export async function DELETE(request: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }
  const { id } = params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: 'ID de facture invalide' }, { status: 400 });
  }
  try {
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
