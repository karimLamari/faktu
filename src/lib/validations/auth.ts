import { z } from 'zod';

// ==================== AUTH SCHEMAS ====================

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

// Type exports
export type UserFormData = z.infer<typeof userSchema>;
export type LoginFormData = z.infer<typeof loginSchema>;
