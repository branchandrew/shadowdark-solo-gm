import { RequestHandler } from "express";
import Anthropic from "@anthropic-ai/sdk";
import { AIChatRequest, AIChatResponse } from "@shared/api";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
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

    // Fallback response if Claude API fails
    const fallbackResponses = [
      "The shadows shift mysteriously around you. What do you do next?",
      "Your torch flickers as you sense something watching from the darkness.",
      "The ancient stones seem to whisper forgotten secrets. Roll a d20 for perception.",
      "A chill wind carries the scent of danger. How do you proceed?",
    ];

    const fallbackResponse =
      fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];

    const response: AIChatResponse = {
      response: `${fallbackResponse} (AI temporarily unavailable - using fallback response)`,
      suggestions: [
        "Roll d20",
        "Ask oracle question",
        "Search area",
        "Listen carefully",
      ],
    };

    res.json(response);
  }
};
