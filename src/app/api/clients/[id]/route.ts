
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import dbConnect from '@/lib/db/mongodb';
import Client from '@/models/Client';
import { clientSchema, clientUpdateSchema } from '@/lib/validations';
import { z } from 'zod';
import mongoose from 'mongoose';

// GET a single client by ID
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }
    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'ID de client invalide' }, { status: 400 });
    }
    await dbConnect();
    const client = await Client.findOne({ _id: id, userId: session.user.id });
    if (!client) {
      return NextResponse.json({ error: 'Client non trouvé' }, { status: 404 });
    }
    return NextResponse.json(client, { status: 200 });
  } catch (error) {
    console.error('Erreur lors de la récupération du client:', error);
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}

// PATCH (update) a client by ID
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }
    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'ID de client invalide' }, { status: 400 });
    }
    const body = await request.json();
    let validatedData;
    try {
      validatedData = clientUpdateSchema.parse(body);
      
      // Générer le champ name si nécessaire lors de l'update
      if (validatedData.type === 'individual' && validatedData.firstName && validatedData.lastName) {
        validatedData.name = `${validatedData.firstName} ${validatedData.lastName}`;
      } else if (validatedData.type === 'business' && validatedData.companyInfo?.legalName) {
        validatedData.name = validatedData.companyInfo.legalName;
      }
    } catch (zodErr) {
      console.error('Zod validation error:', zodErr);
      if (zodErr instanceof z.ZodError) {
        return NextResponse.json({
          error: 'Données invalides',
          errors: zodErr.issues.map((issue: any) => issue.message),
          details: zodErr.issues,
          body
        }, { status: 400 });
      }
      throw zodErr;
    }
    await dbConnect();
    const updatedClient = await Client.findOneAndUpdate(
      { _id: id, userId: session.user.id },
      { $set: validatedData },
      { new: true, runValidators: true }
    );
    if (!updatedClient) {
      return NextResponse.json({ error: 'Client non trouvé ou non autorisé à modifier' }, { status: 404 });
    }
    return NextResponse.json(updatedClient, { status: 200 });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du client:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        error: 'Données invalides',
        errors: error.issues.map((issue: any) => issue.message),
        details: error.issues
      }, { status: 400 });
    }
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}

// DELETE a client by ID
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }
    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'ID de client invalide' }, { status: 400 });
    }
    await dbConnect();
    const deletedClient = await Client.findOneAndDelete({ _id: id, userId: session.user.id });
    if (!deletedClient) {
      return NextResponse.json({ error: 'Client non trouvé ou non autorisé à supprimer' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Client supprimé avec succès' }, { status: 200 });
  } catch (error) {
    console.error('Erreur lors de la suppression du client:', error);
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}
