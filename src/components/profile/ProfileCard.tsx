import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Building2, User, Mail, Phone, MapPin, CreditCard, FileText, Edit, Sparkles } from 'lucide-react';

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
  // Informations légales pour facturation (optionnelles)
  rcsCity?: string;
  capital?: number;
  tvaNumber?: string;
  insuranceCompany?: string;
  insurancePolicy?: string;
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

  const initials = (profile.companyName || '?')
    .split(' ')
    .map(word => word[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div className="bg-gray-900/80 backdrop-blur-lg rounded-2xl shadow-2xl border border-gray-700/50 overflow-hidden animate-fade-in">
      {/* Header */}
      <div className="bg-gradient-to-br from-green-600 via-green-700 to-green-800 p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full -ml-24 -mb-24" />
        
        <div className="relative flex flex-col items-center">
          {/* Logo ou initiale */}
          {profile.logo ? (
            <div className="w-32 h-32 rounded-2xl overflow-hidden border-4 border-white/30 shadow-2xl mb-4">
              <img 
                src={profile.logo} 
                alt="Logo" 
                className="w-full h-full object-cover" 
              />
            </div>
          ) : (
            <div className="w-32 h-32 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-5xl font-bold border-4 border-white/30 shadow-2xl mb-4">
              {initials}
            </div>
          )}

          {/* Nom de l'entreprise */}
          <h2 className="text-3xl font-bold text-center mb-2">
            {profile.companyName || 'Entreprise'}
          </h2>
          
          {/* Nom du propriétaire */}
          {(profile.firstName || profile.lastName) && (
            <div className="flex items-center gap-2 text-white/90 mb-3">
              <User className="w-4 h-4" />
              <span className="text-lg">
                {profile.firstName} {profile.lastName}
              </span>
            </div>
          )}

          {/* Forme légale */}
          {profile.legalForm && (
            <Badge className="bg-white/30 text-white border-white/40 mb-2">
              {profile.legalForm}
            </Badge>
          )}
        </div>
      </div>

      {/* Corps de la card */}
      <div className="p-8 space-y-6">
        {/* Informations de contact */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            Informations de contact
          </h3>
          
          <div className="space-y-3">
            {profile.email && (
              <div className="flex items-center gap-4 p-3 bg-green-900/30 border border-green-700/50 rounded-xl">
                <div className="w-10 h-10 rounded-lg bg-green-800/50 flex items-center justify-center flex-shrink-0">
                  <Mail className="w-5 h-5 text-green-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-400 mb-1">Email</p>
                  <p className="text-sm font-medium text-white truncate">{profile.email}</p>
                </div>
              </div>
            )}

            {profile.phone && (
              <div className="flex items-center gap-4 p-3 bg-green-900/30 border border-green-700/50 rounded-xl">
                <div className="w-10 h-10 rounded-lg bg-green-800/50 flex items-center justify-center flex-shrink-0">
                  <Phone className="w-5 h-5 text-green-400" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-400 mb-1">Téléphone</p>
                  <p className="text-sm font-medium text-white">{profile.phone}</p>
                </div>
              </div>
            )}

            {displayAddress && (
              <div className="flex items-start gap-4 p-3 bg-green-900/30 border border-green-700/50 rounded-xl">
                <div className="w-10 h-10 rounded-lg bg-green-800/50 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 text-green-400" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-400 mb-1">Adresse</p>
                  <p className="text-sm font-medium text-white">{displayAddress}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Informations légales & bancaires */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Informations légales
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {profile.siret && (
              <div className="p-4 bg-green-900/30 border border-green-700/50 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <Building2 className="w-4 h-4 text-green-400" />
                  <p className="text-xs text-gray-400">SIRET</p>
                </div>
                <p className="text-sm font-semibold text-white">{profile.siret}</p>
              </div>
            )}

            {profile.iban && (
              <div className="p-4 bg-green-900/30 border border-green-700/50 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <CreditCard className="w-4 h-4 text-green-400" />
                  <p className="text-xs text-gray-400">IBAN</p>
                </div>
                <p className="text-sm font-mono font-semibold text-white truncate">{profile.iban}</p>
              </div>
            )}
          </div>
        </div>

        {/* Bouton modifier */}
        <Button 
          className="w-full h-12 rounded-xl bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg shadow-green-500/20"
          onClick={onEdit}
        >
          <Edit className="w-5 h-5 mr-2" />
          Modifier le profil
        </Button>
      </div>
    </div>
  );
};

export default ProfileCard;
