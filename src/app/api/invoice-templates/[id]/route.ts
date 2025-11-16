import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import dbConnect from '@/lib/db/mongodb';
import InvoiceTemplate from '@/models/InvoiceTemplate';
import { z } from 'zod';
import mongoose from 'mongoose';

/**
 * Schema Zod pour validation partielle (PATCH)
 */
const templatePartialSchema = z.object({
  name: z.string().min(1, 'Nom requis').max(100, 'Nom trop long').optional(),
  description: z.string().max(500, 'Description trop longue').optional(),
  templateComponent: z.enum(['ModerneTemplate', 'ClassiqueTemplate', 'MinimalisteTemplate', 'StudioTemplate', 'CreatifTemplate']).optional(),
  isDefault: z.boolean().optional(),
  colors: z.object({
    primary: z.string().regex(/^#[0-9A-F]{6}$/i, 'Couleur invalide'),
    secondary: z.string().regex(/^#[0-9A-F]{6}$/i, 'Couleur invalide'),
    accent: z.string().regex(/^#[0-9A-F]{6}$/i, 'Couleur invalide'),
    text: z.string().regex(/^#[0-9A-F]{6}$/i, 'Couleur invalide'),
    background: z.string().regex(/^#[0-9A-F]{6}$/i, 'Couleur invalide'),
  }).optional(),
  fonts: z.object({
    heading: z.string().min(1, 'Police heading requise'),
    body: z.string().min(1, 'Police body requise'),
    size: z.object({
      base: z.number().min(8).max(16),
      heading: z.number().min(16).max(36),
      small: z.number().min(6).max(12),
    }),
  }).optional(),
  layout: z.object({
    logoPosition: z.enum(['left', 'center', 'right']),
    logoSize: z.enum(['small', 'medium', 'large']),
    headerStyle: z.enum(['modern', 'classic', 'minimal']),
    borderRadius: z.number().min(0).max(20),
    spacing: z.enum(['compact', 'normal', 'relaxed']),
  }).optional(),
  sections: z.object({
    showLogo: z.boolean(),
    showBankDetails: z.boolean(),
    showPaymentTerms: z.boolean(),
    showLegalMentions: z.boolean(),
    showItemDetails: z.boolean(),
    showCompanyDetails: z.boolean(),
    showClientDetails: z.boolean(),
  }).optional(),
  customText: z.object({
    invoiceTitle: z.string().min(1, 'Titre requis'),
    paymentTermsLabel: z.string().min(1, 'Label modalités requis'),
    bankDetailsLabel: z.string().min(1, 'Label coordonnées requis'),
    legalMentions: z.string(),
    footerText: z.string().optional(),
  }).optional(),
}).partial();

/**
 * GET /api/invoice-templates/[id]
 * Récupère un template spécifique
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { id } = await params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ 
        error: 'ID de template invalide' 
      }, { status: 400 });
    }

    await dbConnect();
    
    const template = await InvoiceTemplate.findOne({ 
      _id: id, 
      userId: session.user.id 
    });
    
    if (!template) {
      return NextResponse.json({ 
        error: 'Template non trouvé' 
      }, { status: 404 });
    }
    
    return NextResponse.json(template, { status: 200 });
  } catch (error) {
    console.error('Erreur récupération template:', error);
    return NextResponse.json({ 
      error: 'Erreur interne du serveur' 
    }, { status: 500 });
  }
}

/**
 * PATCH /api/invoice-templates/[id]
 * Met à jour un template
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { id } = await params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ 
        error: 'ID de template invalide' 
      }, { status: 400 });
    }

    const body = await request.json();
    const validatedData = templatePartialSchema.parse(body);
    
    await dbConnect();
    
    // Si on définit ce template comme défaut, désactiver les autres
    if (validatedData.isDefault) {
      await InvoiceTemplate.updateMany(
        { 
          userId: session.user.id, 
          _id: { $ne: id },
          isDefault: true 
        },
        { $set: { isDefault: false } }
      );
    }
    
    const updatedTemplate = await InvoiceTemplate.findOneAndUpdate(
      { _id: id, userId: session.user.id },
      { $set: validatedData },
      { new: true, runValidators: true }
    );
    
    if (!updatedTemplate) {
      return NextResponse.json({ 
        error: 'Template non trouvé ou non autorisé à modifier' 
      }, { status: 404 });
    }
    
    return NextResponse.json(updatedTemplate, { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        error: 'Données invalides',
        errors: error.issues.map((issue: any) => issue.message),
        details: error.issues
      }, { status: 400 });
    }
    console.error('Erreur update template:', error);
    return NextResponse.json({ 
      error: 'Erreur interne du serveur' 
    }, { status: 500 });
  }
}

/**
 * DELETE /api/invoice-templates/[id]
 * Supprime un template
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { id } = await params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ 
        error: 'ID de template invalide' 
      }, { status: 400 });
    }

    await dbConnect();
    
    const deletedTemplate = await InvoiceTemplate.findOneAndDelete({ 
      _id: id, 
      userId: session.user.id 
    });
    
    if (!deletedTemplate) {
      return NextResponse.json({ 
        error: 'Template non trouvé ou non autorisé à supprimer' 
      }, { status: 404 });
    }
    
    // Si on supprime le template par défaut, définir un autre comme défaut
    if (deletedTemplate.isDefault) {
      const firstTemplate = await InvoiceTemplate.findOne({ 
        userId: session.user.id 
      });
      
      if (firstTemplate) {
        firstTemplate.isDefault = true;
        await firstTemplate.save();
      }
    }
    
    return NextResponse.json({ 
      message: 'Template supprimé avec succès' 
    }, { status: 200 });
  } catch (error) {
    console.error('Erreur suppression template:', error);
    return NextResponse.json({ 
      error: 'Erreur interne du serveur' 
    }, { status: 500 });
  }
}
