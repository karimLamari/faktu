/**
 * MINIMALISTE Template - Ultra Clean & Centered
 * Structure: Tout centré verticalement, maximum d'espace blanc
 * Style: Minimaliste extrême, mono-colonne, pas de bordures
 * DISTINCTION: Layout vertical centré, aucune décoration, focus sur le contenu essentiel
 */

import React from 'react';
import { Document, Page, Text, View, Image, StyleSheet } from '@react-pdf/renderer';
import type { TemplatePreset } from '../config/presets';
import { calculateVATByRate, formatCurrency, formatPercentage } from '../core/utils';

interface MinimalisteTemplateProps {
  invoice: any;
  client: any;
  user: any;
  template: TemplatePreset;
}

export const MinimalisteTemplate: React.FC<MinimalisteTemplateProps> = ({
  invoice,
  client,
  user,
  template,
}) => {
  const { colors, sections, customText } = template;
  const vatByRate = calculateVATByRate(invoice);

  // Utiliser les mentions légales du template personnalisé
  const legalMentions = customText?.legalMentions || '';

  // Styles minimalistes - TOUT CENTRÉ, AUCUNE BORDURE (COMPACT)
  const styles = StyleSheet.create({
    page: {
      padding: 30,
      backgroundColor: '#ffffff',
      fontFamily: 'Helvetica',
      alignItems: 'center',
    },
    // ═══ LOGO ET TITRE CENTRÉS ═══
    logoContainer: {
      alignItems: 'center',
      marginBottom: 15,
    },
    logo: {
      width: 40,
      height: 40,
      marginBottom: 8,
    },
    companyName: {
      fontSize: 10,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 3,
      textAlign: 'center',
    },
    companyDetails: {
      fontSize: 7,
      color: colors.secondary,
      lineHeight: 1.3,
      textAlign: 'center',
      marginBottom: 20,
    },
    // ═══ TITRE INVOICE MINIMALISTE ═══
    invoiceTitle: {
      fontSize: 28,
      fontWeight: 'bold',
      color: colors.primary,
      textAlign: 'center',
      marginBottom: 5,
      letterSpacing: -1,
    },
    invoiceNumber: {
      fontSize: 11,
      color: colors.text,
      textAlign: 'center',
      marginBottom: 3,
    },
    invoiceDates: {
      fontSize: 8,
      color: colors.secondary,
      textAlign: 'center',
      lineHeight: 1.4,
      marginBottom: 20,
    },
    // ═══ DIVIDER MINIMALISTE ═══
    divider: {
      width: '100%',
      borderTop: `1px solid ${colors.secondary}`,
      marginVertical: 15,
      opacity: 0.3,
    },
    // ═══ CLIENT INFO CENTRÉE ═══
    clientSection: {
      alignItems: 'center',
      marginBottom: 20,
      width: '100%',
    },
    clientLabel: {
      fontSize: 8,
      color: colors.secondary,
      marginBottom: 5,
      textTransform: 'uppercase',
      letterSpacing: 2,
      textAlign: 'center',
    },
    clientName: {
      fontSize: 14,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 6,
      textAlign: 'center',
    },
    clientDetails: {
      fontSize: 9,
      color: colors.secondary,
      lineHeight: 1.6,
      textAlign: 'center',
    },
    // ═══ ITEMS - PAS DE TABLEAU, LISTE SIMPLE ═══
    itemsList: {
      width: '100%',
      marginBottom: 20,
    },
    itemRow: {
      paddingVertical: 8,
      borderBottom: `1px solid #f3f4f6`,
    },
    itemRowLast: {
      paddingVertical: 8,
    },
    itemHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 3,
    },
    itemDesc: {
      fontSize: 9,
      fontWeight: 'bold',
      color: colors.text,
      flex: 1,
    },
    itemPrice: {
      fontSize: 9,
      fontWeight: 'bold',
      color: colors.text,
      textAlign: 'right',
      width: '25%',
    },
    itemMeta: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 2,
    },
    itemMetaText: {
      fontSize: 7,
      color: colors.secondary,
    },
    itemDetail: {
      fontSize: 7,
      color: colors.secondary,
      marginTop: 2,
      fontStyle: 'italic',
    },
    // ═══ TOTAUX MINIMALISTES ═══
    totalsSection: {
      width: '60%',
      alignSelf: 'center',
      marginBottom: 15,
    },
    totalRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: 4,
      fontSize: 9,
      color: colors.secondary,
    },
    totalRowFinal: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: 10,
      marginTop: 8,
      borderTop: `2px solid ${colors.primary}`,
      fontSize: 14,
      fontWeight: 'bold',
      color: colors.primary,
    },
    // ═══ FOOTER MINIMALISTE ═══
    footerSection: {
      width: '100%',
      alignItems: 'center',
      marginTop: 15,
      paddingTop: 12,
      borderTop: `1px solid #f3f4f6`,
    },
    bankLabel: {
      fontSize: 7,
      color: colors.secondary,
      marginBottom: 4,
      textTransform: 'uppercase',
      letterSpacing: 1,
      textAlign: 'center',
    },
    bankDetails: {
      fontSize: 8,
      color: colors.secondary,
      lineHeight: 1.5,
      textAlign: 'center',
      marginBottom: 15,
    },
    legalMentions: {
      fontSize: 6,
      color: colors.secondary,
      lineHeight: 1.4,
      textAlign: 'center',
      maxWidth: '80%',
    },
  });

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* ═══ LOGO ET ENTREPRISE CENTRÉS ═══ */}
        {sections.showLogo && user?.logo && (
          <View style={styles.logoContainer}>
            <Image src={user.logo} style={styles.logo} />
          </View>
        )}

        {sections.showCompanyDetails && (
          <View>
            <Text style={styles.companyName}>
              {user?.companyName || 'Entreprise'}
            </Text>
            <Text style={styles.companyDetails}>
              {user?.address?.street && `${user.address.street}`}
              {user?.address?.zipCode && user?.address?.city &&
                ` · ${user.address.zipCode} ${user.address.city}`}
              {user?.siret && `\nSIRET: ${user.siret}`}
            </Text>
          </View>
        )}

        {/* ═══ TITRE FACTURE ═══ */}
        <Text style={styles.invoiceTitle}>{customText.invoiceTitle || 'INVOICE'}</Text>
        <Text style={styles.invoiceNumber}>{invoice.invoiceNumber}</Text>
        <Text style={styles.invoiceDates}>
          {new Date(invoice.issueDate).toLocaleDateString('fr-FR')}
          {invoice.dueDate && ` · Due ${new Date(invoice.dueDate).toLocaleDateString('fr-FR')}`}
        </Text>

        <View style={styles.divider} />

        {/* ═══ CLIENT CENTRÉ ═══ */}
        {sections.showClientDetails && (
          <View style={styles.clientSection}>
            <Text style={styles.clientLabel}>Billed to</Text>
            <Text style={styles.clientName}>{client?.name || 'Client'}</Text>
            <Text style={styles.clientDetails}>
              {client?.address?.street && `${client.address.street}`}
              {client?.address?.zipCode && client?.address?.city &&
                ` · ${client.address.zipCode} ${client.address.city}`}
              {client?.email && `\n${client.email}`}
            </Text>
          </View>
        )}

        {/* ═══ ITEMS - LISTE SIMPLE (PAS DE TABLEAU) ═══ */}
        <View style={styles.itemsList}>
          {invoice.items.map((item: any, index: number) => {
            const isLast = index === invoice.items.length - 1;
            return (
              <View key={index} style={isLast ? styles.itemRowLast : styles.itemRow}>
                <View style={styles.itemHeader}>
                  <Text style={styles.itemDesc}>{item.description}</Text>
                  <Text style={styles.itemPrice}>
                    {formatCurrency(item.quantity * item.unitPrice)} €
                  </Text>
                </View>
                <View style={styles.itemMeta}>
                  <Text style={styles.itemMetaText}>
                    {item.quantity} × {formatCurrency(item.unitPrice)} € · TVA {formatPercentage(item.taxRate)}%
                  </Text>
                </View>
                {sections.showItemDetails && item.details && (
                  <Text style={styles.itemDetail}>{item.details}</Text>
                )}
              </View>
            );
          })}
        </View>

        {/* ═══ TOTAUX CENTRÉS ═══ */}
        <View style={styles.totalsSection}>
          <View style={styles.totalRow}>
            <Text>Subtotal</Text>
            <Text>{formatCurrency(invoice.subtotal || 0)} €</Text>
          </View>
          {Object.entries(vatByRate)
            .filter(([_, data]) => Number(data.amount) > 0)
            .map(([rate, data]) => (
              <View key={rate} style={styles.totalRow}>
                <Text>VAT {formatPercentage(Number(rate))}%</Text>
                <Text>{formatCurrency(data.amount)} €</Text>
              </View>
            ))}
          <View style={styles.totalRowFinal}>
            <Text>Total</Text>
            <Text>{formatCurrency(invoice.total || 0)} €</Text>
          </View>
        </View>

        {/* ═══ FOOTER MINIMALISTE ═══ */}
        <View style={styles.footerSection}>
          {sections.showBankDetails && (user?.iban || user?.bankDetails?.iban) && (
            <>
              <Text style={styles.bankLabel}>Bank Details</Text>
              <Text style={styles.bankDetails}>
                IBAN: {user?.iban || user?.bankDetails?.iban || 'N/A'}
                {(user?.bic || user?.bankDetails?.bic) && (
                  <>
                    {' · '}
                    BIC: {user?.bic || user?.bankDetails?.bic}
                  </>
                )}
              </Text>
            </>
          )}

          {sections.showLegalMentions && legalMentions && (
            <Text style={styles.legalMentions}>
              {legalMentions}
            </Text>
          )}
        </View>
      </Page>
    </Document>
  );
};
