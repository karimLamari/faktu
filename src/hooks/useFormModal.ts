import { useState, useCallback } from 'react';

export interface UseFormModalOptions<T> {
  onSubmit: (item: T, isEdit: boolean) => Promise<void>;
  initialValues?: Partial<T>;
  validate?: (item: Partial<T>) => string | null;
}

export interface UseFormModalResult<T> {
  isOpen: boolean;
  formData: Partial<T>;
  editItem: T | null;
  error: string | null;
  loading: boolean;
  isEditMode: boolean;
  openNew: (defaults?: Partial<T>) => void;
  openEdit: (item: T) => void;
  close: () => void;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  handleCustomChange: (field: string, value: any) => void;
  setFormData: React.Dispatch<React.SetStateAction<Partial<T>>>;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
}

/**
 * Hook générique pour gérer les formulaires modaux (création/édition)
 * Élimine la duplication massive entre quotes, invoices, clients, expenses
 * 
 * @example
 * const form = useFormModal<Quote>({
 *   onSubmit: async (data, isEdit) => {
 *     if (isEdit) await updateItem(data._id, data);
 *     else await createItem(data);
 *   },
 *   initialValues: { status: 'draft', items: [] }
 * });
 * 
 * // Usage: form.openNew(), form.openEdit(quote), form.close()
 */
export function useFormModal<T extends { _id?: string }>({
  onSubmit,
  initialValues = {},
  validate,
}: UseFormModalOptions<T>): UseFormModalResult<T> {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<T>>(initialValues);
  const [editItem, setEditItem] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isEditMode = editItem !== null;

  /**
   * Ouvrir le formulaire en mode création
   */
  const openNew = useCallback(
    (defaults?: Partial<T>) => {
      setFormData({ ...initialValues, ...defaults });
      setEditItem(null);
      setError(null);
      setIsOpen(true);
    },
    [initialValues]
  );

  /**
   * Ouvrir le formulaire en mode édition
   */
  const openEdit = useCallback((item: T) => {
    setFormData({ ...item });
    setEditItem(item);
    setError(null);
    setIsOpen(true);
  }, []);

  /**
   * Fermer le formulaire et réinitialiser l'état
   */
  const close = useCallback(() => {
    setIsOpen(false);
    setFormData(initialValues);
    setEditItem(null);
    setError(null);
    setLoading(false);
  }, [initialValues]);

  /**
   * Gérer les changements de champs du formulaire
   */
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const { name, value, type } = e.target;

      // Gestion des champs imbriqués (ex: "address.street")
      if (name.includes('.')) {
        const [parent, child] = name.split('.');
        setFormData((prev) => ({
          ...prev,
          [parent]: {
            ...(prev[parent as keyof T] as any),
            [child]: value,
          },
        }));
      }
      // Gestion des checkboxes
      else if (type === 'checkbox') {
        const checked = (e.target as HTMLInputElement).checked;
        setFormData((prev) => ({ ...prev, [name]: checked }));
      }
      // Gestion des champs numériques
      else if (type === 'number') {
        const numValue = value === '' ? 0 : Number(value);
        setFormData((prev) => ({ ...prev, [name]: numValue }));
      }
      // Gestion standard
      else {
        setFormData((prev) => ({ ...prev, [name]: value }));
      }
    },
    []
  );

  /**
   * Gérer les changements personnalisés (pour des composants custom)
   */
  const handleCustomChange = useCallback((field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  /**
   * Soumettre le formulaire
   */
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);
      setLoading(true);

      try {
        // Validation optionnelle
        if (validate) {
          const validationError = validate(formData);
          if (validationError) {
            setError(validationError);
            setLoading(false);
            return;
          }
        }

        await onSubmit(formData as T, isEditMode);
        close();
      } catch (err: any) {
        setError(err.message || 'Erreur lors de la soumission');
      } finally {
        setLoading(false);
      }
    },
    [formData, isEditMode, onSubmit, validate, close]
  );

  return {
    isOpen,
    formData,
    editItem,
    error,
    loading,
    isEditMode,
    openNew,
    openEdit,
    close,
    handleChange,
    handleCustomChange,
    setFormData,
    handleSubmit,
  };
}
