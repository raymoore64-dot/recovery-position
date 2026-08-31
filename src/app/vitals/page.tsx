"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Vitals {
  id: number;
  date: string;
  systolic: number | null;
  diastolic: number | null;
  heart_rate: number | null;
  weight: number | null;
  notes: string | null;
}

interface Shift {
  date: string;
  shift_type: "day" | "night" | "long_day" | "off";
}

const SHIFT_LABEL: Record<string, string> = {
  day: "Day shift",
  night: "Night shift",
  long_day: "Long day",
  off: "Off",
};

function todayLocalISO(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default function VitalsPage() {
  const [entries, setEntries] = useState<Vitals[]>([]);
  const [shiftsByDate, setShiftsByDate] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  const [date, setDate] = useState(todayLocalISO());
  const [systolic, setSystolic] = useState("");
  const [diastolic, setDiastolic] = useState("");
  const [heartRate, setHeartRate] = useState("");
  const [weight, setWeight] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    const [vitalsRes, shiftsRes] = await Promise.all([
      fetch("/api/vitals"),
      fetch("/api/shifts"),
    ]);
    const vitalsData: Vitals[] = await vitalsRes.json();
    const shiftsData: Shift[] = await shiftsRes.json();

    setEntries(vitalsData);
    const map: Record<string, string> = {};
    for (const s of shiftsData) map[s.date] = s.shift_type;
    setShiftsByDate(map);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await fetch("/api/vitals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        date,
        systolic: systolic ? Number(systolic) : null,
        diastolic: diastolic ? Number(diastolic) : null,
        heart_rate: heartRate ? Number(heartRate) : null,
        weight: weight ? Number(weight) : null,
        notes: notes || null,
      }),
    });
    setSystolic("");
    setDiastolic("");
    setHeartRate("");
    setWeight("");
    setNotes("");
    setSaving(false);
    await load();
  }

  async function handleDelete(id: number) {
    await fetch(`/api/vitals?id=${id}`, { method: "DELETE" });
    await load();
  }

  return (
    <div className="space-y-8">
      <div>
        <Link href="/trends" className="text-xs font-semibold text-amber-deep hover:underline">
          ← Back to Trends
        </Link>
        <p className="text-xs font-bold tracking-widest uppercase text-amber-deep mb-2 mt-3">
          Vitals Diary
        </p>
        <h1 style={{ fontFamily: "var(--font-display)" }} className="text-3xl text-ink mb-2 tracking-tight">
          Your own record, with context.
        </h1>
        <p className="text-sm text-ink/70 max-w-lg">
          Just your own numbers, logged alongside the shift you were working that day. No target
          ranges, no interpretation — this app isn&apos;t qualified to tell you what your numbers
          mean, only to help you notice patterns worth mentioning to whoever is.
        </p>
      </div>

      <div className="bg-cream rounded-2xl p-5 sm:p-7 space-y-4 card-shadow">
        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            <span className="text-xs font-semibold text-ink uppercase tracking-wide">Date</span>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="mt-1 w-full sm:w-auto rounded-md border border-line bg-paper text-ink px-3 py-2 text-sm"
              required
            />
          </label>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <label className="block">
              <span className="text-xs font-semibold text-ink uppercase tracking-wide">Systolic</span>
              <input
                type="number"
                value={systolic}
                onChange={(e) => setSystolic(e.target.value)}
                placeholder="—"
                className="mt-1 w-full rounded-md border border-line bg-paper text-ink px-3 py-2 text-sm"
              />
            </label>
            <label className="block">
              <span className="text-xs font-semibold text-ink uppercase tracking-wide">Diastolic</span>
              <input
                type="number"
                value={diastolic}
                onChange={(e) => setDiastolic(e.target.value)}
                placeholder="—"
                className="mt-1 w-full rounded-md border border-line bg-paper text-ink px-3 py-2 text-sm"
              />
            </label>
            <label className="block">
              <span className="text-xs font-semibold text-ink uppercase tracking-wide">Heart rate</span>
              <input
                type="number"
                value={heartRate}
                onChange={(e) => setHeartRate(e.target.value)}
                placeholder="—"
                className="mt-1 w-full rounded-md border border-line bg-paper text-ink px-3 py-2 text-sm"
              />
            </label>
            <label className="block">
              <span className="text-xs font-semibold text-ink uppercase tracking-wide">Weight</span>
              <input
                type="number"
                step="0.1"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="—"
                className="mt-1 w-full rounded-md border border-line bg-paper text-ink px-3 py-2 text-sm"
              />
            </label>
          </div>

          <label className="block">
            <span className="text-xs font-semibold text-ink uppercase tracking-wide">
              Notes (optional)
            </span>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Anything worth remembering about today"
              className="mt-1 w-full rounded-md border border-line bg-paper text-ink px-3 py-2 text-sm"
            />
          </label>

          <button
            type="submit"
            disabled={saving}
            className="btn-primary bg-amber text-navy-deep font-bold text-sm px-5 py-2.5 min-h-[44px] rounded-full hover:bg-amber-deep hover:text-ink transition-colors disabled:opacity-50"
          >
            {saving ? "Saving…" : "Add entry"}
          </button>
        </form>
      </div>

      {loading ? (
        <p className="text-sm text-ink/60">Loading…</p>
      ) : entries.length === 0 ? (
        <p className="text-sm text-ink/60">No entries yet — add your first one above.</p>
      ) : (
        <div className="space-y-3">
          {entries.map((v) => {
            const shiftType = shiftsByDate[v.date];
            const d = new Date(v.date + "T00:00:00");
            const dateLabel = d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
            return (
              <div key={v.id} className="bg-cream rounded-xl p-4 card-shadow">
                <div className="flex items-center justify-between gap-4 flex-wrap mb-2">
                  <div className="font-semibold text-ink text-sm">{dateLabel}</div>
                  <div className="flex items-center gap-2">
                    {shiftType && (
                      <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-navy-mid text-ink/80">
                        {SHIFT_LABEL[shiftType] || shiftType}
                      </span>
                    )}
                    <button
                      onClick={() => handleDelete(v.id)}
                      className="text-xs font-semibold text-rose hover:underline tap-link"
                    >
                      Remove
                    </button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-ink/80">
                  {(v.systolic || v.diastolic) && (
                    <span>BP: {v.systolic ?? "—"}/{v.diastolic ?? "—"}</span>
                  )}
                  {v.heart_rate && <span>HR: {v.heart_rate}</span>}
                  {v.weight && <span>Weight: {v.weight}</span>}
                </div>
                {v.notes && <div className="text-xs text-ink/50 mt-1">{v.notes}</div>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
