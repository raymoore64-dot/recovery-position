import { NextResponse } from "next/server";
import db from "@/lib/db";
import { toLocalISODate } from "@/lib/date";

// Everything a person might reasonably want out of the app if they're
// switching machines, backing up before an update, or just want their
// own data in a plain, readable format. New tables should be added here
// as they're built — this is meant to always cover the full app.
export async function GET() {
  const shifts = db.prepare("SELECT * FROM shifts ORDER BY date ASC").all();
  const tracks = db.prepare("SELECT * FROM tracks ORDER BY category ASC, title ASC").all();
  const certifications = db.prepare("SELECT * FROM certifications ORDER BY expiry_date ASC").all();
  const personal_quotes = db.prepare("SELECT * FROM personal_quotes ORDER BY created_at ASC").all();

  const payload = {
    exported_at: new Date().toISOString(),
    app: "The Recovery Position",
    shifts,
    tracks,
    certifications,
    personal_quotes,
  };

  const filename = `recovery-position-backup-${toLocalISODate(new Date())}.json`;

  return new NextResponse(JSON.stringify(payload, null, 2), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
