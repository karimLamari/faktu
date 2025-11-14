"use client";

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Building2, Mail, Phone, MapPin, User, Calendar, FileText, Euro, Loader2, Upload, Download, Trash2, File, Plus } from 'lucide-react';
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

interface Contract {
  _id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  fileUrl: string;
  uploadedAt: string;
}

export default function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const [client, setClient] = useState<Client | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [uploadingContract, setUploadingContract] = useState(false);

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

        // Fetch client contracts
        const contractsRes = await fetch(`/api/clients/${id}/contracts`);
        if (contractsRes.ok) {
          const contractsData = await contractsRes.json();
          setContracts(contractsData.contracts || []);
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
          <p className="text-white font-medium">{error || 'Client non trouvé'}</p>
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

  const initials = (client.name || "?")
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
    sent: { color: 'bg-blue-600', bg: '', text: 'text-blue-700', icon: '📨' },
    paid: { color: 'bg-green-600', bg: '', text: 'text-green-700', icon: '✅' },
    overdue: { color: 'bg-red-600', bg: '', text: 'text-red-700', icon: '⚠️' },
    partially_paid: { color: '0', bg: '', text: 'text-orange-700', icon: '⏳' },
  };

  const handleUploadContract = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Vérifier la taille (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('Fichier trop volumineux (max 10MB)');
      return;
    }

    setUploadingContract(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch(`/api/clients/${id}/contracts`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Erreur upload');
      }

      const data = await res.json();
      setContracts(prev => [...prev, data.contract]);
      
      // Reset input
      e.target.value = '';
    } catch (err: any) {
      alert(err.message || 'Erreur lors de l\'upload');
    } finally {
      setUploadingContract(false);
    }
  };

  const handleDownloadContract = (contractId: string, fileName: string) => {
    window.open(`/api/contracts/${contractId}`, '_blank');
  };

  const handleDeleteContract = async (contractId: string) => {
    if (!confirm('Supprimer ce contrat ?')) return;

    try {
      const res = await fetch(`/api/clients/${id}/contracts/${contractId}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Erreur suppression');

      setContracts(prev => prev.filter(c => c._id !== contractId));
    } catch (err: any) {
      alert(err.message || 'Erreur lors de la suppression');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
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
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                {client.name || 'Client'}
              </h1>
              {client.companyInfo?.siret && (
                <Badge variant="outline" className="border-blue-200  text-blue-700 font-semibold">
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
              <div className="flex items-center gap-3 p-4  rounded-xl">
                <div className="w-10 h-10 rounded-lg  flex items-center justify-center flex-shrink-0">
                  <Mail className="w-5 h-5 text-blue-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-white mb-1">Email</p>
                  <p className="text-sm font-semibold text-white truncate">{client.email}</p>
                </div>
              </div>
            )}

            {client.phone && (
              <div className="flex items-center gap-3 p-4  rounded-xl">
                <div className="w-10 h-10 rounded-lg  flex items-center justify-center flex-shrink-0">
                  <Phone className="w-5 h-5 text-green-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-white mb-1">Téléphone</p>
                  <p className="text-sm font-semibold text-white">{client.phone}</p>
                </div>
              </div>
            )}

            {address && (
              <div className="flex items-center gap-3 p-4  rounded-xl sm:col-span-2 lg:col-span-1">
                <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 text-orange-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-white mb-1">Adresse</p>
                  <p className="text-sm font-semibold text-white">{address}</p>
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
              <div className="p-2  rounded-lg">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <span className="text-sm font-medium text-white">Total factures</span>
            </div>
            <p className="text-3xl font-bold text-white">{invoices.length}</p>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2  rounded-lg">
                <Euro className="w-5 h-5 text-green-600" />
              </div>
              <span className="text-sm font-medium text-white">CA total</span>
            </div>
            <p className="text-3xl font-bold text-white">
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
              <span className="text-sm font-medium text-white">En attente</span>
            </div>
            <p className="text-3xl font-bold text-white">
              {pendingAmount.toLocaleString('fr-FR', { minimumFractionDigits: 0 })} €
            </p>
          </div>
        </Card>
      </div>

      {/* Invoices List */}
      <Card className="overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2  rounded-lg">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Factures</h2>
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
                          <p className="font-semibold text-white">Facture {invoice.invoiceNumber}</p>
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
                      <p className="text-lg sm:text-xl font-bold text-white whitespace-nowrap">
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

      {/* Contracts Section */}
      <Card className="overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-900/50 rounded-lg">
                <File className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Contrats</h2>
                <p className="text-sm text-gray-400">{contracts.length} contrat{contracts.length > 1 ? 's' : ''}</p>
              </div>
            </div>
            <div>
              <input
                type="file"
                id="contract-upload"
                className="hidden"
                onChange={handleUploadContract}
                accept=".pdf,.doc,.docx"
                disabled={uploadingContract}
              />
              <Button
                onClick={() => document.getElementById('contract-upload')?.click()}
                disabled={uploadingContract}
                size="sm"
                className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600"
              >
                {uploadingContract ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Upload...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Ajouter
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        <div className="divide-y divide-gray-700">
          {contracts.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-6xl mb-4">📄</div>
              <p className="text-gray-400 mb-2">Aucun contrat pour ce client</p>
              <p className="text-sm text-gray-500">Cliquez sur "Ajouter" pour uploader un contrat</p>
            </div>
          ) : (
            contracts.map((contract) => {
              return (
                <div
                  key={contract._id}
                  className="p-4 sm:p-5 hover:bg-gray-800/50 transition-colors"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-purple-900/50 border border-purple-700/50 flex items-center justify-center flex-shrink-0">
                        <File className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-white truncate">{contract.fileName}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className="bg-purple-900/30 text-purple-400 border-purple-700/50 text-xs">
                            {contract.fileType}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {formatFileSize(contract.fileSize)}
                          </span>
                          <span className="text-xs text-gray-500">
                            • {new Date(contract.uploadedAt).toLocaleDateString('fr-FR')}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Button
                        onClick={() => handleDownloadContract(contract._id, contract.fileName)}
                        size="sm"
                        variant="outline"
                        className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button
                        onClick={() => handleDeleteContract(contract._id)}
                        size="sm"
                        variant="outline"
                        className="border-red-700/50 text-red-400 hover:bg-red-900/30 hover:border-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </Card>
    </div>
  );
}
