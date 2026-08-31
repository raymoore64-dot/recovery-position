"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Certification {
  id: number;
  name: string;
  expiry_date: string;
  notes: string | null;
}

type CertStatus = "fine" | "due-soon" | "overdue";

interface CertStatusInfo {
  status: CertStatus;
  daysUntil: number;
  label: string;
}

const DUE_SOON_WINDOW_DAYS = 60;

function todayLocalISO(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function daysBetween(aISO: string, bISO: string): number {
  const a = new Date(aISO + "T00:00:00");
  const b = new Date(bISO + "T00:00:00");
  return Math.round((b.getTime() - a.getTime()) / 86400000);
}

function statusFor(expiryDateISO: string, todayISO: string): CertStatusInfo {
  const daysUntil = daysBetween(todayISO, expiryDateISO);
  if (daysUntil < 0) {
    const daysOverdue = Math.abs(daysUntil);
    return { status: "overdue", daysUntil, label: `Overdue by ${daysOverdue} day${daysOverdue === 1 ? "" : "s"}` };
  }
  if (daysUntil <= DUE_SOON_WINDOW_DAYS) {
    return { status: "due-soon", daysUntil, label: daysUntil === 0 ? "Due today" : `Due in ${daysUntil} day${daysUntil === 1 ? "" : "s"}` };
  }
  return { status: "fine", daysUntil, label: `Renews ${expiryDateISO}` };
}

const STATUS_STYLE: Record<CertStatus, string> = {
  fine: "bg-sage text-navy-deep",
  "due-soon": "bg-amber/70 text-navy-deep",
  overdue: "bg-rose text-ink",
};

const STATUS_DOT: Record<CertStatus, string> = {
  fine: "🟢",
  "due-soon": "🟡",
  overdue: "🔴",
};

export default function CertificationsPage() {
  const [certs, setCerts] = useState<Certification[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const today = todayLocalISO();

  async function load() {
    setLoading(true);
    const res = await fetch("/api/certifications");
    setCerts(await res.json());
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !expiryDate) return;
    setSaving(true);
    await fetch("/api/certifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, expiry_date: expiryDate, notes: notes || null }),
    });
    setName("");
    setExpiryDate("");
    setNotes("");
    setSaving(false);
    await load();
  }

  async function handleDelete(id: number) {
    await fetch(`/api/certifications?id=${id}`, { method: "DELETE" });
    await load();
  }

  const withStatus = certs
    .map((c) => ({ cert: c, info: statusFor(c.expiry_date, today) }))
    .sort((a, b) => a.info.daysUntil - b.info.daysUntil);

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-bold tracking-widest uppercase text-amber-deep mb-2">
          Certifications
        </p>
        <h1 style={{ fontFamily: "var(--font-display)" }} className="text-3xl text-ink mb-2 tracking-tight">
          Never miss a renewal.
        </h1>
        <p className="text-sm text-ink/70 max-w-lg">
          BLS, infection prevention, a forklift license, a fire safety refresher — anything with
          an expiry date. Add it once and it&apos;ll flag itself when it&apos;s due, on this page
          and on your Daily Card.
        </p>
        <Link href="/medications" className="text-xs font-semibold text-amber-deep hover:underline mt-2 inline-block">
          Looking for medication reminders? →
        </Link>
      </div>

      <div className="bg-cream rounded-2xl p-5 sm:p-7 space-y-4 card-shadow">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="block">
              <span className="text-xs font-semibold text-ink uppercase tracking-wide">Name</span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. BLS Certification"
                className="mt-1 w-full rounded-md border border-line bg-paper text-ink px-3 py-2 text-sm"
                required
              />
            </label>
            <label className="block">
              <span className="text-xs font-semibold text-ink uppercase tracking-wide">
                Expiry date
              </span>
              <input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="mt-1 w-full rounded-md border border-line bg-paper text-ink px-3 py-2 text-sm"
                required
              />
            </label>
          </div>
          <label className="block">
            <span className="text-xs font-semibold text-ink uppercase tracking-wide">
              Notes (optional)
            </span>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Renew via hospital LMS"
              className="mt-1 w-full rounded-md border border-line bg-paper text-ink px-3 py-2 text-sm"
            />
          </label>
          <button
            type="submit"
            disabled={saving || !name.trim() || !expiryDate}
            className="btn-primary bg-amber text-navy-deep font-bold text-sm px-5 py-2.5 rounded-full hover:bg-amber-deep hover:text-ink transition-colors disabled:opacity-50"
          >
            {saving ? "Adding…" : "Add certification"}
          </button>
        </form>
      </div>

      {loading ? (
        <p className="text-sm text-ink/60">Loading…</p>
      ) : withStatus.length === 0 ? (
        <p className="text-sm text-ink/60">Nothing tracked yet — add your first credential above.</p>
      ) : (
        <div className="space-y-3">
          {withStatus.map(({ cert, info }) => (
            <div key={cert.id} className="bg-cream rounded-xl p-4 card-shadow flex items-center justify-between gap-4 flex-wrap">
              <div>
                <div className="font-semibold text-ink text-sm">
                  {STATUS_DOT[info.status]} {cert.name}
                </div>
                {cert.notes && <div className="text-xs text-ink/50 mt-0.5">{cert.notes}</div>}
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${STATUS_STYLE[info.status]}`}>
                  {info.label}
                </span>
                <button
                  onClick={() => handleDelete(cert.id)}
                  className="text-xs font-semibold text-rose hover:underline"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
