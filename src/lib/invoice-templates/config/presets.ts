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
 * Template Professionnel - Corporate premium avec 3 zones (header + 65% content + 35% sidebar)
 * Architecture distincte: Full-width header coloré + layout 2-colonnes asymétrique + tableaux encadrés
 * Cas d'usage: Grandes entreprises, cabinets conseil, B2B premium, prestations formelles
 */
export const professionalTemplate: TemplatePreset = {
  name: 'Professionnel',
  description: 'Corporate premium, 3-zone layout, formal, tableaux encadrés',
  colors: {
    primary: '#2563eb', // Bleu corporate
    secondary: '#475569', // Gris foncé
    accent: '#0ea5e9', // Bleu clair accent
    text: '#0f172a', // Noir profond
    background: '#ffffff',
  },
  fonts: {
    heading: 'Helvetica-Bold',
    body: 'Helvetica',
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
    borderRadius: 4,
    spacing: 'normal',
  },
  sections: {
    showLogo: true,
    showBankDetails: true,
    showPaymentTerms: true,
    showLegalMentions: true,
    showItemDetails: true,
    showCompanyDetails: true,
    showClientDetails: true,
  },
  customText: {
    invoiceTitle: 'FACTURE',
    paymentTermsLabel: 'Modalités de paiement',
    bankDetailsLabel: 'Coordonnées Bancaires',
    legalMentions: LEGAL_MENTIONS_PRESETS['societe-complete'].template,
    legalMentionsType: 'societe-complete',
    footerText: undefined,
  },
};

/**
 * Template Élégant - Luxe raffiné, centré, serif, marges larges
 * Architecture distincte: Tout centré + marges 50px + serif Times-Roman + espaces généreux + minimal borders
 * Cas d'usage: Luxury brands, artisans haut de gamme, services premium, prestations exclusives
 */
export const elegantTemplate: TemplatePreset = {
  name: 'Élégant',
  description: 'Luxe raffiné, centré, serif, marges larges, minimal borders',
  colors: {
    primary: '#1f2937', // Gris anthracite élégant
    secondary: '#9ca3af', // Gris clair
    accent: '#d4af37', // Or subtil
    text: '#374151', // Gris foncé texte
    background: '#ffffff',
  },
  fonts: {
    heading: 'Times-Roman', // Serif élégant
    body: 'Times-Roman',
    size: {
      base: 11,
      heading: 22,
      small: 9,
    },
  },
  layout: {
    logoPosition: 'center',
    logoSize: 'medium',
    headerStyle: 'minimal',
    borderRadius: 0,
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
    paymentTermsLabel: 'Modalités de paiement',
    bankDetailsLabel: 'Coordonnées Bancaires',
    legalMentions: LEGAL_MENTIONS_PRESETS['societe-standard'].template,
    legalMentionsType: 'societe-standard',
    footerText: undefined,
  },
};

/**
 * Template Compact - Dense et efficace, optimisé pour tenir sur une page
 * Architecture distincte: Marges 20px + police 8pt + tableaux serrés + info grid 3-colonnes
 * Cas d'usage: Factures multi-items, beaucoup d'informations, optimisation espace, économie papier
 */
export const compactTemplate: TemplatePreset = {
  name: 'Compact',
  description: 'Dense et efficace, optimisé pour A4, tableaux serrés',
  colors: {
    primary: '#059669', // Vert efficace
    secondary: '#6b7280', // Gris neutre
    accent: '#10b981', // Vert clair
    text: '#111827', // Noir
    background: '#ffffff',
  },
  fonts: {
    heading: 'Helvetica',
    body: 'Helvetica',
    size: {
      base: 8, // Petit pour densité
      heading: 16,
      small: 6,
    },
  },
  layout: {
    logoPosition: 'right',
    logoSize: 'small',
    headerStyle: 'modern',
    borderRadius: 0,
    spacing: 'compact',
  },
  sections: {
    showLogo: true,
    showBankDetails: true,
    showPaymentTerms: true,
    showLegalMentions: true,
    showItemDetails: true,
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
 * Template Colorful - Moderne vibrant avec dégradés et couleurs vives
 * Architecture distincte: Header dégradé + cartes colorées + accents multiples + design dynamique
 * Cas d'usage: Startups tech, agences digitales, freelancers créatifs, services innovants
 */
export const colorfulTemplate: TemplatePreset = {
  name: 'Colorful',
  description: 'Moderne vibrant, dégradés, cartes colorées, design dynamique',
  colors: {
    primary: '#3b82f6', // Bleu vif
    secondary: '#10b981', // Vert vibrant
    accent: '#f59e0b', // Orange
    text: '#1f2937', // Noir foncé
    background: '#f9fafb', // Gris très clair
  },
  fonts: {
    heading: 'Helvetica-Bold',
    body: 'Helvetica',
    size: {
      base: 10,
      heading: 24,
      small: 8,
    },
  },
  layout: {
    logoPosition: 'right',
    logoSize: 'large',
    headerStyle: 'modern',
    borderRadius: 12,
    spacing: 'normal',
  },
  sections: {
    showLogo: true,
    showBankDetails: true,
    showPaymentTerms: true,
    showLegalMentions: true,
    showItemDetails: true,
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
 * CORPORATE Template - Design d'entreprise moderne et professionnel
 */
export const corporateTemplate: TemplatePreset = {
  name: 'Corporate',
  description: 'Design d\'entreprise moderne avec header coloré et layout équilibré',
  colors: {
    primary: '#2563eb',
    secondary: '#64748b',
    accent: '#0ea5e9',
    text: '#1e293b',
    background: '#ffffff',
  },
  fonts: {
    heading: 'Helvetica-Bold',
    body: 'Helvetica',
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
    borderRadius: 6,
    spacing: 'normal',
  },
  sections: {
    showLogo: true,
    showBankDetails: true,
    showPaymentTerms: true,
    showLegalMentions: true,
    showItemDetails: true,
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
 * PRESTIGE Template - Design luxe et raffiné
 */
export const prestigeTemplate: TemplatePreset = {
  name: 'Prestige',
  description: 'Design luxe centré avec typographie élégante et or',
  colors: {
    primary: '#1f2937',
    secondary: '#9ca3af',
    accent: '#d4af37',
    text: '#374151',
    background: '#ffffff',
  },
  fonts: {
    heading: 'Times-Roman',
    body: 'Times-Roman',
    size: {
      base: 10,
      heading: 22,
      small: 8,
    },
  },
  layout: {
    logoPosition: 'center',
    logoSize: 'large',
    headerStyle: 'minimal',
    borderRadius: 0,
    spacing: 'normal',
  },
  sections: {
    showLogo: true,
    showBankDetails: true,
    showPaymentTerms: true,
    showLegalMentions: true,
    showItemDetails: true,
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
 * STUDIO Template - Design créatif et moderne pour agences
 */
export const studioTemplate: TemplatePreset = {
  name: 'Studio',
  description: 'Design créatif asymétrique avec barre d\'accent colorée',
  colors: {
    primary: '#8b5cf6',
    secondary: '#6b7280',
    accent: '#f59e0b',
    text: '#111827',
    background: '#ffffff',
  },
  fonts: {
    heading: 'Helvetica-Bold',
    body: 'Helvetica',
    size: {
      base: 10,
      heading: 24,
      small: 8,
    },
  },
  layout: {
    logoPosition: 'right',
    logoSize: 'medium',
    headerStyle: 'modern',
    borderRadius: 6,
    spacing: 'normal',
  },
  sections: {
    showLogo: true,
    showBankDetails: true,
    showPaymentTerms: true,
    showLegalMentions: true,
    showItemDetails: true,
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
 * TECH Template - Design moderne et épuré pour startups/tech
 */
export const techTemplate: TemplatePreset = {
  name: 'Tech',
  description: 'Design moderne épuré avec cartes et espacements larges',
  colors: {
    primary: '#3b82f6',
    secondary: '#6b7280',
    accent: '#10b981',
    text: '#212529',
    background: '#f8f9fa',
  },
  fonts: {
    heading: 'Helvetica-Bold',
    body: 'Helvetica',
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
    spacing: 'normal',
  },
  sections: {
    showLogo: true,
    showBankDetails: true,
    showPaymentTerms: true,
    showLegalMentions: true,
    showItemDetails: true,
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
  professionnel: professionalTemplate,
  elegant: elegantTemplate,
  compact: compactTemplate,
  colorful: colorfulTemplate,
  corporate: corporateTemplate,
  prestige: prestigeTemplate,
  studio: studioTemplate,
  tech: techTemplate,
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
