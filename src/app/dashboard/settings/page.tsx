"use client";
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import ProfileCard from '@/components/profile/ProfileCard';
import ProfileForm from '@/components/profile/ProfileForm';
import ProfileWizard from '@/components/profile/ProfileWizard';
import type { ProfileData } from '@/components/profile/ProfileCard';
import { isProfileComplete } from '@/lib/utils/profile';
import { userProfileUpdateSchema } from '@/lib/validations';
import { z } from 'zod';

const initialState: ProfileData = {
  firstName: '',
  lastName: '',
  companyName: '',
  legalForm: '',
  siret: '',
  address: { street: '', city: '', zipCode: '', country: 'France' },
  phone: '',
  logo: '',
  iban: '',
  email: '',
};

function ProfileSettingsContent() {
  const searchParams = useSearchParams();
  const shouldEdit = searchParams.get('edit') === 'true';
  
  const [profile, setProfile] = useState<ProfileData>(initialState);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [editMode, setEditMode] = useState(shouldEdit);
  const [profileComplete, setProfileComplete] = useState(false);

  useEffect(() => {
    fetch('/api/user/profile', { method: 'GET' })
      .then(res => res.json())
      .then(data => {
        if (data && data.user) {
          const userProfile = { ...initialState, ...data.user };
          setProfile(userProfile);
          
          // Vérifier si le profil est complet avec la fonction centralisée
          setProfileComplete(isProfileComplete(userProfile));
        }
      });
  }, [success]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Mise à jour de l'état
    if (name.startsWith('address.')) {
      const key = name.split('.')[1];
      setProfile((prev) => ({ 
        ...prev, 
        address: { ...prev.address, [key]: value } 
      }));
    } else {
      setProfile((prev) => ({ ...prev, [name]: value }));
    }
    
    // Validation temps réel : effacer l'erreur quand l'utilisateur corrige
    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setProfile((prev) => ({ ...prev, logo: ev.target?.result as string }));
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setFieldErrors({});
    setSuccess(false);
    
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        // Parser les erreurs Zod détaillées
        if (data.details && Array.isArray(data.details)) {
          const errors: Record<string, string> = {};
          data.details.forEach((issue: any) => {
            const path = issue.path.join('.');
            errors[path] = issue.message;
          });
          setFieldErrors(errors);
          setError('Veuillez corriger les erreurs ci-dessous');
        } else if (data.errors && Array.isArray(data.errors)) {
          // Fallback : afficher la liste des erreurs
          setError(data.errors.join(', '));
        } else {
          setError(data.error || 'Erreur lors de la mise à jour');
        }
        return;
      }
      
      setSuccess(true);
      setEditMode(false);
    } catch (err: any) {
      setError('Erreur réseau : ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Paramètres</h1>
          <p className="text-gray-400">Gérez les informations de votre entreprise et de votre profil</p>
        </div>

        {/* Alerte profil incomplet */}
        {!profileComplete && !editMode && (
          <div className="mb-6 bg-blue-900/30 border border-blue-700/50 rounded-xl p-6 animate-slide-in-up">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-blue-300 mb-1">Profil professionnel requis</h3>
                <p className="text-blue-200 mb-3">
                  Complétez vos informations pour générer des factures conformes (PDF, email, rappels).
                </p>
                <button
                  onClick={() => setEditMode(true)}
                  className="text-blue-400 hover:text-blue-300 font-semibold underline"
                >
                  Compléter →
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Affichage du profil */}
        {!editMode && (
          <ProfileCard 
            profile={profile} 
            onEdit={() => setEditMode(true)} 
          />
        )}

        {/* Formulaire d'édition */}
        {editMode && (
          <ProfileWizard
            initialData={profile}
            onSubmit={async (data) => {
              setIsLoading(true);
              setError('');
              setFieldErrors({});
              setSuccess(false);
              
              try {
                const res = await fetch('/api/user/profile', {
                  method: 'PATCH',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(data),
                });
                
                const responseData = await res.json();
                
                if (!res.ok) {
                  // Parser les erreurs Zod détaillées
                  if (responseData.details && Array.isArray(responseData.details)) {
                    const errors: Record<string, string> = {};
                    responseData.details.forEach((issue: any) => {
                      const path = issue.path.join('.');
                      errors[path] = issue.message;
                    });
                    setFieldErrors(errors);
                    setError('Veuillez corriger les erreurs ci-dessous');
                  } else if (responseData.errors && Array.isArray(responseData.errors)) {
                    setError(responseData.errors.join(', '));
                  } else {
                    setError(responseData.error || 'Erreur lors de la mise à jour');
                  }
                  throw new Error(responseData.error || 'Erreur');
                }
                
                setProfile(data);
                setSuccess(true);
                setEditMode(false);
              } catch (err: any) {
                setError('Erreur réseau : ' + err.message);
                throw err;
              } finally {
                setIsLoading(false);
              }
            }}
            onCancel={() => {
              setEditMode(false);
              setError('');
              setFieldErrors({});
              setSuccess(false);
            }}
          />
        )}
      </div>
  );
}

export default function ProfileSettings() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-screen">Chargement...</div>}>
      <ProfileSettingsContent />
    </Suspense>
  );
}
