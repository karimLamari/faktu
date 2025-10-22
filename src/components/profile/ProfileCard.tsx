import React from 'react';
import { Button } from '@/components/ui/button';

export interface ProfileData {
  firstName?: string;
  lastName?: string;
  companyName?: string;
  legalForm?: string;
  siret?: string;
  address?: {
    street?: string;
    city?: string;
    zipCode?: string;
    country?: string;
  };
  phone?: string;
  logo?: string;
  iban?: string;
  email?: string;
}

interface ProfileCardProps {
  profile: ProfileData;
  onEdit: () => void;
}

const ProfileCard: React.FC<ProfileCardProps> = ({ profile, onEdit }) => {
  const displayAddress = profile.address
    ? [profile.address.street, profile.address.zipCode, profile.address.city, profile.address.country]
        .filter(Boolean)
        .join(', ')
    : '';

  return (
    <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center border border-gray-100">
      {/* Logo ou initiale */}
      {profile.logo ? (
        <img 
          src={profile.logo} 
          alt="Logo" 
          className="h-24 w-24 rounded-full object-cover border mb-4" 
        />
      ) : (
        <div className="h-24 w-24 rounded-full bg-gray-200 flex items-center justify-center text-3xl text-gray-400 mb-4">
          <span>{profile.companyName?.[0] || '?'}</span>
        </div>
      )}

      {/* Informations principales */}
      <div className="text-xl font-semibold text-center">{profile.companyName}</div>
      <div className="text-gray-600 text-center">
        {profile.firstName} {profile.lastName}
      </div>
      <div className="text-gray-500 text-sm mb-2">{profile.email}</div>

      {/* Informations légales */}
      <div className="flex flex-wrap justify-center gap-2 text-gray-700 text-sm mb-2">
        {profile.legalForm && <span>{profile.legalForm}</span>}
        {profile.siret && <span>SIRET : {profile.siret}</span>}
        {profile.iban && <span>IBAN : {profile.iban}</span>}
      </div>

      {/* Adresse */}
      {displayAddress && (
        <div className="text-gray-500 text-sm mb-2 text-center">{displayAddress}</div>
      )}

      {/* Téléphone */}
      {profile.phone && (
        <div className="text-gray-500 text-sm mb-2">{profile.phone}</div>
      )}

      {/* Bouton modifier */}
      <Button className="mt-2" onClick={onEdit}>
        Modifier
      </Button>
    </div>
  );
};

export default ProfileCard;
