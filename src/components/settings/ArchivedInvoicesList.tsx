'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Archive,
  Download,
  Eye,
  FileText,
  ChevronDown,
  ChevronRight,
  Calendar,
  Euro,
  Building2,
  User,
  Search,
  Filter,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';

interface ArchivedInvoice {
  _id: string;
  invoiceNumber: string;
  total: number;
  status: string;
  isFinalized: boolean;
  finalizedAt: string | null;
  issueDate: string | null;
  pdfPath: string | null;
  pdfHash: string | null;
  clientId: string | null;
}

interface ClientGroup {
  clientId: string;
  client: {
    _id: string;
    name: string;
    type?: 'individual' | 'business';
    email?: string;
    companyInfo?: {
      legalName?: string;
    };
  } | null;
  invoices: ArchivedInvoice[];
}

interface ArchivedInvoicesListProps {
  invoicesByClient: ClientGroup[];
  totalInvoices: number;
}

export function ArchivedInvoicesList({
  invoicesByClient,
  totalInvoices,
}: ArchivedInvoicesListProps) {
  const [expandedClients, setExpandedClients] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [yearFilter, setYearFilter] = useState<string>('all');
  const [downloadingPdf, setDownloadingPdf] = useState<string | null>(null);

  // Toggle expansion d'un client
  const toggleClient = (clientId: string) => {
    setExpandedClients((prev) => {
      const next = new Set(prev);
      if (next.has(clientId)) {
        next.delete(clientId);
      } else {
        next.add(clientId);
      }
      return next;
    });
  };

  // Télécharger un PDF
  const handleDownloadPdf = async (invoice: ArchivedInvoice) => {
    if (!invoice.pdfPath) {
      alert('Aucun PDF archivé disponible pour cette facture');
      return;
    }

    setDownloadingPdf(invoice._id);

    try {
      const response = await fetch(`/api/invoices/${invoice._id}/download-pdf`);

      if (!response.ok) {
        const error = await response.json();
        alert(error.message || 'Erreur lors du téléchargement');
        return;
      }

      // Créer un blob et télécharger
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${invoice.invoiceNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Erreur téléchargement PDF:', error);
      alert('Impossible de télécharger le PDF archivé');
    } finally {
      setDownloadingPdf(null);
    }
  };

  // Visualiser un PDF dans un nouvel onglet
  const handleViewPdf = (invoice: ArchivedInvoice) => {
    if (!invoice.pdfPath) {
      alert('Aucun PDF archivé disponible');
      return;
    }

    window.open(`/api/invoices/${invoice._id}/view-pdf`, '_blank');
  };

  // Filtrer les clients
  const filteredGroups = invoicesByClient
    .map((group) => {
      // Filtrer les factures par recherche et année
      const filteredInvoices = group.invoices.filter((invoice) => {
        // Filtre de recherche
        const matchesSearch =
          searchQuery === '' ||
          invoice.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
          group.client?.name.toLowerCase().includes(searchQuery.toLowerCase());

        // Filtre par année
        const matchesYear =
          yearFilter === 'all' ||
          (invoice.finalizedAt &&
            new Date(invoice.finalizedAt).getFullYear().toString() === yearFilter);

        return matchesSearch && matchesYear;
      });

      return { ...group, invoices: filteredInvoices };
    })
    .filter((group) => group.invoices.length > 0); // Retirer clients sans factures

  // Extraire les années disponibles
  const availableYears = Array.from(
    new Set(
      invoicesByClient.flatMap((group) =>
        group.invoices
          .map((inv) =>
            inv.finalizedAt ? new Date(inv.finalizedAt).getFullYear() : null
          )
          .filter((year): year is number => year !== null)
      )
    )
  ).sort((a, b) => b - a);

  // Compter le total de factures filtrées
  const filteredTotal = filteredGroups.reduce(
    (sum, group) => sum + group.invoices.length,
    0
  );

  return (
    <div className="space-y-6">
      {/* Filtres */}
      <Card className="bg-gray-800/50 border-gray-700 p-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Recherche */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher par numéro de facture ou client..."
              className="w-full pl-10 pr-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder:text-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Filtre par année */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              className="pl-10 pr-8 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 appearance-none cursor-pointer"
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
            >
              <option value="all">Toutes les années</option>
              {availableYears.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Résultats */}
        <div className="mt-4 text-sm text-gray-400">
          {filteredTotal} facture{filteredTotal > 1 ? 's' : ''} sur {totalInvoices}{' '}
          affichée{filteredTotal > 1 ? 's' : ''}
        </div>
      </Card>

      {/* Liste des clients avec factures */}
      {filteredGroups.length === 0 ? (
        <Card className="bg-gray-800/50 border-gray-700 p-12 text-center">
          <FileText className="w-16 h-16 mx-auto mb-4 text-gray-600" />
          <h3 className="text-xl font-semibold text-white mb-2">
            Aucune facture trouvée
          </h3>
          <p className="text-gray-400">
            Aucune facture archivée ne correspond à vos critères de recherche.
          </p>
        </Card>
      ) : (
        filteredGroups.map((group) => {
          const isExpanded = expandedClients.has(group.clientId);
          const clientName =
            group.client?.companyInfo?.legalName || group.client?.name || 'Client inconnu';
          const totalAmount = group.invoices.reduce((sum, inv) => sum + inv.total, 0);

          return (
            <Card
              key={group.clientId}
              className="bg-gray-800/50 border-gray-700 overflow-hidden"
            >
              {/* Header du client */}
              <button
                onClick={() => toggleClient(group.clientId)}
                className="w-full p-6 flex items-center justify-between hover:bg-gray-700/30 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-purple-900/30 rounded-lg border border-purple-700/50">
                    {group.client?.type === 'business' ? (
                      <Building2 className="w-6 h-6 text-purple-400" />
                    ) : (
                      <User className="w-6 h-6 text-purple-400" />
                    )}
                  </div>

                  <div className="text-left">
                    <h3 className="text-lg font-semibold text-white">{clientName}</h3>
                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-400">
                      <span className="flex items-center gap-1">
                        <FileText className="w-4 h-4" />
                        {group.invoices.length} facture
                        {group.invoices.length > 1 ? 's' : ''}
                      </span>
                      <span className="flex items-center gap-1">
                        <Euro className="w-4 h-4" />
                        {totalAmount.toLocaleString('fr-FR', {
                          minimumFractionDigits: 2,
                        })}{' '}
                        €
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {/* Badge nombre factures avec PDF */}
                  <Badge className="bg-purple-900/30 text-purple-300 border-purple-700/50">
                    {group.invoices.filter((inv) => inv.pdfPath).length} PDF
                  </Badge>

                  {isExpanded ? (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  )}
                </div>
              </button>

              {/* Liste des factures (collapsible) */}
              {isExpanded && (
                <div className="border-t border-gray-700">
                  {group.invoices.map((invoice, index) => (
                    <div
                      key={invoice._id}
                      className={`p-4 ${
                        index !== group.invoices.length - 1
                          ? 'border-b border-gray-700/50'
                          : ''
                      } hover:bg-gray-700/20 transition-colors`}
                    >
                      <div className="flex items-center justify-between">
                        {/* Info facture */}
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="font-mono font-semibold text-white">
                              {invoice.invoiceNumber}
                            </span>

                            <Badge
                              className={`${
                                invoice.status === 'paid'
                                  ? 'bg-green-900/30 text-green-400 border-green-700/50'
                                  : 'bg-gray-700 text-gray-300'
                              }`}
                            >
                              {invoice.status === 'paid'
                                ? '✓ Payée'
                                : invoice.status}
                            </Badge>

                            {invoice.pdfHash && (
                              <Badge className="bg-blue-900/30 text-blue-300 border-blue-700/50">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Certifié
                              </Badge>
                            )}
                          </div>

                          <div className="flex items-center gap-4 text-sm text-gray-400">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {invoice.finalizedAt
                                ? new Date(invoice.finalizedAt).toLocaleDateString(
                                    'fr-FR'
                                  )
                                : 'Date inconnue'}
                            </span>
                            <span className="flex items-center gap-1 font-semibold text-green-400">
                              <Euro className="w-4 h-4" />
                              {invoice.total.toLocaleString('fr-FR', {
                                minimumFractionDigits: 2,
                              })}{' '}
                              €
                            </span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                          {invoice.pdfPath ? (
                            <>
                              {/* Bouton Visualiser */}
                              <Button
                                size="sm"
                                variant="outline"
                                className="bg-gray-900/50 border-gray-700 text-gray-300 hover:bg-blue-900/30 hover:text-blue-400 hover:border-blue-600"
                                onClick={() => handleViewPdf(invoice)}
                              >
                                <Eye className="w-4 h-4 mr-1.5" />
                                <span className="hidden sm:inline">Voir</span>
                              </Button>

                              {/* Bouton Télécharger */}
                              <Button
                                size="sm"
                                variant="outline"
                                className="bg-purple-900/30 border-purple-700 text-purple-300 hover:bg-purple-900/50 hover:border-purple-600"
                                onClick={() => handleDownloadPdf(invoice)}
                                disabled={downloadingPdf === invoice._id}
                              >
                                {downloadingPdf === invoice._id ? (
                                  <div className="w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full animate-spin mr-1.5" />
                                ) : (
                                  <Download className="w-4 h-4 mr-1.5" />
                                )}
                                <span className="hidden sm:inline">
                                  {downloadingPdf === invoice._id
                                    ? 'Téléchargement...'
                                    : 'Télécharger'}
                                </span>
                              </Button>
                            </>
                          ) : (
                            <div className="flex items-center gap-2 text-sm text-orange-400">
                              <AlertCircle className="w-4 h-4" />
                              <span className="hidden sm:inline">PDF non disponible</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          );
        })
      )}
    </div>
  );
}
