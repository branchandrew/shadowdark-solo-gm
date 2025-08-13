import { Request, Response } from "express";
import { generateNPC, generateNPCStep, generateIntelligentNPC, GeneratedNPC } from "../lib/npc-generator.js";
import Anthropic from "@anthropic-ai/sdk";
import { getGlobalNarrativeRestrictions } from "../lib/llm-instructions.js";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY ?? "",
});

// Generate a complete NPC with all characteristics
export async function generateCompleteNPC(req: Request, res: Response) {
  try {
    const npc = await generateIntelligentNPC();

    res.json({
      success: true,
      npc: npc,
    });
  } catch (error) {
    console.error("Error generating NPC:", error);
    res.status(500).json({
      success: false,
      error: "Failed to generate NPC",
    });
  }
}

// Generate a specific step of NPC creation
export function generateNPCStepRoute(req: Request, res: Response) {
  try {
    const { step } = req.body;

    if (!step) {
      return res.status(400).json({
        success: false,
        error: "Step parameter is required",
      });
    }

    const validSteps: (keyof GeneratedNPC)[] = [
      'race', 'occupation', 'motivation', 'secret',
      'physicalAppearance', 'economicStatus', 'quirk', 'competence',
      'firstName', 'lastName'
    ];

    if (!validSteps.includes(step)) {
      return res.status(400).json({
        success: false,
        error: `Invalid step. Valid steps are: ${validSteps.join(', ')}`,
      });
    }

    const result = generateNPCStep(step as keyof GeneratedNPC);

    res.json({
      success: true,
      step: step,
      result: result,
    });
  } catch (error) {
    console.error("Error generating NPC step:", error);
    res.status(500).json({
      success: false,
      error: "Failed to generate NPC step",
    });
  }
}

// Generate a coherent narrative for an NPC
export async function generateNPCNarrative(req: Request, res: Response) {
  try {
    const { npc } = req.body;

    if (!npc) {
      return res.status(400).json({
        success: false,
        error: "NPC data is required",
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
    console.error("Error generating NPC narrative:", error);
    res.status(500).json({
      success: false,
      error: "Failed to generate NPC narrative",
    });
  }
}
