/**
 * 📦 Point d'entrée centralisé pour le système de templates d'invoices
 * 
 * Architecture:
 * - config/     → Configurations (presets, mentions légales)
 * - core/       → Logique métier (router, validation, utils)
 * - templates/  → Composants de rendu PDF (Moderne, Classique, Minimaliste, Créatif)
 * - components/ → Composants UI React (Customizer, Preview, Selector)
 * 
 * Usage:
 * ```typescript
 * import {
 *   InvoicePDF,
 *   modernTemplate,
 *   TemplateCustomizer,
 *   calculateVATByRate
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
  modernTemplate,
  classicTemplate,
  minimalTemplate,
  creativeTemplate,
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
// TEMPLATES - Composants PDF
// ============================================================================

export { ModerneTemplate } from './templates/ModerneTemplate';
export { ClassiqueTemplate } from './templates/ClassiqueTemplate';
export { MinimalisteTemplate } from './templates/MinimalisteTemplate';
export { CreatifTemplate } from './templates/CreatifTemplate';

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

// ============================================================================
// RE-EXPORTS pour backward compatibility
// ============================================================================

/**
 * @deprecated Importer directement depuis '@/lib/invoice-templates'
 * Ces exports seront supprimés dans v3.0
 */
export * as Presets from './config/presets';
export * as LegalMentions from './config/legal-mentions';
export * as Validation from './core/validation';
export * as Utils from './core/utils';
