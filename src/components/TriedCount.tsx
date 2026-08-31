"use client";

import { useEffect, useState } from "react";

const TRIED_STORAGE_KEY = "recovery-position-library-tried";

export default function TriedCount({ total }: { total: number }) {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    function read() {
      try {
        const raw = localStorage.getItem(TRIED_STORAGE_KEY);
        const set = raw ? JSON.parse(raw) : [];
        setCount(Array.isArray(set) ? set.length : 0);
      } catch {
        setCount(0);
      }
    }
    read();
    window.addEventListener("library-tried-changed", read);
    return () => window.removeEventListener("library-tried-changed", read);
  }, []);

  if (count === null || count === 0) return null;

  return (
    <p className="text-xs text-ink/50">
      {count} of {total} tried
    </p>
  );
}
