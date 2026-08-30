#!/usr/bin/env bash
# run-quiet.sh — runs a command, shows only what actually matters.
#
# Usage:
#   ./scripts/run-quiet.sh npm install
#   ./scripts/run-quiet.sh npm run build
#   ./scripts/run-quiet.sh npm run dev -- -p 8811
#
# On success: prints a one-line confirmation plus any "added N packages" /
# version / "Compiled successfully" style summary line — the part you'd
# actually want to paste to confirm something worked.
#
# On failure: prints the exit code plus only the lines that look like
# errors, instead of the whole log. If nothing matches (rare), it falls
# back to printing everything, so you're never left with zero information.

set -uo pipefail

if [ "$#" -eq 0 ]; then
  echo "Usage: $0 <command> [args...]"
  exit 1
fi

LOG="$(mktemp)"
trap 'rm -f "$LOG"' EXIT

"$@" > "$LOG" 2>&1
STATUS=$?

# Lines worth keeping on a successful run: package counts, version
# banners, "Compiled successfully", etc. Adjust this pattern if a
# particular tool's success output looks different.
SUMMARY="$(grep -iE '^(added|removed|changed) [0-9]+ package|@[0-9]+\.[0-9]+\.[0-9]+|compiled successfully|^✓|^▲' "$LOG" | tail -6 || true)"

# Lines worth keeping on a failed run.
ERRORS="$(grep -iE 'error|failed|cannot|cannot find|not found|EADDRINUSE|ENOENT' "$LOG" || true)"

if [ "$STATUS" -eq 0 ]; then
  echo "✅ SUCCESS: $*"
  if [ -n "$SUMMARY" ]; then
    echo "$SUMMARY"
  fi
else
  echo "❌ FAILED (exit $STATUS): $*"
  if [ -n "$ERRORS" ]; then
    echo "$ERRORS"
  else
    echo "— no obvious error lines matched, showing full output —"
    cat "$LOG"
  fi
fi

exit "$STATUS"
