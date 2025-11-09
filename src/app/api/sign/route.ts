import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import Quote from '@/models/Quote';

export async function POST(req: NextRequest) {
  try {
    const { token, signatureData, signerName, signerEmail } = await req.json();

    if (!token || !signatureData || !signerName) {
      return NextResponse.json(
        { error: 'Données manquantes' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Trouver le devis avec le token
    const quote: any = await Quote.findOne({
      signatureToken: token,
      signatureTokenExpiry: { $gt: new Date() }, // Token non expiré
    }).select('+signatureToken');

    if (!quote) {
      return NextResponse.json(
        { error: 'Lien de signature invalide ou expiré' },
        { status: 404 }
      );
    }

    // Vérifier que le devis n'est pas déjà signé
    if (quote.signedAt) {
      return NextResponse.json(
        { error: 'Ce devis a déjà été signé' },
        { status: 400 }
      );
    }

    // Récupérer l'IP du signataire
    const forwardedFor = req.headers.get('x-forwarded-for');
    const signerIp = forwardedFor ? forwardedFor.split(',')[0] : req.headers.get('x-real-ip') || 'unknown';

    // Enregistrer la signature
    quote.signatureData = signatureData;
    quote.signerName = signerName;
    quote.signerEmail = signerEmail || '';
    quote.signerIp = signerIp;
    quote.signedAt = new Date();
    quote.status = 'accepted';
    
    // Invalider le token
    quote.signatureToken = undefined;
    quote.signatureTokenExpiry = undefined;

    await quote.save();

    console.log(`✅ Devis ${quote.quoteNumber} signé par ${signerName}`);

    // TODO: Envoyer notification email à l'utilisateur

    return NextResponse.json({
      success: true,
      message: 'Devis signé avec succès',
      quote: {
        quoteNumber: quote.quoteNumber,
        signedAt: quote.signedAt,
      },
    });

  } catch (error: any) {
    console.error('Erreur signature devis:', error);
    return NextResponse.json(
      { error: 'Erreur serveur', details: error.message },
      { status: 500 }
    );
  }
}

// GET pour vérifier un token et récupérer les infos du devis
export async function GET(req: NextRequest) {
  try {
    const token = req.nextUrl.searchParams.get('token');

    if (!token) {
      return NextResponse.json({ error: 'Token manquant' }, { status: 400 });
    }

    await dbConnect();

    const quote: any = await Quote.findOne({
      signatureToken: token,
      signatureTokenExpiry: { $gt: new Date() },
    })
      .select('+signatureToken')
      .populate('clientId', 'name email')
      .populate('userId', 'firstName lastName companyName');

    if (!quote) {
      return NextResponse.json(
        { error: 'Lien de signature invalide ou expiré' },
        { status: 404 }
      );
    }

    // Ne pas exposer le token dans la réponse
    const quoteData = quote.toObject();
    delete quoteData.signatureToken;

    return NextResponse.json({
      quote: {
        _id: quoteData._id,
        quoteNumber: quoteData.quoteNumber,
        total: quoteData.total,
        issueDate: quoteData.issueDate,
        validUntil: quoteData.validUntil,
        items: quoteData.items,
        client: quoteData.clientId,
        company: {
          name: quoteData.userId.companyName || `${quoteData.userId.firstName} ${quoteData.userId.lastName}`,
          firstName: quoteData.userId.firstName,
          lastName: quoteData.userId.lastName,
        },
        signedAt: quoteData.signedAt,
      },
    });

  } catch (error: any) {
    console.error('Erreur récupération devis:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
