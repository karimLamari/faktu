'use client';

import { useMemo } from 'react';

interface PasswordStrengthIndicatorProps {
  password: string;
  className?: string;
}

type StrengthLevel = {
  level: 0 | 1 | 2 | 3 | 4;
  label: string;
  color: string;
  bgColor: string;
  textColor: string;
};

export function PasswordStrengthIndicator({ password, className = '' }: PasswordStrengthIndicatorProps) {
  const strength = useMemo((): StrengthLevel => {
    if (!password) {
      return {
        level: 0,
        label: '',
        color: 'bg-gray-700',
        bgColor: 'bg-gray-800/50',
        textColor: 'text-gray-500',
      };
    }

    let score = 0;

    // Longueur (max 2 points)
    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;

    // Contient des minuscules
    if (/[a-z]/.test(password)) score += 1;

    // Contient des majuscules
    if (/[A-Z]/.test(password)) score += 1;

    // Contient des chiffres
    if (/[0-9]/.test(password)) score += 1;

    // Contient des caractères spéciaux
    if (/[^a-zA-Z0-9]/.test(password)) score += 1;

    // Normaliser le score sur 4 niveaux
    const normalizedScore = Math.min(Math.floor(score / 1.5), 4) as 0 | 1 | 2 | 3 | 4;

    switch (normalizedScore) {
      case 1:
        return {
          level: 1,
          label: 'Très faible',
          color: 'bg-red-500',
          bgColor: 'bg-red-900/30',
          textColor: 'text-red-400',
        };
      case 2:
        return {
          level: 2,
          label: 'Faible',
          color: 'bg-orange-500',
          bgColor: 'bg-orange-900/30',
          textColor: 'text-orange-400',
        };
      case 3:
        return {
          level: 3,
          label: 'Moyen',
          color: 'bg-yellow-500',
          bgColor: 'bg-yellow-900/30',
          textColor: 'text-yellow-400',
        };
      case 4:
        return {
          level: 4,
          label: 'Fort',
          color: 'bg-green-500',
          bgColor: 'bg-green-900/30',
          textColor: 'text-green-400',
        };
      default:
        return {
          level: 0,
          label: '',
          color: 'bg-gray-700',
          bgColor: 'bg-gray-800/50',
          textColor: 'text-gray-500',
        };
    }
  }, [password]);

  if (!password) return null;

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Barres de progression */}
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((bar) => (
          <div
            key={bar}
            className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
              bar <= strength.level ? strength.color : 'bg-gray-700'
            }`}
          />
        ))}
      </div>

      {/* Label + conseils */}
      <div className="flex items-center justify-between text-xs">
        <span className={`font-medium ${strength.textColor}`}>
          {strength.label && `Force : ${strength.label}`}
        </span>
        {strength.level < 3 && (
          <span className="text-gray-500">
            {strength.level === 1 && 'Ajoutez des chiffres et symboles'}
            {strength.level === 2 && 'Ajoutez des majuscules et symboles'}
          </span>
        )}
      </div>

      {/* Critères détaillés (optionnel, affiché si mot de passe faible) */}
      {strength.level > 0 && strength.level < 3 && (
        <div className={`text-xs p-2 rounded-md ${strength.bgColor} border border-gray-700/50 space-y-1`}>
          <p className="font-semibold text-gray-300 mb-1.5">Pour renforcer :</p>
          <div className="grid grid-cols-2 gap-x-3 gap-y-1">
            <span className={/[a-z]/.test(password) ? 'text-green-400' : 'text-gray-500'}>
              ✓ Minuscules
            </span>
            <span className={/[A-Z]/.test(password) ? 'text-green-400' : 'text-gray-500'}>
              ✓ Majuscules
            </span>
            <span className={/[0-9]/.test(password) ? 'text-green-400' : 'text-gray-500'}>
              ✓ Chiffres
            </span>
            <span className={/[^a-zA-Z0-9]/.test(password) ? 'text-green-400' : 'text-gray-500'}>
              ✓ Symboles (!@#$)
            </span>
            <span className={password.length >= 12 ? 'text-green-400' : 'text-gray-500'}>
              ✓ 12+ caractères
            </span>
          </div>
        </div>
      )}

      {/* Message de succès si fort */}
      {strength.level === 4 && (
        <div className={`text-xs p-2 rounded-md ${strength.bgColor} border border-green-700/50`}>
          <span className="text-green-400 font-medium">✓ Excellent mot de passe !</span>
        </div>
      )}
    </div>
  );
}
