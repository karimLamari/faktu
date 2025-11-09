'use client';

import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { PlanBadge } from '@/components/subscription/PlanBadge';
import { useSubscription } from '@/hooks/useSubscription';
import { SpaceBackground } from '@/components/ui/SpaceBackground';
import Image from 'next/image';
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  Settings, 
  LogOut,
  Menu,
  X,
  Sparkles,
  FileSpreadsheet,
  Receipt,
  Palette,
  CreditCard,
  Zap
} from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const navigationItems = [
  {
    name: 'Tableau de bord',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: 'Clients',
    href: '/dashboard/clients',
    icon: Users,
  },
    {
    name: 'Factures',
    href: '/dashboard/invoices',
    icon: FileText,
  },

  {
    name: 'Devis',
    href: '/dashboard/quotes',
    icon: FileSpreadsheet,
  },

  {
    name: 'Prestations',
    href: '/dashboard/services',
    icon: Sparkles,
  },
  {
    name: 'Dépenses',
    href: '/dashboard/expenses',
    icon: Receipt,
  },
  {
    name: 'Modèles de facture',
    href: '/dashboard/settings/invoice-templates',
    icon: Palette,
  },
  {
    name: 'Tarifs',
    href: '/dashboard/pricing',
    icon: Zap,
  },
  {
    name: 'Facturation',
    href: '/dashboard/billing',
    icon: CreditCard,
  },
  {
    name: 'Paramètres',
    href: '/dashboard/settings',
    icon: Settings,
  },
];

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { data: subscriptionData } = useSubscription();

  // Fonction pour vider le cache du Service Worker lors de la déconnexion
  const handleLogout = async () => {
    try {
      // Vider le cache du Service Worker
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        const messageChannel = new MessageChannel();
        
        messageChannel.port1.onmessage = (event) => {
          console.log('[Client] Cache vidé:', event.data);
        };
        
        navigator.serviceWorker.controller.postMessage(
          { type: 'CLEAR_CACHE' },
          [messageChannel.port2]
        );
      }
      
      // Vider le localStorage/sessionStorage
      localStorage.clear();
      sessionStorage.clear();
      
    } catch (error) {
      console.error('[Client] Erreur lors du nettoyage:', error);
    } finally {
      // Déconnexion
      signOut({ callbackUrl: '/' });
    }
  };

  return (
    <SpaceBackground variant="subtle">
      <div className="min-h-screen">
        {/* Sidebar pour mobile */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden animate-fade-in">
            <div 
              className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm" 
              onClick={() => setSidebarOpen(false)} 
            />
            <div className="fixed inset-y-0 left-0 w-72 bg-gray-900/95 backdrop-blur-lg flex flex-col shadow-2xl animate-slide-in-right border-r border-gray-700/50">
            {/* Mobile Header */}
            <div className=" p-4 flex items-center justify-between border-b border-gray-700/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-md">
                  <Image 
                    src="/icons/blink_logo.png" 
                    alt="Blink Logo" 
                    width={32} 
                    height={32} 
                    className="w-8 h-8"
                    priority
                  />
                </div>
                <span className="text-xl font-bold text-white tracking-tight">BLINK</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(false)}
                className="text-white hover:bg-white/20"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Mobile Navigation */}
            <nav className="mt-6 flex-1 overflow-y-auto px-3 space-y-1">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`
                      group flex items-center px-4 py-3.5 text-sm font-semibold rounded-xl
                      transition-all duration-200
                      ${isActive
                        ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg shadow-blue-500/50'
                        : 'text-gray-200 hover:bg-gray-800/50'
                      }
                    `}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <Icon className={`w-5 h-5 mr-3 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Mobile Logout */}
            <div className="p-4 border-t border-gray-700/50">
              <Button
                variant="ghost"
                className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-xl font-medium"
                onClick={() => {
                  setSidebarOpen(false);
                  handleLogout();
                }}
              >
                <LogOut className="w-5 h-5 mr-3" />
                Déconnexion
              </Button>
            </div>
          </div>
        </div>
        )}

        {/* Sidebar pour desktop */}
        <div className="hidden lg:flex lg:w-72 lg:flex-col lg:fixed lg:inset-y-0 z-40">
          <div className="flex flex-col flex-grow bg-gray-900/95 backdrop-blur-lg shadow-2xl border-r border-gray-700/50">
            {/* Desktop Header */}
            <div className=" p-6 border-b border-gray-700/50">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg">
                  <Image 
                    src="/icons/blink_logo.png" 
                    alt="Blink Logo" 
                    width={56} 
                    height={56} 
                    className="w-20 h-20"
                    priority
                  />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white tracking-tight">BLINK</h1>
                  <p className="text-xs text-blue-100">Gestion de factures</p>
                </div>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="mt-6 flex-1 px-4 space-y-1 overflow-y-auto">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`
                      group flex items-center px-4 py-3.5 text-sm font-semibold rounded-xl
                      transition-all duration-200
                      ${isActive
                        ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg shadow-blue-500/50'
                        : 'text-gray-200 hover:bg-gray-800/50'
                      }
                    `}
                  >
                    <Icon className={`w-5 h-5 mr-3 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>

            {/* User info & logout */}
            <div className="p-4 border-t border-gray-700/50">
              <div className="mb-3 px-3 py-2.5 bg-gray-800/50 rounded-xl border border-gray-700/50">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-gray-400">Plan actuel</p>
                  {subscriptionData && <PlanBadge plan={subscriptionData.plan} size="sm" />}
                </div>
                <p className="text-xs text-gray-400 mb-1">Connecté en tant que</p>
                <p className="text-sm font-semibold text-gray-100 truncate">{session?.user?.name}</p>
                <p className="text-xs text-gray-400 truncate">{session?.user?.email}</p>
              </div>
              <Button
                variant="ghost"
                className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-xl font-medium"
                onClick={handleLogout}
              >
                <LogOut className="w-5 h-5 mr-3" />
                Déconnexion
              </Button>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="lg:pl-72">
          {/* Top bar */}
          <div className="sticky top-0 z-30 bg-gray-900/80 backdrop-blur-lg border-b border-gray-700/50 shadow-xl">
            <div className="flex items-center justify-between h-16 px-6">
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden hover:bg-gray-800/50 rounded-xl text-gray-200"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="w-5 h-5" />
              </Button>
              <div className="flex items-center gap-4">
                <div className="hidden lg:block">
                  <h2 className="text-lg font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                    {navigationItems.find(item => item.href === pathname)?.name || 'Dashboard'}
                  </h2>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-green-900/30 rounded-full border border-green-700/50">
                  <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-sm font-medium text-green-400">En ligne</span>
                </div>
              </div>
            </div>
          </div>

          {/* Page content */}
          <main className="p-6">
            {children}
          </main>
        </div>
      </div>
    </SpaceBackground>
  );
}