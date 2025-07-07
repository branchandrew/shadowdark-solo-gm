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

export interface Thread {
  id: string;
  description: string;
  status: "active" | "resolved" | "dormant";
  hidden: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CampaignCharacter {
  id: string;
  name: string;
  description: string;
  disposition: "friendly" | "neutral" | "hostile" | "unknown";
  hidden: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Faction {
  id: string;
  name: string;
  description: string;
  influence: "minor" | "moderate" | "major";
  relationship: "allied" | "neutral" | "opposed" | "unknown";
  hidden: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Clue {
  id: string;
  description: string;
  discovered: boolean;
  importance: "minor" | "moderate" | "major";
  hidden: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CampaignElements {
  threads: Thread[];
  characters: CampaignCharacter[];
  factions: Faction[];
  clues: Clue[];
}

export interface Lieutenant {
  name: string;
  tarot_spread: {
    seed: string;
    background: string;
    location: string;
    why_protect: string;
    how_protect: string;
    reward: string;
  };
}

export interface AdventureArc {
  bbeg: {
    name: string;
    description: string;
    motivation: string;
    hook: string;
  };
  clues: string[];
  secrets: string[];
  highTowerSurprise: string;
  lieutenants: Lieutenant[];
  faction: {
    name: string;
    description: string;
  };
  minions: string;
}

export interface AdventureLogEntry {
  id: string;
  scene_number: number;
  content: string;
  timestamp: string;
  chaos_factor?: number;
  created_at?: string;
  updated_at?: string;
}

export interface ChatMessage {
  id: string;
  type: "user" | "assistant" | "gm" | "system";
  content: string;
  timestamp: string;
  session_id?: string;
  created_at?: string;
}

// Main database entity
export interface GameSession {
  id: string;
  user_id?: string;

  // Core game data
  character_data: Character | null;
  adventure_arc: AdventureArc | null;
  campaign_elements: CampaignElements;
  adventure_log: AdventureLogEntry[];
  chat_messages: ChatMessage[];

  // Game state
  chaos_factor: number;
  scene_counter: number;

  // Adventure generation settings
  theme: string;
  tone: string;
  voice: string;

  // Metadata
  created_at: string;
  updated_at: string;
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
