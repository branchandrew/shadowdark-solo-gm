import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Send, Brain, Wand2, Dices, Target, BookOpen } from "lucide-react";
import { AIChatRequest, AIChatResponse } from "@shared/api";
import DiceRoller from "./DiceRoller";

interface Message {
  id: string;
  type: "user" | "gm" | "system" | "fate";
  content: string;
  timestamp: Date;
}

export default function AIChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      type: "gm",
      content:
        "Welcome, adventurer! I am your AI Game Master. I'll guide you through your solo Shadowdark adventure using the Mythic GME system. What would you like to do?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [chaosFactor, setChaosFactor] = useState(5);
  const [fateLogLikelihood, setFateLogLikelihood] = useState("50/50");
  const [showFateControls, setShowFateControls] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Find the ScrollArea's viewport and scroll to bottom
    const scrollViewport = document.querySelector(
      "[data-radix-scroll-area-viewport]",
    );
    if (scrollViewport) {
      scrollViewport.scrollTop = scrollViewport.scrollHeight;
    }
  }, [messages]);

  // Development mode: start fresh each time, no auto-loading
  useEffect(() => {
    console.log(
      "AIChatEnhanced: Starting fresh with chaos factor 5 (development mode)",
    );
    // No auto-loading during development - always start with default
  }, []);

  // Development mode: save only for current session
  useEffect(() => {
    localStorage.setItem("shadowdark_chaos_factor", chaosFactor.toString());
    console.log(
      "AIChatEnhanced: Saved chaos factor to localStorage (session-only during development)",
    );
  }, [chaosFactor]);

  // Listen for external messages (like from BTS panel)
  useEffect(() => {
    const handleExternalMessage = (event: CustomEvent) => {
      const { type, content, timestamp } = event.detail;
      const newMessage: Message = {
        id: Date.now().toString(),
        type,
        content,
        timestamp: timestamp || new Date(),
      };
      setMessages((prev) => [...prev, newMessage]);
    };

    window.addEventListener(
      "addChatMessage",
      handleExternalMessage as EventListener,
    );

    return () => {
      window.removeEventListener(
        "addChatMessage",
        handleExternalMessage as EventListener,
      );
    };
  }, []);

  const rollFateChart = async () => {
    console.log("Starting Fate Chart roll with:", {
      fateLogLikelihood,
      chaosFactor,
    });

    try {
      // Call the fate chart API - this is separate from AI/Claude
      const response = await fetch("/api/roll-fate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          likelihood: fateLogLikelihood,
          chaos_factor: chaosFactor,
        }),
      });

      console.log("Fate Chart API response status:", response.status);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Fate Chart API response data:", data);

      if (data.success) {
        // Validate that we have the required data
        if (
          typeof data.roll === "undefined" ||
          typeof data.threshold === "undefined"
        ) {
          throw new Error(
            `Invalid response data: missing roll (${data.roll}) or threshold (${data.threshold})`,
          );
        }

        let resultMessage = `🎲 **Fate Chart Roll**

**Question Likelihood:** ${data.likelihood || fateLogLikelihood}
**Chaos Factor:** ${data.chaos_factor || chaosFactor}
**Roll:** ${data.roll} (needed ≤${data.threshold})${data.doubles ? " 🎯 DOUBLES!" : ""}
**Result:** ${data.result || "Unknown"}${data.exceptional ? " ✨" : ""}

*${
          data.result_success
            ? data.exceptional
              ? "An exceptional yes - something surprisingly beneficial happens!"
              : "Yes, it happens as expected."
            : data.exceptional
              ? "An exceptional no - something goes wrong or backfires!"
              : "No, it doesn't happen."
        }*`;

        // Add random event if doubles were rolled (and not exceptional)
        if (data.random_event) {
          resultMessage += `

🎲 **Random Event Triggered!**
**Event Roll:** ${data.random_event.event_roll} (${data.random_event.event_range})
**Event Type:** ${data.random_event.event_type}`;

          // Add meaning table if it was automatically rolled
          if (data.random_event.meaning_table) {
            resultMessage += `

📖 **Auto-Generated Meaning**
**Action:** ${data.random_event.meaning_table.verb} (rolled ${data.random_event.meaning_table.verb_roll})
**Subject:** ${data.random_event.meaning_table.subject} (rolled ${data.random_event.meaning_table.subject_roll})
**Combined:** ${data.random_event.meaning_table.meaning}`;
          }

          resultMessage += `

*A random event occurs! Consider how this event type manifests in your current scene.*`;
        }

        // Create a fate roll message - this is LOCAL ONLY, not sent to AI
        const fateMessage: Message = {
          id: Date.now().toString(),
          type: "fate", // Use "fate" type to distinguish from regular system messages
          content: resultMessage,
          timestamp: new Date(),
        };

        // Add to local chat display only - no AI/Claude involvement
        setMessages((prev) => [...prev, fateMessage]);

        // Close the popover after successful roll
        setShowFateControls(false);
      } else {
        console.error("Fate chart roll failed. Full response:", data);

        // Show error message locally with details
        const errorMessage: Message = {
          id: Date.now().toString(),
          type: "fate",
          content: `❌ Fate Chart roll failed: ${data.error || "Unknown error"}`,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error("Error rolling fate chart:", error);
      console.error("Error type:", typeof error);
      console.error("Error details:", error);

      // Show error message locally
      const errorMessage: Message = {
        id: Date.now().toString(),
        type: "fate",
        content: `❌ Unable to roll Fate Chart: ${error instanceof Error ? error.message : String(error)}`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    }
  };

  const rollMeaningTable = async () => {
    console.log("Rolling Meaning Table (Action/Subject)");

    try {
      const response = await fetch("/api/roll-meaning", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      console.log("Meaning Table API response status:", response.status);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Meaning Table API response data:", data);

      if (data.success) {
        const resultMessage = `📖 **Meaning Table Roll**

**Action (Verb):** ${data.verb} (rolled ${data.verb_roll})
**Subject:** ${data.subject} (rolled ${data.subject_roll})
**Combined Meaning:** ${data.meaning}

*Use this meaning to inspire events, NPC actions, or scene elements.*`;

        // Create a meaning table message
        const meaningMessage: Message = {
          id: Date.now().toString(),
          type: "fate", // Use same styling as fate rolls
          content: resultMessage,
          timestamp: new Date(),
        };

        // Add to local chat display only
        setMessages((prev) => [...prev, meaningMessage]);
      } else {
        console.error("Meaning table roll failed. Full response:", data);

        const errorMessage: Message = {
          id: Date.now().toString(),
          type: "fate",
          content: `❌ Meaning Table roll failed: ${data.error || "Unknown error"}`,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error("Error rolling meaning table:", error);

      const errorMessage: Message = {
        id: Date.now().toString(),
        type: "fate",
        content: `❌ Unable to roll Meaning Table: ${error instanceof Error ? error.message : String(error)}`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Call AI chat API - this sends messages to Claude/AI
    // Note: Fate Chart rolls are handled separately and do NOT go through this function
    try {
      const requestBody: AIChatRequest = {
        message: input,
        context: {
          chaosFactor: chaosFactor,
          currentScene: "Shadowbrook Village - investigating missing villagers",
          activeThreads: [
            "Investigate the missing villagers",
            "Find the ancient tomb entrance",
          ],
        },
      };

      const response = await fetch("/api/ai-chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      const data: AIChatResponse = await response.json();
      const gmResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: "gm",
        content: data.response,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, gmResponse]);
    } catch (error) {
      console.error("Error calling AI:", error);
      const errorResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: "gm",
        content: "Sorry, I encountered an error. Please try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorResponse]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Brain className="h-5 w-5 text-primary" />
          AI Game Master
          <Wand2 className="h-4 w-4 text-accent" />
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-4 pt-0 h-0">
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full pr-2">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.type === "user"
                        ? "bg-primary text-primary-foreground ml-auto"
                        : message.type === "system"
                          ? "bg-blue-50 border border-blue-200 text-blue-900 dark:bg-blue-950 dark:border-blue-800 dark:text-blue-100"
                          : message.type === "fate"
                            ? "bg-purple-50 border border-purple-200 text-purple-900 dark:bg-purple-950 dark:border-purple-800 dark:text-purple-100"
                            : "bg-muted text-muted-foreground"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">
                      {message.content}
                    </p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-muted text-muted-foreground rounded-lg p-3 max-w-[80%]">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-current rounded-full animate-bounce"></div>
                      <div
                        className="w-2 h-2 bg-current rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-current rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        <div className="mt-4 flex-shrink-0 space-y-2">
          <div className="flex gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Describe your action or ask the GM a question..."
              className="flex-1 min-h-[60px] max-h-[120px] resize-none"
              disabled={isLoading}
            />
            <div className="flex flex-col gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-[28px] w-[60px]"
                  >
                    <Dices className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-0" align="end">
                  <div className="h-[500px]">
                    <DiceRoller />
                  </div>
                </PopoverContent>
              </Popover>
              <Popover
                open={showFateControls}
                onOpenChange={setShowFateControls}
              >
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    size="icon"
                    variant="outline"
                    className="h-[28px] w-[60px]"
                  >
                    <Target className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-0" align="end">
                  <div className="p-4 space-y-3">
                    {/* Header with title and close button */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <Target className="h-4 w-4" />
                        Mythic Fate Chart
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => setShowFateControls(false)}
                      >
                        ✕
                      </Button>
                    </div>

                    {/* Fate Chart Controls */}
                    <div className="grid grid-cols-1 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs text-muted-foreground">
                          Likelihood
                        </label>
                        <Select
                          value={fateLogLikelihood}
                          onValueChange={setFateLogLikelihood}
                        >
                          <SelectTrigger className="h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Impossible">
                              Impossible
                            </SelectItem>
                            <SelectItem value="Nearly Impossible">
                              Nearly Impossible
                            </SelectItem>
                            <SelectItem value="Very Unlikely">
                              Very Unlikely
                            </SelectItem>
                            <SelectItem value="Unlikely">Unlikely</SelectItem>
                            <SelectItem value="50/50">50/50</SelectItem>
                            <SelectItem value="Likely">Likely</SelectItem>
                            <SelectItem value="Very Likely">
                              Very Likely
                            </SelectItem>
                            <SelectItem value="Nearly Certain">
                              Nearly Certain
                            </SelectItem>
                            <SelectItem value="Certain">Certain</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs text-muted-foreground">
                          Chaos Factor
                        </label>
                        <Select
                          value={chaosFactor.toString()}
                          onValueChange={(v) => setChaosFactor(parseInt(v))}
                        >
                          <SelectTrigger className="h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                              <SelectItem key={num} value={num.toString()}>
                                {num}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <Button
                        onClick={rollFateChart}
                        className="h-9 w-full"
                        size="sm"
                      >
                        Roll Fate
                      </Button>
                    </div>

                    <div className="flex items-center gap-1 text-xs text-muted-foreground border-t pt-2">
                      <Badge variant="outline" className="text-xs">
                        CF: {chaosFactor}
                      </Badge>
                      <span>Ask yes/no questions about story events</span>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
              <Button
                onClick={rollMeaningTable}
                variant="outline"
                size="icon"
                className="h-[28px] w-[60px]"
                title="Roll Meaning Table (Action/Subject)"
              >
                <BookOpen className="h-4 w-4" />
              </Button>
              <Button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                size="icon"
                className="h-[28px] w-[60px]"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
