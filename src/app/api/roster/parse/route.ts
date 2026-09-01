import { NextRequest, NextResponse } from "next/server";
import { parseRosterImage } from "@/lib/parseRoster";
import { todayLocalISO } from "@/lib/date";


// This route reads/writes live data on every request and must never
// be cached or statically optimized by Next.js.
export const dynamic = "force-dynamic";
export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("image") as File | null;
  const referenceDate = (formData.get("referenceDate") as string) || todayLocalISO();

  if (!file) {
    return NextResponse.json({ error: "No image uploaded." }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  const base64 = Buffer.from(bytes).toString("base64");
  const mediaType = file.type || "image/jpeg";

  try {
    const shifts = await parseRosterImage(base64, mediaType, referenceDate);
    return NextResponse.json({ shifts });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error parsing roster.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
