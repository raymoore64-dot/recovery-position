import Link from "next/link";

export default function ExportPage() {
  return (
    <div className="space-y-8">
      <div>
        <Link href="/roster" className="text-xs font-semibold text-amber-deep hover:underline">
          ← Back to Roster
        </Link>
        <p className="text-xs font-bold tracking-widest uppercase text-amber-deep mb-2 mt-3">
          Your Data
        </p>
        <h1 style={{ fontFamily: "var(--font-display)" }} className="text-3xl text-ink mb-2 tracking-tight">
          It&apos;s yours. Take it with you.
        </h1>
        <p className="text-sm text-ink/70 max-w-lg">
          Everything you&apos;ve entered — your roster, Afterglow tracks, certifications, and
          personal quotes — as one plain JSON file. Useful before switching machines, before an
          update, or just as a backup sitting somewhere safe.
        </p>
      </div>

      <div className="bg-cream rounded-2xl p-6 card-shadow">
        <h2 style={{ fontFamily: "var(--font-display-semibold)" }} className="text-lg text-ink mb-2">
          Download
        </h2>
        <p className="text-sm text-ink/70 mb-4">
          This downloads immediately — nothing is sent anywhere, it comes straight from your own
          local database to a file on your machine.
        </p>
        <a href="/api/export" download className="btn-primary inline-block bg-amber text-navy-deep font-bold text-sm px-5 py-2.5 rounded-full hover:bg-amber-deep hover:text-ink transition-colors">
          Download my data
        </a>
      </div>
    </div>
  );
}
