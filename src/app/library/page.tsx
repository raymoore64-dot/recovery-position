import { ReactNode } from "react";

interface Entry {
  title: string;
  body: string;
}

interface Category {
  id: string;
  label: string;
  intro: string;
  entries: Entry[];
}

const CATEGORIES: Category[] = [
  {
    id: "sleep",
    label: "Sleep Techniques",
    intro:
      "Beyond \"have an early night\" — actual techniques for sleeping when your body thinks it's the wrong time of day.",
    entries: [
      {
        title: "Blackout properly, not approximately",
        body: "Curtains that let in a grey glow aren't blackout curtains. Blackout blinds, or even taping foil over the gaps, make a bigger difference to day-sleep than almost anything else on this list.",
      },
      {
        title: "The 20-minute rule",
        body: "If you're not asleep after 20 minutes, get up, do something dull in low light, and go back when you're actually drowsy. Lying there getting frustrated trains your brain to associate bed with being awake — the opposite of what you want.",
      },
      {
        title: "Wind-down that isn't your phone",
        body: "Scrolling after a night shift feels like rest but keeps your brain switched on. A boring podcast, a paper book, or just sitting with a cup of something — anything that isn't a screen — actually helps you drop off faster.",
      },
      {
        title: "Consistent anchor sleep",
        body: "Even across a rotating rota, try to keep one block of sleep at roughly the same clock time each day if you can — it gives your body something stable to hold onto rather than resetting from scratch every shift.",
      },
      {
        title: "Cool the room down, not just dark",
        body: "Daytime sleep fights your body's natural temperature rhythm. A slightly cooler room than you'd use at night helps compensate — most people sleep better a couple of degrees cooler than feels intuitive.",
      },
    ],
  },
  {
    id: "relaxation",
    label: "Relaxation Methods From Around the World",
    intro:
      "Different kinds of tired need different kinds of fixes. A few borrowed from places that have been doing shift work — or something like it — for a very long time.",
    entries: [
      {
        title: "Shinrin-yoku (Japan) — forest bathing",
        body: "Not a hike, not exercise — just slow, deliberate time outdoors among trees, paying attention to what you can see, hear, and smell. Even 15 minutes in a park on a day off measurably lowers stress hormones.",
      },
      {
        title: "Hygge (Denmark) — deliberate cosiness",
        body: "Denmark has some of the darkest, coldest winters in Europe and some of the highest wellbeing scores. The trick isn't fighting the dark — it's leaning into warm light, blankets, and slow evenings instead of trying to power through.",
      },
      {
        title: "Onsen culture (Japan) — the hot soak as ritual",
        body: "Not just a bath — a proper soak treated as a deliberate transition between one part of the day and the next. Used well, it can mark the boundary between \"off shift\" and \"actually off\" in your head, not just your body.",
      },
      {
        title: "Siesta (Spain/Mediterranean) — permission to nap",
        body: "A short nap (20 minutes, not two hours) mid-afternoon is culturally normal across much of the Mediterranean, not a sign of laziness. If your rota allows it, a genuine short nap beats pushing through on caffeine.",
      },
      {
        title: "Sisu (Finland) — quiet resilience, not forced positivity",
        body: "Sisu is about steady, unglamorous persistence — not toxic positivity, not forcing a smile. Some shifts are just hard. Getting through it without pretending it was fine is its own kind of strength.",
      },
    ],
  },
  {
    id: "fitness",
    label: "Simple Fitness (No Gym Required)",
    intro:
      "Movement that fits around a rota and doesn't need a gym membership, a class timetable, or main-character energy in leggings.",
    entries: [
      {
        title: "The 10-minute walk, non-negotiable",
        body: "Before or after a shift, a short outdoor walk does more for mood and alertness than most people expect — and it's the easiest thing on this list to actually keep doing long-term.",
      },
      {
        title: "Locker-room stretches",
        body: "Calves, hamstrings, lower back, neck and shoulders — five stretches, thirty seconds each, done before you even leave work. Takes less time than checking your phone and undoes a lot of a 12-hour shift.",
      },
      {
        title: "Bodyweight basics at home",
        body: "Squats, push-ups (or wall push-ups), and a plank — ten minutes, no equipment, no drive to a gym. Consistency beats intensity, especially when your energy varies wildly by shift.",
      },
      {
        title: "Stairs instead of the lift, deliberately",
        body: "Not a big claim — just an easy way to bank a bit of movement on a day when a proper workout isn't realistic.",
      },
      {
        title: "Match the workout to the energy forecast",
        body: "Save anything demanding for a High-energy day on the Daily Card. On a Recovering day, a walk is a win — don't measure it against what you could do on a good day.",
      },
    ],
  },
];

function SectionIcon({ id }: { id: string }): ReactNode {
  const common = "w-6 h-6";
  if (id === "sleep") {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={common}>
        <path
          d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  if (id === "relaxation") {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={common}>
        <path
          d="M12 21c4-2 7-5.5 7-9.5A6 6 0 0 0 12 5a6 6 0 0 0-7 6.5C5 15.5 8 19 12 21Z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <path d="M12 21V11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" fill="none" className={common}>
      <circle cx="12" cy="5" r="2" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M12 7v5m0 0-4 3m4-3 4 3m-4-3v7"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function LibraryPage() {
  return (
    <div className="space-y-10">
      <div>
        <p className="text-xs font-bold tracking-widest uppercase text-amber-deep mb-2">
          Rest &amp; Recovery Library
        </p>
        <h1 style={{ fontFamily: "var(--font-display-semibold)" }} className="text-2xl text-ink mb-2">
          Forty years of actually needing this.
        </h1>
        <p className="text-sm text-ink/70 max-w-xl">
          None of this is a substitute for a proper night's sleep. It's what's left in the gaps
          — the days your rota gives you, used a bit better.
        </p>
      </div>

      {CATEGORIES.map((cat) => (
        <section key={cat.id}>
          <div className="flex items-center gap-3 mb-2 text-ink">
            <SectionIcon id={cat.id} />
            <h2 style={{ fontFamily: "var(--font-display-semibold)" }} className="text-lg">
              {cat.label}
            </h2>
          </div>
          <p className="text-sm text-ink/70 mb-4 max-w-xl">{cat.intro}</p>
          <div className="space-y-3">
            {cat.entries.map((entry) => (
              <div key={entry.title} className="bg-cream rounded-lg p-4">
                <div className="font-semibold text-ink text-sm mb-1">{entry.title}</div>
                <p className="text-sm text-ink/75">{entry.body}</p>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
