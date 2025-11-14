/**
 * API Routes pour Quote Templates
 * GET /api/quote-templates - Récupérer tous les templates
 * POST /api/quote-templates - Créer un nouveau template
 * PATCH /api/quote-templates/:id - Mettre à jour un template
 * DELETE /api/quote-templates/:id - Supprimer un template
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth/auth';
import dbConnect from '@/lib/db/mongodb';
import QuoteTemplate from '@/models/QuoteTemplate';
import { PLANS } from '@/lib/subscription/plans';
import User from '@/models/User';

// Validation schema
const createQuoteTemplateSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  colors: z
    .object({
      primary: z.string().regex(/^#[0-9A-F]{6}$/i),
      secondary: z.string().regex(/^#[0-9A-F]{6}$/i),
      accent: z.string().regex(/^#[0-9A-F]{6}$/i),
      text: z.string().regex(/^#[0-9A-F]{6}$/i),
      background: z.string().regex(/^#[0-9A-F]{6}$/i),
    })
    .optional(),
  fonts: z
    .object({
      heading: z.string().optional(),
      body: z.string().optional(),
      size: z
        .object({
          base: z.number().min(6).max(16).optional(),
          heading: z.number().min(12).max(32).optional(),
          small: z.number().min(4).max(12).optional(),
        })
        .optional(),
    })
    .optional(),
  layout: z
    .object({
      logoPosition: z.enum(['left', 'center', 'right']).optional(),
      logoSize: z.enum(['small', 'medium', 'large']).optional(),
      headerStyle: z.enum(['modern', 'classic', 'minimal']).optional(),
      borderRadius: z.number().min(0).max(20).optional(),
      spacing: z.enum(['compact', 'normal', 'relaxed']).optional(),
    })
    .optional(),
  sections: z
    .object({
      showLogo: z.boolean().optional(),
      showBankDetails: z.boolean().optional(),
      showPaymentTerms: z.boolean().optional(),
      showCompanyDetails: z.boolean().optional(),
      showClientDetails: z.boolean().optional(),
    })
    .optional(),
  customText: z
    .object({
      quoteTitle: z.string().optional(),
      validUntilLabel: z.string().optional(),
      bankDetailsLabel: z.string().optional(),
      paymentTermsLabel: z.string().optional(),
      footerText: z.string().optional(),
    })
    .optional(),
  isDefault: z.boolean().optional(),
});

/**
 * GET /api/quote-templates
 * Récupérer tous les templates de l'utilisateur
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    await dbConnect();

    const templates = await QuoteTemplate.find({ userId: session.user.id }).lean();

    return NextResponse.json({ templates }, { status: 200 });
  } catch (error: any) {
    console.error('Erreur lors de la récupération des templates:', error);
    return NextResponse.json(
      { error: 'Erreur interne', message: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/quote-templates
 * Créer un nouveau template de devis
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    await dbConnect();

    // Vérifier le plan de subscription
    const user = await User.findById(session.user.id);
    const userPlan = user?.subscription?.plan || 'free';
    const planFeatures = PLANS[userPlan];

    // Vérifier si l'utilisateur peut créer des templates personnalisés
    // Free plan: 1 template, Pro+: unlimited
    const maxTemplates = planFeatures.templates === 'unlimited' ? Infinity : (planFeatures.templates || 1);
    
    if (maxTemplates < 2) {
      return NextResponse.json(
        {
          error: 'Fonctionnalité non disponible',
          message: 'Les templates personnalisés sont disponibles uniquement pour les plans Pro et Business.',
          requiredPlan: 'pro',
          upgradeUrl: '/dashboard/pricing',
        },
        { status: 403 }
      );
    }

    // Limiter le nombre de templates
    const existingTemplates = await QuoteTemplate.countDocuments({
      userId: session.user.id,
    });

    if (existingTemplates >= maxTemplates) {
      return NextResponse.json(
        {
          error: 'Limite atteinte',
          message: `Vous pouvez créer un maximum de ${maxTemplates} templates pour votre plan.`,
          maxTemplates,
          upgradeUrl: '/dashboard/pricing',
        },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validation = createQuoteTemplateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Données invalides', details: validation.error.issues },
        { status: 400 }
      );
    }

    const { name, isDefault, ...templateData } = validation.data;

    // Si isDefault = true, désactiver les autres templates
    if (isDefault) {
      await QuoteTemplate.updateMany(
        { userId: session.user.id },
        { isDefault: false }
      );
    }

    const newTemplate = await QuoteTemplate.create({
      userId: session.user.id,
      name,
      isDefault: isDefault || false,
      ...templateData,
    });

    return NextResponse.json(
      { template: newTemplate, message: 'Template créé avec succès' },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Erreur lors de la création du template:', error);
    return NextResponse.json(
      { error: 'Erreur interne', message: error.message },
      { status: 500 }
    );
  }
}
