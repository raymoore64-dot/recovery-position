import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

interface BatchShift {
  date: string;
  shift_type: string;
  start_time: string | null;
  end_time: string | null;
}

// POST /api/shifts/batch  { shifts: [{ date, shift_type, start_time, end_time }, ...] }
// Upserts every shift in a single transaction — either they all land or
// none do, so a batch generation attempt can't half-write a rota.
export async function POST(req: NextRequest) {
  const body = await req.json();
  const shifts: BatchShift[] = body.shifts;

  if (!Array.isArray(shifts) || shifts.length === 0) {
    return NextResponse.json({ error: "shifts array is required" }, { status: 400 });
  }

  const upsert = db.prepare(
    `INSERT INTO shifts (date, shift_type, start_time, end_time, notes)
     VALUES (@date, @shift_type, @start_time, @end_time, NULL)
     ON CONFLICT(date) DO UPDATE SET
       shift_type = excluded.shift_type,
       start_time = excluded.start_time,
       end_time = excluded.end_time`
  );

  const runBatch = db.transaction((rows: BatchShift[]) => {
    for (const row of rows) {
      upsert.run({
        date: row.date,
        shift_type: row.shift_type,
        start_time: row.start_time ?? null,
        end_time: row.end_time ?? null,
      });
    }
  });

  runBatch(shifts);

  return NextResponse.json({ ok: true, count: shifts.length });
}
