import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/config';
import dbConnect from '@/lib/db/mongodb';
import Invoice from '@/models/Invoice';
import Client from '@/models/Client';
import User from '@/models/User';
import puppeteer from 'puppeteer';

// Template HTML professionnel pour la facture (string, pas JSX)
function InvoiceHtml({ invoice, client, user }: any) {
  const itemsRows = invoice.items.map((item: any) => `
    <tr>
      <td class="qty-column">${item.quantity}</td>
      <td class="description-column">
        <strong>${item.description}</strong><br/>
        <span style="color: #666; font-size: 10px;">${item.details || ''}</span>
      </td>
      <td class="unit-price-column">${Number(item.unitPrice).toLocaleString('fr-FR', {minimumFractionDigits:2})} €</td>
      <td class="total-column">${(item.quantity * item.unitPrice).toLocaleString('fr-FR', {minimumFractionDigits:2})} €</td>
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
            margin: 25mm 20mm 25mm 20mm;
          }
          body { 
            font-family: 'Helvetica Neue', Arial, sans-serif; 
            margin: 0; 
            padding: 0; 
            background: #ffffff; 
            font-size: 12px; 
            line-height: 1.4;
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
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #2c5aa0;
          }
          .company-info {
            flex: 1;
          }
          .company-name {
            font-size: 24px;
            font-weight: 700;
            color: #2c5aa0;
            margin-bottom: 8px;
            letter-spacing: 0.5px;
          }
          .company-details {
            font-size: 11px;
            color: #666666;
            line-height: 1.5;
          }
          .invoice-meta {
            text-align: right;
            min-width: 200px;
          }
          .invoice-title {
            font-size: 28px;
            font-weight: 300;
            color: #2c5aa0;
            margin-bottom: 15px;
            letter-spacing: 1px;
          }
          .invoice-number {
            font-size: 14px;
            font-weight: 600;
            color: #333333;
            margin-bottom: 5px;
          }
          .invoice-date {
            font-size: 11px;
            color: #666666;
          }
          .info-section {
            display: flex;
            justify-content: space-between;
            margin-bottom: 30px;
            gap: 40px;
          }
          .info-block {
            flex: 1;
            padding: 15px;
            background: #f8f9fa;
            border-radius: 4px;
          }
          .info-label {
            font-size: 10px;
            font-weight: 600;
            color: #2c5aa0;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 8px;
            display: block;
          }
          .info-content {
            font-size: 11px;
            color: #333333;
            line-height: 1.6;
          }
          .items-section {
            margin-bottom: 30px;
          }
          .items-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 11px;
          }
          .items-table th {
            background: #2c5aa0;
            color: white;
            padding: 12px 8px;
            text-align: left;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            font-size: 10px;
          }
          .items-table th:first-child {
            border-top-left-radius: 4px;
          }
          .items-table th:last-child {
            border-top-right-radius: 4px;
          }
          .items-table td {
            padding: 12px 8px;
            border-bottom: 1px solid #e9ecef;
          }
          .items-table tr:hover {
            background: #f8f9fa;
          }
          .qty-column { width: 60px; text-align: center; }
          .description-column { width: auto; }
          .unit-price-column { width: 100px; text-align: right; }
          .total-column { width: 100px; text-align: right; font-weight: 600; }
          .totals-section {
            display: flex;
            justify-content: flex-end;
            margin-bottom: 30px;
          }
          .totals-table {
            width: 300px;
            border-collapse: collapse;
            font-size: 12px;
          }
          .totals-table td {
            padding: 8px 12px;
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
            min-width: 100px;
          }
          .totals-table .subtotal {
            border-top: 2px solid #e9ecef;
            padding-top: 12px;
          }
          .totals-table .grand-total {
            background: #2c5aa0;
            color: white;
            font-size: 14px;
            font-weight: 700;
            border: none;
          }
          .totals-table .grand-total .label,
          .totals-table .grand-total .value {
            color: white;
            padding: 12px;
          }
          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e9ecef;
            font-size: 10px;
            color: #666666;
          }
          .payment-info {
            text-align: center;
            margin-bottom: 15px;
          }
          .payment-terms {
            font-weight: 600;
            color: #2c5aa0;
            margin-bottom: 5px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .bank-details {
            background: #f8f9fa;
            padding: 12px;
            border-radius: 4px;
            margin-bottom: 15px;
            text-align: center;
          }
          .iban {
            font-family: monospace;
            font-size: 11px;
            font-weight: 600;
            color: #2c5aa0;
            letter-spacing: 1px;
          }
          .legal-mentions {
            text-align: center;
            font-size: 9px;
            color: #999999;
            line-height: 1.4;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="company-info">
              <div class="company-name">${user?.companyName || ''}</div>
              <div class="company-details">
                ${user?.address?.street || ''}<br/>
                ${user?.address?.zipCode || ''} ${user?.address?.city || ''}<br/>
                ${user?.companyInfo?.siret ? `SIRET : ${user.companyInfo.siret}<br/>` : ''}
                ${user?.email || ''}${user?.phone ? ' · ' + user.phone : ''}
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
                <strong>${client?.companyInfo?.legalName || client?.name || ''}</strong><br/>
                ${client?.address?.street || ''}<br/>
                ${client?.address?.zipCode || ''} ${client?.address?.city || ''}<br/>
                ${client?.companyInfo?.siret ? `SIRET : ${client.companyInfo.siret}` : ''}
              </div>
            </div>
            <div class="info-block">
              <span class="info-label">&nbsp;</span>
              <div class="info-content">&nbsp;</div>
            </div>
          </div>
          <div class="items-section">
            <table class="items-table">
              <thead>
                <tr>
                  <th class="qty-column">Qté</th>
                  <th class="description-column">Description</th>
                  <th class="unit-price-column">Prix Unitaire HT</th>
                  <th class="total-column">Montant HT</th>
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
              <tr>
                <td class="label">TVA (${invoice.taxRate ? invoice.taxRate.toFixed(1) : '0.0'}%) :</td>
                <td class="value">${Number(invoice.taxAmount).toLocaleString('fr-FR', {minimumFractionDigits:2})} €</td>
              </tr>
              <tr class="grand-total">
                <td class="label">TOTAL TTC :</td>
                <td class="value">${Number(invoice.total).toLocaleString('fr-FR', {minimumFractionDigits:2})} €</td>
              </tr>
            </table>
          </div>
          <div style="margin-bottom: 30px; padding: 15px; background: #f8f9fa; border-radius: 4px; font-size: 10px;">
            <strong>Notes :</strong> ${invoice.notes || "Tous les prix sont en Euros. Facture payable dans les 30 jours suivant la date d'émission."}
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

export async function GET(request: NextRequest, context: any) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }
  // Correction Next.js App Router : params doit être await si async
  const params = context?.params ? (typeof context.params.then === 'function' ? await context.params : context.params) : {};
  const { id } = params;
  await dbConnect();
  const invoice = await Invoice.findOne({ _id: id, userId: session.user.id });
  if (!invoice) {
    return NextResponse.json({ error: 'Facture non trouvée' }, { status: 404 });
  }
  const client = await Client.findById(invoice.clientId);
  const user = await User.findById(invoice.userId);

  // Générer le HTML
  const html = InvoiceHtml({ invoice, client, user });

  // Puppeteer : générer le PDF
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'networkidle0' });
  const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
  await browser.close();

  return new NextResponse(Buffer.from(pdfBuffer), {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="facture-${invoice.invoiceNumber}.pdf"`,
    },
  });
}
