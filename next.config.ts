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
    domains: ['localhost'],
    unoptimized: process.env.NODE_ENV !== 'production',
  },
};

export default nextConfig;
