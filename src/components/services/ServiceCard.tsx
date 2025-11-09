'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FiEdit2, FiTrash2 } from 'react-icons/fi';

interface ServiceCardProps {
  service: any;
  onEdit: (service: any) => void;
  onDelete: (serviceId: string) => void;
  onSelect?: (service: any) => void;
}

export default function ServiceCard({ service, onEdit, onDelete, onSelect }: ServiceCardProps) {
  return (
    <Card className="p-6 bg-gray-900/80 backdrop-blur-lg border-gray-700/50 shadow-2xl hover:shadow-blue-500/20 transition-all hover:border-blue-500/50 rounded-xl">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-bold text-lg text-white">{service.name}</h3>
            {!service.isActive && (
              <Badge variant="secondary" className="text-xs bg-gray-800/50 text-gray-400 border border-gray-700/50">
                Inactive
              </Badge>
            )}
            {service.category && (
              <Badge variant="outline" className="text-xs border-blue-700/50 text-blue-400 bg-blue-900/30">
                {service.category}
              </Badge>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-end justify-between pt-4 border-t border-gray-700/50">
        <div className="space-y-1">
          <p className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
            {service.unitPrice.toLocaleString('fr-FR', {
              minimumFractionDigits: 2,
            })}{' '}
            €
          </p>
          <p className="text-xs text-gray-500 font-medium">TVA: {service.taxRate}%</p>
        </div>

        <div className="flex gap-2">
          {onSelect && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onSelect(service)}
              className="bg-blue-900/30 border-blue-700/50 text-blue-400 hover:bg-blue-900/50 hover:border-blue-600"
            >
              Utiliser
            </Button>
          )}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onEdit(service)}
            className="bg-gray-800/50 border-gray-700 text-gray-300 hover:bg-blue-900/30 hover:text-blue-400 hover:border-blue-600"
          >
            <FiEdit2 className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (confirm('Supprimer cette prestation ?')) {
                onDelete(service._id);
              }
            }}
            className="bg-gray-800/50 border-gray-700 text-red-400 hover:text-red-300 hover:bg-red-900/30 hover:border-red-600"
          >
            <FiTrash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
