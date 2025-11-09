'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PasswordStrengthIndicator } from '@/components/auth/PasswordStrengthIndicator';
import { z } from 'zod';
import { SpaceBackground } from '@/components/ui/SpaceBackground';
import Image from 'next/image';

// Schéma minimal pour l'inscription simplifiée
const registerSchema = z.object({
  firstName: z.string().min(1, 'Prénom requis'),
  lastName: z.string().min(1, 'Nom requis'),
  email: z.string().email('Email invalide'),
  password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
  acceptTerms: z.boolean().refine((val) => val === true, {
    message: 'Vous devez accepter les conditions générales',
  }),
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const [formData, setFormData] = useState<RegisterFormData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    acceptTerms: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    try {
      registerSchema.parse(formData);
      
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
    <SpaceBackground variant="subtle">
      <div className="min-h-screen flex items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md shadow-2xl border-gray-700/50 bg-gray-900/80 backdrop-blur-lg">
          <CardHeader className="text-center space-y-3 pb-6">
            <div className="w-16 h-16 rounded-xl flex items-center justify-center mx-auto">
              <Image src="/icons/blink_logo.png" alt="Blink Logo" width={64} height={64} className="w-16 h-16" />
            </div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
              Inscription
            </CardTitle>
            <CardDescription className="text-gray-300">
              Créez votre compte BLINK en quelques secondes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-gray-200">Prénom</Label>
                  <Input 
                    id="firstName" 
                    value={formData.firstName}
                    onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))} 
                    disabled={isLoading}
                    placeholder="Jean"
                    className="bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500"
                  />
                  {errors.firstName && <p className="text-sm text-red-400">{errors.firstName}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-gray-200">Nom</Label>
                  <Input 
                    id="lastName" 
                    value={formData.lastName}
                    onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))} 
                    disabled={isLoading}
                    placeholder="Dupont"
                    className="bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500"
                  />
                  {errors.lastName && <p className="text-sm text-red-400">{errors.lastName}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-200">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  disabled={isLoading}
                  placeholder="jean.dupont@exemple.fr"
                  className="bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500"
                />
                {errors.email && <p className="text-sm text-red-400">{errors.email}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-200">Mot de passe</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  disabled={isLoading}
                  placeholder="Au moins 8 caractères"
                  className="bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500"
                />
                <PasswordStrengthIndicator password={formData.password} />
                {errors.password && <p className="text-sm text-red-400">{errors.password}</p>}
              </div>

              {/* Checkbox CGU */}
              <div className="flex items-start space-x-3 pt-2">
                <input
                  type="checkbox"
                  id="acceptTerms"
                  checked={formData.acceptTerms}
                  onChange={(e) => setFormData(prev => ({ ...prev, acceptTerms: e.target.checked }))}
                  disabled={isLoading}
                  className="mt-1 w-4 h-4 rounded border-gray-700 bg-gray-800/50 text-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-0"
                />
                <label htmlFor="acceptTerms" className="text-sm text-gray-300 leading-tight">
                  J'accepte les{' '}
                  <Link href="/legal/terms" className="text-blue-400 hover:text-blue-300 underline" target="_blank">
                    Conditions Générales d'Utilisation
                  </Link>
                  {' '}et la{' '}
                  <Link href="/legal/privacy" className="text-blue-400 hover:text-blue-300 underline" target="_blank">
                    Politique de Confidentialité
                  </Link>
                  <span className="text-red-400 ml-1">*</span>
                </label>
              </div>
              {errors.acceptTerms && <p className="text-sm text-red-400">{errors.acceptTerms}</p>}

              {errors.general && (
                <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-md text-sm">
                  {errors.general}
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 font-semibold shadow-lg hover:shadow-blue-500/50 transition-all" 
                disabled={isLoading}
              >
                {isLoading ? 'Inscription...' : 'S\'inscrire gratuitement'}
              </Button>
            </form>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-700" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-gray-900 px-3 text-gray-400 font-medium">Ou</span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full border-gray-700 hover:bg-gray-800/50 font-medium text-gray-200"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
            >
              Continuer avec Google
            </Button>

            <p className="text-center text-sm text-gray-300">
              Déjà un compte ?{' '}
              <Link href="/login" className="text-blue-400 hover:text-blue-300 font-semibold">
                Se connecter
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </SpaceBackground>
  );
}