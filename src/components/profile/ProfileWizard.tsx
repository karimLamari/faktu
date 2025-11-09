'use client';

import { useState } from 'react';
import { Check, ChevronLeft, ChevronRight } from 'lucide-react';
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
      postalCode: initialData?.address?.postalCode || '',
      country: initialData?.address?.country || 'France',
    },
    // Step 2: Bancaire
    iban: initialData?.iban || '',
    // Step 3: Légal (optionnel)
    rcsCity: initialData?.rcsCity || '',
    capital: initialData?.capital || '',
    tvaNumber: initialData?.tvaNumber || '',
    insuranceCompany: initialData?.insuranceCompany || '',
    insurancePolicy: initialData?.insurancePolicy || '',
  });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const steps = [
    { number: 1, title: 'Informations essentielles', icon: '👤' },
    { number: 2, title: 'Informations bancaires', icon: '💳' },
    { number: 3, title: 'Informations légales', icon: '📋' },
  ];

  const validateStep = (step: Step): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.firstName) newErrors.firstName = 'Prénom requis';
      if (!formData.lastName) newErrors.lastName = 'Nom requis';
      if (!formData.companyName) newErrors.companyName = 'Nom d\'entreprise requis';
      if (!formData.address.street) newErrors['address.street'] = 'Adresse requise';
      if (!formData.address.city) newErrors['address.city'] = 'Ville requise';
      if (!formData.address.postalCode) newErrors['address.postalCode'] = 'Code postal requis';
    }

    if (step === 2) {
      if (!formData.iban) newErrors.iban = 'IBAN requis';
      else if (!/^[A-Z]{2}[0-9]{2}[A-Z0-9]+$/.test(formData.iban.replace(/\s/g, ''))) {
        newErrors.iban = 'Format IBAN invalide';
      }
    }

    // Step 3 est optionnel, pas de validation requise

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
      await onSubmit(formData);
    } catch (error) {
      console.error('Erreur sauvegarde profil:', error);
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field: string, value: any) => {
    if (field.startsWith('address.')) {
      const addressField = field.split('.')[1];
      setFormData(prev => ({
        ...prev,
        address: { ...prev.address, [addressField]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
    // Clear error when user types
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
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
                    ? 'bg-blue-500/20 text-blue-400 border-2 border-blue-500 scale-110'
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
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label>Prénom *</Label>
                <Input
                  value={formData.firstName}
                  onChange={(e) => updateField('firstName', e.target.value)}
                  placeholder="Jean"
                />
                {errors.firstName && (
                  <p className="text-red-400 text-xs mt-1">{errors.firstName}</p>
                )}
              </div>

              <div>
                <Label>Nom *</Label>
                <Input
                  value={formData.lastName}
                  onChange={(e) => updateField('lastName', e.target.value)}
                  placeholder="Dupont"
                />
                {errors.lastName && (
                  <p className="text-red-400 text-xs mt-1">{errors.lastName}</p>
                )}
              </div>
            </div>

            <div>
              <Label>Nom de l'entreprise *</Label>
              <Input
                value={formData.companyName}
                onChange={(e) => updateField('companyName', e.target.value)}
                placeholder="Ma Super Entreprise SARL"
              />
              {errors.companyName && (
                <p className="text-red-400 text-xs mt-1">{errors.companyName}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label>Forme juridique</Label>
                <Select
                  value={formData.legalForm}
                  onValueChange={(value) => updateField('legalForm', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SARL">SARL</SelectItem>
                    <SelectItem value="EURL">EURL</SelectItem>
                    <SelectItem value="SASU">SASU</SelectItem>
                    <SelectItem value="Auto-entrepreneur">Auto-entrepreneur</SelectItem>
                    <SelectItem value="Profession libérale">Profession libérale</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>SIRET</Label>
                <Input
                  value={formData.siret}
                  onChange={(e) => updateField('siret', e.target.value)}
                  placeholder="123 456 789 00010"
                  maxLength={17}
                />
              </div>
            </div>

            <div>
              <Label>Téléphone</Label>
              <Input
                value={formData.phone}
                onChange={(e) => updateField('phone', e.target.value)}
                placeholder="+33 6 12 34 56 78"
              />
            </div>

            <div className="space-y-4 pt-4 border-t border-gray-700">
              <h3 className="font-semibold text-white">Adresse de l'entreprise</h3>
              
              <div>
                <Label>Rue *</Label>
                <Input
                  value={formData.address.street}
                  onChange={(e) => updateField('address.street', e.target.value)}
                  placeholder="12 rue de la Paix"
                />
                {errors['address.street'] && (
                  <p className="text-red-400 text-xs mt-1">{errors['address.street']}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Code postal *</Label>
                  <Input
                    value={formData.address.postalCode}
                    onChange={(e) => updateField('address.postalCode', e.target.value)}
                    placeholder="75001"
                    maxLength={5}
                  />
                  {errors['address.postalCode'] && (
                    <p className="text-red-400 text-xs mt-1">{errors['address.postalCode']}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <Label>Ville *</Label>
                  <Input
                    value={formData.address.city}
                    onChange={(e) => updateField('address.city', e.target.value)}
                    placeholder="Paris"
                  />
                  {errors['address.city'] && (
                    <p className="text-red-400 text-xs mt-1">{errors['address.city']}</p>
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
              </p>
            </div>

            <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
              <p className="text-blue-300 text-sm">
                <strong>💡 Format IBAN :</strong> FR76 1234 5678 9012 3456 7890 123
              </p>
            </div>

            <div>
              <Label>IBAN *</Label>
              <Input
                value={formData.iban}
                onChange={(e) => updateField('iban', e.target.value.toUpperCase())}
                placeholder="FR76 1234 5678 9012 3456 7890 123"
                className="font-mono"
              />
              {errors.iban && (
                <p className="text-red-400 text-xs mt-1">{errors.iban}</p>
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
                Ces informations sont optionnelles mais recommandées pour une facturation complète.
              </p>
            </div>

            <div className="bg-orange-900/20 border border-orange-500/30 rounded-lg p-4">
              <p className="text-orange-300 text-sm">
                <strong>ℹ️ Optionnel :</strong> Vous pouvez passer cette étape et compléter plus tard.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label>Ville d'immatriculation RCS</Label>
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
                <Label>Capital social (€)</Label>
                <Input
                  type="number"
                  value={formData.capital}
                  onChange={(e) => updateField('capital', e.target.value)}
                  placeholder="10000"
                />
              </div>
            </div>

            <div>
              <Label>Numéro de TVA intracommunautaire</Label>
              <Input
                value={formData.tvaNumber}
                onChange={(e) => updateField('tvaNumber', e.target.value.toUpperCase())}
                placeholder="FR12345678901"
                className="font-mono"
              />
              <p className="text-xs text-gray-500 mt-1">
                Format: FR + 11 chiffres
              </p>
            </div>

            <div className="space-y-4 pt-4 border-t border-gray-700">
              <h3 className="font-semibold text-white">Assurance RC Pro</h3>
              
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
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500"
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
