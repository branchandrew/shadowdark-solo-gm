import { RequestHandler } from "express";
import Anthropic from "@anthropic-ai/sdk";
import { spawn } from "child_process";
import path from "path";
import fs from "fs";
import { relationalDB } from "../lib/relational-database";
import type {
  AdventureGenerationRequest,
  AdventureGenerationResponse,
  NPC,
  Creature,
  Faction,
  Thread,
  Clue,
} from "../../shared/types";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY ?? "",
});

interface TarotCard {
  position: string;
  card_text: string;
}

interface PythonResult {
  goal: string;
  gender: string;
  race: string;
  cards: TarotCard[];
}

interface Lieutenant {
  name: string;
  description?: string; // Comprehensive description from AI
  minions?: string; // What minions they command (if any)
  tarot_spread: {
    seed: string;
    background: string;
    location: string;
    why_protect: string;
    how_protect: string;
    ability: string;
  };
}

interface VillainJson {
  bbeg_name: string;
  name_reasoning?: string;
  bbeg_hook: string;
  bbeg_motivation: string;
  bbeg_detailed_description: string;
  clues: string[];
  high_tower_surprise: string;
  lieutenants: Lieutenant[];
  faction_name: string;
  faction_description: string;
  minions: string;
}

/**
 * Executes the Python helper script and returns its JSON payload.
 */
const runPython = (scriptPath: string): Promise<PythonResult> =>
  new Promise((resolve, reject) => {
    const proc = spawn("python3", [scriptPath]);

    let stdout = "";
    let stderr = "";

    proc.stdout.on("data", (d) => (stdout += d));
    proc.stderr.on("data", (d) => (stderr += d));

    proc.on("close", (code) => {
      if (code !== 0)
        return reject(new Error(stderr || `Python exited with ${code}`));
      try {
        resolve(JSON.parse(stdout.trim()));
      } catch {
        reject(new Error("Invalid JSON from Python script"));
      }
    });
  });

/**
 * Generates names using the Python name generation script
 */
const generateNames = (
  alignment: number,
  numNames: number,
): Promise<{ success: boolean; names?: string[]; error?: string }> =>
  new Promise((resolve, reject) => {
    const scriptPath = path.join(
      process.cwd(),
      "server",
      "scripts",
      "generate_name.py",
    );

    console.log(
      `Executing Python script: python3 ${scriptPath} ${alignment} ${numNames}`,
    );
    console.log(`Script path exists: ${fs.existsSync(scriptPath)}`);

    const proc = spawn("python3", [
      scriptPath,
      alignment.toString(),
      numNames.toString(),
    ]);

    let stdout = "";
    let stderr = "";

    proc.stdout.on("data", (d) => (stdout += d));
    proc.stderr.on("data", (d) => (stderr += d));

    proc.on("close", (code) => {
      console.log(`Python script exited with code: ${code}`);
      console.log(`Python script stdout: ${stdout}`);
      console.log(`Python script stderr: ${stderr}`);

      if (code !== 0) {
        return reject(
          new Error(
            `Name generation script failed: ${stderr || `exited with code ${code}`}`,
          ),
        );
      }
      try {
        const result = JSON.parse(stdout.trim());
        resolve(result);
      } catch {
        reject(new Error("Invalid JSON from name generation script"));
      }
    });
  });

/**
 * Gets random lieutenant types from the Python adventure generator script
 */
const getLieutenantTypes = (
  count: number = 2,
): Promise<{ success: boolean; lieutenant_types?: string[]; error?: string }> =>
  new Promise((resolve, reject) => {
    const scriptPath = path.join(
      __dirname,
      "..",
      "scripts",
      "adventure_generator.py",
    );

    console.log(
      `Getting lieutenant types: python3 ${scriptPath} lieutenant_types ${count}`,
    );

    const proc = spawn("python3", [
      scriptPath,
      "lieutenant_types",
      count.toString(),
    ]);

    let stdout = "";
    let stderr = "";

    proc.stdout.on("data", (d) => (stdout += d));
    proc.stderr.on("data", (d) => (stderr += d));

    proc.on("close", (code) => {
      console.log(`Lieutenant types script exited with code: ${code}`);
      console.log(`Lieutenant types stdout: ${stdout}`);
      console.log(`Lieutenant types stderr: ${stderr}`);

      if (code !== 0) {
        return reject(
          new Error(
            `Lieutenant types script failed: ${stderr || `exited with code ${code}`}`,
          ),
        );
      }
      try {
        const result = JSON.parse(stdout.trim());
        resolve(result);
      } catch {
        reject(new Error("Invalid JSON from lieutenant types script"));
      }
    });
  });

/**
 * Cache for creature types to avoid repeated Python calls
 */
let cachedCreatureTypes: string[] | null = null;

/**
 * Gets creature types from Python script (with caching)
 */
const getCreatureTypes = async (): Promise<string[]> => {
  if (cachedCreatureTypes) {
    return cachedCreatureTypes;
  }

  try {
    const scriptPath = path.join(
      __dirname,
      "..",
      "scripts",
      "adventure_generator.py",
    );

    const proc = spawn("python3", [scriptPath, "get_villain_types"]);

    let stdout = "";
    let stderr = "";

    await new Promise<void>((resolve, reject) => {
      proc.stdout.on("data", (d) => (stdout += d));
      proc.stderr.on("data", (d) => (stderr += d));

      proc.on("close", (code) => {
        if (code !== 0) {
          return reject(
            new Error(`Script failed: ${stderr || `exited with code ${code}`}`),
          );
        }
        resolve();
      });
    });

    const result = JSON.parse(stdout.trim());
    cachedCreatureTypes = result.villain_types || [];
    return cachedCreatureTypes;
  } catch (error) {
    console.warn(
      "Failed to get creature types from Python, using fallback:",
      error,
    );
    // Fallback types
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
      "Monstrosity",
    ];
    return cachedCreatureTypes;
  }
};

/**
 * Extracts race/species from a description text using creature types from Python
 */
const extractRaceFromDescription = async (
  description: string,
): Promise<string | null> => {
  const creatureTypes = await getCreatureTypes();
  const lowerDescription = description.toLowerCase();

  // Look for explicit race mentions
  for (const race of creatureTypes) {
    if (lowerDescription.includes(race.toLowerCase())) {
      return race;
    }
  }

  // Look for common descriptive terms that indicate race
  if (
    lowerDescription.includes("squire") ||
    lowerDescription.includes("knight") ||
    lowerDescription.includes("soldier")
  ) {
    return "Human";
  }
  if (
    lowerDescription.includes("frost") ||
    lowerDescription.includes("ice") ||
    lowerDescription.includes("cold")
  ) {
    return "Elemental";
  }
  if (
    lowerDescription.includes("shadow") ||
    lowerDescription.includes("dark") ||
    lowerDescription.includes("soul")
  ) {
    return "Undead";
  }
  if (
    lowerDescription.includes("trader") ||
    lowerDescription.includes("merchant") ||
    lowerDescription.includes("crystal")
  ) {
    return "Human";
  }

  return null;
};

/**
 * Standardizes minion descriptions by comparing with official creature types
 */
const standardizeMinions = (
  minions: string,
  creatureTypes: string[],
): string => {
  if (!minions || !minions.trim()) {
    return minions;
  }

  const lowerMinions = minions.toLowerCase();

  // Check for exact or close matches with official creature types
  for (const creatureType of creatureTypes) {
    const lowerType = creatureType.toLowerCase();

    // Check for exact type name mention
    if (lowerMinions.includes(lowerType)) {
      // Check if it's a generic description that can be replaced
      if (isGenericDescription(minions, creatureType)) {
        console.log(
          `Replacing generic minion description with official type: ${creatureType}`,
        );
        return creatureType;
      }
    }
  }

  // Check for common synonyms and patterns
  const typeMapping: Record<string, string> = {
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
    "tiny creatures": "Goblin",
  };

  for (const [pattern, replacement] of Object.entries(typeMapping)) {
    if (lowerMinions.includes(pattern)) {
      // Only replace if the creature type exists in our official list
      if (creatureTypes.includes(replacement)) {
        console.log(
          `Replacing "${pattern}" with official type: ${replacement}`,
        );
        return replacement;
      }
    }
  }

  // Keep original creative description if no good match found
  return minions;
};

/**
 * Checks if a minion description is generic enough to be replaced with an official type
 */
const isGenericDescription = (
  description: string,
  officialType: string,
): boolean => {
  const lowerDesc = description.toLowerCase();
  const lowerType = officialType.toLowerCase();

  // If the description is mostly just describing the creature type without much detail
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
    `dark ${lowerType}`,
  ];

  for (const pattern of simplePatterns) {
    if (lowerDesc.includes(pattern) && description.length < 100) {
      return true;
    }
  }

  return false;
};

/**
 * Creates a comprehensive lieutenant description combining all tarot elements
 */
const createLieutenantDescription = (
  lieutenant: Lieutenant,
  race: string,
  bbegName: string,
  factionName?: string,
): string => {
  const tarot = lieutenant.tarot_spread;

  // Build description parts
  const parts = [
    `${race} lieutenant serving ${bbegName}.`,
    `Core Nature: ${tarot.seed}`,
    `Background: ${tarot.background}`,
    `Occupation: ${tarot.location}`,
    `Loyalty: ${tarot.why_protect}`,
    `Methods: ${tarot.how_protect}`,
    `Special Ability: ${tarot.ability}`,
  ];

  // Add faction relationship if it exists
  if (factionName && factionName.trim()) {
    parts.push(`Connected to ${factionName}.`);
  }

  return parts.join(" ");
};

/**
 * Express handler: creates a concise BBEG JSON object.
 */
export const generateAdventure: RequestHandler = async (req, res) => {
  try {
    /* ---------- 1. Seed data from Python ---------- */
    const pythonPath = path.join(
      __dirname,
      "..",
      "scripts",
      "adventure_generator.py",
    );
    const seeds = await runPython(pythonPath);

    const {
      theme = "Dark Fantasy",
      tone = "Mysterious",
      voice = "Atmospheric",
      session_id,
    } = req.body || {};
    console.log("Adventure generation with style:", { theme, tone, voice });
    console.log("Session ID:", session_id);

    const cardsFormatted = seeds.cards
      .map((c) => `${c.position}: ${c.card_text}`)
      .join("\n");

    /* ---------- 2. Claude call ---------- */
    /* ---------- 2. Generate names using Python script ---------- */
    console.log("Generating names for BBEG...");

    // Ask AI to determine BBEG's public persona for name generation
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

    const personaResponse = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 150,
      messages: [{ role: "user", content: personaPrompt }],
    });

    let alignment = 1;
    let alignmentReasoning = "Default to evil appearance";

    const rawPersonaResponse = personaResponse.content[0].text?.trim() || "";
    console.log("Raw persona response:", rawPersonaResponse);

    try {
      const personaData = JSON.parse(rawPersonaResponse);
      alignment = parseInt(personaData.alignment) || 1;
      alignmentReasoning = personaData.reasoning || "No reasoning provided";
      console.log("Parsed persona data successfully:", personaData);
    } catch (e) {
      console.log("JSON parsing failed, trying fallback...");
      // Fallback if JSON parsing fails - try to extract just a number
      const numberMatch = rawPersonaResponse.match(/\d+/);
      alignment = numberMatch ? parseInt(numberMatch[0]) : 1;
      console.log("Fallback alignment:", alignment);
    }

    // Ensure alignment is valid (1-4)
    if (isNaN(alignment) || alignment < 1 || alignment > 4) {
      console.log("Invalid alignment detected, defaulting to 1");
      alignment = 1;
    }

    console.log(`\n=== ALIGNMENT CHOICE ===`);
    console.log(`AI determined public persona alignment: ${alignment}`);
    console.log(`Reasoning: ${alignmentReasoning}`);
    console.log(`========================\n`);

    const nameResult = await generateNames(alignment, 6);
    if (!nameResult.success) {
      throw new Error(`Name generation failed: ${nameResult.error}`);
    }

    console.log("Generated names:", nameResult.names);

    /* ---------- 2.5. Generate lieutenant types ---------- */
    console.log("Getting random lieutenant types...");

    const lieutenantTypesResult = await getLieutenantTypes(2);
    if (!lieutenantTypesResult.success) {
      throw new Error(
        `Lieutenant types generation failed: ${lieutenantTypesResult.error}`,
      );
    }

    console.log(
      "Generated lieutenant types:",
      lieutenantTypesResult.lieutenant_types,
    );

    /* ---------- 3. Claude call ---------- */
    const userPrompt =
      `You are a narrative��design assistant tasked with forging a memorable Big Bad Evil Guy (BBEG) for a TTRPG campaign.  Work through the hidden reasoning steps below, **but reveal ONLY the JSON object requested in the Output section.**

### STYLE GUIDANCE
Theme: ${theme}
Tone: ${tone}
Voice: ${voice}

**IMPORTANT: All content must reflect the specified theme, tone, and voice. Let these guide every aspect of the BBEG's design, from their motivation to their methods to their presentation.**

### SOURCE DATA
Goal: ${seeds.goal}
Gender: ${seeds.gender}
Race: ${seeds.race}
Tarot Spread:\n${cardsFormatted}

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
   Generated Names: ${nameResult.names?.join(", ")}

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

7.5. **Standardize Minions** - Review your minion description from step 7 and compare it with these official Shadowdark creature types: ${(await getCreatureTypes()).join(", ")}
   • If your minion description closely matches any of these official types (e.g., you described "undead soldiers" and "Skeleton" is in the list), replace your description with the official type name
   • If your description is similar but more specific (e.g., "frost-touched zombies" vs "Zombie"), keep your creative description
   • If nothing in the official list is close to what you created, keep your original creative description
   • The goal is to use official types when they fit, but preserve unique creative minions when they don't
   • Simply state the final minion type/description you're using

8. **Generate exactly 2 Lieutenants** with the following requirements:

    8.1 Use these randomly selected creature types for the Lieutenants:
    Lieutenant 1: ${lieutenantTypesResult.lieutenant_types?.[0] || "Human"}
    Lieutenant 2: ${lieutenantTypesResult.lieutenant_types?.[1] || "Elf"}

   8.2 Identify one important feature or aspect of the BBEG (one different for each Lieutenant) and make the lieutenant the opposite. Examples:
    BBEG is hideous creature and is female > First Lieutenant is a gorgeous elf or fairy, Second Lieutenant is male
    BBEG is a male > Lieutenant is a female
    BBEG leads hordes of creatures > Lieutenant acts alone.

    8.3 Use the SAME tarot cards provided for the BBEG, but interpret each of the two Lieutenants differently. To do this, take the 6 tarot cards from the BBEG and re-order them randomly. Then answer the following questions with this new order, using the Tarot cards:
       * Seed: What defines their core nature?
       * Background: What is their origin story?
       * Location (Occupation): What is the Lieutenant's occupation?
       * Why Protect: What motivates their loyalty to the BBEG?
       * How Protect: What methods do they use to serve/protect the BBEG?
       * Ability: What unique ability, skill, power, or weapon does this lieutenant have that makes it unique?

     Keep each tarot interpretation to 1-2 sentences. Do this TWICE, once for each lieutenant.

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
   • The faction should align to at least one of the two Lieutenants. Which one? And why?
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

    const messages = [{ role: "user" as const, content: userPrompt }];

    console.log("Making Claude API call with messages:", messages.length);
    console.log(
      "First message content preview:",
      messages[0].content.substring(0, 100),
    );

    const ai = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      system: "Return only the JSON object requested.",
      max_tokens: 1200,
      temperature: 0.5,
      messages,
    });

    console.log("Claude API response structure:", {
      id: ai.id,
      type: ai.type,
      role: ai.role,
      model: ai.model,
      contentLength: ai.content?.length,
      stopReason: ai.stop_reason,
      usage: ai.usage,
    });

    console.log("Claude response received");
    console.log("Content array length:", ai.content?.length);
    console.log("First content type:", ai.content?.[0]?.type);

    const rawText = ai.content?.[0]?.type === "text" ? ai.content[0].text : "";
    console.log("Raw response:", rawText.substring(0, 200));

    if (!rawText) {
      throw new Error("No text content received from Claude");
    }

    // Clean up the response to extract just the JSON
    let jsonText = rawText.trim();

    // Find JSON object in the response
    const jsonStart = jsonText.indexOf("{");
    const jsonEnd = jsonText.lastIndexOf("}");

    if (jsonStart >= 0 && jsonEnd > jsonStart) {
      jsonText = jsonText.substring(jsonStart, jsonEnd + 1);
    }

    console.log("Extracted JSON:", jsonText);

    let villain: VillainJson;
    try {
      villain = JSON.parse(jsonText);
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      console.error("Raw text that failed to parse:", jsonText);
      throw new Error(`Failed to parse Claude response as JSON: ${parseError}`);
    }

    console.log("Parsed villain:", villain);

    // Standardize minions by comparing with official creature types
    const creatureTypes = await getCreatureTypes();
    const originalMinions = villain.minions;
    villain.minions = standardizeMinions(villain.minions, creatureTypes);

    if (originalMinions !== villain.minions) {
      console.log(`\n=== MINION STANDARDIZATION ===`);
      console.log(`Original: ${originalMinions}`);
      console.log(`Standardized: ${villain.minions}`);
      console.log(`===============================\n`);
    }

    // Output name reasoning to console
    console.log(`\n=== NAME SELECTION ===`);
    console.log(`Available names were: ${nameResult.names?.join(", ")}`);
    console.log(`AI chose: ${villain.bbeg_name}`);
    console.log(
      `Reasoning: ${villain.name_reasoning || "No reasoning provided"}`,
    );
    console.log(`=======================\n`);

    /* ---------- 3. Response ---------- */
    // Write to database if session_id provided and database is available
    if (session_id && relationalDB.isAvailable()) {
      console.log("Writing adventure arc to database...");

      // Create adventure arc
      const adventureArcId = await relationalDB.writeAdventureArc(session_id, {
        bbeg_name: villain.bbeg_name,
        bbeg_description: villain.bbeg_detailed_description,
        bbeg_motivation: villain.bbeg_motivation,
        bbeg_hook: villain.bbeg_hook,
        high_tower_surprise: villain.high_tower_surprise || "",
        // TODO: Link to minion monster when monster system is implemented
      });

      if (adventureArcId) {
        // Create hidden campaign elements
        const hiddenElements: {
          creatures: Omit<Creature, "session_id">[];
          factions: Omit<Faction, "session_id">[];
          threads: Omit<Thread, "session_id">[];
          clues: Omit<Clue, "session_id">[];
        } = {
          creatures: [],
          factions: [],
          threads: [],
          clues: [],
        };

        // Add BBEG as hidden creature
        const bbegId = `creature_${Date.now()}_bbeg`;
        hiddenElements.creatures.push({
          id: bbegId,
          name: villain.bbeg_name,
          race_species: seeds.race,
          description: villain.bbeg_detailed_description,
          creature_type: "bbeg",
          npc_disposition: "hostile",
          hidden: true,
          bbeg_motivation: villain.bbeg_motivation,
          bbeg_hook: villain.bbeg_hook,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

        // Add BBEG minions as creatures if they exist
        if (villain.minions && villain.minions.trim()) {
          // Extract race from minions description or default to a generic type
          const minionsRace =
            (await extractRaceFromDescription(villain.minions)) || "Monster";

          hiddenElements.creatures.push({
            id: `creature_${Date.now()}_bbeg_minion`,
            name: "BBEG Minions",
            race_species: minionsRace,
            description: villain.minions,
            creature_type: "monster",
            npc_disposition: "hostile",
            hidden: true,
            is_minion: true,
            minion_creature_id: bbegId,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
        }

        // Add lieutenants as hidden creatures and create their minions
        for (
          let index = 0;
          index < (villain.lieutenants || []).length;
          index++
        ) {
          const lieutenant = villain.lieutenants![index];
          const lieutenantId = `creature_${Date.now()}_lt_${index}`;
          // Get the lieutenant type from the generated types
          const lieutenantType =
            lieutenantTypesResult.types?.[index] || "Monster";

          // Use AI-provided description or create fallback
          const description =
            lieutenant.description ||
            createLieutenantDescription(
              lieutenant,
              lieutenantType,
              villain.bbeg_name,
              villain.faction_name,
            );

          hiddenElements.creatures.push({
            id: lieutenantId,
            name: lieutenant.name,
            race_species: lieutenantType,
            description: description,
            creature_type: "lieutenant",
            npc_disposition: "hostile",
            hidden: true,
            lieutenant_seed: lieutenant.tarot_spread.seed,
            lieutenant_background: lieutenant.tarot_spread.background,
            lieutenant_occupation: lieutenant.tarot_spread.location,
            lieutenant_why_protect: lieutenant.tarot_spread.why_protect,
            lieutenant_how_protect: lieutenant.tarot_spread.how_protect,
            lieutenant_tarot_ability: lieutenant.tarot_spread.ability,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });

          // Create lieutenant minions if specified
          if (lieutenant.minions && lieutenant.minions.trim()) {
            const lieutenantMinionsRace =
              (await extractRaceFromDescription(lieutenant.minions)) ||
              "Monster";

            hiddenElements.creatures.push({
              id: `creature_${Date.now()}_lt_${index}_minion`,
              name: `${lieutenant.name}'s Minions`,
              race_species: lieutenantMinionsRace,
              description: lieutenant.minions,
              creature_type: "monster",
              npc_disposition: "hostile",
              hidden: true,
              is_minion: true,
              minion_creature_id: lieutenantId,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            });
          }
        }

        // Add faction as hidden faction
        if (villain.faction_name) {
          hiddenElements.factions.push({
            id: `faction_${Date.now()}`,
            adventure_arc_id: adventureArcId,
            name: villain.faction_name,
            description: villain.faction_description || "",
            influence: "moderate",
            relationship: "opposed",
            hidden: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
        }

        // Add clues as hidden clues
        villain.clues?.forEach((clue, index) => {
          hiddenElements.clues.push({
            id: `clue_${Date.now()}_${index}`,
            adventure_arc_id: adventureArcId,
            description: clue,
            discovered: false,
            importance: "moderate",
            hidden: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
        });

        // Write all hidden elements to database
        await relationalDB.addHiddenCampaignElements(
          session_id,
          adventureArcId,
          hiddenElements,
        );
        console.log("Adventure data written to database successfully");
      }
    }

    // Write adventure arc to database for real-time updates
    if (relationalDB.supabase) {
      try {
        await relationalDB.writeAdventureArcToSession(session_id, {
          adventure_arc: {
            bbeg: {
              name: villain.bbeg_name,
              description: villain.bbeg_detailed_description,
              motivation: villain.bbeg_motivation,
              hook: villain.bbeg_hook,
            },
            clues: villain.clues || [],
            highTowerSurprise: villain.high_tower_surprise || "",
            lieutenants: villain.lieutenants || [],
            faction: {
              name: villain.faction_name || "",
              description: villain.faction_description || "",
            },
            minions: villain.minions || "",
          },
          campaign_elements: {
            threads: [],
            creatures: hiddenElements.creatures,
            factions: hiddenElements.factions,
            clues: hiddenElements.clues,
          },
        });
        console.log("Adventure arc written to database successfully");

        // Simple success response when database is available
        res.json({ success: true });
      } catch (error) {
        console.error("Failed to write adventure arc to database:", error);
        // Fall back to returning data if database write fails
        res.json({
          ...villain,
          race: seeds.race,
          lieutenant_types: lieutenantTypesResult.types,
          success: true,
          fallback: true,
          message: "Database unavailable, returning data directly",
        });
      }
    } else {
      console.log("Database not available - returning data directly");
      // Fall back to returning data when no database
      res.json({
        ...villain,
        race: seeds.race,
        lieutenant_types: lieutenantTypesResult.types,
        success: true,
        fallback: true,
        message: "Database not configured, returning data directly",
      });
    }
  } catch (err) {
    console.error("Adventure generation error:", err);

    // Provide more specific error messages based on error type
    let errorMessage = "Unknown error occurred";
    let statusCode = 500;

    if (err instanceof Error) {
      errorMessage = err.message;

      // Handle specific API errors
      if (errorMessage.includes("529") || errorMessage.includes("overloaded")) {
        errorMessage =
          "Claude API is currently overloaded. Please try again in a few moments.";
        statusCode = 503; // Service Unavailable
      } else if (
        errorMessage.includes("401") ||
        errorMessage.includes("authentication")
      ) {
        errorMessage = "API authentication failed. Please check configuration.";
        statusCode = 401;
      } else if (
        errorMessage.includes("rate limit") ||
        errorMessage.includes("429")
      ) {
        errorMessage = "Rate limit exceeded. Please wait before trying again.";
        statusCode = 429;
      } else if (errorMessage.includes("Invalid JSON")) {
        errorMessage = "Failed to parse AI response. Please try again.";
        statusCode = 502; // Bad Gateway
      } else if (errorMessage.includes("Python exited")) {
        errorMessage = "Adventure seed generation failed. Please try again.";
        statusCode = 502;
      }
    }

    res.status(statusCode).json({
      success: false,
      error: errorMessage,
      retryable: statusCode === 503 || statusCode === 429,
    });
  }
};
