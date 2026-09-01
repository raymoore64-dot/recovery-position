import { NextRequest, NextResponse } from "next/server";
import db, { Shift } from "@/lib/db";
import { checkOvertimeCandidate } from "@/lib/overtimeCheck";
import { buildTrend, trendStats } from "@/lib/trends";
import { toLocalISODate } from "@/lib/date";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date");
  const shiftType = searchParams.get("shift_type") as "day" | "night" | "long_day" | null;
  const startTime = searchParams.get("start_time");

  if (!date || !shiftType || !startTime) {
    return NextResponse.json({ error: "date, shift_type, and start_time are required" }, { status: 400 });
  }

  const candidateDateObj = new Date(`${date}T00:00:00`);
  const rangeStart = new Date(candidateDateObj);
  rangeStart.setDate(rangeStart.getDate() - 14);

  const rows = db
    .prepare("SELECT * FROM shifts WHERE date BETWEEN ? AND ? ORDER BY date ASC")
    .all(toLocalISODate(rangeStart), date) as Shift[];
  const shiftsByDate = new Map(rows.map((r) => [r.date, r]));

  const check = checkOvertimeCandidate(date, shiftType, startTime, shiftsByDate);

  const sevenDaysAgo = new Date(candidateDateObj);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const recentDates: string[] = [];
  const cursor = new Date(sevenDaysAgo);
  while (cursor < candidateDateObj) {
    recentDates.push(toLocalISODate(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  const trendPoints = buildTrend(recentDates, shiftsByDate);
  const stats = trendStats(trendPoints);

  return NextResponse.json({
    ...check,
    recentAverageScore: trendPoints.length > 0 ? stats.average : null,
  });
}
