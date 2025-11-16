'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { IQuote } from '@/models/Quote';
import { FiRepeat, FiCalendar, FiClock, FiAlertCircle } from 'react-icons/fi';
import { useZodForm } from '@/hooks/useZodForm';
import { convertQuoteSchema } from '@/lib/validations/quotes';

interface ConvertQuoteModalProps {
  open: boolean;
  onClose: () => void;
  quote: IQuote & { clientId: { name: string; paymentTerms?: number } };
  onConvert: (data: { issueDate: string; dueDate: string }) => Promise<void>;
}

export default function ConvertQuoteModal({ open, onClose, quote, onConvert }: ConvertQuoteModalProps) {
  // ========================================
  // DATES PAR DÉFAUT
  // ========================================

  const today = new Date().toISOString().slice(0, 10);
  const paymentTerms = quote.clientId.paymentTerms || 30;
  const defaultDueDate = new Date(Date.now() + paymentTerms * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);

  // ========================================
  // ÉTAT AVEC HOOK DE VALIDATION
  // ========================================

  const {
    formData,
    errors,
    touched,
    isValid,
    handleChange,
    handleBlur,
    handleSubmit,
  } = useZodForm(convertQuoteSchema, {
    issueDate: today,
    dueDate: defaultDueDate,
  }, {
    mode: 'onChange',
    validateOnMount: false,
  });

  // ========================================
  // ÉTAT DE CHARGEMENT
  // ========================================

  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // ========================================
  // SUBMIT
  // ========================================

  const onSubmit = handleSubmit(async (validatedData) => {
    setSubmitError(null);
    setIsLoading(true);

    try {
      await onConvert(validatedData);
      onClose();
    } catch (err: any) {
      setSubmitError(err.message || 'Erreur lors de la conversion');
    } finally {
      setIsLoading(false);
    }
  });

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in p-4">
      <div className="bg-gray-900/95 backdrop-blur-lg rounded-2xl shadow-2xl border border-gray-700/50 w-full max-w-md animate-slide-in-up">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 text-white rounded-t-2xl border-b border-gray-700/50">
          <h2 className="text-2xl font-bold mb-1 flex items-center gap-2">
            <FiRepeat className="w-6 h-6" /> Convertir en facture
          </h2>
          <p className="text-sm opacity-90">Transformez ce devis en facture</p>
        </div>

        {/* Body */}
        <form onSubmit={onSubmit} className="p-6 space-y-6">
          {/* Info devis */}
          <div className="bg-green-900/30 border-2 border-green-700/50 rounded-xl p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-300">Devis</span>
              <span className="font-bold text-white">{quote.quoteNumber}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-300">Client</span>
              <span className="font-semibold text-white">{quote.clientId.name}</span>
            </div>
            <div className="flex justify-between text-sm pt-2 border-t border-green-700/50">
              <span className="text-gray-300">Montant</span>
              <span className="font-bold text-green-400 text-lg">
                {quote.total.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
              </span>
            </div>
          </div>

          {/* Dates */}
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-300">
                <FiCalendar className="w-4 h-4" /> Date d'émission de la facture <span className="text-red-400">*</span>
              </label>
              <input
                type="date"
                name="issueDate"
                value={formData.issueDate}
                onChange={handleChange}
                onBlur={() => handleBlur('issueDate')}
                className="w-full h-12 bg-gray-800/50 border-2 border-gray-700 text-white rounded-xl px-4 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-colors"
                required
              />
              {touched.issueDate && errors.issueDate && (
                <p className="text-sm text-red-400 flex items-center gap-1">
                  <FiAlertCircle className="w-4 h-4" />
                  {errors.issueDate}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-300">
                <FiClock className="w-4 h-4" /> Date d'échéance <span className="text-red-400">*</span>
              </label>
              <input
                type="date"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleChange}
                onBlur={() => handleBlur('dueDate')}
                className="w-full h-12 bg-gray-800/50 border-2 border-gray-700 text-white rounded-xl px-4 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-colors"
                required
              />
              {touched.dueDate && errors.dueDate && (
                <p className="text-sm text-red-400 flex items-center gap-1">
                  <FiAlertCircle className="w-4 h-4" />
                  {errors.dueDate}
                </p>
              )}
              <p className="text-xs text-gray-500">
                Calculée selon le délai de paiement du client ({paymentTerms} jours)
              </p>
            </div>
          </div>

          {/* Info box */}
          <div className="bg-blue-900/30 border border-blue-700/50 rounded-lg p-4 flex gap-3">
            <span className="text-2xl">ℹ️</span>
            <div className="text-sm text-blue-200">
              <p className="font-semibold mb-1">Une facture sera créée avec :</p>
              <ul className="list-disc list-inside space-y-1 text-xs text-blue-300">
                <li>Les mêmes articles et montants</li>
                <li>Statut "Brouillon" (modifiable)</li>
                <li>Le devis sera marqué comme "Converti"</li>
              </ul>
            </div>
          </div>

          {/* Validation indicator */}
          <div className="text-sm text-gray-400">
            {!isValid && Object.keys(errors).length > 0 && (
              <span className="text-red-400 flex items-center gap-1">
                <FiAlertCircle className="w-4 h-4" />
                {Object.keys(errors).length} erreur(s) à corriger
              </span>
            )}
            {isValid && (touched.issueDate || touched.dueDate) && (
              <span className="text-green-400">
                ✓ Dates valides
              </span>
            )}
          </div>

          {/* Error */}
          {submitError && (
            <div className="bg-red-900/30 border border-red-700/50 rounded-lg p-4 flex gap-3">
              <FiAlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
              <span className="text-sm font-medium text-red-300">{submitError}</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 h-12 rounded-xl border-2 bg-gray-800/50 border-gray-700 text-gray-300 hover:bg-gray-700/50"
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={!isValid || isLoading}
              className="flex-1 h-12 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-md text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? '⏳ Conversion...' : '✅ Convertir'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
