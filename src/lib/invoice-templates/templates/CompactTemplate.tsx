/**
 * COMPACT Template - Dense & Efficient
 * Structure: Une seule page dense, tableaux serrés, petites polices
 * Style: Très compact, optimal pour A4, bordures fines, espaces réduits
 * DISTINCTION: Optimisé pour tenir beaucoup d'informations sur une page
 */

import React from 'react';
import { Document, Page, Text, View, Image, StyleSheet } from '@react-pdf/renderer';
import type { TemplatePreset } from '../config/presets';
import { calculateVATByRate, formatCurrency, formatPercentage } from '../core/utils';

interface CompactTemplateProps {
  invoice: any;
  client: any;
  user: any;
  template: TemplatePreset;
}

export const CompactTemplate: React.FC<CompactTemplateProps> = ({
  invoice,
  client,
  user,
  template,
}) => {
  const { colors, sections, customText } = template;
  const vatByRate = calculateVATByRate(invoice);

  const styles = StyleSheet.create({
    page: {
      padding: 20, // Marges réduites
      backgroundColor: '#ffffff',
      fontFamily: 'Helvetica',
      fontSize: 8, // Petite police par défaut
    },
    // ═══ HEADER COMPACT ═══
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 12,
      paddingBottom: 8,
      borderBottom: `2px solid ${colors.primary}`,
    },
    headerLeft: {
      flex: 1,
    },
    invoiceTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: colors.primary,
      marginBottom: 2,
    },
    invoiceNumber: {
      fontSize: 9,
      color: colors.text,
      marginBottom: 1,
    },
    invoiceDate: {
      fontSize: 7,
      color: colors.secondary,
    },
    logo: {
      width: 50,
      height: 50,
    },
    // ═══ INFO GRID 3 COLONNES ═══
    infoGrid: {
      flexDirection: 'row',
      gap: 12,
      marginBottom: 12,
    },
    infoColumn: {
      flex: 1,
      padding: 8,
      backgroundColor: '#f9fafb',
      borderLeft: `2px solid ${colors.primary}`,
    },
    infoTitle: {
      fontSize: 7,
      fontWeight: 'bold',
      color: colors.primary,
      textTransform: 'uppercase',
      marginBottom: 4,
    },
    infoText: {
      fontSize: 7,
      color: colors.text,
      lineHeight: 1.3,
      marginBottom: 1,
    },
    // ═══ TABLEAU TRÈS COMPACT ═══
    table: {
      marginBottom: 10,
      border: `1px solid ${colors.secondary}`,
    },
    tableHeader: {
      flexDirection: 'row',
      backgroundColor: colors.primary,
      padding: 4,
    },
    tableHeaderCell: {
      fontSize: 7,
      fontWeight: 'bold',
      color: '#ffffff',
      textTransform: 'uppercase',
    },
    tableRow: {
      flexDirection: 'row',
      padding: 4,
      borderBottom: `1px solid #e5e7eb`,
    },
    tableRowAlt: {
      backgroundColor: '#f9fafb',
    },
    tableRowLast: {
      borderBottom: 'none',
    },
    tableCell: {
      fontSize: 7,
      color: colors.text,
    },
    colDescription: { width: '45%', paddingRight: 4 },
    colQty: { width: '8%', textAlign: 'center' },
    colPrice: { width: '15%', textAlign: 'right' },
    colTax: { width: '8%', textAlign: 'center' },
    colTotal: { width: '12%', textAlign: 'right', fontWeight: 'bold' },
    colAction: { width: '12%', textAlign: 'right' },
    // ═══ TOTAUX COMPACT ═══
    totalsSection: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      marginBottom: 10,
    },
    totalsBox: {
      width: 200,
      border: `1px solid ${colors.secondary}`,
    },
    totalRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      padding: 4,
      borderBottom: `1px solid #e5e7eb`,
    },
    totalRowLast: {
      borderBottom: 'none',
    },
    totalLabel: {
      fontSize: 7,
      color: colors.secondary,
    },
    totalValue: {
      fontSize: 7,
      color: colors.text,
      fontWeight: 'bold',
    },
    totalFinal: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      backgroundColor: colors.primary,
      padding: 6,
    },
    totalFinalLabel: {
      fontSize: 9,
      fontWeight: 'bold',
      color: '#ffffff',
    },
    totalFinalValue: {
      fontSize: 11,
      fontWeight: 'bold',
      color: '#ffffff',
    },
    // ═══ FOOTER 2 COLONNES COMPACT ═══
    footer: {
      flexDirection: 'row',
      gap: 12,
      marginTop: 12,
      paddingTop: 10,
      borderTop: `1px solid ${colors.secondary}`,
    },
    footerColumn: {
      flex: 1,
      padding: 6,
      backgroundColor: '#f9fafb',
    },
    footerTitle: {
      fontSize: 7,
      fontWeight: 'bold',
      color: colors.primary,
      marginBottom: 3,
      textTransform: 'uppercase',
    },
    footerText: {
      fontSize: 6,
      color: colors.text,
      lineHeight: 1.3,
    },
    legalText: {
      fontSize: 5,
      color: colors.secondary,
      lineHeight: 1.3,
      marginTop: 8,
      textAlign: 'justify',
    },
  });

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* ═══ HEADER ═══ */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.invoiceTitle}>{customText.invoiceTitle}</Text>
            <Text style={styles.invoiceNumber}>N° {invoice.invoiceNumber}</Text>
            <Text style={styles.invoiceDate}>
              Émise: {new Date(invoice.issueDate).toLocaleDateString('fr-FR')} • 
              Échéance: {new Date(invoice.dueDate).toLocaleDateString('fr-FR')}
            </Text>
          </View>
          {sections.showLogo && user?.logo && (
            <Image src={user.logo} style={styles.logo} />
          )}
        </View>

        {/* ═══ INFO GRID 3 COLONNES ═══ */}
        <View style={styles.infoGrid}>
          {sections.showCompanyDetails && (
            <View style={styles.infoColumn}>
              <Text style={styles.infoTitle}>Émetteur</Text>
              <Text style={styles.infoText}>{user?.companyName || 'N/A'}</Text>
              {user?.address && (
                <>
                  <Text style={styles.infoText}>{user.address.street}</Text>
                  <Text style={styles.infoText}>
                    {user.address.zipCode} {user.address.city}
                  </Text>
                </>
              )}
              {user?.siret && <Text style={styles.infoText}>SIRET: {user.siret}</Text>}
              {user?.email && <Text style={styles.infoText}>{user.email}</Text>}
            </View>
          )}

          {sections.showClientDetails && (
            <View style={styles.infoColumn}>
              <Text style={styles.infoTitle}>Client</Text>
              <Text style={styles.infoText}>{client?.name || 'N/A'}</Text>
              {client?.address && (
                <>
                  <Text style={styles.infoText}>{client.address.street}</Text>
                  <Text style={styles.infoText}>
                    {client.address.zipCode} {client.address.city}
                  </Text>
                </>
              )}
              {client?.email && <Text style={styles.infoText}>{client.email}</Text>}
            </View>
          )}

          <View style={styles.infoColumn}>
            <Text style={styles.infoTitle}>Statut</Text>
            <Text style={styles.infoText}>
              Facture: {invoice.status === 'paid' ? 'Payée' : 
                        invoice.status === 'sent' ? 'Envoyée' : 
                        invoice.status === 'overdue' ? 'En retard' : 'Brouillon'}
            </Text>
            <Text style={styles.infoText}>
              Paiement: {invoice.paymentMethod === 'bank_transfer' ? 'Virement' : invoice.paymentMethod}
            </Text>
            {invoice.amountPaid > 0 && (
              <Text style={styles.infoText}>
                Payé: {formatCurrency(invoice.amountPaid)} €
              </Text>
            )}
          </View>
        </View>

        {/* ═══ TABLEAU ITEMS ═══ */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, styles.colDescription]}>Description</Text>
            <Text style={[styles.tableHeaderCell, styles.colQty]}>Qté</Text>
            <Text style={[styles.tableHeaderCell, styles.colPrice]}>P.U. HT</Text>
            <Text style={[styles.tableHeaderCell, styles.colTax]}>TVA</Text>
            <Text style={[styles.tableHeaderCell, styles.colTotal]}>Total HT</Text>
          </View>

          {invoice.items.map((item: any, idx: number) => (
            <View
              key={idx}
              style={idx % 2 === 1 ? [styles.tableRow, styles.tableRowAlt] : styles.tableRow}
            >
              <View style={styles.colDescription}>
                <Text style={[styles.tableCell, { fontWeight: 'bold', marginBottom: 1 }]}>
                  {item.description}
                </Text>
                {item.details && (
                  <Text style={[styles.tableCell, { fontSize: 6, color: colors.secondary }]}>
                    {item.details}
                  </Text>
                )}
              </View>
              <Text style={[styles.tableCell, styles.colQty]}>{item.quantity}</Text>
              <Text style={[styles.tableCell, styles.colPrice]}>
                {formatCurrency(item.unitPrice)} €
              </Text>
              <Text style={[styles.tableCell, styles.colTax]}>
                {formatPercentage(item.taxRate)}%
              </Text>
              <Text style={[styles.tableCell, styles.colTotal]}>
                {formatCurrency(item.quantity * item.unitPrice)} €
              </Text>
            </View>
          ))}
        </View>

        {/* ═══ TOTAUX ═══ */}
        <View style={styles.totalsSection}>
          <View style={styles.totalsBox}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total HT</Text>
              <Text style={styles.totalValue}>{formatCurrency(invoice.subtotal || 0)} €</Text>
            </View>

            {Object.entries(vatByRate)
              .filter(([_, amount]) => Number(amount) > 0)
              .map(([rate, amount], idx, arr) => (
                <View key={rate} style={styles.totalRow}>
                  <Text style={styles.totalLabel}>TVA {formatPercentage(Number(rate))}%</Text>
                  <Text style={styles.totalValue}>{formatCurrency(amount)} €</Text>
                </View>
              ))}

            <View style={styles.totalFinal}>
              <Text style={styles.totalFinalLabel}>TOTAL TTC</Text>
              <Text style={styles.totalFinalValue}>
                {formatCurrency(invoice.total || 0)} €
              </Text>
            </View>
          </View>
        </View>

        {/* ═══ FOOTER 2 COLONNES ═══ */}
        <View style={styles.footer}>
          {sections.showBankDetails && user?.iban && (
            <View style={styles.footerColumn}>
              <Text style={styles.footerTitle}>{customText.bankDetailsLabel}</Text>
              <Text style={styles.footerText}>IBAN: {user.iban}</Text>
              {user?.bic && <Text style={styles.footerText}>BIC: {user.bic}</Text>}
              {user?.bankName && <Text style={styles.footerText}>Banque: {user.bankName}</Text>}
            </View>
          )}

          {sections.showPaymentTerms && (
            <View style={styles.footerColumn}>
              <Text style={styles.footerTitle}>{customText.paymentTermsLabel}</Text>
              <Text style={styles.footerText}>
                Règlement par {invoice.paymentMethod === 'bank_transfer' ? 'virement bancaire' : invoice.paymentMethod}
              </Text>
              <Text style={styles.footerText}>
                Date limite: {new Date(invoice.dueDate).toLocaleDateString('fr-FR')}
              </Text>
            </View>
          )}

          {invoice.notes && (
            <View style={styles.footerColumn}>
              <Text style={styles.footerTitle}>Notes</Text>
              <Text style={styles.footerText}>{invoice.notes}</Text>
            </View>
          )}
        </View>

        {/* ═══ MENTIONS LÉGALES ═══ */}
        {sections.showLegalMentions && customText.legalMentions && (
          <Text style={styles.legalText}>{customText.legalMentions}</Text>
        )}
      </Page>
    </Document>
  );
};
