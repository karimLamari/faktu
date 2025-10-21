"use client";
import { useEffect, useState } from 'react';

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

  // Calculs
  const totalCA = invoices.filter(i => i.status === 'paid' || i.status === 'partially_paid').reduce((sum, i) => sum + (i.total || 0), 0);
  const pendingCount = invoices.filter(i => i.status === 'sent' || i.status === 'pending' || i.status === 'overdue').length;
  const lastInvoices = invoices.slice(0, 5);

  if (loading) {
    return <div className="min-h-[200px] flex items-center justify-center text-gray-400">Chargement du tableau de bord…</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="text-sm text-gray-500">Chiffre d'affaires</div>
          <div className="text-2xl font-bold">€{totalCA.toLocaleString('fr-FR', { minimumFractionDigits: 2 })}</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="text-sm text-gray-500">Factures en attente</div>
          <div className="text-2xl font-bold">{pendingCount}</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="text-sm text-gray-500">Clients</div>
          <div className="text-2xl font-bold">{clients.length}</div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow border">
        <h2 className="text-lg font-semibold mb-4">Dernières factures</h2>
        <div className="space-y-2">
          {lastInvoices.length === 0 && <div className="text-gray-400">Aucune facture récente.</div>}
          {lastInvoices.map((inv) => (
            <div key={inv._id} className="flex items-center justify-between border-b last:border-b-0 py-2">
              <div>
                <div className="font-medium">Facture #{inv.invoiceNumber || inv._id}</div>
                <div className="text-sm text-gray-500">Client: {inv.clientName || inv.clientId}</div>
              </div>
              <div className="text-right">
                <div className="font-semibold">€{(inv.total || 0).toLocaleString('fr-FR', { minimumFractionDigits: 2 })}</div>
                <div className={`text-sm ${inv.status === 'paid' ? 'text-green-600' : inv.status === 'overdue' ? 'text-red-600' : 'text-gray-500'}`}>{inv.status}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
