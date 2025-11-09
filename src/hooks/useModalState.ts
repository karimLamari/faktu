import { useState, useCallback } from 'react';

export interface UseModalStateResult<T> {
  isOpen: boolean;
  data: T | null;
  open: (data?: T) => void;
  close: () => void;
  setData: (data: T | null) => void;
}

/**
 * Hook générique pour gérer l'état d'une modale avec données associées
 * Remplace les paires répétitives de [showModal, selectedItem]
 * 
 * @example
 * const previewModal = useModalState<Quote>();
 * const emailModal = useModalState<Quote>();
 * 
 * // Usage:
 * previewModal.open(quote);
 * previewModal.close();
 * {previewModal.isOpen && <PreviewModal quote={previewModal.data} />}
 */
export function useModalState<T>(): UseModalStateResult<T> {
  const [isOpen, setIsOpen] = useState(false);
  const [data, setData] = useState<T | null>(null);

  const open = useCallback((modalData?: T) => {
    if (modalData) setData(modalData);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    // Délai pour permettre l'animation de fermeture avant de clear les données
    setTimeout(() => setData(null), 200);
  }, []);

  return {
    isOpen,
    data,
    open,
    close,
    setData,
  };
}
