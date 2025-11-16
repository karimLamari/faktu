import { auth } from '@/lib/auth/auth';
import { redirect } from 'next/navigation';
import dbConnect from '@/lib/db/mongodb';
import Invoice from '@/models/Invoice';
import Client from '@/models/Client';
import { ArchivedInvoicesList } from '@/components/settings/ArchivedInvoicesList';

export const metadata = {
  title: 'Archives - Factures Finalisées',
  description: 'Accédez à toutes vos factures finalisées et archivées',
};

export default async function ArchivesPage() {
  // 1. Authentification
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/login');
  }

  // 2. Connexion DB
  await dbConnect();

  // 3. Récupérer toutes les factures finalisées de l'utilisateur
  const finalizedInvoices = await Invoice.find({
    userId: session.user.id,
    isFinalized: true,
    deletedAt: null, // Exclure les factures soft-deleted
  })
    .sort({ finalizedAt: -1 }) // Plus récentes en premier
    .lean() as any[];

  // 4. Récupérer tous les clients
  const clients = await Client.find({
    userId: session.user.id,
  }).lean();

  // 5. Créer un map clientId → client pour lookup rapide
  const clientMap = new Map(
    clients.map((client) => [client._id.toString(), client])
  );

  // 6. Grouper factures par client
  const invoicesByClient = finalizedInvoices.reduce((acc, invoice) => {
    const clientId = invoice.clientId?.toString() || 'no-client';
    if (!acc[clientId]) {
      acc[clientId] = [];
    }
    acc[clientId].push(invoice);
    return acc;
  }, {} as Record<string, typeof finalizedInvoices>);

  // 7. Sérialiser les données pour le client
  const serializedInvoicesByClient = Object.entries(invoicesByClient).map(
    ([clientId, invoices]: [string, any]) => {
      const client = clientId !== 'no-client' ? clientMap.get(clientId) : null;
      return {
        clientId,
        client: client ? {
          _id: client._id.toString(),
          name: client.name,
          type: client.type,
          email: client.email,
          companyInfo: client.companyInfo,
        } : null,
        invoices: invoices.map((invoice: any) => ({
          _id: invoice._id.toString(),
          invoiceNumber: invoice.invoiceNumber,
          total: invoice.total,
          status: invoice.status,
          isFinalized: invoice.isFinalized,
          finalizedAt: invoice.finalizedAt?.toISOString() || null,
          issueDate: invoice.issueDate?.toISOString() || null,
          pdfPath: invoice.pdfPath || null,
          pdfHash: invoice.pdfHash || null,
          clientId: invoice.clientId?.toString() || null,
        })),
      };
    }
  );

  // 8. Statistiques globales
  const stats = {
    total: finalizedInvoices.length,
    totalAmount: finalizedInvoices.reduce((sum, inv) => sum + (inv.total || 0), 0),
    byYear: finalizedInvoices.reduce((acc, inv) => {
      const year = inv.finalizedAt
        ? new Date(inv.finalizedAt).getFullYear()
        : new Date(inv.createdAt).getFullYear();
      acc[year] = (acc[year] || 0) + 1;
      return acc;
    }, {} as Record<number, number>),
    withPdf: finalizedInvoices.filter((inv) => inv.pdfPath).length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            📦 Archives - Factures Finalisées
          </h1>
          <p className="text-gray-400">
            Accédez à toutes vos factures finalisées et téléchargez les PDFs archivés
          </p>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
            <div className="text-gray-400 text-sm mb-1">Total Factures</div>
            <div className="text-3xl font-bold text-white">{stats.total}</div>
          </div>
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
            <div className="text-gray-400 text-sm mb-1">Montant Total</div>
            <div className="text-3xl font-bold text-green-400">
              {stats.totalAmount.toLocaleString('fr-FR', {
                minimumFractionDigits: 2,
              })}{' '}
              €
            </div>
          </div>
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
            <div className="text-gray-400 text-sm mb-1">Avec PDF Archivé</div>
            <div className="text-3xl font-bold text-purple-400">
              {stats.withPdf}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {Math.round((stats.withPdf / stats.total) * 100)}% du total
            </div>
          </div>
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
            <div className="text-gray-400 text-sm mb-1">Par Année</div>
            <div className="text-sm text-gray-300 space-y-1">
              {Object.entries(stats.byYear)
                .sort(([a], [b]) => Number(b) - Number(a))
                .slice(0, 3)
                .map(([year, count]: [string, any]) => (
                  <div key={year} className="flex justify-between">
                    <span>{year}:</span>
                    <span className="font-semibold">{count}</span>
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* Liste des factures groupées par client */}
        <ArchivedInvoicesList
          invoicesByClient={serializedInvoicesByClient}
          totalInvoices={stats.total}
        />
      </div>
    </div>
  );
}
