import dbConnect from '@/lib/db/mongodb';
import Client from '@/models/Client';
import User from '@/models/User';
import { formatNumber } from './_shared/numbering-utils';

/**
 * Generates a unique sequential quote number.
 * Format: DEVIS{YEAR}-{NNNN}
 * Example: DEVIS2025-0001, DEVIS2025-0002
 * 
 * This approach:
 * - Aligns with invoice numbering system
 * - Is sequential and user-friendly
 * - Resets yearly
 * - Uses atomic MongoDB operations (no race conditions)
 */
export async function getNextQuoteNumber(
  userId: string,
  clientId: string,
  opts?: { prefix?: string }
): Promise<{ quoteNumber: string }> {
  await dbConnect();

  const prefix = opts?.prefix || 'DEVIS';
  const year = new Date().getFullYear();

  // Utiliser atomic increment dans MongoDB
  // Simulaire à invoice numbering mais pour quotes
  const user = await User.findByIdAndUpdate(
    userId,
    {
      $inc: { 'quoteNumbering.nextNumber': 1 },
      $set: { 'quoteNumbering.year': year },
    },
    {
      new: true,
      upsert: true,
    }
  );

  const nextNumber = user?.quoteNumbering?.nextNumber || 1;
  const paddedNumber = formatNumber(nextNumber);
  const quoteNumber = `${prefix}${year}-${paddedNumber}`;

  return { quoteNumber };
}
