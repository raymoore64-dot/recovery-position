import db, { Shift } from "@/lib/db";
import { buildPlan, DayPlan } from "@/lib/schedule";
import { toLocalISODate } from "@/lib/date";
import { LIBRARY, featuredFor, allEntriesFlat, LibraryTag } from "@/lib/libraryContent";
import LibraryEntryCard from "@/components/LibraryEntryCard";
import ShuffleReveal from "@/components/ShuffleReveal";
import BreathingCircle from "@/components/BreathingCircle";
import TriedCount from "@/components/TriedCount";
import { ReactNode } from "react";

// Reads today's shift to pick a contextually relevant "best for today"
// entry, so this must never be statically prerendered.
export const dynamic = "force-dynamic";

function loadTodayPlan(): DayPlan {
  const today = new Date();
  const start = new Date(today);
  start.setDate(start.getDate() - 1);
  const todayISO = toLocalISODate(today);
  const startISO = toLocalISODate(start);

  const rows = db
    .prepare("SELECT * FROM shifts WHERE date BETWEEN ? AND ? ORDER BY date ASC")
    .all(startISO, todayISO) as Shift[];
  const byDate = new Map(rows.map((r) => [r.date, r]));

  const plans = buildPlan([startISO, todayISO], byDate);
  return plans[1];
}

function contextTagsFor(plan: DayPlan): LibraryTag[] {
  const tags: LibraryTag[] = [];
  if (plan.shift?.shift_type === "night" || plan.shift?.shift_type === "long_day") tags.push("night");
  if (plan.shift?.shift_type === "day") tags.push("day");
  if (!plan.shift || plan.shift.shift_type === "off") tags.push("off");
  if (plan.energy === "Recovering") tags.push("recovering");
  if (plan.energy === "Low") tags.push("low-energy");
  return tags;
}

function SectionIcon({ id }: { id: string }): ReactNode {
  const common = "w-6 h-6 text-amber-deep";
  switch (id) {
    case "sleep":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={common}>
          <path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "relaxation":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={common}>
          <path d="M12 21c4-2 7-5.5 7-9.5A6 6 0 0 0 12 5a6 6 0 0 0-7 6.5C5 15.5 8 19 12 21Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
          <path d="M12 21V11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );
    case "fitness":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={common}>
          <circle cx="12" cy="5" r="2" stroke="currentColor" strokeWidth="1.8" />
          <path d="M12 7v5m0 0-4 3m4-3 4 3m-4-3v7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "light":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={common}>
          <circle cx="12" cy="12" r="4.5" stroke="currentColor" strokeWidth="1.8" />
          <path d="M12 3v2.2M12 18.8V21M4.2 12H2M22 12h-2.2M5.6 5.6l1.5 1.5M16.9 16.9l1.5 1.5M5.6 18.4l1.5-1.5M16.9 7.1l1.5-1.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );
    case "eating":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={common}>
          <path d="M7 3v6a2 2 0 0 0 2 2v10M7 3v18M7 9H5M17 3c-2 0-3 2-3 5s1 4 3 4v10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "connection":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={common}>
          <circle cx="8" cy="9" r="3" stroke="currentColor" strokeWidth="1.8" />
          <circle cx="17" cy="15" r="3" stroke="currentColor" strokeWidth="1.8" />
          <path d="M10.5 10.5l4 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );
    default:
      return null;
  }
}

export default function LibraryPage() {
  const todayPlan = loadTodayPlan();
  const contextTags = contextTagsFor(todayPlan);
  const featured = featuredFor(contextTags, todayPlan.date);
  const allEntries = allEntriesFlat();
  const totalEntries = allEntries.length;

  return (
    <div className="space-y-10">
      <div>
        <p className="text-xs font-bold tracking-widest uppercase text-amber-deep mb-2">
          Rest &amp; Recovery Library
        </p>
        <h1 style={{ fontFamily: "var(--font-display)" }} className="text-3xl text-ink mb-2 tracking-tight">
          Forty years of actually needing this.
        </h1>
        <p className="text-sm text-ink/70 max-w-xl mb-2">
          None of this is a substitute for a proper night&apos;s sleep. It&apos;s what&apos;s left
          in the gaps — the days your rota gives you, used a bit better.
        </p>
        <TriedCount total={totalEntries} />
      </div>

      <section>
        <ShuffleReveal allEntries={allEntries} />
      </section>

      {featured && (
        <section>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-deep mb-2">
            Best for today
          </p>
          <LibraryEntryCard entry={featured.entry} featured />
        </section>
      )}

      {LIBRARY.map((cat) => (
        <section key={cat.id}>
          <div className="flex items-center gap-3 mb-2 text-ink">
            <SectionIcon id={cat.id} />
            <h2 style={{ fontFamily: "var(--font-display-semibold)" }} className="text-lg">
              {cat.label}
            </h2>
          </div>
          <p className="text-sm text-ink/70 mb-4 max-w-xl">{cat.intro}</p>

          {cat.id === "relaxation" && (
            <div className="mb-4">
              <BreathingCircle />
            </div>
          )}

          <div className="space-y-3">
            {cat.entries.map((entry) => (
              <LibraryEntryCard key={entry.title} entry={entry} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
