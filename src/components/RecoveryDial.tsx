"use client";

import { useEffect, useRef, useState } from "react";

interface RecoveryDialProps {
  score: number; // 0-100
  label: string;
  size?: number;
}

export default function RecoveryDial({ score, label, size = 92 }: RecoveryDialProps) {
  const target = Math.max(0, Math.min(100, score));
  const [displayScore, setDisplayScore] = useState(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const duration = 900; // ms
    const start = performance.now();

    function tick(now: number) {
      const elapsed = now - start;
      const progress = Math.min(1, elapsed / duration);
      // ease-out cubic — starts fast, settles gently, feels natural
      // for a dial "arriving" at its value rather than just appearing.
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayScore(Math.round(eased * target));
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      }
    }
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [target]);

  const stroke = 8;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (displayScore / 100) * circumference;
  const gradientId = "recovery-dial-gradient";

  return (
    <div className="flex flex-col items-center" style={{ width: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FB923C" />
            <stop offset="100%" stopColor="#F43F5E" />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
        <text
          x="50%"
          y="50%"
          textAnchor="middle"
          dominantBaseline="central"
          fill="#F5E9E2"
          fontSize={size * 0.26}
          fontWeight={700}
          fontFamily="Work Sans, sans-serif"
        >
          {displayScore}
        </text>
      </svg>
      <div className="text-xs text-ink/70 text-center mt-1 max-w-[110px] leading-snug">
        {label}
      </div>
    </div>
  );
}
