/**
 * Email service avec retry logic et exponential backoff
 * Utilise Resend API avec gestion des erreurs robuste
 */

import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Configuration pour les retries
 */
const RETRY_CONFIG = {
  maxAttempts: 3,
  initialDelayMs: 1000,
  backoffMultiplier: 2,
  maxDelayMs: 10000,
};

/**
 * Attend un certain délai (utile pour les retries avec backoff)
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Calcule le délai d'attente avec exponential backoff
 * Exemple: 1000ms → 2000ms → 4000ms (capped at 10000ms)
 */
function getBackoffDelay(attempt: number): number {
  const delay =
    RETRY_CONFIG.initialDelayMs *
    Math.pow(RETRY_CONFIG.backoffMultiplier, attempt);
  return Math.min(delay, RETRY_CONFIG.maxDelayMs);
}

/**
 * Détermine si une erreur est rétryable
 */
function isRetryableError(error: any): boolean {
  // Erreurs de réseau/timeout
  if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
    return true;
  }

  // Erreurs Resend (5xx = serveur, retry; 4xx = client, ne pas retry sauf exceptions)
  if (error.statusCode) {
    // 429 = Rate limit (oui, retry)
    // 503 = Service unavailable (oui, retry)
    // 500+ = Server errors (oui, retry)
    if (error.statusCode >= 500 || error.statusCode === 429) {
      return true;
    }
  }

  // Message générique
  const message = error.message || '';
  if (
    message.includes('timeout') ||
    message.includes('ECONNREFUSED') ||
    message.includes('temporarily unavailable')
  ) {
    return true;
  }

  return false;
}

/**
 * Envoie un email avec retry logic automatique
 *
 * @param options - Options Resend.emails.send()
 * @returns Réponse Resend
 * @throws Error si tous les retries échouent
 */
export async function sendEmailWithRetry(
  options: any
): Promise<any> {
  let lastError: any = null;

  for (
    let attempt = 0;
    attempt < RETRY_CONFIG.maxAttempts;
    attempt++
  ) {
    try {
      console.log(
        `📧 Tentative ${attempt + 1}/${RETRY_CONFIG.maxAttempts} d'envoi email à ${options.to}`
      );

      const response = await resend.emails.send(options);

      if (response.error) {
        throw response.error;
      }

      console.log(
        `✅ Email envoyé avec succès à ${options.to} (ID: ${response.data?.id})`
      );
      return response;
    } catch (error: any) {
      lastError = error;

      console.error(
        `❌ Tentative ${attempt + 1} échouée:`,
        error.message || error
      );

      // Si ce n'est pas rétryable ou c'est la dernière tentative, throw
      if (!isRetryableError(error) || attempt === RETRY_CONFIG.maxAttempts - 1) {
        break;
      }

      // Attendre avant retry (exponential backoff)
      const delayMs = getBackoffDelay(attempt);
      console.log(
        `⏳ Attente de ${delayMs}ms avant nouvelle tentative...`
      );
      await sleep(delayMs);
    }
  }

  // Tous les retries échoués
  console.error(
    `💥 Tous les ${RETRY_CONFIG.maxAttempts} retries ont échoué`
  );
  throw new Error(
    `Erreur lors de l'envoi d'email après ${RETRY_CONFIG.maxAttempts} tentatives: ${lastError?.message || 'Erreur inconnue'}`
  );
}

/**
 * Envoie un email simple (sans retry)
 * Utile pour les endpoints qui gèrent eux-mêmes les retries
 */
export async function sendEmail(options: any): Promise<any> {
  return resend.emails.send(options);
}
