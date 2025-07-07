import { RequestHandler } from "express";
import Anthropic from "@anthropic-ai/sdk";
import { spawn } from "child_process";
import path from "path";

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
    } = req.body || {};
    console.log("Adventure generation with style:", { theme, tone, voice });

    const cardsFormatted = seeds.cards
      .map((c) => `${c.position}: ${c.card_text}`)
      .join("\n");

    /* ---------- 2. Claude call ---------- */
    const userPrompt =
      `You are a narrative‑design assistant tasked with forging a memorable Big Bad Evil Guy (BBEG) for a TTRPG campaign.  Work through the hidden reasoning steps below, **but reveal ONLY the JSON object requested in the Output section.**

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
   • Major Arcana = fate‑shaping forces.  • Suits �� Wands: ambition; Cups: emotion/loyalty; Swords: ideology/conflict; Pentacles: resources/influence.
   • Numbers — Ace‑4: beginnings; 5‑7: struggle; 8‑10: climax; Court: Page(scout), Knight(enforcer), Queen(strategist), King(ruler).
   • Reversed indicates blockage, secrecy, or excess.
2. **Draft villain profile** (≈ 4 sentences): striking visual, core motivation, virtue‑vice contradiction, primary resource/lieutenant, hidden weakness, worst‑case future.
4. **Forge a compelling name** that embodies the style guidance
   • Capture core mood, element/domain, and cultural flavor within the specified theme.  • Build a phonetic palette (2‑3 consonant clusters, 1‑2 vowel sounds) that fits mood and tone.  ��� Select/construct a syllable template (e.g. CVC‑CVC) and blend morphemes to yield pronounceable candidates.  • Apply quality rules (pronounceability, tone match, distinctiveness).  • Choose the best.
5. **Write a one‑sentence adventure hook** for the GM to read aloud, using the specified voice.
6. **Generate 8 investigative clues** that heroes might discover about this BBEG. These should include:
   • Clues pointing to the BBEG as the source of evil
   • Hints about potential weaknesses or vulnerabilities
   • Information about where the BBEG might be found or operates
   • Evidence of the BBEG's evil doings
   Make these diverse: rumors from NPCs, journal entries, prophecies/portents, signs in nature, direct physical evidence, etc. All clues must reflect the theme, tone, and voice.
7. **Create a "High Tower Surprise"** - a major plot twist or revelation about this BBEG that subverts player expectations while maintaining the style guidance. This could be:
   • The apparent stronghold is actually a decoy
   • The BBEG's true identity or nature is different than expected
   • An unexpected relationship to a trusted NPC or location
   • A hidden motivation that recontextualizes everything
   • The real threat being something else entirely
8. **Generate 1-3 Lieutenants** (whatever number makes sense for this BBEG and theme). For each lieutenant:
   • Create a name that fits the theme
   • Draw 6 new tarot cards and interpret them to answer these specific questions:
     - Seed: What defines their core nature?
     - Background: What is their origin story?
     - Location: Where will characters most likely encounter them?
     - Why Protect: What motivates their loyalty to the BBEG?
     - How Protect: What methods do they use to serve/protect the BBEG?
     - Reward: What do characters gain by defeating them?
   • Keep each tarot interpretation to 1-2 sentences

--- OUTPUT ---
Return one clean JSON object and nothing else.  Keep values concise:
• "bbeg_name" – the chosen name (title optional)
• "bbeg_hook" – the single sentence hook
��� "bbeg_motivation" – one concise sentence
• "bbeg_detailed_description" – 3‑4 vivid sentences
• "clues" – array of exactly 8 strings, each a different type of clue
• "high_tower_surprise" – the major plot twist (2-3 sentences)
• "lieutenants" – array of 1-3 lieutenant objects, each with name and tarot_spread

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
  ]
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
    res.status(500).json({ success: false, error: String(err) });
  }
};
