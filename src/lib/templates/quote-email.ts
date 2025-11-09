/**
 * Template HTML pour l'envoi de devis par email
 */

interface QuoteEmailData {
  clientName: string;
  quoteNumber: string;
  total: number;
  validUntil: string;
  companyName: string;
  subtotal: number;
  taxAmount: number;
  pdfUrl?: string;
}

export function getQuoteEmailHtml(data: QuoteEmailData): string {
  const { clientName, quoteNumber, total, validUntil, companyName, subtotal, taxAmount, pdfUrl } = data;

  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Devis ${quoteNumber}</title>
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
    .quote-details {
      background-color: #f8f9fa;
      border-left: 4px solid #667eea;
      padding: 20px;
      margin: 30px 0;
      border-radius: 4px;
    }
    .quote-details .row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid #e9ecef;
    }
    .quote-details .row:last-child {
      border-bottom: none;
      padding-top: 15px;
      font-weight: 600;
      font-size: 18px;
      color: #667eea;
    }
    .quote-details .label {
      color: #666;
    }
    .quote-details .value {
      color: #333;
      font-weight: 500;
    }
    .validity-notice {
      background-color: #fef3c7;
      border-left: 4px solid #f59e0b;
      padding: 15px;
      margin: 20px 0;
      border-radius: 4px;
      color: #92400e;
    }
    .validity-notice strong {
      color: #78350f;
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
      color: #6c757d;
      font-size: 14px;
      border-top: 1px solid #e9ecef;
    }
    .footer p {
      margin: 5px 0;
    }
    .company-name {
      font-weight: 600;
      color: #333;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📋 Nouveau Devis</h1>
      <p>${quoteNumber}</p>
    </div>
    
    <div class="content">
      <div class="greeting">
        Bonjour ${clientName},
      </div>
      
      <div class="message">
        Nous avons le plaisir de vous transmettre notre devis <strong>${quoteNumber}</strong>.
        Vous trouverez ci-joint le document complet au format PDF.
      </div>

      <div class="validity-notice">
        ⏰ <strong>Validité du devis :</strong> Ce devis est valable jusqu'au <strong>${new Date(validUntil).toLocaleDateString('fr-FR')}</strong>.
      </div>
      
      <div class="quote-details">
        <div class="row">
          <span class="label">N° de devis</span>
          <span class="value">${quoteNumber}</span>
        </div>
        <div class="row">
          <span class="label">Valable jusqu'au</span>
          <span class="value">${new Date(validUntil).toLocaleDateString('fr-FR')}</span>
        </div>
        <div class="row">
          <span class="label">Montant HT</span>
          <span class="value">${subtotal.toFixed(2)} €</span>
        </div>
        <div class="row">
          <span class="label">TVA</span>
          <span class="value">${taxAmount.toFixed(2)} €</span>
        </div>
        <div class="row">
          <span class="label">Montant TTC</span>
          <span class="value">${total.toFixed(2)} €</span>
        </div>
      </div>
      
      ${pdfUrl ? `
      <div style="text-align: center;">
        <a href="${pdfUrl}" class="cta-button">
          📄 Télécharger le devis PDF
        </a>
      </div>
      ` : ''}
      
      <div class="message" style="margin-top: 30px;">
        Nous restons à votre disposition pour toute question ou précision concernant ce devis.
      </div>
      
      <div class="message">
        Cordialement,<br>
        <span class="company-name">${companyName}</span>
      </div>
    </div>
    
    <div class="footer">
      <p class="company-name">${companyName}</p>
      <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre directement.</p>
    </div>
  </div>
</body>
</html>
  `;
}

export function getQuoteEmailText(data: QuoteEmailData): string {
  const { clientName, quoteNumber, total, validUntil, companyName, subtotal, taxAmount } = data;

  return `
Bonjour ${clientName},

Nous avons le plaisir de vous transmettre notre devis ${quoteNumber}.

VALIDITÉ DU DEVIS
Ce devis est valable jusqu'au ${new Date(validUntil).toLocaleDateString('fr-FR')}.

RÉCAPITULATIF
N° de devis : ${quoteNumber}
Valable jusqu'au : ${new Date(validUntil).toLocaleDateString('fr-FR')}
Montant HT : ${subtotal.toFixed(2)} €
TVA : ${taxAmount.toFixed(2)} €
Montant TTC : ${total.toFixed(2)} €

Nous restons à votre disposition pour toute question ou précision concernant ce devis.

Cordialement,
${companyName}

---
Cet email a été envoyé automatiquement, merci de ne pas y répondre directement.
  `.trim();
}
