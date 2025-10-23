/**
 * Templates HTML pour les emails de relance client
 */

interface ReminderEmailData {
  clientName: string;
  invoiceNumber: string;
  total: number;
  dueDate: string;
  daysPastDue: number;
  companyName: string;
  customMessage?: string;
  pdfUrl?: string;
}

type ReminderType = 'friendly' | 'firm' | 'final';

export function getReminderEmailHtml(
  data: ReminderEmailData,
  type: ReminderType = 'friendly'
): string {
  const { clientName, invoiceNumber, total, dueDate, daysPastDue, companyName, customMessage, pdfUrl } = data;

  const messages = {
    friendly: {
      title: '🔔 Rappel',
      greeting: `Bonjour ${clientName},`,
      body: `
        <p class="message">
          Nous espérons que tout va bien de votre côté. Nous vous contactons concernant 
          la facture <strong>${invoiceNumber}</strong> qui semble ne pas avoir été réglée.
        </p>
        <p class="message">
          Il s'agit peut-être d'un simple oubli. Si le paiement a déjà été effectué, 
          veuillez ignorer ce message.
        </p>
      `,
      color: '#3b82f6',
    },
    firm: {
      title: '⚠️ Relance de paiement',
      greeting: `${clientName},`,
      body: `
        <p class="message">
          Nous constatons que la facture <strong>${invoiceNumber}</strong> n'a toujours pas été réglée 
          malgré notre précédent rappel.
        </p>
        <p class="message">
          Nous vous remercions de bien vouloir procéder au règlement dans les plus brefs délais.
        </p>
      `,
      color: '#f59e0b',
    },
    final: {
      title: '🚨 Dernière relance',
      greeting: `${clientName},`,
      body: `
        <p class="message" style="color: #dc2626; font-weight: 500;">
          Ceci est notre dernière relance concernant la facture <strong>${invoiceNumber}</strong>.
        </p>
        <p class="message">
          À défaut de règlement sous 7 jours, nous serons contraints d'engager des 
          procédures de recouvrement, ce que nous souhaitons éviter.
        </p>
      `,
      color: '#dc2626',
    },
  };

  const config = messages[type];

  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${config.title}</title>
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
      background-color: ${config.color};
      padding: 40px 30px;
      text-align: center;
      color: white;
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
      margin-bottom: 20px;
    }
    .alert-box {
      background-color: #fef3c7;
      border-left: 4px solid ${config.color};
      padding: 20px;
      margin: 30px 0;
      border-radius: 4px;
    }
    .alert-box p {
      margin: 0;
      color: #92400e;
      font-weight: 500;
    }
    .invoice-details {
      background-color: #f8f9fa;
      border-left: 4px solid ${config.color};
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
      color: ${config.color};
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
      background-color: ${config.color};
      color: white !important;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 600;
      font-size: 16px;
      text-align: center;
      margin: 20px 0;
    }
    .footer {
      background-color: #f8f9fa;
      padding: 30px;
      text-align: center;
      color: #666;
      font-size: 13px;
      border-top: 1px solid #e9ecef;
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
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <div class="header">
      <h1>${config.title}</h1>
    </div>

    <!-- Content -->
    <div class="content">
      <p class="greeting">${config.greeting}</p>
      
      ${config.body}

      ${daysPastDue > 0 ? `
      <div class="alert-box">
        <p>⏰ Cette facture est en retard de <strong>${daysPastDue} jour${daysPastDue > 1 ? 's' : ''}</strong></p>
      </div>
      ` : ''}

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
          <span class="label">Montant à régler: </span>
          <span class="value">${total.toLocaleString('fr-FR', { 
            style: 'currency', 
            currency: 'EUR' 
          })}</span>
        </div>
      </div>

      ${customMessage ? `
      <div style="background-color: #f0f9ff; padding: 20px; border-radius: 4px; margin: 20px 0;">
        <p style="margin: 0; color: #0369a1; font-style: italic;">"${customMessage}"</p>
      </div>
      ` : ''}

      ${pdfUrl ? `
      <div style="text-align: center;">
        <a href="${pdfUrl}" class="cta-button">
          📥 Télécharger la facture
        </a>
      </div>
      ` : ''}

      <div class="divider"></div>

      <p class="message" style="font-size: 14px;">
        Pour toute question ou difficulté de paiement, n'hésitez pas à nous contacter. 
        Nous sommes à votre écoute pour trouver une solution.
      </p>
    </div>

    <!-- Footer -->
    <div class="footer">
      <p><strong>${companyName}</strong></p>
      <p style="margin-top: 15px; color: #999;">
        Cet email a été envoyé automatiquement.
      </p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

export function getReminderEmailText(
  data: ReminderEmailData,
  type: ReminderType = 'friendly'
): string {
  const { clientName, invoiceNumber, total, dueDate, daysPastDue, companyName, customMessage } = data;

  const messages = {
    friendly: 'Rappel',
    firm: 'Relance',
    final: 'Dernière relance',
  };

  return `
${messages[type]} - Facture ${invoiceNumber}

Bonjour ${clientName},

Nous vous contactons concernant la facture ${invoiceNumber} qui n'a pas encore été réglée.

${daysPastDue > 0 ? `Cette facture est en retard de ${daysPastDue} jour(s).` : ''}

Détails de la facture :
- Numéro : ${invoiceNumber}
- Date d'échéance : ${new Date(dueDate).toLocaleDateString('fr-FR')}
- Montant à régler : ${total.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}

${customMessage ? `\nMessage : ${customMessage}\n` : ''}

Pour toute question, n'hésitez pas à nous contacter.

Cordialement,
${companyName}
  `.trim();
}
