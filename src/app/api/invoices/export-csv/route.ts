import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import dbConnect from '@/lib/db/mongodb';
import Invoice from '@/models/Invoice';
import Client from '@/models/Client';
import User from '@/models/User';
import { PLANS } from '@/lib/subscription/plans';
import {
  generateAccountingCSV,
  generateSimpleCSV,
  generateDetailedCSV,
} from '@/lib/services/csv-export';

export async function GET(req: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    // Connect to database
    await dbConnect();

    // Check user subscription plan
    const user: any = await User.findById(session.user.id).lean();
    if (!user) {
      return NextResponse.json(
        { error: 'Utilisateur introuvable' },
        { status: 404 }
      );
    }

    const userPlan = user.subscription?.plan || 'free';
    const planFeatures = PLANS[userPlan];

    // Check if CSV export is allowed for this plan
    if (!planFeatures.csvExport) {
      return NextResponse.json(
        {
          error: 'Fonctionnalité réservée aux abonnés PRO et BUSINESS',
          message: 'L\'export CSV comptable est disponible uniquement pour les plans Pro et Business.',
          featureBlocked: true, // Fonctionnalité PRO bloquée, pas une limite de quantité
          plan: userPlan,
          requiredPlan: 'pro',
          upgradeUrl: '/dashboard/pricing'
        },
        {
          status: 403,
          headers: {
            'X-Feature-Required': 'csvExport',
            'X-Upgrade-Plan': 'pro'
          }
        }
      );
    }

    // Get query parameters
    const { searchParams } = new URL(req.url);
    const format = searchParams.get('format') || 'simple'; // simple | accounting | detailed
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const status = searchParams.get('status');

    // Build query filter
    const filter: any = { userId: session.user.id };

    // Filter by date range
    if (startDate || endDate) {
      filter.issueDate = {};
      if (startDate) filter.issueDate.$gte = new Date(startDate);
      if (endDate) filter.issueDate.$lte = new Date(endDate);
    }

    // Filter by status
    if (status && status !== 'all') {
      filter.status = status;
    }

    // Fetch invoices
    const invoices = await Invoice.find(filter)
      .sort({ issueDate: -1 })
      .lean();

    if (invoices.length === 0) {
      return NextResponse.json(
        { error: 'Aucune facture à exporter' },
        { status: 404 }
      );
    }

    // Fetch all clients for these invoices
    const clientIds = [...new Set(invoices.map(inv => inv.clientId.toString()))];
    const clients = await Client.find({
      _id: { $in: clientIds },
      userId: session.user.id,
    }).lean();

    // Generate CSV based on format
    let csvContent: string;
    let filename: string;

    switch (format) {
      case 'accounting':
        csvContent = generateAccountingCSV(invoices as any, clients as any);
        filename = `export-comptable-${formatDateFilename(new Date())}.csv`;
        break;

      case 'detailed':
        csvContent = generateDetailedCSV(invoices as any, clients as any);
        filename = `export-detaille-${formatDateFilename(new Date())}.csv`;
        break;

      case 'simple':
      default:
        csvContent = generateSimpleCSV(invoices as any, clients as any);
        filename = `export-factures-${formatDateFilename(new Date())}.csv`;
        break;
    }

    // Add BOM for Excel compatibility (UTF-8)
    const bom = '\uFEFF';
    const csvWithBOM = bom + csvContent;

    // Return CSV file
    return new NextResponse(csvWithBOM, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-cache',
      },
    });

  } catch (error: any) {
    console.error('Error generating CSV export:', error);

    return NextResponse.json(
      { error: 'Erreur lors de la génération du CSV', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * Helper: Format date for filename (YYYYMMDD)
 */
function formatDateFilename(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;
}
