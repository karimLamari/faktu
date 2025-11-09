import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth/auth';
import dbConnect from '@/lib/db/mongodb';
import Expense from '@/models/Expense';
import mongoose from 'mongoose';
import { unlink } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

// Validation schema for updates
const updateExpenseSchema = z.object({
  vendor: z.string().min(1).optional(),
  amount: z.number().min(0).optional(),
  taxAmount: z.number().min(0).optional(),
  date: z.string().or(z.date()).optional(),
  category: z.string().optional(),
  description: z.string().optional(),
  invoiceNumber: z.string().optional(),
  paymentMethod: z.string().optional(),
});

// GET /api/expenses/[id] - Get a specific expense
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    await dbConnect();

    const { id: expenseId } = await params;
    if (!mongoose.Types.ObjectId.isValid(expenseId)) {
      return NextResponse.json({ error: 'ID invalide' }, { status: 400 });
    }

    const expense = await Expense.findOne({
      _id: expenseId,
      userId: session.user.id,
    });

    if (!expense) {
      return NextResponse.json({ error: 'Dépense non trouvée' }, { status: 404 });
    }

    return NextResponse.json(expense);
  } catch (error: any) {
    console.error('Error fetching expense:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération de la dépense' },
      { status: 500 }
    );
  }
}

// PATCH /api/expenses/[id] - Update an expense
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    await dbConnect();

    const { id: expenseId } = await params;
    if (!mongoose.Types.ObjectId.isValid(expenseId)) {
      return NextResponse.json({ error: 'ID invalide' }, { status: 400 });
    }

    const body = await request.json();
    const validatedData = updateExpenseSchema.parse(body);

    const expense = await Expense.findOneAndUpdate(
      { _id: expenseId, userId: session.user.id },
      { $set: validatedData },
      { new: true, runValidators: true }
    );

    if (!expense) {
      return NextResponse.json({ error: 'Dépense non trouvée' }, { status: 404 });
    }

    return NextResponse.json(expense);
  } catch (error: any) {
    console.error('Error updating expense:', error);

    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Données invalides', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour de la dépense' },
      { status: 500 }
    );
  }
}

// DELETE /api/expenses/[id] - Delete an expense
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    await dbConnect();

    const { id: expenseId } = await params;
    if (!mongoose.Types.ObjectId.isValid(expenseId)) {
      return NextResponse.json({ error: 'ID invalide' }, { status: 400 });
    }

    const expense = await Expense.findOneAndDelete({
      _id: expenseId,
      userId: session.user.id,
    });

    if (!expense) {
      return NextResponse.json({ error: 'Dépense non trouvée' }, { status: 404 });
    }

    // Delete image file
    try {
      const imagePath = join(process.cwd(), 'public', expense.receiptImage);
      if (existsSync(imagePath)) {
        await unlink(imagePath);
      }
    } catch (fileError) {
      console.error('Error deleting image file:', fileError);
      // Continue anyway, database record is deleted
    }

    return NextResponse.json({ message: 'Dépense supprimée avec succès' });
  } catch (error: any) {
    console.error('Error deleting expense:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression de la dépense' },
      { status: 500 }
    );
  }
}
