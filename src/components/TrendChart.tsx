import { TrendPoint } from "@/lib/trends";

interface TrendChartProps {
  points: TrendPoint[];
  width?: number;
  height?: number;
}

export default function TrendChart({ points, width = 760, height = 220 }: TrendChartProps) {
  const padding = { top: 16, right: 12, bottom: 28, left: 12 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  if (points.length < 2) {
    return (
      <div className="flex items-center justify-center text-sm text-ink/50" style={{ height }}>
        Not enough logged days yet to draw a trend — a couple of weeks of real shifts will make
        this genuinely useful.
      </div>
    );
  }

  const xFor = (i: number) => padding.left + (i / (points.length - 1)) * chartWidth;
  const yFor = (score: number) => padding.top + (1 - score / 100) * chartHeight;

  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${xFor(i)} ${yFor(p.score)}`).join(" ");
  const areaPath = `${linePath} L ${xFor(points.length - 1)} ${padding.top + chartHeight} L ${xFor(0)} ${padding.top + chartHeight} Z`;

  // Show date labels sparsely — first, last, and a few in between —
  // rather than one per point, which would overlap on anything but a
  // very short range.
  const labelStep = Math.max(1, Math.ceil(points.length / 6));
  const labelIndices = new Set<number>([0, points.length - 1]);
  for (let i = 0; i < points.length; i += labelStep) labelIndices.add(i);

  return (
    <svg width="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id="trend-line-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#FB923C" />
          <stop offset="100%" stopColor="#F43F5E" />
        </linearGradient>
        <linearGradient id="trend-area-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FB923C" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#FB923C" stopOpacity="0" />
        </linearGradient>
      </defs>

      {[25, 50, 75].map((v) => (
        <line
          key={v}
          x1={padding.left}
          x2={width - padding.right}
          y1={yFor(v)}
          y2={yFor(v)}
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={1}
        />
      ))}

      <path d={areaPath} fill="url(#trend-area-gradient)" />
      <path d={linePath} fill="none" stroke="url(#trend-line-gradient)" strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />

      {points.map((p, i) => (
        <circle key={p.date} cx={xFor(i)} cy={yFor(p.score)} r={3} fill="#F5E9E2" />
      ))}

      {points.map((p, i) => {
        if (!labelIndices.has(i)) return null;
        const d = new Date(p.date + "T00:00:00");
        const label = d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
        return (
          <text
            key={p.date}
            x={xFor(i)}
            y={height - 8}
            textAnchor="middle"
            fontSize="10"
            fill="rgba(245,233,226,0.5)"
            fontFamily="Work Sans, sans-serif"
          >
            {label}
          </text>
        );
      })}
    </svg>
  );
}
