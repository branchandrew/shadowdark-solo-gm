import { Request, Response } from "express";
import { generateNPC, generateNPCStep, GeneratedNPC } from "../lib/npc-generator.js";
import { generateResponse } from "../lib/ai.js";

// Generate a complete NPC with all characteristics
export function generateCompleteNPC(req: Request, res: Response) {
  try {
    const npc = generateNPC();

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
