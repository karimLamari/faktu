/**
 * COLORFUL Template - Moderne & Vibrant
 * Structure: Header dégradé, cartes colorées, accents vifs
 * Style: Palette moderne, icônes colorées, effets visuels
 * DISTINCTION: Design le plus moderne avec couleurs vives et mise en page dynamique
 */

import React from 'react';
import { Document, Page, Text, View, Image, StyleSheet } from '@react-pdf/renderer';
import type { TemplatePreset } from '../config/presets';
import { calculateVATByRate, formatCurrency, formatPercentage } from '../core/utils';

interface ColorfulTemplateProps {
  invoice: any;
  client: any;
  user: any;
  template: TemplatePreset;
}

export const ColorfulTemplate: React.FC<ColorfulTemplateProps> = ({
  invoice,
  client,
  user,
  template,
}) => {
  const { colors, sections, customText } = template;
  const vatByRate = calculateVATByRate(invoice);

  // Couleurs vives pour sections
  const accentColors = {
    primary: colors.primary,
    secondary: '#10b981', // Vert vibrant
    accent1: '#f59e0b', // Orange
    accent2: '#8b5cf6', // Violet
    accent3: '#ec4899', // Rose
  };

  const styles = StyleSheet.create({
    page: {
      padding: 0,
      backgroundColor: '#f9fafb',
      fontFamily: 'Helvetica',
    },
    // ═══ HEADER DÉGRADÉ ═══
    headerGradient: {
      backgroundColor: accentColors.primary,
      padding: 30,
      marginBottom: 24,
    },
    headerContent: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    headerLeft: {
      flex: 1,
    },
    invoiceTitle: {
      fontSize: 32,
      fontWeight: 'bold',
      color: '#ffffff',
      marginBottom: 8,
      letterSpacing: 1,
    },
    invoiceNumber: {
      fontSize: 14,
      color: '#ffffff',
      opacity: 0.9,
      marginBottom: 4,
    },
    invoiceDate: {
      fontSize: 11,
      color: '#ffffff',
      opacity: 0.8,
    },
    logo: {
      width: 70,
      height: 70,
      backgroundColor: '#ffffff',
      borderRadius: 35,
      padding: 5,
    },
    // ═══ CONTENT WRAPPER ═══
    content: {
      padding: '0 30px',
    },
    // ═══ INFO CARDS ═══
    infoCards: {
      flexDirection: 'row',
      gap: 16,
      marginBottom: 24,
    },
    infoCard: {
      flex: 1,
      backgroundColor: '#ffffff',
      borderRadius: 12,
      padding: 16,
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    },
    cardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
    },
    cardIcon: {
      width: 28,
      height: 28,
      borderRadius: 14,
      marginRight: 10,
      justifyContent: 'center',
      alignItems: 'center',
    },
    cardTitle: {
      fontSize: 11,
      fontWeight: 'bold',
      color: colors.text,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    cardText: {
      fontSize: 10,
      color: colors.text,
      lineHeight: 1.6,
      marginBottom: 3,
    },
    cardTextBold: {
      fontWeight: 'bold',
    },
    // ═══ TABLEAU MODERNE ═══
    tableWrapper: {
      marginBottom: 24,
      backgroundColor: '#ffffff',
      borderRadius: 12,
      overflow: 'hidden',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    },
    tableHeader: {
      flexDirection: 'row',
      backgroundColor: accentColors.secondary,
      padding: 12,
    },
    tableHeaderCell: {
      fontSize: 9,
      fontWeight: 'bold',
      color: '#ffffff',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    tableBody: {
      padding: 12,
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
      fontSize: 10,
      color: colors.text,
    },
    colDescription: { width: '45%', paddingRight: 8 },
    colQty: { width: '10%', textAlign: 'center' },
    colPrice: { width: '15%', textAlign: 'right' },
    colTax: { width: '10%', textAlign: 'center' },
    colTotal: { width: '20%', textAlign: 'right' },
    itemDescription: {
      fontWeight: 'bold',
      marginBottom: 3,
    },
    itemDetails: {
      fontSize: 8,
      color: colors.secondary,
      fontStyle: 'italic',
    },
    // ═══ TOTAUX COLORÉS ═══
    totalsContainer: {
      flexDirection: 'row',
      gap: 16,
      marginBottom: 24,
    },
    totalsLeft: {
      flex: 1,
    },
    totalsRight: {
      width: 280,
    },
    totalCard: {
      backgroundColor: '#ffffff',
      borderRadius: 12,
      padding: 16,
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    },
    totalRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: 8,
      borderBottom: `1px solid #e5e7eb`,
    },
    totalRowLast: {
      borderBottom: 'none',
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
      backgroundColor: accentColors.accent1,
      borderRadius: 8,
      padding: 14,
      marginTop: 8,
    },
    totalFinalLabel: {
      fontSize: 13,
      fontWeight: 'bold',
      color: '#ffffff',
      textTransform: 'uppercase',
      letterSpacing: 1,
    },
    totalFinalValue: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#ffffff',
    },
    // ═══ FOOTER CARDS ═══
    footerCards: {
      flexDirection: 'row',
      gap: 16,
      marginBottom: 24,
    },
    footerCard: {
      flex: 1,
      backgroundColor: '#ffffff',
      borderRadius: 12,
      padding: 16,
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    },
    footerCardWithAccent: {
      borderLeft: '4px solid',
    },
    footerTitle: {
      fontSize: 11,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 10,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    footerText: {
      fontSize: 9,
      color: colors.text,
      lineHeight: 1.5,
    },
    // ═══ MENTIONS LÉGALES MODERNES ═══
    legalFooter: {
      backgroundColor: '#f3f4f6',
      padding: 20,
      marginTop: 24,
    },
    legalText: {
      fontSize: 7,
      color: colors.secondary,
      lineHeight: 1.4,
      textAlign: 'center',
    },
    // ═══ BADGE STATUT ═══
    statusBadge: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
      alignSelf: 'flex-start',
      marginTop: 8,
    },
    statusText: {
      fontSize: 9,
      fontWeight: 'bold',
      color: '#ffffff',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
  });

  // Couleur badge selon statut
  const getStatusColor = () => {
    switch (invoice.status) {
      case 'paid': return '#10b981'; // Vert
      case 'sent': return '#3b82f6'; // Bleu
      case 'overdue': return '#ef4444'; // Rouge
      default: return '#6b7280'; // Gris
    }
  };

  const getStatusLabel = () => {
    switch (invoice.status) {
      case 'paid': return 'Payée';
      case 'sent': return 'Envoyée';
      case 'overdue': return 'En retard';
      default: return 'Brouillon';
    }
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* ═══ HEADER DÉGRADÉ ═══ */}
        <View style={styles.headerGradient}>
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
          {/* ═══ INFO CARDS ═══ */}
          <View style={styles.infoCards}>
            {sections.showCompanyDetails && (
              <View style={styles.infoCard}>
                <View style={styles.cardHeader}>
                  <View style={[styles.cardIcon, { backgroundColor: accentColors.primary }]}>
                    <Text style={{ color: '#ffffff', fontSize: 14 }}>📤</Text>
                  </View>
                  <Text style={styles.cardTitle}>Émetteur</Text>
                </View>
                <Text style={[styles.cardText, styles.cardTextBold]}>
                  {user?.companyName || 'N/A'}
                </Text>
                {user?.address && (
                  <>
                    <Text style={styles.cardText}>{user.address.street}</Text>
                    <Text style={styles.cardText}>
                      {user.address.zipCode} {user.address.city}
                    </Text>
                  </>
                )}
                {user?.siret && (
                  <Text style={styles.cardText}>SIRET: {user.siret}</Text>
                )}
                {user?.email && (
                  <Text style={styles.cardText}>{user.email}</Text>
                )}
              </View>
            )}

            {sections.showClientDetails && (
              <View style={styles.infoCard}>
                <View style={styles.cardHeader}>
                  <View style={[styles.cardIcon, { backgroundColor: accentColors.secondary }]}>
                    <Text style={{ color: '#ffffff', fontSize: 14 }}>👤</Text>
                  </View>
                  <Text style={styles.cardTitle}>Client</Text>
                </View>
                <Text style={[styles.cardText, styles.cardTextBold]}>
                  {client?.name || 'N/A'}
                </Text>
                {client?.address && (
                  <>
                    <Text style={styles.cardText}>{client.address.street}</Text>
                    <Text style={styles.cardText}>
                      {client.address.zipCode} {client.address.city}
                    </Text>
                  </>
                )}
                {client?.email && (
                  <Text style={styles.cardText}>{client.email}</Text>
                )}
              </View>
            )}

            <View style={styles.infoCard}>
              <View style={styles.cardHeader}>
                <View style={[styles.cardIcon, { backgroundColor: accentColors.accent1 }]}>
                  <Text style={{ color: '#ffffff', fontSize: 14 }}>📋</Text>
                </View>
                <Text style={styles.cardTitle}>Détails</Text>
              </View>
              <Text style={styles.cardText}>
                Échéance: {new Date(invoice.dueDate).toLocaleDateString('fr-FR')}
              </Text>
              <Text style={styles.cardText}>
                Paiement: {invoice.paymentMethod === 'bank_transfer' ? 'Virement' : invoice.paymentMethod}
              </Text>
              {invoice.amountPaid > 0 && (
                <Text style={styles.cardText}>
                  Payé: {formatCurrency(invoice.amountPaid)} €
                </Text>
              )}
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}>
                <Text style={styles.statusText}>{getStatusLabel()}</Text>
              </View>
            </View>
          </View>

          {/* ═══ TABLEAU MODERNE ═══ */}
          <View style={styles.tableWrapper}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderCell, styles.colDescription]}>Description</Text>
              <Text style={[styles.tableHeaderCell, styles.colQty]}>Qté</Text>
              <Text style={[styles.tableHeaderCell, styles.colPrice]}>P.U. HT</Text>
              <Text style={[styles.tableHeaderCell, styles.colTax]}>TVA</Text>
              <Text style={[styles.tableHeaderCell, styles.colTotal]}>Total HT</Text>
            </View>

            <View style={styles.tableBody}>
              {invoice.items.map((item: any, idx: number) => (
                <View
                  key={idx}
                  style={styles.tableRow}
                >
                  <View style={styles.colDescription}>
                    <Text style={styles.itemDescription}>{item.description}</Text>
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

          {/* ═══ TOTAUX COLORÉS ═══ */}
          <View style={styles.totalsContainer}>
            <View style={styles.totalsLeft} />
            <View style={styles.totalsRight}>
              <View style={styles.totalCard}>
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Total HT</Text>
                  <Text style={styles.totalValue}>
                    {formatCurrency(invoice.subtotal || 0)} €
                  </Text>
                </View>

                {Object.entries(vatByRate)
                  .filter(([_, amount]) => Number(amount) > 0)
                  .map(([rate, amount], idx, arr) => (
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
          </View>

          {/* ═══ FOOTER CARDS ═══ */}
          <View style={styles.footerCards}>
            {sections.showBankDetails && user?.iban && (
              <View style={[
                styles.footerCard,
                styles.footerCardWithAccent,
                { borderLeftColor: accentColors.accent2 }
              ]}>
                <Text style={styles.footerTitle}>{customText.bankDetailsLabel}</Text>
                <Text style={styles.footerText}>IBAN: {user.iban}</Text>
                {user?.bic && <Text style={styles.footerText}>BIC: {user.bic}</Text>}
                {user?.bankName && (
                  <Text style={styles.footerText}>Banque: {user.bankName}</Text>
                )}
              </View>
            )}

            {sections.showPaymentTerms && (
              <View style={[
                styles.footerCard,
                styles.footerCardWithAccent,
                { borderLeftColor: accentColors.accent3 }
              ]}>
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
              <View style={[
                styles.footerCard,
                styles.footerCardWithAccent,
                { borderLeftColor: accentColors.accent1 }
              ]}>
                <Text style={styles.footerTitle}>Notes</Text>
                <Text style={styles.footerText}>{invoice.notes}</Text>
              </View>
            )}
          </View>
        </View>

        {/* ═══ MENTIONS LÉGALES ═══ */}
        {sections.showLegalMentions && customText.legalMentions && (
          <View style={styles.legalFooter}>
            <Text style={styles.legalText}>{customText.legalMentions}</Text>
          </View>
        )}
      </Page>
    </Document>
  );
};
