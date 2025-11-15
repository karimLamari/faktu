/**
 * 📋 AUDIT COMPLET : FORMULAIRES → MODÈLES → SCHÉMAS ZOD
 * 
 * Ce fichier documente TOUS les formulaires de l'application,
 * leurs champs, et vérifie la cohérence avec modèles Mongoose et validation Zod.
 */

export interface FormAudit {
  name: string;
  component: string;
  fields: FormField[];
  model: string;
  zodSchema: string;
  issues: string[];
  hasClientValidation: boolean;
}

export interface FormField {
  name: string;
  type: string;
  required: boolean;
  validation?: string;
}

export const FORMS_AUDIT: FormAudit[] = [
  
  // ========================================
  // 1. CLIENTS
  // ========================================
  {
    name: 'Client Form',
    component: 'src/components/clients/ClientForm.tsx',
    model: 'src/models/Client.ts',
    zodSchema: 'src/lib/validations/clients.ts',
    hasClientValidation: false,
    fields: [
      { name: 'type', type: 'select', required: true, validation: 'enum: business|individual' },
      { name: 'name', type: 'text', required: false, validation: 'only for business as contact name' },
      { name: 'firstName', type: 'text', required: true, validation: 'only for individual' },
      { name: 'lastName', type: 'text', required: true, validation: 'only for individual' },
      { name: 'email', type: 'email', required: true },
      { name: 'phone', type: 'tel', required: false },
      { name: 'address', type: 'text', required: false },
      { name: 'postalCode', type: 'text', required: false },
      { name: 'city', type: 'text', required: false },
      { name: 'country', type: 'text', required: false },
      { name: 'companyName', type: 'text', required: false, validation: 'required for business' },
      { name: 'siret', type: 'text', required: false, validation: 'required for business (14 digits)' },
      { name: 'vatNumber', type: 'text', required: false },
      { name: 'notes', type: 'textarea', required: false },
    ],
    issues: [
      '❌ Aucune validation Zod côté client avant submit',
      '⚠️ Logique conditionnelle (business vs individual) non validée par Zod',
      '⚠️ Format SIRET (14 chiffres) non vérifié avant envoi',
      '⚠️ Format email non vérifié côté client',
    ]
  },

  // ========================================
  // 2. PROFIL UTILISATEUR
  // ========================================
  {
    name: 'Profile Form',
    component: 'src/components/profile/ProfileForm.tsx',
    model: 'src/models/User.ts',
    zodSchema: 'src/lib/validations/auth.ts (userProfileUpdateSchema)',
    hasClientValidation: false,
    fields: [
      { name: 'firstName', type: 'text', required: false },
      { name: 'lastName', type: 'text', required: false },
      { name: 'phone', type: 'tel', required: false },
      { name: 'email', type: 'email', required: true, validation: 'disabled (readonly)' },
      { name: 'companyName', type: 'text', required: true },
      { name: 'siret', type: 'text', required: true, validation: '14 digits' },
      { name: 'vatNumber', type: 'text', required: false },
      { name: 'address', type: 'text', required: true },
      { name: 'postalCode', type: 'text', required: true },
      { name: 'city', type: 'text', required: true },
      { name: 'country', type: 'text', required: false },
      { name: 'capital', type: 'number', required: false },
      { name: 'legalForm', type: 'select', required: false, validation: 'enum: SARL|SAS|EURL|etc.' },
      { name: 'iban', type: 'text', required: false },
      { name: 'bic', type: 'text', required: false },
      { name: 'bankName', type: 'text', required: false },
      { name: 'logo', type: 'file', required: false, validation: 'image only' },
    ],
    issues: [
      '❌ Aucune validation Zod côté client',
      '⚠️ SIRET 14 chiffres non validé en temps réel',
      '⚠️ IBAN format non vérifié',
      '⚠️ Champs requis (*) mais validation seulement côté serveur',
      '⚠️ Upload logo sans preview ou validation taille/type',
    ]
  },

  // ========================================
  // 3. SERVICES/PRESTATIONS
  // ========================================
  {
    name: 'Service Form',
    component: 'src/components/services/ServiceFormModal.tsx',
    model: 'src/models/Service.ts',
    zodSchema: '❌ MANQUANT - Pas de schéma Zod pour services',
    hasClientValidation: false,
    fields: [
      { name: 'name', type: 'text', required: true },
      { name: 'description', type: 'textarea', required: false },
      { name: 'unitPrice', type: 'number', required: true, validation: 'min: 0' },
      { name: 'taxRate', type: 'number', required: true, validation: 'default: 20' },
      { name: 'category', type: 'text', required: false },
      { name: 'isActive', type: 'boolean', required: true, validation: 'default: true' },
    ],
    issues: [
      '❌ PAS DE SCHÉMA ZOD - validation inline dans route API',
      '❌ Aucune validation côté client',
      '⚠️ unitPrice peut être négatif (pas de min validation)',
      '⚠️ taxRate non borné (peut être >100 ou négatif)',
      '⚠️ category en texte libre (devrait être enum)',
    ]
  },

  // ========================================
  // 4. EXPENSES/DÉPENSES
  // ========================================
  {
    name: 'Expense Form',
    component: 'src/components/expenses/ExpenseFormModal.tsx',
    model: 'src/models/Expense.ts',
    zodSchema: 'src/lib/validations/expenses.ts ✅ (CRÉÉ RÉCEMMENT)',
    hasClientValidation: false,
    fields: [
      { name: 'vendor', type: 'text', required: true },
      { name: 'amount', type: 'number', required: true, validation: 'min: 0' },
      { name: 'taxAmount', type: 'number', required: true, validation: 'min: 0, default: 0' },
      { name: 'date', type: 'date', required: true },
      { name: 'category', type: 'select', required: true, validation: 'enum: 12 categories' },
      { name: 'description', type: 'textarea', required: false },
      { name: 'invoiceNumber', type: 'text', required: false },
      { name: 'paymentMethod', type: 'select', required: false, validation: 'enum: 5 methods, default: Carte bancaire' },
      { name: 'receiptImage', type: 'file', required: true, validation: 'image only' },
    ],
    issues: [
      '✅ Schéma Zod existe et corrigé (paymentMethod empty string → undefined)',
      '❌ Validation Zod non utilisée côté client avant submit',
      '⚠️ Image preview sans validation temps réel de taille/type',
      '⚠️ OCR parsing mais pas de feedback si échec de validation',
    ]
  },

  // ========================================
  // 5. INVOICES/FACTURES
  // ========================================
  {
    name: 'Invoice Form',
    component: 'src/components/invoices/InvoiceFormModal.tsx',
    model: 'src/models/Invoice.ts',
    zodSchema: 'src/lib/validations/invoices.ts',
    hasClientValidation: false,
    fields: [
      { name: 'clientId', type: 'select', required: true },
      { name: 'items', type: 'array', required: true, validation: 'min 1 item' },
      { name: 'items[].description', type: 'text', required: true },
      { name: 'items[].quantity', type: 'number', required: true, validation: 'min: 1' },
      { name: 'items[].unitPrice', type: 'number', required: true, validation: 'min: 0' },
      { name: 'items[].taxRate', type: 'number', required: true, validation: 'default: 20' },
      { name: 'items[].unit', type: 'select', required: false, validation: 'enum: unit|hour|day|month|kg' },
      { name: 'issueDate', type: 'date', required: true },
      { name: 'dueDate', type: 'date', required: true },
      { name: 'status', type: 'select', required: true, validation: 'enum: draft|sent|paid|cancelled' },
      { name: 'paymentMethod', type: 'select', required: false, validation: 'enum: bank_transfer|check|cash|card|online|other' },
      { name: 'notes', type: 'textarea', required: false },
      { name: 'discount', type: 'number', required: false, validation: 'min: 0' },
    ],
    issues: [
      '✅ Schéma Zod existe (invoices.ts)',
      '❌ Validation Zod non utilisée côté client',
      '⚠️ Pas de validation que dueDate > issueDate',
      '⚠️ Items array peut être vide (crash serveur)',
      '⚠️ Total calculé côté client sans validation cohérence',
    ]
  },

  // ========================================
  // 6. QUOTES/DEVIS
  // ========================================
  {
    name: 'Quote Form',
    component: 'src/components/quotes/QuoteFormModal.tsx',
    model: 'src/models/Quote.ts',
    zodSchema: 'src/lib/validations/quotes.ts',
    hasClientValidation: false,
    fields: [
      { name: 'clientId', type: 'select', required: true },
      { name: 'items', type: 'array', required: true, validation: 'min 1 item' },
      { name: 'items[].description', type: 'text', required: true },
      { name: 'items[].quantity', type: 'number', required: true, validation: 'min: 1' },
      { name: 'items[].unitPrice', type: 'number', required: true, validation: 'min: 0' },
      { name: 'items[].taxRate', type: 'number', required: true, validation: 'default: 20' },
      { name: 'items[].unit', type: 'select', required: false, validation: 'enum: unit|hour|day|month|kg' },
      { name: 'issueDate', type: 'date', required: true },
      { name: 'validityDate', type: 'date', required: true },
      { name: 'status', type: 'select', required: true, validation: 'enum: draft|sent|accepted|rejected' },
      { name: 'notes', type: 'textarea', required: false },
      { name: 'discount', type: 'number', required: false, validation: 'min: 0' },
    ],
    issues: [
      '✅ Schéma Zod existe (quotes.ts)',
      '❌ Validation Zod non utilisée côté client',
      '⚠️ Pas de validation que validityDate > issueDate',
      '⚠️ Items array peut être vide',
      '⚠️ Structure identique à Invoice mais pas de schéma partagé',
    ]
  },

  // ========================================
  // 7. CONVERT QUOTE TO INVOICE
  // ========================================
  {
    name: 'Convert Quote Modal',
    component: 'src/components/quotes/ConvertQuoteModal.tsx',
    model: 'Quote → Invoice',
    zodSchema: 'src/lib/validations/quotes.ts (convertQuoteSchema)',
    hasClientValidation: false,
    fields: [
      { name: 'issueDate', type: 'date', required: true },
      { name: 'dueDate', type: 'date', required: true },
      { name: 'paymentMethod', type: 'select', required: false },
    ],
    issues: [
      '✅ Schéma Zod existe (convertQuoteSchema)',
      '❌ Validation Zod non utilisée côté client',
      '⚠️ Pas de validation dueDate > issueDate',
    ]
  },

  // ========================================
  // 8. EMAIL SENDING
  // ========================================
  {
    name: 'Send Email Modal (Invoice/Quote)',
    component: 'src/components/invoices/EmailModals.tsx + quotes/SendQuoteEmailModal.tsx',
    model: 'N/A (API call)',
    zodSchema: '❌ MANQUANT - Pas de schéma Zod pour emails',
    hasClientValidation: false,
    fields: [
      { name: 'to', type: 'email', required: true },
      { name: 'cc', type: 'email', required: false },
      { name: 'subject', type: 'text', required: true },
      { name: 'message', type: 'textarea', required: true },
    ],
    issues: [
      '❌ PAS DE SCHÉMA ZOD',
      '❌ Aucune validation email format côté client',
      '⚠️ CC field non validé (peut contenir emails invalides)',
      '⚠️ Message peut être vide malgré required',
    ]
  },

  // ========================================
  // 9. CONTRACT UPLOAD
  // ========================================
  {
    name: 'Contract Upload Form',
    component: 'src/components/clients/ContractManager.tsx',
    model: 'File storage (pas de modèle Mongoose)',
    zodSchema: '❌ MANQUANT',
    hasClientValidation: false,
    fields: [
      { name: 'file', type: 'file', required: true, validation: 'PDF only' },
      { name: 'title', type: 'text', required: false },
    ],
    issues: [
      '❌ PAS DE VALIDATION',
      '⚠️ Type de fichier vérifié seulement côté serveur',
      '⚠️ Taille max non affichée',
    ]
  },

  // ========================================
  // 10. PROFILE WIZARD (ONBOARDING)
  // ========================================
  {
    name: 'Profile Wizard',
    component: 'src/components/profile/ProfileWizard.tsx',
    model: 'src/models/User.ts',
    zodSchema: 'src/lib/validations/auth.ts',
    hasClientValidation: false,
    fields: [
      // Même champs que ProfileForm mais avec steps
      { name: 'step1', type: 'group', required: true, validation: 'Personal info' },
      { name: 'step2', type: 'group', required: true, validation: 'Company info' },
      { name: 'step3', type: 'group', required: true, validation: 'Banking info' },
    ],
    issues: [
      '❌ Aucune validation Zod entre les steps',
      '⚠️ Peut passer au step suivant avec données invalides',
      '⚠️ Pas de résumé final avant submit',
    ]
  },

];

// ========================================
// RÉSUMÉ DES PROBLÈMES GLOBAUX
// ========================================

export const GLOBAL_ISSUES = {
  missingZodSchemas: [
    'Services (ServiceFormModal)',
    'Email sending (EmailModals)',
    'Contract upload',
  ],
  noClientValidation: [
    'TOUS les formulaires n\'ont aucune validation Zod côté client',
    'Validation seulement au submit → mauvaise UX',
    'Pas de feedback temps réel sur erreurs',
  ],
  inconsistencies: [
    'paymentMethod: enum différent entre Invoice (bank_transfer) et Expense (Carte bancaire)',
    'category: texte libre dans Service vs enum strict dans Expense',
    'SIRET format: pas de regex validation uniforme',
    'Email format: pas de validation temps réel',
  ],
  securityIssues: [
    'File upload sans validation mime type côté client',
    'Montants négatifs possibles dans plusieurs formulaires',
    'Dates incohérentes (dueDate < issueDate) non bloquées',
  ],
};

// ========================================
// RECOMMANDATIONS
// ========================================

export const RECOMMENDATIONS = [
  '1. Créer hook useZodForm<T>(schema) pour validation temps réel',
  '2. Ajouter schémas Zod manquants (services, emails)',
  '3. Unifier enums entre modèles (paymentMethod, categories)',
  '4. Ajouter validation inline avec messages d\'erreur clairs',
  '5. Bloquer submit si formulaire invalide',
  '6. Ajouter indicateurs visuels (champs verts si valides)',
  '7. Créer composant FormField avec validation intégrée',
  '8. Validation cross-field (dates, totaux)',
  '9. Tests unitaires pour chaque schéma Zod',
  '10. Documentation API avec exemples Zod',
];
