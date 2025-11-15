import { z } from 'zod';

/**
 * 📧 Validations pour l'envoi d'emails (factures/devis)
 */

// Validation email simple
const emailSchema = z.string()
  .email('Adresse email invalide')
  .trim()
  .toLowerCase();

// Validation liste d'emails séparés par virgule
const emailListSchema = z.string()
  .trim()
  .optional()
  .transform((val) => {
    if (!val) return undefined;
    // Split par virgule, nettoyer et valider chaque email
    const emails = val.split(',').map(e => e.trim()).filter(Boolean);
    return emails.length > 0 ? emails : undefined;
  })
  .pipe(
    z.array(emailSchema).optional()
  );

// Schema pour envoi d'email (facture ou devis)
export const sendEmailSchema = z.object({
  to: emailSchema,
  
  cc: z.string()
    .optional()
    .transform((val) => {
      if (!val || val.trim() === '') return undefined;
      return val;
    })
    .pipe(emailListSchema.optional()),
  
  subject: z.string()
    .min(1, 'Le sujet est requis')
    .max(200, 'Le sujet ne peut pas dépasser 200 caractères')
    .trim(),
  
  message: z.string()
    .min(10, 'Le message doit contenir au moins 10 caractères')
    .max(5000, 'Le message ne peut pas dépasser 5000 caractères')
    .trim(),
  
  attachPdf: z.boolean().default(true),
});

// Schema simplifié pour SendEmailModal (email uniquement)
export const simpleEmailSchema = z.object({
  recipientEmail: emailSchema,
});

// Type exports
export type SendEmailFormData = z.infer<typeof sendEmailSchema>;
export type SimpleEmailFormData = z.infer<typeof simpleEmailSchema>;

// Schema pour prévisualisation email
export const emailPreviewSchema = z.object({
  template: z.enum(['invoice', 'quote', 'reminder', 'thank_you']),
  data: z.any(), // Les données du template (invoice/quote)
});

export type SendEmailInput = z.infer<typeof sendEmailSchema>;
export type EmailPreviewInput = z.infer<typeof emailPreviewSchema>;
