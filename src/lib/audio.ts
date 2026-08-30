import { Track, AudioCategory } from "./db";
import { DayPlan } from "./schedule";

/** Same deterministic hash approach as quips.ts — stable per date, no
 * flicker on refresh, varies day to day. Duplicated rather than shared
 * to keep these two small files independent. */
function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h << 5) - h + s.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

/**
 * Decides which category of track fits today, based on the same plan
 * data driving the Daily Card. Returns null when nothing particularly
 * fits — a High-energy day off doesn't need a recovery track pushed at it.
 */
export function categoryFor(plan: DayPlan): AudioCategory | null {
  if (plan.shift && (plan.shift.shift_type === "night" || plan.shift.shift_type === "long_day")) {
    return "wind-down";
  }
  if (plan.energy === "Recovering") {
    return "relaxation";
  }
  if (plan.shift && plan.shift.shift_type === "day") {
    return "energize";
  }
  return null;
}

/** Picks one track from the matching category, stable for the given date. */
export function pickTrack(tracks: Track[], category: AudioCategory, seed: string): Track | null {
  const matches = tracks.filter((t) => t.category === category);
  if (matches.length === 0) return null;
  return matches[hashString(seed + category) % matches.length];
}

export const CATEGORY_LABEL: Record<AudioCategory, string> = {
  "wind-down": "Wind-down",
  sleep: "Sleep",
  relaxation: "Relaxation",
  energize: "Energize",
};
