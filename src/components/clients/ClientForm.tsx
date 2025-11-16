'use client';

import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building2, User, Mail, Phone, MapPin, FileText, Calendar, AlertCircle, Loader2 } from "lucide-react";
import { useZodForm, ValidatedInput } from "@/hooks/useZodForm";
import { clientSchemaBase } from "@/lib/validations/clients";
import { z } from "zod";

export type ClientFormProps = {
  initialData?: any;
  onSubmit: (data: any) => Promise<void>;
  onCancel?: () => void;
  submitLabel?: string;
  cancelLabel?: string;
  isEdit?: boolean;
};

const ClientForm: React.FC<ClientFormProps> = ({
  initialData,
  onSubmit: onSubmitProp,
  onCancel,
  submitLabel = "Ajouter",
  cancelLabel = "Annuler",
  isEdit = false,
}) => {
  // ========================================
  // ÉTAT AVEC HOOK DE VALIDATION
  // ========================================

  const initialFormData = {
    type: initialData?.type || 'individual',
    name: initialData?.name || '',
    companyInfo: {
      legalName: initialData?.companyInfo?.legalName || '',
      siret: initialData?.companyInfo?.siret || '',
    },
    firstName: initialData?.firstName || '',
    lastName: initialData?.lastName || '',
    email: initialData?.email || '',
    phone: initialData?.phone || '',
    address: {
      street: initialData?.address?.street || '',
      city: initialData?.address?.city || '',
      zipCode: initialData?.address?.zipCode || '',
      country: initialData?.address?.country || '',
    },
    paymentTerms: initialData?.paymentTerms || 30,
    notes: initialData?.notes || '',
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
  } = useZodForm(clientSchemaBase, initialFormData, {
    mode: 'onChange',
    validateOnMount: false,
  });

  // ========================================
  // HANDLERS PERSONNALISÉS
  // ========================================

  const [isLoading, setIsLoading] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);

  // Handler pour les nested fields (address.street, companyInfo.legalName, etc.)
  const handleNestedChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFieldValue(parent as any, {
        ...(formData[parent as keyof typeof formData] as any),
        [child]: value,
      });
    } else if (type === 'checkbox') {
      const target = e.target as HTMLInputElement;
      setFieldValue(name as any, target.checked);
    } else {
      handleChange(e);
    }
  };

  // Submit avec gestion d'erreurs
  const onSubmit = handleSubmit(async (validatedData) => {
    setIsLoading(true);
    setSubmitError(null);

    try {
      // Générer le champ 'name' selon le type
      let dataToSubmit = { ...validatedData };

      if (validatedData.type === 'individual') {
        dataToSubmit.name = `${validatedData.firstName} ${validatedData.lastName}`;
        // Nettoyer companyInfo pour individual
        delete dataToSubmit.companyInfo;
      } else if (validatedData.type === 'business') {
        dataToSubmit.name = validatedData.companyInfo?.legalName || '';
        // Nettoyer firstName/lastName pour business
        delete dataToSubmit.firstName;
        delete dataToSubmit.lastName;
      }

      // Appeler la fonction onSubmit passée en props
      await onSubmitProp(dataToSubmit);
      
      // Réinitialiser le formulaire après succès si c'est un ajout
      if (!isEdit) {
        reset();
      }
    } catch (error: any) {
      setSubmitError(error.message || 'Une erreur est survenue');
      // Ne pas propager l'erreur pour éviter de casser le flux
      console.error('Erreur soumission:', error);
    } finally {
      setIsLoading(false);
    }
  });

  // ========================================
  // RENDER
  // ========================================

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {/* Message d'erreur de validation global */}
      {!isValid && Object.keys(errors).length > 0 && Object.keys(touched).length > 0 && (
        <div className="p-4 bg-red-900/20 border border-red-700/50 rounded-lg space-y-2">
          <div className="flex items-center gap-2 text-red-400 font-semibold">
            <AlertCircle className="w-5 h-5" />
            <span>{Object.keys(errors).length} erreur(s) de validation</span>
          </div>
          <ul className="ml-7 space-y-1 text-sm text-red-300">
            {Object.entries(errors).map(([field, error]) => {
              let errorMessage = '';
              let fieldLabel = field;

              // Gérer les erreurs nested
              if (typeof error === 'object' && error !== null) {
                const nestedErrors = Object.entries(error as Record<string, string>);
                return nestedErrors.map(([nestedField, nestedError]) => {
                  const fullPath = `${field}.${nestedField}`;
                  const label = fullPath === 'companyInfo.legalName' ? 'Raison sociale' :
                                fullPath === 'companyInfo.siret' ? 'SIRET' :
                                fullPath === 'address.street' ? 'Adresse' :
                                fullPath === 'address.city' ? 'Ville' :
                                fullPath === 'address.zipCode' ? 'Code postal' :
                                fullPath === 'address.country' ? 'Pays' :
                                nestedField;
                  return (
                    <li key={fullPath} className="flex items-start gap-2">
                      <span className="text-red-400">•</span>
                      <span><strong>{label}:</strong> {nestedError}</span>
                    </li>
                  );
                });
              } else {
                errorMessage = error as string;
                fieldLabel = field === 'firstName' ? 'Prénom' :
                             field === 'lastName' ? 'Nom de famille' :
                             field === 'email' ? 'Email' :
                             field === 'phone' ? 'Téléphone' :
                             field === 'paymentTerms' ? 'Conditions de paiement' :
                             field === 'notes' ? 'Notes' :
                             field;
              }

              if (errorMessage) {
                return (
                  <li key={field} className="flex items-start gap-2">
                    <span className="text-red-400">•</span>
                    <span><strong>{fieldLabel}:</strong> {errorMessage}</span>
                  </li>
                );
              }
              return null;
            })}
          </ul>
        </div>
      )}

      {/* Type de client */}
      <div className="space-y-2">
        <Label className="text-sm font-semibold text-gray-300 flex items-center gap-2">
          <User className="w-4 h-4" />
          Type de client
        </Label>
        <select
          className="w-full h-10 bg-gray-800/50 border border-gray-700 text-white rounded-lg px-3 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors"
          name="type"
          value={formData.type || "individual"}
          onChange={handleNestedChange}
        >
          <option value="business" className="bg-gray-800">Entreprise</option>
          <option value="individual" className="bg-gray-800">Particulier</option>
        </select>
      </div>

      {/* Section Informations personnelles */}
      <div className="bg-gray-800/50 rounded-xl p-4 space-y-4 border border-gray-700/50">
        <h3 className="font-semibold text-white flex items-center gap-2">
          <User className="w-4 h-4 text-blue-400" />
          {formData.type === 'individual' ? 'Informations personnelles' : 'Contact principal'}
        </h3>

        {formData.type === 'business' ? (
          // Pour les entreprises: Nom du contact optionnel
          <ValidatedInput
            label="Nom du contact principal (optionnel)"
            name="name"
            value={formData.name || ''}
            onChange={handleNestedChange}
            onBlur={() => handleBlur('name')}
            placeholder="Jean Dupont"
            error={errors.name}
            touched={touched.name}
          />
        ) : (
          // Pour les particuliers: Prénom + Nom requis
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ValidatedInput
              label="Prénom"
              name="firstName"
              value={formData.firstName || ''}
              onChange={handleNestedChange}
              onBlur={() => handleBlur('firstName')}
              placeholder="Jean"
              error={errors.firstName}
              touched={touched.firstName}
              required
            />
            <ValidatedInput
              label="Nom de famille"
              name="lastName"
              value={formData.lastName || ''}
              onChange={handleNestedChange}
              onBlur={() => handleBlur('lastName')}
              placeholder="Dupont"
              error={errors.lastName}
              touched={touched.lastName}
              required
            />
          </div>
        )}
      </div>

      {/* Section Contact */}
      <div className="bg-gray-800/50 rounded-xl p-4 space-y-4 border border-gray-700/50">
        <h3 className="font-semibold text-white flex items-center gap-2">
          <Mail className="w-4 h-4 text-blue-400" />
          Coordonnées de contact
        </h3>

        <ValidatedInput
          label="Email"
          name="email"
          type="email"
          value={formData.email || ''}
          onChange={handleNestedChange}
          onBlur={() => handleBlur('email')}
          placeholder="contact@exemple.com"
          error={errors.email}
          touched={touched.email}
        />

        <ValidatedInput
          label="Téléphone"
          name="phone"
          value={formData.phone || ''}
          onChange={handleNestedChange}
          onBlur={() => handleBlur('phone')}
          placeholder="+33 6 12 34 56 78"
          error={errors.phone}
          touched={touched.phone}
        />
      </div>

      {/* Section Adresse */}
      <div className="bg-gray-800/50 rounded-xl p-4 space-y-4 border border-gray-700/50">
        <h3 className="font-semibold text-white flex items-center gap-2">
          <MapPin className="w-4 h-4 text-blue-400" />
          Adresse
        </h3>

        <div className="space-y-3">
          <div className="space-y-2">
            <Input
              name="address.street"
              value={formData.address?.street || ""}
              onChange={handleNestedChange}
              placeholder="Numéro et rue"
              className="bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500"
            />
            {touched.address && errors.address && typeof errors.address === 'object' && 'street' in errors.address && (
              <p className="text-sm text-red-400">{(errors.address as any).street}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Input
                name="address.zipCode"
                value={formData.address?.zipCode || ""}
                onChange={handleNestedChange}
                placeholder="Code postal"
                className="bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500"
              />
              {touched.address && errors.address && typeof errors.address === 'object' && 'zipCode' in errors.address && (
                <p className="text-sm text-red-400">{(errors.address as any).zipCode}</p>
              )}
            </div>
            <div className="space-y-2">
              <Input
                name="address.city"
                value={formData.address?.city || ""}
                onChange={handleNestedChange}
                placeholder="Ville"
                className="bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500"
              />
              {touched.address && errors.address && typeof errors.address === 'object' && 'city' in errors.address && (
                <p className="text-sm text-red-400">{(errors.address as any).city}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Input
              name="address.country"
              value={formData.address?.country || ""}
              onChange={handleNestedChange}
              placeholder="Pays"
              className="bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500"
            />
            {touched.address && errors.address && typeof errors.address === 'object' && 'country' in errors.address && (
              <p className="text-sm text-red-400">{(errors.address as any).country}</p>
            )}
          </div>
        </div>
      </div>

      {/* Section Entreprise (conditionnelle) */}
      {formData.type === 'business' && (
        <div className="bg-gray-800/50 rounded-xl p-4 space-y-4 border border-gray-700/50">
          <h3 className="font-semibold text-white flex items-center gap-2">
            <Building2 className="w-4 h-4 text-blue-400" />
            Informations société
          </h3>

          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="companyInfo.legalName" className="text-sm font-medium text-gray-300">
                Raison sociale <span className="text-red-400">*</span>
              </Label>
              <Input
                id="companyInfo.legalName"
                name="companyInfo.legalName"
                value={formData.companyInfo?.legalName || ""}
                onChange={handleNestedChange}
                onBlur={() => handleBlur('companyInfo' as any)}
                placeholder="SARL DUPONT Consulting"
                className="bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500"
              />
              {touched.companyInfo && errors.companyInfo && typeof errors.companyInfo === 'object' && 'legalName' in errors.companyInfo && (
                <p className="text-sm text-red-400">{(errors.companyInfo as any).legalName}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="companyInfo.siret" className="text-sm font-medium text-gray-300">
                SIRET <span className="text-red-400">*</span>
              </Label>
              <Input
                id="companyInfo.siret"
                name="companyInfo.siret"
                value={formData.companyInfo?.siret || ""}
                onChange={handleNestedChange}
                onBlur={() => handleBlur('companyInfo' as any)}
                placeholder="14 chiffres"
                maxLength={14}
                className="bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500"
              />
              {touched.companyInfo && errors.companyInfo && typeof errors.companyInfo === 'object' && 'siret' in errors.companyInfo && (
                <p className="text-sm text-red-400">{(errors.companyInfo as any).siret}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Section Paramètres */}
      <div className="bg-gray-800/50 rounded-xl p-4 space-y-4 border border-gray-700/50">
        <h3 className="font-semibold text-white flex items-center gap-2">
          <Calendar className="w-4 h-4 text-blue-400" />
          Paramètres
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ValidatedInput
            label="Conditions de paiement (jours)"
            name="paymentTerms"
            type="number"
            min={0}
            value={formData.paymentTerms || 30}
            onChange={handleNestedChange}
            onBlur={() => handleBlur('paymentTerms')}
            error={errors.paymentTerms}
            touched={touched.paymentTerms}
          />

          <div className="flex items-center gap-3 p-3 bg-gray-900/50 rounded-lg border border-gray-700/50">
            <input
              type="checkbox"
              id="isActive"
              name="isActive"
              checked={formData.isActive ?? true}
              onChange={handleNestedChange}
              className="w-4 h-4 rounded border-gray-700 text-blue-600 focus:ring-blue-500 bg-gray-800"
            />
            <label htmlFor="isActive" className="text-sm font-medium text-gray-300">
              Client actif
            </label>
          </div>
        </div>

        <ValidatedInput
          label="Notes internes"
          name="notes"
          value={formData.notes || ''}
          onChange={handleNestedChange}
          onBlur={() => handleBlur('notes')}
          placeholder="Notes internes..."
          error={errors.notes}
          touched={touched.notes}
        />
      </div>

      {/* Message d'erreur global */}
      {submitError && (
        <div className="flex items-center gap-3 p-4 bg-red-900/30 rounded-lg border border-red-700/50 animate-pulse">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
          <span className="text-sm font-medium text-red-300">{submitError}</span>
        </div>
      )}

      {/* Footer avec indicateur de validation */}
      <div className="p-6 bg-gray-800/30 border-t border-gray-700/50">
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm">
            {!isValid && Object.keys(errors).length > 0 && (
              <div className="flex items-center gap-2 text-red-400 font-medium">
                <AlertCircle className="w-4 h-4" />
                <span>{Object.keys(errors).length} erreur(s) - Corrigez les champs en rouge ci-dessus</span>
              </div>
            )}
            {isValid && (touched.firstName || touched.companyInfo || touched.lastName) && (
              <span className="text-green-400 flex items-center gap-2">
                <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                Formulaire valide
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
              className="flex-1 bg-gray-800/50 border-gray-700 text-gray-300 hover:bg-gray-700/50"
            >
              {cancelLabel}
            </Button>
          )}
          <Button
            type="submit"
            disabled={!isValid || isLoading}
            className="flex-1 bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600 shadow-lg shadow-indigo-500/20"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Enregistrement...
              </>
            ) : (
              submitLabel
            )}
          </Button>
        </div>
      </div>
    </form>
  );
};

export default ClientForm;
