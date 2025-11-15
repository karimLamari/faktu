/**
 * Common types and utilities for invoice PDF templates
 */

import type { TemplatePreset } from '@/lib/invoice-templates/config/presets';

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
 * Format currency for PDF (simple, reliable)
 * toLocaleString() can be unreliable in @react-pdf/renderer
 */
export const formatCurrency = (value: number): string => {
  if (value === null || value === undefined || isNaN(value)) {
    return '0,00';
  }
  const fixed = Number(value).toFixed(2);
  // Remplacer . par , et ajouter espace tous les 3 chiffres
  const [integer, decimal] = fixed.split('.');
  const formattedInteger = integer.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return `${formattedInteger},${decimal}`;
};

/**
 * Format percentage for PDF
 */
export const formatPercentage = (value: number): string => {
  if (value === null || value === undefined || isNaN(value)) {
    return '0,0';
  }
  return Number(value).toFixed(1).replace('.', ',');
};
