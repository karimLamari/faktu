'use client';

import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import ExpenseCard from './ExpenseCard';
import ExpenseFormModal from './ExpenseFormModal';
import { ExpenseFiltersModal } from './ExpenseFiltersModal';
import { useNotification, useModalState, useFilters } from '@/hooks';
import { expenseService, type Expense } from '@/services';
import { ManagementLayout } from '@/components/common/ManagementLayout';
import { FiDollarSign, FiBarChart2, FiTrendingUp } from 'react-icons/fi';
import { Receipt, Filter, Camera } from 'lucide-react';
import { UsageBar } from '@/components/subscription/UsageBar';
import { LimitReachedModal } from '@/components/subscription/LimitReachedModal';
import { UpgradeModal } from '@/components/subscription/UpgradeModal';
import { useSubscription } from '@/hooks/useSubscription';
import { PLANS } from '@/lib/subscription/plans';

const categories = [
  'Toutes',
  'Restaurant',
  'Transport',
  'Carburant',
  'Fournitures',
  'Logiciel',
  'Matériel',
  'Formation',
  'Téléphone',
  'Internet',
  'Loyer',
  'Assurance',
  'Autre',
];

interface ExpenseManagementProps {
  initialExpenses: Expense[];
}

export default function ExpenseManagement({ initialExpenses }: ExpenseManagementProps) {
  const [expenses, setExpenses] = useState<Expense[]>(initialExpenses);
  const [isLoading, setIsLoading] = useState(false);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [isFiltersModalOpen, setIsFiltersModalOpen] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [limitModalType, setLimitModalType] = useState<'invoices' | 'quotes' | 'expenses' | 'clients'>('expenses');

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
  const editModal = useModalState<Expense>();
  const createModal = useModalState();

  // Filtres
  const { filters, setFilter, filteredData: filteredExpenses } = useFilters({
    data: expenses,
    filterFunctions: {
      category: (expense, value) => !value || value === 'Toutes' || expense.category === value,
      search: (expense, value) => {
        if (!value) return true;
        const searchLower = (value || '').toLowerCase();
        return Boolean(
          expense.vendor?.toLowerCase().includes(searchLower) ||
          expense.description?.toLowerCase().includes(searchLower) ||
          expense.notes?.toLowerCase().includes(searchLower) ||
          expense.invoiceNumber?.toLowerCase().includes(searchLower)
        );
      },
    },
  });

  // Rafraîchir les données quand les filtres de date changent
  useEffect(() => {
    if (dateRange.start || dateRange.end) {
      fetchExpenses();
    }
  }, [dateRange]);

  const fetchExpenses = async () => {
    setIsLoading(true);
    try {
      const data = await expenseService.getAll();
      
      // Filtrer par date côté client si nécessaire
      let filtered = data;
      if (dateRange.start || dateRange.end) {
        filtered = data.filter(exp => {
          const expDate = new Date(exp.date);
          if (dateRange.start && expDate < new Date(dateRange.start)) return false;
          if (dateRange.end && expDate > new Date(dateRange.end)) return false;
          return true;
        });
      }
      
      setExpenses(filtered);
    } catch (error: any) {
      showError(error.message || 'Erreur lors du chargement des dépenses');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateExpense = async (data: any, image: File) => {
    try {
      const created = await expenseService.create({
        file: image,
        supplierName: data.vendor || data.supplierName,
        amount: data.amount,
        taxAmount: data.taxAmount || 0,
        date: data.date,
        category: data.category,
        notes: data.notes,
        description: data.description,
      });
      
      setExpenses(prev => [created, ...prev]);
      showSuccess('Dépense créée avec succès');
      createModal.close();
    } catch (error: any) {
      const errData = error.response?.data;

      if (error.response?.status === 403) {
        // Feature bloquée
        if (errData?.featureBlocked || errData?.error === 'Fonctionnalité non disponible' || errData?.upgradeUrl) {
          showError(errData?.message || 'Fonctionnalité non disponible');
          setShowLimitModal(false);
          setUpgradeFeature(errData?.message || 'Fonctionnalité payante');
          setUpgradeRequiredPlan(errData?.requiredPlan || 'pro');
          setShowUpgradeModal(true);
        }
        // Limite atteinte
        else if (errData?.limitReached) {
          showError(errData?.error || 'Limite de dépenses atteinte');
          setShowUpgradeModal(false);
          setLimitModalType('expenses');
          setShowLimitModal(true);
        } else {
          showError(errData?.error || error.message || 'Erreur lors de la création');
        }
      } else {
        showError(errData?.error || error.message || 'Erreur lors de la création');
      }
      throw error;
    }
  };

  const handleUpdateExpense = async (data: any, image?: File) => {
    if (!editModal.data?._id) return;
    
    try {
      const updated = await expenseService.update(editModal.data._id, {
        vendor: data.vendor || data.supplierName,
        amount: data.amount,
        taxAmount: data.taxAmount || 0,
        date: data.date,
        category: data.category,
        notes: data.notes,
        description: data.description,
      });
      
      setExpenses(prev => prev.map(exp => 
        exp._id === updated._id ? updated : exp
      ));
      showSuccess('Dépense modifiée avec succès');
      editModal.close();
    } catch (error: any) {
      showError(error.message || 'Erreur lors de la modification');
      throw error;
    }
  };

  const handleDeleteExpense = async (id: string) => {
    if (!window.confirm('Supprimer cette dépense ?')) return;
    
    try {
      await expenseService.delete(id);
      setExpenses(prev => prev.filter(exp => exp._id !== id));
      showSuccess('Dépense supprimée avec succès');
    } catch (error: any) {
      showError(error.message || 'Erreur lors de la suppression');
    }
  };

  // Calcul des statistiques
  const stats = useMemo(() => {
    const totalAmount = filteredExpenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);
    const totalTax = filteredExpenses.reduce((sum, exp) => sum + (exp.taxAmount || 0), 0);
    const expenseCount = filteredExpenses.length;
    
    return { totalAmount, totalTax, expenseCount };
  }, [filteredExpenses]);

  const currentMonth = new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
  
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.search) count++;
    if (filters.category && filters.category !== 'Toutes') count++;
    if (dateRange.start || dateRange.end) count++;
    return count;
  }, [filters, dateRange]);

  const handleApplyFilters = (newFilters: any, newDateRange: any) => {
    setFilter('search', newFilters.search);
    setFilter('category', newFilters.category);
    setDateRange(newDateRange);
  };

  const handleResetFilters = () => {
    setFilter('search', '');
    setFilter('category', 'Toutes');
    setDateRange({ start: '', end: '' });
  };

  // Bouton de filtres
  const filtersComponent = (
    <div className="flex justify-end">
      <Button
        onClick={() => setIsFiltersModalOpen(true)}
        variant="outline"
        className="gap-2 relative text-white"
      >
        <Filter className=" text-white w-4 h-4" />
        Filtres
        {activeFiltersCount > 0 && (
          <span className="absolute -top-2 -right-2 w-5 h-5 bg-indigo-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
            {activeFiltersCount}
          </span>
        )}
      </Button>
    </div>
  );

  return (
    <>
      {/* Usage Bar */}
      {usage?.expenses && plan && (
        <div className="mb-6">
          <UsageBar
            current={usage.expenses.current}
            limit={usage.expenses.limit}
            label="Dépenses ce mois-ci"
            upgradeLink="/dashboard/pricing"
          />
        </div>
      )}

      <ManagementLayout
        title="Mes Dépenses"
        subtitle={`${filteredExpenses.length} dépense${filteredExpenses.length > 1 ? 's' : ''} • ${currentMonth}`}
        icon={Receipt}
        buttonLabel="Nouvelle dépense"
        onButtonClick={() => createModal.open()}
        stats={[
          { 
            label: `Total ${currentMonth}`, 
            value: `${stats.totalAmount.toFixed(2)} €`,
            bgColor: '', 
            textColor: '', 
            borderColor: '',
            icon: <FiDollarSign className="w-5 h-5" />
          },
          { 
            label: 'Nombre de dépenses', 
            value: stats.expenseCount,
            bgColor: '', 
            textColor: '', 
            borderColor: '',
            icon: <FiBarChart2 className="w-5 h-5" />
          },
          { 
            label: 'TVA totale', 
            value: `${stats.totalTax.toFixed(2)} €`,
            bgColor: '', 
            textColor: '', 
            borderColor: '',
            icon: <FiTrendingUp className="w-5 h-5" />
          },
        ]}
        filters={filtersComponent}
        isEmpty={filteredExpenses.length === 0 && expenses.length === 0}
        emptyMessage="Aucune dépense pour le moment"
        emptyDescription="Commencez à photographier vos factures pour suivre vos dépenses automatiquement !"
        notification={notification}
      >
        {isLoading ? (
          <div className="col-span-full flex justify-center items-center py-20">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredExpenses.length === 0 ? (
          <div className="col-span-full text-center py-12 bg-gray-900/80 backdrop-blur-lg rounded-lg shadow-2xl border border-gray-700/50">
            <Camera className="w-16 h-16 mx-auto text-gray-600 mb-4" />
            <p className="text-gray-300 text-lg">Aucune dépense trouvée</p>
            <p className="text-gray-500 text-sm mt-2">Essayez de modifier vos filtres</p>
            <Button onClick={handleResetFilters} className="mt-4 bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600 shadow-lg shadow-indigo-500/20">
              Réinitialiser les filtres
            </Button>
          </div>
        ) : (
          filteredExpenses.map((expense) => (
            <ExpenseCard
              key={expense._id}
              expense={expense as any}
              onEdit={editModal.open}
              onDelete={handleDeleteExpense}
            />
          ))
        )}
      </ManagementLayout>

      {/* Filters Modal */}
      <ExpenseFiltersModal
        isOpen={isFiltersModalOpen}
        onClose={() => setIsFiltersModalOpen(false)}
        filters={filters}
        dateRange={dateRange}
        onApplyFilters={handleApplyFilters}
        activeFiltersCount={activeFiltersCount}
      />

      {/* Create Modal */}
      {createModal.isOpen && (
        <ExpenseFormModal
          isOpen={createModal.isOpen}
          onClose={createModal.close}
          onSubmit={handleCreateExpense}
          mode="create"
        />
      )}

      {/* Edit Modal */}
      {editModal.isOpen && editModal.data && (
        <ExpenseFormModal
          isOpen={editModal.isOpen}
          onClose={editModal.close}
          onSubmit={handleUpdateExpense}
          initialData={editModal.data}
          mode="edit"
        />
      )}

      {/* Limit Reached Modal - Pour les limites de quantité */}
      {showLimitModal && subscriptionData && (
        <LimitReachedModal
          isOpen={showLimitModal}
          onClose={() => setShowLimitModal(false)}
          limitType={limitModalType}
          currentUsage={subscriptionData.usage?.expenses?.current || 0}
          limit={subscriptionData.usage?.expenses?.limit === 'unlimited' ? 999 : (subscriptionData.usage?.expenses?.limit || 5)}
          currentPlan={subscriptionData.plan}
        />
      )}

      {/* Upgrade Modal - Pour les fonctionnalités PRO bloquées */}
      {showUpgradeModal && subscriptionData && (
        <UpgradeModal
          isOpen={showUpgradeModal}
          onClose={() => setShowUpgradeModal(false)}
          feature={upgradeFeature}
          currentPlan={subscriptionData.plan}
          requiredPlan={upgradeRequiredPlan}
        />
      )}
    </>
  );
}
