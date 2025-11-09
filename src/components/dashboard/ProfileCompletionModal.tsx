'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  isProfileComplete,
  getMissingProfileFields,
  getProfileCompletionPercentage,
} from '@/lib/utils/profile';

interface ProfileCompletionModalProps {
  user: any;
  onClose?: () => void;
}

/**
 * Modal affiché au login si le profil utilisateur est incomplet
 * Bloque certaines actions (PDF, email) tant que le profil n'est pas complété
 *
 * Champs requis pour un profil complet:
 * - Raison sociale (companyName)
 * - Forme juridique (legalForm)
 * - Adresse (address.street)
 * - Ville (address.city)
 * - Code postal (address.zipCode)
 */
export function ProfileCompletionModal({ user, onClose }: ProfileCompletionModalProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [hasClosedOnce, setHasClosedOnce] = useState(false);

  const profileComplete = isProfileComplete(user);
  const missingFields = getMissingProfileFields(user);
  const completionPercentage = getProfileCompletionPercentage(user);

  useEffect(() => {
    // Vérifier si l'utilisateur a déjà fermé le modal dans cette session
    const sessionKey = `profile-modal-closed-${user?._id}`;
    const hasClosedInSession = sessionStorage.getItem(sessionKey);

    // Afficher le modal si:
    // 1. Le profil est incomplet
    // 2. L'utilisateur n'a pas fermé le modal dans cette session
    if (!profileComplete && !hasClosedInSession) {
      // Attendre 500ms pour un meilleur UX (éviter le flash)
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [profileComplete, user]);

  const handleClose = () => {
    setIsOpen(false);
    setHasClosedOnce(true);

    // Mémoriser que l'utilisateur a fermé le modal (session)
    if (user?._id) {
      sessionStorage.setItem(`profile-modal-closed-${user._id}`, 'true');
    }

    onClose?.();
  };

  const handleCompleteProfile = () => {
    // Rediriger vers la page de paramètres du profil
    router.push('/dashboard/settings/profile');
    handleClose();
  };

  // Ne rien afficher si le profil est complet ou si le modal est fermé
  if (!isOpen || profileComplete) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in p-4">
      <div className="bg-gray-900/95 backdrop-blur-lg rounded-2xl shadow-2xl border border-gray-700/50 w-full max-w-lg max-h-[90vh] overflow-y-auto animate-slide-in-up">
        {/* Header avec gradient */}
        <div className="bg-gradient-to-r from-orange-600 to-red-600 p-6 text-white relative rounded-t-2xl">
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white hover:bg-white/10 p-2 rounded-lg transition-colors"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-white/20 rounded-xl">
              <AlertCircle className="w-7 h-7" />
            </div>
            <h2 className="text-2xl font-bold">Profil incomplet</h2>
          </div>
          <p className="text-orange-100 text-sm">
            Complétez votre profil pour accéder à toutes les fonctionnalités
          </p>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Complétion du profil</span>
              <span className="text-white font-semibold">{completionPercentage}%</span>
            </div>
            <div className="w-full h-3 bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-orange-500 to-red-500 transition-all duration-500 ease-out"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          </div>

          {/* Blocked Features Warning */}
          <div className="bg-red-900/20 border border-red-700/50 rounded-xl p-4 space-y-2">
            <h3 className="text-sm font-semibold text-red-400 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Fonctionnalités bloquées
            </h3>
            <ul className="text-sm text-gray-300 space-y-1 ml-6">
              <li className="list-disc">Génération de PDF</li>
              <li className="list-disc">Envoi d'emails automatiques</li>
              <li className="list-disc">Rappels de paiement</li>
            </ul>
          </div>

          {/* Missing Fields */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-white">
              Champs manquants ({missingFields.length})
            </h3>
            <div className="space-y-2">
              {missingFields.map((field, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg border border-gray-700/50"
                >
                  <div className="w-5 h-5 bg-orange-900/30 border border-orange-700/50 rounded-full flex items-center justify-center flex-shrink-0">
                    <X className="w-3 h-3 text-orange-400" />
                  </div>
                  <span className="text-sm text-gray-300">{field}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Benefits of completion */}
          <div className="bg-blue-900/20 border border-blue-700/50 rounded-xl p-4 space-y-2">
            <h3 className="text-sm font-semibold text-blue-400 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Après complétion
            </h3>
            <ul className="text-sm text-gray-300 space-y-1 ml-6">
              <li className="list-disc">Générez des factures PDF professionnelles</li>
              <li className="list-disc">Envoyez automatiquement vos factures par email</li>
              <li className="list-disc">Activez les rappels de paiement automatiques</li>
              <li className="list-disc">Accédez à toutes les fonctionnalités</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-700/50 bg-gray-800/50 space-y-3">
          <Button
            onClick={handleCompleteProfile}
            className="w-full h-12 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white text-base font-semibold shadow-lg shadow-orange-500/20"
          >
            Compléter mon profil maintenant
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>

          <button
            onClick={handleClose}
            className="w-full py-2 text-sm text-gray-400 hover:text-gray-300 transition-colors"
          >
            Peut-être plus tard
          </button>

          <p className="text-xs text-center text-gray-500 mt-2">
            Vous pourrez compléter votre profil à tout moment dans les paramètres
          </p>
        </div>
      </div>
    </div>
  );
}
