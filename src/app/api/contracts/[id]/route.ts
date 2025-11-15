import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import dbConnect from '@/lib/db/mongodb';
import Client from '@/models/Client';
import { readContractFromServer, contractExists, isSecurePath } from '@/lib/contracts/storage';

/**
 * GET /api/contracts/[id]
 * Endpoint sécurisé pour servir un contrat
 * - Vérifie l'authentification
 * - Vérifie que l'utilisateur a accès au contrat
 * - Sert le fichier avec les bons headers
 */
export async function GET(request: NextRequest, context: any) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const params = context?.params ? (typeof context.params.then === 'function' ? await context.params : context.params) : {};
  const { id: contractId } = params;

  if (!contractId) {
    return NextResponse.json({ error: 'ID du contrat manquant' }, { status: 400 });
  }

  try {
    await dbConnect();

    // Trouver le client qui possède ce contrat
    const client = await Client.findOne({
      userId: session.user.id,
      'contracts._id': contractId,
    });

    if (!client) {
      return NextResponse.json(
        { error: 'Contrat non trouvé ou accès refusé' },
        { status: 404 }
      );
    }

    // Vérifier que le client a des contrats
    if (!client.contracts || client.contracts.length === 0) {
      return NextResponse.json(
        { error: 'Aucun contrat pour ce client' },
        { status: 404 }
      );
    }

    // Récupérer le contrat spécifique (contracts existe après vérification)
    const contract = client.contracts!.find(
      (c: any) => c._id.toString() === contractId
    );

    if (!contract) {
      return NextResponse.json(
        { error: 'Contrat non trouvé' },
        { status: 404 }
      );
    }

    // Vérifier la sécurité du chemin
    if (!isSecurePath(contract.fileUrl)) {
      console.error(`⚠️ Tentative d'accès à un chemin non sécurisé: ${contract.fileUrl}`);
      return NextResponse.json(
        { error: 'Chemin de fichier invalide' },
        { status: 400 }
      );
    }

    // Vérifier que le fichier existe
    const exists = await contractExists(contract.fileUrl);
    if (!exists) {
      console.warn(`⚠️ Fichier de contrat introuvable: ${contract.fileUrl}`);
      return NextResponse.json(
        { error: 'Fichier de contrat introuvable' },
        { status: 404 }
      );
    }

    // Lire le fichier
    console.log(`📄 Lecture du contrat: ${contract.fileUrl}`);
    const fileBuffer = await readContractFromServer(contract.fileUrl);

    // Déterminer le Content-Type
    const contentType = contract.fileType || 'application/octet-stream';

    // CORRECTION : Convertir le Buffer en Uint8Array
    const uint8Array = new Uint8Array(fileBuffer);

    // Retourner le fichier avec les bons headers
    return new NextResponse(uint8Array, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `inline; filename="${encodeURIComponent(contract.fileName)}"`,
        'Content-Length': fileBuffer.length.toString(),
        'Cache-Control': 'private, max-age=3600', // Cache 1h
        'X-Contract-Id': contractId,
      },
    });

  } catch (error: any) {
    console.error('Erreur récupération contrat:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération du contrat' },
      { status: 500 }
    );
  }
}