/**
 * Common types and utilities for invoice PDF templates
 */

import type { TemplatePreset } from '@/lib/invoice-templates/presets';

export interface InvoiceTemplateProps {
  invoice: any;
  client: any;
  user: any;
  template: TemplatePreset;
  styles: any;
}

/**
 * Calculate VAT breakdown by rate
 */
export const calculateVATByRate = (invoice: any): { [rate: number]: number } => {
  const vatByRate: { [rate: number]: number } = {};
  for (const item of invoice.items) {
    const rate = typeof item.taxRate === 'number' ? item.taxRate : 0;
    const base = item.quantity * item.unitPrice;
    const vat = base * (rate / 100);
    if (!vatByRate[rate]) vatByRate[rate] = 0;
    vatByRate[rate] += vat;
  }
  return vatByRate;
};

/**
 * Format currency
 */
export const formatCurrency = (value: number): string => {
  return Number(value).toLocaleString('fr-FR', { minimumFractionDigits: 2 });
};

/**
 * Format percentage
 */
export const formatPercentage = (value: number): string => {
  return Number(value).toLocaleString('fr-FR', { minimumFractionDigits: 1 });
};
