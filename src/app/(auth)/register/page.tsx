'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { userSchema, type UserFormData } from '@/lib/validations';
import { z } from 'zod';

export default function RegisterPage() {
  const [formData, setFormData] = useState<UserFormData>({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    companyName: '',
    legalForm: 'Auto-entrepreneur',
    address: { street: '', city: '', zipCode: '', country: 'France' },
    defaultCurrency: 'EUR',
    defaultTaxRate: 20,
    iban: '',
  } as UserFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    try {
      userSchema.parse(formData);
      
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrors({ general: data.error || 'Erreur lors de l\'inscription' });
        return;
      }

      // Connexion automatique après inscription
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        setErrors({ general: 'Inscription réussie mais erreur de connexion' });
      } else {
        router.push('/dashboard');
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.issues.forEach((issue) => {
          if (issue.path[0]) {
            fieldErrors[issue.path[0] as string] = issue.message;
          }
        });
        setErrors(fieldErrors);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    signIn('google', { callbackUrl: '/dashboard' });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <Card className="w-full max-w-md shadow-lg border-gray-200">
        <CardHeader className="text-center space-y-3 pb-6">
          <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-xl mx-auto shadow-md">
            F
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">Inscription</CardTitle>
          <CardDescription className="text-gray-600">
            Créez votre compte FAKTU gratuitement
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Prénom</Label>
                <Input id="firstName" value={formData.firstName}
                  onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))} disabled={isLoading} />
                {errors.firstName && <p className="text-sm text-red-600">{errors.firstName}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Nom</Label>
                <Input id="lastName" value={formData.lastName}
                  onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))} disabled={isLoading} />
                {errors.lastName && <p className="text-sm text-red-600">{errors.lastName}</p>}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="companyName">Raison sociale</Label>
              <Input id="companyName" value={formData.companyName}
                onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))} disabled={isLoading} />
              {errors.companyName && <p className="text-sm text-red-600">{errors.companyName}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="legalForm">Forme juridique</Label>
              <Input id="legalForm" value={formData.legalForm}
                onChange={(e) => setFormData(prev => ({ ...prev, legalForm: e.target.value as any }))} disabled={isLoading} />
              {errors.legalForm && <p className="text-sm text-red-600">{errors.legalForm}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="siret">SIRET (optionnel)</Label>
              <Input 
                id="siret" 
                value={formData.siret || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, siret: e.target.value }))} 
                disabled={isLoading}
                placeholder="14 chiffres"
                maxLength={14}
              />
              {errors.siret && <p className="text-sm text-red-600">{errors.siret}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="street">Adresse</Label>
                <Input id="street" value={formData.address.street}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: { ...prev.address, street: e.target.value } }))} disabled={isLoading} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">Ville</Label>
                <Input id="city" value={formData.address.city}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: { ...prev.address, city: e.target.value } }))} disabled={isLoading} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="zipCode">Code postal</Label>
                <Input id="zipCode" value={formData.address.zipCode}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: { ...prev.address, zipCode: e.target.value } }))} disabled={isLoading} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">Pays</Label>
                <Input id="country" value={formData.address.country}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: { ...prev.address, country: e.target.value } }))} disabled={isLoading} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                disabled={isLoading}
              />
              {errors.email && <p className="text-sm text-red-600">{errors.email}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="iban">IBAN</Label>
              <Input
                id="iban"
                value={formData.iban || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, iban: e.target.value }))}
                disabled={isLoading}
              />
              {errors.iban && <p className="text-sm text-red-600">{errors.iban}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                disabled={isLoading}
              />
              {errors.password && <p className="text-sm text-red-600">{errors.password}</p>}
            </div>

            {errors.general && (
              <p className="text-sm text-red-600 text-center">{errors.general}</p>
            )}

            <Button type="submit" className="w-full bg-indigo-600 hover:bg-blue-700 font-semibold shadow-md" disabled={isLoading}>
              {isLoading ? 'Inscription...' : 'S\'inscrire'}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-3 text-gray-500 font-medium">Ou</span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full border-gray-300 hover:bg-gray-50 font-medium"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
          >
            Continuer avec Google
          </Button>

          <p className="text-center text-sm text-gray-600">
            Déjà un compte ?{' '}
            <Link href="/login" className="text-blue-600 hover:text-blue-700 font-semibold">
              Se connecter
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}