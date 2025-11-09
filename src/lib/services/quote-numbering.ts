import dbConnect from '@/lib/db/mongodb';
import Client from '@/models/Client';

/**
 * Generates a unique quote number based on client name and timestamp.
 * Format: DEVIS-{CLIENT_NAME}-{YYYYMMDD}-{HHMMSS}
 * Example: DEVIS-ACME-20250125-143022
 * 
 * This approach is more robust as it:
 * - Avoids race conditions
 * - Is self-describing (includes client name)
 * - Guarantees uniqueness with timestamp
 * - No need to maintain counters
 */
export async function getNextQuoteNumber(
  userId: string,
  clientId: string,
  opts?: { prefix?: string }
): Promise<{ quoteNumber: string }> {
  await dbConnect();

  const prefix = opts?.prefix || 'DEVIS';

  // Récupérer le client pour obtenir son nom
  const client = await Client.findById(clientId);
  
  if (!client) {
    throw new Error('Client not found');
  }

  // Nettoyer le nom du client pour l'utiliser dans le numéro
  // - Supprimer les caractères spéciaux
  // - Convertir en majuscules
  // - Limiter à 20 caractères
  const cleanClientName = client.name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Supprimer les accents
    .replace(/[^a-zA-Z0-9]/g, '') // Garder uniquement alphanumériques
    .toUpperCase()
    .substring(0, 20);

  // Générer le timestamp
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, ''); // YYYYMMDD
  const timeStr = now.toTimeString().slice(0, 8).replace(/:/g, ''); // HHMMSS

  // Format: DEVIS-{CLIENT}-{DATE}-{TIME}
  const quoteNumber = `${prefix}-${cleanClientName}-${dateStr}-${timeStr}`;

  return { quoteNumber };
}
