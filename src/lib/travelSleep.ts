import { Shift } from "./db";

export interface TravelSleepResult {
  sleepWindow: { start: string; end: string; date: string } | null;
  warning: string | null;
  precedingShiftNote: string | null;
}

const WIND_DOWN_MINUTES = 45; // shorter than the normal 90 — this is deadline-driven, not unconstrained rest
const MAX_SLEEP_HOURS = 8;
const SHORT_SLEEP_WARNING_HOURS = 3;

/**
 * The actual end datetime of a shift, correctly handling shifts that cross
 * midnight (night shifts) without hardcoding on shift_type — if the parsed
 * end time comes out before the start time on the same calendar date, that
 * means it rolled into the next day, so we add a day. This is more robust
 * than branching on shift_type directly, since it also handles unusual
 * cases (e.g. a long day shift that happens to run past midnight).
 */
function shiftEndDateTime(shift: Shift): Date | null {
  if (!shift.start_time || !shift.end_time) return null;
  const start = new Date(`${shift.date}T${shift.start_time}:00`);
  const end = new Date(`${shift.date}T${shift.end_time}:00`);
  if (end.getTime() <= start.getTime()) {
    end.setDate(end.getDate() + 1);
  }
  return end;
}

function fmtTime(d: Date): string {
  const h = String(d.getHours()).padStart(2, "0");
  const m = String(d.getMinutes()).padStart(2, "0");
  return `${h}:${m}`;
}

function fmtDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/**
 * Given an event's date+time and the shifts that might fall in the day or
 * two beforehand, works out when to sleep beforehand — the "I finish
 * nights at 7am, my flight's at 3pm — when should I sleep?" calculation.
 *
 * `candidateShifts` should include any shifts on the event's date and the
 * day before it (that's enough to find the one relevant shift regardless
 * of whether it's a night shift ending the morning of the event, or a day
 * shift ending the evening before).
 */
export function calculateTravelSleep(
  eventDateISO: string,
  eventTime: string,
  candidateShifts: Shift[],
  bufferMinutesBeforeEvent: number = 90
): TravelSleepResult {
  const eventDateTime = new Date(`${eventDateISO}T${eventTime}:00`);
  const readyBy = new Date(eventDateTime.getTime() - bufferMinutesBeforeEvent * 60000);

  // Find the shift (if any) whose end falls before the event and is the
  // closest one to it — that's the shift actually constraining sleep.
  let precedingShift: Shift | null = null;
  let precedingEnd: Date | null = null;

  for (const shift of candidateShifts) {
    if (shift.shift_type === "off") continue;
    const end = shiftEndDateTime(shift);
    if (!end) continue;
    if (end.getTime() < eventDateTime.getTime()) {
      if (!precedingEnd || end.getTime() > precedingEnd.getTime()) {
        precedingShift = shift;
        precedingEnd = end;
      }
    }
  }

  // No relevant shift right before the event — just recommend a normal
  // night's sleep ending with the buffer before the event.
  if (!precedingShift || !precedingEnd) {
    const sleepEnd = readyBy;
    const sleepStart = new Date(sleepEnd.getTime() - MAX_SLEEP_HOURS * 60 * 60000);
    return {
      sleepWindow: { start: fmtTime(sleepStart), end: fmtTime(sleepEnd), date: fmtDate(sleepStart) },
      warning: null,
      precedingShiftNote: "No shift found right before this — treating it as a normal night's sleep.",
    };
  }

  const earliestPossibleStart = new Date(precedingEnd.getTime() + WIND_DOWN_MINUTES * 60000);

  if (earliestPossibleStart.getTime() >= readyBy.getTime()) {
    return {
      sleepWindow: null,
      warning:
        "There's no real sleep window here — the shift runs right up to when you need to be ready. Consider a short nap beforehand if you can, and plan to catch up properly after the event.",
      precedingShiftNote: `Last shift before this ends at ${fmtTime(precedingEnd)}.`,
    };
  }

  // Anchor the sleep window to END right at "ready by" time and work
  // backward for a full night — not to START right after wind-down. That
  // way, if there's a big gap before the event, the recommendation is a
  // normal night ending near the event rather than an oddly early wake-up
  // hours before it's actually needed. The wind-down time is only a floor
  // on how early sleep can realistically start, not the anchor point.
  const idealStart = new Date(readyBy.getTime() - MAX_SLEEP_HOURS * 60 * 60000);
  const sleepStart = idealStart.getTime() > earliestPossibleStart.getTime() ? idealStart : earliestPossibleStart;
  const sleepEnd = readyBy;

  const availableMs = sleepEnd.getTime() - sleepStart.getTime();
  const availableHours = availableMs / 3600000;
  const warning =
    availableHours < SHORT_SLEEP_WARNING_HOURS
      ? `Only about ${availableHours.toFixed(1)} hours available. If you can, grab a short nap now and prioritise proper sleep after the event instead of forcing this window.`
      : null;

  return {
    sleepWindow: { start: fmtTime(sleepStart), end: fmtTime(sleepEnd), date: fmtDate(sleepStart) },
    warning,
    precedingShiftNote: `Last shift before this ends at ${fmtTime(precedingEnd)}.`,
  };
}
