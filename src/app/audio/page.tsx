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
  "wind-down": "Suggested after night shifts, before your sleep window",
  sleep: "Ambient tracks for during sleep itself",
  relaxation: "Suggested on recovering / low-energy days off",
  energize: "Suggested before a day shift",
};

export default function AudioPage() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [filename, setFilename] = useState("");
  const [category, setCategory] = useState<AudioCategory>("wind-down");
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/tracks");
    setTracks(await res.json());
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
          Recovery Audio
        </p>
        <h1 style={{ fontFamily: "var(--font-display)" }} className="text-3xl text-navy mb-2 tracking-tight">
          Your own music, on shift-aware standby.
        </h1>
        <p className="text-sm text-ink/70 max-w-lg">
          Add your own relaxation tracks below. The Daily Card will suggest one automatically —
          a wind-down track after a night shift, a relaxation track on a recovering day off.
        </p>
      </div>

      <div className="bg-cream rounded-2xl p-6 card-shadow">
        <p className="text-sm text-ink/70 mb-4">
          First, copy your audio file (mp3, m4a, etc.) into the{" "}
          <code className="bg-paper px-1.5 py-0.5 rounded text-xs">public/audio/</code> folder of
          this project. Then add it here with the exact filename.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="text-xs font-semibold text-navy uppercase tracking-wide">Title</span>
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
              <span className="text-xs font-semibold text-navy uppercase tracking-wide">
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
            <span className="text-xs font-semibold text-navy uppercase tracking-wide">Category</span>
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
            className="btn-primary bg-amber text-navy-deep font-bold text-sm px-5 py-2.5 rounded-full hover:bg-amber-deep hover:text-paper transition-colors disabled:opacity-50"
          >
            {saving ? "Adding…" : "Add track"}
          </button>
        </form>
      </div>

      {loading ? (
        <p className="text-sm text-ink/60">Loading…</p>
      ) : tracks.length === 0 ? (
        <p className="text-sm text-ink/60">No tracks added yet.</p>
      ) : (
        <div className="space-y-8">
          {grouped.map(({ cat, items }) =>
            items.length === 0 ? null : (
              <section key={cat}>
                <h2
                  style={{ fontFamily: "var(--font-display-semibold)" }}
                  className="text-lg text-navy mb-1"
                >
                  {CATEGORY_LABEL[cat]}
                </h2>
                <p className="text-xs text-ink/50 mb-3">{CATEGORY_HINT[cat]}</p>
                <div className="space-y-3">
                  {items.map((t) => (
                    <div key={t.id} className="bg-cream rounded-xl p-4 card-shadow">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-navy text-sm">{t.title}</span>
                        <button
                          onClick={() => handleDelete(t.id)}
                          className="text-xs font-semibold text-rose hover:underline"
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
    </div>
  );
}
