/**
 * Steading Generator (TypeScript)
 *
 * Generates random settlements (steadings) with various characteristics.
 * Converted from Python D&D settlement generator script.
 */

import { rollDescriptorTable } from './mythic-meaning-table.js';

// Settlement types
export const CIVILIAN_SETTLEMENTS = ["Hamlet", "Village", "City"];
export const CLASS_SETTLEMENTS = ["Castle", "Tower", "Abbey"];
export const ALL_SETTLEMENT_TYPES = [...CIVILIAN_SETTLEMENTS, ...CLASS_SETTLEMENTS];

// Structure table for name generation
export const STRUCTURE_TABLE: Record<number, string> = {
  1: "BA", 2: "BF", 3: "BHF", 4: "BH", 5: "CA", 6: "CF", 7: "CH", 8: "D",
  9: "DA", 10: "DF", 11: "DH", 12: "D-by-sea", 13: "D-in-D", 14: "D-le-D",
  15: "D-les-bains", 16: "D-on-the-Nisme-on-the-hill", 17: "Dington",
  18: "Dsby", 19: "Dthorpe", 20: "Dton", 21: "EA", 22: "EB", 23: "ED",
  24: "EF", 25: "EH", 26: "GB", 27: "GD", 28: "Trou-au-D", 29: "Trou-de-D",
  30: "Val-D"
};

// Name generation tables
export const BUILDINGS_OUTDOORS = [
  "Abbey", "Arch", "Bank", "Barrack", "Bench", "Bridge", "Castle", "Chapel",
  "Church", "Court", "Cross", "Farm", "Forge", "Gate", "Hall", "Home",
  "Hospital", "House", "Inn", "Mall", "Market", "Mill", "Mine", "Post",
  "Road", "Stall", "Temple", "Tower", "Union", "Wall"
];

export const NOUNS = [
  "Acorn", "Angel", "Apple", "Atelier", "Autumn", "Axe", "Baker", "Bard",
  "Baron", "Barrow", "Berry", "Birch", "Bird", "Boar", "Book", "Bow",
  "Butcher", "Candle", "Cheese", "Cloud", "Corn", "Cow", "Crow", "Dawn",
  "Day", "Deer", "Demon", "Dragon", "Dream", "Dusk", "Dust", "Dwarf",
  "Eagle", "Elf", "Feather", "Fire", "Fish", "Flower", "Fog", "Fox",
  "Frog", "Ghost", "Gnoll", "Goblin", "Grave", "Halfling", "Hare", "Hawk",
  "Heaven", "Hell", "Hook", "Hope", "Horn", "Horse", "Hunter", "Knight",
  "Kobold", "Leaf", "Letter", "Lion", "Mage", "Moon", "Night", "Oak",
  "Orchid", "Pine", "Pork", "Rabbit", "Rain", "Ram", "River", "Robin",
  "Rose", "Salt", "Seed", "Sky", "Snake", "Snow", "Sorrow", "Spice",
  "Spring", "Squirrel", "Star", "Summer", "Sun", "Sword", "Thief", "Thorn",
  "Thunder", "Toad", "Tournament", "Tulip", "Violet", "Warrior", "Water",
  "Wind", "Winter", "Witch", "Wolf", "Wyvern"
];

export const FIRST_NAMES = [
  "Anna", "Arthur", "Bernard", "Charles", "Elizabeth", "Fanny", "George",
  "Helen", "Ilia", "John", "Kathleen", "King", "Louis", "Marcus", "Mary",
  "Nicholas", "Prince", "Princess", "Queen", "Tilly"
];

export const CITY_NAMES = [
  "Avery", "Bayley", "Carm", "Dun", "Ensal", "Folton", "Galgar", "Haye",
  "Idar", "Julvet", "Kanth", "Loy", "Marsan", "Nisme", "Ourar", "Peulin",
  "Rundur", "Solin", "Thaas", "Unvary", "Vanau", "Wark", "Yverne", "Zalek"
];

export const ADJECTIVES_COLORS = [
  "Bad", "Black", "Bloody", "Blue", "Bone", "Brave", "Brown", "Burnt",
  "Charming", "Coal", "Cold", "Copper", "Coral", "Crystal", "Damp", "Dark",
  "Dry", "Dusty", "False", "Fast", "Free", "Giant", "Glass", "Gold", "Golden",
  "Good", "Great", "Green", "Gray", "Hidden", "Hot", "Indigo", "Iron", "Light",
  "Long", "Metal", "Mithral", "Obsidian", "Purple", "Red", "Rock", "Royal",
  "Silent", "Silver", "Small", "Stone", "True", "White", "Wild", "Wine", "Yellow"
];

export const SETTLEMENT_TYPES_TABLE = [
  "Borough", "Bourg", "Camp", "Cester", "Citadel", "City", "County", "Dorf",
  "Ham", "Hamlet", "Haven", "Heim", "Keep", "Stead", "Town", "Village",
  "Ville", "Ward", "Wihr", "Worth"
];

export const DIRECTIONS_ADJECTIVES = [
  "Bottom", "Down", "East", "Far", "Fort", "Haute", "High", "Little",
  "Lost", "Low", "Mount", "New", "North", "Old", "Port", "Saint", "South",
  "Under", "Up", "West"
];

export const NATURE_TOPOGRAPHY = [
  "Bay", "Beach", "Bone", "Break", "Burrow", "Cliff", "Corner", "Creek",
  "Dale", "End", "Fall", "Field", "Forest", "Garden", "Glade", "Glen",
  "Grove", "Head", "Helm", "Hill", "Hold", "Hole", "Hollow", "Island",
  "Lake", "Land", "Limit", "Marsh", "Mont", "Moor", "Mount", "Mountain",
  "Park", "Pass", "Path", "Peak", "Plain", "Point", "Pool", "Rest", "Run",
  "Source", "Summit", "Trail", "Tree", "Valley", "View", "Way", "Well", "Wood"
];

export const DISPOSITIONS = [
  "Attack on sight",
  "Hostile", 
  "Hostile",
  "Neutral",
  "Neutral", 
  "Neutral",
  "Welcoming",
  "Welcoming",
  "Welcoming",
  "Enthusiastic"
];

// Castle specific name parts
export const CASTLE_FIRST_PARTS = [
  "Apple", "Battle", "Black", "Bleak", "Blood", "Bright", "Broken", "Cloud",
  "Dark", "Dawn", "Dragon", "Dusk", "Fire", "Gold", "Hammer", "Hawk",
  "Horse", "Ice", "Light", "Lion", "Moon", "Oak", "Raven", "Red",
  "River", "Rose", "Silver", "Star", "Stone", "Wind"
];

export const CASTLE_SECOND_PARTS = [
  "Bane", "Bridge", "Fall", "Fang", "Foot", "Heart", "Herd", "Hold",
  "Hook", "Keep", "Maw", "Mist", "Moor", "Peak", "Rock", "Shield",
  "Skull", "Song", "Soul", "Storm", "Thorn", "Vale", "Way", "Wood"
];

// Abbey saints for naming
export const ABBEY_SAINTS = [
  "Adélie", "Agath", "Alexia", "Aubreda", "Bardolphus", "Barthélemy",
  "Beatrix", "Bérengérius", "Bernard", "Cecilia", "Cédany", "Émelote",
  "Gaufridus", "Geffrey", "Géroldin", "Guillotin", "Jaclyn", "Jacomus",
  "Madeleine", "Marion", "Marjorie", "Martin", "Mary", "Melchior",
  "Paul", "Pétasse", "Peter", "Remy", "Thomasse", "Victor"
];

// Settlement interfaces
export interface BaseSettlement {
  category: "Civilian" | "Class-related";
  type: string;
  name: string;
  nameVariations: string[];
  disposition: string;
}

export interface HamletData extends BaseSettlement {
  type: "Hamlet";
  mainBuilding: string;
  peasantHouses: number;
  totalBuildings: number;
  layout: string;
  secret?: string;
  descriptors?: {
    adverb: string;
    adjective: string;
    description: string;
  };
}

export interface VillageData extends BaseSettlement {
  type: "Village";
  size: string;
  sizeMultiplier: number;
  population: number;
  occupation: string;
  layout: string;
  pointsOfInterest: {
    general: string[];
    special: string[];
  };
  defense: {
    features: string[];
    guards: number;
  };
  ruler: string;
  rulerDisposition: string;
  notableNPCs: string[];
  secret?: string;
  events?: {
    timing: string;
    event: string;
  };
}

export interface CityData extends BaseSettlement {
  type: "City";
  size: string;
  sizeMultiplier: number;
  population: number;
  occupations: string[];
  characteristics: string[];
  appearance: string;
  pointsOfInterest: {
    special: Array<{
      location: string;
      descriptors: {
        adverb: string;
        adjective: string;
        description: string;
      };
    }>;
  };
  buildingsOfInterest: Array<{
    building: string;
    descriptors: {
      adverb: string;
      adjective: string;
      description: string;
    };
  }>;
  defense: {
    walled: boolean;
    entrances?: string[];
    siegeSupplies?: string;
    guards: number;
  };
  ruler: string;
  rulerDisposition: string;
  notableNPCs: string[];
  events?: {
    timing: string;
    event: string;
  };
}

export interface CastleData extends BaseSettlement {
  type: "Castle";
  condition: string;
  keep: {
    shape: string;
    levels: number;
    defensiveFeature: string;
    nonDefensiveFeature: string;
    jails: {
      commoners: number;
      nobles: number;
    };
    siegeSupplies: number;
    treasure: Record<string, number>;
  };
  defenses: {
    features: string[];
    walls?: {
      shape: string;
      towers: number;
      towerShape: string;
      defensiveFeature: string;
      nonDefensiveFeature: string;
    };
    gatehouse?: {
      closure: string;
      towers: number;
    };
    moatEncounter?: string;
    garrison: {
      totalFighters: number;
      lordLevel: number;
      lieutenantLevel: number;
      bodyguardLevel: number;
      bodyguards: number;
      [key: string]: number;
    };
  };
  events?: {
    timing: string;
    event: string;
  };
}

export interface TowerData extends BaseSettlement {
  type: "Tower";
  levels: {
    aboveground: number;
    underground: number;
    total: number;
    hasBottom: boolean;
  };
  connection: string;
  appearance: {
    material: string;
    shape: string;
    details: string[];
  };
  insideAppearance: string;
  specialEquipment: string[];
  levelUsage: {
    ground: string;
    aboveground: string[];
    top: string;
    underground?: string[];
    bottom?: string;
  };
  inhabitants: {
    wizardLevel: number;
    apprenticeLevel?: number;
  };
}

export interface AbbeyData extends BaseSettlement {
  type: "Abbey";
  abbeySize: string;
  abbeyPopulation: {
    monksNuns: number;
    abbotLevel: number;
  };
  structureAndLand: {
    protection: string;
    outsideWalls: string;
    areaWithinWalls: string;
  };
  coreLocations: string[];
  additionalLocations: {
    garden: string[];
    infirmary: string[];
    religious: string[];
    other: string[];
  };
  activities: {
    farming: string[];
    workshop: string[];
    other: string[];
  };
  fame?: string;
  history: string;
  events?: {
    timing: string;
    event: string;
  };
}

export type GeneratedSteading = HamletData | VillageData | CityData | CastleData | TowerData | AbbeyData;

export class SteadingGenerator {
  private rollDie(sides: number): number {
    return Math.floor(Math.random() * sides) + 1;
  }

  private rollD6(): number {
    return this.rollDie(6);
  }

  private rollD12(): number {
    return this.rollDie(12);
  }

  private rollD20(): number {
    return this.rollDie(20);
  }

  private rollD30(): number {
    return this.rollDie(30);
  }

  private rollD100(): number {
    return this.rollDie(100);
  }

  private roll2D6(): number {
    return this.rollD6() + this.rollD6();
  }

  private getRandomElement<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
  }

  private getTableResult<T>(table: T[], roll: number): T {
    if (roll <= table.length) {
      return table[roll - 1];
    }
    return table[table.length - 1];
  }

  determineSettlementType(): { category: "Civilian" | "Class-related"; type: string } {
    if (Math.random() < 0.5) {
      return {
        category: "Civilian",
        type: this.getRandomElement(CIVILIAN_SETTLEMENTS)
      };
    } else {
      return {
        category: "Class-related", 
        type: this.getRandomElement(CLASS_SETTLEMENTS)
      };
    }
  }

  generateSettlementName(): { name: string; variations: string[] } {
    // Step 1: Roll on structure table
    const structureRoll = this.rollD30();
    const structure = STRUCTURE_TABLE[structureRoll] || "CF";

    // Step 2: Roll on component tables based on structure
    const nameParts: string[] = [];

    for (const char of structure) {
      if (char === 'A') {
        const roll = this.rollD30();
        nameParts.push(this.getTableResult(BUILDINGS_OUTDOORS, roll));
      } else if (char === 'B') {
        const roll = this.rollD100();
        nameParts.push(this.getTableResult(NOUNS, roll));
      } else if (char === 'C') {
        const roll = this.rollD20();
        nameParts.push(this.getTableResult(FIRST_NAMES, roll));
      } else if (char === 'D') {
        const roll = Math.floor(Math.random() * 24) + 1;
        nameParts.push(this.getTableResult(CITY_NAMES, roll));
      } else if (char === 'E') {
        const roll = this.rollD100();
        const adjRoll = Math.floor((roll - 1) / 2);
        if (adjRoll < ADJECTIVES_COLORS.length) {
          nameParts.push(ADJECTIVES_COLORS[adjRoll]);
        }
      } else if (char === 'F') {
        const roll = this.rollD20();
        nameParts.push(this.getTableResult(SETTLEMENT_TYPES_TABLE, roll));
      } else if (char === 'G') {
        const roll = this.rollD20();
        nameParts.push(this.getTableResult(DIRECTIONS_ADJECTIVES, roll));
      } else if (char === 'H') {
        const roll = this.rollD100();
        const natRoll = Math.floor((roll - 1) / 2);
        if (natRoll < NATURE_TOPOGRAPHY.length) {
          nameParts.push(NATURE_TOPOGRAPHY[natRoll]);
        }
      }
    }

    const baseName = nameParts.join(" ");
    return { name: baseName, variations: [baseName] };
  }

  generateCastleName(): string {
    const firstPart = this.getTableResult(CASTLE_FIRST_PARTS, this.rollD30());
    const secondPart = this.getTableResult(CASTLE_SECOND_PARTS, this.rollDie(24));
    return `Castle ${firstPart} ${secondPart}`;
  }

  generateAbbeyName(): string {
    const roll = this.rollDie(10);
    
    if (roll === 1) return "Abbey of Blessed-Land";
    if (roll === 2) return "Abbey of Clear-Water";
    if (roll === 3) return "Abbey of Fruitful-Garden";
    if (roll === 4) {
      const subOptions = ["Help", "Hope", "Relief"];
      const subRoll = this.rollDie(3);
      return `Abbey of Good-${subOptions[subRoll - 1]}`;
    }
    if (roll === 5) return "Abbey of Peaceful-Soul";
    if (roll === 6) return "Abbey of Sacred-Heart";
    if (roll === 7) {
      const subOptions = ["Chastity", "Mercy", "the Poor"];
      const subRoll = this.rollDie(3);
      return `Abbey of Our-Lady-of-${subOptions[subRoll - 1]}`;
    }
    
    // 8-10: Saint names
    const saint = this.getTableResult(ABBEY_SAINTS, this.rollD30());
    return `Abbey of Saint-${saint}`;
  }

  generateDisposition(): string {
    const roll = this.roll2D6();
    if (roll === 2) return "Attack on sight";
    if (roll >= 3 && roll <= 5) return "Hostile";
    if (roll >= 6 && roll <= 8) return "Neutral";
    if (roll >= 9 && roll <= 11) return "Welcoming";
    return "Enthusiastic";
  }

  generateHamlet(): HamletData {
    const { name, variations } = this.generateSettlementName();
    
    // Main building
    const mainBuildings = [
      "Brewery/Vineyard", "Chapel", "Farm/Ranch", "Manor", "Mill", "Mine",
      "Sawmill", "Shop", "Tavern", "Toll", "Tourney grounds", "Watchtower"
    ];
    const mainBuilding = this.getTableResult(mainBuildings, this.rollD12());
    
    // Peasant houses
    const peasantHouses = Math.max(0, this.rollD6() - 1);
    
    // Layout
    const layouts = ["Heap", "Round", "Row"];
    const layout = this.getTableResult(layouts, this.rollDie(3));
    
    // Secret (1/6 chance)
    let secret: string | undefined;
    if (this.rollD6() === 1) {
      const secrets = [
        "Cannibals", "Cultists", "Dopplegangers",
        "Inbred", "Murderers", "Lycanthropes/Vampires"
      ];
      secret = this.getTableResult(secrets, this.rollD6());
    }

    // Generate descriptors for narrative flavor
    const descriptorResult = rollDescriptorTable();
    const descriptors = {
      adverb: descriptorResult.adverb,
      adjective: descriptorResult.adjective,
      description: descriptorResult.description
    };

    return {
      category: "Civilian",
      type: "Hamlet",
      name,
      nameVariations: variations,
      disposition: this.generateDisposition(),
      mainBuilding,
      peasantHouses,
      totalBuildings: 1 + peasantHouses,
      layout,
      secret,
      descriptors
    };
  }

  generateVillage(): VillageData {
    const { name, variations } = this.generateSettlementName();
    
    // Size and population
    const sizeRoll = this.rollD6();
    let size: string, sizeMultiplier: number;
    if (sizeRoll >= 1 && sizeRoll <= 3) {
      size = "Medium";
      sizeMultiplier = 2;
    } else if (sizeRoll >= 4 && sizeRoll <= 5) {
      size = "Small";
      sizeMultiplier = 1;
    } else {
      size = "Big";
      sizeMultiplier = 3;
    }
    const population = sizeMultiplier * 50;
    
    // Occupation
    let occupation = "Farming and cattle breeding only";
    if (this.rollD6() === 1) {
      const occupations = [
        "Brewing (breweries) or Viticulture (vineyards)",
        "Fishing (fisheries)", "Hunting (tanneries)",
        "Logging (sawmills)", "Mining (mines)", "Pottery (workshops)"
      ];
      occupation = this.getTableResult(occupations, this.rollD6());
    }
    
    // Layout
    const layouts = ["Heap", "Round", "Row"];
    const layout = this.getTableResult(layouts, this.rollDie(3));
    
    // Points of interest
    const general = ["Blacksmith", "Market", "Tavern", "Well"];
    const specialLocations = [
      "Abandoned building", "Apothecary", "Bakery", "Burnt/Ruined building",
      "Butcher", "Castle-farm", "Church", "Famous person's house",
      "General store", "Graveyard", "Guard post", "Guildhouse",
      "Gypsy wagon", "Horse stables", "Library", "Mill",
      "Monument/Memorial", "Orchard", "School", "Tailor"
    ];
    
    // Special locations - Roll 1d20 as many times as village size
    const special: string[] = [];
    for (let i = 0; i < sizeMultiplier; i++) {
      const roll = this.rollD20();
      special.push(specialLocations[roll - 1]);
    }
    
    // Defense - Roll 1d8 as many times as village size
    const defenses: string[] = [];
    for (let i = 0; i < sizeMultiplier; i++) {
      const defenseOptions = [
        "Wooden palisade", "Wooden palisade", "Wooden palisade",
        "Motte (= mound)", "Motte (= mound)", "Chevaux de frise",
        "Moat (= trench)", "Watchtowers"
      ];
      defenses.push(this.getTableResult(defenseOptions, this.rollDie(8)));
    }

    // Guards - Roll 1d3+3 and multiply by village size
    const guardCount = (this.rollDie(3) + 3) * sizeMultiplier;
    
    // Ruler
    const rulers = [
      "Bandits", "Council", "Lycanthrope", "Mayor",
      "Merchant", "Priest", "Village elder", "Witch"
    ];
    const ruler = this.getTableResult(rulers, this.rollDie(8));
    
    // Disposition
    const villagerDisposition = this.generateDisposition();
    let rulerDisposition = villagerDisposition;
    
    const dispositionRoll = this.rollD6();
    if (dispositionRoll >= 5) {
      // Opposite disposition
      const opposites: Record<string, string> = {
        "Attack on sight": "Enthusiastic",
        "Hostile": "Welcoming",
        "Neutral": this.rollDie(3) <= 3 ? "Hostile" : "Welcoming",
        "Welcoming": "Hostile",
        "Enthusiastic": "Attack on sight"
      };
      rulerDisposition = opposites[villagerDisposition] || villagerDisposition;
    }
    
    // Notable NPCs
    const npcOptions = [
      "Aggressive guard", "Annoying minstrel", "Bandit in disguise",
      "Beggar who knows a lot", "Curious waitress", "Cute dog",
      "Frightened peasant", "Lonely widow", "Misunderstood witch",
      "Old fool/hag", "One-handed lumberjack", "Retired mercenary",
      "Seasoned adventurer", "Sick child", "Stubborn magician",
      "Talented craftsman", "Traveling merchant", "Troubled hunter",
      "Vampire/Werewolf hunter", "Village idiot"
    ];

    // Notable NPCs - Roll 1d20 as many times as village size
    const notableNPCs: string[] = [];
    for (let i = 0; i < sizeMultiplier; i++) {
      const roll = this.rollD20();
      notableNPCs.push(npcOptions[roll - 1]);
    }

    // Secret (1/6 chance)
    let secret: string | undefined;
    if (this.rollD6() === 1) {
      const secrets = [
        "Animals turned human", "Curse", "Elder god cult", "Eternal youth",
        "Hidden treasure", "Hiding outlaws", "Hivemind", "Inability to leave",
        "Pact with a demon", "Sadistic rituals", "Secret society", "Underground galleries"
      ];
      secret = this.getTableResult(secrets, this.rollD12());
    }
    
    // Events (1/6 chance)
    let events: { timing: string; event: string } | undefined;
    if (this.rollD6() === 1) {
      const timingRoll = this.rollD6();
      const timing = timingRoll === 1 ? "Ended earlier" : 
                   timingRoll >= 2 && timingRoll <= 4 ? "Is happening now" : 
                   "Will take place in the future";
      
      const eventOptions = [
        "Adventurers passing by", "Announcement by a crier", "Ceremony (wedding, etc.)",
        "Controlled by monsters", "Disappearances", "Famine", "Festival/Fair",
        "Fire", "Looting", "Market day", "Plague", "Visit of a notable (lord, etc.)"
      ];
      const event = this.getTableResult(eventOptions, this.rollD12());
      
      events = { timing, event };
    }

    return {
      category: "Civilian",
      type: "Village",
      name,
      nameVariations: variations,
      disposition: villagerDisposition,
      size,
      sizeMultiplier,
      population,
      occupation,
      layout,
      pointsOfInterest: {
        general,
        special
      },
      defense: {
        features: Array.from(new Set(defenses)),
        guards: guardCount
      },
      ruler,
      rulerDisposition,
      notableNPCs,
      secret,
      events
    };
  }

  generateCity(): CityData {
    const { name, variations } = this.generateSettlementName();
    
    // Size and population
    const sizeRoll = this.rollD6();
    let size: string, sizeMultiplier: number;
    if (sizeRoll >= 1 && sizeRoll <= 3) {
      size = "Medium";
      sizeMultiplier = 3;
    } else if (sizeRoll >= 4 && sizeRoll <= 5) {
      size = "Small";
      sizeMultiplier = 2;
    } else {
      size = "Big";
      sizeMultiplier = 4;
    }
    const population = sizeMultiplier * 500;
    
    // Main occupations
    const occupationOptions = [
      "Brewing (breweries) or Viticulture (vineyard)",
      "Cattle breeding (farms, meadows)",
      "Farming crops (farms, fields)",
      "Fishing (fishery)",
      "Hunting (tannery)",
      "Logging (sawmills)",
      "Metallurgy (forge, foundry)",
      "Mining (mine)",
      "Pottery (pottery shop)",
      "Trading (caravanserai/port)"
    ];
    
    const occupations: string[] = [];
    for (let i = 0; i < sizeMultiplier; i++) {
      const roll = this.rollDie(10);
      occupations.push(occupationOptions[roll - 1]);
    }
    
    // Characteristics
    const characteristicOptions = [
      "Nothing", "Nothing", "Nothing", "Nothing", "Nothing",
      "Corrupt", "Crowded", "Destroyed", "Dry", "Filthy",
      "Holy city", "Humid", "Narrow", "Noisy", "Open",
      "Renowned", "Silent", "Tiered", "Unsafe", "Windy"
    ];
    
    const characteristics: string[] = [];
    let attempts = 0;
    while (characteristics.length < 2 && attempts < 10) {
      const roll = this.rollD20();
      const char = characteristicOptions[roll - 1];
      if (char !== "Nothing" && !characteristics.includes(char)) {
        characteristics.push(char);
      }
      attempts++;
    }
    
    // Appearance
    const appearanceOptions = [
      "Cluttered", "Cobblestone", "Colorful", "Covered with art", "Dark",
      "Eerie", "Flowers", "Geometric", "Huge windows", "Light",
      "Lots of canals", "Lots of stairs", "Misaligned buildings", "Red bricks", "Stark",
      "Tall towers", "White marble", "Wondrous", "Wooden"
    ];
    
    const appearanceRoll = this.rollD20();
    let appearance: string;
    if (appearanceRoll === 20) {
      const colorSchemes = ["Grayscale", "Black and white", "Blue and white", "Sand and terracotta"];
      appearance = `Specific color scheme: ${this.getRandomElement(colorSchemes)}`;
    } else {
      appearance = appearanceOptions[appearanceRoll - 1];
    }
    
    // Points of interest
    
    const specialLocationOptions = [
      "Abandoned building", "Aqueduct", "Archaeological site", "Bridge",
      "Burnt/Ruined building", "Calvary", "Carriage stop", "Construction site",
      "Famous street", "Fighting pit", "Fountain", "Gallows", "Junkyard",
      "Market hall", "Military cemetery", "Monument/Memorial", "Park",
      "Pilgrimage", "Plaza", "Slave pit"
    ];
    
    const special: Array<{
      location: string;
      descriptors: {
        adverb: string;
        adjective: string;
        description: string;
      };
    }> = [];
    for (let i = 0; i < sizeMultiplier; i++) {
      const roll = this.rollD20();
      const location = specialLocationOptions[roll - 1];
      const descriptorResult = rollDescriptorTable();

      special.push({
        location,
        descriptors: {
          adverb: descriptorResult.adverb,
          adjective: descriptorResult.adjective,
          description: descriptorResult.description
        }
      });
    }
    
    // Buildings of interest
    const buildingsOfInterest: Array<{
      building: string;
      descriptors: {
        adverb: string;
        adjective: string;
        description: string;
      };
    }> = [];
    for (let i = 0; i < sizeMultiplier * 3; i++) {
      const roll = this.rollD20();
      let building = "";

      if (roll >= 1 && roll <= 3) {
        // Housing - Roll 1d10 for regular city housing only and 1d20 for all types
        const regularHousingRoll = this.rollDie(10);
        const housingOptions = [
          "Studio", "One bedroom apartment", "Two bedrooms apartment", "Bungalow",
          "Maisonnette", "Penthouse", "Mansion", "Hotel room", "Tower",
          "Boarding house", "Tent", "Houseboat", "Under a bridge", "Shanty",
          "Squat", "Underground bunker", "Caravan", "Treehouse", "Basement", "Hut"
        ];
        const detail = this.getTableResult(housingOptions, regularHousingRoll <= 10 ? regularHousingRoll : this.rollD20());
        building = `Housing: ${detail}`;
      } else if (roll >= 4 && roll <= 10) {
        // Business - Use exact business table from requirements (1-100)
        const businessOptions = [
          "Alchemist", "Alchemist", "Animal trainer", "Animal trainer",
          "Apothecary", "Apothecary", "Armorer", "Armorer",
          "Artist", "Artist", "Astronomer", "Astronomer",
          "Baker", "Baker", "Bank", "Bank",
          "Blacksmith", "Blacksmith", "Bookmaker", "Bookmaker",
          "Botanist", "Botanist", "Brewery", "Brewery",
          "Brothel", "Brothel", "Butcher", "Butcher",
          "Candlemaker", "Candlemaker", "Candy shop", "Candy shop",
          "Carpenter", "Carpenter", "Cartographer", "Cartographer",
          "Casino", "Casino", "Cheesemaker", "Cheesemaker",
          "Doctor", "Doctor", "Dollmaker", "Dollmaker",
          "Florist", "Florist", "Fortuneteller", "Fortuneteller",
          "Foundry", "Foundry", "General store", "General store",
          "Glassblower", "Glassblower", "Hairdresser", "Hairdresser",
          "Hardware store", "Hardware store", "Jeweler", "Jeweler",
          "Lawyer", "Lawyer", "Locksmith", "Locksmith",
          "Pawnshop", "Pawnshop", "Perfumer", "Perfumer",
          "Pet shop", "Pet shop", "Potter", "Potter",
          "Restaurant", "Restaurant", "Sage", "Sage",
          "Sauna", "Sauna", "Scribe", "Scribe",
          "Siege engines seller", "Siege engines seller", "Slaughterhouse", "Slaughterhouse",
          "Stables", "Stables", "Tailor", "Tailor",
          "Tanner", "Tanner", "Tapestry maker", "Tapestry maker",
          "Tavern", "Tavern", "Tinker", "Tinker",
          "Veterinarian", "Veterinarian", "Wine shop", "Wine shop"
        ];
        const business = this.getTableResult(businessOptions, this.rollD100());
        building = `Business: ${business}`;
      } else if (roll >= 11 && roll <= 13) {
        // Official buildings
        const officialOptions = [
          "Arcane university", "Archives", "Asylum", "City hall", "Conservatory",
          "Dispensary", "Embassy", "Fire station", "Mayor office", "Meteorological institute",
          "Mint", "Palace", "Post office", "School", "Sewers", "Tax office",
          "Tourist office", "Tribunal", "University", "Water tower"
        ];
        const detail = this.getTableResult(officialOptions, this.rollD20());
        building = `Official: ${detail}`;
      } else if (roll === 14) {
        // Religious buildings
        const religiousOptions = [
          "Catacombs", "Cathedral", "Church", "Covent", "Mausoleum", "Monastery",
          "Necropolis", "Orphanage", "Sanctuary", "Seminar", "Shrine", "Ziggurat"
        ];
        const detail = this.getTableResult(religiousOptions, this.rollD12());
        building = `Religious: ${detail}`;
      } else if (roll >= 15 && roll <= 17) {
        // Public buildings
        const publicOptions = [
          "Aquarium", "Arena", "Art gallery", "Auction hall", "Botanical garden",
          "Event center", "Gymnasium", "Historical building", "House for sale",
          "Hospital", "Library", "Morgue", "Museum", "Observatory", "Opera",
          "Guildhouse", "Public baths", "Theater", "Workshop", "Zoo"
        ];
        const detail = this.getTableResult(publicOptions, this.rollD20());
        building = `Public: ${detail}`;
      } else {
        // Military buildings (18-20)
        const militaryOptions = [
          "Armory", "Barracks", "Canteen", "Citadel", "Fort", "Guard post",
          "Guard tower", "Jail", "Menagerie", "Military archives", "Military hospital",
          "Military school", "Military surplus", "Prison", "Recruitment center",
          "Siege workshop", "Spy academy", "Training hall", "Underground vault", "Warehouse"
        ];
        const detail = this.getTableResult(militaryOptions, this.rollD20());
        building = `Military: ${detail}`;
      }

      // Generate mythic descriptors for each building
      const descriptorResult = rollDescriptorTable();
      buildingsOfInterest.push({
        building,
        descriptors: {
          adverb: descriptorResult.adverb,
          adjective: descriptorResult.adjective,
          description: descriptorResult.description
        }
      });
    }
    
    // Defense
    const isWalled = this.rollDie(2) === 1;
    let defenseInfo: CityData['defense'] = {
      walled: isWalled,
      guards: (this.rollDie(3) + 3) * 5 * sizeMultiplier
    };
    
    if (isWalled) {
      const entrances: string[] = [];
      const availableDirections = ["North", "East", "South", "West"];

      for (let i = 0; i < sizeMultiplier; i++) {
        // Roll 1d4 per entrance to know which cardinal point (reroll any duplicate)
        let direction: string;
        let attempts = 0;
        do {
          const directionRoll = this.rollDie(4);
          direction = ["North", "East", "South", "West"][directionRoll - 1];
          attempts++;
        } while (entrances.some(e => e.includes(direction)) && attempts < 10);

        // If we couldn't find a unique direction after 10 attempts, just use any available
        if (entrances.some(e => e.includes(direction))) {
          const usedDirections = entrances.map(e => e.split(' ')[0]);
          const remaining = availableDirections.filter(d => !usedDirections.includes(d));
          direction = remaining.length > 0 ? remaining[0] : direction;
        }

        const entranceRoll = this.rollD6();
        let entranceType: string;
        if (entranceRoll >= 1 && entranceRoll <= 3) {
          entranceType = "Wooden doors";
        } else if (entranceRoll >= 4 && entranceRoll <= 5) {
          entranceType = "Portcullis";
        } else {
          entranceType = "Both";
        }

        entrances.push(`${direction} entrance: ${entranceType} (guarded by 2 towers)`);
      }
      
      defenseInfo.entrances = entrances;
      defenseInfo.siegeSupplies = `${this.roll2D6()} months`;
    }
    
    // Ruler
    const rulers = [
      "Noble", "Noble", "Clergy", "Council", "Mayor",
      "Merchants' guild", "Thieves' guild", "Vampire"
    ];
    const ruler = this.getTableResult(rulers, this.rollDie(8));
    
    // Disposition
    const citizenDisposition = this.generateDisposition();
    let rulerDisposition = citizenDisposition;
    
    const dispositionRoll = this.rollD6();
    if (dispositionRoll >= 5) {
      const opposites: Record<string, string> = {
        "Attack on sight": "Enthusiastic",
        "Hostile": "Welcoming",
        "Neutral": this.rollDie(3) <= 3 ? "Hostile" : "Welcoming",
        "Welcoming": "Hostile",
        "Enthusiastic": "Attack on sight"
      };
      rulerDisposition = opposites[citizenDisposition] || citizenDisposition;
    }
    
    // Notable NPCs
    const npcOptions = [
      "Aggressive guard", "Annoying minstrel", "Bandit in disguise",
      "Beggar who knows a lot", "Clever orphan", "Corrupted official",
      "Curious waitress", "Distracted scholar", "Haughty nobleman",
      "Lonely widow", "Nervous tax collector", "Penniless merchant",
      "Princess on the run", "Retired mercenary", "Seasoned adventurer",
      "Shady diplomat", "Stubborn wizard", "Talented craftsman",
      "Traveler from a distant land", "Vampire/Werewolf hunter"
    ];
    
    const notableNPCs: string[] = [];
    for (let i = 0; i < sizeMultiplier; i++) {
      const roll = this.rollD20();
      notableNPCs.push(npcOptions[roll - 1]);
    }
    
    // Events (1/6 chance)
    let events: { timing: string; event: string } | undefined;
    if (this.rollD6() === 1) {
      const timingRoll = this.rollD6();
      const timing = timingRoll === 1 ? "Ended earlier" :
                   timingRoll >= 2 && timingRoll <= 4 ? "Is happening now" :
                   "Will take place in the future";
      
      const eventOptions = [
        "Announcement by a crier", "Assassination", "Ceremony (wedding, etc.)",
        "Disappearances", "Festival/Fair", "Fire", "Market day", "Plague",
        "Siege/Looting", "Tournament", "Vermin invasion", "Visit of a religious person"
      ];
      const event = this.getTableResult(eventOptions, this.rollD12());
      
      events = { timing, event };
    }

    return {
      category: "Civilian",
      type: "City",
      name,
      nameVariations: variations,
      disposition: citizenDisposition,
      size,
      sizeMultiplier,
      population,
      occupations,
      characteristics,
      appearance,
      pointsOfInterest: {
        special
      },
      buildingsOfInterest,
      defense: defenseInfo,
      ruler,
      rulerDisposition,
      notableNPCs,
      events
    };
  }

  generateCastle(): CastleData {
    const name = this.generateCastleName();
    
    // Condition
    const conditions = ["Perfect", "Worn", "Worn", "Aged", "Aged", "Crumbling"];
    const condition = this.getTableResult(conditions, this.rollD6());
    
    // Keep details
    const keepShapes = ["Square/Rectangle", "Square/Rectangle", "Square/Rectangle", "Round", "Round", "Shell (= hollow cylinder)"];
    const keepShape = this.getTableResult(keepShapes, this.rollD6());
    const keepLevels = this.rollDie(3) + 1;
    
    const defensiveFeatures = [
      "None", "None", "None", "None", "None", "None",
      "Ballista", "Boiling oil", "Catapult", "Hoarding", "Iron spikes", "Piles of rocks"
    ];
    const keepDefensiveFeature = this.getTableResult(defensiveFeatures, this.rollD12());
    
    const nonDefensiveFeatures = [
      "None", "None", "None", "None", "None", "None",
      "Banners/Flags", "Gargoyles", "Heads/Bodies", "Overgrown", "Religious symbols", "Secret passage"
    ];
    const keepNonDefensiveFeature = this.getTableResult(nonDefensiveFeatures, this.rollD12());
    
    // Jails and supplies
    const commonersInJail = this.roll2D6();
    const noblesInJail = this.rollDie(3);
    const siegeSupplies = this.roll2D6();
    
    // Treasure (following exact requirements)
    const treasure: Record<string, number> = {};

    // 50% chance of 1d4×10000 gp
    if (this.rollD100() <= 50) {
      treasure.gold = this.rollDie(4) * 10000;
    }

    // 50% chance of 1d6×5000 gp
    if (this.rollD100() <= 50) {
      treasure.additionalGold = this.rollDie(6) * 5000;
    }

    // 25% chance of 3d6 gems
    if (this.rollD100() <= 25) {
      treasure.gems = this.rollDie(6) + this.rollDie(6) + this.rollDie(6); // 3d6
    }

    // 25% chance of 1d10 pieces of jewelry
    if (this.rollD100() <= 25) {
      treasure.jewelry = this.rollDie(10);
    }

    // 15% chance of 4 magic items + 1d6 scrolls
    if (this.rollD100() <= 15) {
      treasure.magicItems = 4;
      treasure.scrolls = this.rollD6();
    }
    
    // Defenses
    const numDefenses = this.rollDie(4);
    const defenseTypes = [
      "Stone walls and towers", "Stone walls and towers", "Stone walls and towers",
      "Moat (= trench)", "Motte (= mound)", "Wooden palisade"
    ];
    
    const defenseFeatures: string[] = [];
    for (let i = 0; i < numDefenses; i++) {
      const roll = this.rollD6();
      defenseFeatures.push(defenseTypes[roll - 1]);
    }
    
    const uniqueDefenses = Array.from(new Set(defenseFeatures));
    
    // Garrison
    const totalFighters = this.rollDie(6) * 10 + this.rollDie(6) * 10 + this.rollDie(6) * 10; // 3d6 × 10
    const lordLevel = 9 + Math.floor(totalFighters / 60);
    
    const garrison = {
      totalFighters,
      lordLevel,
      lieutenantLevel: lordLevel - 2,
      bodyguardLevel: lordLevel - 3,
      bodyguards: 6,
      cavaliersHeavy: Math.floor(totalFighters * 0.10),
      cavaliersMediumSpear: Math.floor(totalFighters * 0.10),
      cavaliersMediumBow: Math.floor(totalFighters * 0.10),
      footmenSword: Math.floor(totalFighters * 0.40),
      footmenPolearm: Math.floor(totalFighters * 0.10),
      footmenCrossbow: Math.floor(totalFighters * 0.10),
      footmenLongbow: Math.floor(totalFighters * 0.10)
    };
    
    // Additional defense details
    let walls, gatehouse, moatEncounter;
    
    if (uniqueDefenses.includes("Stone walls and towers")) {
      const wallShapes = [
        { shape: "Square/Rectangle", towers: 4 },
        { shape: "Trapezium", towers: 4 },
        { shape: "Pentagon", towers: 5 },
        { shape: "Hexagon", towers: 6 },
        { shape: "Octagon", towers: 8 },
        { shape: "Star", towers: 10 },
        { shape: "Cross", towers: 12 },
        { shape: "Circle", towers: this.rollDie(3) + 3 }
      ];
      
      const wallInfo = wallShapes[this.rollDie(8) - 1];
      const towerShapes = ["Square", "Square", "Square", "Round", "Round", "Polygonal (3, 6 or 8 sides)"];
      const towerShape = this.getTableResult(towerShapes, this.rollD6());
      
      walls = {
        shape: wallInfo.shape,
        towers: wallInfo.towers,
        towerShape,
        defensiveFeature: this.getTableResult(defensiveFeatures, this.rollD12()),
        nonDefensiveFeature: this.getTableResult(nonDefensiveFeatures, this.rollD12())
      };
      
      // Gatehouse
      const closures = [
        "Portcullis and wooden door", "Portcullis and wooden door", "Portcullis and wooden door",
        "Drawbridge", "Drawbridge", "Both"
      ];
      gatehouse = {
        closure: this.getTableResult(closures, this.rollD6()),
        towers: 2
      };
    }
    
    if (uniqueDefenses.includes("Moat (= trench)")) {
      const encounters = ["Nothing", "Nothing", "Nothing", "Nothing", "Crocodiles", "Electric eels", "Leeches", "Piranha"];
      moatEncounter = this.getTableResult(encounters, this.rollDie(8));
    }
    
    // Events (1/6 chance)
    let events: { timing: string; event: string } | undefined;
    if (this.rollD6() === 1) {
      const timingRoll = this.rollD6();
      const timing = timingRoll === 1 ? "Ended earlier" :
                   timingRoll >= 2 && timingRoll <= 4 ? "Is happening now" :
                   "Will take place in the future";
      
      const eventOptions = [
        "Assassination", "Big HD monster attack", "Ceremony (wedding, etc.)",
        "Festival/Fair", "Fire", "Plague", "Resources/Gold dwindling",
        "Rival lord scouting", "Small HD monsters wanting to establish a lair nearby",
        "Siege/Looting", "Tournament", "Visit of a notable person"
      ];
      const event = this.getTableResult(eventOptions, this.rollD12());
      
      events = { timing, event };
    }

    return {
      category: "Class-related",
      type: "Castle",
      name,
      nameVariations: [name],
      disposition: this.generateDisposition(),
      condition,
      keep: {
        shape: keepShape,
        levels: keepLevels,
        defensiveFeature: keepDefensiveFeature,
        nonDefensiveFeature: keepNonDefensiveFeature,
        jails: {
          commoners: commonersInJail,
          nobles: noblesInJail
        },
        siegeSupplies: siegeSupplies,
        treasure
      },
      defenses: {
        features: uniqueDefenses,
        walls,
        gatehouse,
        moatEncounter,
        garrison
      },
      events
    };
  }

  generateTower(): TowerData {
    const { name, variations } = this.generateSettlementName();
    
    // Levels
    const abovegroundLevels = this.rollD12();
    const undergroundRoll = this.rollD12();
    let undergroundLevels = 0;
    
    if (undergroundRoll >= 7 && undergroundRoll <= 8) undergroundLevels = 1;
    else if (undergroundRoll >= 9 && undergroundRoll <= 10) undergroundLevels = 2;
    else if (undergroundRoll === 11) undergroundLevels = 3;
    else if (undergroundRoll === 12) undergroundLevels = 4;
    
    const hasBottom = undergroundLevels > 0;
    const totalLevels = Math.max(3, abovegroundLevels + undergroundLevels + 1 + (hasBottom ? 1 : 0));
    
    // Connection
    const connections = [
      "Staircase", "Staircase", "Staircase",
      "Spiral staircase", "Spiral staircase", "Spiral staircase",
      "Ladder", "Ladder", "Elevator", "Elevator",
      "Magic elevator", "Teleportation portals"
    ];
    const connection = this.getTableResult(connections, this.rollD12());
    
    // Appearance
    const materials = [
      "Cobblestone", "Cobblestone", "Cobblestone", "Cobblestone", "Cobblestone",
      "Wood", "Wood", "Wood", "Wood", "Wood",
      "Bricks", "Bricks", "Bricks",
      "Sandstone", "Sandstone", "Sandstone",
      "Limestone", "Limestone",
      "Marble", "Metal"
    ];
    const material = this.getTableResult(materials, this.rollD20());
    
    const shapes = [
      "Square", "Square", "Square", "Square", "Square",
      "Round", "Round", "Round", "Round", "Round",
      "Conical", "Conical", "Conical",
      "Tilted", "Tilted", "Tilted",
      "Asymmetrical", "S-shaped", "Stacked", "Twisted"
    ];
    const shape = this.getTableResult(shapes, this.rollD20());
    
    const detailOptions = [
      "Nothing", "Nothing", "Nothing", "Nothing", "Nothing", "Nothing", "Nothing", "Nothing", "Nothing", "Nothing",
      "Balcony", "Banners", "Battlements", "Climbing plants", "Flags", "Moldings", "Porch", "Stained glass", "Statues/Gargoyles", "Turrets"
    ];
    
    const details: string[] = [];
    for (let i = 0; i < this.rollDie(3); i++) {
      const detail = this.getTableResult(detailOptions, this.rollD20());
      if (detail !== "Nothing" && !details.includes(detail)) {
        details.push(detail);
      }
    }
    
    // Inside appearance
    const insideAppearances = [
      "Colorful", "Cozy", "Dark", "Dusty", "Extravagant",
      "Luxurious", "Moldy", "Old fashioned", "Stark", "Well decorated"
    ];
    const insideAppearance = this.getTableResult(insideAppearances, this.rollDie(10));
    
    // Special equipment
    const equipmentOptions = [
      "Nothing", "Nothing", "Nothing", "Nothing", "Nothing", "Nothing", "Nothing", "Nothing", "Nothing", "Nothing",
      "Acoustic tube", "Alarm system", "Dumbwaiter", "Emergency ladder/stairs", "Garbage chute",
      "Oversized pet doors", "Pneumatic tubes", "Secret passage", "Slide", "Ventilation system"
    ];
    
    const specialEquipment: string[] = [];
    for (let i = 0; i < this.rollDie(3); i++) {
      const item = this.getTableResult(equipmentOptions, this.rollD20());
      if (item !== "Nothing" && !specialEquipment.includes(item)) {
        specialEquipment.push(item);
      }
    }
    
    // Level usage
    const generateLevelUsage = (levelType: string): string => {
      if (levelType === "ground") {
        const options = [
          "Empty and dusty", "Fortified room", "Hallway", "Reception desk",
          "Ruined room", "Shop/Tavern", "Trapped room", "Unloading room"
        ];
        return this.getTableResult(options, this.rollDie(8));
      } else if (levelType === "aboveground") {
        const options = [
          "Abandoned/Cursed level", "Archives", "Armory", "Bedroom(s)",
          "Kitchen and dining room", "Laboratory", "Library", "Meeting room",
          "Museum", "Music room/Art room", "Office/Study", "Storage room"
        ];
        return this.getTableResult(options, this.rollD12());
      } else if (levelType === "top") {
        const options = [
          "Aviary", "Beacon", "Duel platform", "Foghorn", "Golden apple tree",
          "Greenhouse", "High security prison", "Landing platform", "Lightning rod",
          "Lookout post", "Magic searchlight", "Monster nest", "Observatory",
          "Panic room", "Ruined/Overgrown", "Siege engine", "Throne room",
          "Treasure room", "Weather station", "Windmill"
        ];
        return this.getTableResult(options, this.rollD20());
      } else if (levelType === "underground") {
        const options = [
          "Abandoned/Cursed level", "Alchemy lab", "Cellar", "Chapel",
          "Forge", "Menagerie", "Mushroom cave", "Prison", "Rituals room",
          "Storage", "Torture room", "Wine cellar"
        ];
        return this.getTableResult(options, this.rollD12());
      } else if (levelType === "bottom") {
        const options = [
          "Abyss", "Ancient ruins", "Arena", "Boudoir", "Creature mouth",
          "Excavation site", "Flesh pit", "Flooded pit", "Gambling den",
          "Magic portal", "Magic well", "Mine", "Oubliette",
          "Tunnel to the center of the planet", "Secret society headquarters",
          "Tomb", "Tunnel to a lair", "Tunnel to the surface", "Vault", "Well"
        ];
        return this.getTableResult(options, this.rollD20());
      }
      return "Unknown";
    };
    
    const levelUsage: TowerData['levelUsage'] = {
      ground: generateLevelUsage("ground"),
      aboveground: [],
      top: generateLevelUsage("top")
    };
    
    for (let i = 0; i < abovegroundLevels; i++) {
      levelUsage.aboveground.push(generateLevelUsage("aboveground"));
    }
    
    if (undergroundLevels > 0) {
      levelUsage.underground = [];
      for (let i = 0; i < undergroundLevels; i++) {
        levelUsage.underground.push(generateLevelUsage("underground"));
      }
    }
    
    if (hasBottom) {
      levelUsage.bottom = generateLevelUsage("bottom");
    }
    
    // Inhabitants
    const wizardLevel = Math.floor(Math.random() * 12) + 9; // 9-20
    let apprenticeLevel: number | undefined;
    if (this.rollDie(4) === 1) {
      apprenticeLevel = this.rollD6();
    }

    return {
      category: "Class-related",
      type: "Tower",
      name,
      nameVariations: variations,
      disposition: this.generateDisposition(),
      levels: {
        aboveground: abovegroundLevels,
        underground: undergroundLevels,
        total: totalLevels,
        hasBottom
      },
      connection,
      appearance: {
        material,
        shape,
        details
      },
      insideAppearance,
      specialEquipment,
      levelUsage,
      inhabitants: {
        wizardLevel,
        apprenticeLevel
      }
    };
  }

  generateAbbey(): AbbeyData {
    const name = this.generateAbbeyName();
    
    // Size
    const sizeRoll = this.rollD6();
    const size = sizeRoll >= 1 && sizeRoll <= 5 ? "Small" : "Major";
    
    // Population
    let monksNuns: number, abbotLevel: number;
    if (size === "Small") {
      monksNuns = this.rollDie(4) * 10 + 20;
      abbotLevel = 9;
      if (monksNuns >= 50) abbotLevel += 1;
    } else {
      monksNuns = (this.rollDie(24)) * 10 + 90;
      abbotLevel = 9 + Math.floor(monksNuns / 100);
    }
    
    // Structure and land
    const structureAndLand = {
      protection: "Stone wall with large gate",
      outsideWalls: "Fields and farming buildings (barns, mills, etc.)",
      areaWithinWalls: `${this.rollDie(2) + 2} acres (= ${1.2 + (this.rollDie(2) - 1) * 0.4}-${1.6} ha)`
    };
    
    // Core locations
    const coreLocations = [
      "Abbot's room", "Cellars", "Cemetery", "Church", "Cloisters and garden",
      "Infirmary", "Kitchen and refectory", "Monks cells", "Necessarium (latrines)",
      "Servants, laborers and tradesmen quarters", "Storehouses"
    ];
    
    // Additional locations
    const gardenOptions = ["Flower garden", "Fountain", "Kitchen garden", "Physic garden (medicine)"];
    const infirmaryOptions = ["Bloodletting & purging room", "Drugstore", "Physician's residence", "Room for critical patients"];
    const religiousOptions = ["Chapter house (for meetings)", "Parlour", "School", "Scriptorium and library"];
    const otherOptions = ["Abbot's gateway", "Barns and stables", "Guest rooms", "Vestarium (clothing storage)", "Washhouse", "Watchtower"];
    
    const additionalLocations = {
      garden: [this.getTableResult(gardenOptions, this.rollDie(4))],
      infirmary: [this.getTableResult(infirmaryOptions, this.rollDie(4))],
      religious: [this.getTableResult(religiousOptions, this.rollDie(4))],
      other: [this.getTableResult(otherOptions, this.rollD6())]
    };
    
    // Activities
    const farmingOptions = [
      "Barley (beer)", "Chickens (meat)", "Cotton", "Cows (meat, milk and cheese)",
      "Goats (meat, milk and cheese)", "Grapes (wine)", "Hops (beer)", "Orchard (fruits and preserves)",
      "Pigs (meat)", "Sheeps (meat and wool)", "Vegetables", "Wheat (flour and bread)"
    ];
    
    const workshopOptions = ["Candle makers", "Cutlers", "Potters", "Shoemakers", "Smiths", "Tanners"];
    const otherActivityOptions = ["Bee keeping", "Bookshop", "Catering", "Copy & translation", "Exorcism", "Guided tour"];
    
    const farming: string[] = [];
    for (let i = 0; i < 2; i++) {
      const activity = this.getTableResult(farmingOptions, this.rollD12());
      if (!farming.includes(activity)) {
        farming.push(activity);
      }
    }
    
    const activities = {
      farming,
      workshop: [this.getTableResult(workshopOptions, this.rollD6())],
      other: [this.getTableResult(otherActivityOptions, this.rollD6())]
    };
    
    // Fame (for major abbeys)
    let fame: string | undefined;
    if (size === "Major") {
      const fameRoll = this.rollD20();
      if (fameRoll >= 1 && fameRoll <= 11) {
        const fameReasons = [
          "Age", "Architecture", "Cattle baptism", "Curative (hot) springs",
          "Domain and landscapes", "Grave of well known bishop", "Key religious celebration",
          "Meals served to travelers", "Pilgrimage", "Power", "Quality of products"
        ];
        fame = fameReasons[fameRoll - 1];
      } else {
        // Religious artifact
        const artifactTypes = ["Ancient parchment", "Art piece", "Crown", "Holy sword", "Precious book", "Relic"];
        const artifactType = this.getTableResult(artifactTypes, this.rollD6());
        
        if (artifactType === "Relic") {
          const relicTypes = [
            "Arm", "Blood", "Bones (vertebra, phalanx)", "Eye", "Flesh", "Head",
            "Heart", "Item that killed the saint", "Leg", "Piece of clothing",
            "Prayer book", "Religious symbol", "Ring", "Sandals", "Scalp",
            "Shroud", "Skin", "Tongue", "Tooth", "Walking stick"
          ];
          const relicType = this.getTableResult(relicTypes, this.rollD20());
          const saint = this.getTableResult(ABBEY_SAINTS, this.rollD30());
          
          const spellLevels: Record<number, number> = { 1: 8, 2: 14, 3: 17, 4: 19, 5: 20 };
          const spellRoll = this.rollD20();
          let spellLevel = 1;
          for (const [level, maxRoll] of Object.entries(spellLevels)) {
            if (spellRoll <= maxRoll) {
              spellLevel = parseInt(level);
              break;
            }
          }
          
          fame = `Relic: ${relicType} of Saint ${saint} (contains Level ${spellLevel} spell, usable once per week)`;
        } else {
          fame = `Religious artifact: ${artifactType}`;
        }
      }
    }
    
    // History
    const histories = [
      "Abandoned then used again", "Changed confession", "Claimed its autonomy",
      "Destroyed then rebuilt", "Founded 2d10 x10 years ago", "Has seen better days",
      "Only one original building remains", "Sponsored by a rich patron",
      "Started as a knight hermitage", "Used to be a boarding school",
      "Was relocated", "Was under a spell"
    ];
    const history = this.getTableResult(histories, this.rollD12());
    
    // Events (1/6 chance)
    let events: { timing: string; event: string } | undefined;
    if (this.rollD6() === 1) {
      const timingRoll = this.rollD6();
      const timing = timingRoll === 1 ? "Ended earlier" :
                   timingRoll >= 2 && timingRoll <= 4 ? "Is happening now" :
                   "Will take place in the future";
      
      const eventOptions = [
        "Broken device", "Cowls shrunken/dyed in red", "Demonic corruption",
        "Disappearance of the abbot", "Drought/Flood", "Festival/Fair", "Fire",
        "Looting", "Moles/Rats infestation", "Plague", "Scandal", "Visit of a notable person"
      ];
      const event = this.getTableResult(eventOptions, this.rollD12());
      
      events = { timing, event };
    }

    return {
      category: "Class-related",
      type: "Abbey",
      name,
      nameVariations: [name],
      disposition: this.generateDisposition(),
      abbeySize: size,
      abbeyPopulation: {
        monksNuns,
        abbotLevel
      },
      structureAndLand,
      coreLocations,
      additionalLocations,
      activities,
      fame,
      history,
      events
    };
  }

  // Main generation methods
  generateSteading(type?: string): GeneratedSteading {
    let settlementType: string;
    
    if (type && ALL_SETTLEMENT_TYPES.includes(type)) {
      settlementType = type;
    } else {
      const { type: randomType } = this.determineSettlementType();
      settlementType = randomType;
    }

    switch (settlementType) {
      case "Hamlet":
        return this.generateHamlet();
      case "Village":
        return this.generateVillage();
      case "City":
        return this.generateCity();
      case "Castle":
        return this.generateCastle();
      case "Tower":
        return this.generateTower();
      case "Abbey":
        return this.generateAbbey();
      default:
        return this.generateHamlet();
    }
  }

  generateSteadingStep(step: keyof GeneratedSteading): any {
    // Generate a random steading and return the requested step
    const steading = this.generateSteading();
    return steading[step];
  }
}

// Export the generator and functions
export const steadingGenerator = new SteadingGenerator();

export function generateSteading(type?: string): GeneratedSteading {
  return steadingGenerator.generateSteading(type);
}

export function generateSteadingStep(step: keyof GeneratedSteading): any {
  return steadingGenerator.generateSteadingStep(step);
}
