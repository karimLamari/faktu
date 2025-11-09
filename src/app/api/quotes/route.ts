import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth/auth';
import dbConnect from '@/lib/db/mongodb';
import Quote from '@/models/Quote';
import Client from '@/models/Client';
import { quoteSchema } from '@/lib/validations';
import { getNextQuoteNumber } from '@/lib/services/quote-numbering';
import { checkQuoteLimit, incrementQuoteUsage } from '@/lib/subscription/checkAccess';

// POST /api/quotes - Create a new quote
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  try {
    // Vérifier les limites de devis
    const { allowed, current, limit, plan } = await checkQuoteLimit();
    
    if (!allowed) {
      return NextResponse.json({ 
        error: 'Limite de devis atteinte',
        limitReached: true,
        current,
        limit,
        plan
      }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = quoteSchema.parse(body);

    await dbConnect();

    // Verify client exists and belongs to user
    const client = await Client.findOne({ 
      _id: validatedData.clientId, 
      userId: session.user.id 
    });

    if (!client) {
      return NextResponse.json(
        { error: 'Client non trouvé ou non autorisé' },
        { status: 404 }
      );
    }

    // Generate quote number with client name
    const { quoteNumber } = await getNextQuoteNumber(session.user.id, validatedData.clientId);

    // Calculate totals from items (don't trust frontend)
    let subtotal = 0;
    let taxAmount = 0;

    for (const item of validatedData.items) {
      const itemTotal = item.quantity * item.unitPrice;
      subtotal += itemTotal;
      taxAmount += itemTotal * (item.taxRate / 100);
    }

    const total = subtotal + taxAmount;

    // Create quote
    const quote = await Quote.create({
      ...validatedData,
      userId: session.user.id,
      quoteNumber,
      status: 'draft',
      subtotal,
      taxAmount,
      total,
    });

    // Incrémenter l'usage
    await incrementQuoteUsage();

    return NextResponse.json(quote, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Données invalides', details: error.issues },
        { status: 400 }
      );
    }
    console.error('Error creating quote:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création du devis' },
      { status: 500 }
    );
  }
}

// GET /api/quotes - List all quotes for the authenticated user
export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const clientId = searchParams.get('clientId');
    const search = searchParams.get('search');

    // Build query
    const query: any = { userId: session.user.id };

    if (status) {
      query.status = status;
    }

    if (clientId) {
      query.clientId = clientId;
    }

    if (search) {
      query.$or = [
        { quoteNumber: { $regex: search, $options: 'i' } },
      ];
    }

    const quotes = await Quote.find(query)
      .populate('clientId', 'name email')
      .sort({ issueDate: -1 })
      .lean();

    return NextResponse.json(quotes);
  } catch (error) {
    console.error('Error fetching quotes:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des devis' },
      { status: 500 }
    );
  }
}
