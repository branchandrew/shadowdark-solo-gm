/**
 * Adventure Utilities (TypeScript)
 * Provides creature types and lieutenant type selection for adventure generation
 */

// Shadowdark villain types - source of truth for creature types
export const SHADOWDARK_VILLAIN_TYPES = [
  "Human",
  "Elf",
  "Dwarf",
  "Halfling",
  "Hobgoblin",
  "Drow",
  "Duergar",
  "Druid",
  "Giant",
  "Devil",
  "Demon",
  "Elemental",
  "Fairy",
  "Oni",
  "Hag",
  "Principi Fallen Angel",
  "Aboleth",
  "Naga",
  "Couatl",
  "Invisible Stalker",
  "Medusa",
  "Mummy",
  "Efreeti",
  "Phoenix",
  "Dragon",
  "Rime Walker",
  "Ten-Eyed Oracle",
  "Obe-Ixx of Azarumme",
  "Mordanticus the Flayed",
  "Rathgamnon",
  "Imprisoned God",
  "God of Storm / Destruction",
  "Sentient Grimoire",
  "An evil, scheming, intelligent relic or artifact",
  "A ghost, spirit, or shadow",
  "A god, diety or power representing death",
  "A chaos swarm",
  "A malignant spell or curse",
  "A hive mind corruption",
  "World consuming darkness",
  "Orc",
  "Goblin",
  "Skeleton",
  "Zombie",
  "Ghost",
  "Spirit",
  "Wraith",
  "Vampire",
  "Werewolf",
  "Troll",
  "Ogre",
  "Golem",
  "Construct",
  "Undead",
  "Fiend",
  "Celestial",
  "Fey",
  "Beast",
  "Monstrosity",
] as const;

export interface LieutenantTypesResult {
  success: boolean;
  lieutenant_types?: string[];
  error?: string;
}

export interface VillainTypesResult {
  success: boolean;
  villain_types?: string[];
  error?: string;
}

/**
 * Get random villain types for lieutenants, ensuring no duplicates
 */
export function getRandomLieutenantTypes(
  count: number = 2,
): LieutenantTypesResult {
  try {
    if (count <= 0) {
      return {
        success: false,
        error: "Count must be greater than 0",
      };
    }

    if (count > SHADOWDARK_VILLAIN_TYPES.length) {
      count = SHADOWDARK_VILLAIN_TYPES.length;
    }

    // Create a copy of the array and shuffle it
    const shuffled = [...SHADOWDARK_VILLAIN_TYPES];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    // Take the first 'count' elements
    const selectedTypes = shuffled.slice(0, count);

    return {
      success: true,
      lieutenant_types: selectedTypes,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Get all villain types (for API endpoint)
 */
export function getVillainTypes(): VillainTypesResult {
  try {
    return {
      success: true,
      villain_types: [...SHADOWDARK_VILLAIN_TYPES],
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Get a random single villain type
 */
export function getRandomVillainType(): string {
  return SHADOWDARK_VILLAIN_TYPES[
    Math.floor(Math.random() * SHADOWDARK_VILLAIN_TYPES.length)
  ];
}

/**
 * Check if a villain type is valid
 */
export function isValidVillainType(type: string): boolean {
  return SHADOWDARK_VILLAIN_TYPES.includes(type as any);
}

/**
 * Get total number of available villain types
 */
export function getVillainTypeCount(): number {
  return SHADOWDARK_VILLAIN_TYPES.length;
}

// Goals for BBEG motivation
const GOALS = [
  "Absolute negation",
  "Absolute power",
  "Apocalyptic destruction",
  "Artistic cruelty",
  "Ascension to demonhood",
  "Authoritarian control",
  "Beautiful destruction",
  "Become a god",
  "Binary justice",
  "Bond symbiotically with a host",
  "Break the vigilante protector",
  "Brutal enforcement of order",
  "Bureaucratic control",
  "Chaos and destruction",
  "Chaos and madness",
  "Chaotic domination",
  "Chaotic fun",
  "Collect knowledge",
  "Collect shiny things",
  "Complete a perfect contract",
  "Complete the mission at any cost",
  "Conquer death",
  "Conquer dimensions",
  "Conquer the empire",
  "Control games and contests",
  "Control others",
  "Control a crime‑ridden city",
  "Corporate advancement",
  "Corporate efficiency",
  "Corporate evil",
  "Corporate heroism",
  "Corrupt the world",
  "Cosmic experimentation",
  "Cosmic survival",
  "Create a horror movie in reality",
  "Criminal enterprise",
  "Criminal empire",
  "Criminal success",
  "Cure a loved one",
  "Cult leadership",
  "Dark‑order domination",
  "Defeat an eternal child hero",
  "Demon army",
  "Destroy everything",
  "Destroy galactic hunter",
  "Destroy heroic speedster",
  "Destroy jungle island",
  "Destroy positive matter universe",
  "Destroy rival speedster",
  "Destroy the happiness of the local hero",
  "Destroy the realm tower",
  "Destroy the world",
  "Dimensional control",
  "Divine vengeance",
  "Dominate dragons",
  "Dominate the realm",
  "Dream domination",
  "Draconic supremacy",
  "Eliminate anomalies",
  "Efficient world through optimization",
  "Endless strength",
  "Energy absorption",
  "Entertainment above all",
  "Environmental protection by force",
  "Escape imprisonment",
  "Escape the island",
  "Escape the underworld",
  "Eternal grudge",
  "Eternal undeath",
  "Eternal youth",
  "Exact revenge for personal tragedy",
  "Exact revenge on elusive nemesis",
  "Family business success",
  "Family legacy",
  "Family survival at any cost",
  "Fashion supremacy",
  "Flamboyant tyranny",
  "Forced assimilation",
  "Galactic domination",
  "Genetic perfection",
  "Genocidal extermination",
  "Guide destiny",
  "Guide the future of humanity",
  "Hand leadership of secret cult",
  "Harlem control",
  "Heavenly authority",
  "Heavenly order",
  "Heavenly stories collection",
  "Human extinction",
  "Human replacement",
  "Human superiority",
  "Human‑supremacist ideology",
  "Immortal dominance",
  "Immortal power",
  "Immortal survival",
  "Imperial doctrine enforcement",
  "Independence from rulers",
  "Information control",
  "Inherit power",
  "Institutional control",
  "Intellectual supremacy",
  "Insanity definition experiment",
  "Kinetic speed domination",
  "Knowledge and order",
  "Knowledge perfection",
  "Lawful evil order",
  "Leave the island",
  "Magical supremacy",
  "Maintain a dying empire",
  "Maintain evil balance",
  "Maintain the apocalypse timeline",
  "Matrix‑like reality perfection",
  "Mechanical evolution",
  "Merge realms",
  "Meta‑human extinction",
  "Mission completion for reward",
  "Musical immortality",
  "Mutated freedom",
  "Mutated supremacy",
  "Narrative control",
  "Necromantic power",
  "Nihilistic chaos",
  "Organic harvest",
  "Organic‑synthetic unity",
  "Orc supremacy",
  "Parasitic domination",
  "Perfect assimilation",
  "Perfect bounty",
  "Perfect combat",
  "Perfect organism",
  "Perfect soldier creation",
  "Perfect weapon",
  "Phazon corruption spreading",
  "Possess a loved one from past life",
  "Possess and control a talented creator",
  "Possess innocence",
  "Possess powerful artifact",
  "Power supremacy",
  "Predatory supremacy",
  "Prevent emergence of rival intelligence",
  "Profit from children",
  "Prophetic madness",
  "Protect her children",
  "Protect his people",
  "Protect territory",
  "Provide for family",
  "Psyche domination",
  "Pure corruption",
  "Purify a grand city",
  "Racial supremacy",
  "Reality manipulation",
  "Reclaim the world",
  "Release the archdemon",
  "Remain fairest in the land",
  "Revenge and honor",
  "Revenge obsession",
  "Revenge on rival kingdom",
  "Rule a crime‑ridden city underworld",
  "Rule all worlds",
  "Rule an alien empire",
  "Rule the desert kingdom",
  "Rule the kingdom",
  "Rule the realm of seas",
  "Rule the savannah kingdom",
  "Rule the towered city",
  "Rule worlds through temporal manipulation",
  "Rural success and stability",
  "Sage‑king guidance of nation",
  "Savior leadership of settlement",
  "Scientific advancement",
  "Scientific testing on subjects",
  "Serve a dark master",
  "Serve the destruction of the knightly order",
  "Shokan honor preservation",
  "Social advancement",
  "Social dominance",
  "Sorcerous power",
  "Species evolution",
  "Species propagation",
  "Speed god worship",
  "Resource monopoly",
  "Spread fear",
  "Spread her curse",
  "Spreading darkness",
  "Spreading evil",
  "Survival and expansion",
  "Technological dominance",
  "Technological tyranny",
  "Temporal manipulation of history",
  "Temporal obsession",
  "Territorial balance of nature",
  "Territorial conquest",
  "Territorial feeding",
  "Time compression of reality",
  "Torture humanity for pleasure",
  "Total control of reality",
  "Transfer soul into new vessel",
  "Tournament dominance",
  "Twilight supremacy",
  "Undead army",
  "Undead supremacy",
  "Unleash pure id",
  "Universal balance",
  "Universal domination",
  "Universal perfection",
  "Unleash primordial destruction",
  "Vampiric supremacy",
  "Vengeful colonialism",
  "World domination",
  "World peace through force",
  "World purification",
  "Wizarding supremacy",
  "Worship as a deity",
];

// Tarot cards
const TAROT_CARDS = [
  // Major Arcana
  "The Fool",
  "The Magician",
  "The High Priestess",
  "The Empress",
  "The Emperor",
  "The Hierophant",
  "The Lovers",
  "The Chariot",
  "Strength",
  "The Hermit",
  "Wheel of Fortune",
  "Justice",
  "The Hanged Man",
  "Death",
  "Temperance",
  "The Devil",
  "The Tower",
  "The Star",
  "The Moon",
  "The Sun",
  "Judgement",
  "The World",

  // Minor Arcana – Wands
  "Ace of Wands",
  "Two of Wands",
  "Three of Wands",
  "Four of Wands",
  "Five of Wands",
  "Six of Wands",
  "Seven of Wands",
  "Eight of Wands",
  "Nine of Wands",
  "Ten of Wands",
  "Page of Wands",
  "Knight of Wands",
  "Queen of Wands",
  "King of Wands",

  // Minor Arcana – Cups
  "Ace of Cups",
  "Two of Cups",
  "Three of Cups",
  "Four of Cups",
  "Five of Cups",
  "Six of Cups",
  "Seven of Cups",
  "Eight of Cups",
  "Nine of Cups",
  "Ten of Cups",
  "Page of Cups",
  "Knight of Cups",
  "Queen of Cups",
  "King of Cups",

  // Minor Arcana – Swords
  "Ace of Swords",
  "Two of Swords",
  "Three of Swords",
  "Four of Swords",
  "Five of Swords",
  "Six of Swords",
  "Seven of Swords",
  "Eight of Swords",
  "Nine of Swords",
  "Ten of Swords",
  "Page of Swords",
  "Knight of Swords",
  "Queen of Swords",
  "King of Swords",

  // Minor Arcana – Pentacles
  "Ace of Pentacles",
  "Two of Pentacles",
  "Three of Pentacles",
  "Four of Pentacles",
  "Five of Pentacles",
  "Six of Pentacles",
  "Seven of Pentacles",
  "Eight of Pentacles",
  "Nine of Pentacles",
  "Ten of Pentacles",
  "Page of Pentacles",
  "Knight of Pentacles",
  "Queen of Pentacles",
  "King of Pentacles",
];

const GENDERS = ["Male", "Female"];
const CARD_POSITIONS = [
  "Seed",
  "Virtue",
  "Vice",
  "Rising Power",
  "Breaking Point",
  "Fate",
];

export interface TarotCard {
  position: string;
  card_text: string;
}

export interface AdventureSeeds {
  goal: string;
  gender: string;
  race: string;
  cards: TarotCard[];
}

/**
 * Generate adventure seeds (goal, gender, race, tarot cards) - replacement for Python script
 */
export function generateAdventureSeeds(): AdventureSeeds {
  // Random goal
  const goal = GOALS[Math.floor(Math.random() * GOALS.length)];

  // Gender with 4:1 male:female ratio
  const gender = Math.random() < 0.8 ? "Male" : "Female";

  // Race - 50% chance for Human, otherwise weighted towards earlier entries
  let race: string;
  if (Math.random() < 0.5) {
    race = SHADOWDARK_VILLAIN_TYPES[0]; // Human
  } else {
    // Weighted selection favoring earlier entries
    const numRaces = SHADOWDARK_VILLAIN_TYPES.length;
    const weights = Array.from(
      { length: numRaces },
      (_, i) => (numRaces - i) ** 2,
    );
    const totalWeight = weights.reduce((sum, w) => sum + w, 0);
    const randomValue = Math.random() * totalWeight;

    let currentWeight = 0;
    for (let i = 0; i < numRaces; i++) {
      currentWeight += weights[i];
      if (randomValue <= currentWeight) {
        race = SHADOWDARK_VILLAIN_TYPES[i];
        break;
      }
    }
    race = race || SHADOWDARK_VILLAIN_TYPES[0]; // Fallback
  }

  // Generate 6 tarot cards with orientations and positions
  const cards: TarotCard[] = [];
  for (let i = 0; i < 6; i++) {
    const card = TAROT_CARDS[Math.floor(Math.random() * TAROT_CARDS.length)];
    const orientation = Math.random() < 0.33 ? "Reversed" : "Upright"; // ~33% chance of reversed
    cards.push({
      position: CARD_POSITIONS[i],
      card_text: `${card} (${orientation})`,
    });
  }

  return {
    goal,
    gender,
    race,
    cards,
  };
}
