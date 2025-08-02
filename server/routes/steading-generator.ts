import { Request, Response } from "express";
import { generateSteading, generateSteadingStep, GeneratedSteading, ALL_SETTLEMENT_TYPES } from "../lib/steading-generator.js";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY ?? "",
});

// Generate a complete steading with all characteristics
export function generateCompleteSteading(req: Request, res: Response) {
  try {
    const { type } = req.body;
    const steading = generateSteading(type);

    res.json({
      success: true,
      steading: steading,
    });
  } catch (error) {
    console.error("Error generating steading:", error);
    res.status(500).json({
      success: false,
      error: "Failed to generate steading",
    });
  }
}

// Generate a specific step of steading creation
export function generateSteadingStepRoute(req: Request, res: Response) {
  try {
    const { step } = req.body;

    console.log("Generating steading step:", step);

    if (!step) {
      return res.status(400).json({
        success: false,
        error: "Step parameter is required",
      });
    }

    // Generate a new steading and extract the requested field
    const newSteading = generateSteading();
    console.log("Generated steading type:", newSteading.type);
    console.log("Available fields:", Object.keys(newSteading));

    // Check if the field exists in the generated steading
    if (!(step in newSteading)) {
      console.log(`Field '${step}' not found. Available fields:`, Object.keys(newSteading));
      return res.status(400).json({
        success: false,
        error: `Field '${step}' not found in steading data. Available fields: ${Object.keys(newSteading).join(', ')}`,
      });
    }

    const stepValue = newSteading[step];
    console.log(`Step '${step}' value:`, stepValue);

    res.json({
      success: true,
      step: step,
      result: stepValue,
    });
  } catch (error) {
    console.error("Error generating steading step:", error);
    res.status(500).json({
      success: false,
      error: "Failed to generate steading step",
    });
  }
}

// Generate narrative for a steading using LLM
export async function generateSteadingNarrative(req: Request, res: Response) {
  try {
    const { steading } = req.body;

    if (!steading) {
      return res.status(400).json({
        success: false,
        error: "Steading data is required",
      });
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return res.status(500).json({
        success: false,
        error: "LLM service is not configured",
      });
    }

    // Create a comprehensive prompt for the steading narrative
    console.log("Processing steading for narrative:", {
      type: steading.type,
      name: steading.name,
      keys: Object.keys(steading)
    });

    let steadingData: string;
    try {
      steadingData = JSON.stringify(steading, null, 2);
    } catch (stringifyError) {
      console.error("Error stringifying steading data:", stringifyError);
      // Fallback to a simpler representation
      steadingData = `Settlement: ${steading.name} (${steading.type})`;
    }

    const prompt = `You are a master storyteller and world-builder for tabletop RPGs. I will provide you with detailed information about a settlement (steading) that has been randomly generated. Your task is to weave these details into a compelling, coherent narrative that brings this place to life.

Please create a rich narrative description that:
1. Tells the story of this settlement - its history, current state, and what makes it unique
2. Explains how all the various details work together logically
3. Creates atmosphere and mood appropriate to the settlement type
4. Includes plot hooks and adventure opportunities for visiting adventurers
5. Resolves any contradictory details in a creative way that enhances rather than detracts from the story
6. Focuses on what makes this place memorable and distinct

Here is the settlement data:
${steadingData}

Guidelines:
- Write in a descriptive, atmospheric tone suitable for a GM to read to players
- Focus on what visitors would see, hear, smell, and feel when approaching and entering
- Explain the relationships between different NPCs, factions, and locations
- If there are secrets, events, or conflicts, weave them into the narrative naturally
- Include specific details that make the settlement feel lived-in and real
- Suggest 2-3 adventure hooks or interesting situations for player characters
- Keep the narrative between 300-500 words

Write the narrative now:`;

    const response = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 800,
      temperature: 0.8,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const narrative = response.content[0].type === "text" ? response.content[0].text : "";

    res.json({
      success: true,
      narrative: narrative,
    });
  } catch (error) {
    console.error("Error generating steading narrative:", error);
    console.error("Error details:", {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      anthropicKey: process.env.ANTHROPIC_API_KEY ? "Present" : "Missing"
    });
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to generate steading narrative",
    });
  }
}

// Get available settlement types
export function getSettlementTypes(req: Request, res: Response) {
  try {
    res.json({
      success: true,
      types: ALL_SETTLEMENT_TYPES,
    });
  } catch (error) {
    console.error("Error getting settlement types:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get settlement types",
    });
  }
}
