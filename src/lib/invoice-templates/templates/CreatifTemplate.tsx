/**
 * CRÉATIF Template - Bold & Asymmetric
 * Structure: Header diagonal, layout asymétrique avec éléments décalés
 * Style: Moderne créatif, couleurs vives, formes géométriques
 * DISTINCTION: Design asymétrique avec header diagonal et éléments décalés
 */

import React from 'react';
import { Document, Page, Text, View, Image, StyleSheet } from '@react-pdf/renderer';
import type { TemplatePreset } from '../config/presets';
import { calculateVATByRate, formatCurrency, formatPercentage } from '../core/utils';

interface CreatifTemplateProps {
  invoice: any;
  client: any;
  user: any;
  template: TemplatePreset;
}

export const CreatifTemplate: React.FC<CreatifTemplateProps> = ({
  invoice,
  client,
  user,
  template,
}) => {
  const { colors, sections, customText } = template;
  const vatByRate = calculateVATByRate(invoice);

  // Styles créatifs - ASYMÉTRIQUE ET MODERNE (COMPACT)
  const styles = StyleSheet.create({
    page: {
      backgroundColor: '#ffffff',
      fontFamily: 'Helvetica',
    },
    // ═══ HEADER DIAGONAL COLORÉ ═══
    headerDiagonal: {
      backgroundColor: colors.primary,
      paddingVertical: 25,
      paddingHorizontal: 25,
      marginBottom: 15,
      position: 'relative',
    },
    headerContent: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    headerLeft: {
      flex: 1,
    },
    logo: {
      width: 45,
      height: 45,
      marginBottom: 8,
    },
    companyName: {
      fontSize: 14,
      fontWeight: 'bold',
      color: '#ffffff',
      marginBottom: 4,
    },
    companyDetails: {
      fontSize: 7,
      color: 'rgba(255,255,255,0.9)',
      lineHeight: 1.3,
    },
    headerRight: {
      alignItems: 'flex-end',
    },
    invoiceTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#ffffff',
      marginBottom: 4,
      textAlign: 'right',
    },
    invoiceNumber: {
      fontSize: 11,
      color: 'rgba(255,255,255,0.95)',
      fontWeight: 'bold',
      textAlign: 'right',
    },
    // ═══ ACCENT BAR (barre colorée décalée) ═══
    accentBar: {
      width: 120,
      height: 4,
      backgroundColor: colors.accent,
      marginLeft: 25,
      marginBottom: 15,
      borderRadius: 2,
    },
    // ═══ CONTENU PRINCIPAL ═══
    content: {
      paddingHorizontal: 25,
    },
    // Section dates décalée à droite
    datesSection: {
      alignSelf: 'flex-end',
      backgroundColor: colors.background || '#f8fafc',
      padding: 8,
      borderRadius: 6,
      marginBottom: 15,
      borderLeft: `3px solid ${colors.accent}`,
    },
    dateLabel: {
      fontSize: 7,
      color: colors.secondary,
      marginBottom: 2,
      textTransform: 'uppercase',
    },
    dateValue: {
      fontSize: 9,
      color: colors.text,
      fontWeight: 'bold',
    },
    // ═══ CLIENT SECTION - Card décalée à gauche ═══
    clientCard: {
      width: '60%',
      backgroundColor: '#f8fafc',
      padding: 12,
      borderRadius: 8,
      marginBottom: 15,
      borderTop: `3px solid ${colors.primary}`,
    },
    clientLabel: {
      fontSize: 8,
      fontWeight: 'bold',
      color: colors.primary,
      marginBottom: 5,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    clientName: {
      fontSize: 11,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 4,
    },
    clientDetails: {
      fontSize: 8,
      color: colors.secondary,
      lineHeight: 1.4,
    },
    // ═══ ITEMS TABLE - Style moderne avec accent colors ═══
    table: {
      marginBottom: 15,
    },
    tableHeader: {
      flexDirection: 'row',
      backgroundColor: colors.text,
      color: '#ffffff',
      padding: 8,
      fontSize: 8,
      fontWeight: 'bold',
      borderRadius: 6,
      marginBottom: 1,
    },
    tableRow: {
      flexDirection: 'row',
      padding: 6,
      borderBottom: `1px solid #e2e8f0`,
      fontSize: 8,
    },
    tableRowHighlight: {
      flexDirection: 'row',
      padding: 6,
      borderBottom: `1px solid #e2e8f0`,
      backgroundColor: `${colors.accent}15`,
      fontSize: 8,
    },
    colQty: { width: '10%' },
    colDesc: { width: '48%' },
    colUnit: { width: '16%', textAlign: 'right' },
    colTax: { width: '10%', textAlign: 'right' },
    colTotal: { width: '16%', textAlign: 'right', fontWeight: 'bold', color: colors.primary },
    itemDesc: {
      fontWeight: 'bold',
      color: colors.text,
    },
    itemDetail: {
      fontSize: 6,
      color: colors.secondary,
      marginTop: 1,
      fontStyle: 'italic',
    },
    // ═══ TOTAUX - Card décalée à droite avec couleurs ═══
    totalsCard: {
      alignSelf: 'flex-end',
      width: '50%',
      backgroundColor: colors.background || '#f8fafc',
      padding: 12,
      borderRadius: 8,
      marginBottom: 12,
    },
    totalRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: 4,
      fontSize: 9,
      color: colors.text,
    },
    totalRowVat: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: 3,
      fontSize: 8,
      color: colors.secondary,
    },
    totalRowFinal: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: 8,
      marginTop: 6,
      borderTop: `2px solid ${colors.primary}`,
      fontSize: 12,
      fontWeight: 'bold',
      color: colors.primary,
    },
    // ═══ FOOTER - Asymétrique avec 2 colonnes ═══
    footer: {
      flexDirection: 'row',
      paddingHorizontal: 25,
      paddingVertical: 10,
      borderTop: `1px solid ${colors.accent}`,
      marginTop: 10,
    },
    footerLeft: {
      flex: 1,
      paddingRight: 15,
    },
    footerRight: {
      flex: 1,
      paddingLeft: 15,
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
      color: colors.secondary,
      lineHeight: 1.3,
    },
  });

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* ═══ HEADER DIAGONAL COLORÉ ═══ */}
        <View style={styles.headerDiagonal}>
          <View style={styles.headerContent}>
            <View style={styles.headerLeft}>
              {sections.showLogo && user?.logo && (
                <Image src={user.logo} style={styles.logo} />
              )}
              {sections.showCompanyDetails && (
                <>
                  <Text style={styles.companyName}>
                    {user?.companyName || 'Entreprise'}
                  </Text>
                  <Text style={styles.companyDetails}>
                    {user?.address?.street && `${user.address.street}\n`}
                    {user?.address?.zipCode && user?.address?.city &&
                      `${user.address.zipCode} ${user.address.city}\n`}
                    {user?.siret && `SIRET: ${user.siret}`}
                  </Text>
                </>
              )}
            </View>

            <View style={styles.headerRight}>
              <Text style={styles.invoiceTitle}>{customText.invoiceTitle || 'FACTURE'}</Text>
              <Text style={styles.invoiceNumber}>{invoice.invoiceNumber}</Text>
            </View>
          </View>
        </View>

        {/* ═══ ACCENT BAR ═══ */}
        <View style={styles.accentBar} />

        {/* ═══ CONTENU ═══ */}
        <View style={styles.content}>
          {/* Dates décalées à droite */}
          <View style={styles.datesSection}>
            <View style={{ marginBottom: 6 }}>
              <Text style={styles.dateLabel}>Date d'émission</Text>
              <Text style={styles.dateValue}>
                {new Date(invoice.issueDate).toLocaleDateString('fr-FR')}
              </Text>
            </View>
            {invoice.dueDate && (
              <View>
                <Text style={styles.dateLabel}>Date d'échéance</Text>
                <Text style={styles.dateValue}>
                  {new Date(invoice.dueDate).toLocaleDateString('fr-FR')}
                </Text>
              </View>
            )}
          </View>

          {/* Client card décalée à gauche */}
          {sections.showClientDetails && (
            <View style={styles.clientCard}>
              <Text style={styles.clientLabel}>Facturé à</Text>
              <Text style={styles.clientName}>{client?.name || 'Client'}</Text>
              <Text style={styles.clientDetails}>
                {client?.address?.street && `${client.address.street}\n`}
                {client?.address?.zipCode && client?.address?.city &&
                  `${client.address.zipCode} ${client.address.city}\n`}
                {client?.email && `${client.email}\n`}
                {client?.companyInfo?.siret && `SIRET: ${client.companyInfo.siret}`}
              </Text>
            </View>
          )}

          {/* Items table */}
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={styles.colQty}>Qté</Text>
              <Text style={styles.colDesc}>Description</Text>
              <Text style={styles.colUnit}>P.U. HT</Text>
              <Text style={styles.colTax}>TVA</Text>
              <Text style={styles.colTotal}>Total HT</Text>
            </View>

            {invoice.items.map((item: any, index: number) => (
              <View key={index} style={index % 3 === 0 ? styles.tableRowHighlight : styles.tableRow}>
                <Text style={styles.colQty}>{item.quantity}</Text>
                <View style={styles.colDesc}>
                  <Text style={styles.itemDesc}>{item.description}</Text>
                  {sections.showItemDetails && item.details && (
                    <Text style={styles.itemDetail}>{item.details}</Text>
                  )}
                </View>
                <Text style={styles.colUnit}>{formatCurrency(item.unitPrice)} €</Text>
                <Text style={styles.colTax}>{formatPercentage(item.taxRate)}%</Text>
                <Text style={styles.colTotal}>
                  {formatCurrency(item.quantity * item.unitPrice)} €
                </Text>
              </View>
            ))}
          </View>

          {/* Totaux décalés à droite */}
          <View style={styles.totalsCard}>
            <View style={styles.totalRow}>
              <Text>Total HT</Text>
              <Text>{formatCurrency(invoice.subtotal)} €</Text>
            </View>
            {Object.entries(vatByRate)
              .filter(([_, amount]) => Number(amount) > 0)
              .map(([rate, amount]) => (
                <View key={rate} style={styles.totalRowVat}>
                  <Text>TVA {formatPercentage(Number(rate))}%</Text>
                  <Text>{formatCurrency(amount)} €</Text>
                </View>
              ))}
            <View style={styles.totalRowFinal}>
              <Text>TOTAL TTC</Text>
              <Text>{formatCurrency(invoice.total)} €</Text>
            </View>
          </View>
        </View>

        {/* ═══ FOOTER À 2 COLONNES ═══ */}
        <View style={styles.footer}>
          <View style={styles.footerLeft}>
            {sections.showBankDetails && (user?.iban || user?.bankDetails?.iban) && (
              <>
                <Text style={styles.footerTitle}>
                  {customText.bankDetailsLabel || 'Coordonnées Bancaires'}
                </Text>
                <Text style={styles.footerText}>
                  IBAN: {user?.iban || user?.bankDetails?.iban || 'N/A'}{'\n'}
                  BIC: {user?.bic || user?.bankDetails?.bic || 'N/A'}
                </Text>
              </>
            )}
          </View>

          <View style={styles.footerRight}>
            {sections.showLegalMentions && customText.legalMentions && (
              <>
                <Text style={styles.footerTitle}>Mentions Légales</Text>
                <Text style={styles.footerText}>{customText.legalMentions}</Text>
              </>
            )}
          </View>
        </View>
      </Page>
    </Document>
  );
};
