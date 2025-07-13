import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSessionState } from "../hooks/useSessionState";
import { useAdventureLog } from "../hooks/useDatabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Play,
  Pause,
  RotateCcw,
  ChevronRight,
  Dice6,
  Eye,
  Target,
  Clock,
} from "lucide-react";

interface Scene {
  id: string;
  scene_number: number;
  title: string;
  description: string;
  player_intentions?: string;
  scene_expectations: string;
  chaos_factor: number;
  chaos_roll: number;
  scene_type: "expected" | "altered" | "interrupted";
  random_event?: {
    focus: string;
    meaning_action: string;
    meaning_subject: string;
    description: string;
  };
  scene_goal: string;
  success_conditions: string[];
  status: "pending" | "active" | "completed";
  fate_rolls: Array<{
    question: string;
    roll: number;
    result: "yes" | "no" | "exceptional_yes" | "exceptional_no";
  }>;
  adventure_arc_id?: string; // Track which adventure arc this scene belongs to
}

export default function SceneManager() {
  const [currentScene, setCurrentScene] = useSessionState<Scene | null>(
    "current_scene",
    null,
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [playerIntentions, setPlayerIntentions] = useSessionState(
    "scene_player_intentions",
    "",
  );
  const [chaosFactor, setChaosFactor] = useSessionState(
    "scene_chaos_factor",
    5,
  );
  const [character] = useSessionState("character", null);
  const [adventureArc] = useSessionState("bts_adventure_arc", null);
  const { data: adventureLog, updateData: updateAdventureLog } =
    useAdventureLog();

  // Check if we have any adventure log entries
  const hasAdventureLogEntries = () => {
    return adventureLog && adventureLog.length > 0;
  };

  // Get current adventure arc ID
  const getCurrentAdventureArcId = () => {
    const adventureArcRaw = localStorage.getItem("shadowdark_adventure_arc");
    if (adventureArcRaw) {
      try {
        const arc = JSON.parse(adventureArcRaw);
        return arc?.id;
      } catch (e) {
        return null;
      }
    }
    return null;
  };

  // Clear scenes if they don't belong to current adventure arc
  useEffect(() => {
    const currentArcId = getCurrentAdventureArcId();
    if (
      currentArcId &&
      currentScene &&
      currentScene.adventure_arc_id !== currentArcId
    ) {
      // Clear scene if it belongs to a different adventure arc
      setCurrentScene(null);
      // Reset scene number
      setSceneNumber(1);
    }
  }, [adventureArc, currentScene, setCurrentScene, setSceneNumber]);

  const generateNewScene = async () => {
    setIsGenerating(true);

    try {
      // Get campaign elements from localStorage only
      let finalCampaignElements = null;

      // First try shadowdark_campaign_elements
      const campaignElementsRaw = localStorage.getItem(
        "shadowdark_campaign_elements",
      );
      console.log("Campaign elements from localStorage:", campaignElementsRaw);

      if (campaignElementsRaw) {
        try {
          finalCampaignElements = JSON.parse(campaignElementsRaw);
          console.log("Parsed campaign elements:", finalCampaignElements);
        } catch (e) {
          console.error("Error parsing campaign elements:", e);
        }
      }

      // If still no data, try to extract from adventure arc
      if (!finalCampaignElements) {
        const adventureArcRaw = localStorage.getItem(
          "shadowdark_adventure_arc",
        );
        console.log("Adventure arc from localStorage:", adventureArcRaw);

        if (adventureArcRaw) {
          try {
            const adventureArc = JSON.parse(adventureArcRaw);
            if (adventureArc && adventureArc.bbeg && adventureArc.bbeg.name) {
              finalCampaignElements = {
                bbeg: adventureArc.bbeg,
                npcs: adventureArc.lieutenants || [],
                plot_threads:
                  adventureArc.clues?.map((clue: string) => ({
                    description: clue,
                    status: "active",
                  })) || [],
                factions: adventureArc.faction?.name
                  ? [
                      {
                        name: adventureArc.faction.name,
                        description: adventureArc.faction.description || "",
                        relationship: "opposed",
                      },
                    ]
                  : [],
              };
              console.log(
                "Extracted campaign elements from adventure arc:",
                finalCampaignElements,
              );
            }
          } catch (e) {
            console.error("Error parsing adventure arc:", e);
          }
        }
      }

      // Validate we have a proper BBEG before proceeding
      if (
        !finalCampaignElements ||
        !finalCampaignElements.bbeg ||
        !finalCampaignElements.bbeg.name
      ) {
        console.log("No valid campaign elements found. Cannot generate scene.");
        alert("Please generate an adventure arc first before creating scenes.");
        return;
      }

      const requestBody = {
        session_id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        player_intentions: playerIntentions.trim() || undefined,
        chaos_factor: chaosFactor,
        character: character,
        campaign_elements: finalCampaignElements,
      };

      console.log("Generating new scene with data:", requestBody);

      const response = await fetch("/api/generate-scene", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      }).catch((networkError) => {
        console.error("Network error:", networkError);
        throw new Error(
          `Network error: Unable to connect to server. Please check your connection.`,
        );
      });

      console.log("Response status:", response.status);
      console.log("Response ok:", response.ok);

      // Check if response is ok before reading body
      if (!response.ok) {
        // For error responses, try to read as JSON first, then text
        let errorMessage = `Server error (${response.status}): ${response.statusText}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData?.error || errorMessage;
        } catch {
          // If JSON parsing fails, try reading as text
          try {
            const errorText = await response.text();
            if (errorText) {
              errorMessage = `Server error: ${errorText.substring(0, 200)}`;
            }
          } catch {
            // If all else fails, use the status text
          }
        }
        throw new Error(errorMessage);
      }

      // Read successful response as JSON
      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        console.error("Failed to parse JSON response:", parseError);
        throw new Error(
          `Server returned invalid JSON (${response.status}): ${response.statusText}`,
        );
      }

      console.log("Received data:", data);

      if (data.success) {
        // Add adventure arc ID to the scene
        const sceneWithArcId = {
          ...data.scene,
          adventure_arc_id: getCurrentAdventureArcId(),
        };
        setCurrentScene(sceneWithArcId);
        setPlayerIntentions(""); // Clear intentions after use
        console.log("Scene generated successfully:", sceneWithArcId);
      } else {
        console.error("Scene generation failed:", data.error);
        alert(
          `Scene generation failed: ${data.error || "Unknown error occurred"}`,
        );
      }
    } catch (error) {
      console.error("Error generating scene:", error);
      alert(
        `Error generating scene: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const getSceneTypeColor = (type: string) => {
    switch (type) {
      case "expected":
        return "bg-green-600";
      case "altered":
        return "bg-yellow-600";
      case "interrupted":
        return "bg-red-600";
      default:
        return "bg-gray-600";
    }
  };

  const getFateResultColor = (result: string) => {
    switch (result) {
      case "yes":
      case "exceptional_yes":
        return "bg-green-600";
      case "no":
      case "exceptional_no":
        return "bg-red-600";
      default:
        return "bg-gray-600";
    }
  };

  return (
    <div className="space-y-6">
      {/* Scene Generation Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="h-5 w-5" />
            Scene Generation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">
              Player Intentions (from previous scene)
            </label>
            <Textarea
              placeholder="What does the player character intend to do in this scene?"
              value={playerIntentions}
              onChange={(e) => setPlayerIntentions(e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Chaos Factor:</label>
              <Input
                type="number"
                min="1"
                max="10"
                value={chaosFactor}
                onChange={(e) => setChaosFactor(parseInt(e.target.value) || 5)}
                className="w-20"
              />
            </div>

            <Button
              onClick={generateNewScene}
              disabled={isGenerating || !hasValidCampaignElements()}
              className="flex-1"
            >
              {isGenerating ? (
                <>
                  <RotateCcw className="h-4 w-4 mr-2 animate-spin" />
                  Generating Scene...
                </>
              ) : !hasValidCampaignElements() ? (
                <>
                  <ChevronRight className="h-4 w-4 mr-2" />
                  Generate Adventure Arc First
                </>
              ) : (
                <>
                  <ChevronRight className="h-4 w-4 mr-2" />
                  Generate New Scene
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Current Scene Display */}
      {currentScene && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Scene {currentScene.scene_number}: {currentScene.title}
              </div>
              <div className="flex items-center gap-2">
                <Badge className={getSceneTypeColor(currentScene.scene_type)}>
                  {currentScene.scene_type}
                </Badge>
                <Badge variant="outline">
                  Chaos: {currentScene.chaos_roll}/{currentScene.chaos_factor}
                </Badge>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Scene Description */}
            <div>
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Scene Description
              </h4>
              <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded">
                {currentScene.description}
              </p>
            </div>

            {/* Player Intentions */}
            {currentScene.player_intentions && (
              <div>
                <h4 className="font-medium mb-2">Player Intentions</h4>
                <p className="text-sm text-muted-foreground">
                  {currentScene.player_intentions}
                </p>
              </div>
            )}

            {/* Scene Goal & Success Conditions */}
            <div>
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Target className="h-4 w-4" />
                Scene Goal
              </h4>
              <p className="text-sm mb-3">{currentScene.scene_goal}</p>
            </div>

            {/* Random Event */}
            {currentScene.random_event && (
              <div>
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Dice6 className="h-4 w-4" />
                  Random Event
                </h4>
                <div className="bg-yellow-50 dark:bg-yellow-950/20 p-3 rounded border">
                  <p className="text-sm font-medium">
                    {currentScene.random_event.description}
                  </p>
                  <div className="flex gap-2 mt-2">
                    <Badge variant="outline">
                      Focus: {currentScene.random_event.focus}
                    </Badge>
                    <Badge variant="outline">
                      {currentScene.random_event.meaning_action}{" "}
                      {currentScene.random_event.meaning_subject}
                    </Badge>
                  </div>
                </div>
              </div>
            )}

            {/* Fate Rolls */}
            {currentScene.fate_rolls.length > 0 && (
              <div>
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Dice6 className="h-4 w-4" />
                  Fate Rolls
                </h4>
                <ScrollArea className="h-32">
                  <div className="space-y-2">
                    {currentScene.fate_rolls.map((roll, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 bg-muted/50 rounded text-sm"
                      >
                        <span>{roll.question}</span>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">Roll: {roll.roll}</Badge>
                          <Badge className={getFateResultColor(roll.result)}>
                            {roll.result}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {!currentScene && !isGenerating && (
        <Card>
          <CardContent className="text-center py-8">
            <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <Play className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No Active Scene</h3>
            <p className="text-muted-foreground mb-4">
              Generate a new scene to begin the Scene Loop process.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
