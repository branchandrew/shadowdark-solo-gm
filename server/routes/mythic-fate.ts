import { RequestHandler } from "express";
import { spawn } from "child_process";
import path from "path";

interface FateRollResult {
  roll: number;
  threshold: number;
  success: boolean;
  exceptional: boolean;
  result: string;
  likelihood: string;
  chaos_factor: number;
  likelihood_index: number;
}

interface FateRollRequest {
  likelihood?: string;
  chaos_factor?: number;
}

/**
 * Executes the Mythic Fate Chart Python script and returns the result
 */
const runFateChart = (
  likelihood: string = "50/50",
  chaosFactor: number = 5,
): Promise<FateRollResult> =>
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

    res.json({
      success: true,
      ...result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error rolling Fate Chart:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    });
  }
};
