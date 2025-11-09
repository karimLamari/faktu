/**
 * Service OCR Provider - Routing intelligent selon le plan utilisateur
 *
 * FREE: Tesseract.js (gratuit, 70-75% précision)
 * PRO/BUSINESS: Google Cloud Vision (payant, 90-95% précision)
 */

import { createWorker } from 'tesseract.js';
import { parseExpenseFromOCR, ParsedExpenseData } from './expense-parser';
import { googleCloudVisionOCR, parseGoogleVisionText } from './google-vision-ocr';
import { preprocessImageForOCR } from './image-preprocessor';

export type OCRProvider = 'tesseract' | 'google' | 'hybrid';
export type UserPlan = 'free' | 'pro' | 'business';

interface OCROptions {
  userPlan: UserPlan;
  onProgress?: (progress: number) => void;
  preprocessImage?: boolean;
}

/**
 * Détermine quel provider OCR utiliser selon le plan utilisateur
 */
function getOCRProvider(userPlan: UserPlan): 'tesseract' | 'google' {
  const configuredProvider = (process.env.OCR_PROVIDER || 'hybrid') as OCRProvider;

  // Mode forcé (pour tests)
  if (configuredProvider === 'tesseract') return 'tesseract';
  if (configuredProvider === 'google') return 'google';

  // Mode hybrid (défaut)
  return userPlan === 'pro' || userPlan === 'business' ? 'google' : 'tesseract';
}

/**
 * Traite une image avec Tesseract.js (FREE)
 */
async function processTesseractOCR(
  file: File,
  options: OCROptions
): Promise<ParsedExpenseData> {
  const { onProgress, preprocessImage = true } = options;

  console.log('📸 OCR Tesseract.js - Démarrage...');
  onProgress?.(5);

  let processedFile = file;

  // Prétraitement d'image
  if (preprocessImage) {
    onProgress?.(10);
    console.log('🖼️ Prétraitement de l\'image...');
    processedFile = await preprocessImageForOCR(file, {
      denoise: true,
      sharpen: true,
      contrast: true,
      binarize: true,
    });
  }

  // Initialiser Tesseract
  onProgress?.(20);
  console.log('🔧 Initialisation de Tesseract...');
  const worker = await createWorker(['fra', 'eng'], 1, {
    logger: (m) => {
      if (m.status === 'recognizing text') {
        const progress = 20 + m.progress * 60; // 20% → 80%
        onProgress?.(Math.round(progress));
      }
    },
  });

  try {
    // OCR
    console.log('🔍 Reconnaissance OCR en cours...');
    const {
      data: { text },
    } = await worker.recognize(processedFile);
    console.log('📝 Texte extrait (Tesseract):', text.substring(0, 200));

    onProgress?.(85);

    // Parser
    console.log('🧠 Parsing des données...');
    const parsed = parseExpenseFromOCR(text);

    onProgress?.(100);
    console.log('✅ OCR Tesseract terminé - Confiance:', parsed.confidence + '%');

    return parsed;
  } finally {
    await worker.terminate();
  }
}

/**
 * Traite une image avec Google Cloud Vision (PRO/BUSINESS)
 */
async function processGoogleVisionOCR(
  file: File,
  options: OCROptions
): Promise<ParsedExpenseData> {
  const { onProgress } = options;

  console.log('🚀 OCR Google Cloud Vision - Démarrage...');
  onProgress?.(10);

  try {
    // Appel API Google Vision
    onProgress?.(30);
    const text = await googleCloudVisionOCR(file);

    onProgress?.(70);

    // Parser le texte avec patterns avancés
    console.log('🧠 Parsing des données Google Vision...');
    const googleParsed = parseGoogleVisionText(text);

    // Parser complet avec le parser standard (pour les champs manquants)
    const fullParsed = parseExpenseFromOCR(text);

    // Fusionner les résultats (Google Vision prend priorité)
    const merged: ParsedExpenseData = {
      vendor: googleParsed.vendor || fullParsed.vendor,
      amount: googleParsed.amount || fullParsed.amount,
      taxAmount: googleParsed.taxAmount || fullParsed.taxAmount,
      date: googleParsed.date || fullParsed.date,
      invoiceNumber: googleParsed.invoiceNumber || fullParsed.invoiceNumber,
      confidence: 90, // Google Vision a une confiance de base plus élevée
    };

    onProgress?.(100);
    console.log('✅ OCR Google Vision terminé - Confiance: 90%+');

    return merged;
  } catch (error: any) {
    console.error('❌ Erreur Google Cloud Vision:', error);

    // Fallback vers Tesseract en cas d'erreur Google Vision
    console.log('⚠️ Fallback vers Tesseract...');
    return processTesseractOCR(file, options);
  }
}

/**
 * Point d'entrée principal - Route automatiquement vers le bon provider
 */
export async function processExpenseOCR(
  file: File,
  options: OCROptions
): Promise<ParsedExpenseData> {
  const provider = getOCRProvider(options.userPlan);

  console.log(`🎯 OCR Provider sélectionné: ${provider.toUpperCase()} (Plan: ${options.userPlan})`);

  if (provider === 'google') {
    return processGoogleVisionOCR(file, options);
  } else {
    return processTesseractOCR(file, options);
  }
}

/**
 * Retourne le nom du provider pour affichage UI
 */
export function getOCRProviderName(userPlan: UserPlan): string {
  const provider = getOCRProvider(userPlan);

  if (provider === 'google') {
    return 'OCR Intelligent Google AI';
  } else {
    return 'OCR Basique';
  }
}

/**
 * Retourne si l'utilisateur a accès à l'OCR premium
 */
export function hasAdvancedOCR(userPlan: UserPlan): boolean {
  return getOCRProvider(userPlan) === 'google';
}
