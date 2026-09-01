import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import path from "path";
import fs from "fs";


// This route reads/writes live data on every request and must never
// be cached or statically optimized by Next.js.
export const dynamic = "force-dynamic";
const AUDIO_DIR = path.join(process.cwd(), "public", "audio");
const ALLOWED_EXTENSIONS = [".mp3", ".m4a", ".wav", ".ogg", ".aac", ".flac"];

function safeFilename(originalName: string): string {
  const ext = path.extname(originalName).toLowerCase();
  const base = path
    .basename(originalName, ext)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 60);
  return `${Date.now()}-${base || "track"}${ext}`;
}

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const title = formData.get("title") as string | null;
  const category = formData.get("category") as string | null;
  const source = (formData.get("source") as string | null) || "upload";

  if (!file || !title || !category) {
    return NextResponse.json({ error: "file, title, and category are required" }, { status: 400 });
  }

  const ext = path.extname(file.name).toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return NextResponse.json(
      { error: `Unsupported file type "${ext}". Use mp3, m4a, wav, ogg, aac, or flac.` },
      { status: 400 }
    );
  }

  if (!fs.existsSync(AUDIO_DIR)) {
    fs.mkdirSync(AUDIO_DIR, { recursive: true });
  }

  const filename = safeFilename(file.name);
  const bytes = await file.arrayBuffer();
  fs.writeFileSync(path.join(AUDIO_DIR, filename), Buffer.from(bytes));

  db.prepare("INSERT INTO tracks (title, filename, category, source) VALUES (?, ?, ?, ?)").run(
    title,
    filename,
    category,
    source
  );

  return NextResponse.json({ ok: true, filename });
}
