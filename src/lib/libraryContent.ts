export type LibraryTag = "night" | "day" | "off" | "recovering" | "low-energy";

export interface LibraryTool {
  type: "timer";
  minutes: number;
  label: string;
}

export interface LibraryEntry {
  title: string;
  hook: string;
  how: string[];
  why: string;
  bestFor: string;
  tags: LibraryTag[];
  tool?: LibraryTool;
}

export interface LibraryCategory {
  id: string;
  label: string;
  intro: string;
  entries: LibraryEntry[];
}

export const LIBRARY: LibraryCategory[] = [
  {
    id: "sleep",
    label: "Sleep Techniques",
    intro:
      "Beyond \"have an early night\" — which is the \"have you tried turning it off and on again\" of sleep advice. Actual techniques for when your body insists it's the wrong time of day.",
    entries: [
      {
        title: "Blackout properly, not approximately",
        hook: "Curtains that let in a grey glow are called \"curtains,\" not \"blackout curtains.\" Your body notices the difference even if you don't.",
        how: [
          "Use blackout blinds or thick curtains with no gaps at the edges.",
          "No blinds? Tape aluminium foil over the window — cheap, ugly, extremely effective.",
          "Cover small light sources too — chargers, standby lights, the gap under the door.",
        ],
        why: "Daytime sleep is already fighting your body's natural light-driven wake signal. Even small amounts of light reaching the eyes can suppress melatonin and lighten sleep.",
        bestFor: "Anyone sleeping during daylight hours",
        tags: ["night"],
      },
      {
        title: "The 20-minute rule",
        hook: "Lying there willing yourself to sleep has never once worked, for anyone, in the history of humanity. Try this instead.",
        how: [
          "If sleep hasn't come after roughly 20 minutes, get out of bed.",
          "Do something dull in low light — no phone, no bright rooms.",
          "Go back only when you're genuinely drowsy, not just tired of lying there.",
        ],
        why: "Lying awake and frustrated trains your brain to associate bed with wakefulness and stress — this is one of the core techniques used in CBT for insomnia.",
        bestFor: "Nights when your brain won't switch off",
        tags: ["night", "recovering"],
        tool: { type: "timer", minutes: 20, label: "Give it 20 minutes" },
      },
      {
        title: "Wind-down that isn't your phone",
        hook: "Scrolling feels like rest. Your brain, tragically, disagrees.",
        how: [
          "Pick one low-stimulation activity for the 20–30 minutes before you try to sleep.",
          "A boring podcast, a paper book, or just sitting with a drink all work.",
          "Keep the screen off — even \"night mode\" doesn't remove the alerting effect.",
        ],
        why: "Screens keep your brain in an alert, scrolling state right when you want it winding down — the stimulation matters more than the content.",
        bestFor: "After any shift, before sleep",
        tags: ["night", "day"],
      },
      {
        title: "Consistent anchor sleep",
        hook: "Your roster is chaos. One small, stubborn island of consistency in it goes a long way.",
        how: [
          "Pick one block of your sleep — even just 4–5 hours — and try to keep it at the same clock time daily, rotation permitting.",
          "Let the rest of your sleep shift around your roster; the anchor block is what matters most.",
        ],
        why: "A completely chaotic sleep schedule confuses your circadian clock more than a rotating one with at least one stable anchor point.",
        bestFor: "Rotating rosters with no fixed pattern",
        tags: ["night", "day", "off"],
      },
      {
        title: "Cool the room down, not just dark",
        hook: "Daytime sleep is already an uphill battle. Don't also make your body do it in a sauna.",
        how: [
          "Aim a couple of degrees cooler than what feels normal for night sleep.",
          "A fan or AC timed to your sleep window helps more than most people expect.",
        ],
        why: "Your core temperature naturally drops to initiate sleep. Daytime sleep fights the ambient warmth of the day, so a cooler room helps compensate.",
        bestFor: "Daytime sleep, especially in a warm climate",
        tags: ["night"],
      },
    ],
  },
  {
    id: "relaxation",
    label: "Relaxation Methods From Around the World",
    intro:
      "Different kinds of tired need different kinds of fixes. A world tour of techniques from places that have been doing exhausting, unnatural things to their sleep schedules for centuries — sometimes on purpose.",
    entries: [
      {
        title: "Shinrin-yoku (Japan) — forest bathing",
        hook: "Not a hike. Not exercise. Just standing near a tree with intent.",
        how: [
          "Find any green space — a park is enough, it doesn't need to be a forest.",
          "Walk slowly, no destination, no phone.",
          "Deliberately notice smells, sounds, and textures rather than just passing through.",
        ],
        why: "Research on shinrin-yoku has found measurable drops in cortisol and blood pressure after even short sessions — the slow, sensory attention seems to matter more than the exercise itself.",
        bestFor: "A good day off, not a recovery day",
        tags: ["off"],
      },
      {
        title: "Hygge (Denmark) — deliberate cosiness",
        hook: "Denmark has some of the darkest winters in Europe and somehow keeps winning happiness rankings. They know something.",
        how: [
          "Warm light instead of harsh overheads — a lamp, not the main light.",
          "Blankets, warm drinks, slow evenings — treat comfort as the point, not a consolation prize.",
        ],
        why: "Leaning into warmth and comfort rather than fighting the dark or the tiredness seems to matter more than trying to power through it.",
        bestFor: "Dark early mornings after a night shift",
        tags: ["night", "recovering"],
      },
      {
        title: "Onsen culture (Japan) — the hot soak as ritual",
        hook: "Not just a bath. A deliberate, unmissable full stop at the end of a sentence your shift wouldn't otherwise let you finish.",
        how: [
          "A proper soak, not a quick shower — 15–20 minutes if you can.",
          "Treat it as marking the end of \"on shift\", not just hygiene.",
        ],
        why: "A deliberate transition ritual helps your brain register that one part of the day has genuinely ended — useful when shift work blurs every boundary between them.",
        bestFor: "Straight after a night shift, before sleep",
        tags: ["night"],
        tool: { type: "timer", minutes: 15, label: "Soak timer" },
      },
      {
        title: "Siesta (Spain/Mediterranean) — permission to nap",
        hook: "An entire coastline of Europe has agreed, for centuries, that napping is simply correct.",
        how: [
          "Keep it to 20 minutes, not two hours — set an alarm.",
          "Early-to-mid afternoon works best if your roster allows it.",
        ],
        why: "A short nap avoids the deep sleep stages that leave you groggier than before — the difference between a nap that helps and one that wrecks the rest of your day.",
        bestFor: "A slow afternoon before a night shift",
        tags: ["night"],
        tool: { type: "timer", minutes: 20, label: "Nap timer" },
      },
      {
        title: "Sisu (Finland) — quiet resilience, not forced positivity",
        hook: "The Finns have a word for getting through something grim without pretending to enjoy it. Borrow it.",
        how: [
          "Don't perform being fine.",
          "Get through the hard shift without needing to feel good about it — steady is enough.",
        ],
        why: "Sisu is specifically not toxic positivity — it's persistence without the pressure to feel good while doing it, which tends to be more sustainable.",
        bestFor: "The shifts that are just hard",
        tags: ["night", "day"],
      },
    ],
  },
  {
    id: "fitness",
    label: "Simple Fitness (No Gym Required)",
    intro:
      "Movement that fits around a rota and doesn't require a gym membership, a class timetable, or main-character energy in leggings.",
    entries: [
      {
        title: "The 10-minute walk, non-negotiable",
        hook: "The one thing on this entire list you have genuinely no excuse for.",
        how: [
          "Before or after a shift, outside if possible.",
          "No target pace, no distance goal — just movement and daylight.",
        ],
        why: "Light exposure plus movement both help reset circadian timing — this is one of the highest-value, lowest-effort things you can do.",
        bestFor: "Every single shift, if you only do one thing",
        tags: ["night", "day", "off"],
        tool: { type: "timer", minutes: 10, label: "Walk timer" },
      },
      {
        title: "Locker-room stretches",
        hook: "Takes less time than checking your phone. Undoes more damage than a 12-hour shift did to your spine.",
        how: [
          "Calves, hamstrings, lower back, neck, shoulders.",
          "30 seconds each, before you even leave the building.",
        ],
        why: "A long shift on your feet accumulates real muscular tension — a few minutes undoes a surprising amount of it.",
        bestFor: "Straight after any long shift",
        tags: ["night"],
        tool: { type: "timer", minutes: 5, label: "Stretch timer" },
      },
      {
        title: "Bodyweight basics at home",
        hook: "Ten minutes, no equipment, no drive, no membership fee, no excuse.",
        how: [
          "Squats, push-ups (wall push-ups count), a plank.",
          "Same simple routine each time — don't reinvent it when you're tired.",
        ],
        why: "Consistency beats intensity for shift workers — a short routine you'll actually repeat beats an ambitious one you'll abandon after a bad week.",
        bestFor: "A High-energy day off",
        tags: ["off"],
      },
      {
        title: "Stairs instead of the lift, deliberately",
        hook: "The lift will still be there tomorrow. Today, be difficult.",
        how: ["Just take them, especially on shift.", "Make it the default, not a decision every time."],
        why: "Small, unplanned movement adds up across a week in a way a single big workout doesn't replace.",
        bestFor: "Any shift, no extra time needed",
        tags: ["night", "day"],
      },
      {
        title: "Match the workout to the energy forecast",
        hook: "A Recovering day measured against a High-energy day is just a way to feel bad on purpose.",
        how: [
          "Save anything demanding for a High-energy day on the Daily Card.",
          "On a Recovering day, a walk is the win — full stop.",
        ],
        why: "Training through genuine fatigue — not just normal tiredness — is where injuries and burnout usually start for shift workers.",
        bestFor: "Every day — this is the meta-rule for all the others",
        tags: ["recovering", "low-energy"],
      },
    ],
  },
  {
    id: "light",
    label: "Light & Screen Management",
    intro:
      "The single most powerful lever on this entire page, and the one almost nobody uses on purpose. Light runs your body clock whether you're paying attention or not.",
    entries: [
      {
        title: "Bright light early in your shift, dim light before sleep",
        hook: "Your circadian clock takes orders from light, not from your calendar. Use that.",
        how: [
          "Get bright light — daylight or a bright lamp — in the first couple of hours of a night shift, to help delay your body clock.",
          "Dim the lights at home in the hour before you plan to sleep, whatever time of day that is.",
        ],
        why: "Using light deliberately can shift your body clock in the direction you actually need, rather than leaving it to fight your roster passively.",
        bestFor: "The first few nights of a night-shift block",
        tags: ["night"],
      },
      {
        title: "Wear sunglasses on the drive home after a night shift",
        hook: "Nothing sabotages a hard night's work quite like driving home and accidentally telling your brain it's time to wake up.",
        how: [
          "Put them on before you leave the building, not just when the sun feels bright.",
          "Wraparound styles block more of the peripheral light that still gets through.",
        ],
        why: "Morning sunlight hitting your eyes is one of the strongest \"be awake now\" signals there is — the opposite of what you want right before sleep.",
        bestFor: "Every drive home after a night shift",
        tags: ["night"],
      },
      {
        title: "Warm, dim lighting for the last hour before sleep",
        hook: "Blue light says \"it's go time.\" Amber light says \"we're done here.\" Choose your ending.",
        how: [
          "Switch off overhead lights; use a lamp instead.",
          "Smart bulbs on a warm/amber setting help more than brightness control alone.",
        ],
        why: "Blue-heavy light in the evening suppresses melatonin more than warm light at the same brightness.",
        bestFor: "The wind-down hour before any sleep, day or night",
        tags: ["night", "day"],
      },
      {
        title: "A blue-light filter isn't a substitute for actually dimming down",
        hook: "Night mode is a participation trophy. The brightness and the scrolling are still winning.",
        how: [
          "Use night mode as a small help, not the whole solution.",
          "The real fix is turning things off or down, not just changing their colour.",
        ],
        why: "Blue-light filters reduce one part of the alerting signal, but brightness and content — the scrolling itself — still keep your brain engaged regardless of colour temperature.",
        bestFor: "Anyone who assumes night mode alone is enough",
        tags: ["night", "day"],
      },
    ],
  },
  {
    id: "eating",
    label: "Eating on an Irregular Schedule",
    intro: "Your stomach didn't get the memo about your roster either. It's still expecting a normal day.",
    entries: [
      {
        title: "Eat your main meal before a night shift, not during it",
        hook: "Your gut is not built for a three-course meal at 2am, and it will let you know.",
        how: [
          "Have a proper meal in the few hours before you start a night shift.",
          "Keep what you eat during the shift lighter — snacks, something easy to digest.",
        ],
        why: "Eating a heavy meal in the middle of the night, when your body isn't primed for it, is linked to more digestive discomfort and a worse blood sugar response.",
        bestFor: "Every night shift",
        tags: ["night"],
      },
      {
        title: "Keep a consistent \"first meal\" time where you can",
        hook: "The clock time can do whatever it wants. Your own personal \"morning\" should stay put.",
        how: [
          "Anchor your first meal after waking to a consistent point in your own day, whatever that clock-time actually is.",
        ],
        why: "A consistent eating pattern relative to your own schedule helps stabilise metabolism even when the actual clock time varies wildly.",
        bestFor: "Rotating rosters",
        tags: ["night", "day", "off"],
      },
      {
        title: "Caffeine has a longer tail than it feels like",
        hook: "The gap between \"wired\" and \"exhausted\" is smaller than you think, and caffeine is usually the reason you're stuck in it.",
        how: [
          "Work back from your planned sleep time and stop roughly 8 hours before.",
          "Check the Daily Card's caffeine cutoff — it's already calculated for today's shift.",
        ],
        why: "Caffeine's half-life is around 5–6 hours for most people, meaning a decent chunk is still active in your system 8+ hours after your last cup.",
        bestFor: "Every shift",
        tags: ["night", "day"],
      },
      {
        title: "Hydrate deliberately, not just when thirsty",
        hook: "By the time you're actually thirsty on a 12-hour shift, you're already behind.",
        how: [
          "Keep water visibly nearby — out of sight often means out of mind on nights.",
          "If disrupted sleep from bathroom trips is an issue, taper (don't eliminate) fluids in the last hour before bed.",
        ],
        why: "Mild dehydration alone can worsen fatigue and concentration — an easy thing to overlook mid-shift.",
        bestFor: "Every shift",
        tags: ["night", "day"],
      },
    ],
  },
  {
    id: "connection",
    label: "Staying Connected",
    intro: "Nobody dramatically dumps a shift worker. They just quietly stop inviting you. Worth noticing before it happens.",
    entries: [
      {
        title: "Protect one recurring commitment, even a small one",
        hook: "One small, unmissable thing beats a dozen good intentions you keep cancelling.",
        how: [
          "Pick one regular thing — a weekly call, a standing coffee, a school pickup — and defend it against the roster where you can.",
        ],
        why: "The real cost of shift work is often the slow erosion of small, regular contact, not the big missed events — one protected anchor point counters that.",
        bestFor: "Ongoing, roster-independent",
        tags: ["off"],
      },
      {
        title: "Tell people your actual pattern, not just \"I work shifts\"",
        hook: "\"I work shifts\" tells people nothing. It just sounds like a polite way of saying no forever.",
        how: [
          "Share your actual roster with the people closest to you, not just a vague \"I'm on shifts.\"",
        ],
        why: "People stop inviting someone who's \"always working\", even when that's not literally true — specificity keeps you in the loop.",
        bestFor: "Family and close friends",
        tags: ["off"],
      },
      {
        title: "Use your best day, not just your day off",
        hook: "Not all days off are created equal, and treating them like they are is how good days off go to waste on laundry.",
        how: [
          "Check the Daily Card's \"Best day\" flag rather than defaulting to the first day off in the week.",
          "Save a later, genuinely-rested day off for people, not chores.",
        ],
        why: "The app already calculates which day off is genuinely available for you, not just technically off — worth using on purpose.",
        bestFor: "Planning time with people, not errands",
        tags: ["off"],
      },
      {
        title: "Isolation compounds — notice it earlier, not later",
        hook: "It rarely feels like isolation while it's happening. It just feels like being tired and having plans fall through, repeatedly.",
        how: [
          "If weeks have gone by without seeing anyone outside work, treat that as a signal, not just a busy patch.",
        ],
        why: "Shift work is a known risk factor for social isolation, which affects both mental and physical health — worth taking seriously rather than dismissing as \"just the job.\"",
        bestFor: "Ongoing self-check",
        tags: ["off", "recovering"],
      },
    ],
  },
];

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h << 5) - h + s.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

export interface FeaturedEntry {
  categoryId: string;
  categoryLabel: string;
  entry: LibraryEntry;
}

export function featuredFor(contextTags: LibraryTag[], seed: string): FeaturedEntry | null {
  const candidates: FeaturedEntry[] = [];
  for (const cat of LIBRARY) {
    for (const entry of cat.entries) {
      if (entry.tags.some((t) => contextTags.includes(t))) {
        candidates.push({ categoryId: cat.id, categoryLabel: cat.label, entry });
      }
    }
  }
  if (candidates.length === 0) return null;
  return candidates[hashString(seed) % candidates.length];
}

/** All entries flattened with their category, for the "Surprise me"
 * shuffle — genuinely random each click, not date-seeded, since the whole
 * point is spontaneity rather than stability. */
export function allEntriesFlat(): FeaturedEntry[] {
  const out: FeaturedEntry[] = [];
  for (const cat of LIBRARY) {
    for (const entry of cat.entries) {
      out.push({ categoryId: cat.id, categoryLabel: cat.label, entry });
    }
  }
  return out;
}
