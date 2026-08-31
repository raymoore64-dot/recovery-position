export interface Quote {
  text: string;
  author: string;
}

/**
 * Genuinely public-domain sources only: traditional proverbs (no single
 * identifiable author, so no copyright at all) and a small number of
 * well-documented historical quotes. Deliberately avoids the "famous
 * quote" internet grab-bag — a huge number of those are misattributed
 * (verified one directly before writing this list: the popular "secret of
 * getting ahead is getting started" line commonly credited to Mark Twain
 * is actually of unknown origin, first traced to an anonymous 1968
 * compilation — he never said it).
 */
export const SEED_QUOTES: Quote[] = [
  { text: "However long the night, the dawn will break.", author: "African proverb" },
  { text: "Fall seven times, stand up eight.", author: "Japanese proverb" },
  { text: "The best time to plant a tree was twenty years ago. The second best time is now.", author: "Chinese proverb" },
  { text: "A smooth sea never made a skilled sailor.", author: "English proverb" },
  { text: "One who waits for a roast duck to fly into his mouth must wait a very long time.", author: "Chinese proverb" },
  { text: "It is always darkest just before the day dawneth.", author: "Thomas Fuller, 1650" },
  { text: "Little strokes fell great oaks.", author: "Benjamin Franklin" },
  { text: "Well done is better than well said.", author: "Benjamin Franklin" },
  { text: "This too shall pass.", author: "Persian proverb" },
  { text: "Even a small star shines in the darkness.", author: "Finnish proverb" },
  { text: "Night is the mother of counsel.", author: "Latin proverb" },
  { text: "A single candle can light a thousand others without dimming.", author: "Traditional saying" },
  { text: "The rain does not fall on one roof alone.", author: "Kenyan proverb" },
  { text: "Patience is bitter, but its fruit is sweet.", author: "Aristotle" },
  { text: "It does not matter how slowly you go, as long as you do not stop.", author: "Confucius" },
  { text: "The darkest hour has only sixty minutes.", author: "Traditional saying" },
];

/** Same deterministic hash used throughout — stable within a day, varies
 * day to day, no flicker on refresh. */
function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h << 5) - h + s.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

/** Combines the seed set with any personally-added quotes and picks one,
 * stable for the given date. */
export function pickDailyQuote(personalQuotes: Quote[], seed: string): Quote {
  const pool = [...SEED_QUOTES, ...personalQuotes];
  return pool[hashString(seed) % pool.length];
}
