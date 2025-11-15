'use client';

import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import ServiceSelector from '@/components/common/ServiceSelector';
import { 
  FiEdit2, FiFileText, FiCalendar, FiTrash2, FiDollarSign,
  FiCreditCard, FiSave, FiLoader, FiAlertCircle, FiCheckCircle 
} from 'react-icons/fi';

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
  // Déterminer si la facture est en mode "statut seulement" (envoyée ou finalisée)
  const isStatusOnlyMode = editMode && (form?.isFinalized || form?.sentAt);
  const isFinalized = editMode && form?.isFinalized;
  
  // Add service to items handler
  const handleAddService = (service: any) => {
    const items = form.items ? [...form.items] : [];
    items.push({
      description: service.name,
      quantity: 1,
      unitPrice: service.unitPrice,
      taxRate: service.taxRate ?? 20, // Utilise ?? pour gérer le 0 correctement
      unit: service.unit || 'unit'
    });
    setForm({ ...form, items });
  };

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
      <div className="bg-gray-900/95 backdrop-blur-lg rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden animate-slide-in-up border border-gray-700/50">
        {/* Header */}
        <div className={`${editMode ? 'bg-gradient-to-r from-indigo-500 to-blue-500' : 'bg-gradient-to-r from-green-500 to-green-600'} p-6 text-white shadow-lg ${editMode ? 'shadow-indigo-500/20' : 'shadow-green-500/20'}`}>
          <div className="flex items-center gap-3 mb-2">
            {editMode ? <FiEdit2 className="w-6 h-6" /> : <FiFileText className="w-6 h-6" />}
            <h2 className="text-2xl font-bold">
              {editMode ? "Modifier la facture" : "Nouvelle facture"}
            </h2>
          </div>
          <p className="text-sm opacity-90">
            {editMode ? "Mettez à jour les informations de la facture" : "Créez une nouvelle facture pour votre client"}
          </p>
        </div>

        {/* Body scrollable */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          <form id="invoice-form" onSubmit={onSubmit} className="space-y-6">
            {/* Avertissement mode statut uniquement */}
            {isStatusOnlyMode && (
              <div className={`${isFinalized ? 'bg-purple-900/30 border-purple-700/50' : 'bg-orange-900/30 border-orange-700/50'} border rounded-xl p-3 sm:p-4 flex items-start gap-2 sm:gap-3`}>
                <FiAlertCircle className={`w-5 h-5 mt-0.5 flex-shrink-0 ${isFinalized ? 'text-purple-400' : 'text-orange-400'}`} />
                <div className="flex-1 min-w-0">
                  <h4 className={`font-semibold ${isFinalized ? 'text-purple-300' : 'text-orange-300'} mb-1 text-sm sm:text-base`}>
                    {isFinalized ? '🔒 Facture finalisée et archivée' : '📧 Facture envoyée'}
                  </h4>
                  <p className={`text-xs sm:text-sm ${isFinalized ? 'text-purple-200/80' : 'text-orange-200/80'} leading-relaxed`}>
                    {isFinalized 
                      ? 'Cette facture est finalisée. Seul le statut peut être modifié.'
                      : 'Cette facture a été envoyée. Vous pouvez uniquement mettre à jour le statut. Marquez-la comme "Payée" pour pouvoir la finaliser.'}
                  </p>
                </div>
              </div>
            )}
            
            {/* Section Client et Dates */}
            <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50 space-y-4">
              <div className="flex items-center gap-2 mb-3">
                <FiFileText className="w-5 h-5 text-blue-400" />
                <h3 className="font-semibold text-white text-lg">Informations générales</h3>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Client *</label>
                <select
                  className="w-full h-10 bg-gray-800/50 border border-gray-700 text-white rounded-lg px-3 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors"
                  name="clientId"
                  value={form?.clientId || ""}
                  onChange={handleFormChange}
                  required
                >
                  <option value="" className="bg-gray-800">Sélectionnez un client</option>
                  {clients.map((c) => (
                    <option key={c._id} value={c._id} className="bg-gray-800">{c.name}</option>
                  ))}
                </select>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-300 mb-2">
                    <FiCalendar className="w-4 h-4" />
                    Date d'émission *
                  </label>
                  <input
                    className="w-full h-10 bg-gray-800/50 border border-gray-700 text-white rounded-lg px-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors"
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
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-300 mb-2">
                    <FiCalendar className="w-4 h-4" />
                    Date d'échéance *
                  </label>
                  <input
                    className="w-full h-10 bg-gray-800/50 border border-gray-700 text-white rounded-lg px-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors"
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
            <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <FiFileText className="w-5 h-5 text-green-400" />
                  <h3 className="text-lg font-semibold text-white">Lignes de la facture</h3>
                </div>
                <button 
                  type="button" 
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-lg text-sm font-semibold transition-all shadow-lg shadow-green-500/20"
                  onClick={addItem}
                >
                  <span className="text-lg">+</span>
                  Ajouter une ligne
                </button>
              </div>

              {/* Service selector */}
              <ServiceSelector isOpen={open} onAddService={handleAddService} />

              {form.items && form.items.length > 0 ? (
                <div className="space-y-4">
                  {form.items.map((item: any, idx: number) => (
                    <div key={idx} className="bg-gray-900/50 border border-gray-700/50 rounded-xl p-4 hover:border-green-500/50 transition-all">
                      {/* En-tête de ligne */}
                      <div className="flex items-center justify-between mb-4">
                        <span className="px-3 py-1 bg-green-900/30 text-green-400 border border-green-700/50 rounded-full text-xs font-bold">
                          Ligne {idx + 1}
                        </span>
                        <button 
                          type="button" 
                          className="flex items-center gap-1 px-3 py-1.5 text-red-400 hover:bg-red-900/30 rounded-lg text-sm font-medium transition-colors disabled:opacity-30 disabled:cursor-not-allowed" 
                          onClick={() => removeItem(idx)} 
                          title="Supprimer cette ligne"
                          disabled={form.items.length === 1}
                        >
                          <FiTrash2 className="w-4 h-4" />
                          Supprimer
                        </button>
                      </div>

                      {/* Description */}
                      <div className="mb-3">
                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-300 mb-2">
                          <FiFileText className="w-4 h-4" />
                          Description *
                        </label>
                        <input
                          className="w-full h-10 bg-gray-800/50 border border-gray-700 text-white placeholder:text-gray-500 rounded-lg px-3 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                          placeholder="Ex: Développement web, Consultation, Produit X..."
                          value={item.description || ""}
                          onChange={e => handleItemChange(idx, "description", e.target.value)}
                          required
                        />
                      </div>

                      {/* Grille des champs numériques */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-gray-300 mb-2">
                            Qté
                          </label>
                          <input
                            className="w-full h-10 bg-gray-800/50 border border-gray-700 text-white rounded-lg px-3 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
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
                        <label className="block text-xs font-medium text-gray-300 mb-1">Prix unitaire HT</label>
                        <div className="relative">
                          <input
                            className="w-full h-10 bg-gray-800/50 border border-gray-700 text-white rounded-lg px-3 pr-6 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="0.00"
                            value={item.unitPrice ?? ""}
                            onChange={e => handleItemChange(idx, "unitPrice", e.target.value)}
                            required
                          />
                          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-500">€</span>
                        </div>
                      </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-300 mb-2">
                            TVA (%)
                          </label>
                          <input
                            className="w-full h-10 bg-gray-800/50 border border-gray-700 text-white rounded-lg px-3 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
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
                          <label className="block text-xs font-semibold text-gray-300 mb-2">
                            Unité
                          </label>
                          <select
                            className="w-full h-10 bg-gray-800/50 border border-gray-700 text-white rounded-lg px-3 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            value={item.unit || "unit"}
                            onChange={e => handleItemChange(idx, "unit", e.target.value)}
                            required
                          >
                            <option value="unit" className="bg-gray-800">Unité</option>
                            <option value="hour" className="bg-gray-800">Heure</option>
                            <option value="day" className="bg-gray-800">Jour</option>
                            <option value="month" className="bg-gray-800">Mois</option>
                            <option value="kg" className="bg-gray-800">Kg</option>
                          </select>
                        </div>
                      </div>

                      {/* Total de la ligne */}
                      <div className="mt-3 pt-3 border-t-2 border-green-700/50 bg-green-900/20 rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-2 text-sm font-semibold text-green-400">
                            <FiDollarSign className="w-4 h-4" />
                            Total HT de cette ligne:
                          </span>
                          <span className="text-lg font-bold text-green-300">
                            {((item.quantity || 0) * (item.unitPrice || 0)).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
                          </span>
                        </div>
                      </div>
                  </div>
                ))}
              </div>
              ) : (
                <div className="text-center py-12 px-4">
                  <FiFileText className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                  <p className="text-gray-400 font-medium mb-1">Aucune ligne pour l'instant</p>
                  <p className="text-sm text-gray-500">Cliquez sur "Ajouter une ligne" pour commencer</p>
                </div>
              )}
          </div>
          {/* Calculs automatiques - Section orange */}
          <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
            <h3 className="flex items-center gap-2 text-sm font-bold text-blue-400 mb-4">
              <FiDollarSign className="w-5 h-5" />
              Calculs automatiques
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-2">
                  Sous-total HT
                </label>
                <div className="flex items-center gap-2 bg-gray-900/50 rounded-lg px-4 py-3 border border-gray-700/50">
                  <span className="text-lg font-bold text-white">
                    {(form?.subtotal || 0).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
                  </span>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-2">
                  TVA
                </label>
                <div className="flex items-center gap-2 bg-gray-900/50 rounded-lg px-4 py-3 border border-gray-700/50">
                  <span className="text-lg font-bold text-white">
                    {(form?.taxAmount || 0).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
                  </span>
                </div>
              </div>
              <div>
                <label className="flex items-center gap-2 text-xs font-semibold text-gray-300 mb-2">
                  <FiDollarSign className="w-4 h-4" />
                  Total TTC
                </label>
                <div className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-green-600 rounded-lg px-4 py-3 border border-green-600 shadow-lg shadow-green-500/20">
                  <span className="text-xl font-bold text-white">
                    {(form?.total || 0).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
                  </span>
                </div>
              </div>
            </div>
          </div>
          {/* Notes - Section grise */}
          <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
            <label className="flex items-center gap-2 text-sm font-bold text-gray-300 mb-3">
              <FiFileText className="w-4 h-4" />
              Notes
            </label>
            <textarea
              className="w-full bg-gray-800/50 border border-gray-700 text-white placeholder:text-gray-500 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-colors resize-none"
              name="notes"
              placeholder="Ajoutez des notes ou conditions particulières..."
              value={form?.notes || ""}
              onChange={e => setForm({ ...form, notes: e.target.value })}
              rows={3}
            />
          </div>

          {/* Statut et méthode de paiement - Section bleue */}
          <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
            <h3 className="flex items-center gap-2 text-sm font-bold text-blue-400 mb-4">
              <FiCreditCard className="w-5 h-5" />
              Informations de paiement
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Statut de la facture *
                </label>
                <select
                  className="w-full h-10 bg-gray-800/50 border border-gray-700 text-white rounded-lg px-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  name="status"
                  value={form?.status || "draft"}
                  onChange={handleFormChange}
                  disabled={isStatusOnlyMode && !isFinalized}
                  required
                >
                  <option value="draft" className="bg-gray-800">Brouillon</option>
                  <option value="sent" className="bg-gray-800">Envoyée</option>
                  <option value="paid" className="bg-gray-800">Payée</option>
                  <option value="partially_paid" className="bg-gray-800">Partiellement payée</option>
                  <option value="overdue" className="bg-gray-800">En retard</option>
                  <option value="cancelled" className="bg-gray-800">Annulée</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Méthode de paiement *
                </label>
                <select
                  className="w-full h-10 bg-gray-800/50 border border-gray-700 text-white rounded-lg px-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  name="paymentMethod"
                  value={form?.paymentMethod || "bank_transfer"}
                  onChange={handleFormChange}
                  disabled={isStatusOnlyMode}
                  required
                >
                  <option value="bank_transfer" className="bg-gray-800">Virement bancaire</option>
                  <option value="check" className="bg-gray-800">Chèque</option>
                  <option value="cash" className="bg-gray-800">Espèces</option>
                  <option value="card" className="bg-gray-800">Carte bancaire</option>
                  <option value="online" className="bg-gray-800">Paiement en ligne</option>
                  <option value="other" className="bg-gray-800">Autre</option>
                </select>
              </div>
            </div>

            {/* Champ conditionnel pour le montant payé */}
            {form?.status === 'partially_paid' && (
              <div className="mt-4 p-4 bg-orange-900/30 border border-orange-700/50 rounded-xl">
                <label className="flex items-center gap-2 text-sm font-semibold text-orange-300 mb-2">
                  <FiDollarSign className="w-4 h-4" />
                  Montant déjà payé *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max={form?.total || 0}
                    name="amountPaid"
                    value={form?.amountPaid || 0}
                    onChange={handleFormChange}
                    className="w-full h-10 bg-gray-800/50 border border-orange-700/50 text-white rounded-lg px-3 pr-12 text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                    placeholder="0.00"
                    required
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-400">
                    €
                  </span>
                </div>
                <p className="text-xs text-orange-300 mt-2">
                  Total : {(form?.total || 0).toFixed(2)} € • 
                  Reste à payer : {((form?.total || 0) - (form?.amountPaid || 0)).toFixed(2)} €
                </p>
              </div>
            )}
          </div>






            {/* Message d'erreur */}
            {formError && (
              <div className="flex items-center gap-3 p-4 bg-red-900/30 rounded-xl border border-red-700/50">
                <span className="text-sm font-medium text-red-300">{formError}</span>
              </div>
            )}
          </form>
        </div>

        {/* Footer avec actions */}
        <div className="p-6 border-t border-gray-700/50 bg-gray-800/50">
          <div className="flex gap-3">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose} 
              disabled={formLoading}
              className="flex-1 h-12 rounded-xl border-2 bg-gray-800/50 border-gray-700 text-gray-300 hover:bg-gray-700/50"
            >
              Annuler
            </Button>
            <Button 
              type="submit"
              form="invoice-form"
              disabled={formLoading}
              className={`flex-1 h-12 rounded-xl shadow-lg ${editMode ? 'bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600 shadow-indigo-500/20' : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-green-500/20'}`}
            >
              {formLoading ? (
                <span className="flex items-center gap-2">
                  <FiLoader className="w-4 h-4 animate-spin" />
                  Enregistrement...
                </span>
              ) : editMode ? (
                <span className="flex items-center gap-2">
                  <FiSave className="w-4 h-4" />
                  Enregistrer
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <FiCheckCircle className="w-4 h-4" />
                  Créer la facture
                </span>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceFormModal;
