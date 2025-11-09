'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FiEdit2, FiFileText, FiDollarSign, FiPercent, FiFolder, FiCheckSquare, FiSave, FiLoader, FiCheckCircle } from 'react-icons/fi';

interface ServiceFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  initialData?: any;
  mode?: 'create' | 'edit';
}

export default function ServiceFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  mode = 'create',
}: ServiceFormModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    unitPrice: 0,
    taxRate: 20,
    category: '',
    isActive: true,
  });
  const [isLoading, setIsLoading] = useState(false);

  // Mettre à jour le formulaire quand initialData change
  useEffect(() => {
    if (initialData && mode === 'edit') {
      setFormData({
        name: initialData.name || '',
        description: initialData.description || '',
        unitPrice: initialData.unitPrice || 0,
        taxRate: initialData.taxRate || 20,
        category: initialData.category || '',
        isActive: initialData.isActive ?? true,
      });
    } else if (mode === 'create') {
      // Reset pour création
      setFormData({
        name: '',
        description: '',
        unitPrice: 0,
        taxRate: 20,
        category: '',
        isActive: true,
      });
    }
  }, [initialData, mode, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error('Error submitting service:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in p-4">
      <div className="bg-gray-900/95 backdrop-blur-lg rounded-2xl shadow-2xl border border-gray-700/50 w-full max-w-2xl max-h-[90vh] overflow-hidden animate-slide-in-up">
        <div className={`${mode === 'create' ? 'bg-gradient-to-r from-indigo-500 to-purple-500' : 'bg-gradient-to-r from-purple-500 to-indigo-500'} p-6 text-white`}>
          <div className="flex items-center gap-3 mb-2">
            {mode === 'create' ? <FiFileText className="w-6 h-6" /> : <FiEdit2 className="w-6 h-6" />}
            <h2 className="text-2xl font-bold">
              {mode === 'create' ? 'Nouvelle prestation' : 'Modifier la prestation'}
            </h2>
          </div>
          <p className="text-sm opacity-90">
            {mode === 'create' ? 'Créez une prestation réutilisable pour vos factures' : 'Mettez à jour les informations de la prestation'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          {/* Name */}
          <div>
            <Label htmlFor="name" className="flex items-center gap-2 text-sm font-semibold text-gray-300 mb-2">
              <FiFileText className="w-4 h-4 text-indigo-400" />
              Nom de la prestation *
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ex: Développement site web"
              required
              className="bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500"
            />
          </div>

          {/* Unit Price and Tax Rate */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="unitPrice" className="flex items-center gap-2 text-sm font-semibold text-gray-300 mb-2">
                <FiDollarSign className="w-4 h-4 text-green-400" />
                Prix unitaire (€) *
              </Label>
              <Input
                id="unitPrice"
                type="number"
                step="0.01"
                min="0"
                value={formData.unitPrice}
                onChange={(e) =>
                  setFormData({ ...formData, unitPrice: parseFloat(e.target.value) || 0 })
                }
                required
                className="bg-gray-800/50 border-gray-700 text-white"
              />
            </div>

            <div>
              <Label htmlFor="taxRate" className="flex items-center gap-2 text-sm font-semibold text-gray-300 mb-2">
                <FiPercent className="w-4 h-4 text-blue-400" />
                Taux de TVA (%) *
              </Label>
              <Input
                id="taxRate"
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={formData.taxRate}
                onChange={(e) =>
                  setFormData({ ...formData, taxRate: parseFloat(e.target.value) || 0 })
                }
                required
                className="bg-gray-800/50 border-gray-700 text-white"
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <Label htmlFor="category" className="flex items-center gap-2 text-sm font-semibold text-gray-300 mb-2">
              <FiFolder className="w-4 h-4 text-purple-400" />
              Catégorie
            </Label>
            <Input
              id="category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              placeholder="Ex: Développement, Design, Consulting..."
              className="bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500"
            />
          </div>

          {/* Active Status */}
          <div className="flex items-center space-x-3 p-4 bg-gray-800/50 rounded-lg border border-gray-700/50">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="w-4 h-4 text-blue-600 rounded border-gray-700 focus:ring-blue-500 bg-gray-800"
            />
            <Label htmlFor="isActive" className="flex items-center gap-2 cursor-pointer font-medium text-gray-300">
              <FiCheckSquare className="w-4 h-4 text-green-400" />
              Prestation active (visible lors de la création de factures)
            </Label>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-6 border-t border-gray-700/50">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose} 
              disabled={isLoading}
              className="bg-gray-800/50 border-gray-700 text-gray-300 hover:bg-gray-700/50"
            >
              Annuler
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading}
              className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 shadow-lg shadow-indigo-500/20"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <FiLoader className="w-4 h-4 animate-spin" />
                  Enregistrement...
                </span>
              ) : mode === 'create' ? (
                <span className="flex items-center gap-2">
                  <FiCheckCircle className="w-4 h-4" />
                  Créer
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <FiSave className="w-4 h-4" />
                  Modifier
                </span>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
