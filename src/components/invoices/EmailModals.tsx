"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { IInvoice } from "@/models/Invoice";
import { Mail, X, Send, AlertCircle, CheckCircle, Loader2 } from "lucide-react";

interface SendEmailModalProps {
  invoice: IInvoice;
  clientEmail: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function SendEmailModal({ invoice, clientEmail, onClose, onSuccess }: SendEmailModalProps) {
  const [email, setEmail] = useState(clientEmail);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSend = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/email/send-invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoiceId: invoice._id,
          recipientEmail: email,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Erreur lors de l\'envoi');
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l\'envoi de l\'email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-slide-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header avec gradient */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Mail className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Envoyer la facture</h2>
                <p className="text-sm text-blue-100">Par email avec PDF</p>
              </div>
            </div>
            <button
              onClick={onClose}
              disabled={loading}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/20 transition-colors disabled:opacity-50"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Info facture */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl p-4 border border-blue-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Facture</span>
              <span className="text-lg font-bold text-gray-900">{invoice.invoiceNumber}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Montant</span>
              <span className="text-2xl font-bold text-blue-600">
                {invoice.total.toFixed(2)} €
              </span>
            </div>
          </div>

          {/* Email input */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-semibold text-gray-700">
              Email destinataire
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@client.com"
              disabled={loading}
              className="h-12 rounded-xl border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          {/* Info message */}
          {!error && (
            <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-xl border border-blue-200">
              <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-800">
                <p className="font-semibold mb-1">Le PDF sera joint automatiquement</p>
                <p className="text-blue-700">Un email professionnel sera envoyé avec la facture en pièce jointe.</p>
              </div>
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="flex items-start gap-3 p-4 bg-red-50 rounded-xl border border-red-200 animate-slide-in-up">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-red-800">
                <p className="font-semibold">{error}</p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="flex-1 h-12 rounded-xl border-2 hover:bg-gray-50"
            >
              Annuler
            </Button>
            <Button
              onClick={handleSend}
              disabled={loading || !email}
              className="flex-1 h-12 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg shadow-blue-500/30"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Envoi en cours...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5 mr-2" />
                  Envoyer
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

interface SendReminderModalProps {
  invoice: IInvoice;
  clientEmail: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function SendReminderModal({ invoice, clientEmail, onClose, onSuccess }: SendReminderModalProps) {
  const [email, setEmail] = useState(clientEmail);
  const [reminderType, setReminderType] = useState<'friendly' | 'firm' | 'final'>('friendly');
  const [customMessage, setCustomMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reminderMessages = {
    friendly: 'Rappel amical concernant le paiement de votre facture.',
    firm: 'Nous attendons toujours le règlement de votre facture.',
    final: 'Dernière relance avant procédure de recouvrement.',
  };

  const handleSend = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/email/send-reminder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoiceId: invoice._id,
          reminderType,
          customMessage: customMessage || undefined,
          recipientEmail: email,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Erreur lors de l\'envoi');
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l\'envoi de la relance');
    } finally {
      setLoading(false);
    }
  };

  const daysPastDue = Math.max(
    0,
    Math.floor((Date.now() - new Date(invoice.dueDate).getTime()) / (1000 * 60 * 60 * 24))
  );

  const reminderTypeConfig = {
    friendly: { 
      icon: '💙', 
      label: 'Amicale', 
      desc: 'Rappel courtois et professionnel',
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    },
    firm: { 
      icon: '⚠️', 
      label: 'Ferme', 
      desc: 'Demande de paiement immédiat',
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200'
    },
    final: { 
      icon: '🚨', 
      label: 'Dernière', 
      desc: 'Avant procédure judiciaire',
      color: 'from-red-500 to-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200'
    },
  };

  const currentConfig = reminderTypeConfig[reminderType];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto animate-slide-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header dynamique selon le type */}
        <div className={`bg-gradient-to-r ${currentConfig.color} p-6 text-white`}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-2xl">
                {currentConfig.icon}
              </div>
              <div>
                <h2 className="text-xl font-bold">Relance client</h2>
                <p className="text-sm text-white/90">{currentConfig.desc}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              disabled={loading}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/20 transition-colors disabled:opacity-50"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Info facture avec alerte retard */}
          <div className={`${currentConfig.bgColor} rounded-xl p-4 border ${currentConfig.borderColor}`}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-600">Facture</span>
              <span className="text-lg font-bold text-gray-900">{invoice.invoiceNumber}</span>
            </div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-600">Montant dû</span>
              <span className="text-2xl font-bold text-gray-900">
                {(invoice.balanceDue || invoice.total).toFixed(2)} €
              </span>
            </div>
            {daysPastDue > 0 && (
              <div className="flex items-center gap-2 pt-3 border-t border-gray-200">
                <AlertCircle className="w-4 h-4 text-red-600" />
                <span className="text-sm text-red-600 font-semibold">
                  En retard de {daysPastDue} jour{daysPastDue > 1 ? 's' : ''}
                </span>
              </div>
            )}
            {invoice.reminders && invoice.reminders.length > 0 && (
              <div className="flex items-center gap-2 pt-2">
                <span className="text-xs text-gray-600">
                  {invoice.reminders.length} relance{invoice.reminders.length > 1 ? 's' : ''} déjà envoyée{invoice.reminders.length > 1 ? 's' : ''}
                </span>
              </div>
            )}
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-semibold text-gray-700">
              Email destinataire
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@client.com"
              disabled={loading}
              className="h-12 rounded-xl border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          {/* Type de relance avec design moderne */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold text-gray-700">Type de relance</Label>
            <div className="grid gap-3">
              {Object.entries(reminderTypeConfig).map(([type, config]) => (
                <label 
                  key={type}
                  className={`
                    flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all
                    ${reminderType === type 
                      ? `${config.borderColor} ${config.bgColor} shadow-md` 
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                    }
                    ${loading ? 'opacity-50 cursor-not-allowed' : ''}
                  `}
                >
                  <input
                    type="radio"
                    value={type}
                    checked={reminderType === type}
                    onChange={(e) => setReminderType(e.target.value as any)}
                    disabled={loading}
                    className="w-5 h-5 text-blue-600"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">{config.icon}</span>
                      <span className="font-semibold text-gray-900">{config.label}</span>
                    </div>
                    <p className="text-xs text-gray-600">{config.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Message personnalisé */}
          <div className="space-y-2">
            <Label htmlFor="message" className="text-sm font-semibold text-gray-700">
              Message personnalisé (optionnel)
            </Label>
            <textarea
              id="message"
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              placeholder={reminderMessages[reminderType]}
              disabled={loading}
              className="w-full p-3 border-2 border-gray-300 rounded-xl text-sm min-h-[100px] focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors"
            />
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-3 p-4 bg-red-50 rounded-xl border border-red-200 animate-slide-in-up">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-red-800">
                <p className="font-semibold">{error}</p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="flex-1 h-12 rounded-xl border-2 hover:bg-gray-50"
            >
              Annuler
            </Button>
            <Button
              onClick={handleSend}
              disabled={loading || !email}
              className={`flex-1 h-12 rounded-xl bg-gradient-to-r ${currentConfig.color} hover:opacity-90 shadow-lg shadow-${reminderType === 'friendly' ? 'blue' : reminderType === 'firm' ? 'orange' : 'red'}-500/30`}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Envoi...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5 mr-2" />
                  Envoyer la relance
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
