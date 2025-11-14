/**
 * Mentions légales obligatoires pour les factures françaises
 * Conformément aux articles L441-3 et L441-9 du Code de commerce
 */

export interface LegalMentionsConfig {
  id: string;
  name: string;
  description: string;
  applicableFor: string[];
  sections: {
    penalites?: {
      tauxInteret: string; // Ex: "trois fois le taux d'intérêt légal"
      indemniteForfaitaire: string; // Ex: "40 euros"
      coutRecouvrement?: boolean;
    };
    escompte?: {
      enabled: boolean;
      taux?: string;
      delai?: string;
    };
    tva?: {
      regime: 'normal' | 'franchise' | 'autoliquidation';
      mention?: string;
    };
    rcs?: {
      enabled: boolean;
      mention?: string;
    };
    capital?: {
      enabled: boolean;
    };
    assurance?: {
      enabled: boolean;
    };
  };
  template: string;
}

/**
 * Mentions légales pré-définies selon le type d'entreprise
 */
export const LEGAL_MENTIONS_PRESETS: Record<string, LegalMentionsConfig> = {
  'micro-entreprise': {
    id: 'micro-entreprise',
    name: 'Micro-entrepreneur (Franchise en base de TVA)',
    description: 'Pour auto-entrepreneurs et micro-entreprises en franchise de TVA',
    applicableFor: ['Micro-entrepreneur', 'Auto-entrepreneur'],
    sections: {
      penalites: {
        tauxInteret: 'trois fois le taux d\'intérêt légal',
        indemniteForfaitaire: '40 euros',
        coutRecouvrement: true,
      },
      escompte: {
        enabled: false,
      },
      tva: {
        regime: 'franchise',
        mention: 'TVA non applicable, article 293 B du CGI',
      },
      rcs: {
        enabled: false,
      },
      capital: {
        enabled: false,
      },
      assurance: {
        enabled: false,
      },
    },
    template: `En cas de retard de paiement, seront exigibles, conformément à l'article L. 441-6 du Code de commerce, une indemnité calculée sur la base de trois fois le taux d'intérêt légal ainsi qu'une indemnité forfaitaire pour frais de recouvrement de 40 euros.

TVA non applicable, article 293 B du Code Général des Impôts.

Dispensé d'immatriculation en application de l'article L. 123-1-1 du Code de commerce.`,
  },

  'societe-standard': {
    id: 'societe-standard',
    name: 'Société (SARL, SAS, SASU, EURL)',
    description: 'Pour sociétés soumises à TVA avec immatriculation RCS',
    applicableFor: ['SARL', 'SAS', 'SASU', 'EURL', 'SA'],
    sections: {
      penalites: {
        tauxInteret: 'trois fois le taux d\'intérêt légal',
        indemniteForfaitaire: '40 euros',
        coutRecouvrement: true,
      },
      escompte: {
        enabled: true,
        taux: '2%',
        delai: '8 jours',
      },
      tva: {
        regime: 'normal',
      },
      rcs: {
        enabled: true,
        mention: 'Inscrite au RCS de',
      },
      capital: {
        enabled: true,
      },
      assurance: {
        enabled: false,
      },
    },
    template: `En cas de retard de paiement, seront exigibles, conformément à l'article L. 441-6 du Code de commerce, une indemnité calculée sur la base de trois fois le taux d'intérêt légal ainsi qu'une indemnité forfaitaire pour frais de recouvrement de 40 euros.

Escompte pour règlement anticipé : 2% à 8 jours.

Les réglements reçus avant la date d'échéance et mentionnant « Escompte déduit » bénéficieront d'une réduction de 2%.`,
  },

  'profession-liberale': {
    id: 'profession-liberale',
    name: 'Profession libérale',
    description: 'Pour professions libérales avec assurance professionnelle',
    applicableFor: ['Profession libérale', 'Consultant', 'Expert'],
    sections: {
      penalites: {
        tauxInteret: 'trois fois le taux d\'intérêt légal',
        indemniteForfaitaire: '40 euros',
        coutRecouvrement: true,
      },
      escompte: {
        enabled: false,
      },
      tva: {
        regime: 'normal',
      },
      rcs: {
        enabled: false,
      },
      capital: {
        enabled: false,
      },
      assurance: {
        enabled: true,
      },
    },
    template: `En cas de retard de paiement, seront exigibles, conformément à l'article L. 441-6 du Code de commerce, une indemnité calculée sur la base de trois fois le taux d'intérêt légal ainsi qu'une indemnité forfaitaire pour frais de recouvrement de 40 euros.

Assurance Responsabilité Civile Professionnelle souscrite auprès de [Nom de l'assurance].`,
  },

  'prestataire-international': {
    id: 'prestataire-international',
    name: 'Prestataire de services international (Autoliquidation)',
    description: 'Pour prestations B2B intracommunautaires avec autoliquidation de la TVA',
    applicableFor: ['Prestataire international', 'B2B intracommunautaire'],
    sections: {
      penalites: {
        tauxInteret: 'trois fois le taux d\'intérêt légal',
        indemniteForfaitaire: '40 euros',
        coutRecouvrement: true,
      },
      escompte: {
        enabled: false,
      },
      tva: {
        regime: 'autoliquidation',
        mention: 'Autoliquidation de la TVA par le preneur - Article 283-2 du CGI',
      },
      rcs: {
        enabled: true,
        mention: 'Inscrite au RCS de',
      },
      capital: {
        enabled: true,
      },
      assurance: {
        enabled: false,
      },
    },
    template: `En cas de retard de paiement, seront exigibles, conformément à l'article L. 441-6 du Code de commerce, une indemnité calculée sur la base de trois fois le taux d'intérêt légal ainsi qu'une indemnité forfaitaire pour frais de recouvrement de 40 euros.

TVA non applicable - Autoliquidation par le preneur conformément à l'article 283-2 du Code Général des Impôts.`,
  },

  'societe-complete': {
    id: 'societe-complete',
    name: 'Société (Mentions complètes)',
    description: 'Toutes les mentions légales obligatoires pour une société',
    applicableFor: ['SARL', 'SAS', 'SASU', 'EURL', 'SA'],
    sections: {
      penalites: {
        tauxInteret: 'trois fois le taux d\'intérêt légal',
        indemniteForfaitaire: '40 euros',
        coutRecouvrement: true,
      },
      escompte: {
        enabled: true,
        taux: '2%',
        delai: '8 jours',
      },
      tva: {
        regime: 'normal',
      },
      rcs: {
        enabled: true,
        mention: 'Inscrite au RCS de',
      },
      capital: {
        enabled: true,
      },
      assurance: {
        enabled: true,
      },
    },
    template: `PÉNALITÉS DE RETARD
En cas de retard de paiement, seront exigibles, conformément à l'article L. 441-6 du Code de commerce, une indemnité calculée sur la base de trois fois le taux d'intérêt légal ainsi qu'une indemnité forfaitaire pour frais de recouvrement de 40 euros. Si les frais de recouvrement exposés sont supérieurs au montant de cette indemnité forfaitaire, une indemnité complémentaire peut être demandée.

ESCOMPTE
Escompte pour règlement anticipé : 2% à 8 jours. Les réglements reçus avant la date d'échéance et mentionnant « Escompte déduit » bénéficieront d'une réduction de 2%.

CONDITIONS GÉNÉRALES
Nos conditions générales de vente sont disponibles sur simple demande. Elles font partie intégrante du présent contrat et sont réputées acceptées par le fait de ne pas avoir formulé de réserves au plus tard dans un délai de 8 jours suivant la réception de la présente facture.`,
  },

  'personnalise': {
    id: 'personnalise',
    name: 'Mentions personnalisées',
    description: 'Créez vos propres mentions légales',
    applicableFor: ['Tous types'],
    sections: {
      penalites: {
        tauxInteret: 'trois fois le taux d\'intérêt légal',
        indemniteForfaitaire: '40 euros',
        coutRecouvrement: true,
      },
      escompte: {
        enabled: false,
      },
      tva: {
        regime: 'normal',
      },
      rcs: {
        enabled: false,
      },
      capital: {
        enabled: false,
      },
      assurance: {
        enabled: false,
      },
    },
    template: `[Personnalisez vos mentions légales ici]

En cas de retard de paiement, seront exigibles, conformément à l'article L. 441-6 du Code de commerce, une indemnité calculée sur la base de trois fois le taux d'intérêt légal ainsi qu'une indemnité forfaitaire pour frais de recouvrement de 40 euros.`,
  },
};

/**
 * Liste des mentions légales disponibles
 */
export const LEGAL_MENTIONS_LIST = Object.values(LEGAL_MENTIONS_PRESETS);

/**
 * Mention légale par défaut
 */
export const DEFAULT_LEGAL_MENTIONS = LEGAL_MENTIONS_PRESETS['societe-standard'];

/**
 * Détermine le preset de mentions légales approprié selon la forme juridique
 */
export function getLegalMentionsPresetByLegalForm(legalForm: string | undefined): string {
  if (!legalForm) return 'societe-standard';
  
  const form = legalForm.toUpperCase().trim();
  
  // Micro-entrepreneur / Auto-entrepreneur
  if (form.includes('MICRO') || form.includes('AUTO-ENTREPRENEUR') || form === 'EI') {
    return 'micro-entreprise';
  }
  
  // Professions libérales
  if (form.includes('LIBERAL') || form === 'BNC') {
    return 'profession-liberale';
  }
  
  // Associations
  if (form.includes('ASSOCIATION') || form === 'ASSO') {
    return 'association';
  }
  
  // Sociétés (SARL, SAS, SASU, EURL, SA, etc.)
  if (form.match(/SARL|SAS|SASU|EURL|SA|SNC|SCS/)) {
    return 'societe-standard';
  }
  
  // Par défaut : société standard
  return 'societe-standard';
}

/**
 * Génère le texte des mentions légales à partir de la configuration
 */
export function generateLegalMentionsText(config: LegalMentionsConfig, userData?: any): string {
  let text = config.template;

  // Remplacer les variables dynamiques si userData fourni
  if (userData) {
    if (config.sections.rcs?.enabled && userData.rcsCity) {
      text = text.replace('[Ville]', userData.rcsCity);
    }
    if (config.sections.capital?.enabled && userData.capital) {
      text = text.replace('[Capital]', `Capital social : ${userData.capital} €`);
    }
    if (config.sections.assurance?.enabled && userData.insurance) {
      text = text.replace('[Nom de l\'assurance]', userData.insurance);
    }
  }

  return text;
}

/**
 * Informations obligatoires selon l'article L441-3 du Code de commerce
 */
export const MANDATORY_INVOICE_INFO = {
  identite: [
    'Dénomination sociale ou nom et prénom',
    'Adresse complète',
    'SIRET',
    'Numéro TVA intracommunautaire (si assujetti)',
    'Forme juridique et capital social (pour les sociétés)',
    'RCS et ville d\'immatriculation (pour les sociétés)',
  ],
  facturation: [
    'Numéro de facture unique et séquentiel',
    'Date d\'émission',
    'Date de vente ou de prestation de service',
    'Identité complète du client',
    'Numéro de commande (si applicable)',
  ],
  contenu: [
    'Dénomination précise des produits/services',
    'Quantité',
    'Prix unitaire HT',
    'Taux de TVA applicable',
    'Montant de la TVA',
    'Prix total TTC',
  ],
  conditions: [
    'Date limite de paiement',
    'Conditions d\'escompte (si applicable)',
    'Taux des pénalités de retard (minimum 3x taux légal)',
    'Indemnité forfaitaire de recouvrement (40€)',
  ],
};
