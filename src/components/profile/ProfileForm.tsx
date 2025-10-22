import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ProfileData } from './ProfileCard';

interface ProfileFormProps {
  profile: ProfileData;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onLogoChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  isLoading?: boolean;
  error?: string;
  success?: boolean;
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
}) => {
  return (
    <form onSubmit={onSubmit} className="space-y-6 bg-white rounded-xl shadow p-6 border border-gray-100">
      {/* Nom et prénom */}
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

      {/* Raison sociale */}
      <div className="space-y-2">
        <Label htmlFor="companyName">Raison sociale</Label>
        <Input 
          id="companyName" 
          name="companyName" 
          value={profile.companyName || ''} 
          onChange={onChange} 
        />
      </div>

      {/* Forme juridique */}
      <div className="space-y-2">
        <Label htmlFor="legalForm">Forme juridique</Label>
        <Input 
          id="legalForm" 
          name="legalForm" 
          value={profile.legalForm || ''} 
          onChange={onChange} 
        />
      </div>

      {/* SIRET */}
      <div className="space-y-2">
        <Label htmlFor="siret">SIRET</Label>
        <Input 
          id="siret" 
          name="siret" 
          value={profile.siret || ''} 
          onChange={onChange} 
        />
      </div>

      {/* Adresse */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="address.street">Adresse</Label>
          <Input 
            id="address.street" 
            name="address.street" 
            value={profile.address?.street || ''} 
            onChange={onChange} 
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="address.city">Ville</Label>
          <Input 
            id="address.city" 
            name="address.city" 
            value={profile.address?.city || ''} 
            onChange={onChange} 
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="address.zipCode">Code postal</Label>
          <Input 
            id="address.zipCode" 
            name="address.zipCode" 
            value={profile.address?.zipCode || ''} 
            onChange={onChange} 
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="address.country">Pays</Label>
          <Input 
            id="address.country" 
            name="address.country" 
            value={profile.address?.country || ''} 
            onChange={onChange} 
          />
        </div>
      </div>

      {/* Téléphone */}
      <div className="space-y-2">
        <Label htmlFor="phone">Téléphone</Label>
        <Input 
          id="phone" 
          name="phone" 
          value={profile.phone || ''} 
          onChange={onChange} 
        />
      </div>

      {/* IBAN */}
      <div className="space-y-2">
        <Label htmlFor="iban">IBAN</Label>
        <Input 
          id="iban" 
          name="iban" 
          value={profile.iban || ''} 
          onChange={onChange} 
        />
      </div>

      {/* Logo */}
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
            className="mt-2 h-20 object-contain" 
          />
        )}
      </div>

      {/* Email (désactivé) */}
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input 
          id="email" 
          name="email" 
          value={profile.email || ''} 
          onChange={onChange} 
          disabled 
        />
      </div>

      {/* Messages d'erreur et succès */}
      {error && (
        <div className="text-red-600 text-sm bg-red-50 p-3 rounded border border-red-200">
          {error}
        </div>
      )}
      {success && (
        <div className="text-green-600 text-sm bg-green-50 p-3 rounded border border-green-200">
          Profil mis à jour avec succès !
        </div>
      )}

      {/* Boutons d'action */}
      <div className="flex gap-2">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Enregistrement...' : 'Enregistrer'}
        </Button>
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel} 
          disabled={isLoading}
        >
          Annuler
        </Button>
      </div>
    </form>
  );
};

export default ProfileForm;
