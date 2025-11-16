import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import dbConnect from '@/lib/db/mongodb';
import InvoiceTemplate from '@/models/InvoiceTemplate';
import User from '@/models/User';
import { PLANS } from '@/lib/subscription/plans';
import { z } from 'zod';

/**
 * Schema Zod pour validation du template
 */
const templateSchema = z.object({
  name: z.string().min(1, 'Nom requis').max(100, 'Nom trop long'),
  description: z.string().max(500, 'Description trop longue').optional(),
  templateComponent: z.enum(['ModerneTemplate', 'ClassiqueTemplate', 'MinimalisteTemplate', 'StudioTemplate', 'CreatifTemplate']),
  isDefault: z.boolean().optional(),
  colors: z.object({
    primary: z.string().regex(/^#[0-9A-F]{6}$/i, 'Couleur invalide'),
    secondary: z.string().regex(/^#[0-9A-F]{6}$/i, 'Couleur invalide'),
    accent: z.string().regex(/^#[0-9A-F]{6}$/i, 'Couleur invalide'),
    text: z.string().regex(/^#[0-9A-F]{6}$/i, 'Couleur invalide'),
    background: z.string().regex(/^#[0-9A-F]{6}$/i, 'Couleur invalide'),
  }),
  fonts: z.object({
    heading: z.string().min(1, 'Police heading requise'),
    body: z.string().min(1, 'Police body requise'),
    size: z.object({
      base: z.number().min(8).max(16),
      heading: z.number().min(16).max(36),
      small: z.number().min(6).max(12),
    }),
  }),
  layout: z.object({
    logoPosition: z.enum(['left', 'center', 'right']),
    logoSize: z.enum(['small', 'medium', 'large']),
    headerStyle: z.enum(['modern', 'classic', 'minimal']),
    borderRadius: z.number().min(0).max(20),
    spacing: z.enum(['compact', 'normal', 'relaxed']),
  }),
  sections: z.object({
    showLogo: z.boolean(),
    showBankDetails: z.boolean(),
    showPaymentTerms: z.boolean(),
    showLegalMentions: z.boolean(),
    showItemDetails: z.boolean(),
    showCompanyDetails: z.boolean(),
    showClientDetails: z.boolean(),
  }),
  customText: z.object({
    invoiceTitle: z.string().min(1, 'Titre requis'),
    paymentTermsLabel: z.string().min(1, 'Label modalités requis'),
    bankDetailsLabel: z.string().min(1, 'Label coordonnées requis'),
    legalMentions: z.string(),
    footerText: z.string().optional(),
  }),
});

/**
 * GET /api/invoice-templates
 * Récupère tous les templates de l'utilisateur
 */
export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  try {
    await dbConnect();
    
    const templates = await InvoiceTemplate.find({ 
      userId: session.user.id 
    }).sort({ isDefault: -1, createdAt: -1 });
    
    return NextResponse.json(templates, { status: 200 });
  } catch (error) {
    console.error('Erreur récupération templates:', error);
    return NextResponse.json({ 
      error: 'Erreur interne du serveur' 
    }, { status: 500 });
  }
}

/**
 * POST /api/invoice-templates
 * Crée un nouveau template
 */
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  try {
    await dbConnect();

    // Vérifier les limites de templates
    const user = await User.findById(session.user.id);
    const plan = user?.subscription?.plan || 'free';
    const planConfig = PLANS[plan];
    const templateLimit = planConfig.templates;

    // Compter les templates existants
    const existingTemplatesCount = await InvoiceTemplate.countDocuments({ 
      userId: session.user.id 
    });

    if (templateLimit !== 'unlimited' && existingTemplatesCount >= templateLimit) {
      return NextResponse.json({ 
        error: 'Limite de modèles atteinte',
        limitReached: true,
        current: existingTemplatesCount,
        limit: templateLimit,
        plan
      }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = templateSchema.parse(body);
    
    const template = await InvoiceTemplate.create({
      ...validatedData,
      userId: session.user.id,
    });
    
    return NextResponse.json(template, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        error: 'Données invalides',
        errors: error.issues.map((issue: any) => issue.message),
        details: error.issues
      }, { status: 400 });
    }
    console.error('Erreur création template:', error);
    return NextResponse.json({ 
      error: 'Erreur interne du serveur' 
    }, { status: 500 });
  }
}

/**
 * DELETE /api/invoice-templates
 * Supprime un template
 */
export async function DELETE(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const templateId = searchParams.get('id');

    if (!templateId) {
      return NextResponse.json({ error: 'ID du modèle manquant' }, { status: 400 });
    }

    // Vérifier que le template appartient à l'utilisateur
    const template = await InvoiceTemplate.findOne({
      _id: templateId,
      userId: session.user.id
    });

    if (!template) {
      return NextResponse.json({ error: 'Modèle non trouvé' }, { status: 404 });
    }

    await InvoiceTemplate.deleteOne({ _id: templateId });
    
    return NextResponse.json({ success: true, message: 'Modèle supprimé' });
  } catch (error) {
    console.error('Erreur suppression template:', error);
    return NextResponse.json({ 
      error: 'Erreur lors de la suppression' 
    }, { status: 500 });
  }
}
