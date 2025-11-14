'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  Lock, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle,
  FileText,
  User,
  DollarSign,
  Calendar,
  Loader2
} from 'lucide-react';

interface FinalizeInvoiceDialogProps {
  open: boolean;
  onClose: () => void;
  invoice: any;
  client: any;
  onSuccess: () => void;
}

export function FinalizeInvoiceDialog({
  open,
  onClose,
  invoice,
  client,
  onSuccess,
}: FinalizeInvoiceDialogProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Vérifications de validation
  const checks = {
    hasInvoiceNumber: !!invoice?.invoiceNumber,
    hasItems: invoice?.items && invoice.items.length > 0,
    hasValidTotal: invoice?.total && invoice.total > 0,
    hasClient: !!invoice?.clientId,
    hasDates: !!invoice?.issueDate && !!invoice?.dueDate,
  };

  const allChecksPass = Object.values(checks).every(Boolean);
  const isAlreadyFinalized = invoice?.isFinalized;

  const handleFinalize = async () => {
    if (!allChecksPass || isAlreadyFinalized) return;

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/invoices/${invoice._id}/finalize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Erreur lors de la finalisation');
      }

      // Succès
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto bg-gray-900 border-gray-700 p-4">
        <DialogHeader className="space-y-1">
          <DialogTitle className="flex items-center gap-2 text-lg text-white">
            <div className="p-1 bg-green-900/50 rounded">
              <Lock className="w-4 h-4 text-green-400" />
            </div>
            Finaliser la facture
          </DialogTitle>
          <DialogDescription className="text-gray-400 text-xs">
            {invoice?.invoiceNumber || 'Facture'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          {/* Avertissement principal */}
          <Alert className="bg-orange-900/20 border-orange-700/50 py-2">
            <AlertTriangle className="w-4 h-4 text-orange-400" />
            <AlertDescription className="text-orange-200 ml-2 text-xs">
              <strong>Attention :</strong> Une fois finalisée, cette facture sera verrouillée et ne pourra plus être modifiée (Article L123-22).
            </AlertDescription>
          </Alert>

          {isAlreadyFinalized && (
            <Alert className="bg-green-900/20 border-green-700/50 py-2">
              <CheckCircle2 className="w-4 h-4 text-green-400" />
              <AlertDescription className="text-green-200 ml-2 text-xs">
                Facture finalisée le{' '}
                {new Date(invoice.finalizedAt).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </AlertDescription>
            </Alert>
          )}

          {/* Checklist de validation */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-gray-300 uppercase tracking-wider">
              Vérifications
            </h3>
            
            <div className="space-y-1.5">
              <CheckItem
                checked={checks.hasInvoiceNumber}
                label="Numéro de facture"
                value={invoice?.invoiceNumber}
                icon={FileText}
              />
              <CheckItem
                checked={checks.hasItems}
                label="Articles/Services"
                value={invoice?.items?.length ? `${invoice.items.length} article(s)` : 'Aucun'}
                icon={FileText}
              />
              <CheckItem
                checked={checks.hasValidTotal}
                label="Montant total"
                value={invoice?.total ? `${invoice.total.toFixed(2)} €` : '0.00 €'}
                icon={DollarSign}
              />
              <CheckItem
                checked={checks.hasClient}
                label="Client"
                value={client?.name || 'Non défini'}
                icon={User}
              />
              <CheckItem
                checked={checks.hasDates}
                label="Dates"
                value={
                  invoice?.issueDate && invoice?.dueDate
                    ? `Émission: ${new Date(invoice.issueDate).toLocaleDateString('fr-FR')}`
                    : 'Manquantes'
                }
                icon={Calendar}
              />
            </div>
          </div>

          {/* Informations complémentaires */}
          <div className="p-2 bg-gray-800/50 rounded-lg border border-gray-700">
            <h4 className="text-xs font-semibold text-gray-300 mb-1.5">
              Processus :
            </h4>
            <ul className="space-y-1 text-xs text-gray-400">
              <li className="flex items-start gap-1.5">
                <span className="text-green-400 text-xs">✓</span>
                <span>Génération PDF final</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-green-400 text-xs">✓</span>
                <span>Stockage permanent (10 ans)</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-green-400 text-xs">✓</span>
                <span>Hash SHA-256 pour intégrité</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-green-400 text-xs">✓</span>
                <span>Verrouillage définitif</span>
              </li>
            </ul>
          </div>

          {error && (
            <Alert className="bg-red-900/20 border-red-700/50 py-2">
              <XCircle className="w-4 h-4 text-red-400" />
              <AlertDescription className="text-red-200 ml-2 text-xs">
                {error}
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-700">
          <Button
            variant="ghost"
            onClick={onClose}
            disabled={loading}
            className="text-gray-400 hover:text-white text-xs h-8"
          >
            Annuler
          </Button>
          
          {!isAlreadyFinalized && (
            <Button
              onClick={handleFinalize}
              disabled={!allChecksPass || loading}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-xs h-8"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3 h-3 mr-1.5 animate-spin" />
                  Finalisation...
                </>
              ) : (
                <>
                  <Lock className="w-3 h-3 mr-1.5" />
                  Finaliser
                </>
              )}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Composant helper pour les items de checklist
function CheckItem({ 
  checked, 
  label, 
  value, 
  icon: Icon 
}: { 
  checked: boolean; 
  label: string; 
  value: string;
  icon: any;
}) {
  return (
    <div className="flex items-center gap-2 p-2 bg-gray-800/50 rounded border border-gray-700">
      <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${
        checked ? 'bg-green-900/50 border border-green-500' : 'bg-red-900/50 border border-red-500'
      }`}>
        {checked ? (
          <CheckCircle2 className="w-3 h-3 text-green-400" />
        ) : (
          <XCircle className="w-3 h-3 text-red-400" />
        )}
      </div>
      <div className="flex items-center gap-1.5 flex-1 min-w-0">
        <Icon className="w-3 h-3 text-gray-400 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-gray-300">{label}</p>
          <p className="text-[10px] text-gray-500 truncate">{value}</p>
        </div>
      </div>
      <Badge 
        variant="outline" 
        className={`text-[10px] px-1 py-0 h-4 ${
          checked ? 'bg-green-900/30 border-green-700 text-green-400' : 'bg-red-900/30 border-red-700 text-red-400'
        }`}
      >
        {checked ? 'OK' : 'Manquant'}
      </Badge>
    </div>
  );
}
