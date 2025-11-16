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
  templateComponent: string;  // Nom du composant de rendu (ex: 'ModerneTemplate', 'ClassiqueTemplate')
  colors: ITemplateColors;
  fonts: ITemplateFonts;
  layout: ITemplateLayout;
  sections: ITemplateSections;
  customText: ITemplateCustomText;
}

/**
 * ═══════════════════════════════════════════════════════════════
 * 🎨 4 TEMPLATES ARCHITECTURALEMENT DISTINCTS
 * ═══════════════════════════════════════════════════════════════
 *
 * Chaque template a une architecture VRAIMENT différente :
 * - Position du logo (left/center/right)
 * - Style de header (modern/classic/minimal)
 * - Layout (colonnes/centré/asymétrique)
 * - Affichage des détails d'items (oui/non)
 * - Typographie (Helvetica/Times-Roman)
 * - Espacement (compact/normal)
 */

/**
 * ═══════════════════════════════════════════════════════════════
 * 1️⃣ MODERNE - Architecture startup/tech moderne
 * ═══════════════════════════════════════════════════════════════
 *
 * ARCHITECTURE:
 * - Header: Barre colorée horizontale en haut
 * - Logo: LEFT, taille medium
 * - Layout: 2 colonnes classique
 * - Typography: Helvetica (sans-serif moderne)
 * - Items: Sommaire uniquement (pas de détails)
 * - Espacement: Compact, efficace
 *
 * CAS D'USAGE:
 * - Startups tech
 * - Agences digitales
 * - Freelances modernes
 * - Services SaaS
 */
export const modernTemplate: TemplatePreset = {
  name: 'Moderne',
  description: 'Design tech moderne avec header coloré et layout efficace',
  templateComponent: 'ModerneTemplate',
  colors: {
    primary: '#2563eb',    // Bleu tech moderne
    secondary: '#64748b',  // Gris ardoise
    accent: '#10b981',     // Vert accent
    text: '#1e293b',       // Noir profond
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
    logoPosition: 'left',
    logoSize: 'medium',
    headerStyle: 'modern',
    borderRadius: 4,
    spacing: 'compact',
  },
  sections: {
    showLogo: true,
    showBankDetails: true,
    showPaymentTerms: true,
    showLegalMentions: true,
    showItemDetails: false,  // ❌ PAS de détails (moderne, épuré)
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
 * ═══════════════════════════════════════════════════════════════
 * 2️⃣ CLASSIQUE - Architecture traditionnelle européenne
 * ═══════════════════════════════════════════════════════════════
 *
 * ARCHITECTURE:
 * - Header: 2 colonnes avec bordures épaisses décoratives
 * - Logo: LEFT LARGE (80px)
 * - Layout: 2 colonnes traditionnel
 * - Typography: Times-Roman (serif élégant)
 * - Items: DÉTAILS COMPLETS (description + qté + prix unitaire + TVA)
 * - Espacement: Normal, respirant
 * - Bordures: Géométriques, sans arrondis
 *
 * CAS D'USAGE:
 * - Cabinets juridiques
 * - Notaires
 * - Entreprises formelles
 * - Collectivités
 * - Prestations B2B traditionnelles
 */
export const classicTemplate: TemplatePreset = {
  name: 'Classique',
  description: 'Style européen formel avec bordures, serif et détails complets',
  templateComponent: 'ClassiqueTemplate',
  colors: {
    primary: '#1e3a8a',    // Bleu marine profond
    secondary: '#6b7280',  // Gris neutre
    accent: '#b45309',     // Or/bronze élégant
    text: '#1f2937',       // Noir quasi-pur
    background: '#ffffff',
  },
  fonts: {
    heading: 'Times-Roman',  // ✨ SERIF (distinction majeure)
    body: 'Times-Roman',
    size: {
      base: 10,
      heading: 22,
      small: 8,
    },
  },
  layout: {
    logoPosition: 'left',
    logoSize: 'large',      // ✨ GRAND logo (distinction)
    headerStyle: 'classic', // ✨ Bordures épaisses
    borderRadius: 0,        // ✨ Géométrique pur
    spacing: 'normal',
  },
  sections: {
    showLogo: true,
    showBankDetails: true,
    showPaymentTerms: true,
    showLegalMentions: true,
    showItemDetails: true,   // ✅ DÉTAILS COMPLETS (distinction majeure)
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
 * ═══════════════════════════════════════════════════════════════
 * 3️⃣ MINIMALISTE - Architecture ultra-épurée centrée
 * ═══════════════════════════════════════════════════════════════
 *
 * ARCHITECTURE:
 * - Header: Minimaliste sans décoration
 * - Logo: CENTER petit (30px)
 * - Layout: CENTRÉ (tout aligné au centre)
 * - Typography: Helvetica (sans-serif épuré)
 * - Items: Sommaire uniquement
 * - Espacement: Compact mais généreux
 * - Bordures: AUCUNE
 *
 * CAS D'USAGE:
 * - Designers indépendants
 * - Consultants modernes
 * - Services premium épurés
 * - Freelances créatifs minimalistes
 */
export const minimalTemplate: TemplatePreset = {
  name: 'Minimaliste',
  description: 'Ultra épuré, centré, sans bordures, maximalisme du vide',
  templateComponent: 'MinimalisteTemplate',
  colors: {
    primary: '#000000',    // Noir pur (minimalisme)
    secondary: '#6b7280',  // Gris neutre
    accent: '#3b82f6',     // Bleu tech (accent léger)
    text: '#111827',       // Noir quasi-pur
    background: '#ffffff', // Blanc pur
  },
  fonts: {
    heading: 'Helvetica',
    body: 'Helvetica',
    size: {
      base: 10,
      heading: 18,  // ✨ Petit (compact)
      small: 8,
    },
  },
  layout: {
    logoPosition: 'center', // ✨ CENTRÉ (distinction majeure)
    logoSize: 'small',      // ✨ PETIT (minimaliste)
    headerStyle: 'minimal', // ✨ Sans décoration
    borderRadius: 0,
    spacing: 'compact',
  },
  sections: {
    showLogo: true,
    showBankDetails: true,
    showPaymentTerms: false,  // ✨ Minimal (économiser espace)
    showLegalMentions: true,
    showItemDetails: false,   // ❌ Sommaire uniquement
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
 * ═══════════════════════════════════════════════════════════════
 * 4️⃣ STUDIO - Architecture créative asymétrique
 * ═══════════════════════════════════════════════════════════════
 *
 * ARCHITECTURE:
 * - Header: Barre latérale colorée à droite
 * - Logo: RIGHT (asymétrique)
 * - Layout: Asymétrique créatif
 * - Typography: Helvetica-Bold (moderne géométrique)
 * - Items: Détails complets avec style
 * - Espacement: Normal, créatif
 * - Bordures: ARRONDIS MARQUÉS (12px)
 *
 * CAS D'USAGE:
 * - Agences créatives
 * - Studios de design
 * - Freelances créatifs
 * - Marques modernes audacieuses
 */
export const studioTemplate: TemplatePreset = {
  name: 'Studio',
  description: 'Design créatif asymétrique avec barre latérale et arrondis',
  templateComponent: 'StudioTemplate',
  colors: {
    primary: '#8b5cf6',    // Violet vibrant
    secondary: '#6b7280',  // Gris neutre
    accent: '#f59e0b',     // Orange vif (contraste)
    text: '#111827',       // Noir foncé
    background: '#ffffff',
  },
  fonts: {
    heading: 'Helvetica-Bold',
    body: 'Helvetica',
    size: {
      base: 11,
      heading: 26,  // ✨ Grand titre impactant
      small: 9,
    },
  },
  layout: {
    logoPosition: 'right',  // ✨ DROITE (asymétrique, distinction majeure)
    logoSize: 'medium',
    headerStyle: 'modern',  // Barre latérale colorée
    borderRadius: 12,       // ✨ ARRONDIS MARQUÉS
    spacing: 'normal',
  },
  sections: {
    showLogo: true,
    showBankDetails: true,
    showPaymentTerms: true,
    showLegalMentions: true,
    showItemDetails: true,   // ✅ Détails avec style
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
 * ═══════════════════════════════════════════════════════════════
 * ✨ TEMPLATE 5: CRÉATIF
 * ═══════════════════════════════════════════════════════════════
 *
 * ARCHITECTURE:
 * - Header: Diagonal coloré avec effet dynamique
 * - Logo: CENTER (équilibré sur header diagonal)
 * - Layout: Asymétrique bold avec éléments décalés
 * - Typography: Helvetica-Bold (impact visuel)
 * - Items: Design moderne avec formes géométriques
 * - Espacement: Relaxed (aéré créatif)
 * - Bordures: ARRONDIS DOUX (8px)
 *
 * CAS D'USAGE:
 * - Créateurs de contenu
 * - Artistes
 * - Freelances ultra-créatifs
 * - Marques lifestyle et mode
 */
export const creatifTemplate: TemplatePreset = {
  name: 'Créatif',
  description: 'Design audacieux avec header diagonal et layout asymétrique',
  templateComponent: 'CreatifTemplate',
  colors: {
    primary: '#ec4899',    // Rose vibrant (créatif)
    secondary: '#6b7280',  // Gris neutre
    accent: '#14b8a6',     // Turquoise (contraste dynamique)
    text: '#111827',       // Noir foncé
    background: '#ffffff',
  },
  fonts: {
    heading: 'Helvetica-Bold',
    body: 'Helvetica',
    size: {
      base: 11,
      heading: 28,  // ✨ XXL pour impact maximal
      small: 9,
    },
  },
  layout: {
    logoPosition: 'center',  // ✨ CENTRÉ sur header diagonal
    logoSize: 'large',       // ✨ GRAND pour visibilité
    headerStyle: 'modern',   // Header diagonal coloré
    borderRadius: 8,         // Arrondis doux
    spacing: 'relaxed',      // ✨ Espacé pour respiration créative
  },
  sections: {
    showLogo: true,
    showBankDetails: true,
    showPaymentTerms: true,
    showLegalMentions: true,
    showItemDetails: true,   // ✅ Détails avec style géométrique
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
 * ═══════════════════════════════════════════════════════════════
 * 📦 EXPORTS
 * ═══════════════════════════════════════════════════════════════
 */

/**
 * Map de tous les templates disponibles
 * Clés en français pour cohérence avec template.name
 */
export const INVOICE_TEMPLATE_PRESETS: Record<string, TemplatePreset> = {
  moderne: modernTemplate,
  classique: classicTemplate,
  minimaliste: minimalTemplate,
  studio: studioTemplate,
  creatif: creatifTemplate,
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
