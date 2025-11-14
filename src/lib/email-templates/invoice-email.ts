/**
 * Template HTML pour l'envoi de factures par email
 */

interface InvoiceEmailData {
  clientName: string;
  invoiceNumber: string;
  total: number;
  dueDate: string;
  companyName: string;
  customMessage?: string;
  pdfUrl?: string;
}

export function getInvoiceEmailHtml(data: InvoiceEmailData): string {
  const { clientName, invoiceNumber, total, dueDate, companyName, customMessage, pdfUrl } = data;

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
      background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
      padding: 40px 30px;
      text-align: center;
      color: white;
      box-shadow: 0 4px 6px rgba(59, 130, 246, 0.3);
    }
    .header h1 {
      margin: 0;
      font-size: 28px;
      font-weight: 600;
    }
    .header p {
      margin: 10px 0 0;
      opacity: 0.95;
      font-size: 16px;
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
      border-left: 4px solid #3b82f6;
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
      color: #3b82f6;
    }
    .invoice-details .label {
      color: #666;
    }
    .invoice-details .value {
      color: #333;
      font-weight: 500;
    }
    .due-notice {
      background-color: #fef3c7;
      border-left: 4px solid #f59e0b;
      padding: 15px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .due-notice p {
      margin: 0;
      color: #92400e;
      font-size: 14px;
    }
    .due-notice strong {
      color: #78350f;
    }
    .cta-button {
      display: inline-block;
      background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
      color: white;
      text-decoration: none;
      padding: 14px 32px;
      border-radius: 8px;
      font-weight: 600;
      margin: 20px 0;
      box-shadow: 0 4px 6px rgba(59, 130, 246, 0.3);
      transition: all 0.3s ease;
    }
    .cta-button:hover {
      box-shadow: 0 6px 12px rgba(59, 130, 246, 0.4);
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
    .custom-message {
      background-color: #e0f2fe;
      border-left: 4px solid #0284c7;
      padding: 15px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .custom-message p {
      margin: 0;
      color: #075985;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <div class="header">
      <h1>📄 Nouvelle Facture</h1>
      <p>De ${companyName}</p>
    </div>

    <!-- Content -->
    <div class="content">
      <div class="greeting">
        Bonjour ${clientName},
      </div>

      <div class="message">
        Nous vous remercions pour votre confiance. Veuillez trouver ci-joint votre facture <strong>${invoiceNumber}</strong>.
      </div>

      ${customMessage ? `
      <div class="custom-message">
        <p>${customMessage}</p>
      </div>
      ` : ''}

      <!-- Invoice Details -->
      <div class="invoice-details">
        <div class="row">
          <span class="label">Numéro de facture</span>
          <span class="value">${invoiceNumber}</span>
        </div>
        <div class="row">
          <span class="label">Date d'échéance</span>
          <span class="value">${new Date(dueDate).toLocaleDateString('fr-FR')}</span>
        </div>
        <div class="row">
          <span class="label">Montant total TTC</span>
          <span class="value">${total.toFixed(2)} €</span>
        </div>
      </div>

      <!-- Due Date Notice -->
      <div class="due-notice">
        <p>⏰ <strong>Échéance :</strong> Cette facture est à régler avant le <strong>${new Date(dueDate).toLocaleDateString('fr-FR')}</strong>.</p>
      </div>

      ${pdfUrl ? `
      <div style="text-align: center;">
        <a href="${pdfUrl}" class="cta-button">📥 Télécharger la facture PDF</a>
      </div>
      ` : ''}

      <div class="message" style="margin-top: 30px;">
        La facture complète est jointe à cet email au format PDF. Si vous avez des questions, n'hésitez pas à nous contacter.
      </div>
    </div>

    <!-- Footer -->
    <div class="footer">
      <p><strong>${companyName}</strong></p>
      <p>Cet email a été envoyé automatiquement par notre système de facturation.</p>
      <p>Merci de ne pas répondre directement à cet email.</p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

export function getInvoiceEmailText(data: InvoiceEmailData): string {
  const { clientName, invoiceNumber, total, dueDate, companyName, customMessage } = data;

  return `
Bonjour ${clientName},

Nous vous remercions pour votre confiance. Veuillez trouver ci-joint votre facture ${invoiceNumber}.

${customMessage ? `\n${customMessage}\n` : ''}

DÉTAILS DE LA FACTURE:
----------------------
Numéro de facture: ${invoiceNumber}
Date d'échéance: ${new Date(dueDate).toLocaleDateString('fr-FR')}
Montant total TTC: ${total.toFixed(2)} €

ÉCHÉANCE:
---------
Cette facture est à régler avant le ${new Date(dueDate).toLocaleDateString('fr-FR')}.

La facture complète est jointe à cet email au format PDF. Si vous avez des questions, n'hésitez pas à nous contacter.

Cordialement,
${companyName}

---
Cet email a été envoyé automatiquement par notre système de facturation.
Merci de ne pas répondre directement à cet email.
  `.trim();
}
