import { z } from 'zod';
import { itemSchema } from './common';

// ==================== QUOTE SCHEMAS ====================

// Réexport du schema item comme quoteItemSchema pour compatibilité
export const quoteItemSchema = itemSchema;

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
  issueDate: z.string().min(1, 'Date d\'émission requise'),
  dueDate: z.string().min(1, 'Date d\'échéance requise'),
}).refine(
  (data) => new Date(data.dueDate) >= new Date(data.issueDate),
  {
    message: 'La date d\'échéance doit être après ou égale à la date d\'émission',
    path: ['dueDate'],
  }
);

// Type exports
export type QuoteFormData = z.infer<typeof quoteSchema>;
export type QuoteItemFormData = z.infer<typeof quoteItemSchema>;
export type ConvertQuoteFormData = z.infer<typeof convertQuoteSchema>;
