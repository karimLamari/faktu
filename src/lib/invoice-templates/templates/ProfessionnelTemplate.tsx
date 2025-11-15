/**
 * PROFESSIONNEL Template - Corporate & Premium
 * Structure: Header full-width avec bande de couleur + tableau encadré + sidebar droite
 * Style: Très formel, épuré, encadrements, couleurs sobres
 * DISTINCTION: Mise en page 3 zones (header, content gauche 65%, sidebar droite 35%)
 */

import React from 'react';
import { Document, Page, Text, View, Image, StyleSheet } from '@react-pdf/renderer';
import type { TemplatePreset } from '../config/presets';
import { calculateVATByRate, formatCurrency, formatPercentage } from '../core/utils';

interface ProfessionnelTemplateProps {
  invoice: any;
  client: any;
  user: any;
  template: TemplatePreset;
}

export const ProfessionnelTemplate: React.FC<ProfessionnelTemplateProps> = ({
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
    // ═══ HEADER FULL WIDTH AVEC BANDE ═══
    header: {
      backgroundColor: colors.primary,
      padding: 30,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    headerLeft: {
      flex: 1,
    },
    headerTitle: {
      fontSize: 32,
      fontWeight: 'bold',
      color: '#ffffff',
      marginBottom: 4,
    },
    headerSubtitle: {
      fontSize: 11,
      color: 'rgba(255,255,255,0.85)',
    },
    logo: {
      width: 80,
      height: 80,
      borderRadius: 4,
      backgroundColor: '#ffffff',
    },
    // ═══ CONTENT PRINCIPAL ═══
    content: {
      flexDirection: 'row',
      padding: 30,
      gap: 20,
    },
    leftColumn: {
      width: '65%',
    },
    rightColumn: {
      width: '35%',
      paddingLeft: 15,
      borderLeft: `2px solid ${colors.primary}`,
    },
    // ═══ INFO BOXES ═══
    infoSection: {
      marginBottom: 20,
    },
    infoTitle: {
      fontSize: 9,
      fontWeight: 'bold',
      color: colors.primary,
      textTransform: 'uppercase',
      letterSpacing: 1,
      marginBottom: 8,
      paddingBottom: 4,
      borderBottom: `1px solid ${colors.primary}`,
    },
    infoText: {
      fontSize: 9,
      color: colors.text,
      lineHeight: 1.5,
      marginBottom: 2,
    },
    // ═══ TABLEAU ENCADRÉ ═══
    table: {
      marginTop: 20,
      marginBottom: 20,
      border: `1px solid ${colors.secondary}`,
      borderRadius: 4,
    },
    tableHeader: {
      flexDirection: 'row',
      backgroundColor: colors.primary,
      padding: 8,
      borderTopLeftRadius: 4,
      borderTopRightRadius: 4,
    },
    tableHeaderCell: {
      fontSize: 8,
      fontWeight: 'bold',
      color: '#ffffff',
      textTransform: 'uppercase',
    },
    tableRow: {
      flexDirection: 'row',
      padding: 8,
      borderBottom: `1px solid #e5e7eb`,
    },
    tableRowLast: {
      borderBottom: 'none',
    },
    tableCell: {
      fontSize: 9,
      color: colors.text,
    },
    colDescription: { width: '50%', paddingRight: 8 },
    colQty: { width: '10%', textAlign: 'center' },
    colPrice: { width: '15%', textAlign: 'right' },
    colTax: { width: '10%', textAlign: 'center' },
    colTotal: { width: '15%', textAlign: 'right' },
    // ═══ TOTAUX SIDEBAR ═══
    totalsBox: {
      backgroundColor: '#f9fafb',
      padding: 12,
      borderRadius: 4,
      border: `1px solid ${colors.secondary}`,
    },
    totalRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: 4,
      borderBottom: '1px solid #e5e7eb',
    },
    totalRowLast: {
      borderBottom: 'none',
    },
    totalLabel: {
      fontSize: 9,
      color: colors.secondary,
    },
    totalValue: {
      fontSize: 9,
      color: colors.text,
      fontWeight: 'bold',
    },
    totalFinal: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      backgroundColor: colors.primary,
      padding: 10,
      marginTop: 8,
      borderRadius: 4,
    },
    totalFinalLabel: {
      fontSize: 11,
      fontWeight: 'bold',
      color: '#ffffff',
    },
    totalFinalValue: {
      fontSize: 14,
      fontWeight: 'bold',
      color: '#ffffff',
    },
    // ═══ DETAILS SIDEBAR ═══
    detailBox: {
      backgroundColor: '#ffffff',
      padding: 12,
      borderRadius: 4,
      border: `1px solid ${colors.secondary}`,
      marginBottom: 15,
    },
    detailTitle: {
      fontSize: 8,
      fontWeight: 'bold',
      color: colors.primary,
      textTransform: 'uppercase',
      marginBottom: 6,
    },
    detailText: {
      fontSize: 8,
      color: colors.text,
      lineHeight: 1.4,
    },
    // ═══ FOOTER ═══
    footer: {
      position: 'absolute',
      bottom: 20,
      left: 30,
      right: 30,
      paddingTop: 15,
      borderTop: `2px solid ${colors.primary}`,
    },
    footerText: {
      fontSize: 7,
      color: colors.secondary,
      lineHeight: 1.4,
      textAlign: 'center',
    },
  });

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* ═══ HEADER FULL WIDTH ═══ */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerTitle}>{customText.invoiceTitle}</Text>
            <Text style={styles.headerSubtitle}>N° {invoice.invoiceNumber}</Text>
            <Text style={styles.headerSubtitle}>
              Émise le {new Date(invoice.issueDate).toLocaleDateString('fr-FR')}
            </Text>
          </View>
          {sections.showLogo && user?.logo && (
            <Image src={user.logo} style={styles.logo} />
          )}
        </View>

        {/* ═══ CONTENT 2 COLONNES ═══ */}
        <View style={styles.content}>
          {/* COLONNE GAUCHE (65%) */}
          <View style={styles.leftColumn}>
            {/* Informations émetteur et client */}
            <View style={{ flexDirection: 'row', gap: 20, marginBottom: 20 }}>
              {sections.showCompanyDetails && (
                <View style={[styles.infoSection, { flex: 1 }]}>
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
                </View>
              )}

              {sections.showClientDetails && (
                <View style={[styles.infoSection, { flex: 1 }]}>
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
            </View>

            {/* Tableau des prestations */}
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={[styles.tableHeaderCell, styles.colDescription]}>
                  Description
                </Text>
                <Text style={[styles.tableHeaderCell, styles.colQty]}>Qté</Text>
                <Text style={[styles.tableHeaderCell, styles.colPrice]}>P.U. HT</Text>
                <Text style={[styles.tableHeaderCell, styles.colTax]}>TVA</Text>
                <Text style={[styles.tableHeaderCell, styles.colTotal]}>Total HT</Text>
              </View>

              {invoice.items.map((item: any, idx: number) => (
                <View
                  key={idx}
                  style={styles.tableRow}
                >
                  <View style={styles.colDescription}>
                    <Text style={[styles.tableCell, { fontWeight: 'bold' }]}>
                      {item.description}
                    </Text>
                    {item.details && (
                      <Text style={[styles.tableCell, { fontSize: 7, color: colors.secondary }]}>
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

            {/* Notes */}
            {invoice.notes && (
              <View style={[styles.infoSection, { marginTop: 20 }]}>
                <Text style={styles.infoTitle}>Notes</Text>
                <Text style={styles.infoText}>{invoice.notes}</Text>
              </View>
            )}
          </View>

          {/* COLONNE DROITE (35%) - SIDEBAR */}
          <View style={styles.rightColumn}>
            {/* Dates importantes */}
            <View style={styles.detailBox}>
              <Text style={styles.detailTitle}>Dates</Text>
              <Text style={styles.detailText}>
                Émission: {new Date(invoice.issueDate).toLocaleDateString('fr-FR')}
              </Text>
              <Text style={styles.detailText}>
                Échéance: {new Date(invoice.dueDate).toLocaleDateString('fr-FR')}
              </Text>
            </View>

            {/* Totaux */}
            <View style={styles.totalsBox}>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Subtotal HT</Text>
                <Text style={styles.totalValue}>
                  {formatCurrency(invoice.subtotal || 0)} €
                </Text>
              </View>

              {Object.entries(vatByRate)
                .filter(([_, amount]) => Number(amount) > 0)
                .map(([rate, amount], idx, arr) => (
                  <View
                    key={rate}
                    style={styles.totalRow}
                  >
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

            {/* Coordonnées bancaires */}
            {sections.showBankDetails && user?.iban && (
              <View style={styles.detailBox}>
                <Text style={styles.detailTitle}>
                  {customText.bankDetailsLabel}
                </Text>
                <Text style={styles.detailText}>IBAN: {user.iban}</Text>
                {user?.bic && <Text style={styles.detailText}>BIC: {user.bic}</Text>}
              </View>
            )}

            {/* Modalités de paiement */}
            {sections.showPaymentTerms && (
              <View style={styles.detailBox}>
                <Text style={styles.detailTitle}>
                  {customText.paymentTermsLabel}
                </Text>
                <Text style={styles.detailText}>
                  Paiement par {invoice.paymentMethod === 'bank_transfer' ? 'virement bancaire' : invoice.paymentMethod}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* ═══ FOOTER ═══ */}
        {sections.showLegalMentions && customText.legalMentions && (
          <View style={styles.footer}>
            <Text style={styles.footerText}>{customText.legalMentions}</Text>
          </View>
        )}
      </Page>
    </Document>
  );
};
