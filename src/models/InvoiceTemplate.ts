import mongoose, { Schema, Document } from 'mongoose';

/**
 * Interface pour les couleurs du template
 */
export interface ITemplateColors {
  primary: string;
  secondary: string;
  accent: string;
  text: string;
  background: string;
}

/**
 * Interface pour la typographie
 */
export interface ITemplateFonts {
  heading: string;
  body: string;
  size: {
    base: number;
    heading: number;
    small: number;
  };
}

/**
 * Interface pour le layout
 */
export interface ITemplateLayout {
  logoPosition: 'left' | 'center' | 'right';
  logoSize: 'small' | 'medium' | 'large';
  headerStyle: 'modern' | 'classic' | 'minimal';
  borderRadius: number;
  spacing: 'compact' | 'normal' | 'relaxed';
}

/**
 * Interface pour les sections visibles
 */
export interface ITemplateSections {
  showLogo: boolean;
  showBankDetails: boolean;
  showPaymentTerms: boolean;
  showLegalMentions: boolean;
  showItemDetails: boolean;
  showCompanyDetails: boolean;
  showClientDetails: boolean;
}

/**
 * Interface pour les textes personnalisés
 */
export interface ITemplateCustomText {
  invoiceTitle: string;
  paymentTermsLabel: string;
  bankDetailsLabel: string;
  legalMentions: string;
  legalMentionsType?: string; // ID du type de mention légale (micro-entreprise, societe-standard, etc.)
  footerText?: string;
}

/**
 * Interface principale du template de facture
 */
export interface IInvoiceTemplate extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  isDefault: boolean;
  colors: ITemplateColors;
  fonts: ITemplateFonts;
  layout: ITemplateLayout;
  sections: ITemplateSections;
  customText: ITemplateCustomText;
  createdAt: Date;
  updatedAt: Date;
}

// Schema pour les couleurs
const TemplateColorsSchema = new Schema<ITemplateColors>({
  primary: { type: String, required: true, default: '#2c5aa0' },
  secondary: { type: String, required: true, default: '#666666' },
  accent: { type: String, required: true, default: '#059669' },
  text: { type: String, required: true, default: '#333333' },
  background: { type: String, required: true, default: '#ffffff' },
}, { _id: false });

// Schema pour la typographie
const TemplateFontsSchema = new Schema<ITemplateFonts>({
  heading: { type: String, required: true, default: 'Helvetica Neue, Arial, sans-serif' },
  body: { type: String, required: true, default: 'Helvetica Neue, Arial, sans-serif' },
  size: {
    base: { type: Number, required: true, default: 12 },
    heading: { type: Number, required: true, default: 24 },
    small: { type: Number, required: true, default: 10 },
  },
}, { _id: false });

// Schema pour le layout
const TemplateLayoutSchema = new Schema<ITemplateLayout>({
  logoPosition: { 
    type: String, 
    enum: ['left', 'center', 'right'], 
    default: 'left' 
  },
  logoSize: { 
    type: String, 
    enum: ['small', 'medium', 'large'], 
    default: 'medium' 
  },
  headerStyle: { 
    type: String, 
    enum: ['modern', 'classic', 'minimal'], 
    default: 'modern' 
  },
  borderRadius: { type: Number, default: 4, min: 0, max: 20 },
  spacing: { 
    type: String, 
    enum: ['compact', 'normal', 'relaxed'], 
    default: 'normal' 
  },
}, { _id: false });

// Schema pour les sections
const TemplateSectionsSchema = new Schema<ITemplateSections>({
  showLogo: { type: Boolean, default: true },
  showBankDetails: { type: Boolean, default: true },
  showPaymentTerms: { type: Boolean, default: true },
  showLegalMentions: { type: Boolean, default: true },
  showItemDetails: { type: Boolean, default: false },
  showCompanyDetails: { type: Boolean, default: true },
  showClientDetails: { type: Boolean, default: true },
}, { _id: false });

// Schema pour les textes personnalisés
const TemplateCustomTextSchema = new Schema<ITemplateCustomText>({
  invoiceTitle: { type: String, default: 'FACTURE' },
  paymentTermsLabel: { type: String, default: 'Modalités de paiement' },
  bankDetailsLabel: { type: String, default: 'Coordonnées Bancaires' },
  legalMentions: { 
    type: String, 
    default: 'En cas de retard de paiement, seront exigibles, conformément à l\'article L. 441-6 du code de commerce, une indemnité calculée sur la base de trois fois le taux de l\'intérêt légal en vigueur ainsi qu\'une indemnité forfaitaire pour frais de recouvrement de 40 euros.' 
  },
  legalMentionsType: { type: String, default: 'societe-standard' },
  footerText: { type: String },
}, { _id: false });

// Schema principal
const InvoiceTemplateSchema = new Schema<IInvoiceTemplate>({
  userId: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    index: true,
  },
  name: { 
    type: String, 
    required: true, 
    trim: true,
    minlength: 1,
    maxlength: 100,
  },
  description: { 
    type: String, 
    trim: true,
    maxlength: 500,
  },
  isDefault: { 
    type: Boolean, 
    default: false,
    index: true,
  },
  colors: { 
    type: TemplateColorsSchema, 
    required: true,
    default: () => ({}) // Mongoose appliquera les defaults du sous-schema
  },
  fonts: { 
    type: TemplateFontsSchema, 
    required: true,
    default: () => ({})
  },
  layout: { 
    type: TemplateLayoutSchema, 
    required: true,
    default: () => ({})
  },
  sections: { 
    type: TemplateSectionsSchema, 
    required: true,
    default: () => ({})
  },
  customText: { 
    type: TemplateCustomTextSchema, 
    required: true,
    default: () => ({})
  },
}, { 
  timestamps: true 
});

// Index composé pour userId + isDefault (un seul template par défaut par user)
InvoiceTemplateSchema.index({ userId: 1, isDefault: 1 });

// Middleware pre-save : S'assurer qu'il n'y a qu'un seul template par défaut par utilisateur
InvoiceTemplateSchema.pre('save', async function(next) {
  if (this.isDefault) {
    // Utiliser une transaction pour éviter les race conditions
    const session = await mongoose.startSession();
    try {
      await session.withTransaction(async () => {
        // Désactiver tous les autres templates par défaut de cet utilisateur
        await mongoose.model('InvoiceTemplate').updateMany(
          { 
            userId: this.userId, 
            _id: { $ne: this._id },
            isDefault: true 
          },
          { $set: { isDefault: false } },
          { session }
        );
      });
    } finally {
      await session.endSession();
    }
  }
  next();
});

// Vérifier qu'il existe au moins un modèle avant de compiler
const InvoiceTemplate = mongoose.models.InvoiceTemplate || 
  mongoose.model<IInvoiceTemplate>('InvoiceTemplate', InvoiceTemplateSchema);

export default InvoiceTemplate;
