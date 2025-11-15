/**
 * 🤖 Service OCR Unifié
 * 
 * Point d'entrée unique pour toutes les opérations OCR dans l'application.
 * Gère automatiquement:
 * - Sélection du provider (Google Vision vs Tesseract) selon le plan
 * - Validation des fichiers
 * - Conversion des formats
 * - Extraction de texte
 * - Parsing selon le type de document
 * 
 * Utilisé par:
 * - /api/ocr/process (OCR générique)
 * - /api/expenses/ocr (OCR dépenses avec parsing)
 */

import { PLANS } from '@/lib/subscription/plans';
import { googleVisionProvider } from './providers/google-vision';
import { tesseractProvider } from './providers/tesseract';
import { parseExpenseData } from './parsers/expense-parser';
import { ParsedExpenseData } from './types';

export interface OCROptions {
  userId: string;
  plan: string;
  type?: 'generic' | 'expense';
}

export interface OCRResult {
  text: string;
  provider: 'google-vision' | 'tesseract';
  confidence: number;
  parsed?: ParsedExpenseData;
}

/**
 * Traite une image avec OCR
 * @param file - Le fichier image à traiter
 * @param options - Options incluant userId, plan, type
 * @returns Résultat OCR avec texte extrait et parsing optionnel
 */
export async function processOCR(
  file: File,
  options: OCROptions
): Promise<OCRResult> {
  const { plan, type = 'generic' } = options;

  // 1. Validation du fichier
  validateFile(file);

  // 2. Déterminer le provider selon le plan
  const planFeatures = PLANS[plan] || PLANS.free;
  const useGoogleVision =
    planFeatures.advancedOCR && (plan === 'pro' || plan === 'business');

  console.log(
    `🎯 OCR Service - Plan: ${plan}, Provider: ${useGoogleVision ? 'Google Vision' : 'Tesseract'}, Type: ${type}`
  );

  // 3. Conversion du fichier en buffer
  const buffer = await fileToBuffer(file);

  // 4. Extraction du texte selon le provider
  let extractedText: string;
  let provider: 'google-vision' | 'tesseract';
  let baseConfidence: number;

  if (useGoogleVision) {
    extractedText = await googleVisionProvider(buffer);
    provider = 'google-vision';
    baseConfidence = 90;
    console.log('✅ Google Vision - Texte extrait');
  } else {
    extractedText = await tesseractProvider(buffer);
    provider = 'tesseract';
    baseConfidence = 70;
    console.log('✅ Tesseract - Texte extrait');
  }

  // 5. Parsing optionnel selon le type
  const result: OCRResult = {
    text: extractedText,
    provider,
    confidence: baseConfidence,
  };

  if (type === 'expense') {
    const parsed = parseExpenseData(extractedText, provider);
    result.parsed = parsed;
    result.confidence = parsed.confidence;
    console.log(`✅ Parsing expense terminé - Confiance: ${parsed.confidence}%`);
  }

  return result;
}

/**
 * Valide le fichier (type et taille)
 */
function validateFile(file: File): void {
  if (!file) {
    throw new Error('Aucun fichier fourni');
  }

  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'];
  if (!allowedTypes.includes(file.type) && !file.type.startsWith('image/')) {
    throw new Error('Le fichier doit être une image (JPG, PNG, WebP) ou un PDF');
  }

  const MAX_SIZE = 10 * 1024 * 1024; // 10MB
  if (file.size > MAX_SIZE) {
    throw new Error("Le fichier ne doit pas dépasser 10MB");
  }
}

/**
 * Convertit un File en Buffer
 */
async function fileToBuffer(file: File): Promise<Buffer> {
  const bytes = await file.arrayBuffer();
  return Buffer.from(bytes);
}
