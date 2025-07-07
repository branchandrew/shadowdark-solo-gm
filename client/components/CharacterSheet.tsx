import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Plus,
  Trash2,
  Clipboard,
  Download,
  User,
  X,
  Skull,
} from "lucide-react";

interface Stats {
  STR: number;
  DEX: number;
  CON: number;
  INT: number;
  WIS: number;
  CHA: number;
}

interface Level {
  HitPointRoll: number;
  talentRolledName: string;
  talentRolledDesc: string;
  stoutHitPointRoll: number;
  level: number;
  Rolled12ChosenTalentName: string;
  Rolled12TalentOrTwoStatPoints: string;
  Rolled12ChosenTalentDesc: string;
}

interface Bonus {
  name: string;
  bonusAmount?: number;
  sourceCategory: string;
  sourceType: string;
  sourceName: string;
  bonusName: string;
  gainedAtLevel: number;
  bonusTo: string;
}

interface GearItem {
  instanceId: string;
  gearId: string;
  name: string;
  type: string;
  quantity: number;
  totalUnits: number;
  slots: number;
  cost: number;
  currency: string;
}

interface LedgerEntry {
  silverChange: number;
  desc: string;
  copperChange: number;
  notes: string;
  goldChange: number;
}

interface Edit {
  order: number;
  desc: string;
  level: number;
  theField: string;
}

interface Character {
  name: string;
  stats: Stats;
  rolledStats: Stats;
  ancestry: string;
  class: string;
  level: number;
  levels: Level[];
  XP: number;
  ambitionTalentLevel: Level;
  title: string;
  alignment: string;
  background: string;
  deity: string;
  maxHitPoints: number;
  armorClass: number;
  gearSlotsTotal: number;
  gearSlotsUsed: number;
  bonuses: Bonus[];
  goldRolled: number;
  gold: number;
  silver: number;
  copper: number;
  gear: GearItem[];
  treasures: any[];
  magicItems: any[];
  attacks: string[];
  ledger: LedgerEntry[];
  spellsKnown: string;
  languages: string;
  creationMethod: string;
  coreRulesOnly: boolean;
  activeSources: string[];
  edits: Edit[];
}

const EMPTY_CHARACTER: Character = {
  name: "",
  stats: { STR: 10, DEX: 10, CON: 10, INT: 10, WIS: 10, CHA: 10 },
  rolledStats: { STR: 10, DEX: 10, CON: 10, INT: 10, WIS: 10, CHA: 10 },
  ancestry: "",
  class: "",
  level: 1,
  levels: [],
  XP: 0,
  ambitionTalentLevel: {
    HitPointRoll: 0,
    talentRolledName: "",
    talentRolledDesc: "",
    stoutHitPointRoll: 0,
    level: 1,
    Rolled12ChosenTalentName: "",
    Rolled12TalentOrTwoStatPoints: "",
    Rolled12ChosenTalentDesc: "",
  },
  title: "",
  alignment: "",
  background: "",
  deity: "",
  maxHitPoints: 0,
  armorClass: 10,
  gearSlotsTotal: 10,
  gearSlotsUsed: 0,
  bonuses: [],
  goldRolled: 0,
  gold: 0,
  silver: 0,
  copper: 0,
  gear: [],
  treasures: [],
  magicItems: [],
  attacks: [],
  ledger: [],
  spellsKnown: "None",
  languages: "Common",
  creationMethod: "Manual",
  coreRulesOnly: true,
  activeSources: ["SD"],
  edits: [],
};

export default function CharacterSheet() {
  const [character, setCharacter] = useState<Character>(EMPTY_CHARACTER);
  const [newGearName, setNewGearName] = useState("");
  const [newAttack, setNewAttack] = useState("");
  const [showPasteDialog, setShowPasteDialog] = useState(false);
  const [pastedJson, setPastedJson] = useState("");
  const [hasExplicitCharacter, setHasExplicitCharacter] = useState(false);
  const [showKillDialog, setShowKillDialog] = useState(false);

  // Load character from localStorage on mount
  useEffect(() => {
    const savedCharacter = localStorage.getItem("shadowdark_character");
    const hasExplicitFlag = localStorage.getItem("shadowdark_has_character");

    if (savedCharacter && hasExplicitFlag === "true") {
      try {
        setCharacter(JSON.parse(savedCharacter));
        setHasExplicitCharacter(true);
      } catch (error) {
        console.error("Failed to parse saved character:", error);
      }
    }
  }, []);

  // Save character to localStorage when it changes (only if user has explicitly created one)
  useEffect(() => {
    if (hasExplicitCharacter) {
      localStorage.setItem("shadowdark_character", JSON.stringify(character));
      localStorage.setItem("shadowdark_has_character", "true");
    }
  }, [character, hasExplicitCharacter]);

  const updateCharacter = (updates: Partial<Character>) => {
    setCharacter((prev) => ({ ...prev, ...updates }));
    if (!hasExplicitCharacter) {
      setHasExplicitCharacter(true);
    }
  };

  const updateStats = (stat: keyof Stats, value: number) => {
    setCharacter((prev) => ({
      ...prev,
      stats: { ...prev.stats, [stat]: value },
      rolledStats: { ...prev.rolledStats, [stat]: value },
    }));
  };

  const getStatModifier = (score: number): string => {
    const mod = Math.floor((score - 10) / 2);
    return mod >= 0 ? `+${mod}` : `${mod}`;
  };

  const addGearItem = () => {
    if (newGearName.trim()) {
      const newItem: GearItem = {
        instanceId: Date.now().toString(),
        gearId: `custom_${Date.now()}`,
        name: newGearName,
        type: "sundry",
        quantity: 1,
        totalUnits: 1,
        slots: 1,
        cost: 0,
        currency: "gp",
      };
      setCharacter((prev) => ({
        ...prev,
        gear: [...prev.gear, newItem],
        gearSlotsUsed: prev.gearSlotsUsed + 1,
      }));
      setNewGearName("");
    }
  };

  const removeGearItem = (instanceId: string) => {
    setCharacter((prev) => {
      const item = prev.gear.find((g) => g.instanceId === instanceId);
      return {
        ...prev,
        gear: prev.gear.filter((g) => g.instanceId !== instanceId),
        gearSlotsUsed: prev.gearSlotsUsed - (item?.slots || 0),
      };
    });
  };

  const addAttack = () => {
    if (newAttack.trim()) {
      setCharacter((prev) => ({
        ...prev,
        attacks: [...prev.attacks, newAttack],
      }));
      setNewAttack("");
    }
  };

  const removeAttack = (index: number) => {
    setCharacter((prev) => ({
      ...prev,
      attacks: prev.attacks.filter((_, i) => i !== index),
    }));
  };

  const exportCharacter = () => {
    const dataStr = JSON.stringify(character, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${character.name || "character"}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const importFromPaste = () => {
    if (!pastedJson.trim()) {
      alert("Please paste some JSON first");
      return;
    }

    try {
      const imported = JSON.parse(pastedJson);

      // Basic validation - check if it looks like a Shadowdark character
      if (!imported.name && !imported.stats && !imported.ancestry) {
        throw new Error(
          "This doesn't appear to be a valid Shadowdark character JSON",
        );
      }

      setCharacter(imported);
      setHasExplicitCharacter(true);
      setShowPasteDialog(false);
      setPastedJson("");
    } catch (error) {
      console.error("Failed to import character:", error);
      alert(
        error instanceof Error
          ? `Invalid JSON: ${error.message}`
          : "Invalid character JSON. Please check the format and try again.",
      );
    }
  };

  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setPastedJson(text);
    } catch (error) {
      console.error("Failed to read clipboard:", error);
      alert("Could not read from clipboard. Please paste manually.");
    }
  };

  const killCharacter = () => {
    // Clear character data and reset to empty state
    setCharacter(EMPTY_CHARACTER);
    setHasExplicitCharacter(false);
    localStorage.removeItem("shadowdark_character");
    localStorage.removeItem("shadowdark_has_character");
    setShowKillDialog(false);
  };

  // Show empty state until user explicitly creates or imports a character
  if (!hasExplicitCharacter) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center space-y-6 max-w-md">
          <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center">
            <User className="h-8 w-8 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">No Character Created</h3>
            <p className="text-muted-foreground text-sm">
              Create a new character or import one from Shadowdarklings.net
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={() => updateCharacter({ name: "New Character" })}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Create Character
            </Button>

            <Dialog open={showPasteDialog} onOpenChange={setShowPasteDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <Clipboard className="h-4 w-4" />
                  Paste from Shadowdarklings.net
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    Import Character from Shadowdarklings.net
                  </DialogTitle>
                  <DialogDescription>
                    Copy the JSON export from Shadowdarklings.net and paste it
                    below, then click Import.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label>Character JSON</Label>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handlePasteFromClipboard}
                        className="text-xs"
                      >
                        <Clipboard className="h-3 w-3 mr-1" />
                        Paste from Clipboard
                      </Button>
                    </div>
                    <Textarea
                      placeholder="Paste your Shadowdarklings.net JSON export here..."
                      value={pastedJson}
                      onChange={(e) => setPastedJson(e.target.value)}
                      rows={12}
                      className="font-mono text-sm"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowPasteDialog(false);
                        setPastedJson("");
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={importFromPaste}
                      disabled={!pastedJson.trim()}
                    >
                      Import Character
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Character Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Character Sheet
            </CardTitle>
            <div className="flex gap-2">
              <Dialog open={showPasteDialog} onOpenChange={setShowPasteDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Clipboard className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>
                      Import Character from Shadowdarklings.net
                    </DialogTitle>
                    <DialogDescription>
                      Copy the JSON export from Shadowdarklings.net and paste it
                      below, then click Import.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <Label>Character JSON</Label>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handlePasteFromClipboard}
                          className="text-xs"
                        >
                          <Clipboard className="h-3 w-3 mr-1" />
                          Paste from Clipboard
                        </Button>
                      </div>
                      <Textarea
                        placeholder="Paste your Shadowdarklings.net JSON export here..."
                        value={pastedJson}
                        onChange={(e) => setPastedJson(e.target.value)}
                        rows={12}
                        className="font-mono text-sm"
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setShowPasteDialog(false);
                          setPastedJson("");
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={importFromPaste}
                        disabled={!pastedJson.trim()}
                      >
                        Import Character
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              <Button variant="outline" size="sm" onClick={exportCharacter}>
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                value={character.name}
                onChange={(e) => updateCharacter({ name: e.target.value })}
                placeholder="Character name"
              />
            </div>
            <div className="space-y-2">
              <Label>Ancestry</Label>
              <Input
                value={character.ancestry}
                onChange={(e) => updateCharacter({ ancestry: e.target.value })}
                placeholder="e.g., Human, Elf, Dwarf"
              />
            </div>
            <div className="space-y-2">
              <Label>Class</Label>
              <Input
                value={character.class}
                onChange={(e) => updateCharacter({ class: e.target.value })}
                placeholder="e.g., Fighter, Thief, Wizard"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Level</Label>
              <Input
                type="number"
                min="1"
                max="10"
                value={character.level}
                onChange={(e) =>
                  updateCharacter({ level: parseInt(e.target.value) || 1 })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>XP</Label>
              <Input
                type="number"
                min="0"
                value={character.XP}
                onChange={(e) =>
                  updateCharacter({ XP: parseInt(e.target.value) || 0 })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Title</Label>
              <Input
                value={character.title}
                onChange={(e) => updateCharacter({ title: e.target.value })}
                placeholder="Character title"
              />
            </div>
            <div className="space-y-2">
              <Label>Alignment</Label>
              <Input
                value={character.alignment}
                onChange={(e) => updateCharacter({ alignment: e.target.value })}
                placeholder="e.g., Lawful, Neutral, Chaotic"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Background</Label>
              <Input
                value={character.background}
                onChange={(e) =>
                  updateCharacter({ background: e.target.value })
                }
                placeholder="Character background"
              />
            </div>
            <div className="space-y-2">
              <Label>Deity</Label>
              <Input
                value={character.deity}
                onChange={(e) => updateCharacter({ deity: e.target.value })}
                placeholder="Patron deity"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="stats" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="stats">Stats & Combat</TabsTrigger>
          <TabsTrigger value="gear">Gear & Equipment</TabsTrigger>
          <TabsTrigger value="abilities">Abilities & Talents</TabsTrigger>
          <TabsTrigger value="notes">Notes & Details</TabsTrigger>
        </TabsList>

        <TabsContent value="stats" className="space-y-4">
          {/* Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Ability Scores</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                {Object.entries(character.stats).map(([stat, value]) => (
                  <div key={stat} className="text-center space-y-2">
                    <Label className="font-bold">{stat}</Label>
                    <Input
                      type="number"
                      min="3"
                      max="18"
                      value={value}
                      onChange={(e) =>
                        updateStats(
                          stat as keyof Stats,
                          parseInt(e.target.value) || 10,
                        )
                      }
                      className="text-center"
                    />
                    <div className="text-sm text-muted-foreground">
                      {getStatModifier(value)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Combat Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Combat</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Hit Points</Label>
                  <Input
                    type="number"
                    min="1"
                    value={character.maxHitPoints}
                    onChange={(e) =>
                      updateCharacter({
                        maxHitPoints: parseInt(e.target.value) || 1,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Armor Class</Label>
                  <Input
                    type="number"
                    min="10"
                    value={character.armorClass}
                    onChange={(e) =>
                      updateCharacter({
                        armorClass: parseInt(e.target.value) || 10,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>
                    Gear Slots ({character.gearSlotsUsed}/
                    {character.gearSlotsTotal})
                  </Label>
                  <Input
                    type="number"
                    min="1"
                    value={character.gearSlotsTotal}
                    onChange={(e) =>
                      updateCharacter({
                        gearSlotsTotal: parseInt(e.target.value) || 10,
                      })
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Attacks */}
          <Card>
            <CardHeader>
              <CardTitle>Attacks</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {character.attacks.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No attacks configured
                </p>
              ) : (
                <div className="space-y-2">
                  {character.attacks.map((attack, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 p-2 border rounded"
                    >
                      <span className="flex-1 font-mono text-sm">{attack}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeAttack(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex gap-2">
                <Input
                  placeholder="e.g., LONGSWORD: +3 (N), 1d8+1"
                  value={newAttack}
                  onChange={(e) => setNewAttack(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && addAttack()}
                />
                <Button onClick={addAttack} size="icon">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="gear" className="space-y-4">
          {/* Currency */}
          <Card>
            <CardHeader>
              <CardTitle>Currency</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Gold</Label>
                  <Input
                    type="number"
                    min="0"
                    value={character.gold}
                    onChange={(e) =>
                      updateCharacter({ gold: parseInt(e.target.value) || 0 })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Silver</Label>
                  <Input
                    type="number"
                    min="0"
                    value={character.silver}
                    onChange={(e) =>
                      updateCharacter({ silver: parseInt(e.target.value) || 0 })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Copper</Label>
                  <Input
                    type="number"
                    min="0"
                    value={character.copper}
                    onChange={(e) =>
                      updateCharacter({ copper: parseInt(e.target.value) || 0 })
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Gear */}
          <Card>
            <CardHeader>
              <CardTitle>Equipment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {character.gear.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No equipment added
                </p>
              ) : (
                <ScrollArea className="h-60">
                  <div className="space-y-2">
                    {character.gear.map((item) => (
                      <div
                        key={item.instanceId}
                        className="flex items-center gap-2 p-3 border rounded"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{item.name}</span>
                            <Badge variant="outline">{item.type}</Badge>
                            {item.quantity > 1 && (
                              <Badge variant="secondary">
                                x{item.quantity}
                              </Badge>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Slots: {item.slots} • Cost: {item.cost}{" "}
                            {item.currency}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeGearItem(item.instanceId)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
              <div className="flex gap-2">
                <Input
                  placeholder="Add equipment..."
                  value={newGearName}
                  onChange={(e) => setNewGearName(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && addGearItem()}
                />
                <Button onClick={addGearItem} size="icon">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="abilities" className="space-y-4">
          {/* Bonuses & Talents */}
          <Card>
            <CardHeader>
              <CardTitle>Bonuses & Talents</CardTitle>
            </CardHeader>
            <CardContent>
              {character.bonuses.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No bonuses or talents recorded
                </p>
              ) : (
                <div className="space-y-3">
                  {character.bonuses.map((bonus, index) => (
                    <div key={index} className="p-3 border rounded space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{bonus.name}</span>
                        <Badge variant="outline">{bonus.sourceType}</Badge>
                        <Badge variant="secondary">
                          Level {bonus.gainedAtLevel}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Source: {bonus.sourceName} • Applies to: {bonus.bonusTo}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notes" className="space-y-4">
          {/* Languages & Spells */}
          <Card>
            <CardHeader>
              <CardTitle>Languages & Magic</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Languages</Label>
                <Input
                  value={character.languages}
                  onChange={(e) =>
                    updateCharacter({ languages: e.target.value })
                  }
                  placeholder="e.g., Common, Elvish, Draconic"
                />
              </div>
              <div className="space-y-2">
                <Label>Spells Known</Label>
                <Textarea
                  value={character.spellsKnown}
                  onChange={(e) =>
                    updateCharacter({ spellsKnown: e.target.value })
                  }
                  placeholder="List known spells..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Character Details */}
          <Card>
            <CardHeader>
              <CardTitle>Character Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Creation Method:</span>{" "}
                  {character.creationMethod}
                </div>
                <div>
                  <span className="font-medium">Core Rules Only:</span>{" "}
                  {character.coreRulesOnly ? "Yes" : "No"}
                </div>
                <div>
                  <span className="font-medium">Active Sources:</span>{" "}
                  {character.activeSources.join(", ")}
                </div>
                <div>
                  <span className="font-medium">Starting Gold:</span>{" "}
                  {character.goldRolled}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
