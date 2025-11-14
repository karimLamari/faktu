import { useState, useEffect, useRef, useCallback } from 'react';
import { pdf } from '@react-pdf/renderer';

interface UsePdfPreviewOptions {
  debounceMs?: number;
  cacheSize?: number;
}

/**
 * Hook optimisé pour générer des previews PDF avec @react-pdf
 * 
 * Features:
 * - Debouncing: Évite les régénérations trop fréquentes
 * - Cache LRU: Stocke les PDFs déjà générés
 * - Cleanup automatique: Révoque les URLs au démontage
 * 
 * @param pdfComponent - Le composant React PDF à générer
 * @param deps - Dépendances pour déterminer quand regénérer
 * @param options - Options de configuration
 * 
 * @example
 * ```tsx
 * const { pdfUrl, isGenerating } = usePdfPreview(
 *   <InvoicePDF invoice={invoice} template={template} />,
 *   [invoice, template],
 *   { debounceMs: 300, cacheSize: 5 }
 * );
 * ```
 */
export function usePdfPreview(
  pdfComponent: React.ReactElement | null,
  deps: any[],
  options: UsePdfPreviewOptions = {}
) {
  const { debounceMs = 300, cacheSize = 5 } = options;
  
  const [pdfUrl, setPdfUrl] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  // Cache LRU pour éviter de regénérer les mêmes PDFs
  const cacheRef = useRef<Map<string, string>>(new Map());
  
  // Timer pour le debounce
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Générer une clé de cache basée sur les dépendances
  const cacheKey = JSON.stringify(deps);
  
  // Fonction de génération avec cache
  const generatePdf = useCallback(async () => {
    if (!pdfComponent) {
      setPdfUrl('');
      return;
    }
    
    // Vérifier le cache d'abord
    if (cacheRef.current.has(cacheKey)) {
      const cachedUrl = cacheRef.current.get(cacheKey)!;
      setPdfUrl(cachedUrl);
      setIsGenerating(false);
      return;
    }
    
    try {
      setIsGenerating(true);
      setError(null);
      
      // Générer le PDF
      const blob = await pdf(pdfComponent as any).toBlob();
      
      // Créer une URL pour le blob
      const url = URL.createObjectURL(blob);
      
      // Gérer la taille du cache (LRU)
      if (cacheRef.current.size >= cacheSize) {
        // Supprimer la plus ancienne entrée
        const firstKey = cacheRef.current.keys().next().value as string | undefined;
        if (firstKey) {
          const oldUrl = cacheRef.current.get(firstKey) as string | undefined;
          if (oldUrl) URL.revokeObjectURL(oldUrl);
          cacheRef.current.delete(firstKey);
        }
      }
      
      // Ajouter au cache
      cacheRef.current.set(cacheKey, url);
      setPdfUrl(url);
      setIsGenerating(false);
    } catch (err) {
      console.error('Erreur génération PDF preview:', err);
      setError(err instanceof Error ? err : new Error('Erreur inconnue'));
      setIsGenerating(false);
    }
  }, [pdfComponent, cacheKey, cacheSize]);
  
  // Effet avec debounce
  useEffect(() => {
    // Annuler le timer précédent
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    // Attendre avant de regénérer (debounce)
    debounceTimerRef.current = setTimeout(() => {
      generatePdf();
    }, debounceMs);
    
    // Cleanup
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [generatePdf, debounceMs]);
  
  // Cleanup du cache au démontage
  useEffect(() => {
    return () => {
      // Révoquer toutes les URLs du cache
      cacheRef.current.forEach((url) => {
        URL.revokeObjectURL(url);
      });
      cacheRef.current.clear();
    };
  }, []);
  
  return {
    pdfUrl,
    isGenerating,
    error,
    regenerate: generatePdf,
  };
}
