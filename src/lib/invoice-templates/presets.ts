import type { 
  ITemplateColors, 
  ITemplateFonts, 
  ITemplateLayout, 
  ITemplateSections, 
  ITemplateCustomText 
} from '@/models/InvoiceTemplate';
import { LEGAL_MENTIONS_PRESETS } from './legal-mentions';

/**
 * Type pour un template complet (sans les champs DB)
 */
export interface TemplatePreset {
  name: string;
  description: string;
  colors: ITemplateColors;
  fonts: ITemplateFonts;
  layout: ITemplateLayout;
  sections: ITemplateSections;
  customText: ITemplateCustomText;
}

/**
 * Template Moderne - Design épuré avec barre bleue moderne
 */
export const modernTemplate: TemplatePreset = {
  name: 'Moderne',
  description: 'Barre de couleur moderne, logo à gauche, espacé',
  colors: {
    primary: '#2563eb', // Bleu vif moderne
    secondary: '#64748b',
    accent: '#10b981',
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
    headerStyle: 'modern', // Barre de couleur
    borderRadius: 6,
    spacing: 'compact',
  },
  sections: {
    showLogo: true,
    showBankDetails: true,
    showPaymentTerms: true,
    showLegalMentions: true,
    showItemDetails: false,
    showCompanyDetails: true,
    showClientDetails: true,
  },
  customText: {
    invoiceTitle: 'FACTURE',
    paymentTermsLabel: 'Modalités de paiement',
    bankDetailsLabel: 'Coordonnées Bancaires',
    legalMentions: LEGAL_MENTIONS_PRESETS['societe-standard'].template,
    legalMentionsType: 'societe-standard',
    footerText: undefined,
  },
};

/**
 * Template Classique - Style élégant avec double bordure, logo centré
 */
export const classicTemplate: TemplatePreset = {
  name: 'Classique',
  description: 'Double bordure élégante, logo centré, serif, tout détaillé',
  colors: {
    primary: '#1a1a1a', // Noir élégant
    secondary: '#525252',
    accent: '#b8860b', // Or sombre
    text: '#171717',
    background: '#ffffff',
  },
  fonts: {
    heading: 'Georgia, Garamond, serif',
    body: 'Georgia, Times New Roman, serif',
    size: {
      base: 10,
      heading: 20,
      small: 8,
    },
  },
  layout: {
    logoPosition: 'center', // Logo centré
    logoSize: 'large',
    headerStyle: 'classic', // Double bordure
    borderRadius: 0, // Sans arrondi
    spacing: 'normal', // Espacé mais pas trop
  },
  sections: {
    showLogo: true,
    showBankDetails: true,
    showPaymentTerms: true,
    showLegalMentions: true,
    showItemDetails: true, // Affiche détails items
    showCompanyDetails: true,
    showClientDetails: true,
  },
  customText: {
    invoiceTitle: 'FACTURE',
    paymentTermsLabel: 'Conditions de règlement',
    bankDetailsLabel: 'Coordonnées bancaires',
    legalMentions: LEGAL_MENTIONS_PRESETS['societe-complete'].template,
    legalMentionsType: 'societe-complete',
    footerText: undefined,
  },
};

/**
 * Template Minimaliste - Ultra épuré, noir/blanc, compact
 */
export const minimalTemplate: TemplatePreset = {
  name: 'Minimaliste',
  description: 'Ultra épuré, noir/blanc, sans bordure, compact, petit logo',
  colors: {
    primary: '#000000', // Noir pur
    secondary: '#737373',
    accent: '#404040',
    text: '#0a0a0a',
    background: '#ffffff',
  },
  fonts: {
    heading: 'Helvetica Neue, Arial, sans-serif',
    body: 'Helvetica, Arial, sans-serif',
    size: {
      base: 10, // Petit texte
      heading: 18, // Petit titre
      small: 8,
    },
  },
  layout: {
    logoPosition: 'left',
    logoSize: 'small', // Petit logo
    headerStyle: 'minimal', // Sans bordure
    borderRadius: 0,
    spacing: 'compact', // Très compact
  },
  sections: {
    showLogo: true,
    showBankDetails: true,
    showPaymentTerms: false, // Pas de modalités
    showLegalMentions: true,
    showItemDetails: false,
    showCompanyDetails: true,
    showClientDetails: true,
  },
  customText: {
    invoiceTitle: 'INVOICE',
    paymentTermsLabel: 'Payment',
    bankDetailsLabel: 'Bank',
    legalMentions: LEGAL_MENTIONS_PRESETS['micro-entreprise'].template,
    legalMentionsType: 'micro-entreprise',
    footerText: undefined,
  },
};

/**
 * Template Créatif - Coloré, logo à droite, arrondis, fun
 */
export const creativeTemplate: TemplatePreset = {
  name: 'Créatif',
  description: 'Coloré et dynamique, logo droite, arrondis marqués, moderne',
  colors: {
    primary: '#7c3aed', // Violet vif
    secondary: '#6b7280',
    accent: '#f59e0b', // Orange
    text: '#111827',
    background: '#ffffff',
  },
  fonts: {
    heading: 'Poppins, Montserrat, sans-serif',
    body: 'Inter, -apple-system, sans-serif',
    size: {
      base: 11,
      heading: 26, // Grand titre
      small: 9,
    },
  },
  layout: {
    logoPosition: 'right', // Logo à droite
    logoSize: 'medium',
    headerStyle: 'modern',
    borderRadius: 12, // Très arrondis
    spacing: 'normal',
  },
  sections: {
    showLogo: true,
    showBankDetails: true,
    showPaymentTerms: true,
    showLegalMentions: true,
    showItemDetails: false,
    showCompanyDetails: true,
    showClientDetails: true,
  },
  customText: {
    invoiceTitle: 'FACTURE',
    paymentTermsLabel: 'Paiement',
    bankDetailsLabel: 'Coordonnées bancaires',
    legalMentions: LEGAL_MENTIONS_PRESETS['profession-liberale'].template,
    legalMentionsType: 'profession-liberale',
    footerText: 'Merci ! 🎨',
  },
};

/**
 * Map de tous les templates disponibles
 */
export const INVOICE_TEMPLATE_PRESETS: Record<string, TemplatePreset> = {
  modern: modernTemplate,
  classic: classicTemplate,
  minimal: minimalTemplate,
  creative: creativeTemplate,
};

/**
 * Template par défaut (Moderne)
 */
export const DEFAULT_TEMPLATE = modernTemplate;

/**
 * Liste des templates pour affichage UI
 */
export const TEMPLATE_LIST = Object.entries(INVOICE_TEMPLATE_PRESETS).map(([key, template]) => ({
  id: key,
  ...template,
}));
