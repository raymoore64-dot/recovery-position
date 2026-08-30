import { toLocalISODate } from "./date";

export type CertStatus = "fine" | "due-soon" | "overdue";

export interface CertStatusInfo {
  status: CertStatus;
  daysUntil: number; // negative if overdue
  label: string;
}

const DUE_SOON_WINDOW_DAYS = 60;

/** Days between two YYYY-MM-DD strings (b - a), local time, no DST drift. */
function daysBetween(aISO: string, bISO: string): number {
  const a = new Date(aISO + "T00:00:00");
  const b = new Date(bISO + "T00:00:00");
  return Math.round((b.getTime() - a.getTime()) / 86400000);
}

export function statusFor(expiryDateISO: string, todayISO: string = toLocalISODate(new Date())): CertStatusInfo {
  const daysUntil = daysBetween(todayISO, expiryDateISO);

  if (daysUntil < 0) {
    const daysOverdue = Math.abs(daysUntil);
    return {
      status: "overdue",
      daysUntil,
      label: `Overdue by ${daysOverdue} day${daysOverdue === 1 ? "" : "s"}`,
    };
  }
  if (daysUntil <= DUE_SOON_WINDOW_DAYS) {
    return {
      status: "due-soon",
      daysUntil,
      label: daysUntil === 0 ? "Due today" : `Due in ${daysUntil} day${daysUntil === 1 ? "" : "s"}`,
    };
  }
  return {
    status: "fine",
    daysUntil,
    label: `Renews ${expiryDateISO}`,
  };
}
