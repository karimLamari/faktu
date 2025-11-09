import { auth } from '@/lib/auth/auth';
import { redirect } from 'next/navigation';
import { PricingTable } from '@/components/subscription/PricingTable';
import dbConnect from '@/lib/db/mongodb';
import User from '@/models/User';

export default async function PricingPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/login');
  }

  await dbConnect();
  const user = await User.findById(session.user.id);
  const currentPlan = user?.subscription?.plan || 'free';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-white">
          Choisissez le plan qui vous convient
        </h1>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
          Commencez gratuitement, passez à Pro quand vous êtes prêt. 
          Tous les plans incluent 14 jours d'essai gratuit.
        </p>
      </div>

      {/* Pricing Table */}
      <PricingTable currentPlan={currentPlan} />

      {/* Features Comparison */}
      <div className="mt-16 border-t border-gray-700 pt-12">
        <h2 className="text-2xl font-bold text-white text-center mb-8">
          Comparaison détaillée des fonctionnalités
        </h2>
        
        <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
          <div className="inline-block min-w-full align-middle">
            <table className="min-w-full divide-y divide-gray-700">
              <thead>
                <tr className="border-b-2 border-gray-700">
                  <th className="px-3 sm:px-6 py-4 text-left text-sm sm:text-base font-semibold text-white whitespace-nowrap">
                    Fonctionnalité
                  </th>
                  <th className="px-3 sm:px-6 py-4 text-center text-sm sm:text-base font-semibold text-white whitespace-nowrap">
                    Gratuit
                  </th>
                  <th className="px-3 sm:px-6 py-4 text-center text-sm sm:text-base font-semibold text-white bg-indigo-900/30 whitespace-nowrap">
                    Pro
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700/50">
                <tr className="hover:bg-gray-800/50 transition-colors">
                  <td className="px-3 sm:px-6 py-4 text-sm sm:text-base text-white">Factures par mois</td>
                  <td className="px-3 sm:px-6 py-4 text-sm sm:text-base text-center text-white">5</td>
                  <td className="px-3 sm:px-6 py-4 text-sm sm:text-base text-center text-white bg-indigo-900/20 font-semibold">50</td>
                </tr>
                <tr className="hover:bg-gray-800/50 transition-colors">
                  <td className="px-3 sm:px-6 py-4 text-sm sm:text-base text-white">Devis par mois</td>
                  <td className="px-3 sm:px-6 py-4 text-sm sm:text-base text-center text-white">5</td>
                  <td className="px-3 sm:px-6 py-4 text-sm sm:text-base text-center text-white bg-indigo-900/20 font-semibold">50</td>
                </tr>
                <tr className="hover:bg-gray-800/50 transition-colors">
                  <td className="px-3 sm:px-6 py-4 text-sm sm:text-base text-white">Dépenses par mois</td>
                  <td className="px-3 sm:px-6 py-4 text-sm sm:text-base text-center text-white">5</td>
                  <td className="px-3 sm:px-6 py-4 text-sm sm:text-base text-center text-white bg-indigo-900/20 font-semibold">50</td>
                </tr>
                <tr className="hover:bg-gray-800/50 transition-colors">
                  <td className="px-3 sm:px-6 py-4 text-sm sm:text-base text-white">Clients</td>
                  <td className="px-3 sm:px-6 py-4 text-sm sm:text-base text-center text-white">5</td>
                  <td className="px-3 sm:px-6 py-4 text-sm sm:text-base text-center text-white bg-indigo-900/20">Illimité</td>
                </tr>
                <tr className="hover:bg-gray-800/50 transition-colors">
                  <td className="px-3 sm:px-6 py-4 text-sm sm:text-base text-white">Modèles de factures</td>
                  <td className="px-3 sm:px-6 py-4 text-sm sm:text-base text-center text-white">1</td>
                  <td className="px-3 sm:px-6 py-4 text-sm sm:text-base text-center text-white bg-indigo-900/20">Illimité</td>
                </tr>
                <tr className="hover:bg-gray-800/50 transition-colors">
                  <td className="px-3 sm:px-6 py-4 text-sm sm:text-base text-white">Envoi email automatique</td>
                  <td className="px-3 sm:px-6 py-4 text-center text-red-400 text-xl">✗</td>
                  <td className="px-3 sm:px-6 py-4 text-center text-green-400 bg-indigo-900/20 text-xl">✓</td>
                </tr>
                <tr className="hover:bg-gray-800/50 transition-colors">
                  <td className="px-3 sm:px-6 py-4 text-sm sm:text-base text-white">Rappels de paiement</td>
                  <td className="px-3 sm:px-6 py-4 text-center text-red-400 text-xl">✗</td>
                  <td className="px-3 sm:px-6 py-4 text-center text-green-400 bg-indigo-900/20 text-xl">✓</td>
                </tr>
                <tr className="hover:bg-gray-800/50 transition-colors">
                  <td className="px-3 sm:px-6 py-4 text-sm sm:text-base text-white">Statistiques avancées</td>
                  <td className="px-3 sm:px-6 py-4 text-center text-red-400 text-xl">✗</td>
                  <td className="px-3 sm:px-6 py-4 text-center text-green-400 bg-indigo-900/20 text-xl">✓</td>
                </tr>
                <tr className="hover:bg-gray-800/50 transition-colors">
                  <td className="px-3 sm:px-6 py-4 text-sm sm:text-base text-white">Signature électronique</td>
                  <td className="px-3 sm:px-6 py-4 text-center text-red-400 text-xl">✗</td>
                  <td className="px-3 sm:px-6 py-4 text-center text-green-400 bg-indigo-900/20 text-xl">✓</td>
                </tr>
                <tr className="hover:bg-gray-800/50 transition-colors">
                  <td className="px-3 sm:px-6 py-4 text-sm sm:text-base text-white">Export CSV comptable (FEC)</td>
                  <td className="px-3 sm:px-6 py-4 text-center text-red-400 text-xl">✗</td>
                  <td className="px-3 sm:px-6 py-4 text-center text-green-400 bg-indigo-900/20 text-xl">✓</td>
                </tr>
                <tr className="hover:bg-gray-800/50 transition-colors">
                  <td className="px-3 sm:px-6 py-4 text-sm sm:text-base text-white">Reconnaissance automatique factures</td>
                  <td className="px-3 sm:px-6 py-4 text-center text-yellow-400 text-sm">📸 Basique (70%)</td>
                  <td className="px-3 sm:px-6 py-4 text-center text-green-400 bg-indigo-900/20 text-sm font-semibold">🤖 IA Google Vision (95%)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div className="mt-16 border-t border-gray-700 pt-12">
        <h2 className="text-2xl font-bold text-white text-center mb-8">
          Questions fréquentes
        </h2>
        
        <div className="max-w-3xl mx-auto space-y-6">
          <details className="group">
            <summary className="flex justify-between items-center cursor-pointer list-none p-4 bg-indigo-900/30 rounded-lg hover:bg-gray-700/50">
              <span className="font-semibold text-white">Puis-je changer de plan à tout moment ?</span>
              <span className="transition group-open:rotate-180">
                <svg fill="none" height="24" shapeRendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
              </span>
            </summary>
            <p className="text-gray-400 mt-3 px-4 pb-4">
              Oui, vous pouvez passer à un plan supérieur ou inférieur à tout moment. Les changements prennent effet immédiatement.
            </p>
          </details>

          <details className="group">
            <summary className="flex justify-between items-center cursor-pointer list-none p-4 bg-gray-800/50 rounded-lg hover:bg-gray-700/50">
              <span className="font-semibold text-white">Comment fonctionne l'essai gratuit ?</span>
              <span className="transition group-open:rotate-180">
                <svg fill="none" height="24" shapeRendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
              </span>
            </summary>
            <p className="text-gray-400 mt-3 px-4 pb-4">
              Les plans Pro et Business incluent 14 jours d'essai gratuit. Aucune carte bancaire n'est requise pendant l'essai. Vous serez facturé uniquement si vous décidez de continuer après l'essai.
            </p>
          </details>

          <details className="group">
            <summary className="flex justify-between items-center cursor-pointer list-none p-4 bg-gray-800/50 rounded-lg hover:bg-gray-700/50">
              <span className="font-semibold text-white">Puis-je annuler mon abonnement ?</span>
              <span className="transition group-open:rotate-180">
                <svg fill="none" height="24" shapeRendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
              </span>
            </summary>
            <p className="text-gray-400 mt-3 px-4 pb-4">
              Oui, vous pouvez annuler à tout moment depuis votre page de facturation. L'annulation prend effet à la fin de votre période de facturation en cours.
            </p>
          </details>

          <details className="group">
            <summary className="flex justify-between items-center cursor-pointer list-none p-4 bg-gray-800/50 rounded-lg hover:bg-gray-700/50">
              <span className="font-semibold text-white">Proposez-vous des remboursements ?</span>
              <span className="transition group-open:rotate-180">
                <svg fill="none" height="24" shapeRendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
              </span>
            </summary>
            <p className="text-gray-400 mt-3 px-4 pb-4">
              Oui, nous offrons une garantie satisfait ou remboursé de 30 jours. Si vous n'êtes pas satisfait, contactez-nous pour un remboursement complet.
            </p>
          </details>
        </div>
      </div>

      {/* Trust Signals */}
      <div className="text-center text-sm text-gray-500 pt-8 border-t border-gray-700">
        <p>Tous les plans incluent : SSL sécurisé • Sauvegarde quotidienne • Support par email</p>
      </div>
    </div>
  );
}
