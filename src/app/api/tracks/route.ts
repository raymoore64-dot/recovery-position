import { NextRequest, NextResponse } from "next/server";
import db, { Track } from "@/lib/db";
import path from "path";
import fs from "fs";

const AUDIO_DIR = path.join(process.cwd(), "public", "audio");

export async function GET() {
  const rows = db.prepare("SELECT * FROM tracks ORDER BY category ASC, title ASC").all() as Track[];
  return NextResponse.json(rows);
}

// Kept for programmatic/manual entry (e.g. a track already sitting in
// public/audio/ from before the upload button existed). The normal path
// for adding a track is now POST /api/tracks/upload.
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { title, filename, category } = body;

  if (!title || !filename || !category) {
    return NextResponse.json({ error: "title, filename, and category are required" }, { status: 400 });
  }

  db.prepare("INSERT INTO tracks (title, filename, category) VALUES (?, ?, ?)").run(
    title,
    filename,
    category
  );

  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  // Look up the filename before deleting the row, so the underlying audio
  // file can be cleaned up too — otherwise uploads pile up in public/audio/
  // forever even after their track entry is removed.
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
