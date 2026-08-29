# The Recovery Position

Your roster, your whole life. A shift-worker planning app: enter your roster
once, get a daily plan for sleep, caffeine, energy, and which days are
actually worth booking for family, errands, or a life.

This is the v1 MVP scope from the build plan — roster entry, the Daily Card,
and the best-days logic. Leave planning, the rest & recovery library, and
the quiet-AI roster scanning are the next layers to build on top of this.

## Requirements

- Node.js 18.18+ (LTS recommended — see nvm instructions below)
- Linux, macOS, or WSL

## Getting started

```bash
# 1. Install dependencies
npm install

# 2. Run the dev server
npm run dev
```

Open http://localhost:3000 — you'll land on the Daily Card, which will say
"No shift logged" until you add your first shift at /roster.

## How it's built

- **Next.js (App Router)** — same framework family as QualityPulse
- **better-sqlite3** — a single local file at `data/recovery-position.db`,
  created automatically on first run. No setup, no server to configure.
- **Tailwind v4** — brand colours and fonts are wired up in
  `src/app/globals.css` under `@theme inline`. Utility classes like
  `bg-navy`, `text-amber-deep`, `bg-sage` are generated from those tokens.

## Project layout

```
src/
  app/
    page.tsx              → Daily Card (today's shift + next 7 days)
    roster/page.tsx        → shift entry form + list
    api/shifts/route.ts    → GET / POST (upsert) / DELETE for shifts
    layout.tsx             → header/nav, brand fonts
    globals.css            → brand palette + typography tokens
  lib/
    db.ts                  → SQLite connection + schema
    schedule.ts            → sleep window / caffeine cutoff / energy /
                              best-day logic — this is the file to edit
                              as you tune the recommendations
public/
  fonts/                   → Fraunces + Work Sans (brand typefaces)
  icon.svg                 → the recovery-position mark
data/
  recovery-position.db     → created on first run, gitignored
```

## The scheduling logic

All of it lives in `src/lib/schedule.ts`, deliberately kept as small pure
functions so you can tune the heuristics without touching any UI code:

- `sleepWindowFor(shift)` — night shifts get a 90-minute wind-down after
  clocking off, then a 7-hour sleep block. Day/long-day shifts sleep the
  night before, with a 60-minute buffer before the shift starts.
- `caffeineCutoffFor(sleepWindow)` — 8 hours before the recommended sleep
  start.
- `energyFor(...)` — a simple heuristic based on consecutive night shifts
  and whether a day off follows a night run ("Recovering" vs "High").
- `markBestDays(...)` — flags an off-day as a "best day" unless it's
  sandwiched between two working shifts, or it's a recovery day right
  after nights.

These are starting heuristics based on general shift-work advice, not a
clinical model — the plan is to refine them against how your own roster
actually behaves once you're using it day to day.

## Next steps (not yet built)

- **Leave Planner** — surfacing which leave dates give a genuinely
  recovered stretch, not just days that look free on the calendar
- **Rest & Recovery Library** — the sleep techniques / relaxation methods
  / simple fitness content
- **Quiet AI roster scanning** — photograph a rota, have it parsed into
  shifts automatically instead of manual entry
- **Fatigue trends** — charting energy/recovery over weeks, once there's
  enough real data logged to make it meaningful

## A note on the scheduling heuristics

`buildPlan()` currently assumes one shift per day and a fairly simple
day/night/long-day/off model. If your real rota has split shifts, on-call
blocks, or unusual rotations, that's the function to extend — the `Shift`
type in `db.ts` is deliberately minimal so it's easy to add fields
(e.g. `on_call: boolean`) without restructuring anything else.
