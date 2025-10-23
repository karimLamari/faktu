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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden animate-slide-in-up">
        {/* Header */}
        <div className={`${editMode ? 'bg-indigo-600' : 'bg-green-600'} p-6 text-white`}>
          <h2 className="text-2xl font-bold mb-1">
            {editMode ? "✏️ Modifier la facture" : "✨ Nouvelle facture"}
          </h2>
          <p className="text-sm opacity-90">
            {editMode ? "Mettez à jour les informations de la facture" : "Créez une nouvelle facture pour votre client"}
          </p>
        </div>

        {/* Body scrollable */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          <form id="invoice-form" onSubmit={onSubmit} className="space-y-6">
            {/* Section Client et Dates */}
            <div className="bg-blue-50 rounded-xl p-5 border border-blue-100 space-y-4">
              <h3 className="font-semibold text-gray-900 text-lg mb-3">📋 Informations générales</h3>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Client *</label>
                <select
                  className="w-full h-12 border-2 border-gray-300 rounded-xl px-4 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors"
                  name="clientId"
                  value={form?.clientId || ""}
                  onChange={handleFormChange}
                  required
                >
                  <option value="">Sélectionnez un client</option>
                  {clients.map((c) => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </select>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">📅 Date d'émission *</label>
                  <input
                    className="w-full h-12 border-2 border-gray-300 rounded-xl px-4 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors"
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
                  <label className="block text-sm font-semibold text-gray-700 mb-2">⏰ Date d'échéance *</label>
                  <input
                    className="w-full h-12 border-2 border-gray-300 rounded-xl px-4 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors"
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
            </div>
            {/* Section Lignes de facture */}
            <div className="bg-green-50 rounded-xl p-5 border border-green-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">🧾 Lignes de la facture</h3>
                <button 
                  type="button" 
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-semibold transition-all shadow-md"
                  onClick={addItem}
                >
                  <span className="text-lg">+</span>
                  Ajouter une ligne
                </button>
              </div>

              {form.items && form.items.length > 0 ? (
                <div className="space-y-4">
                  {form.items.map((item: any, idx: number) => (
                    <div key={idx} className="bg-white border-2 border-gray-200 rounded-xl p-4 hover:border-green-300 transition-all">
                      {/* En-tête de ligne */}
                      <div className="flex items-center justify-between mb-4">
                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">
                          Ligne {idx + 1}
                        </span>
                        <button 
                          type="button" 
                          className="flex items-center gap-1 px-3 py-1.5 text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium transition-colors disabled:opacity-30 disabled:cursor-not-allowed" 
                          onClick={() => removeItem(idx)} 
                          title="Supprimer cette ligne"
                          disabled={form.items.length === 1}
                        >
                          🗑️ Supprimer
                        </button>
                      </div>

                      {/* Description */}
                      <div className="mb-3">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          📝 Description *
                        </label>
                        <input
                          className="w-full h-11 border-2 border-gray-300 rounded-xl px-4 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                          placeholder="Ex: Développement web, Consultation, Produit X..."
                          value={item.description || ""}
                          onChange={e => handleItemChange(idx, "description", e.target.value)}
                          required
                        />
                      </div>

                      {/* Grille des champs numériques */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-2">
                            Qté
                          </label>
                          <input
                            className="w-full h-10 border-2 border-gray-300 rounded-lg px-3 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
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
                          <label className="block text-xs font-semibold text-gray-700 mb-2">
                            TVA (%)
                          </label>
                          <input
                            className="w-full h-10 border-2 border-gray-300 rounded-lg px-3 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="20"
                            value={item.taxRate ?? ""}
                            onChange={e => handleItemChange(idx, "taxRate", e.target.value)}
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-2">
                            Unité
                          </label>
                          <select
                            className="w-full h-10 border-2 border-gray-300 rounded-lg px-3 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
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
                      <div className="mt-3 pt-3 border-t-2 border-green-200 bg-green-50 rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold text-green-700">💰 Total HT de cette ligne:</span>
                          <span className="text-lg font-bold text-green-900">
                            {((item.quantity || 0) * (item.unitPrice || 0)).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
                          </span>
                        </div>
                      </div>
                  </div>
                ))}
              </div>
              ) : (
                <div className="text-center py-12 px-4">
                  <div className="text-6xl mb-4">📋</div>
                  <p className="text-gray-500 font-medium mb-1">Aucune ligne pour l'instant</p>
                  <p className="text-sm text-gray-400">Cliquez sur "Ajouter une ligne" pour commencer</p>
                </div>
              )}
          </div>
          {/* Calculs automatiques - Section orange */}
          <div className="bg-orange-50 rounded-xl p-5 border-2 border-orange-200">
            <h3 className="text-sm font-bold text-orange-800 mb-4 flex items-center gap-2">
              🧮 Calculs automatiques
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-orange-700 mb-2">
                  Sous-total HT
                </label>
                <div className="flex items-center gap-2 bg-white rounded-lg px-4 py-3 border-2 border-orange-300">
                  <span className="text-lg font-bold text-orange-900">
                    {(form?.subtotal || 0).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
                  </span>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-orange-700 mb-2">
                  TVA
                </label>
                <div className="flex items-center gap-2 bg-white rounded-lg px-4 py-3 border-2 border-orange-300">
                  <span className="text-lg font-bold text-orange-900">
                    {(form?.taxAmount || 0).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
                  </span>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-orange-700 mb-2">
                  💰 Total TTC
                </label>
                <div className="flex items-center gap-2 bg-orange-500 rounded-lg px-4 py-3 border-2 border-orange-600 shadow-md">
                  <span className="text-xl font-bold text-white">
                    {(form?.total || 0).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
                  </span>
                </div>
              </div>
            </div>
          </div>
          {/* Notes - Section grise */}
          <div className="bg-gray-50 rounded-xl p-5 border-2 border-gray-200">
            <label className="flex items-center gap-2 text-sm font-bold text-gray-800 mb-3">
              📝 Notes
            </label>
            <textarea
              className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-colors resize-none"
              name="notes"
              placeholder="Ajoutez des notes ou conditions particulières..."
              value={form?.notes || ""}
              onChange={e => setForm({ ...form, notes: e.target.value })}
              rows={3}
            />
          </div>

          {/* Statut et méthode de paiement - Section bleue */}
          <div className="bg-blue-50 rounded-xl p-5 border-2 border-blue-200">
            <h3 className="text-sm font-bold text-blue-800 mb-4 flex items-center gap-2">
              💳 Informations de paiement
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-blue-700 mb-2">
                  Statut du paiement *
                </label>
                <select
                  className="w-full h-12 border-2 border-blue-300 rounded-xl px-4 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  name="paymentStatus"
                  value={form?.paymentStatus || "pending"}
                  onChange={handleFormChange}
                  required
                >
                  <option value="pending">⏳ En attente</option>
                  <option value="paid">✅ Payé</option>
                  <option value="partially_paid">⚠️ Partiellement payé</option>
                  <option value="overdue">🔴 En retard</option>
                  <option value="cancelled">❌ Annulée</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-purple-700 mb-2">
                  Méthode de paiement *
                </label>
                <select
                  className="w-full h-12 border-2 border-purple-300 rounded-xl px-4 text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                  name="paymentMethod"
                  value={form?.paymentMethod || "bank_transfer"}
                  onChange={handleFormChange}
                  required
                >
                  <option value="bank_transfer">🏦 Virement bancaire</option>
                  <option value="check">📝 Chèque</option>
                  <option value="cash">💵 Espèces</option>
                  <option value="card">💳 Carte bancaire</option>
                  <option value="online">🌐 Paiement en ligne</option>
                  <option value="other">➕ Autre</option>
                </select>
              </div>
            </div>
          </div>
            {/* Message d'erreur */}
            {formError && (
              <div className="flex items-center gap-3 p-4 bg-red-50 rounded-xl border border-red-200">
                <span className="text-sm font-medium text-red-800">{formError}</span>
              </div>
            )}
          </form>
        </div>

        {/* Footer avec actions */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex gap-3">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose} 
              disabled={formLoading}
              className="flex-1 h-12 rounded-xl border-2"
            >
              Annuler
            </Button>
            <Button 
              type="submit"
              form="invoice-form"
              disabled={formLoading}
              className={`flex-1 h-12 rounded-xl ${editMode ? 'bg-indigo-600 hover:bg-blue-700 shadow-md' : 'bg-green-600 hover:bg-green-700 shadow-md'}`}
            >
              {formLoading ? "⏳ Enregistrement..." : editMode ? "💾 Enregistrer" : "✨ Créer la facture"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceFormModal;
