"use client";

import { useEffect, useState } from "react";

interface NotificationSetupProps {
  sleepWindowStart: string | null; // ISO string
  caffeineCutoff: string | null; // ISO string
}

const STORAGE_KEY = "recovery-position-notifications-enabled";

export default function NotificationSetup({ sleepWindowStart, caffeineCutoff }: NotificationSetupProps) {
  const [supported, setSupported] = useState(true);
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [enabled, setEnabled] = useState(false);
  const [scheduledCount, setScheduledCount] = useState(0);

  useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      setSupported(false);
      return;
    }
    setPermission(Notification.permission);
    const stored = localStorage.getItem(STORAGE_KEY);
    setEnabled(stored === "true" && Notification.permission === "granted");
  }, []);

  useEffect(() => {
    if (!enabled || permission !== "granted") return;

    const timers: number[] = [];
    const now = Date.now();
    let count = 0;

    if (caffeineCutoff) {
      const target = new Date(caffeineCutoff).getTime();
      if (target > now) {
        const id = window.setTimeout(() => {
          new Notification("Caffeine cutoff", {
            body: "Last call for coffee if you want to actually sleep later.",
            icon: "/icon.svg",
          });
        }, target - now);
        timers.push(id);
        count++;
      }
    }

    if (sleepWindowStart) {
      const target = new Date(sleepWindowStart).getTime();
      if (target > now) {
        const id = window.setTimeout(() => {
          new Notification("Sleep window", {
            body: "This is roughly when your recommended sleep window starts.",
            icon: "/icon.svg",
          });
        }, target - now);
        timers.push(id);
        count++;
      }
    }

    setScheduledCount(count);

    return () => {
      timers.forEach((id) => window.clearTimeout(id));
    };
  }, [enabled, permission, sleepWindowStart, caffeineCutoff]);

  async function handleEnable() {
    if (!("Notification" in window)) return;
    const result = await Notification.requestPermission();
    setPermission(result);
    if (result === "granted") {
      localStorage.setItem(STORAGE_KEY, "true");
      setEnabled(true);
    }
  }

  function handleDisable() {
    localStorage.setItem(STORAGE_KEY, "false");
    setEnabled(false);
  }

  if (!supported) return null;

  const hasFutureTargets =
    Boolean(caffeineCutoff && new Date(caffeineCutoff).getTime() > Date.now()) ||
    Boolean(sleepWindowStart && new Date(sleepWindowStart).getTime() > Date.now());

  // Nothing left today worth reminding about, and reminders aren't
  // already on — no point showing the card at all.
  if (!hasFutureTargets && !enabled) return null;

  return (
    <div className="mt-4 bg-cream rounded-xl p-4 card-shadow flex items-center justify-between gap-4 flex-wrap">
      <div>
        <div className="text-xs font-bold uppercase tracking-wide text-amber-deep mb-0.5">
          Reminders
        </div>
        <div className="text-sm text-ink">
          {enabled
            ? `On for today${scheduledCount > 0 ? ` — ${scheduledCount} scheduled` : ""} — while this tab stays open.`
            : permission === "denied"
              ? "Blocked in your browser settings — allow notifications for this site to use this."
              : "Get a browser notification at your caffeine cutoff and sleep window."}
        </div>
      </div>
      {permission !== "denied" &&
        (enabled ? (
          <button onClick={handleDisable} className="text-xs font-semibold text-rose hover:underline shrink-0">
            Turn off
          </button>
        ) : (
          <button
            onClick={handleEnable}
            className="btn-primary bg-amber text-navy-deep font-bold text-xs px-4 py-2 rounded-full hover:bg-amber-deep hover:text-ink transition-colors shrink-0"
          >
            Enable
          </button>
        ))}
    </div>
  );
}
