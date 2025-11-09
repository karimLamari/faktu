/**
 * Invoice PDF Template using @react-pdf/renderer
 * Supports customizable templates (Modern, Classic, Minimal, Creative)
 */

import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
  Image,
} from '@react-pdf/renderer';
import type { TemplatePreset } from '@/lib/invoice-templates/presets';

// Register fonts (fallback to built-in fonts for better compatibility)
Font.register({
  family: 'Helvetica',
  fonts: [
    { src: 'Helvetica' },
    { src: 'Helvetica-Bold', fontWeight: 'bold' },
  ],
});

interface InvoicePDFProps {
  invoice: any;
  client: any;
  user: any;
  template: TemplatePreset;
}

/**
 * Create dynamic styles based on template configuration
 */
const createStyles = (template: TemplatePreset) => {
  const { colors, fonts, layout, sections } = template;

  // Spacing configuration
  const spacingMap = {
    compact: { section: 12, inner: 6, padding: 20 },
    normal: { section: 16, inner: 10, padding: 25 },
    relaxed: { section: 20, inner: 12, padding: 30 },
  };
  const spacing = spacingMap[layout.spacing];

  // Logo size configuration
  const logoSizeMap = {
    small: 40,
    medium: 55,
    large: 70,
  };
  const logoSize = logoSizeMap[layout.logoSize];

  return StyleSheet.create({
    page: {
      padding: spacing.padding,
      fontFamily: 'Helvetica',
      fontSize: fonts.size.base,
      color: colors.text,
      backgroundColor: colors.background,
    },

    // Header styles
    header: {
      flexDirection: layout.logoPosition === 'right' ? 'row-reverse' : 'row',
      justifyContent: 'space-between',
      marginBottom: spacing.section,
      paddingBottom: spacing.inner,
      borderBottom: layout.headerStyle === 'classic'
        ? `3px double ${colors.primary}`
        : layout.headerStyle === 'modern'
        ? `2px solid ${colors.primary}`
        : undefined,
    },

    headerLeft: {
      flex: 1,
      alignItems: layout.logoPosition === 'center' ? 'center' : 'flex-start',
    },

    headerRight: {
      alignItems: 'flex-end',
    },

    logo: {
      width: logoSize,
      height: logoSize,
      marginBottom: 8,
      objectFit: 'contain',
    },

    companyName: {
      fontSize: fonts.size.heading,
      fontWeight: 'bold',
      color: colors.primary,
      marginBottom: 4,
    },

    companyDetails: {
      fontSize: fonts.size.small,
      color: colors.secondary,
      lineHeight: 1.4,
    },

    invoiceTitle: {
      fontSize: fonts.size.heading + 2,
      fontWeight: 'bold',
      color: colors.primary,
      marginBottom: 6,
    },

    invoiceNumber: {
      fontSize: fonts.size.base,
      marginBottom: 3,
    },

    invoiceDate: {
      fontSize: fonts.size.small,
      color: colors.secondary,
    },

    // Client section
    clientSection: {
      marginBottom: spacing.section,
      padding: spacing.inner,
      backgroundColor: layout.headerStyle === 'modern' ? '#F9FAFB' : 'transparent',
      borderRadius: layout.borderRadius,
    },

    sectionTitle: {
      fontSize: fonts.size.base + 1,
      fontWeight: 'bold',
      color: colors.primary,
      marginBottom: 6,
    },

    clientDetails: {
      fontSize: fonts.size.base,
      lineHeight: 1.4,
    },

    // Items table
    table: {
      marginBottom: spacing.section,
    },

    tableHeader: {
      flexDirection: 'row',
      backgroundColor: colors.primary,
      color: '#FFFFFF',
      padding: 8,
      fontWeight: 'bold',
      fontSize: fonts.size.small,
    },

    tableRow: {
      flexDirection: 'row',
      borderBottom: `1px solid #E5E7EB`,
      padding: 6,
      fontSize: fonts.size.base,
    },

    tableRowAlt: {
      flexDirection: 'row',
      borderBottom: `1px solid #E5E7EB`,
      padding: 6,
      backgroundColor: '#F9FAFB',
      fontSize: fonts.size.base,
    },

    colQty: { width: '8%' },
    colDescription: { width: '42%' },
    colUnitPrice: { width: '20%', textAlign: 'right' },
    colTax: { width: '10%', textAlign: 'right' },
    colTotal: { width: '20%', textAlign: 'right' },

    itemDescription: {
      fontWeight: 'bold',
    },

    itemDetails: {
      fontSize: fonts.size.small,
      color: colors.secondary,
      marginTop: 2,
    },

    // Totals section
    totalsSection: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      marginBottom: spacing.section,
    },

    totalsBox: {
      width: '45%',
      borderTop: `2px solid ${colors.primary}`,
      paddingTop: spacing.inner,
    },

    totalRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 4,
      fontSize: fonts.size.base,
    },

    totalRowBold: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 6,
      paddingTop: 6,
      borderTop: `1px solid ${colors.secondary}`,
      fontSize: fonts.size.base + 1,
      fontWeight: 'bold',
      color: colors.primary,
    },

    // Payment info
    paymentSection: {
      marginBottom: spacing.section,
      padding: spacing.inner,
      backgroundColor: '#F9FAFB',
      borderRadius: layout.borderRadius,
      borderLeft: `4px solid ${colors.accent}`,
    },

    paymentTitle: {
      fontSize: fonts.size.base + 1,
      fontWeight: 'bold',
      color: colors.primary,
      marginBottom: 6,
    },

    paymentDetails: {
      fontSize: fonts.size.small,
      lineHeight: 1.5,
    },

    // Legal mentions
    legalSection: {
      marginTop: spacing.section,
      paddingTop: spacing.inner,
      borderTop: `1px solid #E5E7EB`,
      fontSize: fonts.size.small - 1,
      color: colors.secondary,
      lineHeight: 1.4,
    },

    // Footer
    footer: {
      position: 'absolute',
      bottom: spacing.padding,
      left: spacing.padding,
      right: spacing.padding,
      textAlign: 'center',
      fontSize: fonts.size.small,
      color: colors.secondary,
    },
  });
};

/**
 * Invoice PDF Document Component
 */
export const InvoicePDF: React.FC<InvoicePDFProps> = ({ invoice, client, user, template }) => {
  const styles = createStyles(template);
  const { sections, customText } = template;

  // Calculate VAT breakdown
  const vatByRate: { [rate: number]: number } = {};
  for (const item of invoice.items) {
    const rate = typeof item.taxRate === 'number' ? item.taxRate : 0;
    const base = item.quantity * item.unitPrice;
    const vat = base * (rate / 100);
    if (!vatByRate[rate]) vatByRate[rate] = 0;
    vatByRate[rate] += vat;
  }

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            {sections.showLogo && user?.logo && (
              <Image src={user.logo} style={styles.logo} />
            )}
            {sections.showCompanyDetails && (
              <>
                <Text style={styles.companyName}>{user?.companyName || 'Entreprise'}</Text>
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
            <Text style={styles.invoiceTitle}>{customText.invoiceTitle}</Text>
            <Text style={styles.invoiceNumber}>N° {invoice.invoiceNumber}</Text>
            <Text style={styles.invoiceDate}>
              Date: {new Date(invoice.issueDate).toLocaleDateString('fr-FR')}
            </Text>
            {invoice.dueDate && (
              <Text style={styles.invoiceDate}>
                Échéance: {new Date(invoice.dueDate).toLocaleDateString('fr-FR')}
              </Text>
            )}
          </View>
        </View>

        {/* Client Section */}
        {sections.showClientDetails && (
          <View style={styles.clientSection}>
            <Text style={styles.sectionTitle}>Facturé à</Text>
            <Text style={styles.clientDetails}>
              {client?.name || 'Client'}{'\n'}
              {client?.address?.street && `${client.address.street}\n`}
              {client?.address?.zipCode && client?.address?.city &&
                `${client.address.zipCode} ${client.address.city}\n`}
              {client?.email && `Email: ${client.email}\n`}
              {client?.siret && `SIRET: ${client.siret}`}
            </Text>
          </View>
        )}

        {/* Items Table */}
        <View style={styles.table}>
          {/* Table Header */}
          <View style={styles.tableHeader}>
            <Text style={styles.colQty}>Qté</Text>
            <Text style={styles.colDescription}>Description</Text>
            <Text style={styles.colUnitPrice}>Prix Unit.</Text>
            <Text style={styles.colTax}>TVA</Text>
            <Text style={styles.colTotal}>Total HT</Text>
          </View>

          {/* Table Rows */}
          {invoice.items.map((item: any, index: number) => (
            <View key={index} style={index % 2 === 0 ? styles.tableRow : styles.tableRowAlt}>
              <Text style={styles.colQty}>{item.quantity}</Text>
              <View style={styles.colDescription}>
                <Text style={styles.itemDescription}>{item.description}</Text>
                {sections.showItemDetails && item.details && (
                  <Text style={styles.itemDetails}>{item.details}</Text>
                )}
              </View>
              <Text style={styles.colUnitPrice}>
                {Number(item.unitPrice).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
              </Text>
              <Text style={styles.colTax}>
                {typeof item.taxRate === 'number'
                  ? item.taxRate.toLocaleString('fr-FR', { minimumFractionDigits: 1 })
                  : '0.0'}%
              </Text>
              <Text style={styles.colTotal}>
                {(item.quantity * item.unitPrice).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
              </Text>
            </View>
          ))}
        </View>

        {/* Totals */}
        <View style={styles.totalsSection}>
          <View style={styles.totalsBox}>
            <View style={styles.totalRow}>
              <Text>Total HT:</Text>
              <Text>{Number(invoice.subtotal).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €</Text>
            </View>

            {/* VAT breakdown */}
            {Object.entries(vatByRate)
              .filter(([_, amount]) => Number(amount) > 0)
              .sort((a, b) => Number(a[0]) - Number(b[0]))
              .map(([rate, amount]) => (
                <View key={rate} style={styles.totalRow}>
                  <Text>TVA ({Number(rate).toFixed(1)}%):</Text>
                  <Text>{Number(amount).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €</Text>
                </View>
              ))}

            <View style={styles.totalRowBold}>
              <Text>Total TTC:</Text>
              <Text>{Number(invoice.total).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €</Text>
            </View>

            {invoice.amountPaid > 0 && (
              <>
                <View style={styles.totalRow}>
                  <Text>Déjà payé:</Text>
                  <Text>{Number(invoice.amountPaid).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €</Text>
                </View>
                <View style={styles.totalRowBold}>
                  <Text>Reste à payer:</Text>
                  <Text>{Number(invoice.balanceDue).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €</Text>
                </View>
              </>
            )}
          </View>
        </View>

        {/* Payment Terms */}
        {sections.showPaymentTerms && invoice.paymentTerms && (
          <View style={styles.paymentSection}>
            <Text style={styles.paymentTitle}>{customText.paymentTermsLabel}</Text>
            <Text style={styles.paymentDetails}>{invoice.paymentTerms}</Text>
          </View>
        )}

        {/* Bank Details */}
        {sections.showBankDetails && user?.bankDetails && (
          <View style={styles.paymentSection}>
            <Text style={styles.paymentTitle}>{customText.bankDetailsLabel}</Text>
            <Text style={styles.paymentDetails}>
              {user.bankDetails.bankName && `Banque: ${user.bankDetails.bankName}\n`}
              {user.bankDetails.iban && `IBAN: ${user.bankDetails.iban}\n`}
              {user.bankDetails.bic && `BIC: ${user.bankDetails.bic}`}
            </Text>
          </View>
        )}

        {/* Legal Mentions */}
        {sections.showLegalMentions && customText.legalMentions && (
          <View style={styles.legalSection}>
            <Text>{customText.legalMentions}</Text>
          </View>
        )}

        {/* Footer */}
        {customText.footerText && (
          <View style={styles.footer}>
            <Text>{customText.footerText}</Text>
          </View>
        )}
      </Page>
    </Document>
  );
};
