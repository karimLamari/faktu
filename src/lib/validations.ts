import { z } from 'zod';

// Schema minimal pour l'inscription (UX simplifiée)
export const userSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
  firstName: z.string().min(1, 'Prénom requis'),
  lastName: z.string().min(1, 'Nom requis'),
  // Tous les champs ci-dessous sont optionnels et seront remplis plus tard dans les paramètres
  companyName: z.string().min(1, 'Raison sociale requise').optional(),
  legalForm: z.enum(['SARL', 'EURL', 'SASU', 'Auto-entrepreneur', 'Profession libérale']).optional(),
  siret: z.string().regex(/^\d{14}$/).optional(),
  address: z.object({
    street: z.string().min(1, 'Adresse requise'),
    city: z.string().min(1, 'Ville requise'),
    zipCode: z.string().regex(/^\d{5}$/, 'Code postal invalide'),
    country: z.string().default('France'),
  }).optional(),
  phone: z.string().regex(/^\+?[\d\s\-()]+$/).optional(),
  logo: z.string().optional(),
  defaultCurrency: z.enum(['EUR', 'USD', 'GBP']).default('EUR'),
  defaultTaxRate: z.number().min(0).max(100).default(20),
  iban: z.string().min(10).max(34).optional(),
  invoiceNumbering: z.object({
    prefix: z.string().max(10).default('FAC'),
    nextNumber: z.number().min(1).default(1),
    year: z.number().default(new Date().getFullYear()),
  }).optional(),
});

// Schema complet pour la mise à jour du profil dans les paramètres
export const userProfileUpdateSchema = z.object({
  // Informations personnelles (optionnelles)
  firstName: z.string().min(1, 'Prénom requis').optional(),
  lastName: z.string().min(1, 'Nom requis').optional(),
  
  // Informations entreprise (OBLIGATOIRES pour génération PDF/Email)
  companyName: z.string().min(1, 'Raison sociale requise'),
  legalForm: z.enum(['SARL', 'EURL', 'SASU', 'Auto-entrepreneur', 'Profession libérale']),
  address: z.object({
    street: z.string().min(1, 'Adresse requise'),
    city: z.string().min(1, 'Ville requise'),
    zipCode: z.string().regex(/^\d{5}$/, 'Code postal invalide (5 chiffres)'),
    country: z.string().min(1, 'Pays requis').default('France'),
  }),
  
  // Informations optionnelles
  siret: z.string().regex(/^\d{14}$/, 'SIRET doit contenir 14 chiffres').optional(),
  phone: z.string().regex(/^\+?[\d\s\-()]+$/, 'Numéro de téléphone invalide').optional(),
  logo: z.string().optional(),
  defaultCurrency: z.enum(['EUR', 'USD', 'GBP']).optional(),
  defaultTaxRate: z.number().min(0).max(100).optional(),
  iban: z.string().min(10).max(34).optional(),
  
  // Informations légales (optionnelles)
  rcsCity: z.string().min(1).optional(),
  capital: z.number().min(0).optional(),
  tvaNumber: z.string().regex(/^[A-Z]{2}\d{11}$/, 'Format TVA invalide (ex: FR12345678901)').optional().or(z.literal('')),
  
  // Assurance RC Pro (optionnelle)
  insuranceCompany: z.string().min(1).optional(),
  insurancePolicy: z.string().min(1).optional(),
  
  // Coordonnées bancaires détaillées (optionnelles)
  bankName: z.string().optional(),
  bic: z.string().regex(/^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/, 'Format BIC invalide').optional().or(z.literal('')),
  bankCode: z.string().regex(/^\d{5}$/, 'Code banque invalide (5 chiffres)').optional().or(z.literal('')),
  branchCode: z.string().regex(/^\d{5}$/, 'Code guichet invalide (5 chiffres)').optional().or(z.literal('')),
  
  invoiceNumbering: z.object({
    prefix: z.string().max(10),
    nextNumber: z.number().min(1),
    year: z.number(),
  }).optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(1, 'Le mot de passe est requis'),
});

// Schema de base sans transform (pour PATCH/updates)
export const clientSchemaBase = z
  .object({
    type: z.enum(['individual', 'business']).default('business'),
    name: z.string().optional(), // Généré automatiquement selon le type
    companyInfo: z
      .object({
        legalName: z.string().optional(),
        siret: z.string().optional(),
      })
      .optional(),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    email: z.string().email('Email invalide').optional(),
    phone: z.string().min(10, 'Numéro de téléphone invalide').optional(),
    address: z
      .object({
        street: z.string().min(5, 'Adresse trop courte').optional(),
        city: z.string().min(2, 'Ville requise').optional(),
        zipCode: z.string().min(5, 'Code postal invalide').optional(),
        country: z.string().min(2, 'Pays requis').optional(),
      })
      .optional(),
    paymentTerms: z.number().min(1).max(365).optional(),
    notes: z.string().optional(),
    isActive: z.boolean().optional(),
  })
  .superRefine((val, ctx) => {
    // Si business, legalName et siret sont requis
    if (val.type === 'business') {
      if (!val.companyInfo || !val.companyInfo.legalName || val.companyInfo.legalName.trim() === '') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['companyInfo', 'legalName'],
          message: 'Raison sociale requise pour les entreprises',
        });
      }
      if (!val.companyInfo || !val.companyInfo.siret || !/^[0-9]{14}$/.test(val.companyInfo.siret)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['companyInfo', 'siret'],
          message: 'SIRET requis et doit comporter 14 chiffres pour les entreprises',
        });
      }
    }
    
    // Si particulier, firstName et lastName sont requis
    if (val.type === 'individual') {
      if (!val.firstName || val.firstName.trim() === '') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['firstName'],
          message: 'Prénom requis pour les particuliers',
        });
      }
      if (!val.lastName || val.lastName.trim() === '') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['lastName'],
          message: 'Nom de famille requis pour les particuliers',
        });
      }
    }
  });

// Schema complet avec transform (pour POST/create)
export const clientSchema = clientSchemaBase.transform((val) => {
  // Générer automatiquement le champ 'name' selon le type
  if (val.type === 'individual' && val.firstName && val.lastName) {
    return { ...val, name: `${val.firstName} ${val.lastName}` };
  } else if (val.type === 'business' && val.companyInfo?.legalName) {
    return { ...val, name: val.companyInfo.legalName };
  }
  return val;
});

// Schema pour les updates partiels (PATCH)
export const clientUpdateSchema = clientSchemaBase.partial();


export const invoiceItemSchema = z.object({
  description: z.string().min(1, 'Description requise'),
  quantity: z.number().min(0.001, 'Quantité doit être positive'),
  unitPrice: z.number().min(0, 'Prix doit être positif'),
  taxRate: z.number().min(0).max(100, 'Taux de TVA invalide'),
  unit: z.enum(['unit', 'hour', 'day', 'month', 'kg']).default('unit'),
});


export const invoiceSchema = z.object({
  clientId: z.string().min(1, 'Client requis'),
  items: z.array(invoiceItemSchema).min(1, 'Au moins un article requis'),
  issueDate: z.union([z.string(), z.date()]),
  dueDate: z.union([z.string(), z.date()]),
  status: z.enum(['draft', 'sent', 'paid', 'overdue', 'cancelled', 'partially_paid']).optional(),
  subtotal: z.number().min(0).default(0),
  taxAmount: z.number().min(0).default(0),
  total: z.number().min(0).default(0),
  amountPaid: z.number().min(0).optional(),
  balanceDue: z.number().min(0).optional(),
  paymentMethod: z.enum(['bank_transfer', 'check', 'cash', 'card', 'online', 'other']).optional(),
  paymentStatus: z.enum(['pending', 'paid', 'partially_paid', 'overdue', 'cancelled']).optional(),
  notes: z.string().optional(),
  privateNotes: z.string().optional(),
  terms: z.string().optional(),
  pdfUrl: z.string().optional(),
  pdfGeneratedAt: z.union([z.string(), z.date()]).optional(),
});

// ==================== QUOTE SCHEMAS ====================

export const quoteItemSchema = z.object({
  description: z.string().min(1, 'Description requise'),
  quantity: z.number().min(0.001, 'Quantité doit être positive'),
  unitPrice: z.number().min(0, 'Prix doit être positif'),
  taxRate: z.number().min(0).max(100, 'Taux de TVA invalide'),
  unit: z.enum(['unit', 'hour', 'day', 'month', 'kg']).default('unit'),
});

export const quoteSchema = z.object({
  clientId: z.string().min(1, 'Client requis'),
  items: z.array(quoteItemSchema).min(1, 'Au moins un article requis'),
  issueDate: z.union([z.string(), z.date()]),
  validUntil: z.union([z.string(), z.date()]),
  status: z.enum(['draft', 'sent', 'accepted', 'rejected', 'expired', 'converted']).optional(),
  subtotal: z.number().min(0).default(0),
  taxAmount: z.number().min(0).default(0),
  total: z.number().min(0).default(0),
  notes: z.string().optional(),
  privateNotes: z.string().optional(),
  terms: z.string().optional(),
  pdfUrl: z.string().optional(),
  pdfGeneratedAt: z.union([z.string(), z.date()]).optional(),
});

export const convertQuoteSchema = z.object({
  issueDate: z.union([z.string(), z.date()]).optional(),
  dueDate: z.union([z.string(), z.date()]).optional(),
});

export type UserFormData = z.infer<typeof userSchema>;
export type LoginFormData = z.infer<typeof loginSchema>;
export type ClientFormData = z.infer<typeof clientSchema>;
export type InvoiceFormData = z.infer<typeof invoiceSchema>;
export type InvoiceItemFormData = z.infer<typeof invoiceItemSchema>;
export type QuoteFormData = z.infer<typeof quoteSchema>;
export type QuoteItemFormData = z.infer<typeof quoteItemSchema>;
export type ConvertQuoteFormData = z.infer<typeof convertQuoteSchema>;
