/**
 * Zod validation schemas pour les templates de factures
 * Utilisé pour valider les templates avant génération PDF
 */

import { z } from 'zod';

// Validation Hex color
const HexColorSchema = z
  .string()
  .regex(/^#[0-9A-F]{6}$/i, 'Couleur hexadécimale invalide');

/**
 * Schema pour les couleurs du template
 */
export const TemplateColorsSchema = z.object({
  primary: HexColorSchema,
  secondary: HexColorSchema,
  accent: HexColorSchema,
  text: HexColorSchema,
  background: HexColorSchema,
});

/**
 * Schema pour la typographie
 */
export const TemplateFontsSchema = z.object({
  heading: z.string().min(1).max(100),
  body: z.string().min(1).max(100),
  size: z.object({
    base: z.number().min(6).max(16),
    heading: z.number().min(12).max(32),
    small: z.number().min(4).max(12),
  }),
});

/**
 * Schema pour le layout
 */
export const TemplateLayoutSchema = z.object({
  logoPosition: z.enum(['left', 'center', 'right']),
  logoSize: z.enum(['small', 'medium', 'large']),
  headerStyle: z.enum(['modern', 'classic', 'minimal']),
  borderRadius: z.number().min(0).max(20),
  spacing: z.enum(['compact', 'normal', 'relaxed']),
});

/**
 * Schema pour les sections
 */
export const TemplateSectionsSchema = z.object({
  showLogo: z.boolean(),
  showBankDetails: z.boolean(),
  showPaymentTerms: z.boolean(),
  showLegalMentions: z.boolean(),
  showItemDetails: z.boolean(),
  showCompanyDetails: z.boolean(),
  showClientDetails: z.boolean(),
});

/**
 * Schema pour les textes personnalisés
 */
export const TemplateCustomTextSchema = z.object({
  invoiceTitle: z.string().min(1).max(100),
  paymentTermsLabel: z.string().min(1).max(100),
  bankDetailsLabel: z.string().min(1).max(100),
  legalMentions: z.string().min(0).max(2000),
  legalMentionsType: z.string().optional(),
  footerText: z.string().optional(),
});

/**
 * Schema complet pour un template (avec champs optionnels comme en DB)
 */
export const TemplatePresetSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  colors: TemplateColorsSchema,
  fonts: TemplateFontsSchema,
  layout: TemplateLayoutSchema,
  sections: TemplateSectionsSchema,
  customText: TemplateCustomTextSchema,
});

/**
 * Type TypeScript extrait du schema Zod
 */
export type ValidatedTemplate = z.infer<typeof TemplatePresetSchema>;

/**
 * Fonction helper pour valider et fallback
 */
export function validateTemplate(template: unknown, fallback: any): ValidatedTemplate {
  try {
    return TemplatePresetSchema.parse(template);
  } catch (error) {
    console.error('❌ Template validation failed:', error);
    console.warn('⚠️ Using fallback template');
    return TemplatePresetSchema.parse(fallback);
  }
}
