"use client";

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Building2, Mail, Phone, MapPin, User, Calendar, FileText, Euro, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

interface Client {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: {
    street?: string;
    city?: string;
    zipCode?: string;
    country?: string;
  };
  companyInfo?: {
    legalName?: string;
    siret?: string;
  };
  createdAt?: string;
}

interface Invoice {
  _id: string;
  invoiceNumber: string;
  status: string;
  paymentStatus: string;
  total: number;
  issueDate: string;
  dueDate: string;
  sentAt?: string;
}

export default function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const [client, setClient] = useState<Client | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        
        // Fetch client details
        const clientRes = await fetch(`/api/clients/${id}`);
        if (!clientRes.ok) throw new Error('Client non trouvé');
        const clientData = await clientRes.json();
        setClient(clientData);

        // Fetch client invoices
        const invoicesRes = await fetch(`/api/invoices?clientId=${id}`);
        if (invoicesRes.ok) {
          const invoicesData = await invoicesRes.json();
          setInvoices(Array.isArray(invoicesData) ? invoicesData : []);
        }
      } catch (err: any) {
        setError(err.message || 'Erreur lors du chargement');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 mx-auto animate-spin text-purple-600" />
          <p className="text-gray-500">Chargement des informations...</p>
        </div>
      </div>
    );
  }

  if (error || !client) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-6xl mb-4">😕</div>
          <p className="text-gray-600 font-medium">{error || 'Client non trouvé'}</p>
          <Button onClick={() => router.push('/dashboard/clients')} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour aux clients
          </Button>
        </div>
      </div>
    );
  }

  const address = client.address
    ? [client.address.street, client.address.zipCode, client.address.city, client.address.country]
        .filter(Boolean)
        .join(", ")
    : "";

  const initials = (client.companyInfo?.legalName || client.name || "?")
    .split(' ')
    .map(word => word[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const totalCA = invoices
    .filter(inv => inv.paymentStatus === 'paid')
    .reduce((sum, inv) => sum + inv.total, 0);

  const pendingAmount = invoices
    .filter(inv => inv.paymentStatus === 'pending' || inv.paymentStatus === 'overdue')
    .reduce((sum, inv) => sum + inv.total, 0);

  const statusConfig = {
    draft: { color: 'bg-gray-500', bg: 'bg-gray-50', text: 'text-gray-700', icon: '📝' },
    sent: { color: 'bg-blue-600', bg: 'bg-blue-50', text: 'text-blue-700', icon: '📨' },
    paid: { color: 'bg-green-600', bg: 'bg-green-50', text: 'text-green-700', icon: '✅' },
    overdue: { color: 'bg-red-600', bg: 'bg-red-50', text: 'text-red-700', icon: '⚠️' },
    partially_paid: { color: 'bg-orange-500', bg: 'bg-orange-50', text: 'text-orange-700', icon: '⏳' },
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          onClick={() => router.push('/dashboard/clients')}
          variant="outline"
          size="sm"
          className="rounded-xl"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour
        </Button>
      </div>

      {/* Client Info Card */}
      <Card className="overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-blue-600" />
        
        <div className="p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-start gap-6">
            {/* Avatar */}
            <div className="w-20 h-20 rounded-2xl bg-blue-600 flex items-center justify-center text-white font-bold text-2xl shadow-md flex-shrink-0">
              {initials}
            </div>

            {/* Info principale */}
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                {client.companyInfo?.legalName || client.name}
              </h1>
              {client.companyInfo?.legalName && client.name && (
                <div className="flex items-center gap-2 text-gray-600 mb-3">
                  <User className="w-4 h-4" />
                  <span>{client.name}</span>
                </div>
              )}
              {client.companyInfo?.siret && (
                <Badge variant="outline" className="border-blue-200 bg-blue-50 text-blue-700 font-semibold">
                  <Building2 className="w-4 h-4 mr-2" />
                  SIRET: {client.companyInfo.siret}
                </Badge>
              )}
            </div>

            {/* Date création */}
            {client.createdAt && (
              <div className="text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>Client depuis le {new Date(client.createdAt).toLocaleDateString('fr-FR')}</span>
                </div>
              </div>
            )}
          </div>

          {/* Contact Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
            {client.email && (
              <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <Mail className="w-5 h-5 text-blue-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-gray-600 mb-1">Email</p>
                  <p className="text-sm font-semibold text-gray-900 truncate">{client.email}</p>
                </div>
              </div>
            )}

            {client.phone && (
              <div className="flex items-center gap-3 p-4 bg-green-50 rounded-xl">
                <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                  <Phone className="w-5 h-5 text-green-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-gray-600 mb-1">Téléphone</p>
                  <p className="text-sm font-semibold text-gray-900">{client.phone}</p>
                </div>
              </div>
            )}

            {address && (
              <div className="flex items-center gap-3 p-4 bg-orange-50 rounded-xl sm:col-span-2 lg:col-span-1">
                <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 text-orange-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-gray-600 mb-1">Adresse</p>
                  <p className="text-sm font-semibold text-gray-900">{address}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-5">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <span className="text-sm font-medium text-gray-600">Total factures</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{invoices.length}</p>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Euro className="w-5 h-5 text-green-600" />
              </div>
              <span className="text-sm font-medium text-gray-600">CA total</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {totalCA.toLocaleString('fr-FR', { minimumFractionDigits: 0 })} €
            </p>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Euro className="w-5 h-5 text-orange-600" />
              </div>
              <span className="text-sm font-medium text-gray-600">En attente</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {pendingAmount.toLocaleString('fr-FR', { minimumFractionDigits: 0 })} €
            </p>
          </div>
        </Card>
      </div>

      {/* Invoices List */}
      <Card className="overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-gray-100 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Factures</h2>
                <p className="text-sm text-gray-500">{invoices.length} facture{invoices.length > 1 ? 's' : ''}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="divide-y divide-gray-100">
          {invoices.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-6xl mb-4">📄</div>
              <p className="text-gray-500 mb-2">Aucune facture pour ce client</p>
            </div>
          ) : (
            invoices.map((invoice) => {
              const config = statusConfig[invoice.status as keyof typeof statusConfig] || statusConfig.draft;
              
              return (
                <Link
                  key={invoice._id}
                  href="/dashboard/invoices"
                  className="block p-4 sm:p-5 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                      <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl ${config.color} flex items-center justify-center text-white font-bold shadow-md flex-shrink-0`}>
                        #{String(invoice.invoiceNumber).slice(-3)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <p className="font-semibold text-gray-900">Facture {invoice.invoiceNumber}</p>
                          <Badge className={`${config.bg} ${config.text} border-none text-xs font-semibold whitespace-nowrap`}>
                            {config.icon} {invoice.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-500">
                          {invoice.issueDate && `Émise le ${new Date(invoice.issueDate).toLocaleDateString('fr-FR')}`}
                          {invoice.dueDate && ` • Échéance: ${new Date(invoice.dueDate).toLocaleDateString('fr-FR')}`}
                        </p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-lg sm:text-xl font-bold text-gray-900 whitespace-nowrap">
                        {invoice.total.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })
          )}
        </div>
      </Card>
    </div>
  );
}
