"use client";

import { useState } from "react";
import { FeaturedEntry } from "@/lib/libraryContent";
import LibraryEntryCard from "@/components/LibraryEntryCard";

interface ShuffleRevealProps {
  allEntries: FeaturedEntry[];
}

export default function ShuffleReveal({ allEntries }: ShuffleRevealProps) {
  const [revealed, setRevealed] = useState<FeaturedEntry | null>(null);
  const [spinning, setSpinning] = useState(false);

  function shuffle() {
    setSpinning(true);
    window.setTimeout(() => {
      const pick = allEntries[Math.floor(Math.random() * allEntries.length)];
      setRevealed(pick);
      setSpinning(false);
    }, 350);
  }

  return (
    <div>
      <button
        onClick={shuffle}
        disabled={spinning}
        className="btn-primary bg-amber text-navy-deep font-bold text-sm px-5 py-2.5 min-h-[44px] rounded-full hover:bg-amber-deep hover:text-ink transition-colors disabled:opacity-60"
      >
        {spinning ? "Shuffling…" : revealed ? "Shuffle again" : "🎲 Surprise me"}
      </button>

      {revealed && (
        <div className={`mt-4 transition-opacity duration-200 ${spinning ? "opacity-0" : "opacity-100"}`}>
          <p className="text-xs text-ink/50 mb-2">From {revealed.categoryLabel}</p>
          <LibraryEntryCard entry={revealed.entry} featured />
        </div>
      )}
    </div>
  );
}
