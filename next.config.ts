import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Active le mode standalone pour Docker
  output: 'standalone',
  
  // Optimisations pour la production
  reactStrictMode: true,
  
  // Ignorer ESLint pendant le build
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Gestion des images
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'blink.quxly.fr',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
};

export default nextConfig;
