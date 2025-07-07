import { RequestHandler } from "express";
import Anthropic from "@anthropic-ai/sdk";
import { spawn } from "child_process";
import path from "path";
import { serverDB } from "../lib/database";
import type {
  AdventureGenerationRequest,
  AdventureGenerationResponse,
  AdventureArc,
  Thread,
  CampaignCharacter,
  Faction,
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
   • Numbers — Ace‑4: beginnings; 5‑7: struggle; 8‑10: climax; Court: Page(scout), Knight(enforcer), Queen(strategist), King(ruler).
   • Reversed indicates blockage, secrecy, or excess.
2. **Draft villain profile** (≈ 4 sentences): striking visual, core motivation, virtue‑vice contradiction, primary resource/lieutenant, hidden weakness, worst‑case future.
4. **Forge a compelling name** that embodies the style guidance
   • Capture core mood, element/domain, and cultural flavor within the specified theme.  • Build a phonetic palette (2‑3 consonant clusters, 1‑2 vowel sounds) that fits mood and tone.  • Select/construct a syllable template (e.g. CVC‑CVC) and blend morphemes to yield pronounceable candidates.  • Apply quality rules (pronounceability, tone match, distinctiveness).  • Choose the best.
5. **Write a one‑sentence adventure hook** for the GM to read aloud, using the specified voice.
6. **Generate 8 investigative clues** that heroes might discover about this BBEG. These should include:
   • Clues pointing to the BBEG as the source of evil
   • Hints about potential weaknesses or vulnerabilities
   • Information about where the BBEG might be found or operates
   • Evidence of the BBEG's evil doings
   Make these diverse: rumors from NPCs, journal entries, prophecies/portents, signs in nature, direct physical evidence, etc. All clues must reflect the theme, tone, and voice.
7. **Generate a High Tower Surprise** — a twist that escalates danger during the final confrontation of the campaign. This is a key narrative reversal or complication that alters the expected outcome at the climax.

Follow these steps using Mythic GME rules:

1. Ask a Complex Fate Question:
   "What unexpected event or revelation occurs during the final confrontation with the BBEG?"

2. Roll for:
   - Chaos Factor (current value)
   - Scene Setup: is this scene expected, altered, or interrupted?
   - Event Focus + Meaning Table (if scene is altered or interrupted)

3. Interpret the result as a surprising, thematic escalation:
   - A new enemy appears?
   - A ritual completes accidentally?
   - The BBEG transforms or reveals a hidden agenda?
   - An ally betrays the party?
   - The location becomes unstable or cursed?

4. Show your reasoning:
   - Fate Question logic
   - Chaos roll
   - Scene setup determination
   - Event Focus and Meaning rolls
   - Justification for how this surprise fits with the BBEG's long-term arc

5. Return the final result as a one-paragraph narrative twist to insert during the final battle
8. **Generate exactly 2 Lieutenants** with the following requirements:
   • **First Lieutenant**: Must be a massive contrast to the BBEG - an unlikely ally who serves them despite being fundamentally different in nature, methods, or motivation
   • **Second Lieutenant**: May be similar to the BBEG or may also contrast - your choice based on what makes the most interesting dynamic
   • For each lieutenant:
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
• "bbeg_name" �� the chosen name (title optional)
• "bbeg_hook" – the single sentence hook
• "bbeg_motivation" – one concise sentence
• "bbeg_detailed_description" – 3‑4 vivid sentences
• "clues" – array of exactly 8 strings, each a different type of clue
• "high_tower_surprise" – the major plot twist (2-3 sentences)
• "lieutenants" – array of 1-3 lieutenant objects, each with name and tarot_spread
• "faction_name" – name of the aligned faction
• "faction_description" – description of faction (2-3 sentences)
• "minions" – description of common minion creature type (2-3 sentences)

{
  "bbeg_name": "",
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

    /* ---------- 3. Response ---------- */
    res.json({ ...villain, success: true });
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
