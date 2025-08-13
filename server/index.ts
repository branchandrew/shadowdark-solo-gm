import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import { handleAIChat } from "./routes/ai-chat";
import { generateAdventure } from "./routes/adventure-generator";
import { generateScene } from "./routes/scene-generator";
import { rollFateChart } from "./routes/mythic-fate";
import { rollMeaningTable, rollDescriptorTable } from "./routes/mythic-meaning";
import { getSessionData } from "./routes/session-data";
import { getCreatureTypes } from "./routes/creature-types";
import {
  generateHexMapEndpoint,
  getHexMapTerrains,
  testHexMap,
} from "./routes/hex-map-generator";
import {
  generateCompleteNPC,
  generateNPCStepRoute,
  generateNPCNarrative,
} from "./routes/npc-generator";
import {
  generateCompleteSteading,
  generateSteadingStepRoute,
  generateSteadingNarrative,
  getSettlementTypes,
} from "./routes/steading-generator";
import { villainGenerator } from "./routes/villain-generator";
import { generateNamesRoute, getAlignmentOptionsRoute } from "./routes/name-generator";
import { generateCursesRoute, getCurseCountRoute, getCurseCategoriesRoute } from "./routes/curse-generator";
import { generateDangersRoute, generateDangerNarrativeRoute } from "./routes/danger-generator";

// Load environment variables if .env file exists
if (process.env.NODE_ENV !== "production") {
  try {
    require("dotenv").config();
  } catch {
    // dotenv not available, continue without it
  }
}

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    res.json({ message: "Hello from Express server v2!" });
  });

  app.get("/api/demo", handleDemo);
  app.post("/api/ai-chat", handleAIChat);
  app.post("/api/generate-adventure", generateAdventure);
  app.post("/api/generate-scene", generateScene);
  app.post("/api/roll-fate", rollFateChart);
  app.post("/api/roll-meaning", rollMeaningTable);
  app.post("/api/roll-descriptor", rollDescriptorTable);
  app.post("/api/get-session-data", getSessionData);
  app.get("/api/creature-types", getCreatureTypes);
  app.post("/api/generate-hex-map", generateHexMapEndpoint);
  app.get("/api/hex-map-terrains", getHexMapTerrains);
  app.get("/api/test-hex-map", testHexMap);
  app.post("/api/generate-npc", generateCompleteNPC);
  app.post("/api/generate-npc-step", generateNPCStepRoute);
  app.post("/api/generate-npc-narrative", generateNPCNarrative);

  // Steading generator routes
  app.post("/api/generate-steading", generateCompleteSteading);
  app.post("/api/generate-steading-step", generateSteadingStepRoute);
  app.post("/api/generate-steading-narrative", generateSteadingNarrative);
  app.get("/api/settlement-types", getSettlementTypes);

  // Villain generator routes
  app.post("/api/villain-generator", villainGenerator);

  // Name generator routes
  app.post("/api/generate-names", generateNamesRoute);
  app.get("/api/alignment-options", getAlignmentOptionsRoute);

  // Curse generator routes
  app.post("/api/generate-curses", generateCursesRoute);
  app.get("/api/curse-count", getCurseCountRoute);
  app.get("/api/curse-categories", getCurseCategoriesRoute);

  // Danger generator routes
  app.post("/api/generate-dangers", generateDangersRoute);
  app.post("/api/generate-danger-narrative", generateDangerNarrativeRoute);

  return app;
}
