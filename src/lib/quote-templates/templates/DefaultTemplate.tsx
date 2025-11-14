/**
 * Quote PDF Template using @react-pdf/renderer
 * Green theme for quotes vs blue for invoices
 */

import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
  Image,
} from '@react-pdf/renderer';

// Register fonts
Font.register({
  family: 'Helvetica',
  fonts: [
    { src: 'Helvetica' },
    { src: 'Helvetica-Bold', fontWeight: 'bold' },
  ],
});

export interface QuotePDFProps {
  quote: any;
  client: any;
  user: any;
}

const styles = StyleSheet.create({
  page: {
    padding: 25,
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: '#1f2937',
    backgroundColor: '#ffffff',
  },

  // Header with green theme
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottom: '2px solid #10b981',
  },

  headerLeft: {
    flex: 1,
  },

  headerRight: {
    alignItems: 'flex-end',
  },

  logo: {
    width: 60,
    height: 60,
    marginBottom: 8,
    objectFit: 'contain',
  },

  companyName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#10b981',
    marginBottom: 4,
  },

  companyDetails: {
    fontSize: 9,
    color: '#6b7280',
    lineHeight: 1.4,
  },

  quoteTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#10b981',
    marginBottom: 6,
  },

  quoteNumber: {
    fontSize: 11,
    marginBottom: 3,
    color: '#374151',
  },

  quoteDate: {
    fontSize: 9,
    color: '#6b7280',
  },

  // Client section
  clientSection: {
    marginBottom: 18,
    padding: 12,
    backgroundColor: '#f0fdf4',
    borderRadius: 4,
    borderLeft: '4px solid #10b981',
  },

  sectionTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#10b981',
    marginBottom: 6,
  },

  clientDetails: {
    fontSize: 10,
    lineHeight: 1.4,
    color: '#374151',
  },

  // Validity notice
  validityNotice: {
    marginBottom: 18,
    padding: 10,
    backgroundColor: '#fef3c7',
    borderRadius: 4,
    borderLeft: '3px solid #f59e0b',
  },

  validityText: {
    fontSize: 9,
    color: '#92400e',
  },

  // Items table
  table: {
    marginBottom: 18,
  },

  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#10b981',
    color: '#ffffff',
    padding: 8,
    fontWeight: 'bold',
    fontSize: 9,
  },

  tableRow: {
    flexDirection: 'row',
    borderBottom: '1px solid #e5e7eb',
    padding: 6,
    fontSize: 10,
  },

  tableRowAlt: {
    flexDirection: 'row',
    borderBottom: '1px solid #e5e7eb',
    padding: 6,
    backgroundColor: '#f9fafb',
    fontSize: 10,
  },

  colQty: { width: '8%' },
  colDescription: { width: '42%' },
  colUnitPrice: { width: '20%', textAlign: 'right' },
  colTax: { width: '10%', textAlign: 'right' },
  colTotal: { width: '20%', textAlign: 'right' },

  itemDescription: {
    fontWeight: 'bold',
  },

  // Totals section
  totalsSection: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 18,
  },

  totalsBox: {
    width: '45%',
    borderTop: '2px solid #10b981',
    paddingTop: 10,
  },

  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
    fontSize: 10,
  },

  totalRowBold: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
    paddingTop: 6,
    borderTop: '1px solid #6b7280',
    fontSize: 12,
    fontWeight: 'bold',
    color: '#10b981',
  },

  // Notes and terms
  notesSection: {
    marginBottom: 15,
    padding: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 4,
  },

  notesTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#10b981',
    marginBottom: 6,
  },

  notesText: {
    fontSize: 9,
    lineHeight: 1.5,
    color: '#374151',
  },

  // Legal mentions
  legalSection: {
    marginTop: 15,
    paddingTop: 10,
    borderTop: '1px solid #e5e7eb',
    fontSize: 8,
    color: '#6b7280',
    lineHeight: 1.4,
  },

  // Footer
  footer: {
    position: 'absolute',
    bottom: 25,
    left: 25,
    right: 25,
    textAlign: 'center',
    fontSize: 8,
    color: '#9ca3af',
  },
});

/**
 * Quote PDF Document Component
 */
export const QuotePDF: React.FC<QuotePDFProps> = ({ quote, client, user }) => {
  // Calculate VAT breakdown
  const vatByRate: { [rate: number]: number } = {};
  for (const item of quote.items) {
    const rate = typeof item.taxRate === 'number' ? item.taxRate : 0;
    const base = item.quantity * item.unitPrice;
    const vat = base * (rate / 100);
    if (!vatByRate[rate]) vatByRate[rate] = 0;
    vatByRate[rate] += vat;
  }

  const validUntil = quote.validUntil
    ? new Date(quote.validUntil).toLocaleDateString('fr-FR')
    : 'Non spécifiée';

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            {user?.logo && <Image src={user.logo} style={styles.logo} />}
            <Text style={styles.companyName}>{user?.companyName || 'Entreprise'}</Text>
            <Text style={styles.companyDetails}>
              {user?.address?.street && `${user.address.street}\n`}
              {user?.address?.zipCode && user?.address?.city &&
                `${user.address.zipCode} ${user.address.city}\n`}
              {user?.siret && `SIRET: ${user.siret}\n`}
              {user?.vatNumber && `TVA: ${user.vatNumber}`}
            </Text>
          </View>

          <View style={styles.headerRight}>
            <Text style={styles.quoteTitle}>DEVIS</Text>
            <Text style={styles.quoteNumber}>N° {quote.quoteNumber}</Text>
            <Text style={styles.quoteDate}>
              Date: {new Date(quote.issueDate).toLocaleDateString('fr-FR')}
            </Text>
            <Text style={styles.quoteDate}>Valide jusqu'au: {validUntil}</Text>
          </View>
        </View>

        {/* Client Section */}
        <View style={styles.clientSection}>
          <Text style={styles.sectionTitle}>Devis pour</Text>
          <Text style={styles.clientDetails}>
            {client?.name || 'Client'}{'\n'}
            {client?.address?.street && `${client.address.street}\n`}
            {client?.address?.zipCode && client?.address?.city &&
              `${client.address.zipCode} ${client.address.city}\n`}
            {client?.email && `Email: ${client.email}\n`}
            {client?.siret && `SIRET: ${client.siret}`}
          </Text>
        </View>

        {/* Validity Notice */}
        <View style={styles.validityNotice}>
          <Text style={styles.validityText}>
            ⚠️ Ce devis est valable jusqu'au {validUntil}. Au-delà de cette date, les prix et
            conditions peuvent être révisés.
          </Text>
        </View>

        {/* Items Table */}
        <View style={styles.table}>
          {/* Table Header */}
          <View style={styles.tableHeader}>
            <Text style={styles.colQty}>Qté</Text>
            <Text style={styles.colDescription}>Description</Text>
            <Text style={styles.colUnitPrice}>Prix Unit.</Text>
            <Text style={styles.colTax}>TVA</Text>
            <Text style={styles.colTotal}>Total HT</Text>
          </View>

          {/* Table Rows */}
          {quote.items.map((item: any, index: number) => (
            <View key={index} style={index % 2 === 0 ? styles.tableRow : styles.tableRowAlt}>
              <Text style={styles.colQty}>{item.quantity}</Text>
              <View style={styles.colDescription}>
                <Text style={styles.itemDescription}>{item.description}</Text>
              </View>
              <Text style={styles.colUnitPrice}>
                {Number(item.unitPrice).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
              </Text>
              <Text style={styles.colTax}>
                {typeof item.taxRate === 'number'
                  ? item.taxRate.toLocaleString('fr-FR', { minimumFractionDigits: 1 })
                  : '0.0'}%
              </Text>
              <Text style={styles.colTotal}>
                {(item.quantity * item.unitPrice).toLocaleString('fr-FR', {
                  minimumFractionDigits: 2,
                })}{' '}
                €
              </Text>
            </View>
          ))}
        </View>

        {/* Totals */}
        <View style={styles.totalsSection}>
          <View style={styles.totalsBox}>
            <View style={styles.totalRow}>
              <Text>Total HT:</Text>
              <Text>
                {Number(quote.subtotal).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
              </Text>
            </View>

            {/* VAT breakdown */}
            {Object.entries(vatByRate)
              .filter(([_, amount]) => Number(amount) > 0)
              .sort((a, b) => Number(a[0]) - Number(b[0]))
              .map(([rate, amount]) => (
                <View key={rate} style={styles.totalRow}>
                  <Text>TVA ({Number(rate).toFixed(1)}%):</Text>
                  <Text>
                    {Number(amount).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
                  </Text>
                </View>
              ))}

            <View style={styles.totalRowBold}>
              <Text>Total TTC:</Text>
              <Text>
                {Number(quote.total).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
              </Text>
            </View>
          </View>
        </View>

        {/* Notes */}
        {quote.notes && (
          <View style={styles.notesSection}>
            <Text style={styles.notesTitle}>Notes</Text>
            <Text style={styles.notesText}>{quote.notes}</Text>
          </View>
        )}

        {/* Terms */}
        {quote.terms && (
          <View style={styles.notesSection}>
            <Text style={styles.notesTitle}>Conditions</Text>
            <Text style={styles.notesText}>{quote.terms}</Text>
          </View>
        )}

        {/* Legal Mentions */}
        <View style={styles.legalSection}>
          <Text>
            En cas d'acceptation du devis, celui-ci sera converti en facture avec les mêmes
            conditions. Les prix sont exprimés en euros et s'entendent TTC. Conformément à
            l'article L. 441-6 du code de commerce, en cas de retard de paiement seront exigibles
            une indemnité calculée sur la base de trois fois le taux de l'intérêt légal en vigueur
            ainsi qu'une indemnité forfaitaire pour frais de recouvrement de 40 euros.
          </Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>
            {user?.companyName} - {user?.email || 'contact@entreprise.fr'}
          </Text>
        </View>
      </Page>
    </Document>
  );
};
