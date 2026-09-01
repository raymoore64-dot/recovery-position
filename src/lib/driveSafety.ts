import { Shift } from "./db";

const CHECK_WINDOW_MINUTES = 90; // how long after shift end the check stays relevant

export interface DriveSafetyWindow {
  start: Date; // shift end time
  end: Date; // shift end + 90 min
}

export function driveSafetyWindowFor(shift: Shift): DriveSafetyWindow | null {
  if (!shift.start_time || !shift.end_time) return null;

  const start = new Date(`${shift.date}T${shift.start_time}:00`);
  const end = new Date(`${shift.date}T${shift.end_time}:00`);
  if (end.getTime() <= start.getTime()) {
    end.setDate(end.getDate() + 1); // crosses midnight — a night shift
  }

  const windowEnd = new Date(end.getTime() + CHECK_WINDOW_MINUTES * 60000);
  return { start: end, end: windowEnd };
}

export function isWithinDriveSafetyWindow(shift: Shift, now: Date = new Date()): boolean {
  const window = driveSafetyWindowFor(shift);
  if (!window) return false;
  return now.getTime() >= window.start.getTime() && now.getTime() <= window.end.getTime();
}
