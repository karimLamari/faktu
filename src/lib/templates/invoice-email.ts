/**
 * Template HTML pour l'envoi de factures par email
 */

interface InvoiceEmailData {
  clientName: string;
  invoiceNumber: string;
  total: number;
  dueDate: string;
  companyName: string;
  pdfUrl?: string;
}

export function getInvoiceEmailHtml(data: InvoiceEmailData): string {
  const { clientName, invoiceNumber, total, dueDate, companyName, pdfUrl } = data;

  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Facture ${invoiceNumber}</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background-color: #f5f5f5;
      line-height: 1.6;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 40px 30px;
      text-align: center;
      color: white;
      box-shadow: 0 4px 6px rgba(102, 126, 234, 0.3);
    }
    .header h1 {
      margin: 0;
      font-size: 28px;
      font-weight: 600;
    }
    .content {
      padding: 40px 30px;
    }
    .greeting {
      font-size: 18px;
      color: #333;
      margin-bottom: 20px;
    }
    .message {
      color: #555;
      font-size: 15px;
      margin-bottom: 30px;
    }
    .invoice-details {
      background-color: #f8f9fa;
      border-left: 4px solid #667eea;
      padding: 20px;
      margin: 30px 0;
      border-radius: 4px;
    }
    .invoice-details .row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid #e9ecef;
    }
    .invoice-details .row:last-child {
      border-bottom: none;
      padding-top: 15px;
      font-weight: 600;
      font-size: 18px;
      color: #667eea;
    }
    .invoice-details .label {
      color: #666;
    }
    .invoice-details .value {
      color: #333;
      font-weight: 500;
    }
    .cta-button {
      display: inline-block;
      padding: 14px 32px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white !important;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 600;
      font-size: 16px;
      text-align: center;
      margin: 20px 0;
      transition: transform 0.2s;
      box-shadow: 0 4px 6px rgba(102, 126, 234, 0.3);
    }
    .cta-button:hover {
      transform: translateY(-2px);
    }
    .footer {
      background-color: #f8f9fa;
      padding: 30px;
      text-align: center;
      color: #666;
      font-size: 13px;
      border-top: 1px solid #e9ecef;
    }
    .footer p {
      margin: 5px 0;
    }
    .divider {
      height: 1px;
      background-color: #e9ecef;
      margin: 30px 0;
    }
    @media only screen and (max-width: 600px) {
      .content {
        padding: 30px 20px;
      }
      .header {
        padding: 30px 20px;
      }
      .header h1 {
        font-size: 24px;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <div class="header">
      <h1>📄 Nouvelle Facture</h1>
    </div>

    <!-- Content -->
    <div class="content">
      <p class="greeting">Bonjour ${clientName},</p>
      
      <p class="message">
        Nous vous remercions pour votre confiance. Veuillez trouver ci-joint votre facture.
      </p>

      <!-- Invoice Details -->
      <div class="invoice-details">
        <div class="row">
          <span class="label">Numéro de facture: </span>
          <span class="value">${invoiceNumber}</span>
        </div>
        <div class="row">
          <span class="label">Date d'échéance: </span>
          <span class="value">${new Date(dueDate).toLocaleDateString('fr-FR', { 
            day: 'numeric', 
            month: 'long', 
            year: 'numeric' 
          })}</span>
        </div>
        <div class="row">
          <span class="label">Montant total</span>
          <span class="value">${total.toLocaleString('fr-FR', { 
            style: 'currency', 
            currency: 'EUR' 
          })}</span>
        </div>
      </div>

      ${pdfUrl ? `
      <div style="text-align: center;">
        <a href="${pdfUrl}" class="cta-button">
          📥 Télécharger la facture
        </a>
      </div>
      ` : ''}

      <div class="divider"></div>

      <p class="message" style="font-size: 14px;">
        Si vous avez des questions concernant cette facture, n'hésitez pas à nous contacter.
        Nous sommes à votre disposition.
      </p>
    </div>

    <!-- Footer -->
    <div class="footer">
      <p><strong>${companyName}</strong></p>
      <p style="margin-top: 15px; color: #999;">
        Cet email a été envoyé automatiquement, merci de ne pas y répondre directement.
      </p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

export function getInvoiceEmailText(data: InvoiceEmailData): string {
  const { clientName, invoiceNumber, total, dueDate, companyName } = data;

  return `
Bonjour ${clientName},

Nous vous remercions pour votre confiance. Veuillez trouver ci-joint votre facture.

Détails de la facture :
- Numéro : ${invoiceNumber}
- Date d'échéance : ${new Date(dueDate).toLocaleDateString('fr-FR')}
- Montant total : ${total.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}

Si vous avez des questions, n'hésitez pas à nous contacter.

Cordialement,
${companyName}
  `.trim();
}
