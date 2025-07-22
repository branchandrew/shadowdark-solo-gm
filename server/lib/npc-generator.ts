/**
 * NPC Generator (TypeScript)
 *
 * Generates random NPCs with various characteristics through multiple steps.
 */

// NPC race types (different from story arc races)
export const NPC_RACES: string[] = [
  "Human",
  "Human",
  "Human",
  "Human",
  "Elf",
  "Elf",
  "Half-elf",
  "Dwarf",
  "Halfling",
  "Human",
  "Human",
  "Human",
  "Human",
  "Elf",
  "Elf",
  "Half-elf",
  "Dwarf",
  "Halfling",
  "Gnome",
  "Dragonborn",
  "Kobald",
  "Goblin",
  "Minotaur",
  "Beastfolk",
  "Ratfolk",
  "Wyrdling",
  "Dryad",
  "Changeling",
];

export const OCCUPATIONS: string[] = [
  "acolyte", "acrobat", "actor", "administrator", "adventurer", "alchemist",
  "ale", "apostate", "apothecary", "apprentice", "arcane", "archer",
  "architect", "armiger", "armor", "armorer", "artist", "astrologer",
  "baker", "bandit", "barbarian", "basketmaker", "beggar", "bodyguard",
  "books", "boss", "brigand", "burglar", "carpenter", "cartographer",
  "cavalry", "chandler", "clerk", "clothing", "cobbler", "collector",
  "con", "constable", "cooper", "courier", "crier", "cult", "cultist",
  "cutpurse", "dealer", "diplomat", "driver", "engineer", "envoy", "exile",
  "farmer", "fence", "fisher", "foot", "fugitive", "furrier", "general",
  "gentry", "goods", "grain", "gravedigger", "greater", "guard", "guide",
  "guildmaster", "herbalist", "herder", "heretic", "hermit", "hero", "high",
  "humanoid", "hunter", "inkeep", "inventor", "items", "jeweler", "jewelry",
  "judge", "kingpin", "knight", "labor", "laborer", "lackey", "layabout",
  "leader", "lesser", "lieutenant", "livestock", "locksmith", "magic",
  "magistrate", "mason", "materials", "mendicant", "messenger", "militia",
  "miner", "missionary", "monk", "musician", "navigator", "nobility",
  "novice", "nun", "officer", "otherworldly", "outfitter", "outlaw",
  "patrol", "perfumer", "physician", "pilgrim", "porter", "potter",
  "preacher", "priest", "prophet", "protector", "quarrier", "racketeer",
  "rare", "raw", "recruit", "refugee", "ropemaker", "ruler", "sage",
  "sailor", "scholar", "scout", "scribe", "scrolls", "sentry", "servant",
  "simpleton", "slaves", "smith", "soldier", "spices", "spirits", "spy",
  "stablekeeper", "supplies", "swindler", "tailor", "tanner", "tavernkeep",
  "tax", "templar", "thief", "thug", "tinker", "tobacco", "tough", "town",
  "trapper", "troubador", "undertaker", "urchin", "vagrant", "vintner",
  "warden", "warlord", "watch", "weapons", "weaver", "wheelwright", "wine",
  "wizard", "zealot"
];

export const MOTIVATIONS: string[] = [
  // TODO: Add motivation values
];

export const SECRETS: string[] = [
  // TODO: Add secret values
];

export const PHYSICAL_APPEARANCES: string[] = [
  // TODO: Add physical appearance values
];

export const ECONOMIC_STATUSES: string[] = [
  // TODO: Add economic status values
];

export const QUIRKS: string[] = [
  // TODO: Add quirk values
];

export const LEVELS: string[] = [
  // TODO: Add level values
];

export const FIRST_NAMES: string[] = [
  "Aja", "Alma", "Alric", "Amriel", "Ann", "Annie", "Aran", "Ardo", "Arthur", "Astrid",
  "Axidor", "Barvin", "Bella", "Benny", "Borg", "Brak", "Bram", "Brenna", "Brielle", "Brolga",
  "Bruga", "Bruno", "Cecilia", "Clara", "Cora", "Cyrwin", "Daeniel", "David", "Darvin", "Deeg",
  "Denton", "Dina", "Drago", "Elga", "Eliza", "Eliara", "Elyon", "Finn", "Fink", "Fiora",
  "Fitz", "Galira", "Georg", "Gendry", "Giralt", "Godfrey", "Gordie", "Gralk", "Grimm", "Grix",
  "Hank", "Helen", "Hilde", "Hiralia", "Hirok", "Hobb", "Hrogar", "Iggs", "Ishana", "Isolde",
  "Ithior", "Ingol", "Ivara", "Jasmin", "Jasper", "Jennie", "John", "Jirwyn", "Junnor", "Karina",
  "Klara", "Korv", "Krull", "Lenk", "Lilly", "Lienna", "Lothiel", "Lydia", "Malchor", "Marga",
  "Marie", "Marlow", "Mirena", "Mona", "Morgan", "Natinel", "Nattias", "Naugrim", "Nayra", "Nibs",
  "Nix", "Norbert", "Oscar", "Pike", "Prim", "Ranna", "Riggs", "Rina", "Rizzo", "Rogar",
  "Roke", "Rose", "Ruhiel", "Ryarn", "Sariel", "Sarna", "Shiraal", "Sophie", "Squib", "Tamra",
  "Tarin", "Tark", "Thomas", "Tila", "Tilly", "Tisha", "Tirolas", "Torbin", "Torson", "Tragan",
  "Tucker", "Tulk", "Ulara", "Ulfgar", "Vara", "Varos", "Vidrid", "Will", "Willow", "Wulf",
  "Yark", "Yelena", "Yuri", "Zali", "Zaphiel", "Zasha", "Zeb", "Zoraan"
];

export const LAST_NAMES: string[] = [
  "Abdou", "Aberrich", "Aefrim", "Aibolsun", "Altas", "Avilseer", "Axeson", "Baelmai", "Bako", "Bingletrite", "Blackreed",
  "Briggs", "Bronzebeard", "Bronzestein", "Burrows", "Button", "Carter", "Claymore", "Cogturner", "Coldstone",
  "Coppercrown", "Coppernose", "Cragenmore", "Cray", "Crowbender", "Crysalis", "Darabound", "Darksteele", "Datesi",
  "Deepstone", "Diamondtoe", "Didor", "Dwandra", "Eastlake", "Eaves", "Emo", "Etellor", "Excellente", "Faemoira",
  "Fauxmont", "Fenyara", "Finch", "Firebeard", "Firsell", "Fishtoe", "Flint", "Flintheart", "Flintshine", "Forgefoot",
  "Foxglove", "Frostarms", "Geasfoot", "Gibbs", "Gigak", "Gnazbright", "Goldarm", "Goldcask", "Griffith", "Gulnurkan",
  "Hammerstrike", "Hartley", "Head", "Honeyeater", "Hook", "Hoover", "Huneldth", "Hutchrice", "Iasbex", "Icruxias", "Ide",
  "Igrild", "Illa", "Illynmah", "Immamura", "Jarfalsa", "Jaytai", "Jeffries", "Justice", "Kavius", "Keystina",
  "Khilltahrn", "Koahath", "Leagallow", "Lillyfitz", "Lloyd", "Luckdodger", "Lukewill", "Mavcius", "Merigu", "Mishala",
  "Mogumir", "Moore", "Narrick", "Neeves", "Neriyra", "Noire", "Noosecatcher", "Ootati", "Oldfur", "Olley", "Oremen",
  "Orgulas", "Petra", "Plackard", "Polaan", "Poole", "Poutine", "Powell", "Protheroe", "Puddleswish", "Questar",
  "Quickstoke", "Q'tharas", "Quid", "Rainn", "Randmork", "Reagle", "Reebsa", "Ren", "Requiess", "Reyhana", "Rivershale",
  "Robinson", "Roamshadow", "Rosenmer", "Rumsdeep", "Rygoss", "Sarberos", "Seidanur", "Shatterblade", "Shaw", "Silverock",
  "Silverseek", "Silviu", "SindaSalt", "Slane", "Smith", "Stumpfoot", "Strongale", "Strongsmith", "Stringsaw",
  "Suresnail", "Tanko", "Taylor", "Thanar", "Thaneson", "Thermobolt", "Therundlin", "Tighfield", "Underbough", "Ugdough",
  "Us", "Uvaes", "Valarnith", "Vainweather", "Veindeep", "Vendorform", "Volto", "Wapronk", "Wheelmaiden", "Wolfsbane",
  "Woolyboon", "Wright", "Xas", "Xencord", "Xeran", "Yahsquin", "Yeoman", "Yesvyre", "Yiu", "Zakari", "Zeagan", "Zimet",
  "Zytal"
];

export interface GeneratedNPC {
  race: string;
  occupation: string;
  motivation: string;
  secret: string;
  physicalAppearance: string;
  economicStatus: string;
  quirk: string;
  level: string;
  firstName: string;
  lastName: string;
}

export class NPCGenerator {
  private getRandomElement<T>(array: T[]): T {
    if (array.length === 0) {
      throw new Error("Cannot select from empty array");
    }
    const randomIndex = Math.floor(Math.random() * array.length);
    return array[randomIndex];
  }

  private generateRace(): string {
    if (NPC_RACES.length === 0) {
      return "Human"; // Fallback
    }
    return this.getRandomElement(NPC_RACES);
  }

  private generateOccupation(): string {
    if (OCCUPATIONS.length === 0) {
      return "Commoner"; // Fallback
    }
    return this.getRandomElement(OCCUPATIONS);
  }

  private generateMotivation(): string {
    if (MOTIVATIONS.length === 0) {
      return "Seeking Adventure"; // Fallback
    }
    return this.getRandomElement(MOTIVATIONS);
  }

  private generateSecret(): string {
    if (SECRETS.length === 0) {
      return "Harbors a Dark Secret"; // Fallback
    }
    return this.getRandomElement(SECRETS);
  }

  private generatePhysicalAppearance(): string {
    if (PHYSICAL_APPEARANCES.length === 0) {
      return "Average Looking"; // Fallback
    }
    return this.getRandomElement(PHYSICAL_APPEARANCES);
  }

  private generateEconomicStatus(): string {
    if (ECONOMIC_STATUSES.length === 0) {
      return "Middle Class"; // Fallback
    }
    return this.getRandomElement(ECONOMIC_STATUSES);
  }

  private generateQuirk(): string {
    if (QUIRKS.length === 0) {
      return "Has an Unusual Hobby"; // Fallback
    }
    return this.getRandomElement(QUIRKS);
  }

  private generateLevel(): string {
    if (LEVELS.length === 0) {
      return "Level 1"; // Fallback
    }
    return this.getRandomElement(LEVELS);
  }

  private generateFirstName(): string {
    if (FIRST_NAMES.length === 0) {
      return "John"; // Fallback
    }
    return this.getRandomElement(FIRST_NAMES);
  }

  private generateLastName(): string {
    if (LAST_NAMES.length === 0) {
      return "Smith"; // Fallback
    }
    return this.getRandomElement(LAST_NAMES);
  }

  public generateNPC(): GeneratedNPC {
    try {
      return {
        race: this.generateRace(),
        occupation: this.generateOccupation(),
        motivation: this.generateMotivation(),
        secret: this.generateSecret(),
        physicalAppearance: this.generatePhysicalAppearance(),
        economicStatus: this.generateEconomicStatus(),
        quirk: this.generateQuirk(),
        level: this.generateLevel(),
        firstName: this.generateFirstName(),
        lastName: this.generateLastName(),
      };
    } catch (error) {
      // Fallback NPC if generation fails
      return {
        race: "Human",
        occupation: "Commoner",
        motivation: "Seeking Adventure",
        secret: "Harbors a Dark Secret",
        physicalAppearance: "Average Looking",
        economicStatus: "Middle Class",
        quirk: "Has an Unusual Hobby",
        level: "Level 1",
        firstName: "John",
        lastName: "Smith",
      };
    }
  }

  public generateStep(step: keyof GeneratedNPC): string {
    switch (step) {
      case 'race':
        return this.generateRace();
      case 'occupation':
        return this.generateOccupation();
      case 'motivation':
        return this.generateMotivation();
      case 'secret':
        return this.generateSecret();
      case 'physicalAppearance':
        return this.generatePhysicalAppearance();
      case 'economicStatus':
        return this.generateEconomicStatus();
      case 'quirk':
        return this.generateQuirk();
      case 'level':
        return this.generateLevel();
      case 'firstName':
        return this.generateFirstName();
      case 'lastName':
        return this.generateLastName();
      default:
        throw new Error(`Unknown NPC generation step: ${step}`);
    }
  }
}

export function generateNPC(): GeneratedNPC {
  const generator = new NPCGenerator();
  return generator.generateNPC();
}

export function generateNPCStep(step: keyof GeneratedNPC): string {
  const generator = new NPCGenerator();
  return generator.generateStep(step);
}
