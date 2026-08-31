"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface ShareLink {
  id: number;
  token: string;
  label: string | null;
  created_at: string;
}

export default function SharePage() {
  const [links, setLinks] = useState<ShareLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [label, setLabel] = useState("");
  const [saving, setSaving] = useState(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    setOrigin(window.location.origin);
    load();
  }, []);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/share-links");
    setLinks(await res.json());
    setLoading(false);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await fetch("/api/share-links", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ label: label || null }),
    });
    setLabel("");
    setSaving(false);
    await load();
  }

  async function handleRevoke(id: number) {
    await fetch(`/api/share-links?id=${id}`, { method: "DELETE" });
    await load();
  }

  function urlFor(token: string) {
    return `${origin}/shared/${token}`;
  }

  async function handleCopy(link: ShareLink) {
    await navigator.clipboard.writeText(urlFor(link.token));
    setCopiedId(link.id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  return (
    <div className="space-y-8">
      <div>
        <Link href="/leave" className="text-xs font-semibold text-amber-deep hover:underline">
          ← Back to Leave
        </Link>
        <p className="text-xs font-bold tracking-widest uppercase text-amber-deep mb-2 mt-3">
          Shared Availability
        </p>
        <h1 style={{ fontFamily: "var(--font-display)" }} className="text-3xl text-ink mb-2 tracking-tight">
          Let someone see when you're free.
        </h1>
        <p className="text-sm text-ink/70 max-w-lg">
          Generate a link for a partner or family member — no login needed. It only ever shows
          whether a day is a good day, a plain day off, or a working day. No shift times, no sleep
          windows, nothing else about your roster.
        </p>
      </div>

      <div className="bg-cream rounded-2xl p-5 sm:p-7 card-shadow">
        <form onSubmit={handleCreate} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Label (optional) — e.g. For Connie"
            className="flex-1 rounded-md border border-line bg-paper text-ink px-3 py-2 text-sm"
          />
          <button
            type="submit"
            disabled={saving}
            className="btn-primary bg-amber text-navy-deep font-bold text-sm px-5 py-2.5 min-h-[44px] rounded-full hover:bg-amber-deep hover:text-ink transition-colors disabled:opacity-50 shrink-0"
          >
            {saving ? "Creating…" : "Create link"}
          </button>
        </form>
      </div>

      {loading ? (
        <p className="text-sm text-ink/60">Loading…</p>
      ) : links.length === 0 ? (
        <p className="text-sm text-ink/60">No share links yet — create one above.</p>
      ) : (
        <div className="space-y-3">
          {links.map((link) => (
            <div key={link.id} className="bg-cream rounded-xl p-4 card-shadow flex items-center justify-between gap-4 flex-wrap">
              <div className="min-w-0">
                <div className="font-semibold text-ink text-sm">{link.label || "Untitled link"}</div>
                <div className="text-xs text-ink/50 truncate max-w-xs sm:max-w-md">
                  {origin ? urlFor(link.token) : "…"}
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <button
                  onClick={() => handleCopy(link)}
                  className="text-xs font-bold px-3 py-1.5 rounded-full bg-amber text-navy-deep hover:bg-amber-deep hover:text-ink transition-colors"
                >
                  {copiedId === link.id ? "Copied!" : "Copy link"}
                </button>
                <button
                  onClick={() => handleRevoke(link.id)}
                  className="text-xs font-semibold text-rose hover:underline tap-link"
                >
                  Revoke
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
