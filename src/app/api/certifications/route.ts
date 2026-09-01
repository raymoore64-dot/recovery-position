import { NextRequest, NextResponse } from "next/server";
import db, { Certification } from "@/lib/db";


// This route reads/writes live data on every request and must never
// be cached or statically optimized by Next.js.
export const dynamic = "force-dynamic";
export async function GET() {
  const rows = db
    .prepare("SELECT * FROM certifications ORDER BY expiry_date ASC")
    .all() as Certification[];
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, expiry_date, notes } = body;

  if (!name || !expiry_date) {
    return NextResponse.json({ error: "name and expiry_date are required" }, { status: 400 });
  }

  db.prepare("INSERT INTO certifications (name, expiry_date, notes) VALUES (?, ?, ?)").run(
    name,
    expiry_date,
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
  db.prepare("DELETE FROM certifications WHERE id = ?").run(id);
  return NextResponse.json({ ok: true });
}
