/**
 * Types centralisés pour le système de templates d'invoices
 * Re-exports depuis les différents modules
 */

export type {
  ITemplateColors,
  ITemplateFonts,
  ITemplateLayout,
  ITemplateSections,
  ITemplateCustomText,
  IInvoiceTemplate,
} from '@/models/InvoiceTemplate';

export type { TemplatePreset } from './config/presets';
