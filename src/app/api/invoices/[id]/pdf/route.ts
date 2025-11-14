import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import dbConnect from '@/lib/db/mongodb';
import Invoice from '@/models/Invoice';
import Client from '@/models/Client';
import User from '@/models/User';
import InvoiceTemplate from '@/models/InvoiceTemplate';
import { generateInvoicePdf } from '@/lib/services/pdf-generator';
import { DEFAULT_TEMPLATE } from '@/lib/invoice-templates';
import { isProfileComplete, getMissingProfileFields } from '@/lib/utils/profile';
import { validateTemplate } from '@/lib/invoice-templates';

export async function GET(request: NextRequest, context: any) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  // Correction Next.js App Router : params doit être await si async
  const params = context?.params ? (typeof context.params.then === 'function' ? await context.params : context.params) : {};
  const { id } = params;

  await dbConnect();

  const invoice = await Invoice.findOne({ _id: id, userId: session.user.id });
  if (!invoice) {
    return NextResponse.json({ error: 'Facture non trouvée' }, { status: 404 });
  }

  const client = await Client.findById(invoice.clientId);
  const user = await User.findById(invoice.userId);

  // Vérifier que le profil est complet
  if (!isProfileComplete(user)) {
    const missingFields = getMissingProfileFields(user);
    return NextResponse.json({
      error: 'Profil incomplet',
      message: `Veuillez compléter votre profil pour générer un PDF. Champs manquants : ${missingFields.join(', ')}`,
      missingFields
    }, { status: 400 });
  }

  // Récupérer le template par défaut de l'utilisateur ou utiliser le template moderne
  const userTemplate = await InvoiceTemplate.findOne({
    userId: invoice.userId,
    isDefault: true
  });

  const rawTemplate = userTemplate || DEFAULT_TEMPLATE;
  
  // Valider le template avant utilisation (fallback si invalide)
  const template = validateTemplate(rawTemplate, DEFAULT_TEMPLATE);

  // Générer le PDF avec @react-pdf/renderer (remplace Puppeteer)
  const pdfBuffer = await generateInvoicePdf({
    invoice,
    client,
    user,
    template: template as any,
  });

  // Convertir Buffer en Uint8Array pour NextResponse
  const uint8Array = Uint8Array.from(pdfBuffer);

  return new NextResponse(uint8Array, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="facture-${invoice.invoiceNumber}.pdf"`,
    },
  });
}
