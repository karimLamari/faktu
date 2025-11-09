import { useState, useCallback } from 'react';
import { createWorker } from 'tesseract.js';
import { parseExpenseFromOCR, ParsedExpenseData } from '@/lib/services/expense-parser';
import { preprocessImageForOCR } from '@/lib/services/image-preprocessor';
import { processExpenseOCR, UserPlan } from '@/lib/services/ocr-provider';

export interface UseOCROptions {
  onProgress?: (progress: number) => void;
  onComplete?: (data: ParsedExpenseData) => void;
  onError?: (error: string) => void;
  preprocessImage?: boolean; // Activer le prétraitement d'image (défaut: true)
  languages?: string[]; // Langues OCR (défaut: ['fra', 'eng'])
  userPlan?: UserPlan; // Plan utilisateur (FREE/PRO/BUSINESS) - détermine le provider OCR
  useNewProvider?: boolean; // Utiliser le nouveau système OCR hybride (défaut: false pour compatibilité)
}

export interface UseOCRResult {
  isProcessing: boolean;
  progress: number;
  error: string | null;
  data: ParsedExpenseData | null;
  processFile: (file: File) => Promise<void>;
  reset: () => void;
}

/**
 * Hook personnalisé pour gérer l'OCR de manière réutilisable
 * Gère le prétraitement d'image, Tesseract.js, et le parsing
 * 
 * @example
 * const { processFile, isProcessing, progress, data } = useOCR({
 *   onComplete: (data) => setFormData(data),
 *   preprocessImage: true
 * });
 */
export function useOCR(options: UseOCROptions = {}): UseOCRResult {
  const {
    onProgress,
    onComplete,
    onError,
    preprocessImage = true,
    languages = ['fra', 'eng'],
    userPlan = 'free',
    useNewProvider = true // Activé par défaut pour tous les nouveaux usages
  } = options;

  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ParsedExpenseData | null>(null);

  const updateProgress = useCallback((value: number) => {
    setProgress(value);
    onProgress?.(value);
  }, [onProgress]);

  const processFile = useCallback(async (file: File) => {
    setIsProcessing(true);
    setError(null);
    setData(null);
    updateProgress(0);

    try {
      // Utiliser le nouveau provider OCR hybride si activé
      if (useNewProvider && file.type.startsWith('image/')) {
        console.log('🚀 Utilisation du nouveau système OCR hybride');
        const result = await processExpenseOCR(file, {
          userPlan,
          onProgress: updateProgress,
          preprocessImage,
        });

        setData(result);
        onComplete?.(result);
        return;
      }

      // Ancien système (compatibilité)
      const fileType = file.type;

      if (fileType === 'application/pdf') {
        await processPDF(file, updateProgress);
      } else if (fileType.startsWith('image/')) {
        await processImage(file, preprocessImage, languages, updateProgress);
      } else {
        throw new Error('Type de fichier non supporté. Utilisez une image (JPG, PNG) ou un PDF.');
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Erreur lors du traitement OCR';
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsProcessing(false);
      updateProgress(100);
    }
  }, [preprocessImage, languages, updateProgress, onError, useNewProvider, userPlan, onComplete]);

  const processImage = async (
    file: File,
    shouldPreprocess: boolean,
    langs: string[],
    updateProgress: (progress: number) => void
  ) => {
    let processedFile = file;

    // Prétraiter l'image pour améliorer l'OCR
    if (shouldPreprocess) {
      updateProgress(10);
      console.log('🖼️ Prétraitement de l\'image...');
      processedFile = await preprocessImageForOCR(file, {
        denoise: true,
        sharpen: true,
        contrast: true,
        binarize: true,
      });
      console.log('✅ Image prétraitée');
    }

    // Initialiser Tesseract.js
    updateProgress(20);
    console.log('🔧 Initialisation de Tesseract...');
    const worker = await createWorker(langs, 1, {
      logger: (m) => {
        if (m.status === 'recognizing text') {
          const ocrProgress = 20 + (m.progress * 60); // 20% → 80%
          updateProgress(Math.round(ocrProgress));
        }
      },
    });

    try {
      // Effectuer l'OCR
      console.log('🔍 Reconnaissance de texte en cours...');
      const { data: { text } } = await worker.recognize(processedFile);
      console.log('📝 Texte extrait (200 premiers caractères):', text.substring(0, 200));

      updateProgress(85);

      // Parser le texte
      console.log('🧠 Parsing des données...');
      const parsed = parseExpenseFromOCR(text);
      console.log('✅ Données extraites:', parsed);

      setData(parsed);
      onComplete?.(parsed);

      updateProgress(100);
    } finally {
      await worker.terminate();
    }
  };

  const processPDF = async (
    file: File,
    updateProgress: (progress: number) => void
  ) => {
    updateProgress(10);

    // Charger PDF.js
    if (!(window as any).pdfjsLib) {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
      document.head.appendChild(script);
      
      await new Promise((resolve, reject) => {
        script.onload = resolve;
        script.onerror = reject;
      });
    }

    const pdfjsLib = (window as any).pdfjsLib;
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

    updateProgress(20);

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    
    let fullText = '';
    const totalPages = pdf.numPages;

    console.log('📄 PDF détecté - Nombre de pages:', totalPages);

    // Extraire le texte de chaque page
    for (let i = 1; i <= totalPages; i++) {
      const pageProgress = 20 + ((i / totalPages) * 70); // 20% → 90%
      updateProgress(Math.round(pageProgress));
      
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item: any) => item.str).join(' ');
      fullText += pageText + '\n';
      console.log(`📃 Page ${i}/${totalPages} - Texte extrait:`, pageText.substring(0, 100) + '...');
    }

    updateProgress(95);

    console.log('📝 Texte complet du PDF:', fullText.substring(0, 200));

    // Parser le texte
    const parsed = parseExpenseFromOCR(fullText);
    console.log('✅ Données extraites du PDF:', parsed);

    setData(parsed);
    onComplete?.(parsed);

    updateProgress(100);
  };

  const reset = useCallback(() => {
    setIsProcessing(false);
    setProgress(0);
    setError(null);
    setData(null);
  }, []);

  return {
    isProcessing,
    progress,
    error,
    data,
    processFile,
    reset,
  };
}
