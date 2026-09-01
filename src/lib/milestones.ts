export interface Milestone {
  threshold: number;
  message: string;
}

export const MILESTONES: Milestone[] = [
  { threshold: 10, message: "Ten night shifts. You've survived double digits." },
  { threshold: 25, message: "25 night shifts. A quarter of the way to feeling something." },
  { threshold: 50, message: "50 night shifts. Genuinely impressive. Possibly concerning." },
  { threshold: 100, message: "100 night shifts. Triple digits. You're basically nocturnal now." },
  { threshold: 200, message: "200 night shifts. At this point it's less a job and more a lifestyle choice." },
  { threshold: 300, message: "300 night shifts. Respect." },
  { threshold: 500, message: "500 night shifts. Half a thousand. That's not a number, that's a personality trait." },
  { threshold: 750, message: "750 night shifts. Closing in on four figures." },
  { threshold: 1000, message: "1,000 night shifts. A full thousand. Someone should be handing out medals." },
  { threshold: 1500, message: "1,500 night shifts. At this point the night shift is just your shift." },
  { threshold: 2000, message: "2,000 night shifts. Genuinely remarkable. Go and sit down." },
];

/**
 * Given the current total and the set of thresholds already celebrated,
 * returns the highest threshold that's been crossed but not yet shown —
 * or null if there's nothing new to celebrate. Returns at most one
 * milestone even if several were crossed at once (e.g. importing old
 * roster data in bulk shouldn't fire ten celebrations in a row).
 */
export function nextUncelebratedMilestone(total: number, celebrated: Set<number>): Milestone | null {
  const eligible = MILESTONES.filter((m) => total >= m.threshold && !celebrated.has(m.threshold));
  if (eligible.length === 0) return null;
  return eligible[eligible.length - 1];
}
