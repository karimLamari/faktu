/**
 * CSV Export Service for Accounting
 * Generates CSV exports compatible with French accounting software
 */

interface InvoiceExportData {
  _id: string;
  invoiceNumber: string;
  issueDate: Date;
  dueDate: Date;
  status: string;
  clientId: string;
  items: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    taxRate: number;
  }>;
  subtotal: number;
  total: number;
  amountPaid: number;
  balanceDue: number;
  currency: string;
  paymentTerms?: string;
}

interface ClientExportData {
  _id: string;
  name: string;
  email?: string;
  siret?: string;
  address?: {
    street?: string;
    city?: string;
    zipCode?: string;
    country?: string;
  };
}

/**
 * Format for French accounting software (FEC - Fichier des Écritures Comptables)
 * Standard columns: Date, Journal, Numéro pièce, Compte, Libellé, Débit, Crédit
 */
export interface AccountingCSVRow {
  date: string;              // Date d'écriture (YYYYMMDD)
  journal: string;           // Code journal (ex: VE pour ventes)
  pieceNumber: string;       // Numéro de pièce (invoiceNumber)
  account: string;           // Numéro de compte
  label: string;             // Libellé de l'écriture
  debit: string;             // Montant débit
  credit: string;            // Montant crédit
  clientName?: string;       // Nom du client (optionnel)
  currency?: string;         // Devise (optionnel)
}

/**
 * Format simplifié pour export basique
 */
export interface SimpleCSVRow {
  numeroFacture: string;
  dateEmission: string;
  dateEcheance: string;
  client: string;
  montantHT: string;
  tauxTVA: string;
  montantTVA: string;
  montantTTC: string;
  statut: string;
  montantPaye: string;
  resteAPayer: string;
}

/**
 * Generate FEC-compliant accounting CSV
 */
export function generateAccountingCSV(
  invoices: InvoiceExportData[],
  clients: ClientExportData[]
): string {
  const rows: AccountingCSVRow[] = [];
  const clientMap = new Map(clients.map(c => [c._id.toString(), c]));

  invoices.forEach(invoice => {
    const client = clientMap.get(invoice.clientId.toString());
    const clientName = client?.name || 'Client inconnu';
    const invoiceDate = formatDateFEC(invoice.issueDate);

    // Calculer la TVA totale
    const totalVAT = invoice.total - invoice.subtotal;

    // Regrouper les items par taux de TVA
    const vatByRate: { [rate: number]: number } = {};
    invoice.items.forEach(item => {
      const rate = item.taxRate || 0;
      const base = item.quantity * item.unitPrice;
      const vat = base * (rate / 100);
      if (!vatByRate[rate]) vatByRate[rate] = 0;
      vatByRate[rate] += vat;
    });

    // Ligne 1: Débit client (compte 411xxx)
    rows.push({
      date: invoiceDate,
      journal: 'VE',
      pieceNumber: invoice.invoiceNumber,
      account: '411000', // Compte clients (à personnaliser)
      label: `Facture ${invoice.invoiceNumber} - ${clientName}`,
      debit: formatAmount(invoice.total),
      credit: '0,00',
      clientName,
      currency: invoice.currency || 'EUR',
    });

    // Ligne 2: Crédit vente HT (compte 707xxx)
    rows.push({
      date: invoiceDate,
      journal: 'VE',
      pieceNumber: invoice.invoiceNumber,
      account: '707000', // Compte ventes de marchandises (à personnaliser)
      label: `Vente ${invoice.invoiceNumber}`,
      debit: '0,00',
      credit: formatAmount(invoice.subtotal),
      clientName,
      currency: invoice.currency || 'EUR',
    });

    // Lignes 3+: Crédit TVA collectée par taux (compte 4457x)
    Object.entries(vatByRate).forEach(([rate, amount]) => {
      if (amount > 0) {
        const accountTVA = getTVAAccount(Number(rate));
        rows.push({
          date: invoiceDate,
          journal: 'VE',
          pieceNumber: invoice.invoiceNumber,
          account: accountTVA,
          label: `TVA ${rate}% sur ${invoice.invoiceNumber}`,
          debit: '0,00',
          credit: formatAmount(amount),
          clientName,
          currency: invoice.currency || 'EUR',
        });
      }
    });
  });

  // Generate CSV string
  const headers = [
    'Date',
    'Journal',
    'Numéro Pièce',
    'Compte',
    'Libellé',
    'Débit',
    'Crédit',
    'Client',
    'Devise',
  ];

  const csvRows = [
    headers.join(';'),
    ...rows.map(row => [
      row.date,
      row.journal,
      row.pieceNumber,
      row.account,
      escapeCSV(row.label),
      row.debit,
      row.credit,
      escapeCSV(row.clientName || ''),
      row.currency || 'EUR',
    ].join(';'))
  ];

  return csvRows.join('\n');
}

/**
 * Generate simplified CSV for basic accounting
 */
export function generateSimpleCSV(
  invoices: InvoiceExportData[],
  clients: ClientExportData[]
): string {
  const clientMap = new Map(clients.map(c => [c._id.toString(), c]));

  const rows: SimpleCSVRow[] = invoices.map(invoice => {
    const client = clientMap.get(invoice.clientId.toString());
    const totalVAT = invoice.total - invoice.subtotal;
    const averageVATRate = invoice.subtotal > 0
      ? ((totalVAT / invoice.subtotal) * 100).toFixed(2)
      : '0.00';

    return {
      numeroFacture: invoice.invoiceNumber,
      dateEmission: formatDateSimple(invoice.issueDate),
      dateEcheance: formatDateSimple(invoice.dueDate),
      client: client?.name || 'Client inconnu',
      montantHT: formatAmount(invoice.subtotal),
      tauxTVA: averageVATRate + '%',
      montantTVA: formatAmount(totalVAT),
      montantTTC: formatAmount(invoice.total),
      statut: translateStatus(invoice.status),
      montantPaye: formatAmount(invoice.amountPaid),
      resteAPayer: formatAmount(invoice.balanceDue),
    };
  });

  // Generate CSV string
  const headers = [
    'Numéro Facture',
    'Date Émission',
    'Date Échéance',
    'Client',
    'Montant HT',
    'Taux TVA',
    'Montant TVA',
    'Montant TTC',
    'Statut',
    'Montant Payé',
    'Reste à Payer',
  ];

  const csvRows = [
    headers.join(';'),
    ...rows.map(row => [
      escapeCSV(row.numeroFacture),
      row.dateEmission,
      row.dateEcheance,
      escapeCSV(row.client),
      row.montantHT,
      row.tauxTVA,
      row.montantTVA,
      row.montantTTC,
      escapeCSV(row.statut),
      row.montantPaye,
      row.resteAPayer,
    ].join(';'))
  ];

  return csvRows.join('\n');
}

/**
 * Generate detailed CSV with line items
 */
export function generateDetailedCSV(
  invoices: InvoiceExportData[],
  clients: ClientExportData[]
): string {
  const clientMap = new Map(clients.map(c => [c._id.toString(), c]));
  const rows: string[] = [];

  invoices.forEach(invoice => {
    const client = clientMap.get(invoice.clientId.toString());
    const clientName = client?.name || 'Client inconnu';

    invoice.items.forEach((item, index) => {
      const itemTotal = item.quantity * item.unitPrice;
      const itemVAT = itemTotal * (item.taxRate / 100);
      const itemTotalTTC = itemTotal + itemVAT;

      rows.push([
        escapeCSV(invoice.invoiceNumber),
        formatDateSimple(invoice.issueDate),
        escapeCSV(clientName),
        index + 1, // Numéro de ligne
        escapeCSV(item.description),
        formatAmount(item.quantity),
        formatAmount(item.unitPrice),
        formatAmount(itemTotal),
        item.taxRate.toFixed(2) + '%',
        formatAmount(itemVAT),
        formatAmount(itemTotalTTC),
        translateStatus(invoice.status),
      ].join(';'));
    });
  });

  // Headers
  const headers = [
    'Numéro Facture',
    'Date',
    'Client',
    'Ligne',
    'Description',
    'Quantité',
    'Prix Unitaire HT',
    'Total HT',
    'Taux TVA',
    'Montant TVA',
    'Total TTC',
    'Statut',
  ];

  return [headers.join(';'), ...rows].join('\n');
}

/**
 * Helper: Format date for FEC (YYYYMMDD)
 */
function formatDateFEC(date: Date): string {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;
}

/**
 * Helper: Format date for simple export (DD/MM/YYYY)
 */
function formatDateSimple(date: Date): string {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${day}/${month}/${year}`;
}

/**
 * Helper: Format amount with French decimal separator (comma)
 */
function formatAmount(amount: number): string {
  return amount.toFixed(2).replace('.', ',');
}

/**
 * Helper: Escape CSV value (handle quotes and semicolons)
 */
function escapeCSV(value: string): string {
  if (!value) return '';

  // If value contains semicolon, quote, or newline, wrap in quotes
  if (value.includes(';') || value.includes('"') || value.includes('\n')) {
    // Escape quotes by doubling them
    return `"${value.replace(/"/g, '""')}"`;
  }

  return value;
}

/**
 * Helper: Get TVA account number based on rate
 */
function getTVAAccount(rate: number): string {
  // Standard French accounting plan
  if (rate === 20) return '44571'; // TVA collectée 20%
  if (rate === 10) return '44571'; // TVA collectée 10%
  if (rate === 5.5) return '44571'; // TVA collectée 5.5%
  if (rate === 2.1) return '44571'; // TVA collectée 2.1%
  if (rate === 0) return '44571';   // TVA à 0%

  return '44571'; // Default: TVA collectée
}

/**
 * Helper: Translate invoice status to French
 */
function translateStatus(status: string): string {
  const statusMap: { [key: string]: string } = {
    draft: 'Brouillon',
    sent: 'Envoyée',
    paid: 'Payée',
    overdue: 'En retard',
    cancelled: 'Annulée',
    partial: 'Partiellement payée',
  };

  return statusMap[status] || status;
}
