import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Network, Users, Crown, Search, Eye, EyeOff } from "lucide-react";

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
  const [threads, setThreads] = useState<Thread[]>([]);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [factions, setFactions] = useState<Faction[]>([]);
  const [clues, setClues] = useState<Clue[]>([]);

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

  const addThread = () => {
    if (newThread.trim()) {
      setThreads((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          description: newThread,
          status: "active",
          hidden: false,
        },
      ]);
      setNewThread("");
    }
  };

  const addCharacter = () => {
    if (newCharacterName.trim() && newCharacterDesc.trim()) {
      setCharacters((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          name: newCharacterName,
          description: newCharacterDesc,
          disposition: "unknown",
          hidden: false,
        },
      ]);
      setNewCharacterName("");
      setNewCharacterDesc("");
    }
  };

  const addFaction = () => {
    if (newFactionName.trim() && newFactionDesc.trim()) {
      setFactions((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          name: newFactionName,
          description: newFactionDesc,
          influence: "minor",
          relationship: "unknown",
          hidden: false,
        },
      ]);
      setNewFactionName("");
      setNewFactionDesc("");
    }
  };

  const addClue = () => {
    if (newClue.trim()) {
      setClues((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          description: newClue,
          discovered: false,
          importance: "minor",
          hidden: false,
        },
      ]);
      setNewClue("");
    }
  };

  const updateThreadStatus = (
    threadId: string,
    newStatus: Thread["status"],
  ) => {
    setThreads((prev) =>
      prev.map((thread) =>
        thread.id === threadId ? { ...thread, status: newStatus } : thread,
      ),
    );
  };

  const updateCharacterDisposition = (
    characterId: string,
    newDisposition: Character["disposition"],
  ) => {
    setCharacters((prev) =>
      prev.map((character) =>
        character.id === characterId
          ? { ...character, disposition: newDisposition }
          : character,
      ),
    );
  };

  const updateFactionRelationship = (
    factionId: string,
    newRelationship: Faction["relationship"],
  ) => {
    setFactions((prev) =>
      prev.map((faction) =>
        faction.id === factionId
          ? { ...faction, relationship: newRelationship }
          : faction,
      ),
    );
  };

  const updateClueDiscovered = (clueId: string, discovered: boolean) => {
    setClues((prev) =>
      prev.map((clue) => (clue.id === clueId ? { ...clue, discovered } : clue)),
    );
  };

  const updateClueImportance = (
    clueId: string,
    importance: Clue["importance"],
  ) => {
    setClues((prev) =>
      prev.map((clue) => (clue.id === clueId ? { ...clue, importance } : clue)),
    );
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
                              character.disposition === disposition
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
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5" />
            Factions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {factions.length === 0 ? (
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
                {factions.map((faction) => (
                  <div
                    key={faction.id}
                    className="p-3 border rounded space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{faction.name}</span>
                        <Badge className={getInfluenceColor(faction.influence)}>
                          {faction.influence}
                        </Badge>
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
    </div>
  );
}
