import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

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
    <div className="bg-white p-4 rounded-lg shadow border mb-4">
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Recherche */}
        <div className="flex-1">
          <Input
            type="text"
            placeholder="Rechercher par numéro ou client..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full"
          />
        </div>

        {/* Filtre de statut */}
        <div className="sm:w-48">
          <select
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value)}
            className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {statuses.map((status) => (
              <option key={status.value} value={status.value}>
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
            className="sm:w-auto"
          >
            Effacer
          </Button>
        )}
      </div>
    </div>
  );
};

export default InvoiceFilters;
