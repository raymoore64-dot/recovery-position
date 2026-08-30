/**
 * Local-timezone date helpers.
 *
 * JavaScript's `Date.toISOString()` always converts to UTC before
 * formatting. For anyone not in UTC, `new Date().toISOString().slice(0,10)`
 * silently returns the *wrong* date for part of the day — e.g. in Dammam
 * (UTC+3), any time between local midnight and 3am computes as the
 * previous day in UTC. For an app built around night shifts, that's
 * exactly the window it's most likely to be checked in.
 *
 * These helpers use the Date object's local getters instead, which
 * reflect whatever timezone the machine (or server) is actually running.
 */

/** Formats a Date as YYYY-MM-DD using its LOCAL date, not UTC. */
export function toLocalISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Today's date, in local time, as YYYY-MM-DD. */
export function todayLocalISO(): string {
  return toLocalISODate(new Date());
}

/** Adds `n` days (local time) to a YYYY-MM-DD string, returning YYYY-MM-DD. */
export function addLocalDays(iso: string, n: number): string {
  const d = new Date(iso + "T00:00:00");
  d.setDate(d.getDate() + n);
  return toLocalISODate(d);
}

/** Adds `n` months (local time) to a YYYY-MM-DD string, returning YYYY-MM-DD. */
export function addLocalMonths(iso: string, n: number): string {
  const d = new Date(iso + "T00:00:00");
  d.setMonth(d.getMonth() + n);
  return toLocalISODate(d);
}
