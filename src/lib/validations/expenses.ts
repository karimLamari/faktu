import { z } from 'zod';

// Payment methods matching Mongoose enum
export const paymentMethodEnum = z.enum([
  'Carte bancaire',
  'Espèces',
  'Virement',
  'Chèque',
  'Autre'
]);

// Categories matching Mongoose enum
export const expenseCategoryEnum = z.enum([
  'Restaurant',
  'Transport',
  'Carburant',
  'Fournitures',
  'Logiciel',
  'Matériel',
  'Formation',
  'Téléphone',
  'Internet',
  'Loyer',
  'Assurance',
  'Autre'
]);

// Create expense schema
export const createExpenseSchema = z.object({
  vendor: z.string().min(1, 'Le fournisseur est requis').trim(),
  amount: z.number().min(0, 'Le montant doit être positif'),
  taxAmount: z.number().min(0).default(0),
  date: z.string().or(z.date()),
  category: expenseCategoryEnum,
  description: z.string().trim().optional(),
  invoiceNumber: z.string().trim().optional(),
  paymentMethod: paymentMethodEnum.optional(),
}).transform((data) => {
  // Nettoyer les champs optionnels vides
  const cleaned: any = { ...data };
  
  if (cleaned.description === '') delete cleaned.description;
  if (cleaned.invoiceNumber === '') delete cleaned.invoiceNumber;
  if (!cleaned.paymentMethod || cleaned.paymentMethod === '') delete cleaned.paymentMethod;
  
  return cleaned;
});

// Update expense schema (same but all fields optional)
export const updateExpenseSchema = z.object({
  vendor: z.string().min(1, 'Le fournisseur est requis').trim().optional(),
  amount: z.number().min(0, 'Le montant doit être positif').optional(),
  taxAmount: z.number().min(0).default(0).optional(),
  date: z.string().or(z.date()).optional(),
  category: expenseCategoryEnum.optional(),
  description: z.string().trim().optional(),
  invoiceNumber: z.string().trim().optional(),
  paymentMethod: paymentMethodEnum.optional(),
}).transform((data) => {
  // Nettoyer les champs optionnels vides
  const cleaned: any = { ...data };
  
  if (cleaned.description === '') delete cleaned.description;
  if (cleaned.invoiceNumber === '') delete cleaned.invoiceNumber;
  if (!cleaned.paymentMethod || cleaned.paymentMethod === '') delete cleaned.paymentMethod;
  
  return cleaned;
});

export type CreateExpenseInput = z.infer<typeof createExpenseSchema>;
export type UpdateExpenseInput = z.infer<typeof updateExpenseSchema>;
