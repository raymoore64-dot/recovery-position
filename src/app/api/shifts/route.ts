import { NextRequest, NextResponse } from "next/server";
import db, { Shift } from "@/lib/db";

// GET /api/shifts?from=2026-08-01&to=2026-08-31
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  let rows: Shift[];
  if (from && to) {
    rows = db
      .prepare("SELECT * FROM shifts WHERE date BETWEEN ? AND ? ORDER BY date ASC")
      .all(from, to) as Shift[];
  } else {
    rows = db.prepare("SELECT * FROM shifts ORDER BY date ASC").all() as Shift[];
  }

  return NextResponse.json(rows);
}

// POST /api/shifts  { date, shift_type, start_time, end_time, notes }
// Upserts by date — re-submitting the same date edits it rather than duplicating.
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { date, shift_type, start_time, end_time, notes } = body;

  if (!date || !shift_type) {
    return NextResponse.json({ error: "date and shift_type are required" }, { status: 400 });
  }

  db.prepare(
    `INSERT INTO shifts (date, shift_type, start_time, end_time, notes)
     VALUES (@date, @shift_type, @start_time, @end_time, @notes)
     ON CONFLICT(date) DO UPDATE SET
       shift_type = excluded.shift_type,
       start_time = excluded.start_time,
       end_time = excluded.end_time,
       notes = excluded.notes`
  ).run({
    date,
    shift_type,
    start_time: start_time ?? null,
    end_time: end_time ?? null,
    notes: notes ?? null,
  });

  return NextResponse.json({ ok: true });
}

// DELETE /api/shifts?date=2026-08-29
export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date");
  if (!date) {
    return NextResponse.json({ error: "date is required" }, { status: 400 });
  }
  db.prepare("DELETE FROM shifts WHERE date = ?").run(date);
  return NextResponse.json({ ok: true });
}
