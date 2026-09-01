"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface ChecklistItem {
  id: number;
  label: string;
}

function storageKey(date: string): string {
  return `recovery-position-checklist-${date}`;
}

function loadChecked(date: string): Set<number> {
  try {
    const raw = localStorage.getItem(storageKey(date));
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

function saveChecked(date: string, set: Set<number>) {
  localStorage.setItem(storageKey(date), JSON.stringify([...set]));
}

export default function PreShiftChecklist({ date }: { date: string }) {
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [checked, setChecked] = useState<Set<number>>(new Set());
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch("/api/checklist-items")
      .then((r) => r.json())
      .then((data: ChecklistItem[]) => {
        setItems(data);
        setChecked(loadChecked(date));
        setLoaded(true);
      });
  }, [date]);

  function toggle(id: number) {
    const next = new Set(checked);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setChecked(next);
    saveChecked(date, next);
  }

  if (!loaded || items.length === 0) return null;

  const allDone = items.every((i) => checked.has(i.id));

  return (
    <div className="mt-4 bg-cream rounded-xl p-4 card-shadow">
      <div className="flex items-center justify-between mb-2">
        <div className="text-xs font-bold uppercase tracking-wide text-amber-deep">
          {allDone ? "All set" : "Before you go"}
        </div>
        <Link href="/checklist" className="text-xs font-semibold text-amber-deep hover:underline tap-link">
          Manage list
        </Link>
      </div>
      <div className="space-y-2">
        {items.map((item) => {
          const isChecked = checked.has(item.id);
          return (
            <button
              key={item.id}
              onClick={() => toggle(item.id)}
              className="w-full flex items-center gap-2 text-left min-h-[44px] py-1"
            >
              <span
                className={`shrink-0 w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                  isChecked ? "bg-sage border-sage" : "border-ink/30"
                }`}
              >
                {isChecked && (
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
                    <path d="M4 12l6 6L20 6" stroke="#0d0808" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </span>
              <span className={`text-sm ${isChecked ? "text-ink/50 line-through decoration-ink/30" : "text-ink"}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
