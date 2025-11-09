/**
 * Service centralisé pour gérer les dépenses (expenses)
 * Gère les opérations CRUD + upload de fichiers + OCR
 */

export interface Expense {
  _id?: string;
  userId?: string;
  vendor: string; // Nom du fournisseur
  amount: number;
  taxAmount: number;
  date: Date | string;
  category: string;
  description?: string;
  invoiceNumber?: string;
  paymentMethod?: string;
  receiptImage?: string;
  status?: 'pending' | 'validated' | 'rejected';
  notes?: string;
  receiptUrl?: string;
  ocrConfidence?: number;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface UploadExpenseData {
  file: File;
  supplierName: string;
  amount: number;
  taxAmount?: number;
  date: string;
  category: string;
  notes?: string;
  description?: string;
}

class ExpenseService {
  private baseUrl = '/api/expenses';

  /**
   * Récupère toutes les dépenses de l'utilisateur
   */
  async getAll(): Promise<Expense[]> {
    const res = await fetch(this.baseUrl);
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Erreur lors de la récupération des dépenses');
    }
    return res.json();
  }

  /**
   * Récupère une dépense par ID
   */
  async getById(id: string): Promise<Expense> {
    const res = await fetch(`${this.baseUrl}/${id}`);
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Erreur lors de la récupération de la dépense');
    }
    return res.json();
  }

  /**
   * Crée une nouvelle dépense avec upload de fichier
   */
  async create(data: UploadExpenseData): Promise<Expense> {
    const formData = new FormData();
    
    // Ajouter l'image avec la clé 'image' comme attendu par l'API
    formData.append('image', data.file);
    
    // Créer l'objet de données
    const expenseData = {
      vendor: data.supplierName,
      amount: data.amount,
      taxAmount: data.taxAmount || 0,
      date: data.date,
      category: data.category,
      description: data.description || data.notes || '',
      invoiceNumber: '',
      paymentMethod: '',
    };
    
    // Ajouter les données en JSON stringifié
    formData.append('data', JSON.stringify(expenseData));

    const res = await fetch(this.baseUrl, {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Erreur lors de la création de la dépense');
    }
    return res.json();
  }

  /**
   * Met à jour une dépense existante
   */
  async update(id: string, data: Partial<Expense>): Promise<Expense> {
    const res = await fetch(`${this.baseUrl}/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Erreur lors de la modification de la dépense');
    }
    return res.json();
  }

  /**
   * Supprime une dépense
   */
  async delete(id: string): Promise<void> {
    const res = await fetch(`${this.baseUrl}/${id}`, {
      method: 'DELETE',
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Erreur lors de la suppression de la dépense');
    }
  }

  /**
   * Valide une dépense (change le statut à 'validated')
   */
  async validate(id: string): Promise<Expense> {
    return this.update(id, { status: 'validated' });
  }

  /**
   * Rejette une dépense (change le statut à 'rejected')
   */
  async reject(id: string): Promise<Expense> {
    return this.update(id, { status: 'rejected' });
  }

  /**
   * Télécharge le justificatif d'une dépense
   */
  downloadReceipt(expense: Expense): void {
    if (!expense.receiptUrl) {
      throw new Error('Aucun justificatif disponible');
    }
    window.open(expense.receiptUrl, '_blank');
  }

  /**
   * Effectue l'OCR sur un fichier et retourne les données extraites
   * (peut être appelé avant create pour pré-remplir le formulaire)
   */
  async performOCR(file: File): Promise<{
    supplierName: string;
    amount: number;
    taxAmount: number;
    date: Date | null;
    invoiceNumber: string;
    confidence: number;
  }> {
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch('/api/expenses/ocr', {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Erreur lors de l\'OCR');
    }
    return res.json();
  }

  /**
   * Obtient des statistiques sur les dépenses
   */
  async getStats(period?: { start: string; end: string }): Promise<{
    total: number;
    count: number;
    byCategory: Record<string, number>;
    byMonth: Record<string, number>;
  }> {
    const params = new URLSearchParams();
    if (period) {
      params.append('start', period.start);
      params.append('end', period.end);
    }

    const res = await fetch(`${this.baseUrl}/stats?${params.toString()}`);
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Erreur lors de la récupération des statistiques');
    }
    return res.json();
  }
}

// Export singleton
export const expenseService = new ExpenseService();
