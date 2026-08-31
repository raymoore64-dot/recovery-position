import { DayPlan } from "./schedule";

/** The Daily Card's voice for any working shift — day, night, or long day.
 * Almost all of these land regardless of which specific shift you're on,
 * so rather than split hairs over which line "belongs" to nights versus
 * days, they share one large pool. */
const ON_SHIFT_QUIPS = [
  "You may not have slept enough to operate a toaster, yet somehow you're trusted with people. Respect.",
  "Somewhere between \"I'm fine\" and \"who moved the trolley?\" lies professional competence.",
  "Your shift may be twelve hours long, but your ability to complain about it is apparently unlimited.",
  "You don't need to conquer the day. Just get through the next cup of coffee without becoming a disciplinary issue.",
  "Night shift: because apparently daylight was an unnecessary luxury.",
  "You came in tired. You leave tired. Somewhere in between, you made a difference. Annoyingly impressive.",
  "There are easier jobs. There are also jobs where nobody notices when you disappear.",
  "Your circadian rhythm has formally resigned. Your professionalism has not.",
  "Some days the achievement is saving a life. Some days it's finding the missing scissors. Both require investigation.",
  "You are allowed to be exhausted and excellent at the same time.",
  "Healthcare: where \"quiet night\" is considered an act of dangerous optimism.",
  "Never underestimate the therapeutic value of a five-minute sit-down that accidentally lasts seven.",
  "You don't need superhero powers. You need decent shoes and the ability to locate things other people swear they didn't move.",
  "Your brain may be running on 3%. Fortunately, experience has an excellent backup system.",
  "A good shift isn't necessarily a happy shift. Sometimes it's simply one that eventually ends.",
  "You haven't lost your mind. You temporarily misplaced it somewhere between handover and the medication round.",
  "The human body remains astonishing. So does the number of ways a human can break a piece of equipment.",
  "You are part clinician, part detective, part negotiator and occasionally part furniture mover.",
  "If competence were visible, healthcare workers would be walking around glowing like badly maintained Christmas trees.",
  "Your shift doesn't have to be brilliant. It just has to contain more good decisions than bad ones.",
  "There is dignity in knowing exactly how much coffee fits into a break-room mug.",
  "You haven't got everything under control. Nobody does. You just look considerably more convincing than most people.",
  "Somebody today will feel safer because you were there. They may never know your name. That's still worth something.",
  "The night may be long. The paperwork may be longer. Your patience is apparently being tested for scientific purposes.",
  "You are not \"just getting through the shift.\" You are keeping an extraordinarily complicated machine functioning while everyone keeps adding complications.",
  "If today feels chaotic, congratulations: you have successfully entered healthcare.",
  "Your coffee is cold because you are needed. Your lunch is late because you are needed. Your ability to finish a sentence is questionable because you are needed.",
  "Somewhere there is a perfectly organised healthcare department. Nobody knows where it is.",
  "You can be compassionate without being endlessly available. Even rechargeable batteries need charging.",
  "The secret to shift work is accepting that Tuesday may occur at 03:17 on a Sunday.",
  "Your uniform has seen things. Your shoes have seen considerably more.",
  "There is no shame in counting down the hours. There is considerable skill in making the hours count.",
  "Healthcare workers don't need more inspirational speeches. We need working equipment, functioning pens and five uninterrupted minutes.",
  "You are allowed to laugh during a difficult shift. Sometimes laughter is simply the nervous system filing a maintenance request.",
  "Your best today may look completely different from your best on a well-rested day. It still counts.",
  "Never judge a healthcare worker before they've had their first coffee. Or their second.",
  "A shift can be a complete disaster and still contain one moment where you quietly did exactly the right thing. Remember that moment.",
  "You don't have to carry the whole department. There are trolleys specifically designed for that.",
  "If nobody has thanked you today, consider this your official notification that your effort was noticed.",
  "You spend your working life helping people through their worst days. Don't forget to be kind to yourself on yours.",
  "Sometimes professionalism is knowing exactly what you're doing while internally composing a strongly worded resignation letter.",
  "You haven't become emotionally numb. You've developed an extremely sophisticated coping mechanism called \"right, what's next?\"",
  "Shift work teaches you that 06:00 can be either incredibly early or ridiculously late. Sometimes both.",
  "There is a special kind of intelligence required to remember twelve things while doing the thirteenth and being interrupted by the fourteenth.",
  "You are evidence that humans can function on inadequate sleep, questionable cafeteria food and pure stubbornness.",
  "Not every shift deserves a medal. Some deserve a shower, silence and something unnecessarily expensive from the vending machine.",
  "You don't have to love every shift to love what you do.",
  "The fact that you are tired does not mean you are failing. It means you are tired. Science remains undefeated.",
  "Somewhere between the first handover and the final \"see you tomorrow\" is a small army of things you made better.",
  "You know you're experienced when your first response to a crisis is not panic but \"which cupboard is it in?\"",
  "Your job requires precision. Your sleep schedule requires interpretive dance.",
  "There are days when resilience looks inspirational. There are other days when it looks like eating a biscuit in a supply cupboard. Both are valid.",
  "You cannot pour from an empty cup. Fortunately, healthcare workers have been known to refill theirs from a suspiciously strong mug.",
  "One day you'll look back on this shift and remember the funny bits. Hopefully not because they were the only survivable bits.",
  "You don't need to be extraordinary every hour. Being reliably decent for twelve hours is already an extraordinary achievement.",
  "If healthcare has taught you anything, it's that absolutely nothing is ever \"just a quick job.\"",
  "Your shift is not your entire life. It is merely an unusually long paragraph in it.",
  "When everything feels urgent, remember: even the universe occasionally takes fourteen billion years to get things done.",
  "You showed up. You adapted. You solved problems nobody put in your job description. You probably found a missing pen. That's a successful shift.",
  "Go home. Take off the uniform. Become a civilian again. The patients needed the healthcare worker today. Tomorrow, they can wait for the sequel.",
];

const OFF_RECOVERING_QUIPS = [
  "Technically awake. Legally still recovering.",
  "This day doesn't count as a day off. It's admin for your nervous system.",
  "Recovery isn't glamorous, but neither is a night shift, so.",
];

const OFF_BEST_DAY_QUIPS = [
  "Rare sighting: free time. Don't scare it off.",
  "A genuinely good day off. Treat it with the respect it deserves.",
  "This is the day. Not tomorrow's version of this day. This one.",
];

const OFF_QUIPS = [
  "A day off that's actually off. Novel concept.",
  "Nothing rostered. Suspicious, but enjoy it.",
];

/** Simple deterministic string hash, so the same date+context always
 * picks the same quip — no flicker on refresh, but it changes day to day. */
function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h << 5) - h + s.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

function pick(bank: string[], seed: string): string {
  return bank[hashString(seed) % bank.length];
}

/** Picks a quip for the Daily Card, based on today's shift and context. */
export function quipFor(plan: DayPlan): string {
  const seed = plan.date;

  if (!plan.shift || plan.shift.shift_type === "off") {
    if (plan.isBestDay) return pick(OFF_BEST_DAY_QUIPS, seed);
    if (plan.energy === "Recovering") return pick(OFF_RECOVERING_QUIPS, seed);
    return pick(OFF_QUIPS, seed);
  }

  // day / night / long_day all draw from the same large "on shift" pool.
  return pick(ON_SHIFT_QUIPS, seed);
}
