'use client';

import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import ServiceSelector from '@/components/common/ServiceSelector';
import { 
  FiEdit2, FiFileText, FiCalendar, FiX, FiDollarSign,
  FiSave, FiLoader, FiCheckCircle, FiAlertCircle, FiClock
} from 'react-icons/fi';

interface QuoteFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  form: any;
  setForm: (f: any) => void;
  formError: string | null;
  formLoading: boolean;
  clients: { _id: string; name: string }[];
  editMode: boolean;
  handleFormChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
}

const QuoteFormModal: React.FC<QuoteFormModalProps> = ({
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
    if (
      form.subtotal !== subtotal ||
      form.taxAmount !== taxAmount ||
      form.total !== total
    ) {
      setForm({ ...form, subtotal, taxAmount, total });
    }
    // eslint-disable-next-line
  }, [form?.items]);

  // Handler pour changer un champ d'item
  const handleItemChange = (idx: number, field: string, value: any) => {
    const items = form.items ? [...form.items] : [];
    let v = value;
    // Forcer le type number pour les champs numériques
    if (['quantity', 'unitPrice', 'taxRate'].includes(field)) {
      v = value === '' ? '' : Number(value);
    }
    items[idx] = { ...items[idx], [field]: v };
    setForm({ ...form, items });
  };

  // Ajouter une ligne
  const addItem = () => {
    const items = form.items ? [...form.items] : [];
    items.push({ description: '', quantity: 1, unitPrice: 0, taxRate: 20, unit: 'unit' });
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in p-4">
      <div className="bg-gray-900/95 backdrop-blur-lg rounded-2xl shadow-2xl border border-gray-700/50 w-full max-w-4xl max-h-[90vh] overflow-hidden animate-slide-in-up">
        {/* Header */}
        <div className={`${editMode ? 'bg-gradient-to-r from-indigo-600 to-blue-600' : 'bg-gradient-to-r from-green-500 to-green-600'} p-6 text-white border-b border-gray-700/50`}>
          <div className="flex items-center gap-3 mb-2">
            {editMode ? <FiEdit2 className="w-6 h-6" /> : <FiFileText className="w-6 h-6" />}
            <h2 className="text-2xl font-bold">
              {editMode ? 'Modifier le devis' : 'Nouveau devis'}
            </h2>
          </div>
          <p className="text-sm opacity-90">
            {editMode ? 'Mettez à jour les informations du devis' : 'Créez un nouveau devis pour votre client'}
          </p>
        </div>

        {/* Body scrollable */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          <form id="quote-form" onSubmit={onSubmit} className="space-y-6">
            {/* Section Client et Dates */}
            <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50 space-y-4">
              <div className="flex items-center gap-2 mb-3">
                <FiFileText className="w-5 h-5 text-gray-300" />
                <h3 className="font-semibold text-white text-lg">Informations générales</h3>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Client *</label>
                <select
                  className="w-full h-10 bg-gray-800/50 border border-gray-700 text-white rounded-lg px-3 text-sm focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-colors"
                  name="clientId"
                  value={form?.clientId || ''}
                  onChange={handleFormChange}
                  required
                  disabled={editMode}
                >
                  <option value="">Sélectionnez un client</option>
                  {clients.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
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
                    className="w-full h-10 bg-gray-800/50 border border-gray-700 text-white rounded-lg px-3 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-colors"
                    name="issueDate"
                    type="date"
                    value={
                      form?.issueDate
                        ? typeof form.issueDate === 'string'
                          ? form.issueDate.slice(0, 10)
                          : new Date(form.issueDate).toISOString().slice(0, 10)
                        : ''
                    }
                    onChange={handleFormChange}
                    required
                  />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-300 mb-2">
                    <FiClock className="w-4 h-4" />
                    Valable jusqu'au *
                  </label>
                  <input
                    className="w-full h-10 bg-gray-800/50 border border-gray-700 text-white rounded-lg px-3 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-colors"
                    name="validUntil"
                    type="date"
                    value={
                      form?.validUntil
                        ? typeof form.validUntil === 'string'
                          ? form.validUntil.slice(0, 10)
                          : new Date(form.validUntil).toISOString().slice(0, 10)
                        : ''
                    }
                    onChange={handleFormChange}
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Par défaut : 30 jours après la date d'émission</p>
                </div>
              </div>
            </div>

            {/* Section Lignes du devis */}
            <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <FiFileText className="w-5 h-5 text-gray-300" />
                  <h3 className="text-lg font-semibold text-white">Lignes du devis</h3>
                </div>
                <button
                  type="button"
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-semibold transition-all shadow-lg shadow-green-500/20"
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
                      <div
                        key={idx}
                        className="bg-gray-900/50 p-4 rounded-xl border border-gray-700/50 hover:border-green-500/50 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <span className="text-sm font-bold text-gray-300">Ligne {idx + 1}</span>
                          {form.items.length > 1 && (
                            <button
                              type="button"
                              className="flex items-center gap-1 text-red-400 hover:text-red-300 text-sm font-medium"
                              onClick={() => removeItem(idx)}
                            >
                              <FiX className="w-4 h-4" />
                              Supprimer
                            </button>
                          )}
                        </div>
  
                        {/* Description */}
                        <div className="mb-3">
                          <label className="flex items-center gap-2 text-sm font-semibold text-gray-300 mb-2">
                            <FiFileText className="w-4 h-4" />
                            Description *
                          </label>
                          <input
                            className="w-full h-10 bg-gray-800/50 border border-gray-700 text-white rounded-lg px-3 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors placeholder:text-gray-500"
                            placeholder="Ex: Développement web, Consultation, Produit X..."
                            value={item.description || ''}
                            onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                            required
                          />
                        </div>
  
                        {/* Grille des champs numériques */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          <div>
                            <label className="block text-xs font-semibold text-gray-300 mb-2">Qté</label>
                            <input
                              className="w-full h-10 bg-gray-800/50 border border-gray-700 text-white rounded-lg px-3 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                              type="number"
                              min="0.001"
                              step="0.001"
                              placeholder="1"
                              value={item.quantity ?? ''}
                              onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-400 mb-1">Prix unitaire HT</label>
                            <div className="relative">
                              <input
                                className="w-full h-10 bg-gray-800/50 border border-gray-700 text-white rounded-lg px-3 pr-6 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                type="number"
                                min="0"
                                step="0.01"
                                placeholder="0.00"
                                value={item.unitPrice ?? ''}
                                onChange={(e) => handleItemChange(idx, 'unitPrice', e.target.value)}
                                required
                              />
                              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-500">€</span>
                            </div>
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-gray-300 mb-2">TVA (%)</label>
                            <input
                              className="w-full h-10 bg-gray-800/50 border border-gray-700 text-white rounded-lg px-3 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                              type="number"
                              min="0"
                              step="0.01"
                              placeholder="20"
                              value={item.taxRate ?? ''}
                              onChange={(e) => handleItemChange(idx, 'taxRate', e.target.value)}
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-gray-300 mb-2">Unité</label>
                            <select
                              className="w-full h-10 bg-gray-800/50 border border-gray-700 text-white rounded-lg px-3 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                              value={item.unit || 'unit'}
                              onChange={(e) => handleItemChange(idx, 'unit', e.target.value)}
                            >
                              <option value="unit">Unité</option>
                              <option value="hour">Heure</option>
                              <option value="day">Jour</option>
                              <option value="month">Mois</option>
                              <option value="kg">Kg</option>
                            </select>
                          </div>
                        </div>
  
                        {/* Total ligne */}
                        <div className="mt-3 pt-3 border-t border-gray-700/50 text-right">
                          <span className="text-xs text-gray-400">Total ligne HT : </span>
                          <span className="text-sm font-bold text-green-400">
                            {((item.quantity || 0) * (item.unitPrice || 0)).toFixed(2)} €
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <p className="text-center text-gray-400 py-4">Aucune ligne. Cliquez sur "Ajouter une ligne"</p>
              )}
            </div>

            {/* Totaux */}
            {form?.items && form.items.length > 0 && (
              <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
                <div className="flex items-center gap-2 mb-4">
                  <FiDollarSign className="w-5 h-5 text-gray-300" />
                  <h3 className="text-lg font-semibold text-white">Récapitulatif</h3>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-300">Total HT</span>
                    <span className="font-semibold text-gray-100">
                      {(form.subtotal || 0).toFixed(2)} €
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-300">TVA</span>
                    <span className="font-semibold text-gray-100">
                      {(form.taxAmount || 0).toFixed(2)} €
                    </span>
                  </div>
                  <div className="flex justify-between text-xl font-bold pt-3 border-t border-gray-700/50">
                    <span className="text-white">Total TTC</span>
                    <span className="text-green-400">{(form.total || 0).toFixed(2)} €</span>
                  </div>
                </div>
              </div>
            )}

            {/* Notes et conditions */}
            <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50 space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <FiFileText className="w-5 h-5 text-gray-400" />
                <h3 className="text-sm font-bold text-gray-200">Notes et conditions</h3>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Notes (visibles par le client)</label>
                <textarea
                  className="w-full bg-gray-800/50 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors resize-none placeholder:text-gray-500"
                  name="notes"
                  placeholder="Ajoutez des notes ou précisions pour le client..."
                  value={form?.notes || ''}
                  onChange={handleFormChange}
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Notes privées (internes uniquement)</label>
                <textarea
                  className="w-full bg-gray-800/50 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-colors resize-none placeholder:text-gray-500"
                  name="privateNotes"
                  placeholder="Notes internes non visibles par le client..."
                  value={form?.privateNotes || ''}
                  onChange={handleFormChange}
                  rows={2}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Conditions du devis</label>
                <textarea
                  className="w-full bg-gray-800/50 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors resize-none placeholder:text-gray-500"
                  name="terms"
                  placeholder="Ex: Devis valable 30 jours, Acompte de 30% à la commande..."
                  value={form?.terms || ''}
                  onChange={handleFormChange}
                  rows={3}
                />
              </div>
            </div>

            {/* Message d'erreur */}
            {formError && (
              <div className="flex items-center gap-3 p-4 bg-red-900/30 rounded-xl border border-red-700/50">
                <FiAlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
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
              className="flex-1 h-12 rounded-xl border-2 border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
            >
              Annuler
            </Button>
            <Button
              type="submit"
              form="quote-form"
              disabled={formLoading}
              className={`flex-1 h-12 rounded-xl shadow-lg ${
                editMode
                  ? 'bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 shadow-indigo-500/20'
                  : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-green-500/20'
              }`}
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
                  Créer le devis
                </span>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuoteFormModal;
