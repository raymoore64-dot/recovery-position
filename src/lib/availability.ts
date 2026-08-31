import { Shift } from "./db";
import { buildPlan } from "./schedule";

export type AvailabilityStatus = "best" | "off" | "working";

export interface AvailabilityDay {
  date: string;
  status: AvailabilityStatus;
}

/**
 * Deliberately minimal: a partner or family member looking at a shared
 * link doesn't need exact shift times, sleep windows, energy scores, or
 * anything else personal — just "can we make plans this day or not".
 * This takes the full DayPlan (which has all of that detail) and throws
 * everything away except a three-state availability flag, so the public
 * route can never leak more than that even by accident.
 */
export function buildAvailability(dates: string[], shiftsByDate: Map<string, Shift>): AvailabilityDay[] {
  const plans = buildPlan(dates, shiftsByDate);
  return plans.map((p) => {
    let status: AvailabilityStatus = "working";
    if (!p.shift || p.shift.shift_type === "off") {
      status = p.isBestDay ? "best" : "off";
    }
    return { date: p.date, status };
  });
}
