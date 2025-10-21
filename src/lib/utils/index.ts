/**
 * Formate un montant en euros
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount);
}

/**
 * Formate une date au format français
 */
export function formatDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('fr-FR').format(dateObj);
}

/**
 * Calcule les montants d'une facture
 */
export function calculateInvoiceAmounts(items: Array<{
  quantity: number;
  price: number;
  taxRate: number;
}>, discount?: { type: 'percentage' | 'fixed'; value: number }) {
  const subtotal = items.reduce((sum, item) => {
    return sum + (item.quantity * item.price);
  }, 0);

  let discountedSubtotal = subtotal;
  if (discount) {
    if (discount.type === 'percentage') {
      discountedSubtotal = subtotal * (1 - discount.value / 100);
    } else {
      discountedSubtotal = Math.max(0, subtotal - discount.value);
    }
  }

  const taxAmount = items.reduce((sum, item) => {
    const itemSubtotal = item.quantity * item.price;
    const itemTax = (itemSubtotal * item.taxRate) / 100;
    return sum + itemTax;
  }, 0);

  const total = discountedSubtotal + taxAmount;

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    taxAmount: Math.round(taxAmount * 100) / 100,
    total: Math.round(total * 100) / 100,
    discountAmount: Math.round((subtotal - discountedSubtotal) * 100) / 100,
  };
}

/**
 * Génère un numéro de facture
 */
export function generateInvoiceNumber(count: number): string {
  const year = new Date().getFullYear();
  return `F${year}-${String(count + 1).padStart(4, '0')}`;
}

/**
 * Vérifie si une facture est en retard
 */
export function isInvoiceOverdue(dueDate: Date, status: string): boolean {
  return status !== 'paid' && status !== 'cancelled' && new Date() > new Date(dueDate);
}

/**
 * Calcule les jours de retard
 */
export function getDaysOverdue(dueDate: Date): number {
  const today = new Date();
  const due = new Date(dueDate);
  const diffTime = today.getTime() - due.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
}

/**
 * Sanitize une chaîne pour éviter les injections
 */
export function sanitizeString(str: string): string {
  return str.replace(/[<>]/g, '');
}

/**
 * Génère un slug à partir d'une chaîne
 */
export function generateSlug(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}