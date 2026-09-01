export const LOGO_MESSAGES: string[] = [
  "You're beautiful. This isn't up for debate.",
  "The world is yours. Try not to break it before your next shift.",
  "You kept people safe last night. That matters more than you let yourself think.",
  "Forty-two years. That's not nothing. That's everything.",
  "Congratulations on being conscious. Genuinely, well done.",
  "Somewhere, someone is glad you exist. Possibly several someones.",
  "You've done harder things than today. You'll do this too.",
  "You're allowed to be proud of this.",
  "Yes, you're tired. Also yes, you're doing brilliantly. Both are true.",
  "You are doing an absurd job at an absurd hour and nobody claps enough. This is a small clap.",
  "The world is better with you awake in it. Even at 3am.",
  "You're the reason someone's night wasn't worse.",
  "Objectively excellent. Subjectively, also excellent.",
  "Go on then. Be brilliant today. No pressure.",
  "You're loved, you're tired, and you're going to be okay. Roughly in that order.",
  "This app exists because someone thought your life was worth building something for. That someone was right.",
  "Whatever tonight throws at you, you've survived worse.",
  "You are, against all odds and several night shifts, still lovely.",
];

/** Picks a random message, avoiding an immediate repeat of the last one
 * shown so two taps in a row don't feel like a broken slot machine. */
export function pickLogoMessage(lastMessage: string | null): string {
  if (LOGO_MESSAGES.length <= 1) return LOGO_MESSAGES[0];
  let candidate: string;
  do {
    candidate = LOGO_MESSAGES[Math.floor(Math.random() * LOGO_MESSAGES.length)];
  } while (candidate === lastMessage);
  return candidate;
}
