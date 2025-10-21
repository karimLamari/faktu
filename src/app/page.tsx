import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold text-gray-900">
            📄 Invoice App
          </div>
          <div className="space-x-2">
            <Button variant="ghost" asChild>
              <Link href="/login">Connexion</Link>
            </Button>
            <Button asChild>
              <Link href="/register">S'inscrire</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Gérez vos factures en toute simplicité
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Une application complète pour créer, gérer et suivre vos factures professionnelles. 
            Parfait pour les freelances et petites entreprises.
          </p>
          <div className="space-x-4">
            <Button size="lg" asChild>
              <Link href="/register">Commencer gratuitement</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/login">Se connecter</Link>
            </Button>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">📝</span>
                Création facile
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Créez vos factures rapidement avec notre éditeur intuitif et la prévisualisation en temps réel.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">👥</span>
                Gestion clients
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Organisez vos clients et retrouvez facilement leurs informations et historique de facturation.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">📧</span>
                Envoi automatique
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Envoyez vos factures par email directement depuis l'application avec génération PDF automatique.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">📊</span>
                Suivi avancé
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Suivez le statut de vos factures, les paiements et obtenez des insights sur votre activité.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">🔒</span>
                Sécurisé
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Vos données sont protégées avec un chiffrement de niveau entreprise et des sauvegardes automatiques.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">📱</span>
                Responsive
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Accédez à votre application depuis n'importe quel appareil avec notre design entièrement responsive.
              </CardDescription>
            </CardContent>
          </Card>
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
          <p>&copy; 2024 Invoice App. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  );
}
