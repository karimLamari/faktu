"use client";
import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import ProfileCard from '@/components/profile/ProfileCard';
import ProfileForm from '@/components/profile/ProfileForm';
import type { ProfileData } from '@/components/profile/ProfileCard';

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

export default function ProfileSettings() {
  const [profile, setProfile] = useState<ProfileData>(initialState);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    fetch('/api/user/profile', { method: 'GET' })
      .then(res => res.json())
      .then(data => {
        if (data && data.user) setProfile({ ...initialState, ...data.user });
      });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name.startsWith('address.')) {
      const key = name.split('.')[1];
      setProfile((prev) => ({ 
        ...prev, 
        address: { ...prev.address, [key]: value } 
      }));
    } else {
      setProfile((prev) => ({ ...prev, [name]: value }));
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
    setSuccess(false);
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      });
      if (!res.ok) throw new Error('Erreur lors de la mise à jour');
      setSuccess(true);
      setEditMode(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto animate-fade-in">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Paramètres</h1>
          <p className="text-gray-600">Gérez les informations de votre entreprise et de votre profil</p>
        </div>
        
        {/* Affichage du profil */}
        {!editMode && (
          <ProfileCard 
            profile={profile} 
            onEdit={() => setEditMode(true)} 
          />
        )}

        {/* Formulaire d'édition */}
        {editMode && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 animate-slide-in-up">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Modifier le profil</h2>
              <p className="text-gray-600">Mettez à jour vos informations professionnelles</p>
            </div>
            
            <ProfileForm
              profile={profile}
              onChange={handleChange}
              onLogoChange={handleLogoChange}
              onSubmit={handleSubmit}
              onCancel={() => {
                setEditMode(false);
                setError('');
                setSuccess(false);
              }}
              isLoading={isLoading}
              error={error}
              success={success}
            />
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
