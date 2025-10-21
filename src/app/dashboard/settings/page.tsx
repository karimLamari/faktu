"use client";
import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

const initialState = {
  firstName: '',
  lastName: '',
  companyName: '',
  legalForm: '',
  siret: '',
  address: { street: '', city: '', zipCode: '', country: 'France' },
  phone: '',
  logo: '',
  iban: '',
  defaultCurrency: 'EUR',
  defaultTaxRate: 20,
  email: '',
};

export default function ProfileSettings() {
  const [form, setForm] = useState<any>(initialState);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    fetch('/api/user/profile', { method: 'GET' })
      .then(res => res.json())
      .then(data => {
        if (data && data.user) setForm({ ...initialState, ...data.user });
      });
  }, []);

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    if (name.startsWith('address.')) {
      const key = name.split('.')[1];
      setForm((prev: any) => ({ ...prev, address: { ...prev.address, [key]: value } }));
    } else {
      setForm((prev: any) => ({ ...prev, [name]: value }));
    }
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setForm((prev: any) => ({ ...prev, logo: ev.target?.result as string }));
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
        body: JSON.stringify(form),
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
      <div className="max-w-2xl mx-auto py-8">
        <h2 className="text-2xl font-bold mb-6">Profil utilisateur</h2>
        {/* Card profil affichage */}
        {!editMode && (
          <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center mb-8 border border-gray-100">
            {form.logo ? (
              <img src={form.logo} alt="Logo" className="h-24 w-24 rounded-full object-cover border mb-4" />
            ) : (
              <div className="h-24 w-24 rounded-full bg-gray-200 flex items-center justify-center text-3xl text-gray-400 mb-4">
                <span>{form.companyName?.[0] || '?'}</span>
              </div>
            )}
            <div className="text-xl font-semibold">{form.companyName}</div>
            <div className="text-gray-600">{form.firstName} {form.lastName}</div>
            <div className="text-gray-500 text-sm mb-2">{form.email}</div>
            <div className="flex flex-wrap justify-center gap-2 text-gray-700 text-sm mb-2">
              <span>{form.legalForm}</span>
              {form.siret && <span>SIRET : {form.siret}</span>}
              {form.iban && <span>IBAN : {form.iban}</span>}
            </div>
            <div className="text-gray-500 text-sm mb-2">
              {form.address.street}, {form.address.zipCode} {form.address.city}, {form.address.country}
            </div>
            <div className="text-gray-500 text-sm mb-2">{form.phone}</div>
            <Button className="mt-2" onClick={() => setEditMode(true)}>Modifier</Button>
          </div>
        )}
        {/* Formulaire édition */}
        {editMode && (
          <form onSubmit={handleSubmit} className="space-y-6 bg-white rounded-xl shadow p-6 border border-gray-100">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Prénom</Label>
                <Input id="firstName" name="firstName" value={form.firstName} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Nom</Label>
                <Input id="lastName" name="lastName" value={form.lastName} onChange={handleChange} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="companyName">Raison sociale</Label>
              <Input id="companyName" name="companyName" value={form.companyName} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="legalForm">Forme juridique</Label>
              <Input id="legalForm" name="legalForm" value={form.legalForm} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="siret">SIRET</Label>
              <Input id="siret" name="siret" value={form.siret} onChange={handleChange} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="address.street">Adresse</Label>
                <Input id="address.street" name="address.street" value={form.address.street} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address.city">Ville</Label>
                <Input id="address.city" name="address.city" value={form.address.city} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address.zipCode">Code postal</Label>
                <Input id="address.zipCode" name="address.zipCode" value={form.address.zipCode} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address.country">Pays</Label>
                <Input id="address.country" name="address.country" value={form.address.country} onChange={handleChange} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Téléphone</Label>
              <Input id="phone" name="phone" value={form.phone} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="iban">IBAN</Label>
              <Input id="iban" name="iban" value={form.iban} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="logo">Logo de l'entreprise</Label>
              <Input id="logo" type="file" accept="image/*" onChange={handleLogoChange} />
              {form.logo && <img src={form.logo} alt="Logo preview" className="mt-2 h-20" />}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="defaultCurrency">Devise</Label>
                <Input id="defaultCurrency" name="defaultCurrency" value={form.defaultCurrency} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="defaultTaxRate">TVA par défaut (%)</Label>
                <Input id="defaultTaxRate" name="defaultTaxRate" type="number" value={form.defaultTaxRate} onChange={handleChange} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" value={form.email} onChange={handleChange} disabled />
            </div>
            {error && <div className="text-red-600">{error}</div>}
            {success && <div className="text-green-600">Profil mis à jour !</div>}
            <div className="flex gap-2">
              <Button type="submit" disabled={isLoading}>{isLoading ? 'Enregistrement...' : 'Enregistrer'}</Button>
              <Button type="button" variant="outline" onClick={() => setEditMode(false)} disabled={isLoading}>Annuler</Button>
            </div>
          </form>
        )}
      </div>
    </DashboardLayout>
  );
}
