/**
 * SpaceBackground Component
 * 
 * Background d'espace avec étoiles animées et effets de nébuleuse
 * Utilisé pour créer une ambiance futuriste et moderne sur toute l'application
 * 
 * Features:
 * - 3 couches d'étoiles (petites, moyennes, grandes avec glow)
 * - Effets de nébuleuse flottants
 * - Animations pulse pour les étoiles
 * - Positions aléatoires générées avec seed fixe pour éviter hydration mismatch
 * 
 * Usage:
 * ```tsx
 * <SpaceBackground>
 *   <YourContent />
 * </SpaceBackground>
 * ```
 * 
 * Props:
 * - variant: 'default' | 'subtle' | 'intense' - Intensité de l'effet
 * - children: React.ReactNode - Contenu à afficher par-dessus le background
 * - className: string - Classes CSS supplémentaires pour le wrapper
 */

'use client';

import React, { useMemo } from 'react';

interface SpaceBackgroundProps {
  variant?: 'default' | 'subtle' | 'intense';
  children?: React.ReactNode;
  className?: string;
}

// Seeded random pour positions consistentes
function seededRandom(seed: number) {
  let x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
}

export const SpaceBackground: React.FC<SpaceBackgroundProps> = ({ 
  variant = 'default', 
  children,
  className = '' 
}) => {
  // Configuration selon le variant
  const config = {
    default: {
      starsSmall: 100,
      starsMedium: 50,
      starsLarge: 20,
      bgGradient: 'from-gray-950 via-blue-950 to-gray-950',
      nebulaOpacity: {
        first: 'bg-blue-600/20',
        second: 'bg-indigo-600/20',
        third: 'bg-purple-600/10'
      }
    },
    subtle: {
      starsSmall: 60,
      starsMedium: 30,
      starsLarge: 10,
      bgGradient: 'from-gray-950 via-gray-900 to-gray-950',
      nebulaOpacity: {
        first: 'bg-blue-600/10',
        second: 'bg-indigo-600/10',
        third: 'bg-purple-600/5'
      }
    },
    intense: {
      starsSmall: 150,
      starsMedium: 80,
      starsLarge: 30,
      bgGradient: 'from-blue-950 via-indigo-950 to-purple-950',
      nebulaOpacity: {
        first: 'bg-blue-600/30',
        second: 'bg-indigo-600/30',
        third: 'bg-purple-600/20'
      }
    }
  };

  const settings = config[variant];

  // Générer les positions des étoiles une seule fois avec seed fixe
  const starsData = useMemo(() => {
    const generateStars = (count: number, seedOffset: number) => {
      return Array.from({ length: count }, (_, i) => {
        const baseSeed = seedOffset + i;
        // Arrondir à 4 décimales pour éviter les différences de précision SSR/Client
        return {
          left: Math.round(seededRandom(baseSeed * 4) * 10000) / 100,
          top: Math.round(seededRandom(baseSeed * 4 + 1) * 10000) / 100,
          animationDelay: Math.round(seededRandom(baseSeed * 4 + 2) * 3000) / 1000,
          animationDuration: Math.round((2 + seededRandom(baseSeed * 4 + 3) * 3) * 1000) / 1000
        };
      });
    };

    return {
      small: generateStars(settings.starsSmall, 1000),
      medium: generateStars(settings.starsMedium, 2000),
      large: generateStars(settings.starsLarge, 3000)
    };
  }, [settings.starsSmall, settings.starsMedium, settings.starsLarge]);

  return (
    <div className={`min-h-screen bg-gradient-to-b ${settings.bgGradient} relative overflow-hidden ${className}`}>
      {/* Space Background Effect */}
      <div className="fixed inset-0 z-0">
        {/* Stars Layer 1 - Small */}
        <div className="absolute inset-0 opacity-60">
          {starsData.small.map((star, i) => (
            <div
              key={`star-small-${i}`}
              className="absolute w-0.5 h-0.5 bg-white rounded-full animate-pulse"
              style={{
                left: `${star.left}%`,
                top: `${star.top}%`,
                animationDelay: `${star.animationDelay}s`,
                animationDuration: `${star.animationDuration}s`
              }}
            />
          ))}
        </div>
        
        {/* Stars Layer 2 - Medium */}
        <div className="absolute inset-0 opacity-40">
          {starsData.medium.map((star, i) => (
            <div
              key={`star-medium-${i}`}
              className="absolute w-1 h-1 bg-blue-200 rounded-full animate-pulse"
              style={{
                left: `${star.left}%`,
                top: `${star.top}%`,
                animationDelay: `${star.animationDelay}s`,
                animationDuration: `${star.animationDuration}s`
              }}
            />
          ))}
        </div>
        
        {/* Stars Layer 3 - Large Glow */}
        <div className="absolute inset-0 opacity-30">
          {starsData.large.map((star, i) => (
            <div
              key={`star-large-${i}`}
              className="absolute w-2 h-2 bg-indigo-300 rounded-full blur-sm animate-pulse"
              style={{
                left: `${star.left}%`,
                top: `${star.top}%`,
                animationDelay: `${star.animationDelay}s`,
                animationDuration: `${star.animationDuration}s`
              }}
            />
          ))}
        </div>
        
        {/* Nebula Effects */}
        <div className={`absolute top-20 left-10 w-96 h-96 ${settings.nebulaOpacity.first} rounded-full blur-3xl animate-float`}></div>
        <div 
          className={`absolute bottom-20 right-10 w-[500px] h-[500px] ${settings.nebulaOpacity.second} rounded-full blur-3xl animate-float`} 
          style={{animationDelay: '2s'}}
        ></div>
        <div 
          className={`absolute top-1/2 left-1/2 w-[600px] h-[600px] ${settings.nebulaOpacity.third} rounded-full blur-3xl animate-float`} 
          style={{animationDelay: '4s'}}
        ></div>
      </div>

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export default SpaceBackground;
