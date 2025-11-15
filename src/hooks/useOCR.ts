import { useState, useCallback } from 'react';
import type { ParsedExpenseData } from '@/lib/services/ocr/types';

export type UserPlan = 'free' | 'pro' | 'business';

export interface UseOCROptions {
  onProgress?: (progress: number) => void;
  onComplete?: (data: ParsedExpenseData) => void;
  onError?: (error: string) => void;
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
 * Hook personnalisé pour gérer l'OCR via l'API backend
 * L'API backend gère automatiquement le choix du provider (Google Vision / Tesseract)
 * selon le plan utilisateur
 * 
 * @example
 * const { processFile, isProcessing, progress, data } = useOCR({
 *   onComplete: (data) => setFormData(data)
 * });
 */
export function useOCR(options: UseOCROptions = {}): UseOCRResult {
  const {
    onProgress,
    onComplete,
    onError,
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
      console.log('🚀 Appel API OCR backend (système hybride)');
      updateProgress(10);
      
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/expenses/ocr', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur API OCR');
      }

      updateProgress(80);
      const result = await response.json();
      
      // Convertir au format ParsedExpenseData
      const parsed: ParsedExpenseData = {
        vendor: result.supplierName || '',
        amount: result.amount || 0,
        taxAmount: result.taxAmount || 0,
        date: result.date ? new Date(result.date) : new Date(),
        invoiceNumber: result.invoiceNumber || '',
        confidence: result.confidence || 70,
      };

      updateProgress(100);
      setData(parsed);
      onComplete?.(parsed);
    } catch (err: any) {
      const errorMessage = err.message || 'Erreur lors du traitement OCR';
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  }, [updateProgress, onError, onComplete]);

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
