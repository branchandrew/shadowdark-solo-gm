import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Eye, Crown, Skull, Users, RefreshCw } from "lucide-react";
import CloudSync from "./CloudSync";
import SchemaVisualizer from "./SchemaVisualizer";
import { useSessionState } from "../hooks/useSessionState";
import { useAdventureLog, useDatabase } from "../hooks/useDatabase";
import {
  useCreatureTypes,
  extractRaceFromDescription,
} from "../hooks/useCreatureTypes";

import type { AdventureArcDisplay } from "../../shared/types";

export default function BTSPanel() {
  const { data: adventureArc, updateData: updateAdventureArc } =
    useDatabase<AdventureArcDisplay | null>("adventure_arc", null);
  const { data: campaignElements, updateData: updateCampaignElements } =
    useDatabase("campaign_elements", null);
  const { creatureTypes } = useCreatureTypes();
  const [isGenerating, setIsGenerating] = useState(false);
  const [theme, setTheme] = useSessionState("bts_theme", "");
  const [tone, setTone] = useSessionState("bts_tone", "");
  const [voice, setVoice] = useSessionState("bts_voice", "");
  const { updateData: updateAdventureLog } = useAdventureLog();

  const regenerateAdventure = async () => {
    console.log("Starting regenerate adventure...");
    setIsGenerating(true);

    try {
      const requestBody = {
        theme: theme.trim() || "Dark Fantasy",
        tone: tone.trim() || "Mysterious",
        voice: voice.trim() || "Atmospheric",
        session_id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      };

      console.log("Triggering adventure generation...");
      console.log("Request body:", requestBody);

      const response = await fetch("/api/generate-adventure", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Server error: ${response.statusText}`);
      }

      if (data.success) {
        console.log("Adventure generation triggered successfully!");

        // Clear adventure log for new adventure arc
        await updateAdventureLog([]);
        console.log("Adventure log cleared for new adventure arc");

        // Check if database was available or if we got fallback data
        if (data.fallback) {
          console.log(
            "Database not available - processing data directly:",
            data.message,
          );

          // Handle fallback: manually update local data
          const newAdventure = {
            id: `arc_${Date.now()}`,
            bbeg: {
              name: data.bbeg_name,
              description: data.bbeg_detailed_description,
              motivation: data.bbeg_motivation,
              hook: data.bbeg_hook,
            },
            clues: data.clues || [],
            highTowerSurprise: data.high_tower_surprise || "",
            lieutenants: data.lieutenants || [],
            faction: {
              name: data.faction_name || "",
              description: data.faction_description || "",
            },
            minions: data.minions || "",
          };

          await updateAdventureArc(newAdventure);

          // Also update campaign elements
          const bbegId = `creature_${Date.now()}_bbeg`;
          const campaignElements = {
            threads: [],
            creatures: [
              {
                id: bbegId,
                name: data.bbeg_name,
                race_species: data.race || "Unknown",
                description: data.bbeg_detailed_description,
                creature_type: "bbeg",
                npc_disposition: "hostile",
                bbeg_motivation: data.bbeg_motivation,
                bbeg_hook: data.bbeg_hook,
                hidden: true,
              },
              ...(data.minions && data.minions.trim()
                ? [
                    {
                      id: `creature_${Date.now()}_bbeg_minion`,
                      name: "BBEG Minions",
                      race_species:
                        extractRaceFromDescription(
                          data.minions,
                          creatureTypes,
                        ) || "Monster",
                      description: data.minions,
                      creature_type: "monster",
                      npc_disposition: "hostile",
                      is_minion: true,
                      minion_creature_id: bbegId,
                      hidden: true,
                    },
                  ]
                : []),
              ...(data.lieutenants || []).flatMap(
                (lieutenant: any, index: number) => {
                  const lieutenantId = `creature_${Date.now()}_lt_${index}`;
                  const creatures = [
                    {
                      id: lieutenantId,
                      name: lieutenant.name,
                      race_species: data.lieutenant_types?.[index] || "Monster",
                      description:
                        lieutenant.description ||
                        `Lieutenant. ${lieutenant.tarot_spread?.background || "A trusted lieutenant."}`,
                      creature_type: "lieutenant",
                      npc_disposition: "hostile",
                      lieutenant_tarot_seed: lieutenant.tarot_spread?.seed,
                      lieutenant_tarot_background:
                        lieutenant.tarot_spread?.background,
                      lieutenant_tarot_location:
                        lieutenant.tarot_spread?.location,
                      lieutenant_tarot_why_protect:
                        lieutenant.tarot_spread?.why_protect,
                      lieutenant_tarot_how_protect:
                        lieutenant.tarot_spread?.how_protect,
                      lieutenant_tarot_ability:
                        lieutenant.tarot_spread?.ability,
                      hidden: true,
                    },
                  ];

                  // Add lieutenant minions if they exist
                  if (lieutenant.minions && lieutenant.minions.trim()) {
                    creatures.push({
                      id: `creature_${Date.now()}_lt_${index}_minion`,
                      name: `${lieutenant.name}'s Minions`,
                      race_species:
                        extractRaceFromDescription(
                          lieutenant.minions,
                          creatureTypes,
                        ) || "Monster",
                      description: lieutenant.minions,
                      creature_type: "monster",
                      npc_disposition: "hostile",
                      is_minion: true,
                      minion_creature_id: lieutenantId,
                      hidden: true,
                    });
                  }

                  return creatures;
                },
              ),
            ],
            factions: data.faction_name
              ? [
                  {
                    id: `faction_${Date.now()}`,
                    name: data.faction_name,
                    description: data.faction_description || "",
                    relationship: "opposed",
                    influence: "moderate",
                    hidden: true,
                  },
                ]
              : [],
            clues: (data.clues || []).map((clue: string, index: number) => ({
              id: `clue_${Date.now()}_${index}`,
              description: clue,
              discovered: false,
              importance: "moderate",
            })),
          };

          await updateCampaignElements(campaignElements);
          console.log("Adventure data updated via fallback mode");
        } else {
          // Database mode - data will arrive via real-time subscriptions
          console.log(
            "Adventure generation complete! Data will arrive via real-time updates.",
          );
        }
      } else {
        throw new Error(data.error || "Adventure generation failed");
      }
    } catch (error) {
      console.error("Error generating adventure:", error);

      // Show user-friendly error message
      let errorMessage = "Unknown error occurred";

      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === "string") {
        errorMessage = error;
      } else {
        console.error("Unexpected error type:", typeof error, error);
      }

      alert(`Error generating adventure: ${errorMessage}`);
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

  const sendCompleteAdventureToChat = () => {
    if (!adventureArc) {
      console.error("No adventure data to send");
      return;
    }

    try {
      // Format the complete adventure data for chat
      const formattedContent = `���� **Complete Adventure Arc Details**

**${adventureArc.bbeg.name}**
${adventureArc.bbeg.hook}

**Motivation:** ${adventureArc.bbeg.motivation}

**Description:** ${adventureArc.bbeg.description}

**Clues:**
${adventureArc.clues.map((clue, index) => `${index + 1}. ${clue}`).join("\n")}

**High Tower Surprise:** ${adventureArc.highTowerSurprise}

**Lieutenants:**
${adventureArc.lieutenants
  .map(
    (lt, index) => `
**${lt.name}**
- Background: ${lt.tarot_spread.background}
- Nature: ${lt.tarot_spread.seed}
- Occupation: ${lt.tarot_spread.location}
- Why Protect: ${lt.tarot_spread.why_protect}
- How Protect: ${lt.tarot_spread.how_protect}
- Ability: ${lt.tarot_spread.ability}`,
  )
  .join("\n")}

**Faction:** ${adventureArc.faction.name}
${adventureArc.faction.description}

**Minions:** ${adventureArc.minions}`;

      const event = new CustomEvent("addChatMessage", {
        detail: {
          type: "gm",
          content: formattedContent,
          timestamp: new Date(),
        },
      });

      window.dispatchEvent(event);
      console.log("Dispatched complete adventure data to chat");
    } catch (error) {
      console.error("Error sending complete adventure to chat:", error);
    }
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
          {/* Theme, Tone, Voice Fields */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="theme">Theme</Label>
              <Input
                id="theme"
                placeholder="e.g., Gothic Horror, High Fantasy"
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tone">Tone</Label>
              <Input
                id="tone"
                placeholder="e.g., Dark, Gritty, Heroic"
                value={tone}
                onChange={(e) => setTone(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="voice">Voice</Label>
              <Input
                id="voice"
                placeholder="e.g., Mysterious, Direct, Poetic"
                value={voice}
                onChange={(e) => setVoice(e.target.value)}
              />
            </div>
          </div>

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
            {adventureArc && (
              <Button
                onClick={sendCompleteAdventureToChat}
                variant="outline"
                size="sm"
              >
                Send to Chat
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Adventure Arc Display */}
      {adventureArc ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Skull className="h-5 w-5 text-destructive" />
                Current Adventure Arc
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  await updateAdventureArc(null);
                  await updateCampaignElements(null);
                }}
                className="text-xs"
              >
                Clear Arc
              </Button>
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

            {/* Clues */}
            <div className="space-y-3">
              <h4 className="font-semibold flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Clues about the BBEG
              </h4>
              <div className="space-y-2">
                {adventureArc.clues.map((clue, index) => (
                  <div key={index} className="p-3 border rounded space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">Clue {index + 1}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{clue}</p>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* High Tower Surprise */}
            <div className="space-y-3">
              <h4 className="font-semibold">High Tower Surprise</h4>
              <div className="p-3 border rounded bg-accent/10">
                <p className="text-sm whitespace-pre-wrap">
                  {adventureArc.highTowerSurprise}
                </p>
              </div>
            </div>

            <Separator />

            {/* Lieutenants */}
            {adventureArc.lieutenants.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-semibold flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Lieutenants
                </h4>
                <div className="space-y-4">
                  {adventureArc.lieutenants.map((lieutenant, index) => (
                    <div key={index} className="p-4 border rounded space-y-3">
                      <h5 className="font-medium text-primary text-lg">
                        {lieutenant.name}
                      </h5>

                      {/* Comprehensive Description */}
                      {lieutenant.description && (
                        <div className="space-y-1">
                          <Badge variant="outline" className="text-xs">
                            Description
                          </Badge>
                          <p className="text-sm text-muted-foreground">
                            {lieutenant.description}
                          </p>
                        </div>
                      )}

                      {/* Minions */}
                      {lieutenant.minions && lieutenant.minions.trim() && (
                        <div className="space-y-1">
                          <Badge variant="outline" className="text-xs">
                            Commands
                          </Badge>
                          <p className="text-sm text-muted-foreground">
                            {lieutenant.minions}
                          </p>
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Badge variant="outline" className="text-xs">
                            Seed
                          </Badge>
                          <p className="text-sm text-muted-foreground">
                            {lieutenant.tarot_spread.seed}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <Badge variant="outline" className="text-xs">
                            Background
                          </Badge>
                          <p className="text-sm text-muted-foreground">
                            {lieutenant.tarot_spread.background}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <Badge variant="outline" className="text-xs">
                            Occupation
                          </Badge>
                          <p className="text-sm text-muted-foreground">
                            {lieutenant.tarot_spread.location}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <Badge variant="outline" className="text-xs">
                            Why Protect
                          </Badge>
                          <p className="text-sm text-muted-foreground">
                            {lieutenant.tarot_spread.why_protect}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <Badge variant="outline" className="text-xs">
                            How Protect
                          </Badge>
                          <p className="text-sm text-muted-foreground">
                            {lieutenant.tarot_spread.how_protect}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <Badge variant="outline" className="text-xs">
                            Ability
                          </Badge>
                          <p className="text-sm text-muted-foreground">
                            {lieutenant.tarot_spread.ability}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Separator />

            {/* Faction */}
            {adventureArc.faction?.name && (
              <div className="space-y-3">
                <h4 className="font-semibold">Aligned Faction</h4>
                <div className="p-3 border rounded space-y-2">
                  <h5 className="font-medium text-primary">
                    {adventureArc.faction.name}
                  </h5>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {adventureArc.faction.description}
                  </p>
                </div>
              </div>
            )}

            <Separator />

            {/* Minions */}
            {adventureArc.minions && (
              <div className="space-y-3">
                <h4 className="font-semibold">Minions</h4>
                <div className="p-3 border rounded">
                  <p className="text-sm whitespace-pre-wrap">
                    {adventureArc.minions}
                  </p>
                </div>
              </div>
            )}
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

      {/* Cloud Sync */}
      <CloudSync />

      {/* Schema Visualizer */}
      <SchemaVisualizer />
    </div>
  );
}
