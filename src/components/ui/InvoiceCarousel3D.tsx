'use client';

import React from 'react';

const features = [
  { emoji: '📝', color: '142, 249, 252', title: 'Création facile' },
  { emoji: '👥', color: '142, 252, 204', title: 'Gestion clients' },
  { emoji: '📧', color: '142, 252, 157', title: 'Envoi auto' },
  { emoji: '📊', color: '215, 252, 142', title: 'Suivi avancé' },
  { emoji: '🔒', color: '252, 252, 142', title: 'Sécurisé' },
  { emoji: '📱', color: '252, 208, 142', title: 'Responsive' },
  { emoji: '💼', color: '252, 142, 142', title: 'Pro' },
  { emoji: '⚡', color: '252, 142, 239', title: 'Rapide' },
  { emoji: '🎨', color: '204, 142, 252', title: 'Design' },
  { emoji: '🚀', color: '142, 202, 252', title: 'Moderne' },
];

const InvoiceCarousel3D = () => {
  return (
    <div className="w-full min-h-[400px] md:h-[500px] lg:h-[600px] relative flex items-center justify-center overflow-visible py-8">
      <style jsx>{`
        @keyframes rotating {
          from {
            transform: perspective(1200px) rotateX(-15deg) rotateY(0);
          }
          to {
            transform: perspective(1200px) rotateX(-15deg) rotateY(360deg);
          }
        }

        .carousel-inner {
          position: relative;
          width: 100px;
          height: 150px;
          transform-style: preserve-3d;
          animation: rotating 25s linear infinite;
        }

        @media (min-width: 640px) {
          .carousel-inner {
            width: 120px;
            height: 180px;
          }
        }

        @media (min-width: 1024px) {
          .carousel-inner {
            width: 140px;
            height: 200px;
          }
        }

        .carousel-wrapper {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .carousel-wrapper:hover .carousel-inner {
          animation-play-state: paused;
        }

        .carousel-card {
          position: absolute;
          width: 100%;
          height: 100%;
          border: 2px solid rgba(var(--color-card), 0.4);
          border-radius: 16px;
          overflow: hidden;
          transform: rotateY(calc((360deg / 10) * var(--index))) 
                     translateZ(200px);
          transition: all 0.3s ease;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }

        @media (min-width: 640px) {
          .carousel-card {
            transform: rotateY(calc((360deg / 10) * var(--index))) 
                       translateZ(250px);
          }
        }

        @media (min-width: 1024px) {
          .carousel-card {
            transform: rotateY(calc((360deg / 10) * var(--index))) 
                       translateZ(300px);
          }
        }

        .carousel-card:hover {
          border-width: 3px;
          box-shadow: 0 10px 30px rgba(var(--color-card), 0.3);
        }

        .card-bg {
          position: absolute;
          inset: 0;
          background: radial-gradient(
            circle at center,
            rgba(var(--color-card), 0.1) 0%,
            rgba(var(--color-card), 0.3) 50%,
            rgba(var(--color-card), 0.6) 100%
          );
        }

        .card-emoji {
          font-size: 2rem;
          margin-bottom: 0.5rem;
          filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1));
          position: relative;
          z-index: 1;
        }

        @media (min-width: 640px) {
          .card-emoji {
            font-size: 2.5rem;
          }
        }

        @media (min-width: 1024px) {
          .card-emoji {
            font-size: 3rem;
          }
        }

        .card-title {
          font-size: 0.75rem;
          font-weight: 600;
          color: rgba(var(--color-card), 1);
          text-align: center;
          position: relative;
          z-index: 1;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          filter: brightness(0.5);
          padding: 0 0.5rem;
        }

        @media (min-width: 640px) {
          .card-title {
            font-size: 0.875rem;
          }
        }

        @keyframes shine {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }

        .card-shine {
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.3),
            transparent
          );
          animation: shine 3s infinite;
        }
      `}</style>

      <div className="carousel-wrapper">
        <div className="carousel-inner">
          {features.map((feature, index) => (
            <div
              key={index}
              className="carousel-card"
              style={
                {
                  '--color-card': feature.color,
                  '--index': index,
                } as React.CSSProperties
              }
            >
              <div className="card-bg" />
              <div className="card-shine" />
              <div className="card-emoji">{feature.emoji}</div>
              <div className="card-title">{feature.title}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default InvoiceCarousel3D;
