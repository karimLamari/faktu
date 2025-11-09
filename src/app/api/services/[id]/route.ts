import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth/auth';
import dbConnect from '@/lib/db/mongodb';
import Service from '@/models/Service';
import mongoose from 'mongoose';

// Validation schema for updates
const updateServiceSchema = z.object({
  name: z.string().min(1, 'Le nom est requis').optional(),
  description: z.string().optional(),
  unitPrice: z.number().min(0, 'Le prix doit être positif').optional(),
  taxRate: z.number().min(0).max(100, 'Le taux de TVA doit être entre 0 et 100').optional(),
  category: z.string().optional(),
  isActive: z.boolean().optional(),
});

// GET /api/services/[id] - Get a specific service
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

    const { id: serviceId } = await params;
    if (!mongoose.Types.ObjectId.isValid(serviceId)) {
      return NextResponse.json({ error: 'ID invalide' }, { status: 400 });
    }

    const service = await Service.findOne({
      _id: serviceId,
      userId: session.user.id,
    });

    if (!service) {
      return NextResponse.json({ error: 'Prestation non trouvée' }, { status: 404 });
    }

    return NextResponse.json(service);
  } catch (error: any) {
    console.error('Error fetching service:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération de la prestation' },
      { status: 500 }
    );
  }
}

// PATCH /api/services/[id] - Update a service
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

    const { id: serviceId } = await params;
    if (!mongoose.Types.ObjectId.isValid(serviceId)) {
      return NextResponse.json({ error: 'ID invalide' }, { status: 400 });
    }

    const body = await request.json();
    const validatedData = updateServiceSchema.parse(body);

    const service = await Service.findOneAndUpdate(
      { _id: serviceId, userId: session.user.id },
      { $set: validatedData },
      { new: true, runValidators: true }
    );

    if (!service) {
      return NextResponse.json({ error: 'Prestation non trouvée' }, { status: 404 });
    }

    return NextResponse.json(service);
  } catch (error: any) {
    console.error('Error updating service:', error);

    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Données invalides', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour de la prestation' },
      { status: 500 }
    );
  }
}

// DELETE /api/services/[id] - Delete a service
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

    const { id: serviceId } = await params;
    if (!mongoose.Types.ObjectId.isValid(serviceId)) {
      return NextResponse.json({ error: 'ID invalide' }, { status: 400 });
    }

    const service = await Service.findOneAndDelete({
      _id: serviceId,
      userId: session.user.id,
    });

    if (!service) {
      return NextResponse.json({ error: 'Prestation non trouvée' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Prestation supprimée avec succès' });
  } catch (error: any) {
    console.error('Error deleting service:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression de la prestation' },
      { status: 500 }
    );
  }
}
