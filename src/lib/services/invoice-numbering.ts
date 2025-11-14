import dbConnect from '@/lib/db/mongodb';
import User from '@/models/User';
import { formatNumber, extractClientInitials } from './_shared/numbering-utils';

/**
 * Atomically generates the next invoice number for a given user, with yearly reset.
 * Contract:
 * - input: userId (string), optional clientName and override for prefix
 * - output: { invoiceNumber: string, nextNumber: number, year: number }
 * Behavior:
 * - If the stored year != current year, reset nextNumber to 1 and set year = current
 * - Always increments nextNumber atomically and returns a formatted number: `${prefix}${year}-${clientInitial}${NNNN}`
 * - If clientName provided, adds first 3 letters of client name to number
 */
export async function getNextInvoiceNumber(
  userId: string,
  opts?: { prefix?: string; clientName?: string }
): Promise<{ invoiceNumber: string; nextNumber: number; year: number }> {
  await dbConnect();

  const currentYear = new Date().getFullYear();

  // Build atomic update:
  // 1) If year differs, set year and reset nextNumber to 1 before increment
  // 2) Optionally override prefix if provided in opts
  const setOnYearChange: Record<string, any> = {};
  setOnYearChange['invoiceNumbering.year'] = currentYear;
  setOnYearChange['invoiceNumbering.nextNumber'] = 1;
  if (opts?.prefix) setOnYearChange['invoiceNumbering.prefix'] = opts.prefix;

  const user = await User.findOneAndUpdate(
    {
      _id: userId,
    },
    [
      // MongoDB aggregation pipeline update to conditionally reset by year
      {
        $set: {
          invoiceNumbering: {
            $let: {
              vars: { inum: '$invoiceNumbering' },
              in: {
                prefix: {
                  $ifNull: [
                    opts?.prefix ?? '$$inum.prefix',
                    'FAC',
                  ],
                },
                year: {
                  $cond: [
                    { $ne: ['$$inum.year', currentYear] },
                    currentYear,
                    { $ifNull: ['$$inum.year', currentYear] },
                  ],
                },
                nextNumber: {
                  $cond: [
                    { $ne: ['$$inum.year', currentYear] },
                    1,
                    { $ifNull: ['$$inum.nextNumber', 1] },
                  ],
                },
              },
            },
          },
        },
      },
      { $set: { 'invoiceNumbering.nextNumber': { $add: ['$invoiceNumbering.nextNumber', 1] } } },
    ],
    {
      new: true,
      upsert: false,
    }
  ).select('invoiceNumbering');

  if (!user) {
    throw new Error('User not found when generating invoice number');
  }

  const { prefix = 'FAC', nextNumber, year } = user.invoiceNumbering || {
    prefix: 'FAC',
    nextNumber: 1,
    year: currentYear,
  };

  // nextNumber has been incremented; actual current number for this invoice is nextNumber - 1
  const currentSequence = Math.max(1, Number(nextNumber) - 1);
  
  // Extract client initials using shared utility
  let clientCode = '';
  if (opts?.clientName) {
    const initials = extractClientInitials(opts.clientName);
    if (initials) {
      clientCode = initials + '-';
    }
  }
  
  const formatted = `${prefix}${year}-${clientCode}${formatNumber(currentSequence)}`;

  return { invoiceNumber: formatted, nextNumber, year };
}
