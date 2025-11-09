import Link from 'next/link';
import { SpaceBackground } from '@/components/ui/SpaceBackground';
import { ArrowLeft } from 'lucide-react';
import Image from 'next/image';

export default function PrivacyPage() {
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
              <h1 className="text-4xl font-bold text-white">Politique de Confidentialité</h1>
            </div>
            <p className="text-gray-400">Dernière mise à jour : 5 novembre 2025</p>
          </div>

          {/* Content */}
          <div className="bg-gray-900/80 backdrop-blur-lg rounded-2xl border border-gray-700/50 p-8 space-y-8 text-gray-300">
            
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">1. Introduction</h2>
              <p className="leading-relaxed">
                BLINK s'engage à protéger la vie privée de ses utilisateurs. Cette Politique de Confidentialité décrit comment nous collectons, utilisons, stockons et protégeons vos données personnelles conformément au Règlement Général sur la Protection des Données (RGPD) et à la loi Informatique et Libertés.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">2. Responsable du traitement</h2>
              <p className="leading-relaxed">
                Le responsable du traitement des données est :<br />
                <strong className="text-white">BLINK</strong><br />
                Email : <a href="mailto:dpo@blink.quxly.fr" className="text-blue-400 hover:text-blue-300 underline">dpo@blink.quxly.fr</a>
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">3. Données collectées</h2>
              <h3 className="text-xl font-semibold text-white mb-3 mt-4">3.1 Données d'inscription</h3>
              <ul className="list-disc list-inside space-y-2 ml-4 mb-4">
                <li>Prénom et nom</li>
                <li>Adresse email</li>
                <li>Mot de passe (hashé et sécurisé)</li>
              </ul>
              
              <h3 className="text-xl font-semibold text-white mb-3 mt-4">3.2 Données de profil professionnel</h3>
              <ul className="list-disc list-inside space-y-2 ml-4 mb-4">
                <li>Raison sociale</li>
                <li>Forme juridique</li>
                <li>SIRET</li>
                <li>Adresse professionnelle</li>
                <li>Téléphone</li>
                <li>Coordonnées bancaires (IBAN)</li>
                <li>Logo d'entreprise</li>
                <li>Numéro de TVA intracommunautaire</li>
              </ul>
              
              <h3 className="text-xl font-semibold text-white mb-3 mt-4">3.3 Données d'utilisation</h3>
              <ul className="list-disc list-inside space-y-2 ml-4 mb-4">
                <li>Factures, devis et dépenses créés</li>
                <li>Clients enregistrés</li>
                <li>Templates de factures personnalisés</li>
                <li>Historique des emails envoyés</li>
                <li>Photos de tickets/reçus (OCR)</li>
              </ul>
              
              <h3 className="text-xl font-semibold text-white mb-3 mt-4">3.4 Données techniques</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Adresse IP</li>
                <li>Informations de navigation (cookies)</li>
                <li>Type de navigateur et appareil</li>
                <li>Données de connexion et logs d'erreurs</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">4. Finalités du traitement</h2>
              <p className="leading-relaxed mb-4">Vos données sont utilisées pour :</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong className="text-white">Fourniture du service</strong> : gestion de votre compte, génération de factures/devis, stockage de vos données</li>
                <li><strong className="text-white">Amélioration du service</strong> : analyse d'utilisation, correction de bugs, développement de nouvelles fonctionnalités</li>
                <li><strong className="text-white">Communication</strong> : envoi d'emails transactionnels (confirmations, alertes), newsletters (avec consentement)</li>
                <li><strong className="text-white">Facturation</strong> : gestion des abonnements et paiements via Stripe</li>
                <li><strong className="text-white">Conformité légale</strong> : respect des obligations comptables et fiscales</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">5. Base légale du traitement</h2>
              <p className="leading-relaxed mb-4">Le traitement de vos données repose sur :</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong className="text-white">L'exécution du contrat</strong> (CGU) pour la fourniture du service</li>
                <li><strong className="text-white">Le consentement</strong> pour les newsletters et cookies non essentiels</li>
                <li><strong className="text-white">L'intérêt légitime</strong> pour l'amélioration du service et la sécurité</li>
                <li><strong className="text-white">Les obligations légales</strong> pour la conservation des données comptables</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">6. Partage des données</h2>
              <p className="leading-relaxed mb-4">
                Nous ne vendons ni ne louons vos données personnelles. Vos données peuvent être partagées avec :
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong className="text-white">Stripe</strong> : pour le traitement des paiements</li>
                <li><strong className="text-white">MongoDB Atlas</strong> : pour l'hébergement de la base de données</li>
                <li><strong className="text-white">Services d'emailing</strong> : pour l'envoi d'emails transactionnels</li>
                <li><strong className="text-white">Autorités légales</strong> : en cas d'obligation légale</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">7. Durée de conservation</h2>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong className="text-white">Données de compte</strong> : pendant la durée d'utilisation du service + 3 ans après suppression du compte</li>
                <li><strong className="text-white">Données de facturation</strong> : 10 ans (obligation légale comptable)</li>
                <li><strong className="text-white">Logs techniques</strong> : 12 mois</li>
                <li><strong className="text-white">Cookies</strong> : 13 mois maximum</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">8. Sécurité des données</h2>
              <p className="leading-relaxed mb-4">
                Nous mettons en œuvre des mesures de sécurité techniques et organisationnelles pour protéger vos données :
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Chiffrement SSL/TLS pour les communications</li>
                <li>Hashage des mots de passe avec bcrypt</li>
                <li>Accès aux données restreint et contrôlé</li>
                <li>Sauvegardes régulières et chiffrées</li>
                <li>Authentification NextAuth sécurisée</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">9. Vos droits</h2>
              <p className="leading-relaxed mb-4">
                Conformément au RGPD, vous disposez des droits suivants :
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4 mb-4">
                <li><strong className="text-white">Droit d'accès</strong> : obtenir une copie de vos données</li>
                <li><strong className="text-white">Droit de rectification</strong> : corriger vos données inexactes</li>
                <li><strong className="text-white">Droit à l'effacement</strong> : supprimer vos données (sous conditions)</li>
                <li><strong className="text-white">Droit à la limitation</strong> : limiter le traitement de vos données</li>
                <li><strong className="text-white">Droit à la portabilité</strong> : recevoir vos données dans un format structuré</li>
                <li><strong className="text-white">Droit d'opposition</strong> : vous opposer au traitement de vos données</li>
                <li><strong className="text-white">Droit de retirer le consentement</strong> : pour les traitements basés sur le consentement</li>
              </ul>
              <p className="leading-relaxed">
                Pour exercer ces droits, contactez-nous à : <a href="mailto:dpo@blink.quxly.fr" className="text-blue-400 hover:text-blue-300 underline">dpo@blink.quxly.fr</a>
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">10. Cookies</h2>
              <p className="leading-relaxed mb-4">
                Nous utilisons des cookies pour :
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4 mb-4">
                <li><strong className="text-white">Cookies essentiels</strong> : authentification, session utilisateur (obligatoires)</li>
                <li><strong className="text-white">Cookies analytiques</strong> : statistiques d'utilisation (avec consentement)</li>
              </ul>
              <p className="leading-relaxed">
                Vous pouvez gérer vos préférences de cookies depuis les paramètres de votre navigateur.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">11. Transferts internationaux</h2>
              <p className="leading-relaxed">
                Vos données sont hébergées sur des serveurs MongoDB Atlas situés en Europe (région eu-west-1). Stripe (processeur de paiement) peut transférer des données hors UE avec des garanties appropriées (clauses contractuelles types).
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">12. Modifications de la politique</h2>
              <p className="leading-relaxed">
                Nous pouvons mettre à jour cette politique de confidentialité. Les modifications importantes vous seront notifiées par email. La date de dernière mise à jour est indiquée en haut de cette page.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">13. Réclamations</h2>
              <p className="leading-relaxed">
                Si vous estimez que vos droits ne sont pas respectés, vous pouvez introduire une réclamation auprès de la CNIL (Commission Nationale de l'Informatique et des Libertés) : <a href="https://www.cnil.fr" className="text-blue-400 hover:text-blue-300 underline" target="_blank" rel="noopener noreferrer">www.cnil.fr</a>
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">14. Contact</h2>
              <p className="leading-relaxed">
                Pour toute question concernant cette politique de confidentialité :<br />
                Email DPO : <a href="mailto:dpo@blink.quxly.fr" className="text-blue-400 hover:text-blue-300 underline">dpo@blink.quxly.fr</a><br />
                Support : <a href="mailto:support@blink.quxly.fr" className="text-blue-400 hover:text-blue-300 underline">support@blink.quxly.fr</a>
              </p>
            </section>

          </div>
        </div>
      </div>
    </SpaceBackground>
  );
}
