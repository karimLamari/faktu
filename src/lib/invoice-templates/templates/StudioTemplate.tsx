/**
 * STUDIO Template - Creative & Asymmetric
 * Structure: Barre accent latérale + Layout asymétrique
 * Style: Créatif, moderne, dynamique, artistique
 * DISTINCTION: Barre d'accent verticale à gauche + disposition asymétrique
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

  // Utiliser les mentions légales du template personnalisé
  const legalMentions = customText?.legalMentions || '';

  const styles = StyleSheet.create({
    page: {
      flexDirection: 'row',
      backgroundColor: '#ffffff',
      fontFamily: 'Helvetica',
      fontSize: 8,
    },
    accentBar: {
      width: 8,
      backgroundColor: colors.accent,
    },
    contentArea: {
      flex: 1,
      padding: 28,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 18,
      paddingBottom: 14,
      borderBottom: `2px solid ${colors.accent}`,
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
      fontSize: 12,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 4,
    },
    companyDetails: {
      fontSize: 7.5,
      color: colors.secondary,
      lineHeight: 1.4,
    },
    headerRight: {
      alignItems: 'flex-end',
    },
    invoiceTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: colors.primary,
      marginBottom: 6,
    },
    invoiceNumber: {
      fontSize: 10,
      color: colors.text,
      marginBottom: 3,
    },
    invoiceDates: {
      fontSize: 7.5,
      color: colors.secondary,
      textAlign: 'right',
      lineHeight: 1.5,
    },
    clientSection: {
      backgroundColor: colors.background,
      padding: 12,
      marginBottom: 16,
      borderLeft: `3px solid ${colors.accent}`,
    },
    clientLabel: {
      fontSize: 8,
      fontWeight: 'bold',
      color: colors.primary,
      marginBottom: 5,
      textTransform: 'uppercase',
    },
    clientName: {
      fontSize: 10,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 4,
    },
    clientDetails: {
      fontSize: 8,
      color: colors.secondary,
      lineHeight: 1.4,
    },
    table: {
      marginBottom: 14,
    },
    tableHeader: {
      flexDirection: 'row',
      backgroundColor: colors.primary,
      color: '#ffffff',
      padding: 6,
      fontSize: 8,
      fontWeight: 'bold',
      borderTopLeftRadius: 2,
      borderTopRightRadius: 2,
    },
    tableRow: {
      flexDirection: 'row',
      padding: 6,
      borderBottom: `1px solid ${colors.secondary}22`,
      fontSize: 8,
    },
    tableRowAlt: {
      flexDirection: 'row',
      padding: 6,
      borderBottom: `1px solid ${colors.secondary}22`,
      backgroundColor: '#fafbfc',
      fontSize: 8,
    },
    colQty: { width: '8%', textAlign: 'center' },
    colDesc: { width: '50%' },
    colUnit: { width: '16%', textAlign: 'right' },
    colTax: { width: '10%', textAlign: 'right' },
    colTotal: { width: '16%', textAlign: 'right', fontWeight: 'bold' },
    itemDesc: { fontWeight: 'bold', color: colors.text },
    totalsWrapper: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 14,
    },
    totalsLeft: {
      width: '52%',
    },
    totalsRight: {
      width: '44%',
    },
    totalRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      padding: 5,
      fontSize: 8,
    },
    totalRowFinal: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      padding: 8,
      backgroundColor: colors.accent,
      color: '#ffffff',
      fontSize: 11,
      fontWeight: 'bold',
      borderRadius: 3,
      marginTop: 5,
    },
    bankDetails: {
      fontSize: 7.5,
      color: colors.secondary,
      lineHeight: 1.4,
    },
    footer: {
      fontSize: 6.5,
      color: colors.secondary,
      lineHeight: 1.3,
      paddingTop: 10,
      borderTop: `1px solid ${colors.secondary}33`,
    },
  });

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* BARRE ACCENT LATÉRALE */}
        <View style={styles.accentBar} />

        {/* CONTENU PRINCIPAL */}
        <View style={styles.contentArea}>
          {/* HEADER ASYMÉTRIQUE */}
          <View style={styles.header}>
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
                    {user?.siret && `SIRET: ${user.siret}\n`}
                    {user?.vatNumber && `TVA: ${user.vatNumber}`}
                  </Text>
                </>
              )}
            </View>

            <View style={styles.headerRight}>
              <Text style={styles.invoiceTitle}>FACTURE</Text>
              <Text style={styles.invoiceNumber}>{invoice.invoiceNumber}</Text>
              <Text style={styles.invoiceDates}>
                Émise le {new Date(invoice.issueDate).toLocaleDateString('fr-FR')}
                {'\n'}
                {invoice.dueDate && `Échéance: ${new Date(invoice.dueDate).toLocaleDateString('fr-FR')}`}
              </Text>
            </View>
          </View>

          {/* CLIENT */}
          {sections.showClientDetails && (
            <View style={styles.clientSection}>
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

          {/* TABLEAU PRESTATIONS */}
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={styles.colQty}>Qté</Text>
              <Text style={styles.colDesc}>Description</Text>
              <Text style={styles.colUnit}>P.U. HT</Text>
              <Text style={styles.colTax}>TVA</Text>
              <Text style={styles.colTotal}>Total HT</Text>
            </View>

            {invoice.items.map((item: any, index: number) => (
              <View
                key={index}
                style={index % 2 === 0 ? styles.tableRow : styles.tableRowAlt}
              >
                <Text style={styles.colQty}>{item.quantity}</Text>
                <View style={styles.colDesc}>
                  <Text style={styles.itemDesc}>{item.description}</Text>
                </View>
                <Text style={styles.colUnit}>{formatCurrency(item.unitPrice)} €</Text>
                <Text style={styles.colTax}>{formatPercentage(item.taxRate)}%</Text>
                <Text style={styles.colTotal}>
                  {formatCurrency(item.quantity * item.unitPrice)} €
                </Text>
              </View>
            ))}
          </View>

          {/* TOTAUX + COORDONNÉES BANCAIRES */}
          <View style={styles.totalsWrapper}>
            <View style={styles.totalsLeft}>
              {sections.showBankDetails && (user?.iban || user?.bankDetails?.iban) && (
                <View>
                  <Text style={[styles.clientLabel, { marginBottom: 5 }]}>
                    Règlement par virement
                  </Text>
                  <Text style={styles.bankDetails}>
                    IBAN: {user?.iban || user?.bankDetails?.iban || 'N/A'}
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.totalsRight}>
              <View style={styles.totalRow}>
                <Text>Total HT:</Text>
                <Text>{formatCurrency(invoice.subtotal || 0)} €</Text>
              </View>
              {Object.entries(vatByRate)
                .filter(([_, data]) => Number(data.amount) > 0)
                .map(([rate, data]) => (
                  <View key={rate} style={styles.totalRow}>
                    <Text>TVA {formatPercentage(Number(rate))}%:</Text>
                    <Text>{formatCurrency(data.amount)} €</Text>
                  </View>
                ))}
              <View style={styles.totalRowFinal}>
                <Text>TOTAL TTC</Text>
                <Text>{formatCurrency(invoice.total || 0)} €</Text>
              </View>
            </View>
          </View>

          {/* MENTIONS LÉGALES */}
          {sections.showLegalMentions && legalMentions && (
            <View style={styles.footer}>
              <Text>{legalMentions}</Text>
            </View>
          )}
        </View>
      </Page>
    </Document>
  );
};
