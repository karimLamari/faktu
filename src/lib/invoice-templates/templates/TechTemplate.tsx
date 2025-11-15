/**
 * TECH Template - Design moderne et épuré pour startups/tech
 * Structure: Clean, moderne, focus sur la lisibilité
 * Style: Bleu tech, espacements larges, cartes shadow
 */

import React from 'react';
import { Document, Page, Text, View, Image, StyleSheet } from '@react-pdf/renderer';
import type { TemplatePreset } from '../config/presets';
import { calculateVATByRate, formatCurrency, formatPercentage } from '../core/utils';

interface TechTemplateProps {
  invoice: any;
  client: any;
  user: any;
  template: TemplatePreset;
}

export const TechTemplate: React.FC<TechTemplateProps> = ({
  invoice,
  client,
  user,
  template,
}) => {
  const { colors, sections, customText } = template;
  const vatByRate = calculateVATByRate(invoice);

  const styles = StyleSheet.create({
    page: {
      padding: 35,
      backgroundColor: '#f8f9fa',
      fontFamily: 'Helvetica',
    },
    header: {
      backgroundColor: '#ffffff',
      padding: 30,
      marginBottom: 25,
      borderRadius: 8,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    headerLeft: {
      flex: 1,
    },
    invoiceTitle: {
      fontSize: 30,
      fontWeight: 'bold',
      color: colors.primary,
      marginBottom: 8,
      letterSpacing: -0.5,
    },
    invoiceNumber: {
      fontSize: 12,
      color: colors.text,
      marginBottom: 4,
    },
    invoiceDate: {
      fontSize: 10,
      color: colors.secondary,
    },
    logo: {
      width: 70,
      height: 70,
      objectFit: 'contain',
    },
    infoGrid: {
      flexDirection: 'row',
      gap: 20,
      marginBottom: 25,
    },
    infoCard: {
      flex: 1,
      backgroundColor: '#ffffff',
      padding: 20,
      borderRadius: 8,
    },
    infoLabel: {
      fontSize: 9,
      fontWeight: 'bold',
      color: colors.primary,
      textTransform: 'uppercase',
      letterSpacing: 0.8,
      marginBottom: 12,
      paddingBottom: 8,
      borderBottom: `2px solid ${colors.primary}`,
    },
    infoText: {
      fontSize: 10,
      color: colors.text,
      lineHeight: 1.7,
      marginBottom: 3,
    },
    infoTextBold: {
      fontWeight: 'bold',
      fontSize: 11,
      marginBottom: 5,
    },
    tableWrapper: {
      backgroundColor: '#ffffff',
      borderRadius: 8,
      overflow: 'hidden',
      marginBottom: 25,
    },
    tableHeader: {
      flexDirection: 'row',
      backgroundColor: colors.primary,
      padding: '14 20',
    },
    tableHeaderCell: {
      fontSize: 9,
      fontWeight: 'bold',
      color: '#ffffff',
      textTransform: 'uppercase',
      letterSpacing: 0.6,
    },
    tableBody: {
      padding: 20,
    },
    tableRow: {
      flexDirection: 'row',
      paddingVertical: 14,
      borderBottom: '1px solid #e9ecef',
    },
    tableCell: {
      fontSize: 10,
      color: colors.text,
    },
    colDescription: { width: '40%', paddingRight: 12 },
    colQty: { width: '12%', textAlign: 'center' },
    colPrice: { width: '18%', textAlign: 'right' },
    colTax: { width: '12%', textAlign: 'center' },
    colTotal: { width: '18%', textAlign: 'right' },
    itemTitle: {
      fontWeight: 'bold',
      marginBottom: 4,
      color: '#212529',
      fontSize: 11,
    },
    itemDetails: {
      fontSize: 9,
      color: colors.secondary,
      lineHeight: 1.5,
    },
    totalsSection: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      marginBottom: 25,
    },
    totalsCard: {
      width: 290,
      backgroundColor: '#ffffff',
      borderRadius: 8,
      overflow: 'hidden',
    },
    totalRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      padding: '12 20',
      borderBottom: '1px solid #e9ecef',
    },
    totalLabel: {
      fontSize: 10,
      color: colors.secondary,
    },
    totalValue: {
      fontSize: 10,
      color: colors.text,
      fontWeight: 'bold',
    },
    totalFinal: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      backgroundColor: colors.primary,
      padding: '16 20',
    },
    totalFinalLabel: {
      fontSize: 12,
      fontWeight: 'bold',
      color: '#ffffff',
      textTransform: 'uppercase',
      letterSpacing: 0.8,
    },
    totalFinalValue: {
      fontSize: 17,
      fontWeight: 'bold',
      color: '#ffffff',
    },
    footerGrid: {
      flexDirection: 'row',
      gap: 20,
      marginBottom: 20,
    },
    footerCard: {
      flex: 1,
      backgroundColor: '#ffffff',
      padding: 18,
      borderRadius: 8,
    },
    footerTitle: {
      fontSize: 9,
      fontWeight: 'bold',
      color: colors.primary,
      textTransform: 'uppercase',
      letterSpacing: 0.6,
      marginBottom: 10,
    },
    footerText: {
      fontSize: 9,
      color: colors.text,
      lineHeight: 1.6,
    },
    legal: {
      backgroundColor: '#ffffff',
      padding: 18,
      borderRadius: 8,
    },
    legalText: {
      fontSize: 7,
      color: colors.secondary,
      lineHeight: 1.5,
      textAlign: 'center',
    },
  });

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
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

        <View style={styles.infoGrid}>
          {sections.showCompanyDetails && (
            <View style={styles.infoCard}>
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
            <View style={styles.infoCard}>
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

          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>Détails</Text>
            <Text style={styles.infoText}>
              Échéance: {new Date(invoice.dueDate).toLocaleDateString('fr-FR')}
            </Text>
            <Text style={styles.infoText}>
              Paiement: {invoice.paymentMethod === 'bank_transfer' ? 'Virement' : invoice.paymentMethod}
            </Text>
          </View>
        </View>

        <View style={styles.tableWrapper}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, styles.colDescription]}>Description</Text>
            <Text style={[styles.tableHeaderCell, styles.colQty]}>Qté</Text>
            <Text style={[styles.tableHeaderCell, styles.colPrice]}>Prix HT</Text>
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
          <View style={styles.totalsCard}>
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

        <View style={styles.footerGrid}>
          {sections.showBankDetails && user?.iban && (
            <View style={styles.footerCard}>
              <Text style={styles.footerTitle}>{customText.bankDetailsLabel}</Text>
              <Text style={styles.footerText}>IBAN: {user.iban}</Text>
            </View>
          )}

          {sections.showPaymentTerms && (
            <View style={styles.footerCard}>
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
            <View style={styles.footerCard}>
              <Text style={styles.footerTitle}>Notes</Text>
              <Text style={styles.footerText}>{invoice.notes}</Text>
            </View>
          )}
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
