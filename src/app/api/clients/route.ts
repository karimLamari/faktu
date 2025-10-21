import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/config';
import dbConnect from '@/lib/db/mongodb';
import Client from '@/models/Client';
import { clientSchema } from '@/lib/validations';
import { z } from 'zod';

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  try {
    const body = await request.json();
    console.log('POST /api/clients - body:', body);
    let validatedData;
    try {
      validatedData = clientSchema.parse(body);
    } catch (zodErr) {
      console.error('Zod validation error:', zodErr);
      if (zodErr instanceof z.ZodError) {
        return NextResponse.json({ error: 'Données invalides', details: zodErr.issues, body }, { status: 400 });
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
      return NextResponse.json({ error: 'Données invalides', details: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  try {
    await dbConnect();

    const clients = await Client.find({ userId: session.user.id }).sort({ companyName: 1 });

    return NextResponse.json(clients, { status: 200 });
  } catch (error) {
    console.error('Erreur lors de la récupération des clients:', error);
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}
