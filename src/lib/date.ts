/**
 * Parse a `YYYY-MM-DD` date string into a Date anchored at noon UTC.
 *
 * Why noon? SQLite/D1 stores timestamps as integer unix seconds, and the
 * Cloudflare Workers runtime is UTC. If we anchored at midnight UTC,
 * users in negative-offset timezones would see the previous calendar
 * day when the value is rendered. Noon gives us ~24h of headroom on
 * either side of any reasonable timezone (UTC-12 to UTC+12).
 */
export function parseLocalDate(dateString: string): Date {
  const [year, month, day] = dateString.split('-').map(Number)
  return new Date(Date.UTC(year, month - 1, day, 12, 0, 0))
}

export function todayDateString(): string {
  return new Date().toISOString().split('T')[0]!
}

/**
 * Format a unix-epoch timestamp (seconds) as a localized date.
 * Renders as "Jan 15, 2025" — date only, no time.
 */
export function formatLocalDate(value: Date | number | string): string {
  return new Date(value).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}
