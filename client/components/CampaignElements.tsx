import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Network, Users, Crown, Search, Eye, EyeOff } from "lucide-react";
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

  // Filter creatures by type for display
  const characters = creatures.filter(
    (c) =>
      c.creature_type === "npc" ||
      c.creature_type === "bbeg" ||
      c.creature_type === "lieutenant",
  );

  const [newThread, setNewThread] = useState("");
  const [newCharacterName, setNewCharacterName] = useState("");
  const [newCharacterDesc, setNewCharacterDesc] = useState("");
  const [newFactionName, setNewFactionName] = useState("");
  const [newFactionDesc, setNewFactionDesc] = useState("");
  const [newClue, setNewClue] = useState("");

  // Debug visibility toggles
  const [showHiddenThreads, setShowHiddenThreads] = useState(false);
  const [showHiddenCharacters, setShowHiddenCharacters] = useState(false);
  const [showHiddenFactions, setShowHiddenFactions] = useState(false);
  const [showHiddenClues, setShowHiddenClues] = useState(false);

  const addThread = async () => {
    if (newThread.trim()) {
      const newThreadObj: Thread = {
        id: `thread_${Date.now()}`,
        session_id: "current", // Will be set by database service
        description: newThread,
        status: "active",
        hidden: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      await updateCampaignData({
        ...campaignData,
        threads: [...threads, newThreadObj],
      });
      setNewThread("");
    }
  };

  const addCharacter = async () => {
    if (newCharacterName.trim() && newCharacterDesc.trim()) {
      const newCreature: Creature = {
        id: `creature_${Date.now()}`,
        session_id: "current", // Will be set by database service
        name: newCharacterName,
        race_species: "Human", // Default, user can edit later
        description: newCharacterDesc,
        armor_class: 10,
        hit_points: "1d8",
        speed: "30 ft",
        abilities: { STR: 10, DEX: 10, CON: 10, INT: 10, WIS: 10, CHA: 10 },
        attacks: [],
        special_abilities: [],
        creature_type: "npc",
        status: "alive",
        hidden: false,
        npc_disposition: "unknown",
        npc_role: "other",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      await updateCampaignData({
        ...campaignData,
        creatures: [...creatures, newCreature],
      });
      setNewCharacterName("");
      setNewCharacterDesc("");
    }
  };

  const addFaction = async () => {
    if (newFactionName.trim() && newFactionDesc.trim()) {
      const newFactionObj: Faction = {
        id: `faction_${Date.now()}`,
        session_id: "current", // Will be set by database service
        name: newFactionName,
        description: newFactionDesc,
        influence: "minor",
        relationship: "unknown",
        hidden: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      await updateCampaignData({
        ...campaignData,
        factions: [...factions, newFactionObj],
      });
      setNewFactionName("");
      setNewFactionDesc("");
    }
  };

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

  const updateClueDiscovered = async (clueId: string, discovered: boolean) => {
    const updatedClues = clues.map((clue) =>
      clue.id === clueId
        ? { ...clue, discovered, updated_at: new Date().toISOString() }
        : clue,
    );

    await updateCampaignData({
      ...campaignData,
      clues: updatedClues,
    });
  };

  const updateClueImportance = async (
    clueId: string,
    importance: Clue["importance"],
  ) => {
    const updatedClues = clues.map((clue) =>
      clue.id === clueId
        ? { ...clue, importance, updated_at: new Date().toISOString() }
        : clue,
    );

    await updateCampaignData({
      ...campaignData,
      clues: updatedClues,
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

  // Filter functions to show/hide items based on debug toggles
  const getVisibleThreads = () =>
    threads.filter((thread) => !thread.hidden || showHiddenThreads);
  const getVisibleCharacters = () =>
    characters.filter((char) => !char.hidden || showHiddenCharacters);
  const getVisibleFactions = () =>
    factions.filter((faction) => !faction.hidden || showHiddenFactions);
  const getVisibleClues = () =>
    clues.filter((clue) => !clue.hidden || showHiddenClues);

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
    <div className="space-y-6">
      {/* Plot Threads */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Network className="h-5 w-5" />
              Plot Threads
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowHiddenThreads(!showHiddenThreads)}
              className="text-xs"
            >
              {showHiddenThreads ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
              Debug
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {getVisibleThreads().length === 0 ? (
            <div className="text-center py-6">
              <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
                <Network className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">
                No plot threads yet. Add one below to start tracking story
                elements.
              </p>
            </div>
          ) : (
            <ScrollArea className="h-40">
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
            </ScrollArea>
          )}
          <div className="flex gap-2">
            <Input
              placeholder="New plot thread..."
              value={newThread}
              onChange={(e) => setNewThread(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && addThread()}
            />
            <Button onClick={addThread} size="icon">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* NPCs & Characters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              NPCs & Characters
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowHiddenCharacters(!showHiddenCharacters)}
              className="text-xs"
            >
              {showHiddenCharacters ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
              Debug
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {getVisibleCharacters().length === 0 ? (
            <div className="text-center py-6">
              <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
                <Users className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">
                No characters yet. Add NPCs you encounter during your adventure.
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
                          ["friendly", "neutral", "hostile", "unknown"] as const
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
          <div className="space-y-2">
            <div className="flex gap-2">
              <Input
                placeholder="Character name..."
                value={newCharacterName}
                onChange={(e) => setNewCharacterName(e.target.value)}
              />
              <Button onClick={addCharacter} size="icon">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <Textarea
              placeholder="Character description..."
              value={newCharacterDesc}
              onChange={(e) => setNewCharacterDesc(e.target.value)}
              onKeyPress={(e) =>
                e.key === "Enter" && !e.shiftKey && addCharacter()
              }
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      {/* Factions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Crown className="h-5 w-5" />
              Factions
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowHiddenFactions(!showHiddenFactions)}
              className="text-xs"
            >
              {showHiddenFactions ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
              Debug
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {getVisibleFactions().length === 0 ? (
            <div className="text-center py-6">
              <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
                <Crown className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">
                No factions yet. Track organizations and groups that influence
                your story.
              </p>
            </div>
          ) : (
            <ScrollArea className="h-48">
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
            </ScrollArea>
          )}
          <div className="space-y-2">
            <div className="flex gap-2">
              <Input
                placeholder="Faction name..."
                value={newFactionName}
                onChange={(e) => setNewFactionName(e.target.value)}
              />
              <Button onClick={addFaction} size="icon">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <Textarea
              placeholder="Faction description..."
              value={newFactionDesc}
              onChange={(e) => setNewFactionDesc(e.target.value)}
              onKeyPress={(e) =>
                e.key === "Enter" && !e.shiftKey && addFaction()
              }
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      {/* Clues */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Clues
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowHiddenClues(!showHiddenClues)}
              className="text-xs"
            >
              {showHiddenClues ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
              Debug
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {getVisibleClues().length === 0 ? (
            <div className="text-center py-6">
              <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
                <Search className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">
                No clues yet. Track important information and discoveries.
              </p>
            </div>
          ) : (
            <ScrollArea className="h-48">
              <div className="space-y-3">
                {getVisibleClues().map((clue) => (
                  <div
                    key={clue.id}
                    className={`p-3 border rounded space-y-2 ${
                      clue.hidden ? "bg-muted/50 border-dashed" : ""
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1">
                          <button
                            onClick={() =>
                              updateClueDiscovered(clue.id, !clue.discovered)
                            }
                            className={`px-2 py-1 text-xs rounded ${
                              clue.discovered
                                ? "bg-green-600 text-white"
                                : "bg-muted text-muted-foreground hover:bg-accent"
                            }`}
                          >
                            {clue.discovered ? "Discovered" : "Hidden"}
                          </button>
                        </div>
                        <Badge className={getImportanceColor(clue.importance)}>
                          {clue.importance}
                        </Badge>
                        {clue.hidden && (
                          <Badge variant="outline" className="text-xs">
                            Hidden
                          </Badge>
                        )}
                      </div>
                      <div className="flex gap-1">
                        {(["minor", "moderate", "major"] as const).map(
                          (importance) => (
                            <button
                              key={importance}
                              onClick={() =>
                                updateClueImportance(clue.id, importance)
                              }
                              className={`px-2 py-1 text-xs rounded ${
                                clue.importance === importance
                                  ? getImportanceColor(importance) +
                                    " text-white"
                                  : "bg-muted text-muted-foreground hover:bg-accent"
                              }`}
                            >
                              {importance}
                            </button>
                          ),
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {clue.description}
                    </p>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
          <div className="flex gap-2">
            <Input
              placeholder="New clue..."
              value={newClue}
              onChange={(e) => setNewClue(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && addClue()}
            />
            <Button onClick={addClue} size="icon">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
