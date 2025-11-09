/**
 * Service métier pour les devis (Quotes)
 * Centralise toutes les opérations API liées aux devis
 * Sépare la logique métier de l'interface utilisateur
 */

export interface ConvertQuoteData {
  issueDate: string;
  dueDate: string;
}

export const quoteService = {
  /**
   * Récupérer tous les devis de l'utilisateur
   */
  getAll: async () => {
    const res = await fetch('/api/quotes');
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Erreur lors du chargement des devis');
    }
    return res.json();
  },

  /**
   * Récupérer un devis par ID
   */
  getById: async (id: string) => {
    const res = await fetch(`/api/quotes/${id}`);
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Erreur lors du chargement du devis');
    }
    return res.json();
  },

  /**
   * Créer un nouveau devis
   */
  create: async (data: any) => {
    const res = await fetch('/api/quotes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Erreur lors de la création du devis');
    }
    return res.json();
  },

  /**
   * Mettre à jour un devis existant
   */
  update: async (id: string, data: any) => {
    const res = await fetch(`/api/quotes/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Erreur lors de la mise à jour du devis');
    }
    return res.json();
  },

  /**
   * Supprimer un devis
   */
  delete: async (id: string) => {
    const res = await fetch(`/api/quotes/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Erreur lors de la suppression du devis');
    }
    return res.json();
  },

  /**
   * Changer le statut d'un devis (accepted/rejected)
   */
  updateStatus: async (id: string, status: 'accepted' | 'rejected') => {
    const res = await fetch(`/api/quotes/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Erreur lors du changement de statut');
    }
    return res.json();
  },

  /**
   * Convertir un devis en facture
   */
  convertToInvoice: async (id: string, data: ConvertQuoteData) => {
    const res = await fetch(`/api/quotes/${id}/convert`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Erreur lors de la conversion');
    }
    return res.json();
  },

  /**
   * Télécharger le PDF d'un devis
   */
  downloadPDF: async (id: string) => {
    const res = await fetch(`/api/quotes/${id}/pdf`);
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Erreur lors de la génération du PDF');
    }
    return res.blob();
  },

  /**
   * Envoyer un devis par email
   */
  sendEmail: async (quoteId: string, to: string, subject: string, message: string) => {
    const res = await fetch('/api/email/send-quote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quoteId, to, subject, message }),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Erreur lors de l\'envoi de l\'email');
    }
    return res.json();
  },
};
