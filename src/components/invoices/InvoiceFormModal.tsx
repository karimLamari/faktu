'use client';

import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";

interface InvoiceFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  form: any;
  setForm: (f: any) => void;
  formError: string | null;
  formLoading: boolean;
  clients: { _id: string; name: string }[];
  editMode: boolean;
  handleFormChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}

const InvoiceFormModal: React.FC<InvoiceFormModalProps> = ({
  open,
  onClose,
  onSubmit,
  form,
  setForm,
  formError,
  formLoading,
  clients,
  editMode,
  handleFormChange,
}) => {
  // Calcul automatique à chaque changement d'items
  useEffect(() => {
    if (!form?.items || !Array.isArray(form.items)) return;
    let subtotal = 0;
    let taxAmount = 0;
    form.items.forEach((item: any) => {
      const q = parseFloat(item.quantity) || 0;
      const up = parseFloat(item.unitPrice) || 0;
      const tva = parseFloat(item.taxRate) || 0;
      const ht = q * up;
      subtotal += ht;
      taxAmount += ht * (tva / 100);
    });
    const total = subtotal + taxAmount;
    const amountPaid = typeof form.amountPaid === 'number' ? form.amountPaid : 0;
    const balanceDue = total - amountPaid;
    if (
      form.subtotal !== subtotal ||
      form.taxAmount !== taxAmount ||
      form.total !== total ||
      form.balanceDue !== balanceDue
    ) {
      setForm({ ...form, subtotal, taxAmount, total, balanceDue });
    }
    // eslint-disable-next-line
  }, [form?.items, form?.amountPaid]);

  // Handler pour changer un champ d'item
  const handleItemChange = (idx: number, field: string, value: any) => {
    const items = form.items ? [...form.items] : [];
    let v = value;
    // Forcer le type number pour les champs numériques
    if (["quantity", "unitPrice", "taxRate"].includes(field)) {
      v = value === "" ? "" : Number(value);
    }
    items[idx] = { ...items[idx], [field]: v };
    setForm({ ...form, items });
  };

  // Ajouter une ligne
  const addItem = () => {
    const items = form.items ? [...form.items] : [];
    items.push({ description: "", quantity: 1, unitPrice: 0, taxRate: 0, unit: "unit" });
    setForm({ ...form, items });
  };
  // Supprimer une ligne
  const removeItem = (idx: number) => {
    const items = form.items ? [...form.items] : [];
    items.splice(idx, 1);
    setForm({ ...form, items });
  };

  // Retour conditionnel APRÈS tous les hooks
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
  <div className="bg-white rounded-lg shadow-lg p-4 w-full max-w-md max-h-[80vh] overflow-y-auto mx-2">
        <h2 className="text-lg font-bold mb-4">{editMode ? "Modifier la facture" : "Nouvelle facture"}</h2>
        <form onSubmit={onSubmit} className="space-y-3">
          <div>
            <label className="block text-sm font-medium">Client</label>
            <select
              className="w-full border rounded px-2 py-1"
              name="clientId"
              value={form?.clientId || ""}
              onChange={handleFormChange}
              required
            >
              {clients.map((c) => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-sm font-medium">Date d'émission</label>
              <input
                className="w-full border rounded px-2 py-1"
                name="issueDate"
                type="date"
                value={
                  form?.issueDate
                    ? (typeof form.issueDate === 'string'
                        ? form.issueDate.slice(0, 10)
                        : new Date(form.issueDate).toISOString().slice(0, 10))
                    : ""
                }
                onChange={handleFormChange}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Date d'échéance</label>
              <input
                className="w-full border rounded px-2 py-1"
                name="dueDate"
                type="date"
                value={
                  form?.dueDate
                    ? (typeof form.dueDate === 'string'
                        ? form.dueDate.slice(0, 10)
                        : new Date(form.dueDate).toISOString().slice(0, 10))
                    : ""
                }
                onChange={handleFormChange}
                required
              />
            </div>
          </div>
          {/* Items dynamiques - Section améliorée */}
          <div className="border-2 border-gray-200 rounded-lg p-4 bg-gray-50">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-semibold text-gray-700">📋 Lignes de la facture</label>
              <button 
                type="button" 
                className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition-colors shadow-sm"
                onClick={addItem}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Ajouter une ligne
              </button>
            </div>

            {form.items && form.items.length > 0 ? (
              <div className="space-y-3">
                {form.items.map((item: any, idx: number) => (
                  <div key={idx} className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow">
                    {/* En-tête de ligne avec numéro et bouton supprimer */}
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-gray-500">Ligne {idx + 1}</span>
                      <button 
                        type="button" 
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full p-1 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" 
                        onClick={() => removeItem(idx)} 
                        title="Supprimer cette ligne"
                        disabled={form.items.length === 1}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>

                    {/* Description */}
                    <div className="mb-2">
                      <label className="block text-xs font-medium text-gray-600 mb-1">Description du produit/service</label>
                      <input
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        placeholder="Ex: Développement web, Consultation, Produit X..."
                        value={item.description || ""}
                        onChange={e => handleItemChange(idx, "description", e.target.value)}
                        required
                      />
                    </div>

                    {/* Grille des champs numériques */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Quantité</label>
                        <input
                          className="w-full border border-gray-300 rounded-md px-2 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          type="number"
                          min="0.001"
                          step="0.001"
                          placeholder="1"
                          value={item.quantity ?? ""}
                          onChange={e => handleItemChange(idx, "quantity", e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Prix unitaire HT</label>
                        <div className="relative">
                          <input
                            className="w-full border border-gray-300 rounded-md px-2 py-1.5 pr-6 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="0.00"
                            value={item.unitPrice ?? ""}
                            onChange={e => handleItemChange(idx, "unitPrice", e.target.value)}
                            required
                          />
                          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400">€</span>
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">TVA</label>
                        <div className="relative">
                          <input
                            className="w-full border border-gray-300 rounded-md px-2 py-1.5 pr-6 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="20"
                            value={item.taxRate ?? ""}
                            onChange={e => handleItemChange(idx, "taxRate", e.target.value)}
                            required
                          />
                          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400">%</span>
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Unité</label>
                        <select
                          className="w-full border border-gray-300 rounded-md px-2 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          value={item.unit || "unit"}
                          onChange={e => handleItemChange(idx, "unit", e.target.value)}
                          required
                        >
                          <option value="unit">Unité</option>
                          <option value="hour">Heure</option>
                          <option value="day">Jour</option>
                          <option value="month">Mois</option>
                          <option value="kg">Kg</option>
                        </select>
                      </div>
                    </div>

                    {/* Total de la ligne */}
                    <div className="mt-2 pt-2 border-t border-gray-200">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-600">Total HT de cette ligne:</span>
                        <span className="font-semibold text-gray-900">
                          {((item.quantity || 0) * (item.unitPrice || 0)).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                <svg className="w-12 h-12 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-sm">Aucune ligne pour l'instant</p>
                <p className="text-xs mt-1">Cliquez sur "Ajouter une ligne" pour commencer</p>
              </div>
            )}
          </div>
          {/* Calculs automatiques */}
          <div className="grid grid-cols-3 gap-2 mt-2">
            <div>
              <label className="block text-xs">Sous-total</label>
              <input
                className="w-full border rounded px-2 py-1 bg-gray-100"
                name="subtotal"
                type="number"
                value={form?.subtotal || 0}
                readOnly
              />
            </div>
            <div>
              <label className="block text-xs">TVA</label>
              <input
                className="w-full border rounded px-2 py-1 bg-gray-100"
                name="taxAmount"
                type="number"
                value={form?.taxAmount || 0}
                readOnly
              />
            </div>
            <div>
              <label className="block text-xs">Total</label>
              <input
                className="w-full border rounded px-2 py-1 bg-gray-100"
                name="total"
                type="number"
                value={form?.total || 0}
                readOnly
              />
            </div>
          </div>
          {/* Notes */}
          <div>
            <label className="block text-sm font-medium">Notes</label>
            <textarea
              className="w-full border rounded px-2 py-1"
              name="notes"
              value={form?.notes || ""}
              onChange={e => setForm({ ...form, notes: e.target.value })}
              rows={2}
            />
          </div>
            {/* Statut et méthode de paiement */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium">Statut paiement</label>
                <select
                  className="w-full border rounded px-2 py-1"
                  name="paymentStatus"
                  value={form?.paymentStatus || "pending"}
                  onChange={handleFormChange}
                  required
                >
                  <option value="pending">En attente</option>
                  <option value="paid">Payé</option>
                  <option value="partially_paid">Partiellement payé</option>
                  <option value="overdue">En retard</option>
                  <option value="cancelled">Annulée</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium">Méthode de paiement</label>
                <select
                  className="w-full border rounded px-2 py-1"
                  name="paymentMethod"
                  value={form?.paymentMethod || "bank_transfer"}
                  onChange={handleFormChange}
                  required
                >
                  <option value="bank_transfer">Virement</option>
                  <option value="check">Chèque</option>
                  <option value="cash">Espèces</option>
                  <option value="card">Carte</option>
                  <option value="online">En ligne</option>
                  <option value="other">Autre</option>
                </select>
              </div>
            </div>
          {formError && <div className="text-red-600">{formError}</div>}
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={onClose} disabled={formLoading}>Annuler</Button>
            <Button type="submit" variant="default" disabled={formLoading}>{editMode ? "Enregistrer" : "Créer"}</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InvoiceFormModal;
