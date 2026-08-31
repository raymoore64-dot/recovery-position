import { NextRequest, NextResponse } from "next/server";
import db, { Medication } from "@/lib/db";

export async function GET() {
  const rows = db.prepare("SELECT * FROM medications ORDER BY name ASC").all() as Medication[];
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, times, notes } = body;

  if (!name || !Array.isArray(times) || times.length === 0) {
    return NextResponse.json({ error: "name and at least one time are required" }, { status: 400 });
  }

  const validTimes = times.filter((t: unknown) => typeof t === "string" && /^\d{2}:\d{2}$/.test(t));
  if (validTimes.length === 0) {
    return NextResponse.json({ error: "no valid HH:MM times provided" }, { status: 400 });
  }

  db.prepare("INSERT INTO medications (name, times, notes) VALUES (?, ?, ?)").run(
    name,
    JSON.stringify(validTimes),
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
  db.prepare("DELETE FROM medications WHERE id = ?").run(id);
  return NextResponse.json({ ok: true });
}
