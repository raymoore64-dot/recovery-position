import db, { Shift } from "@/lib/db";
import { buildTrend, trendStats } from "@/lib/trends";
import { toLocalISODate } from "@/lib/date";
import TrendChart from "@/components/TrendChart";
import Link from "next/link";

export const dynamic = "force-dynamic";

const RANGE_DAYS = 30;

export default function TrendsPage() {
  const today = new Date();
  const start = new Date(today);
  start.setDate(start.getDate() - RANGE_DAYS);

  const startISO = toLocalISODate(start);
  const todayISO = toLocalISODate(today);

  const rows = db
    .prepare("SELECT * FROM shifts WHERE date BETWEEN ? AND ? ORDER BY date ASC")
    .all(startISO, todayISO) as Shift[];
  const shiftsByDate = new Map(rows.map((r) => [r.date, r]));

  const dates: string[] = [];
  const cursor = new Date(start);
  while (toLocalISODate(cursor) <= todayISO) {
    dates.push(toLocalISODate(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }

  const points = buildTrend(dates, shiftsByDate);
  const stats = trendStats(points);

  return (
    <div className="space-y-8">
      <div>
        <Link href="/" className="text-xs font-semibold text-amber-deep hover:underline">
          ← Back to Today
        </Link>
        <p className="text-xs font-bold tracking-widest uppercase text-amber-deep mb-2 mt-3">
          Recovery Trend
        </p>
        <h1 style={{ fontFamily: "var(--font-display)" }} className="text-3xl text-ink mb-2 tracking-tight">
          The last {RANGE_DAYS} days, honestly.
        </h1>
        <p className="text-sm text-ink/70 max-w-lg">
          Your Recovery Score over time, built only from days you actually logged — no fabricated
          data for days nothing was entered. The more consistently you log, the more useful this
          gets.
        </p>
        <Link href="/vitals" className="text-xs font-semibold text-amber-deep hover:underline mt-2 inline-block">
          Also tracking vitals? →
        </Link>
      </div>

      <div className="bg-cream rounded-2xl p-5 sm:p-7 card-shadow">
        <TrendChart points={points} />
      </div>

      {points.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-cream rounded-xl p-4 card-shadow">
            <div className="text-xs font-bold uppercase tracking-wide text-amber-deep mb-1">
              Average
            </div>
            <div style={{ fontFamily: "var(--font-display)" }} className="text-3xl text-ink">
              {stats.average}
            </div>
          </div>
          {stats.best && (
            <div className="bg-cream rounded-xl p-4 card-shadow">
              <div className="text-xs font-bold uppercase tracking-wide text-sage mb-1">
                Best day
              </div>
              <div style={{ fontFamily: "var(--font-display)" }} className="text-3xl text-ink">
                {stats.best.score}
              </div>
              <div className="text-xs text-ink/50 mt-0.5">
                {new Date(stats.best.date + "T00:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
              </div>
            </div>
          )}
          {stats.worst && (
            <div className="bg-cream rounded-xl p-4 card-shadow">
              <div className="text-xs font-bold uppercase tracking-wide text-rose mb-1">
                Toughest day
              </div>
              <div style={{ fontFamily: "var(--font-display)" }} className="text-3xl text-ink">
                {stats.worst.score}
              </div>
              <div className="text-xs text-ink/50 mt-0.5">
                {new Date(stats.worst.date + "T00:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
              </div>
            </div>
          )}
        </div>
      )}

      {points.length === 0 && (
        <p className="text-sm text-ink/60">
          Nothing logged in the last {RANGE_DAYS} days yet — this will fill in as you use{" "}
          <Link href="/roster" className="text-amber-deep hover:underline">
            Roster
          </Link>
          .
        </p>
      )}
    </div>
  );
}
