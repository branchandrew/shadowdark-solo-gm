import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Network, Users, Crown } from "lucide-react";
import { useCampaignElements } from "@/hooks/useDatabase";
import type { Thread, Creature, Faction, Clue } from "../../shared/types";

interface Thread {
  id: string;
  description: string;
  status: "active" | "resolved" | "dormant";
  hidden: boolean;
}

interface Character {
  id: string;
  name: string;
  description: string;
  disposition: "friendly" | "neutral" | "hostile" | "unknown";
  hidden: boolean;
}

interface Faction {
  id: string;
  name: string;
  description: string;
  influence: "minor" | "moderate" | "major";
  relationship: "allied" | "neutral" | "opposed" | "unknown";
  hidden: boolean;
}

interface Clue {
  id: string;
  description: string;
  discovered: boolean;
  importance: "minor" | "moderate" | "major";
  hidden: boolean;
}

export default function CampaignElements() {
  // Use database hooks instead of local state
  const {
    data: campaignData,
    updateData: updateCampaignData,
    isLoading,
  } = useCampaignElements();

  // Extract data arrays (with fallbacks)
  const threads = campaignData?.threads || [];
  const creatures = campaignData?.creatures || [];
  const factions = campaignData?.factions || [];
  const clues = campaignData?.clues || [];

  // Simple debugging
  console.log("CampaignElements data:", {
    threads: threads.length,
    creatures: creatures.length,
    factions: factions.length,
    clues: clues.length,
  });

  // Filter creatures by type for display
  const characters = creatures.filter(
    (c) =>
      c.creature_type === "npc" ||
      c.creature_type === "bbeg" ||
      c.creature_type === "lieutenant",
  );

  const addClue = async () => {
    if (newClue.trim()) {
      const newClueObj: Clue = {
        id: `clue_${Date.now()}`,
        session_id: "current", // Will be set by database service
        description: newClue,
        discovered: false,
        importance: "minor",
        hidden: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      await updateCampaignData({
        ...campaignData,
        clues: [...clues, newClueObj],
      });
      setNewClue("");
    }
  };

  const updateThreadStatus = async (
    threadId: string,
    newStatus: Thread["status"],
  ) => {
    const updatedThreads = threads.map((thread) =>
      thread.id === threadId
        ? { ...thread, status: newStatus, updated_at: new Date().toISOString() }
        : thread,
    );

    await updateCampaignData({
      ...campaignData,
      threads: updatedThreads,
    });
  };

  const updateCharacterDisposition = async (
    characterId: string,
    newDisposition: "friendly" | "neutral" | "hostile" | "unknown",
  ) => {
    const updatedCreatures = creatures.map((creature) =>
      creature.id === characterId
        ? {
            ...creature,
            npc_disposition: newDisposition,
            updated_at: new Date().toISOString(),
          }
        : creature,
    );

    await updateCampaignData({
      ...campaignData,
      creatures: updatedCreatures,
    });
  };

  const updateFactionRelationship = async (
    factionId: string,
    newRelationship: Faction["relationship"],
  ) => {
    const updatedFactions = factions.map((faction) =>
      faction.id === factionId
        ? {
            ...faction,
            relationship: newRelationship,
            updated_at: new Date().toISOString(),
          }
        : faction,
    );

    await updateCampaignData({
      ...campaignData,
      factions: updatedFactions,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-blue-600";
      case "resolved":
        return "bg-green-600";
      case "dormant":
        return "bg-yellow-600";
      default:
        return "bg-muted";
    }
  };

  const getDispositionColor = (disposition: string) => {
    switch (disposition) {
      case "friendly":
        return "bg-green-600";
      case "hostile":
        return "bg-red-600";
      case "neutral":
        return "bg-blue-600";
      case "unknown":
        return "bg-gray-600";
      default:
        return "bg-muted";
    }
  };

  const getRelationshipColor = (relationship: string) => {
    switch (relationship) {
      case "allied":
        return "bg-green-600";
      case "opposed":
        return "bg-red-600";
      case "neutral":
        return "bg-blue-600";
      case "unknown":
        return "bg-gray-600";
      default:
        return "bg-muted";
    }
  };

  const getInfluenceColor = (influence: string) => {
    switch (influence) {
      case "major":
        return "bg-purple-600";
      case "moderate":
        return "bg-orange-600";
      case "minor":
        return "bg-green-600";
      default:
        return "bg-muted";
    }
  };

  const getImportanceColor = (importance: string) => {
    switch (importance) {
      case "major":
        return "bg-red-600";
      case "moderate":
        return "bg-yellow-600";
      case "minor":
        return "bg-blue-600";
      default:
        return "bg-muted";
    }
  };

  // Show all elements regardless of hidden status
  const getVisibleThreads = () => threads;
  const getVisibleCharacters = () => characters;
  const getVisibleFactions = () => factions;
  const getVisibleClues = () => clues;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-sm text-muted-foreground">
            Loading campaign elements...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full">
      {/* Horizontal Grid Layout */}
      <div className="grid grid-cols-3 gap-4 h-full">
        {/* Plot Threads */}
        <Card className="flex flex-col h-full">
          <CardHeader className="flex-shrink-0">
            <CardTitle className="flex items-center gap-2">
              <Network className="h-5 w-5" />
              Plot Threads
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden">
            {getVisibleThreads().length === 0 ? (
              <div className="text-center py-6">
                <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
                  <Network className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">
                  No plot threads yet.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {getVisibleThreads().map((thread) => (
                  <div
                    key={thread.id}
                    className={`flex items-center gap-2 p-3 border rounded ${
                      thread.hidden ? "bg-muted/50 border-dashed" : ""
                    }`}
                  >
                    <div className="flex gap-1">
                      {(["active", "dormant", "resolved"] as const).map(
                        (status) => (
                          <button
                            key={status}
                            onClick={() =>
                              updateThreadStatus(thread.id, status)
                            }
                            className={`px-2 py-1 text-xs rounded ${
                              thread.status === status
                                ? getStatusColor(status) + " text-white"
                                : "bg-muted text-muted-foreground hover:bg-accent"
                            }`}
                          >
                            {status}
                          </button>
                        ),
                      )}
                    </div>
                    <span className="flex-1 text-sm">{thread.description}</span>
                    {thread.hidden && (
                      <Badge variant="outline" className="text-xs">
                        Hidden
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* NPCs & Characters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              NPCs & Characters
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {getVisibleCharacters().length === 0 ? (
              <div className="text-center py-6">
                <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
                  <Users className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">
                  No characters yet. Add NPCs you encounter during your
                  adventure.
                </p>
              </div>
            ) : (
              <ScrollArea className="h-48">
                <div className="space-y-3">
                  {getVisibleCharacters().map((character) => (
                    <div
                      key={character.id}
                      className={`p-3 border rounded space-y-2 ${
                        character.hidden ? "bg-muted/50 border-dashed" : ""
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{character.name}</span>
                          {character.creature_type === "bbeg" && (
                            <Badge variant="destructive" className="text-xs">
                              BBEG
                            </Badge>
                          )}
                          {character.creature_type === "lieutenant" && (
                            <Badge variant="secondary" className="text-xs">
                              Lieutenant
                            </Badge>
                          )}
                          {character.hidden && (
                            <Badge variant="outline" className="text-xs">
                              Hidden
                            </Badge>
                          )}
                        </div>
                        <div className="flex gap-1">
                          {(
                            [
                              "friendly",
                              "neutral",
                              "hostile",
                              "unknown",
                            ] as const
                          ).map((disposition) => (
                            <button
                              key={disposition}
                              onClick={() =>
                                updateCharacterDisposition(
                                  character.id,
                                  disposition,
                                )
                              }
                              className={`px-2 py-1 text-xs rounded ${
                                character.npc_disposition === disposition
                                  ? getDispositionColor(disposition) +
                                    " text-white"
                                  : "bg-muted text-muted-foreground hover:bg-accent"
                              }`}
                            >
                              {disposition}
                            </button>
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {character.description}
                      </p>
                      {character.race_species && (
                        <p className="text-xs text-muted-foreground">
                          Race: {character.race_species}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>

        {/* Factions */}
        <Card className="flex flex-col h-full">
          <CardHeader className="flex-shrink-0">
            <CardTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5" />
              Factions
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden">
            {getVisibleFactions().length === 0 ? (
              <div className="text-center py-6">
                <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
                  <Crown className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">
                  No factions yet.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {getVisibleFactions().map((faction) => (
                  <div
                    key={faction.id}
                    className={`p-3 border rounded space-y-2 ${
                      faction.hidden ? "bg-muted/50 border-dashed" : ""
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{faction.name}</span>
                        <Badge className={getInfluenceColor(faction.influence)}>
                          {faction.influence}
                        </Badge>
                        {faction.hidden && (
                          <Badge variant="outline" className="text-xs">
                            Hidden
                          </Badge>
                        )}
                      </div>
                      <div className="flex gap-1">
                        {(
                          ["allied", "neutral", "opposed", "unknown"] as const
                        ).map((relationship) => (
                          <button
                            key={relationship}
                            onClick={() =>
                              updateFactionRelationship(
                                faction.id,
                                relationship,
                              )
                            }
                            className={`px-2 py-1 text-xs rounded ${
                              faction.relationship === relationship
                                ? getRelationshipColor(relationship) +
                                  " text-white"
                                : "bg-muted text-muted-foreground hover:bg-accent"
                            }`}
                          >
                            {relationship}
                          </button>
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {faction.description}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
