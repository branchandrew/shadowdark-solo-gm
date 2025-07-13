import { RequestHandler } from "express";
import Anthropic from "@anthropic-ai/sdk";
import { spawn } from "child_process";
import path from "path";
import { AIChatRequest, AIChatResponse } from "@shared/api";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

/**
 * Executes the AI Fallback Python script and returns the result
 */
const runAIFallback = (): Promise<any> =>
  new Promise((resolve, reject) => {
    const scriptPath = path.join(__dirname, "..", "scripts", "ai_fallbacks.py");
    const proc = spawn("python3", [scriptPath]);

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
        reject(new Error("Invalid JSON from AI Fallback script"));
      }
    });
  });

export const handleAIChat: RequestHandler = async (req, res) => {
  const { message, context } = req.body as AIChatRequest;

  try {
    console.log("API Key present:", !!process.env.ANTHROPIC_API_KEY);
    console.log("API Key length:", process.env.ANTHROPIC_API_KEY?.length);
    console.log(
      "API Key starts with:",
      process.env.ANTHROPIC_API_KEY?.substring(0, 10),
    );

    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error("ANTHROPIC_API_KEY environment variable is not set");
    }

    const systemPrompt = `You are an AI Game Master for a solo Shadowdark TTRPG adventure using the Mythic GME system.

Current Adventure Context:
- Chaos Factor: ${context?.chaosFactor || 5}
- Current Scene: ${context?.currentScene || "Unknown"}
- Active Plot Threads: ${context?.activeThreads?.join(", ") || "None"}

Your Role:
- Respond to player actions with dramatic, atmospheric descriptions
- Use the Mythic GME system to determine outcomes when uncertain
- Suggest dice rolls when appropriate (d20 for general actions, d100 for oracle questions)
- Keep responses concise but evocative (2-3 sentences typically)
- Maintain the dark, mysterious tone of Shadowdark
- Never break character or reveal meta-game information
- When uncertain about outcomes, suggest oracle questions or dice rolls

Player's Action: "${message}"

Respond as the GM would, describing what happens and asking for any necessary rolls or decisions.`;

    const claudeResponse = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 300,
      temperature: 0.7,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: message,
        },
      ],
    });

    const responseText =
      claudeResponse.content[0].type === "text"
        ? claudeResponse.content[0].text
        : "I couldn't process that action. Please try again.";

    const response: AIChatResponse = {
      response: responseText,
      suggestions: [
        "Roll d20",
        "Ask oracle question",
        "Search area",
        "Listen carefully",
      ],
    };

    res.json(response);
  } catch (error) {
    console.error("Claude API Error:", error);

    // Return a clear error instead of fallback
    res.status(500).json({
      success: false,
      error: `AI Chat failed: ${error instanceof Error ? error.message : "Unknown error"}`,
    });
    return;
  }
};
