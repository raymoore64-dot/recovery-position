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
  "You are not behind schedule. You are operating on the healthcare dimension, where clocks are merely decorative.",
  "Somewhere, someone has written \"ASAP\" on something. You have chosen not to interpret it as a personal challenge.",
  "Your shift began with a plan. This was adorable.",
  "If common sense were a controlled drug, your department would have run out months ago.",
  "You haven't lost control. Control was never actually present.",
  "Every shift begins with hope. Hope is then gently escorted from the building.",
  "You are a highly trained professional operating inside a system held together by laminated signs.",
  "Today's objective: do the important things, ignore the ridiculous things, and never ask what that noise was.",
  "The human body is an extraordinary machine. Unfortunately, it comes with users.",
  "You can tell you're having a good shift when nobody says, \"Can I just ask you something?\"",
  "Your ability to remain polite while internally becoming a small volcano is a legitimate clinical skill.",
  "There are two kinds of shift: the one you expected and the one that actually happened. Neither has ever met the other.",
  "You have been awake since yesterday, yet somehow you're still making decisions. This seems medically questionable but personally impressive.",
  "The department has everything you need, except the thing you currently need.",
  "You don't need luck. You need whoever keeps moving the equipment to stop.",
  "Today's forecast: 90% chance of interruption with scattered administrative nonsense.",
  "If patience were measured in milligrams, yours would require a prescription.",
  "You entered healthcare to help people. Nobody mentioned becoming an expert in locating mysteriously absent objects.",
  "Your shift is like a badly written sitcom: recurring characters, improbable situations and someone inevitably shouting your name from another room.",
  "Remember: behind every successful healthcare worker is another healthcare worker saying, \"Have you tried turning it off and on again?\"",
  "You don't need to have all the answers. You just need to know who knows the answer and where they've gone.",
  "There is no such thing as a five-minute job. This is one of healthcare's oldest and most carefully preserved myths.",
  "You are professionally trained to remain calm while the universe repeatedly tests whether you mean it.",
  "Your brain has 47 tabs open. Three are frozen. One is playing music. Somehow the patient is fine.",
  "If today feels surreal, don't worry. That's just Tuesday wearing a slightly different hat.",
  "The good news: you're nearly finished. The bad news: you said that forty minutes ago.",
  "Some people have work-life balance. You have work-life handover.",
  "A healthcare worker's natural habitat is somewhere between a clipboard and mild disbelief.",
  "You are not procrastinating. You are allowing the problem to develop enough information to become someone else's problem.",
  "The finest minds in medicine still cannot explain why the printer only jams when someone is waiting.",
  "You are allowed to have bad days. The human race has been having them since approximately 200,000 BC.",
  "Your professional superpower is making things happen while quietly wondering why nobody thought of this yesterday.",
  "There is always one person on the shift who knows where everything is. If it's you, congratulations. You are now the department.",
  "You haven't been defeated. You have merely encountered a form with seventeen boxes and no logical reason for existing.",
  "A calm healthcare worker is a beautiful thing. A calm healthcare worker who has already had coffee is practically a miracle.",
  "You don't need to win the shift. Draws are acceptable. Survival is underrated.",
  "Today you may encounter incompetence. Remember: statistically, some of it will belong to you.",
  "The universe is expanding. So is the waiting list. Nobody knows why.",
  "If your shift had a soundtrack, it would mostly be footsteps followed by someone saying your name.",
  "You are simultaneously someone's reassurance, someone's problem solver and someone's reason for finally finding the thing they've been looking for.",
  "The human capacity for adaptation is extraordinary. Give someone three night shifts and they can sleep through a construction site.",
  "You don't need a motivational speech. You need everyone to stop touching things without telling you.",
  "Every department has a system. Some departments even have the same system twice.",
  "You may feel like you're winging it. That's because everyone else has been too polite to tell you they're doing exactly the same thing.",
  "Today's achievement may not be spectacular. Sometimes excellence is simply preventing Tuesday from becoming Wednesday's problem.",
  "You have mastered the ancient healthcare art of looking calm while mentally calculating seventeen possible outcomes.",
  "If the shift seems unusually quiet, do not comment on it. This is how ancient curses begin.",
  "You are one of the few people capable of saying \"that's interesting\" when what you actually mean is \"what fresh nonsense is this?\"",
  "A healthcare shift is essentially an escape room where the clues keep asking you for your password.",
  "Never underestimate the power of one competent person quietly fixing something before anyone notices it was broken.",
  "You have survived meetings that could have been emails. You can survive almost anything.",
  "Your job occasionally involves saving lives. It also occasionally involves explaining where the toilet is. Humanity is wonderfully diverse.",
  "You don't have to be a beacon of inspiration. Sometimes being the person who knows what to do next is enough.",
  "If you haven't laughed at least once during your shift, check your pulse. You may have accidentally become management.",
  "Your colleagues may occasionally drive you insane. Remember: they are also the people who will bring you coffee when the universe finally wins.",
  "The shift is temporary. The story about what happened during it will probably become department folklore.",
  "You are doing important work in an environment where someone has inevitably labelled a cupboard incorrectly.",
  "Never confuse exhaustion with failure. A phone at 2% battery isn't a bad phone. It just needs charging and possibly a less demanding owner.",
  "You don't need to change the entire healthcare system today. Start smaller. Find the problem in front of you. Fix what you can.",
  "And when the shift finally ends, walk out with dignity. Tomorrow, the chaos will still be there. It has nowhere else to go.",
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
