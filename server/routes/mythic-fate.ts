import { RequestHandler } from "express";
import {
  rollFateChart as rollFateChartTS,
  FateChartResult,
  getLikelihoodOptions,
  isValidLikelihood,
} from "../lib/mythic-fate-chart";

interface MeaningTableResult {
  verb_roll: number;
  verb: string;
  verb_index: number;
  subject_roll: number;
  subject: string;
  subject_index: number;
  meaning: string;
}

interface RandomEvent {
  event_roll: number;
  event_type: string;
  event_range: string;
  meaning_table?: MeaningTableResult;
}

interface FateRollResult {
  roll: number;
  threshold: number;
  success: boolean;
  exceptional: boolean;
  result: string;
  likelihood: string;
  chaos_factor: number;
  likelihood_index: number;
  doubles: boolean;
  random_event?: RandomEvent;
}

interface FateRollRequest {
  likelihood?: string;
  chaos_factor?: number;
}

/**
 * Executes the Mythic Fate Chart using TypeScript implementation
 */
const runFateChart = (
  likelihood: string = "50/50",
  chaosFactor: number = 5,
): Promise<FateChartResult> => {
  try {
    const result = rollFateChartTS(likelihood, chaosFactor);
    return Promise.resolve(result);
  } catch (error) {
    return Promise.reject(
      new Error(
        error instanceof Error ? error.message : "Fate chart error occurred",
      ),
    );
  }
};

/**
 * Express handler: rolls on the Mythic Fate Chart
 */
export const rollFateChart: RequestHandler = async (req, res) => {
  try {
    const { likelihood = "50/50", chaos_factor = 5 }: FateRollRequest =
      req.body || {};

    console.log("Rolling Fate Chart with:", { likelihood, chaos_factor });

    // Validate chaos factor
    const validChaosFactor = Math.max(
      1,
      Math.min(9, Number(chaos_factor) || 5),
    );

    const result = await runFateChart(likelihood, validChaosFactor);

    console.log("Fate Chart result:", result);

    // Ensure all required fields are present
    const response = {
      success: true,
      roll: result.roll || 0,
      threshold: result.threshold || 0,
      result_success: result.success || false, // Renamed to avoid conflict with API success
      exceptional: result.exceptional || false,
      result: result.result || "Unknown",
      likelihood: result.likelihood || likelihood,
      chaos_factor: result.chaos_factor || validChaosFactor,
      likelihood_index: result.likelihood_index || 0,
      doubles: result.doubles || false,
      random_event: result.random_event || null,
      timestamp: new Date().toISOString(),
    };

    console.log("Sending response:", response);
    res.json(response);
  } catch (error) {
    console.error("Error rolling Fate Chart:", error);
    console.error("Error details:", {
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    });

    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
      details: error instanceof Error ? error.stack : undefined,
    });
  }
};
