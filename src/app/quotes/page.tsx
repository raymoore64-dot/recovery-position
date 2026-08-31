"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface PersonalQuote {
  id: number;
  text: string;
  author: string;
}

export default function QuotesPage() {
  const [quotes, setQuotes] = useState<PersonalQuote[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [author, setAuthor] = useState("");
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/personal-quotes");
    setQuotes(await res.json());
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim() || !author.trim()) return;
    setSaving(true);
    await fetch("/api/personal-quotes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, author }),
    });
    setText("");
    setAuthor("");
    setSaving(false);
    await load();
  }

  async function handleDelete(id: number) {
    await fetch(`/api/personal-quotes?id=${id}`, { method: "DELETE" });
    await load();
  }

  return (
    <div className="space-y-8">
      <div>
        <Link href="/" className="text-xs font-semibold text-amber-deep hover:underline">
          ← Back to Today
        </Link>
        <p className="text-xs font-bold tracking-widest uppercase text-amber-deep mb-2 mt-3">
          Your Quotes
        </p>
        <h1 style={{ fontFamily: "var(--font-display)" }} className="text-3xl text-ink mb-2 tracking-tight">
          Add your own.
        </h1>
        <p className="text-sm text-ink/70 max-w-lg">
          The built-in daily quotes are all traditional proverbs and safely public-domain
          historical lines. Anything more recent — a song lyric, a line from a show, whatever
          actually gets you — add it here yourself. It only ever shows in your own copy of the
          app, so it&apos;s on your own judgement, not something built into the shipped content.
        </p>
      </div>

      <div className="bg-cream rounded-2xl p-5 sm:p-7 space-y-4 card-shadow">
        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            <span className="text-xs font-semibold text-ink uppercase tracking-wide">Quote</span>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="The quote itself"
              rows={2}
              className="mt-1 w-full rounded-md border border-line bg-paper text-ink px-3 py-2 text-sm resize-none"
              required
            />
          </label>
          <label className="block">
            <span className="text-xs font-semibold text-ink uppercase tracking-wide">
              Attribution
            </span>
            <input
              type="text"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="Who said it / where it's from"
              className="mt-1 w-full rounded-md border border-line bg-paper text-ink px-3 py-2 text-sm"
              required
            />
          </label>
          <button
            type="submit"
            disabled={saving || !text.trim() || !author.trim()}
            className="btn-primary bg-amber text-navy-deep font-bold text-sm px-5 py-2.5 min-h-[44px] rounded-full hover:bg-amber-deep hover:text-ink transition-colors disabled:opacity-50"
          >
            {saving ? "Adding…" : "Add quote"}
          </button>
        </form>
      </div>

      {loading ? (
        <p className="text-sm text-ink/60">Loading…</p>
      ) : quotes.length === 0 ? (
        <p className="text-sm text-ink/60">No personal quotes added yet.</p>
      ) : (
        <div className="space-y-3">
          {quotes.map((q) => (
            <div key={q.id} className="bg-cream rounded-xl p-4 card-shadow flex items-start justify-between gap-4">
              <div>
                <div style={{ fontFamily: "var(--font-display-italic)" }} className="text-ink text-sm">
                  &ldquo;{q.text}&rdquo;
                </div>
                <div className="text-xs text-ink/50 mt-1">— {q.author}</div>
              </div>
              <button
                onClick={() => handleDelete(q.id)}
                className="text-xs font-semibold text-rose hover:underline tap-link shrink-0"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
