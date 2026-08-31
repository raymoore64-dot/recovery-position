"use client";

import { useEffect, useState } from "react";

export interface ReminderItem {
  id: string;
  label: string;
  body: string;
  time: string; // ISO string
}

interface NotificationSetupProps {
  reminders: ReminderItem[];
}

const STORAGE_KEY = "recovery-position-notifications-enabled";

export default function NotificationSetup({ reminders }: NotificationSetupProps) {
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

    for (const reminder of reminders) {
      const target = new Date(reminder.time).getTime();
      if (target > now) {
        const id = window.setTimeout(() => {
          new Notification(reminder.label, {
            body: reminder.body,
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, permission, JSON.stringify(reminders)]);

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

  const hasFutureTargets = reminders.some((r) => new Date(r.time).getTime() > Date.now());

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
              : "Get a browser notification for your caffeine cutoff, sleep window, and any medications."}
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
