// Shared types between frontend and backend
// This ensures type safety across the entire application

export interface Stats {
  STR: number;
  DEX: number;
  CON: number;
  INT: number;
  WIS: number;
  CHA: number;
}

export interface Level {
  HitPointRoll: number;
  talentRolledName: string;
  talentRolledDesc: string;
  stoutHitPointRoll: number;
  level: number;
  Rolled12ChosenTalentName: string;
  Rolled12TalentOrTwoStatPoints: string;
  Rolled12ChosenTalentDesc: string;
}

export interface Bonus {
  name: string;
  bonusAmount?: number;
  sourceCategory: string;
  sourceType: string;
  sourceName: string;
  bonusName: string;
  gainedAtLevel: number;
  bonusTo: string;
}

export interface GearItem {
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

export interface LedgerEntry {
  silverChange: number;
  desc: string;
  copperChange: number;
  notes: string;
  goldChange: number;
}

export interface Edit {
  order: number;
  desc: string;
  level: number;
  theField: string;
}

export interface Character {
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

// === RELATIONAL DATABASE ENTITIES ===

// Base creature type for all lifeforms (BBEG, Lieutenants, Monsters, NPCs)
export interface Creature {
  id: string;
  session_id: string;
  adventure_arc_id?: string; // FK to AdventureArc (if related to main story)

  // Common creature attributes
  name: string;
  race_species: string; // e.g., "Human", "Orc", "Skeleton"
  description: string;

  // Shadowdark stats (standard for all creatures)
  armor_class: number;
  hit_points: string; // e.g., "2d6+2" or actual number as string
  current_hit_points?: number; // For tracking damage in session
  speed: string;
  abilities: Stats; // STR, DEX, CON, INT, WIS, CHA
  attacks: string[];
  special_abilities: string[];
  challenge_rating?: number; // Mainly for monsters, optional for others

  // Creature type and status
  creature_type: "bbeg" | "lieutenant" | "monster" | "npc";
  status: "alive" | "dead" | "fled" | "unknown";
  hidden: boolean;

  // Type-specific fields (conditional based on creature_type)

  // BBEG-specific fields
  bbeg_motivation?: string;
  bbeg_hook?: string;

  // Lieutenant-specific fields (no tarot_spread stored - generated then discarded)
  lieutenant_seed?: string;
  lieutenant_occupation?: string;
  lieutenant_background?: string;
  lieutenant_why_protect?: string;
  lieutenant_how_protect?: string;
  lieutenant_reward?: string;

  // Monster-specific fields
  is_minion_of_bbeg?: boolean;
  source?: "shadowdark_core" | "custom"; // For monsters from official sources vs custom

  // NPC-specific fields
  npc_disposition?: "friendly" | "neutral" | "hostile" | "unknown";
  npc_role?:
    | "ally"
    | "neutral"
    | "enemy"
    | "merchant"
    | "guard"
    | "villager"
    | "other";

  // Common optional fields
  faction_id?: string; // FK to Faction (BBEG and Lieutenants can be aligned with factions)
  notes?: string;

  // Metadata
  created_at: string;
  updated_at: string;
}

// Separate factions table with FK to adventure arc
export interface Faction {
  id: string;
  session_id: string;
  adventure_arc_id?: string; // FK to AdventureArc
  name: string;
  description: string;
  influence: "minor" | "moderate" | "major";
  relationship: "allied" | "neutral" | "opposed" | "unknown";
  hidden: boolean;
  created_at: string;
  updated_at: string;
}

// Plot threads
export interface Thread {
  id: string;
  session_id: string;
  adventure_arc_id?: string; // FK to AdventureArc (if related to main story)
  description: string;
  status: "active" | "resolved" | "dormant";
  hidden: boolean;
  created_at: string;
  updated_at: string;
}

// Clues
export interface Clue {
  id: string;
  session_id: string;
  adventure_arc_id?: string; // FK to AdventureArc (if related to BBEG)
  description: string;
  discovered: boolean;
  importance: "minor" | "moderate" | "major";
  hidden: boolean;
  created_at: string;
  updated_at: string;
}

// Adventure Arc (main story metadata, BBEG details now in Creatures table)
export interface AdventureArc {
  id: string;
  session_id: string;
  bbeg_creature_id: string; // FK to Creature (where creature_type = "bbeg")
  high_tower_surprise: string;
  created_at: string;
  updated_at: string;
}

// Adventure log entries
export interface AdventureLogEntry {
  id: string;
  session_id: string;
  scene_number: number;
  content: string;
  timestamp: string;
  chaos_factor?: number;
  created_at: string;
  updated_at: string;
}

// Chat messages
export interface ChatMessage {
  id: string;
  session_id: string;
  type: "user" | "assistant" | "gm" | "system";
  content: string;
  timestamp: string;
  created_at: string;
}

// Main game session
export interface GameSession {
  id: string;
  user_id?: string;

  // Core game data
  character_data: Character | null;

  // Game state
  chaos_factor: number;
  scene_counter: number;

  // Adventure generation settings (consolidated)
  shadowdark_theme: string;
  shadowdark_tone: string;
  shadowdark_voice: string;

  // Metadata
  created_at: string;
  updated_at: string;
}

// View models for frontend (aggregated data)
export interface CampaignElements {
  threads: Thread[];
  npcs: NPC[];
  factions: Faction[];
  clues: Clue[];
  monsters: SessionMonster[];
}

// Adventure Arc for frontend display (consolidates data from relational tables)
export interface AdventureArcDisplay {
  id: string;
  bbeg: {
    name: string;
    description: string;
    motivation: string;
    hook: string;
  };
  clues: string[];
  highTowerSurprise: string;
  lieutenants: Array<{
    name: string;
    tarot_spread: {
      seed: string;
      background: string;
      location: string;
      why_protect: string;
      how_protect: string;
      reward: string;
    };
  }>;
  faction: {
    name: string;
    description: string;
  };
  minions: string;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  retryable?: boolean;
}

// Real-time subscription payloads
export interface DatabaseChange<T = any> {
  eventType: "INSERT" | "UPDATE" | "DELETE";
  new?: T;
  old?: T;
  table: string;
}

// Adventure generation types
export interface AdventureGenerationRequest {
  theme: string;
  tone: string;
  voice: string;
  session_id: string;
}

export interface AdventureGenerationResponse extends ApiResponse {
  bbeg_name?: string;
  bbeg_hook?: string;
  bbeg_motivation?: string;
  bbeg_detailed_description?: string;
  clues?: string[];
  high_tower_surprise?: string;
  lieutenants?: Lieutenant[];
  faction_name?: string;
  faction_description?: string;
  minions?: string;
}

// Mythic GME types
export interface MythicFateRequest {
  chaos_factor: number;
  question: string;
  session_id: string;
}

export interface MythicFateResponse extends ApiResponse {
  result?: string;
  roll?: number;
  doubles?: boolean;
  random_event?: {
    focus: string;
    meaning?: {
      action: string;
      subject: string;
    };
  };
}

export interface MythicMeaningResponse extends ApiResponse {
  action?: string;
  subject?: string;
}
