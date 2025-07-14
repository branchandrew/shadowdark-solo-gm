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
