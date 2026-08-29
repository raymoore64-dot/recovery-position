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
`);

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
