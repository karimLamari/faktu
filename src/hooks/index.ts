/**
 * Export centralisé de tous les hooks personnalisés
 * Permet d'importer facilement : import { useCRUD, useFormModal } from '@/hooks'
 */

export { useCRUD } from './useCRUD';
export { useFormModal } from './useFormModal';
export { useModalState } from './useModalState';
export { useFilters } from './useFilters';
export { useNotification } from './useNotification';
export { useOCR } from './useOCR';
export { useSubscription } from './useSubscription';

// Export des types
export type { UseCRUDResult } from './useCRUD';
export type { UseFormModalOptions, UseFormModalResult } from './useFormModal';
export type { UseModalStateResult } from './useModalState';
export type { UseFiltersOptions, UseFiltersResult } from './useFilters';
export type { Notification } from './useNotification';
export type { UseOCROptions, UseOCRResult } from './useOCR';

