import Link from "next/link";

export default function HowItWorksPage() {
  return (
    <div className="space-y-8">
      <div>
        <Link href="/more" className="text-xs font-semibold text-amber-deep hover:underline">
          ← Back to More
        </Link>
        <p className="text-xs font-bold tracking-widest uppercase text-amber-deep mb-2 mt-3">
          Guide
        </p>
        <h1 style={{ fontFamily: "var(--font-display)" }} className="text-3xl text-ink mb-2 tracking-tight">
          How this works.
        </h1>
        <p className="text-sm text-ink/70 max-w-lg">
          Not a manual for every page — just the handful of things that genuinely aren&apos;t
          obvious, including to someone who built it.
        </p>
      </div>

      <section className="bg-cream rounded-2xl p-5 sm:p-7 card-shadow">
        <h2 style={{ fontFamily: "var(--font-display-semibold)" }} className="text-lg text-ink mb-2">
          Why does Today sometimes show yesterday&apos;s shift?
        </h2>
        <p className="text-sm text-ink/80">
          This is deliberate, not a bug. A night shift&apos;s sleep window and caffeine cutoff
          fall on the calendar day <em>after</em> the shift started — so if you check the app at
          8am after a night shift, it&apos;s still showing you that shift&apos;s details, because
          you&apos;re still living out its effects. Once your recovery window ends (roughly 7
          hours after your wind-down period), the card switches over to whatever&apos;s actually
          logged for the real calendar date. The date shown at the top of the page is always the
          real date — only the shift <em>content</em> shifts.
        </p>
      </section>

      <section className="bg-cream rounded-2xl p-5 sm:p-7 card-shadow">
        <h2 style={{ fontFamily: "var(--font-display-semibold)" }} className="text-lg text-ink mb-2">
          What does the Recovery Score actually mean?
        </h2>
        <p className="text-sm text-ink/80 mb-3">
          It&apos;s a simplified read on your energy state that day, not a medical measurement.
          Four bands:
        </p>
        <ul className="text-sm text-ink/80 space-y-1.5">
          <li><strong className="text-ink">88 — Suspiciously human:</strong> a genuine day off, well clear of any night shift.</li>
          <li><strong className="text-ink">62 — Holding it together:</strong> a normal working day or night shift, one or two in.</li>
          <li><strong className="text-ink">38 — Recovering, don&apos;t push it:</strong> the day right after a night shift.</li>
          <li><strong className="text-ink">18 — Running on fumes:</strong> three or more consecutive night shifts.</li>
        </ul>
      </section>

      <section className="bg-cream rounded-2xl p-5 sm:p-7 card-shadow">
        <h2 style={{ fontFamily: "var(--font-display-semibold)" }} className="text-lg text-ink mb-2">
          Reminders don&apos;t turn on by themselves
        </h2>
        <p className="text-sm text-ink/80">
          The Reminders card on Today (caffeine cutoff, sleep window, medications) only appears
          when there&apos;s something genuinely still ahead that day, and only actually schedules
          anything once you click <strong className="text-ink">Enable</strong> and grant your
          browser permission. It&apos;s per-browser, and it only fires while that tab stays
          open — there&apos;s no background push system behind it.
        </p>
      </section>

      <section className="bg-cream rounded-2xl p-5 sm:p-7 card-shadow">
        <h2 style={{ fontFamily: "var(--font-display-semibold)" }} className="text-lg text-ink mb-2">
          What&apos;s where
        </h2>
        <p className="text-sm text-ink/80 mb-3">
          Main nav is the stuff you&apos;d use most days. <strong className="text-ink">More</strong> is
          everything you set up once or check occasionally.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
          <div>
            <div className="text-xs font-bold uppercase tracking-wide text-amber-deep mb-1.5">
              Main nav
            </div>
            <ul className="text-sm text-ink/80 space-y-1">
              <li>Today — the Daily Card</li>
              <li>Roster — add and manage shifts</li>
              <li>Leave — find genuinely restorative time off</li>
              <li>Afterglow — your relaxation music</li>
              <li>Library — techniques, with a shift-aware pick</li>
            </ul>
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-wide text-amber-deep mb-1.5">
              More
            </div>
            <ul className="text-sm text-ink/80 space-y-1">
              <li>Certifications, Recovery Trend</li>
              <li>Medication Reminders, Vitals Diary</li>
              <li>Your Quotes, Travel &amp; Events</li>
              <li>Shared Availability, Your Data</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
