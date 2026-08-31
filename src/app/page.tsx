import db, { Shift, Track, Certification, PersonalQuote } from "@/lib/db";
import { buildPlan, shiftLabel, DayPlan } from "@/lib/schedule";
import { quipFor } from "@/lib/quips";
import { categoryFor, pickTrack, CATEGORY_LABEL } from "@/lib/audio";
import { toLocalISODate } from "@/lib/date";
import { statusFor } from "@/lib/certifications";
import { pickDailyQuote } from "@/lib/quotes";
import Link from "next/link";
import Image from "next/image";
import RecoveryDial from "@/components/RecoveryDial";

// This page reads live data (today's date, current shifts) on every
// request, so it must never be statically prerendered at build time.
export const dynamic = "force-dynamic";

function isoDate(d: Date): string {
  return toLocalISODate(d);
}

function loadWeekPlan(): DayPlan[] {
  const today = new Date();
  const start = new Date(today);
  start.setDate(start.getDate() - 1); // one day back, so "yesterday" lookups work
  const end = new Date(today);
  end.setDate(end.getDate() + 6); // today + next 6 days

  const rows = db
    .prepare("SELECT * FROM shifts WHERE date BETWEEN ? AND ? ORDER BY date ASC")
    .all(isoDate(start), isoDate(end)) as Shift[];

  const byDate = new Map(rows.map((r) => [r.date, r]));

  const dates: string[] = [];
  const cursor = new Date(today);
  for (let i = 0; i < 7; i++) {
    dates.push(isoDate(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }

  // Prepend yesterday to the lookup range so energy/consecutive-night
  // calculations for "today" have context, but only return today onward.
  const allDates = [isoDate(start), ...dates];
  const allPlans = buildPlan(allDates, byDate);
  return allPlans.slice(1);
}

/** Total night shifts ever logged up to and including today — a small,
 * honest, slightly self-congratulatory stat computed from real data. */
function loadNightsSurvived(): number {
  const today = isoDate(new Date());
  const row = db
    .prepare("SELECT COUNT(*) as c FROM shifts WHERE shift_type = 'night' AND date <= ?")
    .get(today) as { c: number };
  return row.c;
}

const energyColor: Record<DayPlan["energy"], string> = {
  High: "bg-sage text-navy-deep",
  Recovering: "bg-amber/30 text-ink",
  Medium: "bg-amber/60 text-navy-deep",
  Low: "bg-rose/70 text-ink",
};

export default function Home() {
  const plans = loadWeekPlan();
  const todayPlan = plans[0];
  const nightsSurvived = loadNightsSurvived();
  const weekday = new Date(todayPlan.date + "T00:00:00").toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  const allTracks = db.prepare("SELECT * FROM tracks").all() as Track[];
  const suggestedCategory = categoryFor(todayPlan);
  const suggestedTrack = suggestedCategory
    ? pickTrack(allTracks, suggestedCategory, todayPlan.date)
    : null;

  const allCerts = db.prepare("SELECT * FROM certifications").all() as Certification[];
  const dueCerts = allCerts
    .map((c) => ({ cert: c, info: statusFor(c.expiry_date, todayPlan.date) }))
    .filter(({ info }) => info.status !== "fine")
    .sort((a, b) => a.info.daysUntil - b.info.daysUntil);

  const personalQuotes = db.prepare("SELECT * FROM personal_quotes").all() as PersonalQuote[];
  const dailyQuote = pickDailyQuote(personalQuotes, todayPlan.date);

  return (
    <div className="space-y-12">
      <div className="flex items-center gap-3 sm:gap-4">
        <Image src="/icon.svg" alt="" width={52} height={52} className="shrink-0 sm:w-16 sm:h-16" />
        <div>
          <h1
            style={{ fontFamily: "var(--font-display)" }}
            className="text-2xl sm:text-4xl tracking-tight text-ink leading-none"
          >
            The Recovery Position
          </h1>
          <p
            style={{ fontFamily: "var(--font-display-italic)" }}
            className="text-amber-deep text-xs sm:text-sm mt-1"
          >
            Your roster runs your life. Might as well let it run something useful too.
          </p>
        </div>
      </div>

      <section>
        <p className="text-xs font-bold tracking-widest uppercase text-amber-deep mb-3">
          Today &middot; {weekday}
        </p>

        {!todayPlan.shift ? (
          <div className="bg-cream rounded-2xl p-5 sm:p-8 card-shadow">
            <p
              style={{ fontFamily: "var(--font-display)" }}
              className="text-2xl text-ink mb-2 tracking-tight"
            >
              No shift logged for today.
            </p>
            <p className="text-sm text-ink/70">
              Even zombies have to start somewhere —{" "}
              <Link href="/roster" className="text-amber-deep font-semibold underline">
                add your roster
              </Link>{" "}
              to get your first Daily Card.
            </p>
          </div>
        ) : (
          <div className="relative overflow-hidden bg-navy text-ink rounded-2xl p-5 sm:p-8 card-shadow">
            <div className="moonbleed" />
            <div className="moonbleed2" />
            <Image
              src="/icon.svg"
              alt=""
              width={140}
              height={140}
              className="absolute -bottom-6 -right-6 opacity-[0.08] pointer-events-none"
            />
            <div className="relative z-10 flex flex-col sm:flex-row sm:items-start justify-between gap-5 sm:gap-6">
              <div className="flex-1 min-w-[240px]">
                <h1
                  style={{ fontFamily: "var(--font-display)" }}
                  className="text-[26px] leading-[1.15] sm:text-4xl tracking-tight mb-2"
                >
                  {shiftLabel(todayPlan.shift.shift_type)}
                  {todayPlan.shift.start_time && todayPlan.shift.end_time
                    ? ` — ${todayPlan.shift.start_time}–${todayPlan.shift.end_time}`
                    : ""}
                </h1>
                <p
                  style={{ fontFamily: "var(--font-display-italic)" }}
                  className="text-amber text-sm mb-6"
                >
                  {quipFor(todayPlan)}
                </p>

                <div className="grid grid-cols-2 gap-4 sm:gap-6 text-sm">
                  <div className="border-t border-paper/15 pt-3">
                    <div className="text-ink/60 text-xs uppercase tracking-widest mb-1 font-semibold">
                      Sleep window
                    </div>
                    <div
                      style={{ fontFamily: "var(--font-display-semibold)" }}
                      className="text-xl"
                    >
                      {todayPlan.sleepWindow
                        ? `${todayPlan.sleepWindow.start} – ${todayPlan.sleepWindow.end}`
                        : "—"}
                    </div>
                  </div>
                  <div className="border-t border-paper/15 pt-3">
                    <div className="text-ink/60 text-xs uppercase tracking-widest mb-1 font-semibold">
                      Caffeine cutoff
                    </div>
                    <div
                      style={{ fontFamily: "var(--font-display-semibold)" }}
                      className="text-xl"
                    >
                      {todayPlan.caffeineCutoff ?? "—"}
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap gap-2">
                  <span
                    className={`inline-block text-xs font-bold px-3 py-1.5 rounded-full ${energyColor[todayPlan.energy]}`}
                  >
                    Energy: {todayPlan.energy}
                  </span>
                  {todayPlan.isBestDay && (
                    <span className="inline-block text-xs font-bold px-3 py-1.5 rounded-full bg-amber text-navy-deep">
                      Best day for family &amp; errands
                    </span>
                  )}
                </div>
              </div>

              <div className="self-center sm:self-auto">
                <RecoveryDial score={todayPlan.recoveryScore} label={todayPlan.recoveryLabel} />
              </div>
            </div>
          </div>
        )}

        {nightsSurvived > 0 && (
          <p className="text-xs text-ink/50 mt-3 text-center">
            🌙 {nightsSurvived.toLocaleString()} night shift{nightsSurvived === 1 ? "" : "s"}{" "}
            survived and counting.
          </p>
        )}

        {suggestedTrack && (
          <div className="mt-4 bg-cream rounded-xl p-4 card-shadow flex items-center justify-between gap-4 flex-wrap">
            <div>
              <div className="text-xs font-bold uppercase tracking-wide text-amber-deep mb-0.5">
                {suggestedCategory ? CATEGORY_LABEL[suggestedCategory] : ""} for today
              </div>
              <div className="font-semibold text-ink text-sm">{suggestedTrack.title}</div>
            </div>
            {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
            <audio controls className="max-w-full" src={`/audio/${suggestedTrack.filename}`}>
              Your browser doesn&apos;t support inline audio playback.
            </audio>
          </div>
        )}

        {dueCerts.length > 0 && (
          <Link
            href="/certifications"
            className="mt-4 block bg-cream rounded-xl p-4 card-shadow hover:bg-navy-mid transition-colors"
          >
            <div className="text-xs font-bold uppercase tracking-wide text-rose mb-1">
              {dueCerts.some((d) => d.info.status === "overdue") ? "Overdue" : "Due soon"}
            </div>
            <div className="text-sm text-ink">
              {dueCerts.slice(0, 2).map(({ cert, info }) => (
                <span key={cert.id} className="block">
                  {cert.name} — {info.label}
                </span>
              ))}
              {dueCerts.length > 2 && (
                <span className="text-ink/50">and {dueCerts.length - 2} more…</span>
              )}
            </div>
          </Link>
        )}

        <div className="mt-4 bg-cream rounded-xl p-5 card-shadow text-center">
          <p style={{ fontFamily: "var(--font-display-italic)" }} className="text-ink text-base">
            &ldquo;{dailyQuote.text}&rdquo;
          </p>
          <p className="text-xs text-ink/50 mt-2">
            — {dailyQuote.author} &middot;{" "}
            <Link href="/quotes" className="text-amber-deep hover:underline">
              add your own
            </Link>
          </p>
        </div>
      </section>

      <section>
        <h2
          style={{ fontFamily: "var(--font-display)" }}
          className="text-2xl text-ink mb-4 tracking-tight"
        >
          The next 7 days
        </h2>
        <div className="space-y-2">
          {plans.map((p) => {
            const d = new Date(p.date + "T00:00:00");
            const label = d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
            return (
              <div
                key={p.date}
                className="flex flex-wrap items-center gap-y-2 gap-x-3 bg-cream rounded-xl px-4 py-3.5 text-sm card-shadow"
              >
                <div className="font-semibold text-ink w-20 sm:w-28 shrink-0">{label}</div>
                <div className="flex-1 min-w-[80px] text-ink/80">
                  {p.shift ? shiftLabel(p.shift.shift_type) : "—"}
                </div>
                <span
                  className={`text-xs font-bold px-2.5 py-1 rounded-full ${energyColor[p.energy]}`}
                >
                  {p.energy}
                </span>
                {p.isBestDay && (
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber text-navy-deep">
                    Best day
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
