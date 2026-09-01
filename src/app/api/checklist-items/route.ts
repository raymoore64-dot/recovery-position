import { NextRequest, NextResponse } from "next/server";
import db, { ChecklistItem } from "@/lib/db";

export async function GET() {
  const rows = db.prepare("SELECT * FROM checklist_items ORDER BY id ASC").all() as ChecklistItem[];
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { label } = body;

  if (!label || !label.trim()) {
    return NextResponse.json({ error: "label is required" }, { status: 400 });
  }

  db.prepare("INSERT INTO checklist_items (label) VALUES (?)").run(label.trim());
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }
  db.prepare("DELETE FROM checklist_items WHERE id = ?").run(id);
  return NextResponse.json({ ok: true });
}
