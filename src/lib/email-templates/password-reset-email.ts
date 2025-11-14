/**
 * Template d'email pour la réinitialisation de mot de passe
 */

export interface PasswordResetEmailData {
  firstName: string;
  resetUrl: string;
}

export function getPasswordResetEmailHtml(data: PasswordResetEmailData): string {
  const { firstName, resetUrl } = data;

  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Réinitialisation de votre mot de passe</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f7;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">
                🔐 BLINK
              </h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 20px; color: #333333; font-size: 24px; font-weight: 600;">
                Réinitialisation de mot de passe
              </h2>
              
              <p style="margin: 0 0 20px; color: #555555; font-size: 16px; line-height: 24px;">
                Bonjour ${firstName},
              </p>
              
              <p style="margin: 0 0 20px; color: #555555; font-size: 16px; line-height: 24px;">
                Vous avez demandé à réinitialiser votre mot de passe pour votre compte BLINK. Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe :
              </p>

              <!-- CTA Button -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 30px 0;">
                <tr>
                  <td align="center">
                    <a href="${resetUrl}" 
                       style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 6px rgba(102, 126, 234, 0.3);">
                      Réinitialiser mon mot de passe
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 0 0 20px; color: #555555; font-size: 14px; line-height: 22px;">
                Si le bouton ne fonctionne pas, copiez et collez ce lien dans votre navigateur :
              </p>
              
              <p style="margin: 0 0 20px; padding: 12px; background-color: #f8f9fa; border-radius: 4px; color: #667eea; font-size: 14px; word-break: break-all;">
                ${resetUrl}
              </p>

              <div style="margin: 30px 0; padding: 20px; background-color: #fff3cd; border-left: 4px solid #ffc107; border-radius: 4px;">
                <p style="margin: 0; color: #856404; font-size: 14px; line-height: 22px;">
                  ⚠️ <strong>Important :</strong> Ce lien est valable pendant 1 heure et ne peut être utilisé qu'une seule fois.
                </p>
              </div>

              <p style="margin: 0 0 10px; color: #555555; font-size: 14px; line-height: 22px;">
                Si vous n'avez pas demandé cette réinitialisation, vous pouvez ignorer cet email en toute sécurité. Votre mot de passe actuel restera inchangé.
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; background-color: #f8f9fa; border-radius: 0 0 8px 8px; border-top: 1px solid #e9ecef;">
              <p style="margin: 0 0 10px; color: #6c757d; font-size: 14px; text-align: center;">
                Besoin d'aide ? Contactez-nous à 
                <a href="mailto:support@blink.quxly.fr" style="color: #667eea; text-decoration: none;">
                  support@blink.quxly.fr
                </a>
              </p>
              <p style="margin: 0; color: #6c757d; font-size: 12px; text-align: center;">
                © ${new Date().getFullYear()} BLINK - Gestion de facturation simplifiée
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

export function getPasswordResetEmailText(data: PasswordResetEmailData): string {
  const { firstName, resetUrl } = data;

  return `
Bonjour ${firstName},

Vous avez demandé à réinitialiser votre mot de passe pour votre compte BLINK.

Pour créer un nouveau mot de passe, cliquez sur le lien suivant :
${resetUrl}

⚠️ Important : Ce lien est valable pendant 1 heure et ne peut être utilisé qu'une seule fois.

Si vous n'avez pas demandé cette réinitialisation, vous pouvez ignorer cet email en toute sécurité. Votre mot de passe actuel restera inchangé.

Besoin d'aide ? Contactez-nous à support@blink.quxly.fr

© ${new Date().getFullYear()} BLINK - Gestion de facturation simplifiée
  `.trim();
}
