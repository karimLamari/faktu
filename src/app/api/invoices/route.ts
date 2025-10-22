import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import dbConnect from '@/lib/db/mongodb';
import Invoice from '@/models/Invoice';
import Client from '@/models/Client';
import { invoiceSchema } from '@/lib/validations';
import { getNextInvoiceNumber } from '@/lib/services/invoice-numbering';
import { z } from 'zod';

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }
  try {
    const body = await request.json();
    const validatedData = invoiceSchema.parse(body);
    await dbConnect();
    const { invoiceNumber } = await getNextInvoiceNumber(session.user.id);
    const client = await Client.findOne({ _id: validatedData.clientId, userId: session.user.id });
    if (!client) {
      return NextResponse.json({ error: 'Client non trouvé ou non autorisé' }, { status: 404 });
    }
    const invoice = await Invoice.create({
      ...validatedData,
      userId: session.user.id,
      invoiceNumber,
      status: 'draft',
    });
    return NextResponse.json(invoice, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        error: 'Données invalides',
        errors: error.issues.map((issue: any) => issue.message),
        details: error.issues
      }, { status: 400 });
    }
    console.error('Erreur création facture:', error);
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }
  try {
    await dbConnect();
    const invoices = await Invoice.find({ userId: session.user.id }).sort({ createdAt: -1 });
    return NextResponse.json(invoices, { status: 200 });
  } catch (error) {
    console.error('Erreur lors de la récupération des factures:', error);
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}
