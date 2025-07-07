import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Eye,
  Crown,
  Skull,
  Users,
  Zap,
  Play,
  FileText,
  Settings,
  RefreshCw,
} from "lucide-react";

interface AdventureArc {
  bbeg: {
    name: string;
    description: string;
    motivation: string;
    hook: string;
  };
  secrets: string[];
  highTowerSurprise: string;
  lieutenants: Array<{
    name: string;
    role: string;
    description: string;
  }>;
  minions: Array<{
    type: string;
    count: number;
    description: string;
  }>;
}

export default function BTSPanel() {
  const [adventureArc, setAdventureArc] = useState<AdventureArc | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [scriptInput, setScriptInput] = useState("");
  const [promptInput, setPromptInput] = useState("");
  const [scriptOutput, setScriptOutput] = useState("");
  const [promptOutput, setPromptOutput] = useState("");
  const [isRunningScript, setIsRunningScript] = useState(false);
  const [isRunningPrompt, setIsRunningPrompt] = useState(false);

  const regenerateAdventure = async () => {
    console.log("Starting regenerate adventure...");
    setIsGenerating(true);

    try {
      console.log("Making fetch request to /api/generate-adventure...");
      const response = await fetch("/api/generate-adventure", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      console.log("Response status:", response.status);
      console.log("Response ok:", response.ok);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Received data:", data);

      if (data.success) {
        console.log("Adventure generation succeeded! BBEG:", data.bbeg_name);

        // Use the new response structure
        const newAdventure: AdventureArc = {
          bbeg: {
            name: data.bbeg_name,
            description: data.bbeg_detailed_description,
            motivation: data.bbeg_motivation,
            hook: data.bbeg_hook,
          },
          secrets: [
            "Secret 1 from generated profile",
            "Secret 2 from generated profile",
            "Secret 3 from generated profile",
            "Secret 4 from generated profile",
          ],
          highTowerSurprise: "High tower surprise from generated profile",
          lieutenants: [
            {
              name: "Lieutenant from profile",
              role: "Role from generated content",
              description: "Details from generated profile",
            },
          ],
          minions: [
            {
              type: "Minions from profile",
              count: 8,
              description: "Generated minions based on villain",
            },
          ],
        };

        console.log("Setting new adventure arc...");
        setAdventureArc(newAdventure);

        // Combine all the BBEG information for display
        const fullProfile = `${data.bbeg_detailed_description}\n\nMotivation: ${data.bbeg_motivation}\n\nAdventure Hook: ${data.bbeg_hook}`;

        console.log("Setting prompt output...");
        setPromptOutput(fullProfile);

        // Also try setting script output as a backup
        setScriptOutput(
          `Adventure Generated Successfully!\n\nBBEG: ${data.bbeg_name}\n\n${fullProfile}`,
        );

        // Send the villain profile to the AI chat
        console.log("Sending villain profile to AI chat...");
        await sendVillainToChat(`**${data.bbeg_name}**\n\n${fullProfile}`);

        console.log("Adventure generation complete!");
      } else {
        console.error("Adventure generation failed:", data.error);
        setPromptOutput(`Error: ${data.error || "Unknown error occurred"}`);
        setScriptOutput(
          `Adventure generation failed: ${data.error || "Unknown error"}`,
        );
      }
    } catch (error) {
      console.error("Error generating adventure:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      setPromptOutput(`Fetch Error: ${errorMessage}`);
      setScriptOutput(`Network error occurred: ${errorMessage}`);
    } finally {
      console.log("Setting isGenerating to false");
      setIsGenerating(false);
    }
  };

  const sendVillainToChat = async (villainProfile: string) => {
    try {
      console.log("Making request to add villain to chat...");

      // We'll create a custom message that gets added directly to the chat
      // by dispatching a custom event that the AIChat component can listen for
      const event = new CustomEvent("addChatMessage", {
        detail: {
          type: "gm",
          content: `🎭 **New Adventure Arc Generated!**\n\n${villainProfile}`,
          timestamp: new Date(),
        },
      });

      window.dispatchEvent(event);
      console.log("Dispatched chat message event");
    } catch (error) {
      console.error("Error sending villain to chat:", error);
    }
  };

  const runScript = async () => {
    if (!scriptInput.trim()) return;

    setIsRunningScript(true);
    setScriptOutput("");

    // Simulate running Python script
    setTimeout(() => {
      const mockOutput = `Running script: ${scriptInput}

Output:
- Generated BBEG motivation: "Seeks eternal power through shadow magic"
- Created 3 lieutenant concepts
- Generated 15 minion types
- Established 5 plot hooks
- Set chaos factor adjustments

Script completed successfully.`;

      setScriptOutput(mockOutput);
      setIsRunningScript(false);
    }, 1500);
  };

  const runPrompt = async () => {
    if (!promptInput.trim()) return;

    setIsRunningPrompt(true);
    setPromptOutput("");

    // Simulate running AI prompt
    setTimeout(() => {
      const mockOutput = `Prompt: "${promptInput}"

AI Response:
Based on your prompt, here's a generated adventure element:

The ancient tome speaks of a shadow cult that operates from within trusted institutions. Their leader, known only as "The Veiled Prophet," has infiltrated the local government and uses their position to gather information on potential threats while slowly corrupting the town from within.

Key elements:
- Operates in plain sight
- Uses bureaucracy as cover
- Slowly building network of informants
- Planning ritual during the harvest festival

This creates interesting moral dilemmas for players who must navigate between official authority and hidden corruption.`;

      setPromptOutput(mockOutput);
      setIsRunningPrompt(false);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      {/* Adventure Generation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-primary" />
            Adventure Arc Generator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <Button
              onClick={regenerateAdventure}
              disabled={isGenerating}
              variant="outline"
              className="flex-1"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                  Regenerating...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Regenerate Adventure Arc
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Adventure Arc Display */}
      {adventureArc ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Skull className="h-5 w-5 text-destructive" />
              Current Adventure Arc
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* BBEG */}
            <div className="space-y-3">
              <h4 className="font-semibold flex items-center gap-2">
                <Crown className="h-4 w-4" />
                Big Bad Evil Guy (BBEG)
              </h4>
              <div className="p-4 border rounded space-y-4">
                <div>
                  <span className="font-medium text-sm">Name:</span>
                  <h5 className="font-medium text-primary text-lg mt-1">
                    {adventureArc.bbeg.name}
                  </h5>
                </div>

                <div>
                  <span className="font-medium text-sm">Hook:</span>
                  <p className="text-sm text-muted-foreground mt-1">
                    {adventureArc.bbeg.hook}
                  </p>
                </div>

                <div>
                  <span className="font-medium text-sm">Motivation:</span>
                  <p className="text-sm text-muted-foreground mt-1">
                    {adventureArc.bbeg.motivation}
                  </p>
                </div>

                <div>
                  <span className="font-medium text-sm">
                    Detailed Description:
                  </span>
                  <ScrollArea className="h-32 w-full mt-1">
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap pr-2">
                      {adventureArc.bbeg.description}
                    </p>
                  </ScrollArea>
                </div>
              </div>
            </div>

            <Separator />

            {/* Secrets & Rumors */}
            <div className="space-y-3">
              <h4 className="font-semibold flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Secrets & Rumors
              </h4>
              <div className="space-y-2">
                {adventureArc.secrets.map((secret, index) => (
                  <div key={index} className="p-2 bg-muted/50 rounded text-sm">
                    {secret}
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* High Tower Surprise */}
            <div className="space-y-3">
              <h4 className="font-semibold">High Tower Surprise</h4>
              <div className="p-3 border rounded bg-accent/10">
                <p className="text-sm">{adventureArc.highTowerSurprise}</p>
              </div>
            </div>

            <Separator />

            {/* Lieutenants */}
            <div className="space-y-3">
              <h4 className="font-semibold flex items-center gap-2">
                <Users className="h-4 w-4" />
                Lieutenants
              </h4>
              <div className="space-y-3">
                {adventureArc.lieutenants.map((lieutenant, index) => (
                  <div key={index} className="p-3 border rounded space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{lieutenant.name}</span>
                      <Badge variant="secondary">{lieutenant.role}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {lieutenant.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Minions */}
            <div className="space-y-3">
              <h4 className="font-semibold">Minions</h4>
              <div className="space-y-2">
                {adventureArc.minions.map((minion, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 border rounded"
                  >
                    <div>
                      <span className="font-medium">{minion.type}</span>
                      <p className="text-sm text-muted-foreground">
                        {minion.description}
                      </p>
                    </div>
                    <Badge>{minion.count}</Badge>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-muted-foreground" />
              Adventure Arc
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <Skull className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">
                No Adventure Generated
              </h3>
              <p className="text-muted-foreground mb-4">
                Click "Regenerate Adventure Arc" to generate a new BBEG, plot
                threads, and adventure details using AI and tarot cards.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Script Testing */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Python Script Testing
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="script-input">Script Command</Label>
            <div className="flex gap-2">
              <Input
                id="script-input"
                placeholder="python generate_bbeg.py --type necromancer"
                value={scriptInput}
                onChange={(e) => setScriptInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && runScript()}
              />
              <Button
                onClick={runScript}
                disabled={isRunningScript || !scriptInput.trim()}
                size="icon"
              >
                {isRunningScript ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {scriptOutput && (
            <div className="space-y-2">
              <Label>Script Output</Label>
              <ScrollArea className="h-32 p-3 border rounded bg-muted/50">
                <pre className="text-sm whitespace-pre-wrap">
                  {scriptOutput}
                </pre>
              </ScrollArea>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Prompt Testing */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            AI Prompt Testing
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="prompt-input">Test Prompt</Label>
            <div className="space-y-2">
              <Textarea
                id="prompt-input"
                placeholder="Generate a mysterious NPC who appears helpful but has dark motives..."
                value={promptInput}
                onChange={(e) => setPromptInput(e.target.value)}
                rows={3}
              />
              <Button
                onClick={runPrompt}
                disabled={isRunningPrompt || !promptInput.trim()}
                className="w-full"
              >
                {isRunningPrompt ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                    Running Prompt...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Test Prompt
                  </>
                )}
              </Button>
            </div>
          </div>

          {promptOutput && (
            <div className="space-y-2">
              <Label>AI Response</Label>
              <ScrollArea className="h-40 p-3 border rounded bg-muted/50">
                <div className="text-sm whitespace-pre-wrap">
                  {promptOutput}
                </div>
              </ScrollArea>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
