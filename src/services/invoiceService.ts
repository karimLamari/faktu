/**
 * Service métier pour les factures (Invoices)
 * Centralise toutes les opérations API liées aux factures
 */

export interface SendInvoiceEmailData {
  invoiceId: string;
  to: string;
  subject: string;
  message: string;
}

export interface SendReminderData {
  invoiceId: string;
  to: string;
  subject: string;
  message: string;
}

export const invoiceService = {
  /**
   * Récupérer toutes les factures de l'utilisateur
   */
  getAll: async () => {
    const res = await fetch('/api/invoices');
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Erreur lors du chargement des factures');
    }
    return res.json();
  },

  /**
   * Récupérer une facture par ID
   */
  getById: async (id: string) => {
    const res = await fetch(`/api/invoices/${id}`);
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Erreur lors du chargement de la facture');
    }
    return res.json();
  },

  /**
   * Créer une nouvelle facture
   */
  create: async (data: any) => {
    const res = await fetch('/api/invoices', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Erreur lors de la création de la facture');
    }
    return res.json();
  },

  /**
   * Mettre à jour une facture existante
   */
  update: async (id: string, data: any) => {
    const res = await fetch(`/api/invoices/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Erreur lors de la mise à jour de la facture');
    }
    return res.json();
  },

  /**
   * Supprimer une facture
   */
  delete: async (id: string) => {
    const res = await fetch(`/api/invoices/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Erreur lors de la suppression de la facture');
    }
    return res.json();
  },

  /**
   * Télécharger le PDF d'une facture
   */
  downloadPDF: async (id: string) => {
    const res = await fetch(`/api/invoices/${id}/pdf`);
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Erreur lors de la génération du PDF');
    }
    return res.blob();
  },

  /**
   * Envoyer une facture par email
   */
  sendEmail: async (data: SendInvoiceEmailData) => {
    const res = await fetch('/api/email/send-invoice', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || "Erreur lors de l'envoi de l'email");
    }
    return res.json();
  },

  /**
   * Envoyer un rappel de paiement
   */
  sendReminder: async (data: SendReminderData) => {
    const res = await fetch('/api/email/send-reminder', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || "Erreur lors de l'envoi du rappel");
    }
    return res.json();
  },
};
