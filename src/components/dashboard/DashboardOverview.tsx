"use client";
import { useEffect, useState } from 'react';
import StatsCard from './StatsCard';
import { TrendingUp, Clock, Users, AlertCircle, CheckCircle, FileText } from 'lucide-react';
import Link from 'next/link';

export default function DashboardOverview() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const [invRes, cliRes] = await Promise.all([
        fetch('/api/invoices'),
        fetch('/api/clients'),
      ]);
      const invData = await invRes.json();
      const cliData = await cliRes.json();
      setInvoices(Array.isArray(invData) ? invData : invData || []);
      setClients(Array.isArray(cliData) ? cliData : cliData || []);
      setLoading(false);
    }
    fetchData();
  }, []);

  // Calculs enrichis
  const totalCA = invoices.filter(i => i.paymentStatus === 'paid' || i.paymentStatus === 'partially_paid').reduce((sum, i) => sum + (i.total || 0), 0);
  const pendingAmount = invoices.filter(i => i.paymentStatus === 'pending' || i.paymentStatus === 'overdue').reduce((sum, i) => sum + (i.total || 0), 0);
  const pendingCount = invoices.filter(i => i.paymentStatus === 'pending' || i.paymentStatus === 'overdue').length;
  const overdueCount = invoices.filter(i => i.paymentStatus === 'overdue').length;
  const paidCount = invoices.filter(i => i.paymentStatus === 'paid').length;
  const lastInvoices = invoices.slice(0, 6);

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500 animate-pulse-subtle">Chargement du tableau de bord...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Statistiques */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* CA Total */}
        <div className="group bg-white rounded-2xl p-4 sm:p-6 shadow-md hover:shadow-lg transition-all duration-200 border border-gray-200">
          <div className="flex items-start justify-between mb-3">
            <div className="p-2 sm:p-3 bg-indigo-600 rounded-xl shadow-md">
              <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full border border-green-200">+12%</span>
          </div>
          <h3 className="text-xs sm:text-sm font-medium text-gray-600 mb-1">Chiffre d'affaires</h3>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
            {totalCA.toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} €
          </p>
          <p className="text-xs text-gray-500">{paidCount} facture{paidCount > 1 ? 's' : ''} payée{paidCount > 1 ? 's' : ''}</p>
        </div>

        {/* En attente */}
        <div className="group bg-white rounded-2xl p-4 sm:p-6 shadow-md hover:shadow-lg transition-all duration-200 border border-gray-200">
          <div className="flex items-start justify-between mb-3">
            <div className="p-2 sm:p-3 bg-orange-500 rounded-xl shadow-md">
              <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
          </div>
          <h3 className="text-xs sm:text-sm font-medium text-gray-600 mb-1">En attente</h3>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
            {pendingAmount.toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} €
          </p>
          <p className="text-xs text-gray-500">{pendingCount} facture{pendingCount > 1 ? 's' : ''}</p>
        </div>

        {/* En retard */}
        <div className="group bg-white rounded-2xl p-4 sm:p-6 shadow-md hover:shadow-lg transition-all duration-200 border border-gray-200">
          <div className="flex items-start justify-between mb-3">
            <div className="p-2 sm:p-3 bg-red-600 rounded-xl shadow-md">
              <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
          </div>
          <h3 className="text-xs sm:text-sm font-medium text-gray-600 mb-1">En retard</h3>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">{overdueCount}</p>
          <p className="text-xs text-gray-500">Nécessite relance</p>
        </div>

        {/* Clients */}
        <div className="group bg-white rounded-2xl p-4 sm:p-6 shadow-md hover:shadow-lg transition-all duration-200 border border-gray-200">
          <div className="flex items-start justify-between mb-3">
            <div className="p-2 sm:p-3 bg-indigo-600 rounded-xl shadow-md">
              <Users className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
          </div>
          <h3 className="text-xs sm:text-sm font-medium text-gray-600 mb-1">Clients actifs</h3>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">{clients.length}</p>
          <Link href="/dashboard/clients" className="text-xs text-blue-600 hover:text-blue-700 font-semibold">
            Voir tous →
          </Link>
        </div>
      </div>

      {/* Section factures récentes */}
      <div className="bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-semibold text-gray-900">Dernières factures</h2>
                <p className="text-xs sm:text-sm text-gray-500">{invoices.length} facture{invoices.length > 1 ? 's' : ''} au total</p>
              </div>
            </div>
            <Link href="/dashboard/invoices">
              <button className="text-xs sm:text-sm text-blue-600 hover:text-blue-700 font-medium hover:bg-blue-50 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg transition-colors">
                Voir toutes →
              </button>
            </Link>
          </div>
        </div>
        
        <div className="divide-y divide-gray-100">
          {lastInvoices.length === 0 && (
            <div className="p-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <FileText className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 mb-2">Aucune facture récente</p>
              <Link href="/dashboard/invoices">
                <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                  Créer une facture
                </button>
              </Link>
            </div>
          )}
          {lastInvoices.map((inv, index) => {
            const statusConfig = {
              draft: { color: 'bg-gray-100 text-gray-700', icon: '📝' },
              sent: { color: 'bg-blue-100 text-blue-700', icon: '📨' },
              paid: { color: 'bg-green-100 text-green-700', icon: '✅' },
              overdue: { color: 'bg-red-100 text-red-700', icon: '⚠️' },
              partially_paid: { color: 'bg-orange-100 text-orange-700', icon: '⏳' },
            };
            const config = statusConfig[inv.status as keyof typeof statusConfig] || statusConfig.draft;

            return (
              <Link 
                key={inv._id} 
                href="/dashboard/invoices"
                className="block hover:bg-gray-50 transition-colors animate-slide-in-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="p-3 sm:p-5 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-indigo-600 flex items-center justify-center text-white text-xs sm:text-base font-bold shadow-md flex-shrink-0">
                      #{String(inv.invoiceNumber).slice(-3)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <p className="font-semibold text-sm sm:text-base text-gray-900 truncate">Facture {inv.invoiceNumber}</p>
                        <span className={`text-xs px-2 py-1 rounded-full font-semibold border ${config.color} whitespace-nowrap`}>
                          {config.icon} {inv.status}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-gray-500 truncate">
                        Client: {inv.clientName || inv.clientId} • 
                        {inv.issueDate && ` Émise le ${new Date(inv.issueDate).toLocaleDateString('fr-FR')}`}
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-base sm:text-xl font-bold text-gray-900 whitespace-nowrap">
                      {(inv.total || 0).toLocaleString('fr-FR', { minimumFractionDigits: 0 })} €
                    </p>
                    {inv.dueDate && (
                      <p className="text-xs text-gray-500 hidden sm:block">
                        Échéance: {new Date(inv.dueDate).toLocaleDateString('fr-FR')}
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
