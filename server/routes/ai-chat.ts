import { RequestHandler } from "express";

export interface AIChatRequest {
  message: string;
  context?: {
    chaosFactor: number;
    currentScene?: string;
    activeThreads?: string[];
  };
}

export interface AIChatResponse {
  response: string;
  suggestions?: string[];
  oracle?: {
    question: string;
    answer: "yes" | "no" | "maybe";
    confidence: number;
  };
}

export const handleAIChat: RequestHandler = (req, res) => {
  const { message, context } = req.body as AIChatRequest;

  // TODO: Integrate with Claude 3.5 API
  // For now, return a placeholder response

  const responses = [
    "The shadows deepen as you proceed. Roll a d20 for perception.",
    "The ancient stones whisper secrets of ages past. What do you wish to investigate?",
    "A distant sound echoes through the corridors. It could be friend or foe...",
    "The air grows thick with magic. Your character senses something powerful nearby.",
    "The Mythic oracle suggests an unexpected encounter approaches...",
  ];

  const randomResponse =
    responses[Math.floor(Math.random() * responses.length)];

  const response: AIChatResponse = {
    response: randomResponse,
    suggestions: [
      "Roll for initiative",
      "Search the area",
      "Listen carefully",
      "Cast a spell",
    ],
  };

  // Simulate API delay
  setTimeout(
    () => {
      res.json(response);
    },
    1000 + Math.random() * 1500,
  );
};
