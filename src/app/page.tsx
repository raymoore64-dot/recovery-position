import db, { Shift, Track, Certification, PersonalQuote, Medication } from "@/lib/db";
import { buildPlan, shiftLabel, DayPlan } from "@/lib/schedule";
import { quipFor } from "@/lib/quips";
import { categoryFor, pickTrack, CATEGORY_LABEL } from "@/lib/audio";
import { toLocalISODate } from "@/lib/date";
import { statusFor } from "@/lib/certifications";
import { pickDailyQuote } from "@/lib/quotes";
import { notificationTimesFor } from "@/lib/notificationTimes";
import { driveSafetyWindowFor } from "@/lib/driveSafety";
import { resolveActiveShiftDate } from "@/lib/activeShift";
import Link from "next/link";
import Image from "next/image";
import RecoveryDial from "@/components/RecoveryDial";
import NotificationSetup, { ReminderItem } from "@/components/NotificationSetup";
import MilestoneCelebration from "@/components/MilestoneCelebration";
import LogoEasterEgg from "@/components/LogoEasterEgg";
import DriveSafetyCheck from "@/components/DriveSafetyCheck";
import PreShiftChecklist from "@/components/PreShiftChecklist";

// This page reads live data (today's date, current shifts) on every
// request, so it must never be statically prerendered at build time.
export const dynamic = "force-dynamic";

function isoDate(d: Date): string {
  return toLocalISODate(d);
}

/**
 * Loads everything the Daily Card needs. Two distinct concepts here,
 * which is the whole point of this function:
 *
 * - `heroPlan` is whichever shift is operatively "active" right now —
 *   for most of the day that's today's own shift, but if it's the
 *   morning after a night shift and you're still inside the recovery
 *   window, it's still last night's shift. This drives the hero card.
 * - `listPlans` is the plain 7-day-forward calendar list, always
 *   anchored to the real date regardless of the above.
 * - `realTodayISO` is the actual calendar date, used for the header
 *   label and anything (like certification countdowns) that must count
 *   relative to the real "now", not the operative shift date.
 */
function loadDashboardData(): { heroPlan: DayPlan; listPlans: DayPlan[]; realTodayISO: string } {
  const now = new Date();
  const realTodayISO = isoDate(now);

  const rangeStart = new Date(now);
  rangeStart.setDate(rangeStart.getDate() - 2);
  const rangeEnd = new Date(now);
  rangeEnd.setDate(rangeEnd.getDate() + 6);

  const rows = db
    .prepare("SELECT * FROM shifts WHERE date BETWEEN ? AND ? ORDER BY date ASC")
    .all(isoDate(rangeStart), isoDate(rangeEnd)) as Shift[];
  const shiftsByDate = new Map(rows.map((r) => [r.date, r]));

  const effectiveDate = resolveActiveShiftDate(realTodayISO, shiftsByDate, now);
  const effectiveYesterday = isoDate(new Date(new Date(`${effectiveDate}T00:00:00`).getTime() - 86400000));
  const heroPlans = buildPlan([effectiveYesterday, effectiveDate], shiftsByDate);
  const heroPlan = heroPlans[1];

  const listDates: string[] = [];
  const cursor = new Date(now);
  for (let i = 0; i < 7; i++) {
    listDates.push(isoDate(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  const listYesterday = isoDate(new Date(new Date(`${realTodayISO}T00:00:00`).getTime() - 86400000));
  const allListPlans = buildPlan([listYesterday, ...listDates], shiftsByDate);
  const listPlans = allListPlans.slice(1);

  return { heroPlan, listPlans, realTodayISO };
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
  const { heroPlan, listPlans, realTodayISO } = loadDashboardData();
  const todayPlan = heroPlan;
  const plans = listPlans;
  const nightsSurvived = loadNightsSurvived();
  const weekday = new Date(realTodayISO + "T00:00:00").toLocaleDateString("en-GB", {
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
    .map((c) => ({ cert: c, info: statusFor(c.expiry_date, realTodayISO) }))
    .filter(({ info }) => info.status !== "fine")
    .sort((a, b) => a.info.daysUntil - b.info.daysUntil);

  const personalQuotes = db.prepare("SELECT * FROM personal_quotes").all() as PersonalQuote[];
  const dailyQuote = pickDailyQuote(personalQuotes, todayPlan.date);

  const notifTimes = todayPlan.shift ? notificationTimesFor(todayPlan.shift) : { sleepWindowStart: null, caffeineCutoff: null };

  const reminders: ReminderItem[] = [];
  if (notifTimes.caffeineCutoff) {
    reminders.push({
      id: "caffeine",
      label: "Caffeine cutoff",
      body: "Last call for coffee if you want to actually sleep later.",
      time: notifTimes.caffeineCutoff.toISOString(),
    });
  }
  if (notifTimes.sleepWindowStart) {
    reminders.push({
      id: "sleep",
      label: "Sleep window",
      body: "This is roughly when your recommended sleep window starts.",
      time: notifTimes.sleepWindowStart.toISOString(),
    });
  }

  // Medication reminders are absolute clock times set by the user, tied
  // to the real calendar date — not shift-relative like the two above.
  const medications = db.prepare("SELECT * FROM medications").all() as Medication[];
  for (const med of medications) {
    const times: string[] = JSON.parse(med.times);
    for (const t of times) {
      reminders.push({
        id: `med-${med.id}-${t}`,
        label: med.name,
        body: med.notes || "Time for your medication.",
        time: new Date(`${realTodayISO}T${t}:00`).toISOString(),
      });
    }
  }

  const driveSafetyWindow = todayPlan.shift ? driveSafetyWindowFor(todayPlan.shift) : null;
  if (driveSafetyWindow) {
    reminders.push({
      id: "drive-safety",
      label: "Driving home?",
      body: "Quick check before you go — are you actually alert enough to drive?",
      time: driveSafetyWindow.start.toISOString(),
    });
  }

  return (
    <div className="space-y-12">
      <MilestoneCelebration nightsSurvived={nightsSurvived} />
      <div className="flex items-center gap-3 sm:gap-4">
        <LogoEasterEgg />
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

                {todayPlan.shift.notes && (
                  <div className="bg-white/5 rounded-lg px-3 py-2 mb-4 text-sm text-ink/80">
                    📝 {todayPlan.shift.notes}
                  </div>
                )}

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

        <NotificationSetup reminders={reminders} />

        <DriveSafetyCheck shift={todayPlan.shift} />

        {todayPlan.shift && todayPlan.shift.shift_type !== "off" && (
          <PreShiftChecklist date={todayPlan.date} />
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
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <h2
            style={{ fontFamily: "var(--font-display)" }}
            className="text-2xl text-ink tracking-tight"
          >
            The next 7 days
          </h2>
          <Link href="/trends" className="text-xs font-semibold text-amber-deep hover:underline">
            View recovery trend →
          </Link>
        </div>
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
