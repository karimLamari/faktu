import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import dbConnect from '@/lib/db/mongodb';
import Client from '@/models/Client';
import { deleteContractFromServer, contractExists, readContractFromServer } from '@/lib/contracts/storage';

/**
 * GET /api/clients/[id]/contracts/[contractId]
 * Télécharger/visualiser un contrat spécifique
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; contractId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  try {
    await dbConnect();
    const { id, contractId } = await params;

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

    // Trouver le contrat spécifique
    const contract = client.contracts.id(contractId);

    if (!contract) {
      return NextResponse.json(
        { error: 'Contrat non trouvé' },
        { status: 404 }
      );
    }

    // Lire le fichier depuis le stockage
    const buffer = await readContractFromServer(contract.fileUrl);

    if (!buffer) {
      return NextResponse.json(
        { error: 'Fichier non trouvé sur le serveur' },
        { status: 404 }
      );
    }

    // Déterminer le Content-Type
    let contentType = 'application/octet-stream';
    if (contract.fileType) {
      contentType = contract.fileType;
    } else {
      // Déduire du nom de fichier si fileType n'est pas disponible
      const fileName = contract.fileName.toLowerCase();
      if (fileName.endsWith('.pdf')) {
        contentType = 'application/pdf';
      } else if (fileName.endsWith('.doc')) {
        contentType = 'application/msword';
      } else if (fileName.endsWith('.docx')) {
        contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      } else if (fileName.endsWith('.jpg') || fileName.endsWith('.jpeg')) {
        contentType = 'image/jpeg';
      } else if (fileName.endsWith('.png')) {
        contentType = 'image/png';
      }
    }

    // Convertir le Buffer Node.js en Uint8Array pour NextResponse
    const uint8Array = new Uint8Array(buffer);

    // Retourner le fichier avec les bons headers
    return new NextResponse(uint8Array, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `inline; filename="${encodeURIComponent(contract.fileName)}"`,
        'Content-Length': buffer.length.toString(),
        'Cache-Control': 'private, max-age=3600',
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

// DELETE - Supprimer un contrat
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; contractId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  try {
    await dbConnect();
    const { id, contractId } = await params;

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

    // Vérifier que contracts existe
    if (!client.contracts || client.contracts.length === 0) {
      return NextResponse.json(
        { error: 'Aucun contrat pour ce client' },
        { status: 404 }
      );
    }

    console.log('🔍 Debug DELETE:', {
      contractId,
      contractsCount: client.contracts.length,
      contractIds: client.contracts.map((c: any) => c._id?.toString()),
    });

    // Trouver le contrat
    const contract = client.contracts.find((c: any) => c._id.toString() === contractId);
    if (!contract) {
      return NextResponse.json(
        { error: 'Contrat non trouvé' },
        { status: 404 }
      );
    }

    // Supprimer le fichier physique
    const exists = await contractExists(contract.fileUrl);
    if (exists) {
      try {
        await deleteContractFromServer(contract.fileUrl);
      } catch (err) {
        console.error('Erreur suppression fichier:', err);
        // Continuer même si la suppression échoue
      }
    } else {
      console.warn(`⚠️ Fichier déjà supprimé ou introuvable: ${contract.fileUrl}`);
    }

    // Supprimer le contrat du client
    client.contracts = client.contracts.filter((c: any) => c._id.toString() !== contractId);
    await client.save();

    return NextResponse.json({
      success: true,
      message: 'Contrat supprimé avec succès',
    });

  } catch (error: any) {
    console.error('Erreur suppression contrat:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression du contrat' },
      { status: 500 }
    );
  }
}
