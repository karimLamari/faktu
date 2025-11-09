import React from 'react';
import { Notification as NotificationType } from '@/hooks/useNotification';
import { FiCheckCircle, FiXCircle, FiAlertTriangle, FiInfo, FiX } from 'react-icons/fi';

interface NotificationProps {
  notification: NotificationType;
  onClose?: () => void;
}

/**
 * Composant de notification réutilisable
 * Compatible avec le hook useNotification
 */
export function Notification({ notification, onClose }: NotificationProps) {
  const bgColor = {
    success: 'bg-green-50 border-green-500',
    error: 'bg-red-50 border-red-500',
    warning: 'bg-yellow-50 border-yellow-500',
    info: 'bg-blue-50 border-blue-500',
  }[notification.type];

  const textColor = {
    success: 'text-green-800',
    error: 'text-red-800',
    warning: 'text-yellow-800',
    info: 'text-blue-800',
  }[notification.type];

  const IconComponent = {
    success: FiCheckCircle,
    error: FiXCircle,
    warning: FiAlertTriangle,
    info: FiInfo,
  }[notification.type];

  return (
    <div className={`border-l-4 p-4 rounded-lg animate-fade-in ${bgColor}`}>
      <div className="flex items-center justify-between">
        <p className={`flex items-center gap-2 font-medium ${textColor}`}>
          <IconComponent className="w-5 h-5 flex-shrink-0" />
          {notification.message}
        </p>
        {onClose && (
          <button
            onClick={onClose}
            className={`ml-4 ${textColor} hover:opacity-70 transition-opacity`}
          >
            <FiX className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
