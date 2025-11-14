import { z } from 'zod';

// ==================== COMMON SCHEMAS ====================

// Schema pour les items (utilisé par invoices et quotes)
export const itemSchema = z.object({
  description: z.string().min(1, 'Description requise'),
  quantity: z.number().min(0.001, 'Quantité doit être positive'),
  unitPrice: z.number().min(0, 'Prix doit être positif'),
  taxRate: z.number().min(0).max(100, 'Taux de TVA invalide'),
  unit: z.enum(['unit', 'hour', 'day', 'month', 'kg']).default('unit'),
});

// Type exports
export type ItemFormData = z.infer<typeof itemSchema>;
