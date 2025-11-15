/**
 * CORPORATE Template - Design d'entreprise moderne et professionnel
 * Structure: Header avec bande élégante + layout 2 colonnes équilibré
 * Style: Lignes épurées, espacements généreux, hiérarchie claire
 */

import React from 'react';
import { Document, Page, Text, View, Image, StyleSheet } from '@react-pdf/renderer';
import type { TemplatePreset } from '../config/presets';
import { calculateVATByRate, formatCurrency, formatPercentage } from '../core/utils';

interface CorporateTemplateProps {
  invoice: any;
  client: any;
  user: any;
  template: TemplatePreset;
}

export const CorporateTemplate: React.FC<CorporateTemplateProps> = ({
  invoice,
  client,
  user,
  template,
}) => {
  const { colors, sections, customText } = template;
  const vatByRate = calculateVATByRate(invoice);

  const styles = StyleSheet.create({
    page: {
      padding: 0,
      backgroundColor: '#ffffff',
      fontFamily: 'Helvetica',
    },
    header: {
      backgroundColor: colors.primary,
      padding: '35 40',
      marginBottom: 30,
    },
    headerContent: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
    },
    headerLeft: {
      flex: 1,
    },
    invoiceTitle: {
      fontSize: 28,
      fontWeight: 'bold',
      color: '#ffffff',
      marginBottom: 6,
      letterSpacing: 0.5,
    },
    invoiceNumber: {
      fontSize: 13,
      color: '#ffffff',
      opacity: 0.95,
      marginBottom: 3,
    },
    invoiceDate: {
      fontSize: 11,
      color: '#ffffff',
      opacity: 0.85,
    },
    logo: {
      width: 70,
      height: 70,
      objectFit: 'contain',
    },
    content: {
      padding: '0 40',
    },
    infoSection: {
      flexDirection: 'row',
      gap: 30,
      marginBottom: 35,
    },
    infoBox: {
      flex: 1,
      padding: 18,
      backgroundColor: '#f8fafc',
      borderLeft: `3px solid ${colors.primary}`,
    },
    infoLabel: {
      fontSize: 9,
      fontWeight: 'bold',
      color: colors.primary,
      textTransform: 'uppercase',
      letterSpacing: 0.8,
      marginBottom: 10,
    },
    infoText: {
      fontSize: 10,
      color: '#1e293b',
      lineHeight: 1.6,
      marginBottom: 2,
    },
    infoTextBold: {
      fontWeight: 'bold',
      fontSize: 11,
    },
    table: {
      marginBottom: 25,
      border: `1px solid #e2e8f0`,
      borderRadius: 4,
    },
    tableHeader: {
      flexDirection: 'row',
      backgroundColor: '#f1f5f9',
      padding: '12 15',
      borderBottom: `2px solid ${colors.primary}`,
    },
    tableHeaderCell: {
      fontSize: 9,
      fontWeight: 'bold',
      color: '#475569',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    tableBody: {
      padding: 15,
    },
    tableRow: {
      flexDirection: 'row',
      paddingVertical: 12,
      borderBottom: '1px solid #f1f5f9',
    },
    tableCell: {
      fontSize: 10,
      color: '#1e293b',
    },
    colDescription: { width: '40%', paddingRight: 10 },
    colQty: { width: '12%', textAlign: 'center' },
    colPrice: { width: '18%', textAlign: 'right' },
    colTax: { width: '12%', textAlign: 'center' },
    colTotal: { width: '18%', textAlign: 'right' },
    itemTitle: {
      fontWeight: 'bold',
      marginBottom: 3,
      color: '#0f172a',
    },
    itemDetails: {
      fontSize: 9,
      color: '#64748b',
      lineHeight: 1.4,
    },
    totalsSection: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      marginBottom: 30,
    },
    totalsBox: {
      width: 280,
      backgroundColor: '#f8fafc',
      borderRadius: 6,
      overflow: 'hidden',
      border: `1px solid #e2e8f0`,
    },
    totalRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      padding: '10 18',
      borderBottom: '1px solid #e2e8f0',
    },
    totalLabel: {
      fontSize: 10,
      color: '#475569',
    },
    totalValue: {
      fontSize: 10,
      color: '#0f172a',
      fontWeight: 'bold',
    },
    totalFinal: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      backgroundColor: colors.primary,
      padding: '15 18',
    },
    totalFinalLabel: {
      fontSize: 12,
      fontWeight: 'bold',
      color: '#ffffff',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    totalFinalValue: {
      fontSize: 16,
      fontWeight: 'bold',
      color: '#ffffff',
    },
    footer: {
      flexDirection: 'row',
      gap: 25,
      padding: '0 40',
      marginBottom: 25,
    },
    footerBox: {
      flex: 1,
      padding: 15,
      backgroundColor: '#f8fafc',
      borderRadius: 4,
    },
    footerTitle: {
      fontSize: 9,
      fontWeight: 'bold',
      color: colors.primary,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      marginBottom: 8,
    },
    footerText: {
      fontSize: 9,
      color: '#475569',
      lineHeight: 1.5,
    },
    legal: {
      padding: '20 40',
      backgroundColor: '#f8fafc',
      borderTop: `1px solid #e2e8f0`,
    },
    legalText: {
      fontSize: 7,
      color: '#64748b',
      lineHeight: 1.5,
      textAlign: 'center',
    },
  });

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.headerLeft}>
              <Text style={styles.invoiceTitle}>{customText.invoiceTitle}</Text>
              <Text style={styles.invoiceNumber}>N° {invoice.invoiceNumber}</Text>
              <Text style={styles.invoiceDate}>
                Émise le {new Date(invoice.issueDate).toLocaleDateString('fr-FR')}
              </Text>
            </View>
            {sections.showLogo && user?.logo && (
              <Image src={user.logo} style={styles.logo} />
            )}
          </View>
        </View>

        <View style={styles.content}>
          <View style={styles.infoSection}>
            {sections.showCompanyDetails && (
              <View style={styles.infoBox}>
                <Text style={styles.infoLabel}>De</Text>
                <Text style={[styles.infoText, styles.infoTextBold]}>
                  {user?.companyName || `${user?.firstName} ${user?.lastName}`}
                </Text>
                {user?.address && (
                  <>
                    <Text style={styles.infoText}>{user.address.street}</Text>
                    <Text style={styles.infoText}>
                      {user.address.zipCode} {user.address.city}
                    </Text>
                  </>
                )}
                {user?.siret && (
                  <Text style={styles.infoText}>SIRET: {user.siret}</Text>
                )}
                {user?.email && (
                  <Text style={styles.infoText}>{user.email}</Text>
                )}
              </View>
            )}

            {sections.showClientDetails && (
              <View style={styles.infoBox}>
                <Text style={styles.infoLabel}>À</Text>
                <Text style={[styles.infoText, styles.infoTextBold]}>
                  {client?.name || 'N/A'}
                </Text>
                {client?.address && (
                  <>
                    <Text style={styles.infoText}>{client.address.street}</Text>
                    <Text style={styles.infoText}>
                      {client.address.zipCode} {client.address.city}
                    </Text>
                  </>
                )}
                {client?.email && (
                  <Text style={styles.infoText}>{client.email}</Text>
                )}
              </View>
            )}

            <View style={styles.infoBox}>
              <Text style={styles.infoLabel}>Détails</Text>
              <Text style={styles.infoText}>
                Échéance: {new Date(invoice.dueDate).toLocaleDateString('fr-FR')}
              </Text>
              <Text style={styles.infoText}>
                Paiement: {invoice.paymentMethod === 'bank_transfer' ? 'Virement' : invoice.paymentMethod}
              </Text>
            </View>
          </View>

          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderCell, styles.colDescription]}>Description</Text>
              <Text style={[styles.tableHeaderCell, styles.colQty]}>Qté</Text>
              <Text style={[styles.tableHeaderCell, styles.colPrice]}>Prix unitaire HT</Text>
              <Text style={[styles.tableHeaderCell, styles.colTax]}>TVA</Text>
              <Text style={[styles.tableHeaderCell, styles.colTotal]}>Total HT</Text>
            </View>

            <View style={styles.tableBody}>
              {invoice.items.map((item: any, idx: number) => (
                <View key={idx} style={styles.tableRow}>
                  <View style={styles.colDescription}>
                    <Text style={styles.itemTitle}>{item.description}</Text>
                    {item.details && (
                      <Text style={styles.itemDetails}>{item.details}</Text>
                    )}
                  </View>
                  <Text style={[styles.tableCell, styles.colQty]}>{item.quantity}</Text>
                  <Text style={[styles.tableCell, styles.colPrice]}>
                    {formatCurrency(item.unitPrice)} €
                  </Text>
                  <Text style={[styles.tableCell, styles.colTax]}>
                    {formatPercentage(item.taxRate)}%
                  </Text>
                  <Text style={[styles.tableCell, styles.colTotal, { fontWeight: 'bold' }]}>
                    {formatCurrency(item.quantity * item.unitPrice)} €
                  </Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.totalsSection}>
            <View style={styles.totalsBox}>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total HT</Text>
                <Text style={styles.totalValue}>
                  {formatCurrency(invoice.subtotal || 0)} €
                </Text>
              </View>

              {Object.entries(vatByRate)
                .filter(([_, amount]) => Number(amount) > 0)
                .map(([rate, amount]) => (
                  <View key={rate} style={styles.totalRow}>
                    <Text style={styles.totalLabel}>
                      TVA {formatPercentage(Number(rate))}%
                    </Text>
                    <Text style={styles.totalValue}>{formatCurrency(amount)} €</Text>
                  </View>
                ))}

              <View style={styles.totalFinal}>
                <Text style={styles.totalFinalLabel}>Total TTC</Text>
                <Text style={styles.totalFinalValue}>
                  {formatCurrency(invoice.total || 0)} €
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.footer}>
            {sections.showBankDetails && user?.iban && (
              <View style={styles.footerBox}>
                <Text style={styles.footerTitle}>{customText.bankDetailsLabel}</Text>
                <Text style={styles.footerText}>IBAN: {user.iban}</Text>
              </View>
            )}

            {sections.showPaymentTerms && (
              <View style={styles.footerBox}>
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
              <View style={styles.footerBox}>
                <Text style={styles.footerTitle}>Notes</Text>
                <Text style={styles.footerText}>{invoice.notes}</Text>
              </View>
            )}
          </View>
        </View>

        {sections.showLegalMentions && customText.legalMentions && (
          <View style={styles.legal}>
            <Text style={styles.legalText}>{customText.legalMentions}</Text>
          </View>
        )}
      </Page>
    </Document>
  );
};
