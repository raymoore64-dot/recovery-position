import db, { Shift } from "@/lib/db";
import { buildPlan, shiftLabel, DayPlan } from "@/lib/schedule";
import Link from "next/link";

// This page reads live data (today's date, current shifts) on every
// request, so it must never be statically prerendered at build time.
export const dynamic = "force-dynamic";

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function loadWeekPlan(): DayPlan[] {
  const today = new Date();
  const start = new Date(today);
  start.setDate(start.getDate() - 1); // one day back, so "yesterday" lookups work
  const end = new Date(today);
  end.setDate(end.getDate() + 6); // today + next 6 days

  const rows = db
    .prepare("SELECT * FROM shifts WHERE date BETWEEN ? AND ? ORDER BY date ASC")
    .all(isoDate(start), isoDate(end)) as Shift[];

  const byDate = new Map(rows.map((r) => [r.date, r]));

  const dates: string[] = [];
  const cursor = new Date(today);
  for (let i = 0; i < 7; i++) {
    dates.push(isoDate(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }

  // Prepend yesterday to the lookup range so energy/consecutive-night
  // calculations for "today" have context, but only return today onward.
  const allDates = [isoDate(start), ...dates];
  const allPlans = buildPlan(allDates, byDate);
  return allPlans.slice(1);
}

const energyColor: Record<DayPlan["energy"], string> = {
  High: "bg-sage text-navy-deep",
  Recovering: "bg-amber/30 text-navy",
  Medium: "bg-amber/60 text-navy-deep",
  Low: "bg-rose/70 text-paper",
};

export default function Home() {
  const plans = loadWeekPlan();
  const todayPlan = plans[0];
  const weekday = new Date(todayPlan.date + "T00:00:00").toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <div className="space-y-10">
      <section>
        <p className="text-xs font-bold tracking-widest uppercase text-amber-deep mb-2">
          Today &middot; {weekday}
        </p>

        {!todayPlan.shift ? (
          <div className="bg-cream rounded-xl p-6">
            <p
              style={{ fontFamily: "var(--font-display-semibold)" }}
              className="text-xl text-navy mb-2"
            >
              No shift logged for today.
            </p>
            <p className="text-sm text-ink/70">
              Even zombies have to start somewhere —{" "}
              <Link href="/roster" className="text-amber-deep font-semibold underline">
                add your roster
              </Link>{" "}
              to get your first Daily Card.
            </p>
          </div>
        ) : (
          <div className="bg-navy text-paper rounded-xl p-6">
            <h1
              style={{ fontFamily: "var(--font-display-semibold)" }}
              className="text-2xl mb-4"
            >
              {shiftLabel(todayPlan.shift.shift_type)}
              {todayPlan.shift.start_time && todayPlan.shift.end_time
                ? ` — ${todayPlan.shift.start_time}–${todayPlan.shift.end_time}`
                : ""}
            </h1>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="border-t border-paper/15 pt-3">
                <div className="text-paper/60 text-xs uppercase tracking-wide mb-1">
                  Sleep window
                </div>
                <div className="font-semibold">
                  {todayPlan.sleepWindow
                    ? `${todayPlan.sleepWindow.start} – ${todayPlan.sleepWindow.end}`
                    : "—"}
                </div>
              </div>
              <div className="border-t border-paper/15 pt-3">
                <div className="text-paper/60 text-xs uppercase tracking-wide mb-1">
                  Caffeine cutoff
                </div>
                <div className="font-semibold">{todayPlan.caffeineCutoff ?? "—"}</div>
              </div>
            </div>

            <div className="mt-4">
              <span
                className={`inline-block text-xs font-bold px-3 py-1 rounded-full ${energyColor[todayPlan.energy]}`}
              >
                Energy: {todayPlan.energy}
              </span>
              {todayPlan.isBestDay && (
                <span className="inline-block ml-2 text-xs font-bold px-3 py-1 rounded-full bg-amber text-navy-deep">
                  Best day for family &amp; errands
                </span>
              )}
            </div>
          </div>
        )}
      </section>

      <section>
        <h2
          style={{ fontFamily: "var(--font-display-semibold)" }}
          className="text-lg text-navy mb-3"
        >
          The next 7 days
        </h2>
        <div className="space-y-2">
          {plans.map((p) => {
            const d = new Date(p.date + "T00:00:00");
            const label = d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
            return (
              <div
                key={p.date}
                className="flex items-center justify-between bg-cream rounded-lg px-4 py-3 text-sm"
              >
                <div className="font-semibold text-navy w-28">{label}</div>
                <div className="flex-1 text-ink/80">
                  {p.shift ? shiftLabel(p.shift.shift_type) : "—"}
                </div>
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded-full ${energyColor[p.energy]}`}
                >
                  {p.energy}
                </span>
                {p.isBestDay && (
                  <span className="ml-2 text-xs font-bold px-2 py-0.5 rounded-full bg-amber text-navy-deep">
                    Best day
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
