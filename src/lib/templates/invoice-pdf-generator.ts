/**
 * Générateur dynamique de factures PDF
 * Génère le HTML à partir d'un template personnalisable
 */

import type { TemplatePreset } from '@/lib/invoice-templates/presets';

interface GenerateInvoiceHtmlParams {
  invoice: any;
  client: any;
  user: any;
  template: TemplatePreset;
}

/**
 * Génère le HTML de la facture à partir d'un template
 */
export function generateInvoiceHtml({
  invoice,
  client,
  user,
  template,
}: GenerateInvoiceHtmlParams): string {
  const { colors, fonts, layout, sections, customText } = template;

  // Configuration du logo
  const logoSizeMap = {
    small: '50px',
    medium: '65px',
    large: '80px',
  };
  const logoSize = logoSizeMap[layout.logoSize];

  // Configuration de l'espacement
  const spacingMap = {
    compact: { section: '15px', inner: '8px', line: '1.25' },
    normal: { section: '20px', inner: '12px', line: '1.3' },
    relaxed: { section: '25px', inner: '15px', line: '1.4' },
  };
  const spacing = spacingMap[layout.spacing];

  // Configuration de l'alignement du header
  const headerAlignMap = {
    left: 'flex-start',
    center: 'center',
    right: 'flex-end',
  };
  const headerAlign = headerAlignMap[layout.logoPosition];

  // Génération des lignes d'items
  const itemsRows = invoice.items
    .map(
      (item: any) => `
    <tr>
      <td class="qty-column">${item.quantity}</td>
      <td class="description-column">
        <strong>${item.description}</strong>
        ${
          sections.showItemDetails && item.details
            ? `<br/><span style="color: ${colors.secondary}; font-size: ${fonts.size.small}px;">${item.details}</span>`
            : ''
        }
      </td>
      <td class="unit-price-column">${Number(item.unitPrice).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €</td>
      <td class="tva-column">${typeof item.taxRate === 'number' ? item.taxRate.toLocaleString('fr-FR', { minimumFractionDigits: 1 }) : '0.0'}%</td>
      <td class="total-column">${(item.quantity * item.unitPrice).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €</td>
    </tr>
  `
    )
    .join('');

  // Calcul TVA par taux
  const tvaByRate: { [rate: number]: number } = {};
  for (const item of invoice.items) {
    const rate = typeof item.taxRate === 'number' ? item.taxRate : 0;
    const base = item.quantity * item.unitPrice;
    const tva = base * (rate / 100);
    if (!tvaByRate[rate]) tvaByRate[rate] = 0;
    tvaByRate[rate] += tva;
  }

  const tvaRows = Object.entries(tvaByRate)
    .filter(([rate, amount]) => Number(amount) > 0)
    .sort((a, b) => Number(a[0]) - Number(b[0]))
    .map(
      ([rate, amount]) => `
      <tr>
        <td class="label">TVA (${Number(rate).toLocaleString('fr-FR', { minimumFractionDigits: 1 })}):</td>
        <td class="value">${Number(amount).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €</td>
      </tr>
    `
    )
    .join('');

  return `
    <!DOCTYPE html>
    <html lang="fr">
      <head>
        <meta charset="UTF-8" />
        <title>Facture ${invoice.invoiceNumber}</title>
        <style>
          @page { 
            size: A4; 
            margin: 10mm 12mm 10mm 12mm;
          }
          
          :root {
            --color-primary: ${colors.primary};
            --color-secondary: ${colors.secondary};
            --color-accent: ${colors.accent};
            --color-text: ${colors.text};
            --color-bg: ${colors.background};
            --font-heading: ${fonts.heading};
            --font-body: ${fonts.body};
            --font-size-base: ${fonts.size.base}px;
            --font-size-heading: ${fonts.size.heading}px;
            --font-size-small: ${fonts.size.small}px;
            --border-radius: ${layout.borderRadius}px;
            --spacing-section: ${spacing.section};
            --spacing-inner: ${spacing.inner};
            --line-height: ${spacing.line};
          }
          
          body { 
            font-family: var(--font-body); 
            margin: 0; 
            padding: 0; 
            background: var(--color-bg); 
            font-size: var(--font-size-base); 
            line-height: var(--line-height);
            color: var(--color-text);
            box-sizing: border-box;
          }
          
          /* Padding uniquement pour l'affichage écran (preview), pas pour le PDF */
          @media screen {
            body {
              padding: 15mm 12mm;
            }
          }
          
          .container { 
            max-width: 100%; 
            margin: 0 auto;
            position: relative;
          }
          
          .header { 
            display: flex; 
            justify-content: ${headerAlign}; 
            align-items: flex-start;
            margin-bottom: var(--spacing-section);
            padding-bottom: var(--spacing-inner);
            ${layout.headerStyle === 'modern' ? `border-bottom: 2px solid var(--color-primary);` : ''}
            ${layout.headerStyle === 'classic' ? `border-bottom: 3px double var(--color-primary);` : ''}
          }
          
          .company-info {
            flex: 1;
            display: flex;
            align-items: center;
            gap: var(--spacing-inner);
          }
          
          .company-logo {
            max-width: ${logoSize};
            max-height: ${logoSize};
            object-fit: contain;
            border-radius: var(--border-radius);
          }
          
          .company-name {
            font-size: var(--font-size-heading);
            font-weight: 700;
            color: var(--color-primary);
            margin-bottom: 8px;
            letter-spacing: 0.5px;
            font-family: var(--font-heading);
          }
          
          .company-details {
            font-size: var(--font-size-small);
            color: var(--color-secondary);
            line-height: 1.5;
          }
          
          .invoice-title {
            font-size: calc(var(--font-size-heading) + 4px);
            font-weight: 700;
            color: var(--color-primary);
            text-align: right;
            font-family: var(--font-heading);
            ${layout.headerStyle === 'minimal' ? 'letter-spacing: 4px;' : ''}
          }
          
          .invoice-number {
            font-size: calc(var(--font-size-base) + 2px);
            color: var(--color-secondary);
            text-align: right;
            margin-top: 5px;
          }
          
          .parties-section {
            display: flex;
            justify-content: space-between;
            gap: 40px;
            margin-bottom: var(--spacing-section);
          }
          
          .party-box {
            flex: 1;
            padding: var(--spacing-inner);
            background: ${layout.headerStyle === 'minimal' ? colors.background : '#f8f9fa'};
            border-radius: var(--border-radius);
            ${layout.headerStyle === 'classic' ? `border: 1px solid ${colors.secondary};` : ''}
          }
          
          .party-title {
            font-weight: 700;
            color: var(--color-primary);
            margin-bottom: 8px;
            font-size: calc(var(--font-size-base) + 1px);
          }
          
          .party-details {
            font-size: var(--font-size-base);
            color: var(--color-text);
            line-height: 1.6;
          }
          
          .dates-section {
            display: flex;
            justify-content: space-between;
            margin-bottom: var(--spacing-section);
            font-size: var(--font-size-base);
          }
          
          .date-item strong {
            color: var(--color-primary);
          }
          
          .items-section {
            margin-bottom: var(--spacing-section);
          }
          
          .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
          }
          
          .items-table thead {
            background: var(--color-primary);
            color: white;
          }
          
          .items-table th {
            padding: 12px 8px;
            text-align: left;
            font-weight: 600;
            font-size: var(--font-size-small);
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          
          .items-table th:first-child {
            border-top-left-radius: var(--border-radius);
          }
          
          .items-table th:last-child {
            border-top-right-radius: var(--border-radius);
          }
          
          .items-table td {
            padding: 10px 8px;
            border-bottom: 1px solid #e5e7eb;
            font-size: var(--font-size-base);
          }
          
          .items-table tbody tr:last-child td {
            border-bottom: none;
          }
          
          .items-table tbody tr:hover {
            background: #f9fafb;
          }
          
          .qty-column { width: 8%; text-align: center; }
          .description-column { width: 45%; }
          .unit-price-column { width: 15%; text-align: right; }
          .tva-column { width: 12%; text-align: center; }
          .total-column { width: 20%; text-align: right; font-weight: 600; }
          
          .totals-section {
            display: flex;
            justify-content: flex-end;
            margin-bottom: var(--spacing-section);
          }
          
          .totals-table {
            width: 350px;
            border-collapse: collapse;
          }
          
          .totals-table td {
            padding: 8px 12px;
            font-size: var(--font-size-base);
          }
          
          .totals-table .label {
            text-align: right;
            color: var(--color-secondary);
          }
          
          .totals-table .value {
            text-align: right;
            font-weight: 600;
            width: 150px;
          }
          
          .totals-table .subtotal {
            border-top: 1px solid #e5e7eb;
          }
          
          .totals-table .grand-total {
            background: var(--color-primary);
            color: white;
            font-size: calc(var(--font-size-base) + 2px);
            border-radius: var(--border-radius);
          }
          
          .totals-table .amount-paid .value {
            color: var(--color-accent);
          }
          
          .totals-table .balance-due {
            border-top: 2px solid var(--color-primary);
            background: #f8f9fa;
          }
          
          .footer {
            margin-top: var(--spacing-section);
            padding-top: var(--spacing-inner);
            ${layout.headerStyle !== 'minimal' ? `border-top: 1px solid #e5e7eb;` : ''}
          }
          
          .payment-info,
          .bank-details {
            margin-bottom: var(--spacing-inner);
            font-size: var(--font-size-small);
            line-height: 1.6;
          }
          
          .payment-terms,
          .bank-details strong {
            font-weight: 700;
            color: var(--color-primary);
            display: block;
            margin-bottom: 5px;
          }
          
          .iban {
            font-family: 'Courier New', monospace;
            background: #f1f5f9;
            padding: 2px 6px;
            border-radius: calc(var(--border-radius) / 2);
            color: var(--color-text);
          }
          
          .legal-mentions {
            font-size: calc(var(--font-size-small) - 1px);
            color: var(--color-secondary);
            line-height: 1.6;
            margin-top: var(--spacing-inner);
            padding: var(--spacing-inner);
            background: #f9fafb;
            border-radius: var(--border-radius);
            border-left: 3px solid var(--color-primary);
            white-space: pre-line; /* Préserver les sauts de ligne */
          }
          
          .legal-mentions strong {
            color: var(--color-text);
            font-weight: 600;
          }
          
          .footer-text {
            text-align: center;
            font-size: var(--font-size-base);
            color: var(--color-secondary);
            margin-top: var(--spacing-inner);
            font-style: italic;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <!-- Header -->
          <div class="header">
            ${
              sections.showCompanyDetails
                ? `
            <div class="company-info">
              ${
                sections.showLogo && user?.logo
                  ? `<img src="${user.logo}" alt="Logo" class="company-logo" />`
                  : ''
              }
              <div>
                <div class="company-name">${user?.companyName || user?.firstName + ' ' + user?.lastName || ''}</div>
                <div class="company-details">
                  ${user?.address?.street || ''}<br/>
                  ${user?.address?.zipCode || ''} ${user?.address?.city || ''}<br/>
                  ${user?.siret ? `SIRET: ${user.siret}<br/>` : ''}
                  ${user?.email || ''} • ${user?.phone || ''}
                </div>
              </div>
            </div>
            `
                : ''
            }
            <div>
              <div class="invoice-title">${customText.invoiceTitle}</div>
              <div class="invoice-number">N° ${invoice.invoiceNumber}</div>
            </div>
          </div>

          <!-- Parties (Emetteur/Destinataire) -->
          <div class="parties-section">
            ${
              sections.showCompanyDetails
                ? `
            <div class="party-box">
              <div class="party-title">Émetteur</div>
              <div class="party-details">
                <strong>${user?.companyName || user?.firstName + ' ' + user?.lastName || ''}</strong><br/>
                ${user?.address?.street || ''}<br/>
                ${user?.address?.zipCode || ''} ${user?.address?.city || ''}<br/>
                ${user?.siret ? `SIRET: ${user.siret}` : ''}
              </div>
            </div>
            `
                : ''
            }
            ${
              sections.showClientDetails
                ? `
            <div class="party-box">
              <div class="party-title">Destinataire</div>
              <div class="party-details">
                <strong>${client?.type === 'company' ? client.companyInfo?.name : client.firstName + ' ' + client.lastName}</strong><br/>
                ${client?.address?.street || ''}<br/>
                ${client?.address?.zipCode || ''} ${client?.address?.city || ''}<br/>
                ${client?.type === 'company' && client.companyInfo?.siret ? `SIRET: ${client.companyInfo.siret}` : ''}
              </div>
            </div>
            `
                : ''
            }
          </div>

          <!-- Dates -->
          <div class="dates-section">
            <div class="date-item">
              <strong>Date d'émission:</strong> ${new Date(invoice.issueDate).toLocaleDateString('fr-FR')}
            </div>
            <div class="date-item">
              <strong>Date d'échéance:</strong> ${new Date(invoice.dueDate).toLocaleDateString('fr-FR')}
            </div>
          </div>

          <!-- Items -->
          <div class="items-section">
            <table class="items-table">
              <thead>
                <tr>
                  <th class="qty-column">Qté</th>
                  <th class="description-column">Description</th>
                  <th class="unit-price-column">PU HT</th>
                  <th class="tva-column">TVA</th>
                  <th class="total-column">Total HT</th>
                </tr>
              </thead>
              <tbody>
                ${itemsRows}
              </tbody>
            </table>
          </div>

          <!-- Totaux -->
          <div class="totals-section">
            <table class="totals-table">
              <tr class="subtotal">
                <td class="label">Sous-total HT :</td>
                <td class="value">${Number(invoice.subtotal).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €</td>
              </tr>
              ${tvaRows}
              <tr class="grand-total">
                <td class="label">TOTAL TTC :</td>
                <td class="value">${Number(invoice.total).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €</td>
              </tr>
              ${
                invoice.amountPaid > 0
                  ? `
              <tr class="amount-paid">
                <td class="label">Montant payé :</td>
                <td class="value">- ${Number(invoice.amountPaid).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €</td>
              </tr>
              <tr class="balance-due">
                <td class="label"><strong>RESTE À PAYER :</strong></td>
                <td class="value"><strong>${Number(invoice.balanceDue || invoice.total - invoice.amountPaid).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €</strong></td>
              </tr>
              `
                  : ''
              }
            </table>
          </div>

          <!-- Footer -->
          <div class="footer">
            ${
              sections.showPaymentTerms
                ? `
            <div class="payment-info">
              <div class="payment-terms">${customText.paymentTermsLabel}</div>
              <div>Paiement par virement bancaire dans les 30 jours</div>
            </div>
            `
                : ''
            }
            
            ${
              sections.showBankDetails
                ? `
            <div class="bank-details">
              <strong>${customText.bankDetailsLabel}</strong>
              <div>Banque : ${user?.bankName || ''} • IBAN : <span class="iban">${user?.iban || ''}</span></div>
              <div>${user?.bic ? `BIC : ${user.bic} • ` : ''}${user?.bankCode ? `Code banque : ${user.bankCode} • ` : ''}${user?.branchCode ? `Code guichet : ${user.branchCode}` : ''}</div>
            </div>
            `
                : ''
            }
            
            ${
              sections.showLegalMentions && customText.legalMentions
                ? `
            <div class="legal-mentions">
              ${customText.legalMentions}
            </div>
            `
                : ''
            }
            
            ${
              customText.footerText
                ? `
            <div class="footer-text">
              ${customText.footerText}
            </div>
            `
                : ''
            }
          </div>
        </div>
      </body>
    </html>
  `;
}
