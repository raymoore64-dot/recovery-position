"use client";

import { useEffect, useState } from "react";
import { isWithinDriveSafetyWindow } from "@/lib/driveSafety";
import { Shift } from "@/lib/db";

type Answer = "alert" | "unsure" | "unsafe";

const RESPONSES: Record<Answer, string> = {
  alert:
    "Good. Crack a window and keep the radio on for the first few minutes — if that changes, pull over.",
  unsure:
    "Worth a few minutes before you commit. Sit for five minutes first, or splash some cold water on your face. If it doesn't pass, treat it like the answer was no.",
  unsafe:
    "Don't drive. Call someone for a lift, use a rideshare, or find somewhere safe to rest first. It's not worth the risk.",
};

function storageKey(date: string): string {
  return `recovery-position-drive-check-${date}`;
}

export default function DriveSafetyCheck({ shift }: { shift: Shift | null }) {
  const [show, setShow] = useState(false);
  const [answer, setAnswer] = useState<Answer | null>(null);

  useEffect(() => {
    if (!shift) return;
    const inWindow = isWithinDriveSafetyWindow(shift);
    if (!inWindow) return;

    const key = storageKey(shift.date);
    const alreadyAnswered = localStorage.getItem(key);
    if (alreadyAnswered) {
      setAnswer(alreadyAnswered as Answer);
    }
    setShow(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleAnswer(a: Answer) {
    setAnswer(a);
    if (shift) {
      localStorage.setItem(storageKey(shift.date), a);
    }
  }

  if (!show) return null;

  return (
    <div className="mt-4 bg-cream rounded-xl p-4 card-shadow">
      <div className="text-xs font-bold uppercase tracking-wide text-rose mb-1">
        Driving home?
      </div>
      <p className="text-sm text-ink mb-3">
        Nights are hardest on judgement right when you need it most. Quick check before you go.
      </p>

      {!answer ? (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleAnswer("alert")}
            className="text-xs font-bold px-4 py-2.5 min-h-[44px] rounded-full bg-sage text-navy-deep hover:opacity-90 transition-opacity"
          >
            I&apos;m alert
          </button>
          <button
            onClick={() => handleAnswer("unsure")}
            className="text-xs font-bold px-4 py-2.5 min-h-[44px] rounded-full bg-amber text-navy-deep hover:opacity-90 transition-opacity"
          >
            Not sure
          </button>
          <button
            onClick={() => handleAnswer("unsafe")}
            className="text-xs font-bold px-4 py-2.5 min-h-[44px] rounded-full bg-rose text-ink hover:opacity-90 transition-opacity"
          >
            I shouldn&apos;t drive
          </button>
        </div>
      ) : (
        <div>
          <p className="text-sm text-ink/80">{RESPONSES[answer]}</p>
          <button
            onClick={() => setAnswer(null)}
            className="text-xs font-semibold text-amber-deep hover:underline tap-link mt-2"
          >
            Answer again
          </button>
        </div>
      )}

      <p className="text-xs text-ink/40 mt-3">
        This is a self-check, not a test — only you know how you&apos;re actually doing.
      </p>
    </div>
  );
}
