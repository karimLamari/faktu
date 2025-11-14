/**
 * API Routes pour Quote Templates par ID
 * PATCH /api/quote-templates/:id - Mettre à jour un template
 * DELETE /api/quote-templates/:id - Supprimer un template
 * GET /api/quote-templates/:id - Récupérer un template spécifique
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth/auth';
import dbConnect from '@/lib/db/mongodb';
import QuoteTemplate from '@/models/QuoteTemplate';

// Validation schema pour mise à jour
const updateQuoteTemplateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().optional(),
  colors: z.object({}).optional(),
  fonts: z.object({}).optional(),
  layout: z.object({}).optional(),
  sections: z.object({}).optional(),
  customText: z.object({}).optional(),
  isDefault: z.boolean().optional(),
});

/**
 * GET /api/quote-templates/:id
 * Récupérer un template spécifique
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const { id } = await params;
    await dbConnect();

    const template = await QuoteTemplate.findOne({
      _id: id,
      userId: session.user.id,
    });

    if (!template) {
      return NextResponse.json(
        { error: 'Template non trouvé' },
        { status: 404 }
      );
    }

    return NextResponse.json({ template }, { status: 200 });
  } catch (error: any) {
    console.error('Erreur lors de la récupération du template:', error);
    return NextResponse.json(
      { error: 'Erreur interne', message: error.message },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/quote-templates/:id
 * Mettre à jour un template
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const { id } = await params;
    await dbConnect();

    // Vérifier que le template appartient à l'utilisateur
    const template = await QuoteTemplate.findOne({
      _id: id,
      userId: session.user.id,
    });

    if (!template) {
      return NextResponse.json(
        { error: 'Template non trouvé' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const validation = updateQuoteTemplateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Données invalides', details: validation.error.issues },
        { status: 400 }
      );
    }

    const { isDefault, ...updateData } = validation.data;

    // Si isDefault = true, désactiver les autres templates
    if (isDefault === true) {
      await QuoteTemplate.updateMany(
        { userId: session.user.id, _id: { $ne: id } },
        { isDefault: false }
      );
    }

    const updatedTemplate = await QuoteTemplate.findByIdAndUpdate(
      id,
      { ...updateData, ...(isDefault !== undefined && { isDefault }) },
      { new: true, runValidators: true }
    );

    return NextResponse.json(
      { template: updatedTemplate, message: 'Template mis à jour avec succès' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Erreur lors de la mise à jour du template:', error);
    return NextResponse.json(
      { error: 'Erreur interne', message: error.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/quote-templates/:id
 * Supprimer un template
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const { id } = await params;
    await dbConnect();

    // Vérifier que le template appartient à l'utilisateur
    const template = await QuoteTemplate.findOne({
      _id: id,
      userId: session.user.id,
    });

    if (!template) {
      return NextResponse.json(
        { error: 'Template non trouvé' },
        { status: 404 }
      );
    }

    // Ne pas permettre de supprimer le template par défaut (pour éviter les erreurs)
    if (template.isDefault) {
      return NextResponse.json(
        {
          error: 'Impossible de supprimer',
          message: 'Définissez un autre template par défaut avant de supprimer celui-ci.',
        },
        { status: 400 }
      );
    }

    await QuoteTemplate.findByIdAndDelete(id);

    return NextResponse.json(
      { message: 'Template supprimé avec succès' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Erreur lors de la suppression du template:', error);
    return NextResponse.json(
      { error: 'Erreur interne', message: error.message },
      { status: 500 }
    );
  }
}
