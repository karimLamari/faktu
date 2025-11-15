/**
 * 📸 Tesseract Provider
 * 
 * Provider OCR gratuit pour plan FREE
 * Précision: 70-75%
 */

import { createWorker } from 'tesseract.js';

/**
 * Extrait le texte d'une image en utilisant Tesseract.js
 * @param buffer - Buffer de l'image
 * @returns Texte extrait
 */
export async function tesseractProvider(buffer: Buffer): Promise<string> {
  console.log('🔧 Initialisation de Tesseract.js...');

  // Créer le worker Tesseract
  const worker = await createWorker(['fra', 'eng']);

  try {
    // Effectuer l'OCR
    console.log('🔍 Reconnaissance OCR en cours (Tesseract)...');
    const {
      data: { text },
    } = await worker.recognize(buffer);

    console.log(
      '📝 Texte extrait (Tesseract):',
      text.substring(0, 100) + '...'
    );

    return text;
  } finally {
    await worker.terminate();
  }
}
