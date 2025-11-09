'use client';

import React, { useEffect, useState } from 'react';
import { FiZap } from 'react-icons/fi';

interface Service {
  _id: string;
  name: string;
  unitPrice: number;
  taxRate: number;
  unit?: string;
}

interface ServiceSelectorProps {
  onAddService: (service: Service) => void;
  isOpen?: boolean;
}

export default function ServiceSelector({ onAddService, isOpen = false }: ServiceSelectorProps) {
  const [services, setServices] = useState<Service[]>([]);
  const [selectedService, setSelectedService] = useState<string>('');
  const [loading, setLoading] = useState(false);

  // Fetch services when component opens
  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      fetch('/api/services?isActive=true')
        .then(res => {
          if (!res.ok) throw new Error('Erreur lors du chargement des prestations');
          return res.json();
        })
        .then(data => {
          setServices(data);
          setLoading(false);
        })
        .catch(err => {
          console.error('Error fetching services:', err);
          setLoading(false);
        });
    }
  }, [isOpen]);

  const handleAddService = () => {
    if (!selectedService) {
      console.log('Aucun service sélectionné');
      return;
    }
    
    const service = services.find(s => s._id === selectedService);
    if (!service) {
      console.log('Service non trouvé:', selectedService);
      return;
    }

    console.log('Ajout du service:', service);
    onAddService(service);
    setSelectedService('');
  };

  if (!isOpen || services.length === 0) return null;

  return (
    <div className="mb-4 p-4 bg-blue-900/30 rounded-lg border border-blue-700/50">
      <label className="flex items-center gap-2 text-sm font-semibold text-blue-300 mb-2">
        <FiZap className="w-4 h-4" />
        Ajouter une prestation enregistrée
      </label>
      <div className="flex flex-col sm:flex-row gap-2">
        <select
          value={selectedService}
          onChange={(e) => setSelectedService(e.target.value)}
          disabled={loading}
          className="flex-1 min-w-0 h-10 bg-gray-800/50 border-2 border-blue-700/50 text-white rounded-lg px-3 text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ maxWidth: '100%' }}
        >
          <option value="">
            {loading ? 'Chargement...' : '-- Sélectionner --'}
          </option>
          {services.map((service) => (
            <option key={service._id} value={service._id} className="text-xs sm:text-sm py-2 bg-gray-800">
              {service.name} - {service.unitPrice.toFixed(2)}€ ({service.taxRate}% TVA)
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={handleAddService}
          disabled={!selectedService || loading}
          className="shrink-0 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/20"
        >
          Ajouter
        </button>
      </div>
    </div>
  );
}
