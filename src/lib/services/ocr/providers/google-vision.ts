/**
 * 🚀 Google Cloud Vision Provider
 * 
 * Provider OCR premium pour plans PRO/BUSINESS
 * Précision: 90-95% vs 70% de Tesseract
 */

import { GoogleVisionResponse } from '../types';

/**
 * Extrait le texte d'une image en utilisant Google Cloud Vision API
 * @param buffer - Buffer de l'image
 * @returns Texte extrait
 */
export async function googleVisionProvider(buffer: Buffer): Promise<string> {
  const apiKey = process.env.GOOGLE_CLOUD_VISION_API_KEY;

  if (!apiKey) {
    console.error('❌ Google Cloud Vision API key not configured');
    throw new Error(
      'Service OCR PRO non configuré. Veuillez contacter le support.'
    );
  }

  // Convertir en base64
  const base64Image = buffer.toString('base64');

  console.log('🚀 Appel Google Cloud Vision API...');

  // Appeler l'API Google Cloud Vision
  const visionResponse = await fetch(
    `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        requests: [
          {
            image: {
              content: base64Image,
            },
            features: [
              {
                type: 'DOCUMENT_TEXT_DETECTION',
                maxResults: 1,
              },
            ],
            imageContext: {
              languageHints: ['fr', 'en'],
            },
          },
        ],
      }),
    }
  );

  if (!visionResponse.ok) {
    const errorData = await visionResponse.json();
    console.error('❌ Google Vision API Error:', errorData);
    throw new Error('Erreur Google Vision API');
  }

  const data: GoogleVisionResponse = await visionResponse.json();

  // Vérifier les erreurs dans la réponse
  if (data.responses[0]?.error) {
    console.error(
      '❌ Google Vision Response Error:',
      data.responses[0].error
    );
    throw new Error(data.responses[0].error.message);
  }

  // Extraire le texte
  const fullText =
    data.responses[0]?.fullTextAnnotation?.text ||
    data.responses[0]?.textAnnotations?.[0]?.description ||
    '';

  if (!fullText) {
    throw new Error("Aucun texte détecté dans l'image");
  }

  console.log(
    '✅ Google Cloud Vision - Texte extrait:',
    fullText.substring(0, 100) + '...'
  );

  return fullText;
}
