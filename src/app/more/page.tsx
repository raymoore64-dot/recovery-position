import Link from "next/link";
import { ReactNode } from "react";

interface MoreLink {
  href: string;
  title: string;
  blurb: string;
  icon: string;
}

const LINKS: MoreLink[] = [
  { href: "/how-it-works", title: "How This Works", blurb: "The handful of things that genuinely aren't obvious.", icon: "help" },
  { href: "/certifications", title: "Certifications", blurb: "Track renewals, get flagged before they lapse.", icon: "shield" },
  { href: "/trends", title: "Recovery Trend", blurb: "Your Recovery Score charted over the last 30 days.", icon: "chart" },
  { href: "/year-in-review", title: "Year in Review", blurb: "Every shift, every streak, all-time.", icon: "star" },
  { href: "/medications", title: "Medication Reminders", blurb: "Reminders at the times you set, on your schedule.", icon: "pill" },
  { href: "/vitals", title: "Vitals Diary", blurb: "Your own numbers, logged with shift context.", icon: "heart" },
  { href: "/quotes", title: "Your Quotes", blurb: "Add your own daily quotes alongside the built-in ones.", icon: "quote" },
  { href: "/travel", title: "Travel & Events", blurb: "Work out when to sleep before a flight or early start.", icon: "plane" },
  { href: "/share", title: "Shared Availability", blurb: "A link a partner can open, no login needed.", icon: "link" },
  { href: "/export", title: "Your Data", blurb: "Download everything as one plain JSON file.", icon: "download" },
];

function Icon({ name }: { name: string }): ReactNode {
  const common = { fill: "none" as const, stroke: "#F43F5E", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  const size = 22;
  switch (name) {
    case "help":
      return <svg width={size} height={size} viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" {...common} /><path d="M9.5 9a2.5 2.5 0 0 1 4.8 1c0 1.5-2.3 1.8-2.3 3.5" {...common} /><circle cx="12" cy="17" r="0.6" fill="#F43F5E" stroke="none" /></svg>;
    case "shield":
      return <svg width={size} height={size} viewBox="0 0 24 24"><path d="M12 3.5 5 6v6c0 4.5 3 7.5 7 8.5 4-1 7-4 7-8.5V6l-7-2.5Z" {...common} /><path d="M9 12l2 2 4-4.5" {...common} /></svg>;
    case "chart":
      return <svg width={size} height={size} viewBox="0 0 24 24"><path d="M4 19V9M10 19V5M16 19v-7M22 19H2" {...common} /></svg>;
    case "star":
      return <svg width={size} height={size} viewBox="0 0 24 24"><path d="M12 3l2.6 5.9 6.4.6-4.8 4.3 1.4 6.3L12 16.9 6.4 20.1l1.4-6.3-4.8-4.3 6.4-.6L12 3Z" {...common} /></svg>;
    case "pill":
      return <svg width={size} height={size} viewBox="0 0 24 24"><rect x="4" y="9" width="16" height="7" rx="3.5" transform="rotate(-30 12 12)" {...common} /><path d="M12 8l-2.5 8" {...common} /></svg>;
    case "heart":
      return <svg width={size} height={size} viewBox="0 0 24 24"><path d="M12 20s-7-4.5-9-9a5 5 0 0 1 9-3 5 5 0 0 1 9 3c-2 4.5-9 9-9 9Z" {...common} /></svg>;
    case "quote":
      return <svg width={size} height={size} viewBox="0 0 24 24"><path d="M7 8c-2 0-3 1.5-3 3.5S5 15 7 15M17 8c-2 0-3 1.5-3 3.5S15 15 17 15" {...common} /></svg>;
    case "plane":
      return <svg width={size} height={size} viewBox="0 0 24 24"><path d="M3 15l6-2 5-8 2 1-3 7 6-1 2 2-8 3-2 5-2-1 1-5-7 1z" {...common} /></svg>;
    case "link":
      return <svg width={size} height={size} viewBox="0 0 24 24"><path d="M9 15l6-6M8 12l-2 2a3.5 3.5 0 0 0 5 5l2-2M16 12l2-2a3.5 3.5 0 0 0-5-5l-2 2" {...common} /></svg>;
    case "download":
      return <svg width={size} height={size} viewBox="0 0 24 24"><path d="M12 4v11m0 0-4-4m4 4 4-4M5 19h14" {...common} /></svg>;
    default:
      return null;
  }
}

export default function MorePage() {
  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-bold tracking-widest uppercase text-amber-deep mb-2">
          More
        </p>
        <h1 style={{ fontFamily: "var(--font-display)" }} className="text-3xl text-ink mb-2 tracking-tight">
          Everything else.
        </h1>
        <p className="text-sm text-ink/70 max-w-lg">
          The stuff you set up once or check occasionally, rather than every day.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="bg-cream rounded-xl p-4 card-shadow hover:bg-navy-mid transition-colors flex items-start gap-3"
          >
            <div className="shrink-0 mt-0.5">
              <Icon name={link.icon} />
            </div>
            <div>
              <div className="font-semibold text-ink text-sm">{link.title}</div>
              <div className="text-xs text-ink/60 mt-0.5">{link.blurb}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
