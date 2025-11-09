'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import QuoteCard from './QuoteCard';
import QuoteFilters from './QuoteFilters';
import QuoteFormModal from './QuoteFormModal';
import ConvertQuoteModal from './ConvertQuoteModal';
import QuotePreviewModal from './QuotePreviewModal';
import SendQuoteEmailModal from './SendQuoteEmailModal';
import EmailPreviewModal from '@/components/common/EmailPreviewModal';
import { Notification } from '@/components/common/Notification';
import { PageHeader } from '@/components/common/PageHeader';
import { useFormModal, useModalState, useFilters, useNotification } from '@/hooks';
import { quoteService } from '@/services';
import { Button } from '@/components/ui/button';
import { FileText, Plus } from 'lucide-react';
import { UsageBar } from '@/components/subscription/UsageBar';
import { LimitReachedModal } from '@/components/subscription/LimitReachedModal';
import { UpgradeModal } from '@/components/subscription/UpgradeModal';
import { useSubscription } from '@/hooks/useSubscription';
import { PLANS } from '@/lib/subscription/plans';

interface QuoteManagementProps {
  initialQuotes: any[];
  initialClients: any[];
}

export default function QuoteManagement({ initialQuotes, initialClients }: QuoteManagementProps) {
  const router = useRouter();
  
  // State
  const [quotes, setQuotes] = useState<any[]>(initialQuotes);
  const [clients] = useState<any[]>(initialClients);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [limitModalType, setLimitModalType] = useState<'invoices' | 'quotes' | 'expenses' | 'clients'>('quotes');

  // Upgrade modal for PRO features
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeFeature, setUpgradeFeature] = useState('');
  const [upgradeRequiredPlan, setUpgradeRequiredPlan] = useState<'pro' | 'business'>('pro');

  // Subscription
  const { data: subscriptionData } = useSubscription();
  const usage = subscriptionData?.usage;
  const plan = subscriptionData?.plan;

  // Hooks personnalisés
  const { showSuccess, showError, notification } = useNotification();

  // Debug: Log modal state changes
  useEffect(() => {
    console.log('🎭 [QUOTES] État des modaux:', {
      showLimitModal,
      showUpgradeModal,
      upgradeFeature,
      limitModalType
    });
  }, [showLimitModal, showUpgradeModal, upgradeFeature, limitModalType]);
  
  // Modales avec useModalState
  const convertModal = useModalState<any>();
  const previewModal = useModalState<any>();
  const emailModal = useModalState<any>();

  // Formulaire avec useFormModal
  const formModal = useFormModal<any>({
    onSubmit: async (data, isEdit) => {
      try {
        if (isEdit && data._id) {
          const updated = await quoteService.update(data._id as string, data);
          setQuotes(prev => prev.map(q => q._id === updated._id ? updated : q));
          showSuccess('Devis mis à jour avec succès');
        } else {
          const created = await quoteService.create(data);
          setQuotes(prev => [created, ...prev]);
          showSuccess('Devis créé avec succès');
        }
      } catch (error: any) {
        const errData = error.response?.data;
        if (error.response?.status === 403) {
          console.log('🚨 [QUOTES] Erreur 403:', errData);

          // Si c'est une fonctionnalité payante bloquée
          if (errData?.featureBlocked || errData?.error === 'Fonctionnalité non disponible' || errData?.upgradeUrl || (errData?.message && errData.message.includes('réservée'))) {
            console.log('🟣 [QUOTES] Fonctionnalité bloquée - Ouverture UpgradeModal');
            showError(errData?.message || 'Fonctionnalité non disponible');
            setShowLimitModal(false); // Fermer limit modal d'abord
            setUpgradeFeature(errData?.message || 'Fonctionnalité payante');
            setUpgradeRequiredPlan(errData?.requiredPlan || 'pro');
            setShowUpgradeModal(true);
          }
          // Si c'est une limite de quantité atteinte
          else if (errData?.limitReached) {
            console.log('🔴 [QUOTES] Limite atteinte - Ouverture LimitReachedModal');
            showError(errData.error || 'Limite de devis atteinte');
            setShowUpgradeModal(false); // Fermer upgrade modal d'abord
            setLimitModalType('quotes');
            setShowLimitModal(true);
          } else {
            showError(errData?.error || 'Erreur lors de la création du devis');
          }
        } else {
          showError(error.response?.data?.error || 'Erreur lors de la création du devis');
        }
        throw error;
      }
    },
    initialValues: {
      clientId: '',
      issueDate: new Date().toISOString().slice(0, 10),
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      items: [{ description: '', quantity: 1, unitPrice: 0, taxRate: 20, unit: 'unit' }],
      status: 'draft',
      notes: '',
      privateNotes: '',
      terms: '',
    },
  });

  // Filtres avec useFilters
  const { filters, setFilter, filteredData: filteredQuotes } = useFilters({
    data: quotes,
    filterFunctions: {
      status: (quote, value) => !value || quote.status === value,
      search: (quote, value) => {
        if (!value) return true;
        const searchLower = value.toLowerCase();
        return (
          quote.quoteNumber?.toLowerCase().includes(searchLower) ||
          quote.clientId?.name?.toLowerCase().includes(searchLower)
        );
      },
    },
    initialFilters: { status: '', search: '' },
  });

  // Form handlers
  const openNew = () => {
    const today = new Date().toISOString().slice(0, 10);
    const validUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

    formModal.openNew({
      clientId: clients[0]?._id || '',
      issueDate: today,
      validUntil: validUntil,
      items: [{ description: '', quantity: 1, unitPrice: 0, taxRate: 20, unit: 'unit' }],
      status: 'draft',
      notes: '',
      privateNotes: '',
      terms: '',
    });
  };

  const openEdit = (quote: any) => {
    formModal.openEdit({
      ...quote,
      clientId: (quote.clientId as any)._id || quote.clientId,
    });
  };

  // Delete handler
  const handleDelete = async (quote: any) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer le devis ${quote.quoteNumber} ?`)) {
      return;
    }

    try {
      await quoteService.delete(quote._id);
      setQuotes(prev => prev.filter(q => q._id !== quote._id));
      showSuccess('Devis supprimé avec succès');
    } catch (error: any) {
      showError(error.message);
    }
  };

  // Status change handler
  const handleStatusChange = async (quote: any, newStatus: 'accepted' | 'rejected') => {
    const confirmMessage = newStatus === 'accepted' 
      ? `Marquer le devis ${quote.quoteNumber} comme ACCEPTÉ ?`
      : `Marquer le devis ${quote.quoteNumber} comme REFUSÉ ?`;
    
    if (!confirm(confirmMessage)) return;

    try {
      await quoteService.updateStatus(quote._id, newStatus);
      setQuotes(prev => prev.map(q => q._id === quote._id ? { ...q, status: newStatus } : q));
      showSuccess(`Devis ${newStatus === 'accepted' ? 'accepté' : 'refusé'}`);
    } catch (error: any) {
      showError(error.message);
    }
  };

  // Convert to invoice
  const handleConvertToInvoice = async (quoteId: string, invoiceData: any) => {
    try {
      const invoice = await quoteService.convertToInvoice(quoteId, invoiceData);
      showSuccess('Devis converti en facture avec succès');
      convertModal.close();
      router.push(`/dashboard/invoices`);
    } catch (error: any) {
      showError(error.message);
      throw error;
    }
  };

  // Send email - modal interne gère l'envoi
  const handleEmailSuccess = () => {
    showSuccess('Email envoyé avec succès');
    emailModal.close();
  };

  // Stats
  const totalQuotes = quotes.length;
  const draftQuotes = quotes.filter(q => q.status === 'draft').length;
  const sentQuotes = quotes.filter(q => q.status === 'sent').length;
  const acceptedQuotes = quotes.filter(q => q.status === 'accepted').length;

  return (
    <div className="max-w-7xl mx-auto">
      {/* Notification */}
      {notification && <Notification notification={notification} />}

      {/* Header */}
      <PageHeader
        title="Devis"
        description={`${filteredQuotes.length} devis trouvé${filteredQuotes.length > 1 ? 's' : ''}`}
        icon={FileText}
        actionLabel="Nouveau devis"
        actionIcon={Plus}
        onActionClick={openNew}
      />

      {/* Usage Bar */}
      {usage?.quotes && plan && (
        <div className="mb-6">
          <UsageBar
            current={usage.quotes.current}
            limit={usage.quotes.limit}
            label="Devis ce mois-ci"
            upgradeLink="/dashboard/pricing"
          />
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="bg-gray-900/80 backdrop-blur-lg rounded-lg px-4 py-3 shadow-2xl border border-gray-700/50 flex items-center justify-between">
          <span className="text-sm text-gray-400">Total</span>
          <span className="text-xl font-bold text-white">{totalQuotes}</span>
        </div>
        <div className="bg-blue-900/30 backdrop-blur-lg rounded-lg px-4 py-3 shadow-2xl border border-blue-700/50 flex items-center justify-between">
          <span className="text-sm text-blue-400">Brouillons</span>
          <span className="text-xl font-bold text-blue-300">{draftQuotes}</span>
        </div>
        <div className="bg-purple-900/30 backdrop-blur-lg rounded-lg px-4 py-3 shadow-2xl border border-purple-700/50 flex items-center justify-between">
          <span className="text-sm text-purple-400">Envoyés</span>
          <span className="text-xl font-bold text-purple-300">{sentQuotes}</span>
        </div>
        <div className="bg-green-900/30 backdrop-blur-lg rounded-lg px-4 py-3 shadow-2xl border border-green-700/50 flex items-center justify-between">
          <span className="text-sm text-green-400">Acceptés</span>
          <span className="text-xl font-bold text-green-300">{acceptedQuotes}</span>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6">
        <QuoteFilters
          search={filters.search}
          setSearch={(value: string) => setFilter('search', value)}
          statusFilter={filters.status}
          setStatusFilter={(value: string) => setFilter('status', value)}
        />
      </div>

      {/* Quotes List */}
      {filteredQuotes.length === 0 && quotes.length === 0 ? (
        <div className="text-center py-12 bg-gray-900/80 backdrop-blur-lg rounded-lg shadow-2xl border border-gray-700/50">
          <p className="text-gray-200 text-lg">Aucun devis pour l'instant</p>
          <p className="text-gray-400 text-sm mt-2">Créez votre premier devis pour commencer !</p>
          <Button onClick={openNew} className="mt-4 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-lg shadow-green-500/20" size="lg">
            Créer le premier devis
          </Button>
        </div>
      ) : filteredQuotes.length === 0 ? (
        <div className="text-center py-12 bg-gray-900/80 backdrop-blur-lg rounded-lg shadow-2xl border border-gray-700/50">
          <p className="text-gray-200 text-lg">Aucun devis trouvé</p>
          <p className="text-gray-400 text-sm mt-2">Essayez de modifier vos critères de recherche</p>
          <Button onClick={() => {
            setFilter('search', '');
            setFilter('status', '');
          }} className="mt-4">
            Réinitialiser les filtres
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredQuotes.map((quote) => (
            <QuoteCard
              key={quote._id}
              quote={quote}
              onView={() => previewModal.open(quote)}
              onEdit={() => openEdit(quote)}
              onDelete={() => handleDelete(quote)}
              onStatusChange={(newStatus) => handleStatusChange(quote, newStatus)}
              onConvert={() => convertModal.open(quote)}
              onSendEmail={() => emailModal.open(quote)}
              onUpgradeRequired={(feature, requiredPlan) => {
                console.log('🟣 [QUOTES] Callback upgrade depuis QuoteCard:', feature, requiredPlan);
                setShowLimitModal(false);
                setUpgradeFeature(feature);
                setUpgradeRequiredPlan(requiredPlan);
                setShowUpgradeModal(true);
              }}
              onSuccess={(message) => showSuccess(message)}
              onError={(message) => showError(message)}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      <QuoteFormModal
        open={formModal.isOpen}
        onClose={formModal.close}
        onSubmit={formModal.handleSubmit}
        form={formModal.formData}
        setForm={formModal.setFormData}
        formError={formModal.error}
        formLoading={formModal.loading}
        clients={clients}
        editMode={formModal.isEditMode}
        handleFormChange={formModal.handleChange}
      />

      {convertModal.isOpen && convertModal.data && (
        <ConvertQuoteModal
          open={convertModal.isOpen}
          quote={convertModal.data}
          onClose={convertModal.close}
          onConvert={async (data) => {
            await handleConvertToInvoice(convertModal.data._id, data);
          }}
        />
      )}

      {previewModal.isOpen && previewModal.data && (
        <QuotePreviewModal
          quote={previewModal.data}
          isOpen={previewModal.isOpen}
          onClose={previewModal.close}
        />
      )}

      {emailModal.isOpen && emailModal.data && (
        <EmailPreviewModal
          isOpen={emailModal.isOpen}
          onClose={emailModal.close}
          onSend={async (customMessage?: string) => {
            try {
              const response = await fetch(`/api/email/send-quote`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  quoteId: emailModal.data?._id,
                  customMessage
                }),
              });
              
              if (!response.ok) {
                const error = await response.json();
                console.log('🚨 [QUOTES] Erreur envoi email:', error);

                // Si c'est une erreur 403, distinguer entre feature bloquée et limite atteinte
                if (response.status === 403) {
                  // Si c'est une fonctionnalité payante bloquée
                  if (error.featureBlocked || error.error?.includes('Fonctionnalité') || error.message?.includes('réservée') || error.upgradeUrl) {
                    console.log('🟣 [QUOTES] Envoi email bloqué - Ouverture UpgradeModal');
                    setShowLimitModal(false); // Fermer limit modal d'abord
                    setUpgradeFeature(error.message || error.error || 'Envoi email automatique');
                    setUpgradeRequiredPlan(error.requiredPlan || 'pro');
                    setShowUpgradeModal(true);
                    throw new Error(error.message || error.error);
                  }

                  // Si c'est une limite d'usage atteinte
                  if (error.limitReached) {
                    console.log('🔴 [QUOTES] Limite atteinte - Ouverture LimitReachedModal');
                    setShowUpgradeModal(false); // Fermer upgrade modal d'abord
                    setLimitModalType('quotes');
                    setShowLimitModal(true);
                    throw new Error(error.message || error.error);
                  }
                }

                throw new Error(error.error || 'Erreur lors de l\'envoi');
              }

              handleEmailSuccess();
              emailModal.close();
            } catch (error: any) {
              showError(error.message);
              throw error;
            }
          }}
          emailData={{
            type: 'quote',
            recipientEmail: clients.find(c => c._id.toString() === emailModal.data?.clientId?.toString())?.email || '',
            recipientName: clients.find(c => c._id.toString() === emailModal.data?.clientId?.toString())?.name || '',
            documentNumber: emailModal.data.quoteNumber || '',
            total: emailModal.data.total || 0,
            companyName: emailModal.data.userId?.companyName || 'Votre entreprise',
          }}
        />
      )}

      {/* Limit Reached Modal - Pour les limites de quantité */}
      {showLimitModal && subscriptionData && (
        <LimitReachedModal
          isOpen={showLimitModal}
          onClose={() => {
            console.log('🔴 [QUOTES] Fermeture LimitReachedModal');
            setShowLimitModal(false);
          }}
          limitType={limitModalType}
          currentUsage={subscriptionData.usage?.quotes?.current || 0}
          limit={subscriptionData.usage?.quotes?.limit === 'unlimited' ? 999 : (subscriptionData.usage?.quotes?.limit || 5)}
          currentPlan={subscriptionData.plan}
        />
      )}

      {/* Upgrade Modal - Pour les fonctionnalités PRO bloquées */}
      {showUpgradeModal && subscriptionData && (
        <UpgradeModal
          isOpen={showUpgradeModal}
          onClose={() => {
            console.log('🟢 [QUOTES] Fermeture UpgradeModal');
            setShowUpgradeModal(false);
          }}
          feature={upgradeFeature}
          currentPlan={subscriptionData.plan}
          requiredPlan={upgradeRequiredPlan}
        />
      )}
    </div>
  );
}
