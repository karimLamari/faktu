import { z } from 'zod';

// ==================== CLIENT SCHEMAS ====================

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

// Type exports
export type ClientFormData = z.infer<typeof clientSchema>;
