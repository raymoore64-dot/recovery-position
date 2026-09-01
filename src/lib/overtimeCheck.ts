import { Shift } from "./db";
import { toLocalISODate } from "./date";

export interface OvertimeCheck {
  conflict: Shift | null;
  restGapHours: number | null;
  resultingConsecutiveNights: number | null;
  recentAverageScore: number | null;
}

function shiftEndDateTime(shift: Shift): Date | null {
  if (!shift.start_time || !shift.end_time) return null;
  const start = new Date(`${shift.date}T${shift.start_time}:00`);
  const end = new Date(`${shift.date}T${shift.end_time}:00`);
  if (end.getTime() <= start.getTime()) {
    end.setDate(end.getDate() + 1);
  }
  return end;
}

function countConsecutiveNightsBefore(date: string, shiftsByDate: Map<string, Shift>): number {
  let count = 0;
  const cursor = new Date(`${date}T00:00:00`);
  // eslint-disable-next-line no-constant-condition
  while (true) {
    cursor.setDate(cursor.getDate() - 1);
    const key = toLocalISODate(cursor);
    const s = shiftsByDate.get(key);
    if (s && s.shift_type === "night") {
      count++;
    } else {
      break;
    }
  }
  return count;
}

export function checkOvertimeCandidate(
  candidateDate: string,
  candidateType: "day" | "night" | "long_day",
  candidateStart: string,
  shiftsByDate: Map<string, Shift>
): OvertimeCheck {
  const conflict = shiftsByDate.get(candidateDate) || null;

  const dayBefore = toLocalISODate(new Date(new Date(`${candidateDate}T00:00:00`).getTime() - 86400000));
  const prevShift = shiftsByDate.get(dayBefore);
  let restGapHours: number | null = null;
  if (prevShift) {
    const prevEnd = shiftEndDateTime(prevShift);
    if (prevEnd) {
      const candidateStartDT = new Date(`${candidateDate}T${candidateStart}:00`);
      restGapHours = Math.round(((candidateStartDT.getTime() - prevEnd.getTime()) / 3600000) * 10) / 10;
    }
  }

  const resultingConsecutiveNights =
    candidateType === "night" ? countConsecutiveNightsBefore(candidateDate, shiftsByDate) + 1 : null;

  return { conflict, restGapHours, resultingConsecutiveNights, recentAverageScore: null };
}
