// Server-only. Uses your own Anthropic API key (set in .env.local) to read
// a photo of a roster and turn it into structured shifts. This file must
// never be imported from a "use client" component — it belongs behind the
// API route in app/api/roster/parse/route.ts.

export interface ParsedShift {
  date: string; // YYYY-MM-DD
  shift_type: "day" | "night" | "long_day" | "off";
  start_time: string | null; // HH:MM 24hr
  end_time: string | null;
}

const SYSTEM_PROMPT = `You read photographs of shift-work rosters/rotas and convert them into structured data.

Respond with ONLY a JSON array, no other text, no markdown code fences. Each element must be:
{"date": "YYYY-MM-DD", "shift_type": "day" | "night" | "long_day" | "off", "start_time": "HH:MM" or null, "end_time": "HH:MM" or null}

Rules:
- "night" is any shift that starts in the evening and ends the next morning.
- "long_day" is a day shift noticeably longer than a standard ~12 hour day (e.g. 13+ hours).
- "off" shifts must have start_time and end_time set to null.
- If the image doesn't show a year, use the reference date supplied in the user message to infer it.
- If a cell is ambiguous or illegible, make your best reasonable guess rather than omitting the date — every date visible in the roster should appear exactly once in the output.
- Output strictly valid JSON. No commentary, no trailing commas, no markdown.`;

export async function parseRosterImage(
  base64Image: string,
  mediaType: string,
  referenceDateISO: string
): Promise<ParsedShift[]> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error(
      "ANTHROPIC_API_KEY is not set. Add it to .env.local and restart the dev server — see README for how to get one."
    );
  }
  const model = process.env.ANTHROPIC_MODEL || "claude-sonnet-5";

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model,
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: { type: "base64", media_type: mediaType, data: base64Image },
            },
            {
              type: "text",
              text: `Reference date (today, or the date this roster was uploaded): ${referenceDateISO}. Use this to infer the year if the roster doesn't show one. Extract every shift visible in this roster photo.`,
            },
          ],
        },
      ],
    }),
  });

  if (!response.ok) {
    const errBody = await response.text();
    throw new Error(`Anthropic API error (${response.status}): ${errBody}`);
  }

  const data = await response.json();
  const textBlock = data.content?.find((b: { type: string }) => b.type === "text");
  if (!textBlock) {
    throw new Error("No text content returned from the API.");
  }

  return extractShiftsJSON(textBlock.text);
}

/**
 * Models occasionally wrap JSON in markdown fences or add a stray sentence
 * despite instructions not to — this pulls out the first JSON array found
 * rather than failing outright on strict JSON.parse of the whole string.
 */
function extractShiftsJSON(text: string): ParsedShift[] {
  const trimmed = text.trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    const match = trimmed.match(/\[[\s\S]*\]/);
    if (match) {
      return JSON.parse(match[0]);
    }
    throw new Error("Could not parse a shift list from the model's response.");
  }
}
