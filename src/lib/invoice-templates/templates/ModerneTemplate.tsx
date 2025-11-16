/**
 * MODERNE Template - Design épuré et moderne
 * Layout: Barre de couleur à gauche + Contenu principal épuré
 * Optimisé: Padding 28px, fontSize 8-9px pour tenir sur 1 page A4
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

  // Utiliser les mentions légales du template personnalisé
  const legalMentions = customText?.legalMentions || '';

  const formatDate = (date: string | Date) => {
    const d = new Date(date);
    return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
  };

  const styles = StyleSheet.create({
    page: {
      flexDirection: 'row',
      padding: 28,
      fontFamily: 'Helvetica',
      fontSize: 8,
      backgroundColor: colors.background || '#ffffff',
    },
    sidebar: {
      width: '30%',
      backgroundColor: colors.primary || '#2563eb',
      marginRight: 20,
      padding: 18,
      borderRadius: 6,
    },
    mainContent: {
      flex: 1,
    },
    logo: {
      width: 50,
      height: 50,
      marginBottom: 15,
      objectFit: 'contain',
    },
    companyName: {
      fontSize: 11,
      fontWeight: 'bold',
      color: '#ffffff',
      marginBottom: 6,
    },
    companyDetails: {
      fontSize: 7,
      color: '#ffffff',
      lineHeight: 1.4,
      opacity: 0.9,
    },
    invoiceTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.primary || '#2563eb',
      marginBottom: 8,
    },
    invoiceNumber: {
      fontSize: 9,
      color: colors.text || '#1e293b',
      marginBottom: 4,
    },
    dates: {
      fontSize: 7,
      color: colors.secondary || '#64748b',
      marginBottom: 15,
    },
    clientSection: {
      marginBottom: 15,
      padding: 12,
      backgroundColor: '#f8fafc',
      borderLeft: `3px solid ${colors.primary || '#2563eb'}`,
    },
    clientTitle: {
      fontSize: 8,
      fontWeight: 'bold',
      color: colors.text || '#1e293b',
      marginBottom: 6,
    },
    clientDetails: {
      fontSize: 7,
      color: colors.secondary || '#64748b',
      lineHeight: 1.4,
    },
    table: {
      marginBottom: 15,
    },
    tableHeader: {
      flexDirection: 'row',
      backgroundColor: colors.primary || '#2563eb',
      padding: 8,
      borderTopLeftRadius: 4,
      borderTopRightRadius: 4,
    },
    tableHeaderText: {
      fontSize: 7,
      fontWeight: 'bold',
      color: '#ffffff',
    },
    tableRow: {
      flexDirection: 'row',
      borderBottom: '1px solid #e2e8f0',
      padding: 6,
    },
    tableCell: {
      fontSize: 7,
      color: colors.text || '#1e293b',
    },
    col1: { width: '40%' },
    col2: { width: '20%', textAlign: 'right' },
    col3: { width: '15%', textAlign: 'right' },
    col4: { width: '25%', textAlign: 'right' },
    totalsSection: {
      marginTop: 10,
      alignItems: 'flex-end',
    },
    totalRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      width: '50%',
      padding: 4,
      fontSize: 7,
    },
    totalLabel: {
      color: colors.secondary || '#64748b',
    },
    totalValue: {
      color: colors.text || '#1e293b',
      fontWeight: 'bold',
    },
    finalTotal: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      width: '50%',
      padding: 8,
      backgroundColor: colors.primary || '#2563eb',
      marginTop: 4,
      borderRadius: 4,
    },
    finalTotalLabel: {
      fontSize: 9,
      fontWeight: 'bold',
      color: '#ffffff',
    },
    finalTotalValue: {
      fontSize: 10,
      fontWeight: 'bold',
      color: '#ffffff',
    },
    bankDetails: {
      marginTop: 15,
      padding: 12,
      backgroundColor: '#f8fafc',
      borderRadius: 4,
    },
    bankTitle: {
      fontSize: 8,
      fontWeight: 'bold',
      color: colors.text || '#1e293b',
      marginBottom: 6,
    },
    bankInfo: {
      fontSize: 7,
      color: colors.secondary || '#64748b',
      lineHeight: 1.4,
    },
    legalMentions: {
      marginTop: 15,
      fontSize: 6,
      color: colors.secondary || '#64748b',
      lineHeight: 1.3,
      textAlign: 'justify',
    },
    footer: {
      marginTop: 15,
      paddingTop: 10,
      borderTop: `1px solid ${colors.secondary || '#64748b'}`,
      fontSize: 6,
      color: colors.secondary || '#64748b',
      textAlign: 'center',
    },
  });

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Sidebar gauche colorée */}
        <View style={styles.sidebar}>
          {sections.showLogo && user?.logo && (
            <Image src={user.logo} style={styles.logo} />
          )}
          {sections.showCompanyDetails && (
            <View>
              <Text style={styles.companyName}>{user?.companyName || 'Entreprise'}</Text>
              <Text style={styles.companyDetails}>
                {user?.address?.street && `${user.address.street}\n`}
                {user?.address?.zipCode && user?.address?.city && `${user.address.zipCode} ${user.address.city}\n`}
                {user?.email && `${user.email}\n`}
                {user?.phone && user.phone}
              </Text>
            </View>
          )}
        </View>

        {/* Contenu principal */}
        <View style={styles.mainContent}>
          {/* En-tête facture */}
          <Text style={styles.invoiceTitle}>FACTURE</Text>
          <Text style={styles.invoiceNumber}>N° {invoice.invoiceNumber}</Text>
          <Text style={styles.dates}>
            Date : {formatDate(invoice.issueDate)}
            {invoice.dueDate && ` | Échéance : ${formatDate(invoice.dueDate)}`}
          </Text>

          {/* Section client */}
          {sections.showClientDetails && (
            <View style={styles.clientSection}>
              <Text style={styles.clientTitle}>Client</Text>
              <Text style={styles.clientDetails}>
                {client?.name || 'Client'}{'\n'}
                {client?.address?.street && `${client.address.street}\n`}
                {client?.address?.zipCode && client?.address?.city && `${client.address.zipCode} ${client.address.city}\n`}
                {client?.email && client.email}
              </Text>
            </View>
          )}

          {/* Tableau des items */}
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderText, styles.col1]}>Description</Text>
              <Text style={[styles.tableHeaderText, styles.col2]}>Quantité</Text>
              <Text style={[styles.tableHeaderText, styles.col3]}>Prix HT</Text>
              <Text style={[styles.tableHeaderText, styles.col4]}>Total HT</Text>
            </View>
            {invoice.items?.map((item: any, index: number) => {
              const itemTotal = (item.quantity || 0) * (item.unitPrice || 0);
              return (
                <View key={index} style={styles.tableRow}>
                  <Text style={[styles.tableCell, styles.col1]}>{item.description}</Text>
                  <Text style={[styles.tableCell, styles.col2]}>{item.quantity}</Text>
                  <Text style={[styles.tableCell, styles.col3]}>{formatCurrency(item.unitPrice)} €</Text>
                  <Text style={[styles.tableCell, styles.col4]}>{formatCurrency(itemTotal)} €</Text>
                </View>
              );
            })}
          </View>

          {/* Totaux */}
          <View style={styles.totalsSection}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Sous-total HT</Text>
              <Text style={styles.totalValue}>{formatCurrency(invoice.subtotal || 0)} €</Text>
            </View>
            {Object.entries(vatByRate).map(([rate, data]: [string, any]) => (
              <View key={rate} style={styles.totalRow}>
                <Text style={styles.totalLabel}>TVA {rate}%</Text>
                <Text style={styles.totalValue}>{formatCurrency(data.amount)} €</Text>
              </View>
            ))}
            <View style={styles.finalTotal}>
              <Text style={styles.finalTotalLabel}>Total TTC</Text>
              <Text style={styles.finalTotalValue}>{formatCurrency(invoice.total || 0)} €</Text>
            </View>
          </View>

          {/* Coordonnées bancaires */}
          {sections.showBankDetails && (
            <View style={styles.bankDetails}>
              <Text style={styles.bankTitle}>Coordonnées bancaires</Text>
              <Text style={styles.bankInfo}>
                {user?.iban && `IBAN : ${user.iban}\n`}
                {user?.bankName && user.bankName}
              </Text>
            </View>
          )}

          {/* Mentions légales */}
          {sections.showLegalMentions && legalMentions && (
            <Text style={styles.legalMentions}>{legalMentions}</Text>
          )}

          {/* Footer */}
          <Text style={styles.footer}>
            {user?.companyName || 'Entreprise'} - Document généré électroniquement
          </Text>
        </View>
      </Page>
    </Document>
  );
};
