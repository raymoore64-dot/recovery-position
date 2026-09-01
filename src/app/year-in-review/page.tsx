import db, { Shift } from "@/lib/db";
import { computeYearInReview } from "@/lib/yearInReview";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default function YearInReviewPage() {
  const allShifts = db.prepare("SELECT * FROM shifts ORDER BY date ASC").all() as Shift[];
  const stats = computeYearInReview(allShifts);

  if (stats.totalShifts === 0) {
    return (
      <div className="space-y-6">
        <Link href="/more" className="text-xs font-semibold text-amber-deep hover:underline">
          ← Back to More
        </Link>
        <div>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-deep mb-2">
            Year in Review
          </p>
          <h1 style={{ fontFamily: "var(--font-display)" }} className="text-3xl text-ink mb-2 tracking-tight">
            Nothing logged yet.
          </h1>
          <p className="text-sm text-ink/70 max-w-lg">
            This fills in as you use{" "}
            <Link href="/roster" className="text-amber-deep hover:underline">
              Roster
            </Link>{" "}
            — come back once you&apos;ve got some real history.
          </p>
        </div>
      </div>
    );
  }

  const firstLabel = stats.firstLoggedDate
    ? new Date(stats.firstLoggedDate + "T00:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })
    : "";
  const lastLabel = stats.lastLoggedDate
    ? new Date(stats.lastLoggedDate + "T00:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })
    : "";

  return (
    <div className="space-y-8">
      <div>
        <Link href="/more" className="text-xs font-semibold text-amber-deep hover:underline">
          ← Back to More
        </Link>
        <p className="text-xs font-bold tracking-widest uppercase text-amber-deep mb-2 mt-3">
          Year in Review
        </p>
        <h1 style={{ fontFamily: "var(--font-display)" }} className="text-3xl text-ink mb-2 tracking-tight">
          Everything, so far.
        </h1>
        <p className="text-sm text-ink/70 max-w-lg">
          {firstLabel} to {lastLabel} — {stats.daysTracked.toLocaleString()} days of real history.
        </p>
      </div>

      <div className="space-y-4">
        <div className="relative overflow-hidden bg-navy rounded-3xl p-8 sm:p-10 card-shadow">
          <div className="moonbleed" />
          <div className="relative z-10">
            <div className="text-xs font-bold uppercase tracking-wide text-amber mb-2">
              Shifts logged
            </div>
            <div style={{ fontFamily: "var(--font-display)" }} className="text-6xl text-ink mb-3 tracking-tight">
              {stats.totalShifts.toLocaleString()}
            </div>
            <div className="flex flex-wrap gap-2 text-xs text-ink/70">
              <span className="bg-white/10 rounded-full px-3 py-1">{stats.totalNightShifts} night</span>
              <span className="bg-white/10 rounded-full px-3 py-1">{stats.totalDayShifts} day</span>
              <span className="bg-white/10 rounded-full px-3 py-1">{stats.totalLongDayShifts} long day</span>
              <span className="bg-white/10 rounded-full px-3 py-1">{stats.totalOffDays} off</span>
            </div>
          </div>
        </div>

        <div className="bg-cream rounded-3xl p-8 sm:p-10 card-shadow">
          <div className="text-xs font-bold uppercase tracking-wide text-rose mb-2">
            🌙 Night shifts survived
          </div>
          <div style={{ fontFamily: "var(--font-display)" }} className="text-6xl text-ink tracking-tight">
            {stats.totalNightShifts.toLocaleString()}
          </div>
        </div>

        <div className="bg-cream rounded-3xl p-8 sm:p-10 card-shadow">
          <div className="text-xs font-bold uppercase tracking-wide text-amber-deep mb-2">
            Longest night-shift streak
          </div>
          <div style={{ fontFamily: "var(--font-display)" }} className="text-6xl text-ink tracking-tight">
            {stats.longestNightStreak.toLocaleString()}
          </div>
          <p className="text-sm text-ink/60 mt-2">
            consecutive night{stats.longestNightStreak === 1 ? "" : "s"} in a row
          </p>
        </div>

        {stats.averageRecoveryScore !== null && (
          <div className="bg-cream rounded-3xl p-8 sm:p-10 card-shadow">
            <div className="text-xs font-bold uppercase tracking-wide text-sage mb-2">
              Average Recovery Score
            </div>
            <div style={{ fontFamily: "var(--font-display)" }} className="text-6xl text-ink tracking-tight">
              {stats.averageRecoveryScore}
            </div>
            <p className="text-sm text-ink/60 mt-2">across every day you&apos;ve logged</p>
          </div>
        )}

        {stats.busiestMonth && (
          <div className="bg-cream rounded-3xl p-8 sm:p-10 card-shadow">
            <div className="text-xs font-bold uppercase tracking-wide text-amber-deep mb-2">
              Busiest month
            </div>
            <div style={{ fontFamily: "var(--font-display)" }} className="text-4xl text-ink tracking-tight mb-1">
              {stats.busiestMonth.label}
            </div>
            <p className="text-sm text-ink/60">{stats.busiestMonth.count} shifts logged</p>
          </div>
        )}
      </div>
    </div>
  );
}
