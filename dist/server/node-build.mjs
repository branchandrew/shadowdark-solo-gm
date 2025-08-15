import fetch from "node-fetch";
globalThis.fetch = fetch;
import path from "path";
import * as express from "express";
import express__default from "express";
import cors from "cors";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@supabase/supabase-js";
import { fileURLToPath } from "url";
const handleDemo = (req, res) => {
  const response = {
    message: "Hello from Express server"
  };
  res.status(200).json(response);
};
const anthropic$7 = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});
const handleAIChat = async (req, res) => {
  var _a, _b, _c;
  const { message, context } = req.body;
  try {
    console.log("API Key present:", !!process.env.ANTHROPIC_API_KEY);
    console.log("API Key length:", (_a = process.env.ANTHROPIC_API_KEY) == null ? void 0 : _a.length);
    console.log(
      "API Key starts with:",
      (_b = process.env.ANTHROPIC_API_KEY) == null ? void 0 : _b.substring(0, 10)
    );
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error("ANTHROPIC_API_KEY environment variable is not set");
    }
    const systemPrompt = `You are an AI Game Master for a solo Shadowdark TTRPG adventure using the Mythic GME system.

Current Adventure Context:
- Chaos Factor: ${(context == null ? void 0 : context.chaosFactor) || 5}
- Current Scene: ${(context == null ? void 0 : context.currentScene) || "Unknown"}
- Active Plot Threads: ${((_c = context == null ? void 0 : context.activeThreads) == null ? void 0 : _c.join(", ")) || "None"}

Your Role:
- Respond to player actions with dramatic, atmospheric descriptions
- Use the Mythic GME system to determine outcomes when uncertain
- Suggest dice rolls when appropriate (d20 for general actions, d100 for oracle questions)
- Keep responses concise but evocative (2-3 sentences typically)
- Maintain the dark, mysterious tone of Shadowdark
- Never break character or reveal meta-game information
- When uncertain about outcomes, suggest oracle questions or dice rolls

Player's Action: "${message}"

Respond as the GM would, describing what happens and asking for any necessary rolls or decisions.`;
    const claudeResponse = await anthropic$7.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 300,
      temperature: 0.7,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: message
        }
      ]
    });
    const responseText = claudeResponse.content[0].type === "text" ? claudeResponse.content[0].text : "I couldn't process that action. Please try again.";
    const response = {
      response: responseText,
      suggestions: [
        "Roll d20",
        "Ask oracle question",
        "Search area",
        "Listen carefully"
      ]
    };
    res.json(response);
  } catch (error) {
    console.error("Claude API Error:", error);
    res.status(500).json({
      success: false,
      error: `AI Chat failed: ${error instanceof Error ? error.message : "Unknown error"}`
    });
    return;
  }
};
class RelationalDatabase {
  supabase = null;
  constructor() {
    this.initializeSupabase();
  }
  initializeSupabase() {
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
    if (supabaseUrl && supabaseKey) {
      try {
        this.supabase = createClient(supabaseUrl, supabaseKey);
        console.log("Server Supabase initialized successfully");
      } catch (error) {
        console.warn("Failed to initialize Supabase on server:", error);
      }
    } else {
      console.log(
        "Supabase credentials not found on server - database writes disabled"
      );
    }
  }
  // === ADVENTURE ARC OPERATIONS ===
  async writeAdventureArcToSession(sessionId, data) {
    if (!this.supabase) {
      console.log("Supabase not available - skipping adventure arc write");
      return;
    }
    try {
      const { error } = await this.supabase.from("game_sessions").upsert({
        id: sessionId,
        adventure_arc: data.adventure_arc,
        campaign_elements: data.campaign_elements,
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      });
      if (error) {
        console.error("Failed to write adventure arc to session:", error);
      } else {
        console.log("Adventure arc written to session successfully");
      }
    } catch (error) {
      console.error("Database write error for adventure arc:", error);
    }
  }
  async writeAdventureArc(sessionId, adventureData) {
    if (!this.supabase) {
      console.log("Supabase not available - skipping adventure arc write");
      return null;
    }
    try {
      const adventureArcId = `arc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const { error } = await this.supabase.from("adventure_arcs").insert({
        id: adventureArcId,
        session_id: sessionId,
        ...adventureData
      });
      if (error) {
        console.error("Failed to write adventure arc to database:", error);
        return null;
      }
      console.log("Adventure arc written to database successfully");
      return adventureArcId;
    } catch (error) {
      console.error("Database write error for adventure arc:", error);
      return null;
    }
  }
  // === NPC OPERATIONS ===
  async addNPCs(sessionId, npcs) {
    if (!this.supabase || npcs.length === 0) return;
    try {
      const npcData = npcs.map((npc) => ({
        ...npc,
        session_id: sessionId
      }));
      const { error } = await this.supabase.from("npcs").insert(npcData);
      if (error) {
        console.error("Failed to add NPCs to database:", error);
      } else {
        console.log(`Added ${npcs.length} NPCs to database`);
      }
    } catch (error) {
      console.error("Database write error for NPCs:", error);
    }
  }
  // === CREATURE OPERATIONS ===
  async addCreatures(sessionId, creatures) {
    if (!this.supabase || creatures.length === 0) return;
    try {
      const creatureData = creatures.map((creature) => ({
        ...creature,
        session_id: sessionId
      }));
      const { error } = await this.supabase.from("creatures").insert(creatureData);
      if (error) {
        console.error("Failed to add creatures to database:", error);
      } else {
        console.log(`Added ${creatures.length} creatures to database`);
      }
    } catch (error) {
      console.error("Database write error for creatures:", error);
    }
  }
  // === FACTION OPERATIONS ===
  async addFactions(sessionId, factions) {
    if (!this.supabase || factions.length === 0) return;
    try {
      const factionData = factions.map((faction) => ({
        ...faction,
        session_id: sessionId
      }));
      const { error } = await this.supabase.from("factions").insert(factionData);
      if (error) {
        console.error("Failed to add factions to database:", error);
      } else {
        console.log(`Added ${factions.length} factions to database`);
      }
    } catch (error) {
      console.error("Database write error for factions:", error);
    }
  }
  // === THREAD OPERATIONS ===
  async addThreads(sessionId, threads) {
    if (!this.supabase || threads.length === 0) return;
    try {
      const threadData = threads.map((thread) => ({
        ...thread,
        session_id: sessionId
      }));
      const { error } = await this.supabase.from("threads").insert(threadData);
      if (error) {
        console.error("Failed to add threads to database:", error);
      } else {
        console.log(`Added ${threads.length} threads to database`);
      }
    } catch (error) {
      console.error("Database write error for threads:", error);
    }
  }
  // === CLUE OPERATIONS ===
  async addClues(sessionId, clues) {
    if (!this.supabase || clues.length === 0) return;
    try {
      const clueData = clues.map((clue) => ({
        ...clue,
        session_id: sessionId
      }));
      const { error } = await this.supabase.from("clues").insert(clueData);
      if (error) {
        console.error("Failed to add clues to database:", error);
      } else {
        console.log(`Added ${clues.length} clues to database`);
      }
    } catch (error) {
      console.error("Database write error for clues:", error);
    }
  }
  // === MONSTER OPERATIONS ===
  async addCustomMonster(monster) {
    if (!this.supabase) return null;
    try {
      const { data, error } = await this.supabase.from("monsters").insert({
        ...monster,
        source: "custom"
      }).select("id").single();
      if (error) {
        console.error("Failed to add custom monster:", error);
        return null;
      }
      return data.id;
    } catch (error) {
      console.error("Database write error for custom monster:", error);
      return null;
    }
  }
  async addSessionMonster(sessionId, monster) {
    if (!this.supabase) return;
    try {
      const { error } = await this.supabase.from("session_monsters").insert({
        ...monster,
        session_id: sessionId
      });
      if (error) {
        console.error("Failed to add session monster:", error);
      } else {
        console.log("Session monster added to database");
      }
    } catch (error) {
      console.error("Database write error for session monster:", error);
    }
  }
  // === BATCH OPERATIONS ===
  async addHiddenCampaignElements(sessionId, adventureArcId, elements) {
    if (!this.supabase) return;
    try {
      const {
        npcs = [],
        creatures = [],
        factions = [],
        threads = [],
        clues = []
      } = elements;
      if (npcs.length > 0) {
        await this.addNPCs(
          sessionId,
          npcs.map((npc) => ({
            ...npc,
            adventure_arc_id: npc.role === "lieutenant" || npc.role === "bbeg" ? adventureArcId : void 0
          }))
        );
      }
      if (creatures.length > 0) {
        await this.addCreatures(sessionId, creatures);
      }
      if (factions.length > 0) {
        await this.addFactions(
          sessionId,
          factions.map((faction) => ({
            ...faction,
            adventure_arc_id: adventureArcId
          }))
        );
      }
      if (threads.length > 0) {
        await this.addThreads(
          sessionId,
          threads.map((thread) => ({
            ...thread,
            adventure_arc_id: adventureArcId
          }))
        );
      }
      if (clues.length > 0) {
        await this.addClues(
          sessionId,
          clues.map((clue) => ({
            ...clue,
            adventure_arc_id: adventureArcId
          }))
        );
      }
      console.log("Hidden campaign elements added to database");
    } catch (error) {
      console.error("Database write error for campaign elements:", error);
    }
  }
  // === SESSION OPERATIONS ===
  async updateChaosFactor(sessionId, chaosFactor) {
    if (!this.supabase) return;
    try {
      const { error } = await this.supabase.from("game_sessions").upsert(
        {
          id: sessionId,
          chaos_factor: chaosFactor,
          updated_at: (/* @__PURE__ */ new Date()).toISOString()
        },
        { onConflict: "id" }
      );
      if (error) {
        console.error("Failed to update chaos factor:", error);
      }
    } catch (error) {
      console.error("Database write error for chaos factor:", error);
    }
  }
  async updateAdventureSettings(sessionId, settings) {
    if (!this.supabase) return;
    try {
      const { error } = await this.supabase.from("game_sessions").upsert(
        {
          id: sessionId,
          ...settings,
          updated_at: (/* @__PURE__ */ new Date()).toISOString()
        },
        { onConflict: "id" }
      );
      if (error) {
        console.error("Failed to update adventure settings:", error);
      }
    } catch (error) {
      console.error("Database write error for adventure settings:", error);
    }
  }
  // === UTILITY ===
  isAvailable() {
    return this.supabase !== null;
  }
}
const relationalDB = new RelationalDatabase();
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
  "Mal",
  "Vex",
  "Mor",
  "Nyx",
  "Zar",
  "Bla",
  "Grim",
  "Drak"
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
  "oth",
  "arn",
  "ugh",
  "okh",
  "aal",
  "uur"
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
  "goth",
  "mor",
  "oth",
  "ugh",
  "ash",
  "arn"
];
const CELTIC_START = [
  "Ai",
  "Bri",
  "Cai",
  "Dai",
  "Eo",
  "Fio",
  "Gwy",
  "Llo",
  "Mai",
  "Nia",
  "Oi",
  "Pry",
  "Rhy",
  "Sia",
  "Tei",
  "Una",
  "Bla",
  "Cae",
  "Dwy",
  "Gla",
  "Mor",
  "Bre",
  "Cer",
  "Dun",
  "Fen",
  "Gal",
  "Kil",
  "Llan",
  "Tre"
];
const CELTIC_MIDDLE = [
  "an",
  "wy",
  "ll",
  "dd",
  "ff",
  "rh",
  "th",
  "ch",
  "oe",
  "ae",
  "ei",
  "ou",
  "ia",
  "io",
  "ua",
  "ri",
  "gu",
  "gw",
  "dy",
  "fy",
  "lyn",
  "wen",
  "gar",
  "mor",
  "dor",
  "tan",
  "van",
  "han"
];
const CELTIC_END = [
  "an",
  "wy",
  "dd",
  "ff",
  "th",
  "ch",
  "wen",
  "lyn",
  "gan",
  "van",
  "dor",
  "mor",
  "gar",
  "tan",
  "han",
  "lan",
  "ron",
  "eon",
  "aig",
  "ais",
  "aith",
  "aidh",
  "ough",
  "edd",
  "ydd",
  "wyr"
];
const NORDIC_START = [
  "Bj",
  "Ey",
  "Gu",
  "Ha",
  "In",
  "Jo",
  "Kj",
  "Lo",
  "Mag",
  "Ol",
  "Ra",
  "Sig",
  "Th",
  "Ulf",
  "Vig",
  "As",
  "Br",
  "Dag",
  "Eg",
  "Fr",
  "Grim",
  "Heid",
  "Ing",
  "Kol",
  "Leif",
  "Rag",
  "Rune",
  "Stein",
  "Thor",
  "Tor"
];
const NORDIC_MIDDLE = [
  "ar",
  "er",
  "ir",
  "or",
  "ur",
  "an",
  "en",
  "in",
  "on",
  "un",
  "stein",
  "bjorn",
  "grim",
  "ulf",
  "thor",
  "gar",
  "mund",
  "rik",
  "berg",
  "dahl",
  "strand",
  "vik",
  "helm",
  "bald",
  "finn",
  "mark"
];
const NORDIC_END = [
  "son",
  "sen",
  "sson",
  "dottir",
  "ulf",
  "bjorn",
  "gar",
  "mund",
  "rik",
  "stein",
  "berg",
  "dahl",
  "strand",
  "vik",
  "helm",
  "bald",
  "finn",
  "mark",
  "thor",
  "grim",
  "ar",
  "er",
  "ir",
  "or",
  "ur",
  "yn",
  "en",
  "an"
];
const GERMANIC_START = [
  "Ad",
  "Ber",
  "Con",
  "Die",
  "Eck",
  "Fri",
  "Ger",
  "Hei",
  "Ing",
  "Kai",
  "Lud",
  "Man",
  "Nor",
  "Ot",
  "Rei",
  "Sig",
  "Thi",
  "Ulf",
  "Wal",
  "Wil",
  "Brun",
  "Ernst",
  "Gott",
  "Hart",
  "Karl",
  "Rich",
  "Wolf"
];
const GERMANIC_MIDDLE = [
  "hard",
  "bert",
  "helm",
  "mund",
  "rich",
  "wald",
  "fried",
  "grim",
  "bold",
  "mar",
  "win",
  "bald",
  "gang",
  "bert",
  "hold",
  "brand",
  "gar",
  "ward",
  "mann",
  "wolf"
];
const GERMANIC_END = [
  "rich",
  "bert",
  "fried",
  "mund",
  "wald",
  "helm",
  "hard",
  "bold",
  "bald",
  "brand",
  "gar",
  "ward",
  "mann",
  "wolf",
  "grim",
  "win",
  "mar",
  "gang",
  "hold",
  "hart"
];
const LATIN_START = [
  "Aur",
  "Bel",
  "Cas",
  "Dom",
  "Emp",
  "Fab",
  "Gra",
  "Hon",
  "Imp",
  "Jul",
  "Lac",
  "Mag",
  "Nob",
  "Oct",
  "Pal",
  "Qui",
  "Reg",
  "Sev",
  "Tit",
  "Urb",
  "Val",
  "Max",
  "Dec",
  "Fla",
  "Cor",
  "Mar",
  "Vic",
  "Luc"
];
const LATIN_MIDDLE = [
  "us",
  "ius",
  "ulus",
  "anus",
  "inus",
  "onus",
  "enus",
  "arius",
  "ensis",
  "icus",
  "tius",
  "lius",
  "rius",
  "sius",
  "ticus",
  "vius",
  "dius",
  "pius",
  "mius",
  "nius"
];
const LATIN_END = [
  "us",
  "ius",
  "anus",
  "inus",
  "icus",
  "orus",
  "arus",
  "erus",
  "urus",
  "etus",
  "atus",
  "itus",
  "otus",
  "utus",
  "ensis",
  "aris",
  "oris",
  "uris",
  "eris",
  "iris"
];
const GREEK_START = [
  "Al",
  "Ar",
  "Bry",
  "Cl",
  "De",
  "Eu",
  "Hy",
  "Id",
  "Ly",
  "Me",
  "Ni",
  "Ol",
  "Ph",
  "Rh",
  "St",
  "Th",
  "Xe",
  "Zy",
  "An",
  "Ap",
  "Dio",
  "Her",
  "Ath",
  "Dem",
  "Hel",
  "Neo",
  "Pan",
  "Soc"
];
const GREEK_MIDDLE = [
  "an",
  "ar",
  "as",
  "at",
  "es",
  "is",
  "os",
  "us",
  "yn",
  "yr",
  "kles",
  "phon",
  "dor",
  "krat",
  "phil",
  "theo",
  "gon",
  "arch",
  "sth",
  "mach"
];
const GREEK_END = [
  "es",
  "is",
  "os",
  "us",
  "as",
  "on",
  "ys",
  "ax",
  "ex",
  "ix",
  "kles",
  "phon",
  "dor",
  "krat",
  "phil",
  "theo",
  "gon",
  "arch",
  "tes",
  "des"
];
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
  "Bog",
  "Dra",
  "Gos",
  "Kaz",
  "Lyub",
  "Raz",
  "Slav",
  "Voj",
  "Zdan"
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
  "mir",
  "slav",
  "dan",
  "mil",
  "rad",
  "bog"
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
  "ek",
  "ak",
  "uk",
  "ik"
];
const ARABIC_START = [
  "Ab",
  "Al",
  "As",
  "Da",
  "Fa",
  "Ha",
  "Ib",
  "Ja",
  "Ka",
  "Ma",
  "Na",
  "Om",
  "Ra",
  "Sa",
  "Ta",
  "Wa",
  "Ya",
  "Za",
  "Kh",
  "Gh",
  "Mah",
  "Rah",
  "Sar",
  "Tar",
  "Ash",
  "Bah",
  "Dar",
  "Far",
  "Gar",
  "Har"
];
const ARABIC_MIDDLE = [
  "al",
  "ar",
  "as",
  "an",
  "am",
  "ah",
  "ad",
  "af",
  "ag",
  "aj",
  "mad",
  "had",
  "sad",
  "fad",
  "lah",
  "rah",
  "mah",
  "dah",
  "shah",
  "kah"
];
const ARABIC_END = [
  "ad",
  "af",
  "ah",
  "al",
  "am",
  "an",
  "ar",
  "as",
  "at",
  "az",
  "mad",
  "had",
  "sad",
  "fad",
  "lah",
  "rah",
  "mah",
  "dah",
  "shah",
  "kah",
  "din",
  "sir",
  "mir",
  "tar"
];
const FINNISH_START = [
  "Ai",
  "Ee",
  "Il",
  "Kal",
  "Lai",
  "Mik",
  "Nie",
  "Oi",
  "Pek",
  "Rai",
  "Sii",
  "Tai",
  "Uol",
  "Vai",
  "Yli",
  "Aki",
  "Esa",
  "Jaa",
  "Kaa",
  "Laa",
  "Maa",
  "Naa",
  "Paa",
  "Raa",
  "Saa",
  "Taa",
  "Vaa"
];
const FINNISH_MIDDLE = [
  "ki",
  "ko",
  "ka",
  "ke",
  "ku",
  "li",
  "lo",
  "la",
  "le",
  "lu",
  "mi",
  "mo",
  "ma",
  "me",
  "mu",
  "ni",
  "no",
  "na",
  "ne",
  "nu",
  "kki",
  "lli",
  "mmi",
  "nni",
  "ppi",
  "tti",
  "kka",
  "lla",
  "mma",
  "nna"
];
const FINNISH_END = [
  "nen",
  "inen",
  "ainen",
  "anen",
  "kka",
  "lla",
  "mma",
  "nna",
  "ppa",
  "tta",
  "ki",
  "ko",
  "ka",
  "ke",
  "ku",
  "li",
  "lo",
  "la",
  "le",
  "lu",
  "sto",
  "nen",
  "ken",
  "sen",
  "ten"
];
const BASQUE_START = [
  "Ait",
  "Bel",
  "Ek",
  "Ga",
  "Har",
  "Ib",
  "Jox",
  "Kol",
  "Lar",
  "Mit",
  "Nak",
  "Oin",
  "Pat",
  "Rud",
  "Sab",
  "Txe",
  "Urd",
  "Xab",
  "Yon",
  "Zur",
  "And",
  "Ber",
  "Deb",
  "Egi",
  "Fer",
  "Goi",
  "Ira",
  "Leh"
];
const BASQUE_MIDDLE = [
  "ar",
  "er",
  "ir",
  "or",
  "ur",
  "ai",
  "ei",
  "oi",
  "au",
  "eu",
  "tx",
  "tz",
  "rr",
  "ll",
  "dd",
  "kk",
  "tt",
  "pp",
  "ss",
  "nn",
  "eta",
  "arra",
  "erre",
  "uri"
];
const BASQUE_END = [
  "a",
  "e",
  "i",
  "o",
  "u",
  "z",
  "x",
  "k",
  "n",
  "r",
  "tx",
  "tz",
  "rr",
  "ll",
  "eta",
  "arra",
  "erre",
  "uri",
  "tegi",
  "degi"
];
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
  "Gil",
  "Cel",
  "Elu",
  "Lin",
  "Nim",
  "Tar",
  "Eru"
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
  "rond",
  "duin",
  "goth",
  "moth",
  "neth",
  "reth"
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
  "rond",
  "duin",
  "goth",
  "moth",
  "neth",
  "reth",
  "eth",
  "ith",
  "oth"
];
const DRACONIC_START = [
  "Tha",
  "Bah",
  "Vor",
  "Sar",
  "Kri",
  "Dra",
  "Zar",
  "Gha",
  "Mor",
  "Ash",
  "Pyrr",
  "Igna",
  "Umbr",
  "Terr",
  "Aqua",
  "Vent",
  "Lumi",
  "Tene",
  "Glaci",
  "Fulg"
];
const DRACONIC_MIDDLE = [
  "mat",
  "kul",
  "vor",
  "thar",
  "rax",
  "nax",
  "goth",
  "moth",
  "roth",
  "zoth",
  "prax",
  "krex",
  "thex",
  "vex",
  "hex",
  "rex",
  "lex",
  "nex"
];
const DRACONIC_END = [
  "rax",
  "nax",
  "goth",
  "moth",
  "roth",
  "zoth",
  "prax",
  "krex",
  "thex",
  "vex",
  "hex",
  "rex",
  "lex",
  "nex",
  "thar",
  "khar",
  "ghar",
  "vhar"
];
const PRIMORDIAL_START = [
  "Aer",
  "Aqu",
  "Igni",
  "Terr",
  "Umbr",
  "Lumi",
  "Glaci",
  "Fulg",
  "Vent",
  "Sil",
  "Cael",
  "Abys",
  "Ethr",
  "Void",
  "Prim",
  "Elem",
  "Flux",
  "Ess"
];
const PRIMORDIAL_MIDDLE = [
  "is",
  "us",
  "ar",
  "or",
  "al",
  "el",
  "il",
  "ul",
  "yn",
  "an",
  "oth",
  "ith",
  "eth",
  "uth",
  "ath",
  "oss",
  "iss",
  "ess",
  "uss",
  "ass"
];
const PRIMORDIAL_END = [
  "oss",
  "iss",
  "ess",
  "uss",
  "ass",
  "oth",
  "ith",
  "eth",
  "uth",
  "ath",
  "os",
  "is",
  "es",
  "us",
  "as",
  "ar",
  "or",
  "al",
  "el",
  "il"
];
const INFERNAL_START = [
  "Bel",
  "Dis",
  "Mal",
  "Lev",
  "Baa",
  "Ash",
  "Mol",
  "Nerg",
  "Set",
  "Bah",
  "Zeb",
  "Mam",
  "Bel",
  "Ast",
  "Deu",
  "Phl",
  "Bif",
  "Ose",
  "Amy",
  "Ori"
];
const INFERNAL_MIDDLE = [
  "ze",
  "pha",
  "mon",
  "goth",
  "moth",
  "roth",
  "zoth",
  "leth",
  "neth",
  "seth",
  "bub",
  "baal",
  "zar",
  "gar",
  "har",
  "var",
  "dar",
  "tar"
];
const INFERNAL_END = [
  "oth",
  "eth",
  "uth",
  "ith",
  "ath",
  "eus",
  "ius",
  "ous",
  "ael",
  "iel",
  "bub",
  "baal",
  "zar",
  "gar",
  "har",
  "var",
  "dar",
  "tar",
  "goth",
  "moth"
];
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
  "Beorn",
  "Cuth",
  "Ead",
  "Gar",
  "Hild",
  "Os",
  "Wil"
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
  "swith"
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
  "ric"
];
const STEPPE_START = [
  "Bat",
  "Che",
  "Dal",
  "Gan",
  "Kha",
  "Mun",
  "Nor",
  "Ork",
  "Qar",
  "Sub",
  "Tem",
  "Ulz",
  "Yam",
  "Zul",
  "Bog",
  "Dor",
  "Gen",
  "Jem",
  "Kul",
  "Mog"
];
const STEPPE_MIDDLE = [
  "khan",
  "gul",
  "bur",
  "dar",
  "gan",
  "hun",
  "jal",
  "kar",
  "lun",
  "mur",
  "nar",
  "ool",
  "pal",
  "qul",
  "sur",
  "tul",
  "uur",
  "val",
  "yal",
  "zul"
];
const STEPPE_END = [
  "khan",
  "gul",
  "bur",
  "dar",
  "gan",
  "hun",
  "jal",
  "kar",
  "lun",
  "mur",
  "nar",
  "ool",
  "pal",
  "qul",
  "sur",
  "tul",
  "uur",
  "val",
  "yal",
  "zul"
];
const EGYPTIAN_START = [
  "Akh",
  "Ank",
  "Anu",
  "Ato",
  "Hap",
  "Hor",
  "Isi",
  "Kha",
  "Nef",
  "Osi",
  "Pta",
  "Ra",
  "Set",
  "Tho",
  "Uto",
  "Ama",
  "Ben",
  "Dja",
  "Hem",
  "Kep",
  "Men",
  "Neb",
  "Per",
  "Sab",
  "Wab"
];
const EGYPTIAN_MIDDLE = [
  "em",
  "en",
  "ep",
  "er",
  "es",
  "et",
  "hotep",
  "ankh",
  "djed",
  "was",
  "ka",
  "ba",
  "akh",
  "sekh",
  "neb",
  "per",
  "dja",
  "hem",
  "kep",
  "men"
];
const EGYPTIAN_END = [
  "hotep",
  "ankh",
  "djed",
  "was",
  "ka",
  "ba",
  "akh",
  "sekh",
  "neb",
  "per",
  "dja",
  "hem",
  "kep",
  "men",
  "is",
  "es",
  "us",
  "os",
  "as"
];
const ALIGNMENT_NAMES = {
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
};
function getSyllableSets(alignment) {
  switch (alignment) {
    case 1:
      return { start: EVIL_START, middle: EVIL_MIDDLE, end: EVIL_END };
    case 2:
      return { start: CELTIC_START, middle: CELTIC_MIDDLE, end: CELTIC_END };
    case 3:
      return { start: NORDIC_START, middle: NORDIC_MIDDLE, end: NORDIC_END };
    case 4:
      return { start: GERMANIC_START, middle: GERMANIC_MIDDLE, end: GERMANIC_END };
    case 5:
      return { start: LATIN_START, middle: LATIN_MIDDLE, end: LATIN_END };
    case 6:
      return { start: GREEK_START, middle: GREEK_MIDDLE, end: GREEK_END };
    case 7:
      return { start: SLAVIC_START, middle: SLAVIC_MIDDLE, end: SLAVIC_END };
    case 8:
      return { start: ARABIC_START, middle: ARABIC_MIDDLE, end: ARABIC_END };
    case 9:
      return { start: FINNISH_START, middle: FINNISH_MIDDLE, end: FINNISH_END };
    case 10:
      return { start: BASQUE_START, middle: BASQUE_MIDDLE, end: BASQUE_END };
    case 11:
      return { start: ELVISH_START, middle: ELVISH_MIDDLE, end: ELVISH_END };
    case 12:
      return { start: DRACONIC_START, middle: DRACONIC_MIDDLE, end: DRACONIC_END };
    case 13:
      return { start: PRIMORDIAL_START, middle: PRIMORDIAL_MIDDLE, end: PRIMORDIAL_END };
    case 14:
      return { start: INFERNAL_START, middle: INFERNAL_MIDDLE, end: INFERNAL_END };
    case 15:
      return { start: ANGLO_START, middle: ANGLO_MIDDLE, end: ANGLO_END };
    case 16:
      return { start: STEPPE_START, middle: STEPPE_MIDDLE, end: STEPPE_END };
    case 17:
      return { start: EGYPTIAN_START, middle: EGYPTIAN_MIDDLE, end: EGYPTIAN_END };
    default:
      throw new Error("Alignment must be between 1 and 17");
  }
}
function generateNames$1(alignment, numNames = 10) {
  try {
    if (alignment < 1 || alignment > 17) {
      return {
        success: false,
        error: "Alignment must be between 1 and 17"
      };
    }
    if (numNames < 1) {
      return {
        success: false,
        error: "Number of names must be at least 1"
      };
    }
    const { start, middle, end } = getSyllableSets(alignment);
    const names = [];
    for (let i = 0; i < numNames; i++) {
      const numSyllables = Math.floor(Math.random() * 3) + 2;
      let name = start[Math.floor(Math.random() * start.length)];
      for (let j = 0; j < numSyllables - 2; j++) {
        name += middle[Math.floor(Math.random() * middle.length)];
      }
      name += end[Math.floor(Math.random() * end.length)];
      names.push(name.charAt(0).toUpperCase() + name.slice(1).toLowerCase());
    }
    return {
      success: true,
      alignment,
      names
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unexpected error occurred"
    };
  }
}
function getAlignmentOptions() {
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
function isValidAlignment(value) {
  return typeof value === "number" && value >= 1 && value <= 17;
}
const SHADOWDARK_VILLAIN_TYPES = [
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
  "Monstrosity"
];
function getRandomLieutenantTypes(count = 2) {
  try {
    if (count <= 0) {
      return {
        success: false,
        error: "Count must be greater than 0"
      };
    }
    if (count > SHADOWDARK_VILLAIN_TYPES.length) {
      count = SHADOWDARK_VILLAIN_TYPES.length;
    }
    const shuffled = [...SHADOWDARK_VILLAIN_TYPES];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    const selectedTypes = shuffled.slice(0, count);
    return {
      success: true,
      lieutenant_types: selectedTypes
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
}
function getVillainTypes() {
  try {
    return {
      success: true,
      villain_types: [...SHADOWDARK_VILLAIN_TYPES]
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
}
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
  "Worship as a deity"
];
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
  "King of Pentacles"
];
const CARD_POSITIONS = [
  "Seed",
  "Virtue",
  "Vice",
  "Rising Power",
  "Breaking Point",
  "Fate"
];
function generateAdventureSeeds() {
  const goal = GOALS[Math.floor(Math.random() * GOALS.length)];
  const gender = Math.random() < 0.8 ? "Male" : "Female";
  let race;
  if (Math.random() < 0.5) {
    race = SHADOWDARK_VILLAIN_TYPES[0];
  } else {
    const numRaces = SHADOWDARK_VILLAIN_TYPES.length;
    const weights = Array.from(
      { length: numRaces },
      (_, i) => (numRaces - i) ** 2
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
    race = race || SHADOWDARK_VILLAIN_TYPES[0];
  }
  const cards = [];
  for (let i = 0; i < 6; i++) {
    const card = TAROT_CARDS[Math.floor(Math.random() * TAROT_CARDS.length)];
    const orientation = Math.random() < 0.33 ? "Reversed" : "Upright";
    cards.push({
      position: CARD_POSITIONS[i],
      card_text: `${card} (${orientation})`
    });
  }
  return {
    goal,
    gender,
    race,
    cards
  };
}
const anthropic$6 = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY ?? ""
});
const generateNames = (alignment, numNames) => {
  try {
    if (!isValidAlignment(alignment)) {
      return Promise.resolve({
        success: false,
        error: "Alignment must be between 1 and 4"
      });
    }
    console.log(`Generating ${numNames} names with alignment ${alignment}`);
    const result = generateNames$1(alignment, numNames);
    console.log(`Name generation result:`, result);
    return Promise.resolve(result);
  } catch (error) {
    return Promise.resolve({
      success: false,
      error: error instanceof Error ? error.message : "Name generation failed"
    });
  }
};
const getLieutenantTypes$1 = (count = 2) => {
  try {
    console.log(`Getting ${count} lieutenant types using TypeScript`);
    const result = getRandomLieutenantTypes(count);
    console.log(`Generated lieutenant types:`, result.lieutenant_types);
    return Promise.resolve(result);
  } catch (error) {
    return Promise.resolve({
      success: false,
      error: error instanceof Error ? error.message : "Lieutenant types generation failed"
    });
  }
};
let cachedCreatureTypes = null;
const getCreatureTypes$1 = async () => {
  if (cachedCreatureTypes) {
    return cachedCreatureTypes;
  }
  try {
    const result = getVillainTypes();
    if (result.success && result.villain_types) {
      cachedCreatureTypes = result.villain_types;
      return cachedCreatureTypes;
    } else {
      throw new Error(result.error || "Failed to get villain types");
    }
  } catch (error) {
    console.warn(
      "Failed to get creature types from TypeScript, using fallback:",
      error
    );
    cachedCreatureTypes = [
      "Human",
      "Elf",
      "Dwarf",
      "Halfling",
      "Hobgoblin",
      "Drow",
      "Duergar",
      "Giant",
      "Devil",
      "Demon",
      "Elemental",
      "Fairy",
      "Oni",
      "Hag",
      "Dragon",
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
      "Monstrosity"
    ];
    return cachedCreatureTypes;
  }
};
const extractRaceFromDescription = async (description) => {
  const creatureTypes = await getCreatureTypes$1();
  const lowerDescription = description.toLowerCase();
  for (const race of creatureTypes) {
    if (lowerDescription.includes(race.toLowerCase())) {
      return race;
    }
  }
  if (lowerDescription.includes("squire") || lowerDescription.includes("knight") || lowerDescription.includes("soldier")) {
    return "Human";
  }
  if (lowerDescription.includes("frost") || lowerDescription.includes("ice") || lowerDescription.includes("cold")) {
    return "Elemental";
  }
  if (lowerDescription.includes("shadow") || lowerDescription.includes("dark") || lowerDescription.includes("soul")) {
    return "Undead";
  }
  if (lowerDescription.includes("trader") || lowerDescription.includes("merchant") || lowerDescription.includes("crystal")) {
    return "Human";
  }
  return null;
};
const standardizeMinions = (minions, creatureTypes) => {
  if (!minions || !minions.trim()) {
    return minions;
  }
  const lowerMinions = minions.toLowerCase();
  for (const creatureType of creatureTypes) {
    const lowerType = creatureType.toLowerCase();
    if (lowerMinions.includes(lowerType)) {
      if (isGenericDescription(minions, creatureType)) {
        console.log(
          `Replacing generic minion description with official type: ${creatureType}`
        );
        return creatureType;
      }
    }
  }
  const typeMapping = {
    "undead soldiers": "Skeleton",
    "undead warriors": "Skeleton",
    zombified: "Zombie",
    "animated corpses": "Zombie",
    "walking dead": "Zombie",
    skeletal: "Skeleton",
    "bone warriors": "Skeleton",
    "shadow creatures": "Wraith",
    "dark spirits": "Spirit",
    "evil spirits": "Spirit",
    ghostly: "Ghost",
    spectral: "Ghost",
    "demonic beings": "Demon",
    "hellish creatures": "Devil",
    infernal: "Devil",
    "elemental forces": "Elemental",
    "nature spirits": "Elemental",
    "corrupted beasts": "Beast",
    "twisted animals": "Beast",
    "monstrous creatures": "Monstrosity",
    "aberrant beings": "Monstrosity",
    "green-skinned brutes": "Orc",
    "brutish humanoids": "Orc",
    "small goblinoids": "Goblin",
    "tiny creatures": "Goblin"
  };
  for (const [pattern, replacement] of Object.entries(typeMapping)) {
    if (lowerMinions.includes(pattern)) {
      if (creatureTypes.includes(replacement)) {
        console.log(
          `Replacing "${pattern}" with official type: ${replacement}`
        );
        return replacement;
      }
    }
  }
  return minions;
};
const isGenericDescription = (description, officialType) => {
  const lowerDesc = description.toLowerCase();
  const lowerType = officialType.toLowerCase();
  const simplePatterns = [
    `${lowerType}s`,
    `${lowerType} minions`,
    `${lowerType} servants`,
    `${lowerType} followers`,
    `${lowerType} troops`,
    `${lowerType} warriors`,
    `undead ${lowerType}`,
    `corrupted ${lowerType}`,
    `evil ${lowerType}`,
    `dark ${lowerType}`
  ];
  for (const pattern of simplePatterns) {
    if (lowerDesc.includes(pattern) && description.length < 100) {
      return true;
    }
  }
  return false;
};
const createLieutenantDescription = (lieutenant, race, bbegName, factionName) => {
  const tarot = lieutenant.tarot_spread;
  const parts = [
    `${race} lieutenant serving ${bbegName}.`,
    `Core Nature: ${tarot.seed}`,
    `Background: ${tarot.background}`,
    `Occupation: ${tarot.location}`,
    `Loyalty: ${tarot.why_protect}`,
    `Methods: ${tarot.how_protect}`,
    `Special Ability: ${tarot.ability}`
  ];
  if (factionName && factionName.trim()) {
    parts.push(`Connected to ${factionName}.`);
  }
  return parts.join(" ");
};
const generateAdventure = async (req, res) => {
  var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m;
  try {
    const seeds = generateAdventureSeeds();
    const {
      theme = "Dark Fantasy",
      tone = "Mysterious",
      voice = "Atmospheric",
      session_id
    } = req.body || {};
    console.log("Adventure generation with style:", { theme, tone, voice });
    console.log("Session ID:", session_id);
    const cardsFormatted = seeds.cards.map((c) => `${c.position}: ${c.card_text}`).join("\n");
    console.log("Generating names for BBEG...");
    const personaPrompt = `Based on these tarot cards and style guidance, determine how this BBEG wants to appear to the public:

### STYLE GUIDANCE
Theme: ${theme}
Tone: ${tone}
Voice: ${voice}

### TAROT CARDS
${cardsFormatted}

### SOURCE DATA
Goal: ${seeds.goal}
Gender: ${seeds.gender}
Race: ${seeds.race}

Return a JSON object with your reasoning and choice:
1 = Openly evil/threatening (dark names like "Skurlth", "Veyak")
2 = Neutral/ambiguous (Slavic-style names like "Miroslav", "Katya")
3 = Noble/respectable (Anglo-Saxon names like "Aelfric", "Godwin")
4 = Ethereal/mystical (Elvish names like "Elrond", "Galadriel")

Consider: Does this villain hide behind a facade of respectability? Are they a corrupt noble? A false prophet? Or do they embrace being feared?

Return JSON:
{
  "alignment": 1-4,
  "reasoning": "Brief explanation of why this BBEG would want to appear this way to the public"
}`;
    const personaResponse = await anthropic$6.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 150,
      messages: [{ role: "user", content: personaPrompt }]
    });
    let alignment = 1;
    let alignmentReasoning = "Default to evil appearance";
    const rawPersonaResponse = ((_a = personaResponse.content[0].text) == null ? void 0 : _a.trim()) || "";
    console.log("Raw persona response:", rawPersonaResponse);
    try {
      const personaData = JSON.parse(rawPersonaResponse);
      alignment = parseInt(personaData.alignment) || 1;
      alignmentReasoning = personaData.reasoning || "No reasoning provided";
      console.log("Parsed persona data successfully:", personaData);
    } catch (e) {
      console.log("JSON parsing failed, trying fallback...");
      const numberMatch = rawPersonaResponse.match(/\d+/);
      alignment = numberMatch ? parseInt(numberMatch[0]) : 1;
      console.log("Fallback alignment:", alignment);
    }
    if (isNaN(alignment) || alignment < 1 || alignment > 4) {
      console.log("Invalid alignment detected, defaulting to 1");
      alignment = 1;
    }
    console.log(`
=== ALIGNMENT CHOICE ===`);
    console.log(`AI determined public persona alignment: ${alignment}`);
    console.log(`Reasoning: ${alignmentReasoning}`);
    console.log(`========================
`);
    const nameResult = await generateNames(alignment, 6);
    if (!nameResult.success) {
      throw new Error(`Name generation failed: ${nameResult.error}`);
    }
    console.log("Generated names:", nameResult.names);
    console.log("Getting random lieutenant types...");
    const lieutenantTypesResult = await getLieutenantTypes$1(2);
    if (!lieutenantTypesResult.success) {
      throw new Error(
        `Lieutenant types generation failed: ${lieutenantTypesResult.error}`
      );
    }
    console.log(
      "Generated lieutenant types:",
      lieutenantTypesResult.lieutenant_types
    );
    const userPrompt = `You are a narrative��design assistant tasked with forging a memorable Big Bad Evil Guy (BBEG) for a TTRPG campaign.  Work through the hidden reasoning steps below, **but reveal ONLY the JSON object requested in the Output section.**

### STYLE GUIDANCE
Theme: ${theme}
Tone: ${tone}
Voice: ${voice}

**IMPORTANT: All content must reflect the specified theme, tone, and voice. Let these guide every aspect of the BBEG's design, from their motivation to their methods to their presentation.**

### SOURCE DATA
Goal: ${seeds.goal}
Gender: ${seeds.gender}
Race: ${seeds.race}
Tarot Spread:
${cardsFormatted}

1. **Interpret each tarot card** in context of the villain's life.  Follow these shortcuts:
   • Major Arcana = fate‑shaping forces.  • Suits and Wands: ambition; Cups: emotion/loyalty; Swords: ideology/conflict; Pentacles: resources/influence.
   • Numbers��— Ace‑4: beginnings; 5‑7: struggle; 8‑10: climax; Court: Page(scout), Knight(enforcer), Queen(strategist), King(ruler).
   • Reversed indicates blockage, secrecy, or excess.
2. **Draft villain profile** (≈ 4 sentences): striking visual, core motivation, virtue‑vice contradiction, primary resource/lieutenant, hidden weakness, worst‑case future.
3. **Generate 8 investigative clues** that heroes might discover about this BBEG. These should include:
   • Clues pointing to the BBEG as the source of evil
   • Hints about potential weaknesses or vulnerabilities
   • Information about where the BBEG might be found or operates
   • Evidence of the BBEG's evil doings
   Make these diverse: rumors from NPCs, journal entries, prophecies/portents, signs in nature, direct physical evidence, etc. All clues must reflect the theme, tone, and voice.
4. **Generate a High Tower Surprise** — a twist that escalates danger during the final confrontation of the campaign. This is a key narrative reversal or complication that alters the expected outcome at the climax.

Follow these steps using Mythic GME rules:

4.1. Ask a Complex Fate Question:
   "What unexpected event or revelation occurs during the final confrontation with the BBEG?"

4.2. Roll for:
   - Chaos Factor (current value)
   - Scene Setup: is this scene expected, altered, or interrupted?
   - Event Focus + Meaning Table (if scene is altered or interrupted)

4.3. Interpret the result as a surprising, thematic escalation:
   - A new enemy appears?
   - A ritual completes accidentally?
   - The BBEG transforms or reveals a hidden agenda?
   - An ally betrays the party?
   - The location becomes unstable or cursed?

4.4. Show your reasoning:
   - Fate Question logic
   - Chaos roll
   - Scene setup determination
   - Event Focus and Meaning rolls
   - Justification for how this surprise fits with the BBEG's long-term arc

5. Return the final result as a one-paragraph narrative twist to insert during the final battle

5. **Select and enhance the BBEG name** from these pre-generated options:
   Generated Names: ${(_b = nameResult.names) == null ? void 0 : _b.join(", ")}

   • Choose the name that best fits the BBEG's character and the theme/tone
   • Consider ease of pronunciation and memorability
   • If appropriate for this type of villain, add a title such as:
     - Lord/Lady [name] (for noble/aristocratic villains)
     - [name] the [descriptor] (e.g., "the Destroyer", "the Corrupted", "the Shadow")
     - Just [name] (for subtle or mysterious villains)
   • Not all villains need titles - choose based on their nature and status
   • IMPORTANT: Include your reasoning for the name choice in the "name_reasoning" field
6. **Write a one‑sentence adventure hook** for the GM to read aloud, using the specified voice.

7. **Define Common Minions** - Create a creature type that serves as the most likely minions for this BBEG that PCs will fight many of on their pathway toward defeating Lieutenants and the BBEG. This should be:
   • A creature type that fits thematically with the BBEG and theme
   • Common enough to be encountered frequently
   • Challenging but not overwhelming for regular encounters
   • Reflect the BBEG's influence and corruption
   • 2-3 sentences describing their nature, appearance, and capabilities

7.5. **Standardize Minions** - Review your minion description from step 7 and compare it with these official Shadowdark creature types: ${(await getCreatureTypes$1()).join(", ")}
   • If your minion description closely matches any of these official types (e.g., you described "undead soldiers" and "Skeleton" is in the list), replace your description with the official type name
   • If your description is similar but more specific (e.g., "frost-touched zombies" vs "Zombie"), keep your creative description
   • If nothing in the official list is close to what you created, keep your original creative description
   • The goal is to use official types when they fit, but preserve unique creative minions when they don't
   • Simply state the final minion type/description you're using

8. **Generate exactly 2 Lieutenants** with the following requirements:

    8.1 Use these randomly selected creature types for the Lieutenants:
    Lieutenant 1: ${((_c = lieutenantTypesResult.lieutenant_types) == null ? void 0 : _c[0]) || "Human"}
    Lieutenant 2: ${((_d = lieutenantTypesResult.lieutenant_types) == null ? void 0 : _d[1]) || "Elf"}

   8.2 Identify one important feature or aspect of the BBEG (one different for each Lieutenant) and make the lieutenant the opposite. Examples:
    BBEG is hideous creature and is female > First Lieutenant is a gorgeous elf or fairy, Second Lieutenant is male
    BBEG is a male > Lieutenant is a female
    BBEG leads hordes of creatures > Lieutenant acts alone.

    8.3 Use the SAME tarot cards provided for the BBEG, but interpret each of the two Lieutenants differently. To do this, take the 6 tarot cards from the BBEG and re-order them randomly. Then answer the following questions with this new order, using the Tarot cards to inspire your narrative answers:
       * Seed: What defines their core nature?
       * Background: What is their origin story?
       * Location (Occupation): What is the Lieutenant's occupation?
       * Why Protect: What motivates their loyalty to the BBEG?
       * How Protect: What methods do they use to serve/protect the BBEG?
       * Ability: What unique ability, skill, power, or weapon does this lieutenant have that makes it unique?

     IMPORTANT: Provide pure narrative answers without revealing the actual tarot card names. The player should see meaningful story explanations, not "Five of Swords" or "The Emperor". Keep each interpretation to 1-2 sentences of pure story content. Do this TWICE, once for each lieutenant.

    8.4 Create comprehensive lieutenant descriptions and minion assignments:

       A. **Names**: Create evocative names for each of the 2 lieutenants that reflect their race and nature

       B. **Detailed Descriptions**: For each lieutenant, create a comprehensive description (3-4 sentences) that weaves together:
          • Their race/species and how it influences their appearance and abilities
          • All elements from their tarot reading (seed, background, occupation, motivations, methods, ability)
          • Their relationship to the BBEG (loyalty, fear, alliance, etc.)
          • Their role within the faction (if they're connected to it)
          • How their unique ability manifests and aids the BBEG's goals

       C. **Minion Leadership Analysis**: For each lieutenant, analyze whether they should lead minions:
          • Consider their race, occupation, and role
          • Ask: "Would this lieutenant naturally command others?"
          • If YES: What type of creatures would follow them? (Same as BBEG's minions, their own race, or something thematic to their ability?)
          • If NO: Why don't they have followers? (Solitary nature, ghost/incorporeal, assassin, etc.)
          • Provide clear reasoning for your decision

          Examples of lieutenants who WOULD have minions:
          - Orc Warlord → Commands Orcs
          - Thief Lord → Leads Thieves
          - Guard Captain → Commands Soldiers
          - Spider Queen → Controls Giant Spiders

          Examples who would NOT have minions:
          - Ancient Grimoire → Disembodied artifact
          - Assassin → Works alone
          - Ghost → Cannot command living beings
          - Hermit Sage → Reclusive by nature

9. **Create the Faction** which most aligns with the BBEG. It should reinforce the tone and theme of the adventure. Answer the following questions about it to create its details:
   �� The faction should align to at least one of the two Lieutenants. Which one? And why?
   • Is the faction loyal to the BBEG or do their motives just happen to align with it?
   • What sort of domain or territory does the faction control?
   • Provide a faction name and 2-3 sentence description that captures their nature, goals, and relationship to the BBEG

--- OUTPUT ---
Return one clean JSON object and nothing else.  Keep values concise:
• "bbeg_name" – the chosen name (title optional)
• "name_reasoning" – brief explanation of why this name was chosen from the options
��� "bbeg_hook" – the single sentence hook
• "bbeg_motivation" – one concise sentence
• "bbeg_detailed_description" – 3‑4 vivid sentences
• "clues" – array of exactly 8 strings, each a different type of clue
• "high_tower_surprise" ��� the major plot twist (2-3 sentences)
• "lieutenants" – array of exactly 2 lieutenant objects, each with:
  - "name": lieutenant's name
  - "description": comprehensive 3-4 sentence description integrating race, tarot elements, and relationships
  - "minions": description of what creatures they command (or empty string if none)
  - "tarot_spread": object with seed, background, location, why_protect, how_protect, ability
• "faction_name" – name of the aligned faction
• "faction_description" – description of faction (2-3 sentences)
• "minions" – description of common minion creature type (2-3 sentences)

{
  "bbeg_name": "",
  "name_reasoning": "",
  "bbeg_hook": "",
  "bbeg_motivation": "",
  "bbeg_detailed_description": "",
  "clues": ["", "", "", "", "", "", "", ""],
  "high_tower_surprise": "",
  "lieutenants": [
    {
      "name": "",
      "description": "",
      "minions": "",
      "tarot_spread": {
        "seed": "",
        "background": "",
        "location": "",
        "why_protect": "",
        "how_protect": "",
        "ability": ""
      }
    }
  ],
  "faction_name": "",
  "faction_description": "",
  "minions": ""
}`.trim();
    const messages = [{ role: "user", content: userPrompt }];
    console.log("Making Claude API call with messages:", messages.length);
    console.log(
      "First message content preview:",
      messages[0].content.substring(0, 100)
    );
    const ai = await anthropic$6.messages.create({
      model: "claude-3-5-sonnet-20241022",
      system: "Return only the JSON object requested.",
      max_tokens: 1200,
      temperature: 0.5,
      messages
    });
    console.log("Claude API response structure:", {
      id: ai.id,
      type: ai.type,
      role: ai.role,
      model: ai.model,
      contentLength: (_e = ai.content) == null ? void 0 : _e.length,
      stopReason: ai.stop_reason,
      usage: ai.usage
    });
    console.log("Claude response received");
    console.log("Content array length:", (_f = ai.content) == null ? void 0 : _f.length);
    console.log("First content type:", (_h = (_g = ai.content) == null ? void 0 : _g[0]) == null ? void 0 : _h.type);
    const rawText = ((_j = (_i = ai.content) == null ? void 0 : _i[0]) == null ? void 0 : _j.type) === "text" ? ai.content[0].text : "";
    console.log("Raw response:", rawText.substring(0, 200));
    if (!rawText) {
      throw new Error("No text content received from Claude");
    }
    let jsonText = rawText.trim();
    const jsonStart = jsonText.indexOf("{");
    const jsonEnd = jsonText.lastIndexOf("}");
    if (jsonStart >= 0 && jsonEnd > jsonStart) {
      jsonText = jsonText.substring(jsonStart, jsonEnd + 1);
    }
    console.log("Extracted JSON:", jsonText);
    let villain;
    try {
      villain = JSON.parse(jsonText);
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      console.error("Raw text that failed to parse:", jsonText);
      throw new Error(`Failed to parse Claude response as JSON: ${parseError}`);
    }
    console.log("Parsed villain:", villain);
    const creatureTypes = await getCreatureTypes$1();
    const originalMinions = villain.minions;
    villain.minions = standardizeMinions(villain.minions, creatureTypes);
    if (originalMinions !== villain.minions) {
      console.log(`
=== MINION STANDARDIZATION ===`);
      console.log(`Original: ${originalMinions}`);
      console.log(`Standardized: ${villain.minions}`);
      console.log(`===============================
`);
    }
    console.log(`
=== NAME SELECTION ===`);
    console.log(`Available names were: ${(_k = nameResult.names) == null ? void 0 : _k.join(", ")}`);
    console.log(`AI chose: ${villain.bbeg_name}`);
    console.log(
      `Reasoning: ${villain.name_reasoning || "No reasoning provided"}`
    );
    console.log(`=======================
`);
    if (session_id && relationalDB.isAvailable()) {
      console.log("Writing adventure arc to database...");
      const adventureArcId = await relationalDB.writeAdventureArc(session_id, {
        bbeg_name: villain.bbeg_name,
        bbeg_description: villain.bbeg_detailed_description,
        bbeg_motivation: villain.bbeg_motivation,
        bbeg_hook: villain.bbeg_hook,
        high_tower_surprise: villain.high_tower_surprise || ""
        // TODO: Link to minion monster when monster system is implemented
      });
      if (adventureArcId) {
        const hiddenElements2 = {
          creatures: [],
          factions: [],
          threads: [],
          clues: []
        };
        const bbegId = `creature_${Date.now()}_bbeg`;
        hiddenElements2.creatures.push({
          id: bbegId,
          name: villain.bbeg_name,
          race_species: seeds.race,
          description: villain.bbeg_detailed_description,
          creature_type: "bbeg",
          npc_disposition: "hostile",
          hidden: true,
          bbeg_motivation: villain.bbeg_motivation,
          bbeg_hook: villain.bbeg_hook,
          created_at: (/* @__PURE__ */ new Date()).toISOString(),
          updated_at: (/* @__PURE__ */ new Date()).toISOString()
        });
        if (villain.minions && villain.minions.trim()) {
          const minionsRace = await extractRaceFromDescription(villain.minions) || "Monster";
          hiddenElements2.creatures.push({
            id: `creature_${Date.now()}_bbeg_minion`,
            name: "BBEG Minions",
            race_species: minionsRace,
            description: villain.minions,
            creature_type: "monster",
            npc_disposition: "hostile",
            hidden: true,
            is_minion: true,
            minion_creature_id: bbegId,
            created_at: (/* @__PURE__ */ new Date()).toISOString(),
            updated_at: (/* @__PURE__ */ new Date()).toISOString()
          });
        }
        for (let index = 0; index < (villain.lieutenants || []).length; index++) {
          const lieutenant = villain.lieutenants[index];
          const lieutenantId = `creature_${Date.now()}_lt_${index}`;
          const lieutenantType = ((_l = lieutenantTypesResult.types) == null ? void 0 : _l[index]) || "Monster";
          const description = lieutenant.description || createLieutenantDescription(
            lieutenant,
            lieutenantType,
            villain.bbeg_name,
            villain.faction_name
          );
          hiddenElements2.creatures.push({
            id: lieutenantId,
            name: lieutenant.name,
            race_species: lieutenantType,
            description,
            creature_type: "lieutenant",
            npc_disposition: "hostile",
            hidden: true,
            lieutenant_seed: lieutenant.tarot_spread.seed,
            lieutenant_background: lieutenant.tarot_spread.background,
            lieutenant_occupation: lieutenant.tarot_spread.location,
            lieutenant_why_protect: lieutenant.tarot_spread.why_protect,
            lieutenant_how_protect: lieutenant.tarot_spread.how_protect,
            lieutenant_tarot_ability: lieutenant.tarot_spread.ability,
            created_at: (/* @__PURE__ */ new Date()).toISOString(),
            updated_at: (/* @__PURE__ */ new Date()).toISOString()
          });
          if (lieutenant.minions && lieutenant.minions.trim()) {
            const lieutenantMinionsRace = await extractRaceFromDescription(lieutenant.minions) || "Monster";
            hiddenElements2.creatures.push({
              id: `creature_${Date.now()}_lt_${index}_minion`,
              name: `${lieutenant.name}'s Minions`,
              race_species: lieutenantMinionsRace,
              description: lieutenant.minions,
              creature_type: "monster",
              npc_disposition: "hostile",
              hidden: true,
              is_minion: true,
              minion_creature_id: lieutenantId,
              created_at: (/* @__PURE__ */ new Date()).toISOString(),
              updated_at: (/* @__PURE__ */ new Date()).toISOString()
            });
          }
        }
        if (villain.faction_name) {
          hiddenElements2.factions.push({
            id: `faction_${Date.now()}`,
            adventure_arc_id: adventureArcId,
            name: villain.faction_name,
            description: villain.faction_description || "",
            influence: "moderate",
            relationship: "opposed",
            hidden: true,
            created_at: (/* @__PURE__ */ new Date()).toISOString(),
            updated_at: (/* @__PURE__ */ new Date()).toISOString()
          });
        }
        (_m = villain.clues) == null ? void 0 : _m.forEach((clue, index) => {
          hiddenElements2.clues.push({
            id: `clue_${Date.now()}_${index}`,
            adventure_arc_id: adventureArcId,
            description: clue,
            discovered: false,
            importance: "moderate",
            hidden: true,
            created_at: (/* @__PURE__ */ new Date()).toISOString(),
            updated_at: (/* @__PURE__ */ new Date()).toISOString()
          });
        });
        await relationalDB.addHiddenCampaignElements(
          session_id,
          adventureArcId,
          hiddenElements2
        );
        console.log("Adventure data written to database successfully");
      }
    }
    if (relationalDB.supabase) {
      try {
        await relationalDB.writeAdventureArcToSession(session_id, {
          adventure_arc: {
            bbeg: {
              name: villain.bbeg_name,
              description: villain.bbeg_detailed_description,
              motivation: villain.bbeg_motivation,
              hook: villain.bbeg_hook
            },
            clues: villain.clues || [],
            highTowerSurprise: villain.high_tower_surprise || "",
            lieutenants: villain.lieutenants || [],
            faction: {
              name: villain.faction_name || "",
              description: villain.faction_description || ""
            },
            minions: villain.minions || ""
          },
          campaign_elements: {
            threads: [],
            creatures: hiddenElements.creatures,
            factions: hiddenElements.factions,
            clues: hiddenElements.clues
          }
        });
        console.log("Adventure arc written to database successfully");
        res.json({ success: true });
      } catch (error) {
        console.error("Failed to write adventure arc to database:", error);
        res.json({
          ...villain,
          race: seeds.race,
          lieutenant_types: lieutenantTypesResult.types,
          success: true,
          fallback: true,
          message: "Database unavailable, returning data directly"
        });
      }
    } else {
      console.log("Database not available - returning data directly");
      res.json({
        ...villain,
        race: seeds.race,
        lieutenant_types: lieutenantTypesResult.types,
        success: true,
        fallback: true,
        message: "Database not configured, returning data directly"
      });
    }
  } catch (err) {
    console.error("Adventure generation error:", err);
    let errorMessage = "Unknown error occurred";
    let statusCode = 500;
    if (err instanceof Error) {
      errorMessage = err.message;
      if (errorMessage.includes("529") || errorMessage.includes("overloaded")) {
        errorMessage = "Claude API is currently overloaded. Please try again in a few moments.";
        statusCode = 503;
      } else if (errorMessage.includes("401") || errorMessage.includes("authentication")) {
        errorMessage = "API authentication failed. Please check configuration.";
        statusCode = 401;
      } else if (errorMessage.includes("rate limit") || errorMessage.includes("429")) {
        errorMessage = "Rate limit exceeded. Please wait before trying again.";
        statusCode = 429;
      } else if (errorMessage.includes("Invalid JSON")) {
        errorMessage = "Failed to parse AI response. Please try again.";
        statusCode = 502;
      } else if (errorMessage.includes("Python exited")) {
        errorMessage = "Adventure seed generation failed. Please try again.";
        statusCode = 502;
      }
    }
    res.status(statusCode).json({
      success: false,
      error: errorMessage,
      retryable: statusCode === 503 || statusCode === 429
    });
  }
};
let isGeneratingScene = false;
const anthropic$5 = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});
async function generateScene(req, res) {
  var _a, _b;
  if (isGeneratingScene) {
    console.log("BLOCKING CONCURRENT SCENE GENERATION REQUEST");
    return res.status(429).json({
      success: false,
      error: "Scene generation already in progress. Please wait."
    });
  }
  isGeneratingScene = true;
  console.log("ACQUIRED SCENE GENERATION LOCK");
  try {
    const {
      session_id,
      player_intentions,
      chaos_factor = 5,
      character,
      campaign_elements
    } = req.body;
    if (!session_id) {
      return res.status(400).json({
        success: false,
        error: "Session ID is required"
      });
    }
    console.log("=== STEP 1: Gathering Context Snapshot ===");
    console.log(
      "Received campaign_elements:",
      JSON.stringify(campaign_elements, null, 2)
    );
    const trackingId = `TRACK_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    console.log(`${trackingId} - Starting scene generation`);
    console.log(
      `${trackingId} - Received campaign_elements.bbeg:`,
      (_a = campaign_elements == null ? void 0 : campaign_elements.bbeg) == null ? void 0 : _a.name
    );
    if (!campaign_elements || !campaign_elements.bbeg || !campaign_elements.bbeg.name || campaign_elements.bbeg.name === "Unknown BBEG") {
      console.log(
        "WARNING: No valid campaign elements provided. Using fallback data for scene generation."
      );
    }
    console.log(
      `${trackingId} - Calling gatherContextSnapshot with campaign_elements.bbeg:`,
      (_b = campaign_elements == null ? void 0 : campaign_elements.bbeg) == null ? void 0 : _b.name
    );
    const contextSnapshot = await gatherContextSnapshot(
      session_id,
      character,
      campaign_elements,
      trackingId
    );
    console.log("Context Snapshot:", JSON.stringify(contextSnapshot, null, 2));
    console.log(
      "Player Intentions:",
      player_intentions || "No intentions specified"
    );
    console.log("=== STEP 2: Creating Scene Expectations ===");
    console.log(
      `${trackingId} - BEFORE createSceneExpectations - contextSnapshot.bbeg:`,
      JSON.stringify(contextSnapshot.bbeg, null, 2)
    );
    const sceneExpectations = await createSceneExpectations(
      contextSnapshot,
      player_intentions,
      trackingId
    );
    console.log("Scene Expectations:", sceneExpectations.description);
    console.log("Fate Rolls:", sceneExpectations.fateRolls);
    console.log("=== STEP 2 SUMMARY ===");
    console.log(`TIMESTAMP: ${(/* @__PURE__ */ new Date()).toISOString()}`);
    console.log("RESULTING SCENE SUMMARY:");
    console.log(sceneExpectations.description);
    console.log("Fate Roll Results:");
    sceneExpectations.fateRolls.forEach((roll) => {
      console.log(
        `- ${roll.question}: ${roll.result} (likelihood: ${roll.likelihood})`
      );
    });
    console.log("=== STEP 3: Scene Setup with Mythic Rolls ===");
    const sceneSetup = await performSceneSetup(chaos_factor, contextSnapshot);
    console.log(
      "Chaos Roll:",
      sceneSetup.chaosRoll,
      "vs Chaos Factor:",
      chaos_factor
    );
    console.log("Scene Type:", sceneSetup.sceneType);
    if (sceneSetup.randomEvent) {
      console.log("Random Event:", sceneSetup.randomEvent);
    }
    console.log("=== STEP 4: Establishing Scene Goal ===");
    const sceneGoals = await establishSceneGoals(
      sceneExpectations,
      sceneSetup,
      contextSnapshot,
      player_intentions
    );
    console.log("Scene Goal:", sceneGoals.goal);
    console.log("Success Conditions:", sceneGoals.successConditions);
    const sceneNumber = await getNextSceneNumber(session_id);
    const sceneIdResult = await runSceneIdGenerator();
    const scene = {
      id: sceneIdResult.scene_id,
      session_id,
      scene_number: sceneNumber,
      title: sceneGoals.title,
      description: sceneExpectations.description,
      player_intentions: player_intentions || null,
      context_snapshot: contextSnapshot,
      scene_expectations: sceneExpectations.description,
      fate_rolls: sceneExpectations.fateRolls,
      chaos_factor,
      chaos_roll: sceneSetup.chaosRoll,
      scene_type: sceneSetup.sceneType,
      random_event: sceneSetup.randomEvent || null,
      scene_goal: sceneGoals.goal,
      success_conditions: [],
      // Removed for now
      status: "active",
      created_at: (/* @__PURE__ */ new Date()).toISOString(),
      updated_at: (/* @__PURE__ */ new Date()).toISOString()
    };
    if (relationalDB.isAvailable()) {
      await relationalDB.createScene(scene);
    }
    res.json({
      success: true,
      scene
    });
  } catch (error) {
    console.error("Scene generation error:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred"
    });
  } finally {
    isGeneratingScene = false;
    console.log("RELEASED SCENE GENERATION LOCK");
  }
}
async function gatherContextSnapshot(sessionId, character, campaignElements, trackingId) {
  var _a, _b;
  console.log(
    `${trackingId} - gatherContextSnapshot - campaignElements parameter:`,
    JSON.stringify(campaignElements, null, 2)
  );
  const campaignData = campaignElements || await getCampaignElementsData();
  console.log(
    `${trackingId} - gatherContextSnapshot - final campaignData:`,
    JSON.stringify(campaignData, null, 2)
  );
  const characterData = character || await getCharacterData();
  const adventureLog = await getAdventureLogData();
  const bbeg = ((_a = campaignData.creatures) == null ? void 0 : _a.find(
    (creature) => creature.creature_type === "bbeg"
  )) || campaignData.bbeg || null;
  const npcs = ((_b = campaignData.creatures) == null ? void 0 : _b.filter(
    (creature) => creature.creature_type === "npc" || creature.creature_type === "lieutenant"
  )) || campaignData.npcs || [];
  return {
    bbeg: bbeg ? {
      name: bbeg.name,
      description: bbeg.description,
      motivation: bbeg.bbeg_motivation || bbeg.motivation
    } : null,
    npcs,
    plot_threads: campaignData.threads || campaignData.plot_threads || [],
    factions: campaignData.factions || [],
    adventure_log: adventureLog || [],
    character: characterData ? {
      name: characterData.name || "Unnamed Adventurer",
      level: characterData.level || 1,
      class: characterData.className || characterData.class || "Unknown",
      ancestry: characterData.ancestry || "Human",
      background: characterData.background || "Unknown"
    } : {
      name: "Unnamed Adventurer",
      level: 1,
      class: "Unknown"
    }
  };
}
async function getCampaignElementsData(sessionId) {
  return {
    bbeg: null,
    npcs: [],
    plot_threads: [],
    factions: []
  };
}
async function getCharacterData(sessionId) {
  try {
    if (typeof sessionStorage !== "undefined") {
      const characterData = sessionStorage.getItem("character");
      if (characterData) {
        const character = JSON.parse(characterData);
        return {
          name: character.name || "Unknown Adventurer",
          level: character.level || 1,
          class: character.className || "Fighter",
          ancestry: character.ancestry || "Human",
          background: character.background || "Unknown",
          stats: character.stats || {
            STR: 10,
            DEX: 10,
            CON: 10,
            INT: 10,
            WIS: 10,
            CHA: 10
          },
          hitPoints: character.hitPoints || 1,
          armorClass: character.armorClass || 10
        };
      }
    }
    return {
      name: "Unknown Adventurer",
      level: 1,
      class: "Fighter"
    };
  } catch (error) {
    console.error("Error getting character data:", error);
    return {
      name: "Unknown Adventurer",
      level: 1,
      class: "Fighter"
    };
  }
}
async function getAdventureLogData(sessionId) {
  try {
    return [];
  } catch (error) {
    console.error("Error getting adventure log:", error);
    return [];
  }
}
async function createSceneExpectations(contextSnapshot, playerIntentions, trackingId) {
  var _a, _b;
  console.log(
    `${trackingId} - === createSceneExpectations - contextSnapshot ===`
  );
  console.log(
    `${trackingId} - BBEG:`,
    JSON.stringify(contextSnapshot.bbeg, null, 2)
  );
  console.log(
    `${trackingId} - NPCs:`,
    JSON.stringify(contextSnapshot.npcs, null, 2)
  );
  console.log(
    `${trackingId} - Factions:`,
    JSON.stringify(contextSnapshot.factions, null, 2)
  );
  console.log(
    `${trackingId} - Plot Threads:`,
    JSON.stringify(contextSnapshot.plot_threads, null, 2)
  );
  const prompt = `You are a GM for a Shadowdark RPG solo session. Create scene expectations based on the story context and player intentions.

CONTEXT:
${contextSnapshot.bbeg ? `BBEG: ${contextSnapshot.bbeg.name} - ${contextSnapshot.bbeg.description}
Motivation: ${contextSnapshot.bbeg.motivation}

DEBUG_BBEG_NAME: ${contextSnapshot.bbeg.name}
DEBUG_BBEG_CHECK: The BBEG for this scene is named "${contextSnapshot.bbeg.name}" and must be referenced in the response.` : `BBEG: None set - This is a general adventure scene without a specific Big Bad Evil Guy.
DEBUG_BBEG_CHECK: No BBEG has been established for this adventure yet.`}

Current Plot Threads:
${contextSnapshot.plot_threads.map((thread) => `- ${thread.description} (${thread.status})`).join("\n")}

NPCs:
${contextSnapshot.npcs.map((npc) => {
    if (npc.tarot_spread) {
      return `- ${npc.name}: ${npc.tarot_spread.seed || npc.tarot_spread.background || "Lieutenant"}`;
    } else {
      return `- ${npc.name}: ${npc.description || "NPC"} (${npc.disposition || "unknown"})`;
    }
  }).join("\n")}

Factions:
${contextSnapshot.factions.map((faction) => `- ${faction.name}: ${faction.description} (${faction.relationship})`).join("\n")}

Previous Adventure Log:
${contextSnapshot.adventure_log.map((entry) => `- ${entry.content}`).join("\n")}

PLAYER INTENTIONS: ${playerIntentions || "No specific intentions stated"}

For each story element you want to include in this scene, make a FATE ROLL with a likelihood assessment and I'll tell you if it happens:

1. Should the BBEG be directly involved in this scene?
2. Should NPCs/Lieutenants appear in this scene?
3. Should this scene advance the main plot thread?
4. Should a faction be involved in this scene?
5. Should there be immediate danger or conflict?

Create a scene that logically follows from the player's intentions and current story state. Focus on what would make narrative sense for the next part of the story.

For each fate roll question, assess the likelihood based on the current story context. Use one of these Mythic Fate Table likelihood levels:
- very_likely
- likely
- 50_50
- unlikely
- very_unlikely

Return a JSON object with:
{
  "description": "A paragraph describing what this scene is probably about",
  "fateRolls": [
    {
      "question": "Should the BBEG be directly involved?",
      "likelihood": "very_likely|likely|50_50|unlikely|very_unlikely"
    }
    // ... more fate roll questions
  ]
}`;
  console.log("=== FULL LLM PROMPT ===");
  console.log(prompt);
  console.log("=== END LLM PROMPT ===");
  const randomSeed = Math.random().toString(36).substring(2, 15);
  const promptWithRandomization = `${prompt}

GENERATION_ID: ${randomSeed}
TIMESTAMP: ${(/* @__PURE__ */ new Date()).toISOString()}

Please ensure this is a completely fresh scene generation, not a cached response.`;
  console.log("=== FINAL PROMPT BEING SENT TO ANTHROPIC ===");
  console.log("Prompt length:", promptWithRandomization.length);
  console.log("BBEG name from context:", ((_a = contextSnapshot.bbeg) == null ? void 0 : _a.name) || "null");
  console.log(
    "Contains BBEG name:",
    ((_b = contextSnapshot.bbeg) == null ? void 0 : _b.name) ? promptWithRandomization.includes(contextSnapshot.bbeg.name) : false
  );
  const lines = promptWithRandomization.split("\n");
  const bbegLine = lines.find((line) => line.startsWith("BBEG:"));
  console.log("EXACT BBEG LINE IN PROMPT:", bbegLine);
  const debugLine = lines.find((line) => line.startsWith("DEBUG_BBEG_NAME:"));
  console.log("EXACT DEBUG LINE IN PROMPT:", debugLine);
  console.log("=== FIRST 800 CHARS OF PROMPT ===");
  console.log(promptWithRandomization.substring(0, 800));
  console.log("=== END FIRST 800 CHARS ===");
  console.log("=== END FINAL PROMPT DEBUG ===");
  const response = await anthropic$5.messages.create({
    model: "claude-3-5-sonnet-20241022",
    max_tokens: 800,
    temperature: 0.9,
    // Even more randomness
    messages: [{ role: "user", content: promptWithRandomization }]
  });
  console.log("=== ANTHROPIC API RESPONSE ===");
  console.log("Response ID:", response.id);
  console.log("Model used:", response.model);
  console.log("Stop reason:", response.stop_reason);
  console.log("Usage:", JSON.stringify(response.usage, null, 2));
  const content = response.content[0];
  if (content.type !== "text") {
    throw new Error("Invalid response from LLM");
  }
  console.log(
    "Raw response text (first 200 chars):",
    content.text.substring(0, 200)
  );
  console.log("=== END ANTHROPIC RESPONSE DEBUG ===");
  const jsonMatch = content.text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("No JSON found in LLM response");
  }
  const sceneData = JSON.parse(jsonMatch[0]);
  const fateRolls = await Promise.all(
    sceneData.fateRolls.map(async (roll) => {
      const fateResult = await runFateChart$1(roll.likelihood, 5);
      return {
        ...roll,
        roll: fateResult.roll,
        result: fateResult.result.toLowerCase().replace(" ", "_"),
        mythic_result: fateResult
      };
    })
  );
  return {
    description: sceneData.description,
    fateRolls
  };
}
async function performSceneSetup(chaosFactor, contextSnapshot) {
  const sceneSetup = await runSceneSetup(chaosFactor);
  if (sceneSetup.scene_type === "interrupted" && sceneSetup.random_event) {
    console.log("=== STEP 3 INTERRUPTION DETAILS ===");
    console.log("SCENE INTERRUPTED! Changes based on roll results:");
    console.log(`- Random Event Focus: ${sceneSetup.random_event.focus}`);
    console.log(
      `- Meaning: ${sceneSetup.random_event.meaning_action} ${sceneSetup.random_event.meaning_subject}`
    );
    console.log(`- Scene Change: ${sceneSetup.random_event.description}`);
    console.log(
      "The original scene expectations must now be modified to incorporate this unexpected element."
    );
  }
  return {
    chaosRoll: sceneSetup.chaos_roll,
    sceneType: sceneSetup.scene_type,
    randomEvent: sceneSetup.random_event
  };
}
const runFateChart$1 = (likelihood = "50/50", chaosFactor = 5) => {
  try {
    const { rollFateChart: rollFateChart2 } = require("../lib/mythic-fate-chart");
    const result = rollFateChart2(likelihood, chaosFactor);
    return Promise.resolve(result);
  } catch (error) {
    return Promise.reject(
      new Error(
        error instanceof Error ? error.message : "Fate chart error occurred"
      )
    );
  }
};
const runSceneSetup = (chaosFactor = 5) => {
  try {
    const { processSceneSetup } = require("../lib/scene-generator");
    const result = processSceneSetup(chaosFactor);
    return Promise.resolve(result);
  } catch (error) {
    return Promise.reject(
      new Error(
        error instanceof Error ? error.message : "Scene setup error occurred"
      )
    );
  }
};
const runSceneIdGenerator = () => {
  try {
    const { generateSceneId } = require("../lib/scene-generator");
    const sceneId = generateSceneId();
    return Promise.resolve({ scene_id: sceneId });
  } catch (error) {
    return Promise.reject(
      new Error(
        error instanceof Error ? error.message : "Scene ID generation error occurred"
      )
    );
  }
};
async function establishSceneGoals(sceneExpectations, sceneSetup, contextSnapshot, playerIntentions) {
  const prompt = `Based on the scene expectations and setup, establish clear scene goals.

SCENE EXPECTATIONS: ${sceneExpectations.description}

SCENE TYPE: ${sceneSetup.sceneType}
${sceneSetup.randomEvent ? `RANDOM EVENT: ${sceneSetup.randomEvent.description}` : ""}

PLAYER INTENTIONS: ${playerIntentions || "No specific intentions"}

Create a scene goal and success conditions. Return JSON:
{
  "title": "Brief scene title",
  "goal": "What the scene is trying to accomplish",
  "successConditions": ["Condition 1", "Condition 2", "Condition 3"]
}`;
  const response = await anthropic$5.messages.create({
    model: "claude-3-5-sonnet-20241022",
    max_tokens: 400,
    messages: [{ role: "user", content: prompt }]
  });
  const content = response.content[0];
  if (content.type !== "text") {
    throw new Error("Invalid response from LLM");
  }
  const jsonMatch = content.text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("No JSON found in LLM response");
  }
  return JSON.parse(jsonMatch[0]);
}
async function getNextSceneNumber(sessionId) {
  return 1;
}
const FATE_CHART = [
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
  [13, 15, 17, 18, 19, 19, 20, 20, 20]
];
const LIKELIHOOD_NAMES = [
  "Impossible",
  "Nearly Impossible",
  "Very Unlikely",
  "Unlikely",
  "50/50",
  "Likely",
  "Very Likely",
  "Nearly Certain",
  "Certain"
];
const RANDOM_EVENT_FOCUS_TABLE = [
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
  [86, 100, "Current Context"]
];
const ACTION_VERB$1 = [
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
  "Wound"
];
const ACTION_SUBJECT$1 = [
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
  "Waste"
];
function rollMeaningTableLocal() {
  const verbRoll = Math.floor(Math.random() * 100) + 1;
  const subjectRoll = Math.floor(Math.random() * 100) + 1;
  const verbIndex = Math.min(verbRoll - 1, ACTION_VERB$1.length - 1);
  const verb = ACTION_VERB$1[verbIndex];
  const subjectIndex = Math.min(subjectRoll - 1, ACTION_SUBJECT$1.length - 1);
  const subject = ACTION_SUBJECT$1[subjectIndex];
  return {
    verb_roll: verbRoll,
    verb,
    verb_index: verbIndex + 1,
    subject_roll: subjectRoll,
    subject,
    subject_index: subjectIndex + 1,
    meaning: `${verb} ${subject}`
  };
}
function rollRandomEvent() {
  const roll = Math.floor(Math.random() * 100) + 1;
  for (const [minVal, maxVal, eventType] of RANDOM_EVENT_FOCUS_TABLE) {
    if (minVal <= roll && roll <= maxVal) {
      const eventData = {
        event_roll: roll,
        event_type: eventType,
        event_range: `${minVal}-${maxVal}`
      };
      if (shouldTriggerMeaningTable(eventType)) {
        eventData.meaning_table = rollMeaningTableLocal();
      }
      return eventData;
    }
  }
  const fallbackData = {
    event_roll: roll,
    event_type: "Current Context",
    event_range: "86-100"
  };
  if (shouldTriggerMeaningTable("Current Context")) {
    fallbackData.meaning_table = rollMeaningTableLocal();
  }
  return fallbackData;
}
function shouldTriggerMeaningTable(eventType) {
  const meaningTriggerEvents = /* @__PURE__ */ new Set([
    "Move Toward A Thread",
    "Move Away From A Thread",
    "Close A Thread",
    "New NPC",
    "NPC Action",
    "Remote Event",
    "Ambiguous Event",
    "Current Context"
  ]);
  return meaningTriggerEvents.has(eventType);
}
function hasDoubles(roll) {
  if (roll < 10) {
    return false;
  }
  const tens = Math.floor(roll / 10);
  const ones = roll % 10;
  return tens === ones;
}
function rollFateChart$1(likelihood = "50/50", chaosFactor = 5) {
  if (!Number.isInteger(chaosFactor) || chaosFactor < 1 || chaosFactor > 9) {
    chaosFactor = 5;
  }
  let likelihoodIndex = 4;
  if (LIKELIHOOD_NAMES.includes(likelihood)) {
    likelihoodIndex = LIKELIHOOD_NAMES.indexOf(likelihood);
  }
  const roll = Math.floor(Math.random() * 99) + 1;
  const threshold = FATE_CHART[likelihoodIndex][chaosFactor - 1];
  const success = roll <= threshold;
  let exceptional = false;
  let resultText;
  if (success && roll <= Math.floor(threshold / 5)) {
    exceptional = true;
    resultText = "Exceptional Yes";
  } else if (!success && roll >= 96) {
    exceptional = true;
    resultText = "Exceptional No";
  } else if (success) {
    resultText = "Yes";
  } else {
    resultText = "No";
  }
  const doublesRolled = hasDoubles(roll);
  let randomEvent;
  if (doublesRolled && !exceptional) {
    randomEvent = rollRandomEvent();
  }
  const result = {
    roll,
    threshold,
    success,
    exceptional,
    result: resultText,
    likelihood,
    chaos_factor: chaosFactor,
    likelihood_index: likelihoodIndex,
    doubles: doublesRolled
  };
  if (randomEvent) {
    result.random_event = randomEvent;
  }
  return result;
}
const runFateChart = (likelihood = "50/50", chaosFactor = 5) => {
  try {
    const result = rollFateChart$1(likelihood, chaosFactor);
    return Promise.resolve(result);
  } catch (error) {
    return Promise.reject(
      new Error(
        error instanceof Error ? error.message : "Fate chart error occurred"
      )
    );
  }
};
const rollFateChart = async (req, res) => {
  try {
    const { likelihood = "50/50", chaos_factor = 5 } = req.body || {};
    console.log("Rolling Fate Chart with:", { likelihood, chaos_factor });
    const validChaosFactor = Math.max(
      1,
      Math.min(9, Number(chaos_factor) || 5)
    );
    const result = await runFateChart(likelihood, validChaosFactor);
    console.log("Fate Chart result:", result);
    const response = {
      success: true,
      roll: result.roll,
      threshold: result.threshold,
      result_success: result.success,
      // Renamed to avoid conflict with API success
      exceptional: result.exceptional,
      result: result.result,
      likelihood: result.likelihood,
      chaos_factor: result.chaos_factor,
      likelihood_index: result.likelihood_index,
      doubles: result.doubles,
      random_event: result.random_event || null,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    };
    console.log("Sending response:", response);
    res.json(response);
  } catch (error) {
    console.error("Error rolling Fate Chart:", error);
    console.error("Error details:", {
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : void 0
    });
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
      details: error instanceof Error ? error.stack : void 0
    });
  }
};
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
  "Wound"
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
  "Waste"
];
const DESCRIPTOR_1_ADVERBS = [
  "Adventurously",
  "Aggressively",
  "Anxiously",
  "Awkwardly",
  "Beautifully",
  "Bleakly",
  "Boldly",
  "Bravely",
  "Busily",
  "Calmly",
  "Carefully",
  "Carelessly",
  "Cautiously",
  "Ceaselessly",
  "Cheerfully",
  "Combatively",
  "Coolly",
  "Crazily",
  "Curiously",
  "Dangerously",
  "Defiantly",
  "Deliberately",
  "Delicately",
  "Delightfully",
  "Dimly",
  "Efficiently",
  "Emotionally",
  "Energetically",
  "Enormously",
  "Enthusiastically",
  "Excitedly",
  "Fearfully",
  "Ferociously",
  "Fiercely",
  "Foolishly",
  "Fortunately",
  "Frantically",
  "Freely",
  "Frighteningly",
  "Fully",
  "Generously",
  "Gently",
  "Gladly",
  "Gracefully",
  "Gratefully",
  "Happily",
  "Hastily",
  "Healthily",
  "Helpfully",
  "Helplessly",
  "Hopelessly",
  "Innocently",
  "Intensely",
  "Interestingly",
  "Irritatingly",
  "Joyfully",
  "Kindly",
  "Lazily",
  "Lightly",
  "Loosely",
  "Loudly",
  "Lovingly",
  "Loyally",
  "Majestically",
  "Meaningfully",
  "Mechanically",
  "Mildly",
  "Miserably",
  "Mockingly",
  "Mysteriously",
  "Naturally",
  "Neatly",
  "Nicely",
  "Oddly",
  "Offensively",
  "Officially",
  "Partially",
  "Passively",
  "Peacefully",
  "Perfectly",
  "Playfully",
  "Politely",
  "Positively",
  "Powerfully",
  "Quaintly",
  "Quarrelsomely",
  "Quietly",
  "Roughly",
  "Rudely",
  "Ruthlessly",
  "Slowly",
  "Softly",
  "Strangely",
  "Swiftly",
  "Threateningly",
  "Timidly",
  "Very",
  "Violently",
  "Wildly",
  "Yieldingly"
];
const DESCRIPTOR_2_ADJECTIVES = [
  "Abnormal",
  "Amusing",
  "Artificial",
  "Average",
  "Beautiful",
  "Bizarre",
  "Boring",
  "Bright",
  "Broken",
  "Clean",
  "Cold",
  "Colorful",
  "Colorless",
  "Comforting",
  "Creepy",
  "Cute",
  "Damaged",
  "Dark",
  "Defeated",
  "Dirty",
  "Disagreeable",
  "Dry",
  "Dull",
  "Empty",
  "Enormous",
  "Extraordinary",
  "Extravagant",
  "Faded",
  "Familiar",
  "Fancy",
  "Feeble",
  "Festive",
  "Flawless",
  "Forlorn",
  "Fragile",
  "Fragrant",
  "Fresh",
  "Full",
  "Glorious",
  "Graceful",
  "Hard",
  "Harsh",
  "Healthy",
  "Heavy",
  "Historical",
  "Horrible",
  "Important",
  "Interesting",
  "Juvenile",
  "Lacking",
  "Large",
  "Lavish",
  "Lean",
  "Less",
  "Lethal",
  "Lively",
  "Lonely",
  "Lovely",
  "Magnificent",
  "Mature",
  "Messy",
  "Mighty",
  "Military",
  "Modern",
  "Mundane",
  "Mysterious",
  "Natural",
  "Normal",
  "Odd",
  "Old",
  "Pale",
  "Peaceful",
  "Petite",
  "Plain",
  "Poor",
  "Powerful",
  "Protective",
  "Quaint",
  "Rare",
  "Reassuring",
  "Remarkable",
  "Rotten",
  "Rough",
  "Ruined",
  "Rustic",
  "Scary",
  "Shocking",
  "Simple",
  "Small",
  "Smooth",
  "Soft",
  "Strong",
  "Stylish",
  "Unpleasant",
  "Valuable",
  "Vibrant",
  "Warm",
  "Watery",
  "Weak",
  "Young"
];
function rollMeaningTable$1() {
  const verbRoll = Math.floor(Math.random() * 100) + 1;
  const subjectRoll = Math.floor(Math.random() * 100) + 1;
  const verbIndex = Math.min(verbRoll - 1, ACTION_VERB.length - 1);
  const verb = ACTION_VERB[verbIndex];
  const subjectIndex = Math.min(subjectRoll - 1, ACTION_SUBJECT.length - 1);
  const subject = ACTION_SUBJECT[subjectIndex];
  return {
    verb_roll: verbRoll,
    verb,
    verb_index: verbIndex + 1,
    // Return 1-indexed for display
    subject_roll: subjectRoll,
    subject,
    subject_index: subjectIndex + 1,
    // Return 1-indexed for display
    meaning: `${verb} ${subject}`
  };
}
function rollDescriptorTable$1() {
  const adverbRoll = Math.floor(Math.random() * 100) + 1;
  const adjectiveRoll = Math.floor(Math.random() * 100) + 1;
  const adverbIndex = Math.min(adverbRoll - 1, DESCRIPTOR_1_ADVERBS.length - 1);
  const adverb = DESCRIPTOR_1_ADVERBS[adverbIndex];
  const adjectiveIndex = Math.min(adjectiveRoll - 1, DESCRIPTOR_2_ADJECTIVES.length - 1);
  const adjective = DESCRIPTOR_2_ADJECTIVES[adjectiveIndex];
  return {
    adverb_roll: adverbRoll,
    adverb,
    adverb_index: adverbIndex + 1,
    // Return 1-indexed for display
    adjective_roll: adjectiveRoll,
    adjective,
    adjective_index: adjectiveIndex + 1,
    // Return 1-indexed for display
    description: `${adverb} ${adjective}`
  };
}
const runMeaningTable = () => {
  try {
    const result = rollMeaningTable$1();
    return Promise.resolve(result);
  } catch (error) {
    return Promise.reject(
      new Error(
        error instanceof Error ? error.message : "Meaning table error occurred"
      )
    );
  }
};
const runDescriptorTable = () => {
  try {
    const result = rollDescriptorTable$1();
    return Promise.resolve(result);
  } catch (error) {
    return Promise.reject(
      new Error(
        error instanceof Error ? error.message : "Descriptor table error occurred"
      )
    );
  }
};
const rollMeaningTable = async (req, res) => {
  try {
    console.log("Rolling Meaning Table (Action/Subject)");
    const result = await runMeaningTable();
    console.log("Meaning Table result:", result);
    const response = {
      success: true,
      verb_roll: result.verb_roll || 0,
      verb: result.verb || "Unknown",
      verb_index: result.verb_index || 0,
      subject_roll: result.subject_roll || 0,
      subject: result.subject || "Unknown",
      subject_index: result.subject_index || 0,
      meaning: result.meaning || "Unknown Unknown",
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    };
    console.log("Sending response:", response);
    res.json(response);
  } catch (error) {
    console.error("Error rolling Meaning Table:", error);
    console.error("Error details:", {
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : void 0
    });
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
      details: error instanceof Error ? error.stack : void 0
    });
  }
};
const rollDescriptorTable = async (req, res) => {
  try {
    console.log("Rolling Descriptor Table (Adverb/Adjective)");
    const result = await runDescriptorTable();
    console.log("Descriptor Table result:", result);
    const response = {
      success: true,
      adverb_roll: result.adverb_roll || 0,
      adverb: result.adverb || "Unknown",
      adverb_index: result.adverb_index || 0,
      adjective_roll: result.adjective_roll || 0,
      adjective: result.adjective || "Unknown",
      adjective_index: result.adjective_index || 0,
      description: result.description || "Unknown Unknown",
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    };
    console.log("Sending response:", response);
    res.json(response);
  } catch (error) {
    console.error("Error rolling Descriptor Table:", error);
    console.error("Error details:", {
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : void 0
    });
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
      details: error instanceof Error ? error.stack : void 0
    });
  }
};
async function getSessionData(req, res) {
  try {
    const { session_id } = req.body;
    if (!session_id) {
      return res.status(400).json({
        success: false,
        error: "Session ID is required"
      });
    }
    console.log("Getting session data for:", session_id);
    if (!relationalDB.isAvailable()) {
      return res.status(503).json({
        success: false,
        error: "Database not available"
      });
    }
    const [creatures, factions, clues, threads] = await Promise.all([
      relationalDB.getCreatures(session_id),
      relationalDB.getFactions(session_id),
      relationalDB.getClues(session_id),
      relationalDB.getThreads(session_id)
    ]);
    const sessionData = {
      creatures: creatures || [],
      factions: factions || [],
      clues: clues || [],
      threads: threads || []
    };
    console.log(
      "Retrieved session data:",
      JSON.stringify(sessionData, null, 2)
    );
    res.json({
      success: true,
      data: sessionData
    });
  } catch (error) {
    console.error("Session data retrieval error:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred"
    });
  }
}
const getCreatureTypesFromTS = () => {
  try {
    const result = getVillainTypes();
    if (result.success && result.villain_types) {
      return Promise.resolve(result.villain_types);
    } else {
      return Promise.reject(
        new Error(result.error || "Failed to get villain types")
      );
    }
  } catch (error) {
    return Promise.reject(
      new Error(error instanceof Error ? error.message : "Unknown error")
    );
  }
};
const FALLBACK_CREATURE_TYPES = [...SHADOWDARK_VILLAIN_TYPES];
const getCreatureTypes = async (req, res) => {
  try {
    let creatureTypes = [];
    try {
      creatureTypes = await getCreatureTypesFromTS();
      console.log(
        `Loaded ${creatureTypes.length} creature types from TypeScript`
      );
    } catch (error) {
      console.warn(
        "Failed to get creature types from TypeScript implementation, using fallback:",
        error
      );
      creatureTypes = FALLBACK_CREATURE_TYPES;
    }
    if (relationalDB.supabase) {
      try {
        await syncCreatureTypesToDatabase(creatureTypes);
      } catch (error) {
        console.warn("Failed to sync creature types to database:", error);
      }
    }
    res.json({
      success: true,
      creature_types: creatureTypes,
      source: creatureTypes === FALLBACK_CREATURE_TYPES ? "fallback" : "typescript"
    });
  } catch (error) {
    console.error("Error getting creature types:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      creature_types: FALLBACK_CREATURE_TYPES,
      source: "fallback"
    });
  }
};
async function syncCreatureTypesToDatabase(types) {
  if (!relationalDB.supabase) return;
  try {
    await relationalDB.supabase.from("creature_types").delete().eq("category", "shadowdark_villain");
    const typeData = types.map((type, index) => ({
      name: type,
      category: "shadowdark_villain",
      description: `Shadowdark villain type: ${type}`
    }));
    const { error } = await relationalDB.supabase.from("creature_types").insert(typeData);
    if (error) {
      throw new Error(`Database sync failed: ${error.message}`);
    }
    console.log(`Synced ${types.length} creature types to database`);
  } catch (error) {
    console.error("Failed to sync creature types to database:", error);
    throw error;
  }
}
const DEFAULT_TERRAINS = [
  "plains",
  "forest",
  "dark_forest",
  "hills",
  "mountains",
  "lake",
  "marshlands",
  "ruins"
];
const TERRAIN_COMPATIBILITY = {
  plains: {
    plains: 5,
    forest: 3,
    hills: 2.5,
    lake: 2,
    dark_forest: 0.5,
    mountains: 1,
    marshlands: 1.5,
    ruins: 2
  },
  forest: {
    forest: 5,
    plains: 3,
    dark_forest: 3.5,
    hills: 2.8,
    mountains: 2,
    lake: 2.2,
    marshlands: 1.5,
    ruins: 1.8
  },
  dark_forest: {
    dark_forest: 5,
    forest: 3,
    marshlands: 3.5,
    ruins: 3.5,
    mountains: 2,
    hills: 1.5,
    plains: 0.5,
    lake: 0.3
  },
  hills: {
    hills: 5,
    mountains: 4,
    plains: 3,
    forest: 2.8,
    dark_forest: 1.5,
    lake: 1.2,
    marshlands: 0.5,
    ruins: 2.5
  },
  mountains: {
    mountains: 5,
    hills: 4,
    forest: 2,
    dark_forest: 2,
    lake: 1.5,
    plains: 1.2,
    marshlands: 0.2,
    ruins: 2.2
  },
  lake: {
    lake: 4,
    plains: 2,
    forest: 2.5,
    marshlands: 3.5,
    hills: 1.2,
    mountains: 1.5,
    dark_forest: 0.3,
    ruins: 1.2
  },
  marshlands: {
    marshlands: 5,
    lake: 3.5,
    dark_forest: 3.5,
    forest: 1.2,
    plains: 1.5,
    hills: 0.5,
    mountains: 0.2,
    ruins: 2
  },
  ruins: {
    ruins: 3,
    dark_forest: 3.5,
    hills: 2,
    mountains: 1.8,
    plains: 1.8,
    forest: 1.5,
    marshlands: 1.5,
    lake: 1
  }
};
class HexMapGenerator {
  width;
  height;
  terrains;
  mapGrid = [];
  constructor(width = 15, height = 10, terrains) {
    this.width = width;
    this.height = height;
    this.terrains = terrains || [...DEFAULT_TERRAINS];
    this.validateCompatibilityMatrix();
  }
  validateCompatibilityMatrix() {
    for (const terrain of this.terrains) {
      if (!(terrain in TERRAIN_COMPATIBILITY)) {
        TERRAIN_COMPATIBILITY[terrain] = {};
        for (const t of this.terrains) {
          TERRAIN_COMPATIBILITY[terrain][t] = 1;
        }
      }
    }
    for (const terrain of this.terrains) {
      for (const otherTerrain of this.terrains) {
        if (!(otherTerrain in TERRAIN_COMPATIBILITY[terrain])) {
          TERRAIN_COMPATIBILITY[terrain][otherTerrain] = 1;
        }
      }
    }
  }
  getNeighbors(row, col) {
    const neighbors = [];
    if (row > 0) {
      neighbors.push(this.mapGrid[row - 1][col]);
    }
    if (row > 0 && col > 0) {
      neighbors.push(this.mapGrid[row - 1][col - 1]);
    }
    if (row > 0 && col < this.width - 1) {
      const offset = col % 2 === 0 ? 0 : 1;
      if (col + offset < this.width) {
        neighbors.push(this.mapGrid[row - 1][col + offset]);
      }
    }
    if (col > 0) {
      neighbors.push(this.mapGrid[row][col - 1]);
    }
    if (row > 0) {
      neighbors.push(this.mapGrid[row - 1][col]);
    }
    return neighbors;
  }
  calculateTerrainWeights(neighbors) {
    var _a;
    if (neighbors.length === 0) {
      const weights2 = {};
      for (const terrain of this.terrains) {
        weights2[terrain] = 1;
      }
      return weights2;
    }
    const weights = {};
    for (const terrain of this.terrains) {
      try {
        let weight = 1;
        if (terrain === "ruins") {
          const hasRuinsNeighbor = neighbors.some(
            (neighbor) => neighbor === "ruins"
          );
          if (hasRuinsNeighbor) {
            weight = 0;
          }
        }
        if (weight > 0) {
          for (const neighbor of neighbors) {
            const compatibility = ((_a = TERRAIN_COMPATIBILITY[neighbor]) == null ? void 0 : _a[terrain]) ?? 1;
            weight *= Math.pow(compatibility, 1.5);
          }
          if (neighbors.length > 1) {
            weight = Math.pow(weight, 0.8 / neighbors.length);
          }
        }
        weights[terrain] = weight;
      } catch (error) {
        weights[terrain] = 1;
      }
    }
    return weights;
  }
  weightedTerrainChoice(weights) {
    const terrainList = Object.keys(weights);
    const weightList = Object.values(weights);
    const totalWeight = weightList.reduce((sum, w) => sum + w, 0);
    let normalizedWeights;
    if (totalWeight > 0) {
      normalizedWeights = weightList.map((w) => w / totalWeight);
    } else {
      normalizedWeights = new Array(terrainList.length).fill(
        1 / terrainList.length
      );
    }
    const randVal = Math.random();
    let cumulative = 0;
    for (let i = 0; i < normalizedWeights.length; i++) {
      cumulative += normalizedWeights[i];
      if (randVal <= cumulative) {
        return terrainList[i];
      }
    }
    return terrainList[terrainList.length - 1] || this.terrains[0];
  }
  getAllNeighbors(row, col) {
    const neighbors = [];
    const offsets = [
      [-1, 0],
      // Top
      [-1, -1],
      // Top-left
      [-1, 1],
      // Top-right
      [0, -1],
      // Left
      [0, 1],
      // Right
      [1, 0],
      // Bottom
      [1, -1],
      // Bottom-left
      [1, 1]
      // Bottom-right
    ];
    for (const [dr, dc] of offsets) {
      const newRow = row + dr;
      const newCol = col + dc;
      if (newRow >= 0 && newRow < this.height && newCol >= 0 && newCol < this.width) {
        neighbors.push({ row: newRow, col: newCol });
      }
    }
    return neighbors;
  }
  fixIsolatedTiles() {
    for (let row = 0; row < this.height; row++) {
      for (let col = 0; col < this.width; col++) {
        const currentTerrain = this.mapGrid[row][col];
        const neighbors = this.getAllNeighbors(row, col);
        let sameTerrainCount = 0;
        const differentTerrains = [];
        for (const neighbor of neighbors) {
          const neighborTerrain = this.mapGrid[neighbor.row][neighbor.col];
          if (neighborTerrain === currentTerrain) {
            sameTerrainCount++;
          } else {
            differentTerrains.push(neighborTerrain);
          }
        }
        if (sameTerrainCount === 0 && differentTerrains.length > 0) {
          const terrainCounts = {};
          for (const terrain of differentTerrains) {
            terrainCounts[terrain] = (terrainCounts[terrain] || 0) + 1;
          }
          let mostCommon = differentTerrains[0];
          let maxCount = 0;
          for (const [terrain, count] of Object.entries(terrainCounts)) {
            if (count > maxCount) {
              maxCount = count;
              mostCommon = terrain;
            }
          }
          this.mapGrid[row][col] = mostCommon;
        }
      }
    }
  }
  fixAdjacentRuins() {
    for (let row = 0; row < this.height; row++) {
      for (let col = 0; col < this.width; col++) {
        if (this.mapGrid[row][col] === "ruins") {
          const neighbors = this.getAllNeighbors(row, col);
          const hasRuinsNeighbor = neighbors.some(
            (neighbor) => this.mapGrid[neighbor.row][neighbor.col] === "ruins"
          );
          if (hasRuinsNeighbor) {
            const nonRuinsNeighbors = neighbors.map((neighbor) => this.mapGrid[neighbor.row][neighbor.col]).filter((terrain) => terrain !== "ruins");
            if (nonRuinsNeighbors.length > 0) {
              const terrainCounts = {};
              for (const terrain of nonRuinsNeighbors) {
                terrainCounts[terrain] = (terrainCounts[terrain] || 0) + 1;
              }
              let mostCommon = nonRuinsNeighbors[0];
              let maxCount = 0;
              for (const [terrain, count] of Object.entries(terrainCounts)) {
                if (count > maxCount) {
                  maxCount = count;
                  mostCommon = terrain;
                }
              }
              this.mapGrid[row][col] = mostCommon;
            }
          }
        }
      }
    }
  }
  findConnectedGroup(startRow, startCol, terrain, visited) {
    const group = [];
    const stack = [{ row: startRow, col: startCol }];
    while (stack.length > 0) {
      const current = stack.pop();
      const { row, col } = current;
      if (visited[row][col] || this.mapGrid[row][col] !== terrain) {
        continue;
      }
      visited[row][col] = true;
      group.push(current);
      const neighbors = this.getAllNeighbors(row, col);
      for (const neighbor of neighbors) {
        if (!visited[neighbor.row][neighbor.col] && this.mapGrid[neighbor.row][neighbor.col] === terrain) {
          stack.push(neighbor);
        }
      }
    }
    return group;
  }
  ensureMinimumGroups() {
    const visited = Array(this.height).fill(null).map(() => Array(this.width).fill(false));
    const groups = [];
    for (let row = 0; row < this.height; row++) {
      for (let col = 0; col < this.width; col++) {
        if (!visited[row][col]) {
          const terrain = this.mapGrid[row][col];
          const group = this.findConnectedGroup(row, col, terrain, visited);
          if (group.length >= 3) {
            groups.push({ terrain, positions: group });
          }
        }
      }
    }
    if (groups.length < 3) {
      const targetTerrains = this.terrains.slice(0, 3);
      for (let i = groups.length; i < 3; i++) {
        const terrain = targetTerrains[i % targetTerrains.length];
        let placed = false;
        for (let attempts = 0; attempts < 20 && !placed; attempts++) {
          const centerRow = Math.floor(Math.random() * this.height);
          const centerCol = Math.floor(Math.random() * this.width);
          const groupPositions = [
            { row: centerRow, col: centerCol },
            { row: centerRow, col: Math.max(0, centerCol - 1) },
            { row: Math.max(0, centerRow - 1), col: centerCol }
          ].filter((pos) => pos.row < this.height && pos.col < this.width);
          if (groupPositions.length >= 3) {
            for (const pos of groupPositions) {
              this.mapGrid[pos.row][pos.col] = terrain;
            }
            placed = true;
          }
        }
      }
    }
  }
  generateMap(seed) {
    try {
      if (seed !== void 0) {
        this.seedRandom(seed);
      }
      this.mapGrid = [];
      for (let row = 0; row < this.height; row++) {
        const currentRow = [];
        for (let col = 0; col < this.width; col++) {
          try {
            const neighbors = this.getNeighbors(row, col);
            const weights = this.calculateTerrainWeights(neighbors);
            const terrain = this.weightedTerrainChoice(weights);
            currentRow.push(terrain);
          } catch (error) {
            const terrain = this.terrains[Math.floor(Math.random() * this.terrains.length)];
            currentRow.push(terrain);
          }
        }
        this.mapGrid.push(currentRow);
      }
      this.fixIsolatedTiles();
      this.fixIsolatedTiles();
      this.fixAdjacentRuins();
      this.ensureMinimumGroups();
      return this.mapGrid;
    } catch (error) {
      this.mapGrid = [];
      for (let row = 0; row < this.height; row++) {
        const currentRow = [];
        for (let col = 0; col < this.width; col++) {
          const terrain = this.terrains[Math.floor(Math.random() * this.terrains.length)];
          currentRow.push(terrain);
        }
        this.mapGrid.push(currentRow);
      }
      return this.mapGrid;
    }
  }
  mapToDict() {
    const result = {
      success: true,
      width: this.width,
      height: this.height,
      terrains: [...this.terrains],
      hexes: []
    };
    for (let row = 0; row < this.height; row++) {
      for (let col = 0; col < this.width; col++) {
        result.hexes.push({
          row,
          col,
          terrain: this.mapGrid[row][col],
          id: `hex_${row}_${col}`
        });
      }
    }
    return result;
  }
  printMapAscii() {
    const terrainSymbols = {
      plains: "P",
      forest: "F",
      dark_forest: "D",
      hills: "H",
      mountains: "M",
      lake: "L",
      marshlands: "W",
      ruins: "R"
    };
    const result = [];
    result.push(`Hex Map (${this.width}x${this.height}):`);
    result.push("=".repeat(this.width * 2 + 5));
    for (let row = 0; row < this.height; row++) {
      let rowStr = `${row.toString().padStart(2)}| `;
      for (let col = 0; col < this.width; col++) {
        const terrain = this.mapGrid[row][col];
        const symbol = terrainSymbols[terrain] || "?";
        rowStr += symbol + " ";
      }
      result.push(rowStr);
    }
    let colHeader = "   ";
    for (let col = 0; col < this.width; col++) {
      colHeader += `${col % 10} `;
    }
    result.push("=".repeat(this.width * 2 + 5));
    result.push(colHeader);
    return result.join("\n");
  }
  seedRandom(seed) {
    let currentSeed = seed;
    Math.random = () => {
      currentSeed = (currentSeed * 9301 + 49297) % 233280;
      return currentSeed / 233280;
    };
  }
}
function generateHexMap$1(width = 15, height = 10, seed) {
  try {
    const generator = new HexMapGenerator(width, height, [...DEFAULT_TERRAINS]);
    generator.generateMap(seed);
    const result = generator.mapToDict();
    return result;
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
}
function getTerrainTypes$1() {
  return {
    success: true,
    terrains: [...DEFAULT_TERRAINS],
    compatibility_matrix: TERRAIN_COMPATIBILITY
  };
}
function generateTestMap() {
  try {
    const generator = new HexMapGenerator(15, 10, [...DEFAULT_TERRAINS]);
    generator.generateMap(42);
    const ascii = generator.printMapAscii();
    return {
      success: true,
      ascii_output: ascii
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
}
const generateHexMap = async (width = 15, height = 10, seed) => {
  try {
    return generateHexMap$1(width, height, seed);
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
};
const getTerrainTypes = async () => {
  try {
    if (relationalDB.supabase) {
      const { data, error } = await relationalDB.supabase.from("terrain_types").select("name, description, symbol, compatibility_data").eq("category", "shadowdark_standard").order("name");
      if (!error && data && data.length > 0) {
        const terrains = data.map((t) => t.name);
        console.log(`Loaded ${terrains.length} terrain types from database`);
        return {
          success: true,
          terrains,
          compatibility_matrix: {},
          // TODO: Build from database data
          source: "database"
        };
      }
    }
    const result = getTerrainTypes$1();
    return {
      success: result.success,
      terrains: result.terrains,
      compatibility_matrix: result.compatibility_matrix,
      source: "typescript"
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
};
const generateHexMapEndpoint = async (req, res) => {
  var _a;
  try {
    const { width = 15, height = 10, seed } = req.body || {};
    if (width < 1 || width > 50 || height < 1 || height > 50) {
      return res.status(400).json({
        success: false,
        error: "Map dimensions must be between 1 and 50"
      });
    }
    console.log(
      `Generating hex map: ${width}x${height}, seed: ${seed || "random"}`
    );
    const result = await generateHexMap(width, height, seed);
    if (!result.success) {
      return res.status(500).json(result);
    }
    console.log(`Generated hex map with ${(_a = result.hexes) == null ? void 0 : _a.length} hexes`);
    res.json(result);
  } catch (error) {
    console.error("Error generating hex map:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
};
const getHexMapTerrains = async (req, res) => {
  var _a;
  try {
    console.log("Getting hex map terrain types...");
    const result = await getTerrainTypes();
    if (!result.success) {
      return res.status(500).json(result);
    }
    console.log(`Retrieved ${(_a = result.terrains) == null ? void 0 : _a.length} terrain types`);
    res.json(result);
  } catch (error) {
    console.error("Error getting terrain types:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
};
const testHexMap = async (req, res) => {
  try {
    console.log("Generating test hex map...");
    const result = generateTestMap();
    if (!result.success) {
      return res.status(500).json(result);
    }
    console.log("Generated test hex map successfully");
    res.json(result);
  } catch (error) {
    console.error("Error testing hex map:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
};
const anthropic$4 = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY ?? ""
});
async function chooseLanguageWithFate(context) {
  const prompt = `You are an expert in fantasy linguistics and world-building. Based on the following character context, choose the 3 MOST APPROPRIATE language styles for generating this character's name, ranked from best to worst.

CHARACTER CONTEXT:
Type: ${context.characterType}
${context.race ? `Race: ${context.race}` : ""}
${context.occupation ? `Occupation: ${context.occupation}` : ""}
${context.motivation ? `Motivation: ${context.motivation}` : ""}
${context.goal ? `Goal: ${context.goal}` : ""}
${context.faction ? `Faction: ${context.faction}` : ""}
${context.description ? `Description: ${context.description}` : ""}

AVAILABLE LANGUAGE STYLES:
1. Evil - Dark, harsh syllables for villains and evil characters
2. Celtic (Gaelic) - Irish/Scottish inspired names perfect for elven and druidic cultures
3. Nordic (Old Norse) - Old Norse names ideal for barbarian tribes and northern kingdoms
4. Germanic - Germanic names perfect for dwarven clans and mountain craftsmen
5. Latin - Classical Latin names for imperial organizations and scholarly orders
6. Ancient Greek - Ancient Greek names for academic institutions and city-states
7. Slavic - Slavic names great for cold empires and mystical kingdoms
8. Arabic/Persian - Arabic/Persian names perfect for desert kingdoms and sultanates
9. Finnish - Finnish names creating distinctive, otherworldly sounds
10. Basque - Basque names with unique, unusual fantasy characteristics
11. Elvish - Tolkien-inspired elvish names for ancient, graceful beings
12. Draconic - Harsh, ancient draconic names for dragons and their servants
13. Primordial - Elemental primordial names for nature spirits and ancient beings
14. Infernal - Dark, imposing infernal names for evil entities and cults
15. Anglo-Saxon - Old English Anglo-Saxon names for medieval warriors and nobles
16. Steppe Nomad - Mongolian/Turkish inspired names for nomadic horse-riding cultures
17. Ancient Egyptian - Ancient Egyptian names for pyramid-building desert civilizations

Respond with EXACTLY this format:

FIRST CHOICE: [Number]. [Language Name]
REASONING: [1-2 sentences explaining why this language fits perfectly]

SECOND CHOICE: [Number]. [Language Name]  
REASONING: [1-2 sentences explaining why this would also work well]

THIRD CHOICE: [Number]. [Language Name]
REASONING: [1-2 sentences explaining why this could work as a backup]

Consider the character's race, role, cultural background, and thematic elements when making your choices.`;
  try {
    const response = await anthropic$4.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 800,
      messages: [
        {
          role: "user",
          content: prompt
        }
      ]
    });
    const content = response.content[0];
    if (content.type !== "text") {
      throw new Error("Unexpected response type from Claude");
    }
    const text = content.text;
    const choices = [];
    const choicePattern = /(FIRST|SECOND|THIRD) CHOICE:\s*(\d+)\.\s*([^\n]+)\s*REASONING:\s*([^\n]+(?:\n[^\n]*(?!CHOICE:))*)/g;
    let match;
    while ((match = choicePattern.exec(text)) !== null) {
      const alignment = parseInt(match[2]);
      const languageName = match[3].trim();
      const reasoning = match[4].trim();
      if (alignment >= 1 && alignment <= 17) {
        choices.push({
          alignment,
          languageName,
          reasoning
        });
      }
    }
    if (choices.length === 0) {
      throw new Error("Failed to parse LLM language choices");
    }
    const fateDecisions = [];
    for (const choice of choices) {
      const question = `Is ${choice.languageName} the right language style for this ${context.characterType}'s name?`;
      const fateResult = rollFateChart$1("Likely", 5);
      fateDecisions.push({
        question,
        alignment: choice.alignment,
        languageName: choice.languageName,
        roll: fateResult.roll,
        result: fateResult.result,
        accepted: fateResult.success
      });
      if (fateResult.success) {
        return choice;
      }
    }
    const fallbackChoice = choices[0];
    fateDecisions.push({
      question: `Should we use ${fallbackChoice.languageName} despite fate's previous rejections?`,
      alignment: fallbackChoice.alignment,
      languageName: fallbackChoice.languageName,
      roll: 0,
      // No actual roll, just accepting
      result: "Fallback - Accepted",
      accepted: true
    });
    return fallbackChoice;
  } catch (error) {
    console.error("Error in LLM language selection:", error);
    const fallbackAlignment = context.characterType.toLowerCase().includes("villain") ? 1 : 2;
    return {
      alignment: fallbackAlignment,
      languageName: ALIGNMENT_NAMES[fallbackAlignment],
      reasoning: "Fallback choice due to LLM error"
    };
  }
}
async function generateNamesWithIntelligentLanguageChoice(context, numNames = 3) {
  try {
    const languageChoice = await chooseLanguageWithFate(context);
    const nameResult = generateNames$1(languageChoice.alignment, numNames);
    if (!nameResult.success) {
      return {
        success: false,
        error: nameResult.error || "Name generation failed"
      };
    }
    return {
      success: true,
      names: nameResult.names,
      languageChoice
      // Note: fateDecisions would be populated in a full implementation
      // but for now we'll keep it simple and just return the final choice
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred"
    };
  }
}
async function generateSingleIntelligentName(context) {
  const result = await generateNamesWithIntelligentLanguageChoice(context, 1);
  if (!result.success || !result.names || result.names.length === 0) {
    return {
      success: false,
      error: result.error || "Failed to generate name"
    };
  }
  return {
    success: true,
    name: result.names[0],
    languageChoice: result.languageChoice
  };
}
const NPC_RACES = [
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
  "Changeling"
];
const OCCUPATIONS = [
  "acolyte",
  "acrobat",
  "actor",
  "administrator",
  "adventurer",
  "alchemist",
  "ale",
  "apostate",
  "apothecary",
  "apprentice",
  "arcane",
  "archer",
  "architect",
  "armiger",
  "armor",
  "armorer",
  "artist",
  "astrologer",
  "baker",
  "bandit",
  "barbarian",
  "basketmaker",
  "beggar",
  "bodyguard",
  "books",
  "boss",
  "brigand",
  "burglar",
  "carpenter",
  "cartographer",
  "candle lighter",
  "cavalry",
  "chandler",
  "clerk",
  "clothing",
  "cobbler",
  "collector",
  "con",
  "constable",
  "cooper",
  "courier",
  "crier",
  "cult leader",
  "cultist",
  "cutpurse",
  "dealer",
  "diplomat",
  "driver",
  "engineer",
  "envoy",
  "exile",
  "farmer",
  "fence",
  "fisher",
  "foot",
  "fugitive",
  "furrier",
  "general",
  "gentry",
  "goods",
  "grain",
  "gravedigger",
  "greater",
  "guard",
  "guide",
  "guildmaster",
  "herbalist",
  "herder",
  "heretic",
  "hermit",
  "hero",
  "humanoid",
  "hunter",
  "inkeep",
  "inventor",
  "items",
  "jeweler",
  "judge",
  "kingpin",
  "knight",
  "labor",
  "laborer",
  "lackey",
  "layabout",
  "leader",
  "lesser",
  "lieutenant",
  "livestock",
  "locksmith",
  "magic",
  "magistrate",
  "mason",
  "materials",
  "mendicant",
  "messenger",
  "militia",
  "miner",
  "military recruiter",
  "missionary",
  "monk",
  "musician",
  "navigator",
  "nobility",
  "novice",
  "nun",
  "officer",
  "outfitter",
  "outlaw",
  "patrol",
  "painter",
  "perfumer",
  "physician",
  "pilgrim",
  "porter",
  "potter",
  "preacher",
  "priest",
  "prophet",
  "protector",
  "quarrier",
  "racketeer",
  "raw recruit",
  "refugee",
  "ropemaker",
  "ruler",
  "sage",
  'sailor", "scholar", "scout", "scribe", "scrolls", "sentry", "servant", "seamstress" "sycophant',
  "simpleton",
  "slaves",
  "smith",
  "soldier",
  "spices",
  "spirits",
  "spy",
  "stablekeeper",
  "supplies",
  "squire",
  "swindler",
  "tailor",
  "tanner",
  "tavernkeep",
  "tax",
  "templar",
  "thief",
  "thug",
  "tinker",
  "tobacco dealer",
  "trapper",
  "troubador",
  "town crier",
  "undertaker",
  "urchin",
  "vagrant",
  "vintner",
  "warden",
  "warlord",
  "weapons",
  "weaver",
  "wheelwright",
  "wine bibber",
  "wizard",
  "zealot"
];
const MOTIVATIONS = [
  "Becoming an adventurer",
  "Being famous",
  "Being powerful",
  "Being respected",
  "Being rich",
  "Being self-sufficient",
  "Bringing peace to the world",
  "Buying a big property",
  "Changing of occupation",
  "Discovering something new",
  "Dominating others",
  "Finding true love",
  "Helping others",
  "Living a peaceful life",
  "Living elsewhere",
  "Organizing an event",
  "Starting a family",
  "Touring the world",
  "Writing a book",
  "Writing their memoirs",
  "Avenging a destroyed village",
  "Avenging the death of a loved one",
  "Becoming a champion fistfighter",
  "Becoming a great warrior",
  "Becoming a model for the underrealm's top fashion brand",
  "Becoming a respected miner like their father",
  "Breaking into the royal treasury",
  "Bringing inspiration and excitement to life",
  "Bringing medical aid to someone in need",
  "Bringing someone to the top of undermountain",
  "Building a vessel that can move underwater",
  "Collecting romance novels",
  "Converting people to their religion",
  "Creating a new economic theory",
  "Discovering a new bat species",
  "Escaping poverty",
  "Escorting someone to a destination",
  "Exploring a legendary black tower",
  "Fighting in the Great Cliff Dive",
  "Finding a cure before it's too late",
  "Finding inspiration and excitement",
  "Finding someone to marry",
  "Finding the royal family",
  "Finding treasure",
  "Fitting into high society",
  "Following a crystal ball's instructions",
  "Following a marked treasure map",
  "Following the right tunnel",
  "Funding a startup",
  "Getting a painting into a museum",
  "Gaining entrance to high society",
  "Gaining the ear of the queen",
  "Getting married",
  "Getting medical attention for disease",
  "Getting revenge on goblins",
  "Getting vengeance for a village attack",
  "Helping a cursed individual",
  "Hunting a thief who burglarized their home",
  "Investigating magical card rumors",
  "Joining a royal family",
  "Keeping a mine running",
  "Killing a sorcerer who cursed them",
  "Living a peaceful life",
  "Looking for a comfortable cavern",
  "Making ends meet through begging",
  "Making money with a red dragon and a pipe organ",
  "Making the best cheese and pie",
  "Modeling for CavernGuy",
  "Needing a hug",
  "Opening a bakery",
  "Opening the first subterranean skyport",
  "Owning a house in the poshest area",
  "Performing quickie weddings",
  "Publishing a memoir",
  "Reclaiming lost memory",
  "Rescuing a kidnapped sister",
  "Rescuing friends from the shadow plane",
  "Researching bat droppings",
  "Returning to civilization",
  "Running a clinic trial",
  "Searching for the legendary black tower",
  "Searching for trouble",
  "Searching for investors",
  "Searching for the royal family",
  "Seeking father's respect as a miner",
  "Seeking the truth about the heir",
  "Speaking with demons",
  "Speaking with the dead",
  "Stamping out evil",
  "Starting a family",
  "Swimming in a golden pond",
  "Talking to anything humanoid",
  "Talking to the dead",
  "Talking to someone",
  "Tracking a goblin tribe",
  "Traveling to regain memory",
  "Trying to collect all romance novels",
  "Trying to get promoted",
  "Trying to infiltrate a fortress",
  "Trying to open the royal vault",
  "Trying to reach high society",
  "Trying to rescue someone",
  "Trying to speak to the dead",
  "Trying to survive",
  "Unloading a cursed dagger",
  "Winning a fistfight tournament",
  "Redemption for past mistake"
];
const SECRETS = [
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
const PHYSICAL_APPEARANCES = [
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
const ECONOMIC_STATUSES = [
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
const QUIRKS = [
  "a bald head, black beard and the longest fingernails you’ve ever seen",
  "a beehive hairdo that makes them seem taller",
  "a blank expression and wild ear hair",
  "a bright orange jumpsuit and several knives in their belt",
  "a broken arrow stuck in the side of their head",
  "a chin that could block out the sun",
  "a crystalline growths sprouting from their shoulder",
  "a deep facial scar and a gruff exterior",
  "a dent in their skull that’s healed over",
  "a dour expression",
  "a face full of piercings",
  "a few hairs springing out of a wart on their face",
  "a few missing teeth and a hungry gaze",
  "a flashy pink hair",
  "a gap-toothed grin and grey eyes",
  "a hard, weathered face",
  "a halo of buzzing fireflies or will-o'-wisps",
  "a handsome face and sure, kind smile",
  "a heavy limp and a can-do attitude",
  "a hook for a hand and wearing an oversized hat",
  "a hunched back and sores",
  "a kind face and a slow drawl",
  "a long red beard thrown over their shoulder and deepset black eyes",
  "a long white mohawk, sparkling blue eyes, and toned physique",
  "a lumpy nose that looks a bit infected",
  "a massive nose and a tight mouth",
  "a metallic arm etched with runes",
  "a narrow face and fine, almost too-perfect features",
  "a pink crop top and wielding twin shortswords",
  "a plump figure and serene attitude",
  "a posh attitude and clothes to match",
  "a pretty face and big ideas",
  "a pug nose and lots of freckles",
  "a round face and rosy cheeks",
  "a shimmering mark on their forehead that pulses with arcane energy",
  "a sick pompadour haircut",
  "a slack face on one side impeding their speech",
  "a slack jaw and a tendency to mouthbreathe",
  "a sly grin, chewing tobacco",
  "a smile that’s all teeth and no joy",
  "a spectral tail they try to hide",
  "a steady gaze and pursed lips",
  "a strong jaw and a hearty laugh",
  "a tattered white robe, long white hair and missing one arm",
  "a third eye that opens when they lie",
  "a tongue seemingly too big for their mouth",
  "a wide smile and a fashionable mole",
  "a whisper-quiet voice",
  "addict (sweets, drugs, sex, etc.)",
  "always covered in glitter, soot, or chalk",
  "always slightly wet, as though recently emerged from a lake",
  "always wears gloves, even when inappropriate",
  "antlers growing from their head like a crown",
  "armor that shines like the sun",
  "artistic, dreamer, or delusional",
  "as bald and beardless as a baby",
  "asks riddles compulsively and grows irritated if you don’t answer",
  "attractive/handsome/stunning",
  "avoids being touched at all costs",
  "avoids eye contact entirely",
  "bangs that everyone agrees do not suit their face",
  "bare feet and freckled cheeks",
  "becomes eerily calm in stressful situations",
  "believes they’re the reincarnation of a god",
  "big/thick/brawny",
  "black eyes that lack irises",
  "bloody, nail-free fingertips",
  "blue hair and a kindly attitude",
  "broad shoulders and a low-cut tunic",
  "buns of steel and armor to match",
  "bark-like skin with leaves in their hair",
  "cannot stop performing slight-of-hand tricks",
  "cheekbones that could cut glass and eyes to match",
  "clean/well-dressed/well-groomed",
  "clothing stitched from shadows and moonlight",
  "constantly gives unsolicited advice",
  "constantly trailing faint wisps of smoke",
  "constantly writing letters to someone named 'the moon'",
  "covered in black tar and white feathers",
  "curly brown hair, travelers garb and a patch over one eye",
  "dark skin, long, sleek blue hair and matching spiral tattoos on both sides of their neck",
  "devoid of eyebrows and a sense of humor",
  "dresses like they're from a different century",
  "eccentric hairstyle",
  "effortlessly mussed hair and photogenic face",
  "eager eyes and silver hair",
  "expressive eyebrows, a lilting voice and several nose, lip and ear piercings",
  "face buried in a book about geese",
  "feathers instead of hair on one side of their head",
  "fine dress, regal bearing and an entitled attitude",
  "flashy pink hair",
  "food-stain covered clothes",
  "frequently interrupts with cryptic prophecies",
  "friendly eyes and the grace of a dancer",
  "glowing eyes that shift color with their mood",
  "greasy hair and hands to match",
  "greets people by sniffing them",
  "has a drippy nose and red cheeks",
  "has a face that appears stitched together",
  "has a neck twice as wide as their face",
  "has an unusual laugh (wheeze, cackle, snort)",
  "has one of those faces",
  "heavy eyelids and a constant yawn",
  "hooved feet and a noble gait",
  "holding a tiny dog and fighting back tears",
  "hooded eyes and a casual tone",
  "humanoid bark-covered skin",
  "humming to themselves and scratching flaky skin",
  "immaculate white robes and a monocle",
  "in a droopy robe",
  "in a hat that’s as tall as they are",
  "in a purple tunic, ascot and patent leather boots",
  "in black leather and a pair of sharp, heeled boots",
  "insecure, racist, or xenophobic",
  "is a scythe-wielding farmer",
  "is blessed with lavish curves",
  "is deaf and uses gestures to communicate",
  "is dripping in sweat",
  "is expertly juggling a trio of daggers",
  "keeps a live insect or animal in their pocket",
  "keeps looking over their shoulder as if being followed",
  "laughs as if they know a terrible secret",
  "laughs when they're about to cry",
  "looks like they’re about to vomit",
  "looks twice their age",
  "menacing black plate armor",
  "mimics others' accents unconsciously",
  "miser or pack-rat",
  "more tattoos than uninked skin",
  "naive or idealistic",
  "never finishes their sentences",
  "no arms, but two mage hands",
  "notable eyes (blue, bloodshot, etc.)",
  "notable hair (wild, long, none, etc.)",
  "notable nose (big, hooked, etc.)",
  "obsessed with collecting shiny objects, like a magpie",
  "oil-slicked skin and whistling nostrils",
  "open robes and angular face paint",
  "over-explains everything",
  "overly formal speech",
  "overly touchy with strangers",
  "pale white eyes and large black ears aside their head",
  "phobia (spiders, fire, darkness, etc.)",
  "piercings",
  "popping veins and a mouth frothing with excitement",
  "pot belly and an infectious giggle",
  "rare eye color",
  "records every interaction in a massive grimoire",
  "refers to themselves in the third person",
  "refuses to speak directly, only through rhymed couplets",
  "refuses to wear shoes",
  "riddled with scabs and small cuts",
  "scar(s)",
  "scabs all over their body",
  "scabby knuckles they won’t stop cracking",
  "shadow always seems a step out of sync",
  "shaggy hair and a slight overbite",
  "shaggy red hair and a giant mole on their lip",
  "shaggy hair, baggy clothes and a chill attitude",
  "sharp features, dark hair and a ragged black cloak",
  "short dark hair, an impressively curled mustache and teeth filed to points",
  "skeptic or paranoid",
  "skin that sparkles faintly in sunlight",
  "small stature and a nervous demeanor",
  "small/scrawny/emaciated",
  "smart aleck or know-it-all",
  "spendthrift or wastrel",
  "staring intently at a large crystal ball they are carrying",
  "still sporting the scars from a rogue owlbear attack",
  "superstitious, devout, or fanatical",
  "talks to themselves constantly",
  "tattoo(s)",
  "tattooed/pockmarked/scarred",
  "the biggest head of all time",
  "the biggest, bushiest beard",
  "their nose turned to the sky and wearing purple robes",
  "tries to barter with everything, even conversations",
  "unusual laugh (wheeze, cackle, snort)",
  "unkempt/shabby/grubby",
  "uses made-up slang",
  "uses overly elaborate titles for themselves and everyone else",
  "walks with an exaggerated swagger",
  "walks with the grace of a dancer",
  "wearing a crop top to show off their impressive abs",
  "wearing a fancy ballgown and expensive jewelry",
  "wearing far too many belts and silver jewelry",
  "wearing goggles and chomping a smoldering cigar",
  "wearing temple robes and a surprised expression",
  "whispers arcane syllables under their breath when nervous",
  "who appears as if they were struck by lightning",
  "who is 5 feet tall and thin as a rail",
  "who is heavy in the torso yet light on their toes",
  "who looks like they just woke up",
  "who shuffles along slowly, their body covered in bark"
];
const COMPETENCE = [
  "A liability",
  "Competent",
  "Fully capable",
  "Exceptional"
];
const FIRST_NAMES$1 = [
  "Aja",
  "Alma",
  "Alric",
  "Amriel",
  "Ann",
  "Annie",
  "Aran",
  "Ardo",
  "Arthur",
  "Astrid",
  "Axidor",
  "Barvin",
  "Bella",
  "Benny",
  "Borg",
  "Brak",
  "Bram",
  "Brenna",
  "Brielle",
  "Brolga",
  "Bruga",
  "Bruno",
  "Cecilia",
  "Clara",
  "Cora",
  "Cyrwin",
  "Daeniel",
  "David",
  "Darvin",
  "Deeg",
  "Denton",
  "Dina",
  "Drago",
  "Elga",
  "Eliza",
  "Eliara",
  "Elyon",
  "Finn",
  "Fink",
  "Fiora",
  "Fitz",
  "Galira",
  "Georg",
  "Gendry",
  "Giralt",
  "Godfrey",
  "Gordie",
  "Gralk",
  "Grimm",
  "Grix",
  "Hank",
  "Helen",
  "Hilde",
  "Hiralia",
  "Hirok",
  "Hobb",
  "Hrogar",
  "Iggs",
  "Ishana",
  "Isolde",
  "Ithior",
  "Ingol",
  "Ivara",
  "Jasmin",
  "Jasper",
  "Jennie",
  "John",
  "Jirwyn",
  "Junnor",
  "Karina",
  "Klara",
  "Korv",
  "Krull",
  "Lenk",
  "Lilly",
  "Lienna",
  "Lothiel",
  "Lydia",
  "Malchor",
  "Marga",
  "Marie",
  "Marlow",
  "Mirena",
  "Mona",
  "Morgan",
  "Natinel",
  "Nattias",
  "Naugrim",
  "Nayra",
  "Nibs",
  "Nix",
  "Norbert",
  "Oscar",
  "Pike",
  "Prim",
  "Ranna",
  "Riggs",
  "Rina",
  "Rizzo",
  "Rogar",
  "Roke",
  "Rose",
  "Ruhiel",
  "Ryarn",
  "Sariel",
  "Sarna",
  "Shiraal",
  "Sophie",
  "Squib",
  "Tamra",
  "Tarin",
  "Tark",
  "Thomas",
  "Tila",
  "Tilly",
  "Tisha",
  "Tirolas",
  "Torbin",
  "Torson",
  "Tragan",
  "Tucker",
  "Tulk",
  "Ulara",
  "Ulfgar",
  "Vara",
  "Varos",
  "Vidrid",
  "Will",
  "Willow",
  "Wulf",
  "Yark",
  "Yelena",
  "Yuri",
  "Zali",
  "Zaphiel",
  "Zasha",
  "Zeb",
  "Zoraan"
];
const LAST_NAMES = [
  "Abdou",
  "Aberrich",
  "Aefrim",
  "Aibolsun",
  "Altas",
  "Avilseer",
  "Axeson",
  "Baelmai",
  "Bako",
  "Bingletrite",
  "Blackreed",
  "Briggs",
  "Bronzebeard",
  "Bronzestein",
  "Burrows",
  "Button",
  "Carter",
  "Claymore",
  "Cogturner",
  "Coldstone",
  "Coppercrown",
  "Coppernose",
  "Cragenmore",
  "Cray",
  "Crowbender",
  "Crysalis",
  "Darabound",
  "Darksteele",
  "Datesi",
  "Deepstone",
  "Diamondtoe",
  "Didor",
  "Dwandra",
  "Eastlake",
  "Eaves",
  "Emo",
  "Etellor",
  "Excellente",
  "Faemoira",
  "Fauxmont",
  "Fenyara",
  "Finch",
  "Firebeard",
  "Firsell",
  "Fishtoe",
  "Flint",
  "Flintheart",
  "Flintshine",
  "Forgefoot",
  "Foxglove",
  "Frostarms",
  "Geasfoot",
  "Gibbs",
  "Gigak",
  "Gnazbright",
  "Goldarm",
  "Goldcask",
  "Griffith",
  "Gulnurkan",
  "Hammerstrike",
  "Hartley",
  "Head",
  "Honeyeater",
  "Hook",
  "Hoover",
  "Huneldth",
  "Hutchrice",
  "Iasbex",
  "Icruxias",
  "Ide",
  "Igrild",
  "Illa",
  "Illynmah",
  "Immamura",
  "Jarfalsa",
  "Jaytai",
  "Jeffries",
  "Justice",
  "Kavius",
  "Keystina",
  "Khilltahrn",
  "Koahath",
  "Leagallow",
  "Lillyfitz",
  "Lloyd",
  "Luckdodger",
  "Lukewill",
  "Mavcius",
  "Merigu",
  "Mishala",
  "Mogumir",
  "Moore",
  "Narrick",
  "Neeves",
  "Neriyra",
  "Noire",
  "Noosecatcher",
  "Ootati",
  "Oldfur",
  "Olley",
  "Oremen",
  "Orgulas",
  "Petra",
  "Plackard",
  "Polaan",
  "Poole",
  "Poutine",
  "Powell",
  "Protheroe",
  "Puddleswish",
  "Questar",
  "Quickstoke",
  "Q'tharas",
  "Quid",
  "Rainn",
  "Randmork",
  "Reagle",
  "Reebsa",
  "Ren",
  "Requiess",
  "Reyhana",
  "Rivershale",
  "Robinson",
  "Roamshadow",
  "Rosenmer",
  "Rumsdeep",
  "Rygoss",
  "Sarberos",
  "Seidanur",
  "Shatterblade",
  "Shaw",
  "Silverock",
  "Silverseek",
  "Silviu",
  "SindaSalt",
  "Slane",
  "Smith",
  "Stumpfoot",
  "Strongale",
  "Strongsmith",
  "Stringsaw",
  "Suresnail",
  "Tanko",
  "Taylor",
  "Thanar",
  "Thaneson",
  "Thermobolt",
  "Therundlin",
  "Tighfield",
  "Underbough",
  "Ugdough",
  "Us",
  "Uvaes",
  "Valarnith",
  "Vainweather",
  "Veindeep",
  "Vendorform",
  "Volto",
  "Wapronk",
  "Wheelmaiden",
  "Wolfsbane",
  "Woolyboon",
  "Wright",
  "Xas",
  "Xencord",
  "Xeran",
  "Yahsquin",
  "Yeoman",
  "Yesvyre",
  "Yiu",
  "Zakari",
  "Zeagan",
  "Zimet",
  "Zytal"
];
class NPCGenerator {
  getRandomElement(array) {
    if (array.length === 0) {
      throw new Error("Cannot select from empty array");
    }
    const randomIndex = Math.floor(Math.random() * array.length);
    return array[randomIndex];
  }
  generateRace() {
    if (NPC_RACES.length === 0) {
      return "Human";
    }
    return this.getRandomElement(NPC_RACES);
  }
  generateOccupation() {
    if (OCCUPATIONS.length === 0) {
      return "Commoner";
    }
    return this.getRandomElement(OCCUPATIONS);
  }
  generateMotivation() {
    if (MOTIVATIONS.length === 0) {
      return "Seeking Adventure";
    }
    return this.getRandomElement(MOTIVATIONS);
  }
  generateSecret() {
    if (SECRETS.length === 0) {
      return "Harbors a Dark Secret";
    }
    return this.getRandomElement(SECRETS);
  }
  generatePhysicalAppearance() {
    if (PHYSICAL_APPEARANCES.length === 0) {
      return "Average Looking";
    }
    return this.getRandomElement(PHYSICAL_APPEARANCES);
  }
  generateEconomicStatus() {
    if (ECONOMIC_STATUSES.length === 0) {
      return "Middle Class";
    }
    return this.getRandomElement(ECONOMIC_STATUSES);
  }
  generateQuirk() {
    if (QUIRKS.length === 0) {
      return "Has an Unusual Hobby";
    }
    if (Math.random() < 0.25) {
      const firstQuirk = this.getRandomElement(QUIRKS);
      let secondQuirk = this.getRandomElement(QUIRKS);
      let attempts = 0;
      while (secondQuirk === firstQuirk && attempts < 10) {
        secondQuirk = this.getRandomElement(QUIRKS);
        attempts++;
      }
      return `${firstQuirk} & ${secondQuirk}`;
    }
    return this.getRandomElement(QUIRKS);
  }
  generateCompetence() {
    if (COMPETENCE.length === 0) {
      return "Competent";
    }
    return this.getRandomElement(COMPETENCE);
  }
  generateFirstName() {
    if (FIRST_NAMES$1.length === 0) {
      return "John";
    }
    return this.getRandomElement(FIRST_NAMES$1);
  }
  generateLastName() {
    if (LAST_NAMES.length === 0) {
      return "Smith";
    }
    return this.getRandomElement(LAST_NAMES);
  }
  /**
   * Generate an intelligent name based on NPC characteristics
   */
  async generateIntelligentName(npcData) {
    try {
      const result = await generateSingleIntelligentName({
        characterType: "NPC",
        race: npcData.race,
        occupation: npcData.occupation,
        motivation: npcData.motivation,
        description: `${npcData.race} ${npcData.occupation} with secret: ${npcData.secret}`
      });
      if (result.success && result.name) {
        const nameParts = result.name.split(/\s+/);
        if (nameParts.length >= 2) {
          return {
            firstName: nameParts[0],
            lastName: nameParts.slice(1).join(" ")
          };
        } else {
          return {
            firstName: nameParts[0] || this.generateFirstName(),
            lastName: this.generateLastName()
          };
        }
      }
    } catch (error) {
      console.error("Error generating intelligent name:", error);
    }
    return {
      firstName: this.generateFirstName(),
      lastName: this.generateLastName()
    };
  }
  generateNPC() {
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
        lastName: this.generateLastName()
      };
    } catch (error) {
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
        lastName: "Smith"
      };
    }
  }
  generateStep(step) {
    switch (step) {
      case "race":
        return this.generateRace();
      case "occupation":
        return this.generateOccupation();
      case "motivation":
        return this.generateMotivation();
      case "secret":
        return this.generateSecret();
      case "physicalAppearance":
        return this.generatePhysicalAppearance();
      case "economicStatus":
        return this.generateEconomicStatus();
      case "quirk":
        return this.generateQuirk();
      case "competence":
        return this.generateCompetence();
      case "firstName":
        return this.generateFirstName();
      case "lastName":
        return this.generateLastName();
      default:
        throw new Error(`Unknown NPC generation step: ${step}`);
    }
  }
}
async function generateIntelligentNPC() {
  const generator = new NPCGenerator();
  try {
    const race = generator.generateRace();
    const occupation = generator.generateOccupation();
    const motivation = generator.generateMotivation();
    const secret = generator.generateSecret();
    const physicalAppearance = generator.generatePhysicalAppearance();
    const economicStatus = generator.generateEconomicStatus();
    const quirk = generator.generateQuirk();
    const competence = generator.generateCompetence();
    const nameData = await generator.generateIntelligentName({
      race,
      occupation,
      motivation,
      secret
    });
    return {
      race,
      occupation,
      motivation,
      secret,
      physicalAppearance,
      economicStatus,
      quirk,
      competence,
      firstName: nameData.firstName,
      lastName: nameData.lastName
    };
  } catch (error) {
    console.error("Error generating intelligent NPC:", error);
    return generator.generateNPC();
  }
}
function generateNPCStep(step) {
  const generator = new NPCGenerator();
  return generator.generateStep(step);
}
const GLOBAL_NARRATIVE_RESTRICTIONS = `
GLOBAL NARRATIVE RESTRICTIONS (Apply to ALL content):

You are a master Dungeons and Dragons Game Master. Use words to craft narratively rich, but also simple and meaningful, role playing game world building elements. Write with wit, theatrical flair, and engaging storytelling that brings fantasy worlds to life.


- NEVER include any adventure hooks, plot hooks, or suggestions for player character activities
- NEVER include narratives about strange lights, glows, or mysterious illumination that can be seen at night from miles away
- NEVER mention things glowing on the horizon at night
- NEVER use the phrase "stands as a testament" or "a testament to" or any variation with the word "testament"
- DO NOT include any content that suggests what players should do or where they should go
- AVOID clichéd fantasy tropes like mysterious lights, ominous glows, or prophetic warnings
- Keep descriptions atmospheric but practical, focusing on what exists rather than what might happen`;
function getGlobalNarrativeRestrictions() {
  return GLOBAL_NARRATIVE_RESTRICTIONS;
}
const anthropic$3 = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY ?? ""
});
async function generateCompleteNPC(req, res) {
  try {
    const npc = await generateIntelligentNPC();
    res.json({
      success: true,
      npc
    });
  } catch (error) {
    console.error("Error generating NPC:", error);
    res.status(500).json({
      success: false,
      error: "Failed to generate NPC"
    });
  }
}
function generateNPCStepRoute(req, res) {
  try {
    const { step } = req.body;
    if (!step) {
      return res.status(400).json({
        success: false,
        error: "Step parameter is required"
      });
    }
    const validSteps = [
      "race",
      "occupation",
      "motivation",
      "secret",
      "physicalAppearance",
      "economicStatus",
      "quirk",
      "competence",
      "firstName",
      "lastName"
    ];
    if (!validSteps.includes(step)) {
      return res.status(400).json({
        success: false,
        error: `Invalid step. Valid steps are: ${validSteps.join(", ")}`
      });
    }
    const result = generateNPCStep(step);
    res.json({
      success: true,
      step,
      result
    });
  } catch (error) {
    console.error("Error generating NPC step:", error);
    res.status(500).json({
      success: false,
      error: "Failed to generate NPC step"
    });
  }
}
async function generateNPCNarrative(req, res) {
  try {
    const { npc } = req.body;
    if (!npc) {
      return res.status(400).json({
        success: false,
        error: "NPC data is required"
      });
    }
    const prompt = `Create a coherent character narrative based on these NPC details:

Name: ${npc.firstName} ${npc.lastName}
Race: ${npc.race}
Occupation: ${npc.occupation}
Physical Appearance: ${npc.physicalAppearance}
Economic Status: ${npc.economicStatus}
Quirk: ${npc.quirk}
Competence: ${npc.competence}
Motivation: ${npc.motivation}
Secret: ${npc.secret}

Please create a compelling narrative that:
1. Determines if this character is male or female based on the name and context
2. Describes their race and physical appearance in detail
3. Explains their quirk and how it affects their daily life
4. Creates a cohesive backstory that connects their secret, motivation, economic status, occupation, and competence level
5. Makes the character feel like a real person with depth and believable motivations
6. If any details seem contradictory or don't make logical sense together, feel free to modify them or reinterpret them in a way that creates a more believable character

Write this as a 2-3 paragraph character description that a GM could use to roleplay this NPC effectively. Focus on personality, background, and how all these elements work together to create a memorable character.

${getGlobalNarrativeRestrictions()}

Then, in a separate section below the character description, add:

**GM Notes:** If you modified, reinterpreted, or left out any of the provided details to create a more coherent character, explain what changes you made and why. If all details worked well together as-is, simply state "All provided details were incorporated as given."`;
    const response = await anthropic$3.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 1e3,
      messages: [{
        role: "user",
        content: prompt
      }]
    });
    const narrative = response.content[0].type === "text" ? response.content[0].text : "Failed to generate narrative";
    res.json({
      success: true,
      narrative
    });
  } catch (error) {
    console.error("Error generating NPC narrative:", error);
    res.status(500).json({
      success: false,
      error: "Failed to generate NPC narrative"
    });
  }
}
const CIVILIAN_SETTLEMENTS = ["Hamlet", "Village", "City"];
const CLASS_SETTLEMENTS = ["Castle", "Tower", "Abbey"];
const ALL_SETTLEMENT_TYPES = [...CIVILIAN_SETTLEMENTS, ...CLASS_SETTLEMENTS];
const STRUCTURE_TABLE = {
  1: "BA",
  2: "BF",
  3: "BHF",
  4: "BH",
  5: "CA",
  6: "CF",
  7: "CH",
  8: "D",
  9: "DA",
  10: "DF",
  11: "DH",
  12: "D-by-sea",
  13: "D-in-D",
  14: "D-le-D",
  15: "D-les-bains",
  16: "D-on-the-Nisme-on-the-hill",
  17: "Dington",
  18: "Dsby",
  19: "Dthorpe",
  20: "Dton",
  21: "EA",
  22: "EB",
  23: "ED",
  24: "EF",
  25: "EH",
  26: "GB",
  27: "GD",
  28: "Trou-au-D",
  29: "Trou-de-D",
  30: "Val-D"
};
const BUILDINGS_OUTDOORS = [
  "Abbey",
  "Arch",
  "Bank",
  "Barrack",
  "Bench",
  "Bridge",
  "Castle",
  "Chapel",
  "Church",
  "Court",
  "Cross",
  "Farm",
  "Forge",
  "Gate",
  "Hall",
  "Home",
  "Hospital",
  "House",
  "Inn",
  "Mall",
  "Market",
  "Mill",
  "Mine",
  "Post",
  "Road",
  "Stall",
  "Temple",
  "Tower",
  "Union",
  "Wall"
];
const NOUNS = [
  "Acorn",
  "Angel",
  "Apple",
  "Atelier",
  "Autumn",
  "Axe",
  "Baker",
  "Bard",
  "Baron",
  "Barrow",
  "Berry",
  "Birch",
  "Bird",
  "Boar",
  "Book",
  "Bow",
  "Butcher",
  "Candle",
  "Cheese",
  "Cloud",
  "Corn",
  "Cow",
  "Crow",
  "Dawn",
  "Day",
  "Deer",
  "Demon",
  "Dragon",
  "Dream",
  "Dusk",
  "Dust",
  "Dwarf",
  "Eagle",
  "Elf",
  "Feather",
  "Fire",
  "Fish",
  "Flower",
  "Fog",
  "Fox",
  "Frog",
  "Ghost",
  "Gnoll",
  "Goblin",
  "Grave",
  "Halfling",
  "Hare",
  "Hawk",
  "Heaven",
  "Hell",
  "Hook",
  "Hope",
  "Horn",
  "Horse",
  "Hunter",
  "Knight",
  "Kobold",
  "Leaf",
  "Letter",
  "Lion",
  "Mage",
  "Moon",
  "Night",
  "Oak",
  "Orchid",
  "Pine",
  "Pork",
  "Rabbit",
  "Rain",
  "Ram",
  "River",
  "Robin",
  "Rose",
  "Salt",
  "Seed",
  "Sky",
  "Snake",
  "Snow",
  "Sorrow",
  "Spice",
  "Spring",
  "Squirrel",
  "Star",
  "Summer",
  "Sun",
  "Sword",
  "Thief",
  "Thorn",
  "Thunder",
  "Toad",
  "Tournament",
  "Tulip",
  "Violet",
  "Warrior",
  "Water",
  "Wind",
  "Winter",
  "Witch",
  "Wolf",
  "Wyvern"
];
const FIRST_NAMES = [
  "Anna",
  "Arthur",
  "Bernard",
  "Charles",
  "Elizabeth",
  "Fanny",
  "George",
  "Helen",
  "Ilia",
  "John",
  "Kathleen",
  "King",
  "Louis",
  "Marcus",
  "Mary",
  "Nicholas",
  "Prince",
  "Princess",
  "Queen",
  "Tilly"
];
const CITY_NAMES = [
  "Avery",
  "Bayley",
  "Carm",
  "Dun",
  "Ensal",
  "Folton",
  "Galgar",
  "Haye",
  "Idar",
  "Julvet",
  "Kanth",
  "Loy",
  "Marsan",
  "Nisme",
  "Ourar",
  "Peulin",
  "Rundur",
  "Solin",
  "Thaas",
  "Unvary",
  "Vanau",
  "Wark",
  "Yverne",
  "Zalek"
];
const ADJECTIVES_COLORS = [
  "Bad",
  "Black",
  "Bloody",
  "Blue",
  "Bone",
  "Brave",
  "Brown",
  "Burnt",
  "Charming",
  "Coal",
  "Cold",
  "Copper",
  "Coral",
  "Crystal",
  "Damp",
  "Dark",
  "Dry",
  "Dusty",
  "False",
  "Fast",
  "Free",
  "Giant",
  "Glass",
  "Gold",
  "Golden",
  "Good",
  "Great",
  "Green",
  "Gray",
  "Hidden",
  "Hot",
  "Indigo",
  "Iron",
  "Light",
  "Long",
  "Metal",
  "Mithral",
  "Obsidian",
  "Purple",
  "Red",
  "Rock",
  "Royal",
  "Silent",
  "Silver",
  "Small",
  "Stone",
  "True",
  "White",
  "Wild",
  "Wine",
  "Yellow"
];
const SETTLEMENT_TYPES_TABLE = [
  "Borough",
  "Bourg",
  "Camp",
  "Cester",
  "Citadel",
  "City",
  "County",
  "Dorf",
  "Ham",
  "Hamlet",
  "Haven",
  "Heim",
  "Keep",
  "Stead",
  "Town",
  "Village",
  "Ville",
  "Ward",
  "Wihr",
  "Worth"
];
const DIRECTIONS_ADJECTIVES = [
  "Bottom",
  "Down",
  "East",
  "Far",
  "Fort",
  "Haute",
  "High",
  "Little",
  "Lost",
  "Low",
  "Mount",
  "New",
  "North",
  "Old",
  "Port",
  "Saint",
  "South",
  "Under",
  "Up",
  "West"
];
const NATURE_TOPOGRAPHY = [
  "Bay",
  "Beach",
  "Bone",
  "Break",
  "Burrow",
  "Cliff",
  "Corner",
  "Creek",
  "Dale",
  "End",
  "Fall",
  "Field",
  "Forest",
  "Garden",
  "Glade",
  "Glen",
  "Grove",
  "Head",
  "Helm",
  "Hill",
  "Hold",
  "Hole",
  "Hollow",
  "Island",
  "Lake",
  "Land",
  "Limit",
  "Marsh",
  "Mont",
  "Moor",
  "Mount",
  "Mountain",
  "Park",
  "Pass",
  "Path",
  "Peak",
  "Plain",
  "Point",
  "Pool",
  "Rest",
  "Run",
  "Source",
  "Summit",
  "Trail",
  "Tree",
  "Valley",
  "View",
  "Way",
  "Well",
  "Wood"
];
const CASTLE_FIRST_PARTS = [
  "Apple",
  "Battle",
  "Black",
  "Bleak",
  "Blood",
  "Bright",
  "Broken",
  "Cloud",
  "Dark",
  "Dawn",
  "Dragon",
  "Dusk",
  "Fire",
  "Gold",
  "Hammer",
  "Hawk",
  "Horse",
  "Ice",
  "Light",
  "Lion",
  "Moon",
  "Oak",
  "Raven",
  "Red",
  "River",
  "Rose",
  "Silver",
  "Star",
  "Stone",
  "Wind"
];
const CASTLE_SECOND_PARTS = [
  "Bane",
  "Bridge",
  "Fall",
  "Fang",
  "Foot",
  "Heart",
  "Herd",
  "Hold",
  "Hook",
  "Keep",
  "Maw",
  "Mist",
  "Moor",
  "Peak",
  "Rock",
  "Shield",
  "Skull",
  "Song",
  "Soul",
  "Storm",
  "Thorn",
  "Vale",
  "Way",
  "Wood"
];
const ABBEY_SAINTS = [
  "Adélie",
  "Agath",
  "Alexia",
  "Aubreda",
  "Bardolphus",
  "Barthélemy",
  "Beatrix",
  "Bérengérius",
  "Bernard",
  "Cecilia",
  "Cédany",
  "Émelote",
  "Gaufridus",
  "Geffrey",
  "Géroldin",
  "Guillotin",
  "Jaclyn",
  "Jacomus",
  "Madeleine",
  "Marion",
  "Marjorie",
  "Martin",
  "Mary",
  "Melchior",
  "Paul",
  "Pétasse",
  "Peter",
  "Remy",
  "Thomasse",
  "Victor"
];
class SteadingGenerator {
  rollDie(sides) {
    return Math.floor(Math.random() * sides) + 1;
  }
  rollD6() {
    return this.rollDie(6);
  }
  rollD12() {
    return this.rollDie(12);
  }
  rollD20() {
    return this.rollDie(20);
  }
  rollD30() {
    return this.rollDie(30);
  }
  rollD100() {
    return this.rollDie(100);
  }
  roll2D6() {
    return this.rollD6() + this.rollD6();
  }
  getRandomElement(array) {
    return array[Math.floor(Math.random() * array.length)];
  }
  getTableResult(table, roll) {
    if (roll <= table.length) {
      return table[roll - 1];
    }
    return table[table.length - 1];
  }
  determineSettlementType() {
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
  generateSettlementName() {
    const structureRoll = this.rollD30();
    const structure = STRUCTURE_TABLE[structureRoll] || "CF";
    const nameParts = [];
    for (const char of structure) {
      if (char === "A") {
        const roll = this.rollD30();
        nameParts.push(this.getTableResult(BUILDINGS_OUTDOORS, roll));
      } else if (char === "B") {
        const roll = this.rollD100();
        nameParts.push(this.getTableResult(NOUNS, roll));
      } else if (char === "C") {
        const roll = this.rollD20();
        nameParts.push(this.getTableResult(FIRST_NAMES, roll));
      } else if (char === "D") {
        const roll = Math.floor(Math.random() * 24) + 1;
        nameParts.push(this.getTableResult(CITY_NAMES, roll));
      } else if (char === "E") {
        const roll = this.rollD100();
        const adjRoll = Math.floor((roll - 1) / 2);
        if (adjRoll < ADJECTIVES_COLORS.length) {
          nameParts.push(ADJECTIVES_COLORS[adjRoll]);
        }
      } else if (char === "F") {
        const roll = this.rollD20();
        nameParts.push(this.getTableResult(SETTLEMENT_TYPES_TABLE, roll));
      } else if (char === "G") {
        const roll = this.rollD20();
        nameParts.push(this.getTableResult(DIRECTIONS_ADJECTIVES, roll));
      } else if (char === "H") {
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
  generateCastleName() {
    const firstPart = this.getTableResult(CASTLE_FIRST_PARTS, this.rollD30());
    const secondPart = this.getTableResult(CASTLE_SECOND_PARTS, this.rollDie(24));
    return `Castle ${firstPart} ${secondPart}`;
  }
  generateAbbeyName() {
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
    const saint = this.getTableResult(ABBEY_SAINTS, this.rollD30());
    return `Abbey of Saint-${saint}`;
  }
  generateDisposition() {
    const roll = this.roll2D6();
    if (roll === 2) return "Attack on sight";
    if (roll >= 3 && roll <= 5) return "Hostile";
    if (roll >= 6 && roll <= 8) return "Neutral";
    if (roll >= 9 && roll <= 11) return "Welcoming";
    return "Enthusiastic";
  }
  generateHamlet() {
    const { name, variations } = this.generateSettlementName();
    const mainBuildings = [
      "Brewery/Vineyard",
      "Chapel",
      "Farm/Ranch",
      "Manor",
      "Mill",
      "Mine",
      "Sawmill",
      "Shop",
      "Tavern",
      "Toll",
      "Tourney grounds",
      "Watchtower"
    ];
    const mainBuilding = this.getTableResult(mainBuildings, this.rollD12());
    const peasantHouses = Math.max(0, this.rollD6() - 1);
    const layouts = ["Heap", "Round", "Row"];
    const layout = this.getTableResult(layouts, this.rollDie(3));
    let secret;
    if (this.rollD6() === 1) {
      const secrets = [
        "Cannibals",
        "Cultists",
        "Dopplegangers",
        "Inbred",
        "Murderers",
        "Lycanthropes/Vampires"
      ];
      secret = this.getTableResult(secrets, this.rollD6());
    }
    const descriptorResult = rollDescriptorTable$1();
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
  generateVillage() {
    const { name, variations } = this.generateSettlementName();
    const sizeRoll = this.rollD6();
    let size, sizeMultiplier;
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
    let occupation = "Farming and cattle breeding only";
    if (this.rollD6() === 1) {
      const occupations = [
        "Brewing (breweries) or Viticulture (vineyards)",
        "Fishing (fisheries)",
        "Hunting (tanneries)",
        "Logging (sawmills)",
        "Mining (mines)",
        "Pottery (workshops)"
      ];
      occupation = this.getTableResult(occupations, this.rollD6());
    }
    const layouts = ["Heap", "Round", "Row"];
    const layout = this.getTableResult(layouts, this.rollDie(3));
    const general = ["Blacksmith", "Market", "Tavern", "Well"];
    const specialLocations = [
      "Abandoned building",
      "Apothecary",
      "Bakery",
      "Burnt/Ruined building",
      "Butcher",
      "Castle-farm",
      "Church",
      "Famous person's house",
      "General store",
      "Graveyard",
      "Guard post",
      "Guildhouse",
      "Gypsy wagon",
      "Horse stables",
      "Library",
      "Mill",
      "Monument/Memorial",
      "Orchard",
      "School",
      "Tailor"
    ];
    const special = [];
    for (let i = 0; i < sizeMultiplier; i++) {
      const roll = this.rollD20();
      special.push(specialLocations[roll - 1]);
    }
    const defenses = [];
    for (let i = 0; i < sizeMultiplier; i++) {
      const defenseOptions = [
        "Wooden palisade",
        "Wooden palisade",
        "Wooden palisade",
        "Motte (= mound)",
        "Motte (= mound)",
        "Chevaux de frise",
        "Moat (= trench)",
        "Watchtowers"
      ];
      defenses.push(this.getTableResult(defenseOptions, this.rollDie(8)));
    }
    const guardCount = (this.rollDie(3) + 3) * sizeMultiplier;
    const rulers = [
      "Bandits",
      "Council",
      "Lycanthrope",
      "Mayor",
      "Merchant",
      "Priest",
      "Village elder",
      "Witch"
    ];
    const ruler = this.getTableResult(rulers, this.rollDie(8));
    const villagerDisposition = this.generateDisposition();
    let rulerDisposition = villagerDisposition;
    const dispositionRoll = this.rollD6();
    if (dispositionRoll >= 5) {
      const opposites = {
        "Attack on sight": "Enthusiastic",
        "Hostile": "Welcoming",
        "Neutral": this.rollDie(3) <= 3 ? "Hostile" : "Welcoming",
        "Welcoming": "Hostile",
        "Enthusiastic": "Attack on sight"
      };
      rulerDisposition = opposites[villagerDisposition] || villagerDisposition;
    }
    const npcOptions = [
      "Aggressive guard",
      "Annoying minstrel",
      "Bandit in disguise",
      "Beggar who knows a lot",
      "Curious waitress",
      "Cute dog",
      "Frightened peasant",
      "Lonely widow",
      "Misunderstood witch",
      "Old fool/hag",
      "One-handed lumberjack",
      "Retired mercenary",
      "Seasoned adventurer",
      "Sick child",
      "Stubborn magician",
      "Talented craftsman",
      "Traveling merchant",
      "Troubled hunter",
      "Vampire/Werewolf hunter",
      "Village idiot"
    ];
    const notableNPCs = [];
    for (let i = 0; i < sizeMultiplier; i++) {
      const roll = this.rollD20();
      notableNPCs.push(npcOptions[roll - 1]);
    }
    let secret;
    if (this.rollD6() === 1) {
      const secrets = [
        "Animals turned human",
        "Curse",
        "Elder god cult",
        "Eternal youth",
        "Hidden treasure",
        "Hiding outlaws",
        "Hivemind",
        "Inability to leave",
        "Pact with a demon",
        "Sadistic rituals",
        "Secret society",
        "Underground galleries"
      ];
      secret = this.getTableResult(secrets, this.rollD12());
    }
    let events;
    if (this.rollD6() === 1) {
      const timingRoll = this.rollD6();
      const timing = timingRoll === 1 ? "Ended earlier" : timingRoll >= 2 && timingRoll <= 4 ? "Is happening now" : "Will take place in the future";
      const eventOptions = [
        "Adventurers passing by",
        "Announcement by a crier",
        "Ceremony (wedding, etc.)",
        "Controlled by monsters",
        "Disappearances",
        "Famine",
        "Festival/Fair",
        "Fire",
        "Looting",
        "Market day",
        "Plague",
        "Visit of a notable (lord, etc.)"
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
  generateCity() {
    const { name, variations } = this.generateSettlementName();
    const sizeRoll = this.rollD6();
    let size, sizeMultiplier;
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
    const occupations = [];
    for (let i = 0; i < sizeMultiplier; i++) {
      const roll = this.rollDie(10);
      occupations.push(occupationOptions[roll - 1]);
    }
    const characteristicOptions = [
      "Nothing",
      "Nothing",
      "Nothing",
      "Nothing",
      "Nothing",
      "Corrupt",
      "Crowded",
      "Destroyed",
      "Dry",
      "Filthy",
      "Holy city",
      "Humid",
      "Narrow",
      "Noisy",
      "Open",
      "Renowned",
      "Silent",
      "Tiered",
      "Unsafe",
      "Windy"
    ];
    const characteristics = [];
    let attempts = 0;
    while (characteristics.length < 2 && attempts < 10) {
      const roll = this.rollD20();
      const char = characteristicOptions[roll - 1];
      if (char !== "Nothing" && !characteristics.includes(char)) {
        characteristics.push(char);
      }
      attempts++;
    }
    const appearanceOptions = [
      "Cluttered",
      "Cobblestone",
      "Colorful",
      "Covered with art",
      "Dark",
      "Eerie",
      "Flowers",
      "Geometric",
      "Huge windows",
      "Light",
      "Lots of canals",
      "Lots of stairs",
      "Misaligned buildings",
      "Red bricks",
      "Stark",
      "Tall towers",
      "White marble",
      "Wondrous",
      "Wooden"
    ];
    const appearanceRoll = this.rollD20();
    let appearance;
    if (appearanceRoll === 20) {
      const colorSchemes = ["Grayscale", "Black and white", "Blue and white", "Sand and terracotta"];
      appearance = `Specific color scheme: ${this.getRandomElement(colorSchemes)}`;
    } else {
      appearance = appearanceOptions[appearanceRoll - 1];
    }
    const specialLocationOptions = [
      "Abandoned building",
      "Aqueduct",
      "Archaeological site",
      "Bridge",
      "Burnt/Ruined building",
      "Calvary",
      "Carriage stop",
      "Construction site",
      "Famous street",
      "Fighting pit",
      "Fountain",
      "Gallows",
      "Junkyard",
      "Market hall",
      "Military cemetery",
      "Monument/Memorial",
      "Park",
      "Pilgrimage",
      "Plaza",
      "Slave pit"
    ];
    const special = [];
    for (let i = 0; i < sizeMultiplier; i++) {
      const roll = this.rollD20();
      const location = specialLocationOptions[roll - 1];
      const descriptorResult = rollDescriptorTable$1();
      special.push({
        location,
        descriptors: {
          adverb: descriptorResult.adverb,
          adjective: descriptorResult.adjective,
          description: descriptorResult.description
        }
      });
    }
    const buildingsOfInterest = [];
    for (let i = 0; i < sizeMultiplier * 3; i++) {
      const roll = this.rollD20();
      let building = "";
      if (roll >= 1 && roll <= 3) {
        const regularHousingRoll = this.rollDie(10);
        const housingOptions = [
          "Studio",
          "One bedroom apartment",
          "Two bedrooms apartment",
          "Bungalow",
          "Maisonnette",
          "Penthouse",
          "Mansion",
          "Hotel room",
          "Tower",
          "Boarding house",
          "Tent",
          "Houseboat",
          "Under a bridge",
          "Shanty",
          "Squat",
          "Underground bunker",
          "Caravan",
          "Treehouse",
          "Basement",
          "Hut"
        ];
        const detail = this.getTableResult(housingOptions, regularHousingRoll <= 10 ? regularHousingRoll : this.rollD20());
        building = `Housing: ${detail}`;
      } else if (roll >= 4 && roll <= 10) {
        const businessOptions = [
          "Alchemist",
          "Alchemist",
          "Animal trainer",
          "Animal trainer",
          "Apothecary",
          "Apothecary",
          "Armorer",
          "Armorer",
          "Artist",
          "Artist",
          "Astronomer",
          "Astronomer",
          "Baker",
          "Baker",
          "Bank",
          "Bank",
          "Blacksmith",
          "Blacksmith",
          "Bookmaker",
          "Bookmaker",
          "Botanist",
          "Botanist",
          "Brewery",
          "Brewery",
          "Brothel",
          "Brothel",
          "Butcher",
          "Butcher",
          "Candlemaker",
          "Candlemaker",
          "Candy shop",
          "Candy shop",
          "Carpenter",
          "Carpenter",
          "Cartographer",
          "Cartographer",
          "Casino",
          "Casino",
          "Cheesemaker",
          "Cheesemaker",
          "Doctor",
          "Doctor",
          "Dollmaker",
          "Dollmaker",
          "Florist",
          "Florist",
          "Fortuneteller",
          "Fortuneteller",
          "Foundry",
          "Foundry",
          "General store",
          "General store",
          "Glassblower",
          "Glassblower",
          "Hairdresser",
          "Hairdresser",
          "Hardware store",
          "Hardware store",
          "Jeweler",
          "Jeweler",
          "Lawyer",
          "Lawyer",
          "Locksmith",
          "Locksmith",
          "Pawnshop",
          "Pawnshop",
          "Perfumer",
          "Perfumer",
          "Pet shop",
          "Pet shop",
          "Potter",
          "Potter",
          "Restaurant",
          "Restaurant",
          "Sage",
          "Sage",
          "Sauna",
          "Sauna",
          "Scribe",
          "Scribe",
          "Siege engines seller",
          "Siege engines seller",
          "Slaughterhouse",
          "Slaughterhouse",
          "Stables",
          "Stables",
          "Tailor",
          "Tailor",
          "Tanner",
          "Tanner",
          "Tapestry maker",
          "Tapestry maker",
          "Tavern",
          "Tavern",
          "Tinker",
          "Tinker",
          "Veterinarian",
          "Veterinarian",
          "Wine shop",
          "Wine shop"
        ];
        const business = this.getTableResult(businessOptions, this.rollD100());
        building = `Business: ${business}`;
      } else if (roll >= 11 && roll <= 13) {
        const officialOptions = [
          "Arcane university",
          "Archives",
          "Asylum",
          "City hall",
          "Conservatory",
          "Dispensary",
          "Embassy",
          "Fire station",
          "Mayor office",
          "Meteorological institute",
          "Mint",
          "Palace",
          "Post office",
          "School",
          "Sewers",
          "Tax office",
          "Tourist office",
          "Tribunal",
          "University",
          "Water tower"
        ];
        const detail = this.getTableResult(officialOptions, this.rollD20());
        building = `Official: ${detail}`;
      } else if (roll === 14) {
        const religiousOptions = [
          "Catacombs",
          "Cathedral",
          "Church",
          "Covent",
          "Mausoleum",
          "Monastery",
          "Necropolis",
          "Orphanage",
          "Sanctuary",
          "Seminar",
          "Shrine",
          "Ziggurat"
        ];
        const detail = this.getTableResult(religiousOptions, this.rollD12());
        building = `Religious: ${detail}`;
      } else if (roll >= 15 && roll <= 17) {
        const publicOptions = [
          "Aquarium",
          "Arena",
          "Art gallery",
          "Auction hall",
          "Botanical garden",
          "Event center",
          "Gymnasium",
          "Historical building",
          "House for sale",
          "Hospital",
          "Library",
          "Morgue",
          "Museum",
          "Observatory",
          "Opera",
          "Guildhouse",
          "Public baths",
          "Theater",
          "Workshop",
          "Zoo"
        ];
        const detail = this.getTableResult(publicOptions, this.rollD20());
        building = `Public: ${detail}`;
      } else {
        const militaryOptions = [
          "Armory",
          "Barracks",
          "Canteen",
          "Citadel",
          "Fort",
          "Guard post",
          "Guard tower",
          "Jail",
          "Menagerie",
          "Military archives",
          "Military hospital",
          "Military school",
          "Military surplus",
          "Prison",
          "Recruitment center",
          "Siege workshop",
          "Spy academy",
          "Training hall",
          "Underground vault",
          "Warehouse"
        ];
        const detail = this.getTableResult(militaryOptions, this.rollD20());
        building = `Military: ${detail}`;
      }
      const descriptorResult = rollDescriptorTable$1();
      buildingsOfInterest.push({
        building,
        descriptors: {
          adverb: descriptorResult.adverb,
          adjective: descriptorResult.adjective,
          description: descriptorResult.description
        }
      });
    }
    const isWalled = this.rollDie(2) === 1;
    let defenseInfo = {
      walled: isWalled,
      guards: (this.rollDie(3) + 3) * 5 * sizeMultiplier
    };
    if (isWalled) {
      const entrances = [];
      const availableDirections = ["North", "East", "South", "West"];
      for (let i = 0; i < sizeMultiplier; i++) {
        let direction;
        let attempts2 = 0;
        do {
          const directionRoll = this.rollDie(4);
          direction = ["North", "East", "South", "West"][directionRoll - 1];
          attempts2++;
        } while (entrances.some((e) => e.includes(direction)) && attempts2 < 10);
        if (entrances.some((e) => e.includes(direction))) {
          const usedDirections = entrances.map((e) => e.split(" ")[0]);
          const remaining = availableDirections.filter((d) => !usedDirections.includes(d));
          direction = remaining.length > 0 ? remaining[0] : direction;
        }
        const entranceRoll = this.rollD6();
        let entranceType;
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
    const rulers = [
      "Noble",
      "Noble",
      "Clergy",
      "Council",
      "Mayor",
      "Merchants' guild",
      "Thieves' guild",
      "Vampire"
    ];
    const ruler = this.getTableResult(rulers, this.rollDie(8));
    const citizenDisposition = this.generateDisposition();
    let rulerDisposition = citizenDisposition;
    const dispositionRoll = this.rollD6();
    if (dispositionRoll >= 5) {
      const opposites = {
        "Attack on sight": "Enthusiastic",
        "Hostile": "Welcoming",
        "Neutral": this.rollDie(3) <= 3 ? "Hostile" : "Welcoming",
        "Welcoming": "Hostile",
        "Enthusiastic": "Attack on sight"
      };
      rulerDisposition = opposites[citizenDisposition] || citizenDisposition;
    }
    const npcOptions = [
      "Aggressive guard",
      "Annoying minstrel",
      "Bandit in disguise",
      "Beggar who knows a lot",
      "Clever orphan",
      "Corrupted official",
      "Curious waitress",
      "Distracted scholar",
      "Haughty nobleman",
      "Lonely widow",
      "Nervous tax collector",
      "Penniless merchant",
      "Princess on the run",
      "Retired mercenary",
      "Seasoned adventurer",
      "Shady diplomat",
      "Stubborn wizard",
      "Talented craftsman",
      "Traveler from a distant land",
      "Vampire/Werewolf hunter"
    ];
    const notableNPCs = [];
    for (let i = 0; i < sizeMultiplier; i++) {
      const roll = this.rollD20();
      notableNPCs.push(npcOptions[roll - 1]);
    }
    let events;
    if (this.rollD6() === 1) {
      const timingRoll = this.rollD6();
      const timing = timingRoll === 1 ? "Ended earlier" : timingRoll >= 2 && timingRoll <= 4 ? "Is happening now" : "Will take place in the future";
      const eventOptions = [
        "Announcement by a crier",
        "Assassination",
        "Ceremony (wedding, etc.)",
        "Disappearances",
        "Festival/Fair",
        "Fire",
        "Market day",
        "Plague",
        "Siege/Looting",
        "Tournament",
        "Vermin invasion",
        "Visit of a religious person"
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
  generateCastle() {
    const name = this.generateCastleName();
    const conditions = ["Perfect", "Worn", "Worn", "Aged", "Aged", "Crumbling"];
    const condition = this.getTableResult(conditions, this.rollD6());
    const keepShapes = ["Square/Rectangle", "Square/Rectangle", "Square/Rectangle", "Round", "Round", "Shell (= hollow cylinder)"];
    const keepShape = this.getTableResult(keepShapes, this.rollD6());
    const keepLevels = this.rollDie(3) + 1;
    const defensiveFeatures = [
      "None",
      "None",
      "None",
      "None",
      "None",
      "None",
      "Ballista",
      "Boiling oil",
      "Catapult",
      "Hoarding",
      "Iron spikes",
      "Piles of rocks"
    ];
    const keepDefensiveFeature = this.getTableResult(defensiveFeatures, this.rollD12());
    const nonDefensiveFeatures = [
      "None",
      "None",
      "None",
      "None",
      "None",
      "None",
      "Banners/Flags",
      "Gargoyles",
      "Heads/Bodies",
      "Overgrown",
      "Religious symbols",
      "Secret passage"
    ];
    const keepNonDefensiveFeature = this.getTableResult(nonDefensiveFeatures, this.rollD12());
    const commonersInJail = this.roll2D6();
    const noblesInJail = this.rollDie(3);
    const siegeSupplies = this.roll2D6();
    const treasure = {};
    if (this.rollD100() <= 50) {
      treasure.gold = this.rollDie(4) * 1e4;
    }
    if (this.rollD100() <= 50) {
      treasure.additionalGold = this.rollDie(6) * 5e3;
    }
    if (this.rollD100() <= 25) {
      treasure.gems = this.rollDie(6) + this.rollDie(6) + this.rollDie(6);
    }
    if (this.rollD100() <= 25) {
      treasure.jewelry = this.rollDie(10);
    }
    if (this.rollD100() <= 15) {
      treasure.magicItems = 4;
      treasure.scrolls = this.rollD6();
    }
    const numDefenses = this.rollDie(4);
    const defenseTypes = [
      "Stone walls and towers",
      "Stone walls and towers",
      "Stone walls and towers",
      "Moat (= trench)",
      "Motte (= mound)",
      "Wooden palisade"
    ];
    const defenseFeatures = [];
    for (let i = 0; i < numDefenses; i++) {
      const roll = this.rollD6();
      defenseFeatures.push(defenseTypes[roll - 1]);
    }
    const uniqueDefenses = Array.from(new Set(defenseFeatures));
    const totalFighters = this.rollDie(6) * 10 + this.rollDie(6) * 10 + this.rollDie(6) * 10;
    const lordLevel = 9 + Math.floor(totalFighters / 60);
    const garrison = {
      totalFighters,
      lordLevel,
      lieutenantLevel: lordLevel - 2,
      bodyguardLevel: lordLevel - 3,
      bodyguards: 6,
      cavaliersHeavy: Math.floor(totalFighters * 0.1),
      cavaliersMediumSpear: Math.floor(totalFighters * 0.1),
      cavaliersMediumBow: Math.floor(totalFighters * 0.1),
      footmenSword: Math.floor(totalFighters * 0.4),
      footmenPolearm: Math.floor(totalFighters * 0.1),
      footmenCrossbow: Math.floor(totalFighters * 0.1),
      footmenLongbow: Math.floor(totalFighters * 0.1)
    };
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
      const closures = [
        "Portcullis and wooden door",
        "Portcullis and wooden door",
        "Portcullis and wooden door",
        "Drawbridge",
        "Drawbridge",
        "Both"
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
    let events;
    if (this.rollD6() === 1) {
      const timingRoll = this.rollD6();
      const timing = timingRoll === 1 ? "Ended earlier" : timingRoll >= 2 && timingRoll <= 4 ? "Is happening now" : "Will take place in the future";
      const eventOptions = [
        "Assassination",
        "Big HD monster attack",
        "Ceremony (wedding, etc.)",
        "Festival/Fair",
        "Fire",
        "Plague",
        "Resources/Gold dwindling",
        "Rival lord scouting",
        "Small HD monsters wanting to establish a lair nearby",
        "Siege/Looting",
        "Tournament",
        "Visit of a notable person"
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
        siegeSupplies,
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
  generateTower() {
    const { name, variations } = this.generateSettlementName();
    const abovegroundLevels = this.rollD12();
    const undergroundRoll = this.rollD12();
    let undergroundLevels = 0;
    if (undergroundRoll >= 7 && undergroundRoll <= 8) undergroundLevels = 1;
    else if (undergroundRoll >= 9 && undergroundRoll <= 10) undergroundLevels = 2;
    else if (undergroundRoll === 11) undergroundLevels = 3;
    else if (undergroundRoll === 12) undergroundLevels = 4;
    const hasBottom = undergroundLevels > 0;
    const totalLevels = Math.max(3, abovegroundLevels + undergroundLevels + 1 + (hasBottom ? 1 : 0));
    const connections = [
      "Staircase",
      "Staircase",
      "Staircase",
      "Spiral staircase",
      "Spiral staircase",
      "Spiral staircase",
      "Ladder",
      "Ladder",
      "Elevator",
      "Elevator",
      "Magic elevator",
      "Teleportation portals"
    ];
    const connection = this.getTableResult(connections, this.rollD12());
    const materials = [
      "Cobblestone",
      "Cobblestone",
      "Cobblestone",
      "Cobblestone",
      "Cobblestone",
      "Wood",
      "Wood",
      "Wood",
      "Wood",
      "Wood",
      "Bricks",
      "Bricks",
      "Bricks",
      "Sandstone",
      "Sandstone",
      "Sandstone",
      "Limestone",
      "Limestone",
      "Marble",
      "Metal"
    ];
    const material = this.getTableResult(materials, this.rollD20());
    const shapes = [
      "Square",
      "Square",
      "Square",
      "Square",
      "Square",
      "Round",
      "Round",
      "Round",
      "Round",
      "Round",
      "Conical",
      "Conical",
      "Conical",
      "Tilted",
      "Tilted",
      "Tilted",
      "Asymmetrical",
      "S-shaped",
      "Stacked",
      "Twisted"
    ];
    const shape = this.getTableResult(shapes, this.rollD20());
    const detailOptions = [
      "Nothing",
      "Nothing",
      "Nothing",
      "Nothing",
      "Nothing",
      "Nothing",
      "Nothing",
      "Nothing",
      "Nothing",
      "Nothing",
      "Balcony",
      "Banners",
      "Battlements",
      "Climbing plants",
      "Flags",
      "Moldings",
      "Porch",
      "Stained glass",
      "Statues/Gargoyles",
      "Turrets"
    ];
    const details = [];
    for (let i = 0; i < this.rollDie(3); i++) {
      const detail = this.getTableResult(detailOptions, this.rollD20());
      if (detail !== "Nothing" && !details.includes(detail)) {
        details.push(detail);
      }
    }
    const insideAppearances = [
      "Colorful",
      "Cozy",
      "Dark",
      "Dusty",
      "Extravagant",
      "Luxurious",
      "Moldy",
      "Old fashioned",
      "Stark",
      "Well decorated"
    ];
    const insideAppearance = this.getTableResult(insideAppearances, this.rollDie(10));
    const equipmentOptions = [
      "Nothing",
      "Nothing",
      "Nothing",
      "Nothing",
      "Nothing",
      "Nothing",
      "Nothing",
      "Nothing",
      "Nothing",
      "Nothing",
      "Acoustic tube",
      "Alarm system",
      "Dumbwaiter",
      "Emergency ladder/stairs",
      "Garbage chute",
      "Oversized pet doors",
      "Pneumatic tubes",
      "Secret passage",
      "Slide",
      "Ventilation system"
    ];
    const specialEquipment = [];
    for (let i = 0; i < this.rollDie(3); i++) {
      const item = this.getTableResult(equipmentOptions, this.rollD20());
      if (item !== "Nothing" && !specialEquipment.includes(item)) {
        specialEquipment.push(item);
      }
    }
    const generateLevelUsage = (levelType) => {
      if (levelType === "ground") {
        const options = [
          "Empty and dusty",
          "Fortified room",
          "Hallway",
          "Reception desk",
          "Ruined room",
          "Shop/Tavern",
          "Trapped room",
          "Unloading room"
        ];
        return this.getTableResult(options, this.rollDie(8));
      } else if (levelType === "aboveground") {
        const options = [
          "Abandoned/Cursed level",
          "Archives",
          "Armory",
          "Bedroom(s)",
          "Kitchen and dining room",
          "Laboratory",
          "Library",
          "Meeting room",
          "Museum",
          "Music room/Art room",
          "Office/Study",
          "Storage room"
        ];
        return this.getTableResult(options, this.rollD12());
      } else if (levelType === "top") {
        const options = [
          "Aviary",
          "Beacon",
          "Duel platform",
          "Foghorn",
          "Golden apple tree",
          "Greenhouse",
          "High security prison",
          "Landing platform",
          "Lightning rod",
          "Lookout post",
          "Magic searchlight",
          "Monster nest",
          "Observatory",
          "Panic room",
          "Ruined/Overgrown",
          "Siege engine",
          "Throne room",
          "Treasure room",
          "Weather station",
          "Windmill"
        ];
        return this.getTableResult(options, this.rollD20());
      } else if (levelType === "underground") {
        const options = [
          "Abandoned/Cursed level",
          "Alchemy lab",
          "Cellar",
          "Chapel",
          "Forge",
          "Menagerie",
          "Mushroom cave",
          "Prison",
          "Rituals room",
          "Storage",
          "Torture room",
          "Wine cellar"
        ];
        return this.getTableResult(options, this.rollD12());
      } else if (levelType === "bottom") {
        const options = [
          "Abyss",
          "Ancient ruins",
          "Arena",
          "Boudoir",
          "Creature mouth",
          "Excavation site",
          "Flesh pit",
          "Flooded pit",
          "Gambling den",
          "Magic portal",
          "Magic well",
          "Mine",
          "Oubliette",
          "Tunnel to the center of the planet",
          "Secret society headquarters",
          "Tomb",
          "Tunnel to a lair",
          "Tunnel to the surface",
          "Vault",
          "Well"
        ];
        return this.getTableResult(options, this.rollD20());
      }
      return "Unknown";
    };
    const levelUsage = {
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
    const wizardLevel = Math.floor(Math.random() * 12) + 9;
    let apprenticeLevel;
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
  generateAbbey() {
    const name = this.generateAbbeyName();
    const sizeRoll = this.rollD6();
    const size = sizeRoll >= 1 && sizeRoll <= 5 ? "Small" : "Major";
    let monksNuns, abbotLevel;
    if (size === "Small") {
      monksNuns = this.rollDie(4) * 10 + 20;
      abbotLevel = 9;
      if (monksNuns >= 50) abbotLevel += 1;
    } else {
      monksNuns = this.rollDie(24) * 10 + 90;
      abbotLevel = 9 + Math.floor(monksNuns / 100);
    }
    const structureAndLand = {
      protection: "Stone wall with large gate",
      outsideWalls: "Fields and farming buildings (barns, mills, etc.)",
      areaWithinWalls: `${this.rollDie(2) + 2} acres (= ${1.2 + (this.rollDie(2) - 1) * 0.4}-${1.6} ha)`
    };
    const coreLocations = [
      "Abbot's room",
      "Cellars",
      "Cemetery",
      "Church",
      "Cloisters and garden",
      "Infirmary",
      "Kitchen and refectory",
      "Monks cells",
      "Necessarium (latrines)",
      "Servants, laborers and tradesmen quarters",
      "Storehouses"
    ];
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
    const farmingOptions = [
      "Barley (beer)",
      "Chickens (meat)",
      "Cotton",
      "Cows (meat, milk and cheese)",
      "Goats (meat, milk and cheese)",
      "Grapes (wine)",
      "Hops (beer)",
      "Orchard (fruits and preserves)",
      "Pigs (meat)",
      "Sheeps (meat and wool)",
      "Vegetables",
      "Wheat (flour and bread)"
    ];
    const workshopOptions = ["Candle makers", "Cutlers", "Potters", "Shoemakers", "Smiths", "Tanners"];
    const otherActivityOptions = ["Bee keeping", "Bookshop", "Catering", "Copy & translation", "Exorcism", "Guided tour"];
    const farming = [];
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
    let fame;
    if (size === "Major") {
      const fameRoll = this.rollD20();
      if (fameRoll >= 1 && fameRoll <= 11) {
        const fameReasons = [
          "Age",
          "Architecture",
          "Cattle baptism",
          "Curative (hot) springs",
          "Domain and landscapes",
          "Grave of well known bishop",
          "Key religious celebration",
          "Meals served to travelers",
          "Pilgrimage",
          "Power",
          "Quality of products"
        ];
        fame = fameReasons[fameRoll - 1];
      } else {
        const artifactTypes = ["Ancient parchment", "Art piece", "Crown", "Holy sword", "Precious book", "Relic"];
        const artifactType = this.getTableResult(artifactTypes, this.rollD6());
        if (artifactType === "Relic") {
          const relicTypes = [
            "Arm",
            "Blood",
            "Bones (vertebra, phalanx)",
            "Eye",
            "Flesh",
            "Head",
            "Heart",
            "Item that killed the saint",
            "Leg",
            "Piece of clothing",
            "Prayer book",
            "Religious symbol",
            "Ring",
            "Sandals",
            "Scalp",
            "Shroud",
            "Skin",
            "Tongue",
            "Tooth",
            "Walking stick"
          ];
          const relicType = this.getTableResult(relicTypes, this.rollD20());
          const saint = this.getTableResult(ABBEY_SAINTS, this.rollD30());
          const spellLevels = { 1: 8, 2: 14, 3: 17, 4: 19, 5: 20 };
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
    const histories = [
      "Abandoned then used again",
      "Changed confession",
      "Claimed its autonomy",
      "Destroyed then rebuilt",
      "Founded 2d10 x10 years ago",
      "Has seen better days",
      "Only one original building remains",
      "Sponsored by a rich patron",
      "Started as a knight hermitage",
      "Used to be a boarding school",
      "Was relocated",
      "Was under a spell"
    ];
    const history = this.getTableResult(histories, this.rollD12());
    let events;
    if (this.rollD6() === 1) {
      const timingRoll = this.rollD6();
      const timing = timingRoll === 1 ? "Ended earlier" : timingRoll >= 2 && timingRoll <= 4 ? "Is happening now" : "Will take place in the future";
      const eventOptions = [
        "Broken device",
        "Cowls shrunken/dyed in red",
        "Demonic corruption",
        "Disappearance of the abbot",
        "Drought/Flood",
        "Festival/Fair",
        "Fire",
        "Looting",
        "Moles/Rats infestation",
        "Plague",
        "Scandal",
        "Visit of a notable person"
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
  generateSteading(type) {
    let settlementType;
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
  generateSteadingStep(step) {
    const steading = this.generateSteading();
    return steading[step];
  }
}
const steadingGenerator = new SteadingGenerator();
function generateSteading(type) {
  return steadingGenerator.generateSteading(type);
}
const anthropic$2 = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY ?? ""
});
function generateNotableCitizenNPCs(notableNPCs) {
  if (!notableNPCs || notableNPCs.length === 0) {
    return [];
  }
  const npcGenerator = new NPCGenerator();
  const generatedNPCs = [];
  for (const occupation of notableNPCs) {
    const npc = npcGenerator.generateNPC();
    npc.occupation = occupation;
    generatedNPCs.push(npc);
  }
  return generatedNPCs;
}
function generateCompleteSteading(req, res) {
  try {
    const { type } = req.body;
    const steading = generateSteading(type);
    res.json({
      success: true,
      steading
    });
  } catch (error) {
    console.error("Error generating steading:", error);
    res.status(500).json({
      success: false,
      error: "Failed to generate steading"
    });
  }
}
function generateSteadingStepRoute(req, res) {
  try {
    const { step, currentSteading } = req.body;
    console.log("Generating steading step:", step);
    if (!step) {
      return res.status(400).json({
        success: false,
        error: "Step parameter is required"
      });
    }
    const steadingType = currentSteading == null ? void 0 : currentSteading.type;
    const newSteading = generateSteading(steadingType);
    console.log("Generated steading type:", newSteading.type);
    console.log("Available fields:", Object.keys(newSteading));
    if (!(step in newSteading)) {
      console.log(`Field '${step}' not found. Available fields:`, Object.keys(newSteading));
      return res.status(400).json({
        success: false,
        error: `Field '${step}' not found in ${newSteading.type} steading data. Available fields: ${Object.keys(newSteading).join(", ")}`
      });
    }
    const stepValue = newSteading[step];
    console.log(`Step '${step}' value:`, stepValue);
    res.json({
      success: true,
      step,
      result: stepValue
    });
  } catch (error) {
    console.error("Error generating steading step:", error);
    res.status(500).json({
      success: false,
      error: "Failed to generate steading step"
    });
  }
}
async function generateSteadingNarrative(req, res) {
  try {
    const { steading } = req.body;
    if (!steading) {
      return res.status(400).json({
        success: false,
        error: "Steading data is required"
      });
    }
    if (!process.env.ANTHROPIC_API_KEY) {
      return res.status(500).json({
        success: false,
        error: "LLM service is not configured"
      });
    }
    console.log("Processing steading for narrative:", {
      type: steading.type,
      name: steading.name,
      keys: Object.keys(steading)
    });
    let steadingData;
    try {
      steadingData = JSON.stringify(steading, null, 2);
    } catch (stringifyError) {
      console.error("Error stringifying steading data:", stringifyError);
      steadingData = `Settlement: ${steading.name} (${steading.type})`;
    }
    let allGeneratedNPCs = [];
    if (steading.ruler) {
      const rulerNPC = generateNotableCitizenNPCs([steading.ruler])[0];
      if (rulerNPC) {
        rulerNPC.occupation = steading.ruler;
        allGeneratedNPCs.push(rulerNPC);
        console.log(`Generated ruler NPC: ${rulerNPC.firstName} ${rulerNPC.lastName} (${rulerNPC.occupation})`);
      }
    }
    if (steading.notableNPCs && Array.isArray(steading.notableNPCs)) {
      const citizenNPCs = generateNotableCitizenNPCs(steading.notableNPCs);
      allGeneratedNPCs.push(...citizenNPCs);
      console.log(`Generated ${citizenNPCs.length} NPCs for notable citizens`);
    }
    let descriptorGuidance = "";
    if (steading.descriptors) {
      descriptorGuidance = `

IMPORTANT: This settlement has been given the mythic descriptors "${steading.descriptors.description}" (${steading.descriptors.adverb} + ${steading.descriptors.adjective}). Let these qualities inspire the overall mood, atmosphere, and character of the settlement. NEVER put these descriptor words in quotation marks or use them literally. Instead, let them subtly influence your word choices, imagery, and tone. For buildings and special locations with their own descriptive pairs, use the same approach - let those descriptors guide the feel and atmosphere without forcing the actual words into the narrative. Think of descriptors as invisible mood guides, not vocabulary requirements.`;
    }
    let npcGuidance = "";
    if (allGeneratedNPCs.length > 0) {
      const npcDescriptions = allGeneratedNPCs.map((npc) => {
        const role = npc.occupation.toLowerCase().includes("ruler") || npc.occupation.toLowerCase().includes("lord") || npc.occupation.toLowerCase().includes("mayor") ? "RULER" : "NOTABLE CITIZEN";
        return `${role}: ${npc.firstName} ${npc.lastName} - ${npc.race} ${npc.occupation}. Motivation: ${npc.motivation}. Appearance: ${npc.physicalAppearance}. Quirk: ${npc.quirk}. Secret: ${npc.secret}. Economic Status: ${npc.economicStatus}. Competence: ${npc.competence}.`;
      }).join("\n");
      npcGuidance = `

IMPORTANT - DETAILED NPCs TO WEAVE INTO NARRATIVE:
The following NPCs have been generated for this settlement. DO NOT list them separately or create an NPC section. Instead, naturally incorporate them into your narrative storytelling. Mention them organically as part of the settlement's story, describing them in context as you tell about different areas, events, or aspects of the settlement:

${npcDescriptions}

Weave these characters naturally into your narrative - describe them as you mention different locations, tell about the settlement's governance, discuss local events, or paint the social fabric of the community. Make them feel like living, breathing parts of the settlement's story rather than a separate character roster.`;
    }
    const prompt = `You are a master storyteller and world-builder for tabletop RPGs. I will provide you with detailed information about a settlement (steading) that has been randomly generated. Your task is to weave these details into a compelling, coherent narrative that brings this place to life.

NARRATIVE APPROACH - THEME FIRST:
1. ESTABLISH A GENERAL THEME: Begin by analyzing the ruler, outside appearance, disposition, and notable NPCs to establish a unifying theme or character for this settlement. This theme should guide the entire narrative.
2. APPLY DESCRIPTORS WITHIN THE THEME: When describing points of interest and buildings, use the mythic descriptor word pairs to enhance locations, but always within the confines of your established theme.
3. CREATIVE ADAPTATION: If mythic descriptor words naturally contradict or feel jarring with your established theme, find creative ways to make them work or reinterpret them. Prioritize narrative flow and thematic consistency over forcing exact descriptor words.
4. THEMATIC COHESION: Everything should feel like it belongs in the same settlement with the same underlying character and mood.

Please create a rich narrative description that:
1. Opens by establishing the settlement's overarching theme based on ruler, appearance, disposition, and key NPCs
2. Tells the story of this settlement - its history, current state, and what makes it unique
3. Explains how all the various details work together logically within your established theme
4. Creates atmosphere and mood that remains consistent throughout
5. Resolves any contradictory details in creative ways that enhance the thematic unity
6. Focuses on what makes this place memorable and distinct
7. Naturally incorporates any provided NPCs into the narrative flow without creating separate character sections

Here is the settlement data:
${steadingData}${descriptorGuidance}${npcGuidance}

Guidelines:
- Write in a descriptive, atmospheric tone suitable for a GM to read to players
- Focus on what visitors would see, hear, smell, and feel when approaching and entering
- Explain the relationships between different NPCs, factions, and locations
- If there are secrets, events, or conflicts, weave them into the narrative naturally
- Include specific details that make the settlement feel lived-in and real
- Keep the narrative between 300-500 words
- IMPORTANT: For buildings and special locations with descriptive pairs, DO NOT use quotation marks or force the exact descriptor words into the text. Instead, let these descriptors inspire the mood, atmosphere, and feel of each location without explicitly stating them, but always within your established theme
- If mythic descriptors conflict with your theme, creatively reinterpret them or find ways to make them work - narrative cohesion is more important than literal descriptor usage
- Maintain thematic consistency throughout - every element should feel like it belongs in the same coherent world

${getGlobalNarrativeRestrictions()}

Write the narrative now:`;
    const response = await anthropic$2.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 800,
      temperature: 0.8,
      messages: [
        {
          role: "user",
          content: prompt
        }
      ]
    });
    const narrative = response.content[0].type === "text" ? response.content[0].text : "";
    res.json({
      success: true,
      narrative
    });
  } catch (error) {
    console.error("Error generating steading narrative:", error);
    console.error("Error details:", {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : void 0,
      anthropicKey: process.env.ANTHROPIC_API_KEY ? "Present" : "Missing"
    });
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to generate steading narrative"
    });
  }
}
function getSettlementTypes(req, res) {
  try {
    res.json({
      success: true,
      types: ALL_SETTLEMENT_TYPES
    });
  } catch (error) {
    console.error("Error getting settlement types:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get settlement types"
    });
  }
}
const anthropic$1 = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY ?? ""
});
const getLieutenantTypes = (count = 2) => {
  try {
    const result = getRandomLieutenantTypes(count);
    return Promise.resolve(result);
  } catch (error) {
    return Promise.resolve({
      success: false,
      error: error instanceof Error ? error.message : "Lieutenant types generation failed"
    });
  }
};
const getRandomVillainType = () => {
  const randomIndex = Math.floor(Math.random() * SHADOWDARK_VILLAIN_TYPES.length);
  return SHADOWDARK_VILLAIN_TYPES[randomIndex];
};
const generateIntermediateSteps = async () => {
  const adventureSeeds = generateAdventureSeeds();
  const nameResult = await generateNamesWithIntelligentLanguageChoice({
    characterType: "villain",
    race: adventureSeeds.race,
    goal: adventureSeeds.goal,
    description: "A main antagonist/villain for the campaign"
  }, 6);
  const villainNames = nameResult.success ? nameResult.names : ["Malachar", "Zygrath", "Nethys", "Vorthak", "Xantheus", "Balthazor"];
  const lieutenantResult = await getLieutenantTypes(2);
  const lieutenantTypes = lieutenantResult.success ? lieutenantResult.lieutenant_types : ["Assassin", "Cultist"];
  const lieutenantNameResult = await generateNamesWithIntelligentLanguageChoice({
    characterType: "lieutenant",
    race: adventureSeeds.race,
    goal: adventureSeeds.goal,
    description: `Lieutenants serving under the villain: ${lieutenantTypes.join(", ")}`
  }, 6);
  const lieutenantNames = lieutenantNameResult.success ? lieutenantNameResult.names : ["Vex", "Korran", "Silith", "Drak", "Nereth", "Zylara"];
  const factionNameResult = await generateSingleIntelligentName({
    characterType: "faction",
    race: adventureSeeds.race,
    goal: adventureSeeds.goal,
    description: "An evil organization/cult/faction serving the villain"
  });
  const factionName = factionNameResult.success ? `The ${factionNameResult.name} Covenant` : "The Obsidian Covenant";
  const expandedElements = await generateAllVillainElements({
    tarotCards: adventureSeeds.cards,
    goal: adventureSeeds.goal,
    race: adventureSeeds.race,
    villainNames: villainNames || [],
    lieutenantTypes: lieutenantTypes || [],
    lieutenantNames: lieutenantNames || [],
    factionName
  });
  return {
    tarotCards: adventureSeeds.cards,
    goal: adventureSeeds.goal,
    race: adventureSeeds.race,
    villainNames: villainNames || [],
    lieutenantTypes: lieutenantTypes || [],
    lieutenantNames: lieutenantNames || [],
    factionName,
    ...expandedElements
  };
};
const regenerateIntermediateStep = async (stepKey, currentData) => {
  const updatedData = { ...currentData };
  switch (stepKey) {
    case "tarotCards":
      const adventureSeeds = generateAdventureSeeds();
      updatedData.tarotCards = adventureSeeds.cards;
      break;
    case "goal":
      const newAdventureSeeds = generateAdventureSeeds();
      updatedData.goal = newAdventureSeeds.goal;
      break;
    case "race":
      const raceSeeds = generateAdventureSeeds();
      updatedData.race = raceSeeds.race;
      break;
    case "villainNames":
      const nameResult = await generateNamesWithIntelligentLanguageChoice({
        characterType: "villain",
        race: updatedData.race,
        goal: updatedData.goal,
        description: "A main antagonist/villain for the campaign"
      }, 6);
      updatedData.villainNames = nameResult.success ? nameResult.names : ["Malachar", "Zygrath", "Nethys", "Vorthak", "Xantheus", "Balthazor"];
      break;
    case "lieutenantTypes":
      const lieutenantResult = await getLieutenantTypes(2);
      updatedData.lieutenantTypes = lieutenantResult.success ? lieutenantResult.lieutenant_types : ["Assassin", "Cultist"];
      break;
    case "lieutenantNames":
      const lieutenantNameResult = await generateNamesWithIntelligentLanguageChoice({
        characterType: "lieutenant",
        race: updatedData.race,
        goal: updatedData.goal,
        description: `Lieutenants serving under the villain: ${updatedData.lieutenantTypes.join(", ")}`
      }, 6);
      updatedData.lieutenantNames = lieutenantNameResult.success ? lieutenantNameResult.names : ["Vex", "Korran", "Silith", "Drak", "Nereth", "Zylara"];
      break;
    case "llmReasoning":
      updatedData.llmReasoning = await generateLLMReasoning({
        tarotCards: updatedData.tarotCards,
        goal: updatedData.goal,
        race: updatedData.race,
        villainNames: updatedData.villainNames,
        lieutenantTypes: updatedData.lieutenantTypes,
        lieutenantNames: updatedData.lieutenantNames
      });
      break;
  }
  return updatedData;
};
const generateAllVillainElements = async (baseData) => {
  const prompt = `You are an expert RPG designer creating a complete villain generation process. Based on the following elements, generate ALL the missing components with fate questions and detailed reasoning:

BASE ELEMENTS:
Tarot Cards: ${JSON.stringify(baseData.tarotCards, null, 2)}
Goal: ${baseData.goal}
Race: ${baseData.race}
Villain Names: ${baseData.villainNames.join(", ")}
Lieutenant Types: ${baseData.lieutenantTypes.join(", ")}
Lieutenant Names: ${baseData.lieutenantNames.join(", ")}
Faction Name: ${baseData.factionName}

Generate the following components in JSON format:

{
  "factionFateQuestions": [
    {
      "question": "Yes/No question about faction's origin or nature",
      "roll": "Yes/No with mythic reasoning",
      "interpretation": "What this means for the faction",
      "impact": "How this affects their operations"
    }
    // Generate 3-4 faction fate questions
  ],
  "lieutenantFateQuestions": [
    {
      "lieutenantName": "First lieutenant name from list",
      "lieutenantType": "First lieutenant type from list",
      "fateQuestions": [
        {
          "question": "Yes/No question about this lieutenant's background",
          "roll": "Yes/No with mythic reasoning",
          "interpretation": "What this means for their role"
        }
        // 2-3 questions per lieutenant
      ]
    },
    {
      "lieutenantName": "Second lieutenant name from list",
      "lieutenantType": "Second lieutenant type from list",
      "fateQuestions": [
        // 2-3 questions for second lieutenant
      ]
    }
  ],
  "clues": [
    "8 investigation clues that heroes can discover about the villain",
    "Each clue should reveal different aspects",
    "Mix of physical evidence, witness accounts, documents, etc.",
    "Clues should build toward revealing the villain's plan"
  ],
  "highTowerSurprise": {
    "surprise": "A major plot twist or revelation about the villain",
    "fateQuestion": "Yes/No question about how this surprise unfolds",
    "roll": "Yes/No with mythic reasoning",
    "interpretation": "How the fate roll affects the surprise",
    "finalOutcome": "The actual result after the fate decision"
  },
  "minions": [
    {
      "type": "Primary minion type",
      "description": "What they do and how they serve the villain",
      "count": "Approximate numbers (e.g., 'dozens', 'a handful', 'scores')"
    }
    // 3-4 different minion types
  ],
  "llmReasoning": {
    "tarotInterpretation": "How the tarot cards influence the overall villain concept",
    "raceRationale": "Why this race works perfectly with the goal and tarot themes",
    "goalAlignment": "How all elements align to create a coherent villain",
    "overallCoherence": "Summary of how all fate decisions create a compelling antagonist",
    "villainNameChoice": "Which villain name from the generated list works best and why (include the chosen name)",
    "lieutenantNameChoices": "Which lieutenant names from the generated list work best for each lieutenant type and why (include the chosen names)"
  }
}

Make all fate questions meaningful and let the Yes/No rolls genuinely influence the outcomes. Use mythic GME style reasoning for the rolls.`;
  try {
    const response = await anthropic$1.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 3e3,
      messages: [
        {
          role: "user",
          content: prompt
        }
      ]
    });
    const content = response.content[0];
    if (content.type !== "text") {
      throw new Error("Unexpected response type from Claude");
    }
    const jsonMatch = content.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No JSON found in response");
    }
    const elements = JSON.parse(jsonMatch[0]);
    return elements;
  } catch (error) {
    console.error("Error generating villain elements:", error);
    return {
      factionFateQuestions: [
        {
          question: "Was this faction founded by the villain personally?",
          roll: "Yes - The villain created this organization from nothing",
          interpretation: "The faction is deeply loyal and reflects the villain's personal vision",
          impact: "Members are fanatically devoted and difficult to turn against their leader"
        }
      ],
      lieutenantFateQuestions: [
        {
          lieutenantName: baseData.lieutenantNames[0] || "Vex",
          lieutenantType: baseData.lieutenantTypes[0] || "Assassin",
          fateQuestions: [
            {
              question: "Does this lieutenant have a personal grudge motivating their service?",
              roll: "Yes - They seek revenge against the same enemies",
              interpretation: "Their loyalty is based on shared hatred rather than mere employment"
            }
          ]
        },
        {
          lieutenantName: baseData.lieutenantNames[1] || "Korran",
          lieutenantType: baseData.lieutenantTypes[1] || "Cultist",
          fateQuestions: [
            {
              question: "Is this lieutenant secretly plotting against the villain?",
              roll: "No - They are completely devoted to the cause",
              interpretation: "This lieutenant can be trusted absolutely and will never betray the villain"
            }
          ]
        }
      ],
      clues: [
        "Strange symbols carved into stone at crime scenes",
        "Witnesses report seeing the villain's distinctive appearance",
        "Documents bearing the faction's seal found at key locations",
        "Pattern of attacks targeting specific types of victims",
        "Unusual magical residue left at sites of villain activity",
        "Intercepted communications between faction members",
        "Financial records showing suspicious transactions",
        "Artifacts or weapons with unique craftsmanship signatures"
      ],
      highTowerSurprise: {
        surprise: "The villain's true plan is far grander than initially apparent",
        fateQuestion: "Does the villain's plan succeed partially before heroes can stop it?",
        roll: "Yes - But only the first phase completes",
        interpretation: "The heroes arrive just as the villain achieves a significant milestone",
        finalOutcome: "The villain has gained considerable power but their ultimate goal remains unfinished"
      },
      minions: [
        {
          type: "Elite Guards",
          description: "Highly trained warriors who serve as the villain's personal protection",
          count: "A dozen"
        },
        {
          type: "Cult Followers",
          description: "Fanatical believers who spread the villain's influence",
          count: "Scores"
        },
        {
          type: "Infiltrators",
          description: "Spies and saboteurs placed throughout society",
          count: "A handful"
        }
      ],
      llmReasoning: {
        tarotInterpretation: `The tarot spread of ${baseData.tarotCards.map((c) => c.card_text).join(", ")} creates a complex narrative foundation for this villain.`,
        raceRationale: `The choice of ${baseData.race} as the villain's race provides excellent opportunities for developing their motivations and methods.`,
        goalAlignment: `The goal of "${baseData.goal}" aligns perfectly with the tarot themes and racial background.`,
        overallCoherence: "All elements combine to create a multi-layered antagonist with clear motivations and compelling story potential.",
        villainNameChoice: `From the names ${baseData.villainNames.join(", ")}, I choose ${baseData.villainNames[0]} as it resonates with the dark themes and provides gravitas suitable for the villain's goal.`,
        lieutenantNameChoices: `For the lieutenants: ${baseData.lieutenantNames[0]} works perfectly as the ${baseData.lieutenantTypes[0]}, while ${baseData.lieutenantNames[1]} suits the ${baseData.lieutenantTypes[1]} role. These names complement the villain's scheme.`
      }
    };
  }
};
const generateLLMReasoning = async (data) => {
  var _a, _b;
  const prompt = `You are an expert RPG designer analyzing the results of various generation systems. Provide reasoning and interpretation for the following randomly generated and algorithmic results:

TAROT CARDS (Random table rolls):
${JSON.stringify(data.tarotCards, null, 2)}

GOAL (Random from 360-item table): ${data.goal}

RACE (Weighted random selection): ${data.race}

VILLAIN NAMES (Algorithmic evil-name generation): ${data.villainNames.join(", ")}

LIEUTENANT TYPES (Random table rolls): ${data.lieutenantTypes.join(", ")}

LIEUTENANT NAMES (Algorithmic evil-name generation): ${data.lieutenantNames.join(", ")}

Provide analysis in the following format:

TAROT INTERPRETATION:
[How do these 6 tarot cards work together thematically? What narrative themes do they suggest?]

RACE SELECTION RATIONALE:
[Why does this race choice work well with the goal and tarot themes? What does it add to the villain concept?]

GOAL ALIGNMENT:
[How does the randomly selected goal align with or contrast with the tarot spread? What interesting tensions or synergies exist?]

OVERALL COHERENCE:
[Summary of how all elements work together to create a compelling villain concept]

VILLAIN NAME CHOICE:
[From the generated villain names, pick the one that works best with the concept and explain why. Include the chosen name in your reasoning.]

LIEUTENANT NAME CHOICES:
[From the generated lieutenant names, assign the best names to each lieutenant type and explain the reasoning. Include the chosen names for each type.]

Keep your reasoning concise but insightful. Focus on how the random elements can create unexpected but compelling villain concepts.`;
  try {
    const response = await anthropic$1.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 1200,
      messages: [
        {
          role: "user",
          content: prompt
        }
      ]
    });
    const content = response.content[0];
    if (content.type !== "text") {
      throw new Error("Unexpected response type from Claude");
    }
    const text = content.text;
    const reasoning = {
      tarotInterpretation: "",
      raceRationale: "",
      goalAlignment: "",
      overallCoherence: "",
      villainNameChoice: "",
      lieutenantNameChoices: ""
    };
    const sections = text.split(/(?=TAROT INTERPRETATION:|RACE SELECTION RATIONALE:|GOAL ALIGNMENT:|OVERALL COHERENCE:|VILLAIN NAME CHOICE:|LIEUTENANT NAME CHOICES:)/);
    for (const section of sections) {
      if (section.includes("TAROT INTERPRETATION:")) {
        reasoning.tarotInterpretation = section.replace("TAROT INTERPRETATION:", "").trim();
      } else if (section.includes("RACE SELECTION RATIONALE:")) {
        reasoning.raceRationale = section.replace("RACE SELECTION RATIONALE:", "").trim();
      } else if (section.includes("GOAL ALIGNMENT:")) {
        reasoning.goalAlignment = section.replace("GOAL ALIGNMENT:", "").trim();
      } else if (section.includes("OVERALL COHERENCE:")) {
        reasoning.overallCoherence = section.replace("OVERALL COHERENCE:", "").trim();
      } else if (section.includes("VILLAIN NAME CHOICE:")) {
        reasoning.villainNameChoice = section.replace("VILLAIN NAME CHOICE:", "").trim();
      } else if (section.includes("LIEUTENANT NAME CHOICES:")) {
        reasoning.lieutenantNameChoices = section.replace("LIEUTENANT NAME CHOICES:", "").trim();
      }
    }
    return reasoning;
  } catch (error) {
    console.error("Error generating LLM reasoning:", error);
    return {
      tarotInterpretation: "The tarot cards suggest a complex narrative with multiple layers of meaning that will shape this villain's story.",
      raceRationale: `The selection of ${data.race} as the villain's race provides interesting opportunities for developing their background and motivations.`,
      goalAlignment: `The goal of "${data.goal}" creates compelling possibilities when combined with the other generated elements.`,
      overallCoherence: "All elements combine to create a multi-layered antagonist with clear motivations and compelling story potential.",
      villainNameChoice: `From the names ${data.villainNames.join(", ")}, I choose ${data.villainNames[0]} as it resonates with the dark themes established by the tarot and race.`,
      lieutenantNameChoices: `For the lieutenants: ${data.lieutenantNames[0]} works well as the ${((_a = data.lieutenantTypes) == null ? void 0 : _a[0]) || "first lieutenant"}, while ${data.lieutenantNames[1]} suits the ${((_b = data.lieutenantTypes) == null ? void 0 : _b[1]) || "second lieutenant"} role.`
    };
  }
};
const generateVillainNarrativeFromSteps = async (generationData) => {
  var _a, _b, _c, _d;
  const prompt = `You are an expert dungeon master creating a structured narrative about a villain for a fantasy RPG campaign. Based on the following generation results, create a well-organized story with specific headers and sections:

TAROT INSPIRATION:
${JSON.stringify(generationData.tarotCards, null, 2)}

GENERATED ELEMENTS:
- Goal: ${generationData.goal}
- Race: ${generationData.race}
- Potential Names: ${generationData.villainNames.join(", ")}
- Lieutenant Types: ${generationData.lieutenantTypes.join(", ")}
- Lieutenant Names: ${generationData.lieutenantNames.join(", ")}
- Faction Name: ${generationData.factionName}

FATE DECISIONS:
Faction: ${generationData.factionFateQuestions.map((f) => `${f.question} (${f.roll}) - ${f.interpretation}`).join("; ")}
Lieutenants: ${generationData.lieutenantFateQuestions.map((lt) => `${lt.lieutenantName}: ${lt.fateQuestions.map((fq) => `${fq.question} (${fq.roll})`).join(", ")}`).join("; ")}
High Tower Surprise: ${generationData.highTowerSurprise.fateQuestion} (${generationData.highTowerSurprise.roll}) - ${generationData.highTowerSurprise.finalOutcome}

INVESTIGATION CLUES:
${generationData.clues.map((clue, index) => `${index + 1}. ${clue}`).join("\n")}

MINIONS:
${generationData.minions.map((m) => `${m.type} (${m.count}): ${m.description}`).join("\n")}

Create a structured narrative with these EXACT headers and sections:

## Villain / BBEG
[Choose the best name from the potential names list. Write 2-3 paragraphs about their background, rise to power, motivations influenced by the tarot themes and goal. Include their race and how the fate decisions shaped their story.]

## The High Tower Surprise
[Write 1-2 paragraphs about the plot twist: ${generationData.highTowerSurprise.surprise}. Incorporate how the fate question outcome (${generationData.highTowerSurprise.roll}) affects this surprise, leading to: ${generationData.highTowerSurprise.finalOutcome}]

## Clues About the BBEG
[Format the investigation clues as a bulleted list using markdown bullet points (•), incorporating each clue into the narrative context]

## ${((_a = generationData.lieutenantFateQuestions[0]) == null ? void 0 : _a.lieutenantName) || generationData.lieutenantNames[0]} - ${((_b = generationData.lieutenantFateQuestions[0]) == null ? void 0 : _b.lieutenantType) || generationData.lieutenantTypes[0]}
[Write 1-2 paragraphs about this lieutenant, incorporating their fate question outcomes and role]

## ${((_c = generationData.lieutenantFateQuestions[1]) == null ? void 0 : _c.lieutenantName) || generationData.lieutenantNames[1]} - ${((_d = generationData.lieutenantFateQuestions[1]) == null ? void 0 : _d.lieutenantType) || generationData.lieutenantTypes[1]}
[Write 1-2 paragraphs about this lieutenant, incorporating their fate question outcomes and role]

## The ${generationData.factionName}
[Write 2-3 paragraphs about the faction, incorporating the faction fate decisions and how the organization operates]

## Minions
[Write 1-2 paragraphs describing the various minion types and how they serve the villain's goals]

Use the fate decision outcomes to shape each section. Write in an engaging, atmospheric style that a dungeon master could read aloud. Make sure each section flows naturally but maintains clear organization.

${getGlobalNarrativeRestrictions()}`;
  try {
    const response = await anthropic$1.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 1e3,
      messages: [
        {
          role: "user",
          content: prompt
        }
      ]
    });
    const content = response.content[0];
    if (content.type !== "text") {
      throw new Error("Unexpected response type from Claude");
    }
    return content.text;
  } catch (error) {
    console.error("Error generating narrative from steps:", error);
    return `The legend of ${generationData.villainNames[0] || "this villain"} spreads across the land like a dark shadow. Born of ${generationData.race.toLowerCase()} heritage and driven by an insatiable desire to ${generationData.goal.toLowerCase()}, this antagonist has become a force to be reckoned with.

Their rise to power was foretold in the ancient cards - ${generationData.tarotCards.map((card) => card.card_text).join(", ")} - and now their influence spreads through trusted lieutenants of varying races and backgrounds.

Those who dare oppose them must be prepared for a cunning adversary who will stop at nothing to achieve their dark ambitions.`;
  }
};
const generateCompleteVillain = async () => {
  const adventureSeeds = generateAdventureSeeds();
  const villainType = getRandomVillainType();
  const nameResult = await generateNamesWithIntelligentLanguageChoice({
    characterType: "villain",
    race: adventureSeeds.race,
    goal: adventureSeeds.goal,
    description: `${villainType} - A main antagonist/villain for the campaign`
  }, 3);
  const villainNames = nameResult.success ? nameResult.names : ["Malachar", "Zygrath", "Nethys"];
  const lieutenantResult = await getLieutenantTypes(2);
  const lieutenantTypes = lieutenantResult.success ? lieutenantResult.lieutenant_types : ["Assassin", "Cultist"];
  const lieutenantNameResult = await generateNamesWithIntelligentLanguageChoice({
    characterType: "lieutenant",
    race: adventureSeeds.race,
    goal: adventureSeeds.goal,
    description: `Lieutenants serving under the ${villainType}: ${lieutenantTypes.join(", ")}`
  }, 4);
  const lieutenantNames = lieutenantNameResult.success ? lieutenantNameResult.names : ["Vex", "Korran", "Silith", "Drak"];
  const prompt = `You are an expert dungeon master creating a compelling villain for a fantasy RPG campaign. Generate a detailed BBEG (Big Bad Evil Guy) based on the following constraints:

TAROT INSPIRATION:
${JSON.stringify(adventureSeeds, null, 2)}

VILLAIN TYPE: ${villainType}
POTENTIAL NAMES: ${villainNames == null ? void 0 : villainNames.join(", ")}
LIEUTENANT TYPES: ${lieutenantTypes == null ? void 0 : lieutenantTypes.join(", ")}
LIEUTENANT NAMES: ${lieutenantNames == null ? void 0 : lieutenantNames.join(", ")}

Generate a JSON response with the following structure:
{
  "name": "Choose the best name from the list or create a variation",
  "villainType": "${villainType}",
  "motivation": "What drives this villain's actions (1-2 sentences)",
  "hook": "How this villain enters or affects the story (1-2 sentences)",
  "detailedDescription": "Detailed physical description, personality, and background (2-3 sentences)",
  "faction": {
    "name": "Name of the villain's organization/cult/army",
    "description": "Brief description of the faction's goals and methods"
  },
  "lieutenants": [
    {
      "name": "Use one of the lieutenant names",
      "description": "Description of this lieutenant (their role, personality, abilities)",
      "minions": "Optional: what type of minions they command"
    },
    {
      "name": "Use another lieutenant name", 
      "description": "Description of this lieutenant",
      "minions": "Optional: what type of minions they command"
    }
  ],
  "minions": "General description of the villain's common followers/army",
  "powerLevel": "Description of the villain's capabilities and threat level",
  "weaknesses": ["List", "of", "potential", "weaknesses", "or", "ways", "to", "defeat", "them"]
}

Make the villain compelling, memorable, and thematically appropriate for the tarot inspiration. Ensure the villain feels dangerous but defeatable with clever planning.`;
  try {
    const response = await anthropic$1.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 2e3,
      messages: [
        {
          role: "user",
          content: prompt
        }
      ]
    });
    const content = response.content[0];
    if (content.type !== "text") {
      throw new Error("Unexpected response type from Claude");
    }
    const jsonMatch = content.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No JSON found in response");
    }
    const villainData = JSON.parse(jsonMatch[0]);
    return villainData;
  } catch (error) {
    console.error("Error generating villain:", error);
    return {
      name: (villainNames == null ? void 0 : villainNames[0]) || "Malachar the Dark",
      villainType,
      motivation: "Seeks to corrupt the natural order and spread darkness across the land.",
      hook: "Ancient seals binding this entity are beginning to weaken, causing strange omens.",
      detailedDescription: "A towering figure shrouded in dark robes, with eyes that burn like cold stars. Their presence fills the air with dread and whispers of forgotten curses.",
      faction: {
        name: "The Obsidian Covenant",
        description: "A cult of fanatics devoted to bringing about eternal darkness through ancient rituals."
      },
      lieutenants: [
        {
          name: (lieutenantNames == null ? void 0 : lieutenantNames[0]) || "Vex",
          description: "A cunning spymaster who gathers information through fear and manipulation.",
          minions: "Thieves and informants throughout the city"
        },
        {
          name: (lieutenantNames == null ? void 0 : lieutenantNames[1]) || "Korran",
          description: "A brutal enforcer who leads the villain's military forces with an iron fist.",
          minions: "Elite soldiers and mercenaries"
        }
      ],
      minions: "Cultists, corrupted creatures, and hired mercenaries",
      powerLevel: "Extremely dangerous with powerful magic and numerous followers",
      weaknesses: ["Ancient binding rituals", "Holy artifacts", "Unity among heroes", "Their own arrogance"]
    };
  }
};
const regenerateVillainStep = async (step, currentVillain) => {
  const prompt = `You are updating a specific aspect of an existing villain. Here is the current villain:

${JSON.stringify(currentVillain, null, 2)}

Regenerate ONLY the "${step}" field with new content while keeping everything else the same. Return the complete villain JSON with only the "${step}" field changed. Make sure the new content fits with the existing villain's theme and background.`;
  try {
    const response = await anthropic$1.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 1500,
      messages: [
        {
          role: "user",
          content: prompt
        }
      ]
    });
    const content = response.content[0];
    if (content.type !== "text") {
      throw new Error("Unexpected response type from Claude");
    }
    const jsonMatch = content.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No JSON found in response");
    }
    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error(`Error regenerating step ${step}:`, error);
    return currentVillain;
  }
};
const generateVillainNarrative = async (villain) => {
  const prompt = `You are a skilled storyteller creating an engaging narrative about a villain for a fantasy RPG campaign. Here is the villain:

${JSON.stringify(villain, null, 2)}

Write a compelling 3-4 paragraph narrative that brings this villain to life. Include:
- Their rise to power or origin story
- How they operate and influence the world
- What makes them a credible threat to heroes
- Hints about how they might be encountered or defeated

Write in an engaging, atmospheric style that a dungeon master could read aloud or adapt for their campaign. Make it feel like a legend or dark tale that characters might hear whispered in taverns.

${getGlobalNarrativeRestrictions()}`;
  try {
    const response = await anthropic$1.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 1e3,
      messages: [
        {
          role: "user",
          content: prompt
        }
      ]
    });
    const content = response.content[0];
    if (content.type !== "text") {
      throw new Error("Unexpected response type from Claude");
    }
    return content.text;
  } catch (error) {
    console.error("Error generating narrative:", error);
    return "The dark legend of this villain is shrouded in mystery, their true story lost to time and shadow...";
  }
};
const villainGenerator = async (req, res) => {
  try {
    const body = req.body;
    if (body.generateIntermediateSteps) {
      const generationResults = await generateIntermediateSteps();
      res.json({
        success: true,
        generationResults
      });
    } else if (body.regenerateIntermediateStep && body.currentGenerationData) {
      const updatedResults = await regenerateIntermediateStep(body.regenerateIntermediateStep, body.currentGenerationData);
      res.json({
        success: true,
        generationResults: updatedResults
      });
    } else if (body.generateVillainFromSteps && body.generationData) {
      const narrative = await generateVillainNarrativeFromSteps(body.generationData);
      res.json({
        success: true,
        narrative
      });
    } else if (body.generateAll) {
      const villain = await generateCompleteVillain();
      res.json({
        success: true,
        villain
      });
    } else if (body.regenerateStep && body.currentVillain) {
      const updatedVillain = await regenerateVillainStep(body.regenerateStep, body.currentVillain);
      res.json({
        success: true,
        villain: updatedVillain
      });
    } else if (body.generateNarrative && body.villain) {
      const narrative = await generateVillainNarrative(body.villain);
      res.json({
        success: true,
        narrative
      });
    } else {
      res.status(400).json({
        success: false,
        error: "Invalid request parameters"
      });
    }
  } catch (error) {
    console.error("Villain generator error:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred"
    });
  }
};
function generateNamesRoute(req, res) {
  try {
    const { alignment, numNames = 8 } = req.body;
    let actualAlignment;
    if (alignment === 0) {
      actualAlignment = Math.floor(Math.random() * 17) + 1;
    } else if (!isValidAlignment(alignment)) {
      return res.status(400).json({
        success: false,
        error: "Invalid alignment. Must be 0 (Random) or 1-17 for specific styles"
      });
    } else {
      actualAlignment = alignment;
    }
    if (typeof numNames !== "number" || numNames < 1 || numNames > 50) {
      return res.status(400).json({
        success: false,
        error: "Number of names must be between 1 and 50"
      });
    }
    const result = generateNames$1(actualAlignment, numNames);
    res.json({
      ...result,
      actualAlignment
    });
  } catch (error) {
    console.error("Error generating names:", error);
    res.status(500).json({
      success: false,
      error: "Failed to generate names"
    });
  }
}
function getAlignmentOptionsRoute(req, res) {
  try {
    const options = getAlignmentOptions();
    res.json({
      success: true,
      alignments: options
    });
  } catch (error) {
    console.error("Error getting alignment options:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get alignment options"
    });
  }
}
const mildCurses = [
  "Turns purple any time they tell a lie.",
  "Always looks sopping wet.",
  "Will be pooped on by a bird at least once a day (regardless of location).",
  "Is now horribly allergic to pollen and dust.",
  "Is compelled to give any stranger they meet a high five. If the stranger leaves them hanging, the creature will high five their own hand.",
  "Cannot stop yawning in an egregious (and fairly disrespectful) way.",
  "Can communicate with cats but only cats. All other language is lost to them.",
  "Grows a cumbersome beard twice as long as they are tall.",
  "Is hoarse and all but inaudible.",
  "Is under the impression every single person they encounter knows their darkest secrets.",
  "Must speak in rhymed couplets or take 1d4 +1 psychic damage each time they talk.",
  "Is always thirsty.",
  "Is allergic to metal and breaks out in leaky sores on contact.",
  "Must use jazz hands when they speak or take 1d6 + 3 psychic damage.",
  "Refuses to be seen without their hat, and won't let anyone forget it.",
  "Is suddenly followed by every mouse and rat in the village.",
  "Has breath so bad it knocks out anyone who comes within a yard.",
  "Is disgusted by gold.",
  "Loses the ability to lie or even omit elements of the truth.",
  "Emits an offensively repulsive odor.",
  "Becomes allergic to anything with fur.",
  "Their personality shifts slightly.",
  "Everyone keeps forgetting who they are.",
  "Their hair won't stop growing at an alarmingly fast rate.",
  "Smells nothing but sewage at all times.",
  "Makes a considerable amount of noise when trying to sneak.",
  "Drops their weapon after every attack.",
  "Can't stop reciting subpar poetry.",
  "Can't maintain their balance.",
  "Trips and falls constantly.",
  "Can't stop staring at people.",
  "Their hands stick to anything they touch.",
  "All but their head is invisible.",
  "Everyone keeps mistaking them for a wanted criminal.",
  "Has an uncontrollable urge to steal cooking equipment.",
  "Can't speak to the opposite sex.",
  "Can't sit down.",
  "Everyone is convinced they are a doppelganger.",
  "Has an uncontrollable urge to pickpocket town guards.",
  "Becomes overly sensitive to light.",
  "Feels very heavy.",
  "Can read minds, but only when inconvenient.",
  "The weather is constantly bad wherever they go.",
  "Falls in love with anyone they make direct eye contact with.",
  "Can't stop laughing.",
  "Is afflicted with eternal, unrelenting hiccups.",
  "Is unable to resist speaking every thought they have out loud.",
  "Is completely oblivious to traps and can't stop setting them off.",
  "Keeps losing gold in inexplicable ways.",
  "Is unable to distinguish between good and bad advice.",
  "Clucks like a chicken when they try to speak.",
  "Farts uncontrollably all the time.",
  "Each day they wake up with their face covered in full clown makeup, requiring a DC 12 Wisdom saving throw when opening their mouth or laughing uncontrollably.",
  "Begins to float away every time they lay down.",
  "Attracts minuscule and mischievous fey creatures that constantly steal their stuff.",
  "Everything tastes like ash.",
  "Can only speak in haiku.",
  "Stops believing magic exists.",
  "All liquids, including magical ones, become water when they touch the container.",
  "Crows follow them everywhere, cawing noisily every time they try to speak or rest.",
  "Desires to shake hands with every single creature they meet, no matter the danger.",
  "Believes butterflies will lead them to great treasure and will follow one at any cost.",
  "Forgets how to read.",
  "Believes they can fly but cannot, with failures not enlightening or deterring them.",
  "An angry giant goat named Kevin follows them everywhere, staring unless they turn their back.",
  "Becomes a kleptomaniac, attempting to steal anything not nailed down.",
  "Has an uncontrollable need to sing all the time, wherever they are.",
  "Becomes covered with mud and stinking filth that reappears every time it's cleaned off, giving disadvantage on all Charisma checks.",
  "Will tell their deepest held secrets to anyone they meet, leading with the hidden knowledge.",
  "Can only speak in questions.",
  "Grows a wildly uncontrollable mustache that moves of its own accord, imposing disadvantage on concentration checks.",
  "Must refer to themselves in the third person or take 9 (2d8) necrotic damage each time they don't.",
  "Grows a lawful good mole on their left upper lip that speaks incessantly and protests unlawful actions.",
  "A spectral bard follows them everywhere singing songs of their most embarrassing mistakes.",
  "Sheds glitter everywhere and has disadvantage on all Dexterity (Stealth) checks.",
  "Any piece of furniture or equipment they try to sit or lie on breaks and they fall.",
  "Is compelled to lick everything.",
  "Proposes marriage to everyone and everything.",
  "Is compelled to hand their money and valuables out to random strangers.",
  "Must enter buildings backward while singing sea shanties at the top of their lungs."
];
const severeCurses = [
  "Loses hit points equal to any damage they deal to another creature.",
  "Ages 1d10 years each time they take a long rest.",
  "Loses 3d6 pounds each time they eat.",
  "Can only use a total of 20 words per day.",
  "Must walk/run backward or they'll drop to 0 HP.",
  "Completely loses their sense of direction and has disadvantage on all Wisdom (Survival) checks related to travel.",
  "Is vulnerable to cold damage and cannot stop their teeth from chattering at the slightest drop in temperature.",
  "Has an 80 percent chance of being struck by lightning in a storm.",
  "Forgets how to do basic math. Numbers are meaningless now.",
  "Gets incredibly seasick to the point of collapse.",
  "Must ask for permission to enter any dwelling and is barred from entry by un-dispellable magic if they do not receive it from the dwelling's owner.",
  "Is anchored to the Material Plane. They cannot travel to other planes, nor can their soul move on.",
  "Is terribly frightened of the outdoors. They have disadvantage on Wisdom (Nature) skill checks and any rolls made when outside any urban environment.",
  "Becomes incredibly accident prone.",
  "Forgets what they were doing and why once per short rest at GM discretion.",
  "Passes a curse to every humanoid they touch.",
  "Can't stop crying.",
  "Believes they are friendless, penniless and aimless.",
  "Dies painfully but is immediately resurrected, with half as much max HP, at the start of each new day.",
  "Believes they are immortal and acts accordingly.",
  "Is vulnerable to all damage but feels no pain.",
  "Lacks bones and moves as an ooze would.",
  "Becomes catatonic at the sound of thunder.",
  "Gets incredibly winded during physical activity and must succeed on a DC 15 Constitution saving throw to avoid passing out.",
  "Takes the shape of the world's most notorious criminal.",
  "Can only eat grass.",
  "Can't move their arms or legs.",
  "Hears cats screaming whenever music is played.",
  "Gains 3d6 pounds per day, rerolling at the end of every long rest.",
  "Is compelled to challenge every creature they encounter to a duel.",
  "Weeps blood at the slightest insult.",
  "Can only see the Ethereal Plane.",
  "Has their Strength score reduced by half.",
  "Has their Dexterity score reduced by half.",
  "Has their Constitution score reduced by half.",
  "Has their Intelligence score reduced by half.",
  "Has their Wisdom score reduced by half.",
  "Has their Charisma score reduced by half.",
  "Has their movement speed reduced by half.",
  "Immediately loses half their max HP.",
  "Reverts to a childhood state.",
  "Loses the ability to learn or make new memories.",
  "Must kill a creature with their bare hands every day or die.",
  "Is being hunted by a shadow.",
  "Is petrified and unable to move.",
  "Their dreams are haunted by a ghost.",
  "Becomes unconscious at the smell of hay.",
  "Falls asleep whenever they hear the word 'the'.",
  "Has forgotten how to speak.",
  "Has forgotten how to walk.",
  "Has an evil alternate personality who takes control often.",
  "Everything they touch turns to ash.",
  "Is unable to trust even their closest friends.",
  "Is gripped with terror at the thought of their own existence.",
  "Is being stalked by a vampire.",
  "Can't stop gaining weight at an alarming rate.",
  "Can't stop dancing.",
  "Their dreams are haunted by a demon.",
  "All of their attacks are nonlethal.",
  "Feels as if they are on fire.",
  "Has horrible luck.",
  "Their body parts swell up one by one.",
  "Sees hellhounds everywhere they go.",
  "Everything they touch is set on fire.",
  "Can't stop growing at an alarming rate.",
  "Has an uncontrollable urge to stab anyone who talks to them.",
  "Their personality shifts drastically to the opposite of what it was.",
  "Now breathes water instead of air.",
  "Has become blind.",
  "Feels the urge to attack everyone who looks at them.",
  "Feels filthy no matter how much they bathe.",
  "Everything they touch turns to stone.",
  "If they stop moving they will die.",
  "Is slowly transforming into a swamp creature.",
  "Has forgotten how to read or write.",
  "Loses the ability to turn left.",
  "Has forgotten how to breathe.",
  "Has become deaf.",
  "Is unable to perform spells of any kind.",
  "Has forgotten how to fight.",
  "Has forgotten how to eat.",
  "Becomes convinced they are turning into a zombie.",
  "Is being haunted by a wraith.",
  "Their spells may have the opposite of the intended effect.",
  "Has no memory of their companions.",
  "Any armor they put on is unbearably heavy.",
  "Their skin becomes paper-thin and fragile, gaining vulnerability to necrotic damage and taking 5 (2d4) fire damage for every hour spent in the sun.",
  "Gains vulnerability to fire damage.",
  "All of their fingers fall off, unable to hold weapons/equipment or cast spells with somatic components until spending 5 (2d4) weeks training.",
  "Their skin turns blue and burns with sickly glowing symbols, taking 5 (1d6 + 2) psychic damage each time they make a Charisma-based check.",
  "Their skin, organs and muscles turn to dust, becoming a skeleton but retaining all statistics.",
  "Gains vulnerability to acid damage and can only respond to questions with 'It's complicated.'",
  "Their legs and arms switch places on their body.",
  "Loses 1 hit point each time they hear their name.",
  "Gains vulnerability to thunder damage.",
  "Can only eat items that aren't food, like rocks or metal, gaining 1 level of exhaustion each day.",
  "Is frightened of the moon and depictions of it.",
  "Punches themselves in the face hard every time they hear the word 'tavern.'",
  "Grows a sentient, prehensile tail that is chaotic evil and always trying to strangle them.",
  "Has to be reduced to 0 hit points at least once per day or they'll die permanently.",
  "Gains vulnerability to lightning damage.",
  "Metal of all kinds are drawn toward them, sticking to their skin and requiring a DC 20 Strength check to remove.",
  "All fires within 50 feet go out when they are around (doesn't affect instantaneous damage).",
  "Believes they are dying, moving at quarter speed and preferring to lie down.",
  "All coins, gems and precious metals turn to stone as soon as they touch them.",
  "Becomes the realm's most wanted criminal.",
  "Cannot enter a city, town or village with more than 60 people, falling unconscious if they do.",
  "Becomes a frog.",
  "Bleeds easily and profusely, requiring a DC 14 Constitution saving throw when taking damage or permanently losing 2 (1d4) maximum hit points.",
  "Gains vulnerability to radiant damage.",
  "Their hair becomes snakes, requiring a DC 14 Dexterity saving throw each hour or taking 2 (1d4) piercing and 7 (2d6) poison damage.",
  "Small polyps grow on their skin, developing tentacles that will open a portal to the abyss in 5 (2d4) days.",
  "Becomes a magnet for ranged attacks, with creatures attacking from more than 10 feet away getting +2 to attack rolls.",
  "Takes 6 (1d8 + 2) psychic damage every time they touch a door knob, clasp or lock.",
  "At night, their right hand detaches and becomes chaotic neutral, robbing the rich to give to the poor.",
  "Their arms grow to ridiculous length, gaining 10 feet reach but disadvantage on attack rolls and Dexterity checks.",
  "Is constantly hungry and starts to think their companions look tasty.",
  "Feels they are invulnerable and acts accordingly.",
  "Their soul will inhabit the body of the next creature they kill.",
  "Gains vulnerability to poison damage.",
  "Is incredibly narcoleptic, requiring a DC 13 Wisdom saving throw at the beginning of each turn or falling asleep.",
  "Becomes a black pudding that can communicate telepathically within 30 feet but cannot use magic items.",
  "Is affected by 3 (1d6) curses from this list."
];
const funnyCurses = [
  "Glows in the dark but only when embarrassed.",
  "Transforms into an overripe watermelon with blindsense. The creature maintains its mental statistics and can communicate telepathically.",
  "Has an overwhelming desire to eat (but an aversion to the taste of) sand.",
  "Can only communicate in song titles.",
  "Has one of those head colds that just won't quit.",
  "Feels their teeth triple in size, and their mouth curve into a giant (and agonizing) grin.",
  "Birth to a fully formed quasit once per month.",
  "Has an increasingly unignorable hunger for chalk.",
  "Dog. Another stray will join this growing pack every time the cursed creature takes a long rest.",
  "Suddenly has rubber-like arms that become twisted and tangled whenever they try to use them.",
  "Is haunted by a constant, uncontrollable sneeze.",
  "Their body releases a pheromone that attracts monsters (but only small, harmless ones like rabbits).",
  "Shrinks down to half their size.",
  "Becomes tired in the day and overly energetic at night.",
  "Their body releases a pheromone that attracts deer.",
  "Is unable to sleep.",
  "Can't lie down.",
  "Transforms into a random animal during a full moon.",
  "Their body releases a pheromone that attracts bears (but only teddy bears).",
  "Everything they touch freezes over (but only for 3 seconds).",
  "Their spells have random targets (but always friendly ones).",
  "Can't stop singing (but only knows one song).",
  "Unattractive people can't help but fall madly in love with them.",
  "Their body releases a pheromone that attracts rats (who form a helpful cleaning crew).",
  "Is unable to stop randomly shouting about rabbits.",
  "Their dreams are haunted by embarrassing memories (which they act out while sleepwalking).",
  "Has forgotten how to drink (but only water - other liquids are fine).",
  "Hiccups uncontrollably and foul-smelling bubbles pour out of their mouth each time.",
  "Their nostrils fuse shut and they can no longer smell (which is sometimes a blessing).",
  "Their hair turns purple and grows at an exponential rate, requiring cutting every 2 hours or losing half movement speed to tangling.",
  "When they speak, it sounds as if they're underwater, giving disadvantage on Charisma-based checks.",
  "Becomes fascinated with horses, speaking exclusively to any horse in line of sight to the detriment of all else.",
  "Hears a high-pitched ringing at all times and fails any hearing-based Wisdom (Perception) checks.",
  "The world around them seems to spin constantly, requiring a DC 14 Constitution saving throw each hour or becoming dizzy for 10 minutes.",
  "Cries uncontrollably if they step on grass.",
  "Hops on one leg everywhere they go, moving with half speed and having disadvantage on Dexterity-based skill checks.",
  "Their eyes disappear from the front of their head and reappear in the back, giving disadvantage on Wisdom (Perception) checks based on sight.",
  "The joints in their arms reverse, giving disadvantage to all attack rolls and Dexterity (Sleight of Hand) checks.",
  "Spiky quills erupt from their back, requiring them to sleep on their stomach.",
  "Hiccups uncontrollably and foul-smelling bubbles pour out of their mouth each time.",
  "Their eyes glow green and they see everything in shades of blue, rolling all Dexterity (Stealth) checks with disadvantage.",
  "Their fingernails grow into sharp claws and they constantly feel like clawing out their own eyes (but never actually do it).",
  "Believes they have become a dragon and uses their 'breath weapon' (just blowing air) at every opportunity.",
  "Sparks fly from the ground where they walk, making pretty but harmless light shows.",
  "Must count grains of salt or sand if they are in sight, forgoing any other actions.",
  "Plants die everywhere they walk, becoming brittle and turning to dust (but they regrow twice as beautiful the next day).",
  "Their skin turns green and sprouts mushrooms that smell of dirty feet and garlic.",
  "Grows a wildly uncontrollable mustache that moves of its own accord and has its own personality.",
  "Believes 5 feet is actually a mile and can only move 5 feet during a move action.",
  "Becomes meek, with any damage they deal reduced by half (but they become incredibly polite).",
  "Sweats profusely when indoors (but only maple syrup).",
  "Can't stop singing (only lullabies, which puts everyone to sleep).",
  "Everything they touch turns to cheese for exactly 30 seconds.",
  "Their shadow detaches and follows them around, occasionally waving at people.",
  "They can only walk sideways like a crab.",
  "Every time they sneeze, a small flower grows from their nose.",
  "Their voice becomes incredibly high-pitched, like they've inhaled helium.",
  "They compulsively rhyme everything they say, even when it makes no sense.",
  "Their reflection shows them as a different person each day.",
  "They can only taste things that are the color blue.",
  "Small birds constantly nest in their hair.",
  "They leave glittery footprints wherever they walk.",
  "Every door they open plays a different silly sound effect.",
  "They can only speak in questions, even when making statements.",
  "Their hiccups sound like different animal noises each time.",
  "They age backwards one day for every week that passes.",
  "Everything they write appears in crayon, regardless of what they're writing with."
];
const curseEffects = [...mildCurses, ...severeCurses, ...funnyCurses];
function generateCurse(category = "random") {
  try {
    let selectedCurse;
    let actualCategory;
    if (category === "random") {
      const categories = ["mild", "severe", "funny"];
      actualCategory = categories[Math.floor(Math.random() * categories.length)];
    } else {
      actualCategory = category;
    }
    let curseArray;
    switch (actualCategory) {
      case "mild":
        curseArray = mildCurses;
        break;
      case "severe":
        curseArray = severeCurses;
        break;
      case "funny":
        curseArray = funnyCurses;
        break;
      default:
        return {
          success: false,
          error: "Invalid curse category"
        };
    }
    const randomIndex = Math.floor(Math.random() * curseArray.length);
    selectedCurse = curseArray[randomIndex];
    return {
      success: true,
      curse: selectedCurse,
      category: actualCategory
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unexpected error occurred"
    };
  }
}
function getCurseCount(category = "random") {
  switch (category) {
    case "mild":
      return mildCurses.length;
    case "severe":
      return severeCurses.length;
    case "funny":
      return funnyCurses.length;
    case "random":
      return curseEffects.length;
    default:
      return 0;
  }
}
function getCurseCategories() {
  return [
    { value: "random", label: "Random", count: curseEffects.length },
    { value: "mild", label: "Mild", count: mildCurses.length },
    { value: "severe", label: "Severe", count: severeCurses.length },
    { value: "funny", label: "Funny", count: funnyCurses.length }
  ];
}
function generateCursesRoute(req, res) {
  try {
    const { category = "random" } = req.body;
    if (!["random", "mild", "severe", "funny"].includes(category)) {
      return res.status(400).json({
        success: false,
        error: "Category must be one of: random, mild, severe, funny"
      });
    }
    const result = generateCurse(category);
    res.json(result);
  } catch (error) {
    console.error("Error generating curse:", error);
    res.status(500).json({
      success: false,
      error: "Failed to generate curse"
    });
  }
}
function getCurseCategoriesRoute(req, res) {
  try {
    const categories = getCurseCategories();
    res.json({
      success: true,
      categories
    });
  } catch (error) {
    console.error("Error getting curse categories:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get curse categories"
    });
  }
}
function getCurseCountRoute(req, res) {
  try {
    const { category = "random" } = req.query;
    const count = getCurseCount(category);
    res.json({
      success: true,
      category,
      count
    });
  } catch (error) {
    console.error("Error getting curse count:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get curse count"
    });
  }
}
const MAIN_CATEGORIES = {
  1: "UNNATURAL ENTITY",
  2: "HAZARD",
  3: "HAZARD",
  4: "HAZARD",
  5: "HAZARD",
  6: "HAZARD",
  7: "CREATURE",
  8: "CREATURE",
  9: "CREATURE",
  10: "CREATURE",
  11: "CREATURE",
  12: "CREATURE"
};
const UNNATURAL_ENTITY_SUBCATEGORIES = {
  1: "DIVINE",
  2: "PLANAR",
  3: "PLANAR",
  4: "PLANAR",
  5: "UNDEAD",
  6: "UNDEAD",
  7: "UNDEAD",
  8: "UNDEAD",
  9: "UNDEAD",
  10: "UNDEAD",
  11: "UNDEAD",
  12: "UNDEAD"
};
const DIVINE_ENTITIES = {
  1: "agent",
  2: "agent",
  3: "agent",
  4: "agent",
  5: "agent",
  6: "champion",
  7: "champion",
  8: "champion",
  9: "champion",
  10: "army/force",
  11: "army/force",
  12: "avatar/embodiment"
};
const PLANAR_ENTITIES = {
  1: "imp/sprite",
  2: "imp/sprite",
  3: "imp/sprite",
  4: "lesser demon/elemental",
  5: "lesser demon/elemental",
  6: "lesser demon/elemental",
  7: "demon/elemental",
  8: "demon/elemental",
  9: "demon/elemental",
  10: "greater demon/elemental",
  11: "greater demon/elemental",
  12: "devil/elemental lord"
};
const UNDEAD_ENTITIES = {
  1: "haunt/wisp",
  2: "haunt/wisp",
  3: "haunt/wisp",
  4: "haunt/wisp",
  5: "phantom/shadow",
  6: "phantom/shadow",
  7: "ghost/specter",
  8: "ghost/specter",
  9: "ghost/specter",
  10: "wight/wraith/revenant",
  11: "wight/wraith/revenant",
  12: "spirit lord/lich"
};
const HAZARD_SUBCATEGORIES = {
  1: "UNNATURAL",
  2: "UNNATURAL",
  3: "NATURAL",
  4: "NATURAL",
  5: "NATURAL",
  6: "NATURAL",
  7: "NATURAL",
  8: "NATURAL",
  9: "NATURAL",
  10: "NATURAL",
  11: "NATURAL",
  12: "NATURAL"
};
const UNNATURAL_HAZARDS = {
  1: "taint/blight/curse",
  2: "taint/blight/curse",
  3: "taint/blight/curse",
  4: "taint/blight/curse",
  5: "taint/blight/curse",
  6: "magical: unnatural + magic type [p55]",
  7: "magical: unnatural + magic type [p55]",
  8: "magical: unnatural + magic type [p55]",
  9: "magical: unnatural + magic type [p55]",
  10: "planar: natural + element [p55]",
  11: "planar: natural + element [p55]",
  12: "divine: natural + deity"
};
const NATURAL_HAZARDS = {
  1: "oddity-based [p55]",
  2: "tectonic/volcanic",
  3: "unseen pitfall (chasm, crevasse, abyss, rift)",
  4: "unseen pitfall (chasm, crevasse, abyss, rift)",
  5: "ensnaring (bog, mire, tarpit, quicksand, etc.)",
  6: "ensnaring (bog, mire, tarpit, quicksand, etc.)",
  7: "defensive (created by local creature)",
  8: "meteorological (blizzard, thunderstorm, sandstorm, etc.)",
  9: "meteorological (blizzard, thunderstorm, sandstorm, etc.)",
  10: "meteorological (blizzard, thunderstorm, sandstorm, etc.)",
  11: "seasonal (fire, flood, avalanche, etc.)",
  12: "impairing (mist, fog, murk, gloom, miasma, etc.)"
};
const CREATURE_SUBCATEGORIES = {
  1: "MONSTER",
  2: "MONSTER",
  3: "MONSTER",
  4: "MONSTER",
  5: "BEAST",
  6: "BEAST",
  7: "BEAST",
  8: "BEAST",
  9: "BEAST",
  10: "BEAST",
  11: "HUMANOID",
  12: "HUMANOID"
};
const MONSTER_SUBCATEGORIES = {
  1: "EXTRAPLANAR",
  2: "LEGENDARY",
  3: "UNDEAD",
  4: "UNDEAD",
  5: "UNDEAD",
  6: "UNUSUAL",
  7: "UNUSUAL",
  8: "BEASTLY",
  9: "BEASTLY",
  10: "WILD HUMANOID",
  11: "WILD HUMANOID",
  12: "WILD HUMANOID"
};
const EXTRAPLANAR_MONSTERS = {
  1: "divine/demonic lord",
  2: "angel/demon",
  3: "cherub/imp",
  4: "cherub/imp",
  5: "cherub/imp",
  6: "elemental [p55]",
  7: "elemental [p55]",
  8: "elemental [p55]",
  9: "elemental [p55]",
  10: "elemental [p55]",
  11: "elemental [p55]",
  12: "elemental [p55]"
};
const LEGENDARY_MONSTERS = {
  1: "huge + oddity [p55]",
  2: "dragon/giant + beast",
  3: "dragon/giant",
  4: "dragon/giant",
  5: "beast + huge",
  6: "beast + huge",
  7: "beast + huge",
  8: "beast + huge",
  9: "beast + huge",
  10: "beast + huge",
  11: "beast + huge",
  12: "beast + huge"
};
const UNDEAD_MONSTERS = {
  1: "lich/vampire/mummy",
  2: "wight/wraith",
  3: "wisp/ghost/specter",
  4: "wisp/ghost/specter",
  5: "skeleton/zombie/ghoul",
  6: "skeleton/zombie/ghoul",
  7: "skeleton/zombie/ghoul",
  8: "skeleton/zombie/ghoul",
  9: "skeleton/zombie/ghoul",
  10: "skeleton/zombie/ghoul",
  11: "skeleton/zombie/ghoul",
  12: "skeleton/zombie/ghoul"
};
const UNUSUAL_MONSTERS = {
  1: "slime/ooze/jelly",
  2: "slime/ooze/jelly",
  3: "slime/ooze/jelly",
  4: "slime/ooze/jelly",
  5: "plant/fungus/parasite",
  6: "plant/fungus/parasite",
  7: "plant/fungus/parasite",
  8: "plant/fungus/parasite",
  9: "golem/homunculus",
  10: "golem/homunculus",
  11: "fey/fairy",
  12: "fey/fairy"
};
const BEASTLY_MONSTERS = {
  1: "beast + aberrance [p54]",
  2: "beast + element [p55]",
  3: "beast + oddity [p55]",
  4: "beast + ability [p54]",
  5: "beast + ability [p54]",
  6: "beast + ability [p54]",
  7: "beast + ability [p54]",
  8: "beast + beast",
  9: "beast + beast",
  10: "beast + beast",
  11: "beast + beast",
  12: "beast + beast"
};
const WILD_HUMANOID_MONSTERS = {
  1: "ogre/troll/giant",
  2: "orc/hobgoblin/gnoll",
  3: "orc/hobgoblin/gnoll",
  4: "orc/hobgoblin/gnoll",
  5: "orc/hobgoblin/gnoll",
  6: "goblin/kobold",
  7: "goblin/kobold",
  8: "goblin/kobold",
  9: "goblin/kobold",
  10: "humanoid + oddity [p55]",
  11: "human + beast",
  12: "human + beast"
};
const BEAST_SUBCATEGORIES = {
  1: "WATER-GOING",
  2: "WATER-GOING",
  3: "AIRBORNE",
  4: "AIRBORNE",
  5: "AIRBORNE",
  6: "EARTHBOUND",
  7: "EARTHBOUND",
  8: "EARTHBOUND",
  9: "EARTHBOUND",
  10: "EARTHBOUND",
  11: "EARTHBOUND",
  12: "EARTHBOUND"
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
const HUMANOID_SUBCATEGORIES = {
  1: "RARE",
  2: "UNCOMMON",
  3: "UNCOMMON",
  4: "UNCOMMON",
  5: "UNCOMMON",
  6: "COMMON",
  7: "COMMON",
  8: "COMMON",
  9: "COMMON",
  10: "COMMON",
  11: "COMMON",
  12: "COMMON"
};
const RARE_HUMANOIDS = {
  1: "elf",
  2: "elf",
  3: "elf",
  4: "elf",
  5: "elf",
  6: "elf",
  7: "elf",
  8: "elf",
  9: "elf",
  10: "elf",
  11: "elf",
  12: "elf"
};
const UNCOMMON_HUMANOIDS = {
  1: "human + beast",
  2: "human + beast",
  3: "human + beast",
  4: "dwarf",
  5: "dwarf",
  6: "dwarf",
  7: "dwarf",
  8: "halfling",
  9: "halfling",
  10: "halfling",
  11: "halfling",
  12: "halfling"
};
const COMMON_HUMANOIDS = {
  1: "mixed",
  2: "mixed",
  3: "mixed",
  4: "human",
  5: "human",
  6: "human",
  7: "human",
  8: "human",
  9: "human",
  10: "human",
  11: "human",
  12: "human"
};
function rollD12() {
  return Math.floor(Math.random() * 12) + 1;
}
function generateSingleDanger() {
  const categoryRoll = rollD12();
  const category = MAIN_CATEGORIES[categoryRoll];
  const subcategoryRoll = rollD12();
  let subcategory;
  if (category === "UNNATURAL ENTITY") {
    subcategory = UNNATURAL_ENTITY_SUBCATEGORIES[subcategoryRoll];
  } else if (category === "HAZARD") {
    subcategory = HAZARD_SUBCATEGORIES[subcategoryRoll];
  } else {
    subcategory = CREATURE_SUBCATEGORIES[subcategoryRoll];
    if (subcategory === "MONSTER") {
      const monsterSubcategoryRoll = rollD12();
      subcategory = MONSTER_SUBCATEGORIES[monsterSubcategoryRoll];
    }
    if (subcategory === "BEAST") {
      const beastSubcategoryRoll = rollD12();
      subcategory = BEAST_SUBCATEGORIES[beastSubcategoryRoll];
    }
    if (subcategory === "HUMANOID") {
      const humanoidSubcategoryRoll = rollD12();
      subcategory = HUMANOID_SUBCATEGORIES[humanoidSubcategoryRoll];
    }
  }
  const specificRoll = rollD12();
  let specificResult;
  if (category === "UNNATURAL ENTITY") {
    if (subcategory === "DIVINE") {
      specificResult = DIVINE_ENTITIES[specificRoll];
    } else if (subcategory === "PLANAR") {
      specificResult = PLANAR_ENTITIES[specificRoll];
    } else {
      specificResult = UNDEAD_ENTITIES[specificRoll];
    }
  } else if (category === "HAZARD") {
    if (subcategory === "UNNATURAL") {
      specificResult = UNNATURAL_HAZARDS[specificRoll];
    } else {
      specificResult = NATURAL_HAZARDS[specificRoll];
    }
  } else {
    if (subcategory === "EXTRAPLANAR") {
      specificResult = EXTRAPLANAR_MONSTERS[specificRoll];
    } else if (subcategory === "LEGENDARY") {
      specificResult = LEGENDARY_MONSTERS[specificRoll];
    } else if (subcategory === "UNDEAD") {
      specificResult = UNDEAD_MONSTERS[specificRoll];
    } else if (subcategory === "UNUSUAL") {
      specificResult = UNUSUAL_MONSTERS[specificRoll];
    } else if (subcategory === "BEASTLY") {
      specificResult = BEASTLY_MONSTERS[specificRoll];
    } else if (subcategory === "WILD HUMANOID") {
      specificResult = WILD_HUMANOID_MONSTERS[specificRoll];
    } else if (subcategory === "WATER-GOING") {
      specificResult = WATER_GOING_BEASTS[specificRoll];
    } else if (subcategory === "AIRBORNE") {
      specificResult = AIRBORNE_BEASTS[specificRoll];
    } else if (subcategory === "EARTHBOUND") {
      specificResult = EARTHBOUND_BEASTS[specificRoll];
    } else if (subcategory === "RARE") {
      specificResult = RARE_HUMANOIDS[specificRoll];
    } else if (subcategory === "UNCOMMON") {
      specificResult = UNCOMMON_HUMANOIDS[specificRoll];
    } else {
      specificResult = COMMON_HUMANOIDS[specificRoll];
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
function generateDangers(numDangers = 1) {
  try {
    if (numDangers < 1 || numDangers > 10) {
      return {
        success: false,
        error: "Number of dangers must be between 1 and 10"
      };
    }
    const dangers = [];
    for (let i = 0; i < numDangers; i++) {
      dangers.push(generateSingleDanger());
    }
    return {
      success: true,
      dangers,
      count: dangers.length
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unexpected error occurred"
    };
  }
}
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY ?? ""
});
function generateDangersRoute(req, res) {
  try {
    const { numDangers = 1 } = req.body;
    if (typeof numDangers !== "number" || numDangers < 1 || numDangers > 10) {
      return res.status(400).json({
        success: false,
        error: "Number of dangers must be between 1 and 10"
      });
    }
    const result = generateDangers(numDangers);
    res.json(result);
  } catch (error) {
    console.error("Error generating dangers:", error);
    res.status(500).json({
      success: false,
      error: "Failed to generate dangers"
    });
  }
}
async function generateDangerNarrativeRoute(req, res) {
  try {
    const { danger } = req.body;
    if (!danger || !danger.category || !danger.subcategory || !danger.specificResult) {
      return res.status(400).json({
        success: false,
        error: "Invalid danger data provided"
      });
    }
    const prompt = `Create a compelling narrative description for this danger based on the three randomly generated parameters:

Category: ${danger.category}
Subcategory: ${danger.subcategory}
Specific Result: ${danger.specificResult}
Dice Rolls: ${danger.rolls.categoryRoll}, ${danger.rolls.subcategoryRoll}, ${danger.rolls.specificRoll}

Please create a detailed narrative that:
1. Combines all three parameters into a coherent, threatening scenario
2. Describes what characters would encounter, see, hear, or experience
3. Explains the immediate danger and potential consequences
4. Provides atmospheric details that help set the scene
5. Suggests how the danger might unfold or escalate
6. If any parameters seem contradictory, creatively interpret them to work together

Write this as 2-3 paragraphs that a Game Master could read aloud or use as inspiration when presenting this danger to players. Focus on vivid descriptions, immediate threats, and narrative hooks that create tension and excitement.

${getGlobalNarrativeRestrictions()}

Then, in a separate section below the description, add:

**GM Notes:** Include any tactical suggestions, potential outcomes, or ways to modify the encounter based on party level and composition.`;
    const response = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 1e3,
      messages: [{
        role: "user",
        content: prompt
      }]
    });
    const narrative = response.content[0].type === "text" ? response.content[0].text : "Failed to generate narrative";
    res.json({
      success: true,
      narrative
    });
  } catch (error) {
    console.error("Error generating danger narrative:", error);
    res.status(500).json({
      success: false,
      error: "Failed to generate danger narrative"
    });
  }
}
function createServer() {
  const app2 = express__default();
  app2.use(cors());
  app2.use(express__default.json());
  app2.use(express__default.urlencoded({ extended: true }));
  app2.get("/api/ping", (_req, res) => {
    res.json({ message: "Hello from Express server v2!" });
  });
  app2.get("/api/demo", handleDemo);
  app2.post("/api/ai-chat", handleAIChat);
  app2.post("/api/generate-adventure", generateAdventure);
  app2.post("/api/generate-scene", generateScene);
  app2.post("/api/roll-fate", rollFateChart);
  app2.post("/api/roll-meaning", rollMeaningTable);
  app2.post("/api/roll-descriptor", rollDescriptorTable);
  app2.post("/api/get-session-data", getSessionData);
  app2.get("/api/creature-types", getCreatureTypes);
  app2.post("/api/generate-hex-map", generateHexMapEndpoint);
  app2.get("/api/hex-map-terrains", getHexMapTerrains);
  app2.get("/api/test-hex-map", testHexMap);
  app2.post("/api/generate-npc", generateCompleteNPC);
  app2.post("/api/generate-npc-step", generateNPCStepRoute);
  app2.post("/api/generate-npc-narrative", generateNPCNarrative);
  app2.post("/api/generate-steading", generateCompleteSteading);
  app2.post("/api/generate-steading-step", generateSteadingStepRoute);
  app2.post("/api/generate-steading-narrative", generateSteadingNarrative);
  app2.get("/api/settlement-types", getSettlementTypes);
  app2.post("/api/villain-generator", villainGenerator);
  app2.post("/api/generate-names", generateNamesRoute);
  app2.get("/api/alignment-options", getAlignmentOptionsRoute);
  app2.post("/api/generate-curses", generateCursesRoute);
  app2.get("/api/curse-count", getCurseCountRoute);
  app2.get("/api/curse-categories", getCurseCategoriesRoute);
  app2.post("/api/generate-dangers", generateDangersRoute);
  app2.post("/api/generate-danger-narrative", generateDangerNarrativeRoute);
  return app2;
}
const app = createServer();
const port = process.env.PORT || 3e3;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.join(__dirname, "../spa");
app.use(express.static(distPath));
app.get("*", (req, res) => {
  if (req.path.startsWith("/api/") || req.path.startsWith("/health")) {
    return res.status(404).json({ error: "API endpoint not found" });
  }
  res.sendFile(path.join(distPath, "index.html"));
});
app.listen(port, () => {
  console.log(`🚀 Fusion Starter server running on port ${port}`);
  console.log(`📱 Frontend: http://localhost:${port}`);
  console.log(`🔧 API: http://localhost:${port}/api`);
});
process.on("SIGTERM", () => {
  console.log("🛑 Received SIGTERM, shutting down gracefully");
  process.exit(0);
});
process.on("SIGINT", () => {
  console.log("🛑 Received SIGINT, shutting down gracefully");
  process.exit(0);
});
