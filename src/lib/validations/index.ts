/**
 * 📋 Validations centralisées
 * 
 * Ce fichier réexporte tous les schemas de validation Zod
 * pour un import simplifié dans toute l'application.
 * 
 * Usage:
 * ```typescript
 * import { userSchema, invoiceSchema, clientSchema } from '@/lib/validations';
 * ```
 * 
 * Organisation:
 * - auth.ts: Schemas d'authentification et utilisateur
 * - clients.ts: Schemas pour les clients
 * - invoices.ts: Schemas pour les factures
 * - quotes.ts: Schemas pour les devis
 * - common.ts: Schemas partagés (items, etc.)
 */

// Auth schemas
export {
  userSchema,
  userProfileUpdateSchema,
  loginSchema,
  type UserFormData,
  type LoginFormData,
} from './auth';

// Client schemas
export {
  clientSchema,
  clientSchemaBase,
  clientUpdateSchema,
  type ClientFormData,
} from './clients';

// Invoice schemas
export {
  invoiceSchema,
  invoiceItemSchema,
  type InvoiceFormData,
  type InvoiceItemFormData,
} from './invoices';

// Quote schemas
export {
  quoteSchema,
  quoteItemSchema,
  convertQuoteSchema,
  type QuoteFormData,
  type QuoteItemFormData,
  type ConvertQuoteFormData,
} from './quotes';

// Common schemas
export {
  itemSchema,
  type ItemFormData,
} from './common';
