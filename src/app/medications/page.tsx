"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Medication {
  id: number;
  name: string;
  times: string;
  notes: string | null;
}

export default function MedicationsPage() {
  const [meds, setMeds] = useState<Medication[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [times, setTimes] = useState<string[]>([""]);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/medications");
    setMeds(await res.json());
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  function updateTime(i: number, value: string) {
    setTimes((prev) => prev.map((t, idx) => (idx === i ? value : t)));
  }

  function addTimeField() {
    setTimes((prev) => [...prev, ""]);
  }

  function removeTimeField(i: number) {
    setTimes((prev) => prev.filter((_, idx) => idx !== i));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const validTimes = times.filter((t) => t.trim() !== "");
    if (!name.trim() || validTimes.length === 0) return;
    setSaving(true);
    await fetch("/api/medications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, times: validTimes, notes: notes || null }),
    });
    setName("");
    setTimes([""]);
    setNotes("");
    setSaving(false);
    await load();
  }

  async function handleDelete(id: number) {
    await fetch(`/api/medications?id=${id}`, { method: "DELETE" });
    await load();
  }

  return (
    <div className="space-y-8">
      <div>
        <Link href="/" className="text-xs font-semibold text-amber-deep hover:underline">
          ← Back to Today
        </Link>
        <p className="text-xs font-bold tracking-widest uppercase text-amber-deep mb-2 mt-3">
          Medication Reminders
        </p>
        <h1 style={{ fontFamily: "var(--font-display)" }} className="text-3xl text-ink mb-2 tracking-tight">
          Just a reminder, on your schedule.
        </h1>
        <p className="text-sm text-ink/70 max-w-lg">
          Enter the times your prescription actually calls for — this only ever reminds you at the
          times you set, exactly as your doctor or pharmacist advised. It doesn&apos;t calculate or
          suggest timing based on your shifts; that&apos;s not a call an app should make for you.
        </p>
      </div>

      <div className="bg-cream rounded-2xl p-5 sm:p-7 space-y-4 card-shadow">
        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            <span className="text-xs font-semibold text-ink uppercase tracking-wide">
              Medication name
            </span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Levothyroxine"
              className="mt-1 w-full rounded-md border border-line bg-paper text-ink px-3 py-2 text-sm"
              required
            />
          </label>

          <div>
            <span className="text-xs font-semibold text-ink uppercase tracking-wide">
              Times
            </span>
            <div className="mt-1 space-y-2">
              {times.map((t, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    type="time"
                    value={t}
                    onChange={(e) => updateTime(i, e.target.value)}
                    className="rounded-md border border-line bg-paper text-ink px-3 py-2 text-sm"
                  />
                  {times.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeTimeField(i)}
                      className="text-xs font-semibold text-rose hover:underline"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addTimeField}
                className="text-xs font-semibold text-amber-deep hover:underline"
              >
                + Add another time
              </button>
            </div>
          </div>

          <label className="block">
            <span className="text-xs font-semibold text-ink uppercase tracking-wide">
              Notes (optional)
            </span>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Take with food"
              className="mt-1 w-full rounded-md border border-line bg-paper text-ink px-3 py-2 text-sm"
            />
          </label>

          <button
            type="submit"
            disabled={saving}
            className="btn-primary bg-amber text-navy-deep font-bold text-sm px-5 py-2.5 rounded-full hover:bg-amber-deep hover:text-ink transition-colors disabled:opacity-50"
          >
            {saving ? "Adding…" : "Add medication"}
          </button>
        </form>
      </div>

      {loading ? (
        <p className="text-sm text-ink/60">Loading…</p>
      ) : meds.length === 0 ? (
        <p className="text-sm text-ink/60">Nothing added yet.</p>
      ) : (
        <div className="space-y-3">
          {meds.map((m) => {
            const parsedTimes: string[] = JSON.parse(m.times);
            return (
              <div key={m.id} className="bg-cream rounded-xl p-4 card-shadow flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <div className="font-semibold text-ink text-sm">{m.name}</div>
                  <div className="text-xs text-ink/60 mt-0.5">{parsedTimes.join(" · ")}</div>
                  {m.notes && <div className="text-xs text-ink/50 mt-0.5">{m.notes}</div>}
                </div>
                <button
                  onClick={() => handleDelete(m.id)}
                  className="text-xs font-semibold text-rose hover:underline"
                >
                  Remove
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
