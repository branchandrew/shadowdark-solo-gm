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
  "Becoming an adventurer", "Being famous", "Being powerful", "Being respected", "Being rich",
  "Being self-sufficient", "Bringing peace to the world", "Buying a big property", "Changing of occupation",
  "Discovering something new", "Dominating others", "Finding true love", "Helping others",
  "Living a peaceful life", "Living elsewhere", "Organizing an event", "Starting a family",
  "Touring the world", "Writing a book", "Writing their memoirs", "Avenging a destroyed village",
  "Avenging the death of a loved one", "Becoming a champion fistfighter", "Becoming a great warrior",
  "Becoming a model for the underrealm's top fashion brand", "Becoming a respected miner like their father",
  "Breaking into the royal treasury", "Bringing inspiration and excitement to life",
  "Bringing medical aid to someone in need", "Bringing someone to the top of undermountain",
  "Building a vessel that can move underwater", "Collecting romance novels", "Converting people to their religion",
  "Creating a new economic theory", "Discovering a new bat species", "Escaping poverty",
  "Escorting someone to a destination", "Exploring a legendary black tower", "Fighting in the Great Cliff Dive",
  "Finding a cure before it's too late", "Finding inspiration and excitement", "Finding someone to marry",
  "Finding the royal family", "Finding treasure", "Fitting into high society",
  "Following a crystal ball's instructions", "Following a marked treasure map", "Following the right tunnel",
  "Funding a startup", "Getting a painting into a museum", "Gaining entrance to high society",
  "Gaining the ear of the queen", "Getting married", "Getting medical attention for disease",
  "Getting revenge on goblins", "Getting vengeance for a village attack", "Helping a cursed individual",
  "Hunting a thief who burglarized their home", "Investigating magical card rumors",
  "Joining a royal family", "Keeping a mine running", "Killing a sorcerer who cursed them",
  "Living a peaceful life", "Looking for a comfortable cavern", "Making ends meet through begging",
  "Making money with a red dragon and a pipe organ", "Making the best cheese and pie",
  "Modeling for CavernGuy", "Needing a hug", "Opening a bakery", "Opening the first subterranean skyport",
  "Owning a house in the poshest area", "Performing quickie weddings", "Publishing a memoir",
  "Reclaiming lost memory", "Rescuing a kidnapped sister", "Rescuing friends from the shadow plane",
  "Researching bat droppings", "Returning to civilization", "Running a clinic trial",
  "Searching for the legendary black tower", "Searching for trouble", "Searching for investors",
  "Searching for the royal family", "Seeking father's respect as a miner", "Seeking the truth about the heir",
  "Speaking with demons", "Speaking with the dead", "Stamping out evil", "Starting a family",
  "Swimming in a golden pond", "Talking to anything humanoid", "Talking to the dead",
  "Talking to someone", "Tracking a goblin tribe", "Traveling to regain memory",
  "Trying to collect all romance novels", "Trying to get promoted", "Trying to infiltrate a fortress",
  "Trying to open the royal vault", "Trying to reach high society", "Trying to rescue someone",
  "Trying to speak to the dead", "Trying to survive", "Unloading a cursed dagger", "Winning a fistfight tournament"
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
