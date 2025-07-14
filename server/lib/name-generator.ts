/**
 * Name Generator (TypeScript)
 * Generates fantasy names based on different alignment/style categories
 */

// Level 1: Evil
const EVIL_START = [
  "Sk",
  "Zu",
  "Ve",
  "Ul",
  "Kr",
  "Gr",
  "Th",
  "Dr",
  "Bl",
  "Sh",
  "Vy",
  "Ky",
  "Ny",
  "Py",
  "Ry",
  "Sy",
  "Ty",
  "Wy",
  "Zy",
  "Fy",
];

const EVIL_MIDDLE = [
  "yu",
  "sky",
  "ly",
  "pu",
  "ye",
  "ed",
  "ud",
  "sk",
  "or",
  "ar",
  "ur",
  "ir",
  "er",
  "ak",
  "ok",
  "uk",
  "ik",
  "ek",
  "oz",
  "az",
];

const EVIL_END = [
  "d",
  "e",
  "k",
  "sk",
  "st",
  "rl",
  "th",
  "nd",
  "rk",
  "sh",
  "gr",
  "bl",
  "dr",
  "kr",
  "vd",
  "yd",
  "zd",
  "fd",
  "ld",
  "md",
];

// Level 2: Slavic
const SLAVIC_START = [
  "Sv",
  "Mir",
  "Dus",
  "Bor",
  "Vlad",
  "Kat",
  "Nik",
  "Olg",
  "Pav",
  "Rad",
  "Yar",
  "Zor",
  "Lud",
  "Mil",
  "Nat",
  "Ost",
  "Pet",
  "Rus",
  "Stan",
  "Tad",
];

const SLAVIC_MIDDLE = [
  "ya",
  "ye",
  "lo",
  "va",
  "mi",
  "ro",
  "sla",
  "to",
  "dra",
  "ka",
  "li",
  "na",
  "po",
  "ra",
  "si",
  "ta",
  "vi",
  "za",
  "bo",
  "du",
];

const SLAVIC_END = [
  "ov",
  "a",
  "in",
  "ka",
  "la",
  "mir",
  "slav",
  "yev",
  "ich",
  "ko",
  "na",
  "or",
  "ski",
  "va",
  "yan",
  "zin",
  "dor",
  "gar",
  "len",
  "nov",
];

// Level 3: Anglo-Saxon
const ANGLO_START = [
  "Æth",
  "Ead",
  "Alf",
  "Beo",
  "Cyn",
  "Dun",
  "Edg",
  "Fre",
  "God",
  "Her",
  "Ing",
  "Leo",
  "Mund",
  "Off",
  "Red",
  "Sig",
  "Theod",
  "Wig",
  "Wulf",
  "Ælf",
];

const ANGLO_MIDDLE = [
  "win",
  "mund",
  "ric",
  "stan",
  "wald",
  "frith",
  "gar",
  "helm",
  "sige",
  "weard",
  "beald",
  "cild",
  "dred",
  "ferth",
  "gund",
  "heard",
  "laf",
  "noth",
  "ræd",
  "swith",
];

const ANGLO_END = [
  "red",
  "gar",
  "wulf",
  "helm",
  "sige",
  "weard",
  "beald",
  "cild",
  "dred",
  "ferth",
  "gund",
  "heard",
  "laf",
  "noth",
  "ræd",
  "swith",
  "bert",
  "frid",
  "mund",
  "ric",
];

// Level 4: Fae/Elvish
const ELVISH_START = [
  "El",
  "Ar",
  "Fin",
  "Gal",
  "Leg",
  "Thran",
  "Mir",
  "Lor",
  "Ae",
  "Ce",
  "Fe",
  "Gla",
  "Ha",
  "Il",
  "La",
  "Ma",
  "Na",
  "Oro",
  "Quen",
  "Sil",
];

const ELVISH_MIDDLE = [
  "en",
  "ion",
  "ad",
  "or",
  "el",
  "ith",
  "ael",
  "aur",
  "eor",
  "ian",
  "lor",
  "mir",
  "nor",
  "ril",
  "thar",
  "uin",
  "wen",
  "yar",
  "zir",
  "dor",
];

const ELVISH_END = [
  "dor",
  "las",
  "wen",
  "ril",
  "thar",
  "ion",
  "ael",
  "aur",
  "eor",
  "ian",
  "lor",
  "mir",
  "nor",
  "del",
  "fel",
  "gil",
  "hel",
  "kel",
  "mel",
  "nel",
];

export type NameAlignment = 1 | 2 | 3 | 4;

export const ALIGNMENT_NAMES = {
  1: "Evil",
  2: "Slavic",
  3: "Anglo-Saxon",
  4: "Fae/Elvish",
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
    case 1: // Evil
      return { start: EVIL_START, middle: EVIL_MIDDLE, end: EVIL_END };
    case 2: // Slavic
      return { start: SLAVIC_START, middle: SLAVIC_MIDDLE, end: SLAVIC_END };
    case 3: // Anglo-Saxon
      return { start: ANGLO_START, middle: ANGLO_MIDDLE, end: ANGLO_END };
    case 4: // Fae/Elvish
      return { start: ELVISH_START, middle: ELVISH_MIDDLE, end: ELVISH_END };
    default:
      throw new Error("Alignment must be between 1 and 4");
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
    if (alignment < 1 || alignment > 4) {
      return {
        success: false,
        error: "Alignment must be between 1 and 4",
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
    { value: 2, label: "Slavic" },
    { value: 3, label: "Anglo-Saxon" },
    { value: 4, label: "Fae/Elvish" },
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
  return typeof value === "number" && value >= 1 && value <= 4;
}
