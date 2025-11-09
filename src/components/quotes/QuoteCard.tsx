'use client';

import React, { useState } from 'react';
import { IQuote } from '@/models/Quote';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FiFileText, FiSend, FiCheck, FiX, FiClock, FiRepeat, FiBriefcase, FiCalendar, FiDollarSign, FiEye, FiEdit2, FiMail, FiTrash2, FiAlertTriangle, FiEdit } from 'react-icons/fi';
import { useSubscription } from '@/hooks/useSubscription';

interface QuoteCardProps {
  quote: IQuote & { clientId: { name: string; email?: string } };
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onConvert: () => void;
  onSendEmail?: () => void;
  onStatusChange?: (newStatus: 'accepted' | 'rejected') => void;
  onUpgradeRequired?: (feature: string, requiredPlan: 'pro' | 'business') => void;
  onSuccess?: (message: string) => void;
  onError?: (message: string) => void;
}

const statusConfig = {
  draft: { label: 'Brouillon', icon: FiFileText, color: 'bg-gray-800/50 text-gray-300 border-gray-700/50' },
  sent: { label: 'Envoyé', icon: FiSend, color: 'bg-blue-900/30 text-blue-400 border-blue-700/50' },
  accepted: { label: 'Accepté', icon: FiCheck, color: 'bg-green-900/30 text-green-400 border-green-700/50' },
  rejected: { label: 'Refusé', icon: FiX, color: 'bg-red-900/30 text-red-400 border-red-700/50' },
  expired: { label: 'Expiré', icon: FiClock, color: 'bg-orange-900/30 text-orange-400 border-orange-700/50' },
  converted: { label: 'Converti', icon: FiRepeat, color: 'bg-purple-900/30 text-purple-400 border-purple-700/50' },
};

export default function QuoteCard({ quote, onView, onEdit, onDelete, onConvert, onSendEmail, onStatusChange, onUpgradeRequired, onSuccess, onError }: QuoteCardProps) {
  console.log('🔍 [QuoteCard] Quote reçu:', { 
    quoteId: quote._id,
    clientId: quote.clientId,
    fullQuote: quote 
  });
  
  const { data: subscriptionData } = useSubscription();
  const [generatingLink, setGeneratingLink] = useState(false);
  const [signatureLink, setSignatureLink] = useState<string | null>(null);

  const status = statusConfig[quote.status];
  const StatusIcon = status.icon;
  const isEditable = ['draft', 'sent'].includes(quote.status);
  const isConvertible = ['sent', 'accepted'].includes(quote.status);
  const isExpired = quote.status === 'expired' || new Date(quote.validUntil) < new Date();
  const canChangeStatus = quote.status === 'sent' && !isExpired;

  // Feature gating: Accès aux fonctionnalités PRO
  const userPlan = subscriptionData?.plan || 'free';
  const hasEmailAccess = ['pro', 'business'].includes(userPlan);
  const hasSignatureAccess = ['pro', 'business'].includes(userPlan);

  // Gestion cohérente des actions bloquées
  const handleBlockedAction = (feature: string, requiredPlan: 'pro' | 'business' = 'pro') => {
    console.log(`🔒 [QUOTECARD] Action bloquée: ${feature}, plan requis: ${requiredPlan}`);
    if (onUpgradeRequired) {
      onUpgradeRequired(feature, requiredPlan);
    }
  };
  
  const handleGenerateSignatureLink = async () => {
    setGeneratingLink(true);
    setSignatureLink(null);

    try {
      const response = await fetch(`/api/quotes/${quote._id}/generate-signature-link`, {
        method: 'POST',
      });

      if (!response.ok) {
        const error = await response.json();
        console.log('🚨 [QUOTECARD] Erreur génération signature:', error);

        // Gestion cohérente des erreurs 403
        if (response.status === 403 && error.featureBlocked) {
          handleBlockedAction(error.message || 'Signature électronique', error.requiredPlan || 'pro');
          return;
        }

        throw new Error(error.error || 'Erreur lors de la génération du lien');
      }

      const data = await response.json();
      setSignatureLink(data.signatureUrl);

      // Copier dans le presse-papier
      await navigator.clipboard.writeText(data.signatureUrl);

      if (onSuccess) {
        onSuccess('Lien de signature copié dans le presse-papier !');
      }
    } catch (error: any) {
      console.error('❌ [QUOTECARD] Erreur signature:', error);
      if (onError) {
        onError(error.message);
      }
    } finally {
      setGeneratingLink(false);
    }
  };

  return (
    <div className="bg-gray-900/80 backdrop-blur-lg rounded-xl shadow-2xl hover:shadow-blue-500/20 transition-all duration-200 p-6 border border-gray-700/50">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-sm font-bold text-white mb-1">
            {quote.quoteNumber}
          </h3>
          <p className={`text-sm flex items-center gap-1 ${
              quote.clientId._id === 'deleted' 
                ? 'text-red-400 font-medium' 
                : 'text-gray-400'
            }`}>
            <FiBriefcase className="w-4 h-4" />
            {quote.clientId.name}
            {quote.clientId._id === 'deleted' && ' ⚠️'}
          </p>
        </div>
        <Badge className={`${status.color} border px-3 py-1 text-xs font-semibold flex items-center gap-1`}>
          <StatusIcon className="w-3 h-3" /> {status.label}
        </Badge>
      </div>

      {/* Details */}
      <div className="space-y-2 mb-4 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-400 flex items-center gap-1">
            <FiCalendar className="w-4 h-4" /> Date d'émission
          </span>
          <span className="font-medium text-gray-200">
            {new Date(quote.issueDate).toLocaleDateString('fr-FR')}
          </span>
        </div>
        <div className="flex justify-between">
          <span className={`text-gray-400 flex items-center gap-1 ${isExpired ? 'text-orange-400 font-semibold' : ''}`}>
            <FiClock className="w-4 h-4" /> Valable jusqu'au
          </span>
          <span className={`font-medium ${isExpired ? 'text-orange-400' : 'text-gray-200'}`}>
            {new Date(quote.validUntil).toLocaleDateString('fr-FR')}
          </span>
        </div>
        <div className="flex justify-between pt-2 border-t border-gray-700/50">
          <span className="text-gray-400 font-semibold flex items-center gap-1">
            <FiDollarSign className="w-4 h-4" /> Montant TTC
          </span>
          <span className="text-xl font-bold text-green-400">
            {quote.total.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-700/50">
        <Button
          variant="outline"
          size="sm"
          onClick={onView}
          className="bg-blue-900/30 border-blue-700/50 text-blue-400 hover:bg-blue-900/50 hover:border-blue-600"
        >
          <FiEye className="w-4 h-4" /> Voir
        </Button>

        {isEditable && (
          <Button
            variant="outline"
            size="sm"
            onClick={onEdit}
            className="bg-indigo-900/30 border-indigo-700/50 text-indigo-400 hover:bg-indigo-900/50 hover:border-indigo-600"
          >
            <FiEdit2 className="w-4 h-4" /> Modifier
          </Button>
        )}

        {canChangeStatus && onStatusChange && (
          <>
            <Button
              size="sm"
              onClick={() => onStatusChange('accepted')}
              className="bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-500/20"
            >
              <FiCheck className="w-4 h-4" /> Accepter
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => onStatusChange('rejected')}
              className="shadow-lg shadow-red-500/20"
            >
              <FiX className="w-4 h-4" /> Refuser
            </Button>
          </>
        )}

        {isConvertible && (
          <Button
            size="sm"
            onClick={onConvert}
            className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg shadow-green-500/20"
          >
            <FiRepeat className="w-4 h-4" /> Convertir
          </Button>
        )}

        {quote.status !== 'converted' && onSendEmail && (
          <Button
            variant="outline"
            size="sm"
            onClick={hasEmailAccess ? onSendEmail : () => handleBlockedAction('Envoi email devis', 'pro')}
            className={`${
              hasEmailAccess
                ? 'bg-purple-900/30 border-purple-700/50 text-purple-400 hover:bg-purple-900/50 hover:border-purple-600'
                : 'bg-gray-800/50 border-gray-700/50 text-gray-400 hover:bg-yellow-500/10 hover:border-yellow-500/50 hover:text-yellow-400'
            }`}
          >
            <FiMail className="w-4 h-4" />
            {hasEmailAccess ? 'Envoyer' : '🔒 Envoyer'}
            {!hasEmailAccess && (
              <span className="ml-1 px-1.5 py-0.5 text-[10px] font-bold bg-yellow-500 text-gray-900 rounded">PRO</span>
            )}
          </Button>
        )}

        {quote.status === 'sent' && !isExpired && (
          <Button
            variant="outline"
            size="sm"
            onClick={hasSignatureAccess ? handleGenerateSignatureLink : () => handleBlockedAction('Signature électronique', 'pro')}
            disabled={generatingLink}
            className={`${
              hasSignatureAccess
                ? 'bg-gradient-to-r from-violet-500/20 to-purple-500/20 border-violet-500/50 text-violet-300 hover:from-violet-500/30 hover:to-purple-500/30 hover:border-violet-400'
                : 'bg-gray-800/50 border-gray-700/50 text-gray-400 hover:bg-yellow-500/10 hover:border-yellow-500/50 hover:text-yellow-400'
            }`}
          >
            <FiEdit className="w-4 h-4" />
            {generatingLink ? 'Génération...' : (hasSignatureAccess ? '✍️ Signature' : '🔒 Signature')}
            {!hasSignatureAccess && (
              <span className="ml-1 px-1.5 py-0.5 text-[10px] font-bold bg-yellow-500 text-gray-900 rounded">PRO</span>
            )}
          </Button>
        )}

        <Button
          variant="outline"
          size="sm"
          onClick={onDelete}
          className="ml-auto text-red-400 border-red-700/50 hover:bg-red-900/20 hover:border-red-600"
        >
          <FiTrash2 className="w-4 h-4" /> Supprimer
        </Button>
      </div>
      
      {/* Signature Link Display */}
      {signatureLink && (
        <div className="mt-4 p-3 bg-gradient-to-r from-violet-900/30 to-purple-900/30 border border-violet-700/50 rounded-lg">
          <div className="flex items-start gap-2">
            <FiCheck className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-violet-300 mb-1">✅ Lien copié !</p>
              <p className="text-xs text-gray-300 break-all">{signatureLink}</p>
            </div>
          </div>
        </div>
      )}

      {/* Warning for expired */}
      {isExpired && quote.status === 'sent' && (
        <div className="mt-4 p-3 bg-orange-900/30 border border-orange-700/50 rounded-lg text-sm text-orange-400 flex items-start gap-2">
          <FiAlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>Ce devis a expiré. Il ne peut plus être accepté.</span>
        </div>
      )}

      {/* Converted info */}
      {quote.status === 'converted' && (
        <div className="mt-4 p-3 bg-purple-900/30 border border-purple-700/50 rounded-lg text-sm text-purple-400 flex items-center gap-2">
          <FiCheck className="w-4 h-4" />
          <span>Converti en facture le {new Date(quote.convertedAt!).toLocaleDateString('fr-FR')}</span>
        </div>
      )}
    </div>
  );
}
