"use client";

import { useEffect, useState } from "react";

type AudioCategory = "wind-down" | "sleep" | "relaxation" | "energize";

interface Track {
  id: number;
  title: string;
  filename: string;
  category: AudioCategory;
}

const CATEGORY_LABEL: Record<AudioCategory, string> = {
  "wind-down": "Wind-down",
  sleep: "Sleep",
  relaxation: "Relaxation",
  energize: "Energize",
};

const CATEGORY_HINT: Record<AudioCategory, string> = {
  "wind-down": "For after night shifts, before your sleep window",
  sleep: "Ambient tracks for during sleep itself",
  relaxation: "For recovering or low-energy days off",
  energize: "For before a day shift",
};

function CategoryIcon({ category }: { category: AudioCategory }) {
  const common = { fill: "none" as const, stroke: "#F43F5E", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  const size = 22;

  switch (category) {
    case "wind-down":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24">
          <path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z" {...common} />
        </svg>
      );
    case "sleep":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24">
          <path d="M4 17h3M9 17h2M6 14l3-4h-2l3-4" {...common} />
          <path d="M14 8h6M17 5v6" {...common} />
        </svg>
      );
    case "relaxation":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24">
          <path d="M12 21c4-2 7-5.5 7-9.5A6 6 0 0 0 12 5a6 6 0 0 0-7 6.5C5 15.5 8 19 12 21Z" {...common} />
          <path d="M12 21V11" {...common} />
        </svg>
      );
    case "energize":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24">
          <path d="M13 3 5 14h5l-1 7 8-11h-5l1-7Z" {...common} />
        </svg>
      );
  }
}

export default function AudioPage() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [title, setTitle] = useState("");
  const [filename, setFilename] = useState("");
  const [category, setCategory] = useState<AudioCategory>("wind-down");
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/tracks");
    const data = await res.json();
    setTracks(data);
    setShowAddForm(data.length === 0);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !filename.trim()) return;
    setSaving(true);
    await fetch("/api/tracks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, filename, category }),
    });
    setTitle("");
    setFilename("");
    setSaving(false);
    await load();
  }

  async function handleDelete(id: number) {
    await fetch(`/api/tracks?id=${id}`, { method: "DELETE" });
    await load();
  }

  const grouped = (Object.keys(CATEGORY_LABEL) as AudioCategory[]).map((cat) => ({
    cat,
    items: tracks.filter((t) => t.category === cat),
  }));

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-bold tracking-widest uppercase text-amber-deep mb-2">
          Afterglow
        </p>
        <h1 style={{ fontFamily: "var(--font-display)" }} className="text-3xl text-ink mb-2 tracking-tight">
          Choose what quiets you.
        </h1>
        <p className="text-sm text-ink/70 max-w-lg">
          Your own collection, sorted for the moment. The Daily Card picks one automatically,
          but this is yours to browse and play whatever actually fits right now.
        </p>
      </div>

      {loading ? (
        <p className="text-sm text-ink/60">Loading…</p>
      ) : tracks.length === 0 ? (
        <p className="text-sm text-ink/60">Nothing in the collection yet — add your first track below.</p>
      ) : (
        <div className="space-y-8">
          {grouped.map(({ cat, items }) =>
            items.length === 0 ? null : (
              <section key={cat}>
                <div className="flex items-center gap-2 mb-1">
                  <CategoryIcon category={cat} />
                  <h2 style={{ fontFamily: "var(--font-display-semibold)" }} className="text-lg text-ink">
                    {CATEGORY_LABEL[cat]}
                  </h2>
                </div>
                <p className="text-xs text-ink/50 mb-3">{CATEGORY_HINT[cat]}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {items.map((t) => (
                    <div key={t.id} className="bg-cream rounded-xl p-4 card-shadow">
                      <div className="flex items-center justify-between mb-2.5">
                        <span className="font-semibold text-ink text-sm">{t.title}</span>
                        <button
                          onClick={() => handleDelete(t.id)}
                          className="text-xs font-semibold text-rose hover:underline shrink-0 ml-2"
                        >
                          Remove
                        </button>
                      </div>
                      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
                      <audio controls className="w-full" src={`/audio/${t.filename}`}>
                        Your browser doesn&apos;t support inline audio playback.
                      </audio>
                    </div>
                  ))}
                </div>
              </section>
            )
          )}
        </div>
      )}

      <div className="pt-2">
        {!showAddForm ? (
          <button
            onClick={() => setShowAddForm(true)}
            className="text-sm font-bold text-amber-deep hover:underline"
          >
            + Add a track to your collection
          </button>
        ) : (
          <div className="bg-cream rounded-2xl p-5 sm:p-6 card-shadow">
            <div className="flex items-center justify-between mb-4">
              <h2 style={{ fontFamily: "var(--font-display-semibold)" }} className="text-lg text-ink">
                Add a track
              </h2>
              {tracks.length > 0 && (
                <button
                  onClick={() => setShowAddForm(false)}
                  className="text-xs font-semibold text-ink/50 hover:text-ink"
                >
                  Close
                </button>
              )}
            </div>
            <p className="text-sm text-ink/70 mb-4">
              First, copy your audio file (mp3, m4a, etc.) into the{" "}
              <code className="bg-paper px-1.5 py-0.5 rounded text-xs">public/audio/</code> folder of
              this project. Then add it here with the exact filename.
            </p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="block">
                  <span className="text-xs font-semibold text-ink uppercase tracking-wide">Title</span>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Skye Wind-down"
                    className="mt-1 w-full rounded-md border border-line bg-paper px-3 py-2 text-sm"
                    required
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-semibold text-ink uppercase tracking-wide">
                    Filename in public/audio/
                  </span>
                  <input
                    type="text"
                    value={filename}
                    onChange={(e) => setFilename(e.target.value)}
                    placeholder="e.g. skye-winddown.mp3"
                    className="mt-1 w-full rounded-md border border-line bg-paper px-3 py-2 text-sm"
                    required
                  />
                </label>
              </div>
              <label className="block">
                <span className="text-xs font-semibold text-ink uppercase tracking-wide">Category</span>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as AudioCategory)}
                  className="mt-1 w-full rounded-md border border-line bg-paper px-3 py-2 text-sm"
                >
                  {(Object.keys(CATEGORY_LABEL) as AudioCategory[]).map((c) => (
                    <option key={c} value={c}>
                      {CATEGORY_LABEL[c]}
                    </option>
                  ))}
                </select>
              </label>
              <button
                type="submit"
                disabled={saving}
                className="btn-primary bg-amber text-navy-deep font-bold text-sm px-5 py-2.5 rounded-full hover:bg-amber-deep hover:text-ink transition-colors disabled:opacity-50"
              >
                {saving ? "Adding…" : "Add track"}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
