/**
 * Scene Generation System for Mythic GME (TypeScript)
 * Handles all scene generation logic including chaos rolls, scene setup, and random events
 */

import { rollFateChart, RANDOM_EVENT_FOCUS_TABLE } from "./mythic-fate-chart";
import { rollMeaningTable } from "./mythic-meaning-table";

export type SceneType = "expected" | "altered" | "interrupted";

export interface ChaosRollResult {
  chaos_roll: number;
  chaos_factor: number;
  scene_type: SceneType;
}

export interface RandomEventFocusResult {
  focus_roll: number;
  focus: string;
  focus_range: string;
}

export interface RandomEventResult {
  focus: string;
  focus_roll: number;
  focus_range: string;
  meaning_action: string;
  meaning_subject: string;
  meaning_roll_verb: number;
  meaning_roll_subject: number;
  meaning: string;
  description: string;
}

export interface SceneSetupResult {
  chaos_roll: number;
  chaos_factor: number;
  scene_type: SceneType;
  random_event: RandomEventResult | null;
}

export interface FateQuestion {
  question: string;
  likelihood?: string;
}

export interface FateRollResult {
  question: string;
  likelihood: string;
  roll: number;
  threshold: number;
  result: string;
  success: boolean;
  exceptional: boolean;
  doubles: boolean;
  random_event?: any;
}

/**
 * Roll a d10 for chaos factor determination
 */
export function rollChaosFactor(chaosFactor: number = 5): ChaosRollResult {
  const chaosRoll = Math.floor(Math.random() * 10) + 1;

  let sceneType: SceneType;
  if (chaosRoll > chaosFactor) {
    sceneType = "expected";
  } else if (chaosRoll < chaosFactor) {
    sceneType = "altered";
  } else {
    sceneType = "interrupted";
  }

  return {
    chaos_roll: chaosRoll,
    chaos_factor: chaosFactor,
    scene_type: sceneType,
  };
}

/**
 * Roll on the Random Event Focus Table
 */
export function rollRandomEventFocus(): RandomEventFocusResult {
  const roll = Math.floor(Math.random() * 100) + 1;

  for (const [minVal, maxVal, eventType] of RANDOM_EVENT_FOCUS_TABLE) {
    if (minVal <= roll && roll <= maxVal) {
      return {
        focus_roll: roll,
        focus: eventType,
        focus_range: `${minVal}-${maxVal}`,
      };
    }
  }

  // Fallback (shouldn't happen)
  return {
    focus_roll: roll,
    focus: "Current Context",
    focus_range: "86-100",
  };
}

/**
 * Generate a complete random event with focus and meaning
 */
export function generateRandomEvent(): RandomEventResult {
  const focusResult = rollRandomEventFocus();
  const meaningResult = rollMeaningTable();

  return {
    focus: focusResult.focus,
    focus_roll: focusResult.focus_roll,
    focus_range: focusResult.focus_range,
    meaning_action: meaningResult.verb,
    meaning_subject: meaningResult.subject,
    meaning_roll_verb: meaningResult.verb_roll,
    meaning_roll_subject: meaningResult.subject_roll,
    meaning: meaningResult.meaning,
    description: `Random event involves ${focusResult.focus}: ${meaningResult.meaning}`,
  };
}

/**
 * Process complete scene setup including chaos roll and potential random events
 */
export function processSceneSetup(chaosFactor: number = 5): SceneSetupResult {
  const chaosResult = rollChaosFactor(chaosFactor);

  const result: SceneSetupResult = {
    chaos_roll: chaosResult.chaos_roll,
    chaos_factor: chaosResult.chaos_factor,
    scene_type: chaosResult.scene_type,
    random_event: null,
  };

  // Generate random event for altered or interrupted scenes
  if (
    chaosResult.scene_type === "altered" ||
    chaosResult.scene_type === "interrupted"
  ) {
    result.random_event = generateRandomEvent();
  }

  return result;
}

/**
 * Process multiple fate roll questions
 */
export function processFateRolls(
  fateQuestions: FateQuestion[],
  chaosFactor: number = 5,
): FateRollResult[] {
  const results: FateRollResult[] = [];

  for (const question of fateQuestions) {
    const likelihood = question.likelihood || "50/50";
    const fateResult = rollFateChart(likelihood, chaosFactor);

    results.push({
      question: question.question || "Unknown question",
      likelihood,
      roll: fateResult.roll,
      threshold: fateResult.threshold,
      result: fateResult.result,
      success: fateResult.success,
      exceptional: fateResult.exceptional,
      doubles: fateResult.doubles,
      random_event: fateResult.random_event,
    });
  }

  return results;
}

/**
 * Generate a unique scene ID
 */
export function generateSceneId(): string {
  const timestamp = Math.floor(Math.random() * 1000000);
  const randomPart = Array.from({ length: 9 }, () =>
    "abcdefghijklmnopqrstuvwxyz0123456789".charAt(
      Math.floor(Math.random() * 36),
    ),
  ).join("");
  return `scene_${timestamp}_${randomPart}`;
}

/**
 * Command interface for API compatibility
 */
export interface SceneGeneratorCommand {
  command: string;
  chaos_factor?: number;
  fate_questions?: FateQuestion[];
}

export interface SceneGeneratorResult {
  success: boolean;
  data?: any;
  error?: string;
}

/**
 * Process scene generator commands (API compatibility layer)
 */
export function executeSceneCommand(
  command: string,
  args: any[] = [],
): SceneGeneratorResult {
  try {
    switch (command) {
      case "chaos_roll": {
        const chaosFactor = args[0] || 5;
        const result = rollChaosFactor(chaosFactor);
        return { success: true, data: result };
      }

      case "random_event": {
        const result = generateRandomEvent();
        return { success: true, data: result };
      }

      case "scene_setup": {
        const chaosFactor = args[0] || 5;
        const result = processSceneSetup(chaosFactor);
        return { success: true, data: result };
      }

      case "fate_rolls": {
        const fateQuestions = args[0] || [];
        const chaosFactor = args[1] || 5;
        const result = processFateRolls(fateQuestions, chaosFactor);
        return { success: true, data: result };
      }

      case "scene_id": {
        const result = { scene_id: generateSceneId() };
        return { success: true, data: result };
      }

      default:
        return {
          success: false,
          error: `Unknown command: ${command}`,
        };
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
