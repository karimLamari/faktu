/**
 * Index des services métier
 * Facilite l'import des services depuis un seul point d'entrée
 */

export { quoteService } from './quoteService';
export type { ConvertQuoteData } from './quoteService';

export { clientService } from './clientService';

export { invoiceService } from './invoiceService';
export type { SendInvoiceEmailData, SendReminderData } from './invoiceService';

export { expenseService } from './expenseService';
export type { Expense, UploadExpenseData } from './expenseService';
