'use client';

import { useState } from 'react';
import { Check, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { userProfileUpdateSchema } from '@/lib/validations';
import { z } from 'zod';

interface ProfileWizardProps {
  initialData: any;
  onSubmit: (data: any) => Promise<void>;
  onCancel?: () => void;
}

type Step = 1 | 2 | 3;

export default function ProfileWizard({
  initialData,
  onSubmit,
  onCancel,
}: ProfileWizardProps) {
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [formData, setFormData] = useState({
    // Step 1: Essentiels
    firstName: initialData?.firstName || '',
    lastName: initialData?.lastName || '',
    companyName: initialData?.companyName || '',
    legalForm: initialData?.legalForm || '',
    siret: initialData?.siret || '',
    phone: initialData?.phone || '',
    address: {
      street: initialData?.address?.street || '',
      city: initialData?.address?.city || '',
      zipCode: initialData?.address?.zipCode || initialData?.address?.postalCode || '',
      country: initialData?.address?.country || 'France',
    },
    // Step 2: Bancaire
    iban: initialData?.iban || '',
    // Step 3: Légal (optionnel)
    rcsCity: initialData?.rcsCity || '',
    capital: initialData?.capital || undefined,
    tvaNumber: initialData?.tvaNumber || '',
    insuranceCompany: initialData?.insuranceCompany || '',
    insurancePolicy: initialData?.insurancePolicy || '',
  });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const steps = [
    { number: 1, title: 'Informations essentielles', icon: '👤' },
    { number: 2, title: 'Informations bancaires', icon: '💳' },
    { number: 3, title: 'Informations légales', icon: '📋' },
  ];

  // Validation Zod en temps réel pour un champ spécifique
  const validateField = (fieldPath: string, value: any): string | null => {
    try {
      // Si le champ est vide et optionnel, pas d'erreur
      if (!value || value === '') {
        // Les champs obligatoires
        const requiredFields = ['companyName', 'legalForm', 'address.street', 'address.city', 'address.zipCode'];
        if (requiredFields.includes(fieldPath)) {
          return 'Ce champ est requis';
        }
        return null;
      }

      // Valider avec le schéma Zod partiel
      if (fieldPath === 'companyName') {
        userProfileUpdateSchema.shape.companyName.parse(value);
      } else if (fieldPath === 'legalForm') {
        userProfileUpdateSchema.shape.legalForm.parse(value);
      } else if (fieldPath === 'address.street') {
        userProfileUpdateSchema.shape.address.shape.street.parse(value);
      } else if (fieldPath === 'address.city') {
        userProfileUpdateSchema.shape.address.shape.city.parse(value);
      } else if (fieldPath === 'address.zipCode') {
        userProfileUpdateSchema.shape.address.shape.zipCode.parse(value);
      } else if (fieldPath === 'siret') {
        userProfileUpdateSchema.shape.siret?.parse(value);
      } else if (fieldPath === 'phone') {
        userProfileUpdateSchema.shape.phone?.parse(value);
      } else if (fieldPath === 'iban') {
        userProfileUpdateSchema.shape.iban?.parse(value);
      } else if (fieldPath === 'tvaNumber') {
        userProfileUpdateSchema.shape.tvaNumber?.parse(value);
      } else if (fieldPath === 'bic') {
        userProfileUpdateSchema.shape.bic?.parse(value);
      }
      
      return null;
    } catch (error) {
      if (error instanceof z.ZodError && error.issues && error.issues.length > 0) {
        return error.issues[0].message || 'Valeur invalide';
      }
      // Fallback pour les autres types d'erreurs
      return 'Format invalide';
    }
  };

  const validateStep = (step: Step): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      // Champs obligatoires de l'étape 1
      const requiredFields = {
        companyName: formData.companyName,
        legalForm: formData.legalForm,
        'address.street': formData.address.street,
        'address.city': formData.address.city,
        'address.zipCode': formData.address.zipCode,
      };

      Object.entries(requiredFields).forEach(([field, value]) => {
        const error = validateField(field, value);
        if (error) {
          newErrors[field] = error;
        }
      });

      // Validation optionnelle SIRET si rempli
      if (formData.siret) {
        const siretError = validateField('siret', formData.siret);
        if (siretError) newErrors.siret = siretError;
      }

      // Validation optionnelle téléphone si rempli
      if (formData.phone) {
        const phoneError = validateField('phone', formData.phone);
        if (phoneError) newErrors.phone = phoneError;
      }
    }

    if (step === 2) {
      // IBAN est optionnel selon le schéma, mais on le valide si rempli
      if (formData.iban) {
        const ibanError = validateField('iban', formData.iban);
        if (ibanError) {
          newErrors.iban = ibanError;
        }
      }
    }

    // Step 3 est entièrement optionnel, validation uniquement si rempli
    if (step === 3) {
      if (formData.tvaNumber) {
        const tvaError = validateField('tvaNumber', formData.tvaNumber);
        if (tvaError) newErrors.tvaNumber = tvaError;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < 3) {
        setCurrentStep((currentStep + 1) as Step);
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((currentStep - 1) as Step);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;

    setSaving(true);
    try {
      // Nettoyer les champs vides (convertir "" en undefined pour les champs optionnels)
      const cleanedData = {
        ...formData,
        siret: formData.siret || undefined,
        phone: formData.phone || undefined,
        iban: formData.iban || undefined,
        rcsCity: formData.rcsCity || undefined,
        capital: formData.capital || undefined,
        tvaNumber: formData.tvaNumber || undefined,
        insuranceCompany: formData.insuranceCompany || undefined,
        insurancePolicy: formData.insurancePolicy || undefined,
      };

      await onSubmit(cleanedData);
    } catch (error) {
      console.error('Erreur sauvegarde profil:', error);
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field: string, value: any) => {
    // Marquer le champ comme "touché"
    setTouched(prev => ({ ...prev, [field]: true }));

    // Mettre à jour la valeur
    if (field.startsWith('address.')) {
      const addressField = field.split('.')[1];
      setFormData(prev => ({
        ...prev,
        address: { ...prev.address, [addressField]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }

    // Validation en temps réel
    const error = validateField(field, value);
    if (error) {
      setErrors(prev => ({ ...prev, [field]: error }));
    } else {
      // Effacer l'erreur si la validation passe
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Progress indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center flex-1">
              {/* Step circle */}
              <div className="flex items-center">
                <div className={`
                  w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold transition-all
                  ${currentStep > step.number 
                    ? 'bg-green-500/20 text-green-400 border-2 border-green-500' 
                    : currentStep === step.number
                    ? 'bg-green-500/20 text-green-400 border-2 border-green-500 scale-110'
                    : 'bg-gray-800 text-gray-500 border-2 border-gray-700'
                  }
                `}>
                  {currentStep > step.number ? (
                    <Check className="w-6 h-6" />
                  ) : (
                    <span>{step.icon}</span>
                  )}
                </div>
                <div className="ml-3 hidden md:block">
                  <div className={`text-sm font-semibold ${
                    currentStep >= step.number ? 'text-white' : 'text-gray-500'
                  }`}>
                    Étape {step.number}
                  </div>
                  <div className="text-xs text-gray-400">{step.title}</div>
                </div>
              </div>

              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className={`flex-1 h-1 mx-4 rounded transition-all ${
                  currentStep > step.number ? 'bg-green-500' : 'bg-gray-700'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Form content */}
      <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-700 rounded-2xl p-8">
        {/* Step 1: Essentiels */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">
                Informations essentielles
              </h2>
              <p className="text-gray-400 text-sm">
                Ces informations sont nécessaires pour générer des factures conformes.
                <span className="text-red-400 ml-1">* = champ obligatoire</span>
              </p>
            </div>

            <div>
              <Label>Nom de l'entreprise <span className="text-red-400">*</span></Label>
              <Input
                value={formData.companyName}
                onChange={(e) => updateField('companyName', e.target.value)}
                onBlur={() => setTouched(prev => ({ ...prev, companyName: true }))}
                placeholder="Ma Super Entreprise SARL"
                className={errors.companyName && touched.companyName ? 'border-red-500 focus:border-red-500' : ''}
              />
              {errors.companyName && touched.companyName && (
                <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.companyName}
                </p>
              )}
            </div>

            <div>
              <Label>Forme juridique <span className="text-red-400">*</span></Label>
              <Select
                value={formData.legalForm}
                onValueChange={(value) => updateField('legalForm', value)}
              >
                <SelectTrigger className={errors.legalForm && touched.legalForm ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Sélectionner une forme juridique..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SARL">SARL</SelectItem>
                  <SelectItem value="EURL">EURL</SelectItem>
                  <SelectItem value="SASU">SASU</SelectItem>
                  <SelectItem value="Auto-entrepreneur">Auto-entrepreneur</SelectItem>
                  <SelectItem value="Profession libérale">Profession libérale</SelectItem>
                </SelectContent>
              </Select>
              {errors.legalForm && touched.legalForm && (
                <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.legalForm}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label>SIRET <span className="text-gray-400 text-xs">(optionnel)</span></Label>
                <Input
                  value={formData.siret}
                  onChange={(e) => updateField('siret', e.target.value)}
                  onBlur={() => setTouched(prev => ({ ...prev, siret: true }))}
                  placeholder="123 456 789 00010"
                  maxLength={17}
                  className={errors.siret && touched.siret ? 'border-red-500 focus:border-red-500' : ''}
                />
                {errors.siret && touched.siret && (
                  <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.siret}
                  </p>
                )}
              </div>

              <div>
                <Label>Téléphone <span className="text-gray-400 text-xs">(optionnel)</span></Label>
                <Input
                  value={formData.phone}
                  onChange={(e) => updateField('phone', e.target.value)}
                  onBlur={() => setTouched(prev => ({ ...prev, phone: true }))}
                  placeholder="+33 6 12 34 56 78"
                  className={errors.phone && touched.phone ? 'border-red-500 focus:border-red-500' : ''}
                />
                {errors.phone && touched.phone && (
                  <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.phone}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-gray-700">
              <h3 className="font-semibold text-white">Adresse de l'entreprise <span className="text-red-400">*</span></h3>
              
              <div>
                <Label>Rue <span className="text-red-400">*</span></Label>
                <Input
                  value={formData.address.street}
                  onChange={(e) => updateField('address.street', e.target.value)}
                  onBlur={() => setTouched(prev => ({ ...prev, 'address.street': true }))}
                  placeholder="12 rue de la Paix"
                  className={errors['address.street'] && touched['address.street'] ? 'border-red-500 focus:border-red-500' : ''}
                />
                {errors['address.street'] && touched['address.street'] && (
                  <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors['address.street']}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Code postal <span className="text-red-400">*</span></Label>
                  <Input
                    value={formData.address.zipCode}
                    onChange={(e) => updateField('address.zipCode', e.target.value)}
                    onBlur={() => setTouched(prev => ({ ...prev, 'address.zipCode': true }))}
                    placeholder="75001"
                    maxLength={5}
                    className={errors['address.zipCode'] && touched['address.zipCode'] ? 'border-red-500 focus:border-red-500' : ''}
                  />
                  {errors['address.zipCode'] && touched['address.zipCode'] && (
                    <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors['address.zipCode']}
                    </p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <Label>Ville <span className="text-red-400">*</span></Label>
                  <Input
                    value={formData.address.city}
                    onChange={(e) => updateField('address.city', e.target.value)}
                    onBlur={() => setTouched(prev => ({ ...prev, 'address.city': true }))}
                    placeholder="Paris"
                    className={errors['address.city'] && touched['address.city'] ? 'border-red-500 focus:border-red-500' : ''}
                  />
                  {errors['address.city'] && touched['address.city'] && (
                    <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors['address.city']}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <Label>Pays</Label>
                <Input
                  value={formData.address.country}
                  onChange={(e) => updateField('address.country', e.target.value)}
                  placeholder="France"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Bancaire */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">
                💳 Informations bancaires
              </h2>
              <p className="text-gray-400 text-sm">
                Votre IBAN sera affiché sur les factures pour faciliter les paiements.
                <span className="text-gray-400 ml-1">(optionnel mais recommandé)</span>
              </p>
            </div>

            <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
              <p className="text-gray-300 text-sm">
                <strong>💡 Format IBAN :</strong> FR76 1234 5678 9012 3456 7890 123
              </p>
            </div>

            <div>
              <Label>IBAN <span className="text-gray-400 text-xs">(optionnel)</span></Label>
              <Input
                value={formData.iban}
                onChange={(e) => updateField('iban', e.target.value.toUpperCase())}
                onBlur={() => setTouched(prev => ({ ...prev, iban: true }))}
                placeholder="FR76 1234 5678 9012 3456 7890 123"
                className={`font-mono ${errors.iban && touched.iban ? 'border-red-500 focus:border-red-500' : ''}`}
              />
              {errors.iban && touched.iban && (
                <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.iban}
                </p>
              )}
              {!errors.iban && formData.iban && formData.iban.length >= 10 && (
                <p className="text-green-400 text-xs mt-1 flex items-center gap-1">
                  <Check className="w-3 h-3" />
                  Format IBAN valide
                </p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                L'IBAN sera automatiquement formaté
              </p>
            </div>
          </div>
        )}

        {/* Step 3: Légal */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">
                📋 Informations légales
              </h2>
              <p className="text-gray-400 text-sm">
                Ces informations sont <strong className="text-gray-300">entièrement optionnelles</strong> mais recommandées pour une facturation complète.
              </p>
            </div>

            <div className="bg-blue-900/20 border border-blue-700/50 rounded-lg p-4">
              <p className="text-blue-300 text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                <strong>Info :</strong> Vous pouvez passer cette étape et compléter plus tard dans les paramètres.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label>Ville d'immatriculation RCS <span className="text-gray-400 text-xs">(optionnel)</span></Label>
                <Input
                  value={formData.rcsCity}
                  onChange={(e) => updateField('rcsCity', e.target.value)}
                  placeholder="Paris"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Ex: "Paris", "Lyon", "Marseille"
                </p>
              </div>

              <div>
                <Label>Capital social (€) <span className="text-gray-400 text-xs">(optionnel)</span></Label>
                <Input
                  type="number"
                  value={formData.capital || ''}
                  onChange={(e) => updateField('capital', e.target.value ? Number(e.target.value) : undefined)}
                  placeholder="10000"
                />
              </div>
            </div>

            <div>
              <Label>Numéro de TVA intracommunautaire <span className="text-gray-400 text-xs">(optionnel)</span></Label>
              <Input
                value={formData.tvaNumber}
                onChange={(e) => updateField('tvaNumber', e.target.value.toUpperCase())}
                onBlur={() => setTouched(prev => ({ ...prev, tvaNumber: true }))}
                placeholder="FR12345678901"
                className={`font-mono ${errors.tvaNumber && touched.tvaNumber ? 'border-red-500 focus:border-red-500' : ''}`}
              />
              {errors.tvaNumber && touched.tvaNumber && (
                <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.tvaNumber}
                </p>
              )}
              {!errors.tvaNumber && formData.tvaNumber && formData.tvaNumber.length >= 13 && (
                <p className="text-green-400 text-xs mt-1 flex items-center gap-1">
                  <Check className="w-3 h-3" />
                  Format TVA valide
                </p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Format: FR + 11 chiffres
              </p>
            </div>

            <div className="space-y-4 pt-4 border-t border-gray-700">
              <h3 className="font-semibold text-white">Assurance RC Pro <span className="text-gray-400 text-xs">(optionnel)</span></h3>
              
              <div>
                <Label>Nom de la compagnie</Label>
                <Input
                  value={formData.insuranceCompany}
                  onChange={(e) => updateField('insuranceCompany', e.target.value)}
                  placeholder="AXA, Allianz, MMA..."
                />
              </div>

              <div>
                <Label>Numéro de police</Label>
                <Input
                  value={formData.insurancePolicy}
                  onChange={(e) => updateField('insurancePolicy', e.target.value)}
                  placeholder="123456789"
                />
              </div>
            </div>
          </div>
        )}

        {/* Navigation buttons */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-700">
          <div>
            {currentStep > 1 && (
              <Button
                variant="ghost"
                onClick={handleBack}
                className="text-gray-300 hover:text-white"
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Retour
              </Button>
            )}
          </div>

          <div className="flex gap-3">
            {onCancel && (
              <Button
                variant="ghost"
                onClick={onCancel}
                disabled={saving}
                className="text-gray-400 hover:text-white"
              >
                Annuler
              </Button>
            )}

            {currentStep < 3 ? (
              <Button
                onClick={handleNext}
                className="bg-gradient-to-r from-green-600 to-green-600 hover:from-green-500 hover:to-green-500"
              >
                Continuer
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={saving}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500"
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Enregistrement...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Terminer
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
