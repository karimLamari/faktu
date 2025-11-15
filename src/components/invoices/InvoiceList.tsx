"use client";

import { useState, useEffect, useRef } from "react";
import { z } from "zod";
import { invoiceSchema } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { EmptyStateButton } from "@/components/ui/EmptyStateButton";
import InvoiceCard from "./InvoiceCard";
import InvoiceFilters from "./InvoiceFilters";
import { IInvoice } from "@/models/Invoice";
import InvoiceFormModal from "./InvoiceFormModal";
import { SendEmailModal, SendReminderModal } from "./EmailModals";
import EmailPreviewModal from "@/components/common/EmailPreviewModal";
import { ProfileCompletionModal } from "@/components/profile/ProfileCompletionModal";
import { Notification } from "@/components/common/Notification";
import { PageHeader } from "@/components/common/PageHeader";
import Link from "next/link";
import { AlertCircle, FileText, Plus, Download } from "lucide-react";
import { useFormModal, useModalState, useFilters, useNotification } from "@/hooks";
import { invoiceService } from "@/services";
import { UsageBar } from "@/components/subscription/UsageBar";
import { LimitReachedModal } from "@/components/subscription/LimitReachedModal";
import { UpgradeModal } from "@/components/subscription/UpgradeModal";
import { useSubscription } from "@/hooks/useSubscription";
import { PLANS } from "@/lib/subscription/plans";
import { FinalizeInvoiceDialog } from "./FinalizeInvoiceDialog";

interface InvoiceListProps {
  initialInvoices: IInvoice[];
  clients: { _id: string; name: string; email?: string; companyInfo?: { legalName?: string } }[];
  isProfileComplete: boolean;
  userData?: {
    companyName?: string;
    legalForm?: string;
    address?: {
      street?: string;
      city?: string;
      zipCode?: string;
      country?: string;
    };
  };
}

const statusColors: Record<string, string> = {
  draft: "bg-gray-700 text-gray-300",
  sent: "bg-blue-900/30 text-blue-400 border-blue-700/50",
  paid: "bg-green-900/30 text-green-400 border-green-700/50",
  overdue: "bg-red-900/30 text-red-400 border-red-700/50",
  cancelled: "bg-yellow-900/30 text-yellow-400 border-yellow-700/50",
};

export function InvoiceList({ initialInvoices, clients, isProfileComplete, userData }: InvoiceListProps) {
  const [invoices, setInvoices] = useState<IInvoice[]>(initialInvoices);
  
  // Hooks personnalisés
  const { showSuccess, showError, notification } = useNotification();
  
  // Subscription data
  const { data: subscriptionData, loading: subscriptionLoading, refetch: refetchSubscription } = useSubscription();
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [limitModalType, setLimitModalType] = useState<'invoices' | 'quotes' | 'expenses' | 'clients'>('invoices');
  // Upgrade modal state for feature-gated functionality (export, email, reminders...)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeFeature, setUpgradeFeature] = useState<string>('Fonctionnalité payante');
  const [upgradeRequiredPlan, setUpgradeRequiredPlan] = useState<'pro' | 'business'>('pro');

  // Finalize invoice modal state
  const [showFinalizeDialog, setShowFinalizeDialog] = useState(false);
  const [invoiceToFinalize, setInvoiceToFinalize] = useState<IInvoice | null>(null);

  // CSV Export
  const [isExporting, setIsExporting] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const exportMenuRef = useRef<HTMLDivElement>(null);

  // Close export menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
        setShowExportMenu(false);
      }
    };

    if (showExportMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showExportMenu]);

  // Debug: Log modal state changes
  useEffect(() => {
    console.log('🎭 État des modaux:', {
      showLimitModal,
      showUpgradeModal,
      upgradeFeature,
      limitModalType
    });
  }, [showLimitModal, showUpgradeModal, upgradeFeature, limitModalType]);

const handleExportCSV = async (format: 'simple' | 'accounting' | 'detailed') => {
  try {
    setIsExporting(true);
    setShowExportMenu(false);

    // Vérifier que subscriptionData est chargé (éviter race condition)
    if (subscriptionLoading || !subscriptionData) {
      setIsExporting(false);
      showError('Chargement des informations de compte...');
      return;
    }

    // Check CSV export permission
    const userPlan = subscriptionData.plan;
    const planFeatures = PLANS[userPlan];

    console.log('🔍 Export CSV - Debug:', {
      userPlan,
      csvExportAllowed: planFeatures.csvExport,
      notCsvExport: !planFeatures.csvExport,
      subscriptionData,
    });

    if (!planFeatures.csvExport) {
      console.log('🚫 CSV non autorisé - Ouverture UpgradeModal');
      setIsExporting(false);
      showError('L\'export CSV est réservé aux abonnés PRO et BUSINESS');
      // Show upgrade modal for this feature (fermer limit modal d'abord)
      setShowLimitModal(false);
      setUpgradeFeature('Export CSV');
      setUpgradeRequiredPlan('pro');
      setShowUpgradeModal(true);
      console.log('✅ Modaux configurés - showLimitModal: false, showUpgradeModal: true');
      return;
    }

    console.log('✅ CSV autorisé - Appel API');

    const params = new URLSearchParams();
    params.append('format', format);

    if (filters.status && filters.status !== 'all') {
      params.append('status', filters.status);
    }
    if (filters.startDate) {
      params.append('startDate', filters.startDate);
    }
    if (filters.endDate) {
      params.append('endDate', filters.endDate);
    }

    const response = await fetch(`/api/invoices/export-csv?${params.toString()}`);

    if (!response.ok) {
      const error = await response.json();

      // CORRECTION : Distinguer entre feature bloquée et limite atteinte
      if (response.status === 403) {
        // Si c'est une fonctionnalité payante non disponible
        if (error.featureBlocked || error.error?.includes('réservé') || error.message?.includes('réservé')) {
          setShowLimitModal(false); // Fermer limit modal d'abord
          setUpgradeFeature(error.message || error.error || 'Export CSV');
          setUpgradeRequiredPlan(error.requiredPlan || 'pro');
          setShowUpgradeModal(true);
          throw new Error(error.message || error.error);
        }
        
        // Si c'est une limite d'usage atteinte (quantity limit)
        if (error.limitReached) {
          setShowUpgradeModal(false); // Fermer upgrade modal d'abord
          setLimitModalType('invoices');
          setShowLimitModal(true);
          throw new Error(error.message || error.error);
        }
      }

      throw new Error(error.error || 'Erreur lors de l\'export');
    }

    const contentDisposition = response.headers.get('Content-Disposition');
    const filenameMatch = contentDisposition?.match(/filename="(.+)"/);
    const filename = filenameMatch ? filenameMatch[1] : `export-${format}-${Date.now()}.csv`;

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    showSuccess(`Export CSV réussi !`);
  } catch (error: any) {
    showError(error.message);
  } finally {
    setIsExporting(false);
  }
};
  
  // Modales avec useModalState
  const emailModal = useModalState<IInvoice>();
  const reminderModal = useModalState<IInvoice>();
  const [showProfileModal, setShowProfileModal] = useState(false);

  // Formulaire avec useFormModal
  const formModal = useFormModal<any>({
    onSubmit: async (data, isEdit) => {
      // Calcul de balanceDue si absent
      let payload = { ...data };
      if (typeof payload.balanceDue !== 'number') {
        const total = typeof payload.total === 'number' ? payload.total : 0;
        const amountPaid = typeof payload.amountPaid === 'number' ? payload.amountPaid : 0;
        payload.balanceDue = total - amountPaid;
      }
      
      invoiceSchema.parse(payload);
      
      try {
        if (isEdit && data._id) {
          const saved = await invoiceService.update(data._id as string, payload);
          setInvoices((prev) => prev.map((i) => (i._id === saved._id ? { ...i, ...saved } : i)));
          showSuccess('Facture modifiée');
          refetchSubscription(); // Refresh usage data
        } else {
          const saved = await invoiceService.create(payload);
          setInvoices((prev) => [saved, ...prev]);
          showSuccess('Facture créée');
          refetchSubscription(); // Refresh usage data
        }
      } catch (error: any) {
        const errData = error.response?.data;
        if (error.response?.status === 403) {
          // If API indicates the feature is not available for this plan, show Upgrade modal
          if (errData?.error === 'Fonctionnalité non disponible' || errData?.upgradeUrl || (errData?.message && errData.message.includes('réservée'))) {
            showError(errData?.message || 'Fonctionnalité non disponible');
            setShowLimitModal(false); // Fermer limit modal d'abord
            setUpgradeFeature(errData?.message || 'Fonctionnalité payante');
            setUpgradeRequiredPlan(errData?.plan || 'pro');
            setShowUpgradeModal(true);
          } else {
            // Otherwise treat as a usage limit
            showError(errData?.message || 'Limite atteinte');
            setShowUpgradeModal(false); // Fermer upgrade modal d'abord
            setLimitModalType('invoices');
            setShowLimitModal(true);
          }
        } else {
          throw error;
        }
      }
    },
    initialValues: {
      clientId: clients[0]?._id || "",
      issueDate: new Date().toISOString().slice(0, 10),
      dueDate: new Date().toISOString().slice(0, 10),
      items: [],
      status: "draft",
    },
  });

  // Filtres avec useFilters
  const { filters, setFilter, filteredData: filteredInvoices } = useFilters({
    data: invoices,
    filterFunctions: {
      status: (invoice, value) => !value || invoice.status === value,
      search: (invoice, value) => {
        if (!value) return true;
        const searchLower = value.toLowerCase();
        return (
          invoice.invoiceNumber?.toLowerCase().includes(searchLower) ||
          (invoice.clientId as any)?.name?.toLowerCase().includes(searchLower)
        );
      },
    },
    initialFilters: { status: '', search: '' },
  });

  const openNew = () => {
    formModal.openNew({
      clientId: clients[0]?._id || "",
      issueDate: new Date().toISOString().slice(0, 10),
      dueDate: new Date().toISOString().slice(0, 10),
      items: [],
      status: "draft",
    });
  };

  const openEdit = (inv: IInvoice) => {
    // Toujours ouvrir le modal, même si finalisée ou envoyée
    // Le modal gère lui-même le mode "status only" via isStatusOnlyMode
    formModal.openEdit(inv);
  };

  const handleEmailSuccess = async () => {
    showSuccess("Email envoyé avec succès !");
    // Refresh invoice data
    try {
      const data = await invoiceService.getAll();
      setInvoices(data);
    } catch (error: any) {
      showError(error.message);
    }
  };

  // Handler pour ouvrir le dialogue de finalisation
  const handleOpenFinalizeDialog = (invoice: IInvoice) => {
    setInvoiceToFinalize(invoice);
    setShowFinalizeDialog(true);
  };

  // Handler pour finalisation réussie
  const handleFinalizeSuccess = async () => {
    showSuccess("✅ Facture finalisée et verrouillée avec succès !");
    // Refresh invoice data
    try {
      const data = await invoiceService.getAll();
      setInvoices(data);
    } catch (error: any) {
      showError(error.message);
    }
  };

  // Handler pour les actions bloquées
  const handleProfileIncompleteClick = () => {
    setShowProfileModal(true);
  };

  // Calcul des champs manquants et du pourcentage de complétion
  const getMissingFields = () => {
    const missing: string[] = [];
    if (!userData?.companyName) {
      missing.push("Raison sociale de votre entreprise");
    }
    if (!userData?.legalForm) {
      missing.push("Forme juridique (SARL, SAS, EURL, etc.)");
    }
    if (!userData?.address?.street) {
      missing.push("Adresse - Rue");
    }
    if (!userData?.address?.city) {
      missing.push("Adresse - Ville");
    }
    if (!userData?.address?.zipCode) {
      missing.push("Adresse - Code postal");
    }
    if (!userData?.address?.country) {
      missing.push("Adresse - Pays");
    }
    return missing;
  };

  const getCompletionPercentage = () => {
    // Champs de base (email, password, firstName, lastName) = 4 champs = 40 points
    // Champs profil (companyName, legalForm, address.*4) = 6 champs = 60 points
    let completed = 40; // Les 4 champs de base sont toujours présents après inscription
    
    if (userData?.companyName) completed += 10;
    if (userData?.legalForm) completed += 10;
    if (userData?.address?.street) completed += 10;
    if (userData?.address?.city) completed += 10;
    if (userData?.address?.zipCode) completed += 10;
    if (userData?.address?.country) completed += 10;
    
    return completed;
  };

  // Stats pour les cards - Utilise status pour tout
  const totalInvoices = invoices.length;
  const draftInvoices = invoices.filter(i => i.status === 'draft').length;
  const sentInvoices = invoices.filter(i => i.status === 'sent').length;
  const paidInvoices = invoices.filter(i => i.status === 'paid' || i.status === 'partially_paid').length;
  const overdueInvoices = invoices.filter(i => i.status === 'overdue').length;

  return (
    <div className="max-w-7xl mx-auto">
      {/* Notification */}
      {notification && (
        <div className="mb-4">
          <Notification notification={notification} />
        </div>
      )}

      {/* Banner informatif profil incomplet */}
      {!isProfileComplete && (
        <div className="mb-6 bg-gradient-to-r from-blue-900/30 to-indigo-900/30 border border-blue-700/50 rounded-xl p-5 animate-slide-in-up backdrop-blur-lg">
          <div className="flex flex-col items-start gap-4">
            <div className="flex-shrink-0 w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-blue-400" />
            </div>
            <div className="flex-1">
              <p className="text-gray-300 text-sm mb-3">
                Pour générer des factures conformes (PDF, email), complétez votre profil professionnel.
              </p>
              <div className="flex items-center gap-3">
                <Link 
                  href="/dashboard/settings"
                  className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white text-sm font-semibold rounded-lg transition-all shadow-lg shadow-blue-500/20"
                >
                  Compléter mon profil
                </Link>
                <span className="text-xs text-gray-400">Raison sociale • Adresse • 2 min</span>
              </div>
            </div>
          </div>
        </div>
      )}



      {/* Header */}
      <PageHeader
        title="Factures"
        description={`${filteredInvoices.length} facture${filteredInvoices.length > 1 ? 's' : ''} trouvée${filteredInvoices.length > 1 ? 's' : ''}`}
        icon={FileText}
        actionLabel="Nouvelle facture"
        actionIcon={Plus}
        onActionClick={openNew}
      />
      {/* Usage Bar */}
      {!subscriptionLoading && subscriptionData && (
        <div className="mb-6">
          <UsageBar
            current={subscriptionData.usage.invoices.current}
            limit={subscriptionData.usage.invoices.limit}
            label="Factures ce mois"
            upgradeLink="/dashboard/pricing"
          />
        </div>
      )}
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="bg-gray-900/80 backdrop-blur-lg rounded-lg px-4 py-3 shadow-2xl border border-gray-700/50 flex items-center justify-between">
          <span className="text-sm text-blue-400">Total</span>
          <span className="text-xl font-bold text-white">{totalInvoices}</span>
        </div>
        <div className="bg-blue-900/30 backdrop-blur-lg rounded-lg px-4 py-3 shadow-2xl border border-blue-700/50 flex items-center justify-between">
          <span className="text-sm text-blue-300">Envoyées</span>
          <span className="text-xl font-bold text-white">{sentInvoices}</span>
        </div>
        <div className="bg-green-900/30 backdrop-blur-lg rounded-lg px-4 py-3 shadow-2xl border border-green-700/50 flex items-center justify-between">
          <span className="text-sm text-green-300">Payées</span>
          <span className="text-xl font-bold text-white">{paidInvoices}</span>
        </div>
        <div className="bg-red-900/30 backdrop-blur-lg rounded-lg px-4 py-3 shadow-2xl border border-red-700/50 flex items-center justify-between">
          <span className="text-sm text-red-300">En retard</span>
          <span className="text-xl font-bold text-white">{overdueInvoices}</span>
        </div>
      </div>
      
      {invoices.length === 0 ? (
        <div className="text-center py-12 bg-gray-900/80 backdrop-blur-lg rounded-lg shadow-2xl border border-gray-700/50">
          <p className="text-gray-400 text-lg">Aucune facture pour l'instant</p>
          <Button onClick={openNew} className="mt-4 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 shadow-lg shadow-blue-500/20">
            Créer la première facture
          </Button>
        </div>
      ) : (
        <div>
          {/* Composant de filtres et export CSV */}
          <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex-1">
              <InvoiceFilters
                search={filters.search}
                onSearchChange={(value) => setFilter('search', value)}
                statusFilter={filters.status}
                onStatusFilterChange={(value) => setFilter('status', value)}
                onClearFilters={() => {
                setFilter('search', '');
                setFilter('status', '');
              }}
            />
            </div>

            {/* Export CSV Button */}
            <div className="relative" ref={exportMenuRef}>
              <Button
                onClick={() => setShowExportMenu(!showExportMenu)}
                disabled={isExporting || filteredInvoices.length === 0 || subscriptionLoading}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg shadow-green-500/20 relative"
              >
                <Download className="w-4 h-4 mr-2" />
                {subscriptionLoading ? 'Chargement...' : (isExporting ? 'Export en cours...' : 'Exporter CSV')}
                {(!subscriptionLoading && (subscriptionData?.plan === 'free' || !subscriptionData?.plan)) && (
                  <span className="ml-2 px-2 py-0.5 text-xs font-bold bg-yellow-500 text-gray-900 rounded-full">
                    PRO
                  </span>
                )}
              </Button>

              {/* Export Menu Dropdown */}
              {showExportMenu && (
                <div className="absolute right-0 mt-2 w-72 bg-gray-800 border border-gray-700 rounded-lg shadow-2xl z-10">
                  <div className="p-2">
                    <p className="px-3 py-2 text-xs text-gray-400 font-semibold">Format d'export</p>

                    <button
                      onClick={() => handleExportCSV('simple')}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-gray-700 rounded-md transition-colors"
                    >
                      <div className="font-medium text-white">Export simple</div>
                      <div className="text-xs text-gray-400">Résumé par facture</div>
                    </button>

                    <button
                      onClick={() => handleExportCSV('detailed')}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-gray-700 rounded-md transition-colors"
                    >
                      <div className="font-medium text-white">Export détaillé</div>
                      <div className="text-xs text-gray-400">Avec lignes de facturation</div>
                    </button>

                    <button
                      onClick={() => handleExportCSV('accounting')}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-gray-700 rounded-md transition-colors"
                    >
                      <div className="font-medium text-white">Export comptable (FEC)</div>
                      <div className="text-xs text-gray-400">Format compatible logiciels comptables</div>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Invoices List */}
          {filteredInvoices.length === 0 ? (
            <div className="text-center py-12 bg-gray-900/80 backdrop-blur-lg rounded-lg shadow-2xl border border-gray-700/50">
              <p className="text-gray-400 text-lg">Aucune facture trouvée</p>
              <Button onClick={() => {
                setFilter('search', '');
                setFilter('status', '');
              }} className="mt-4 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 shadow-lg shadow-blue-500/20">
                Réinitialiser les filtres
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredInvoices.map((inv) => {
                const client = clients.find((c) => c._id.toString() === inv.clientId?.toString());
                const clientName = client?.companyInfo?.legalName || client?.name || "";
                return (
                  <InvoiceCard
                    key={inv._id?.toString() || inv.invoiceNumber}
                    invoice={inv}
                    clientName={clientName}
                    clientData={client}
                    statusColor={statusColors[inv.status] || "bg-gray-100 text-gray-800"}
                    isProfileComplete={isProfileComplete}
                    userData={userData}
                    subscriptionData={subscriptionData || undefined}
                    onProfileIncompleteClick={handleProfileIncompleteClick}
                    onEdit={openEdit}
                    onPDF={handleExportPDF}
                    onDelete={async (invoice) => {
                      if (!invoice._id) return;
                      if (!window.confirm("Supprimer cette facture ?")) return;
                      try {
                        await invoiceService.delete(invoice._id as string);
                        setInvoices((prev) => prev.filter((i) => i._id !== invoice._id));
                        showSuccess("Facture supprimée avec succès.");
                      } catch (e: any) {
                        showError(e.message || "Erreur lors de la suppression");
                      }
                    }}
                    onSendEmail={emailModal.open}
                    onSendReminder={reminderModal.open}
                    onFinalize={handleOpenFinalizeDialog}
                    onUpgradeRequired={(feature, plan) => {
                      setUpgradeFeature(feature);
                      setUpgradeRequiredPlan(plan);
                      setShowUpgradeModal(true);
                    }}
                  />
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      <InvoiceFormModal
        open={formModal.isOpen}
        onClose={formModal.close}
        onSubmit={formModal.handleSubmit}
        form={formModal.formData}
        setForm={(data) => {
          if (typeof data === 'function') {
            formModal.setFormData(data);
          } else {
            formModal.setFormData(data);
          }
        }}
        formError={formModal.error}
        formLoading={formModal.loading}
        clients={clients}
        editMode={formModal.isEditMode}
        handleFormChange={formModal.handleChange}
      />

      {/* Email Modals */}
      {emailModal.isOpen && emailModal.data && (
        <EmailPreviewModal
          isOpen={emailModal.isOpen}
          onClose={emailModal.close}
          onSend={async (customMessage?: string) => {
            try {
              const response = await fetch(`/api/email/send-invoice`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  invoiceId: emailModal.data?._id,
                  customMessage
                }),
              });
              
              if (!response.ok) {
                const error = await response.json();
                // If API indicates a PRO feature is blocked (403 + featureBlocked), show Upgrade modal
                if (response.status === 403 && error.featureBlocked) {
                  setShowLimitModal(false); // Fermer limit modal d'abord
                  setUpgradeFeature(error.message || error.error || 'Envoi email automatique');
                  setUpgradeRequiredPlan(error.requiredPlan || 'pro');
                  setShowUpgradeModal(true);
                }
                throw new Error(error.error || error.message || 'Erreur lors de l\'envoi');
              }
              
              await handleEmailSuccess();
              emailModal.close();
            } catch (error: any) {
              showError(error.message);
              throw error;
            }
          }}
          emailData={{
            type: 'invoice',
            recipientEmail: clients.find(c => c._id.toString() === emailModal.data?.clientId?.toString())?.email || '',
            recipientName: clients.find(c => c._id.toString() === emailModal.data?.clientId?.toString())?.name || '',
            documentNumber: emailModal.data.invoiceNumber || '',
            total: emailModal.data.total || 0,
            companyName: userData?.companyName || 'Votre entreprise',
          }}
        />
      )}

      {reminderModal.isOpen && reminderModal.data && (
        <SendReminderModal
          invoice={reminderModal.data}
          clientEmail={clients.find(c => c._id.toString() === reminderModal.data?.clientId?.toString())?.email || ''}
          onClose={reminderModal.close}
          onSuccess={handleEmailSuccess}
          onUpgradeRequired={() => {
            setShowLimitModal(false); // Fermer limit modal d'abord
            setUpgradeFeature('Rappels de paiement');
            setUpgradeRequiredPlan('pro');
            setShowUpgradeModal(true);
          }}
        />
      )}

      {/* Profile Completion Modal */}
      <ProfileCompletionModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        missingFields={getMissingFields()}
        completionPercentage={getCompletionPercentage()}
      />

      {/* Limit Reached Modal */}
      {showLimitModal && (
        <LimitReachedModal
          isOpen={showLimitModal}
          onClose={() => {
            console.log('🔴 Fermeture LimitReachedModal');
            setShowLimitModal(false);
          }}
          limitType={limitModalType}
          // Provide safe defaults in case subscriptionData is not yet loaded
          currentUsage={subscriptionData?.usage?.invoices?.current || 0}
          limit={subscriptionData?.usage?.invoices?.limit === 'unlimited' ? 999 : (subscriptionData?.usage?.invoices?.limit || 5)}
          currentPlan={subscriptionData?.plan || 'free'}
        />
      )}
      {showUpgradeModal && (
        <UpgradeModal
          isOpen={showUpgradeModal}
          onClose={() => {
            console.log('🟢 Fermeture UpgradeModal');
            setShowUpgradeModal(false);
          }}
          feature={upgradeFeature}
          currentPlan={(subscriptionData?.plan as any) || 'free'}
          requiredPlan={upgradeRequiredPlan}
        />
      )}

      {/* Finalize Invoice Dialog */}
      {showFinalizeDialog && invoiceToFinalize && (
        <FinalizeInvoiceDialog
          open={showFinalizeDialog}
          onClose={() => {
            setShowFinalizeDialog(false);
            setInvoiceToFinalize(null);
          }}
          invoice={invoiceToFinalize}
          client={clients.find(c => c._id === invoiceToFinalize.clientId?.toString())}
          onSuccess={handleFinalizeSuccess}
        />
      )}
    </div>
  );
}

// Helper functions must be after the InvoiceList component


export function handleExportPDF(id: string) {
  // Ouvre le PDF dans un nouvel onglet
  if (!id) return;
  const url = `/api/invoices/${id}/pdf`;
  window.open(url, '_blank');
}
