import { Shift } from "./db";
import { toLocalISODate } from "./date";

/**
 * A night (or long) shift's effects run past midnight into the next
 * calendar day — its sleep window doesn't end just because the date
 * rolled over. This decides which date's shift should actually drive
 * the Daily Card right now: if yesterday's shift was a night/long_day
 * shift and its recovery window hasn't finished yet, that's still the
 * operative "today" for the hero card. Otherwise, today's own dated
 * shift (if any) takes over.
 *
 * Mirrors schedule.ts's sleepWindowFor exactly (90 min wind-down + 7h
 * sleep for night shifts) so this stays consistent with what's displayed
 * elsewhere in the app.
 */
export function resolveActiveShiftDate(
  todayISO: string,
  shiftsByDate: Map<string, Shift>,
  now: Date = new Date()
): string {
  const yesterday = toLocalISODate(new Date(new Date(`${todayISO}T00:00:00`).getTime() - 86400000));
  const yesterdayShift = shiftsByDate.get(yesterday);

  if (
    yesterdayShift &&
    (yesterdayShift.shift_type === "night" || yesterdayShift.shift_type === "long_day") &&
    yesterdayShift.start_time &&
    yesterdayShift.end_time
  ) {
    const start = new Date(`${yesterdayShift.date}T${yesterdayShift.start_time}:00`);
    const end = new Date(`${yesterdayShift.date}T${yesterdayShift.end_time}:00`);
    if (end.getTime() <= start.getTime()) {
      end.setDate(end.getDate() + 1); // crosses midnight
    }

    const windDown = 90;
    const sleepStart = new Date(end.getTime() + windDown * 60000);
    const sleepEnd = new Date(sleepStart.getTime() + 7 * 60 * 60000);

    if (now.getTime() < sleepEnd.getTime()) {
      return yesterday;
    }
  }

  return todayISO;
}
