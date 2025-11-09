'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PasswordStrengthIndicator } from '@/components/auth/PasswordStrengthIndicator';
import { SpaceBackground } from '@/components/ui/SpaceBackground';
import { ArrowLeft, Lock, CheckCircle, AlertCircle } from 'lucide-react';
import Image from 'next/image';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setError('Token de réinitialisation manquant');
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Validation
    if (password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères');
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Une erreur est survenue');
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } catch (err) {
      setError('Erreur lors de la réinitialisation');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md shadow-2xl border-gray-700/50 bg-gray-900/80 backdrop-blur-lg">
      <CardHeader className="text-center space-y-3 pb-6">
        <div className="w-16 h-16 rounded-xl flex items-center justify-center mx-auto">
          <Image src="/icons/blink_logo.png" alt="Blink Logo" width={64} height={64} className="w-16 h-16" />
        </div>
        <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
          Nouveau mot de passe
        </CardTitle>
        <CardDescription className="text-gray-300">
          Choisissez un nouveau mot de passe sécurisé
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {!success ? (
          <>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-200">Nouveau mot de passe</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading || !token}
                  placeholder="Au moins 8 caractères"
                  className="bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500"
                  required
                />
                <PasswordStrengthIndicator password={password} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-gray-200">Confirmer le mot de passe</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isLoading || !token}
                  placeholder="Retapez votre mot de passe"
                  className="bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500"
                  required
                />
              </div>

              {error && (
                <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-md text-sm flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 font-semibold shadow-lg hover:shadow-blue-500/50 transition-all" 
                disabled={isLoading || !token}
              >
                {isLoading ? (
                  <>
                    <Lock className="w-4 h-4 mr-2 animate-pulse" />
                    Réinitialisation...
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4 mr-2" />
                    Réinitialiser le mot de passe
                  </>
                )}
              </Button>
            </form>

            <div className="text-center">
              <Link 
                href="/login" 
                className="inline-flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 font-medium transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Retour à la connexion
              </Link>
            </div>
          </>
        ) : (
          <div className="text-center space-y-4 py-6">
            <div className="w-16 h-16 bg-green-900/30 border-2 border-green-500 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white mb-2">Mot de passe réinitialisé !</h3>
              <p className="text-gray-300 text-sm mb-4">
                Votre mot de passe a été mis à jour avec succès.
              </p>
              <p className="text-gray-400 text-xs mb-6">
                Redirection vers la page de connexion...
              </p>
            </div>
            <Link href="/login">
              <Button variant="outline" className="w-full border-gray-700 hover:bg-gray-800/50 text-gray-200">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Se connecter maintenant
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function ResetPasswordPage() {
  return (
    <SpaceBackground variant="subtle">
      <div className="min-h-screen flex items-center justify-center px-4 py-12">
        <Suspense fallback={
          <Card className="w-full max-w-md shadow-2xl border-gray-700/50 bg-gray-900/80 backdrop-blur-lg">
            <CardContent className="py-12">
              <div className="text-center text-gray-300">Chargement...</div>
            </CardContent>
          </Card>
        }>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </SpaceBackground>
  );
}
