"use client";

import { useState } from "react";
import Link from "next/link";

interface CheckResult {
  conflict: { shift_type: string } | null;
  restGapHours: number | null;
  resultingConsecutiveNights: number | null;
  recentAverageScore: number | null;
}

function todayLocalISO(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default function OvertimeCheckPage() {
  const [date, setDate] = useState(todayLocalISO());
  const [shiftType, setShiftType] = useState<"day" | "night" | "long_day">("night");
  const [startTime, setStartTime] = useState("19:00");
  const [result, setResult] = useState<CheckResult | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleCheck() {
    setLoading(true);
    const res = await fetch(
      `/api/overtime-check?date=${date}&shift_type=${shiftType}&start_time=${startTime}`
    );
    setResult(await res.json());
    setLoading(false);
  }

  return (
    <div className="space-y-8">
      <div>
        <Link href="/more" className="text-xs font-semibold text-amber-deep hover:underline">
          ← Back to More
        </Link>
        <p className="text-xs font-bold tracking-widest uppercase text-amber-deep mb-2 mt-3">
          Overtime Check
        </p>
        <h1 style={{ fontFamily: "var(--font-display)" }} className="text-3xl text-ink mb-2 tracking-tight">
          Before you say yes.
        </h1>
        <p className="text-sm text-ink/70 max-w-lg">
          This won&apos;t tell you whether to take it — that&apos;s your call. It&apos;ll just
          show you the actual facts about what it would mean, so you&apos;re deciding with real
          information instead of gut feel alone.
        </p>
      </div>

      <div className="bg-cream rounded-2xl p-5 sm:p-7 space-y-4 card-shadow">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <label className="block">
            <span className="text-xs font-semibold text-ink uppercase tracking-wide">Date</span>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="mt-1 w-full rounded-md border border-line bg-paper text-ink px-3 py-2 text-sm"
            />
          </label>
          <label className="block">
            <span className="text-xs font-semibold text-ink uppercase tracking-wide">Shift type</span>
            <select
              value={shiftType}
              onChange={(e) => setShiftType(e.target.value as "day" | "night" | "long_day")}
              className="mt-1 w-full rounded-md border border-line bg-paper text-ink px-3 py-2 text-sm"
            >
              <option value="day">Day</option>
              <option value="night">Night</option>
              <option value="long_day">Long Day</option>
            </select>
          </label>
          <label className="block">
            <span className="text-xs font-semibold text-ink uppercase tracking-wide">Start time</span>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="mt-1 w-full rounded-md border border-line bg-paper text-ink px-3 py-2 text-sm"
            />
          </label>
        </div>

        <button
          onClick={handleCheck}
          disabled={loading}
          className="btn-primary bg-amber text-navy-deep font-bold text-sm px-5 py-2.5 min-h-[44px] rounded-full hover:bg-amber-deep hover:text-ink transition-colors disabled:opacity-50"
        >
          {loading ? "Checking…" : "Check the facts"}
        </button>
      </div>

      {result && (
        <div className="space-y-3">
          {result.conflict && (
            <div className="bg-rose/20 border border-rose/40 rounded-xl p-4">
              <p className="text-sm text-ink">
                You already have a <strong>{result.conflict.shift_type.replace("_", " ")}</strong>{" "}
                logged that day.
              </p>
            </div>
          )}

          {result.restGapHours !== null && (
            <div className="bg-cream rounded-xl p-4 card-shadow">
              <div className="text-xs font-bold uppercase tracking-wide text-amber-deep mb-1">
                Rest before this shift
              </div>
              <div style={{ fontFamily: "var(--font-display)" }} className="text-3xl text-ink">
                {result.restGapHours}h
              </div>
              <p className="text-sm text-ink/60 mt-1">
                since your last logged shift ends
              </p>
            </div>
          )}

          {result.resultingConsecutiveNights !== null && (
            <div className="bg-cream rounded-xl p-4 card-shadow">
              <div className="text-xs font-bold uppercase tracking-wide text-amber-deep mb-1">
                This would make
              </div>
              <div style={{ fontFamily: "var(--font-display)" }} className="text-3xl text-ink">
                {result.resultingConsecutiveNights}
              </div>
              <p className="text-sm text-ink/60 mt-1">
                consecutive night{result.resultingConsecutiveNights === 1 ? "" : "s"} in a row
              </p>
            </div>
          )}

          {result.recentAverageScore !== null && (
            <div className="bg-cream rounded-xl p-4 card-shadow">
              <div className="text-xs font-bold uppercase tracking-wide text-sage mb-1">
                Your last 7 days
              </div>
              <div style={{ fontFamily: "var(--font-display)" }} className="text-3xl text-ink">
                {result.recentAverageScore}
              </div>
              <p className="text-sm text-ink/60 mt-1">average Recovery Score</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
