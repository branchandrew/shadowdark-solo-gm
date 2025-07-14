/**
 * Mythic GME Fate Chart Implementation (TypeScript)
 * Handles yes/no questions based on likelihood and chaos factor
 */

// Fate Chart lookup table - maximum roll needed for "Yes" result
// Format: FATE_CHART[likelihood_index][chaos_factor - 1]
export const FATE_CHART: number[][] = [
  // Impossible
  [1, 1, 1, 1, 2, 3, 5, 7, 10],
  // Nearly Impossible
  [1, 1, 1, 2, 3, 5, 7, 10, 13],
  // Very Unlikely
  [1, 1, 2, 3, 5, 7, 10, 13, 15],
  // Unlikely
  [1, 2, 3, 5, 7, 10, 13, 15, 17],
  // 50/50
  [2, 3, 5, 7, 10, 13, 15, 17, 18],
  // Likely
  [5, 7, 10, 13, 15, 17, 18, 19, 19],
  // Very Likely
  [7, 10, 13, 15, 17, 18, 19, 19, 20],
  // Nearly Certain
  [10, 13, 15, 17, 18, 19, 19, 20, 20],
  // Certain
  [13, 15, 17, 18, 19, 19, 20, 20, 20],
];

export const LIKELIHOOD_NAMES = [
  "Impossible",
  "Nearly Impossible",
  "Very Unlikely",
  "Unlikely",
  "50/50",
  "Likely",
  "Very Likely",
  "Nearly Certain",
  "Certain",
] as const;

export type LikelihoodName = (typeof LIKELIHOOD_NAMES)[number];

// Random Event Focus Table (d100)
export const RANDOM_EVENT_FOCUS_TABLE: Array<[number, number, string]> = [
  [1, 5, "Remote Event"],
  [6, 10, "Ambiguous Event"],
  [11, 20, "New NPC"],
  [21, 40, "NPC Action"],
  [41, 45, "NPC Negative"],
  [46, 50, "NPC Positive"],
  [51, 55, "Move Toward A Thread"],
  [56, 65, "Move Away From A Thread"],
  [66, 70, "Close A Thread"],
  [71, 80, "PC Negative"],
  [81, 85, "PC Positive"],
  [86, 100, "Current Context"],
];

// Meaning table data (simplified local implementation)
const ACTION_VERB = [
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
];

const ACTION_SUBJECT = [
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
];

export interface MeaningTableResult {
  verb_roll: number;
  verb: string;
  verb_index: number;
  subject_roll: number;
  subject: string;
  subject_index: number;
  meaning: string;
}

export interface RandomEventResult {
  event_roll: number;
  event_type: string;
  event_range: string;
  meaning_table?: MeaningTableResult;
}

export interface FateChartResult {
  roll: number;
  threshold: number;
  success: boolean;
  exceptional: boolean;
  result: string;
  likelihood: string;
  chaos_factor: number;
  likelihood_index: number;
  doubles: boolean;
  random_event?: RandomEventResult;
}

/**
 * Roll on the meaning table (local implementation)
 */
function rollMeaningTableLocal(): MeaningTableResult {
  // Roll 2d100 for verb and subject
  const verbRoll = Math.floor(Math.random() * 100) + 1;
  const subjectRoll = Math.floor(Math.random() * 100) + 1;

  // Get verb and subject (1-indexed, so subtract 1 for array access)
  const verbIndex = Math.min(verbRoll - 1, ACTION_VERB.length - 1);
  const verb = ACTION_VERB[verbIndex];

  const subjectIndex = Math.min(subjectRoll - 1, ACTION_SUBJECT.length - 1);
  const subject = ACTION_SUBJECT[subjectIndex];

  return {
    verb_roll: verbRoll,
    verb,
    verb_index: verbIndex + 1,
    subject_roll: subjectRoll,
    subject,
    subject_index: subjectIndex + 1,
    meaning: `${verb} ${subject}`,
  };
}

/**
 * Roll on the Random Event Focus Table
 */
function rollRandomEvent(): RandomEventResult {
  const roll = Math.floor(Math.random() * 100) + 1;

  for (const [minVal, maxVal, eventType] of RANDOM_EVENT_FOCUS_TABLE) {
    if (minVal <= roll && roll <= maxVal) {
      const eventData: RandomEventResult = {
        event_roll: roll,
        event_type: eventType,
        event_range: `${minVal}-${maxVal}`,
      };

      // Check if this event type should trigger a meaning table roll
      if (shouldTriggerMeaningTable(eventType)) {
        eventData.meaning_table = rollMeaningTableLocal();
      }

      return eventData;
    }
  }

  // Fallback (shouldn't happen)
  const fallbackData: RandomEventResult = {
    event_roll: roll,
    event_type: "Current Context",
    event_range: "86-100",
  };

  if (shouldTriggerMeaningTable("Current Context")) {
    fallbackData.meaning_table = rollMeaningTableLocal();
  }

  return fallbackData;
}

/**
 * Determine if an event type should trigger an automatic meaning table roll
 */
function shouldTriggerMeaningTable(eventType: string): boolean {
  // These event types benefit from additional meaning interpretation
  const meaningTriggerEvents = new Set([
    "Move Toward A Thread",
    "Move Away From A Thread",
    "Close A Thread",
    "New NPC",
    "NPC Action",
    "Remote Event",
    "Ambiguous Event",
    "Current Context",
  ]);

  return meaningTriggerEvents.has(eventType);
}

/**
 * Check if a roll has doubles (same digit in tens and ones place)
 */
function hasDoubles(roll: number): boolean {
  if (roll < 10) {
    return false; // Single digit rolls can't have doubles
  }

  const tens = Math.floor(roll / 10);
  const ones = roll % 10;
  return tens === ones;
}

/**
 * Roll on the Mythic Fate Chart
 */
export function rollFateChart(
  likelihood: string = "50/50",
  chaosFactor: number = 5,
): FateChartResult {
  // Validate chaos factor
  if (!Number.isInteger(chaosFactor) || chaosFactor < 1 || chaosFactor > 9) {
    chaosFactor = 5;
  }

  // Find likelihood index
  let likelihoodIndex = 4; // Default to 50/50
  if (LIKELIHOOD_NAMES.includes(likelihood as LikelihoodName)) {
    likelihoodIndex = LIKELIHOOD_NAMES.indexOf(likelihood as LikelihoodName);
  }

  // Roll d100 (1-99, treating 100 as 00)
  const roll = Math.floor(Math.random() * 99) + 1;

  // Get threshold from chart
  const threshold = FATE_CHART[likelihoodIndex][chaosFactor - 1];

  // Determine result
  const success = roll <= threshold;

  // Check for exceptional results
  let exceptional = false;
  let resultText: string;

  if (success && roll <= Math.floor(threshold / 5)) {
    // Exceptional Yes (1/5 of threshold)
    exceptional = true;
    resultText = "Exceptional Yes";
  } else if (!success && roll >= 96) {
    // Exceptional No (96-99)
    exceptional = true;
    resultText = "Exceptional No";
  } else if (success) {
    resultText = "Yes";
  } else {
    resultText = "No";
  }

  // Check for doubles and random events
  const doublesRolled = hasDoubles(roll);
  let randomEvent: RandomEventResult | undefined;

  // Random events occur on doubles, but NOT on exceptional results
  if (doublesRolled && !exceptional) {
    randomEvent = rollRandomEvent();
  }

  const result: FateChartResult = {
    roll,
    threshold,
    success,
    exceptional,
    result: resultText,
    likelihood,
    chaos_factor: chaosFactor,
    likelihood_index: likelihoodIndex,
    doubles: doublesRolled,
  };

  // Add random event data if it occurred
  if (randomEvent) {
    result.random_event = randomEvent;
  }

  return result;
}

/**
 * Get all available likelihood options
 */
export function getLikelihoodOptions(): LikelihoodName[] {
  return [...LIKELIHOOD_NAMES];
}

/**
 * Validate likelihood name
 */
export function isValidLikelihood(
  likelihood: string,
): likelihood is LikelihoodName {
  return LIKELIHOOD_NAMES.includes(likelihood as LikelihoodName);
}
