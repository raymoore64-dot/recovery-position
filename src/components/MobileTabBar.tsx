"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/", label: "Today", icon: "sun" },
  { href: "/roster", label: "Roster", icon: "calendar" },
  { href: "/leave", label: "Leave", icon: "plane" },
  { href: "/audio", label: "Afterglow", icon: "music" },
  { href: "/library", label: "Library", icon: "book" },
] as const;

function TabIcon({ name, active }: { name: string; active: boolean }) {
  const stroke = active ? "#FB923C" : "#8A8186";
  const common = { fill: "none", stroke, strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

  switch (name) {
    case "sun":
      return (
        <svg width="20" height="20" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="4.5" {...common} />
          <path d="M12 3v2.2M12 18.8V21M4.2 12H2M22 12h-2.2M5.6 5.6l1.5 1.5M16.9 16.9l1.5 1.5M5.6 18.4l1.5-1.5M16.9 7.1l1.5-1.5" {...common} />
        </svg>
      );
    case "calendar":
      return (
        <svg width="20" height="20" viewBox="0 0 24 24">
          <rect x="4" y="5" width="16" height="15" rx="2" {...common} />
          <path d="M4 10h16M8 3v4M16 3v4" {...common} />
        </svg>
      );
    case "plane":
      return (
        <svg width="20" height="20" viewBox="0 0 24 24">
          <path d="M3 15l6-2 5-8 2 1-3 7 6-1 2 2-8 3-2 5-2-1 1-5-7 1z" {...common} />
        </svg>
      );
    case "music":
      return (
        <svg width="20" height="20" viewBox="0 0 24 24">
          <circle cx="7" cy="18" r="2.4" {...common} />
          <circle cx="17" cy="16" r="2.4" {...common} />
          <path d="M9.4 18V6.8L19.4 4.8V16" {...common} />
        </svg>
      );
    case "book":
      return (
        <svg width="20" height="20" viewBox="0 0 24 24">
          <path d="M12 6.5c-2-1.6-5-2-8-1.3v13c3 0 6 .5 8 2 2-1.5 5-2 8-2v-13c-3-.7-6-.3-8 1.3Z" {...common} />
          <path d="M12 6.5v13" {...common} />
        </svg>
      );
    default:
      return null;
  }
}

export default function MobileTabBar() {
  const pathname = usePathname();

  return (
    <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-navy border-t border-line pb-[env(safe-area-inset-bottom)]">
      <div className="flex justify-around">
        {TABS.map((tab) => {
          const active = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="flex flex-col items-center gap-1 py-2.5 px-3 flex-1"
            >
              <TabIcon name={tab.icon} active={active} />
              <span className={`text-[10px] font-semibold ${active ? "text-amber" : "text-ink/50"}`}>
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
