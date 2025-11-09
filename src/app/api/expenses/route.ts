import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth/auth';
import dbConnect from '@/lib/db/mongodb';
import Expense from '@/models/Expense';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { checkExpenseLimit, incrementExpenseUsage } from '@/lib/subscription/checkAccess';

// Validation schema
const createExpenseSchema = z.object({
  vendor: z.string().min(1, 'Le fournisseur est requis'),
  amount: z.number().min(0, 'Le montant doit être positif'),
  taxAmount: z.number().min(0).default(0),
  date: z.string().or(z.date()),
  category: z.string().min(1, 'La catégorie est requise'),
  description: z.string().optional(),
  invoiceNumber: z.string().optional(),
  paymentMethod: z.string().optional(),
});

// GET /api/expenses - List all expenses for the authenticated user
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const search = searchParams.get('search');

    const query: any = { userId: session.user.id };

    if (category && category !== 'all') {
      query.category = category;
    }

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    if (search) {
      query.$or = [
        { vendor: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { invoiceNumber: { $regex: search, $options: 'i' } },
      ];
    }

    const expenses = await Expense.find(query).sort({ date: -1 });

    return NextResponse.json(expenses);
  } catch (error: any) {
    console.error('Error fetching expenses:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des dépenses' },
      { status: 500 }
    );
  }
}

// POST /api/expenses - Create a new expense with image upload
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    // Vérifier les limites de dépenses
    const { allowed, current, limit, plan } = await checkExpenseLimit();
    
    if (!allowed) {
      return NextResponse.json({ 
        error: 'Limite de dépenses atteinte',
        limitReached: true,
        current,
        limit,
        plan
      }, { status: 403 });
    }

    await dbConnect();

    const formData = await request.formData();
    const image = formData.get('image') as File;
    const dataString = formData.get('data') as string;

    if (!image) {
      console.error('POST /api/expenses - Image manquante');
      return NextResponse.json({ error: 'Image requise' }, { status: 400 });
    }

    if (!dataString) {
      console.error('POST /api/expenses - Données manquantes');
      return NextResponse.json({ error: 'Données requises' }, { status: 400 });
    }

    let data;
    try {
      data = JSON.parse(dataString);
    } catch (e) {
      console.error('POST /api/expenses - Erreur parsing JSON:', e);
      return NextResponse.json({ error: 'Format de données invalide' }, { status: 400 });
    }

    // Validate data
    let validatedData;
    try {
      validatedData = createExpenseSchema.parse(data);
    } catch (error: any) {
      console.error('POST /api/expenses - Validation error:', error);
      return NextResponse.json(
        { error: 'Données invalides', details: error.errors },
        { status: 400 }
      );
    }

    const bytes = await image.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create upload directory
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'expenses', session.user.id);
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(7);
    const extension = image.name.split('.').pop();
    const filename = `${timestamp}-${randomId}.${extension}`;
    const filepath = join(uploadDir, filename);

    // Write file
    await writeFile(filepath, buffer);

    // Save to database
    const receiptImage = `/uploads/expenses/${session.user.id}/${filename}`;
    const expense = await Expense.create({
      userId: session.user.id,
      ...validatedData,
      receiptImage,
    });

    // Incrémenter l'usage
    await incrementExpenseUsage();

    return NextResponse.json(expense, { status: 201 });
  } catch (error: any) {
    console.error('Error creating expense:', error);

    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Données invalides', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Erreur lors de la création de la dépense' },
      { status: 500 }
    );
  }
}
