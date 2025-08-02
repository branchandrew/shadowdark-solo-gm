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
  "books", "boss", "brigand", "burglar", "carpenter", "cartographer", "candle lighter",
  "cavalry", "chandler", "clerk", "clothing", "cobbler", "collector",
  "con", "constable", "cooper", "courier", "crier", "cult leader", "cultist",
  "cutpurse", "dealer", "diplomat", "driver", "engineer", "envoy", "exile",
  "farmer", "fence", "fisher", "foot", "fugitive", "furrier", "general",
  "gentry", "goods", "grain", "gravedigger", "greater", "guard", "guide",
  "guildmaster", "herbalist", "herder", "heretic", "hermit", "hero",
  "humanoid", "hunter", "inkeep", "inventor", "items", "jeweler",
  "judge", "kingpin", "knight", "labor", "laborer", "lackey", "layabout",
  "leader", "lesser", "lieutenant", "livestock", "locksmith", "magic",
  "magistrate", "mason", "materials", "mendicant", "messenger", "militia",
  "miner", "military recruiter", "missionary", "monk", "musician", "navigator", "nobility",
  "novice", "nun", "officer", "outfitter", "outlaw",
  "patrol", "painter", "perfumer", "physician", "pilgrim", "porter", "potter",
  "preacher", "priest", "prophet", "protector", "quarrier", "racketeer",
  "raw recruit", "refugee", "ropemaker", "ruler", "sage",
  "sailor", "scholar", "scout", "scribe", "scrolls", "sentry", "servant", "seamstress" "sycophant",
  "simpleton", "slaves", "smith", "soldier", "spices", "spirits", "spy",
  "stablekeeper", "supplies", "squire", "swindler", "tailor", "tanner", "tavernkeep",
  "tax", "templar", "thief", "thug", "tinker", "tobacco dealer",
  "trapper", "troubador", "town crier", "undertaker", "urchin", "vagrant", "vintner",
  "warden", "warlord", "weapons", "weaver", "wheelwright", "wine bibber",
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
  "Trying to speak to the dead", "Trying to survive", "Unloading a cursed dagger", "Winning a fistfight tournament",
  "Redemption for past mistake"
];

export const SECRETS: string[] = [
  "Believes they are a great hero from the past, reborn",
  "Believes they will shortly turn into a troglodyte",
  "Can literally smell fear",
  "Can only tell the truth",
  "Can read minds via touch",
  "Can speak with animals (but finds them pretty boring)",
  "Can still hear the screams of their evaporating companions",
  "Can't remember their name",
  "Can't stand the sight of blood",
  "Comes from a disgraced family",
  "Distrusts at least one party member",
  "Doesn't know how to ask nicely",
  "Habitually wets the bed",
  "Had a dream where they saw the entire party turned to ash",
  "Has a dark past",
  "Has a huge debt",
  "Has a problem with a giant spider infestation",
  "Has a tattoo marking them as a murderer",
  "Has a weak heart",
  "Has developed blindsight",
  "Has multiple spirits living in their head",
  "Has never worked a day in their life",
  "Has short-term memory loss",
  "Has stolen someone's identity",
  "Has stolen something",
  "Has the self-confidence of a soggy biscuit",
  "Has uncontrollable flatulence",
  "Has yet to exhibit any evidence that they are anything other than an absolute loony",
  "Hides an illness/mutation",
  "Insists they are a displaced royal",
  "Insists they are reinventing the wheel",
  "Is a happy-go-lucky necromancer",
  "Is a lycanthrope",
  "Is a magic school dropout",
  "Is a newly made vampire",
  "Is a pacifist",
  "Is a satyr in disguise",
  "Is a silver dragon in disguise",
  "Is absolutely from the future",
  "Is addicted to a local drug",
  "Is being blackmailed",
  "Is being hunted by the city guards",
  "Is being pursued by a jilted lover",
  "Is cursed with creeping barkskin disease",
  "Is haunted by their grandfather's spirit",
  "Is illiterate",
  "Is immortal",
  "Is in deep with a local crime boss",
  "Is missing their tongue",
  "Is on the run for tax evasion",
  "Is on the run from hired killers out for their blood",
  "Is overwhelmingly lazy",
  "Is part of a secret organization",
  "Is plagued with extreme social anxiety",
  "Is possessed by a low level devil",
  "Is possessed by the spirit of a god",
  "Is possessed by the spirit of an ancient ruler",
  "Is prone to fainting at the sight of blood",
  "Is self-obsessed",
  "Is slowly losing their ability to speak",
  "Is terrible at all forms of combat",
  "Is testing a regenerative treatment that has a 50/50 chance of turning users into a bullywug",
  "Is the victim of a long con",
  "Is up to their eyeballs in gambling debt",
  "Is working against the party's interests",
  "Knows of a forgotten pirate hoard hidden at the bottom of an underground lake infested with evil fishfolk",
  "Knows the ritual they're planning will require the blood of at least two adventurers",
  "Knows their potion of fly will only last another half hour",
  "May have made a pact with a demon",
  "Must steal a rare flower that can provide an antidote to their beloved's sickness",
  "Needs to make it to the surface pronto",
  "Owns a dog that can speak Common",
  "Runs an illegal fighting ring nearby",
  "Sees via echolocation",
  "Serves a talking cow",
  "Spends their spare time writing action novels",
  "Struggles with their dad's expectations",
  "Suffers from narcolepsy",
  "Thinks healers are out to kill them",
  "Thinks humans are useless",
  "Thinks they are the smartest person in the room",
  "Uses a puppet to talk",
  "Wants to gain access to other dimensions",
  "Was adopted",
  "Was an escaped convict in their youth",
  "Was dared to start fights with 16 different strangers",
  "Was once kidnapped/abducted",
  "Was, until today, a shut-in",
  "Will do anything to obtain power over their father"
];

export const PHYSICAL_APPEARANCES: string[] = [
  "Disfigured (missing teeth, eye, etc.)",
  "Lasting injury (bad leg, arm, etc.)",
  "Tattooed, pockmarked, or scarred",
  "Unkempt, shabby, or grubby",
  "Big, thick, or brawny",
  "Small, scrawny, or emaciated",
  "Notable hair (wild, long, none, etc.)",
  "Notable nose (big, hooked, etc.)",
  "Notable eyes (blue, bloodshot, etc.)",
  "Clean, well-dressed, or well-groomed",
  "Attractive, handsome, or stunning",
  "Shaggy hair and a slight overbite",
  "Deep-set eyes and an upturned nose",
  "A wide smile and a fashionable mole",
  "A steady gaze and pursed lips",
  "A deep facial scar and a gruff exterior",
  "A pug nose and lots of freckles",
  "A round face and rosy cheeks",
  "A few hairs springing out of a wart on their face",
  "A heavy limp and a can-do attitude",
  "A kind face and a slow drawl",
  "Shifting eyes and a hushed voice",
  "A few missing teeth and a hungry gaze",
  "A massive nose and a tight mouth",
  "Hooded eyes and a casual tone",
  "Wild hair and a sweating brow",
  "Oily skin and whistling nostrils",
  "Large ears and an oval face",
  "A strong jaw and a hearty laugh",
  "A slack jaw and a tendency to mouthbreathe",
  "A gap-toothed grin and grey eyes",
  "A pot belly and an infectious giggle",
  "A blank expression and wild ear hair",
  "A face full of piercings",
  "More tattoos than uninked skin",
  "Buns of steel and armor to match",
  "Scabby knuckles they won't stop cracking",
  "A sick pompadour haircut",
  "Wearing the corset of a slimmer person",
  "A slack face on one side impeding their speech",
  "A tongue seemingly too big for their mouth",
  "A posh attitude and clothes to match",
  "A dour expression",
  "The biggest head of all time",
  "Broad shoulders and a low-cut tunic",
  "A hunched back and sores",
  "Friendly eyes and the grace of a dancer",
  "Devoid of eyebrows and a sense of humor",
  "A soot-covered face",
  "A dent in their skull that's healed over",
  "In a purple tunic, ascot and patent leather boots",
  "Covered in black tar and white feathers",
  "A broken arrow stuck in the side of their head",
  "Black eyes that lack irises",
  "Face buried in a book about geese",
  "Holding a tiny dog and fighting back tears",
  "Humming to themselves and scratching flaky skin",
  "A narrow face and fine, almost too-perfect features",
  "A bruised eye and a busted lip",
  "A lumpy nose that looks a bit infected",
  "A beehive hairdo that makes them seem taller",
  "Has a neck twice as wide as their face",
  "Has a face that appears stitched together",
  "Looks like they're about to vomit",
  "Is dripping in sweat",
  "Is expertly juggling a trio of daggers",
  "Has a drippy nose and red cheeks",
  "Is wearing clothes that are three sizes too big",
  "Looks twice their age",
  "A pretty face and big ideas",
  "Wearing goggles and chomping a smoldering cigar",
  "The energy of an overstimulated child",
  "Bangs that everyone agrees do not suit their face",
  "Nervously chewing their upper lip",
  "Blind, but making it work",
  "Still sporting the scars from a rogue owlbear attack",
  "Has one of those faces",
  "A chin that could block out the sun",
  "A whisper-quiet voice",
  "A cute smile and belt of knives",
  "Wearing far too many belts and silver jewelry",
  "The biggest, bushiest beard",
  "Is blessed with lavish curves",
  "Is a scythe-wielding farmer",
  "Armor that shines like the sun",
  "An almost hypnotic voice and air of importance",
  "Who looks like they just woke up",
  "In a tight-fitting, red-scaled jacket",
  "Wearing temple robes and a surprised expression",
  "Greasy hair and hands to match",
  "A hard, weathered face",
  "Walks with the grace of a dancer",
  "Wearing a crop top to show off their impressive abs",
  "In black leather and a pair of sharp, heeled boots",
  "A permanent squint and a stiff upper lip",
  "Who appears as if they were struck by lightning",
  "A smile that's all teeth and no joy",
  "Flashy pink hair",
  "A smell that is off-putting",
  "Bloody, nail-free fingertips",
  "In a droopy robe",
  "In a hat that's as tall as they are",
  "No arms, but two mage hands",
  "Bare feet and freckled cheeks",
  "Dressed in a patchwork coat of dozens of fabrics",
  "One leg, and a hangman's scar on their neck",
  "Is deaf and uses gestures to communicate",
  "Shaggy hair, baggy clothes and a chill attitude",
  "Cheekbones that could cut glass and eyes to match",
  "Wearing a hood that covers their gaunt face",
  "A handsome face and sure, kind smile",
  "Who is 5 feet tall and thin as a rail",
  "Who is heavy in the torso yet light on their toes",
  "As bald and beardless as a baby",
  "Wearing a fancy ballgown and expensive jewelry",
  "Scabs all over their body",
  "Food-stain covered clothes",
  "Small stature and a nervous demeanor",
  "Heavy eyelids and a constant yawn",
  "Shaggy red hair and a giant mole on their lip",
  "A hook for a hand and wearing an oversized hat",
  "Pale white eyes and large black ears aside their head",
  "Their nose turned to the sky and wearing purple robes",
  "A sly grin, chewing tobacco",
  "Menacing black plate armor",
  "Who shuffles along slowly, their body covered in bark",
  "Wild hair and leather pants",
  "High green pigtails and a pseudodragon perched on their shoulder",
  "A bright orange jumpsuit and several knives in their belt",
  "An ox sled of fresh food and wearing a wide-brimmed hat",
  "A pink crop top and wielding twin shortswords",
  "A leather apron and an ironworker's mask",
  "Ragged clothes, and some fabric scraps shoved up their nose",
  "Popping veins and a mouth frothing with excitement",
  "Open robes and angular face paint",
  "Eager eyes and silver hair",
  "Blue hair and a kindly attitude",
  "Immaculate white robes and a monocle",
  "A plump figure and serene attitude",
  "Staring intently at a large crystal ball they are carrying",
  "Effortlessly mussed hair and photogenic face",
  "Sharp features, dark hair and a ragged black cloak",
  "A shaven head, odd green scales on their neck and a curious fishy odor",
  "A long red beard thrown over their shoulder and deepset black eyes",
  "A long white mohawk, sparkling blue eyes, and toned physique",
  "Arcane tattoos over every visible surface of their body",
  "A squat body, close cropped hair and large rat perched on their shoulder",
  "Ragged clothes, blind eyes and a steel walking stick sharpened to a lethal point",
  "A bald head, black beard and the longest fingernails you've ever seen",
  "Dark skin, long, sleek blue hair and matching spiral tattoos on both sides of their neck",
  "Bulging, watery eyes, large webbed hands and a humped back",
  "Fine dress, regal bearing and an entitled attitude",
  "Short dark hair, an impressively curled mustache and teeth filed to points",
  "Curly brown hair, travelers garb and a patch over one eye",
  "A tattered white robe, long white hair and missing one arm",
  "Wrinkled face, deep set eyes, blackened and pitted teeth and noxious breath",
  "A large broken nose, gallon-sized fists and wiry gray hair",
  "Expressive eyebrows, a lilting voice and several nose, lip and ear piercings",
  "Bow legs and a thick middle, red hair and a thick bushy beard",
  "An easy smile, friendly attitude and terribly sarcastic demeanor",
  "Riddled with scabs and small cuts"
];

export const ECONOMIC_STATUSES: string[] = [
  "Destitute / homeless",
  "Destitute / homeless",
  "Destitute / homeless",
  "Poor",
  "Poor",
  "Poor",
  "Poor",
  "Poor",
  "Just getting by",
  "Just getting by",
  "Just getting by",
  "Just getting by",
  "Can support themselves",
  "Can support themselves",
  "Can support themselves",
  "Climbing the ladder",
  "Climbing the ladder",
  "Comfortable",
  "Comfortable",
  "Well-off",
  "Rich",
  "Extremely wealthy"
];

export const QUIRKS: string[] = [
  "Insecure, racist, or xenophobic",
  "Addict (sweets, drugs, sex, etc.)",
  "Phobia (spiders, fire, darkness, etc.)",
  "Allergic, asthmatic, or chronically ill",
  "Skeptic or paranoid",
  "Superstitious, devout, or fanatical",
  "Miser or pack-rat",
  "Spendthrift or wastrel",
  "Smart aleck or know-it-all",
  "Artistic, dreamer, or delusional",
  "Naive or idealistic",
  "Roll twice, reroll any 12 result",
  "Eccentric hairstyle",
  "Piercings",
  "Rare eye color",
  "Scar(s)",
  "Tattoo(s)",
  "Talks to themselves constantly",
  "Never finishes their sentences",
  "Over-explains everything",
  "Laughs at inappropriate moments",
  "Avoids eye contact entirely",
  "Overly touchy with strangers",
  "Overly formal speech",
  "Constantly gives unsolicited advice",
  "Uses made-up slang",
  "Mimics others' accents unconsciously",
  "Walks with an exaggerated swagger",
  "Has an unusual laugh (wheeze, cackle, snort)",
  "Always covered in glitter, soot, or chalk",
  "Refuses to wear shoes",
  "Always wears gloves, even when inappropriate",
  "Dresses like they're from a different century",
  "Keeps a live insect or animal in their pocket",
  "Avoids being touched at all costs",
  "Becomes eerily calm in stressful situations",
  "Laughs when they're about to cry"
];

export const COMPETENCE: string[] = [
  "A liability",
  "Competent",
  "Fully capable",
  "Exceptional"
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
  competence: string;
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

    // 25% chance of having two quirks
    if (Math.random() < 0.25) {
      const firstQuirk = this.getRandomElement(QUIRKS);
      let secondQuirk = this.getRandomElement(QUIRKS);

      // Ensure we don't get the same quirk twice
      let attempts = 0;
      while (secondQuirk === firstQuirk && attempts < 10) {
        secondQuirk = this.getRandomElement(QUIRKS);
        attempts++;
      }

      return `${firstQuirk} & ${secondQuirk}`;
    }

    return this.getRandomElement(QUIRKS);
  }

  private generateCompetence(): string {
    if (COMPETENCE.length === 0) {
      return "Competent"; // Fallback
    }
    return this.getRandomElement(COMPETENCE);
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
        competence: this.generateCompetence(),
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
        competence: "Competent",
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
      case 'competence':
        return this.generateCompetence();
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
