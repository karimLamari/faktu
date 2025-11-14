/**
 * ⚠️ IMPORTANT : Model pour les templates de devis personnalisés
 * 
 * Ce modèle existe et l'API /api/quote-templates est fonctionnelle,
 * MAIS les templates de devis ne sont PAS encore appliqués lors de la génération PDF.
 * 
 * Le fichier quote-pdf-react.tsx génère actuellement des PDF avec un thème vert hardcodé,
 * sans utiliser les templates personnalisés stockés en base.
 * 
 * TODO: Implémenter le système de templates dans QuotePDF (comme InvoicePDF)
 * - Modifier quote-pdf-react.tsx pour accepter une prop template
 * - Créer 4 templates de devis (modern, classic, minimal, creative)
 * - Router vers le bon template selon template.name
 * 
 * Structure identique à InvoiceTemplate mais pour les devis
 */

import mongoose, { Schema, Document } from 'mongoose';

/**
 * Interface pour les couleurs du template de devis
 */
export interface IQuoteTemplateColors {
  primary: string;
  secondary: string;
  accent: string;
  text: string;
  background: string;
}

/**
 * Interface pour la typographie des devis
 */
export interface IQuoteTemplateFonts {
  heading: string;
  body: string;
  size: {
    base: number;
    heading: number;
    small: number;
  };
}

/**
 * Interface pour le layout des devis
 */
export interface IQuoteTemplateLayout {
  logoPosition: 'left' | 'center' | 'right';
  logoSize: 'small' | 'medium' | 'large';
  headerStyle: 'modern' | 'classic' | 'minimal';
  borderRadius: number;
  spacing: 'compact' | 'normal' | 'relaxed';
}

/**
 * Interface pour les sections visibles des devis
 */
export interface IQuoteTemplateSections {
  showLogo: boolean;
  showBankDetails: boolean;
  showPaymentTerms: boolean;
  showCompanyDetails: boolean;
  showClientDetails: boolean;
}

/**
 * Interface pour les textes personnalisés des devis
 */
export interface IQuoteTemplateCustomText {
  quoteTitle: string;
  validUntilLabel: string;
  bankDetailsLabel: string;
  paymentTermsLabel: string;
  footerText?: string;
}

/**
 * Interface principale du template de devis
 */
export interface IQuoteTemplate extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  isDefault: boolean;
  colors: IQuoteTemplateColors;
  fonts: IQuoteTemplateFonts;
  layout: IQuoteTemplateLayout;
  sections: IQuoteTemplateSections;
  customText: IQuoteTemplateCustomText;
  createdAt: Date;
  updatedAt: Date;
}

// Schema pour les couleurs
const QuoteTemplateColorsSchema = new Schema<IQuoteTemplateColors>(
  {
    primary: { type: String, default: '#10b981', match: /^#[0-9A-F]{6}$/i },
    secondary: { type: String, default: '#64748b', match: /^#[0-9A-F]{6}$/i },
    accent: { type: String, default: '#059669', match: /^#[0-9A-F]{6}$/i },
    text: { type: String, default: '#1e293b', match: /^#[0-9A-F]{6}$/i },
    background: { type: String, default: '#ffffff', match: /^#[0-9A-F]{6}$/i },
  },
  { _id: false }
);

// Schema pour la typographie
const QuoteTemplateFontsSchema = new Schema<IQuoteTemplateFonts>(
  {
    heading: { type: String, default: 'Inter, sans-serif' },
    body: { type: String, default: 'Inter, sans-serif' },
    size: {
      base: { type: Number, default: 10, min: 6, max: 16 },
      heading: { type: Number, default: 18, min: 12, max: 32 },
      small: { type: Number, default: 8, min: 4, max: 12 },
    },
  },
  { _id: false }
);

// Schema pour le layout
const QuoteTemplateLayoutSchema = new Schema<IQuoteTemplateLayout>(
  {
    logoPosition: {
      type: String,
      enum: ['left', 'center', 'right'],
      default: 'left',
    },
    logoSize: {
      type: String,
      enum: ['small', 'medium', 'large'],
      default: 'medium',
    },
    headerStyle: {
      type: String,
      enum: ['modern', 'classic', 'minimal'],
      default: 'modern',
    },
    borderRadius: { type: Number, default: 4, min: 0, max: 20 },
    spacing: {
      type: String,
      enum: ['compact', 'normal', 'relaxed'],
      default: 'normal',
    },
  },
  { _id: false }
);

// Schema pour les sections
const QuoteTemplateSectionsSchema = new Schema<IQuoteTemplateSections>(
  {
    showLogo: { type: Boolean, default: true },
    showBankDetails: { type: Boolean, default: true },
    showPaymentTerms: { type: Boolean, default: true },
    showCompanyDetails: { type: Boolean, default: true },
    showClientDetails: { type: Boolean, default: true },
  },
  { _id: false }
);

// Schema pour les textes personnalisés
const QuoteTemplateCustomTextSchema = new Schema<IQuoteTemplateCustomText>(
  {
    quoteTitle: { type: String, default: 'DEVIS' },
    validUntilLabel: { type: String, default: 'Valable jusqu\'au' },
    bankDetailsLabel: { type: String, default: 'Coordonnées Bancaires' },
    paymentTermsLabel: { type: String, default: 'Modalités de paiement' },
    footerText: { type: String },
  },
  { _id: false }
);

// Schema principal
const QuoteTemplateSchema = new Schema<IQuoteTemplate>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true, maxlength: 100 },
    description: { type: String, maxlength: 500 },
    isDefault: { type: Boolean, default: false },
    colors: { type: QuoteTemplateColorsSchema, default: {} },
    fonts: { type: QuoteTemplateFontsSchema, default: {} },
    layout: { type: QuoteTemplateLayoutSchema, default: {} },
    sections: { type: QuoteTemplateSectionsSchema, default: {} },
    customText: { type: QuoteTemplateCustomTextSchema, default: {} },
  },
  { timestamps: true }
);

// Index pour les requêtes fréquentes
QuoteTemplateSchema.index({ userId: 1, isDefault: 1 });
QuoteTemplateSchema.index({ userId: 1, name: 1 });

export default mongoose.models.QuoteTemplate ||
  mongoose.model<IQuoteTemplate>('QuoteTemplate', QuoteTemplateSchema);
