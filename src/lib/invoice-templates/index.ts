/**
 * 📦 Point d'entrée centralisé pour le système de templates d'invoices
 * 
 * Architecture:
 * - config/     → Configurations (presets, mentions légales)
 * - core/       → Logique métier (router, validation, utils)
 * - templates/  → Composants de rendu PDF (usage interne uniquement)
 * - components/ → Composants UI React (Customizer, Preview, Selector)
 * 
 * API Publique:
 * ```typescript
 * import {
 *   InvoicePDF,                    // Composant principal PDF
 *   INVOICE_TEMPLATE_PRESETS,      // Tous les templates disponibles
 *   DEFAULT_TEMPLATE,              // Template par défaut
 *   TEMPLATE_LIST,                 // Liste pour UI
 *   TemplateCustomizer,            // Composant React de customisation
 *   calculateVATByRate,            // Utilitaires
 * } from '@/lib/invoice-templates';
 * ```
 */

// ============================================================================
// TYPES
// ============================================================================

export type { TemplatePreset } from './config/presets';
export type {
  ITemplateColors,
  ITemplateFonts,
  ITemplateLayout,
  ITemplateSections,
  ITemplateCustomText,
  IInvoiceTemplate,
} from '@/models/InvoiceTemplate';

// ============================================================================
// CONFIGURATION
// ============================================================================

export {
  INVOICE_TEMPLATE_PRESETS,
  DEFAULT_TEMPLATE,
  TEMPLATE_LIST,
} from './config/presets';

export {
  LEGAL_MENTIONS_PRESETS,
  LEGAL_MENTIONS_LIST,
  getLegalMentionsPresetByLegalForm,
  type LegalMentionsConfig,
} from './config/legal-mentions';

// ============================================================================
// CORE - Router & Validation
// ============================================================================

export { InvoicePDF } from './core/router';
export type { InvoicePDFProps } from './core/router';

export {
  validateTemplate,
  TemplateColorsSchema,
  TemplateFontsSchema,
  TemplateLayoutSchema,
  TemplateSectionsSchema,
  TemplateCustomTextSchema,
  TemplatePresetSchema,
} from './core/validation';

// ============================================================================
// CORE - Utilities
// ============================================================================

export {
  calculateVATByRate,
  formatCurrency,
  formatPercentage,
} from './core/utils';

// ============================================================================
// COMPONENTS - UI React
// ============================================================================

export {
  TemplateCustomizer,
  TemplatePreview,
  TemplateSelector,
  PDFViewerWrapper,
  ColorPicker,
  TemplatePreviewOptimized,
} from './components';
