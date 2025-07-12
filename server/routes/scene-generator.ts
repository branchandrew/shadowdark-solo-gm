import { Request, Response } from "express";
import Anthropic from "@anthropic-ai/sdk";
import { spawn } from "child_process";
import path from "path";
import { relationalDB } from "../lib/relational-database.js";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

interface SceneGenerationRequest {
  session_id: string;
  player_intentions?: string;
  chaos_factor?: number;
  character?: any;
  campaign_elements?: any;
}

export async function generateScene(req: Request, res: Response) {
  try {
    const {
      session_id,
      player_intentions,
      chaos_factor = 5,
      character,
      campaign_elements,
    }: SceneGenerationRequest = req.body;

    if (!session_id) {
      return res.status(400).json({
        success: false,
        error: "Session ID is required",
      });
    }

    console.log("=== STEP 1: Gathering Context Snapshot ===");
    console.log(
      "Received campaign_elements:",
      JSON.stringify(campaign_elements, null, 2),
    );

    // Validate that we have campaign elements - reject if none exist
    if (
      !campaign_elements ||
      !campaign_elements.bbeg ||
      !campaign_elements.bbeg.name ||
      campaign_elements.bbeg.name === "Unknown BBEG"
    ) {
      console.log(
        "ERROR: No valid campaign elements provided. Scene generation requires an adventure arc.",
      );
      return res.status(400).json({
        success: false,
        error:
          "No campaign elements found. Please generate an adventure arc first.",
      });
    }

    // Get current campaign data for context
    console.log(
      `${trackingId} - Calling gatherContextSnapshot with campaign_elements.bbeg:`,
      campaign_elements?.bbeg?.name,
    );
    const contextSnapshot = await gatherContextSnapshot(
      session_id,
      character,
      campaign_elements,
      trackingId,
    );

    console.log("Context Snapshot:", JSON.stringify(contextSnapshot, null, 2));
    console.log(
      "Player Intentions:",
      player_intentions || "No intentions specified",
    );

    console.log("=== STEP 2: Creating Scene Expectations ===");
    console.log(
      `${trackingId} - BEFORE createSceneExpectations - contextSnapshot.bbeg:`,
      JSON.stringify(contextSnapshot.bbeg, null, 2),
    );

    // Get scene expectations from LLM
    const sceneExpectations = await createSceneExpectations(
      contextSnapshot,
      player_intentions,
      trackingId,
    );

    console.log("Scene Expectations:", sceneExpectations.description);
    console.log("Fate Rolls:", sceneExpectations.fateRolls);

    console.log("=== STEP 2 SUMMARY ===");
    console.log(`TIMESTAMP: ${new Date().toISOString()}`);
    console.log("RESULTING SCENE SUMMARY:");
    console.log(sceneExpectations.description);
    console.log("Fate Roll Results:");
    sceneExpectations.fateRolls.forEach((roll: any) => {
      console.log(
        `- ${roll.question}: ${roll.result} (likelihood: ${roll.likelihood})`,
      );
    });

    console.log("=== STEP 3: Scene Setup with Mythic Rolls ===");

    // Perform Mythic rolls for scene setup
    const sceneSetup = await performSceneSetup(chaos_factor, contextSnapshot);

    console.log(
      "Chaos Roll:",
      sceneSetup.chaosRoll,
      "vs Chaos Factor:",
      chaos_factor,
    );
    console.log("Scene Type:", sceneSetup.sceneType);
    if (sceneSetup.randomEvent) {
      console.log("Random Event:", sceneSetup.randomEvent);
    }

    console.log("=== STEP 4: Establishing Scene Goal ===");

    // Establish scene goals
    const sceneGoals = await establishSceneGoals(
      sceneExpectations,
      sceneSetup,
      contextSnapshot,
      player_intentions,
    );

    console.log("Scene Goal:", sceneGoals.goal);
    console.log("Success Conditions:", sceneGoals.successConditions);

    // Get next scene number
    const sceneNumber = await getNextSceneNumber(session_id);

    // Create scene record
    const sceneIdResult = await runSceneIdGenerator();
    const scene = {
      id: sceneIdResult.scene_id,
      session_id,
      scene_number: sceneNumber,
      title: sceneGoals.title,
      description: sceneExpectations.description,
      player_intentions: player_intentions || null,
      context_snapshot: contextSnapshot,
      scene_expectations: sceneExpectations.description,
      fate_rolls: sceneExpectations.fateRolls,
      chaos_factor,
      chaos_roll: sceneSetup.chaosRoll,
      scene_type: sceneSetup.sceneType,
      random_event: sceneSetup.randomEvent || null,
      scene_goal: sceneGoals.goal,
      success_conditions: [], // Removed for now
      status: "active" as const,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Save to database if available
    if (relationalDB.isAvailable()) {
      await relationalDB.createScene(scene);
    }

    res.json({
      success: true,
      scene,
    });
  } catch (error) {
    console.error("Scene generation error:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    });
  }
}

async function gatherContextSnapshot(
  sessionId: string,
  character?: any,
  campaignElements?: any,
  trackingId?: string,
) {
  // Use provided campaign elements or fall back to empty data
  console.log(
    `${trackingId} - gatherContextSnapshot - campaignElements parameter:`,
    JSON.stringify(campaignElements, null, 2),
  );

  const campaignData =
    campaignElements || (await getCampaignElementsData(sessionId));
  console.log(
    `${trackingId} - gatherContextSnapshot - final campaignData:`,
    JSON.stringify(campaignData, null, 2),
  );

  const characterData = character || (await getCharacterData(sessionId));
  const adventureLog = await getAdventureLogData(sessionId);

  return {
    bbeg: campaignData.bbeg || null,
    npcs: campaignData.npcs || [],
    plot_threads: campaignData.plot_threads || [],
    factions: campaignData.factions || [],
    adventure_log: adventureLog || [],
    character: characterData
      ? {
          name: characterData.name || "Unnamed Adventurer",
          level: characterData.level || 1,
          class: characterData.className || characterData.class || "Unknown",
          ancestry: characterData.ancestry || "Human",
          background: characterData.background || "Unknown",
        }
      : {
          name: "Unnamed Adventurer",
          level: 1,
          class: "Unknown",
        },
  };
}

async function getCampaignElementsData(sessionId: string) {
  // Return empty data - campaign elements should only exist if user generated them
  // The frontend will pass campaign elements in the request if they exist
  return {
    bbeg: null,
    npcs: [],
    plot_threads: [],
    factions: [],
  };
}

async function getCharacterData(sessionId: string) {
  // Try to get real character data from session state
  try {
    // Read from session storage where character sheet data is stored
    if (typeof sessionStorage !== "undefined") {
      const characterData = sessionStorage.getItem("character");
      if (characterData) {
        const character = JSON.parse(characterData);
        return {
          name: character.name || "Unknown Adventurer",
          level: character.level || 1,
          class: character.className || "Fighter",
          ancestry: character.ancestry || "Human",
          background: character.background || "Unknown",
          stats: character.stats || {
            STR: 10,
            DEX: 10,
            CON: 10,
            INT: 10,
            WIS: 10,
            CHA: 10,
          },
          hitPoints: character.hitPoints || 1,
          armorClass: character.armorClass || 10,
        };
      }
    }

    // Fallback for default character
    return {
      name: "Unknown Adventurer",
      level: 1,
      class: "Fighter",
    };
  } catch (error) {
    console.error("Error getting character data:", error);
    return {
      name: "Unknown Adventurer",
      level: 1,
      class: "Fighter",
    };
  }
}

async function getAdventureLogData(sessionId: string) {
  // Get adventure log entries
  try {
    return [
      {
        content:
          "Adventure begins with reports of falling stars that never reach ground",
        type: "scene",
        timestamp: new Date().toISOString(),
      },
    ];
  } catch (error) {
    console.error("Error getting adventure log:", error);
    return [];
  }
}

async function createSceneExpectations(
  contextSnapshot: any,
  playerIntentions?: string,
  trackingId?: string,
) {
  console.log(
    `${trackingId} - === createSceneExpectations - contextSnapshot ===`,
  );
  console.log(
    `${trackingId} - BBEG:`,
    JSON.stringify(contextSnapshot.bbeg, null, 2),
  );
  console.log(
    `${trackingId} - NPCs:`,
    JSON.stringify(contextSnapshot.npcs, null, 2),
  );
  console.log(
    `${trackingId} - Factions:`,
    JSON.stringify(contextSnapshot.factions, null, 2),
  );
  console.log(
    `${trackingId} - Plot Threads:`,
    JSON.stringify(contextSnapshot.plot_threads, null, 2),
  );

  const prompt = `You are a GM for a Shadowdark RPG solo session. Create scene expectations based on the story context and player intentions.

CONTEXT:
BBEG: ${contextSnapshot.bbeg.name} - ${contextSnapshot.bbeg.description}
Motivation: ${contextSnapshot.bbeg.motivation}

Current Plot Threads:
${contextSnapshot.plot_threads.map((thread: any) => `- ${thread.description} (${thread.status})`).join("\n")}

NPCs:
${contextSnapshot.npcs
  .map((npc: any) => {
    if (npc.tarot_spread) {
      // Handle lieutenant structure with tarot spread
      return `- ${npc.name}: ${npc.tarot_spread.seed || npc.tarot_spread.background || "Lieutenant"}`;
    } else {
      // Handle simple NPC structure
      return `- ${npc.name}: ${npc.description || "NPC"} (${npc.disposition || "unknown"})`;
    }
  })
  .join("\n")}

Factions:
${contextSnapshot.factions.map((faction: any) => `- ${faction.name}: ${faction.description} (${faction.relationship})`).join("\n")}

Previous Adventure Log:
${contextSnapshot.adventure_log.map((entry: any) => `- ${entry.content}`).join("\n")}

PLAYER INTENTIONS: ${playerIntentions || "No specific intentions stated"}

For each story element you want to include in this scene, make a FATE ROLL with a likelihood assessment and I'll tell you if it happens:

1. Should the BBEG be directly involved in this scene?
2. Should NPCs/Lieutenants appear in this scene?
3. Should this scene advance the main plot thread?
4. Should a faction be involved in this scene?
5. Should there be immediate danger or conflict?

Create a scene that logically follows from the player's intentions and current story state. Focus on what would make narrative sense for the next part of the story.

For each fate roll question, assess the likelihood based on the current story context. Use one of these Mythic Fate Table likelihood levels:
- very_likely
- likely
- 50_50
- unlikely
- very_unlikely

Return a JSON object with:
{
  "description": "A paragraph describing what this scene is probably about",
  "fateRolls": [
    {
      "question": "Should the BBEG be directly involved?",
      "likelihood": "very_likely|likely|50_50|unlikely|very_unlikely"
    }
    // ... more fate roll questions
  ]
}`;

  console.log("=== FULL LLM PROMPT ===");
  console.log(prompt);
  console.log("=== END LLM PROMPT ===");

  const response = await anthropic.messages.create({
    model: "claude-3-5-sonnet-20241022",
    max_tokens: 800,
    messages: [{ role: "user", content: prompt }],
  });

  const content = response.content[0];
  if (content.type !== "text") {
    throw new Error("Invalid response from LLM");
  }

  // Extract JSON from response
  const jsonMatch = content.text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("No JSON found in LLM response");
  }

  const sceneData = JSON.parse(jsonMatch[0]);

  // Process fate rolls with proper Mythic GME likelihood system
  const fateRolls = await Promise.all(
    sceneData.fateRolls.map(async (roll: any) => {
      const fateResult = await runFateChart(roll.likelihood, 5); // Use chaos factor 5 for now
      return {
        ...roll,
        roll: fateResult.roll,
        result: fateResult.result.toLowerCase().replace(" ", "_"),
        mythic_result: fateResult,
      };
    }),
  );

  return {
    description: sceneData.description,
    fateRolls,
  };
}

async function performSceneSetup(chaosFactor: number, contextSnapshot: any) {
  // Step 3: Chaos roll and scene determination using Python script
  const sceneSetup = await runSceneSetup(chaosFactor);

  // Log interruption details if scene is interrupted
  if (sceneSetup.scene_type === "interrupted" && sceneSetup.random_event) {
    console.log("=== STEP 3 INTERRUPTION DETAILS ===");
    console.log("SCENE INTERRUPTED! Changes based on roll results:");
    console.log(`- Random Event Focus: ${sceneSetup.random_event.focus}`);
    console.log(
      `- Meaning: ${sceneSetup.random_event.meaning_action} ${sceneSetup.random_event.meaning_subject}`,
    );
    console.log(`- Scene Change: ${sceneSetup.random_event.description}`);
    console.log(
      "The original scene expectations must now be modified to incorporate this unexpected element.",
    );
  }

  return {
    chaosRoll: sceneSetup.chaos_roll,
    sceneType: sceneSetup.scene_type,
    randomEvent: sceneSetup.random_event,
  };
}

/**
 * Executes the Mythic Fate Chart Python script and returns the result
 */
const runFateChart = (
  likelihood: string = "50/50",
  chaosFactor: number = 5,
): Promise<any> =>
  new Promise((resolve, reject) => {
    const scriptPath = path.join(
      __dirname,
      "..",
      "scripts",
      "mythic_fate_chart.py",
    );
    const proc = spawn("python3", [
      scriptPath,
      likelihood,
      chaosFactor.toString(),
    ]);

    let stdout = "";
    let stderr = "";

    proc.stdout.on("data", (data) => (stdout += data));
    proc.stderr.on("data", (data) => (stderr += data));

    proc.on("close", (code) => {
      if (code !== 0) {
        return reject(
          new Error(stderr || `Python script exited with code ${code}`),
        );
      }
      try {
        resolve(JSON.parse(stdout.trim()));
      } catch (error) {
        reject(new Error("Invalid JSON from Fate Chart script"));
      }
    });
  });

/**
 * Executes the Mythic Meaning Table Python script and returns the result
 */
const runMeaningTable = (): Promise<any> =>
  new Promise((resolve, reject) => {
    const scriptPath = path.join(
      __dirname,
      "..",
      "scripts",
      "mythic_meaning_table.py",
    );
    const proc = spawn("python3", [scriptPath]);

    let stdout = "";
    let stderr = "";

    proc.stdout.on("data", (data) => (stdout += data));
    proc.stderr.on("data", (data) => (stderr += data));

    proc.on("close", (code) => {
      if (code !== 0) {
        return reject(
          new Error(stderr || `Python script exited with code ${code}`),
        );
      }
      try {
        resolve(JSON.parse(stdout.trim()));
      } catch (error) {
        reject(new Error("Invalid JSON from Meaning Table script"));
      }
    });
  });

/**
 * Executes the Scene Generator Python script for scene setup
 */
const runSceneSetup = (chaosFactor: number = 5): Promise<any> =>
  new Promise((resolve, reject) => {
    const scriptPath = path.join(
      __dirname,
      "..",
      "scripts",
      "scene_generator.py",
    );
    const proc = spawn("python3", [
      scriptPath,
      "scene_setup",
      chaosFactor.toString(),
    ]);

    let stdout = "";
    let stderr = "";

    proc.stdout.on("data", (data) => (stdout += data));
    proc.stderr.on("data", (data) => (stderr += data));

    proc.on("close", (code) => {
      if (code !== 0) {
        return reject(
          new Error(stderr || `Python script exited with code ${code}`),
        );
      }
      try {
        resolve(JSON.parse(stdout.trim()));
      } catch (error) {
        reject(new Error("Invalid JSON from Scene Generator script"));
      }
    });
  });

/**
 * Executes the Scene Generator Python script for scene ID generation
 */
const runSceneIdGenerator = (): Promise<any> =>
  new Promise((resolve, reject) => {
    const scriptPath = path.join(
      __dirname,
      "..",
      "scripts",
      "scene_generator.py",
    );
    const proc = spawn("python3", [scriptPath, "scene_id"]);

    let stdout = "";
    let stderr = "";

    proc.stdout.on("data", (data) => (stdout += data));
    proc.stderr.on("data", (data) => (stderr += data));

    proc.on("close", (code) => {
      if (code !== 0) {
        return reject(
          new Error(stderr || `Python script exited with code ${code}`),
        );
      }
      try {
        resolve(JSON.parse(stdout.trim()));
      } catch (error) {
        reject(new Error("Invalid JSON from Scene Generator script"));
      }
    });
  });

async function establishSceneGoals(
  sceneExpectations: any,
  sceneSetup: any,
  contextSnapshot: any,
  playerIntentions?: string,
) {
  const prompt = `Based on the scene expectations and setup, establish clear scene goals.

SCENE EXPECTATIONS: ${sceneExpectations.description}

SCENE TYPE: ${sceneSetup.sceneType}
${sceneSetup.randomEvent ? `RANDOM EVENT: ${sceneSetup.randomEvent.description}` : ""}

PLAYER INTENTIONS: ${playerIntentions || "No specific intentions"}

Create a scene goal and success conditions. Return JSON:
{
  "title": "Brief scene title",
  "goal": "What the scene is trying to accomplish",
  "successConditions": ["Condition 1", "Condition 2", "Condition 3"]
}`;

  const response = await anthropic.messages.create({
    model: "claude-3-5-sonnet-20241022",
    max_tokens: 400,
    messages: [{ role: "user", content: prompt }],
  });

  const content = response.content[0];
  if (content.type !== "text") {
    throw new Error("Invalid response from LLM");
  }

  const jsonMatch = content.text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("No JSON found in LLM response");
  }

  return JSON.parse(jsonMatch[0]);
}

async function getNextSceneNumber(sessionId: string): Promise<number> {
  // For now, return 1 - we'll implement proper scene counting later
  return 1;
}
