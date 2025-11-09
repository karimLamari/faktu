'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createWorker } from 'tesseract.js';
import { parseExpenseFromOCR } from '@/lib/services/expense-parser';
import Image from 'next/image';

interface ExpenseFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any, image: File) => Promise<void>;
  initialData?: any;
  mode?: 'create' | 'edit';
}

const categories = [
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

const paymentMethods = [
  'Carte bancaire',
  'Espèces',
  'Virement',
  'Chèque',
  'Autre',
];

export default function ExpenseFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  mode = 'create',
}: ExpenseFormModalProps) {
  const [formData, setFormData] = useState({
    vendor: initialData?.vendor || '',
    amount: initialData?.amount || 0,
    taxAmount: initialData?.taxAmount || 0,
    date: initialData?.date ? new Date(initialData.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    category: initialData?.category || 'Autre',
    description: initialData?.description || '',
    invoiceNumber: initialData?.invoiceNumber || '',
    paymentMethod: initialData?.paymentMethod || 'Carte bancaire',
  });
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>(initialData?.receiptImage || '');
  const [isProcessing, setIsProcessing] = useState(false);
  const [ocrProgress, setOcrProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [showCaptureMenu, setShowCaptureMenu] = useState(false); // Nouveau state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null); // Nouveau ref pour la caméra

  // Réinitialiser le formulaire quand le modal s'ouvre/ferme
  useEffect(() => {
    if (isOpen) {
      if (mode === 'create') {
        // Mode création : tout réinitialiser
        setFormData({
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
        setIsProcessing(false);
        setOcrProgress(0);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else if (mode === 'edit' && initialData) {
        // Mode édition : charger les données
        setFormData({
          vendor: initialData.vendor || '',
          amount: initialData.amount || 0,
          taxAmount: initialData.taxAmount || 0,
          date: initialData.date ? new Date(initialData.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          category: initialData.category || 'Autre',
          description: initialData.description || '',
          invoiceNumber: initialData.invoiceNumber || '',
          paymentMethod: initialData.paymentMethod || 'Carte bancaire',
        });
        setImagePreview(initialData.receiptImage || '');
      }
    }
  }, [isOpen, mode, initialData]);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Accepter images et PDF
    if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
      alert('❌ Veuillez sélectionner une image (JPG, PNG, etc.) ou un PDF');
      e.target.value = ''; // Reset input
      return;
    }

    setImageFile(file);
    const preview = URL.createObjectURL(file);
    setImagePreview(preview);
    setShowCaptureMenu(false); // Fermer le menu après sélection

    // Lancer l'analyse automatiquement
    if (file.type === 'application/pdf') {
      await processPdfText(file);
    } else {
      await processImageWithOCR(file);
    }
  };

  const processPdfText = async (file: File) => {
    setIsProcessing(true);
    setOcrProgress(0);

    try {
      // Charger PDF.js depuis le CDN
      if (!(window as any).pdfjsLib) {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
        document.head.appendChild(script);
        
        await new Promise((resolve, reject) => {
          script.onload = resolve;
          script.onerror = reject;
        });
      }

      const pdfjsLib = (window as any).pdfjsLib;
      
      // Configurer le worker PDF.js
      pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      
      let fullText = '';
      const totalPages = pdf.numPages;

      console.log('📄 PDF détecté - Nombre de pages:', totalPages);

      // Extraire le texte de chaque page
      for (let i = 1; i <= totalPages; i++) {
        setOcrProgress(Math.round((i / totalPages) * 100));
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item: any) => item.str).join(' ');
        fullText += pageText + '\n';
        console.log(`📃 Page ${i}/${totalPages} - Texte extrait:`, pageText.substring(0, 200) + '...');
      }

      console.log('📝 Texte complet extrait du PDF:', fullText);

      // Parser le texte extrait
      const parsed = parseExpenseFromOCR(fullText);
      
      console.log('🔍 Données parsées:', parsed);
      
      // Mettre à jour le formulaire avec les données extraites
      setFormData(prev => ({
        ...prev,
        vendor: parsed.vendor || prev.vendor,
        amount: parsed.amount || prev.amount,
        taxAmount: parsed.taxAmount || prev.taxAmount,
        date: parsed.date ? new Date(parsed.date).toISOString().split('T')[0] : prev.date,
        invoiceNumber: parsed.invoiceNumber || prev.invoiceNumber,
      }));

      setOcrProgress(100);
    } catch (error) {
      console.error('PDF parsing error:', error);
      alert('Erreur lors de l\'analyse du PDF. Vous pouvez saisir les informations manuellement.');
    } finally {
      setIsProcessing(false);
    }
  };

  const processImageWithOCR = async (file: File) => {
    setIsProcessing(true);
    setOcrProgress(0);

    try {
      console.log('📸 Image détectée - Lancement de Tesseract.js');
      
      // Créer une URL blob pour l'image
      const imageUrl = URL.createObjectURL(file);

      const worker = await createWorker('fra', 1, {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            setOcrProgress(Math.round(m.progress * 100));
            console.log(`🔄 OCR en cours: ${Math.round(m.progress * 100)}%`);
          }
        },
      });

      const { data: { text } } = await worker.recognize(imageUrl);
      await worker.terminate();
      
      // Libérer l'URL blob
      URL.revokeObjectURL(imageUrl);

      console.log('📝 Texte OCR extrait:', text);

      // Parser le texte OCR
      const parsed = parseExpenseFromOCR(text);
      
      console.log('🔍 Données parsées:', parsed);
      
      // Mettre à jour le formulaire avec les données extraites
      setFormData(prev => ({
        ...prev,
        vendor: parsed.vendor || prev.vendor,
        amount: parsed.amount || prev.amount,
        taxAmount: parsed.taxAmount || prev.taxAmount,
        date: parsed.date ? new Date(parsed.date).toISOString().split('T')[0] : prev.date,
        invoiceNumber: parsed.invoiceNumber || prev.invoiceNumber,
      }));

      setOcrProgress(100);
    } catch (error) {
      console.error('OCR Error:', error);
      alert('Erreur lors de l\'analyse de l\'image. Vous pouvez saisir les informations manuellement.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (mode === 'create' && !imageFile) {
      alert('Veuillez sélectionner une image de la facture');
      return;
    }

    setIsLoading(true);
    try {
      await onSubmit(formData, imageFile!);
      onClose();
    } catch (error) {
      console.error('Error submitting expense:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in p-4">
      <div className="bg-gray-900/95 backdrop-blur-lg rounded-2xl shadow-2xl border border-gray-700/50 w-full max-w-4xl max-h-[90vh] overflow-hidden animate-slide-in-up">
        <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-6 text-white">
          <h2 className="text-2xl font-bold mb-1">
            {mode === 'create' ? '📸 Nouvelle dépense' : '✏️ Modifier la dépense'}
          </h2>
          <p className="text-sm opacity-90">
            {mode === 'create' ? 'Prenez une photo de votre facture, on s\'occupe du reste !' : 'Modifiez les informations de la dépense'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Image Upload */}
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-semibold text-gray-700 mb-2">
                  📸 Photo ou PDF de la facture *
                </Label>
                <div 
                  className="relative border-2 border-dashed border-gray-300 rounded-xl p-4 hover:border-blue-400 transition-colors cursor-pointer"
                  onClick={() => setShowCaptureMenu(true)}
                >
                  {imagePreview ? (
                    <div className="relative w-full h-64">
                      {imageFile?.type === 'application/pdf' ? (
                        <div className="flex flex-col items-center justify-center h-full">
                          <div className="text-6xl mb-4">📄</div>
                          <p className="font-semibold text-gray-700">{imageFile.name}</p>
                          <p className="text-sm text-gray-500 mt-2">PDF sélectionné</p>
                        </div>
                      ) : (
                        <Image
                          src={imagePreview}
                          alt="Preview"
                          fill
                          className="object-contain rounded-lg"
                        />
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                      <svg className="w-16 h-16 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <p className="text-sm">Cliquez pour ajouter une photo ou un PDF</p>
                    </div>
                  )}
                  
                  {/* Inputs cachés */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  <input
                    ref={cameraInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </div>

                {/* Menu de choix caméra/galerie */}
                {showCaptureMenu && (
                  <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/50 animate-fade-in" onClick={() => setShowCaptureMenu(false)}>
                    <div className="bg-gray-900/95 backdrop-blur-lg rounded-t-3xl border border-gray-700/50 w-full max-w-md p-6 space-y-3 animate-slide-in-up" onClick={(e) => e.stopPropagation()}>
                      <h3 className="text-lg font-bold text-white text-center mb-4">Choisir une source</h3>
                      
                      <button
                        type="button"
                        onClick={() => {
                          cameraInputRef.current?.click();
                          setShowCaptureMenu(false);
                        }}
                        className="w-full flex items-center gap-4 p-4 bg-blue-900/30 hover:bg-blue-900/50 border border-blue-700/50 rounded-xl transition-colors"
                      >
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-2xl shadow-lg shadow-blue-500/20">
                          📷
                        </div>
                        <div className="text-left">
                          <p className="font-semibold text-white">Prendre une photo</p>
                          <p className="text-sm text-gray-400">Utiliser l'appareil photo</p>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          fileInputRef.current?.click();
                          setShowCaptureMenu(false);
                        }}
                        className="w-full flex items-center gap-4 p-4 bg-purple-900/30 hover:bg-purple-900/50 border border-purple-700/50 rounded-xl transition-colors"
                      >
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center text-2xl shadow-lg shadow-purple-500/20">
                          🖼️
                        </div>
                        <div className="text-left">
                          <p className="font-semibold text-white">Choisir dans la galerie</p>
                          <p className="text-sm text-gray-400">Sélectionner une image ou PDF</p>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setShowCaptureMenu(false)}
                        className="w-full p-4 text-gray-400 hover:text-white font-semibold"
                      >
                        Annuler
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {isProcessing && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-sm font-medium text-blue-900">Analyse en cours...</span>
                  </div>
                  <div className="w-full bg-blue-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${ocrProgress}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-blue-700 mt-2">{ocrProgress}%</p>
                </div>
              )}

              {/* Warning Message */}
              <div className="bg-yellow-50 border-2 border-yellow-300 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">⚠️</span>
                  <div>
                    <p className="text-sm font-semibold text-yellow-900 mb-1">
                      Analyse automatique en version bêta
                    </p>
                    <p className="text-xs text-yellow-800">
                      L'analyse fonctionne mieux avec les PDF qu'avec les photos. 
                      Pensez à bien vérifier les données saisies avant d'enregistrer !
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Form Fields */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="vendor" className="text-sm font-semibold text-gray-300 mb-2">
                  🏪 Fournisseur *
                </Label>
                <Input
                  id="vendor"
                  value={formData.vendor}
                  onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
                  placeholder="Ex: Restaurant Le Gourmet"
                  required
                  className="h-11 bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="amount" className="text-sm font-semibold text-gray-300 mb-2">
                    💰 Montant TTC (€) *
                  </Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                    required
                    className="h-11 bg-gray-800/50 border-gray-700 text-white"
                  />
                </div>

                <div>
                  <Label htmlFor="taxAmount" className="text-sm font-semibold text-gray-300 mb-2">
                    📊 TVA (€)
                  </Label>
                  <Input
                    id="taxAmount"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.taxAmount}
                    onChange={(e) => setFormData({ ...formData, taxAmount: parseFloat(e.target.value) || 0 })}
                    className="h-11 bg-gray-800/50 border-gray-700 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="date" className="text-sm font-semibold text-gray-300 mb-2">
                    📅 Date *
                  </Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                    className="h-11 bg-gray-800/50 border-gray-700 text-white"
                  />
                </div>

                <div>
                  <Label htmlFor="category" className="text-sm font-semibold text-gray-300 mb-2">
                    📁 Catégorie *
                  </Label>
                  <select
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full h-11 px-3 bg-gray-800/50 border border-gray-700 text-white rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat} className="bg-gray-800">{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <Label htmlFor="invoiceNumber" className="text-sm font-semibold text-gray-300 mb-2">
                  🔢 N° de facture
                </Label>
                <Input
                  id="invoiceNumber"
                  value={formData.invoiceNumber}
                  onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
                  placeholder="Ex: F-2025-001"
                  className="h-11 bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500"
                />
              </div>

              <div>
                <Label htmlFor="paymentMethod" className="text-sm font-semibold text-gray-300 mb-2">
                  💳 Mode de paiement
                </Label>
                <select
                  id="paymentMethod"
                  value={formData.paymentMethod}
                  onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                  className="w-full h-11 px-3 bg-gray-800/50 border border-gray-700 text-white rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {paymentMethods.map((method) => (
                    <option key={method} value={method} className="bg-gray-800">{method}</option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="description" className="text-sm font-semibold text-gray-300 mb-2">
                  📝 Description
                </Label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Notes additionnelles..."
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 text-white placeholder:text-gray-500 rounded-xl min-h-[80px] focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-6 mt-6 border-t-2 border-gray-700/50">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose} 
              disabled={isLoading || isProcessing}
              className="px-6 py-2.5 rounded-xl font-semibold bg-gray-800/50 border-gray-700 text-gray-300 hover:bg-gray-700/50"
            >
              Annuler
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading || isProcessing}
              className="px-6 py-2.5 rounded-xl font-semibold shadow-lg bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 shadow-blue-500/20"
            >
              {isLoading ? 'Enregistrement...' : mode === 'create' ? '✨ Enregistrer' : '💾 Modifier'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
