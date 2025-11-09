import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { generateQuotePdf } from '@/lib/services/pdf-generator';
import dbConnect from '@/lib/db/mongodb';
import Quote from '@/models/Quote';
import Client from '@/models/Client';
import User from '@/models/User';
import { isProfileComplete, getMissingProfileFields } from '@/lib/utils/profile';

export async function GET(request: NextRequest, context: any) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const params = context?.params ? (typeof context.params.then === 'function' ? await context.params : context.params) : {};
  const { id } = params;

  await dbConnect();

  const quote = await Quote.findOne({ _id: id, userId: session.user.id });
  if (!quote) {
    return NextResponse.json({ error: 'Devis non trouvé' }, { status: 404 });
  }

  const client = await Client.findById(quote.clientId);
  const user = await User.findById(quote.userId);

  // Vérifier que le profil est complet
  if (!isProfileComplete(user)) {
    const missingFields = getMissingProfileFields(user);
    return NextResponse.json({
      error: 'Profil incomplet',
      message: `Veuillez compléter votre profil pour générer un PDF. Champs manquants : ${missingFields.join(', ')}`,
      missingFields
    }, { status: 400 });
  }

  // Générer le PDF avec @react-pdf/renderer (remplace Puppeteer)
  const pdfBuffer = await generateQuotePdf({
    quote,
    client,
    user
  });

  // Convertir Buffer en Uint8Array pour NextResponse
  const uint8Array = Uint8Array.from(pdfBuffer);

  return new NextResponse(uint8Array, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="devis-${quote.quoteNumber}.pdf"`,
    },
  });
}
