"use client";

import { useState } from "react";
import { Shift } from "@/lib/db";
import { findLeaveCandidates, LeaveCandidate } from "@/lib/leave";
import { toLocalISODate } from "@/lib/date";

function todayISO() {
  return toLocalISODate(new Date());
}

function addMonths(iso: string, n: number): string {
  const d = new Date(iso + "T00:00:00");
  d.setMonth(d.getMonth() + n);
  return toLocalISODate(d);
}

function formatDate(iso: string): string {
  return new Date(iso + "T00:00:00").toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

export default function LeavePlannerPage() {
  const [rangeStart, setRangeStart] = useState(todayISO());
  const [rangeEnd, setRangeEnd] = useState(addMonths(todayISO(), 3));
  const [minLength, setMinLength] = useState(5);
  const [candidates, setCandidates] = useState<LeaveCandidate[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [clampedNote, setClampedNote] = useState<string | null>(null);
  const [noRosterData, setNoRosterData] = useState(false);

  async function handleSearch() {
    setLoading(true);
    setSearched(true);
    setClampedNote(null);
    setNoRosterData(false);

    const res = await fetch(`/api/shifts?from=${rangeStart}&to=${rangeEnd}`);
    const rows: Shift[] = await res.json();

    if (rows.length === 0) {
      setNoRosterData(true);
      setCandidates([]);
      setLoading(false);
      return;
    }

    const shiftsByDate = new Map(rows.map((s) => [s.date, s]));

    // Only scan up to the last date that actually has a roster entry.
    // Dates with no entry at all default to "no shift" in buildPlan, which
    // would otherwise look identical to a real day off — that's fine for
    // the Daily Card (it just means "nothing rostered yet"), but here it
    // would fabricate leave options out of a blank, unrostered future.
    const maxKnownDate = rows.reduce((max, s) => (s.date > max ? s.date : max), rows[0].date);
    const effectiveEnd = maxKnownDate < rangeEnd ? maxKnownDate : rangeEnd;
    if (effectiveEnd < rangeEnd) {
      setClampedNote(
        `Your roster is only entered up to ${formatDate(maxKnownDate)} — results are limited to that range.`
      );
    }

    const dates: string[] = [];
    const cursor = new Date(rangeStart + "T00:00:00");
    const end = new Date(effectiveEnd + "T00:00:00");
    while (cursor <= end) {
      dates.push(toLocalISODate(cursor));
      cursor.setDate(cursor.getDate() + 1);
    }

    const results = findLeaveCandidates(dates, shiftsByDate, minLength);
    setCandidates(results);
    setLoading(false);
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-bold tracking-widest uppercase text-amber-deep mb-2">
          Leave Planner
        </p>
        <h1 style={{ fontFamily: "var(--font-display)" }} className="text-3xl text-ink mb-2 tracking-tight">
          Find leave that actually recovers you.
        </h1>
        <p className="text-sm text-ink/70 max-w-lg">
          This scans your roster for stretches of days off long enough to book as leave, and
          ranks them by how much of it is genuine rest versus recovery from the shifts either
          side of it.
        </p>
      </div>

      <div className="bg-cream rounded-2xl p-7 space-y-4 card-shadow">
        <div className="grid grid-cols-3 gap-4">
          <label className="block">
            <span className="text-xs font-semibold text-ink uppercase tracking-wide">
              Search from
            </span>
            <input
              type="date"
              value={rangeStart}
              onChange={(e) => setRangeStart(e.target.value)}
              className="mt-1 w-full rounded-md border border-line bg-paper px-3 py-2 text-sm"
            />
          </label>
          <label className="block">
            <span className="text-xs font-semibold text-ink uppercase tracking-wide">
              Search to
            </span>
            <input
              type="date"
              value={rangeEnd}
              onChange={(e) => setRangeEnd(e.target.value)}
              className="mt-1 w-full rounded-md border border-line bg-paper px-3 py-2 text-sm"
            />
          </label>
          <label className="block">
            <span className="text-xs font-semibold text-ink uppercase tracking-wide">
              Min. days off
            </span>
            <input
              type="number"
              min={1}
              max={60}
              value={minLength}
              onChange={(e) => setMinLength(Math.max(1, Number(e.target.value)))}
              className="mt-1 w-full rounded-md border border-line bg-paper px-3 py-2 text-sm"
            />
          </label>
        </div>
        <button
          onClick={handleSearch}
          disabled={loading}
          className="btn-primary bg-amber text-navy-deep font-bold text-sm px-5 py-2.5 rounded-full hover:bg-amber-deep hover:text-ink transition-colors disabled:opacity-50"
        >
          {loading ? "Searching…" : "Find best leave dates"}
        </button>
      </div>

      {searched && !loading && noRosterData && (
        <div className="bg-cream rounded-2xl p-6 card-shadow">
          <p className="text-sm text-ink/70">
            No shifts entered in this range yet — the Leave Planner only works with dates that
            are actually on your roster.{" "}
            <a href="/roster" className="text-amber-deep font-semibold underline">
              Add some shifts
            </a>{" "}
            first, then come back and search.
          </p>
        </div>
      )}

      {searched && !loading && !noRosterData && candidates && (
        <div>
          {clampedNote && (
            <p className="text-xs text-amber-deep font-semibold mb-4 bg-amber/10 rounded-lg px-3 py-2">
              {clampedNote}
            </p>
          )}
          <h2 style={{ fontFamily: "var(--font-display)" }} className="text-2xl text-ink mb-4 tracking-tight">
            {candidates.length === 0
              ? "No stretches that long, in this range."
              : `${candidates.length} option${candidates.length === 1 ? "" : "s"}, best first`}
          </h2>

          {candidates.length === 0 ? (
            <p className="text-sm text-ink/60">
              Try a shorter minimum, a wider search range, or check your roster covers this
              period — leave candidates only come from shifts that have actually been entered.
            </p>
          ) : (
            <div className="space-y-3">
              {candidates.slice(0, 10).map((c, i) => (
                <div key={c.startDate} className="bg-cream rounded-2xl p-6 card-shadow">
                  <div className="flex items-baseline justify-between mb-2">
                    <div
                      style={{ fontFamily: "var(--font-display)" }}
                      className="text-xl text-ink tracking-tight"
                    >
                      {formatDate(c.startDate)} — {formatDate(c.endDate)}
                    </div>
                    <div className="flex items-center gap-2">
                      {i === 0 && (
                        <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber text-navy-deep">
                          Best option
                        </span>
                      )}
                      <span className="text-xs font-semibold text-ink/50">
                        {c.lengthDays} days
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm text-ink/75">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wide text-ink/60">
                        Going in
                      </span>
                      <p>{c.beforeNote}</p>
                    </div>
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wide text-ink/60">
                        Coming back
                      </span>
                      <p>{c.afterNote}</p>
                    </div>
                  </div>
                  {c.recoveringDays > 0 && (
                    <div className="mt-3 text-xs font-semibold text-rose">
                      {c.recoveringDays} of {c.lengthDays} days are recovery, not real time off.
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
