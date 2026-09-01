"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { pickLogoMessage } from "@/lib/logoMessages";

export default function LogoEasterEgg() {
  const [message, setMessage] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    };
  }, []);

  function handleTap() {
    const next = pickLogoMessage(message);
    setMessage(next);
    setVisible(true);
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    timeoutRef.current = window.setTimeout(() => setVisible(false), 3500);
  }

  return (
    <div className="relative shrink-0">
      <button
        onClick={handleTap}
        className="block rounded-full transition-transform active:scale-95"
        aria-label="The Recovery Position logo"
      >
        <Image
          src="/icon.svg"
          alt=""
          width={72}
          height={72}
          className="w-[72px] h-[72px] sm:w-24 sm:h-24"
        />
      </button>

      {message && (
        <div
          className={`absolute left-0 top-full mt-2 z-20 w-56 max-w-[80vw] transition-all duration-300 ${
            visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-1 pointer-events-none"
          }`}
        >
          <div className="bg-navy border border-line rounded-2xl px-4 py-3 card-shadow">
            <p
              style={{ fontFamily: "var(--font-display-italic)" }}
              className="text-ink text-sm text-left leading-snug"
            >
              {message}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
