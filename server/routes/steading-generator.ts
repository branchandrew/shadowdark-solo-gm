import { Request, Response } from "express";
import { generateSteading, generateSteadingStep, GeneratedSteading, ALL_SETTLEMENT_TYPES } from "../lib/steading-generator.js";
import Anthropic from "@anthropic-ai/sdk";
import { getGlobalNarrativeRestrictions } from "../lib/llm-instructions.js";
import { NPCGenerator, type GeneratedNPC } from "../lib/npc-generator.js";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY ?? "",
});

// Function to generate NPCs for notable citizens with prepopulated occupations
function generateNotableCitizenNPCs(notableNPCs: string[]): GeneratedNPC[] {
  if (!notableNPCs || notableNPCs.length === 0) {
    return [];
  }

  const npcGenerator = new NPCGenerator();
  const generatedNPCs: GeneratedNPC[] = [];

  for (const occupation of notableNPCs) {
    // Generate a complete NPC
    const npc = npcGenerator.generateNPC();

    // Override the occupation with the one from the settlement
    npc.occupation = occupation;

    generatedNPCs.push(npc);
  }

  return generatedNPCs;
}

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
    const { step, currentSteading } = req.body;

    console.log("Generating steading step:", step);

    if (!step) {
      return res.status(400).json({
        success: false,
        error: "Step parameter is required",
      });
    }

    // Generate a new steading of the same type if we have the current steading info
    const steadingType = currentSteading?.type;
    const newSteading = generateSteading(steadingType);
    console.log("Generated steading type:", newSteading.type);
    console.log("Available fields:", Object.keys(newSteading));

    // Check if the field exists in the generated steading
    if (!(step in newSteading)) {
      console.log(`Field '${step}' not found. Available fields:`, Object.keys(newSteading));
      return res.status(400).json({
        success: false,
        error: `Field '${step}' not found in ${newSteading.type} steading data. Available fields: ${Object.keys(newSteading).join(', ')}`,
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

    // Generate NPCs for notable citizens and ruler if they exist (BEFORE creating prompt)
    let allGeneratedNPCs: GeneratedNPC[] = [];

    // Generate NPC for the ruler if ruler exists
    if (steading.ruler) {
      const rulerNPC = generateNotableCitizenNPCs([steading.ruler])[0];
      if (rulerNPC) {
        rulerNPC.occupation = steading.ruler; // Ensure ruler occupation is set
        allGeneratedNPCs.push(rulerNPC);
        console.log(`Generated ruler NPC: ${rulerNPC.firstName} ${rulerNPC.lastName} (${rulerNPC.occupation})`);
      }
    }

    // Generate NPCs for notable citizens
    if (steading.notableNPCs && Array.isArray(steading.notableNPCs)) {
      const citizenNPCs = generateNotableCitizenNPCs(steading.notableNPCs);
      allGeneratedNPCs.push(...citizenNPCs);
      console.log(`Generated ${citizenNPCs.length} NPCs for notable citizens`);
    }

    // Check if this steading has descriptors and include them in the prompt
    let descriptorGuidance = "";
    if (steading.descriptors) {
      descriptorGuidance = `\n\nIMPORTANT: This settlement has been given the mythic descriptors "${steading.descriptors.description}" (${steading.descriptors.adverb} + ${steading.descriptors.adjective}). Let these qualities inspire the overall mood, atmosphere, and character of the settlement. NEVER put these descriptor words in quotation marks or use them literally. Instead, let them subtly influence your word choices, imagery, and tone. For buildings and special locations with their own descriptive pairs, use the same approach - let those descriptors guide the feel and atmosphere without forcing the actual words into the narrative. Think of descriptors as invisible mood guides, not vocabulary requirements.`;
    }

    // Prepare NPC data for the prompt if we have generated NPCs
    let npcGuidance = "";
    if (allGeneratedNPCs.length > 0) {
      const npcDescriptions = allGeneratedNPCs.map(npc => {
        const role = npc.occupation.toLowerCase().includes('ruler') || npc.occupation.toLowerCase().includes('lord') || npc.occupation.toLowerCase().includes('mayor') ? 'RULER' : 'NOTABLE CITIZEN';
        return `${role}: ${npc.firstName} ${npc.lastName} - ${npc.race} ${npc.occupation}. Motivation: ${npc.motivation}. Appearance: ${npc.physicalAppearance}. Quirk: ${npc.quirk}. Secret: ${npc.secret}. Economic Status: ${npc.economicStatus}. Competence: ${npc.competence}.`;
      }).join('\n');

      npcGuidance = `\n\nIMPORTANT - DETAILED NPCs TO WEAVE INTO NARRATIVE:
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
