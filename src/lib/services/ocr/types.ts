/**
 * 📄 Types partagés pour le service OCR
 */

export interface ParsedExpenseData {
  vendor: string;
  amount: number;
  taxAmount: number;
  date: Date | null;
  invoiceNumber: string;
  confidence: number;
}

export interface GoogleVisionTextAnnotation {
  description: string;
  locale?: string;
}

export interface GoogleVisionResponse {
  responses: Array<{
    textAnnotations: GoogleVisionTextAnnotation[];
    fullTextAnnotation?: {
      text: string;
    };
    error?: {
      code: number;
      message: string;
    };
  }>;
}
