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
  description?: string;
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
    heading: 'Helvetica',
    body: 'Helvetica',
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
 * Template Classique - Style classique européen avec bordures épaisses, serif
 * Architecture distincte: Logo LEFT large + bordures décoratives + typography serif
 * Cas d'usage: Cabinets juridiques, notaires, collectivités, entreprises formelles
 */
export const classicTemplate: TemplatePreset = {
  name: 'Classique',
  description: 'Style classique européen, bordures, serif, tout détaillé, formel',
  colors: {
    primary: '#3d2818', // Marron foncé élégant
    secondary: '#8b6914', // Or foncé
    accent: '#d4af37', // Or brillant (accent)
    text: '#1a1a1a', // Noir pur
    background: '#fefdf7', // Crème très légère
  },
  fonts: {
    heading: 'Helvetica-Bold', // Serif non supporté dans @react-pdf
    body: 'Helvetica',
    size: {
      base: 10,
      heading: 20,
      small: 8,
    },
  },
  layout: {
    logoPosition: 'left', // Logo à gauche, GRAND
    logoSize: 'large', // ✨ GRAND (80px)
    headerStyle: 'classic', // 2-colonnes + bordures épaisses
    borderRadius: 0, // Sans arrondis (géométrie classique)
    spacing: 'normal', // Équilibré, respirant
  },
  sections: {
    showLogo: true,
    showBankDetails: true,
    showPaymentTerms: true,
    showLegalMentions: true,
    showItemDetails: true, // ✨ TABLE COMPLÈTE (distinction majeure)
    showCompanyDetails: true,
    showClientDetails: true,
  },
  customText: {
    invoiceTitle: 'FACTURE',
    paymentTermsLabel: 'Conditions de règlement',
    bankDetailsLabel: 'Coordonnées bancaires',
    legalMentions: LEGAL_MENTIONS_PRESETS['societe-complete'].template, // ✨ Complètes (formel)
    legalMentionsType: 'societe-complete',
    footerText: undefined,
  },
};

/**
 * Template Minimaliste - Ultra épuré, startup/tech, centré, sans décoration
 * Architecture distincte: Logo CENTER petit + zéro bordures + espaces généreux + sans détails items
 * Cas d'usage: Startups, agences tech, freelancers modernes, consultants innovants
 */
export const minimalTemplate: TemplatePreset = {
  name: 'Minimaliste',
  description: 'Ultra épuré, tech/startup, centré, sans bordures, compact',
  colors: {
    primary: '#000000', // Noir pur (minimalisme)
    secondary: '#888888', // Gris neutre
    accent: '#3b82f6', // Bleu tech (accent léger)
    text: '#1f2937', // Noir quasi-pur
    background: '#ffffff', // Blanc pur
  },
  fonts: {
    heading: 'Helvetica',
    body: 'Helvetica',
    size: {
      base: 10, // Petit texte
      heading: 18, // Petit titre (compact)
      small: 8,
    },
  },
  layout: {
    logoPosition: 'center', // ✨ CENTRÉ (distinction majeure)
    logoSize: 'small', // ✨ PETIT (30px, minimaliste)
    headerStyle: 'minimal', // Sans bordures, sans décoration
    borderRadius: 0, // Géométrique pur
    spacing: 'compact', // Compact mais aéré
  },
  sections: {
    showLogo: true,
    showBankDetails: true,
    showPaymentTerms: false, // ✨ NON (économiser espace)
    showLegalMentions: true,
    showItemDetails: false, // ✨ NON (voir totalité, pas détails)
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
 * Template Créatif - Moderne créatif, asymétrique, couleurs vibrantes, rounded
 * Architecture distincte: Logo RIGHT + barre latérale colorée + typography moderne géométrique + arrondis
 * Cas d'usage: Agences créatives, studios design, freelancers créatifs, marques modernes
 */
export const creativeTemplate: TemplatePreset = {
  name: 'Créatif',
  description: 'Moderne créatif, asymétrique, logo droite, couleurs vibrantes, rounded',
  colors: {
    primary: '#9333ea', // Violet vibrant (moderne)
    secondary: '#6b7280', // Gris neutre
    accent: '#f97316', // Orange vif (contraste)
    text: '#111827', // Noir foncé
    background: '#ffffff', // Blanc pur
  },
  fonts: {
    heading: 'Helvetica-Bold', // Fonts système non supportées
    body: 'Helvetica',
    size: {
      base: 11,
      heading: 26, // ✨ Grand titre (moderne, impactant)
      small: 9,
    },
  },
  layout: {
    logoPosition: 'right', // ✨ DROITE (asymétrique, distinction majeure)
    logoSize: 'medium',
    headerStyle: 'modern', // Barre latérale (colorée)
    borderRadius: 12, // ✨ ARRONDIS MARQUÉS (12px)
    spacing: 'normal', // Équilibré, créatif
  },
  sections: {
    showLogo: true,
    showBankDetails: true,
    showPaymentTerms: true,
    showLegalMentions: true,
    showItemDetails: false, // ✨ Sommaire (moderne, pas détails)
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
 * Map de tous les templates disponibles
 * Clés en français pour cohérence avec template.name
 */
export const INVOICE_TEMPLATE_PRESETS: Record<string, TemplatePreset> = {
  moderne: modernTemplate,
  classique: classicTemplate,
  minimaliste: minimalTemplate,
  creatif: creativeTemplate,
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
