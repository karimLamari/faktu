/**
 * ÉLÉGANT Template - Luxury & Refined
 * Structure: Centré avec marges larges, typographie soignée, espaces généreux
 * Style: Luxueux, serif, tons neutres, focus sur l'espace blanc
 * DISTINCTION: Marges très larges (50px), tout centré, pas de bordures, juste des lignes fines
 */

import React from 'react';
import { Document, Page, Text, View, Image, StyleSheet } from '@react-pdf/renderer';
import type { TemplatePreset } from '../config/presets';
import { calculateVATByRate, formatCurrency, formatPercentage } from '../core/utils';

interface ElegantTemplateProps {
  invoice: any;
  client: any;
  user: any;
  template: TemplatePreset;
}

export const ElegantTemplate: React.FC<ElegantTemplateProps> = ({
  invoice,
  client,
  user,
  template,
}) => {
  const { colors, sections, customText } = template;
  const vatByRate = calculateVATByRate(invoice);

  const styles = StyleSheet.create({
    page: {
      padding: 50, // Marges très larges
      backgroundColor: '#fefefe',
      fontFamily: 'Times-Roman',
    },
    // ═══ HEADER CENTRÉ ÉLÉGANT ═══
    header: {
      alignItems: 'center',
      marginBottom: 40,
      paddingBottom: 20,
      borderBottom: `1px solid ${colors.secondary}`,
    },
    logo: {
      width: 60,
      height: 60,
      marginBottom: 15,
    },
    companyName: {
      fontSize: 11,
      color: colors.text,
      letterSpacing: 2,
      textTransform: 'uppercase',
      marginBottom: 4,
    },
    companyDetails: {
      fontSize: 8,
      color: colors.secondary,
      textAlign: 'center',
      lineHeight: 1.6,
    },
    // ═══ TITRE FACTURE ═══
    invoiceTitle: {
      fontSize: 36,
      fontFamily: 'Times-Bold',
      color: colors.primary,
      textAlign: 'center',
      marginTop: 30,
      marginBottom: 10,
      letterSpacing: 3,
    },
    invoiceNumber: {
      fontSize: 10,
      color: colors.secondary,
      textAlign: 'center',
      marginBottom: 30,
    },
    // ═══ INFO CLIENT/DATES ═══
    infoSection: {
      marginBottom: 35,
      alignItems: 'center',
    },
    infoRow: {
      flexDirection: 'row',
      justifyContent: 'center',
      gap: 80,
      marginBottom: 20,
    },
    infoBox: {
      width: 180,
    },
    infoLabel: {
      fontSize: 8,
      color: colors.secondary,
      letterSpacing: 1,
      textTransform: 'uppercase',
      marginBottom: 8,
      textAlign: 'center',
    },
    infoText: {
      fontSize: 9,
      color: colors.text,
      lineHeight: 1.5,
      textAlign: 'center',
    },
    // ═══ TABLEAU MINIMALISTE ═══
    table: {
      marginTop: 25,
      marginBottom: 25,
    },
    tableHeader: {
      flexDirection: 'row',
      paddingBottom: 8,
      marginBottom: 8,
      borderBottom: `2px solid ${colors.primary}`,
    },
    tableHeaderCell: {
      fontSize: 8,
      fontFamily: 'Times-Bold',
      color: colors.text,
      letterSpacing: 1,
      textTransform: 'uppercase',
    },
    tableRow: {
      flexDirection: 'row',
      paddingVertical: 10,
      borderBottom: `1px solid #e5e7eb`,
    },
    tableRowLast: {
      borderBottom: 'none',
    },
    tableCell: {
      fontSize: 9,
      color: colors.text,
      fontFamily: 'Times-Roman',
    },
    colDescription: { width: '45%' },
    colQty: { width: '12%', textAlign: 'center' },
    colPrice: { width: '18%', textAlign: 'right' },
    colTax: { width: '10%', textAlign: 'center' },
    colTotal: { width: '15%', textAlign: 'right' },
    // ═══ TOTAUX ÉLÉGANTS ═══
    totalsSection: {
      alignItems: 'flex-end',
      marginTop: 30,
      paddingTop: 20,
      borderTop: `1px solid ${colors.secondary}`,
    },
    totalRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      width: 250,
      paddingVertical: 5,
    },
    totalLabel: {
      fontSize: 9,
      color: colors.secondary,
      fontFamily: 'Times-Roman',
    },
    totalValue: {
      fontSize: 9,
      color: colors.text,
      fontFamily: 'Times-Roman',
    },
    totalFinal: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      width: 250,
      paddingTop: 12,
      marginTop: 8,
      borderTop: `2px solid ${colors.primary}`,
    },
    totalFinalLabel: {
      fontSize: 12,
      fontFamily: 'Times-Bold',
      color: colors.text,
      letterSpacing: 2,
    },
    totalFinalValue: {
      fontSize: 14,
      fontFamily: 'Times-Bold',
      color: colors.primary,
    },
    // ═══ FOOTER CENTRÉ ═══
    footerSection: {
      marginTop: 40,
      paddingTop: 20,
      borderTop: `1px solid ${colors.secondary}`,
    },
    footerBox: {
      marginBottom: 15,
      alignItems: 'center',
    },
    footerTitle: {
      fontSize: 8,
      color: colors.secondary,
      letterSpacing: 1,
      textTransform: 'uppercase',
      marginBottom: 6,
      textAlign: 'center',
    },
    footerText: {
      fontSize: 8,
      color: colors.text,
      lineHeight: 1.5,
      textAlign: 'center',
      maxWidth: 400,
    },
    legalText: {
      fontSize: 7,
      color: colors.secondary,
      lineHeight: 1.4,
      textAlign: 'center',
      marginTop: 20,
      paddingHorizontal: 30,
    },
  });

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* ═══ HEADER CENTRÉ ═══ */}
        <View style={styles.header}>
          {sections.showLogo && user?.logo && (
            <Image src={user.logo} style={styles.logo} />
          )}
          {sections.showCompanyDetails && (
            <>
              <Text style={styles.companyName}>{user?.companyName || 'N/A'}</Text>
              <Text style={styles.companyDetails}>
                {user?.address?.street && `${user.address.street}\n`}
                {user?.address?.zipCode && user?.address?.city && 
                  `${user.address.zipCode} ${user.address.city}\n`}
                {user?.siret && `SIRET: ${user.siret}`}
              </Text>
            </>
          )}
        </View>

        {/* ═══ TITRE ═══ */}
        <Text style={styles.invoiceTitle}>{customText.invoiceTitle}</Text>
        <Text style={styles.invoiceNumber}>N° {invoice.invoiceNumber}</Text>

        {/* ═══ INFO CLIENT & DATES ═══ */}
        <View style={styles.infoSection}>
          <View style={styles.infoRow}>
            {sections.showClientDetails && (
              <View style={styles.infoBox}>
                <Text style={styles.infoLabel}>Facturé à</Text>
                <Text style={styles.infoText}>{client?.name || 'N/A'}</Text>
                {client?.address && (
                  <Text style={styles.infoText}>
                    {client.address.street}{'\n'}
                    {client.address.zipCode} {client.address.city}
                  </Text>
                )}
              </View>
            )}

            <View style={styles.infoBox}>
              <Text style={styles.infoLabel}>Dates</Text>
              <Text style={styles.infoText}>
                Émission: {new Date(invoice.issueDate).toLocaleDateString('fr-FR')}{'\n'}
                Échéance: {new Date(invoice.dueDate).toLocaleDateString('fr-FR')}
              </Text>
            </View>
          </View>
        </View>

        {/* ═══ TABLEAU ═══ */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, styles.colDescription]}>Description</Text>
            <Text style={[styles.tableHeaderCell, styles.colQty]}>Qté</Text>
            <Text style={[styles.tableHeaderCell, styles.colPrice]}>Prix Unit.</Text>
            <Text style={[styles.tableHeaderCell, styles.colTax]}>TVA</Text>
            <Text style={[styles.tableHeaderCell, styles.colTotal]}>Total</Text>
          </View>

          {invoice.items.map((item: any, idx: number) => (
            <View
              key={idx}
              style={[
                styles.tableRow,
                idx === invoice.items.length - 1 ? styles.tableRowLast : {},
              ]}
            >
              <Text style={[styles.tableCell, styles.colDescription]}>
                {item.description}
              </Text>
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
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal HT</Text>
            <Text style={styles.totalValue}>{formatCurrency(invoice.subtotal || 0)} €</Text>
          </View>

          {Object.entries(vatByRate)
            .filter(([_, amount]) => Number(amount) > 0)
            .map(([rate, amount]) => (
              <View key={rate} style={styles.totalRow}>
                <Text style={styles.totalLabel}>TVA {formatPercentage(Number(rate))}%</Text>
                <Text style={styles.totalValue}>{formatCurrency(amount)} €</Text>
              </View>
            ))}

          <View style={styles.totalFinal}>
            <Text style={styles.totalFinalLabel}>TOTAL</Text>
            <Text style={styles.totalFinalValue}>{formatCurrency(invoice.total || 0)} €</Text>
          </View>
        </View>

        {/* ═══ FOOTER ═══ */}
        <View style={styles.footerSection}>
          {sections.showBankDetails && user?.iban && (
            <View style={styles.footerBox}>
              <Text style={styles.footerTitle}>{customText.bankDetailsLabel}</Text>
              <Text style={styles.footerText}>
                IBAN: {user.iban}
                {user?.bic && ` • BIC: ${user.bic}`}
              </Text>
            </View>
          )}

          {sections.showPaymentTerms && (
            <View style={styles.footerBox}>
              <Text style={styles.footerTitle}>{customText.paymentTermsLabel}</Text>
              <Text style={styles.footerText}>
                Paiement par {invoice.paymentMethod === 'bank_transfer' ? 'virement bancaire' : invoice.paymentMethod}
              </Text>
            </View>
          )}

          {sections.showLegalMentions && customText.legalMentions && (
            <Text style={styles.legalText}>{customText.legalMentions}</Text>
          )}
        </View>
      </Page>
    </Document>
  );
};
