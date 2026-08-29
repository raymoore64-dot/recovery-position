import { Shift } from "./db";
import { DayPlan, buildPlan } from "./schedule";

export interface LeaveCandidate {
  startDate: string;
  endDate: string;
  lengthDays: number;
  /** Higher is better. Not a percentage — just for ranking candidates against each other. */
  score: number;
  recoveringDays: number;
  restedDays: number;
  beforeNote: string;
  afterNote: string;
}

/**
 * Scans a date range for runs of consecutive off-days at least `minLength`
 * long, and scores each by how much of it is genuine rest versus recovery
 * from the shifts either side of it.
 *
 * `dates` must be sorted ascending and should include a day or two either
 * side of the actual search window, so the "day before" / "day after"
 * context is available for the first and last candidates.
 */
export function findLeaveCandidates(
  dates: string[],
  shiftsByDate: Map<string, Shift>,
  minLength: number
): LeaveCandidate[] {
  const plans = buildPlan(dates, shiftsByDate);
  const candidates: LeaveCandidate[] = [];

  let runStart: number | null = null;

  for (let i = 0; i <= plans.length; i++) {
    const isOff = i < plans.length && (!plans[i].shift || plans[i].shift!.shift_type === "off");

    if (isOff && runStart === null) {
      runStart = i;
    }

    if ((!isOff || i === plans.length) && runStart !== null) {
      const runEnd = i - 1; // inclusive
      const length = runEnd - runStart + 1;
      if (length >= minLength) {
        candidates.push(scoreRun(plans, runStart, runEnd));
      }
      runStart = null;
    }
  }

  return candidates.sort((a, b) => b.score - a.score);
}

function scoreRun(plans: DayPlan[], startIdx: number, endIdx: number): LeaveCandidate {
  const run = plans.slice(startIdx, endIdx + 1);
  const recoveringDays = run.filter((p) => p.energy === "Recovering").length;
  const restedDays = run.length - recoveringDays;

  const before = startIdx > 0 ? plans[startIdx - 1] : null;
  const after = endIdx < plans.length - 1 ? plans[endIdx + 1] : null;

  let score = restedDays * 2 - recoveringDays * 1;

  let beforeNote = "Starts the search window — no prior shift on record.";
  if (before?.shift) {
    if (before.shift.shift_type === "night") {
      beforeNote = "Comes straight off a night shift — the first day or so is recovery, not free time.";
      score -= 1;
    } else if (before.shift.shift_type === "off") {
      beforeNote = "Already rested going in — no recovery day needed.";
      score += 1;
    } else {
      beforeNote = "Comes off a day shift — an easy transition into leave.";
    }
  }

  let afterNote = "Runs to the edge of the search window — no return shift on record.";
  if (after?.shift) {
    if (after.shift.shift_type === "night") {
      afterNote = "Straight back into a night shift — the last day is really a wind-up, not leave.";
      score -= 1;
    } else if (after.shift.shift_type === "off") {
      afterNote = "Nothing pressing on return — the leave doesn't get cut short.";
      score += 1;
    } else {
      afterNote = "Eases back in with a day shift — a soft return.";
    }
  }

  return {
    startDate: run[0].date,
    endDate: run[run.length - 1].date,
    lengthDays: run.length,
    score,
    recoveringDays,
    restedDays,
    beforeNote,
    afterNote,
  };
}
