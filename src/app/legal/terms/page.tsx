import Link from 'next/link';
import { SpaceBackground } from '@/components/ui/SpaceBackground';
import { ArrowLeft } from 'lucide-react';
import Image from 'next/image';

export default function TermsPage() {
  return (
    <SpaceBackground variant="subtle">
      <div className="min-h-screen py-12 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Link 
              href="/" 
              className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 font-medium transition-colors mb-6"
            >
              <ArrowLeft className="w-4 h-4" />
              Retour à l'accueil
            </Link>
            
            <div className="flex items-center gap-4 mb-4">
              <Image src="/icons/blink_logo.png" alt="Blink Logo" width={48} height={48} className="w-12 h-12" />
              <h1 className="text-4xl font-bold text-white">Conditions Générales d'Utilisation</h1>
            </div>
            <p className="text-gray-400">Dernière mise à jour : 5 novembre 2025</p>
          </div>

          {/* Content */}
          <div className="bg-gray-900/80 backdrop-blur-lg rounded-2xl border border-gray-700/50 p-8 space-y-8 text-gray-300">
            
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">1. Objet</h2>
              <p className="leading-relaxed">
                Les présentes Conditions Générales d'Utilisation (ci-après « CGU ») ont pour objet de définir les modalités et conditions d'utilisation du service BLINK, accessible à l'adresse <a href="https://blink.quxly.fr" className="text-blue-400 hover:text-blue-300 underline">https://blink.quxly.fr</a>, permettant la gestion de facturation, devis et dépenses pour entrepreneurs, freelances et TPE.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">2. Acceptation des CGU</h2>
              <p className="leading-relaxed">
                L'accès et l'utilisation du service BLINK impliquent l'acceptation pleine et entière des présentes CGU. En vous inscrivant, vous déclarez avoir pris connaissance de ces conditions et les accepter sans réserve.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">3. Description du service</h2>
              <p className="leading-relaxed mb-4">
                BLINK est une plateforme SaaS (Software as a Service) offrant les fonctionnalités suivantes :
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Création et gestion de factures conformes</li>
                <li>Création et gestion de devis</li>
                <li>Gestion des dépenses avec OCR (reconnaissance optique de caractères)</li>
                <li>Gestion de la base clients</li>
                <li>Envoi d'emails automatiques et rappels de paiement (plan Pro)</li>
                <li>Personnalisation de templates de factures</li>
                <li>Statistiques et tableaux de bord</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">4. Inscription et compte utilisateur</h2>
              <h3 className="text-xl font-semibold text-white mb-3 mt-4">4.1 Création de compte</h3>
              <p className="leading-relaxed mb-4">
                Pour utiliser BLINK, vous devez créer un compte en fournissant des informations exactes et à jour (prénom, nom, email). Vous êtes responsable de la confidentialité de vos identifiants de connexion.
              </p>
              
              <h3 className="text-xl font-semibold text-white mb-3 mt-4">4.2 Responsabilité du compte</h3>
              <p className="leading-relaxed">
                Vous êtes seul responsable de l'utilisation de votre compte et des actions effectuées via celui-ci. En cas d'utilisation non autorisée, vous devez nous en informer immédiatement à l'adresse : <a href="mailto:support@blink.quxly.fr" className="text-blue-400 hover:text-blue-300 underline">support@blink.quxly.fr</a>
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">5. Plans et tarification</h2>
              <h3 className="text-xl font-semibold text-white mb-3 mt-4">5.1 Plan Gratuit</h3>
              <p className="leading-relaxed mb-4">
                Le plan gratuit permet de créer jusqu'à 5 factures, 5 devis et 5 dépenses OCR par mois, avec un maximum de 5 clients et 1 modèle de facture.
              </p>
              
              <h3 className="text-xl font-semibold text-white mb-3 mt-4">5.2 Plan Pro (10€/mois ou 100€/an)</h3>
              <p className="leading-relaxed mb-4">
                Le plan Pro permet de créer jusqu'à 50 factures, 50 devis et 50 dépenses OCR par mois, avec clients et modèles illimités, ainsi que l'accès aux fonctionnalités avancées (envoi email automatique, rappels, statistiques).
              </p>
              
              <h3 className="text-xl font-semibold text-white mb-3 mt-4">5.3 Plan Business (bientôt disponible)</h3>
              <p className="leading-relaxed">
                Le plan Business offrira toutes les fonctionnalités en illimité, ainsi que des fonctionnalités supplémentaires (lien de paiement en ligne, OCR performant, export comptable).
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">6. Paiement et résiliation</h2>
              <h3 className="text-xl font-semibold text-white mb-3 mt-4">6.1 Modalités de paiement</h3>
              <p className="leading-relaxed mb-4">
                Les paiements sont effectués via Stripe. Vous pouvez annuler votre abonnement à tout moment depuis votre espace de facturation. L'annulation prendra effet à la fin de la période de facturation en cours.
              </p>
              
              <h3 className="text-xl font-semibold text-white mb-3 mt-4">6.2 Remboursement</h3>
              <p className="leading-relaxed">
                Nous offrons une garantie satisfait ou remboursé de 30 jours. Si vous n'êtes pas satisfait, contactez-nous pour obtenir un remboursement complet.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">7. Propriété intellectuelle</h2>
              <p className="leading-relaxed">
                Tous les éléments du service BLINK (design, textes, graphismes, logo, logiciels) sont la propriété exclusive de BLINK et sont protégés par les lois sur la propriété intellectuelle. Toute reproduction ou utilisation non autorisée est interdite.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">8. Données personnelles</h2>
              <p className="leading-relaxed">
                Vos données personnelles sont traitées conformément à notre <Link href="/legal/privacy" className="text-blue-400 hover:text-blue-300 underline">Politique de Confidentialité</Link> et au RGPD. Nous ne vendons ni ne louons vos données à des tiers.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">9. Limitation de responsabilité</h2>
              <p className="leading-relaxed">
                BLINK ne peut être tenu responsable des dommages directs ou indirects résultant de l'utilisation ou de l'impossibilité d'utiliser le service, sauf en cas de faute lourde ou de manquement délibéré.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">10. Modifications des CGU</h2>
              <p className="leading-relaxed">
                BLINK se réserve le droit de modifier les présentes CGU à tout moment. Les utilisateurs seront informés par email des modifications importantes. L'utilisation continue du service après modification vaut acceptation des nouvelles CGU.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">11. Droit applicable et juridiction</h2>
              <p className="leading-relaxed">
                Les présentes CGU sont soumises au droit français. En cas de litige, les parties s'engagent à rechercher une solution amiable. À défaut, les tribunaux français seront seuls compétents.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">12. Contact</h2>
              <p className="leading-relaxed">
                Pour toute question relative aux présentes CGU, vous pouvez nous contacter à l'adresse : <a href="mailto:legal@blink.quxly.fr" className="text-blue-400 hover:text-blue-300 underline">legal@blink.quxly.fr</a>
              </p>
            </section>

          </div>
        </div>
      </div>
    </SpaceBackground>
  );
}
