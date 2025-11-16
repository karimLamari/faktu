/**
 * CLASSIQUE Template Component
 * Design "Papier à en-tête" professionnel avec cadre décoratif
 * Layout: En-tête vertical centré + Cadre doré + Sections bien délimitées
 * Typographie: Serif élégante, espacements généreux
 */

import React from 'react';
import { Document, Page, Text, View, Image, StyleSheet } from '@react-pdf/renderer';
import type { TemplatePreset } from '../config/presets';
import { calculateVATByRate, formatCurrency, formatPercentage } from '../core/utils';

interface ClassiqueTemplateProps {
  invoice: any;
  client: any;
  user: any;
  template: TemplatePreset;
}

export const ClassiqueTemplate: React.FC<ClassiqueTemplateProps> = ({
  invoice,
  client,
  user,
  template,
}) => {
  const { sections, customText, colors } = template;
  const vatByRate = calculateVATByRate(invoice);

  // Utiliser les mentions légales du template personnalisé
  const legalMentions = customText?.legalMentions || '';

  // Styles internes pour template Classique
  const styles = StyleSheet.create({
    page: {
      padding: 25,
      fontFamily: 'Helvetica',
      backgroundColor: colors.background || '#fefdf7',
    },
    decorativeBorder: {
      position: 'absolute',
      top: 12,
      left: 12,
      right: 12,
      bottom: 12,
      border: `3px double ${colors.secondary}`,
    },
    header: {
      alignItems: 'center',
      paddingTop: 20,
      paddingBottom: 15,
      borderBottom: `2px solid ${colors.primary}`,
      marginBottom: 15,
    },
    logo: {
      width: 70,
      height: 70,
      marginBottom: 10,
      objectFit: 'contain',
    },
    companyName: {
      fontSize: 16,
      fontWeight: 'bold',
      color: colors.primary,
      marginBottom: 3,
      letterSpacing: 1,
    },
    companyDetails: {
      fontSize: 8,
      color: colors.text,
      textAlign: 'center',
      lineHeight: 1.3,
    },
    invoiceBlock: {
      alignItems: 'center',
      marginBottom: 15,
      padding: 10,
      backgroundColor: colors.background,
      borderTop: `2px solid ${colors.accent}`,
      borderBottom: `2px solid ${colors.accent}`,
    },
    invoiceTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: colors.primary,
      letterSpacing: 2,
    },
    invoiceNumber: {
      fontSize: 10,
      color: colors.text,
      marginTop: 3,
    },
    dates: {
      flexDirection: 'row',
      gap: 12,
      marginTop: 4,
      fontSize: 7,
      color: colors.secondary,
    },
    clientSection: {
      marginBottom: 12,
      padding: 10,
      border: `1px solid ${colors.secondary}`,
      backgroundColor: '#fafaf8',
    },
    clientLabel: {
      fontSize: 8,
      fontWeight: 'bold',
      color: colors.secondary,
      marginBottom: 5,
      letterSpacing: 1,
    },
    clientDetails: {
      fontSize: 9,
      color: colors.text,
      lineHeight: 1.4,
    },
    tableHeader: {
      flexDirection: 'row',
      backgroundColor: colors.primary,
      color: '#ffffff',
      padding: 6,
      fontSize: 8,
      fontWeight: 'bold',
    },
    tableRow: {
      flexDirection: 'row',
      padding: 6,
      borderBottom: `1px solid ${colors.secondary}`,
      fontSize: 8,
    },
    tableRowAlt: {
      flexDirection: 'row',
      padding: 6,
      borderBottom: `1px solid ${colors.secondary}`,
      backgroundColor: '#fafaf8',
      fontSize: 8,
    },
    totalsBox: {
      width: '40%',
      border: `2px solid ${colors.primary}`,
      padding: 8,
      backgroundColor: '#fafaf8',
    },
    totalRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 3,
      fontSize: 8,
    },
    totalFinal: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 5,
      paddingTop: 5,
      borderTop: `2px solid ${colors.accent}`,
      fontSize: 10,
      fontWeight: 'bold',
      color: colors.primary,
    },
    footer: {
      marginTop: 10,
      paddingTop: 8,
      borderTop: `1px solid ${colors.secondary}`,
      fontSize: 6,
      color: colors.secondary,
      lineHeight: 1.2,
    },
  });

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Cadre décoratif */}
        <View style={styles.decorativeBorder} />
        
        {/* En-tête */}
        <View style={styles.header}>
          {sections.showLogo && user?.logo && (
            <Image src={user.logo} style={styles.logo} />
          )}
          
          {sections.showCompanyDetails && (
            <>
              <Text style={styles.companyName}>
                {user?.companyName || 'ENTREPRISE'}
              </Text>
              <Text style={styles.companyDetails}>
                {user?.siret && `SIRET: ${user.siret} • `}
                {user?.address?.street}, {user?.address?.zipCode} {user?.address?.city}
              </Text>
            </>
          )}
        </View>

        {/* Bloc FACTURE */}
        <View style={styles.invoiceBlock}>
          <Text style={styles.invoiceTitle}>{customText.invoiceTitle}</Text>
          <Text style={styles.invoiceNumber}>N° {invoice.invoiceNumber}</Text>
          <View style={styles.dates}>
            <Text>Émise: {new Date(invoice.issueDate).toLocaleDateString('fr-FR')}</Text>
            {invoice.dueDate && (
              <Text>Échéance: {new Date(invoice.dueDate).toLocaleDateString('fr-FR')}</Text>
            )}
          </View>
        </View>

        {/* Client */}
        {sections.showClientDetails && (
          <View style={styles.clientSection}>
            <Text style={styles.clientLabel}>FACTURÉ À:</Text>
            <Text style={styles.clientDetails}>
              {client?.name || 'Client'}{'\n'}
              {client?.address?.street}, {client?.address?.zipCode} {client?.address?.city}
              {client?.companyInfo?.siret && `\nSIRET: ${client.companyInfo.siret}`}
            </Text>
          </View>
        )}

        {/* Tableau */}
        <View style={{ marginBottom: 12 }}>
          <View style={styles.tableHeader}>
            <Text style={{ width: '40%' }}>DÉSIGNATION</Text>
            <Text style={{ width: '15%', textAlign: 'center' }}>QTÉ</Text>
            <Text style={{ width: '20%', textAlign: 'right' }}>P.U.</Text>
            <Text style={{ width: '10%', textAlign: 'center' }}>TVA</Text>
            <Text style={{ width: '15%', textAlign: 'right' }}>TOTAL HT</Text>
          </View>

          {invoice.items.map((item: any, index: number) => (
            <View key={index} style={index % 2 === 0 ? styles.tableRow : styles.tableRowAlt}>
              <Text style={{ width: '40%' }}>{item.description}</Text>
              <Text style={{ width: '15%', textAlign: 'center' }}>{item.quantity}</Text>
              <Text style={{ width: '20%', textAlign: 'right' }}>{formatCurrency(item.unitPrice)} €</Text>
              <Text style={{ width: '10%', textAlign: 'center' }}>{formatPercentage(item.taxRate)}%</Text>
              <Text style={{ width: '15%', textAlign: 'right' }}>
                {formatCurrency(item.quantity * item.unitPrice)} €
              </Text>
            </View>
          ))}
        </View>

        {/* Totaux */}
        <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 12 }}>
          <View style={styles.totalsBox}>
            <View style={styles.totalRow}>
              <Text>Total HT:</Text>
              <Text>{formatCurrency(invoice.subtotal)} €</Text>
            </View>

            {Object.entries(vatByRate).map(([rate, data]) => (
              <View key={rate} style={styles.totalRow}>
                <Text>TVA ({Number(rate).toFixed(1)}%):</Text>
                <Text>{formatCurrency(data.amount)} €</Text>
              </View>
            ))}

            <View style={styles.totalFinal}>
              <Text>TOTAL TTC:</Text>
              <Text>{formatCurrency(invoice.total)} €</Text>
            </View>
          </View>
        </View>

        {/* Bank details - compact */}
        {sections.showBankDetails && user?.iban && (
          <View style={{ padding: 8, backgroundColor: '#fafaf8', marginBottom: 8 }}>
            <Text style={{ fontSize: 7, fontWeight: 'bold', color: colors.secondary, marginBottom: 2 }}>
              {customText.bankDetailsLabel.toUpperCase()}
            </Text>
            <Text style={{ fontSize: 7, color: colors.text }}>
              IBAN: {user.iban}
            </Text>
          </View>
        )}

        {/* Mentions légales - compact */}
        {sections.showLegalMentions && legalMentions && (
          <View style={styles.footer}>
            <Text>{legalMentions}</Text>
          </View>
        )}
      </Page>
    </Document>
  );
};
