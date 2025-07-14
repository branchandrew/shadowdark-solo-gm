import { RequestHandler } from "express";
import {
  rollMeaningTable as rollMeaningTableTS,
  MeaningTableResult,
} from "../lib/mythic-meaning-table";

interface MeaningTableResult {
  verb_roll: number;
  verb: string;
  verb_index: number;
  subject_roll: number;
  subject: string;
  subject_index: number;
  meaning: string;
}

/**
 * Executes the Mythic Meaning Table using TypeScript implementation
 */
const runMeaningTable = (): Promise<MeaningTableResult> => {
  try {
    const result = rollMeaningTableTS();
    return Promise.resolve(result);
  } catch (error) {
    return Promise.reject(
      new Error(
        error instanceof Error ? error.message : "Meaning table error occurred",
      ),
    );
  }
};

/**
 * Express handler: rolls on the Mythic Meaning Table
 */
export const rollMeaningTable: RequestHandler = async (req, res) => {
  try {
    console.log("Rolling Meaning Table (Action/Subject)");

    const result = await runMeaningTable();

    console.log("Meaning Table result:", result);

    const response = {
      success: true,
      verb_roll: result.verb_roll || 0,
      verb: result.verb || "Unknown",
      verb_index: result.verb_index || 0,
      subject_roll: result.subject_roll || 0,
      subject: result.subject || "Unknown",
      subject_index: result.subject_index || 0,
      meaning: result.meaning || "Unknown Unknown",
      timestamp: new Date().toISOString(),
    };

    console.log("Sending response:", response);
    res.json(response);
  } catch (error) {
    console.error("Error rolling Meaning Table:", error);
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
