/**
 * PRESTIGE Template - Design luxe et raffiné pour services premium
 * Structure: Centré avec marges généreuses, typographie élégante
 * Style: Or et noir, serif, espaces larges, minimal
 */

import React from 'react';
import { Document, Page, Text, View, Image, StyleSheet } from '@react-pdf/renderer';
import type { TemplatePreset } from '../config/presets';
import { calculateVATByRate, formatCurrency, formatPercentage } from '../core/utils';

interface PrestigeTemplateProps {
  invoice: any;
  client: any;
  user: any;
  template: TemplatePreset;
}

export const PrestigeTemplate: React.FC<PrestigeTemplateProps> = ({
  invoice,
  client,
  user,
  template,
}) => {
  const { colors, sections, customText } = template;
  const vatByRate = calculateVATByRate(invoice);

  const styles = StyleSheet.create({
    page: {
      padding: '50 60',
      backgroundColor: '#ffffff',
      fontFamily: 'Times-Roman',
    },
    header: {
      alignItems: 'center',
      marginBottom: 40,
      paddingBottom: 20,
      borderBottom: `1px solid ${colors.accent}`,
    },
    logo: {
      width: 80,
      height: 80,
      marginBottom: 15,
      objectFit: 'contain',
    },
    invoiceTitle: {
      fontSize: 26,
      fontWeight: 'bold',
      color: colors.primary,
      marginBottom: 8,
      letterSpacing: 2,
      textTransform: 'uppercase',
    },
    invoiceNumber: {
      fontSize: 11,
      color: colors.secondary,
      letterSpacing: 0.5,
    },
    dates: {
      flexDirection: 'row',
      justifyContent: 'center',
      gap: 30,
      marginTop: 12,
    },
    dateText: {
      fontSize: 9,
      color: colors.text,
    },
    infoSection: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 45,
      gap: 40,
    },
    infoBox: {
      flex: 1,
    },
    infoLabel: {
      fontSize: 9,
      fontWeight: 'bold',
      color: colors.accent,
      textTransform: 'uppercase',
      letterSpacing: 1,
      marginBottom: 12,
      textAlign: 'center',
      paddingBottom: 6,
      borderBottom: `1px solid ${colors.accent}`,
    },
    infoContent: {
      alignItems: 'center',
      marginTop: 10,
    },
    infoText: {
      fontSize: 10,
      color: colors.text,
      lineHeight: 1.7,
      textAlign: 'center',
      marginBottom: 3,
    },
    infoTextBold: {
      fontWeight: 'bold',
      fontSize: 11,
      marginBottom: 6,
    },
    table: {
      marginBottom: 35,
    },
    tableHeader: {
      flexDirection: 'row',
      paddingVertical: 12,
      borderBottom: `2px solid ${colors.primary}`,
      marginBottom: 5,
    },
    tableHeaderCell: {
      fontSize: 9,
      fontWeight: 'bold',
      color: colors.primary,
      textTransform: 'uppercase',
      letterSpacing: 0.8,
    },
    tableRow: {
      flexDirection: 'row',
      paddingVertical: 15,
      borderBottom: `1px solid #e5e7eb`,
    },
    tableCell: {
      fontSize: 10,
      color: colors.text,
    },
    colDescription: { width: '45%', paddingRight: 15 },
    colQty: { width: '10%', textAlign: 'center' },
    colPrice: { width: '17%', textAlign: 'right' },
    colTax: { width: '11%', textAlign: 'center' },
    colTotal: { width: '17%', textAlign: 'right' },
    itemTitle: {
      fontWeight: 'bold',
      marginBottom: 4,
      fontSize: 11,
    },
    itemDetails: {
      fontSize: 9,
      color: colors.secondary,
      lineHeight: 1.5,
      fontStyle: 'italic',
    },
    totalsSection: {
      alignItems: 'flex-end',
      marginBottom: 40,
    },
    totalsBox: {
      width: 300,
    },
    totalRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: 8,
      paddingHorizontal: 15,
      borderBottom: `1px solid #f3f4f6`,
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
      padding: '15 20',
      marginTop: 8,
      backgroundColor: colors.primary,
    },
    totalFinalLabel: {
      fontSize: 13,
      fontWeight: 'bold',
      color: '#ffffff',
      textTransform: 'uppercase',
      letterSpacing: 1.5,
    },
    totalFinalValue: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#ffffff',
    },
    footer: {
      marginTop: 30,
      paddingTop: 25,
      borderTop: `1px solid ${colors.accent}`,
    },
    footerSection: {
      marginBottom: 20,
    },
    footerTitle: {
      fontSize: 9,
      fontWeight: 'bold',
      color: colors.accent,
      textTransform: 'uppercase',
      letterSpacing: 1,
      marginBottom: 8,
      textAlign: 'center',
    },
    footerText: {
      fontSize: 9,
      color: colors.text,
      lineHeight: 1.6,
      textAlign: 'center',
    },
    legal: {
      marginTop: 30,
      paddingTop: 20,
      borderTop: `1px solid #e5e7eb`,
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
          {sections.showLogo && user?.logo && (
            <Image src={user.logo} style={styles.logo} />
          )}
          <Text style={styles.invoiceTitle}>{customText.invoiceTitle}</Text>
          <Text style={styles.invoiceNumber}>N° {invoice.invoiceNumber}</Text>
          <View style={styles.dates}>
            <Text style={styles.dateText}>
              Émise le {new Date(invoice.issueDate).toLocaleDateString('fr-FR')}
            </Text>
            <Text style={styles.dateText}>
              Échéance le {new Date(invoice.dueDate).toLocaleDateString('fr-FR')}
            </Text>
          </View>
        </View>

        <View style={styles.infoSection}>
          {sections.showCompanyDetails && (
            <View style={styles.infoBox}>
              <Text style={styles.infoLabel}>Émetteur</Text>
              <View style={styles.infoContent}>
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
            </View>
          )}

          {sections.showClientDetails && (
            <View style={styles.infoBox}>
              <Text style={styles.infoLabel}>Client</Text>
              <View style={styles.infoContent}>
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
            </View>
          )}
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, styles.colDescription]}>Description</Text>
            <Text style={[styles.tableHeaderCell, styles.colQty]}>Qté</Text>
            <Text style={[styles.tableHeaderCell, styles.colPrice]}>Prix HT</Text>
            <Text style={[styles.tableHeaderCell, styles.colTax]}>TVA</Text>
            <Text style={[styles.tableHeaderCell, styles.colTotal]}>Total HT</Text>
          </View>

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
            <View style={styles.footerSection}>
              <Text style={styles.footerTitle}>{customText.bankDetailsLabel}</Text>
              <Text style={styles.footerText}>IBAN: {user.iban}</Text>
            </View>
          )}

          {sections.showPaymentTerms && (
            <View style={styles.footerSection}>
              <Text style={styles.footerTitle}>{customText.paymentTermsLabel}</Text>
              <Text style={styles.footerText}>
                Règlement par {invoice.paymentMethod === 'bank_transfer' ? 'virement bancaire' : invoice.paymentMethod}
              </Text>
            </View>
          )}

          {invoice.notes && (
            <View style={styles.footerSection}>
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
