import { NextRequest, NextResponse } from "next/server";
import db, { Track } from "@/lib/db";
import path from "path";
import fs from "fs";


// This route reads/writes live data on every request and must never
// be cached or statically optimized by Next.js.
export const dynamic = "force-dynamic";
const AUDIO_DIR = path.join(process.cwd(), "public", "audio");

export async function GET() {
  const rows = db.prepare("SELECT * FROM tracks ORDER BY category ASC, title ASC").all() as Track[];
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { title, filename, category, source } = body;

  if (!title || !filename || !category) {
    return NextResponse.json({ error: "title, filename, and category are required" }, { status: 400 });
  }

  db.prepare("INSERT INTO tracks (title, filename, category, source) VALUES (?, ?, ?, ?)").run(
    title,
    filename,
    category,
    source || "upload"
  );

  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  const track = db.prepare("SELECT * FROM tracks WHERE id = ?").get(id) as Track | undefined;
  db.prepare("DELETE FROM tracks WHERE id = ?").run(id);

  if (track) {
    const filePath = path.join(AUDIO_DIR, track.filename);
    try {
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    } catch {
      // Non-fatal — the track row is already gone either way.
    }
  }

  return NextResponse.json({ ok: true });
}
