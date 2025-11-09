import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth/auth';
import dbConnect from '@/lib/db/mongodb';
import Quote from '@/models/Quote';
import Invoice from '@/models/Invoice';
import Client from '@/models/Client';
import { convertQuoteSchema } from '@/lib/validations';
import { getNextInvoiceNumber } from '@/lib/services/invoice-numbering';

// POST /api/quotes/[id]/convert - Convert quote to invoice
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  try {
    await dbConnect();
    const { id } = await params;
    const body = await request.json();

    // Validate request body
    const validatedData = convertQuoteSchema.parse(body);

    // Find quote and verify ownership
    const quote = await Quote.findOne({
      _id: id,
      userId: session.user.id,
    }).populate('clientId');

    if (!quote) {
      return NextResponse.json(
        { error: 'Devis non trouvé' },
        { status: 404 }
      );
    }

    // Verify quote can be converted
    if (quote.status === 'converted') {
      return NextResponse.json(
        { error: 'Ce devis a déjà été converti en facture' },
        { status: 400 }
      );
    }

    if (quote.status === 'rejected') {
      return NextResponse.json(
        { error: 'Impossible de convertir un devis refusé' },
        { status: 400 }
      );
    }

    if (quote.status === 'expired') {
      return NextResponse.json(
        { error: 'Impossible de convertir un devis expiré' },
        { status: 400 }
      );
    }

    // Get client payment terms for due date calculation
    const client = await Client.findById(quote.clientId);
    if (!client) {
      return NextResponse.json(
        { error: 'Client non trouvé' },
        { status: 404 }
      );
    }

    // DEBUG: Log quote data before conversion
    console.log('🔍 [CONVERT] Données du devis avant conversion:', {
      quoteId: quote._id,
      quoteNumber: quote.quoteNumber,
      items: quote.items,
      subtotal: quote.subtotal,
      taxAmount: quote.taxAmount,
      total: quote.total,
      itemsCount: quote.items?.length,
    });

    // Generate invoice number with client name
    const { invoiceNumber } = await getNextInvoiceNumber(session.user.id, {
      clientName: client.name
    });

    // Calculate dates
    const issueDate = validatedData.issueDate
      ? new Date(validatedData.issueDate)
      : new Date();

    const dueDate = validatedData.dueDate
      ? new Date(validatedData.dueDate)
      : new Date(issueDate.getTime() + (client.paymentTerms || 30) * 24 * 60 * 60 * 1000);

    // Create invoice from quote
    const invoice = await Invoice.create({
      userId: session.user.id,
      clientId: quote.clientId,
      invoiceNumber,
      status: 'draft',
      issueDate,
      dueDate,
      items: quote.items,
      subtotal: quote.subtotal,
      taxAmount: quote.taxAmount,
      total: quote.total,
      amountPaid: 0,
      balanceDue: quote.total,
      paymentMethod: 'bank_transfer',
      paymentStatus: 'pending',
      notes: quote.notes,
      privateNotes: quote.privateNotes,
      terms: quote.terms,
    });

    // DEBUG: Log invoice data after creation
    console.log('✅ [CONVERT] Facture créée:', {
      invoiceId: invoice._id,
      invoiceNumber: invoice.invoiceNumber,
      items: invoice.items,
      subtotal: invoice.subtotal,
      taxAmount: invoice.taxAmount,
      total: invoice.total,
      itemsCount: invoice.items?.length,
    });

    // Update quote status
    await Quote.findByIdAndUpdate(id, {
      $set: {
        status: 'converted',
        convertedToInvoiceId: invoice._id,
        convertedAt: new Date(),
      },
    });

    // Fetch updated quote
    const updatedQuote = await Quote.findById(id).populate('clientId', 'name email');

    return NextResponse.json({
      success: true,
      message: 'Devis converti en facture avec succès',
      quote: updatedQuote,
      invoice,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Données invalides', details: error.issues },
        { status: 400 }
      );
    }
    console.error('Error converting quote:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la conversion du devis' },
      { status: 500 }
    );
  }
}
