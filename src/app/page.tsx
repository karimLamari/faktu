import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Check, Sparkles, Zap, Crown, FileText, Receipt, Scan, Users,
  Mail, Clock, TrendingUp, Shield, Smartphone, ArrowRight, Star,
  BarChart3, MessageCircle, ChevronRight, X, DollarSign, Calendar,
  CheckCircle2
} from 'lucide-react';
import Image from 'next/image';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { SpaceBackground } from '@/components/ui/SpaceBackground';
import { PricingCard } from '@/components/landing/PricingCard';
import { PLANS } from '@/lib/subscription/plans';

export default function HomePage() {
  return (
    <SpaceBackground variant="default">
      {/* Header */}
      <header className="border-b border-white/10 bg-gray-950/80 backdrop-blur-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="w-14 h-14 rounded-xl flex items-center justify-center">
              <Image 
                src="/icons/blink_logo.png" 
                alt="Blink Logo" 
                width={56} 
                height={56} 
                className="w-14 h-14"
                priority
              />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
              BLINK
            </span>
          </Link>
          <div className="flex gap-2 md:gap-3">
            <Button variant="ghost" asChild className="font-medium hover:bg-gray-800 text-gray-200 hover:text-white text-sm md:text-base">
              <Link href="/login">Connexion</Link>
            </Button>
            <Button asChild className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 font-semibold shadow-lg hover:shadow-blue-500/50 transition-all text-white text-sm md:text-base px-3 md:px-4">
              <Link href="/register" className="flex items-center gap-1 md:gap-2">
                <span className="hidden sm:inline">Commencer gratuitement</span>
                <span className="sm:hidden">Commencer</span>
                <ArrowRight className="w-3 h-3 md:w-4 md:h-4" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main>
        <section className="container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 text-blue-200 rounded-full text-sm font-semibold border border-blue-400/30 shadow-sm instant-slide-down backdrop-blur-sm">
                <Sparkles className="w-4 h-4 text-blue-300 animate-pulse-subtle" />
                <span>Gagnez jusqu'à 10h par mois sur votre facturation</span>
              </div>

              {/* Titre principal */}
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight instant-fade-scale">
                La performance,
                <span className="relative inline-block mx-3">
                  <span className="relative z-10 bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                    sans la perte
                  </span>
                  <span className="absolute bottom-2 left-0 w-full h-3 bg-blue-500/30 -z-10 animate-shimmer"></span>
                </span>
                <br className="hidden md:block" />
                de temps.
              </h1>

              {/* Sous-titre */}
              <p className="text-lg md:text-xl text-gray-300 mb-10 leading-relaxed max-w-3xl mx-auto instant-slide-up stagger-1">
                Blink automatise votre facturation de A à Z : <strong className="text-white">créez, envoyez et suivez vos factures</strong> instantanément. 
                Scannez vos reçus, relancez vos clients automatiquement et concentrez-vous sur votre métier.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12 instant-slide-up stagger-2">
                <Button size="lg" asChild className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-lg px-8 py-7 font-semibold shadow-2xl hover:shadow-blue-500/50 transition-all text-white animate-glow">
                  <Link href="/register">
                    <Zap className="w-5 h-5 mr-2" />
                    Démarrer gratuitement
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="text-lg px-8 py-7 border-2 border-blue-400/30 hover:bg-blue-500/10 font-semibold hover:border-blue-400/60 transition-all text-blue-200 hover:text-white bg-gray-900/50 backdrop-blur-sm">
                  <Link href="#features">
                    Découvrir les fonctionnalités
                  </Link>
                </Button>
              </div>

              {/* Social Proof */}
              <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-gray-400 instant-slide-up stagger-3">
                <div className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-600" />
                  <span className="font-medium">100% gratuit pour débuter</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-600" />
                  <span className="font-medium">Sans carte bancaire</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-600" />
                  <span className="font-medium">Installation en 2 minutes</span>
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mt-16">
              <ScrollReveal className="scroll-zoom" delay={100}>
                <Card className="border-2 border-blue-500/30 bg-gradient-to-br from-blue-950/80 to-gray-900/80 shadow-lg hover:shadow-blue-500/20 transition-shadow hover-lift backdrop-blur-sm">
                  <CardContent className="pt-6 text-center">
                    <div className="text-4xl font-bold text-blue-400 mb-2">10h</div>
                    <p className="text-gray-300 font-medium">économisées par mois</p>
                  </CardContent>
                </Card>
              </ScrollReveal>
              <ScrollReveal className="scroll-zoom" delay={200}>
                <Card className="border-2 border-indigo-500/30 bg-gradient-to-br from-indigo-950/80 to-gray-900/80 shadow-lg hover:shadow-indigo-500/20 transition-shadow hover-lift backdrop-blur-sm">
                  <CardContent className="pt-6 text-center">
                    <div className="text-4xl font-bold text-indigo-400 mb-2">30s</div>
                    <p className="text-gray-300 font-medium">pour créer une facture</p>
                  </CardContent>
                </Card>
              </ScrollReveal>
              <ScrollReveal className="scroll-zoom" delay={300}>
                <Card className="border-2 border-purple-500/30 bg-gradient-to-br from-purple-950/80 to-gray-900/80 shadow-lg hover:shadow-purple-500/20 transition-shadow hover-lift backdrop-blur-sm">
                  <CardContent className="pt-6 text-center">
                    <div className="text-4xl font-bold text-purple-400 mb-2">0€</div>
                    <p className="text-gray-300 font-medium">pour commencer</p>
                  </CardContent>
                </Card>
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* Problem/Solution Section */}
        <section className="bg-gradient-to-br from-gray-900/50 to-blue-900/20 py-20 border-y border-white/10 backdrop-blur-sm">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <ScrollReveal className="scroll-fade-up">
                <div className="text-center mb-16">
                  <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
                    Vous perdez un temps fou avec la facturation ?
                  </h2>
                  <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                    Nous comprenons. C'est exactement pour ça que Blink existe.
                  </p>
                </div>
              </ScrollReveal>

              <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
                {/* Avant - Problèmes */}
                <ScrollReveal className="scroll-fade-right">
                  <div className="space-y-6">
                    <h3 className="text-2xl font-bold text-red-400 mb-6 flex items-center gap-2">
                      <X className="w-6 h-6" />
                      Sans Blink
                    </h3>
                    {[
                      "30 min pour créer une facture sur Word/Excel",
                      "Relances clients manuelles et oubliées",
                      "Reçus papier perdus ou mal classés",
                      "Suivis dans des tableurs désorganisés",
                      "Erreurs de calcul et oublis fréquents"
                    ].map((problem, i) => (
                      <div key={i} className="flex items-start gap-3 p-4 bg-red-950/40 border border-red-500/30 rounded-xl backdrop-blur-sm">
                        <div className="w-6 h-6 bg-red-900/50 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <X className="w-4 h-4 text-red-400" />
                        </div>
                        <p className="text-gray-300">{problem}</p>
                      </div>
                    ))}
                  </div>
                </ScrollReveal>

                {/* Après - Solutions */}
                <ScrollReveal className="scroll-fade-left" delay={200}>
                  <div className="space-y-6">
                    <h3 className="text-2xl font-bold text-green-400 mb-6 flex items-center gap-2">
                      <Check className="w-6 h-6" />
                      Avec Blink
                    </h3>
                    {[
                      "Facture créée en 30 secondes chrono",
                      "Relances automatiques programmées",
                      "Scan OCR des reçus instantané",
                      "Tableau de bord centralisé et clair",
                      "Calculs automatiques, zéro erreur"
                    ].map((solution, i) => (
                      <div key={i} className="flex items-start gap-3 p-4 bg-green-950/40 border border-green-500/30 rounded-xl hover:shadow-lg hover:shadow-green-500/20 transition-shadow backdrop-blur-sm">
                        <div className="w-6 h-6 bg-green-900/50 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Check className="w-4 h-4 text-green-400" />
                        </div>
                        <p className="text-gray-200 font-medium">{solution}</p>
                      </div>
                    ))}
                  </div>
                </ScrollReveal>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <ScrollReveal className="scroll-fade-up">
                <div className="text-center mb-16">
                  <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
                    Tout pour gérer votre activité
                  </h2>
                  <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                    Une suite complète d'outils pensés pour les entrepreneurs, freelances et TPE
                  </p>
                </div>
              </ScrollReveal>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {/* Feature Cards */}
                {[
                  {
                    icon: FileText,
                    color: "blue",
                    title: "Factures professionnelles",
                    description: "Créez des factures conformes en quelques clics. Modèles personnalisables, numérotation automatique, et envoi par email."
                  },
                  {
                    icon: Receipt,
                    color: "indigo",
                    title: "Devis rapides",
                    description: "Transformez vos devis en factures d'un clic. Suivez les acceptations et relancez automatiquement."
                  },
                  {
                    icon: Scan,
                    color: "purple",
                    title: "OCR des dépenses",
                    description: "Photographiez vos tickets et reçus. L'OCR extrait automatiquement les données (montant, date, fournisseur)."
                  },
                  {
                    icon: Users,
                    color: "green",
                    title: "Gestion clients",
                    description: "Base de données clients centralisée. Historique complet des factures et paiements par client."
                  },
                  {
                    icon: Mail,
                    color: "orange",
                    title: "Relances automatiques",
                    description: "Programmez des rappels de paiement automatiques. 3 niveaux : amicale, ferme, dernière chance."
                  },
                  {
                    icon: BarChart3,
                    color: "pink",
                    title: "Statistiques en temps réel",
                    description: "Tableau de bord avec CA, impayés, taux de recouvrement. Visualisez votre activité d'un coup d'œil."
                  }
                ].map((feature, i) => (
                  <ScrollReveal key={i} className="scroll-zoom" delay={i * 100}>
                    <Card className="border-2 border-blue-500/20 bg-gray-900/60 hover:border-blue-400/50 hover:shadow-2xl hover:shadow-blue-500/20 transition-all group cursor-pointer hover-lift h-full backdrop-blur-sm">
                      <CardContent className="pt-6">
                        <div className={`w-14 h-14 bg-gradient-to-br from-${feature.color}-500 to-${feature.color}-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
                          <feature.icon className="w-7 h-7 text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                        <p className="text-gray-300 leading-relaxed">{feature.description}</p>
                      </CardContent>
                    </Card>
                  </ScrollReveal>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="py-20 border-y border-white/10">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <ScrollReveal className="scroll-fade-up">
                <div className="text-center mb-16">
                  <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
                    Tarifs simples et transparents
                  </h2>
                  <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                    Commencez gratuitement, passez à Pro quand vous êtes prêt. Sans engagement.
                  </p>
                </div>
              </ScrollReveal>

              <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
                {/* Plan Gratuit */}
                <ScrollReveal className="scroll-zoom" delay={0}>
                  <PricingCard
                    plan={PLANS.free}
                    planKey="free"
                    ctaText="Commencer gratuitement"
                    ctaHref="/register"
                  />
                </ScrollReveal>

                {/* Plan Pro - HIGHLIGHTED */}
                <ScrollReveal className="scroll-zoom" delay={100}>
                  <PricingCard
                    plan={PLANS.pro}
                    planKey="pro"
                    highlighted
                    badge="🔥 Recommandé"
                    ctaText="Commencer maintenant"
                    ctaHref="/register"
                  />
                </ScrollReveal>

                {/* Plan Business - BIENTÔT */}
                <ScrollReveal className="scroll-zoom" delay={200}>
                  <PricingCard
                    plan={PLANS.business}
                    planKey="business"
                    topRightBadge="🚀 BIENTÔT"
                    ctaText="Bientôt disponible"
                    ctaHref="/register"
                    disabled
                    className="relative overflow-hidden"
                  />
                </ScrollReveal>
              </div>

              <ScrollReveal className="scroll-fade-up" delay={300}>
                <p className="text-center text-gray-400 mt-12 text-sm">
                  💳 <strong className="text-gray-300">Aucune carte bancaire</strong> requise pour commencer • Changez ou annulez à tout moment
                </p>
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900 py-20 text-white relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 left-10 w-64 h-64 bg-blue-500 rounded-full blur-3xl animate-float"></div>
            <div className="absolute bottom-10 right-10 w-96 h-96 bg-indigo-500 rounded-full blur-3xl animate-float" style={{animationDelay: '1s'}}></div>
          </div>

          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <ScrollReveal className="scroll-fade-up">
                <div className="inline-block mb-6">
                  <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full border border-white/20">
                    <Shield className="w-5 h-5 text-green-300" />
                    <span className="font-semibold">100% sécurisé et conforme RGPD</span>
                  </div>
                </div>

                <h2 className="text-4xl md:text-6xl font-bold mb-6">
                  Rejoignez les entrepreneurs qui facturent en
                  <span className="text-blue-300"> 30 secondes</span>
                </h2>

                <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto leading-relaxed">
                  Plus de <strong className="text-white">10 heures économisées</strong> par mois. 
                  Plus de <strong className="text-white">30% d'impayés en moins</strong>. 
                  Commencez maintenant, gratuitement.
                </p>
              </ScrollReveal>

              <ScrollReveal className="scroll-zoom" delay={200}>
                <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
                  <Button size="lg" asChild className="bg-white text-blue-900 hover:bg-blue-50 text-lg px-10 py-7 font-bold shadow-2xl hover:shadow-white/20 transition-all">
                    <Link href="/register">
                      <Zap className="w-5 h-5 mr-2" />
                      Créer mon compte gratuit
                    </Link>
                  </Button>
                  <Button size="lg" asChild variant="outline" className="text-lg px-10 py-7 border-2 border-white/30 hover:bg-white/10 font-semibold text-white">
                    <Link href="/dashboard/pricing">Voir les tarifs</Link>
                  </Button>
                </div>
              </ScrollReveal>


            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-gray-950/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-4 gap-8 mb-8">
              {/* Brand */}
              <div className="col-span-2 md:col-span-1">
                <Link href="/" className="flex items-center gap-2 mb-4">
                  <div className="w-12 h-12  rounded-xl flex items-center justify-center shadow-lg">
                    <Image src="/icons/blink_logo.png" alt="Blink Logo" width={48} height={48} className="w-12 h-12" />
                  </div>
                  <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                    BLINK
                  </span>
                </Link>
                <p className="text-gray-400 text-sm leading-relaxed">
                  La solution de facturation qui vous fait gagner 10h par mois.
                </p>
              </div>

              {/* Product */}
              <div>
                <h3 className="font-bold text-white mb-4">Produit</h3>
                <ul className="space-y-2 text-sm">
                  <li><Link href="#features" className="text-gray-400 hover:text-blue-400">Fonctionnalités</Link></li>
                  <li><Link href="/dashboard/pricing" className="text-gray-400 hover:text-blue-400">Tarifs</Link></li>
                  <li><Link href="/register" className="text-gray-400 hover:text-blue-400">Essai gratuit</Link></li>
                </ul>
              </div>

              {/* Company */}
              <div>
                <h3 className="font-bold text-white mb-4">Entreprise</h3>
                <ul className="space-y-2 text-sm">
                  <li><a href="#" className="text-gray-400 hover:text-blue-400">À propos</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-blue-400">Blog</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-blue-400">Contact</a></li>
                </ul>
              </div>

              {/* Legal */}
              <div>
                <h3 className="font-bold text-white mb-4">Légal</h3>
                <ul className="space-y-2 text-sm">
                  <li><a href="#" className="text-gray-400 hover:text-blue-400">CGU</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-blue-400">Confidentialité</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-blue-400">Mentions légales</a></li>
                </ul>
              </div>
            </div>

            {/* Bottom */}
            <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-gray-400 text-sm">
                © 2025 Blink. Tous droits réservés.
              </p>
              <div className="flex gap-4">
                <a href="#" className="text-gray-500 hover:text-blue-400 transition-colors">
                  <MessageCircle className="w-5 h-5" />
                </a>
                <a href="#" className="text-gray-500 hover:text-blue-400 transition-colors">
                  <Mail className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </SpaceBackground>
  );
}