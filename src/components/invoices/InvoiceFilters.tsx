import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { FiSearch } from 'react-icons/fi';

interface InvoiceFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  onClearFilters?: () => void;
  showClearButton?: boolean;
}

const InvoiceFilters: React.FC<InvoiceFiltersProps> = ({
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  onClearFilters,
  showClearButton = true,
}) => {
  const statuses = [
    { value: '', label: 'Tous les statuts' },
    { value: 'draft', label: 'Brouillon' },
    { value: 'sent', label: 'Envoyé' },
    { value: 'paid', label: 'Payé' },
    { value: 'overdue', label: 'En retard' },
    { value: 'cancelled', label: 'Annulé' },
  ];

  const hasActiveFilters = search !== '' || statusFilter !== '';

  return (
    <div className="bg-gray-900/80 backdrop-blur-lg rounded-xl shadow-2xl p-4 border border-gray-700/50">
      <div className="flex flex-col md:flex-row gap-4">
        {/* Recherche */}
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiSearch className="h-5 w-5 text-gray-500" />
          </div>
          <input
            type="text"
            placeholder="Rechercher par numéro ou client..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-800/50 border border-gray-700 text-white placeholder:text-gray-500 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          />
        </div>

        {/* Filtre de statut */}
        <div className="w-full md:w-64">
          <select
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value)}
            className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          >
            {statuses.map((status) => (
              <option key={status.value} value={status.value} className="bg-gray-800">
                {status.label}
              </option>
            ))}
          </select>
        </div>

        {/* Bouton effacer les filtres */}
        {showClearButton && hasActiveFilters && (
          <Button
            type="button"
            variant="outline"
            onClick={onClearFilters}
            className="md:w-auto bg-gray-800/50 border-gray-700 text-gray-300 hover:bg-red-900/30 hover:text-red-400 hover:border-red-600"
          >
            Effacer
          </Button>
        )}
      </div>
    </div>
  );
};

export default InvoiceFilters;
