'use client';

import { useEffect, useState } from 'react';

export default function PWAInstaller() {
  const [isInstallable, setIsInstallable] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Vérifier si déjà installé
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      console.log('✅ PWA déjà installée');
    }

    // Enregistrer le Service Worker
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((registration) => {
            console.log('✅ Service Worker enregistré:', registration.scope);

            // Vérifier les mises à jour toutes les heures
            setInterval(() => {
              registration.update();
            }, 60 * 60 * 1000);
          })
          .catch((error) => {
            console.error('❌ Erreur Service Worker:', error);
          });
      });
    }

    // Écouter l'événement d'installation
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
      console.log('📱 Installation PWA disponible');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Détecter l'installation
    window.addEventListener('appinstalled', () => {
      console.log('✅ PWA installée avec succès');
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    console.log(`📱 Installation: ${outcome}`);
    
    setDeferredPrompt(null);
    setIsInstallable(false);
  };

  // Bannière d'installation (optionnelle)
  if (isInstallable && !isInstalled) {
    return (
      <div className="fixed bottom-4 right-4 z-50 bg-white rounded-xl shadow-lg border border-gray-200 p-4 max-w-sm animate-slide-up">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold flex-shrink-0">
            F
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-1">
              Installer FAKTU
            </h3>
            <p className="text-sm text-gray-600 mb-3">
              Accédez rapidement à vos factures depuis votre écran d'accueil
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleInstallClick}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                Installer
              </button>
              <button
                onClick={() => setIsInstallable(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
              >
                Plus tard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
