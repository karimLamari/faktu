import type { Metadata, Viewport } from "next";
import SessionProvider from "@/components/providers/SessionProvider";
import PWAInstaller from "@/components/providers/PWAInstaller";
import "./globals.css";

// Utiliser des variables CSS sans télécharger de fonts pour éviter les problèmes Docker
// Les fonts seront chargées via CSS avec des fallbacks système

// Viewport configuration (Next.js 15+)
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: "#3B82F6",
};

export const metadata: Metadata = {
  title: "BLINK - Gestion de Factures",
  description: "Application complète de gestion de factures pour freelances et petites entreprises",
  applicationName: "BLINK",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "BLINK",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    other: [
      { url: "/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/android-chrome-512x512.png", sizes: "512x512", type: "image/png" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <head>
        <meta name="theme-color" content="#3B82F6" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="BLINK" />
      </head>
      <body className="antialiased">
        <SessionProvider>
          {children}
          <PWAInstaller />
        </SessionProvider>
      </body>
    </html>
  );
}
