import { z } from 'zod';
import { itemSchema } from './common';

// ==================== INVOICE SCHEMAS ====================

// Réexport du schema item comme invoiceItemSchema pour compatibilité
export const invoiceItemSchema = itemSchema;

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
  notes: z.string().optional(),
  privateNotes: z.string().optional(),
  terms: z.string().optional(),
  pdfUrl: z.string().optional(),
  pdfGeneratedAt: z.union([z.string(), z.date()]).nullable().optional(),
});

// Type exports
export type InvoiceFormData = z.infer<typeof invoiceSchema>;
export type InvoiceItemFormData = z.infer<typeof invoiceItemSchema>;
