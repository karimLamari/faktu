'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Tag, Calendar, X, Filter, RotateCcw } from 'lucide-react';

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

interface ExpenseFiltersModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: {
    search?: string;
    category?: string;
  };
  dateRange: {
    start: string;
    end: string;
  };
  onApplyFilters: (filters: any, dateRange: any) => void;
  activeFiltersCount: number;
}

export function ExpenseFiltersModal({
  isOpen,
  onClose,
  filters,
  dateRange,
  onApplyFilters,
  activeFiltersCount,
}: ExpenseFiltersModalProps) {
  const [localFilters, setLocalFilters] = useState(filters);
  const [localDateRange, setLocalDateRange] = useState(dateRange);

  useEffect(() => {
    setLocalFilters(filters);
    setLocalDateRange(dateRange);
  }, [filters, dateRange, isOpen]);

  const handleApply = () => {
    onApplyFilters(localFilters, localDateRange);
    onClose();
  };

  const handleReset = () => {
    const resetFilters = { search: '', category: 'Toutes' };
    const resetDateRange = { start: '', end: '' };
    setLocalFilters(resetFilters);
    setLocalDateRange(resetDateRange);
    onApplyFilters(resetFilters, resetDateRange);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in p-4">
      <div className="bg-gray-900/95 backdrop-blur-lg rounded-2xl shadow-2xl border border-gray-700/50 w-full max-w-2xl max-h-[90vh] overflow-hidden animate-slide-in-up">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-900/20 rounded-lg flex items-center justify-center">
                <Filter className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Filtres de recherche</h2>
                <p className="text-indigo-100 text-sm">
                  {activeFiltersCount > 0 
                    ? `${activeFiltersCount} filtre${activeFiltersCount > 1 ? 's' : ''} actif${activeFiltersCount > 1 ? 's' : ''}`
                    : 'Affinez votre recherche'
                  }
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white hover:bg-gray-900/10 p-2 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 200px)' }}>
          {/* Recherche */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
              <Search className="w-4 h-4 text-indigo-400" />
              Recherche
            </label>
            <Input
              type="text"
              value={localFilters.search || ''}
              onChange={(e) => setLocalFilters({ ...localFilters, search: e.target.value })}
              placeholder="Fournisseur, description, numéro de facture..."
              className="h-10 bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500"
            />
            <p className="text-xs text-gray-500">
              Recherchez dans les fournisseurs, descriptions et numéros de facture
            </p>
          </div>

          {/* Catégorie */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
              <Tag className="w-4 h-4 text-indigo-400" />
              Catégorie
            </label>
            <select
              value={localFilters.category || 'Toutes'}
              onChange={(e) => setLocalFilters({ ...localFilters, category: e.target.value })}
              className="w-full h-10 px-3 bg-gray-800/50 border border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat} className="bg-gray-800">
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Plage de dates */}
          <div className="space-y-4">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
              <Calendar className="w-4 h-4 text-indigo-400" />
              Période
            </label>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs text-gray-400">Date de début</label>
                <input
                  type="date"
                  value={localDateRange.start}
                  onChange={(e) => setLocalDateRange({ ...localDateRange, start: e.target.value })}
                  className="w-full h-10 px-3 bg-gray-800/50 border border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-xs text-gray-400">Date de fin</label>
                <input
                  type="date"
                  value={localDateRange.end}
                  onChange={(e) => setLocalDateRange({ ...localDateRange, end: e.target.value })}
                  className="w-full h-10 px-3 bg-gray-800/50 border border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Résumé des filtres actifs */}
          {activeFiltersCount > 0 && (
            <div className="bg-indigo-900/30 border border-indigo-700/50 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <div className="w-5 h-5 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded flex items-center justify-center flex-shrink-0 mt-0.5 shadow-lg shadow-indigo-500/20">
                  <span className="text-white text-xs font-bold">{activeFiltersCount}</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-indigo-300">Filtres actifs</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {localFilters.search && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-800/50 rounded-md text-xs text-indigo-400 border border-indigo-700/50">
                        <Search className="w-3 h-3" />
                        {localFilters.search}
                      </span>
                    )}
                    {localFilters.category && localFilters.category !== 'Toutes' && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-800/50 rounded-md text-xs text-indigo-400 border border-indigo-700/50">
                        <Tag className="w-3 h-3" />
                        {localFilters.category}
                      </span>
                    )}
                    {(localDateRange.start || localDateRange.end) && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-800/50 rounded-md text-xs text-indigo-400 border border-indigo-700/50">
                        <Calendar className="w-3 h-3" />
                        {localDateRange.start && new Date(localDateRange.start).toLocaleDateString('fr-FR')}
                        {localDateRange.start && localDateRange.end && ' → '}
                        {localDateRange.end && new Date(localDateRange.end).toLocaleDateString('fr-FR')}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-700/50 p-6 bg-gray-800/50 flex justify-between items-center gap-4">
          <Button
            variant="ghost"
            onClick={handleReset}
            className="gap-2 text-gray-300 hover:text-white hover:bg-gray-700/50"
          >
            <RotateCcw className="w-4 h-4" />
            Réinitialiser
          </Button>
          
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="bg-gray-800/50 border-gray-700 text-gray-300 hover:bg-gray-700/50"
            >
              Annuler
            </Button>
            <Button
              onClick={handleApply}
              className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 shadow-lg shadow-indigo-500/20"
            >
              Appliquer les filtres
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
