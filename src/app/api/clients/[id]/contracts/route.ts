import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import dbConnect from '@/lib/db/mongodb';
import Client from '@/models/Client';
import { saveContractToServer } from '@/lib/contracts/storage';
import mongoose from 'mongoose';

/**
 * GET /api/clients/[id]/contracts
 * Récupère la liste de tous les contrats d'un client
 */
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

    // Trouver le client
    const client = await Client.findOne({
      _id: id,
      userId: session.user.id,
    });

    if (!client) {
      return NextResponse.json(
        { error: 'Client non trouvé' },
        { status: 404 }
      );
    }

    // Convert ObjectIds to strings for Client Components
    const contracts = (client.contracts || []).map((contract: any) => ({
      ...contract.toObject ? contract.toObject() : contract,
      _id: contract._id?.toString(),
    }));
    
    // Retourner la liste des contrats
    return NextResponse.json({
      success: true,
      contracts,
    });

  } catch (error: any) {
    console.error('Erreur récupération contrats:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des contrats' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/clients/[id]/contracts
 * Créer un nouveau contrat pour un client
 */
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

    // Récupérer le FormData
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const description = formData.get('description') as string | null;

    if (!file) {
      return NextResponse.json(
        { error: 'Aucun fichier fourni' },
        { status: 400 }
      );
    }

    // Trouver le client
    const client = await Client.findOne({
      _id: id,
      userId: session.user.id,
    });

    if (!client) {
      return NextResponse.json(
        { error: 'Client non trouvé' },
        { status: 404 }
      );
    }

    // Sauvegarder le fichier sur le serveur
    const fileUrl = await saveContractToServer(file, session.user.id, id);

    // Créer le contrat avec un _id généré manuellement
    const newContract = {
      _id: new mongoose.Types.ObjectId(),
      fileName: file.name,
      fileUrl,
      fileSize: file.size,
      fileType: file.type,
      description: description || '',
      uploadedAt: new Date(),
    };

    // Initialiser contracts si undefined
    if (!client.contracts) {
      client.contracts = [];
    }

    client.contracts.push(newContract);
    
    // Forcer Mongoose à détecter le changement sur le tableau
    client.markModified('contracts');
    await client.save();

    if (process.env.NODE_ENV === 'development') {
      console.log('✅ Contrat créé avec succès:', {
        clientId: id,
        contractId: newContract._id,
        fileName: file.name,
        totalContracts: client.contracts.length,
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Contrat créé avec succès',
      contract: {
        ...newContract,
        _id: newContract._id.toString(),
      },
    });

  } catch (error: any) {
    console.error('Erreur création contrat:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création du contrat' },
      { status: 500 }
    );
  }
}
