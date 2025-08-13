/**
 * Mythic GME Meaning Table Implementation (TypeScript)
 * Handles Action/Subject generation with 2d100 rolls
 */

// Action Table - Verbs (d100)
export const ACTION_VERB = [
  "Abandon",
  "Accompany",
  "Activate",
  "Agree",
  "Ambush",
  "Arrive",
  "Assist",
  "Attack",
  "Attain",
  "Bargain",
  "Befriend",
  "Bestow",
  "Betray",
  "Block",
  "Break",
  "Carry",
  "Celebrate",
  "Change",
  "Close",
  "Combine",
  "Communicate",
  "Conceal",
  "Continue",
  "Control",
  "Create",
  "Deceive",
  "Decrease",
  "Defend",
  "Delay",
  "Deny",
  "Depart",
  "Deposit",
  "Destroy",
  "Dispute",
  "Disrupt",
  "Distrust",
  "Divide",
  "Drop",
  "Easy",
  "Energize",
  "Escape",
  "Expose",
  "Fail",
  "Fight",
  "Flee",
  "Free",
  "Guide",
  "Harm",
  "Heal",
  "Hinder",
  "Imitate",
  "Imprison",
  "Increase",
  "Indulge",
  "Inform",
  "Inquire",
  "Inspect",
  "Invade",
  "Leave",
  "Lure",
  "Misuse",
  "Move",
  "Neglect",
  "Observe",
  "Open",
  "Oppose",
  "Overthrow",
  "Praise",
  "Proceed",
  "Protect",
  "Punish",
  "Pursue",
  "Recruit",
  "Refuse",
  "Release",
  "Relinquish",
  "Repair",
  "Repulse",
  "Return",
  "Reward",
  "Representative",
  "Riches",
  "Safety",
  "Strength",
  "Success",
  "Suffering",
  "Surprise",
  "Tactic",
  "Technology",
  "Tension",
  "Time",
  "Trial",
  "Value",
  "Vehicle",
  "Victory",
  "Vulnerability",
  "Weapon",
  "Weather",
  "Work",
  "Wound",
] as const;

// Action Table - Subjects (d100)
export const ACTION_SUBJECT = [
  "Advantage",
  "Adversity",
  "Agreement",
  "Animal",
  "Attention",
  "Balance",
  "Battle",
  "Benefits",
  "Building",
  "Burden",
  "Bureaucracy",
  "Business",
  "Chaos",
  "Comfort",
  "Completion",
  "Conflict",
  "Cooperation",
  "Danger",
  "Defense",
  "Depletion",
  "Disadvantage",
  "Distraction",
  "Elements",
  "Emotion",
  "Enemy",
  "Energy",
  "Environment",
  "Expectation",
  "Exterior",
  "Extravagance",
  "Failure",
  "Fame",
  "Fear",
  "Freedom",
  "Friend",
  "Goal",
  "Group",
  "Health",
  "Hindrance",
  "Home",
  "Hope",
  "Idea",
  "Illness",
  "Illusion",
  "Individual",
  "Information",
  "Innocent",
  "Intellect",
  "Interior",
  "Investment",
  "Leadership",
  "Legal",
  "Location",
  "Military",
  "Misfortune",
  "Mundane",
  "Nature",
  "Needs",
  "News",
  "Normal",
  "Object",
  "Obscurity",
  "Official",
  "Opposition",
  "Outside",
  "Pain",
  "Path",
  "Peace",
  "People",
  "Personal",
  "Physical",
  "Plot",
  "Portal",
  "Possessions",
  "Poverty",
  "Power",
  "Prison",
  "Project",
  "Protection",
  "Reassurance",
  "Ruin",
  "Separate",
  "Start",
  "Stop",
  "Strange",
  "Struggle",
  "Succeed",
  "Support",
  "Suppress",
  "Take",
  "Threaten",
  "Transform",
  "Trap",
  "Travel",
  "Triumph",
  "Truce",
  "Trust",
  "Use",
  "Usurp",
  "Waste",
] as const;

// Descriptor Table 1 - Adverbs (d100)
export const DESCRIPTOR_1_ADVERBS = [
  "Adventurously",
  "Aggressively",
  "Anxiously",
  "Awkwardly",
  "Beautifully",
  "Bleakly",
  "Boldly",
  "Bravely",
  "Busily",
  "Calmly",
  "Carefully",
  "Carelessly",
  "Cautiously",
  "Ceaselessly",
  "Cheerfully",
  "Combatively",
  "Coolly",
  "Crazily",
  "Curiously",
  "Dangerously",
  "Defiantly",
  "Deliberately",
  "Delicately",
  "Delightfully",
  "Dimly",
  "Efficiently",
  "Emotionally",
  "Energetically",
  "Enormously",
  "Enthusiastically",
  "Excitedly",
  "Fearfully",
  "Ferociously",
  "Fiercely",
  "Foolishly",
  "Fortunately",
  "Frantically",
  "Freely",
  "Frighteningly",
  "Fully",
  "Generously",
  "Gently",
  "Gladly",
  "Gracefully",
  "Gratefully",
  "Happily",
  "Hastily",
  "Healthily",
  "Helpfully",
  "Helplessly",
  "Hopelessly",
  "Innocently",
  "Intensely",
  "Interestingly",
  "Irritatingly",
  "Joyfully",
  "Kindly",
  "Lazily",
  "Lightly",
  "Loosely",
  "Loudly",
  "Lovingly",
  "Loyally",
  "Majestically",
  "Meaningfully",
  "Mechanically",
  "Mildly",
  "Miserably",
  "Mockingly",
  "Mysteriously",
  "Naturally",
  "Neatly",
  "Nicely",
  "Oddly",
  "Offensively",
  "Officially",
  "Partially",
  "Passively",
  "Peacefully",
  "Perfectly",
  "Playfully",
  "Politely",
  "Positively",
  "Powerfully",
  "Quaintly",
  "Quarrelsomely",
  "Quietly",
  "Roughly",
  "Rudely",
  "Ruthlessly",
  "Slowly",
  "Softly",
  "Strangely",
  "Swiftly",
  "Threateningly",
  "Timidly",
  "Very",
  "Violently",
  "Wildly",
  "Yieldingly"
] as const;

// Descriptor Table 2 - Adjectives (d100)
export const DESCRIPTOR_2_ADJECTIVES = [
  "Abnormal",
  "Amusing",
  "Artificial",
  "Average",
  "Beautiful",
  "Bizarre",
  "Boring",
  "Bright",
  "Broken",
  "Clean",
  "Cold",
  "Colorful",
  "Colorless",
  "Comforting",
  "Creepy",
  "Cute",
  "Damaged",
  "Dark",
  "Defeated",
  "Dirty",
  "Disagreeable",
  "Dry",
  "Dull",
  "Empty",
  "Enormous",
  "Extraordinary",
  "Extravagant",
  "Faded",
  "Familiar",
  "Fancy",
  "Feeble",
  "Festive",
  "Flawless",
  "Forlorn",
  "Fragile",
  "Fragrant",
  "Fresh",
  "Full",
  "Glorious",
  "Graceful",
  "Hard",
  "Harsh",
  "Healthy",
  "Heavy",
  "Historical",
  "Horrible",
  "Important",
  "Interesting",
  "Juvenile",
  "Lacking",
  "Large",
  "Lavish",
  "Lean",
  "Less",
  "Lethal",
  "Lively",
  "Lonely",
  "Lovely",
  "Magnificent",
  "Mature",
  "Messy",
  "Mighty",
  "Military",
  "Modern",
  "Mundane",
  "Mysterious",
  "Natural",
  "Normal",
  "Odd",
  "Old",
  "Pale",
  "Peaceful",
  "Petite",
  "Plain",
  "Poor",
  "Powerful",
  "Protective",
  "Quaint",
  "Rare",
  "Reassuring",
  "Remarkable",
  "Rotten",
  "Rough",
  "Ruined",
  "Rustic",
  "Scary",
  "Shocking",
  "Simple",
  "Small",
  "Smooth",
  "Soft",
  "Strong",
  "Stylish",
  "Unpleasant",
  "Valuable",
  "Vibrant",
  "Warm",
  "Watery",
  "Weak",
  "Young"
] as const;

export interface MeaningTableResult {
  verb_roll: number;
  verb: string;
  verb_index: number;
  subject_roll: number;
  subject: string;
  subject_index: number;
  meaning: string;
}

export interface DescriptorTableResult {
  adverb_roll: number;
  adverb: string;
  adverb_index: number;
  adjective_roll: number;
  adjective: string;
  adjective_index: number;
  description: string;
}

/**
 * Roll on the Mythic Meaning Table (Action/Subject)
 */
export function rollMeaningTable(): MeaningTableResult {
  // Roll 2d100 for verb and subject
  const verbRoll = Math.floor(Math.random() * 100) + 1;
  const subjectRoll = Math.floor(Math.random() * 100) + 1;

  // Get verb (1-indexed, so subtract 1 for array access)
  const verbIndex = Math.min(verbRoll - 1, ACTION_VERB.length - 1);
  const verb = ACTION_VERB[verbIndex];

  // Get subject (1-indexed, so subtract 1 for array access)
  const subjectIndex = Math.min(subjectRoll - 1, ACTION_SUBJECT.length - 1);
  const subject = ACTION_SUBJECT[subjectIndex];

  return {
    verb_roll: verbRoll,
    verb,
    verb_index: verbIndex + 1, // Return 1-indexed for display
    subject_roll: subjectRoll,
    subject,
    subject_index: subjectIndex + 1, // Return 1-indexed for display
    meaning: `${verb} ${subject}`,
  };
}

/**
 * Roll on the Descriptor Tables (Adverb/Adjective)
 */
export function rollDescriptorTable(): DescriptorTableResult {
  // Roll 2d100 for adverb and adjective
  const adverbRoll = Math.floor(Math.random() * 100) + 1;
  const adjectiveRoll = Math.floor(Math.random() * 100) + 1;

  // Get adverb (1-indexed, so subtract 1 for array access)
  const adverbIndex = Math.min(adverbRoll - 1, DESCRIPTOR_1_ADVERBS.length - 1);
  const adverb = DESCRIPTOR_1_ADVERBS[adverbIndex];

  // Get adjective (1-indexed, so subtract 1 for array access)
  const adjectiveIndex = Math.min(adjectiveRoll - 1, DESCRIPTOR_2_ADJECTIVES.length - 1);
  const adjective = DESCRIPTOR_2_ADJECTIVES[adjectiveIndex];

  return {
    adverb_roll: adverbRoll,
    adverb,
    adverb_index: adverbIndex + 1, // Return 1-indexed for display
    adjective_roll: adjectiveRoll,
    adjective,
    adjective_index: adjectiveIndex + 1, // Return 1-indexed for display
    description: `${adverb} ${adjective}`,
  };
}

/**
 * Get all available verbs
 */
export function getActionVerbs(): readonly string[] {
  return ACTION_VERB;
}

/**
 * Get all available subjects
 */
export function getActionSubjects(): readonly string[] {
  return ACTION_SUBJECT;
}

/**
 * Get a specific verb by index (1-indexed)
 */
export function getVerbByIndex(index: number): string | undefined {
  if (index < 1 || index > ACTION_VERB.length) {
    return undefined;
  }
  return ACTION_VERB[index - 1];
}

/**
 * Get a specific subject by index (1-indexed)
 */
export function getSubjectByIndex(index: number): string | undefined {
  if (index < 1 || index > ACTION_SUBJECT.length) {
    return undefined;
  }
  return ACTION_SUBJECT[index - 1];
}

/**
 * Get all available adverbs
 */
export function getDescriptor1Adverbs(): readonly string[] {
  return DESCRIPTOR_1_ADVERBS;
}

/**
 * Get all available adjectives
 */
export function getDescriptor2Adjectives(): readonly string[] {
  return DESCRIPTOR_2_ADJECTIVES;
}

/**
 * Get a specific adverb by index (1-indexed)
 */
export function getAdverbByIndex(index: number): string | undefined {
  if (index < 1 || index > DESCRIPTOR_1_ADVERBS.length) {
    return undefined;
  }
  return DESCRIPTOR_1_ADVERBS[index - 1];
}

/**
 * Get a specific adjective by index (1-indexed)
 */
export function getAdjectiveByIndex(index: number): string | undefined {
  if (index < 1 || index > DESCRIPTOR_2_ADJECTIVES.length) {
    return undefined;
  }
  return DESCRIPTOR_2_ADJECTIVES[index - 1];
}
