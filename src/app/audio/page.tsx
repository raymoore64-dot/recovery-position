"use client";

import { useEffect, useState } from "react";

type AudioCategory = "wind-down" | "sleep" | "relaxation" | "energize";
type TrackSource = "collection" | "upload";

interface Track {
  id: number;
  title: string;
  filename: string;
  category: AudioCategory;
  source: TrackSource;
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

function TrackGrid({ items, onDelete }: { items: Track[]; onDelete: (id: number) => void }) {
  const grouped = (Object.keys(CATEGORY_LABEL) as AudioCategory[]).map((cat) => ({
    cat,
    items: items.filter((t) => t.category === cat),
  }));

  if (items.length === 0) return null;

  return (
    <div className="space-y-6">
      {grouped.map(({ cat, items }) =>
        items.length === 0 ? null : (
          <div key={cat}>
            <div className="flex items-center gap-2 mb-1">
              <CategoryIcon category={cat} />
              <h3 style={{ fontFamily: "var(--font-display-semibold)" }} className="text-base text-ink">
                {CATEGORY_LABEL[cat]}
              </h3>
            </div>
            <p className="text-xs text-ink/50 mb-3">{CATEGORY_HINT[cat]}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {items.map((t) => (
                <div key={t.id} className="bg-cream rounded-xl p-4 card-shadow">
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="font-semibold text-ink text-sm">{t.title}</span>
                    <button
                      onClick={() => onDelete(t.id)}
                      className="text-xs font-semibold text-rose hover:underline tap-link shrink-0 ml-2"
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
          </div>
        )
      )}
    </div>
  );
}

export default function AudioPage() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [category, setCategory] = useState<AudioCategory>("wind-down");
  const [source, setSource] = useState<TrackSource>("upload");
  const [saving, setSaving] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setLoadError(null);
    try {
      const res = await fetch("/api/tracks");
      if (!res.ok) throw new Error(`Server returned ${res.status}`);
      const data = await res.json();
      setTracks(data);
      setShowAddForm(data.length === 0);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Failed to load tracks.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !file) return;
    setSaving(true);
    setUploadError(null);

    const formData = new FormData();
    formData.append("title", title);
    formData.append("category", category);
    formData.append("source", source);
    formData.append("file", file);

    try {
      const res = await fetch("/api/tracks/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Upload failed.");
      }
      setTitle("");
      setFile(null);
      await load();
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    await fetch(`/api/tracks?id=${id}`, { method: "DELETE" });
    await load();
  }

  const collectionTracks = tracks.filter((t) => t.source === "collection");
  const uploadTracks = tracks.filter((t) => t.source === "upload");

  return (
    <div className="space-y-10">
      <div>
        <p className="text-xs font-bold tracking-widest uppercase text-amber-deep mb-2">
          Afterglow
        </p>
        <h1 style={{ fontFamily: "var(--font-display)" }} className="text-3xl text-ink mb-2 tracking-tight">
          Choose what quiets you.
        </h1>
        <p className="text-sm text-ink/70 max-w-lg">
          A curated collection, plus anything you or anyone using this add of their own. The
          Daily Card picks one automatically, but this is yours to browse and play whatever
          actually fits right now.
        </p>
      </div>

      {loadError ? (
        <div className="bg-cream rounded-2xl p-6 card-shadow">
          <p className="text-sm text-rose font-semibold mb-2">Couldn&apos;t load your tracks.</p>
          <p className="text-sm text-ink/60">{loadError}</p>
        </div>
      ) : loading ? (
        <p className="text-sm text-ink/60">Loading…</p>
      ) : (
        <>
          {collectionTracks.length > 0 && (
            <section>
              <h2 style={{ fontFamily: "var(--font-display)" }} className="text-xl text-ink mb-4 tracking-tight">
                My Collection
              </h2>
              <TrackGrid items={collectionTracks} onDelete={handleDelete} />
            </section>
          )}

          {uploadTracks.length > 0 && (
            <section>
              <h2 style={{ fontFamily: "var(--font-display)" }} className="text-xl text-ink mb-4 tracking-tight">
                Uploads
              </h2>
              <TrackGrid items={uploadTracks} onDelete={handleDelete} />
            </section>
          )}

          {tracks.length === 0 && (
            <p className="text-sm text-ink/60">Nothing here yet — add your first track below.</p>
          )}
        </>
      )}

      <div className="pt-2">
        {!showAddForm ? (
          <button
            onClick={() => setShowAddForm(true)}
            className="text-sm font-bold text-amber-deep hover:underline"
          >
            + Upload a track
          </button>
        ) : (
          <div className="bg-cream rounded-2xl p-5 sm:p-6 card-shadow">
            <div className="flex items-center justify-between mb-4">
              <h2 style={{ fontFamily: "var(--font-display-semibold)" }} className="text-lg text-ink">
                Upload a track
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
              Upload an audio file (mp3, m4a, wav, ogg, aac, or flac) directly — no need to touch
              any project folders.
            </p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <span className="text-xs font-semibold text-ink uppercase tracking-wide">
                  Add to
                </span>
                <div className="flex gap-2 mt-1">
                  <button
                    type="button"
                    onClick={() => setSource("collection")}
                    className={`px-3.5 py-2 text-xs font-bold rounded-full transition-colors ${
                      source === "collection" ? "bg-amber text-navy-deep" : "bg-paper text-ink/60 hover:text-ink"
                    }`}
                  >
                    My Collection
                  </button>
                  <button
                    type="button"
                    onClick={() => setSource("upload")}
                    className={`px-3.5 py-2 text-xs font-bold rounded-full transition-colors ${
                      source === "upload" ? "bg-amber text-navy-deep" : "bg-paper text-ink/60 hover:text-ink"
                    }`}
                  >
                    Uploads
                  </button>
                </div>
              </div>
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
                    Audio file
                  </span>
                  <input
                    type="file"
                    accept="audio/*,.mp3,.m4a,.wav,.ogg,.aac,.flac"
                    onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                    className="mt-1 w-full rounded-md border border-line bg-paper px-3 py-2 text-sm file:mr-3 file:rounded file:border-0 file:bg-amber file:text-navy-deep file:font-bold file:px-3 file:py-1 file:text-xs"
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
              {uploadError && (
                <div className="text-sm text-rose bg-paper border border-rose/30 rounded-md p-3">
                  {uploadError}
                </div>
              )}
              <button
                type="submit"
                disabled={saving || !title.trim() || !file}
                className="btn-primary bg-amber text-navy-deep font-bold text-sm px-5 py-2.5 min-h-[44px] rounded-full hover:bg-amber-deep hover:text-ink transition-colors disabled:opacity-50"
              >
                {saving ? "Uploading…" : "Upload track"}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
