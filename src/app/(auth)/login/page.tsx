'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { loginSchema, type LoginFormData } from '@/lib/validations';
import { z } from 'zod';
import { SpaceBackground } from '@/components/ui/SpaceBackground';
import Image from 'next/image';

export default function LoginPage() {
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    try {
      loginSchema.parse(formData);
      
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        setErrors({ general: 'Email ou mot de passe incorrect' });
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
              Connexion
            </CardTitle>
            <CardDescription className="text-gray-300">
              Connectez-vous à votre compte BLINK
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-200">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                disabled={isLoading}
                className="bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500"
              />
              {errors.email && <p className="text-sm text-red-400">{errors.email}</p>}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-gray-200">Mot de passe</Label>
                <Link 
                  href="/forgot-password" 
                  className="text-xs text-blue-400 hover:text-blue-300 font-medium transition-colors"
                >
                  Mot de passe oublié ?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                disabled={isLoading}
                className="bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500"
              />
              {errors.password && <p className="text-sm text-red-400">{errors.password}</p>}
            </div>

            {errors.general && (
              <p className="text-sm text-red-400 text-center">{errors.general}</p>
            )}

            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 font-semibold shadow-lg hover:shadow-blue-500/50 transition-all" 
              disabled={isLoading}
            >
              {isLoading ? 'Connexion...' : 'Se connecter'}
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
            Pas encore de compte ?{' '}
            <Link href="/register" className="text-blue-400 hover:text-blue-300 font-semibold">
              S'inscrire
            </Link>
          </p>
        </CardContent>
      </Card>
      </div>
    </SpaceBackground>
  );
}