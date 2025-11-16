'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { FiEdit2, FiFileText, FiDollarSign, FiPercent, FiFolder, FiCheckSquare, FiSave, FiLoader, FiCheckCircle } from 'react-icons/fi';
import { useZodForm, ValidatedInput } from '@/hooks/useZodForm';
import { createServiceSchema, serviceCategoryEnum } from '@/lib/validations/services';
import { z } from 'zod';

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
  onSubmit: onSubmitProp,
  initialData,
  mode = 'create',
}: ServiceFormModalProps) {
  // ========================================
  // ÉTAT AVEC HOOK DE VALIDATION
  // ========================================

  const initialFormData = {
    name: initialData?.name || '',
    description: initialData?.description || '',
    unitPrice: initialData?.unitPrice || 0,
    taxRate: initialData?.taxRate || 20,
    category: initialData?.category || '',
    isActive: initialData?.isActive ?? true,
  };

  const {
    formData,
    errors,
    touched,
    isValid,
    handleChange,
    handleBlur,
    handleSubmit,
    setFieldValue,
    reset,
  } = useZodForm(createServiceSchema, initialFormData, {
    mode: 'onChange',
    validateOnMount: false,
  });

  // ========================================
  // ÉTAT DE CHARGEMENT
  // ========================================

  const [isLoading, setIsLoading] = useState(false);

  // ========================================
  // RESET QUAND MODAL OUVRE/FERME
  // ========================================

  useEffect(() => {
    if (isOpen) {
      if (mode === 'create') {
        reset({
          name: '',
          description: '',
          unitPrice: 0,
          taxRate: 20,
          category: '',
          isActive: true,
        });
      } else if (initialData) {
        reset({
          name: initialData.name || '',
          description: initialData.description || '',
          unitPrice: initialData.unitPrice || 0,
          taxRate: initialData.taxRate || 20,
          category: initialData.category || '',
          isActive: initialData.isActive ?? true,
        });
      }
    }
  }, [isOpen, mode, initialData, reset]);

  // ========================================
  // HANDLERS
  // ========================================

  // Handler pour les nombres
  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFieldValue(name as any, parseFloat(value) || 0);
  };

  // Handler pour le checkbox
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFieldValue('isActive', e.target.checked);
  };

  // Submit avec gestion d'erreurs
  const onSubmit = handleSubmit(async (validatedData) => {
    setIsLoading(true);
    try {
      await onSubmitProp(validatedData);
      onClose();
    } catch (error) {
      console.error('Error submitting service:', error);
    } finally {
      setIsLoading(false);
    }
  });

  // ========================================
  // RENDER
  // ========================================

  if (!isOpen) return null;

  // Extraire les catégories de l'enum Zod
  const categories = serviceCategoryEnum.options;

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

        <form onSubmit={onSubmit} className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          {/* Name */}
          <ValidatedInput
            label="Nom de la prestation"
            name="name"
            value={formData.name}
            onChange={handleChange}
            onBlur={() => handleBlur('name')}
            placeholder="Ex: Développement site web"
            error={errors.name}
            touched={touched.name}
            required
          />

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium text-gray-300">
              Description (optionnelle)
            </Label>
            <textarea
              id="description"
              name="description"
              value={formData.description || ''}
              onChange={handleChange}
              onBlur={() => handleBlur('description')}
              rows={3}
              className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white resize-none placeholder:text-gray-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
              placeholder="Description détaillée de la prestation..."
            />
            {touched.description && errors.description && (
              <p className="text-sm text-red-400">{errors.description}</p>
            )}
          </div>

          {/* Unit Price and Tax Rate */}
          <div className="grid grid-cols-2 gap-4">
            <ValidatedInput
              label="Prix unitaire (€)"
              name="unitPrice"
              type="number"
              step="0.01"
              min="0"
              value={formData.unitPrice}
              onChange={handleNumberChange}
              onBlur={() => handleBlur('unitPrice')}
              error={errors.unitPrice}
              touched={touched.unitPrice}
              required
            />

            <ValidatedInput
              label="Taux de TVA (%)"
              name="taxRate"
              type="number"
              step="0.1"
              min="0"
              max="100"
              value={formData.taxRate}
              onChange={handleNumberChange}
              onBlur={() => handleBlur('taxRate')}
              error={errors.taxRate}
              touched={touched.taxRate}
              required
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category" className="flex items-center gap-2 text-sm font-semibold text-gray-300">
              <FiFolder className="w-4 h-4 text-purple-400" />
              Catégorie
            </Label>
            <select
              id="category"
              name="category"
              value={formData.category || ''}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder:text-gray-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
            >
              <option value="" className="bg-gray-800">-- Sélectionner une catégorie --</option>
              {categories.map((cat) => (
                <option key={cat} value={cat} className="bg-gray-800">
                  {cat}
                </option>
              ))}
            </select>
            {touched.category && errors.category && (
              <p className="text-sm text-red-400">{errors.category}</p>
            )}
          </div>

          {/* Active Status */}
          <div className="flex items-center space-x-3 p-4 bg-gray-800/50 rounded-lg border border-gray-700/50">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={handleCheckboxChange}
              className="w-4 h-4 text-blue-600 rounded border-gray-700 focus:ring-blue-500 bg-gray-800"
            />
            <Label htmlFor="isActive" className="flex items-center gap-2 cursor-pointer font-medium text-gray-300">
              <FiCheckSquare className="w-4 h-4 text-green-400" />
              Prestation active (visible lors de la création de factures)
            </Label>
          </div>

          {/* Footer avec indicateur de validation */}
          <div className="p-6 bg-gray-800/30 border-t border-gray-700/50 -mx-6 -mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm text-gray-400">
                {!isValid && Object.keys(errors).length > 0 && (
                  <span className="text-red-400">
                    ⚠️ {Object.keys(errors).length} erreur(s) à corriger
                  </span>
                )}
                {isValid && touched.name && (
                  <span className="text-green-400">
                    ✓ Formulaire valide
                  </span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3">
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
                disabled={!isValid || isLoading}
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
          </div>
        </form>
      </div>
    </div>
  );
}
