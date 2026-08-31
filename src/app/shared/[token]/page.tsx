import db, { Shift, ShareLink } from "@/lib/db";
import { buildAvailability, AvailabilityStatus } from "@/lib/availability";
import { toLocalISODate } from "@/lib/date";

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<AvailabilityStatus, string> = {
  best: "Good day to plan something",
  off: "Off, but taking it easy",
  working: "Working",
};

const STATUS_STYLE: Record<AvailabilityStatus, string> = {
  best: "bg-sage text-navy-deep",
  off: "bg-amber/40 text-ink",
  working: "bg-rose/40 text-ink",
};

export default async function SharedAvailabilityPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  const link = db.prepare("SELECT * FROM share_links WHERE token = ?").get(token) as ShareLink | undefined;

  if (!link) {
    return (
      <div className="min-h-screen bg-paper text-ink flex items-center justify-center p-6">
        <div className="text-center max-w-sm">
          <p style={{ fontFamily: "var(--font-display)" }} className="text-2xl mb-2">
            This link isn&apos;t valid.
          </p>
          <p className="text-sm text-ink/60">
            It may have been revoked, or the link wasn&apos;t copied correctly.
          </p>
        </div>
      </div>
    );
  }

  const today = new Date();
  const dates: string[] = [];
  const cursor = new Date(today);
  for (let i = 0; i < 14; i++) {
    dates.push(toLocalISODate(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }

  const startISO = dates[0];
  const endISO = dates[dates.length - 1];
  const rows = db
    .prepare("SELECT * FROM shifts WHERE date BETWEEN ? AND ? ORDER BY date ASC")
    .all(startISO, endISO) as Shift[];
  const shiftsByDate = new Map(rows.map((r) => [r.date, r]));

  const availability = buildAvailability(dates, shiftsByDate);

  return (
    <div className="min-h-screen bg-paper text-ink">
      <div className="max-w-lg mx-auto px-5 py-10">
        <p className="text-xs font-bold tracking-widest uppercase text-amber-deep mb-2">
          {link.label || "Availability"}
        </p>
        <h1 style={{ fontFamily: "var(--font-display)" }} className="text-3xl mb-2 tracking-tight">
          The next two weeks.
        </h1>
        <p className="text-sm text-ink/70 mb-8">
          Just whether the day&apos;s free or not — no shift times, no other details.
        </p>

        <div className="space-y-2">
          {availability.map((a) => {
            const d = new Date(a.date + "T00:00:00");
            const label = d.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });
            return (
              <div
                key={a.date}
                className="flex items-center justify-between bg-cream rounded-xl px-4 py-3.5 text-sm card-shadow"
              >
                <span className="font-semibold text-ink">{label}</span>
                <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${STATUS_STYLE[a.status]}`}>
                  {STATUS_LABEL[a.status]}
                </span>
              </div>
            );
          })}
        </div>

        <p className="text-xs text-ink/40 mt-8 text-center">
          Shared from The Recovery Position
        </p>
      </div>
    </div>
  );
}
