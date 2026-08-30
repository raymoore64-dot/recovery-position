"use client";

import { useEffect, useState } from "react";
import { toLocalISODate } from "@/lib/date";

type ShiftType = "day" | "night" | "long_day" | "off";

interface Shift {
  id: number;
  date: string;
  shift_type: ShiftType;
  start_time: string | null;
  end_time: string | null;
  notes: string | null;
}

const SHIFT_PRESETS: Record<Exclude<ShiftType, "off">, { start: string; end: string }> = {
  day: { start: "07:00", end: "19:00" },
  night: { start: "19:00", end: "07:00" },
  long_day: { start: "07:00", end: "20:00" },
};

const SHIFT_SHORT: Record<ShiftType, string> = {
  day: "D",
  night: "N",
  long_day: "L",
  off: "O",
};

const SHIFT_FULL: Record<ShiftType, string> = {
  day: "Day",
  night: "Night",
  long_day: "Long Day",
  off: "Off",
};

function todayISO() {
  return toLocalISODate(new Date());
}

function addDays(iso: string, n: number): string {
  const d = new Date(iso + "T00:00:00");
  d.setDate(d.getDate() + n);
  return toLocalISODate(d);
}

interface GeneratedShift {
  date: string;
  shift_type: ShiftType;
  start_time: string | null;
  end_time: string | null;
}

export default function RosterPage() {
  const [mode, setMode] = useState<"single" | "batch" | "scan">("single");
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);

  // --- single entry state ---
  const [date, setDate] = useState(todayISO());
  const [shiftType, setShiftType] = useState<ShiftType>("day");
  const [startTime, setStartTime] = useState(SHIFT_PRESETS.day.start);
  const [endTime, setEndTime] = useState(SHIFT_PRESETS.day.end);
  const [saving, setSaving] = useState(false);

  // --- batch pattern state ---
  const [batchStart, setBatchStart] = useState(todayISO());
  const [pattern, setPattern] = useState<ShiftType[]>(["night", "night", "off", "off", "day", "day", "off"]);
  const [repeatCount, setRepeatCount] = useState(4);
  const [batchSaving, setBatchSaving] = useState(false);
  const [batchSavedMsg, setBatchSavedMsg] = useState<string | null>(null);

  // --- AI scan state ---
  const [scanFile, setScanFile] = useState<File | null>(null);
  const [scanPreviewUrl, setScanPreviewUrl] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [scannedShifts, setScannedShifts] = useState<GeneratedShift[]>([]);
  const [scanSaving, setScanSaving] = useState(false);
  const [scanSavedMsg, setScanSavedMsg] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/shifts");
    const data = await res.json();
    setShifts(data.sort((a: Shift, b: Shift) => (a.date < b.date ? 1 : -1)));
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  function handleShiftTypeChange(type: ShiftType) {
    setShiftType(type);
    if (type !== "off") {
      setStartTime(SHIFT_PRESETS[type].start);
      setEndTime(SHIFT_PRESETS[type].end);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await fetch("/api/shifts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        date,
        shift_type: shiftType,
        start_time: shiftType === "off" ? null : startTime,
        end_time: shiftType === "off" ? null : endTime,
      }),
    });
    setSaving(false);
    await load();
  }

  async function handleDelete(d: string) {
    await fetch(`/api/shifts?date=${d}`, { method: "DELETE" });
    await load();
  }

  // --- batch helpers ---
  function addToPattern(type: ShiftType) {
    setPattern((p) => [...p, type]);
  }
  function removeLastFromPattern() {
    setPattern((p) => p.slice(0, -1));
  }
  function clearPattern() {
    setPattern([]);
  }

  function generatePreview(): GeneratedShift[] {
    if (pattern.length === 0) return [];
    const totalDays = pattern.length * repeatCount;
    const out: GeneratedShift[] = [];
    for (let i = 0; i < totalDays; i++) {
      const type = pattern[i % pattern.length];
      const date = addDays(batchStart, i);
      if (type === "off") {
        out.push({ date, shift_type: type, start_time: null, end_time: null });
      } else {
        out.push({
          date,
          shift_type: type,
          start_time: SHIFT_PRESETS[type].start,
          end_time: SHIFT_PRESETS[type].end,
        });
      }
    }
    return out;
  }

  const preview = generatePreview();

  async function handleBatchSave() {
    if (preview.length === 0) return;
    setBatchSaving(true);
    setBatchSavedMsg(null);
    const res = await fetch("/api/shifts/batch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ shifts: preview }),
    });
    const data = await res.json();
    setBatchSaving(false);
    setBatchSavedMsg(`Saved ${data.count} shifts, ${preview[0].date} to ${preview[preview.length - 1].date}.`);
    await load();
  }

  // --- scan helpers ---
  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setScanFile(file);
    setScanError(null);
    setScannedShifts([]);
    setScanSavedMsg(null);
    if (file) {
      setScanPreviewUrl(URL.createObjectURL(file));
    } else {
      setScanPreviewUrl(null);
    }
  }

  async function handleScan() {
    if (!scanFile) return;
    setScanning(true);
    setScanError(null);
    setScanSavedMsg(null);

    const formData = new FormData();
    formData.append("image", scanFile);
    formData.append("referenceDate", todayISO());

    try {
      const res = await fetch("/api/roster/parse", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Scan failed.");
      }
      setScannedShifts(data.shifts);
    } catch (err) {
      setScanError(err instanceof Error ? err.message : "Scan failed.");
    } finally {
      setScanning(false);
    }
  }

  function updateScannedRow(index: number, patch: Partial<GeneratedShift>) {
    setScannedShifts((rows) => {
      const next = [...rows];
      const row = { ...next[index], ...patch };
      if (patch.shift_type && patch.shift_type !== "off" && !patch.start_time) {
        row.start_time = SHIFT_PRESETS[patch.shift_type as Exclude<ShiftType, "off">].start;
        row.end_time = SHIFT_PRESETS[patch.shift_type as Exclude<ShiftType, "off">].end;
      }
      if (patch.shift_type === "off") {
        row.start_time = null;
        row.end_time = null;
      }
      next[index] = row;
      return next;
    });
  }

  function removeScannedRow(index: number) {
    setScannedShifts((rows) => rows.filter((_, i) => i !== index));
  }

  async function handleScanSave() {
    if (scannedShifts.length === 0) return;
    setScanSaving(true);
    setScanSavedMsg(null);
    const res = await fetch("/api/shifts/batch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ shifts: scannedShifts }),
    });
    const data = await res.json();
    setScanSaving(false);
    setScanSavedMsg(`Saved ${data.count} shifts from the scan.`);
    await load();
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-bold tracking-widest uppercase text-amber-deep mb-3">
          Your Roster
        </p>
        <h1 style={{ fontFamily: "var(--font-display)" }} className="text-3xl text-navy tracking-tight">
          Add shifts
        </h1>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => setMode("single")}
          className={`px-4 py-2 text-sm font-bold rounded-full transition-colors ${
            mode === "single" ? "bg-navy text-paper" : "bg-cream text-navy/60 hover:text-navy"
          }`}
        >
          Single shift
        </button>
        <button
          onClick={() => setMode("batch")}
          className={`px-4 py-2 text-sm font-bold rounded-full transition-colors ${
            mode === "batch" ? "bg-navy text-paper" : "bg-cream text-navy/60 hover:text-navy"
          }`}
        >
          Batch pattern
        </button>
        <button
          onClick={() => setMode("scan")}
          className={`px-4 py-2 text-sm font-bold rounded-full transition-colors ${
            mode === "scan" ? "bg-navy text-paper" : "bg-cream text-navy/60 hover:text-navy"
          }`}
        >
          Scan (AI)
        </button>
      </div>

      {mode === "single" && (
        <form onSubmit={handleSubmit} className="bg-cream rounded-2xl p-7 space-y-4 card-shadow">
          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="text-xs font-semibold text-navy uppercase tracking-wide">Date</span>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="mt-1 w-full rounded-md border border-line bg-paper px-3 py-2 text-sm"
                required
              />
            </label>

            <label className="block">
              <span className="text-xs font-semibold text-navy uppercase tracking-wide">Shift type</span>
              <select
                value={shiftType}
                onChange={(e) => handleShiftTypeChange(e.target.value as ShiftType)}
                className="mt-1 w-full rounded-md border border-line bg-paper px-3 py-2 text-sm"
              >
                <option value="day">Day</option>
                <option value="night">Night</option>
                <option value="long_day">Long Day</option>
                <option value="off">Off</option>
              </select>
            </label>
          </div>

          {shiftType !== "off" && (
            <div className="grid grid-cols-2 gap-4">
              <label className="block">
                <span className="text-xs font-semibold text-navy uppercase tracking-wide">Start time</span>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="mt-1 w-full rounded-md border border-line bg-paper px-3 py-2 text-sm"
                />
              </label>
              <label className="block">
                <span className="text-xs font-semibold text-navy uppercase tracking-wide">End time</span>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="mt-1 w-full rounded-md border border-line bg-paper px-3 py-2 text-sm"
                />
              </label>
            </div>
          )}

          <button
            type="submit"
            disabled={saving}
            className="btn-primary bg-amber text-navy-deep font-bold text-sm px-5 py-2.5 rounded-full hover:bg-amber-deep hover:text-paper transition-colors disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save shift"}
          </button>
        </form>
      )}

      {mode === "batch" && (
        <div className="bg-cream rounded-2xl p-7 space-y-5 card-shadow">
          <p className="text-sm text-ink/70">
            Build one cycle of your rota by clicking the shift types in order, then repeat it
            forward from a start date. E.g. click{" "}
            <span className="font-semibold text-navy">Night, Night, Off, Off, Day, Day, Off</span>{" "}
            for a common 7-day rotation.
          </p>

          <div>
            <span className="text-xs font-semibold text-navy uppercase tracking-wide">
              Build pattern
            </span>
            <div className="flex flex-wrap gap-2 mt-2">
              {(["day", "night", "long_day", "off"] as ShiftType[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => addToPattern(t)}
                  className="text-xs font-bold px-3 py-1.5 rounded-full bg-navy text-paper hover:bg-navy-mid transition-colors"
                >
                  + {SHIFT_FULL[t]}
                </button>
              ))}
              <button
                type="button"
                onClick={removeLastFromPattern}
                className="text-xs font-bold px-3 py-1.5 rounded-full border border-line text-ink/70 hover:bg-paper transition-colors"
              >
                Undo last
              </button>
              <button
                type="button"
                onClick={clearPattern}
                className="text-xs font-bold px-3 py-1.5 rounded-full border border-line text-rose hover:bg-paper transition-colors"
              >
                Clear
              </button>
            </div>
          </div>

          <div>
            <span className="text-xs font-semibold text-navy uppercase tracking-wide">
              Current pattern ({pattern.length} day{pattern.length === 1 ? "" : "s"})
            </span>
            <div className="flex flex-wrap gap-1.5 mt-2 min-h-9">
              {pattern.length === 0 ? (
                <span className="text-sm text-ink/40 italic">No pattern yet — click a shift type above.</span>
              ) : (
                pattern.map((t, i) => (
                  <span
                    key={i}
                    className="w-9 h-9 flex items-center justify-center rounded-md bg-amber text-navy-deep font-bold text-sm"
                    title={SHIFT_FULL[t]}
                  >
                    {SHIFT_SHORT[t]}
                  </span>
                ))
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="text-xs font-semibold text-navy uppercase tracking-wide">
                Start date
              </span>
              <input
                type="date"
                value={batchStart}
                onChange={(e) => setBatchStart(e.target.value)}
                className="mt-1 w-full rounded-md border border-line bg-paper px-3 py-2 text-sm"
              />
            </label>
            <label className="block">
              <span className="text-xs font-semibold text-navy uppercase tracking-wide">
                Repeat the pattern
              </span>
              <input
                type="number"
                min={1}
                max={52}
                value={repeatCount}
                onChange={(e) => setRepeatCount(Math.max(1, Number(e.target.value)))}
                className="mt-1 w-full rounded-md border border-line bg-paper px-3 py-2 text-sm"
              />
            </label>
          </div>

          {preview.length > 0 && (
            <div>
              <span className="text-xs font-semibold text-navy uppercase tracking-wide">
                Preview — {preview.length} days ({preview[0].date} to {preview[preview.length - 1].date})
              </span>
              <div className="mt-2 max-h-64 overflow-y-auto rounded-md border border-line bg-paper divide-y divide-line">
                {preview.map((s) => {
                  const d = new Date(s.date + "T00:00:00");
                  const label = d.toLocaleDateString("en-GB", {
                    weekday: "short",
                    day: "numeric",
                    month: "short",
                  });
                  return (
                    <div key={s.date} className="flex items-center justify-between px-3 py-1.5 text-xs">
                      <span className="font-semibold text-navy w-24">{label}</span>
                      <span className="text-ink/70">
                        {SHIFT_FULL[s.shift_type]}
                        {s.start_time && s.end_time ? ` — ${s.start_time}–${s.end_time}` : ""}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleBatchSave}
              disabled={preview.length === 0 || batchSaving}
              className="btn-primary bg-amber text-navy-deep font-bold text-sm px-5 py-2.5 rounded-full hover:bg-amber-deep hover:text-paper transition-colors disabled:opacity-50"
            >
              {batchSaving ? "Saving…" : `Save ${preview.length} shifts`}
            </button>
            {batchSavedMsg && <span className="text-sm text-sage font-semibold">{batchSavedMsg}</span>}
          </div>
          <p className="text-xs text-ink/50">
            Saving will overwrite any existing shifts on the same dates — handy for correcting a
            rota, but worth knowing before you run it over dates you've already entered manually.
          </p>
        </div>
      )}

      {mode === "scan" && (
        <div className="bg-cream rounded-2xl p-7 space-y-5 card-shadow">
          <p className="text-sm text-ink/70">
            Upload a photo of your printed or screenshotted rota. It'll read the shifts and give
            you an editable preview before anything is saved — nothing goes into your roster
            without you checking it first.
          </p>

          <div>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="text-sm"
            />
          </div>

          {scanPreviewUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={scanPreviewUrl}
              alt="Roster preview"
              className="max-h-48 rounded-md border border-line"
            />
          )}

          <button
            type="button"
            onClick={handleScan}
            disabled={!scanFile || scanning}
            className="btn-primary bg-amber text-navy-deep font-bold text-sm px-5 py-2.5 rounded-full hover:bg-amber-deep hover:text-paper transition-colors disabled:opacity-50"
          >
            {scanning ? "Reading roster…" : "Scan roster"}
          </button>

          {scanError && (
            <div className="text-sm text-rose bg-paper border border-rose/30 rounded-md p-3">
              {scanError}
            </div>
          )}

          {scannedShifts.length > 0 && (
            <div>
              <span className="text-xs font-semibold text-navy uppercase tracking-wide">
                Review before saving ({scannedShifts.length} shifts)
              </span>
              <div className="mt-2 max-h-80 overflow-y-auto rounded-md border border-line bg-paper divide-y divide-line">
                {scannedShifts.map((s, i) => (
                  <div key={i} className="flex items-center gap-2 px-3 py-2 text-xs">
                    <input
                      type="date"
                      value={s.date}
                      onChange={(e) => updateScannedRow(i, { date: e.target.value })}
                      className="rounded border border-line px-2 py-1 text-xs"
                    />
                    <select
                      value={s.shift_type}
                      onChange={(e) => updateScannedRow(i, { shift_type: e.target.value as ShiftType })}
                      className="rounded border border-line px-2 py-1 text-xs"
                    >
                      <option value="day">Day</option>
                      <option value="night">Night</option>
                      <option value="long_day">Long Day</option>
                      <option value="off">Off</option>
                    </select>
                    {s.shift_type !== "off" && (
                      <>
                        <input
                          type="time"
                          value={s.start_time ?? ""}
                          onChange={(e) => updateScannedRow(i, { start_time: e.target.value })}
                          className="rounded border border-line px-2 py-1 text-xs"
                        />
                        <input
                          type="time"
                          value={s.end_time ?? ""}
                          onChange={(e) => updateScannedRow(i, { end_time: e.target.value })}
                          className="rounded border border-line px-2 py-1 text-xs"
                        />
                      </>
                    )}
                    <button
                      onClick={() => removeScannedRow(i)}
                      className="ml-auto text-rose font-semibold hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-3 mt-4">
                <button
                  type="button"
                  onClick={handleScanSave}
                  disabled={scanSaving}
                  className="btn-primary bg-amber text-navy-deep font-bold text-sm px-5 py-2.5 rounded-full hover:bg-amber-deep hover:text-paper transition-colors disabled:opacity-50"
                >
                  {scanSaving ? "Saving…" : `Save ${scannedShifts.length} shifts`}
                </button>
                {scanSavedMsg && <span className="text-sm text-sage font-semibold">{scanSavedMsg}</span>}
              </div>
            </div>
          )}
        </div>
      )}

      <div>
        <h2 style={{ fontFamily: "var(--font-display)" }} className="text-2xl text-navy mb-4 tracking-tight">
          Upcoming &amp; recent
        </h2>
        {loading ? (
          <p className="text-sm text-ink/60">Loading…</p>
        ) : shifts.length === 0 ? (
          <p className="text-sm text-ink/60">No shifts entered yet.</p>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {shifts.map((s) => (
              <div
                key={s.id}
                className="flex items-center justify-between bg-cream rounded-xl px-4 py-3.5 text-sm card-shadow"
              >
                <div className="font-semibold text-navy w-32">{s.date}</div>
                <div className="flex-1 text-ink/80 capitalize">
                  {s.shift_type.replace("_", " ")}
                  {s.start_time && s.end_time ? ` — ${s.start_time}–${s.end_time}` : ""}
                </div>
                <button
                  onClick={() => handleDelete(s.date)}
                  className="text-xs font-semibold text-rose hover:underline"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
