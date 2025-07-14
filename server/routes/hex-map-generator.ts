import { RequestHandler } from "express";
import { spawn } from "child_process";
import path from "path";
import { relationalDB } from "../lib/relational-database";

export interface HexMapResponse {
  success: boolean;
  width?: number;
  height?: number;
  terrains?: string[];
  hexes?: Array<{
    row: number;
    col: number;
    terrain: string;
    id: string;
  }>;
  error?: string;
}

/**
 * Generates a hex map using the Python script
 */
const generateHexMap = (
  width: number = 15,
  height: number = 10,
  seed?: number,
): Promise<HexMapResponse> =>
  new Promise((resolve, reject) => {
    const scriptPath = path.join(
      __dirname,
      "..",
      "scripts",
      "hex_map_generator.py",
    );

    const args = ["generate", width.toString(), height.toString()];
    if (seed !== undefined) {
      args.push(seed.toString());
    }

    const proc = spawn("python3", [scriptPath, ...args]);

    let stdout = "";
    let stderr = "";

    proc.stdout.on("data", (d) => (stdout += d));
    proc.stderr.on("data", (d) => (stderr += d));

    proc.on("close", (code) => {
      if (code !== 0) {
        return resolve({
          success: false,
          error: stderr || `Script exited with code ${code}`,
        });
      }

      try {
        const result = JSON.parse(stdout.trim());
        resolve(result);
      } catch {
        resolve({
          success: false,
          error: "Invalid JSON from hex map generator script",
        });
      }
    });
  });

/**
 * Gets available terrain types from database or fallback to Python script
 */
const getTerrainTypes = async (): Promise<{
  success: boolean;
  terrains?: string[];
  compatibility_matrix?: any;
  error?: string;
}> => {
  try {
    // Try to get terrain types from database first
    if (relationalDB.supabase) {
      const { data, error } = await relationalDB.supabase
        .from("terrain_types")
        .select("name, description, symbol, compatibility_data")
        .eq("category", "shadowdark_standard")
        .order("name");

      if (!error && data && data.length > 0) {
        const terrains = data.map((t) => t.name);
        console.log(`Loaded ${terrains.length} terrain types from database`);

        return {
          success: true,
          terrains,
          compatibility_matrix: {}, // TODO: Build from database data
          source: "database",
        };
      }
    }

    // Fallback to Python script
    return new Promise((resolve) => {
      const scriptPath = path.join(
        __dirname,
        "..",
        "scripts",
        "hex_map_generator.py",
      );

      const proc = spawn("python3", [scriptPath, "terrains"]);

      let stdout = "";
      let stderr = "";

      proc.stdout.on("data", (d) => (stdout += d));
      proc.stderr.on("data", (d) => (stderr += d));

      proc.on("close", (code) => {
        if (code !== 0) {
          return resolve({
            success: false,
            error: stderr || `Script exited with code ${code}`,
          });
        }

        try {
          const result = JSON.parse(stdout.trim());
          result.source = "python";
          resolve(result);
        } catch {
          resolve({
            success: false,
            error: "Invalid JSON from terrain types script",
          });
        }
      });
    });
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

/**
 * POST /api/generate-hex-map
 * Generates a hex map with terrain clustering
 */
export const generateHexMapEndpoint: RequestHandler = async (req, res) => {
  try {
    const { width = 15, height = 10, seed } = req.body || {};

    // Validate parameters
    if (width < 1 || width > 50 || height < 1 || height > 50) {
      return res.status(400).json({
        success: false,
        error: "Map dimensions must be between 1 and 50",
      });
    }

    console.log(
      `Generating hex map: ${width}x${height}, seed: ${seed || "random"}`,
    );

    const result = await generateHexMap(width, height, seed);

    if (!result.success) {
      return res.status(500).json(result);
    }

    console.log(`Generated hex map with ${result.hexes?.length} hexes`);

    res.json(result);
  } catch (error) {
    console.error("Error generating hex map:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * GET /api/hex-map-terrains
 * Returns available terrain types and compatibility matrix
 */
export const getHexMapTerrains: RequestHandler = async (req, res) => {
  try {
    console.log("Getting hex map terrain types...");

    const result = await getTerrainTypes();

    if (!result.success) {
      return res.status(500).json(result);
    }

    console.log(`Retrieved ${result.terrains?.length} terrain types`);

    res.json(result);
  } catch (error) {
    console.error("Error getting terrain types:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * GET /api/test-hex-map
 * Generates a test map for debugging
 */
export const testHexMap: RequestHandler = async (req, res) => {
  try {
    const scriptPath = path.join(
      __dirname,
      "..",
      "scripts",
      "hex_map_generator.py",
    );

    const proc = spawn("python3", [scriptPath, "test"]);

    let stdout = "";
    let stderr = "";

    proc.stdout.on("data", (d) => (stdout += d));
    proc.stderr.on("data", (d) => (stderr += d));

    proc.on("close", (code) => {
      if (code !== 0) {
        return res.status(500).json({
          success: false,
          error: stderr || `Script exited with code ${code}`,
        });
      }

      // Return the ASCII output for debugging
      res.json({
        success: true,
        ascii_output: stdout,
      });
    });
  } catch (error) {
    console.error("Error testing hex map:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
