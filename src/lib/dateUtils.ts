/**
 * Universal date utility module for robust handling and formatting of dates,
 * supporting Firestore Timestamps, JS Date objects, ISO strings, and timestamps.
 */

export interface FlexibleDateInput {
  toDate?: () => Date;
  seconds?: number;
  nanoseconds?: number;
  [key: string]: any;
}

export type DateValue = FlexibleDateInput | Date | string | number | null | undefined;

/**
 * Parses a flexible date value into a valid JS Date instance, or null if invalid.
 */
export function parseDate(dateVal: DateValue): Date | null {
  if (dateVal === null || dateVal === undefined) return null;

  try {
    // 1. Handle Firestore Timestamp with .toDate()
    if (typeof (dateVal as FlexibleDateInput)?.toDate === 'function') {
      const d = (dateVal as FlexibleDateInput).toDate!();
      return isNaN(d.getTime()) ? null : d;
    }

    // 2. Handle Firestore Timestamp object with seconds field
    if (typeof (dateVal as FlexibleDateInput)?.seconds === 'number') {
      const d = new Date((dateVal as FlexibleDateInput).seconds! * 1000);
      return isNaN(d.getTime()) ? null : d;
    }

    // 3. Handle native JS Date
    if (dateVal instanceof Date) {
      return isNaN(dateVal.getTime()) ? null : dateVal;
    }

    // 4. Handle timestamp number or string representation
    const parsed = new Date(dateVal as string | number);
    return isNaN(parsed.getTime()) ? null : parsed;
  } catch {
    return null;
  }
}

/**
 * Formats a date into a localized string representation (e.g. "Jul 23, 2026" or "7/23/2026").
 */
export function formatDate(
  dateVal: DateValue,
  fallback = 'Recent',
  options?: Intl.DateTimeFormatOptions
): string {
  const d = parseDate(dateVal);
  if (!d) return fallback;

  try {
    if (options) {
      return d.toLocaleDateString(undefined, options);
    }
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return fallback;
  }
}

/**
 * Formats a date value into YYYY-MM-DD format (for sitemaps, inputs, or metadata).
 */
export function formatIsoDate(dateVal: DateValue, fallback = '2026-07-23'): string {
  const d = parseDate(dateVal);
  if (!d) return fallback;
  return d.toISOString().split('T')[0];
}

/**
 * Formats a date value into full ISO string for schema/SEO markup.
 */
export function formatFullIso(dateVal: DateValue): string {
  const d = parseDate(dateVal);
  return d ? d.toISOString() : new Date().toISOString();
}
