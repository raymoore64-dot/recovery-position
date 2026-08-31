import { Shift } from "./db";

export interface NotificationTimes {
  sleepWindowStart: Date | null;
  caffeineCutoff: Date | null;
}

const NIGHT_WIND_DOWN_MINUTES = 90; // matches schedule.ts sleepWindowFor
const DAY_BUFFER_MINUTES = 60; // matches schedule.ts sleepWindowFor
const DAY_SLEEP_HOURS = 7.5; // matches schedule.ts sleepWindowFor
const CAFFEINE_CUTOFF_HOURS_BEFORE = 8; // matches schedule.ts caffeineCutoffFor

/**
 * Same calculation as schedule.ts's sleepWindowFor/caffeineCutoffFor, but
 * returning real Date objects (with the correct calendar day attached)
 * instead of a wrapped "HH:MM" string. schedule.ts only needs the display
 * string, so it doesn't track which day a night shift's sleep window
 * actually falls on — but a real notification needs an exact moment to
 * fire at, so this reconstructs that from the shift's date + times.
 */
export function notificationTimesFor(shift: Shift): NotificationTimes {
  if (!shift.start_time || !shift.end_time) {
    return { sleepWindowStart: null, caffeineCutoff: null };
  }

  const start = new Date(`${shift.date}T${shift.start_time}:00`);
  const end = new Date(`${shift.date}T${shift.end_time}:00`);
  if (end.getTime() <= start.getTime()) {
    end.setDate(end.getDate() + 1); // crosses midnight — a night shift
  }

  let sleepWindowStart: Date;
  if (shift.shift_type === "night") {
    sleepWindowStart = new Date(end.getTime() + NIGHT_WIND_DOWN_MINUTES * 60000);
  } else {
    // Day / long day: the recommended sleep is the night BEFORE the
    // shift, ending with a buffer before it starts.
    const sleepEnd = new Date(start.getTime() - DAY_BUFFER_MINUTES * 60000);
    sleepWindowStart = new Date(sleepEnd.getTime() - DAY_SLEEP_HOURS * 60 * 60000);
  }

  const caffeineCutoff = new Date(sleepWindowStart.getTime() - CAFFEINE_CUTOFF_HOURS_BEFORE * 60 * 60000);

  return { sleepWindowStart, caffeineCutoff };
}
