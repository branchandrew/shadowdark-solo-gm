import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import { handleAIChat } from "./routes/ai-chat";

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

  return app;
}
