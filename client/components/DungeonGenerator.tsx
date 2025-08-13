import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { RefreshCw, Copy, Edit3, Check, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

// Enhanced Data Structures for Phase 2
interface DungeonNameTemplate {
  id: number;
  template: string;
  parts: string[];
}

interface ThemeResult {
  category: string;
  specificTheme: string;
  categoryRoll: number;
  themeRoll: number;
}

interface DungeonOverview {
  form: string;
  situation: string;
  accessibility: string;
  builder: string;
  function: string;
  causeOfRuin: string;
  rolls: {
    formRoll: number;
    situationRoll: number;
    accessibilityRoll: number;
    builderRoll: number;
    functionRoll: number;
    causeOfRuinRoll: number;
  };
}

interface AreaExit {
  direction: string;
  exitRoll: number;
}

interface AreaContent {
  dressing: string;
  exits: AreaExit[];
  discoveries: string[];
  dangers: string[];
  dressingRoll: number;
  exitNumberRoll: number;
  contentRolls: Record<string, number>;
}

interface DungeonArea {
  id: number;
  isExplored: boolean;
  content?: AreaContent;
}

interface DungeonFoundation {
  name: {
    fullName: string;
    template: string;
    parts: Record<string, string>;
    rolls: Record<string, number>;
  };
  size: {
    name: string;
    totalAreas: number;
    areasFormula: string;
    themes: number;
    sizeRoll: number;
    areasRoll?: number;
  };
  themes: ThemeResult[];
  overview: DungeonOverview;
}

interface RoomPosition {
  x: number;
  y: number;
  roomId: number;
}

interface Connection {
  from: number;
  to: number;
  direction: string;
}

interface DungeonMap {
  rooms: RoomPosition[];
  connections: Connection[];
  gridWidth: number;
  gridHeight: number;
}

interface DungeonExploration {
  areas: DungeonArea[];
  isGenerated: boolean;
  map?: DungeonMap;
}

// All Table Data
const DUNGEON_NAME_TEMPLATES: DungeonNameTemplate[] = [
  { id: 1, template: "The [place]", parts: ['place'] },
  { id: 2, template: "The [place]", parts: ['place'] },
  { id: 3, template: "(The) [adjective] [place]", parts: ['adjective', 'place'] },
  { id: 4, template: "(The) [adjective] [place]", parts: ['adjective', 'place'] },
  { id: 5, template: "[The] [place] of the [noun]", parts: ['place', 'noun'] },
  { id: 6, template: "[The] [place] of the [noun]", parts: ['place', 'noun'] },
  { id: 7, template: "(The) [noun]'s [place]", parts: ['noun', 'place'] },
  { id: 8, template: "(The) [noun]'s [place]", parts: ['noun', 'place'] },
  { id: 9, template: "[place] of the [adjective] [noun]", parts: ['place', 'adjective', 'noun'] },
  { id: 10, template: "[place] of the [adjective] [noun]", parts: ['place', 'adjective', 'noun'] },
  { id: 11, template: "[The] [adjective] [noun]", parts: ['adjective', 'noun'] },
  { id: 12, template: "[The] [adjective] [noun]", parts: ['adjective', 'noun'] }
];

const PLACE_TABLE = [
  "Archive", "Blight", "Boneyard", "Catacomb", "Cave(s)", "Cavern(s)", "Citadel", "Cliff", "Crack", "Crag",
  "Crypt", "Curse", "Deep", "Delve", "Den", "Finger", "Fist", "Fort", "Fortress", "Grave",
  "Haunt", "Hold", "Hole(s)", "Hollow(s)", "Home", "House", "Jaws", "Keep", "Lair", "Maw",
  "Maze", "Mountain", "Mouth", "Peak", "Pit", "Remnant", "Retreat", "Ruin", "Shrine", "Skull",
  "Spire", "Temple", "Throne", "Tomb", "Tooth", "Tower", "Tunnel(s)", "Vault", "Warren", "Wreck"
];

const ADJECTIVE_TABLE = [
  "Ancient", "Ashen", "Black", "Bloody", "Blue", "Broken", "Burning", "Cracked", "Dark", "Dead",
  "Doomed", "Endless", "Evil", "Fallen", "Far", "Fearsome", "Floating", "Forbidden", "Forgotten", "Frozen",
  "Ghostly", "Gloomy", "Gray", "Grim", "Hidden", "High", "Holy", "Iron", "Jagged", "Lonely",
  "Lost", "Low", "Misty", "Petrified", "Red", "Screaming", "Sharp", "Shattered", "Shifting", "Shivering",
  "Shrouded", "Stoney", "Sunken", "Thorny", "Thundering", "Unholy", "White", "Wicked", "Withered", "Yellow"
];

const NOUN_TABLE = [
  "[Name]", "Arm", "Ash", "Beast", "Behemoth", "Blood", "Child", "Cinder", "Corpse", "Crystal",
  "Dagger", "Death", "Demon", "Devil", "Doom", "Dragon", "Eye", "Fear", "Finger", "Fire",
  "Foot", "Frog", "Ghost", "Giant", "Goblin", "God", "Hand", "Head", "Heart", "Horror",
  "Hero", "Horn", "King", "Knave", "Priest", "Prophet", "Queen", "Shard", "Skull", "Souls",
  "Spear", "Spirit", "Stone", "Sword", "Troll", "Warrior", "Water", "Witch", "Wizard", "Worm"
];

const DUNGEON_SIZE_TABLE = {
  1: { size: "small", areasFormula: "1d6+1", baseAreas: 1, dieType: 6, modifier: 1, themes: 2 },
  2: { size: "small", areasFormula: "1d6+1", baseAreas: 1, dieType: 6, modifier: 1, themes: 2 },
  3: { size: "small", areasFormula: "1d6+1", baseAreas: 1, dieType: 6, modifier: 1, themes: 2 },
  4: { size: "medium", areasFormula: "1d8+7", baseAreas: 7, dieType: 8, modifier: 7, themes: 3 },
  5: { size: "medium", areasFormula: "1d8+7", baseAreas: 7, dieType: 8, modifier: 7, themes: 3 },
  6: { size: "medium", areasFormula: "1d8+7", baseAreas: 7, dieType: 8, modifier: 7, themes: 3 },
  7: { size: "large", areasFormula: "1d10+15", baseAreas: 15, dieType: 10, modifier: 15, themes: 4 },
  8: { size: "large", areasFormula: "1d10+15", baseAreas: 15, dieType: 10, modifier: 15, themes: 4 },
  9: { size: "large", areasFormula: "1d10+15", baseAreas: 15, dieType: 10, modifier: 15, themes: 4 },
  10: { size: "huge", areasFormula: "1d12+25", baseAreas: 25, dieType: 12, modifier: 25, themes: 5 },
  11: { size: "huge", areasFormula: "1d12+25", baseAreas: 25, dieType: 12, modifier: 25, themes: 5 },
  12: { size: "megadungeon", areasFormula: "1d4+1 interconnected", baseAreas: 1, dieType: 4, modifier: 1, themes: 5, isSpecial: true }
};

const THEME_CATEGORIES = {
  hopeful: {
    name: "hopeful",
    themes: [
      "nature/growth", "law/order", "beauty/wonder", "healing/recovery", 
      "protection/defense", "completion", "inheritance/legacy", "balance/harmony", 
      "light/life", "prophecy", "divine influence", "transcendence"
    ]
  },
  mysterious: {
    name: "mysterious", 
    themes: [
      "burglary/theft", "desire/obsession", "secrets/deception", "imitation/mimicry",
      "inversion/reversal", "element [p55]", "transformation", "shadow/spirits",
      "cryptic knowledge", "divination/scrying", "madness", "magic type [p55]"
    ]
  },
  grim: {
    name: "grim",
    themes: [
      "pride/hubris", "hunger/gluttony", "greed/avarice", "wildness/savagery",
      "devotion/sacrifice", "forbidden knowledge", "control/dominance", "pain/torture",
      "wrath/war", "tragedy/loss", "chaos/corruption", "darkness/death"
    ]
  },
  gonzo: {
    name: "gonzo",
    themes: [
      "constructs/robots", "unexpected sentience", "space/time travel", "advanced technology",
      "utter insanity", "alien life", "cosmic alignment", "other plane(s)",
      "demons/devils", "unspeakable horrors", "elder gods", "roll 1d10 twice, combine"
    ]
  }
};

// Phase 2 Tables - "Plumb the Depths" (page 67)
const AREA_DRESSING_TABLE = {
  1: "breeze/sound/echo",
  2: "smell/odor/stench", 
  3: "lichen/mold/moss/fungus",
  4: "drip/seep/puddle/stream",
  5: "tracks/marks/scratches",
  6: "sign of activity/struggle/battle",
  7: "bones/remains of CREATURE [p53]",
  8: "junk/debris/refuse/waste",
  9: "broken structure/furniture",
  10: "inscription/ornamentation",
  11: "roll 1d10 twice, combine",
  12: "roll 1d10 twice, combine"
};

const AREA_EXITS_NUMBER = {
  1: 0, 2: 0,
  3: 1,
  4: 1, 5: 1, 6: 1,
  7: 2,
  8: 2, 9: 2,
  10: 3,
  11: 4,
  12: "1d6+1"
};

const AREA_EXITS_DIRECTION = {
  1: "down", 2: "down",
  3: "back",
  4: "forward", 5: "forward", 6: "forward",
  7: "forward",
  8: "left", 9: "left",
  10: "right",
  11: "right",
  12: "up"
};

const DUNGEON_DISCOVERY_TABLE = {
  1: "cave-in/collapse/obstacle",
  2: "blocked/locked exit",
  3: "pit/shaft/chasm",
  4: "pillars/columns",
  5: "alcoves/niches",
  6: "bridge/stairs/ramp",
  7: "well/pool/fountain",
  8: "puzzle",
  9: "trinkets/clothing",
  10: "supplies/tools/gear",
  11: "light source/fuel/ammo",
  12: "key/clue/map"
};

const DUNGEON_DANGER_TABLE = {
  1: "TRAP: alarm",
  2: "TRAP: pit",
  3: "TRAP: ensnaring/paralyzing",
  4: "TRAP: crushing/smashing",
  5: "CREATURE: piercing/puncturing",
  6: "CREATURE: chopping/slashing/slicing",
  7: "CREATURE: confusing (maze, etc.)",
  8: "CREATURE: gas (poison, etc.)",
  9: "CREATURE: ambush",
  10: "CREATURE: based on ELEMENT [p55]",
  11: "CREATURE: based on MAGIC TYPE [p55]",
  12: "CREATURE: based on ODDITY [p55]"
};

const DUNGEON_OVERVIEW_TABLES = {
  form: {
    1: "caves/caverns",
    2: "ruins of 1d8+3", 3: "ruins of 1d8+3",
    4: "mine", 5: "prison",
    6: "crypt/tomb/catacombs", 7: "crypt/tomb/catacombs",
    8: "stronghold/fortress/citadel", 9: "temple/sanctuary", 10: "tower/spire",
    11: "roll 1d10, add ODDITY [p55]", 12: "ruins of STEADING [p50]"
  },
  situation: {
    1: "aboveground", 2: "aboveground", 
    3: "part aboveground, part below", 4: "part aboveground, part below",
    5: "belowground", 6: "belowground", 7: "belowground", 8: "belowground", 
    9: "belowground", 10: "belowground", 11: "belowground",
    12: "extraordinary (floating, ephemeral, etc.)"
  },
  accessibility: {
    1: "sealed shut", 2: "purposely hidden", 
    3: "concealed by natural feature/terrain", 4: "concealed by natural feature/terrain",
    5: "buried (in earth, rubble, etc.)", 6: "buried (in earth, rubble, etc.)",
    7: "blocked by obstacle/out of reach",
    8: "clear/obvious", 9: "clear/obvious", 10: "clear/obvious",
    11: "multiple entrances; roll again 1d6+1 times, using 1d10",
    12: "multiple entrances; roll again 1d6+1 times, using 1d10"
  },
  builder: {
    1: "demigod/demon/alien",
    2: "natural (caves, etc.)", 3: "natural (caves, etc.)",
    4: "religious order/cult", 5: "religious order/cult", 
    6: "HUMANOID [p53] society", 7: "HUMANOID [p53] society", 8: "HUMANOID [p53] society", 
    9: "HUMANOID [p53] society", 10: "HUMANOID [p53] society",
    11: "wizard/lunatic", 12: "monarch/warlord"
  },
  function: {
    1: "indiscernible/mysterious", 2: "concealment/camouflage", 3: "extraction/production", 
    4: "confinement/containment", 5: "lair/den/hideout", 6: "archive/library/laboratory",
    7: "commemoration/funerary", 8: "worship/devotion", 9: "defense/protection", 
    10: "observation/divination", 11: "empowerment/intensification",
    12: "roll 1d10+1 twice, combine"
  },
  causeOfRuin: {
    1: "arcane disaster", 2: "damnation/curse",
    3: "natural disaster (earthquake, etc.)", 4: "natural disaster (earthquake, etc.)",
    5: "plague/famine/drought", 6: "overrun by monsters", 7: "overrun by monsters",
    8: "hubris", 9: "hubris", 10: "war/invasion",
    11: "depleted resources", 12: "better prospects elsewhere"
  }
};

interface DungeonGeneratorProps {
  mobileTab?: 'step1' | 'step2' | 'step3';
}

export default function DungeonGenerator({ mobileTab = 'step1' }: DungeonGeneratorProps = {}) {
  const { toast } = useToast();
  
  // Phase 1 State
  const [dungeonFoundation, setDungeonFoundation] = useState<DungeonFoundation | null>(null);
  const [loading, setLoading] = useState(false);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Record<string, string>>({});
  const [step1Complete, setStep1Complete] = useState(false);

  // User Selection State
  const [selectedSize, setSelectedSize] = useState<string>('random');
  const [selectedTheme, setSelectedTheme] = useState<string>('random');
  
  // Phase 2 State
  const [dungeonExploration, setDungeonExploration] = useState<DungeonExploration | null>(null);
  const [generatingDungeon, setGeneratingDungeon] = useState(false);
  const [generatingMap, setGeneratingMap] = useState(false);

  // Utility Functions
  const rollDie = (sides: number): number => Math.floor(Math.random() * sides) + 1;

  const generateDungeonName = () => {
    const templateRoll = rollDie(12);
    const selectedTemplate = DUNGEON_NAME_TEMPLATES[templateRoll - 1];
    
    const parts: Record<string, string> = {};
    const rolls: Record<string, number> = { templateRoll };
    
    selectedTemplate.parts.forEach(part => {
      let roll: number;
      
      if (part === 'place') {
        roll = rollDie(PLACE_TABLE.length);
        rolls[`${part}Roll`] = roll;
        parts[part] = PLACE_TABLE[roll - 1];
      } else if (part === 'adjective') {
        roll = rollDie(ADJECTIVE_TABLE.length);
        rolls[`${part}Roll`] = roll;
        parts[part] = ADJECTIVE_TABLE[roll - 1];
      } else if (part === 'noun') {
        roll = rollDie(NOUN_TABLE.length);
        rolls[`${part}Roll`] = roll;
        parts[part] = NOUN_TABLE[roll - 1];
      }
    });
    
    let finalName = selectedTemplate.template;
    Object.entries(parts).forEach(([part, value]) => {
      finalName = finalName.replace(`[${part}]`, value);
    });
    
    // Handle optional articles in parentheses
    finalName = finalName.replace(/\(The\)/g, Math.random() > 0.5 ? 'The' : '');
    finalName = finalName.replace(/\[The\]/g, Math.random() > 0.5 ? 'The ' : '');
    finalName = finalName.trim().replace(/\s+/g, ' ');
    
    return {
      fullName: finalName,
      template: selectedTemplate.template,
      parts,
      rolls
    };
  };

  const generateDungeonSize = () => {
    let sizeRoll: number;
    let sizeData: any;

    if (selectedSize === 'random') {
      sizeRoll = rollDie(12);
      sizeData = DUNGEON_SIZE_TABLE[sizeRoll as keyof typeof DUNGEON_SIZE_TABLE];
    } else {
      // Find the first entry that matches the selected size
      const sizeEntries = Object.entries(DUNGEON_SIZE_TABLE).filter(([_, data]) => data.size === selectedSize);
      if (sizeEntries.length > 0) {
        const randomEntry = sizeEntries[Math.floor(Math.random() * sizeEntries.length)];
        sizeRoll = parseInt(randomEntry[0]);
        sizeData = randomEntry[1];
      } else {
        // Fallback to random if invalid selection
        sizeRoll = rollDie(12);
        sizeData = DUNGEON_SIZE_TABLE[sizeRoll as keyof typeof DUNGEON_SIZE_TABLE];
      }
    }

    let totalAreas: number;
    let areasRoll: number | undefined;

    if (sizeData.isSpecial) {
      const dungeonCount = rollDie(sizeData.dieType) + sizeData.modifier;
      totalAreas = dungeonCount;
    } else {
      areasRoll = rollDie(sizeData.dieType);
      totalAreas = areasRoll + sizeData.modifier;
    }

    return {
      name: sizeData.size,
      totalAreas,
      areasFormula: sizeData.areasFormula,
      themes: sizeData.themes,
      sizeRoll,
      areasRoll
    };
  };

  const generateThemeCategory = (categoryRoll: number) => {
    if (categoryRoll >= 1 && categoryRoll <= 2) return THEME_CATEGORIES.hopeful;
    if (categoryRoll >= 3 && categoryRoll <= 5) return THEME_CATEGORIES.mysterious;
    if (categoryRoll >= 6 && categoryRoll <= 11) return THEME_CATEGORIES.grim;
    if (categoryRoll === 12) return THEME_CATEGORIES.gonzo;
    return THEME_CATEGORIES.grim;
  };

  const generateThemes = (numThemes: number): ThemeResult[] => {
    const themes: ThemeResult[] = [];

    // If user selected a specific theme, use it for the first theme
    if (selectedTheme !== 'random') {
      const category = THEME_CATEGORIES[selectedTheme as keyof typeof THEME_CATEGORIES];
      if (category) {
        const themeRoll = rollDie(12);
        const specificTheme = category.themes[themeRoll - 1];

        themes.push({
          category: category.name,
          specificTheme,
          categoryRoll: 0, // Indicate this was user-selected
          themeRoll
        });
      }
    }
    
    // Generate remaining themes randomly
    for (let i = themes.length; i < numThemes; i++) {
      const categoryRoll = rollDie(12);
      const selectedCategory = generateThemeCategory(categoryRoll);
      const themeRoll = rollDie(12);
      const specificTheme = selectedCategory.themes[themeRoll - 1];
      
      themes.push({
        category: selectedCategory.name,
        specificTheme,
        categoryRoll,
        themeRoll
      });
    }
    
    return themes;
  };

  const generateOverview = (): DungeonOverview => {
    const formRoll = rollDie(12);
    const situationRoll = rollDie(12);
    const accessibilityRoll = rollDie(12);
    const builderRoll = rollDie(12);
    const functionRoll = rollDie(12);
    const causeOfRuinRoll = rollDie(12);
    
    return {
      form: DUNGEON_OVERVIEW_TABLES.form[formRoll as keyof typeof DUNGEON_OVERVIEW_TABLES.form],
      situation: DUNGEON_OVERVIEW_TABLES.situation[situationRoll as keyof typeof DUNGEON_OVERVIEW_TABLES.situation],
      accessibility: DUNGEON_OVERVIEW_TABLES.accessibility[accessibilityRoll as keyof typeof DUNGEON_OVERVIEW_TABLES.accessibility],
      builder: DUNGEON_OVERVIEW_TABLES.builder[builderRoll as keyof typeof DUNGEON_OVERVIEW_TABLES.builder],
      function: DUNGEON_OVERVIEW_TABLES.function[functionRoll as keyof typeof DUNGEON_OVERVIEW_TABLES.function],
      causeOfRuin: DUNGEON_OVERVIEW_TABLES.causeOfRuin[causeOfRuinRoll as keyof typeof DUNGEON_OVERVIEW_TABLES.causeOfRuin],
      rolls: {
        formRoll,
        situationRoll,
        accessibilityRoll,
        builderRoll,
        functionRoll,
        causeOfRuinRoll
      }
    };
  };

  // Phase 2 Area Generation Functions
  const generateAreaDressing = () => {
    const roll = rollDie(12);
    let dressing = AREA_DRESSING_TABLE[roll as keyof typeof AREA_DRESSING_TABLE];
    
    if (roll >= 11) {
      const roll1 = rollDie(10);
      const roll2 = rollDie(10);
      const dressing1 = AREA_DRESSING_TABLE[roll1 as keyof typeof AREA_DRESSING_TABLE];
      const dressing2 = AREA_DRESSING_TABLE[roll2 as keyof typeof AREA_DRESSING_TABLE];
      dressing = `${dressing1} + ${dressing2}`;
    }
    
    return { dressing, roll };
  };
  
  const generateAreaExits = () => {
    const numberRoll = rollDie(12);
    let numExits = AREA_EXITS_NUMBER[numberRoll as keyof typeof AREA_EXITS_NUMBER];
    
    if (numExits === "1d6+1") {
      numExits = rollDie(6) + 1;
    }
    
    const exits: AreaExit[] = [];
    for (let i = 0; i < (numExits as number); i++) {
      const directionRoll = rollDie(12);
      exits.push({
        direction: AREA_EXITS_DIRECTION[directionRoll as keyof typeof AREA_EXITS_DIRECTION],
        exitRoll: directionRoll
      });
    }
    
    return { exits, numberRoll };
  };
  
  const generateAreaContent = () => {
    const dressingResult = generateAreaDressing();
    const exitsResult = generateAreaExits();
    
    const discoveries: string[] = [];
    const dangers: string[] = [];
    const contentRolls: Record<string, number> = {};
    
    // 50% chance for discovery
    if (Math.random() > 0.5) {
      const discoveryRoll = rollDie(12);
      contentRolls.discoveryRoll = discoveryRoll;
      discoveries.push(DUNGEON_DISCOVERY_TABLE[discoveryRoll as keyof typeof DUNGEON_DISCOVERY_TABLE]);
    }
    
    // 40% chance for danger  
    if (Math.random() > 0.6) {
      const dangerRoll = rollDie(12);
      contentRolls.dangerRoll = dangerRoll;
      dangers.push(DUNGEON_DANGER_TABLE[dangerRoll as keyof typeof DUNGEON_DANGER_TABLE]);
    }
    
    return {
      dressing: dressingResult.dressing,
      exits: exitsResult.exits,
      discoveries,
      dangers,
      dressingRoll: dressingResult.roll,
      exitNumberRoll: exitsResult.numberRoll,
      contentRolls
    };
  };

  const generateDungeonFoundation = async () => {
    setLoading(true);
    
    try {
      const name = generateDungeonName();
      const size = generateDungeonSize();
      const themes = generateThemes(size.themes);
      const overview = generateOverview();
      
      const foundation: DungeonFoundation = {
        name,
        size,
        themes,
        overview
      };
      
      setDungeonFoundation(foundation);
      setStep1Complete(true);
      
      // Initialize exploration system
      const areas: DungeonArea[] = [];
      for (let i = 1; i <= size.totalAreas; i++) {
        areas.push({
          id: i,
          isExplored: false
        });
      }

      setDungeonExploration({
        areas,
        isGenerated: false
      });
      
      toast({
        title: "Dungeon Foundation Generated!",
        description: `Created "${name.fullName}" - a ${size.name} dungeon with ${themes.length} themes.`,
      });
      
    } catch (error) {
      console.error('Error generating dungeon foundation:', error);
      toast({
        title: "Generation Error",
        description: "Failed to generate dungeon foundation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const generateFullDungeon = async () => {
    if (!dungeonExploration || !dungeonFoundation) return;

    setGeneratingDungeon(true);

    try {
      const updatedAreas = [...dungeonExploration.areas];

      // Generate content for all areas
      for (let i = 0; i < updatedAreas.length; i++) {
        const content = generateAreaContent();
        updatedAreas[i] = {
          ...updatedAreas[i],
          isExplored: true,
          content
        };
      }

      setDungeonExploration({
        areas: updatedAreas,
        isGenerated: true
      });

      toast({
        title: "Dungeon Generated!",
        description: `Generated complete dungeon with ${updatedAreas.length} areas.`,
      });
    } catch (error) {
      console.error('Error generating dungeon:', error);
      toast({
        title: "Generation Error",
        description: "Failed to generate dungeon. Please try again.",
        variant: "destructive",
      });
    } finally {
      setGeneratingDungeon(false);
    }
  };
  
  const generateDungeonMap = () => {
    if (!dungeonExploration || !dungeonFoundation) return;

    setGeneratingMap(true);

    try {
      const areas = dungeonExploration.areas;
      const totalAreas = areas.length;

      // Calculate grid size based on number of areas
      const gridSize = Math.ceil(Math.sqrt(totalAreas * 1.5)); // Add some spacing
      const rooms: RoomPosition[] = [];
      const connections: Connection[] = [];

      // Simple grid-based layout algorithm
      const roomPositions = new Map<number, {x: number, y: number}>();

      // Place room 1 at the center-ish position
      const startX = Math.floor(gridSize / 2);
      const startY = Math.floor(gridSize / 2);
      roomPositions.set(1, { x: startX, y: startY });

      // Track which positions are occupied
      const occupiedPositions = new Set<string>();
      occupiedPositions.add(`${startX},${startY}`);

      // Place remaining rooms using exit directions as hints
      for (let i = 0; i < areas.length; i++) {
        const area = areas[i];
        const roomId = area.id;

        if (roomId === 1) continue; // Already placed

        // Try to place based on connections from existing rooms
        let placed = false;

        // Look for rooms that have exits pointing to this general direction
        for (const [placedRoomId, placedPos] of roomPositions) {
          const placedArea = areas.find(a => a.id === placedRoomId);
          if (!placedArea?.content) continue;

          // Try each exit direction from the placed room
          for (const exit of placedArea.content.exits) {
            let targetX = placedPos.x;
            let targetY = placedPos.y;

            switch (exit.direction) {
              case 'forward':
              case 'up':
                targetY -= 1;
                break;
              case 'back':
              case 'down':
                targetY += 1;
                break;
              case 'left':
                targetX -= 1;
                break;
              case 'right':
                targetX += 1;
                break;
            }

            // Check bounds and if position is free
            if (targetX >= 0 && targetX < gridSize &&
                targetY >= 0 && targetY < gridSize &&
                !occupiedPositions.has(`${targetX},${targetY}`)) {

              roomPositions.set(roomId, { x: targetX, y: targetY });
              occupiedPositions.add(`${targetX},${targetY}`);
              placed = true;
              break;
            }
          }
          if (placed) break;
        }

        // If we couldn't place based on exits, find nearest free spot
        if (!placed) {
          for (let distance = 1; distance < gridSize; distance++) {
            for (let dx = -distance; dx <= distance; dx++) {
              for (let dy = -distance; dy <= distance; dy++) {
                if (Math.abs(dx) !== distance && Math.abs(dy) !== distance) continue;

                const targetX = startX + dx;
                const targetY = startY + dy;

                if (targetX >= 0 && targetX < gridSize &&
                    targetY >= 0 && targetY < gridSize &&
                    !occupiedPositions.has(`${targetX},${targetY}`)) {

                  roomPositions.set(roomId, { x: targetX, y: targetY });
                  occupiedPositions.add(`${targetX},${targetY}`);
                  placed = true;
                  break;
                }
              }
              if (placed) break;
            }
            if (placed) break;
          }
        }
      }

      // Convert to room positions array
      for (const [roomId, pos] of roomPositions) {
        rooms.push({ x: pos.x, y: pos.y, roomId });
      }

      // Generate connections based on exits and proximity
      for (const area of areas) {
        if (!area.content) continue;

        const roomPos = roomPositions.get(area.id);
        if (!roomPos) continue;

        for (const exit of area.content.exits) {
          let targetX = roomPos.x;
          let targetY = roomPos.y;

          switch (exit.direction) {
            case 'forward':
            case 'up':
              targetY -= 1;
              break;
            case 'back':
            case 'down':
              targetY += 1;
              break;
            case 'left':
              targetX -= 1;
              break;
            case 'right':
              targetX += 1;
              break;
          }

          // Find room at target position
          const targetRoom = rooms.find(r => r.x === targetX && r.y === targetY);
          if (targetRoom) {
            // Check if connection already exists
            const existingConnection = connections.find(
              c => (c.from === area.id && c.to === targetRoom.roomId) ||
                   (c.from === targetRoom.roomId && c.to === area.id)
            );

            if (!existingConnection) {
              connections.push({
                from: area.id,
                to: targetRoom.roomId,
                direction: exit.direction
              });
            }
          }
        }
      }

      const dungeonMap: DungeonMap = {
        rooms,
        connections,
        gridWidth: gridSize,
        gridHeight: gridSize
      };

      setDungeonExploration({
        ...dungeonExploration,
        map: dungeonMap
      });

      toast({
        title: "Map Generated!",
        description: `Created visual map with ${rooms.length} rooms and ${connections.length} connections.`,
      });

    } catch (error) {
      console.error('Error generating map:', error);
      toast({
        title: "Map Generation Error",
        description: "Failed to generate map. Please try again.",
        variant: "destructive",
      });
    } finally {
      setGeneratingMap(false);
    }
  };

  const formatDungeonForCopy = () => {
    if (!dungeonFoundation || !dungeonExploration) return '';

    const { name, size, themes, overview } = dungeonFoundation;
    const { areas } = dungeonExploration;

    let dungeonText = `COMPLETE DUNGEON: ${name.fullName}

FOUNDATION:
Size: ${size.name} (${size.totalAreas} areas, ${size.themes} themes)

Themes:
${themes.map((theme, i) => `${i + 1}. ${theme.category}: ${theme.specificTheme}`).join('\n')}

Overview:
Form: ${overview.form}
Situation: ${overview.situation}
Accessibility: ${overview.accessibility}
Builder: ${overview.builder}
Function: ${overview.function}
Cause of Ruin: ${overview.causeOfRuin}

AREAS:
`;

    areas.forEach((area) => {
      if (area.content) {
        dungeonText += `\nArea ${area.id}:
`;
        dungeonText += `Dressing: ${area.content.dressing}\n`;
        dungeonText += `Exits (${area.content.exits.length}): ${area.content.exits.map(e => e.direction).join(', ')}\n`;
        if (area.content.discoveries.length > 0) {
          dungeonText += `Discoveries: ${area.content.discoveries.join(', ')}\n`;
        }
        if (area.content.dangers.length > 0) {
          dungeonText += `Dangers: ${area.content.dangers.join(', ')}\n`;
        }
      }
    });

    return dungeonText;
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied!",
        description: "Content copied to clipboard.",
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy to clipboard.",
        variant: "destructive",
      });
    }
  };

  const handleEditStart = (field: string, currentValue: any) => {
    setEditingField(field);
    setEditValues({ [field]: String(currentValue || '') });
  };

  const handleEditSave = (field: string) => {
    if (dungeonFoundation) {
      const fieldParts = field.split('.');
      if (fieldParts.length === 2) {
        const [section, subfield] = fieldParts;
        setDungeonFoundation({
          ...dungeonFoundation,
          [section]: {
            ...dungeonFoundation[section as keyof DungeonFoundation],
            [subfield]: editValues[field]
          }
        });
      }
    }
    setEditingField(null);
    setEditValues({});
  };

  const handleEditCancel = () => {
    setEditingField(null);
    setEditValues({});
  };

  const formatFoundationForCopy = () => {
    if (!dungeonFoundation) return '';
    
    const { name, size, themes, overview } = dungeonFoundation;
    
    return `DUNGEON FOUNDATION

NAME: ${name.fullName}
SIZE: ${size.name} (${size.totalAreas} areas, ${size.themes} themes)

THEMES:
${themes.map((theme, i) => `${i + 1}. ${theme.category}: ${theme.specificTheme}`).join('\n')}

OVERVIEW:
Form: ${overview.form}
Situation: ${overview.situation}
Accessibility: ${overview.accessibility}
Builder: ${overview.builder}
Function: ${overview.function}
Cause of Ruin: ${overview.causeOfRuin}`;
  };

  return (
    <div className="flex h-full">
      {/* Step 1 - Left Panel */}
      <div className={`flex flex-col h-full flex-1 lg:border-r border-gray-300 lg:pr-3.5 ${mobileTab === 'step2' || mobileTab === 'step3' ? 'hidden lg:flex' : ''}`}>
        <div className="border-b border-gray-200 pb-4 flex-shrink-0">
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">Step 1</h2>
          <p className="text-gray-600 mb-4">Generate the foundational elements of your dungeon.</p>

          {/* Size Selection */}
          <div className="mb-4">
            <Label htmlFor="size-select" className="text-sm font-medium mb-2 block">Dungeon Size</Label>
            <Select value={selectedSize} onValueChange={setSelectedSize}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select size..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="random">Random</SelectItem>
                <SelectItem value="small">Small (2-7 areas, 2 themes)</SelectItem>
                <SelectItem value="medium">Medium (8-15 areas, 3 themes)</SelectItem>
                <SelectItem value="large">Large (16-25 areas, 4 themes)</SelectItem>
                <SelectItem value="huge">Huge (26-37 areas, 5 themes)</SelectItem>
                <SelectItem value="megadungeon">Megadungeon (2-5 interconnected, 5 themes)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Theme Selection */}
          <div className="mb-4">
            <Label htmlFor="theme-select" className="text-sm font-medium mb-2 block">Primary Theme</Label>
            <Select value={selectedTheme} onValueChange={setSelectedTheme}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select theme..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="random">Random</SelectItem>
                {Object.entries(THEME_CATEGORIES).map(([key, category]) => (
                  <SelectItem key={key} value={key} className="capitalize">
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={generateDungeonFoundation}
            disabled={loading}
            className="w-auto"
            style={{
              backgroundColor: 'var(--secondary-color)',
              borderRadius: '20px 17px 22px 15px',
              fontFamily: 'MedievalSharp, cursive',
            }}
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Generating Foundation...
              </>
            ) : (
              "Generate Dungeon Foundation"
            )}
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto min-h-0 mt-6">
          {dungeonFoundation && (
            <div className="space-y-4 pr-2">
              {/* Name Section */}
              <Card>
                <CardHeader className="pb-1.5">
                  <CardTitle className="text-base">
                    <span className="font-bold text-sm">Dungeon Name</span>
                    <span className="text-sm text-gray-600 font-normal ml-2">Template: {dungeonFoundation.name.template}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="bg-gray-50 border border-gray-200 rounded-md p-1.5">
                    <div className="flex gap-3 items-center justify-start">
                      <div className="flex-1">
                        {editingField === 'name.fullName' ? (
                          <Input
                            value={editValues['name.fullName'] || ''}
                            onChange={(e) => setEditValues({ ...editValues, 'name.fullName': e.target.value })}
                            className="font-serif font-semibold text-sm"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleEditSave('name.fullName');
                              if (e.key === 'Escape') handleEditCancel();
                            }}
                            autoFocus
                          />
                        ) : (
                          <span className="font-serif font-semibold text-lg">{dungeonFoundation.name.fullName}</span>
                        )}
                      </div>
                      <div className="flex-shrink-0 flex items-center">
                        {editingField === 'name.fullName' ? (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditSave('name.fullName')}
                              className="text-green-600 hover:text-green-800 p-1"
                            >
                              <Check className="w-3 h-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={handleEditCancel}
                              className="text-red-600 hover:text-red-800 p-1"
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditStart('name.fullName', dungeonFoundation.name.fullName)}
                              className="text-gray-500 hover:text-primary p-1"
                            >
                              <Edit3 className="w-3 h-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(dungeonFoundation.name.fullName)}
                              className="text-gray-500 hover:text-primary p-1"
                            >
                              <Copy className="w-3 h-3" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Size Section */}
              <Card>
                <CardHeader className="pb-1.5">
                  <CardTitle className="text-base">
                    <span className="font-bold text-sm">Size & Scope</span>
                    <span className="text-sm text-gray-600 font-normal ml-2">Roll: {dungeonFoundation.size.sizeRoll}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="bg-gray-50 border border-gray-200 rounded-md p-1.5">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Size:</span>
                        <span className="font-serif capitalize">{dungeonFoundation.size.name}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Total Areas:</span>
                        <span className="font-serif">{dungeonFoundation.size.totalAreas}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Themes:</span>
                        <span className="font-serif">{dungeonFoundation.size.themes}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Themes Section */}
              <Card>
                <CardHeader className="pb-1.5">
                  <CardTitle className="text-base">
                    <span className="font-bold text-sm">Themes</span>
                    <span className="text-sm text-gray-600 font-normal ml-2">{dungeonFoundation.themes.length} themes</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="bg-gray-50 border border-gray-200 rounded-md p-1.5">
                    <div className="space-y-2">
                      {dungeonFoundation.themes.map((theme, index) => (
                        <div key={index} className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="font-medium text-sm capitalize">{theme.category}</div>
                            <div className="font-serif text-sm">{theme.specificTheme}</div>
                          </div>
                          <div className="text-xs text-gray-500 ml-2">
                            {theme.categoryRoll}, {theme.themeRoll}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Overview Section */}
              <Card>
                <CardHeader className="pb-1.5">
                  <CardTitle className="text-base">
                    <span className="font-bold text-sm">Overview Framework</span>
                    <span className="text-sm text-gray-600 font-normal ml-2">6 key elements</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="bg-gray-50 border border-gray-200 rounded-md p-1.5">
                    <div className="space-y-2">
                      <div className="flex justify-between items-start">
                        <span className="font-medium text-sm">Form:</span>
                        <span className="font-serif text-sm text-right flex-1 ml-2">{dungeonFoundation.overview.form}</span>
                        <span className="text-xs text-gray-500 ml-2">{dungeonFoundation.overview.rolls.formRoll}</span>
                      </div>
                      <div className="flex justify-between items-start">
                        <span className="font-medium text-sm">Situation:</span>
                        <span className="font-serif text-sm text-right flex-1 ml-2">{dungeonFoundation.overview.situation}</span>
                        <span className="text-xs text-gray-500 ml-2">{dungeonFoundation.overview.rolls.situationRoll}</span>
                      </div>
                      <div className="flex justify-between items-start">
                        <span className="font-medium text-sm">Accessibility:</span>
                        <span className="font-serif text-sm text-right flex-1 ml-2">{dungeonFoundation.overview.accessibility}</span>
                        <span className="text-xs text-gray-500 ml-2">{dungeonFoundation.overview.rolls.accessibilityRoll}</span>
                      </div>
                      <div className="flex justify-between items-start">
                        <span className="font-medium text-sm">Builder:</span>
                        <span className="font-serif text-sm text-right flex-1 ml-2">{dungeonFoundation.overview.builder}</span>
                        <span className="text-xs text-gray-500 ml-2">{dungeonFoundation.overview.rolls.builderRoll}</span>
                      </div>
                      <div className="flex justify-between items-start">
                        <span className="font-medium text-sm">Function:</span>
                        <span className="font-serif text-sm text-right flex-1 ml-2">{dungeonFoundation.overview.function}</span>
                        <span className="text-xs text-gray-500 ml-2">{dungeonFoundation.overview.rolls.functionRoll}</span>
                      </div>
                      <div className="flex justify-between items-start">
                        <span className="font-medium text-sm">Cause of Ruin:</span>
                        <span className="font-serif text-sm text-right flex-1 ml-2">{dungeonFoundation.overview.causeOfRuin}</span>
                        <span className="text-xs text-gray-500 ml-2">{dungeonFoundation.overview.rolls.causeOfRuinRoll}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Copy All Button */}
              <Card>
                <CardContent className="pt-6">
                  <Button
                    onClick={() => copyToClipboard(formatFoundationForCopy())}
                    variant="outline"
                    className="w-full"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Complete Foundation
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>

      {/* Step 2 - Middle Panel */}
      <div className={`flex flex-col h-full flex-1 lg:border-r border-gray-300 lg:px-3.5 ${mobileTab === 'step1' || mobileTab === 'step3' ? 'hidden lg:flex' : ''}`}>
        <div className="border-b border-gray-200 pb-4 flex-shrink-0">
          <h2 className={`text-2xl font-semibold mb-2 ${step1Complete ? 'text-gray-800' : 'text-gray-400'}`}>Step 2</h2>
          <p className={`mb-4 ${step1Complete ? 'text-gray-600' : 'text-gray-400'}`}>Generate the complete dungeon with all areas.</p>
          <Button
            onClick={generateFullDungeon}
            disabled={generatingDungeon || !step1Complete || dungeonExploration?.isGenerated}
            className="w-auto"
            style={{
              backgroundColor: step1Complete && !dungeonExploration?.isGenerated ? 'var(--secondary-color)' : '#9CA3AF',
              borderRadius: '18px 24px 16px 21px',
              fontFamily: 'MedievalSharp, cursive',
            }}
          >
            {generatingDungeon ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Generating Dungeon...
              </>
            ) : dungeonExploration?.isGenerated ? (
              "Dungeon Generated"
            ) : (
              "Generate Complete Dungeon"
            )}
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto min-h-0 mt-6">
          {step1Complete && dungeonExploration && (
            <div className="pr-2 space-y-4">
              {/* Generation Status */}
              <Card>
                <CardHeader className="pb-1.5">
                  <CardTitle className="text-base">
                    <span className="font-bold text-sm">Dungeon Status</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="bg-gray-50 border border-gray-200 rounded-md p-1.5">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Total Areas:</span>
                        <span className="font-serif">{dungeonFoundation?.size.totalAreas}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Status:</span>
                        <span className={`font-serif ${
                          dungeonExploration.isGenerated
                            ? 'text-green-600 font-semibold'
                            : 'text-gray-500'
                        }`}>
                          {dungeonExploration.isGenerated ? 'Generated' : 'Not Generated'}
                        </span>
                      </div>
                      {dungeonExploration.isGenerated && (
                        <div className="text-center py-2">
                          <span className="text-green-600 font-semibold">🏰 Complete Dungeon Ready! 🏰</span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* All Areas Content */}
              {dungeonExploration.isGenerated && (
                <>
                  <Card>
                    <CardHeader className="pb-1.5">
                      <CardTitle className="text-base">
                        <span className="font-bold text-sm">Complete Dungeon Areas</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-4">
                        {dungeonExploration.areas.map((area) => (
                          <div key={area.id} className="bg-gray-50 border border-gray-200 rounded-md p-3">
                            <h4 className="font-bold text-sm mb-2 border-b border-gray-300 pb-1">
                              Area {area.id}
                            </h4>
                            {area.content && (
                              <div className="space-y-2">
                                {/* Dressing */}
                                <div>
                                  <div className="font-medium text-xs mb-1">Dressing:</div>
                                  <div className="font-serif text-xs text-gray-700">
                                    {area.content.dressing}
                                  </div>
                                </div>

                                {/* Exits */}
                                <div>
                                  <div className="font-medium text-xs mb-1">Exits ({area.content.exits.length}):</div>
                                  {area.content.exits.length === 0 ? (
                                    <div className="bg-yellow-50 border border-yellow-200 rounded px-2 py-1">
                                      <div className="font-serif text-xs text-yellow-800 font-semibold">No Obvious Exits</div>
                                      <div className="font-serif text-xs text-yellow-700 mt-1">
                                        Consider: Secret passages, concealed doors, collapsed tunnels, or special access (trap doors, teleportation, etc.)
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="flex flex-wrap gap-1">
                                      {area.content.exits.map((exit, idx) => (
                                        <span key={idx} className="font-serif text-xs bg-white px-2 py-1 rounded border capitalize">
                                          {exit.direction}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                </div>

                                {/* Discoveries */}
                                {area.content.discoveries.length > 0 && (
                                  <div>
                                    <div className="font-medium text-xs mb-1 text-blue-600">Discoveries:</div>
                                    <div className="space-y-1">
                                      {area.content.discoveries.map((discovery, idx) => (
                                        <div key={idx} className="font-serif text-xs text-blue-700 bg-blue-50 px-2 py-1 rounded">
                                          {discovery}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* Dangers */}
                                {area.content.dangers.length > 0 && (
                                  <div>
                                    <div className="font-medium text-xs mb-1 text-red-600">Dangers:</div>
                                    <div className="space-y-1">
                                      {area.content.dangers.map((danger, idx) => (
                                        <div key={idx} className="font-serif text-xs text-red-700 bg-red-50 px-2 py-1 rounded">
                                          {danger}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Copy Complete Dungeon Button */}
                  <Card>
                    <CardContent className="pt-6">
                      <Button
                        onClick={() => copyToClipboard(formatDungeonForCopy())}
                        variant="outline"
                        className="w-full"
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        Copy Complete Dungeon
                      </Button>
                    </CardContent>
                  </Card>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Step 3 - Right Panel */}
      <div className={`flex flex-col h-full flex-1 lg:pl-3.5 ${mobileTab === 'step1' || mobileTab === 'step2' ? 'hidden lg:flex' : ''}`}>
        <div className="border-b border-gray-200 pb-4 flex-shrink-0">
          <h2 className={`text-2xl font-semibold mb-2 ${dungeonExploration?.isGenerated ? 'text-gray-800' : 'text-gray-400'}`}>Step 3</h2>
          <p className={`mb-4 ${dungeonExploration?.isGenerated ? 'text-gray-600' : 'text-gray-400'}`}>Generate a visual map of your dungeon.</p>
          <Button
            onClick={generateDungeonMap}
            disabled={generatingMap || !dungeonExploration?.isGenerated || dungeonExploration?.map}
            className="w-auto"
            style={{
              backgroundColor: dungeonExploration?.isGenerated && !dungeonExploration?.map ? 'var(--secondary-color)' : '#9CA3AF',
              borderRadius: '16px 21px 18px 24px',
              fontFamily: 'MedievalSharp, cursive',
            }}
          >
            {generatingMap ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Generating Map...
              </>
            ) : dungeonExploration?.map ? (
              "Map Generated"
            ) : (
              "Generate Dungeon Map"
            )}
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto min-h-0 mt-6">
          {dungeonExploration?.map && (
            <div className="pr-2 space-y-4">
              {/* Map Display */}
              <Card>
                <CardHeader className="pb-1.5">
                  <CardTitle className="text-base">
                    <span className="font-bold text-sm">Dungeon Map</span>
                    <span className="text-sm text-gray-600 font-normal ml-2">{dungeonExploration.map.rooms.length} rooms</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
                    <svg
                      width="100%"
                      height="400"
                      viewBox={`0 0 ${dungeonExploration.map.gridWidth * 80} ${dungeonExploration.map.gridHeight * 80}`}
                      className="border border-gray-300 bg-white rounded"
                    >
                      {/* Draw connections first (so they appear behind rooms) */}
                      {dungeonExploration.map.connections.map((conn, idx) => {
                        const fromRoom = dungeonExploration.map!.rooms.find(r => r.roomId === conn.from);
                        const toRoom = dungeonExploration.map!.rooms.find(r => r.roomId === conn.to);
                        if (!fromRoom || !toRoom) return null;

                        const fromX = fromRoom.x * 80 + 40;
                        const fromY = fromRoom.y * 80 + 40;
                        const toX = toRoom.x * 80 + 40;
                        const toY = toRoom.y * 80 + 40;

                        return (
                          <line
                            key={`conn-${idx}`}
                            x1={fromX}
                            y1={fromY}
                            x2={toX}
                            y2={toY}
                            stroke="#6B7280"
                            strokeWidth="2"
                            strokeDasharray="5,5"
                          />
                        );
                      })}

                      {/* Draw rooms */}
                      {dungeonExploration.map.rooms.map((room) => {
                        const area = dungeonExploration.areas.find(a => a.id === room.roomId);
                        const hasDiscoveries = area?.content?.discoveries.length || 0;
                        const hasDangers = area?.content?.dangers.length || 0;

                        let fillColor = '#F9FAFB'; // Default gray
                        let strokeColor = '#D1D5DB';

                        if (hasDiscoveries && hasDangers) {
                          fillColor = '#FEF3C7'; // Yellow for both
                          strokeColor = '#F59E0B';
                        } else if (hasDiscoveries) {
                          fillColor = '#DBEAFE'; // Blue for discoveries
                          strokeColor = '#3B82F6';
                        } else if (hasDangers) {
                          fillColor = '#FEE2E2'; // Red for dangers
                          strokeColor = '#EF4444';
                        }

                        return (
                          <g key={`room-${room.roomId}`}>
                            <rect
                              x={room.x * 80 + 10}
                              y={room.y * 80 + 10}
                              width="60"
                              height="60"
                              fill={fillColor}
                              stroke={strokeColor}
                              strokeWidth="2"
                              rx="4"
                            />
                            <text
                              x={room.x * 80 + 40}
                              y={room.y * 80 + 45}
                              textAnchor="middle"
                              fontSize="16"
                              fontWeight="bold"
                              fill="#374151"
                            >
                              {room.roomId}
                            </text>
                          </g>
                        );
                      })}
                    </svg>
                  </div>

                  {/* Legend */}
                  <div className="mt-4 flex flex-wrap gap-4 text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-gray-50 border-2 border-gray-300 rounded"></div>
                      <span>Empty Room</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-blue-100 border-2 border-blue-400 rounded"></div>
                      <span>Discoveries</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-red-100 border-2 border-red-400 rounded"></div>
                      <span>Dangers</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-yellow-100 border-2 border-yellow-500 rounded"></div>
                      <span>Both</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-1 border-t-2 border-gray-400 border-dashed"></div>
                      <span>Connections</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Map Stats */}
              <Card>
                <CardHeader className="pb-1.5">
                  <CardTitle className="text-base">
                    <span className="font-bold text-sm">Map Statistics</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="bg-gray-50 border border-gray-200 rounded-md p-1.5">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Total Rooms:</span>
                        <span className="font-serif">{dungeonExploration.map.rooms.length}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Connections:</span>
                        <span className="font-serif">{dungeonExploration.map.connections.length}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Grid Size:</span>
                        <span className="font-serif">{dungeonExploration.map.gridWidth} × {dungeonExploration.map.gridHeight}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
