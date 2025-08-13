import { Request, Response } from "express";
import { generateDangers } from "../lib/danger-generator.js";
import Anthropic from "@anthropic-ai/sdk";
import { getGlobalNarrativeRestrictions } from "../lib/llm-instructions.js";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY ?? "",
});

// Generate dangers based on count
export function generateDangersRoute(req: Request, res: Response) {
  try {
    const { numDangers = 1 } = req.body;

    if (typeof numDangers !== 'number' || numDangers < 1 || numDangers > 10) {
      return res.status(400).json({
        success: false,
        error: "Number of dangers must be between 1 and 10",
      });
    }

    const result = generateDangers(numDangers);

    res.json(result);
  } catch (error) {
    console.error("Error generating dangers:", error);
    res.status(500).json({
      success: false,
      error: "Failed to generate dangers",
    });
  }
}

// Generate narrative for a danger
export async function generateDangerNarrativeRoute(req: Request, res: Response) {
  try {
    const { danger } = req.body;

    if (!danger || !danger.category || !danger.subcategory || !danger.specificResult) {
      return res.status(400).json({
        success: false,
        error: "Invalid danger data provided",
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
      max_tokens: 1000,
      messages: [{
        role: "user",
        content: prompt
      }]
    });

    const narrative = response.content[0].type === "text" ? response.content[0].text : "Failed to generate narrative";

    res.json({
      success: true,
      narrative: narrative,
    });
  } catch (error) {
    console.error("Error generating danger narrative:", error);
    res.status(500).json({
      success: false,
      error: "Failed to generate danger narrative",
    });
  }
}
