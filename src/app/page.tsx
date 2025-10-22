import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import InvoiceCarousel3D from '@/components/ui/InvoiceCarousel3D';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            📄 FAKTU
          </div>
          <div className="space-x-2">
            <Button variant="ghost" asChild>
              <Link href="/login">Connexion</Link>
            </Button>
            <Button asChild className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              <Link href="/register">S'inscrire</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16">
        <div className="text-center mb-20">
          <div className="inline-block mb-4 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
            ✨ Solution de facturation moderne
          </div>
          <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Gérez vos factures en toute
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> simplicité</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 leading-relaxed max-w-3xl mx-auto">
            Une application complète et intuitive pour créer, gérer et suivre vos factures professionnelles. 
            Parfait pour les freelances et petites entreprises qui veulent gagner du temps.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg px-8">
              <Link href="/register">
                Commencer gratuitement
                <span className="ml-2">→</span>
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="text-lg px-8 border-2">
              <Link href="/login">Se connecter</Link>
            </Button>
          </div>
          <p className="text-sm text-gray-500 mt-6">
            ✓ Aucune carte bancaire requise  •  ✓ Essai gratuit  •  ✓ Support 24/7
          </p>
        </div>

        {/* Features Section with 3D Carousel */}
        <div className="mb-20">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              Tout ce dont vous avez besoin
            </h2>

          </div>
          
          {/* Carrousel 3D centré et responsive */}
          <div className="relative w-full max-w-4xl mx-auto px-4">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 opacity-10 blur-3xl rounded-full"></div>
            <div className="relative z-10">
              <InvoiceCarousel3D />
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-white rounded-2xl p-12 shadow-lg">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Prêt à commencer ?
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Rejoignez des milliers d'entrepreneurs qui font confiance à notre solution.
          </p>
          <Button size="lg" asChild>
            <Link href="/register">Créer mon compte gratuit</Link>
          </Button>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-white mt-16">
        <div className="container mx-auto px-4 py-8 text-center text-gray-600">
          <p>&copy; 2025 FAKTU. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  );
}
