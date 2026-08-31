import { NextRequest, NextResponse } from "next/server";
import db, { Vitals } from "@/lib/db";

export async function GET() {
  const rows = db.prepare("SELECT * FROM vitals ORDER BY date DESC").all() as Vitals[];
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { date, systolic, diastolic, heart_rate, weight, notes } = body;

  if (!date) {
    return NextResponse.json({ error: "date is required" }, { status: 400 });
  }

  db.prepare(
    "INSERT INTO vitals (date, systolic, diastolic, heart_rate, weight, notes) VALUES (?, ?, ?, ?, ?, ?)"
  ).run(
    date,
    systolic || null,
    diastolic || null,
    heart_rate || null,
    weight || null,
    notes || null
  );

  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }
  db.prepare("DELETE FROM vitals WHERE id = ?").run(id);
  return NextResponse.json({ ok: true });
}
