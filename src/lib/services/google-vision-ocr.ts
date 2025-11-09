/**
 * Google Cloud Vision OCR Service (Client-side)
 * Service premium pour les utilisateurs PRO/BUSINESS
 * Précision: 90-95% vs 70% de Tesseract
 *
 * SÉCURISÉ: Appelle l'API backend /api/ocr/process
 * La clé Google Cloud Vision reste côté serveur
 */

import { ParsedExpenseData } from './expense-parser';

/**
 * Appelle l'API Google Cloud Vision via notre backend sécurisé
 * SÉCURISÉ: La clé API reste côté serveur
 */
export async function googleCloudVisionOCR(file: File): Promise<string> {
  console.log('🔍 Google Cloud Vision - Appel API backend sécurisée...');

  try {
    // Préparer le FormData avec le fichier
    const formData = new FormData();
    formData.append('file', file);

    // Appeler notre API route Next.js sécurisée
    const response = await fetch('/api/ocr/process', {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();

    // Si fallback vers Tesseract recommandé
    if (data.fallback || data.provider === 'tesseract') {
      throw new Error(
        data.error || 'Fallback vers Tesseract requis'
      );
    }

    if (!response.ok) {
      throw new Error(data.error || 'Erreur lors du traitement OCR');
    }

    // Vérifier que nous avons bien reçu du texte
    if (!data.text) {
      throw new Error('Aucun texte détecté dans l\'image');
    }

    console.log('✅ Google Cloud Vision - Texte extrait:', data.text.substring(0, 200));
    return data.text;

  } catch (error: any) {
    console.error('❌ Erreur Google Cloud Vision (client):', error);
    throw error;
  }
}

/**
 * Parse le texte OCR de Google Vision avec patterns avancés
 * Google Vision retourne un texte de meilleure qualité, on peut utiliser des patterns plus fiables
 */
export function parseGoogleVisionText(text: string): Partial<ParsedExpenseData> {
  const cleanText = text.toLowerCase();

  // Patterns avancés spécifiques pour Google Vision (meilleure qualité)
  const patterns = {
    // Montant total avec contexte
    totalAmount: [
      /total[\s:]*(?:ttc|à payer)?[\s:]*([0-9]+[,.]?[0-9]*)\s*€/i,
      /net[\s]+à[\s]+payer[\s:]*([0-9]+[,.]?[0-9]*)\s*€/i,
      /montant[\s]+total[\s:]*([0-9]+[,.]?[0-9]*)\s*€/i,
      /total[\s]+ttc[\s:]*([0-9]+[,.]?[0-9]*)/i,
    ],

    // TVA
    tax: [
      /tva[\s:]*([0-9]+[,.]?[0-9]*)\s*€/i,
      /montant[\s]+tva[\s:]*([0-9]+[,.]?[0-9]*)\s*€/i,
    ],

    // Date (Google Vision reconnaît mieux les dates)
    date: [
      /date[\s:]*(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{2,4})/i,
      /(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{2,4})/,
    ],

    // Numéro de facture
    invoiceNumber: [
      /facture[\s#:n°]*([a-z0-9\-]+)/i,
      /n°[\s]*facture[\s:]*([a-z0-9\-]+)/i,
      /invoice[\s#:]*([a-z0-9\-]+)/i,
    ],
  };

  const result: Partial<ParsedExpenseData> = {};

  // Extraire le montant
  for (const pattern of patterns.totalAmount) {
    const match = cleanText.match(pattern);
    if (match && match[1]) {
      const amount = parseFloat(match[1].replace(',', '.'));
      if (amount > 0.01 && amount < 1000000) {
        result.amount = amount;
        break;
      }
    }
  }

  // Extraire la TVA
  for (const pattern of patterns.tax) {
    const match = cleanText.match(pattern);
    if (match && match[1]) {
      result.taxAmount = parseFloat(match[1].replace(',', '.'));
      break;
    }
  }

  // Extraire le numéro de facture
  for (const pattern of patterns.invoiceNumber) {
    const match = text.match(pattern);
    if (match && match[1]) {
      result.invoiceNumber = match[1].trim();
      break;
    }
  }

  // Extraire la date
  for (const pattern of patterns.date) {
    const match = text.match(pattern);
    if (match) {
      let day, month, year;

      if (match[3]?.length === 4) {
        day = parseInt(match[1]);
        month = parseInt(match[2]) - 1;
        year = parseInt(match[3]);
      } else {
        day = parseInt(match[1]);
        month = parseInt(match[2]) - 1;
        year = parseInt(match[3] || '');
        if (year < 100) year += 2000;
      }

      const date = new Date(year, month, day);
      if (!isNaN(date.getTime())) {
        result.date = date;
        break;
      }
    }
  }

  // Extraire le fournisseur (première ligne significative)
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 2);
  for (const line of lines.slice(0, 5)) {
    if (
      !line.match(/facture|date|total|tva|n°|siret/i) &&
      line.length >= 3 &&
      line.length <= 50
    ) {
      result.vendor = line;
      break;
    }
  }

  return result;
}
