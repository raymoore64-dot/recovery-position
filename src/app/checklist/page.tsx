"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface ChecklistItem {
  id: number;
  label: string;
}

export default function ChecklistManagePage() {
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [label, setLabel] = useState("");
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/checklist-items");
    setItems(await res.json());
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!label.trim()) return;
    setSaving(true);
    await fetch("/api/checklist-items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ label }),
    });
    setLabel("");
    setSaving(false);
    await load();
  }

  async function handleDelete(id: number) {
    await fetch(`/api/checklist-items?id=${id}`, { method: "DELETE" });
    await load();
  }

  return (
    <div className="space-y-8">
      <div>
        <Link href="/more" className="text-xs font-semibold text-amber-deep hover:underline">
          ← Back to More
        </Link>
        <p className="text-xs font-bold tracking-widest uppercase text-amber-deep mb-2 mt-3">
          Pre-Shift Checklist
        </p>
        <h1 style={{ fontFamily: "var(--font-display)" }} className="text-3xl text-ink mb-2 tracking-tight">
          Never leave without it.
        </h1>
        <p className="text-sm text-ink/70 max-w-lg">
          Badge, keys, ID, whatever you always nearly forget on autopilot. Set the list once —
          it shows up on Today whenever you&apos;re working, and resets fresh each day.
        </p>
      </div>

      <div className="bg-cream rounded-2xl p-5 sm:p-7 space-y-4 card-shadow">
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="e.g. Badge"
            className="flex-1 rounded-md border border-line bg-paper text-ink px-3 py-2 text-sm"
          />
          <button
            type="submit"
            disabled={saving || !label.trim()}
            className="btn-primary bg-amber text-navy-deep font-bold text-sm px-5 py-2.5 min-h-[44px] rounded-full hover:bg-amber-deep hover:text-ink transition-colors disabled:opacity-50 shrink-0"
          >
            {saving ? "Adding…" : "Add item"}
          </button>
        </form>
      </div>

      {loading ? (
        <p className="text-sm text-ink/60">Loading…</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-ink/60">Nothing added yet — add your first item above.</p>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="bg-cream rounded-xl p-4 card-shadow flex items-center justify-between gap-4">
              <span className="font-semibold text-ink text-sm">{item.label}</span>
              <button
                onClick={() => handleDelete(item.id)}
                className="text-xs font-semibold text-rose hover:underline tap-link"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
