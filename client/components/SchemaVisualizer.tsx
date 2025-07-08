import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Database,
  Table,
  Key,
  Link,
  FileType,
  Globe,
  Users,
} from "lucide-react";

// Import all our types for reflection
import type {
  GameSession,
  AdventureArc,
  Creature,
  Faction,
  Thread,
  Clue,
  AdventureLogEntry,
  ChatMessage,
  Character,
  AdventureArcDisplay,
  CampaignElements,
} from "../../shared/types";

interface FieldInfo {
  name: string;
  type: string;
  required: boolean;
  isPrimaryKey?: boolean;
  isForeignKey?: boolean;
  referencesTable?: string;
  description?: string;
}

interface TableInfo {
  name: string;
  description: string;
  scope: "global" | "session" | "frontend";
  icon: React.ReactNode;
  fields: FieldInfo[];
  relationships: string[];
}

const schemaDefinition: TableInfo[] = [
  {
    name: "creature_templates",
    description:
      "Global templates for Shadowdark creatures, shared across all sessions",
    scope: "global",
    icon: <Globe className="h-4 w-4" />,
    fields: [
      { name: "id", type: "string", required: true, isPrimaryKey: true },
      { name: "name", type: "string", required: true },
      { name: "race_species", type: "string", required: false },
      { name: "description", type: "string", required: false },
      { name: "armor_class", type: "number", required: false },
      {
        name: "hit_points",
        type: "string",
        required: false,
        description: "e.g., '2d6+2'",
      },
      { name: "speed", type: "string", required: false },
      { name: "abilities", type: "Stats", required: false },
      { name: "attacks", type: "string[]", required: false },
      { name: "special_abilities", type: "string[]", required: false },
      { name: "challenge_rating", type: "number", required: false },
      { name: "source", type: "'shadowdark_core' | 'custom'", required: true },
      { name: "created_at", type: "string", required: true },
      { name: "updated_at", type: "string", required: true },
    ],
    relationships: ["creatures"],
  },
  {
    name: "game_sessions",
    description: "Main game session container",
    scope: "session",
    icon: <Users className="h-4 w-4" />,
    fields: [
      { name: "id", type: "string", required: true, isPrimaryKey: true },
      { name: "user_id", type: "string", required: false },
      { name: "character_data", type: "Character", required: false },
      { name: "chaos_factor", type: "number", required: true },
      { name: "scene_counter", type: "number", required: true },
      { name: "shadowdark_theme", type: "string", required: true },
      { name: "shadowdark_tone", type: "string", required: true },
      { name: "shadowdark_voice", type: "string", required: true },
      {
        name: "high_tower_surprise",
        type: "string",
        required: false,
        description: "Major plot twist for final confrontation",
      },
      { name: "created_at", type: "string", required: true },
      { name: "updated_at", type: "string", required: true },
    ],
    relationships: [
      "creatures",
      "factions",
      "threads",
      "clues",
      "adventure_log",
      "chat_messages",
    ],
  },
  {
    name: "creatures",
    description:
      "Unified table for all lifeforms: BBEG, Lieutenants, Monsters, NPCs",
    scope: "session",
    icon: <Table className="h-4 w-4" />,
    fields: [
      { name: "id", type: "string", required: true, isPrimaryKey: true },
      {
        name: "session_id",
        type: "string",
        required: true,
        isForeignKey: true,
        referencesTable: "game_sessions",
      },
      { name: "name", type: "string", required: true },
      {
        name: "race_species",
        type: "string",
        required: false,
        description: "e.g., Human, Orc, Skeleton",
      },
      { name: "description", type: "string", required: false },
      { name: "armor_class", type: "number", required: true },
      {
        name: "hit_points",
        type: "string",
        required: false,
        description: "e.g., '2d6+2'",
      },
      { name: "current_hit_points", type: "number", required: false },
      { name: "speed", type: "string", required: true },
      {
        name: "abilities",
        type: "Stats",
        required: false,
        description: "STR, DEX, CON, INT, WIS, CHA",
      },
      { name: "attacks", type: "string[]", required: true },
      { name: "special_abilities", type: "string[]", required: true },
      { name: "challenge_rating", type: "number", required: false },
      {
        name: "creature_type",
        type: "'bbeg' | 'lieutenant' | 'monster' | 'npc'",
        required: true,
      },
      {
        name: "status",
        type: "'alive' | 'dead' | 'fled' | 'unknown'",
        required: true,
      },
      { name: "hidden", type: "boolean", required: true },

      // BBEG-specific fields
      {
        name: "bbeg_motivation",
        type: "string",
        required: false,
        description: "Only for BBEG creatures",
      },
      {
        name: "bbeg_hook",
        type: "string",
        required: false,
        description: "Only for BBEG creatures",
      },
      {
        name: "bbeg_minion_creature_id",
        type: "string",
        required: false,
        isForeignKey: true,
        referencesTable: "creatures",
        description: "FK to minion creature",
      },

      // Lieutenant-specific fields
      {
        name: "lieutenant_seed",
        type: "string",
        required: false,
        description: "Tarot result",
      },
      {
        name: "lieutenant_occupation",
        type: "string",
        required: false,
        description: "Tarot result",
      },
      {
        name: "lieutenant_background",
        type: "string",
        required: false,
        description: "Tarot result",
      },
      {
        name: "lieutenant_why_protect",
        type: "string",
        required: false,
        description: "Tarot result",
      },
      {
        name: "lieutenant_how_protect",
        type: "string",
        required: false,
        description: "Tarot result",
      },
      {
        name: "lieutenant_reward",
        type: "string",
        required: false,
        description: "Tarot result",
      },

      // Monster-specific fields
      { name: "is_minion_of_bbeg", type: "boolean", required: false },
      { name: "source", type: "'shadowdark_core' | 'custom'", required: false },

      // NPC-specific fields
      {
        name: "npc_disposition",
        type: "'friendly' | 'neutral' | 'hostile' | 'unknown'",
        required: false,
      },
      {
        name: "npc_role",
        type: "'ally' | 'neutral' | 'enemy' | 'merchant' | 'guard' | 'villager' | 'other'",
        required: false,
      },

      // Common optional fields
      {
        name: "faction_id",
        type: "string",
        required: false,
        isForeignKey: true,
        referencesTable: "factions",
      },
      { name: "notes", type: "string", required: false },
      { name: "created_at", type: "string", required: true },
      { name: "updated_at", type: "string", required: true },
    ],
    relationships: ["factions"],
  },
  {
    name: "factions",
    description: "Organizations and groups that influence the story",
    scope: "session",
    icon: <Table className="h-4 w-4" />,
    fields: [
      { name: "id", type: "string", required: true, isPrimaryKey: true },
      {
        name: "session_id",
        type: "string",
        required: true,
        isForeignKey: true,
        referencesTable: "game_sessions",
      },
      { name: "name", type: "string", required: true },
      { name: "description", type: "string", required: false },
      {
        name: "influence",
        type: "'minor' | 'moderate' | 'major'",
        required: true,
      },
      {
        name: "relationship",
        type: "'allied' | 'neutral' | 'opposed' | 'unknown'",
        required: true,
      },
      { name: "hidden", type: "boolean", required: true },
      { name: "created_at", type: "string", required: true },
      { name: "updated_at", type: "string", required: true },
    ],
    relationships: ["creatures"],
  },
  {
    name: "threads",
    description: "Plot threads and story elements",
    scope: "session",
    icon: <Table className="h-4 w-4" />,
    fields: [
      { name: "id", type: "string", required: true, isPrimaryKey: true },
      {
        name: "session_id",
        type: "string",
        required: true,
        isForeignKey: true,
        referencesTable: "game_sessions",
      },
      {
        name: "adventure_arc_id",
        type: "string",
        required: false,
        isForeignKey: true,
        referencesTable: "adventure_arcs",
      },
      { name: "description", type: "string", required: true },
      {
        name: "status",
        type: "'active' | 'resolved' | 'dormant'",
        required: true,
      },
      { name: "hidden", type: "boolean", required: true },
      { name: "created_at", type: "string", required: true },
      { name: "updated_at", type: "string", required: true },
    ],
    relationships: [],
  },
  {
    name: "clues",
    description: "Investigation clues and discoveries",
    scope: "session",
    icon: <Table className="h-4 w-4" />,
    fields: [
      { name: "id", type: "string", required: true, isPrimaryKey: true },
      {
        name: "session_id",
        type: "string",
        required: true,
        isForeignKey: true,
        referencesTable: "game_sessions",
      },
      {
        name: "adventure_arc_id",
        type: "string",
        required: false,
        isForeignKey: true,
        referencesTable: "adventure_arcs",
      },
      { name: "description", type: "string", required: true },
      { name: "discovered", type: "boolean", required: true },
      {
        name: "importance",
        type: "'minor' | 'moderate' | 'major'",
        required: true,
      },
      { name: "hidden", type: "boolean", required: true },
      { name: "created_at", type: "string", required: true },
      { name: "updated_at", type: "string", required: true },
    ],
    relationships: [],
  },
  {
    name: "session_monsters",
    description: "Monster instances in a specific session",
    scope: "session",
    icon: <Table className="h-4 w-4" />,
    fields: [
      { name: "id", type: "string", required: true, isPrimaryKey: true },
      {
        name: "session_id",
        type: "string",
        required: true,
        isForeignKey: true,
        referencesTable: "game_sessions",
      },
      {
        name: "monster_id",
        type: "string",
        required: true,
        isForeignKey: true,
        referencesTable: "monsters",
      },
      {
        name: "name",
        type: "string",
        required: false,
        description: "Can override monster name",
      },
      { name: "current_hit_points", type: "number", required: false },
      {
        name: "status",
        type: "'alive' | 'dead' | 'fled' | 'unknown'",
        required: true,
      },
      { name: "notes", type: "string", required: false },
      { name: "hidden", type: "boolean", required: true },
      { name: "created_at", type: "string", required: true },
      { name: "updated_at", type: "string", required: true },
    ],
    relationships: [],
  },
  {
    name: "adventure_log",
    description: "Scene-by-scene adventure journal",
    scope: "session",
    icon: <Table className="h-4 w-4" />,
    fields: [
      { name: "id", type: "string", required: true, isPrimaryKey: true },
      {
        name: "session_id",
        type: "string",
        required: true,
        isForeignKey: true,
        referencesTable: "game_sessions",
      },
      { name: "scene_number", type: "number", required: false },
      { name: "content", type: "string", required: true },
      { name: "timestamp", type: "string", required: true },
      { name: "chaos_factor", type: "number", required: false },
      { name: "created_at", type: "string", required: true },
      { name: "updated_at", type: "string", required: true },
    ],
    relationships: [],
  },
  {
    name: "chat_messages",
    description: "AI chat conversation history",
    scope: "session",
    icon: <Table className="h-4 w-4" />,
    fields: [
      { name: "id", type: "string", required: true, isPrimaryKey: true },
      {
        name: "session_id",
        type: "string",
        required: true,
        isForeignKey: true,
        referencesTable: "game_sessions",
      },
      {
        name: "type",
        type: "'user' | 'assistant' | 'gm' | 'system'",
        required: true,
      },
      { name: "content", type: "string", required: true },
      { name: "timestamp", type: "string", required: true },
      { name: "created_at", type: "string", required: true },
    ],
    relationships: [],
  },
];

const frontendTypes: TableInfo[] = [
  {
    name: "AdventureArcDisplay",
    description: "Frontend view model for adventure arc data",
    scope: "frontend",
    icon: <FileType className="h-4 w-4" />,
    fields: [
      { name: "id", type: "string", required: true },
      { name: "bbeg", type: "BBEGInfo", required: true },
      { name: "clues", type: "string[]", required: true },
      { name: "highTowerSurprise", type: "string", required: true },
      { name: "lieutenants", type: "Lieutenant[]", required: true },
      { name: "faction", type: "FactionInfo", required: true },
      { name: "minions", type: "string", required: true },
    ],
    relationships: [],
  },
  {
    name: "CampaignElements",
    description: "Aggregated campaign data for frontend",
    scope: "frontend",
    icon: <FileType className="h-4 w-4" />,
    fields: [
      { name: "threads", type: "Thread[]", required: true },
      { name: "npcs", type: "NPC[]", required: true },
      { name: "factions", type: "Faction[]", required: true },
      { name: "clues", type: "Clue[]", required: true },
      { name: "monsters", type: "SessionMonster[]", required: true },
    ],
    relationships: [],
  },
];

function getScopeColor(scope: string) {
  switch (scope) {
    case "global":
      return "bg-blue-600";
    case "session":
      return "bg-green-600";
    case "frontend":
      return "bg-purple-600";
    default:
      return "bg-gray-600";
  }
}

function FieldDisplay({ field }: { field: FieldInfo }) {
  return (
    <div className="flex items-center justify-between p-2 border rounded text-sm">
      <div className="flex items-center gap-2">
        {field.isPrimaryKey && (
          <Key className="h-3 w-3 text-yellow-600" title="Primary Key" />
        )}
        {field.isForeignKey && (
          <Link
            className="h-3 w-3 text-blue-600"
            title={`Foreign Key → ${field.referencesTable}`}
          />
        )}
        <span className={`font-mono ${field.required ? "font-semibold" : ""}`}>
          {field.name}
        </span>
        {!field.required && <span className="text-gray-500">?</span>}
      </div>
      <div className="flex items-center gap-2">
        <code className="text-xs bg-muted px-1 rounded">{field.type}</code>
      </div>
    </div>
  );
}

function TableCard({ table }: { table: TableInfo }) {
  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            {table.icon}
            {table.name}
          </CardTitle>
          <Badge className={getScopeColor(table.scope)}>{table.scope}</Badge>
        </div>
        <p className="text-sm text-muted-foreground">{table.description}</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {table.fields.map((field) => (
            <FieldDisplay key={field.name} field={field} />
          ))}
        </div>
        {table.relationships.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-semibold mb-2">Related Tables:</h4>
            <div className="flex flex-wrap gap-1">
              {table.relationships.map((rel) => (
                <Badge key={rel} variant="outline" className="text-xs">
                  {rel}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function SchemaVisualizer() {
  const globalTables = schemaDefinition.filter((t) => t.scope === "global");
  const sessionTables = schemaDefinition.filter((t) => t.scope === "session");

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Database Schema & Types
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Live reflection of the current database schema and TypeScript types.
            This always shows the actual structure defined in shared/types.ts
            and supabase-schema.sql.
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Badge className="bg-blue-600">Global</Badge>
              <span>Shared across all sessions</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-green-600">Session</Badge>
              <span>Specific to each game session</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-purple-600">Frontend</Badge>
              <span>View models for UI components</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Global Tables */}
      {globalTables.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Global Tables
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {globalTables.map((table) => (
              <TableCard key={table.name} table={table} />
            ))}
          </div>
        </div>
      )}

      <Separator />

      {/* Session Tables */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Users className="h-5 w-5" />
          Session Tables
        </h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {sessionTables.map((table) => (
            <TableCard key={table.name} table={table} />
          ))}
        </div>
      </div>

      <Separator />

      {/* Frontend Types */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <FileType className="h-5 w-5" />
          Frontend Types
        </h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {frontendTypes.map((table) => (
            <TableCard key={table.name} table={table} />
          ))}
        </div>
      </div>

      {/* Legend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Legend</CardTitle>
        </CardHeader>
        <CardContent className="text-xs space-y-2">
          <div className="flex items-center gap-2">
            <Key className="h-3 w-3 text-yellow-600" />
            <span>Primary Key</span>
          </div>
          <div className="flex items-center gap-2">
            <Link className="h-3 w-3 text-blue-600" />
            <span>Foreign Key (hover for reference table)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-500">?</span>
            <span>Optional field</span>
          </div>
          <div className="flex items-center gap-2">
            <code className="text-xs bg-muted px-1 rounded">type</code>
            <span>Field type definition</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
