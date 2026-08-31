import { Shift } from "./db";
import { buildPlan, DayPlan } from "./schedule";

export interface TrendPoint {
  date: string;
  score: number;
  label: string;
  hasShift: boolean; // false = an explicit "off" day with no shift row
}

/**
 * Builds recovery-score history for charting. Only includes dates that
 * actually have a shift row in the database — a day nobody ever logged
 * anything for isn't the same as a confirmed day off, and defaulting it
 * to "High" energy (schedule.ts's fallback for "no shift found") would
 * quietly fabricate a rosy data point out of missing data. Those days are
 * skipped entirely rather than charted as if they were real rest days.
 */
export function buildTrend(dates: string[], shiftsByDate: Map<string, Shift>): TrendPoint[] {
  const plans = buildPlan(dates, shiftsByDate);

  return plans
    .filter((p) => shiftsByDate.has(p.date)) // only dates with a real logged row
    .map((p) => ({
      date: p.date,
      score: p.recoveryScore,
      label: p.recoveryLabel,
      hasShift: true,
    }));
}

export function trendStats(points: TrendPoint[]): { average: number; best: TrendPoint | null; worst: TrendPoint | null } {
  if (points.length === 0) {
    return { average: 0, best: null, worst: null };
  }
  const average = Math.round(points.reduce((sum, p) => sum + p.score, 0) / points.length);
  const best = points.reduce((a, b) => (b.score > a.score ? b : a));
  const worst = points.reduce((a, b) => (b.score < a.score ? b : a));
  return { average, best, worst };
}
