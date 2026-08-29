import { Shift, ShiftType } from "./db";

export interface DayPlan {
  date: string;
  shift: Shift | null;
  sleepWindow: { start: string; end: string } | null;
  caffeineCutoff: string | null;
  energy: "High" | "Recovering" | "Medium" | "Low";
  isBestDay: boolean;
  recoveryScore: number; // 0-100, for the dial
  recoveryLabel: string; // wry human-readable label for the same number
}

/** Minutes since midnight, for a "HH:MM" string. */
function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

function toHHMM(totalMinutes: number): string {
  const m = ((totalMinutes % 1440) + 1440) % 1440; // wrap into 0..1439
  const h = Math.floor(m / 60);
  const mm = m % 60;
  return `${String(h).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
}

/**
 * Recommended sleep window for a given shift.
 * Night shifts: sleep starts ~90 min after finishing (wind-down time),
 * for a 7-hour block. Day/long-day shifts: sleep the night before,
 * ending with a buffer before the shift starts.
 */
function sleepWindowFor(shift: Shift): { start: string; end: string } | null {
  if (!shift.start_time || !shift.end_time) return null;

  const start = toMinutes(shift.start_time);
  const end = toMinutes(shift.end_time);

  if (shift.shift_type === "night") {
    // Shift crosses midnight (e.g. 19:00 -> 07:00 next day).
    const windDown = 90; // minutes after shift end before sleep starts
    const sleepStart = end + windDown;
    const sleepEnd = sleepStart + 7 * 60;
    return { start: toHHMM(sleepStart), end: toHHMM(sleepEnd) };
  }

  // Day / long day: sleep the night before, waking with a buffer
  // before the shift start (commute + getting ready).
  const buffer = 60;
  const sleepEnd = start - buffer;
  const sleepStart = sleepEnd - 7.5 * 60;
  return { start: toHHMM(sleepStart), end: toHHMM(sleepEnd) };
}

/** Caffeine cutoff: roughly 8 hours before the recommended sleep start. */
function caffeineCutoffFor(sleepWindow: { start: string; end: string } | null): string | null {
  if (!sleepWindow) return null;
  const sleepStart = toMinutes(sleepWindow.start);
  return toHHMM(sleepStart - 8 * 60);
}

/**
 * Energy forecast based on today's shift and what came before it.
 * This is a simple heuristic, not a clinical model — the point is to
 * give a useful nudge, not a diagnosis.
 */
function energyFor(today: Shift | null, yesterday: Shift | null, consecutiveNights: number): DayPlan["energy"] {
  if (!today || today.shift_type === "off") {
    // A day off right after a run of nights is recovery, not "high" yet.
    if (yesterday && yesterday.shift_type === "night") return "Recovering";
    return "High";
  }
  if (today.shift_type === "night") {
    if (consecutiveNights >= 3) return "Low";
    if (consecutiveNights === 2) return "Medium";
    return "Medium";
  }
  // day / long_day
  return "Medium";
}

/**
 * Build a plan for a range of dates from a flat list of shifts.
 * `shifts` should be sorted ascending by date and cover at least one
 * day before `dates[0]` so the "yesterday" lookups work.
 */
export function buildPlan(dates: string[], shiftsByDate: Map<string, Shift>): DayPlan[] {
  const plans: DayPlan[] = [];
  let consecutiveNights = 0;

  for (let i = 0; i < dates.length; i++) {
    const date = dates[i];
    const today = shiftsByDate.get(date) ?? null;
    const prevDate = new Date(date);
    prevDate.setDate(prevDate.getDate() - 1);
    const yesterday = shiftsByDate.get(prevDate.toISOString().slice(0, 10)) ?? null;

    if (today?.shift_type === "night") {
      consecutiveNights += 1;
    } else {
      consecutiveNights = 0;
    }

    const sleepWindow = today ? sleepWindowFor(today) : null;
    const caffeineCutoff = caffeineCutoffFor(sleepWindow);
    const energy = energyFor(today, yesterday, consecutiveNights);
    const { score: recoveryScore, label: recoveryLabel } = recoveryScoreFor(energy as DayPlan["energy"]);

    plans.push({
      date,
      shift: today,
      sleepWindow,
      caffeineCutoff,
      energy: energy as DayPlan["energy"],
      isBestDay: false, // filled in below
      recoveryScore,
      recoveryLabel,
    });
  }

  markBestDays(plans);
  return plans;
}

/**
 * Flags the best day each week for family time / errands / socialising:
 * a day off (or High/Recovering energy) that isn't sandwiched between
 * two working shifts.
 */
function markBestDays(plans: DayPlan[]) {
  for (let i = 0; i < plans.length; i++) {
    const p = plans[i];
    const isOff = !p.shift || p.shift.shift_type === "off";
    if (!isOff) continue;

    const prevWorking = plans[i - 1]?.shift && plans[i - 1].shift!.shift_type !== "off";
    const nextWorking = plans[i + 1]?.shift && plans[i + 1].shift!.shift_type !== "off";

    // Best days are off-days with a working day on at most one side —
    // a day off sandwiched between two shifts is for recovery, not living.
    if (!(prevWorking && nextWorking) && p.energy !== "Recovering") {
      p.isBestDay = true;
    }
  }
}

/**
 * Maps the energy category to a 0-100 score for the Recovery dial, plus a
 * wry human-readable label. Deterministic on purpose — the same energy
 * category always gives the same score, so the dial doesn't feel random.
 */
function recoveryScoreFor(energy: DayPlan["energy"]): { score: number; label: string } {
  switch (energy) {
    case "High":
      return { score: 88, label: "Suspiciously human" };
    case "Medium":
      return { score: 62, label: "Holding it together" };
    case "Recovering":
      return { score: 38, label: "Recovering — don't push it" };
    case "Low":
      return { score: 18, label: "Running on fumes" };
  }
}

export function shiftLabel(type: ShiftType): string {
  switch (type) {
    case "day":
      return "Day Shift";
    case "night":
      return "Night Shift";
    case "long_day":
      return "Long Day";
    case "off":
      return "Off";
  }
}
