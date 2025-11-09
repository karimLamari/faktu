'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SpaceBackground } from '@/components/ui/SpaceBackground';
import { ArrowLeft, Mail, CheckCircle } from 'lucide-react';
import Image from 'next/image';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Une erreur est survenue');
        return;
      }

      setSuccess(true);
    } catch (err) {
      setError('Erreur lors de l\'envoi de l\'email');
    } finally {
      setIsLoading(false);
    }
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
              Mot de passe oublié
            </CardTitle>
            <CardDescription className="text-gray-300">
              Entrez votre email pour recevoir un lien de réinitialisation
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {!success ? (
              <>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-gray-200">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isLoading}
                      placeholder="votre@email.fr"
                      className="bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500"
                      required
                    />
                  </div>

                  {error && (
                    <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-md text-sm">
                      {error}
                    </div>
                  )}

                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 font-semibold shadow-lg hover:shadow-blue-500/50 transition-all" 
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Mail className="w-4 h-4 mr-2 animate-pulse" />
                        Envoi en cours...
                      </>
                    ) : (
                      <>
                        <Mail className="w-4 h-4 mr-2" />
                        Envoyer le lien
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
                  <h3 className="text-xl font-semibold text-white mb-2">Email envoyé !</h3>
                  <p className="text-gray-300 text-sm mb-4">
                    Consultez votre boîte mail <strong className="text-white">{email}</strong>
                  </p>
                  <p className="text-gray-400 text-xs mb-6">
                    Vous recevrez un lien pour réinitialiser votre mot de passe dans quelques instants.
                    Pensez à vérifier vos spams si vous ne le voyez pas.
                  </p>
                </div>
                <Link href="/login">
                  <Button variant="outline" className="w-full border-gray-700 hover:bg-gray-800/50 text-gray-200">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Retour à la connexion
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </SpaceBackground>
  );
}
