import { Request, Response } from "express";
import { relationalDB } from "../lib/relational-database.js";

interface SessionDataRequest {
  session_id: string;
}

export async function getSessionData(req: Request, res: Response) {
  try {
    const { session_id }: SessionDataRequest = req.body;

    if (!session_id) {
      return res.status(400).json({
        success: false,
        error: "Session ID is required",
      });
    }

    console.log("Getting session data for:", session_id);

    if (!relationalDB.isAvailable()) {
      return res.status(503).json({
        success: false,
        error: "Database not available",
      });
    }

    // Get all session data from database
    const [creatures, factions, clues, threads] = await Promise.all([
      relationalDB.getCreatures(session_id),
      relationalDB.getFactions(session_id),
      relationalDB.getClues(session_id),
      relationalDB.getThreads(session_id),
    ]);

    const sessionData = {
      creatures: creatures || [],
      factions: factions || [],
      clues: clues || [],
      threads: threads || [],
    };

    console.log(
      "Retrieved session data:",
      JSON.stringify(sessionData, null, 2),
    );

    res.json({
      success: true,
      data: sessionData,
    });
  } catch (error) {
    console.error("Session data retrieval error:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    });
  }
}
