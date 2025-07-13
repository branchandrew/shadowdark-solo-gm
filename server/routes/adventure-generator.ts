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
  tarot_spread: {
    seed: string;
    background: string;
    location: string;
    why_protect: string;
    how_protect: string;
    reward: string;
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

--- HIDDEN REASONING STEPS (do not expose) ---
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


7. **Generate exactly 2 Lieutenants** with the following requirements:

    7.1 Use these randomly selected creature types for the Lieutenants:
    Lieutenant 1: ${lieutenantTypesResult.lieutenant_types?.[0] || "Human"}
    Lieutenant 2: ${lieutenantTypesResult.lieutenant_types?.[1] || "Elf"}

   7.2 Identify one important feature or aspect of the BBEG (one different for each Lieutenant) and make the lieutenant the opposite. Examples:
    BBEG is hideous creature > Lieutenant is a gorgeous elf or fairy
    BBEG is a male > Lieutenant is a female
    BBEG leads hordes of creatures > Lieutenant acts alone.

    7.3
     - Create a name that fits the theme
     - Use the SAME tarot cards provided for the BBEG, but interpret them differently, in this order:
       * Seed: What defines their core nature?
       * Background: What is their origin story?
       * Location (Occupation): What is the Lieutenant's occupation?
       * Why Protect: What motivates their loyalty to the BBEG?
       * How Protect: What methods do they use to serve/protect the BBEG?
       * Reward: What do characters gain by defeating them?
     - Keep each tarot interpretation to 1-2 sentences
9. **Create the Faction** which most aligns with the BBEG. It should reinforce the tone and theme of the adventure. Answer the following questions about it to create its details:
   • The faction should align to at least one of the two Lieutenants. Which one? And why?
   • Is the faction loyal to the BBEG or do their motives just happen to align with it?
   • What sort of domain or territory does the faction control?
   • Provide a faction name and 2-3 sentence description that captures their nature, goals, and relationship to the BBEG
10. **Define Common Minions** - Create a creature type that serves as the most likely minions for this BBEG that PCs will fight many of on their pathway toward defeating Lieutenants and the BBEG. This should be:
   • A creature type that fits thematically with the BBEG and theme
   • Common enough to be encountered frequently
   • Challenging but not overwhelming for regular encounters
   • Reflect the BBEG's influence and corruption
   • 2-3 sentences describing their nature, appearance, and capabilities

--- OUTPUT ---
Return one clean JSON object and nothing else.  Keep values concise:
• "bbeg_name" – the chosen name (title optional)
• "name_reasoning" – brief explanation of why this name was chosen from the options
• "bbeg_hook" – the single sentence hook
• "bbeg_motivation" – one concise sentence
• "bbeg_detailed_description" – 3‑4 vivid sentences
• "clues" – array of exactly 8 strings, each a different type of clue
• "high_tower_surprise" ��� the major plot twist (2-3 sentences)
• "lieutenants" – array of 1-3 lieutenant objects, each with name and tarot_spread
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
      "tarot_spread": {
        "seed": "",
        "background": "",
        "location": "",
        "why_protect": "",
        "how_protect": "",
        "reward": ""
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
          npcs: Omit<NPC, "session_id">[];
          factions: Omit<Faction, "session_id">[];
          threads: Omit<Thread, "session_id">[];
          clues: Omit<Clue, "session_id">[];
        } = {
          npcs: [],
          factions: [],
          threads: [],
          clues: [],
        };

        // Add BBEG as hidden NPC
        hiddenElements.npcs.push({
          id: `npc_${Date.now()}_bbeg`,
          adventure_arc_id: adventureArcId,
          name: villain.bbeg_name,
          description: `${villain.bbeg_detailed_description}\n\nMotivation: ${villain.bbeg_motivation}`,
          disposition: "hostile",
          role: "bbeg",
          hidden: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

        // Add lieutenants as hidden NPCs
        villain.lieutenants?.forEach((lieutenant, index) => {
          hiddenElements.npcs.push({
            id: `npc_${Date.now()}_lt_${index}`,
            adventure_arc_id: adventureArcId,
            name: lieutenant.name,
            description: `Lieutenant of ${villain.bbeg_name}. ${lieutenant.tarot_spread.background}`,
            disposition: "hostile",
            role: "lieutenant",
            tarot_spread: lieutenant.tarot_spread,
            hidden: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
        });

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

    // Always return campaign elements in response (regardless of database availability)
    const campaignElements = {
      threads: [],
      creatures: [
        // Add BBEG as creature
        {
          id: `creature_${Date.now()}_bbeg`,
          session_id: session_id || "local",
          name: villain.bbeg_name,
          description: villain.bbeg_detailed_description,
          creature_type: "bbeg",
          npc_disposition: "hostile",
          hidden: true,
          bbeg_motivation: villain.bbeg_motivation,
          bbeg_hook: villain.bbeg_hook,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        // Add lieutenants as creatures
        ...(villain.lieutenants?.map((lieutenant, index) => ({
          id: `creature_${Date.now()}_lt_${index}`,
          session_id: session_id || "local",
          name: lieutenant.name,
          description: `Lieutenant of ${villain.bbeg_name}. ${lieutenant.tarot_spread.background}`,
          creature_type: "lieutenant",
          npc_disposition: "hostile",
          hidden: true,
          lieutenant_tarot_seed: lieutenant.tarot_spread.seed,
          lieutenant_tarot_background: lieutenant.tarot_spread.background,
          lieutenant_tarot_location: lieutenant.tarot_spread.location,
          lieutenant_tarot_why_protect: lieutenant.tarot_spread.why_protect,
          lieutenant_tarot_how_protect: lieutenant.tarot_spread.how_protect,
          lieutenant_tarot_reward: lieutenant.tarot_spread.reward,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })) || []),
      ],
      factions: villain.faction_name
        ? [
            {
              id: `faction_${Date.now()}`,
              session_id: session_id || "local",
              name: villain.faction_name,
              description: villain.faction_description || "",
              influence: "moderate",
              relationship: "opposed",
              hidden: true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          ]
        : [],
      clues:
        villain.clues?.map((clue, index) => ({
          id: `clue_${Date.now()}_${index}`,
          session_id: session_id || "local",
          description: clue,
          discovered: false,
          importance: "moderate",
          hidden: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })) || [],
    };

    console.log("Returning campaign elements:", campaignElements);

    res.json({
      ...villain,
      success: true,
      campaign_elements: campaignElements,
    });
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
