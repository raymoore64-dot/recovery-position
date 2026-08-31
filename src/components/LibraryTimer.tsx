"use client";

import { useEffect, useRef, useState } from "react";

interface LibraryTimerProps {
  minutes: number;
  label: string;
}

export default function LibraryTimer({ minutes, label }: LibraryTimerProps) {
  const totalSeconds = minutes * 60;
  const [remaining, setRemaining] = useState(totalSeconds);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (running && remaining > 0) {
      intervalRef.current = window.setInterval(() => {
        setRemaining((r) => {
          if (r <= 1) {
            setRunning(false);
            return 0;
          }
          return r - 1;
        });
      }, 1000);
    }
    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
    };
  }, [running, remaining]);

  function toggle() {
    if (remaining === 0) {
      setRemaining(totalSeconds);
      setRunning(true);
    } else {
      setRunning((r) => !r);
    }
  }

  function reset() {
    setRunning(false);
    setRemaining(totalSeconds);
  }

  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;
  const timeLabel = `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  const progress = 1 - remaining / totalSeconds;
  const size = 56;
  const stroke = 5;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - progress);
  const done = remaining === 0;

  return (
    <div className="flex items-center gap-3 bg-paper rounded-lg p-3 mt-2">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="shrink-0">
        <defs>
          <linearGradient id={`timer-grad-${label.replace(/\s+/g, "")}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FB923C" />
            <stop offset="100%" stopColor="#F43F5E" />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={`url(#timer-grad-${label.replace(/\s+/g, "")})`}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
        <text x="50%" y="50%" textAnchor="middle" dominantBaseline="central" fill="#F5E9E2" fontSize="11" fontFamily="Work Sans, sans-serif" fontWeight={600}>
          {timeLabel}
        </text>
      </svg>
      <div className="flex-1">
        <div className="text-xs font-bold text-ink">{label}</div>
        <div className="flex gap-2 mt-1">
          <button
            onClick={toggle}
            className="text-xs font-bold px-4 rounded-full bg-amber text-navy-deep hover:bg-amber-deep hover:text-ink transition-colors inline-flex items-center justify-center"
            style={{ minHeight: 44 }}
          >
            {done ? "Start again" : running ? "Pause" : remaining === totalSeconds ? "Start" : "Resume"}
          </button>
          {remaining !== totalSeconds && (
            <button onClick={reset} className="text-xs font-semibold text-ink/50 hover:text-ink tap-link">
              Reset
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
