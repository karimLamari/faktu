import { z } from 'zod';

export const userSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
  firstName: z.string().min(1, 'Prénom requis'),
  lastName: z.string().min(1, 'Nom requis'),
  companyName: z.string().min(1, 'Raison sociale requise'),
  legalForm: z.enum(['SARL', 'EURL', 'SASU', 'Auto-entrepreneur', 'Profession libérale']),
  siret: z.string().regex(/^\d{14}$/).optional(),
  address: z.object({
    street: z.string().min(1, 'Adresse requise'),
    city: z.string().min(1, 'Ville requise'),
    zipCode: z.string().regex(/^\d{5}$/, 'Code postal invalide'),
    country: z.string().default('France'),
  }),
  phone: z.string().regex(/^\+?[\d\s\-()]+$/).optional(),
  logo: z.string().optional(),
  defaultCurrency: z.enum(['EUR', 'USD', 'GBP']).default('EUR'),
  defaultTaxRate: z.number().min(0).max(100).default(20),
  iban: z.string().min(10, 'IBAN requis').max(34, 'IBAN trop long').optional(),
  invoiceNumbering: z.object({
    prefix: z.string().max(10).default('FAC'),
    nextNumber: z.number().min(1).default(1),
    year: z.number().default(new Date().getFullYear()),
  }).optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(1, 'Le mot de passe est requis'),
});

export const clientSchema = z
  .object({
    type: z.enum(['individual', 'business']).default('business'),
    name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
    companyInfo: z
      .object({
        legalName: z.string().optional(),
        siret: z.string().regex(/^[0-9]{14}$/).optional(),
        vatNumber: z.string().optional(),
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
    // If business, require companyInfo.legalName
    if (val.type === 'business') {
      if (!val.companyInfo || !val.companyInfo.legalName || val.companyInfo.legalName.trim() === '') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['companyInfo', 'legalName'],
          message: 'Raison sociale requise pour les entreprises',
        });
      }
    }
  });


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

export type UserFormData = z.infer<typeof userSchema>;
export type LoginFormData = z.infer<typeof loginSchema>;
export type ClientFormData = z.infer<typeof clientSchema>;
export type InvoiceFormData = z.infer<typeof invoiceSchema>;
export type InvoiceItemFormData = z.infer<typeof invoiceItemSchema>;