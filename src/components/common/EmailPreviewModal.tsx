'use client';

import { useState } from 'react';
import { X, Send, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

interface EmailPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSend: (customMessage?: string) => Promise<void>;
  emailData: {
    type: 'invoice' | 'quote';
    recipientEmail: string;
    recipientName: string;
    documentNumber: string;
    total: number;
    companyName: string;
  };
}

export default function EmailPreviewModal({
  isOpen,
  onClose,
  onSend,
  emailData,
}: EmailPreviewModalProps) {
  const [customMessage, setCustomMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [showPreview, setShowPreview] = useState(true);

  if (!isOpen) return null;

  const handleSend = async () => {
    setSending(true);
    try {
      await onSend(customMessage || undefined);
      onClose();
    } catch (error) {
      // Log for debugging and rethrow so parent can react (e.g. show upgrade modal)
      console.error('Erreur envoi email:', error);
      throw error;
    } finally {
      setSending(false);
    }
  };

  const getEmailHtml = () => {
    const isInvoice = emailData.type === 'invoice';
    const docType = isInvoice ? 'facture' : 'devis';
    const icon = isInvoice ? '📄' : '📋';

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { margin: 0; padding: 0; font-family: 'Segoe UI', sans-serif; background: #f5f5f5; }
            .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center; color: white; }
            .header h1 { margin: 0; font-size: 28px; }
            .content { padding: 40px; }
            .greeting { font-size: 18px; color: #333; margin-bottom: 20px; }
            .message { color: #555; font-size: 15px; margin-bottom: 20px; }
            .custom-message { background: #f8f9fa; border-left: 4px solid #667eea; padding: 15px; margin: 20px 0; border-radius: 4px; color: #333; }
            .details { background: #f8f9fa; border-left: 4px solid #667eea; padding: 20px; margin: 30px 0; border-radius: 4px; }
            .row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e9ecef; }
            .row:last-child { border-bottom: none; padding-top: 15px; font-weight: 600; font-size: 18px; color: #667eea; }
            .label { color: #666; }
            .value { color: #333; font-weight: 500; }
            .cta { display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0; }
            .footer { background: #f8f9fa; padding: 30px; text-align: center; color: #666; font-size: 13px; border-top: 1px solid #e9ecef; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>${icon} ${isInvoice ? 'Nouvelle Facture' : 'Nouveau Devis'}</h1>
            </div>
            <div class="content">
              <p class="greeting">Bonjour ${emailData.recipientName},</p>
              
              <p class="message">
                ${isInvoice 
                  ? 'Nous vous remercions pour votre confiance. Veuillez trouver ci-joint votre facture.'
                  : 'Veuillez trouver ci-joint votre devis. N\'hésitez pas à nous contacter pour toute question.'
                }
              </p>

              ${customMessage ? `
                <div class="custom-message">
                  <strong>Message personnalisé :</strong><br><br>
                  ${customMessage.replace(/\n/g, '<br>')}
                </div>
              ` : ''}

              <div class="details">
                <div class="row">
                  <span class="label">${isInvoice ? 'Numéro de facture' : 'Numéro de devis'}</span>
                  <span class="value">${emailData.documentNumber}</span>
                </div>
                <div class="row">
                  <span class="label">Total ${isInvoice ? 'à payer' : ''}</span>
                  <span class="value">${emailData.total.toLocaleString('fr-FR')} €</span>
                </div>
              </div>

              <center>
                <a href="#" class="cta">${isInvoice ? 'Voir la facture' : 'Consulter le devis'}</a>
              </center>

              <p class="message" style="margin-top: 30px; font-size: 14px;">
                Cordialement,<br>
                <strong>${emailData.companyName}</strong>
              </p>
            </div>
            <div class="footer">
              <p>Cet email a été envoyé depuis BLINK</p>
              <p>© ${new Date().getFullYear()} ${emailData.companyName}</p>
            </div>
          </div>
        </body>
      </html>
    `;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Eye className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">
                Aperçu de l'email
              </h2>
              <p className="text-sm text-gray-400">
                À : {emailData.recipientEmail}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-2"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6 space-y-6">
          {/* Custom message input */}
          <div className="space-y-2">
            <Label className="text-white">Message personnalisé (optionnel)</Label>
            <textarea
              value={customMessage}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setCustomMessage(e.target.value)}
              placeholder="Ajoutez un message personnalisé qui apparaîtra dans l'email..."
              className="flex min-h-[100px] w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              maxLength={500}
            />
            <p className="text-xs text-gray-500">
              {customMessage.length}/500 caractères
            </p>
          </div>

          {/* Toggle preview */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="text-sm text-blue-400 hover:text-blue-300 font-medium transition-colors"
            >
              {showPreview ? '▼ Masquer' : '▶ Afficher'} l'aperçu de l'email
            </button>
          </div>

          {/* Email preview */}
          {showPreview && (
            <div className="border border-gray-700 rounded-lg overflow-hidden">
              <div className="bg-gray-800 px-4 py-2 border-b border-gray-700">
                <p className="text-xs text-gray-400">
                  Aperçu (l'email final sera envoyé avec le PDF en pièce jointe)
                </p>
              </div>
              <div 
                className="bg-white p-4 max-h-[400px] overflow-auto"
                dangerouslySetInnerHTML={{ __html: getEmailHtml() }}
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-4 p-6 border-t border-gray-700 bg-gray-800/50">
          <p className="text-sm text-gray-400">
            Le PDF sera joint automatiquement
          </p>
          <div className="flex gap-3">
            <Button
              variant="ghost"
              onClick={onClose}
              disabled={sending}
              className="text-gray-300 hover:text-white"
            >
              Annuler
            </Button>
            <Button
              onClick={handleSend}
              disabled={sending}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white"
            >
              {sending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Envoi en cours...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Envoyer l'email
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
