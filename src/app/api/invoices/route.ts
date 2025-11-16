import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import dbConnect from '@/lib/db/mongodb';
import Invoice from '@/models/Invoice';
import Client from '@/models/Client';
import InvoiceTemplate from '@/models/InvoiceTemplate';
import { invoiceSchema } from '@/lib/validations';
import { getNextInvoiceNumber } from '@/lib/services/invoice-numbering';
import { checkInvoiceLimit, incrementInvoiceUsage } from '@/lib/subscription/checkAccess';
import { DEFAULT_TEMPLATE } from '@/lib/invoice-templates';
import { z } from 'zod';

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }
  try {
    // Vérifier la limite d'invoices
    const { allowed, current, limit, plan } = await checkInvoiceLimit();
    
    if (!allowed) {
      return NextResponse.json(
        {
          error: 'Limite de factures atteinte',
          message: `Vous avez atteint votre limite de ${limit} factures ce mois-ci. Passez à Pro pour continuer.`,
          current,
          limit,
          plan,
          upgradeUrl: '/dashboard/pricing'
        },
        { 
          status: 403,
          headers: {
            'X-Limit-Reached': 'invoices',
            'X-Upgrade-Plan': 'pro'
          }
        }
      );
    }

    const body = await request.json();
    const validatedData = invoiceSchema.parse(body);
    await dbConnect();
    
    const client = await Client.findOne({ _id: validatedData.clientId, userId: session.user.id });
    if (!client) {
      return NextResponse.json({ error: 'Client non trouvé ou non autorisé' }, { status: 404 });
    }

    const { invoiceNumber } = await getNextInvoiceNumber(session.user.id, { 
      clientName: client.name 
    });

    // Calcul automatique de balanceDue
    const amountPaid = typeof validatedData.amountPaid === 'number' ? validatedData.amountPaid : 0;
    const total = validatedData.total || 0;
    const balanceDue = Math.max(0, total - amountPaid);

    // Validation métier
    if (amountPaid > total) {
      return NextResponse.json({
        error: 'Le montant payé ne peut pas dépasser le total'
      }, { status: 400 });
    }

    // Récupérer le template par défaut ou utiliser le template moderne
    // Le template est capturé au moment de la création pour garantir la cohérence
    const userTemplate = await InvoiceTemplate.findOne({
      userId: session.user.id,
      isDefault: true
    });

    const selectedTemplate = userTemplate || DEFAULT_TEMPLATE;

    // Créer un snapshot du template pour immuabilité (conformité légale)
    const templateSnapshot = {
      name: selectedTemplate.name,
      description: selectedTemplate.description,
      templateComponent: selectedTemplate.templateComponent || 'ModerneTemplate',
      colors: selectedTemplate.colors,
      fonts: selectedTemplate.fonts,
      layout: selectedTemplate.layout,
      sections: selectedTemplate.sections,
      customText: selectedTemplate.customText,
    };

    const invoice = await Invoice.create({
      ...validatedData,
      userId: session.user.id,
      invoiceNumber,
      status: 'draft',
      amountPaid,
      balanceDue,
      // Capturer le template utilisé pour cette facture
      templateId: userTemplate?._id || null,
      templateSnapshot,
    });

    // Incrémenter l'usage après création réussie
    await incrementInvoiceUsage();

    return NextResponse.json(invoice, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        error: 'Données invalides',
        errors: error.issues.map((issue: any) => issue.message),
        details: error.issues
      }, { status: 400 });
    }
    console.error('Erreur création facture:', error);
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
    
    // Support du filtre par clientId
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('clientId');
    
    const filter: any = { userId: session.user.id };
    if (clientId) {
      filter.clientId = clientId;
    }
    
    const invoices = await Invoice.find(filter).sort({ createdAt: -1 });
    return NextResponse.json(invoices, { status: 200 });
  } catch (error) {
    console.error('Erreur lors de la récupération des factures:', error);
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}
