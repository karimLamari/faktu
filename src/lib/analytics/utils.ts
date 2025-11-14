/**
 * Utility functions for analytics
 * Date handling, formatting, and helpers
 */

import {
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  startOfQuarter,
  endOfQuarter,
  subMonths,
  subYears,
  format,
} from 'date-fns';
import { fr } from 'date-fns/locale/fr';

export type PeriodType = 'this_month' | 'last_month' | 'this_quarter' | 'this_year' | 'last_year' | 'custom';

export interface DateRange {
  startDate: Date;
  endDate: Date;
}

/**
 * Get date range for a given period type
 */
export function getDateRangeForPeriod(period: PeriodType, customRange?: DateRange): DateRange {
  const now = new Date();

  switch (period) {
    case 'this_month':
      return {
        startDate: startOfMonth(now),
        endDate: endOfMonth(now),
      };

    case 'last_month':
      const lastMonth = subMonths(now, 1);
      return {
        startDate: startOfMonth(lastMonth),
        endDate: endOfMonth(lastMonth),
      };

    case 'this_quarter':
      return {
        startDate: startOfQuarter(now),
        endDate: endOfQuarter(now),
      };

    case 'this_year':
      return {
        startDate: startOfYear(now),
        endDate: endOfYear(now),
      };

    case 'last_year':
      const lastYear = subYears(now, 1);
      return {
        startDate: startOfYear(lastYear),
        endDate: endOfYear(lastYear),
      };

    case 'custom':
      if (!customRange) {
        throw new Error('Custom range requires startDate and endDate');
      }
      return customRange;

    default:
      return {
        startDate: startOfMonth(now),
        endDate: endOfMonth(now),
      };
  }
}

/**
 * Get previous period for comparison
 */
export function getPreviousPeriod(currentRange: DateRange): DateRange {
  const duration = currentRange.endDate.getTime() - currentRange.startDate.getTime();
  const durationInDays = duration / (1000 * 60 * 60 * 24);

  const previousEndDate = new Date(currentRange.startDate.getTime() - 1); // Day before start
  const previousStartDate = new Date(
    previousEndDate.getTime() - durationInDays * 24 * 60 * 60 * 1000
  );

  return {
    startDate: previousStartDate,
    endDate: previousEndDate,
  };
}

/**
 * Format date range for display
 */
export function formatDateRange(startDate: Date, endDate: Date): string {
  const start = format(startDate, 'd MMM yyyy', { locale: fr });
  const end = format(endDate, 'd MMM yyyy', { locale: fr });

  // If same year, don't repeat it
  if (startDate.getFullYear() === endDate.getFullYear()) {
    const startShort = format(startDate, 'd MMM', { locale: fr });
    return `${startShort} - ${end}`;
  }

  return `${start} - ${end}`;
}

/**
 * Get month name in French
 */
export function getMonthName(month: number, year: number): string {
  const date = new Date(year, month - 1, 1);
  return format(date, 'MMMM yyyy', { locale: fr });
}

/**
 * Get short month name (3 letters)
 */
export function getShortMonthName(month: number): string {
  const date = new Date(2000, month - 1, 1);
  return format(date, 'MMM', { locale: fr });
}

/**
 * Get period label for display
 */
export function getPeriodLabel(period: PeriodType): string {
  switch (period) {
    case 'this_month':
      return 'Ce mois';
    case 'last_month':
      return 'Mois dernier';
    case 'this_quarter':
      return 'Ce trimestre';
    case 'this_year':
      return 'Cette année';
    case 'last_year':
      return 'Année dernière';
    case 'custom':
      return 'Période personnalisée';
    default:
      return 'Période';
  }
}

/**
 * Check if two date ranges overlap
 */
export function dateRangesOverlap(range1: DateRange, range2: DateRange): boolean {
  return (
    range1.startDate <= range2.endDate && range2.startDate <= range1.endDate
  );
}

/**
 * Get number of days in a date range
 */
export function getDaysInRange(startDate: Date, endDate: Date): number {
  const diffInMs = endDate.getTime() - startDate.getTime();
  return Math.ceil(diffInMs / (1000 * 60 * 60 * 24));
}

/**
 * Get quarters for a year
 */
export function getQuartersForYear(year: number): Array<{ label: string; range: DateRange }> {
  return [
    {
      label: 'Q1',
      range: {
        startDate: new Date(year, 0, 1),
        endDate: new Date(year, 2, 31),
      },
    },
    {
      label: 'Q2',
      range: {
        startDate: new Date(year, 3, 1),
        endDate: new Date(year, 5, 30),
      },
    },
    {
      label: 'Q3',
      range: {
        startDate: new Date(year, 6, 1),
        endDate: new Date(year, 8, 30),
      },
    },
    {
      label: 'Q4',
      range: {
        startDate: new Date(year, 9, 1),
        endDate: new Date(year, 11, 31),
      },
    },
  ];
}

/**
 * Generate months array for a year
 */
export function getMonthsForYear(year: number): Array<{ month: number; year: number; label: string }> {
  return Array.from({ length: 12 }, (_, i) => ({
    month: i + 1,
    year,
    label: getMonthName(i + 1, year),
  }));
}

/**
 * Check if date is in current period
 */
export function isDateInPeriod(date: Date, period: PeriodType): boolean {
  const range = getDateRangeForPeriod(period);
  return date >= range.startDate && date <= range.endDate;
}

/**
 * Serialize date range for API calls
 */
export function serializeDateRange(range: DateRange): { start: string; end: string } {
  return {
    start: range.startDate.toISOString(),
    end: range.endDate.toISOString(),
  };
}

/**
 * Deserialize date range from API response
 */
export function deserializeDateRange(data: { start: string; end: string }): DateRange {
  return {
    startDate: new Date(data.start),
    endDate: new Date(data.end),
  };
}
