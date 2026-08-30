"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

export default function HeaderBrand() {
  const pathname = usePathname();
  // The Today page has its own larger brand moment right at the top of
  // its content — icon, wordmark, and tagline all together. Showing the
  // header's icon there too, with nothing next to it, just looked like a
  // stray logo. Simplest fix: on that one page, the header shows nothing
  // on the left at all, letting the nav sit on its own.
  const isHome = pathname === "/";

  if (isHome) {
    return <div />;
  }

  return (
    <Link href="/" className="flex items-center gap-2.5 sm:gap-3 min-w-0">
      <Image src="/icon.svg" alt="" width={34} height={34} className="shrink-0 sm:w-[38px] sm:h-[38px]" />
      <span
        style={{ fontFamily: "var(--font-display-semibold)" }}
        className="text-base sm:text-xl tracking-tight truncate"
      >
        The Recovery Position
      </span>
    </Link>
  );
}
