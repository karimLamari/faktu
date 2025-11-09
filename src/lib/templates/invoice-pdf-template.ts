/**
 * Template HTML pour la génération PDF de facture
 * Utilisé pour les téléchargements PDF et les pièces jointes email
 */

interface InvoiceHtmlProps {
  invoice: any;
  client: any;
  user: any;
}

export function InvoiceHtml({ invoice, client, user }: InvoiceHtmlProps): string {
  const itemsRows = invoice.items.map((item: any) => `
    <tr>
      <td class="qty-column">${item.quantity}</td>
      <td class="description-column">
        <strong>${item.description}</strong><br/>
        <span style="color: #666; font-size: 10px;">${item.details || ''}</span>
      </td>
      <td class="unit-price-column">${Number(item.unitPrice).toLocaleString('fr-FR', {minimumFractionDigits:2})} €</td>
      <td class="tva-column">${typeof item.taxRate === 'number' ? item.taxRate.toLocaleString('fr-FR', {minimumFractionDigits:1}) : '0.0'}%</td>
      <td class="total-column">${(item.quantity * item.unitPrice).toLocaleString('fr-FR', {minimumFractionDigits:2})} €</td>
    </tr>
  `).join('');
  
  // Regrouper les montants de TVA par taux
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
    .map(([rate, amount]) => `
      <tr>
        <td class="label">TVA (${Number(rate).toLocaleString('fr-FR', {minimumFractionDigits:1})}%):</td>
        <td class="value">${Number(amount).toLocaleString('fr-FR', {minimumFractionDigits:2})} €</td>
      </tr>
    `).join('');

  return `
    <!DOCTYPE html>
    <html lang=\"fr\">
      <head>
        <meta charSet=\"UTF-8\" />
        <title>Facture ${invoice.invoiceNumber}</title>
        <style>
          @page { 
            size: A4; 
            margin: 12mm 15mm 12mm 15mm;
          }
          body { 
            font-family: 'Helvetica Neue', Arial, sans-serif; 
            margin: 0; 
            padding: 0; 
            background: #ffffff; 
            font-size: 11px; 
            line-height: 1.3;
            color: #333333;
          }
          .container { 
            max-width: 100%; 
            margin: 0 auto;
            position: relative;
          }
          .header { 
            display: flex; 
            justify-content: space-between; 
            align-items: flex-start;
            margin-bottom: 20px;
            padding-bottom: 15px;
            border-bottom: 2px solid #2c5aa0;
          }
          .company-info {
            flex: 1;
            display: flex;
            align-items: center;
            gap: 12px;
          }
          .company-logo {
            max-width: 70px;
            max-height: 70px;
            object-fit: contain;
          }
          .company-details-wrapper {
            flex: 1;
          }
          .company-name {
            font-size: 20px;
            font-weight: 700;
            color: #2c5aa0;
            margin-bottom: 6px;
            letter-spacing: 0.5px;
          }
          .company-details {
            font-size: 10px;
            color: #666666;
            line-height: 1.4;
          }
          .invoice-meta {
            text-align: right;
            min-width: 180px;
          }
          .invoice-title {
            font-size: 24px;
            font-weight: 300;
            color: #2c5aa0;
            margin-bottom: 12px;
            letter-spacing: 1px;
          }
          .invoice-number {
            font-size: 13px;
            font-weight: 600;
            color: #333333;
            margin-bottom: 4px;
          }
          .invoice-date {
            font-size: 10px;
            color: #666666;
          }
          .info-section {
            display: flex;
            justify-content: space-between;
            margin-bottom: 20px;
            gap: 30px;
          }
          .info-block {
            flex: 1;
            padding: 12px;
            background: #f8f9fa;
            border-radius: 4px;
          }
          .info-label {
            font-size: 9px;
            font-weight: 600;
            color: #2c5aa0;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 6px;
            display: block;
          }
          .info-content {
            font-size: 10px;
            color: #333333;
            line-height: 1.5;
          }
          .items-section {
            margin-bottom: 20px;
          }
          .items-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 10px;
          }
          .items-table th {
            background: #2c5aa0;
            color: white;
            padding: 10px 6px;
            text-align: left;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            font-size: 9px;
          }
          .items-table th:first-child {
            border-top-left-radius: 4px;
          }
          .items-table th:last-child {
            border-top-right-radius: 4px;
          }
          .items-table td {
            padding: 8px 6px;
            border-bottom: 1px solid #e9ecef;
          }
          .items-table tr:hover {
            background: #f8f9fa;
          }
          .qty-column { width: 50px; text-align: center; }
          .description-column { width: auto; }
          .unit-price-column { width: 90px; text-align: right; }
          .tva-column { width: 70px; text-align: right; }
          .total-column { width: 90px; text-align: right; font-weight: 600; }
          
          /* Alignement des en-têtes avec les colonnes */
          .items-table th.qty-column { text-align: center; }
          .items-table th.unit-price-column { text-align: right; }
          .items-table th.tva-column { text-align: right; }
          .items-table th.total-column { text-align: right; }
          .totals-section {
            display: flex;
            justify-content: flex-end;
            margin-bottom: 20px;
          }
          .totals-table {
            width: 280px;
            border-collapse: collapse;
            font-size: 11px;
          }
          .totals-table td {
            padding: 6px 10px;
            border-bottom: 1px solid #e9ecef;
          }
          .totals-table .label {
            text-align: right;
            color: #666666;
            font-weight: 500;
          }
          .totals-table .value {
            text-align: right;
            font-weight: 600;
            color: #333333;
            min-width: 90px;
          }
          .totals-table .subtotal {
            border-top: 2px solid #e9ecef;
            padding-top: 8px;
          }
          .totals-table .grand-total {
            background: #2c5aa0;
            color: white;
            font-size: 13px;
            font-weight: 700;
            border: none;
          }
          .totals-table .grand-total .label,
          .totals-table .grand-total .value {
            color: white;
            padding: 10px;
          }
          .footer {
            margin-top: 25px;
            padding-top: 15px;
            border-top: 1px solid #e9ecef;
            font-size: 9px;
            color: #666666;
          }
          .payment-info {
            text-align: center;
            margin-bottom: 12px;
          }
          .payment-terms {
            font-weight: 600;
            color: #2c5aa0;
            margin-bottom: 5px;
            letter-spacing: 0.5px;
          }
          .bank-details {
            background: #f8f9fa;
            padding: 10px;
            border-radius: 4px;
            margin-bottom: 12px;
            text-align: center;
          }
          .iban {
            font-family: monospace;
            font-size: 10px;
            font-weight: 600;
            color: #2c5aa0;
            letter-spacing: 1px;
          }
          .legal-mentions {
            text-align: center;
            font-size: 8px;
            color: #999999;
            line-height: 1.3;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="company-info">
              ${user?.logo ? `<img src="${user.logo}" alt="Logo" class="company-logo" />` : ''}
              <div class="company-details-wrapper">
                <div class="company-name">${user?.companyName || `${user?.firstName || ''} ${user?.lastName || ''}`.trim()}</div>
                <div class="company-details">
                  ${user?.address?.street || ''}<br/>
                  ${user?.address?.zipCode || ''} ${user?.address?.city || ''}<br/>
                  ${user?.siret ? `SIRET : ${user.siret}<br/>` : ''}
                  ${user?.email || ''}${user?.phone ? ' · ' + user.phone : ''}
                </div>
              </div>
            </div>
            <div class="invoice-meta">
              <div class="invoice-title">FACTURE</div>
              <div class="invoice-number">${invoice.invoiceNumber}</div>
              <div class="invoice-date">Date d'émission : ${new Date(invoice.issueDate).toLocaleDateString('fr-FR')}</div>
              <div class="invoice-date">Date d'échéance : ${new Date(invoice.dueDate).toLocaleDateString('fr-FR')}</div>
            </div>
          </div>
          <div class="info-section">
            <div class="info-block">
              <span class="info-label">Facturé à</span>
              <div class="info-content">
                <strong>${client?.name || 'Client'}</strong><br/>
                ${client?.address?.street || ''}<br/>
                ${client?.address?.zipCode || ''} ${client?.address?.city || ''}<br/>
                ${client?.companyInfo?.siret ? `SIRET : ${client.companyInfo.siret}<br/>` : ''}
                ${client?.email || ''}${client?.phone ? ' · ' + client.phone : ''}
              </div>
            </div>
          </div>
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
          <div class="totals-section">
            <table class="totals-table">
              <tr class="subtotal">
                <td class="label">Sous-total HT :</td>
                <td class="value">${Number(invoice.subtotal).toLocaleString('fr-FR', {minimumFractionDigits:2})} €</td>
              </tr>
              ${tvaRows}
              <tr class="grand-total">
                <td class="label">TOTAL TTC :</td>
                <td class="value">${Number(invoice.total).toLocaleString('fr-FR', {minimumFractionDigits:2})} €</td>
              </tr>
              ${invoice.amountPaid > 0 ? `
              <tr class="amount-paid">
                <td class="label">Montant payé :</td>
                <td class="value" style="color: #059669;">- ${Number(invoice.amountPaid).toLocaleString('fr-FR', {minimumFractionDigits:2})} €</td>
              </tr>
              <tr class="balance-due" style="border-top: 2px solid #2c5aa0;">
                <td class="label" style="padding-top: 8px;"><strong>RESTE À PAYER :</strong></td>
                <td class="value" style="padding-top: 8px;"><strong>${Number(invoice.balanceDue || (invoice.total - invoice.amountPaid)).toLocaleString('fr-FR', {minimumFractionDigits:2})} €</strong></td>
              </tr>
              ` : ''}
            </table>
          </div>

          <div class="footer">
            <div class="payment-info">
              <div class="payment-terms">Modalités de paiement</div>
              <div>Paiement par virement bancaire dans les 30 jours</div>
            </div>
            <div class="bank-details">
              <div class="mb-10"><strong>Coordonnées Bancaires</strong></div>
              <div>Banque : ${user?.bankName || ''} • IBAN : <span class="iban">${user?.iban || ''}</span></div>
              <div>${user?.bic ? `BIC : ${user.bic} • ` : ''}${user?.bankCode ? `Code banque : ${user.bankCode} • ` : ''}${user?.branchCode ? `Code guichet : ${user.branchCode}` : ''}</div>
            </div>
            <div class="legal-mentions">
              En cas de retard de paiement, seront exigibles, conformément à l'article L. 441-6 du code de commerce, 
              une indemnité calculée sur la base de trois fois le taux d'intérêt légal ainsi qu'une indemnité forfaitaire 
              pour frais de recouvrement de 40 euros.
            </div>
          </div>
        </div>
      </body>
    </html>
  `;
}
