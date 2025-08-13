/**
 * Danger Generator (TypeScript)
 * Implements the 1d12 three-roll system for generating dangers
 * Roll 1d12 three times: category, subcategory, and specific prompt
 */

// Main categories (1d12)
const MAIN_CATEGORIES = {
  1: "UNNATURAL ENTITY",
  2: "HAZARD", 3: "HAZARD", 4: "HAZARD", 5: "HAZARD", 6: "HAZARD",
  7: "CREATURE", 8: "CREATURE", 9: "CREATURE", 10: "CREATURE", 11: "CREATURE", 12: "CREATURE"
};

// UNNATURAL ENTITY subcategories
const UNNATURAL_ENTITY_SUBCATEGORIES = {
  1: "DIVINE",
  2: "PLANAR", 3: "PLANAR", 4: "PLANAR",
  5: "UNDEAD", 6: "UNDEAD", 7: "UNDEAD", 8: "UNDEAD", 9: "UNDEAD", 10: "UNDEAD", 11: "UNDEAD", 12: "UNDEAD"
};

const DIVINE_ENTITIES = {
  1: "agent", 2: "agent", 3: "agent", 4: "agent", 5: "agent",
  6: "champion", 7: "champion", 8: "champion", 9: "champion",
  10: "army/force", 11: "army/force",
  12: "avatar/embodiment"
};

const PLANAR_ENTITIES = {
  1: "imp/sprite", 2: "imp/sprite", 3: "imp/sprite",
  4: "lesser demon/elemental", 5: "lesser demon/elemental", 6: "lesser demon/elemental",
  7: "demon/elemental", 8: "demon/elemental", 9: "demon/elemental",
  10: "greater demon/elemental", 11: "greater demon/elemental",
  12: "devil/elemental lord"
};

const UNDEAD_ENTITIES = {
  1: "haunt/wisp", 2: "haunt/wisp", 3: "haunt/wisp", 4: "haunt/wisp",
  5: "phantom/shadow", 6: "phantom/shadow",
  7: "ghost/specter", 8: "ghost/specter", 9: "ghost/specter",
  10: "wight/wraith/revenant", 11: "wight/wraith/revenant",
  12: "spirit lord/lich"
};

// HAZARD subcategories
const HAZARD_SUBCATEGORIES = {
  1: "UNNATURAL", 2: "UNNATURAL",
  3: "NATURAL", 4: "NATURAL", 5: "NATURAL", 6: "NATURAL", 7: "NATURAL", 8: "NATURAL", 9: "NATURAL", 10: "NATURAL", 11: "NATURAL", 12: "NATURAL"
};

const UNNATURAL_HAZARDS = {
  1: "taint/blight/curse", 2: "taint/blight/curse", 3: "taint/blight/curse", 4: "taint/blight/curse", 5: "taint/blight/curse",
  6: "magical: unnatural + magic type [p55]", 7: "magical: unnatural + magic type [p55]", 8: "magical: unnatural + magic type [p55]", 9: "magical: unnatural + magic type [p55]",
  10: "planar: natural + element [p55]", 11: "planar: natural + element [p55]",
  12: "divine: natural + deity"
};

const NATURAL_HAZARDS = {
  1: "oddity-based [p55]",
  2: "tectonic/volcanic",
  3: "unseen pitfall (chasm, crevasse, abyss, rift)", 4: "unseen pitfall (chasm, crevasse, abyss, rift)",
  5: "ensnaring (bog, mire, tarpit, quicksand, etc.)", 6: "ensnaring (bog, mire, tarpit, quicksand, etc.)",
  7: "defensive (created by local creature)",
  8: "meteorological (blizzard, thunderstorm, sandstorm, etc.)", 9: "meteorological (blizzard, thunderstorm, sandstorm, etc.)", 10: "meteorological (blizzard, thunderstorm, sandstorm, etc.)",
  11: "seasonal (fire, flood, avalanche, etc.)",
  12: "impairing (mist, fog, murk, gloom, miasma, etc.)"
};

// CREATURE subcategories
const CREATURE_SUBCATEGORIES = {
  1: "MONSTER", 2: "MONSTER", 3: "MONSTER", 4: "MONSTER",
  5: "BEAST", 6: "BEAST", 7: "BEAST", 8: "BEAST", 9: "BEAST", 10: "BEAST",
  11: "HUMANOID", 12: "HUMANOID"
};

// MONSTER subcategories
const MONSTER_SUBCATEGORIES = {
  1: "EXTRAPLANAR",
  2: "LEGENDARY",
  3: "UNDEAD", 4: "UNDEAD", 5: "UNDEAD",
  6: "UNUSUAL", 7: "UNUSUAL",
  8: "BEASTLY", 9: "BEASTLY",
  10: "WILD HUMANOID", 11: "WILD HUMANOID", 12: "WILD HUMANOID"
};

const EXTRAPLANAR_MONSTERS = {
  1: "divine/demonic lord",
  2: "angel/demon",
  3: "cherub/imp", 4: "cherub/imp", 5: "cherub/imp",
  6: "elemental [p55]", 7: "elemental [p55]", 8: "elemental [p55]", 9: "elemental [p55]", 10: "elemental [p55]", 11: "elemental [p55]", 12: "elemental [p55]"
};

const LEGENDARY_MONSTERS = {
  1: "huge + oddity [p55]",
  2: "dragon/giant + beast",
  3: "dragon/giant", 4: "dragon/giant",
  5: "beast + huge", 6: "beast + huge", 7: "beast + huge", 8: "beast + huge", 9: "beast + huge", 10: "beast + huge", 11: "beast + huge", 12: "beast + huge"
};

const UNDEAD_MONSTERS = {
  1: "lich/vampire/mummy",
  2: "wight/wraith",
  3: "wisp/ghost/specter", 4: "wisp/ghost/specter",
  5: "skeleton/zombie/ghoul", 6: "skeleton/zombie/ghoul", 7: "skeleton/zombie/ghoul", 8: "skeleton/zombie/ghoul", 9: "skeleton/zombie/ghoul", 10: "skeleton/zombie/ghoul", 11: "skeleton/zombie/ghoul", 12: "skeleton/zombie/ghoul"
};

const UNUSUAL_MONSTERS = {
  1: "slime/ooze/jelly", 2: "slime/ooze/jelly", 3: "slime/ooze/jelly", 4: "slime/ooze/jelly",
  5: "plant/fungus/parasite", 6: "plant/fungus/parasite", 7: "plant/fungus/parasite", 8: "plant/fungus/parasite",
  9: "golem/homunculus", 10: "golem/homunculus",
  11: "fey/fairy", 12: "fey/fairy"
};

const BEASTLY_MONSTERS = {
  1: "beast + aberrance [p54]",
  2: "beast + element [p55]",
  3: "beast + oddity [p55]",
  4: "beast + ability [p54]", 5: "beast + ability [p54]", 6: "beast + ability [p54]", 7: "beast + ability [p54]",
  8: "beast + beast", 9: "beast + beast", 10: "beast + beast", 11: "beast + beast", 12: "beast + beast"
};

const WILD_HUMANOID_MONSTERS = {
  1: "ogre/troll/giant",
  2: "orc/hobgoblin/gnoll", 3: "orc/hobgoblin/gnoll", 4: "orc/hobgoblin/gnoll", 5: "orc/hobgoblin/gnoll",
  6: "goblin/kobold", 7: "goblin/kobold", 8: "goblin/kobold", 9: "goblin/kobold",
  10: "humanoid + oddity [p55]",
  11: "human + beast", 12: "human + beast"
};

// BEAST subcategories
const BEAST_SUBCATEGORIES = {
  1: "WATER-GOING", 2: "WATER-GOING",
  3: "AIRBORNE", 4: "AIRBORNE", 5: "AIRBORNE",
  6: "EARTHBOUND", 7: "EARTHBOUND", 8: "EARTHBOUND", 9: "EARTHBOUND", 10: "EARTHBOUND", 11: "EARTHBOUND", 12: "EARTHBOUND"
};

const WATER_GOING_BEASTS = {
  1: "whale",
  2: "squid/octopus",
  3: "dolphin/shark",
  4: "alligator/crocodile",
  5: "turtle",
  6: "fish",
  7: "crab/lobster",
  8: "frog/toad",
  9: "eel/snake",
  10: "clam/oyster/snail",
  11: "jelly/anemone",
  12: "insect"
};

const AIRBORNE_BEASTS = {
  1: "pteranodon",
  2: "condor",
  3: "eagle/owl",
  4: "hawk/falcon",
  5: "heron/crane/stork",
  6: "crow/raven",
  7: "gull/waterbird",
  8: "songbird/parrot",
  9: "chicken/duck/goose",
  10: "bee/wasp",
  11: "locust/dragonfly/moth",
  12: "mosquito/gnat/firefly"
};

const EARTHBOUND_BEASTS = {
  1: "mammoth/dinosaur",
  2: "ox/rhino",
  3: "bear/ape/gorilla",
  4: "deer/horse/camel",
  5: "cat/lion/panther",
  6: "boar/pig",
  7: "dog/fox/wolf",
  8: "vole/rat/weasel",
  9: "snake/lizard",
  10: "ant/centipede/scorpion",
  11: "snail/slug/worm",
  12: "termite/tick/louse"
};

// HUMANOID subcategories
const HUMANOID_SUBCATEGORIES = {
  1: "RARE",
  2: "UNCOMMON", 3: "UNCOMMON", 4: "UNCOMMON", 5: "UNCOMMON",
  6: "COMMON", 7: "COMMON", 8: "COMMON", 9: "COMMON", 10: "COMMON", 11: "COMMON", 12: "COMMON"
};

const RARE_HUMANOIDS = {
  1: "elf", 2: "elf", 3: "elf", 4: "elf", 5: "elf", 6: "elf", 7: "elf", 8: "elf", 9: "elf", 10: "elf", 11: "elf", 12: "elf"
};

const UNCOMMON_HUMANOIDS = {
  1: "human + beast", 2: "human + beast", 3: "human + beast",
  4: "dwarf", 5: "dwarf", 6: "dwarf", 7: "dwarf",
  8: "halfling", 9: "halfling", 10: "halfling", 11: "halfling", 12: "halfling"
};

const COMMON_HUMANOIDS = {
  1: "mixed", 2: "mixed", 3: "mixed",
  4: "human", 5: "human", 6: "human", 7: "human", 8: "human", 9: "human", 10: "human", 11: "human", 12: "human"
};

export interface DangerResult {
  category: string;
  subcategory: string;
  specificResult: string;
  rolls: {
    categoryRoll: number;
    subcategoryRoll: number;
    specificRoll: number;
  };
}

export interface DangerGenerationResult {
  success: boolean;
  dangers?: DangerResult[];
  count?: number;
  error?: string;
}

/**
 * Roll a 1d12
 */
function rollD12(): number {
  return Math.floor(Math.random() * 12) + 1;
}

/**
 * Generate a single danger using the 3-roll system
 */
export function generateSingleDanger(): DangerResult {
  // Roll 1: Category
  const categoryRoll = rollD12();
  const category = MAIN_CATEGORIES[categoryRoll as keyof typeof MAIN_CATEGORIES];

  // Roll 2: Subcategory
  const subcategoryRoll = rollD12();
  let subcategory: string;
  
  if (category === "UNNATURAL ENTITY") {
    subcategory = UNNATURAL_ENTITY_SUBCATEGORIES[subcategoryRoll as keyof typeof UNNATURAL_ENTITY_SUBCATEGORIES];
  } else if (category === "HAZARD") {
    subcategory = HAZARD_SUBCATEGORIES[subcategoryRoll as keyof typeof HAZARD_SUBCATEGORIES];
  } else { // CREATURE
    subcategory = CREATURE_SUBCATEGORIES[subcategoryRoll as keyof typeof CREATURE_SUBCATEGORIES];
    
    // For MONSTER, we need another subcategory roll
    if (subcategory === "MONSTER") {
      const monsterSubcategoryRoll = rollD12();
      subcategory = MONSTER_SUBCATEGORIES[monsterSubcategoryRoll as keyof typeof MONSTER_SUBCATEGORIES];
    }
    
    // For BEAST, we need another subcategory roll
    if (subcategory === "BEAST") {
      const beastSubcategoryRoll = rollD12();
      subcategory = BEAST_SUBCATEGORIES[beastSubcategoryRoll as keyof typeof BEAST_SUBCATEGORIES];
    }
    
    // For HUMANOID, we need another subcategory roll
    if (subcategory === "HUMANOID") {
      const humanoidSubcategoryRoll = rollD12();
      subcategory = HUMANOID_SUBCATEGORIES[humanoidSubcategoryRoll as keyof typeof HUMANOID_SUBCATEGORIES];
    }
  }

  // Roll 3: Specific result
  const specificRoll = rollD12();
  let specificResult: string;

  // Determine specific result based on category and subcategory
  if (category === "UNNATURAL ENTITY") {
    if (subcategory === "DIVINE") {
      specificResult = DIVINE_ENTITIES[specificRoll as keyof typeof DIVINE_ENTITIES];
    } else if (subcategory === "PLANAR") {
      specificResult = PLANAR_ENTITIES[specificRoll as keyof typeof PLANAR_ENTITIES];
    } else { // UNDEAD
      specificResult = UNDEAD_ENTITIES[specificRoll as keyof typeof UNDEAD_ENTITIES];
    }
  } else if (category === "HAZARD") {
    if (subcategory === "UNNATURAL") {
      specificResult = UNNATURAL_HAZARDS[specificRoll as keyof typeof UNNATURAL_HAZARDS];
    } else { // NATURAL
      specificResult = NATURAL_HAZARDS[specificRoll as keyof typeof NATURAL_HAZARDS];
    }
  } else { // CREATURE
    if (subcategory === "EXTRAPLANAR") {
      specificResult = EXTRAPLANAR_MONSTERS[specificRoll as keyof typeof EXTRAPLANAR_MONSTERS];
    } else if (subcategory === "LEGENDARY") {
      specificResult = LEGENDARY_MONSTERS[specificRoll as keyof typeof LEGENDARY_MONSTERS];
    } else if (subcategory === "UNDEAD") {
      specificResult = UNDEAD_MONSTERS[specificRoll as keyof typeof UNDEAD_MONSTERS];
    } else if (subcategory === "UNUSUAL") {
      specificResult = UNUSUAL_MONSTERS[specificRoll as keyof typeof UNUSUAL_MONSTERS];
    } else if (subcategory === "BEASTLY") {
      specificResult = BEASTLY_MONSTERS[specificRoll as keyof typeof BEASTLY_MONSTERS];
    } else if (subcategory === "WILD HUMANOID") {
      specificResult = WILD_HUMANOID_MONSTERS[specificRoll as keyof typeof WILD_HUMANOID_MONSTERS];
    } else if (subcategory === "WATER-GOING") {
      specificResult = WATER_GOING_BEASTS[specificRoll as keyof typeof WATER_GOING_BEASTS];
    } else if (subcategory === "AIRBORNE") {
      specificResult = AIRBORNE_BEASTS[specificRoll as keyof typeof AIRBORNE_BEASTS];
    } else if (subcategory === "EARTHBOUND") {
      specificResult = EARTHBOUND_BEASTS[specificRoll as keyof typeof EARTHBOUND_BEASTS];
    } else if (subcategory === "RARE") {
      specificResult = RARE_HUMANOIDS[specificRoll as keyof typeof RARE_HUMANOIDS];
    } else if (subcategory === "UNCOMMON") {
      specificResult = UNCOMMON_HUMANOIDS[specificRoll as keyof typeof UNCOMMON_HUMANOIDS];
    } else { // COMMON
      specificResult = COMMON_HUMANOIDS[specificRoll as keyof typeof COMMON_HUMANOIDS];
    }
  }

  return {
    category,
    subcategory,
    specificResult,
    rolls: {
      categoryRoll,
      subcategoryRoll,
      specificRoll
    }
  };
}

/**
 * Generate multiple dangers
 */
export function generateDangers(numDangers: number = 1): DangerGenerationResult {
  try {
    if (numDangers < 1 || numDangers > 10) {
      return {
        success: false,
        error: "Number of dangers must be between 1 and 10",
      };
    }

    const dangers: DangerResult[] = [];

    for (let i = 0; i < numDangers; i++) {
      dangers.push(generateSingleDanger());
    }

    return {
      success: true,
      dangers,
      count: dangers.length,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unexpected error occurred",
    };
  }
}
