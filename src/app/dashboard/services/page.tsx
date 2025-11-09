'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import ServiceList from '@/components/services/ServiceList';
import ServiceFormModal from '@/components/services/ServiceFormModal';
import { FiZap, FiSearch, FiFolder, FiPlus, FiStar } from 'react-icons/fi';
import { PageHeader } from '@/components/common/PageHeader';
import { Zap, Plus } from 'lucide-react';

export default function ServicesPage() {
  const [services, setServices] = useState<any[]>([]);
  const [filteredServices, setFilteredServices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [showActiveOnly, setShowActiveOnly] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<any>(null);

  // Fetch services
  const fetchServices = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/services');
      if (response.ok) {
        const data = await response.json();
        setServices(data);
        setFilteredServices(data);
      }
    } catch (error) {
      console.error('Error fetching services:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  // Filter services
  useEffect(() => {
    let filtered = services;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (service) =>
          service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          service.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Category filter
    if (categoryFilter) {
      filtered = filtered.filter((service) => service.category === categoryFilter);
    }

    // Active only filter
    if (showActiveOnly) {
      filtered = filtered.filter((service) => service.isActive);
    }

    setFilteredServices(filtered);
  }, [searchQuery, categoryFilter, showActiveOnly, services]);

  // Get unique categories
  const categories = Array.from(new Set(services.map((s) => s.category).filter(Boolean)));

  // Create service
  const handleCreateService = async (data: any) => {
    try {
      const response = await fetch('/api/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        await fetchServices();
        setIsModalOpen(false);
      } else {
        const error = await response.json();
        alert(error.error || 'Erreur lors de la création');
      }
    } catch (error) {
      console.error('Error creating service:', error);
      alert('Erreur lors de la création');
    }
  };

  // Update service
  const handleUpdateService = async (data: any) => {
    try {
      const response = await fetch(`/api/services/${editingService._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        await fetchServices();
        setIsModalOpen(false);
        setEditingService(null);
      } else {
        const error = await response.json();
        alert(error.error || 'Erreur lors de la modification');
      }
    } catch (error) {
      console.error('Error updating service:', error);
      alert('Erreur lors de la modification');
    }
  };

  // Delete service
  const handleDeleteService = async (serviceId: string) => {
    try {
      const response = await fetch(`/api/services/${serviceId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchServices();
      } else {
        const error = await response.json();
        alert(error.error || 'Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('Error deleting service:', error);
      alert('Erreur lors de la suppression');
    }
  };

  // Edit service
  const handleEditService = (service: any) => {
    setEditingService(service);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageHeader
        title="Prestations"
        description="Gérez vos prestations récurrentes"
        icon={Zap}
        actionLabel="Nouvelle prestation"
        actionIcon={Plus}
        onActionClick={() => setIsModalOpen(true)}
      />

      {/* Filters */}
      {services.length > 0 && (
        <div className="bg-gray-900/80 backdrop-blur-lg p-6 rounded-xl shadow-2xl border border-gray-700/50">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {/* Search */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="h-5 w-5 text-gray-400" />
              </div>
              <Input
                placeholder="Rechercher une prestation..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-10 pl-10"
              />
            </div>

            {/* Category filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="h-10 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Toutes les catégories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>

            {/* Active only */}
            <div className="flex items-center space-x-3 px-4 bg-gray-50 rounded-lg border border-gray-200">
              <input
                type="checkbox"
                id="activeOnly"
                checked={showActiveOnly}
                onChange={(e) => setShowActiveOnly(e.target.checked)}
                className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
              />
              <label htmlFor="activeOnly" className="text-sm font-medium text-gray-700 cursor-pointer select-none">
                Actives uniquement
              </label>
            </div>
          </div>

          {/* Stats */}
          <div className="flex gap-6 text-sm pt-4 border-t border-gray-200">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-gray-600">Total: <span className="font-semibold text-gray-900">{filteredServices.length}</span></span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-gray-600">Actives: <span className="font-semibold text-gray-900">{services.filter((s) => s.isActive).length}</span></span>
            </div>
          </div>
        </div>
      )}

      {/* Service List */}
      {isLoading ? (
        <div className="min-h-[400px] flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 mx-auto border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-500 animate-pulse">Chargement des prestations...</p>
          </div>
        </div>
      ) : filteredServices.length === 0 && services.length === 0 ? (
        <div className="text-center py-24">
          <div className="mb-6">
            <FiZap className="w-24 h-24 mx-auto text-indigo-700 animate-pulse" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-3">Aucune prestation</h3>
          <p className="text-white mb-8 max-w-md mx-auto">
            Créez votre première prestation pour faciliter la création de vos factures et devis
          </p>
          <button
            onClick={() => {
              setEditingService(null);
              setIsModalOpen(true);
            }}
            className="px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl font-semibold shadow-lg transition-all transform hover:scale-105 text-lg flex items-center gap-2 mx-auto"
          >
            <FiStar className="w-5 h-5" /> Créer ma première prestation
          </button>
        </div>
      ) : filteredServices.length === 0 ? (
        <div className="text-center py-16">
          <div className="mb-4">
            <FiSearch className="w-16 h-16 mx-auto text-gray-300" />
          </div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Aucune prestation trouvée</h3>
          <p className="text-gray-500 mb-6">Essayez de modifier vos filtres</p>
        </div>
      ) : (
        <ServiceList
          services={filteredServices}
          onEdit={handleEditService}
          onDelete={handleDeleteService}
        />
      )}

      {/* Modal */}
      <ServiceFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingService(null);
        }}
        onSubmit={editingService ? handleUpdateService : handleCreateService}
        initialData={editingService}
        mode={editingService ? 'edit' : 'create'}
      />
    </div>
  );
}
