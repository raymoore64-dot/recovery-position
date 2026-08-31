"use client";

import { useEffect, useState } from "react";
import { LibraryEntry } from "@/lib/libraryContent";
import LibraryTimer from "@/components/LibraryTimer";

const TRIED_STORAGE_KEY = "recovery-position-library-tried";

function loadTried(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(TRIED_STORAGE_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

function saveTried(set: Set<string>) {
  localStorage.setItem(TRIED_STORAGE_KEY, JSON.stringify([...set]));
}

export default function LibraryEntryCard({ entry, featured = false }: { entry: LibraryEntry; featured?: boolean }) {
  const [open, setOpen] = useState(featured);
  const [tried, setTried] = useState(false);

  useEffect(() => {
    setTried(loadTried().has(entry.title));
  }, [entry.title]);

  function toggleTried(e: React.MouseEvent) {
    e.stopPropagation();
    const set = loadTried();
    if (set.has(entry.title)) {
      set.delete(entry.title);
    } else {
      set.add(entry.title);
    }
    saveTried(set);
    setTried(set.has(entry.title));
    window.dispatchEvent(new Event("library-tried-changed"));
  }

  return (
    <div className={`rounded-xl p-4 card-shadow ${featured ? "bg-navy" : "bg-cream"}`}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full text-left flex items-start justify-between gap-3"
      >
        <div className="flex items-start gap-2 flex-1 min-w-0">
          <span
            onClick={toggleTried}
            role="checkbox"
            aria-checked={tried}
            title={tried ? "Tried it — click to un-mark" : "Mark as tried"}
            className="shrink-0 flex items-center justify-center cursor-pointer"
            style={{ width: 44, height: 44, marginLeft: -12, marginTop: -12, marginBottom: -12 }}
          >
            <span
              className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
                tried ? "bg-sage border-sage" : "border-ink/30 hover:border-ink/60"
              }`}
            >
              {tried && (
                <svg width="9" height="9" viewBox="0 0 24 24" fill="none">
                  <path d="M4 12l6 6L20 6" stroke="#0d0808" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </span>
          </span>
          <div className="min-w-0">
            <div className={`font-semibold text-sm ${tried ? "text-ink/60 line-through decoration-ink/30" : "text-ink"}`}>
              {entry.title}
            </div>
            <div className={`text-xs mt-0.5 ${featured ? "text-ink/70" : "text-ink/60"}`}>{entry.hook}</div>
          </div>
        </div>
        <span className={`text-xs shrink-0 mt-0.5 ${featured ? "text-amber" : "text-amber-deep"}`}>
          {open ? "Hide" : "More"}
        </span>
      </button>

      {open && (
        <div className="mt-3 pt-3 border-t border-line space-y-3">
          <div>
            <div className="text-xs font-bold uppercase tracking-wide text-amber-deep mb-1">How</div>
            <ul className="text-sm text-ink/80 space-y-1 list-disc list-inside">
              {entry.how.map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ul>
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-wide text-amber-deep mb-1">Why it works</div>
            <p className="text-sm text-ink/80">{entry.why}</p>
          </div>
          <div className="text-xs font-semibold text-ink/50">Best for: {entry.bestFor}</div>
          {entry.tool && entry.tool.type === "timer" && (
            <LibraryTimer minutes={entry.tool.minutes} label={entry.tool.label} />
          )}
        </div>
      )}
    </div>
  );
}
