/**
 * 📝 EXEMPLE DE REFACTORING : ExpenseFormModal avec validation temps réel
 * 
 * Ce fichier montre comment refactorer ExpenseFormModal.tsx pour utiliser
 * le hook useZodForm et afficher les erreurs en temps réel.
 * 
 * AVANT : 574 lignes, pas de validation côté client
 * APRÈS : ~400 lignes, validation temps réel, meilleure UX
 */

'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { parseExpenseData } from '@/lib/services/ocr';
import { createExpenseSchema, expenseCategoryEnum, paymentMethodEnum } from '@/lib/validations';
import { useZodForm, ValidatedInput } from '@/hooks/useZodForm';
import Image from 'next/image';

interface ExpenseFormModalRefactoredProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any, image: File) => Promise<void>;
  initialData?: any;
  mode?: 'create' | 'edit';
}

export default function ExpenseFormModalRefactored({
  isOpen,
  onClose,
  onSubmit: onSubmitProp,
  initialData,
  mode = 'create',
}: ExpenseFormModalRefactoredProps) {

  // ========================================
  // ÉTAT AVEC HOOK DE VALIDATION
  // ========================================
  
  const initialFormData = {
    vendor: initialData?.vendor || '',
    amount: initialData?.amount || 0,
    taxAmount: initialData?.taxAmount || 0,
    date: initialData?.date 
      ? new Date(initialData.date).toISOString().split('T')[0] 
      : new Date().toISOString().split('T')[0],
    category: initialData?.category || 'Autre',
    description: initialData?.description || '',
    invoiceNumber: initialData?.invoiceNumber || '',
    paymentMethod: initialData?.paymentMethod || 'Carte bancaire',
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
  } = useZodForm(createExpenseSchema, initialFormData, {
    mode: 'onChange', // Validation en temps réel
    validateOnMount: false,
  });

  // ========================================
  // ÉTAT IMAGE
  // ========================================
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>(initialData?.receiptImage || '');
  const [imageError, setImageError] = useState<string>('');
  
  // ========================================
  // ÉTAT OCR
  // ========================================
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [ocrProgress, setOcrProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  
  // ========================================
  // REFS
  // ========================================
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ========================================
  // RESET QUAND MODAL OUVRE/FERME
  // ========================================
  
  useEffect(() => {
    if (isOpen) {
      if (mode === 'create') {
        reset({
          vendor: '',
          amount: 0,
          taxAmount: 0,
          date: new Date().toISOString().split('T')[0],
          category: 'Autre',
          description: '',
          invoiceNumber: '',
          paymentMethod: 'Carte bancaire',
        });
        setImageFile(null);
        setImagePreview('');
        setImageError('');
        setIsProcessing(false);
        setOcrProgress(0);
      }
    }
  }, [isOpen, mode, reset]);

  // ========================================
  // GESTION IMAGE
  // ========================================
  
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // VALIDATION CÔTÉ CLIENT
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

    if (!allowedTypes.includes(file.type)) {
      setImageError('Format non supporté. Utilisez JPG, PNG ou WebP.');
      return;
    }

    if (file.size > maxSize) {
      setImageError('L\'image est trop volumineuse (max 10MB).');
      return;
    }

    setImageError('');
    setImageFile(file);

    // Créer preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Lancer OCR si mode création
    if (mode === 'create') {
      processOCR(file);
    }
  };

  // ========================================
  // OCR PROCESSING
  // ========================================
  
  const processOCR = async (file: File) => {
    setIsProcessing(true);
    setOcrProgress(0);

    try {
      // Simuler progression
      const progressInterval = setInterval(() => {
        setOcrProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('/api/expenses/ocr', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setOcrProgress(100);

      if (!response.ok) {
        throw new Error('OCR failed');
      }

      const result = await response.json();

      // Pré-remplir le formulaire AVEC VALIDATION
      if (result.text) {
        const parsedData = parseExpenseData(result.text, 'tesseract');
        
        if (parsedData.vendor) setFieldValue('vendor', parsedData.vendor);
        if (parsedData.amount) setFieldValue('amount', parsedData.amount);
        if (parsedData.taxAmount) setFieldValue('taxAmount', parsedData.taxAmount);
        if (parsedData.date) setFieldValue('date', parsedData.date);
        if (parsedData.invoiceNumber) setFieldValue('invoiceNumber', parsedData.invoiceNumber);
      }

    } catch (error) {
      console.error('OCR error:', error);
    } finally {
      setIsProcessing(false);
      setTimeout(() => setOcrProgress(0), 1000);
    }
  };

  // ========================================
  // SUBMIT
  // ========================================
  
  const onSubmit = handleSubmit(async (data) => {
    // Vérifier que l'image est présente
    if (mode === 'create' && !imageFile) {
      setImageError('Une image du reçu est requise');
      return;
    }

    setIsLoading(true);
    try {
      await onSubmitProp(data, imageFile!);
      onClose();
    } catch (error) {
      console.error('Submit error:', error);
    } finally {
      setIsLoading(false);
    }
  });

  // ========================================
  // RENDER
  // ========================================
  
  if (!isOpen) return null;

  const categories = expenseCategoryEnum.options;
  const paymentMethods = paymentMethodEnum.options;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-gray-900/95 rounded-2xl shadow-2xl border border-gray-700/50 w-full max-w-4xl max-h-[90vh] overflow-hidden">
        
        {/* HEADER */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-6 text-white">
          <h2 className="text-2xl font-bold">
            {mode === 'create' ? 'Nouvelle dépense' : 'Modifier la dépense'}
          </h2>
          <p className="text-purple-100 text-sm mt-1">
            {mode === 'create' && 'Scannez ou uploadez un reçu pour pré-remplir automatiquement'}
          </p>
        </div>

        {/* FORM */}
        <form onSubmit={onSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          
          {/* UPLOAD IMAGE */}
          <div className="mb-6 p-4 bg-gray-800/50 rounded-xl border border-gray-700/50">
            <Label className="text-lg font-semibold text-white mb-3 block">
              Reçu / Facture {mode === 'create' && <span className="text-red-400">*</span>}
            </Label>
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />

            <div className="flex gap-3">
              <Button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
                disabled={isProcessing}
              >
                📷 Choisir une image
              </Button>
            </div>

            {imageError && (
              <p className="text-red-400 text-sm mt-2 flex items-center gap-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {imageError}
              </p>
            )}

            {imagePreview && (
              <div className="mt-4 relative w-full h-64">
                <Image
                  src={imagePreview}
                  alt="Preview"
                  fill
                  className="object-contain rounded-lg"
                />
              </div>
            )}

            {isProcessing && (
              <div className="mt-4">
                <div className="flex items-center justify-between text-sm text-gray-300 mb-2">
                  <span>🔍 Analyse en cours...</span>
                  <span>{ocrProgress}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${ocrProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* FORM FIELDS AVEC VALIDATION */}
          <div className="space-y-4">
            
            {/* VENDOR */}
            <ValidatedInput
              label="Fournisseur"
              name="vendor"
              value={formData.vendor}
              onChange={handleChange}
              onBlur={() => handleBlur('vendor')}
              error={errors.vendor}
              touched={touched.vendor}
              placeholder="Nom du fournisseur"
              required
            />

            {/* AMOUNTS */}
            <div className="grid grid-cols-2 gap-4">
              <ValidatedInput
                label="Montant HT"
                name="amount"
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={handleChange}
                onBlur={() => handleBlur('amount')}
                error={errors.amount}
                touched={touched.amount}
                placeholder="0.00"
                required
              />

              <ValidatedInput
                label="TVA"
                name="taxAmount"
                type="number"
                step="0.01"
                value={formData.taxAmount}
                onChange={handleChange}
                onBlur={() => handleBlur('taxAmount')}
                error={errors.taxAmount}
                touched={touched.taxAmount}
                placeholder="0.00"
                helperText="TVA calculée automatiquement par OCR"
              />
            </div>

            {/* DATE */}
            <ValidatedInput
              label="Date"
              name="date"
              type="date"
              value={formData.date}
              onChange={handleChange}
              onBlur={() => handleBlur('date')}
              error={errors.date}
              touched={touched.date}
              required
            />

            {/* CATEGORY */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-300 flex items-center gap-1">
                Catégorie <span className="text-red-400">*</span>
              </Label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                onBlur={() => handleBlur('category')}
                className={`
                  w-full px-3 py-2 bg-gray-800/50 border rounded-lg text-white
                  transition-colors focus:outline-none focus:ring-2
                  ${touched.category && errors.category
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                    : 'border-gray-700 focus:border-blue-500 focus:ring-blue-500/20'
                  }
                `}
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              {touched.category && errors.category && (
                <p className="text-sm text-red-400">{errors.category}</p>
              )}
            </div>

            {/* PAYMENT METHOD */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-300">
                Moyen de paiement
              </Label>
              <select
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white"
              >
                {paymentMethods.map(method => (
                  <option key={method} value={method}>{method}</option>
                ))}
              </select>
            </div>

            {/* INVOICE NUMBER */}
            <ValidatedInput
              label="Numéro de facture"
              name="invoiceNumber"
              value={formData.invoiceNumber || ''}
              onChange={handleChange}
              placeholder="Optionnel"
            />

            {/* DESCRIPTION */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-300">
                Description
              </Label>
              <textarea
                name="description"
                value={formData.description || ''}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white resize-none"
                placeholder="Notes complémentaires..."
              />
            </div>

          </div>

        </form>

        {/* FOOTER */}
        <div className="p-6 bg-gray-800/30 border-t border-gray-700/50 flex items-center justify-between">
          <div className="text-sm text-gray-400">
            {!isValid && Object.keys(errors).length > 0 && (
              <span className="text-red-400">
                ⚠️ {Object.keys(errors).length} erreur(s) à corriger
              </span>
            )}
            {isValid && touched.vendor && (
              <span className="text-green-400">
                ✓ Formulaire valide
              </span>
            )}
          </div>
          
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Annuler
            </Button>
            <Button
              onClick={onSubmit}
              disabled={!isValid || isLoading || (mode === 'create' && !imageFile)}
              className="bg-gradient-to-r from-purple-500 to-pink-500"
            >
              {isLoading ? 'Enregistrement...' : mode === 'create' ? 'Créer' : 'Mettre à jour'}
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
}
