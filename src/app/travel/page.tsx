"use client";

import { useState } from "react";
import { Shift } from "@/lib/db";
import { calculateTravelSleep, TravelSleepResult } from "@/lib/travelSleep";

function todayLocalISO(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function addLocalDays(iso: string, n: number): string {
  const d = new Date(iso + "T00:00:00");
  d.setDate(d.getDate() + n);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function formatDateLabel(iso: string): string {
  return new Date(iso + "T00:00:00").toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

export default function TravelPage() {
  const [eventLabel, setEventLabel] = useState("");
  const [eventDate, setEventDate] = useState(todayLocalISO());
  const [eventTime, setEventTime] = useState("15:00");
  const [bufferMinutes, setBufferMinutes] = useState(90);
  const [result, setResult] = useState<TravelSleepResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  async function handleCalculate() {
    setLoading(true);
    setSearched(true);

    // Fetch the day before the event plus the event's own date — that's
    // enough range to find whichever shift is actually closest before it,
    // whether it's a night shift ending that morning or a day shift
    // ending the evening before.
    const from = addLocalDays(eventDate, -2);
    const to = eventDate;
    const res = await fetch(`/api/shifts?from=${from}&to=${to}`);
    const shifts: Shift[] = await res.json();

    const calc = calculateTravelSleep(eventDate, eventTime, shifts, bufferMinutes);
    setResult(calc);
    setLoading(false);
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-bold tracking-widest uppercase text-amber-deep mb-2">
          Travel &amp; Events
        </p>
        <h1 style={{ fontFamily: "var(--font-display)" }} className="text-3xl text-ink mb-2 tracking-tight">
          When should I sleep before this?
        </h1>
        <p className="text-sm text-ink/70 max-w-lg">
          The original question this whole app started with: finish a night shift at 7am, flight's
          at 3pm — when do you actually sleep? Tell it what's coming up and it works backward from
          your last shift.
        </p>
      </div>

      <div className="bg-cream rounded-2xl p-5 sm:p-7 space-y-4 card-shadow">
        <label className="block">
          <span className="text-xs font-semibold text-ink uppercase tracking-wide">
            What&apos;s the event? (optional)
          </span>
          <input
            type="text"
            value={eventLabel}
            onChange={(e) => setEventLabel(e.target.value)}
            placeholder="e.g. Flight to Bangkok"
            className="mt-1 w-full rounded-md border border-line bg-paper text-ink px-3 py-2 text-sm"
          />
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <label className="block">
            <span className="text-xs font-semibold text-ink uppercase tracking-wide">Date</span>
            <input
              type="date"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              className="mt-1 w-full rounded-md border border-line bg-paper text-ink px-3 py-2 text-sm"
            />
          </label>
          <label className="block">
            <span className="text-xs font-semibold text-ink uppercase tracking-wide">Time</span>
            <input
              type="time"
              value={eventTime}
              onChange={(e) => setEventTime(e.target.value)}
              className="mt-1 w-full rounded-md border border-line bg-paper text-ink px-3 py-2 text-sm"
            />
          </label>
          <label className="block">
            <span className="text-xs font-semibold text-ink uppercase tracking-wide">
              Ready this long before
            </span>
            <select
              value={bufferMinutes}
              onChange={(e) => setBufferMinutes(Number(e.target.value))}
              className="mt-1 w-full rounded-md border border-line bg-paper text-ink px-3 py-2 text-sm"
            >
              <option value={30}>30 minutes</option>
              <option value={60}>1 hour</option>
              <option value={90}>1.5 hours</option>
              <option value={120}>2 hours</option>
              <option value={180}>3 hours</option>
            </select>
          </label>
        </div>

        <button
          onClick={handleCalculate}
          disabled={loading}
          className="btn-primary bg-amber text-navy-deep font-bold text-sm px-5 py-2.5 min-h-[44px] rounded-full hover:bg-amber-deep hover:text-ink transition-colors disabled:opacity-50"
        >
          {loading ? "Working it out…" : "Calculate"}
        </button>
      </div>

      {searched && !loading && result && (
        <div className="bg-navy rounded-2xl p-6 card-shadow relative overflow-hidden">
          <div className="moonbleed" />
          <div className="relative z-10">
            <div className="text-xs font-bold uppercase tracking-wide text-amber mb-1">
              {eventLabel || "Your event"} — {formatDateLabel(eventDate)} at {eventTime}
            </div>

            {result.sleepWindow ? (
              <>
                <div style={{ fontFamily: "var(--font-display)" }} className="text-3xl text-ink mt-3 tracking-tight">
                  {result.sleepWindow.start} – {result.sleepWindow.end}
                </div>
                <p className="text-sm text-ink/60 mt-1">
                  Starting {formatDateLabel(result.sleepWindow.date)}
                </p>
              </>
            ) : (
              <div style={{ fontFamily: "var(--font-display-semibold)" }} className="text-xl text-ink mt-3">
                No real sleep window available
              </div>
            )}

            {result.precedingShiftNote && (
              <p className="text-xs text-ink/50 mt-4">{result.precedingShiftNote}</p>
            )}

            {result.warning && (
              <div className="mt-4 bg-rose/20 border border-rose/40 rounded-lg p-3 text-sm text-ink">
                {result.warning}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
