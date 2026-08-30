"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "Today" },
  { href: "/roster", label: "Roster" },
  { href: "/leave", label: "Leave" },
  { href: "/audio", label: "Audio" },
  { href: "/library", label: "Library" },
];

export default function NavLinks() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-1 text-sm font-semibold">
      {LINKS.map((link) => {
        const active = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`px-3 py-1.5 rounded-full transition-colors ${
              active ? "bg-amber text-navy-deep" : "text-ink/80 hover:text-amber hover:bg-white/5"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
