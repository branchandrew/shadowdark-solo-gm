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

interface VillainJson {
  bbeg_name: string;
  bbeg_hook: string;
  bbeg_motivation: string;
  bbeg_detailed_description: string;
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
export const generateAdventure: RequestHandler = async (_req, res) => {
  try {
    /* ---------- 1. Seed data from Python ---------- */
    const pythonPath = path.join(
      __dirname,
      "..",
      "scripts",
      "adventure_generator.py",
    );
    const seeds = await runPython(pythonPath);

    const cardsFormatted = seeds.cards
      .map((c) => `${c.position}: ${c.card_text}`)
      .join("\n");

    /* ---------- 2. Claude call ---------- */
    const userPrompt = `You are a narrative‑design assistant tasked with forging a memorable Big Bad Evil Guy (BBEG) for a TTRPG campaign.  Work through the hidden reasoning steps below, **but reveal ONLY the JSON object requested in the Output section.**

### SOURCE DATA
Goal: ${seeds.goal}
Gender: ${seeds.gender}
Race: ${seeds.race}
Tarot Spread:\n${cardsFormatted}

--- HIDDEN REASONING STEPS (do not expose) ---
1. **Interpret each tarot card** in context of the villain's life.  Follow these shortcuts:
   • Major Arcana = fate‑shaping forces.  • Suits — Wands: ambition; Cups: emotion/loyalty; Swords: ideology/conflict; Pentacles: resources/influence.
   • Numbers — Ace‑4: beginnings; 5‑7: struggle; 8‑10: climax; Court: Page(scout), Knight(enforcer), Queen(strategist), King(ruler).
   • Reversed indicates blockage, secrecy, or excess.
2. **Draft villain profile** (≈ 4 sentences): striking visual, core motivation, virtue‑vice contradiction, primary resource/lieutenant, hidden weakness, worst‑case future.
3. **Forge a compelling name**
   • Capture core mood, element/domain, and cultural flavor.  • Build a phonetic palette (2‑3 consonant clusters, 1‑2 vowel sounds) that fits mood.  • Select/construct a syllable template (e.g. CVC‑CVC) and blend morphemes to yield pronounceable candidates.  • Apply quality rules (pronounceability, tone match, distinctiveness).  • Choose the best.
4. **Write a one‑sentence adventure hook** for the GM to read aloud.

--- OUTPUT ---
Return one clean JSON object and nothing else.  Keep values short:
• "bbeg_name" – the chosen name (title optional)
• "bbeg_hook" – the single sentence hook
• "bbeg_motivation" – one concise sentence
• "bbeg_detailed_description" – 3‑4 vivid sentences

{
  "bbeg_name": "",
  "bbeg_hook": "",
  "bbeg_motivation": "",
  "bbeg_detailed_description": ""
}`.trim();

    const messages = [
      { role: "user" as const, content: userPrompt },
      {
        role: "assistant" as const,
        content: `{
  "bbeg_name": "",
  "bbeg_hook": "",
  "bbeg_motivation": "",
  "bbeg_detailed_description": ""
}`,
      },
    ];

    const ai = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      system: "Return only the JSON object requested.",
      max_tokens: 600,
      temperature: 0.5,
      messages,
    });

    const villain: VillainJson = JSON.parse(ai.content[0].text);

    /* ---------- 3. Response ---------- */
    res.json({ ...villain, success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
};
