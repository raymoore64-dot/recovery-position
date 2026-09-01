import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

// Keep the database file in /data so it's easy to find, back up, or gitignore.
const dataDir = path.join(process.cwd(), "data");
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, "recovery-position.db");

// A single shared connection. better-sqlite3 is synchronous, so there's
// no pooling to worry about for a single-user local app like this one.
const db = new Database(dbPath);
db.pragma("journal_mode = WAL");

db.exec(`
  CREATE TABLE IF NOT EXISTS shifts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL,        -- ISO date, e.g. "2026-08-29"
    shift_type TEXT NOT NULL,  -- 'day' | 'night' | 'long_day' | 'off'
    start_time TEXT,           -- 'HH:MM', null if off
    end_time TEXT,             -- 'HH:MM', null if off
    notes TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE UNIQUE INDEX IF NOT EXISTS idx_shifts_date ON shifts(date);

  CREATE TABLE IF NOT EXISTS tracks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    filename TEXT NOT NULL,     -- expected at /public/audio/<filename>
    category TEXT NOT NULL,     -- 'wind-down' | 'sleep' | 'relaxation' | 'energize'
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS certifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    expiry_date TEXT NOT NULL,  -- ISO date, e.g. "2027-03-14"
    notes TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS personal_quotes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    text TEXT NOT NULL,
    author TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS share_links (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    token TEXT NOT NULL UNIQUE,
    label TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS medications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    times TEXT NOT NULL,
    notes TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

// Migration: "source" distinguishes curated tracks (yours) from tracks
// anyone else uploads, so the two can display as separate sections. This
// runs as a migration rather than being in the CREATE TABLE above because
// databases created before this feature existed already have a `tracks`
// table without this column — SQLite has no "ADD COLUMN IF NOT EXISTS",
// so the safe pattern is: try to add it, ignore the error if it's already
// there.
try {
  db.exec(`ALTER TABLE tracks ADD COLUMN source TEXT NOT NULL DEFAULT 'upload'
  CREATE TABLE IF NOT EXISTS vitals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL,
    systolic INTEGER,
    diastolic INTEGER,
    heart_rate INTEGER,
    weight REAL,
    notes TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS checklist_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    label TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);
} catch {
  // Column already exists — nothing to do.
}

export default db;

export type ShiftType = "day" | "night" | "long_day" | "off";

export interface Shift {
  id: number;
  date: string;
  shift_type: ShiftType;
  start_time: string | null;
  end_time: string | null;
  notes: string | null;
  created_at: string;
}

export type AudioCategory = "wind-down" | "sleep" | "relaxation" | "energize";
export type TrackSource = "collection" | "upload";

export interface Track {
  id: number;
  title: string;
  filename: string;
  category: AudioCategory;
  source: TrackSource;
  created_at: string;
}

export interface Certification {
  id: number;
  name: string;
  expiry_date: string;
  notes: string | null;
  created_at: string;
}

export interface PersonalQuote {
  id: number;
  text: string;
  author: string;
  created_at: string;
}

export interface ShareLink {
  id: number;
  token: string;
  label: string | null;
  created_at: string;
}

export interface Medication {
  id: number;
  name: string;
  times: string;
  notes: string | null;
  created_at: string;
}

export interface Vitals {
  id: number;
  date: string;
  systolic: number | null;
  diastolic: number | null;
  heart_rate: number | null;
  weight: number | null;
  notes: string | null;
  created_at: string;
}

export interface ChecklistItem {
  id: number;
  label: string;
  created_at: string;
}
