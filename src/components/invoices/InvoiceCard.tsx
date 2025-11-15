import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { IInvoice } from "@/models/Invoice";
import { Calendar, Euro, FileText, Mail, Bell, Trash2, Edit, Download, Lock, Palette, CheckCircle, AlertCircle, Clock, XCircle, Crown, X } from "lucide-react";
import { InvoicePreview } from "./InvoicePreview";
import { TemplatePreview } from "@/lib/invoice-templates";
import { DEFAULT_TEMPLATE, type TemplatePreset } from "@/lib/invoice-templates";
import { InvoiceStatusBadges } from "./InvoiceStatusBadge";

interface InvoiceCardProps {
  invoice: IInvoice;
  clientName: string;
  clientData?: any;
  statusColor: string;
  onEdit: (invoice: IInvoice) => void;
  onDelete: (invoice: IInvoice) => void;
  onPDF: (id: string) => void;
  onSendEmail?: (invoice: IInvoice) => void;
  onSendReminder?: (invoice: IInvoice) => void;
  onFinalize?: (invoice: IInvoice) => void;
  isProfileComplete?: boolean;
  onProfileIncompleteClick?: () => void;
  userData?: {
    companyName?: string;
    legalForm?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    siret?: string;
    iban?: string;
    bic?: string;
    bankName?: string;
    bankCode?: string;
    branchCode?: string;
    address?: {
      street?: string;
      city?: string;
      zipCode?: string;
      country?: string;
    };
  };
  // NOUVEAUX PROPS pour gérer les restrictions de plan
  subscriptionData?: {
    plan: string;
    usage: {
      invoices: { current: number; limit: number | 'unlimited' };
    };
  };
  onUpgradeRequired?: (feature: string, requiredPlan: 'pro' | 'business') => void;
}

const InvoiceCard: React.FC<InvoiceCardProps> = ({ 
  invoice, 
  clientName,
  clientData,
  statusColor, 
  onEdit, 
  onDelete, 
  onPDF,
  onSendEmail,
  onSendReminder,
  onFinalize,
  isProfileComplete = true,
  onProfileIncompleteClick,
  userData,
  subscriptionData,
  onUpgradeRequired,
}) => {
  const [showPreview, setShowPreview] = useState(false);
  const [template, setTemplate] = useState<TemplatePreset>(DEFAULT_TEMPLATE);
  const [loadingTemplate, setLoadingTemplate] = useState(true);
  
  const canSendEmail = invoice.status === 'draft' || !invoice.sentAt;
  const canSendReminder = ['sent', 'overdue', 'partially_paid'].includes(invoice.status) && invoice.status !== 'paid';
  const reminderCount = invoice.reminders?.length || 0;

  // Vérifier les permissions basées sur le plan
  const userPlan = subscriptionData?.plan || 'free';
  const hasEmailFeature = ['pro', 'business'].includes(userPlan);
  const hasReminderFeature = ['pro', 'business'].includes(userPlan);
  // PDF est autorisé pour tous les plans
  const hasPDFFeature = true; // Toujours true


  // Charger le template par défaut au montage
  useEffect(() => {
    const loadTemplate = async () => {
      try {
        const response = await fetch('/api/invoice-templates');
        if (response.ok) {
          const templates = await response.json();
          const defaultTemplate = templates.find((t: any) => t.isDefault);
          if (defaultTemplate) {
            setTemplate(defaultTemplate);
          }
        }
      } catch (error) {
        console.error('Erreur chargement template:', error);
      } finally {
        setLoadingTemplate(false);
      }
    };

    loadTemplate();
  }, []);
  
  // Gestion du clic sur les actions bloquées par profil incomplet
  const handleProfileIncompleteAction = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onProfileIncompleteClick) {
      onProfileIncompleteClick();
    }
  };

  // Gestion du clic sur les actions bloquées par plan gratuit
  const handleUpgradeRequiredAction = (e: React.MouseEvent, feature: string, requiredPlan: 'pro' | 'business' = 'pro') => {
    e.preventDefault();
    e.stopPropagation();
    if (onUpgradeRequired) {
      onUpgradeRequired(feature, requiredPlan);
    }
  };

  // Déterminer si une action est bloquée et pourquoi
  const getActionStatus = (actionType: 'email' | 'reminder' | 'pdf') => {
    if (!isProfileComplete) {
      return { blocked: true, reason: 'profile' as const, message: 'Profil professionnel requis' };
    }
    
    if (actionType === 'email' && !hasEmailFeature) {
      return { blocked: true, reason: 'plan' as const, message: 'Envoi email réservé aux abonnés PRO', feature: 'Envoi email automatique', requiredPlan: 'pro' as const };
    }
    
    if (actionType === 'reminder' && !hasReminderFeature) {
      return { blocked: true, reason: 'plan' as const, message: 'Rappels réservés aux abonnés PRO', feature: 'Rappels de paiement', requiredPlan: 'pro' as const };
    }
    
    // PDF n'est jamais bloqué par le plan, seulement par le profil
    if (actionType === 'pdf' && !isProfileComplete) {
      return { blocked: true, reason: 'profile' as const, message: 'Profil professionnel requis' };
    }
    
    return { blocked: false, reason: null, message: '' };
  };

  // Configuration des couleurs par statut
  const statusConfig = {
    draft: { color: 'bg-gray-500', bgLight: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200', Icon: FileText },
    sent: { color: 'bg-indigo-600', bgLight: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', Icon: Mail },
    paid: { color: 'bg-green-600', bgLight: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', Icon: CheckCircle },
    overdue: { color: 'bg-red-600', bgLight: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', Icon: AlertCircle },
    partially_paid: { color: 'bg-orange-500', bgLight: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', Icon: Clock },
  };

  const config = statusConfig[invoice.status as keyof typeof statusConfig] || statusConfig.draft;
  const StatusIcon = config.Icon;

  return (
    <>
    <Card className="group relative bg-gray-900/80 backdrop-blur-lg border border-gray-700/50 rounded-xl shadow-2xl hover:shadow-blue-500/20 hover:border-blue-500/50 transition-all duration-200">
      {/* Barre de statut colorée en haut */}
      <div className={`absolute top-0 left-0 right-0 h-1 ${config.color} rounded-t-xl`} />
      
      {/* Preview de la facture en arrière-plan */}
      <div className="relative h-40 bg-gray-800/50 overflow-hidden border-b border-gray-700/50">
        <div 
          className="absolute inset-0 flex items-start justify-center pt-2"
          style={{
            transform: 'scale(0.28)',
            transformOrigin: 'top center',
          }}
        >
          <div style={{ width: '210mm', height: '297mm' }}>
            <TemplatePreview
              template={template}
              sampleData={{
                invoice,
                client: clientData,
                user: userData,
              }}
              className="w-full h-full"
            />
          </div>
        </div>
        
        {/* Overlay gradient au hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
        
        {/* Badge de personnalisation en overlay */}
        <Button 
          size="sm" 
          variant="outline" 
          className="absolute top-3 right-3 rounded-lg bg-gray-800/90 backdrop-blur-sm border-purple-500/50 text-purple-300 hover:bg-purple-900/50 hover:border-purple-400 shadow-lg shadow-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          onClick={() => setShowPreview(true)}
        >
          <Palette className="w-4 h-4 mr-1.5" />
          Voir en grand
        </Button>
      </div>
      
      <div className="p-6">
        {/* Header avec numéro et badges */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div>
              <h3 className="font-bold text-lg text-white">{invoice.invoiceNumber}</h3>
              <div className="flex items-center gap-2 flex-wrap">
                {/* Badges de statut avec priorité sur isFinalized */}
                <InvoiceStatusBadges invoice={invoice} />
                {!isProfileComplete && (
                  <Badge className="bg-orange-900/30 text-orange-400 border border-orange-700/50 text-xs font-semibold">
                    <Lock className="w-3 h-3 mr-1" />
                    Profil incomplet
                  </Badge>
                )}
                {userPlan === 'free' && (
                  <Badge className="bg-purple-900/30 text-purple-400 border border-purple-700/50 text-xs font-semibold">
                    <Crown className="w-3 h-3 mr-1" />
                    Gratuit
                  </Badge>
                )}
              </div>
            </div>
          </div>
          {reminderCount > 0 && (
            <Badge variant="outline" className="text-xs font-semibold border-orange-700/50 bg-orange-900/30 text-orange-400">
              <Bell className="w-3 h-3 mr-1" />
              {reminderCount}
            </Badge>
          )}
        </div>

        {/* Informations principales */}
        <div className="space-y-3 mb-5">
          <div className="flex items-center gap-2 text-gray-300">
            <FileText className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium">{clientName}</span>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 text-gray-300">
              <Calendar className="w-4 h-4 text-gray-500" />
              <div className="text-xs">
                <p className="text-gray-500">Date</p>
                <p className="font-semibold text-white">
                  {invoice.issueDate ? new Date(invoice.issueDate).toLocaleDateString('fr-FR') : "-"}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 text-gray-300">
              <Calendar className="w-4 h-4 text-orange-400" />
              <div className="text-xs">
                <p className="text-gray-500">Échéance</p>
                <p className="font-semibold text-white">
                  {invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString('fr-FR') : "-"}
                </p>
              </div>
            </div>
          </div>

          {/* Montant en grand */}
          <div className={`bg-gray-800/50 rounded-xl p-4 border ${config.border} backdrop-blur-lg`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Euro className="w-5 h-5 text-gray-400" />
                <span className="text-sm font-medium text-gray-300">Montant</span>
              </div>
              <p className="text-2xl font-bold text-white">
                {(invoice.total || 0).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
              </p>
            </div>
          </div>

          {/* Info envoi */}
          {invoice.sentAt && (
            <div className="flex items-center gap-2 text-xs text-blue-300 bg-blue-900/30 px-3 py-2 rounded-lg border border-blue-700/50">
              <Mail className="w-3 h-3" />
              Envoyée le {new Date(invoice.sentAt).toLocaleDateString('fr-FR')}
            </div>
          )}

        </div>

        {/* Actions */}
        <div className="space-y-2 pt-4 border-t border-gray-700/50">
          {/* Bouton Finaliser uniquement pour les factures PAYÉES et non encore finalisées */}
          {invoice.status === 'paid' && !invoice.isFinalized && onFinalize && (
            <Button
              size="sm"
              className="w-full rounded-xl shadow-lg font-semibold bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-green-500/20"
              onClick={() => onFinalize(invoice)}
            >
              <Lock className="w-4 h-4 mr-2" />
              Finaliser et archiver (conformité légale)
            </Button>
          )}
          
          {/* Ligne 1: Actions email en priorité */}
          {(canSendEmail || canSendReminder) && (
            <div className={`grid ${canSendEmail && canSendReminder ? 'grid-cols-2' : 'grid-cols-1'} gap-2`}>
              {canSendEmail && onSendEmail && (
                <div className="relative group">
                  {(() => {
                    const emailStatus = getActionStatus('email');
                    const isBlocked = emailStatus.blocked;
                    const isProfileIssue = emailStatus.reason === 'profile';
                    const isPlanIssue = emailStatus.reason === 'plan';

                    return (
                      <Button
                        size="sm"
                        className={`w-full rounded-xl shadow-lg font-semibold ${
                          !isBlocked
                            ? 'bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600 text-white shadow-indigo-500/20'
                            : isPlanIssue
                              ? 'bg-gray-800/50 border border-gray-700/50 text-gray-400 hover:bg-yellow-500/10 hover:border-yellow-500/50 hover:text-yellow-400'
                              : 'bg-orange-900/30 border border-orange-700/50 text-orange-400 hover:bg-orange-900/50 hover:border-orange-600'
                        }`}
                        onClick={
                          !isBlocked
                            ? () => onSendEmail(invoice)
                            : isProfileIssue
                              ? handleProfileIncompleteAction
                              : (e) => handleUpgradeRequiredAction(e, emailStatus.feature!, emailStatus.requiredPlan!)
                        }
                      >
                        {isProfileIssue ? <Lock className="w-4 h-4 mr-2" /> : <Mail className="w-4 h-4 mr-2" />}
                        {isPlanIssue && !hasEmailFeature ? '🔒 Envoyer' : 'Envoyer'}
                        {isPlanIssue && !hasEmailFeature && (
                          <span className="ml-1.5 px-1.5 py-0.5 text-[10px] font-bold bg-yellow-500 text-gray-900 rounded">PRO</span>
                        )}
                      </Button>
                    );
                  })()}
                </div>
              )}
              {canSendReminder && onSendReminder && (
                <div className="relative group">
                  {(() => {
                    const reminderStatus = getActionStatus('reminder');
                    const isBlocked = reminderStatus.blocked;
                    const isProfileIssue = reminderStatus.reason === 'profile';
                    const isPlanIssue = reminderStatus.reason === 'plan';

                    return (
                      <Button
                        size="sm"
                        className={`w-full rounded-xl shadow-lg font-semibold ${
                          !isBlocked
                            ? 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-orange-500/20'
                            : isPlanIssue
                              ? 'bg-gray-800/50 border border-gray-700/50 text-gray-400 hover:bg-yellow-500/10 hover:border-yellow-500/50 hover:text-yellow-400'
                              : 'bg-orange-900/30 border border-orange-700/50 text-orange-400 hover:bg-orange-900/50 hover:border-orange-600'
                        }`}
                        onClick={
                          !isBlocked
                            ? () => onSendReminder(invoice)
                            : isProfileIssue
                              ? handleProfileIncompleteAction
                              : (e) => handleUpgradeRequiredAction(e, reminderStatus.feature!, reminderStatus.requiredPlan!)
                        }
                      >
                        {isProfileIssue ? <Lock className="w-4 h-4 mr-2" /> : <Bell className="w-4 h-4 mr-2" />}
                        {isPlanIssue && !hasReminderFeature ? '🔒 Relancer' : 'Relancer'}
                        {isPlanIssue && !hasReminderFeature && (
                          <span className="ml-1.5 px-1.5 py-0.5 text-[10px] font-bold bg-yellow-500 text-gray-900 rounded">PRO</span>
                        )}
                      </Button>
                    );
                  })()}
                </div>
              )}
            </div>
          )}
          
          {/* Ligne 2: Actions secondaires */}
          <div className="flex gap-2">
            <div className="flex-1 relative group">
              <Button 
                size="sm" 
                variant="outline" 
              className={`w-full rounded-xl transition-all font-medium ${
                invoice.isFinalized
                  ? 'bg-purple-900/30 border-purple-700 text-purple-300 hover:bg-purple-900/50 hover:border-purple-600'
                  : invoice.sentAt && !invoice.isFinalized
                    ? 'bg-orange-900/30 border-orange-700 text-orange-300 hover:bg-orange-900/50 hover:border-orange-600'
                    : 'bg-gray-800/50 border-gray-700 text-gray-300 hover:bg-blue-900/30 hover:text-blue-400 hover:border-blue-600'
              }`}
              onClick={() => onEdit(invoice)}
              >
                {invoice.isFinalized ? (
                  <>
                    <Edit className="w-4 h-4 mr-1.5" />
                    <span className="hidden sm:inline">Statut</span>
                  </>
                ) : invoice.sentAt ? (
                  <>
                    <Edit className="w-4 h-4 mr-1.5" />
                    <span className="hidden sm:inline">Statut</span>
                  </>
                ) : (
                  <>
                    <Edit className="w-4 h-4 mr-1.5" />
                    <span className="hidden sm:inline">Modifier</span>
                  </>
                )}
              </Button>
              {invoice.isFinalized ? (
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 border border-gray-700 shadow-lg">
                  💰 Modifier le statut de paiement uniquement
                </div>
              ) : invoice.sentAt ? (
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 border border-gray-700 shadow-lg">
                  💰 Marquer comme payée pour finaliser ensuite
                </div>
              ) : null}
            </div>
            <div className="flex-1 relative group">
              {(() => {
                const pdfStatus = getActionStatus('pdf');
                return (
                  <>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className={`w-full rounded-xl transition-all font-medium ${
                        !pdfStatus.blocked 
                          ? 'bg-gray-800/50 border-gray-700 text-gray-300 hover:bg-green-900/30 hover:text-green-400 hover:border-green-600' 
                          : 'bg-gray-800/50 border-gray-700 text-gray-500 cursor-not-allowed'
                      }`}
                      onClick={
                        !pdfStatus.blocked 
                          ? () => onPDF(invoice._id?.toString() || "")
                          : handleProfileIncompleteAction // PDF bloqué uniquement par profil incomplet
                      }
                      disabled={pdfStatus.blocked}
                    >
                      {pdfStatus.blocked ? <Lock className="w-4 h-4 mr-1.5" /> : <Download className="w-4 h-4 mr-1.5" />}
                      <span className="hidden sm:inline">PDF</span>
                    </Button>
                    {pdfStatus.blocked && (
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 border border-gray-700">
                        {pdfStatus.message}
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
            <Button 
              size="sm" 
              variant="outline" 
              className={`rounded-xl transition-all px-3 ${
                invoice.isFinalized
                  ? 'bg-gray-800/50 border-gray-700 text-gray-500 cursor-not-allowed'
                  : 'bg-gray-800/50 border-gray-700 text-gray-300 hover:bg-red-900/30 hover:text-red-400 hover:border-red-600'
              }`}
              onClick={() => !invoice.isFinalized && onDelete(invoice)}
              disabled={invoice.isFinalized}
            >
              {invoice.isFinalized ? <Lock className="w-4 h-4" /> : <Trash2 className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </div>
      
      {/* Tooltip finalisée - Enfant direct de Card */}
      {invoice.isFinalized && (
        <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity z-20 border border-gray-700 shadow-lg text-center pointer-events-none">
          <div className="whitespace-nowrap">🔒 Facture finalisée</div>
          <div className="text-gray-400 text-[10px] whitespace-nowrap">Archivage légal 10 ans</div>
        </div>
      )}
    </Card>

    {/* Invoice Preview Modal - Version simplifiée */}
    {showPreview && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in">
        <div className="bg-gray-900/95 backdrop-blur-lg rounded-2xl shadow-2xl w-full h-full m-4 overflow-hidden flex flex-col animate-slide-in-up border border-gray-700/50">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-700/50 bg-gradient-to-r from-indigo-900/30 to-blue-900/30 flex-shrink-0">
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-indigo-400" />
              <h2 className="text-lg font-semibold text-white">Aperçu Facture - {invoice.invoiceNumber}</h2>
            </div>
            <button
              onClick={() => setShowPreview(false)}
              className="text-gray-400 hover:text-gray-200 transition-colors p-2 hover:bg-gray-800/50 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Preview */}
          <div className="flex-1 overflow-hidden bg-gray-800 flex items-center justify-center p-4">
            <div 
              className="shadow-2xl origin-center transition-all duration-300"
              style={{ 
                width: '210mm',
                height: '297mm',
                transform: 'scale(min(calc((100vw - 8rem) / 210mm), calc((100vh - 16rem) / 297mm)))',
                transformOrigin: 'center center'
              }}
            >
              {loadingTemplate ? (
                <div className="w-full h-full bg-white flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-12 h-12 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Chargement...</p>
                  </div>
                </div>
              ) : (
                <TemplatePreview
                  template={template}
                  sampleData={{
                    invoice,
                    client: clientData,
                    user: userData,
                  }}
                  className="w-full h-full"
                />
              )}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 border-t border-gray-700/50 bg-gray-800/50 flex-shrink-0">
            <div className="text-sm text-gray-400">
              {!isProfileComplete && (
                <span className="text-blue-400 font-medium flex items-center gap-2">
                  <span className="inline-block w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                  Profil requis pour PDF/Email
                </span>
              )}
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <Button
                onClick={() => setShowPreview(false)}
                className="bg-gray-700 hover:bg-gray-600 text-gray-200 w-full sm:w-auto"
              >
                Fermer
              </Button>
              {isProfileComplete && hasEmailFeature && onSendEmail && (
                <Button
                  onClick={() => {
                    onSendEmail(invoice);
                    setShowPreview(false);
                  }}
                  className="flex items-center justify-center gap-2 w-full sm:w-auto bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg shadow-blue-500/20"
                >
                  <Mail className="w-4 h-4" />
                  <span className="hidden sm:inline">Envoyer</span>
                </Button>
              )}
              {isProfileComplete && !!invoice._id && (
                <Button
                  onClick={() => {
                    onPDF(invoice._id?.toString() || "");
                    setShowPreview(false);
                  }}
                  className="flex items-center justify-center gap-2 w-full sm:w-auto bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white shadow-lg shadow-indigo-500/20"
                >
                  <Download className="w-4 h-4" />
                  <span className="hidden sm:inline">PDF</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    )}
    </>
  );
};

export default InvoiceCard;
