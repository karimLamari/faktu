import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import InvoiceCarousel3D from '@/components/ui/InvoiceCarousel3D';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-5 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-md">
              F
            </div>
            <span className="text-2xl font-bold text-gray-900">FAKTU</span>
          </div>
          <div className="flex gap-3">
            <Button variant="ghost" asChild className="font-medium">
              <Link href="/login">Connexion</Link>
            </Button>
            <Button asChild className="bg-indigo-600 hover:bg-blue-700 font-semibold shadow-md">
              <Link href="/register">S'inscrire</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-20">
        <div className="text-center mb-24">
          <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-semibold border border-blue-200">
            <span className="w-2 h-2 bg-indigo-600 rounded-full animate-pulse"></span>
            Solution de facturation moderne
          </div>
          <h1 className="text-5xl lg:text-7xl font-bold text-gray-900 mb-8 leading-tight">
            Gérez vos factures<br />
            <span className="text-blue-600">en toute simplicité</span>
          </h1>
          <p className="text-xl text-gray-600 mb-10 leading-relaxed max-w-2xl mx-auto">
            Une application complète et intuitive pour créer, gérer et suivre vos factures professionnelles. 
            Parfait pour les freelances et petites entreprises.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Button size="lg" asChild className="bg-indigo-600 hover:bg-blue-700 text-lg px-10 py-6 font-semibold shadow-lg">
              <Link href="/register">
                Commencer gratuitement
                <span className="ml-2">→</span>
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="text-lg px-10 py-6 border-2 border-gray-300 hover:bg-gray-50 font-medium">
              <Link href="/login">Se connecter</Link>
            </Button>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 text-xs">✓</span>
              </div>
              <span>Gratuit sans carte bancaire</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 text-xs">✓</span>
              </div>
              <span>Installation instantanée</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 text-xs">✓</span>
              </div>
              <span>Support réactif</span>
            </div>
          </div>
        </div>

        {/* Features Section with 3D Carousel */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Tout ce dont vous avez besoin
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Une interface claire et intuitive pour gérer efficacement votre facturation
            </p>
          </div>
          
          {/* Carrousel 3D centré et responsive */}
          <div className="relative w-full max-w-5xl mx-auto px-4">
            <InvoiceCarousel3D />
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-white rounded-2xl p-12 shadow-lg border border-gray-200">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Prêt à commencer ?
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-xl mx-auto">
            Rejoignez des milliers d'entrepreneurs qui simplifient leur gestion de factures.
          </p>
          <Button size="lg" asChild className="bg-indigo-600 hover:bg-blue-700 px-10 py-6 text-lg font-semibold shadow-lg">
            <Link href="/register">Créer mon compte gratuit →</Link>
          </Button>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-white mt-20">
        <div className="container mx-auto px-4 py-10 text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">
              F
            </div>
            <span className="text-xl font-bold text-gray-900">FAKTU</span>
          </div>
          <p className="text-gray-600">&copy; 2025 FAKTU. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  );
}
