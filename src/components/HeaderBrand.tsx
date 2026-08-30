"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

export default function HeaderBrand() {
  const pathname = usePathname();
  // The Today page has its own larger brand moment right at the top of
  // its content, so showing the full wordmark here too would just repeat
  // it a few pixels below. Keep the icon (still a working link home) and
  // drop the text only on that one page.
  const showWordmark = pathname !== "/";

  return (
    <Link href="/" className="flex items-center gap-2.5 sm:gap-3 min-w-0">
      <Image src="/icon.svg" alt="" width={34} height={34} className="shrink-0 sm:w-[38px] sm:h-[38px]" />
      {showWordmark && (
        <span
          style={{ fontFamily: "var(--font-display-semibold)" }}
          className="text-base sm:text-xl tracking-tight truncate"
        >
          The Recovery Position
        </span>
      )}
    </Link>
  );
}
