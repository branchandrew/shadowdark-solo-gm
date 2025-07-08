import { Request, Response } from "express";
import Anthropic from "@anthropic-ai/sdk";
import { spawn } from "child_process";
import { relationalDB } from "../lib/relational-database.js";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

interface SceneGenerationRequest {
  session_id: string;
  player_intentions?: string;
  chaos_factor?: number;
}

export async function generateScene(req: Request, res: Response) {
  try {
    const {
      session_id,
      player_intentions,
      chaos_factor = 5,
    }: SceneGenerationRequest = req.body;

    if (!session_id) {
      return res.status(400).json({
        success: false,
        error: "Session ID is required",
      });
    }

    console.log("=== STEP 1: Gathering Context Snapshot ===");

    // Get current campaign data for context
    const contextSnapshot = await gatherContextSnapshot(session_id);

    console.log("Context Snapshot:", JSON.stringify(contextSnapshot, null, 2));
    console.log(
      "Player Intentions:",
      player_intentions || "No intentions specified",
    );

    console.log("=== STEP 2: Creating Scene Expectations ===");

    // Get scene expectations from LLM
    const sceneExpectations = await createSceneExpectations(
      contextSnapshot,
      player_intentions,
    );

    console.log("Scene Expectations:", sceneExpectations.description);
    console.log("Fate Rolls:", sceneExpectations.fateRolls);

    console.log("=== STEP 2 SUMMARY ===");
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
    const scene = {
      id: `scene_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
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

async function gatherContextSnapshot(sessionId: string) {
  // Get real data from database/localStorage
  const campaignElements = await getCampaignElementsData(sessionId);
  const characterData = await getCharacterData(sessionId);
  const adventureLog = await getAdventureLogData(sessionId);

  return {
    bbeg: campaignElements.bbeg || {
      name: "Unknown BBEG",
      description: "No BBEG generated yet",
      motivation: "Unknown motivation",
      hook: "No hook defined",
    },
    npcs: campaignElements.npcs || [],
    plot_threads: campaignElements.plot_threads || [],
    factions: campaignElements.factions || [],
    adventure_log: adventureLog || [],
    character: characterData || {
      name: "Unnamed Adventurer",
      level: 1,
      class: "Unknown",
    },
  };
}

async function getCampaignElementsData(sessionId: string) {
  // Try to get from database first, then fall back to stub data
  try {
    // For now, return stub data until we have better database integration
    return {
      bbeg: {
        name: "Malakai Duskweaver",
        description:
          "A fallen celestial who weaves star essence into dark tapestries",
        motivation: "To achieve immortality by harvesting celestial essence",
        hook: "Whispers speak of a shadow merchant whose coins bring dreams and death",
      },
      npcs: [
        {
          name: "Sister Vesper",
          type: "lieutenant",
          description: "Former temple priestess with prophetic dreams",
          disposition: "hostile",
        },
      ],
      plot_threads: [
        {
          description: "Strange auroras appearing in impossible patterns",
          status: "active",
        },
        {
          description: "People found transformed into living constellations",
          status: "active",
        },
      ],
      factions: [
        {
          name: "The Constellation Covenant",
          description: "Secretive order of astronomers and mystics",
          relationship: "opposed",
        },
      ],
    };
  } catch (error) {
    console.error("Error getting campaign elements:", error);
    return { bbeg: null, npcs: [], plot_threads: [], factions: [] };
  }
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
) {
  const prompt = `You are a GM for a Shadowdark RPG solo session. Create scene expectations based on the story context and player intentions.

CONTEXT:
BBEG: ${contextSnapshot.bbeg.name} - ${contextSnapshot.bbeg.description}
Motivation: ${contextSnapshot.bbeg.motivation}

Current Plot Threads:
${contextSnapshot.plot_threads.map((thread: any) => `- ${thread.description} (${thread.status})`).join("\n")}

NPCs:
${contextSnapshot.npcs.map((npc: any) => `- ${npc.name}: ${npc.description} (${npc.disposition})`).join("\n")}

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
  const fateRolls = sceneData.fateRolls.map((roll: any) => {
    const diceRoll = Math.floor(Math.random() * 100) + 1;
    const result = evaluateFateRoll(diceRoll, roll.likelihood);
    return {
      ...roll,
      roll: diceRoll,
      result,
    };
  });

  return {
    description: sceneData.description,
    fateRolls,
  };
}

async function performSceneSetup(chaosFactor: number, contextSnapshot: any) {
  // Step 3: Chaos roll and scene determination
  const chaosRoll = Math.floor(Math.random() * 10) + 1;

  let sceneType: "expected" | "altered" | "interrupted";
  let randomEvent = null;

  if (chaosRoll > chaosFactor) {
    sceneType = "expected";
  } else if (chaosRoll < chaosFactor) {
    sceneType = "altered";
    randomEvent = await generateRandomEvent(contextSnapshot);
  } else {
    sceneType = "interrupted";
    randomEvent = await generateRandomEvent(contextSnapshot);

    // Log interruption details
    console.log("=== STEP 3 INTERRUPTION DETAILS ===");
    console.log("SCENE INTERRUPTED! Changes based on roll results:");
    console.log(`- Random Event Focus: ${randomEvent.focus}`);
    console.log(
      `- Meaning: ${randomEvent.meaning_action} ${randomEvent.meaning_subject}`,
    );
    console.log(`- Scene Change: ${randomEvent.description}`);
    console.log(
      "The original scene expectations must now be modified to incorporate this unexpected element.",
    );
  }

  return {
    chaosRoll,
    sceneType,
    randomEvent,
  };
}

function evaluateFateRoll(roll: number, likelihood: string): string {
  // Mythic GME Fate Chart implementation - thresholds based on chaos factor 5
  const thresholds = {
    very_unlikely: { exceptional_yes: 1, yes: 5, exceptional_no: 96 },
    unlikely: { exceptional_yes: 2, yes: 10, exceptional_no: 91 },
    "50_50": { exceptional_yes: 3, yes: 15, exceptional_no: 86 },
    likely: { exceptional_yes: 5, yes: 25, exceptional_no: 75 },
    very_likely: { exceptional_yes: 7, yes: 35, exceptional_no: 66 },
  };

  const threshold =
    thresholds[likelihood as keyof typeof thresholds] || thresholds["50_50"];

  if (roll <= threshold.exceptional_yes) {
    return "exceptional_yes";
  } else if (roll <= threshold.yes) {
    return "yes";
  } else if (roll >= threshold.exceptional_no) {
    return "exceptional_no";
  } else {
    return "no";
  }
}

async function generateRandomEvent(contextSnapshot: any) {
  // Simplified random event generation - will expand with actual Mythic tables
  const focusOptions = ["NPC", "Faction", "Plot Thread", "PC", "Environment"];
  const focus = focusOptions[Math.floor(Math.random() * focusOptions.length)];

  // Mock Mythic Meaning table
  const actions = [
    "Abandon",
    "Activate",
    "Agree",
    "Arrive",
    "Assist",
    "Attack",
    "Betray",
    "Change",
  ];
  const subjects = [
    "Ally",
    "Enemy",
    "Information",
    "Power",
    "Secret",
    "Treasure",
    "Weapon",
    "Magic",
  ];

  const meaningAction = actions[Math.floor(Math.random() * actions.length)];
  const meaningSubject = subjects[Math.floor(Math.random() * subjects.length)];

  return {
    focus,
    meaning_action: meaningAction,
    meaning_subject: meaningSubject,
    description: `Random event involves ${focus}: ${meaningAction} ${meaningSubject}`,
  };
}

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
