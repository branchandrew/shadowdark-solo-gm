/**
 * Name Generator (TypeScript)
 * Generates fantasy names based on different language/style categories
 */

// Level 1: Evil
const EVIL_START = [
  "Sk", "Zu", "Ve", "Ul", "Kr", "Gr", "Th", "Dr", "Bl", "Sh",
  "Vy", "Ky", "Ny", "Py", "Ry", "Sy", "Ty", "Wy", "Zy", "Fy",
  "Mal", "Vex", "Mor", "Nyx", "Zar", "Bla", "Grim", "Drak"
];

const EVIL_MIDDLE = [
  "yu", "sky", "ly", "pu", "ye", "ed", "ud", "sk", "or", "ar",
  "ur", "ir", "er", "ak", "ok", "uk", "ik", "ek", "oz", "az",
  "oth", "arn", "ugh", "okh", "aal", "uur"
];

const EVIL_END = [
  "d", "e", "k", "sk", "st", "rl", "th", "nd", "rk", "sh",
  "gr", "bl", "dr", "kr", "vd", "yd", "zd", "fd", "ld", "md",
  "goth", "mor", "oth", "ugh", "ash", "arn"
];

// Level 2: Celtic (Gaelic)
const CELTIC_START = [
  "Ai", "Bri", "Cai", "Dai", "Eo", "Fio", "Gwy", "Llo", "Mai", "Nia",
  "Oi", "Pry", "Rhy", "Sia", "Tei", "Una", "Bla", "Cae", "Dwy", "Gla",
  "Mor", "Bre", "Cer", "Dun", "Fen", "Gal", "Kil", "Llan", "Tre"
];

const CELTIC_MIDDLE = [
  "an", "wy", "ll", "dd", "ff", "rh", "th", "ch", "oe", "ae",
  "ei", "ou", "ia", "io", "ua", "ri", "gu", "gw", "dy", "fy",
  "lyn", "wen", "gar", "mor", "dor", "tan", "van", "han"
];

const CELTIC_END = [
  "an", "wy", "dd", "ff", "th", "ch", "wen", "lyn", "gan", "van",
  "dor", "mor", "gar", "tan", "han", "lan", "ron", "eon", "aig", "ais",
  "aith", "aidh", "ough", "edd", "ydd", "wyr"
];

// Level 3: Nordic (Old Norse)
const NORDIC_START = [
  "Bj", "Ey", "Gu", "Ha", "In", "Jo", "Kj", "Lo", "Mag", "Ol",
  "Ra", "Sig", "Th", "Ulf", "Vig", "As", "Br", "Dag", "Eg", "Fr",
  "Grim", "Heid", "Ing", "Kol", "Leif", "Rag", "Rune", "Stein", "Thor", "Tor"
];

const NORDIC_MIDDLE = [
  "ar", "er", "ir", "or", "ur", "an", "en", "in", "on", "un",
  "stein", "bjorn", "grim", "ulf", "thor", "gar", "mund", "rik", "berg", "dahl",
  "strand", "vik", "helm", "bald", "finn", "mark"
];

const NORDIC_END = [
  "son", "sen", "sson", "dottir", "ulf", "bjorn", "gar", "mund", "rik", "stein",
  "berg", "dahl", "strand", "vik", "helm", "bald", "finn", "mark", "thor", "grim",
  "ar", "er", "ir", "or", "ur", "yn", "en", "an"
];

// Level 4: Germanic
const GERMANIC_START = [
  "Ad", "Ber", "Con", "Die", "Eck", "Fri", "Ger", "Hei", "Ing", "Kai",
  "Lud", "Man", "Nor", "Ot", "Rei", "Sig", "Thi", "Ulf", "Wal", "Wil",
  "Brun", "Ernst", "Gott", "Hart", "Karl", "Rich", "Wolf"
];

const GERMANIC_MIDDLE = [
  "hard", "bert", "helm", "mund", "rich", "wald", "fried", "grim", "bold", "mar",
  "win", "bald", "gang", "bert", "hold", "brand", "gar", "ward", "mann", "wolf"
];

const GERMANIC_END = [
  "rich", "bert", "fried", "mund", "wald", "helm", "hard", "bold", "bald", "brand",
  "gar", "ward", "mann", "wolf", "grim", "win", "mar", "gang", "hold", "hart"
];

// Level 5: Latin
const LATIN_START = [
  "Aur", "Bel", "Cas", "Dom", "Emp", "Fab", "Gra", "Hon", "Imp", "Jul",
  "Lac", "Mag", "Nob", "Oct", "Pal", "Qui", "Reg", "Sev", "Tit", "Urb",
  "Val", "Max", "Dec", "Fla", "Cor", "Mar", "Vic", "Luc"
];

const LATIN_MIDDLE = [
  "us", "ius", "ulus", "anus", "inus", "onus", "enus", "arius", "ensis", "icus",
  "tius", "lius", "rius", "sius", "ticus", "vius", "dius", "pius", "mius", "nius"
];

const LATIN_END = [
  "us", "ius", "anus", "inus", "icus", "orus", "arus", "erus", "urus", "etus",
  "atus", "itus", "otus", "utus", "ensis", "aris", "oris", "uris", "eris", "iris"
];

// Level 6: Ancient Greek
const GREEK_START = [
  "Al", "Ar", "Bry", "Cl", "De", "Eu", "Hy", "Id", "Ly", "Me",
  "Ni", "Ol", "Ph", "Rh", "St", "Th", "Xe", "Zy", "An", "Ap",
  "Dio", "Her", "Ath", "Dem", "Hel", "Neo", "Pan", "Soc"
];

const GREEK_MIDDLE = [
  "an", "ar", "as", "at", "es", "is", "os", "us", "yn", "yr",
  "kles", "phon", "dor", "krat", "phil", "theo", "gon", "arch", "sth", "mach"
];

const GREEK_END = [
  "es", "is", "os", "us", "as", "on", "ys", "ax", "ex", "ix",
  "kles", "phon", "dor", "krat", "phil", "theo", "gon", "arch", "tes", "des"
];

// Level 7: Slavic
const SLAVIC_START = [
  "Sv", "Mir", "Dus", "Bor", "Vlad", "Kat", "Nik", "Olg", "Pav", "Rad",
  "Yar", "Zor", "Lud", "Mil", "Nat", "Ost", "Pet", "Rus", "Stan", "Tad",
  "Bog", "Dra", "Gos", "Kaz", "Lyub", "Raz", "Slav", "Voj", "Zdan"
];

const SLAVIC_MIDDLE = [
  "ya", "ye", "lo", "va", "mi", "ro", "sla", "to", "dra", "ka",
  "li", "na", "po", "ra", "si", "ta", "vi", "za", "bo", "du",
  "mir", "slav", "dan", "mil", "rad", "bog"
];

const SLAVIC_END = [
  "ov", "a", "in", "ka", "la", "mir", "slav", "yev", "ich", "ko",
  "na", "or", "ski", "va", "yan", "zin", "dor", "gar", "len", "nov",
  "ek", "ak", "uk", "ik"
];

// Level 8: Arabic/Persian
const ARABIC_START = [
  "Ab", "Al", "As", "Da", "Fa", "Ha", "Ib", "Ja", "Ka", "Ma",
  "Na", "Om", "Ra", "Sa", "Ta", "Wa", "Ya", "Za", "Kh", "Gh",
  "Mah", "Rah", "Sar", "Tar", "Ash", "Bah", "Dar", "Far", "Gar", "Har"
];

const ARABIC_MIDDLE = [
  "al", "ar", "as", "an", "am", "ah", "ad", "af", "ag", "aj",
  "mad", "had", "sad", "fad", "lah", "rah", "mah", "dah", "shah", "kah"
];

const ARABIC_END = [
  "ad", "af", "ah", "al", "am", "an", "ar", "as", "at", "az",
  "mad", "had", "sad", "fad", "lah", "rah", "mah", "dah", "shah", "kah",
  "din", "sir", "mir", "tar"
];

// Level 9: Finnish
const FINNISH_START = [
  "Ai", "Ee", "Il", "Kal", "Lai", "Mik", "Nie", "Oi", "Pek", "Rai",
  "Sii", "Tai", "Uol", "Vai", "Yli", "Aki", "Esa", "Jaa", "Kaa", "Laa",
  "Maa", "Naa", "Paa", "Raa", "Saa", "Taa", "Vaa"
];

const FINNISH_MIDDLE = [
  "ki", "ko", "ka", "ke", "ku", "li", "lo", "la", "le", "lu",
  "mi", "mo", "ma", "me", "mu", "ni", "no", "na", "ne", "nu",
  "kki", "lli", "mmi", "nni", "ppi", "tti", "kka", "lla", "mma", "nna"
];

const FINNISH_END = [
  "nen", "inen", "ainen", "anen", "kka", "lla", "mma", "nna", "ppa", "tta",
  "ki", "ko", "ka", "ke", "ku", "li", "lo", "la", "le", "lu",
  "sto", "nen", "ken", "sen", "ten"
];

// Level 10: Basque
const BASQUE_START = [
  "Ait", "Bel", "Ek", "Ga", "Har", "Ib", "Jox", "Kol", "Lar", "Mit",
  "Nak", "Oin", "Pat", "Rud", "Sab", "Txe", "Urd", "Xab", "Yon", "Zur",
  "And", "Ber", "Deb", "Egi", "Fer", "Goi", "Ira", "Leh"
];

const BASQUE_MIDDLE = [
  "ar", "er", "ir", "or", "ur", "ai", "ei", "oi", "au", "eu",
  "tx", "tz", "rr", "ll", "dd", "kk", "tt", "pp", "ss", "nn",
  "eta", "arra", "erre", "uri"
];

const BASQUE_END = [
  "a", "e", "i", "o", "u", "z", "x", "k", "n", "r",
  "tx", "tz", "rr", "ll", "eta", "arra", "erre", "uri", "tegi", "degi"
];

// Level 11: Elvish (Tolkien-inspired)
const ELVISH_START = [
  "El", "Ar", "Fin", "Gal", "Leg", "Thran", "Mir", "Lor", "Ae", "Ce",
  "Fe", "Gla", "Ha", "Il", "La", "Ma", "Na", "Oro", "Quen", "Sil",
  "Gil", "Cel", "Elu", "Lin", "Nim", "Tar", "Eru"
];

const ELVISH_MIDDLE = [
  "en", "ion", "ad", "or", "el", "ith", "ael", "aur", "eor", "ian",
  "lor", "mir", "nor", "ril", "thar", "uin", "wen", "yar", "zir", "dor",
  "rond", "duin", "goth", "moth", "neth", "reth"
];

const ELVISH_END = [
  "dor", "las", "wen", "ril", "thar", "ion", "ael", "aur", "eor", "ian",
  "lor", "mir", "nor", "del", "fel", "gil", "hel", "kel", "mel", "nel",
  "rond", "duin", "goth", "moth", "neth", "reth", "eth", "ith", "oth"
];

// Level 12: Draconic
const DRACONIC_START = [
  "Tha", "Bah", "Vor", "Sar", "Kri", "Dra", "Zar", "Gha", "Mor", "Ash",
  "Pyrr", "Igna", "Umbr", "Terr", "Aqua", "Vent", "Lumi", "Tene", "Glaci", "Fulg"
];

const DRACONIC_MIDDLE = [
  "mat", "kul", "vor", "thar", "rax", "nax", "goth", "moth", "roth", "zoth",
  "prax", "krex", "thex", "vex", "hex", "rex", "lex", "nex"
];

const DRACONIC_END = [
  "rax", "nax", "goth", "moth", "roth", "zoth", "prax", "krex", "thex", "vex",
  "hex", "rex", "lex", "nex", "thar", "khar", "ghar", "vhar"
];

// Level 13: Primordial
const PRIMORDIAL_START = [
  "Aer", "Aqu", "Igni", "Terr", "Umbr", "Lumi", "Glaci", "Fulg", "Vent", "Sil",
  "Cael", "Abys", "Ethr", "Void", "Prim", "Elem", "Flux", "Ess"
];

const PRIMORDIAL_MIDDLE = [
  "is", "us", "ar", "or", "al", "el", "il", "ul", "yn", "an",
  "oth", "ith", "eth", "uth", "ath", "oss", "iss", "ess", "uss", "ass"
];

const PRIMORDIAL_END = [
  "oss", "iss", "ess", "uss", "ass", "oth", "ith", "eth", "uth", "ath",
  "os", "is", "es", "us", "as", "ar", "or", "al", "el", "il"
];

// Level 14: Infernal
const INFERNAL_START = [
  "Bel", "Dis", "Mal", "Lev", "Baa", "Ash", "Mol", "Nerg", "Set", "Bah",
  "Zeb", "Mam", "Bel", "Ast", "Deu", "Phl", "Bif", "Ose", "Amy", "Ori"
];

const INFERNAL_MIDDLE = [
  "ze", "pha", "mon", "goth", "moth", "roth", "zoth", "leth", "neth", "seth",
  "bub", "baal", "zar", "gar", "har", "var", "dar", "tar"
];

const INFERNAL_END = [
  "oth", "eth", "uth", "ith", "ath", "eus", "ius", "ous", "ael", "iel",
  "bub", "baal", "zar", "gar", "har", "var", "dar", "tar", "goth", "moth"
];

// Level 15: Anglo-Saxon
const ANGLO_START = [
  "Æth", "Ead", "Alf", "Beo", "Cyn", "Dun", "Edg", "Fre", "God", "Her",
  "Ing", "Leo", "Mund", "Off", "Red", "Sig", "Theod", "Wig", "Wulf", "Ælf",
  "Beorn", "Cuth", "Ead", "Gar", "Hild", "Os", "Wil"
];

const ANGLO_MIDDLE = [
  "win", "mund", "ric", "stan", "wald", "frith", "gar", "helm", "sige", "weard",
  "beald", "cild", "dred", "ferth", "gund", "heard", "laf", "noth", "ræd", "swith"
];

const ANGLO_END = [
  "red", "gar", "wulf", "helm", "sige", "weard", "beald", "cild", "dred", "ferth",
  "gund", "heard", "laf", "noth", "ræd", "swith", "bert", "frid", "mund", "ric"
];

// Level 16: Steppe Nomad (Mongolian/Turkish)
const STEPPE_START = [
  "Bat", "Che", "Dal", "Gan", "Kha", "Mun", "Nor", "Ork", "Qar", "Sub",
  "Tem", "Ulz", "Yam", "Zul", "Bog", "Dor", "Gen", "Jem", "Kul", "Mog"
];

const STEPPE_MIDDLE = [
  "khan", "gul", "bur", "dar", "gan", "hun", "jal", "kar", "lun", "mur",
  "nar", "ool", "pal", "qul", "sur", "tul", "uur", "val", "yal", "zul"
];

const STEPPE_END = [
  "khan", "gul", "bur", "dar", "gan", "hun", "jal", "kar", "lun", "mur",
  "nar", "ool", "pal", "qul", "sur", "tul", "uur", "val", "yal", "zul"
];

// Level 17: Ancient Egyptian
const EGYPTIAN_START = [
  "Akh", "Ank", "Anu", "Ato", "Hap", "Hor", "Isi", "Kha", "Nef", "Osi",
  "Pta", "Ra", "Set", "Tho", "Uto", "Ama", "Ben", "Dja", "Hem", "Kep",
  "Men", "Neb", "Per", "Sab", "Wab"
];

const EGYPTIAN_MIDDLE = [
  "em", "en", "ep", "er", "es", "et", "hotep", "ankh", "djed", "was",
  "ka", "ba", "akh", "sekh", "neb", "per", "dja", "hem", "kep", "men"
];

const EGYPTIAN_END = [
  "hotep", "ankh", "djed", "was", "ka", "ba", "akh", "sekh", "neb", "per",
  "dja", "hem", "kep", "men", "is", "es", "us", "os", "as"
];

export type NameAlignment = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17;

export const ALIGNMENT_NAMES = {
  1: "Evil",
  2: "Celtic (Gaelic)",
  3: "Nordic (Old Norse)", 
  4: "Germanic",
  5: "Latin",
  6: "Ancient Greek",
  7: "Slavic",
  8: "Arabic/Persian",
  9: "Finnish",
  10: "Basque",
  11: "Elvish",
  12: "Draconic",
  13: "Primordial",
  14: "Infernal",
  15: "Anglo-Saxon",
  16: "Steppe Nomad",
  17: "Ancient Egyptian"
} as const;

export interface NameGenerationResult {
  success: boolean;
  alignment?: number;
  names?: string[];
  error?: string;
}

/**
 * Get the syllable sets for a given alignment
 */
function getSyllableSets(alignment: NameAlignment): {
  start: string[];
  middle: string[];
  end: string[];
} {
  switch (alignment) {
    case 1: return { start: EVIL_START, middle: EVIL_MIDDLE, end: EVIL_END };
    case 2: return { start: CELTIC_START, middle: CELTIC_MIDDLE, end: CELTIC_END };
    case 3: return { start: NORDIC_START, middle: NORDIC_MIDDLE, end: NORDIC_END };
    case 4: return { start: GERMANIC_START, middle: GERMANIC_MIDDLE, end: GERMANIC_END };
    case 5: return { start: LATIN_START, middle: LATIN_MIDDLE, end: LATIN_END };
    case 6: return { start: GREEK_START, middle: GREEK_MIDDLE, end: GREEK_END };
    case 7: return { start: SLAVIC_START, middle: SLAVIC_MIDDLE, end: SLAVIC_END };
    case 8: return { start: ARABIC_START, middle: ARABIC_MIDDLE, end: ARABIC_END };
    case 9: return { start: FINNISH_START, middle: FINNISH_MIDDLE, end: FINNISH_END };
    case 10: return { start: BASQUE_START, middle: BASQUE_MIDDLE, end: BASQUE_END };
    case 11: return { start: ELVISH_START, middle: ELVISH_MIDDLE, end: ELVISH_END };
    case 12: return { start: DRACONIC_START, middle: DRACONIC_MIDDLE, end: DRACONIC_END };
    case 13: return { start: PRIMORDIAL_START, middle: PRIMORDIAL_MIDDLE, end: PRIMORDIAL_END };
    case 14: return { start: INFERNAL_START, middle: INFERNAL_MIDDLE, end: INFERNAL_END };
    case 15: return { start: ANGLO_START, middle: ANGLO_MIDDLE, end: ANGLO_END };
    case 16: return { start: STEPPE_START, middle: STEPPE_MIDDLE, end: STEPPE_END };
    case 17: return { start: EGYPTIAN_START, middle: EGYPTIAN_MIDDLE, end: EGYPTIAN_END };
    default:
      throw new Error("Alignment must be between 1 and 17");
  }
}

/**
 * Generate fantasy names based on alignment/style
 */
export function generateNames(
  alignment: NameAlignment,
  numNames: number = 10,
): NameGenerationResult {
  try {
    if (alignment < 1 || alignment > 17) {
      return {
        success: false,
        error: "Alignment must be between 1 and 17",
      };
    }

    if (numNames < 1) {
      return {
        success: false,
        error: "Number of names must be at least 1",
      };
    }

    const { start, middle, end } = getSyllableSets(alignment);
    const names: string[] = [];

    for (let i = 0; i < numNames; i++) {
      const numSyllables = Math.floor(Math.random() * 3) + 2; // 2-4 syllables

      let name = start[Math.floor(Math.random() * start.length)];

      // Add middle syllables
      for (let j = 0; j < numSyllables - 2; j++) {
        name += middle[Math.floor(Math.random() * middle.length)];
      }

      // Add ending
      name += end[Math.floor(Math.random() * end.length)];

      // Capitalize properly
      names.push(name.charAt(0).toUpperCase() + name.slice(1).toLowerCase());
    }

    return {
      success: true,
      alignment,
      names,
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Unexpected error occurred",
    };
  }
}

/**
 * Get available alignment options
 */
export function getAlignmentOptions(): Array<{
  value: NameAlignment;
  label: string;
}> {
  return [
    { value: 1, label: "Evil" },
    { value: 2, label: "Celtic (Gaelic)" },
    { value: 3, label: "Nordic (Old Norse)" },
    { value: 4, label: "Germanic" },
    { value: 5, label: "Latin" },
    { value: 6, label: "Ancient Greek" },
    { value: 7, label: "Slavic" },
    { value: 8, label: "Arabic/Persian" },
    { value: 9, label: "Finnish" },
    { value: 10, label: "Basque" },
    { value: 11, label: "Elvish" },
    { value: 12, label: "Draconic" },
    { value: 13, label: "Primordial" },
    { value: 14, label: "Infernal" },
    { value: 15, label: "Anglo-Saxon" },
    { value: 16, label: "Steppe Nomad" },
    { value: 17, label: "Ancient Egyptian" }
  ];
}

/**
 * Get alignment name by number
 */
export function getAlignmentName(alignment: NameAlignment): string {
  return ALIGNMENT_NAMES[alignment];
}

/**
 * Validate alignment value
 */
export function isValidAlignment(value: any): value is NameAlignment {
  return typeof value === "number" && value >= 1 && value <= 17;
}
