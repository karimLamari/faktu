/**
 * Service métier pour les clients
 * Centralise toutes les opérations API liées aux clients
 */

export const clientService = {
  /**
   * Récupérer tous les clients
   */
  getAll: async () => {
    const res = await fetch('/api/clients');
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Erreur lors du chargement des clients');
    }
    return res.json();
  },

  /**
   * Récupérer un client par ID
   */
  getById: async (id: string) => {
    const res = await fetch(`/api/clients/${id}`);
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Erreur lors du chargement du client');
    }
    return res.json();
  },

  /**
   * Créer un nouveau client
   */
  create: async (data: any) => {
    const res = await fetch('/api/clients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Erreur lors de la création du client');
    }
    return res.json();
  },

  /**
   * Mettre à jour un client
   */
  update: async (id: string, data: any) => {
    const res = await fetch(`/api/clients/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Erreur lors de la mise à jour du client');
    }
    return res.json();
  },

  /**
   * Supprimer un client
   */
  delete: async (id: string) => {
    const res = await fetch(`/api/clients/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Erreur lors de la suppression du client');
    }
    return res.json();
  },
};
