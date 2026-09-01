import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import db, { ShareLink } from "@/lib/db";


// This route reads/writes live data on every request and must never
// be cached or statically optimized by Next.js.
export const dynamic = "force-dynamic";
export async function GET() {
  const rows = db.prepare("SELECT * FROM share_links ORDER BY created_at DESC").all() as ShareLink[];
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const label = body.label || null;
  const token = crypto.randomBytes(16).toString("hex");

  db.prepare("INSERT INTO share_links (token, label) VALUES (?, ?)").run(token, label);

  return NextResponse.json({ ok: true, token });
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }
  db.prepare("DELETE FROM share_links WHERE id = ?").run(id);
  return NextResponse.json({ ok: true });
}
