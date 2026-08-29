interface RecoveryDialProps {
  score: number; // 0-100
  label: string;
  size?: number;
}

export default function RecoveryDial({ score, label, size = 92 }: RecoveryDialProps) {
  const stroke = 8;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, score));
  const offset = circumference - (clamped / 100) * circumference;

  return (
    <div className="flex flex-col items-center" style={{ width: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(251,248,242,0.15)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#F3A468"
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
          fill="#FBF8F2"
          fontSize={size * 0.26}
          fontWeight={700}
          fontFamily="Work Sans, sans-serif"
        >
          {clamped}
        </text>
      </svg>
      <div className="text-xs text-paper/70 text-center mt-1 max-w-[110px] leading-snug">
        {label}
      </div>
    </div>
  );
}
