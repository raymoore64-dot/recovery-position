import { Shift } from "./db";
import { buildPlan } from "./schedule";

export interface YearInReviewStats {
  totalShifts: number;
  totalNightShifts: number;
  totalDayShifts: number;
  totalLongDayShifts: number;
  totalOffDays: number;
  longestNightStreak: number;
  averageRecoveryScore: number | null;
  busiestMonth: { label: string; count: number } | null;
  firstLoggedDate: string | null;
  lastLoggedDate: string | null;
  daysTracked: number;
}

export function computeYearInReview(allShifts: Shift[]): YearInReviewStats {
  const sorted = [...allShifts].sort((a, b) => (a.date < b.date ? -1 : 1));

  const totalShifts = sorted.length;
  const totalNightShifts = sorted.filter((s) => s.shift_type === "night").length;
  const totalDayShifts = sorted.filter((s) => s.shift_type === "day").length;
  const totalLongDayShifts = sorted.filter((s) => s.shift_type === "long_day").length;
  const totalOffDays = sorted.filter((s) => s.shift_type === "off").length;

  let longestNightStreak = 0;
  let currentStreak = 0;
  let prevDate: Date | null = null;
  for (const s of sorted) {
    const d = new Date(s.date + "T00:00:00");
    const isConsecutive = prevDate ? d.getTime() - prevDate.getTime() === 86400000 : false;
    if (s.shift_type === "night") {
      currentStreak = isConsecutive && currentStreak > 0 ? currentStreak + 1 : 1;
      longestNightStreak = Math.max(longestNightStreak, currentStreak);
    } else {
      currentStreak = 0;
    }
    prevDate = d;
  }

  let averageRecoveryScore: number | null = null;
  if (sorted.length > 0) {
    const dates = sorted.map((s) => s.date);
    const shiftsByDate = new Map(sorted.map((s) => [s.date, s]));
    const plans = buildPlan(dates, shiftsByDate);
    const relevant = plans.filter((p) => shiftsByDate.has(p.date));
    if (relevant.length > 0) {
      averageRecoveryScore = Math.round(relevant.reduce((sum, p) => sum + p.recoveryScore, 0) / relevant.length);
    }
  }

  const monthCounts = new Map<string, number>();
  for (const s of sorted) {
    const monthKey = s.date.slice(0, 7);
    monthCounts.set(monthKey, (monthCounts.get(monthKey) || 0) + 1);
  }
  let busiestMonth: { label: string; count: number } | null = null;
  for (const [key, count] of monthCounts) {
    if (!busiestMonth || count > busiestMonth.count) {
      const d = new Date(key + "-01T00:00:00");
      const label = d.toLocaleDateString("en-GB", { month: "long", year: "numeric" });
      busiestMonth = { label, count };
    }
  }

  const firstLoggedDate = sorted.length > 0 ? sorted[0].date : null;
  const lastLoggedDate = sorted.length > 0 ? sorted[sorted.length - 1].date : null;
  const daysTracked =
    firstLoggedDate && lastLoggedDate
      ? Math.round(
          (new Date(lastLoggedDate + "T00:00:00").getTime() - new Date(firstLoggedDate + "T00:00:00").getTime()) /
            86400000
        ) + 1
      : 0;

  return {
    totalShifts,
    totalNightShifts,
    totalDayShifts,
    totalLongDayShifts,
    totalOffDays,
    longestNightStreak,
    averageRecoveryScore,
    busiestMonth,
    firstLoggedDate,
    lastLoggedDate,
    daysTracked,
  };
}
