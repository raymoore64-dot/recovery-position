import { NextRequest, NextResponse } from "next/server";
import db, { Track } from "@/lib/db";

export async function GET() {
  const rows = db.prepare("SELECT * FROM tracks ORDER BY category ASC, title ASC").all() as Track[];
  return NextResponse.json(rows);
}

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
  db.prepare("DELETE FROM tracks WHERE id = ?").run(id);
  return NextResponse.json({ ok: true });
}
