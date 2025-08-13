/**
 * Curse Generator (TypeScript)
 * Generates random curses from categorized tables of curse effects
 */

// Mild curses - social inconveniences and minor hindrances
const mildCurses = [
  "Turns purple any time they tell a lie.",
  "Always looks sopping wet.",
  "Will be pooped on by a bird at least once a day (regardless of location).",
  "Is now horribly allergic to pollen and dust.",
  "Is compelled to give any stranger they meet a high five. If the stranger leaves them hanging, the creature will high five their own hand.",
  "Cannot stop yawning in an egregious (and fairly disrespectful) way.",
  "Can communicate with cats but only cats. All other language is lost to them.",
  "Grows a cumbersome beard twice as long as they are tall.",
  "Is hoarse and all but inaudible.",
  "Is under the impression every single person they encounter knows their darkest secrets.",
  "Must speak in rhymed couplets or take 1d4 +1 psychic damage each time they talk.",
  "Is always thirsty.",
  "Is allergic to metal and breaks out in leaky sores on contact.",
  "Must use jazz hands when they speak or take 1d6 + 3 psychic damage.",
  "Refuses to be seen without their hat, and won't let anyone forget it.",
  "Is suddenly followed by every mouse and rat in the village.",
  "Has breath so bad it knocks out anyone who comes within a yard.",
  "Is disgusted by gold.",
  "Loses the ability to lie or even omit elements of the truth.",
  "Emits an offensively repulsive odor.",
  "Becomes allergic to anything with fur.",
  "Their personality shifts slightly.",
  "Everyone keeps forgetting who they are.",
  "Their hair won't stop growing at an alarmingly fast rate.",
  "Smells nothing but sewage at all times.",
  "Makes a considerable amount of noise when trying to sneak.",
  "Drops their weapon after every attack.",
  "Can't stop reciting subpar poetry.",
  "Can't maintain their balance.",
  "Trips and falls constantly.",
  "Can't stop staring at people.",
  "Their hands stick to anything they touch.",
  "All but their head is invisible.",
  "Everyone keeps mistaking them for a wanted criminal.",
  "Has an uncontrollable urge to steal cooking equipment.",
  "Can't speak to the opposite sex.",
  "Can't sit down.",
  "Everyone is convinced they are a doppelganger.",
  "Has an uncontrollable urge to pickpocket town guards.",
  "Becomes overly sensitive to light.",
  "Feels very heavy.",
  "Can read minds, but only when inconvenient.",
  "The weather is constantly bad wherever they go.",
  "Falls in love with anyone they make direct eye contact with.",
  "Can't stop laughing.",
  "Is afflicted with eternal, unrelenting hiccups.",
  "Is unable to resist speaking every thought they have out loud.",
  "Is completely oblivious to traps and can't stop setting them off.",
  "Keeps losing gold in inexplicable ways.",
  "Is unable to distinguish between good and bad advice.",
  "Clucks like a chicken when they try to speak.",
  "Farts uncontrollably all the time.",
  "Each day they wake up with their face covered in full clown makeup, requiring a DC 12 Wisdom saving throw when opening their mouth or laughing uncontrollably.",
  "Begins to float away every time they lay down.",
  "Attracts minuscule and mischievous fey creatures that constantly steal their stuff.",
  "Everything tastes like ash.",
  "Can only speak in haiku.",
  "Stops believing magic exists.",
  "All liquids, including magical ones, become water when they touch the container.",
  "Crows follow them everywhere, cawing noisily every time they try to speak or rest.",
  "Desires to shake hands with every single creature they meet, no matter the danger.",
  "Believes butterflies will lead them to great treasure and will follow one at any cost.",
  "Forgets how to read.",
  "Believes they can fly but cannot, with failures not enlightening or deterring them.",
  "An angry giant goat named Kevin follows them everywhere, staring unless they turn their back.",
  "Becomes a kleptomaniac, attempting to steal anything not nailed down.",
  "Has an uncontrollable need to sing all the time, wherever they are.",
  "Becomes covered with mud and stinking filth that reappears every time it's cleaned off, giving disadvantage on all Charisma checks.",
  "Will tell their deepest held secrets to anyone they meet, leading with the hidden knowledge.",
  "Can only speak in questions.",
  "Grows a wildly uncontrollable mustache that moves of its own accord, imposing disadvantage on concentration checks.",
  "Must refer to themselves in the third person or take 9 (2d8) necrotic damage each time they don't.",
  "Grows a lawful good mole on their left upper lip that speaks incessantly and protests unlawful actions.",
  "A spectral bard follows them everywhere singing songs of their most embarrassing mistakes.",
  "Sheds glitter everywhere and has disadvantage on all Dexterity (Stealth) checks.",
  "Any piece of furniture or equipment they try to sit or lie on breaks and they fall.",
  "Is compelled to lick everything.",
  "Proposes marriage to everyone and everything.",
  "Is compelled to hand their money and valuables out to random strangers.",
  "Must enter buildings backward while singing sea shanties at the top of their lungs."
];

// Severe curses - significant penalties and transformations
const severeCurses = [
  "Loses hit points equal to any damage they deal to another creature.",
  "Ages 1d10 years each time they take a long rest.",
  "Loses 3d6 pounds each time they eat.",
  "Can only use a total of 20 words per day.",
  "Must walk/run backward or they'll drop to 0 HP.",
  "Completely loses their sense of direction and has disadvantage on all Wisdom (Survival) checks related to travel.",
  "Is vulnerable to cold damage and cannot stop their teeth from chattering at the slightest drop in temperature.",
  "Has an 80 percent chance of being struck by lightning in a storm.",
  "Forgets how to do basic math. Numbers are meaningless now.",
  "Gets incredibly seasick to the point of collapse.",
  "Must ask for permission to enter any dwelling and is barred from entry by un-dispellable magic if they do not receive it from the dwelling's owner.",
  "Is anchored to the Material Plane. They cannot travel to other planes, nor can their soul move on.",
  "Is terribly frightened of the outdoors. They have disadvantage on Wisdom (Nature) skill checks and any rolls made when outside any urban environment.",
  "Becomes incredibly accident prone.",
  "Forgets what they were doing and why once per short rest at GM discretion.",
  "Passes a curse to every humanoid they touch.",
  "Can't stop crying.",
  "Believes they are friendless, penniless and aimless.",
  "Dies painfully but is immediately resurrected, with half as much max HP, at the start of each new day.",
  "Believes they are immortal and acts accordingly.",
  "Is vulnerable to all damage but feels no pain.",
  "Lacks bones and moves as an ooze would.",
  "Becomes catatonic at the sound of thunder.",
  "Gets incredibly winded during physical activity and must succeed on a DC 15 Constitution saving throw to avoid passing out.",
  "Takes the shape of the world's most notorious criminal.",
  "Can only eat grass.",
  "Can't move their arms or legs.",
  "Hears cats screaming whenever music is played.",
  "Gains 3d6 pounds per day, rerolling at the end of every long rest.",
  "Is compelled to challenge every creature they encounter to a duel.",
  "Weeps blood at the slightest insult.",
  "Can only see the Ethereal Plane.",
  "Has their Strength score reduced by half.",
  "Has their Dexterity score reduced by half.",
  "Has their Constitution score reduced by half.",
  "Has their Intelligence score reduced by half.",
  "Has their Wisdom score reduced by half.",
  "Has their Charisma score reduced by half.",
  "Has their movement speed reduced by half.",
  "Immediately loses half their max HP.",
  "Reverts to a childhood state.",
  "Loses the ability to learn or make new memories.",
  "Must kill a creature with their bare hands every day or die.",
  "Is being hunted by a shadow.",
  "Is petrified and unable to move.",
  "Their dreams are haunted by a ghost.",
  "Becomes unconscious at the smell of hay.",
  "Falls asleep whenever they hear the word 'the'.",
  "Has forgotten how to speak.",
  "Has forgotten how to walk.",
  "Has an evil alternate personality who takes control often.",
  "Everything they touch turns to ash.",
  "Is unable to trust even their closest friends.",
  "Is gripped with terror at the thought of their own existence.",
  "Is being stalked by a vampire.",
  "Can't stop gaining weight at an alarming rate.",
  "Can't stop dancing.",
  "Their dreams are haunted by a demon.",
  "All of their attacks are nonlethal.",
  "Feels as if they are on fire.",
  "Has horrible luck.",
  "Their body parts swell up one by one.",
  "Sees hellhounds everywhere they go.",
  "Everything they touch is set on fire.",
  "Can't stop growing at an alarming rate.",
  "Has an uncontrollable urge to stab anyone who talks to them.",
  "Their personality shifts drastically to the opposite of what it was.",
  "Now breathes water instead of air.",
  "Has become blind.",
  "Feels the urge to attack everyone who looks at them.",
  "Feels filthy no matter how much they bathe.",
  "Everything they touch turns to stone.",
  "If they stop moving they will die.",
  "Is slowly transforming into a swamp creature.",
  "Has forgotten how to read or write.",
  "Loses the ability to turn left.",
  "Has forgotten how to breathe.",
  "Has become deaf.",
  "Is unable to perform spells of any kind.",
  "Has forgotten how to fight.",
  "Has forgotten how to eat.",
  "Becomes convinced they are turning into a zombie.",
  "Is being haunted by a wraith.",
  "Their spells may have the opposite of the intended effect.",
  "Has no memory of their companions.",
  "Any armor they put on is unbearably heavy.",
  "Their skin becomes paper-thin and fragile, gaining vulnerability to necrotic damage and taking 5 (2d4) fire damage for every hour spent in the sun.",
  "Gains vulnerability to fire damage.",
  "All of their fingers fall off, unable to hold weapons/equipment or cast spells with somatic components until spending 5 (2d4) weeks training.",
  "Their skin turns blue and burns with sickly glowing symbols, taking 5 (1d6 + 2) psychic damage each time they make a Charisma-based check.",
  "Their skin, organs and muscles turn to dust, becoming a skeleton but retaining all statistics.",
  "Gains vulnerability to acid damage and can only respond to questions with 'It's complicated.'",
  "Their legs and arms switch places on their body.",
  "Loses 1 hit point each time they hear their name.",
  "Gains vulnerability to thunder damage.",
  "Can only eat items that aren't food, like rocks or metal, gaining 1 level of exhaustion each day.",
  "Is frightened of the moon and depictions of it.",
  "Punches themselves in the face hard every time they hear the word 'tavern.'",
  "Grows a sentient, prehensile tail that is chaotic evil and always trying to strangle them.",
  "Has to be reduced to 0 hit points at least once per day or they'll die permanently.",
  "Gains vulnerability to lightning damage.",
  "Metal of all kinds are drawn toward them, sticking to their skin and requiring a DC 20 Strength check to remove.",
  "All fires within 50 feet go out when they are around (doesn't affect instantaneous damage).",
  "Believes they are dying, moving at quarter speed and preferring to lie down.",
  "All coins, gems and precious metals turn to stone as soon as they touch them.",
  "Becomes the realm's most wanted criminal.",
  "Cannot enter a city, town or village with more than 60 people, falling unconscious if they do.",
  "Becomes a frog.",
  "Bleeds easily and profusely, requiring a DC 14 Constitution saving throw when taking damage or permanently losing 2 (1d4) maximum hit points.",
  "Gains vulnerability to radiant damage.",
  "Their hair becomes snakes, requiring a DC 14 Dexterity saving throw each hour or taking 2 (1d4) piercing and 7 (2d6) poison damage.",
  "Small polyps grow on their skin, developing tentacles that will open a portal to the abyss in 5 (2d4) days.",
  "Becomes a magnet for ranged attacks, with creatures attacking from more than 10 feet away getting +2 to attack rolls.",
  "Takes 6 (1d8 + 2) psychic damage every time they touch a door knob, clasp or lock.",
  "At night, their right hand detaches and becomes chaotic neutral, robbing the rich to give to the poor.",
  "Their arms grow to ridiculous length, gaining 10 feet reach but disadvantage on attack rolls and Dexterity checks.",
  "Is constantly hungry and starts to think their companions look tasty.",
  "Feels they are invulnerable and acts accordingly.",
  "Their soul will inhabit the body of the next creature they kill.",
  "Gains vulnerability to poison damage.",
  "Is incredibly narcoleptic, requiring a DC 13 Wisdom saving throw at the beginning of each turn or falling asleep.",
  "Becomes a black pudding that can communicate telepathically within 30 feet but cannot use magic items.",
  "Is affected by 3 (1d6) curses from this list."
];

// Funny curses - humorous and absurd effects
const funnyCurses = [
  "Glows in the dark but only when embarrassed.",
  "Transforms into an overripe watermelon with blindsense. The creature maintains its mental statistics and can communicate telepathically.",
  "Has an overwhelming desire to eat (but an aversion to the taste of) sand.",
  "Can only communicate in song titles.",
  "Has one of those head colds that just won't quit.",
  "Feels their teeth triple in size, and their mouth curve into a giant (and agonizing) grin.",
  "Birth to a fully formed quasit once per month.",
  "Has an increasingly unignorable hunger for chalk.",
  "Dog. Another stray will join this growing pack every time the cursed creature takes a long rest.",
  "Suddenly has rubber-like arms that become twisted and tangled whenever they try to use them.",
  "Is haunted by a constant, uncontrollable sneeze.",
  "Their body releases a pheromone that attracts monsters (but only small, harmless ones like rabbits).",
  "Shrinks down to half their size.",
  "Becomes tired in the day and overly energetic at night.",
  "Their body releases a pheromone that attracts deer.",
  "Is unable to sleep.",
  "Can't lie down.",
  "Transforms into a random animal during a full moon.",
  "Their body releases a pheromone that attracts bears (but only teddy bears).",
  "Everything they touch freezes over (but only for 3 seconds).",
  "Their spells have random targets (but always friendly ones).",
  "Can't stop singing (but only knows one song).",
  "Unattractive people can't help but fall madly in love with them.",
  "Their body releases a pheromone that attracts rats (who form a helpful cleaning crew).",
  "Is unable to stop randomly shouting about rabbits.",
  "Their dreams are haunted by embarrassing memories (which they act out while sleepwalking).",
  "Has forgotten how to drink (but only water - other liquids are fine).",
  "Hiccups uncontrollably and foul-smelling bubbles pour out of their mouth each time.",
  "Their nostrils fuse shut and they can no longer smell (which is sometimes a blessing).",
  "Their hair turns purple and grows at an exponential rate, requiring cutting every 2 hours or losing half movement speed to tangling.",
  "When they speak, it sounds as if they're underwater, giving disadvantage on Charisma-based checks.",
  "Becomes fascinated with horses, speaking exclusively to any horse in line of sight to the detriment of all else.",
  "Hears a high-pitched ringing at all times and fails any hearing-based Wisdom (Perception) checks.",
  "The world around them seems to spin constantly, requiring a DC 14 Constitution saving throw each hour or becoming dizzy for 10 minutes.",
  "Cries uncontrollably if they step on grass.",
  "Hops on one leg everywhere they go, moving with half speed and having disadvantage on Dexterity-based skill checks.",
  "Their eyes disappear from the front of their head and reappear in the back, giving disadvantage on Wisdom (Perception) checks based on sight.",
  "The joints in their arms reverse, giving disadvantage to all attack rolls and Dexterity (Sleight of Hand) checks.",
  "Spiky quills erupt from their back, requiring them to sleep on their stomach.",
  "Hiccups uncontrollably and foul-smelling bubbles pour out of their mouth each time.",
  "Their eyes glow green and they see everything in shades of blue, rolling all Dexterity (Stealth) checks with disadvantage.",
  "Their fingernails grow into sharp claws and they constantly feel like clawing out their own eyes (but never actually do it).",
  "Believes they have become a dragon and uses their 'breath weapon' (just blowing air) at every opportunity.",
  "Sparks fly from the ground where they walk, making pretty but harmless light shows.",
  "Must count grains of salt or sand if they are in sight, forgoing any other actions.",
  "Plants die everywhere they walk, becoming brittle and turning to dust (but they regrow twice as beautiful the next day).",
  "Their skin turns green and sprouts mushrooms that smell of dirty feet and garlic.",
  "Grows a wildly uncontrollable mustache that moves of its own accord and has its own personality.",
  "Believes 5 feet is actually a mile and can only move 5 feet during a move action.",
  "Becomes meek, with any damage they deal reduced by half (but they become incredibly polite).",
  "Sweats profusely when indoors (but only maple syrup).",
  "Can't stop singing (only lullabies, which puts everyone to sleep).",
  "Everything they touch turns to cheese for exactly 30 seconds.",
  "Their shadow detaches and follows them around, occasionally waving at people.",
  "They can only walk sideways like a crab.",
  "Every time they sneeze, a small flower grows from their nose.",
  "Their voice becomes incredibly high-pitched, like they've inhaled helium.",
  "They compulsively rhyme everything they say, even when it makes no sense.",
  "Their reflection shows them as a different person each day.",
  "They can only taste things that are the color blue.",
  "Small birds constantly nest in their hair.",
  "They leave glittery footprints wherever they walk.",
  "Every door they open plays a different silly sound effect.",
  "They can only speak in questions, even when making statements.",
  "Their hiccups sound like different animal noises each time.",
  "They age backwards one day for every week that passes.",
  "Everything they write appears in crayon, regardless of what they're writing with."
];

// Legacy array for backward compatibility and random selection
const curseEffects = [...mildCurses, ...severeCurses, ...funnyCurses];

export type CurseCategory = 'mild' | 'severe' | 'funny' | 'random';

export interface CurseGenerationResult {
  success: boolean;
  curse?: string;
  category?: CurseCategory;
  error?: string;
}

/**
 * Generate a single random curse from specified category
 */
export function generateCurse(category: CurseCategory = 'random'): CurseGenerationResult {
  try {
    let selectedCurse: string;
    let actualCategory: CurseCategory;

    if (category === 'random') {
      // Pick random category first
      const categories = ['mild', 'severe', 'funny'] as const;
      actualCategory = categories[Math.floor(Math.random() * categories.length)];
    } else {
      actualCategory = category;
    }

    // Get curse from selected category
    let curseArray: string[];
    switch (actualCategory) {
      case 'mild':
        curseArray = mildCurses;
        break;
      case 'severe':
        curseArray = severeCurses;
        break;
      case 'funny':
        curseArray = funnyCurses;
        break;
      default:
        return {
          success: false,
          error: "Invalid curse category",
        };
    }

    const randomIndex = Math.floor(Math.random() * curseArray.length);
    selectedCurse = curseArray[randomIndex];

    return {
      success: true,
      curse: selectedCurse,
      category: actualCategory,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unexpected error occurred",
    };
  }
}

/**
 * Get the total number of available curse effects for a category
 */
export function getCurseCount(category: CurseCategory = 'random'): number {
  switch (category) {
    case 'mild':
      return mildCurses.length;
    case 'severe':
      return severeCurses.length;
    case 'funny':
      return funnyCurses.length;
    case 'random':
      return curseEffects.length;
    default:
      return 0;
  }
}

/**
 * Get all available curse categories
 */
export function getCurseCategories(): Array<{value: CurseCategory, label: string, count: number}> {
  return [
    { value: 'random', label: 'Random', count: curseEffects.length },
    { value: 'mild', label: 'Mild', count: mildCurses.length },
    { value: 'severe', label: 'Severe', count: severeCurses.length },
    { value: 'funny', label: 'Funny', count: funnyCurses.length },
  ];
}

// Legacy functions for backward compatibility
export function generateCurses(numCurses: number = 1): { success: boolean; curses?: string[]; count?: number; error?: string; } {
  if (numCurses !== 1) {
    return {
      success: false,
      error: "Only single curse generation is supported",
    };
  }
  
  const result = generateCurse('random');
  if (result.success && result.curse) {
    return {
      success: true,
      curses: [result.curse],
      count: 1,
    };
  }
  
  return {
    success: false,
    error: result.error,
  };
}

export function getTotalCurseCount(): number {
  return curseEffects.length;
}

export function generateSingleCurse(): string {
  const result = generateCurse('random');
  return result.curse || "A mysterious curse affects the target.";
}
