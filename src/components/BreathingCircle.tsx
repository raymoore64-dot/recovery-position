"use client";

import { useEffect, useRef, useState } from "react";

const PHASE_SECONDS = 4;
const PHASES: { key: "in" | "hold" | "out"; label: string }[] = [
  { key: "in", label: "Breathe in" },
  { key: "hold", label: "Hold" },
  { key: "out", label: "Breathe out" },
];

export default function BreathingCircle() {
  const [active, setActive] = useState(false);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (!active) return;
    timeoutRef.current = window.setTimeout(() => {
      setPhaseIndex((i) => (i + 1) % PHASES.length);
    }, PHASE_SECONDS * 1000);
    return () => {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    };
  }, [active, phaseIndex]);

  function start() {
    setPhaseIndex(0);
    setActive(true);
  }

  function stop() {
    setActive(false);
    setPhaseIndex(0);
  }

  const phase = PHASES[phaseIndex];
  const scale = !active ? 1 : phase.key === "out" ? 1 : 1.5;

  return (
    <div className="bg-cream rounded-xl p-5 card-shadow flex items-center gap-5 flex-wrap">
      <div className="w-20 h-20 shrink-0 flex items-center justify-center">
        <div
          className="rounded-full"
          style={{
            width: 44,
            height: 44,
            background: "linear-gradient(135deg, #FB923C, #F43F5E)",
            transform: `scale(${scale})`,
            transition: `transform ${phase.key === "hold" ? 0 : PHASE_SECONDS}s ease-in-out`,
            opacity: active ? 0.85 : 0.5,
          }}
        />
      </div>
      <div className="flex-1 min-w-[140px]">
        <div className="text-xs font-bold uppercase tracking-wide text-amber-deep mb-0.5">
          Need thirty seconds right now?
        </div>
        <div className="text-sm text-ink">
          {active ? phase.label + "…" : "A simple paced-breathing circle. No entry required, just breathe with it."}
        </div>
      </div>
      <button
        onClick={active ? stop : start}
        className="btn-primary bg-amber text-navy-deep font-bold text-xs px-4 py-2 rounded-full hover:bg-amber-deep hover:text-ink transition-colors shrink-0"
      >
        {active ? "Stop" : "Start"}
      </button>
    </div>
  );
}
