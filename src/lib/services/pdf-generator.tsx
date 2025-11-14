/**
 * PDF Generation Service using @react-pdf/renderer
 * Replaces Puppeteer for better performance and reliability
 */

import React from 'react';
import { renderToBuffer } from '@react-pdf/renderer';
import { InvoicePDF } from '@/lib/invoice-templates';
import { QuotePDF } from '@/lib/quote-templates';
import type { TemplatePreset } from '@/lib/invoice-templates';

/**
 * Generate Invoice PDF Buffer
 * @param invoice - Invoice data
 * @param client - Client data
 * @param user - User/company data
 * @param template - Template configuration (supports Modern, Classic, Minimal, Creative)
 * @returns PDF buffer
 */
export async function generateInvoicePdf({
  invoice,
  client,
  user,
  template,
}: {
  invoice: any;
  client: any;
  user: any;
  template: TemplatePreset;
}): Promise<Buffer> {
  try {
    const pdfBuffer = await renderToBuffer(
      <InvoicePDF invoice={invoice} client={client} user={user} template={template} />
    );
    return pdfBuffer;
  } catch (error: any) {
    console.error('Error generating invoice PDF:', error);
    throw new Error(`PDF generation failed: ${error.message}`);
  }
}

/**
 * Generate Quote PDF Buffer
 * @param quote - Quote data
 * @param client - Client data
 * @param user - User/company data
 * @returns PDF buffer
 */
export async function generateQuotePdf({
  quote,
  client,
  user,
}: {
  quote: any;
  client: any;
  user: any;
}): Promise<Buffer> {
  try {
    const pdfBuffer = await renderToBuffer(
      <QuotePDF quote={quote} client={client} user={user} />
    );
    return pdfBuffer;
  } catch (error: any) {
    console.error('Error generating quote PDF:', error);
    throw new Error(`PDF generation failed: ${error.message}`);
  }
}

/**
 * @deprecated Legacy function - kept for backward compatibility
 * Use generateInvoicePdf or generateQuotePdf instead
 */
export async function generatePdfBuffer(_htmlContent: string): Promise<Buffer> {
  throw new Error(
    'generatePdfBuffer is deprecated. Use generateInvoicePdf or generateQuotePdf instead.'
  );
}
