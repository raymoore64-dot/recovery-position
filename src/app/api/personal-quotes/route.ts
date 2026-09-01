import { NextRequest, NextResponse } from "next/server";
import db, { PersonalQuote } from "@/lib/db";


// This route reads/writes live data on every request and must never
// be cached or statically optimized by Next.js.
export const dynamic = "force-dynamic";
export async function GET() {
  const rows = db
    .prepare("SELECT * FROM personal_quotes ORDER BY created_at DESC")
    .all() as PersonalQuote[];
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { text, author } = body;

  if (!text || !author) {
    return NextResponse.json({ error: "text and author are required" }, { status: 400 });
  }

  db.prepare("INSERT INTO personal_quotes (text, author) VALUES (?, ?)").run(text, author);
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }
  db.prepare("DELETE FROM personal_quotes WHERE id = ?").run(id);
  return NextResponse.json({ ok: true });
}
