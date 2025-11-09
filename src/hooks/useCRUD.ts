import { useState, useCallback } from 'react';

export interface UseCRUDOptions {
  endpoint: string;
  onSuccess?: (message: string) => void;
  onError?: (error: string) => void;
}

export interface UseCRUDResult<T> {
  data: T[];
  loading: boolean;
  error: string | null;
  fetchData: () => Promise<void>;
  createItem: (item: Partial<T>) => Promise<T>;
  updateItem: (id: string, item: Partial<T>) => Promise<T>;
  deleteItem: (id: string) => Promise<void>;
  setData: React.Dispatch<React.SetStateAction<T[]>>;
}

/**
 * Hook générique pour gérer les opérations CRUD sur une ressource
 * Élimine la duplication de code entre quotes, invoices, clients, expenses
 * 
 * @example
 * const { data: quotes, loading, createItem, updateItem, deleteItem } = useCRUD<Quote>({
 *   endpoint: '/api/quotes',
 *   onSuccess: (msg) => showNotification(msg),
 * });
 */
export function useCRUD<T extends { _id: string }>({
  endpoint,
  onSuccess,
  onError,
}: UseCRUDOptions): UseCRUDResult<T> {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Récupérer toutes les données
   */
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(endpoint);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Erreur lors du chargement');
      }
      const fetchedData = await res.json();
      setData(Array.isArray(fetchedData) ? fetchedData : []);
    } catch (err: any) {
      const errorMessage = err.message || 'Erreur lors du chargement';
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [endpoint, onError]);

  /**
   * Créer un nouvel élément
   */
  const createItem = useCallback(
    async (item: Partial<T>): Promise<T> => {
      try {
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item),
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || 'Erreur lors de la création');
        }

        const created = await res.json();
        setData((prev) => [created, ...prev]);
        onSuccess?.('Élément créé avec succès');
        return created;
      } catch (err: any) {
        const errorMessage = err.message || 'Erreur lors de la création';
        onError?.(errorMessage);
        throw err;
      }
    },
    [endpoint, onSuccess, onError]
  );

  /**
   * Mettre à jour un élément existant
   */
  const updateItem = useCallback(
    async (id: string, item: Partial<T>): Promise<T> => {
      try {
        const res = await fetch(`${endpoint}/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item),
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || 'Erreur lors de la mise à jour');
        }

        const updated = await res.json();
        setData((prev) =>
          prev.map((item) => (item._id === id ? { ...item, ...updated } : item))
        );
        onSuccess?.('Élément mis à jour avec succès');
        return updated;
      } catch (err: any) {
        const errorMessage = err.message || 'Erreur lors de la mise à jour';
        onError?.(errorMessage);
        throw err;
      }
    },
    [endpoint, onSuccess, onError]
  );

  /**
   * Supprimer un élément
   */
  const deleteItem = useCallback(
    async (id: string): Promise<void> => {
      try {
        const res = await fetch(`${endpoint}/${id}`, {
          method: 'DELETE',
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || 'Erreur lors de la suppression');
        }

        setData((prev) => prev.filter((item) => item._id !== id));
        onSuccess?.('Élément supprimé avec succès');
      } catch (err: any) {
        const errorMessage = err.message || 'Erreur lors de la suppression';
        onError?.(errorMessage);
        throw err;
      }
    },
    [endpoint, onSuccess, onError]
  );

  return {
    data,
    loading,
    error,
    fetchData,
    createItem,
    updateItem,
    deleteItem,
    setData,
  };
}
