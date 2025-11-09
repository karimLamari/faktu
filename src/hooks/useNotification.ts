import { useState, useCallback, useEffect } from 'react';

export type NotificationType = 'success' | 'error' | 'info' | 'warning';

export interface Notification {
  id: string;
  message: string;
  type: NotificationType;
  duration?: number;
}

export interface UseNotificationResult {
  notification: Notification | null;
  showNotification: (message: string, type?: NotificationType, duration?: number) => void;
  showSuccess: (message: string, duration?: number) => void;
  showError: (message: string, duration?: number) => void;
  showInfo: (message: string, duration?: number) => void;
  showWarning: (message: string, duration?: number) => void;
  clearNotification: () => void;
}

/**
 * Hook pour gérer les notifications temporaires avec auto-dismiss
 * Remplace les multiples useState pour les messages de succès/erreur
 * 
 * @example
 * const { showSuccess, showError, notification } = useNotification();
 * 
 * // Usage:
 * showSuccess('Devis créé avec succès');
 * showError('Erreur lors de la suppression');
 * 
 * // Affichage:
 * {notification && <Notification {...notification} />}
 */
export function useNotification(defaultDuration = 3000): UseNotificationResult {
  const [notification, setNotification] = useState<Notification | null>(null);

  const clearNotification = useCallback(() => {
    setNotification(null);
  }, []);

  const showNotification = useCallback(
    (message: string, type: NotificationType = 'info', duration = defaultDuration) => {
      const id = Date.now().toString();
      setNotification({ id, message, type, duration });
    },
    [defaultDuration]
  );

  const showSuccess = useCallback(
    (message: string, duration = defaultDuration) => {
      showNotification(message, 'success', duration);
    },
    [showNotification, defaultDuration]
  );

  const showError = useCallback(
    (message: string, duration = defaultDuration) => {
      showNotification(message, 'error', duration);
    },
    [showNotification, defaultDuration]
  );

  const showInfo = useCallback(
    (message: string, duration = defaultDuration) => {
      showNotification(message, 'info', duration);
    },
    [showNotification, defaultDuration]
  );

  const showWarning = useCallback(
    (message: string, duration = defaultDuration) => {
      showNotification(message, 'warning', duration);
    },
    [showNotification, defaultDuration]
  );

  // Auto-dismiss après la durée spécifiée
  useEffect(() => {
    if (notification && notification.duration) {
      const timer = setTimeout(() => {
        clearNotification();
      }, notification.duration);

      return () => clearTimeout(timer);
    }
  }, [notification, clearNotification]);

  return {
    notification,
    showNotification,
    showSuccess,
    showError,
    showInfo,
    showWarning,
    clearNotification,
  };
}
