import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import dbConnect from '@/lib/db/mongodb';
import Client from '@/models/Client';
import { clientSchema } from '@/lib/validations';
import { z } from 'zod';

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }
  try {
    const body = await request.json();
    let validatedData;
    try {
      validatedData = clientSchema.parse(body);
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
    const newClient = await Client.create({
      ...validatedData,
      userId: session.user.id,
    });
    return NextResponse.json(newClient, { status: 201 });
  } catch (error) {
    console.error('Erreur lors de la création du client:', error);
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

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }
  try {
    await dbConnect();
    const clients = await Client.find({ userId: session.user.id }).sort({ createdAt: -1 });
    return NextResponse.json(clients, { status: 200 });
  } catch (error) {
    console.error('Erreur lors de la récupération des clients:', error);
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}
