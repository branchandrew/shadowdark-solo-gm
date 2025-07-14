import { RequestHandler } from "express";
import { relationalDB } from "../lib/relational-database";
import {
  getVillainTypes,
  SHADOWDARK_VILLAIN_TYPES,
} from "../lib/adventure-utilities";

/**
 * Gets creature types from Python script (source of truth)
 */
const getCreatureTypesFromPython = (): Promise<string[]> =>
  new Promise((resolve, reject) => {
    const scriptPath = path.join(
      __dirname,
      "..",
      "scripts",
      "adventure_generator.py",
    );

    const proc = spawn("python3", [scriptPath, "get_villain_types"]);

    let stdout = "";
    let stderr = "";

    proc.stdout.on("data", (d) => (stdout += d));
    proc.stderr.on("data", (d) => (stderr += d));

    proc.on("close", (code) => {
      if (code !== 0) {
        return reject(
          new Error(`Script failed: ${stderr || `exited with code ${code}`}`),
        );
      }

      try {
        const result = JSON.parse(stdout.trim());
        resolve(result.villain_types || []);
      } catch {
        reject(new Error("Invalid JSON from villain types script"));
      }
    });
  });

/**
 * Fallback creature types (in case Python script fails)
 */
const FALLBACK_CREATURE_TYPES = [
  "Human",
  "Elf",
  "Dwarf",
  "Halfling",
  "Hobgoblin",
  "Drow",
  "Duergar",
  "Giant",
  "Devil",
  "Demon",
  "Elemental",
  "Fairy",
  "Oni",
  "Hag",
  "Dragon",
  "Orc",
  "Goblin",
  "Skeleton",
  "Zombie",
  "Ghost",
  "Spirit",
  "Wraith",
  "Vampire",
  "Werewolf",
  "Troll",
  "Ogre",
  "Golem",
  "Construct",
  "Undead",
  "Fiend",
  "Celestial",
  "Fey",
  "Beast",
  "Monstrosity",
];

/**
 * GET /api/creature-types
 * Returns all available creature types
 */
export const getCreatureTypes: RequestHandler = async (req, res) => {
  try {
    let creatureTypes: string[] = [];

    // Try to get from Python script first (source of truth)
    try {
      creatureTypes = await getCreatureTypesFromPython();
      console.log(
        `Loaded ${creatureTypes.length} creature types from Python script`,
      );
    } catch (error) {
      console.warn(
        "Failed to get creature types from Python script, using fallback:",
        error,
      );
      creatureTypes = FALLBACK_CREATURE_TYPES;
    }

    // If database is available, sync the types
    if (relationalDB.supabase) {
      try {
        await syncCreatureTypesToDatabase(creatureTypes);
      } catch (error) {
        console.warn("Failed to sync creature types to database:", error);
      }
    }

    res.json({
      success: true,
      creature_types: creatureTypes,
      source: creatureTypes === FALLBACK_CREATURE_TYPES ? "fallback" : "python",
    });
  } catch (error) {
    console.error("Error getting creature types:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      creature_types: FALLBACK_CREATURE_TYPES,
      source: "fallback",
    });
  }
};

/**
 * Syncs creature types to database
 */
async function syncCreatureTypesToDatabase(types: string[]): Promise<void> {
  if (!relationalDB.supabase) return;

  try {
    // Clear existing shadowdark_villain types
    await relationalDB.supabase
      .from("creature_types")
      .delete()
      .eq("category", "shadowdark_villain");

    // Insert new types
    const typeData = types.map((type, index) => ({
      name: type,
      category: "shadowdark_villain",
      description: `Shadowdark villain type: ${type}`,
    }));

    const { error } = await relationalDB.supabase
      .from("creature_types")
      .insert(typeData);

    if (error) {
      throw new Error(`Database sync failed: ${error.message}`);
    }

    console.log(`Synced ${types.length} creature types to database`);
  } catch (error) {
    console.error("Failed to sync creature types to database:", error);
    throw error;
  }
}
