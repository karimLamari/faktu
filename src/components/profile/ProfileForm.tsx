import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ProfileData } from './ProfileCard';
import { User, Building2, MapPin, Phone, Mail, CreditCard, FileText, Shield, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

interface ProfileFormProps {
  profile: ProfileData;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onLogoChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  isLoading?: boolean;
  error?: string;
  success?: boolean;
  fieldErrors?: Record<string, string>;
}

const ProfileForm: React.FC<ProfileFormProps> = ({
  profile,
  onChange,
  onLogoChange,
  onSubmit,
  onCancel,
  isLoading = false,
  error = '',
  success = false,
  fieldErrors = {},
}) => {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {/* Section Informations personnelles */}
      <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50 space-y-4">
        <h3 className="font-semibold text-white flex items-center gap-2 text-lg mb-4">
          <User className="w-5 h-5 text-green-400" />
          Informations personnelles
        </h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">Prénom</Label>
            <Input 
              id="firstName" 
              name="firstName" 
              value={profile.firstName || ''} 
              onChange={onChange} 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Nom</Label>
            <Input 
              id="lastName" 
              name="lastName" 
              value={profile.lastName || ''} 
              onChange={onChange} 
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Téléphone</Label>
          <Input 
            id="phone" 
            name="phone" 
            value={profile.phone || ''} 
            onChange={onChange}
            placeholder="+33 6 12 34 56 78"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input 
            id="email" 
            name="email" 
            value={profile.email || ''} 
            onChange={onChange} 
            disabled 
          />
          <p className="text-xs text-gray-400">L'email ne peut pas être modifié</p>
        </div>
      </div>

      {/* Section Entreprise */}
      <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50 space-y-4">
        <h3 className="font-semibold text-white flex items-center gap-2 text-lg mb-4">
          <Building2 className="w-5 h-5 text-green-400" />
          Informations entreprise
        </h3>

        <div className="space-y-2">
          <Label htmlFor="companyName" className="flex items-center gap-1">
            Raison sociale <span className="text-red-500">*</span>
          </Label>
          <Input 
            id="companyName" 
            name="companyName" 
            value={profile.companyName || ''} 
            onChange={onChange}
            placeholder="Ex: SARL Consulting"
            className={fieldErrors?.companyName ? 'border-red-500 focus:ring-red-500' : ''}
          />
          {fieldErrors?.companyName && (
            <p className="text-xs text-red-600 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {fieldErrors.companyName}
            </p>
          )}
          <p className="text-xs text-gray-400">Requis pour générer des PDF/emails</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="legalForm" className="flex items-center gap-1">
              Forme juridique <span className="text-red-500">*</span>
            </Label>
            <select
              id="legalForm"
              name="legalForm"
              value={profile.legalForm || ''}
              onChange={(e) => onChange(e as any)}
              className={`flex h-10 w-full rounded-lg border bg-gray-800/50 text-white px-3 py-2 text-sm focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-colors ${
                fieldErrors?.legalForm ? 'border-red-500 focus:ring-red-500' : 'border-gray-700'
              }`}
            >
              <option value="">Sélectionnez une forme</option>
              <option value="Auto-entrepreneur">Auto-entrepreneur</option>
              <option value="EURL">EURL</option>
              <option value="SASU">SASU</option>
              <option value="SARL">SARL</option>
              <option value="Profession libérale">Profession libérale</option>
            </select>
            {fieldErrors?.legalForm && (
              <p className="text-xs text-red-600 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {fieldErrors.legalForm}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="siret">SIRET</Label>
            <Input 
              id="siret" 
              name="siret" 
              value={profile.siret || ''} 
              onChange={onChange}
              placeholder="14 chiffres"
              maxLength={14}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="logo">Logo de l'entreprise</Label>
          <Input 
            id="logo" 
            type="file" 
            accept="image/*" 
            onChange={onLogoChange} 
          />
          {profile.logo && (
            <img 
              src={profile.logo} 
              alt="Logo preview" 
              className="mt-2 h-20 object-contain border border-gray-700/50 rounded-lg p-2 bg-gray-800/50" 
            />
          )}
        </div>
      </div>

      {/* Section Adresse */}
      <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50 space-y-4">
        <h3 className="font-semibold text-white flex items-center gap-2 text-lg mb-4">
          <MapPin className="w-5 h-5 text-green-400" />
          Adresse professionnelle
        </h3>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="address.street" className="flex items-center gap-1">
              Adresse <span className="text-red-500">*</span>
            </Label>
            <Input 
              id="address.street"
              name="address.street" 
              value={profile.address?.street || ''} 
              onChange={onChange}
              placeholder="Numéro et nom de rue"
              className={fieldErrors?.['address.street'] ? 'border-red-500 focus:ring-red-500' : ''}
            />
            {fieldErrors?.['address.street'] && (
              <p className="text-xs text-red-600 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {fieldErrors['address.street']}
              </p>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="address.zipCode" className="flex items-center gap-1">
                Code postal <span className="text-red-500">*</span>
              </Label>
              <Input 
                id="address.zipCode"
                name="address.zipCode" 
                value={profile.address?.zipCode || ''} 
                onChange={onChange}
                placeholder="Code postal"
                maxLength={5}
                className={fieldErrors?.['address.zipCode'] ? 'border-red-500 focus:ring-red-500' : ''}
              />
              {fieldErrors?.['address.zipCode'] && (
                <p className="text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {fieldErrors['address.zipCode']}
                </p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="address.city" className="flex items-center gap-1">
                Ville <span className="text-red-500">*</span>
              </Label>
              <Input 
                id="address.city"
                name="address.city" 
                value={profile.address?.city || ''} 
                onChange={onChange}
                placeholder="Ville"
                className={fieldErrors?.['address.city'] ? 'border-red-500 focus:ring-red-500' : ''}
              />
              {fieldErrors?.['address.city'] && (
                <p className="text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {fieldErrors['address.city']}
                </p>
              )}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="address.country">Pays</Label>
            <Input 
              id="address.country"
              name="address.country" 
              value={profile.address?.country || ''} 
              onChange={onChange}
              placeholder="Pays"
            />
          </div>
        </div>
      </div>

      {/* Section Coordonnées bancaires */}
      <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50 space-y-4">
        <h3 className="font-semibold text-white flex items-center gap-2 text-lg mb-4">
          <CreditCard className="w-5 h-5 text-green-400" />
          Coordonnées bancaires
        </h3>

        <div className="space-y-2">
          <Label htmlFor="iban">IBAN</Label>
          <Input 
            id="iban" 
            name="iban" 
            value={profile.iban || ''} 
            onChange={onChange}
            placeholder="FR76 XXXX XXXX XXXX XXXX XXXX XXX"
          />
          <p className="text-xs text-gray-400">Pour recevoir les paiements de vos clients</p>
        </div>
      </div>

      {/* Section Informations légales */}
      <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50 space-y-4">
        <h3 className="font-semibold text-white flex items-center gap-2 text-lg mb-4">
          <FileText className="w-5 h-5 text-green-400" />
          Informations légales (optionnelles)
        </h3>
        <p className="text-sm text-gray-400 mb-4">Ces informations seront affichées dans les mentions légales de vos factures</p>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="rcsCity">Ville d'immatriculation RCS</Label>
            <Input 
              id="rcsCity" 
              name="rcsCity" 
              value={profile.rcsCity || ''} 
              onChange={onChange}
              placeholder="Ex: Paris"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="capital">Capital social (€)</Label>
            <Input 
              id="capital" 
              name="capital" 
              type="number"
              min="0"
              step="0.01"
              value={profile.capital || ''} 
              onChange={onChange}
              placeholder="Ex: 1000"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="tvaNumber">Numéro de TVA intracommunautaire</Label>
          <Input 
            id="tvaNumber" 
            name="tvaNumber" 
            value={profile.tvaNumber || ''} 
            onChange={onChange}
            placeholder="Ex: FR12345678901"
          />
        </div>
      </div>

      {/* Section Assurance */}
      <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50 space-y-4">
        <h3 className="font-semibold text-white flex items-center gap-2 text-lg mb-4">
          <Shield className="w-5 h-5 text-green-400" />
          Assurance RC Professionnelle (optionnelles)
        </h3>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="insuranceCompany">Compagnie d'assurance</Label>
            <Input 
              id="insuranceCompany" 
              name="insuranceCompany" 
              value={profile.insuranceCompany || ''} 
              onChange={onChange}
              placeholder="Ex: AXA, Allianz..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="insurancePolicy">Numéro de police</Label>
            <Input 
              id="insurancePolicy" 
              name="insurancePolicy" 
              value={profile.insurancePolicy || ''} 
              onChange={onChange}
              placeholder="Ex: 123456789"
            />
          </div>
        </div>
      </div>

      {/* Messages d'erreur et succès */}
      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-900/30 border border-red-700/50 rounded-lg animate-pulse">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
          <span className="text-sm font-medium text-red-300">{error}</span>
        </div>
      )}
      
      {success && (
        <div className="flex items-center gap-3 p-4 bg-green-900/30 border border-green-700/50 rounded-lg">
          <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
          <span className="text-sm font-medium text-green-300">Profil mis à jour avec succès !</span>
        </div>
      )}

      {/* Boutons d'action */}
      <div className="flex gap-3 pt-6 border-t border-gray-700/50">
        <Button type="submit" disabled={isLoading} className="flex-1">
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Enregistrement...
            </>
          ) : (
            <>
              <CheckCircle className="w-4 h-4 mr-2" />
              Enregistrer
            </>
          )}
        </Button>
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel} 
          disabled={isLoading}
          className="flex-1"
        >
          Annuler
        </Button>
      </div>
    </form>
  );
};

export default ProfileForm;
