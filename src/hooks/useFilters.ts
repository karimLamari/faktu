import { useState, useMemo, useCallback } from 'react';

export interface UseFiltersOptions<T> {
  data: T[];
  filterFunctions: {
    [key: string]: (item: T, value: any) => boolean;
  };
  initialFilters?: { [key: string]: any };
}

export interface UseFiltersResult<T> {
  filters: { [key: string]: any };
  setFilter: (key: string, value: any) => void;
  resetFilters: () => void;
  filteredData: T[];
}

/**
 * Hook générique pour gérer les filtres de liste
 * Élimine la duplication de logique de filtrage entre quotes, invoices, clients
 * 
 * @example
 * const { filters, setFilter, filteredData } = useFilters({
 *   data: quotes,
 *   filterFunctions: {
 *     status: (quote, value) => !value || quote.status === value,
 *     search: (quote, value) => {
 *       if (!value) return true;
 *       return quote.quoteNumber.toLowerCase().includes(value.toLowerCase());
 *     },
 *   },
 *   initialFilters: { status: '', search: '' }
 * });
 * 
 * // Usage: setFilter('status', 'sent')
 */
export function useFilters<T>({
  data,
  filterFunctions,
  initialFilters = {},
}: UseFiltersOptions<T>): UseFiltersResult<T> {
  const [filters, setFilters] = useState<{ [key: string]: any }>(initialFilters);

  const setFilter = useCallback((key: string, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(initialFilters);
  }, [initialFilters]);

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      // Appliquer tous les filtres actifs
      return Object.entries(filters).every(([key, value]) => {
        const filterFn = filterFunctions[key];
        if (!filterFn) return true;
        return filterFn(item, value);
      });
    });
  }, [data, filters, filterFunctions]);

  return {
    filters,
    setFilter,
    resetFilters,
    filteredData,
  };
}
