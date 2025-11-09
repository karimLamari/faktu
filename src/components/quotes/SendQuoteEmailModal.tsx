'use client';

import React, { useState } from 'react';
import { IQuote } from '@/models/Quote';
import { FiMail, FiSend, FiMessageSquare, FiLoader } from 'react-icons/fi';

interface SendQuoteEmailModalProps {
  quote: IQuote & { clientId: { name: string; email?: string } };
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function SendQuoteEmailModal({ quote, isOpen, onClose, onSuccess }: SendQuoteEmailModalProps) {
  const [recipientEmail, setRecipientEmail] = useState(quote.clientId.email || '');
  const [customMessage, setCustomMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!recipientEmail) {
      alert('Veuillez saisir une adresse email');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/email/send-quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quoteId: quote._id,
          recipientEmail,
          customMessage,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Erreur lors de l\'envoi');
      }

      alert(`✅ Devis envoyé avec succès à ${data.sentTo}`);
      onSuccess();
      onClose();
    } catch (error: any) {
      alert(`❌ ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-gray-900/95 backdrop-blur-lg rounded-2xl shadow-2xl border border-gray-700/50 w-full max-w-2xl">
        {/* Header */}
        <div className="p-6 border-b border-gray-700/50 bg-gradient-to-r from-purple-600 to-blue-600">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <FiMail className="w-6 h-6" /> Envoyer le devis par email
          </h2>
          <p className="text-sm text-blue-100 mt-1">
            Devis {quote.quoteNumber} - {quote.clientId.name}
          </p>
        </div>

        {/* Form */}
        <div className="p-6 space-y-5">
          {/* Email destinataire */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-300 mb-2">
              <FiSend className="w-4 h-4" /> Email du destinataire <span className="text-red-400">*</span>
            </label>
            <input
              type="email"
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
              placeholder="client@exemple.com"
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all placeholder:text-gray-500"
              required
            />
            <p className="text-xs text-gray-400 mt-1">
              Email du client pré-rempli. Vous pouvez le modifier si besoin.
            </p>
          </div>

          {/* Message personnalisé */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-300 mb-2">
              <FiMessageSquare className="w-4 h-4" /> Message personnalisé (optionnel)
            </label>
            <textarea
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              placeholder="Ajouter un message personnel à votre email..."
              rows={4}
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all resize-none placeholder:text-gray-500"
            />
          </div>

          {/* Informations */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>ℹ️ Informations :</strong>
            </p>
            <ul className="text-sm text-blue-700 mt-2 space-y-1 list-disc list-inside">
              <li>Le devis sera envoyé en pièce jointe au format PDF</li>
              <li>Un email de confirmation sera automatiquement généré</li>
              <li>Le statut du devis sera mis à jour après l'envoi</li>
            </ul>
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
          >
            Annuler
          </button>
          <button
            onClick={handleSend}
            disabled={isLoading || !recipientEmail}
            className="px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <FiLoader className="animate-spin w-4 h-4" />
                Envoi en cours...
              </>
            ) : (
              <>
                <FiSend className="w-4 h-4" /> Envoyer le devis
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
