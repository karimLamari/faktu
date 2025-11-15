/**
 * STUDIO Template - Design créatif et moderne pour agences
 * Structure: Asymétrique avec accent coloré, typographie dynamique
 * Style: Couleurs vibrantes, espacements généreux, moderne
 */

import React from 'react';
import { Document, Page, Text, View, Image, StyleSheet } from '@react-pdf/renderer';
import type { TemplatePreset } from '../config/presets';
import { calculateVATByRate, formatCurrency, formatPercentage } from '../core/utils';

interface StudioTemplateProps {
  invoice: any;
  client: any;
  user: any;
  template: TemplatePreset;
}

export const StudioTemplate: React.FC<StudioTemplateProps> = ({
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
    headerSection: {
      flexDirection: 'row',
    },
    accentBar: {
      width: 12,
      backgroundColor: colors.accent,
    },
    headerContent: {
      flex: 1,
      padding: '35 40',
      backgroundColor: '#fafbfc',
    },
    headerTop: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 25,
    },
    headerLeft: {
      flex: 1,
    },
    invoiceTitle: {
      fontSize: 32,
      fontWeight: 'bold',
      color: colors.primary,
      marginBottom: 5,
      letterSpacing: -0.5,
    },
    invoiceNumber: {
      fontSize: 14,
      color: colors.text,
      marginBottom: 3,
    },
    invoiceDate: {
      fontSize: 10,
      color: colors.secondary,
    },
    logo: {
      width: 65,
      height: 65,
      objectFit: 'contain',
    },
    infoCards: {
      flexDirection: 'row',
      gap: 20,
    },
    infoCard: {
      flex: 1,
      backgroundColor: '#ffffff',
      padding: 15,
      borderRadius: 6,
      borderLeft: `4px solid ${colors.primary}`,
    },
    infoLabel: {
      fontSize: 8,
      fontWeight: 'bold',
      color: colors.primary,
      textTransform: 'uppercase',
      letterSpacing: 1,
      marginBottom: 8,
    },
    infoText: {
      fontSize: 9,
      color: colors.text,
      lineHeight: 1.6,
      marginBottom: 2,
    },
    infoTextBold: {
      fontWeight: 'bold',
      fontSize: 10,
    },
    content: {
      padding: '35 40',
    },
    table: {
      marginBottom: 30,
    },
    tableHeader: {
      flexDirection: 'row',
      backgroundColor: colors.primary,
      padding: '14 20',
      borderRadius: 4,
      marginBottom: 2,
    },
    tableHeaderCell: {
      fontSize: 9,
      fontWeight: 'bold',
      color: '#ffffff',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    tableRow: {
      flexDirection: 'row',
      padding: '16 20',
      backgroundColor: '#fafbfc',
      marginBottom: 2,
      borderRadius: 3,
    },
    tableCell: {
      fontSize: 10,
      color: colors.text,
    },
    colDescription: { width: '42%', paddingRight: 12 },
    colQty: { width: '10%', textAlign: 'center' },
    colPrice: { width: '18%', textAlign: 'right' },
    colTax: { width: '12%', textAlign: 'center' },
    colTotal: { width: '18%', textAlign: 'right' },
    itemTitle: {
      fontWeight: 'bold',
      marginBottom: 3,
      color: colors.primary,
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
      marginBottom: 35,
    },
    totalsBox: {
      width: 300,
    },
    totalRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      padding: '11 20',
      backgroundColor: '#fafbfc',
      marginBottom: 2,
      borderRadius: 3,
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
      padding: '16 20',
      backgroundColor: colors.accent,
      borderRadius: 4,
      marginTop: 5,
    },
    totalFinalLabel: {
      fontSize: 13,
      fontWeight: 'bold',
      color: '#ffffff',
      textTransform: 'uppercase',
      letterSpacing: 0.8,
    },
    totalFinalValue: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#ffffff',
    },
    footerCards: {
      flexDirection: 'row',
      gap: 20,
      padding: '0 40',
      marginBottom: 30,
    },
    footerCard: {
      flex: 1,
      backgroundColor: '#fafbfc',
      padding: 16,
      borderRadius: 6,
      borderTop: `3px solid ${colors.accent}`,
    },
    footerTitle: {
      fontSize: 9,
      fontWeight: 'bold',
      color: colors.primary,
      textTransform: 'uppercase',
      letterSpacing: 0.6,
      marginBottom: 8,
    },
    footerText: {
      fontSize: 9,
      color: colors.text,
      lineHeight: 1.6,
    },
    legal: {
      padding: '20 40',
      backgroundColor: '#fafbfc',
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
        <View style={styles.headerSection}>
          <View style={styles.accentBar} />
          <View style={styles.headerContent}>
            <View style={styles.headerTop}>
              <View style={styles.headerLeft}>
                <Text style={styles.invoiceTitle}>{customText.invoiceTitle}</Text>
                <Text style={styles.invoiceNumber}>N° {invoice.invoiceNumber}</Text>
                <Text style={styles.invoiceDate}>
                  Émise le {new Date(invoice.issueDate).toLocaleDateString('fr-FR')}
                  {' · '}
                  Échéance le {new Date(invoice.dueDate).toLocaleDateString('fr-FR')}
                </Text>
              </View>
              {sections.showLogo && user?.logo && (
                <Image src={user.logo} style={styles.logo} />
              )}
            </View>

            <View style={styles.infoCards}>
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
            </View>
          </View>
        </View>

        <View style={styles.content}>
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

          <View style={styles.footerCards}>
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
