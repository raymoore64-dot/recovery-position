"use client";

import { useEffect, useState } from "react";
import { nextUncelebratedMilestone, Milestone } from "@/lib/milestones";

const STORAGE_KEY = "recovery-position-celebrated-milestones";

function loadCelebrated(): Set<number> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

function saveCelebrated(set: Set<number>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...set]));
}

const CONFETTI_COLORS = ["#FB923C", "#F43F5E", "#34D399", "#F5E9E2"];

function Confetti() {
  const pieces = Array.from({ length: 28 }, (_, i) => {
    const left = Math.random() * 100;
    const delay = Math.random() * 0.4;
    const duration = 1.8 + Math.random() * 1.2;
    const color = CONFETTI_COLORS[i % CONFETTI_COLORS.length];
    const size = 6 + Math.random() * 6;
    const rotate = Math.random() * 360;
    return { left, delay, duration, color, size, rotate, key: i };
  });

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {pieces.map((p) => (
        <div
          key={p.key}
          style={{
            position: "absolute",
            left: `${p.left}%`,
            top: "-5%",
            width: p.size,
            height: p.size * 0.4,
            backgroundColor: p.color,
            transform: `rotate(${p.rotate}deg)`,
            animation: `confetti-fall ${p.duration}s ease-in ${p.delay}s forwards`,
            borderRadius: 1,
          }}
        />
      ))}
      <style>{`
        @keyframes confetti-fall {
          to {
            top: 105%;
            transform: rotate(${Math.random() * 720 - 360}deg);
          }
        }
      `}</style>
    </div>
  );
}

export default function MilestoneCelebration({ nightsSurvived }: { nightsSurvived: number }) {
  const [milestone, setMilestone] = useState<Milestone | null>(null);

  useEffect(() => {
    const celebrated = loadCelebrated();
    const found = nextUncelebratedMilestone(nightsSurvived, celebrated);
    if (found) {
      setMilestone(found);
      celebrated.add(found.threshold);
      saveCelebrated(celebrated);
    }
    // Only ever check once on mount — this isn't meant to re-fire if
    // nightsSurvived changes within the same session.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!milestone) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6"
      onClick={() => setMilestone(null)}
    >
      <div
        className="relative bg-navy rounded-3xl p-8 sm:p-10 max-w-sm w-full text-center card-shadow overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <Confetti />
        <div className="relative z-10">
          <div className="text-5xl mb-3">🌙</div>
          <div
            style={{ fontFamily: "var(--font-display)" }}
            className="text-5xl text-ink mb-3 tracking-tight"
          >
            {milestone.threshold.toLocaleString()}
          </div>
          <p className="text-sm text-ink/80 mb-6">{milestone.message}</p>
          <button
            onClick={() => setMilestone(null)}
            className="btn-primary bg-amber text-navy-deep font-bold text-sm px-6 py-2.5 min-h-[44px] rounded-full hover:bg-amber-deep hover:text-ink transition-colors"
          >
            Back to it
          </button>
        </div>
      </div>
    </div>
  );
}
