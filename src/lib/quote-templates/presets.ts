/**
 * Presets de templates par défaut pour les devis (Quotes)
 * 4 styles de base + design personnalisable
 */

import type {
  IQuoteTemplateColors,
  IQuoteTemplateFonts,
  IQuoteTemplateLayout,
  IQuoteTemplateSections,
  IQuoteTemplateCustomText,
} from '@/models/QuoteTemplate';

/**
 * Type pour un preset de template complet
 */
export interface QuoteTemplatePreset {
  name: string;
  description: string;
  colors: IQuoteTemplateColors;
  fonts: IQuoteTemplateFonts;
  layout: IQuoteTemplateLayout;
  sections: IQuoteTemplateSections;
  customText: IQuoteTemplateCustomText;
}

/**
 * Template Vert Moderne - Design épuré avec accent vert
 */
export const greenModernQuoteTemplate: QuoteTemplatePreset = {
  name: 'Vert Moderne',
  description: 'Design épuré avec couleur vert moderne',
  colors: {
    primary: '#10b981',
    secondary: '#64748b',
    accent: '#059669',
    text: '#1e293b',
    background: '#ffffff',
  },
  fonts: {
    heading: 'Inter, -apple-system, sans-serif',
    body: 'Inter, -apple-system, sans-serif',
    size: {
      base: 10,
      heading: 18,
      small: 8,
    },
  },
  layout: {
    logoPosition: 'left',
    logoSize: 'medium',
    headerStyle: 'modern',
    borderRadius: 6,
    spacing: 'normal',
  },
  sections: {
    showLogo: true,
    showBankDetails: true,
    showPaymentTerms: true,
    showCompanyDetails: true,
    showClientDetails: true,
  },
  customText: {
    quoteTitle: 'DEVIS',
    validUntilLabel: 'Valable jusqu\'au',
    bankDetailsLabel: 'Coordonnées Bancaires',
    paymentTermsLabel: 'Modalités de paiement',
  },
};

/**
 * Template Bleu Classique - Style professionnel traditionnel
 */
export const blueClassicQuoteTemplate: QuoteTemplatePreset = {
  name: 'Bleu Classique',
  description: 'Style professionnel et traditionnel',
  colors: {
    primary: '#2563eb',
    secondary: '#64748b',
    accent: '#1d4ed8',
    text: '#1e293b',
    background: '#ffffff',
  },
  fonts: {
    heading: 'Georgia, serif',
    body: 'Georgia, serif',
    size: {
      base: 11,
      heading: 20,
      small: 9,
    },
  },
  layout: {
    logoPosition: 'center',
    logoSize: 'medium',
    headerStyle: 'classic',
    borderRadius: 0,
    spacing: 'relaxed',
  },
  sections: {
    showLogo: true,
    showBankDetails: true,
    showPaymentTerms: true,
    showCompanyDetails: true,
    showClientDetails: true,
  },
  customText: {
    quoteTitle: 'DEVIS',
    validUntilLabel: 'Valide jusqu\'au',
    bankDetailsLabel: 'Informations Bancaires',
    paymentTermsLabel: 'Conditions de Paiement',
  },
};

/**
 * Template Minimal Gris - Design épuré sans fioritures
 */
export const grayMinimalQuoteTemplate: QuoteTemplatePreset = {
  name: 'Minimal Gris',
  description: 'Design épuré et minimaliste',
  colors: {
    primary: '#64748b',
    secondary: '#94a3b8',
    accent: '#475569',
    text: '#334155',
    background: '#ffffff',
  },
  fonts: {
    heading: 'Inter, -apple-system, sans-serif',
    body: 'Inter, -apple-system, sans-serif',
    size: {
      base: 10,
      heading: 16,
      small: 8,
    },
  },
  layout: {
    logoPosition: 'left',
    logoSize: 'small',
    headerStyle: 'minimal',
    borderRadius: 2,
    spacing: 'compact',
  },
  sections: {
    showLogo: true,
    showBankDetails: false,
    showPaymentTerms: true,
    showCompanyDetails: true,
    showClientDetails: true,
  },
  customText: {
    quoteTitle: 'DEVIS',
    validUntilLabel: 'Valide le',
    bankDetailsLabel: 'Coordonnées',
    paymentTermsLabel: 'Conditions',
  },
};

/**
 * Template Orange Créatif - Design moderne et coloré
 */
export const orangeCreativeQuoteTemplate: QuoteTemplatePreset = {
  name: 'Orange Créatif',
  description: 'Design moderne et créatif avec accent orange',
  colors: {
    primary: '#f97316',
    secondary: '#fb923c',
    accent: '#ea580c',
    text: '#1e293b',
    background: '#fff7ed',
  },
  fonts: {
    heading: 'Inter, -apple-system, sans-serif',
    body: 'Inter, -apple-system, sans-serif',
    size: {
      base: 10,
      heading: 20,
      small: 8,
    },
  },
  layout: {
    logoPosition: 'right',
    logoSize: 'large',
    headerStyle: 'modern',
    borderRadius: 8,
    spacing: 'relaxed',
  },
  sections: {
    showLogo: true,
    showBankDetails: true,
    showPaymentTerms: true,
    showCompanyDetails: true,
    showClientDetails: true,
  },
  customText: {
    quoteTitle: 'DEVIS',
    validUntilLabel: 'Valable jusqu\'au',
    bankDetailsLabel: 'Coordonnées Bancaires',
    paymentTermsLabel: 'Conditions Commerciales',
  },
};

/**
 * Template par défaut (vert moderne)
 */
export const DEFAULT_QUOTE_TEMPLATE = greenModernQuoteTemplate;

/**
 * Array de tous les presets disponibles
 */
export const QUOTE_TEMPLATE_PRESETS = [
  greenModernQuoteTemplate,
  blueClassicQuoteTemplate,
  grayMinimalQuoteTemplate,
  orangeCreativeQuoteTemplate,
];
