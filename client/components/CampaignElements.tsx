import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Network, Users, Crown, Eye, EyeOff } from "lucide-react";
import { useCampaignElements } from "@/hooks/useDatabase";
import type { Thread, Creature, Faction, Clue } from "../../shared/types";

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

  // Modal state
  const [selectedThread, setSelectedThread] = useState<Thread | null>(null);
  const [selectedCharacter, setSelectedCharacter] = useState<Creature | null>(
    null,
  );
  const [selectedFaction, setSelectedFaction] = useState<Faction | null>(null);

  // Visibility toggles for hidden elements
  const [showHiddenThreads, setShowHiddenThreads] = useState(false);
  const [showHiddenCharacters, setShowHiddenCharacters] = useState(false);
  const [showHiddenFactions, setShowHiddenFactions] = useState(false);

  // Simple debugging
  console.log("CampaignElements data:", {
    threads: threads.length,
    creatures: creatures.length,
    factions: factions.length,
    clues: clues.length,
  });

  // Debug hidden status
  console.log(
    "Hidden creatures:",
    creatures.filter((c) => c.hidden),
  );
  console.log(
    "Hidden factions:",
    factions.filter((f) => f.hidden),
  );
  console.log("Eye toggle states:", {
    showHiddenThreads,
    showHiddenCharacters,
    showHiddenFactions,
  });

  // Filter creatures by type for display
  const characters = creatures.filter(
    (c) =>
      c.creature_type === "npc" ||
      c.creature_type === "bbeg" ||
      c.creature_type === "lieutenant",
  );

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
    newDisposition: Creature["npc_disposition"],
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

  // Always show all elements, blur state is controlled by the eye toggle
  const getVisibleThreads = () => threads;
  const getVisibleCharacters = () => characters;
  const getVisibleFactions = () => factions;

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
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Network className="h-5 w-5" />
                Plot Threads
              </div>
              <button
                onClick={() => setShowHiddenThreads(!showHiddenThreads)}
                className="p-1 hover:bg-accent rounded transition-colors"
                title={
                  showHiddenThreads
                    ? "Hide spoiler elements"
                    : "Show spoiler elements"
                }
              >
                {showHiddenThreads ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
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
                    className={`p-3 border rounded transition-colors ${
                      thread.hidden && !showHiddenThreads
                        ? "bg-muted/50 blur-lg pointer-events-none select-none opacity-60"
                        : thread.hidden
                          ? "bg-muted/50 cursor-pointer hover:bg-accent/50"
                          : "cursor-pointer hover:bg-accent/50"
                    }`}
                    onClick={
                      thread.hidden && !showHiddenThreads
                        ? undefined
                        : () => setSelectedThread(thread)
                    }
                  >
                    <div className="text-sm font-medium mb-2">
                      {thread.description}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        className={getStatusColor(thread.status)}
                        variant="outline"
                      >
                        {thread.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* NPCs & Characters */}
        <Card className="flex flex-col h-full">
          <CardHeader className="flex-shrink-0">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                NPCs & Characters
              </div>
              <button
                onClick={() => setShowHiddenCharacters(!showHiddenCharacters)}
                className="p-1 hover:bg-accent rounded transition-colors"
                title={
                  showHiddenCharacters
                    ? "Hide spoiler elements"
                    : "Show spoiler elements"
                }
              >
                {showHiddenCharacters ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden">
            {getVisibleCharacters().length === 0 ? (
              <div className="text-center py-6">
                <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
                  <Users className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">
                  No characters yet.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {getVisibleCharacters().map((character) => (
                  <div
                    key={character.id}
                    className={`p-3 border rounded transition-colors ${
                      character.hidden && !showHiddenCharacters
                        ? "bg-muted/50 blur-lg pointer-events-none select-none opacity-30 grayscale"
                        : character.hidden
                          ? "bg-muted/50 cursor-pointer hover:bg-accent/50"
                          : "cursor-pointer hover:bg-accent/50"
                    }`}
                    style={
                      character.hidden && !showHiddenCharacters
                        ? { filter: "blur(4px) grayscale(100%)" }
                        : {}
                    }
                    onClick={
                      character.hidden && !showHiddenCharacters
                        ? undefined
                        : () => setSelectedCharacter(character)
                    }
                  >
                    <div className="text-sm font-medium mb-2">
                      {character.name}
                    </div>
                    <div className="flex items-center gap-2">
                      {character.creature_type === "bbeg" && (
                        <Badge
                          key="bbeg-badge"
                          variant="destructive"
                          className="text-xs"
                        >
                          BBEG
                        </Badge>
                      )}
                      {character.creature_type === "lieutenant" && (
                        <Badge
                          key="lieutenant-badge"
                          variant="secondary"
                          className="text-xs"
                        >
                          Lieutenant
                        </Badge>
                      )}
                      <Badge
                        className={getDispositionColor(
                          character.npc_disposition || "unknown",
                        )}
                        variant="outline"
                      >
                        {character.npc_disposition || "unknown"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Factions */}
        <Card className="flex flex-col h-full">
          <CardHeader className="flex-shrink-0">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Crown className="h-5 w-5" />
                Factions
              </div>
              <button
                onClick={() => setShowHiddenFactions(!showHiddenFactions)}
                className="p-1 hover:bg-accent rounded transition-colors"
                title={
                  showHiddenFactions
                    ? "Hide spoiler elements"
                    : "Show spoiler elements"
                }
              >
                {showHiddenFactions ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
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
              <div className="space-y-2">
                {getVisibleFactions().map((faction) => (
                  <div
                    key={faction.id}
                    className={`p-3 border rounded transition-colors ${
                      faction.hidden && !showHiddenFactions
                        ? "bg-muted/50 blur-lg pointer-events-none select-none opacity-60"
                        : faction.hidden
                          ? "bg-muted/50 cursor-pointer hover:bg-accent/50"
                          : "cursor-pointer hover:bg-accent/50"
                    }`}
                    onClick={
                      faction.hidden && !showHiddenFactions
                        ? undefined
                        : () => setSelectedFaction(faction)
                    }
                  >
                    <div className="text-sm font-medium mb-2">
                      {faction.name}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        key="influence-badge"
                        className={getInfluenceColor(faction.influence)}
                        variant="outline"
                      >
                        {faction.influence}
                      </Badge>
                      <Badge
                        key="relationship-badge"
                        className={getRelationshipColor(faction.relationship)}
                        variant="outline"
                      >
                        {faction.relationship}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Thread Details Modal */}
      <Dialog
        open={!!selectedThread}
        onOpenChange={() => setSelectedThread(null)}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Network className="h-5 w-5" />
              Plot Thread Details
            </DialogTitle>
          </DialogHeader>
          {selectedThread && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge className={getStatusColor(selectedThread.status)}>
                  {selectedThread.status}
                </Badge>
              </div>
              <div>
                <h4 className="font-medium mb-2">Description</h4>
                <p className="text-sm text-muted-foreground">
                  {selectedThread.description}
                </p>
              </div>
              <div className="flex gap-2">
                <span className="text-xs text-muted-foreground">Status:</span>
                <div className="flex gap-1">
                  {(["active", "dormant", "resolved"] as const).map(
                    (status) => (
                      <button
                        key={`thread-status-${status}`}
                        onClick={() =>
                          updateThreadStatus(selectedThread.id, status)
                        }
                        className={`px-2 py-1 text-xs rounded ${
                          selectedThread.status === status
                            ? getStatusColor(status) + " text-white"
                            : "bg-muted text-muted-foreground hover:bg-accent"
                        }`}
                      >
                        {status}
                      </button>
                    ),
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Character Details Modal */}
      <Dialog
        open={!!selectedCharacter}
        onOpenChange={() => setSelectedCharacter(null)}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Character Details
            </DialogTitle>
          </DialogHeader>
          {selectedCharacter && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <h3 className="font-medium text-lg">
                  {selectedCharacter.name}
                </h3>
                {selectedCharacter.creature_type === "bbeg" && (
                  <Badge
                    key="modal-bbeg-badge"
                    variant="destructive"
                    className="text-xs"
                  >
                    BBEG
                  </Badge>
                )}
                {selectedCharacter.creature_type === "lieutenant" && (
                  <Badge
                    key="modal-lieutenant-badge"
                    variant="secondary"
                    className="text-xs"
                  >
                    Lieutenant
                  </Badge>
                )}
              </div>
              <div>
                <h4 className="font-medium mb-2">Description</h4>
                <p className="text-sm text-muted-foreground">
                  {selectedCharacter.description}
                </p>
              </div>
              {selectedCharacter.creature_type === "bbeg" && (
                <>
                  {selectedCharacter.bbeg_motivation && (
                    <div key="bbeg-motivation">
                      <h4 className="font-medium mb-2">Motivation</h4>
                      <p className="text-sm text-muted-foreground">
                        {selectedCharacter.bbeg_motivation}
                      </p>
                    </div>
                  )}
                  {selectedCharacter.bbeg_hook && (
                    <div key="bbeg-hook">
                      <h4 className="font-medium mb-2">Adventure Hook</h4>
                      <p className="text-sm text-muted-foreground">
                        {selectedCharacter.bbeg_hook}
                      </p>
                    </div>
                  )}
                </>
              )}
              {selectedCharacter.creature_type === "lieutenant" && (
                <div>
                  <h4 className="font-medium mb-2">Background</h4>
                  <p className="text-sm text-muted-foreground">
                    {selectedCharacter.lieutenant_tarot_background}
                  </p>
                </div>
              )}
              <div className="flex gap-2">
                <span className="text-xs text-muted-foreground">
                  Disposition:
                </span>
                <div className="flex gap-1">
                  {(["friendly", "neutral", "hostile", "unknown"] as const).map(
                    (disposition) => (
                      <button
                        key={`character-disposition-${disposition}`}
                        onClick={() =>
                          updateCharacterDisposition(
                            selectedCharacter.id,
                            disposition,
                          )
                        }
                        className={`px-2 py-1 text-xs rounded ${
                          selectedCharacter.npc_disposition === disposition
                            ? getDispositionColor(disposition) + " text-white"
                            : "bg-muted text-muted-foreground hover:bg-accent"
                        }`}
                      >
                        {disposition}
                      </button>
                    ),
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Faction Details Modal */}
      <Dialog
        open={!!selectedFaction}
        onOpenChange={() => setSelectedFaction(null)}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5" />
              Faction Details
            </DialogTitle>
          </DialogHeader>
          {selectedFaction && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <h3 className="font-medium text-lg">{selectedFaction.name}</h3>
                <Badge className={getInfluenceColor(selectedFaction.influence)}>
                  {selectedFaction.influence}
                </Badge>
              </div>
              <div>
                <h4 className="font-medium mb-2">Description</h4>
                <p className="text-sm text-muted-foreground">
                  {selectedFaction.description}
                </p>
              </div>
              <div className="flex gap-2">
                <span className="text-xs text-muted-foreground">
                  Relationship:
                </span>
                <div className="flex gap-1">
                  {(["allied", "neutral", "opposed", "unknown"] as const).map(
                    (relationship) => (
                      <button
                        key={`faction-relationship-${relationship}`}
                        onClick={() =>
                          updateFactionRelationship(
                            selectedFaction.id,
                            relationship,
                          )
                        }
                        className={`px-2 py-1 text-xs rounded ${
                          selectedFaction.relationship === relationship
                            ? getRelationshipColor(relationship) + " text-white"
                            : "bg-muted text-muted-foreground hover:bg-accent"
                        }`}
                      >
                        {relationship}
                      </button>
                    ),
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
