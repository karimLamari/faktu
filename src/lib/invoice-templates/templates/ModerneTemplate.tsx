/**
 * MODERNE Template - Clean & Professional
 * Structure: Barre latérale gauche colorée + Layout à 2 colonnes
 * Style: Moderne, épuré, couleurs vives, sans-serif
 * DISTINCTION: Sidebar gauche avec toutes les infos entreprise, contenu principal à droite
 */

import React from 'react';
import { Document, Page, Text, View, Image, StyleSheet } from '@react-pdf/renderer';
import type { TemplatePreset } from '../config/presets';
import { calculateVATByRate, formatCurrency, formatPercentage } from '../core/utils';

interface ModerneTemplateProps {
  invoice: any;
  client: any;
  user: any;
  template: TemplatePreset;
}

export const ModerneTemplate: React.FC<ModerneTemplateProps> = ({
  invoice,
  client,
  user,
  template,
}) => {
  const { colors, sections, customText } = template;
  const vatByRate = calculateVATByRate(invoice);

  // Styles spécifiques au template Moderne - SIDEBAR LAYOUT
  const styles = StyleSheet.create({
    page: {
      flexDirection: 'row',
      backgroundColor: '#ffffff',
      fontFamily: 'Helvetica',
    },
    // ═══ BARRE LATÉRALE GAUCHE COLORÉE (30%) ═══
    sidebar: {
      width: '30%',
      backgroundColor: colors.primary,
      padding: 25,
      color: '#ffffff',
    },
    sidebarLogo: {
      width: 70,
      height: 70,
      marginBottom: 15,
      alignSelf: 'center',
    },
    sidebarCompanyName: {
      fontSize: 14,
      fontWeight: 'bold',
      marginBottom: 12,
      color: '#ffffff',
      textAlign: 'center',
    },
    sidebarDetails: {
      fontSize: 8,
      lineHeight: 1.6,
      color: 'rgba(255,255,255,0.9)',
      marginBottom: 20,
    },
    sidebarDivider: {
      borderTop: '1px solid rgba(255,255,255,0.3)',
      marginVertical: 15,
    },
    sidebarSection: {
      marginBottom: 15,
    },
    sidebarLabel: {
      fontSize: 8,
      fontWeight: 'bold',
      marginBottom: 5,
      color: 'rgba(255,255,255,0.7)',
      textTransform: 'uppercase',
    },
    sidebarValue: {
      fontSize: 8,
      lineHeight: 1.5,
      color: '#ffffff',
    },
    // ═══ CONTENU PRINCIPAL (70%) ═══
    mainContent: {
      width: '70%',
      padding: 30,
    },
    invoiceTitle: {
      fontSize: 28,
      fontWeight: 'bold',
      color: colors.primary,
      marginBottom: 8,
    },
    invoiceNumber: {
      fontSize: 12,
      color: colors.text,
      marginBottom: 4,
    },
    invoiceDates: {
      fontSize: 9,
      color: colors.secondary,
      lineHeight: 1.6,
      marginBottom: 25,
    },
    clientCard: {
      backgroundColor: '#f8fafc',
      padding: 15,
      borderRadius: 8,
      marginBottom: 25,
      borderLeft: `3px solid ${colors.accent}`,
    },
    clientLabel: {
      fontSize: 9,
      fontWeight: 'bold',
      color: colors.primary,
      marginBottom: 6,
      textTransform: 'uppercase',
    },
    clientName: {
      fontSize: 12,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 5,
    },
    clientDetails: {
      fontSize: 9,
      color: colors.secondary,
      lineHeight: 1.5,
    },
    table: {
      marginBottom: 20,
    },
    tableHeader: {
      flexDirection: 'row',
      backgroundColor: colors.primary,
      color: '#ffffff',
      padding: 10,
      borderTopLeftRadius: 6,
      borderTopRightRadius: 6,
      fontSize: 9,
      fontWeight: 'bold',
    },
    tableRow: {
      flexDirection: 'row',
      padding: 8,
      borderBottom: '1px solid #e2e8f0',
      fontSize: 9,
    },
    tableRowAlt: {
      flexDirection: 'row',
      padding: 8,
      borderBottom: '1px solid #e2e8f0',
      backgroundColor: '#f8fafc',
      fontSize: 9,
    },
    colQty: { width: '10%', textAlign: 'center' },
    colDesc: { width: '48%' },
    colUnit: { width: '16%', textAlign: 'right' },
    colTax: { width: '10%', textAlign: 'right' },
    colTotal: { width: '16%', textAlign: 'right', fontWeight: 'bold' },
    itemDesc: { fontWeight: 'bold', color: colors.text },
    itemDetail: { fontSize: 7, color: colors.secondary, marginTop: 2 },
    totalsSection: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      marginBottom: 20,
    },
    totalsBox: { width: '48%' },
    totalRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      padding: 6,
      fontSize: 10,
    },
    totalRowFinal: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      padding: 10,
      backgroundColor: colors.primary,
      color: '#ffffff',
      fontSize: 12,
      fontWeight: 'bold',
      borderRadius: 6,
      marginTop: 6,
    },
    footer: {
      marginTop: 'auto',
      paddingTop: 15,
      borderTop: '1px solid #e2e8f0',
      fontSize: 7,
      color: colors.secondary,
      lineHeight: 1.4,
    },
  });

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* ═══ SIDEBAR GAUCHE ═══ */}
        <View style={styles.sidebar}>
          {sections.showLogo && user?.logo && (
            <Image src={user.logo} style={styles.sidebarLogo} />
          )}
          
          {sections.showCompanyDetails && (
            <>
              <Text style={styles.sidebarCompanyName}>
                {user?.companyName || 'Entreprise'}
              </Text>
              <Text style={styles.sidebarDetails}>
                {user?.address?.street && `${user.address.street}\n`}
                {user?.address?.zipCode && user?.address?.city &&
                  `${user.address.zipCode} ${user.address.city}\n`}
                {user?.siret && `SIRET: ${user.siret}\n`}
                {user?.vatNumber && `TVA: ${user.vatNumber}`}
              </Text>
            </>
          )}

          <View style={styles.sidebarDivider} />

          {sections.showBankDetails && (user?.iban || user?.bankDetails?.iban) && (
            <View style={styles.sidebarSection}>
              <Text style={styles.sidebarLabel}>
                {customText.bankDetailsLabel || 'Coordonnées Bancaires'}
              </Text>
              <Text style={styles.sidebarValue}>
                IBAN: {user?.iban || user?.bankDetails?.iban || 'N/A'}{'\n'}
                BIC: {user?.bic || user?.bankDetails?.bic || 'N/A'}
              </Text>
            </View>
          )}
        </View>

        {/* ═══ CONTENU PRINCIPAL ═══ */}
        <View style={styles.mainContent}>
          <Text style={styles.invoiceTitle}>{customText.invoiceTitle || 'FACTURE'}</Text>
          <Text style={styles.invoiceNumber}>N° {invoice.invoiceNumber}</Text>
          <Text style={styles.invoiceDates}>
            Date: {new Date(invoice.issueDate).toLocaleDateString('fr-FR')}
            {invoice.dueDate && `\nÉchéance: ${new Date(invoice.dueDate).toLocaleDateString('fr-FR')}`}
          </Text>

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

          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={styles.colQty}>Qté</Text>
              <Text style={styles.colDesc}>Description</Text>
              <Text style={styles.colUnit}>P.U. HT</Text>
              <Text style={styles.colTax}>TVA</Text>
              <Text style={styles.colTotal}>Total HT</Text>
            </View>

            {invoice.items.map((item: any, index: number) => (
              <View key={index} style={index % 2 === 0 ? styles.tableRow : styles.tableRowAlt}>
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

          <View style={styles.totalsSection}>
            <View style={styles.totalsBox}>
              <View style={styles.totalRow}>
                <Text>Total HT:</Text>
                <Text>{formatCurrency(invoice.totalHT)} €</Text>
              </View>
              {Object.entries(vatByRate)
                .filter(([_, amount]) => Number(amount) > 0)
                .map(([rate, amount]) => (
                  <View key={rate} style={styles.totalRow}>
                    <Text>TVA ({formatPercentage(Number(rate))}%):</Text>
                    <Text>{formatCurrency(amount)} €</Text>
                  </View>
                ))}
              <View style={styles.totalRowFinal}>
                <Text>TOTAL TTC</Text>
                <Text>{formatCurrency(invoice.totalTTC)} €</Text>
              </View>
            </View>
          </View>

          {sections.showLegalMentions && customText.legalMentions && (
            <View style={styles.footer}>
              <Text>{customText.legalMentions}</Text>
            </View>
          )}
        </View>
      </Page>
    </Document>
  );
};
