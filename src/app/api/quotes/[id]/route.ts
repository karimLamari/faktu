import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth/auth';
import dbConnect from '@/lib/db/mongodb';
import Quote from '@/models/Quote';
import { quoteSchema } from '@/lib/validations';

// GET /api/quotes/[id] - Get a single quote
export async function GET(
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

    const quote = await Quote.findOne({
      _id: id,
      userId: session.user.id,
    }).populate('clientId', 'name email phone address');

    if (!quote) {
      return NextResponse.json(
        { error: 'Devis non trouvé' },
        { status: 404 }
      );
    }

    return NextResponse.json(quote);
  } catch (error) {
    console.error('Error fetching quote:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération du devis' },
      { status: 500 }
    );
  }
}

// PATCH /api/quotes/[id] - Update a quote
export async function PATCH(
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

    // Find quote and verify ownership
    const existingQuote = await Quote.findOne({
      _id: id,
      userId: session.user.id,
    });

    if (!existingQuote) {
      return NextResponse.json(
        { error: 'Devis non trouvé' },
        { status: 404 }
      );
    }

    // Prevent modification of converted quotes
    if (existingQuote.status === 'converted') {
      return NextResponse.json(
        { error: 'Impossible de modifier un devis déjà converti en facture' },
        { status: 400 }
      );
    }

    // Prevent modification of accepted/rejected quotes
    if (['accepted', 'rejected'].includes(existingQuote.status)) {
      return NextResponse.json(
        { error: 'Impossible de modifier un devis accepté ou refusé' },
        { status: 400 }
      );
    }

    // Validate data (partial schema for updates)
    const updateSchema = quoteSchema.partial().omit({ clientId: true });
    const validatedData = updateSchema.parse(body);

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

    // Update quote
    const updatedQuote = await Quote.findByIdAndUpdate(
      id,
      { $set: validatedData },
      { new: true, runValidators: true }
    ).populate('clientId', 'name email');

    return NextResponse.json(updatedQuote);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Données invalides', details: error.issues },
        { status: 400 }
      );
    }
    console.error('Error updating quote:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour du devis' },
      { status: 500 }
    );
  }
}

// DELETE /api/quotes/[id] - Delete a quote
export async function DELETE(
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

    // Find quote and verify ownership
    const existingQuote = await Quote.findOne({
      _id: id,
      userId: session.user.id,
    });

    if (!existingQuote) {
      return NextResponse.json(
        { error: 'Devis non trouvé' },
        { status: 404 }
      );
    }

    // Allow deletion of any quote (including converted ones)
    await Quote.findByIdAndDelete(id);

    return NextResponse.json({ success: true, message: 'Devis supprimé avec succès' });
  } catch (error) {
    console.error('Error deleting quote:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression du devis' },
      { status: 500 }
    );
  }
}
