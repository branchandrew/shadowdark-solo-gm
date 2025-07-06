import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Sword,
  Shield,
  Heart,
  Zap,
  User,
  Scroll,
  Plus,
  Upload,
  FileText,
} from "lucide-react";

interface CharacterStats {
  name: string;
  class: string;
  ancestry: string;
  background: string;
  level: number;
  hitPoints: { current: number; max: number };
  armorClass: number;
  attributes: {
    strength: number;
    dexterity: number;
    constitution: number;
    intelligence: number;
    wisdom: number;
    charisma: number;
  };
  talents: string[];
  equipment: string[];
  spells: string[];
}

export default function CharacterSheet() {
  const [character, setCharacter] = useState<CharacterStats | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const createNewCharacter = () => {
    const newCharacter: CharacterStats = {
      name: "",
      class: "",
      ancestry: "",
      background: "",
      level: 1,
      hitPoints: { current: 0, max: 0 },
      armorClass: 10,
      attributes: {
        strength: 10,
        dexterity: 10,
        constitution: 10,
        intelligence: 10,
        wisdom: 10,
        charisma: 10,
      },
      talents: [],
      equipment: [],
      spells: [],
    };
    setCharacter(newCharacter);
    setIsCreating(true);
  };

  const importCharacter = () => {
    // Simulate importing a character (in real implementation, this would open a file dialog)
    const importedCharacter: CharacterStats = {
      name: "Kael Shadowstep",
      class: "Rogue",
      ancestry: "Human",
      background: "Urchin",
      level: 1,
      hitPoints: { current: 6, max: 6 },
      armorClass: 12,
      attributes: {
        strength: 10,
        dexterity: 15,
        constitution: 12,
        intelligence: 13,
        wisdom: 14,
        charisma: 8,
      },
      talents: ["Backstab", "Thievery"],
      equipment: ["Shortsword", "Leather Armor", "Thieves' Tools", "50 gold"],
      spells: [],
    };
    setCharacter(importedCharacter);
    setIsCreating(false);
  };

  const resetCharacterSheet = () => {
    setCharacter(null);
    setIsCreating(false);
  };

  // Blank state when no character exists
  if (!character) {
    return (
      <div className="h-full flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <User className="h-6 w-6" />
              Character Sheet
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center space-y-2">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground" />
              <p className="text-muted-foreground">
                No character loaded. Create a new character or import an
                existing one to get started.
              </p>
            </div>

            <div className="space-y-3">
              <Button onClick={createNewCharacter} className="w-full" size="lg">
                <Plus className="h-4 w-4 mr-2" />
                Create New Character
              </Button>

              <Button
                onClick={importCharacter}
                variant="outline"
                className="w-full"
                size="lg"
              >
                <Upload className="h-4 w-4 mr-2" />
                Import Character Sheet
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getModifier = (score: number) => {
    return Math.floor((score - 10) / 2);
  };

  const formatModifier = (modifier: number) => {
    return modifier >= 0 ? `+${modifier}` : `${modifier}`;
  };

  return (
    <div className="space-y-6">
      {/* Character Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Character Management
            </span>
            <Button onClick={resetCharacterSheet} variant="outline" size="sm">
              New Character
            </Button>
          </CardTitle>
        </CardHeader>
      </Card>
      {/* Character Identity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Character Identity
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={character.name}
                onChange={(e) =>
                  setCharacter((prev) => ({ ...prev, name: e.target.value }))
                }
              />
            </div>
            <div>
              <Label htmlFor="class">Class</Label>
              <Input
                id="class"
                value={character.class}
                onChange={(e) =>
                  setCharacter((prev) => ({ ...prev, class: e.target.value }))
                }
              />
            </div>
            <div>
              <Label htmlFor="ancestry">Ancestry</Label>
              <Input
                id="ancestry"
                value={character.ancestry}
                onChange={(e) =>
                  setCharacter((prev) => ({
                    ...prev,
                    ancestry: e.target.value,
                  }))
                }
              />
            </div>
            <div>
              <Label htmlFor="background">Background</Label>
              <Input
                id="background"
                value={character.background}
                onChange={(e) =>
                  setCharacter((prev) => ({
                    ...prev,
                    background: e.target.value,
                  }))
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Combat Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sword className="h-5 w-5" />
            Combat Stats
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <Label className="text-sm font-medium">Level</Label>
              <div className="text-2xl font-bold text-primary">
                {character.level}
              </div>
            </div>
            <div className="text-center">
              <Label className="text-sm font-medium flex items-center justify-center gap-1">
                <Heart className="h-4 w-4" /> Hit Points
              </Label>
              <div className="text-2xl font-bold">
                <span className="text-primary">
                  {character.hitPoints.current}
                </span>
                <span className="text-muted-foreground">
                  /{character.hitPoints.max}
                </span>
              </div>
            </div>
            <div className="text-center">
              <Label className="text-sm font-medium flex items-center justify-center gap-1">
                <Shield className="h-4 w-4" /> Armor Class
              </Label>
              <div className="text-2xl font-bold text-primary">
                {character.armorClass}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Attributes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Attributes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(character.attributes).map(([attr, value]) => (
              <div
                key={attr}
                className="flex items-center justify-between p-2 border rounded"
              >
                <Label className="capitalize font-medium">{attr}</Label>
                <div className="text-right">
                  <div className="text-lg font-bold">{value}</div>
                  <div className="text-sm text-muted-foreground">
                    {formatModifier(getModifier(value))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Talents */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scroll className="h-5 w-5" />
            Talents & Abilities
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {character.talents.map((talent, index) => (
              <Badge key={index} variant="secondary">
                {talent}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Equipment */}
      <Card>
        <CardHeader>
          <CardTitle>Equipment</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={character.equipment.join("\n")}
            onChange={(e) =>
              setCharacter((prev) => ({
                ...prev,
                equipment: e.target.value
                  .split("\n")
                  .filter((item) => item.trim()),
              }))
            }
            placeholder="List your equipment, one item per line..."
            rows={6}
          />
        </CardContent>
      </Card>
    </div>
  );
}
