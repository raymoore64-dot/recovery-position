import { ShiftType } from "./db";
import { DayPlan } from "./schedule";

const NIGHT_QUIPS = [
  "19:00. Your circadian rhythm would like to file a complaint.",
  "Somewhere, someone is having a normal evening. Not you.",
  "The sun is setting on everyone else's day and rising on yours.",
  "Coffee is not a personality trait. Tonight, it's load-bearing.",
  "You vs. your own melatonin. Round one.",
];

const DAY_QUIPS = [
  "A day shift. Practically a holiday.",
  "Daylight and colleagues who aren't hallucinating from tiredness. Living the dream.",
  "Normal hours. Suspicious, but we'll take it.",
];

const LONG_DAY_QUIPS = [
  "A long day. The clue was in the name.",
  "Thirteen-plus hours. Bring snacks, bring patience.",
];

const OFF_RECOVERING_QUIPS = [
  "Technically awake. Legally still recovering.",
  "This day doesn't count as a day off. It's admin for your nervous system.",
  "Recovery isn't glamorous, but neither is a night shift, so.",
];

const OFF_BEST_DAY_QUIPS = [
  "Rare sighting: free time. Don't scare it off.",
  "A genuinely good day off. Treat it with the respect it deserves.",
  "This is the day. Not tomorrow's version of this day. This one.",
];

const OFF_QUIPS = [
  "A day off that's actually off. Novel concept.",
  "Nothing rostered. Suspicious, but enjoy it.",
];

/** Simple deterministic string hash, so the same date+context always
 * picks the same quip — no flicker on refresh, but it changes day to day. */
function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h << 5) - h + s.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

function pick(bank: string[], seed: string): string {
  return bank[hashString(seed) % bank.length];
}

/** Picks a quip for the Daily Card, based on today's shift and context. */
export function quipFor(plan: DayPlan): string {
  const seed = plan.date;

  if (!plan.shift || plan.shift.shift_type === "off") {
    if (plan.isBestDay) return pick(OFF_BEST_DAY_QUIPS, seed);
    if (plan.energy === "Recovering") return pick(OFF_RECOVERING_QUIPS, seed);
    return pick(OFF_QUIPS, seed);
  }

  const type: ShiftType = plan.shift.shift_type;
  if (type === "night") return pick(NIGHT_QUIPS, seed);
  if (type === "long_day") return pick(LONG_DAY_QUIPS, seed);
  return pick(DAY_QUIPS, seed);
}
