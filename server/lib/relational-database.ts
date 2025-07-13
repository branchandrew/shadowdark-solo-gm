import { createClient, SupabaseClient } from "@supabase/supabase-js";
import type {
  GameSession,
  AdventureArc,
  NPC,
  Creature,
  Faction,
  Thread,
  Clue,
  Monster,
  SessionMonster,
} from "../../shared/types";

class RelationalDatabase {
  public supabase: SupabaseClient | null = null;

  constructor() {
    this.initializeSupabase();
  }

  private initializeSupabase() {
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseKey) {
      try {
        this.supabase = createClient(supabaseUrl, supabaseKey);
        console.log("Server Supabase initialized successfully");
      } catch (error) {
        console.warn("Failed to initialize Supabase on server:", error);
      }
    } else {
      console.log(
        "Supabase credentials not found on server - database writes disabled",
      );
    }
  }

  // === ADVENTURE ARC OPERATIONS ===

  async writeAdventureArcToSession(
    sessionId: string,
    data: {
      adventure_arc: any;
      campaign_elements: any;
    },
  ): Promise<void> {
    if (!this.supabase) {
      console.log("Supabase not available - skipping adventure arc write");
      return;
    }

    try {
      const { error } = await this.supabase.from("game_sessions").upsert({
        id: sessionId,
        adventure_arc: data.adventure_arc,
        campaign_elements: data.campaign_elements,
        updated_at: new Date().toISOString(),
      });

      if (error) {
        console.error("Failed to write adventure arc to session:", error);
      } else {
        console.log("Adventure arc written to session successfully");
      }
    } catch (error) {
      console.error("Database write error for adventure arc:", error);
    }
  }

  async writeAdventureArc(
    sessionId: string,
    adventureData: {
      bbeg_name: string;
      bbeg_description: string;
      bbeg_motivation: string;
      bbeg_hook: string;
      high_tower_surprise: string;
      minion_monster_id?: string;
    },
  ): Promise<string | null> {
    if (!this.supabase) {
      console.log("Supabase not available - skipping adventure arc write");
      return null;
    }

    try {
      const adventureArcId = `arc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const { error } = await this.supabase.from("adventure_arcs").insert({
        id: adventureArcId,
        session_id: sessionId,
        ...adventureData,
      });

      if (error) {
        console.error("Failed to write adventure arc to database:", error);
        return null;
      }

      console.log("Adventure arc written to database successfully");
      return adventureArcId;
    } catch (error) {
      console.error("Database write error for adventure arc:", error);
      return null;
    }
  }

  // === NPC OPERATIONS ===

  async addNPCs(
    sessionId: string,
    npcs: Omit<NPC, "session_id">[],
  ): Promise<void> {
    if (!this.supabase || npcs.length === 0) return;

    try {
      const npcData = npcs.map((npc) => ({
        ...npc,
        session_id: sessionId,
      }));

      const { error } = await this.supabase.from("npcs").insert(npcData);

      if (error) {
        console.error("Failed to add NPCs to database:", error);
      } else {
        console.log(`Added ${npcs.length} NPCs to database`);
      }
    } catch (error) {
      console.error("Database write error for NPCs:", error);
    }
  }

  // === CREATURE OPERATIONS ===

  async addCreatures(
    sessionId: string,
    creatures: Omit<Creature, "session_id">[],
  ): Promise<void> {
    if (!this.supabase || creatures.length === 0) return;

    try {
      const creatureData = creatures.map((creature) => ({
        ...creature,
        session_id: sessionId,
      }));

      const { error } = await this.supabase
        .from("creatures")
        .insert(creatureData);

      if (error) {
        console.error("Failed to add creatures to database:", error);
      } else {
        console.log(`Added ${creatures.length} creatures to database`);
      }
    } catch (error) {
      console.error("Database write error for creatures:", error);
    }
  }

  // === FACTION OPERATIONS ===

  async addFactions(
    sessionId: string,
    factions: Omit<Faction, "session_id">[],
  ): Promise<void> {
    if (!this.supabase || factions.length === 0) return;

    try {
      const factionData = factions.map((faction) => ({
        ...faction,
        session_id: sessionId,
      }));

      const { error } = await this.supabase
        .from("factions")
        .insert(factionData);

      if (error) {
        console.error("Failed to add factions to database:", error);
      } else {
        console.log(`Added ${factions.length} factions to database`);
      }
    } catch (error) {
      console.error("Database write error for factions:", error);
    }
  }

  // === THREAD OPERATIONS ===

  async addThreads(
    sessionId: string,
    threads: Omit<Thread, "session_id">[],
  ): Promise<void> {
    if (!this.supabase || threads.length === 0) return;

    try {
      const threadData = threads.map((thread) => ({
        ...thread,
        session_id: sessionId,
      }));

      const { error } = await this.supabase.from("threads").insert(threadData);

      if (error) {
        console.error("Failed to add threads to database:", error);
      } else {
        console.log(`Added ${threads.length} threads to database`);
      }
    } catch (error) {
      console.error("Database write error for threads:", error);
    }
  }

  // === CLUE OPERATIONS ===

  async addClues(
    sessionId: string,
    clues: Omit<Clue, "session_id">[],
  ): Promise<void> {
    if (!this.supabase || clues.length === 0) return;

    try {
      const clueData = clues.map((clue) => ({
        ...clue,
        session_id: sessionId,
      }));

      const { error } = await this.supabase.from("clues").insert(clueData);

      if (error) {
        console.error("Failed to add clues to database:", error);
      } else {
        console.log(`Added ${clues.length} clues to database`);
      }
    } catch (error) {
      console.error("Database write error for clues:", error);
    }
  }

  // === MONSTER OPERATIONS ===

  async addCustomMonster(
    monster: Omit<Monster, "created_at" | "updated_at">,
  ): Promise<string | null> {
    if (!this.supabase) return null;

    try {
      const { data, error } = await this.supabase
        .from("monsters")
        .insert({
          ...monster,
          source: "custom",
        })
        .select("id")
        .single();

      if (error) {
        console.error("Failed to add custom monster:", error);
        return null;
      }

      return data.id;
    } catch (error) {
      console.error("Database write error for custom monster:", error);
      return null;
    }
  }

  async addSessionMonster(
    sessionId: string,
    monster: Omit<SessionMonster, "session_id" | "created_at" | "updated_at">,
  ): Promise<void> {
    if (!this.supabase) return;

    try {
      const { error } = await this.supabase.from("session_monsters").insert({
        ...monster,
        session_id: sessionId,
      });

      if (error) {
        console.error("Failed to add session monster:", error);
      } else {
        console.log("Session monster added to database");
      }
    } catch (error) {
      console.error("Database write error for session monster:", error);
    }
  }

  // === BATCH OPERATIONS ===

  async addHiddenCampaignElements(
    sessionId: string,
    adventureArcId: string,
    elements: {
      npcs?: Omit<NPC, "session_id">[];
      creatures?: Omit<Creature, "session_id">[];
      factions?: Omit<Faction, "session_id">[];
      threads?: Omit<Thread, "session_id">[];
      clues?: Omit<Clue, "session_id">[];
    },
  ): Promise<void> {
    if (!this.supabase) return;

    try {
      // Add adventure_arc_id to elements that are related to the main story
      const {
        npcs = [],
        creatures = [],
        factions = [],
        threads = [],
        clues = [],
      } = elements;

      // Add NPCs (with adventure_arc_id for lieutenants)
      if (npcs.length > 0) {
        await this.addNPCs(
          sessionId,
          npcs.map((npc) => ({
            ...npc,
            adventure_arc_id:
              npc.role === "lieutenant" || npc.role === "bbeg"
                ? adventureArcId
                : undefined,
          })),
        );
      }

      // Add creatures (BBEG, lieutenants, minions)
      if (creatures.length > 0) {
        await this.addCreatures(sessionId, creatures);
      }

      // Add factions (linked to adventure arc)
      if (factions.length > 0) {
        await this.addFactions(
          sessionId,
          factions.map((faction) => ({
            ...faction,
            adventure_arc_id: adventureArcId,
          })),
        );
      }

      // Add threads (linked to adventure arc if main story related)
      if (threads.length > 0) {
        await this.addThreads(
          sessionId,
          threads.map((thread) => ({
            ...thread,
            adventure_arc_id: adventureArcId,
          })),
        );
      }

      // Add clues (linked to adventure arc)
      if (clues.length > 0) {
        await this.addClues(
          sessionId,
          clues.map((clue) => ({
            ...clue,
            adventure_arc_id: adventureArcId,
          })),
        );
      }

      console.log("Hidden campaign elements added to database");
    } catch (error) {
      console.error("Database write error for campaign elements:", error);
    }
  }

  // === SESSION OPERATIONS ===

  async updateChaosFactor(
    sessionId: string,
    chaosFactor: number,
  ): Promise<void> {
    if (!this.supabase) return;

    try {
      const { error } = await this.supabase.from("game_sessions").upsert(
        {
          id: sessionId,
          chaos_factor: chaosFactor,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" },
      );

      if (error) {
        console.error("Failed to update chaos factor:", error);
      }
    } catch (error) {
      console.error("Database write error for chaos factor:", error);
    }
  }

  async updateAdventureSettings(
    sessionId: string,
    settings: {
      shadowdark_theme?: string;
      shadowdark_tone?: string;
      shadowdark_voice?: string;
    },
  ): Promise<void> {
    if (!this.supabase) return;

    try {
      const { error } = await this.supabase.from("game_sessions").upsert(
        {
          id: sessionId,
          ...settings,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" },
      );

      if (error) {
        console.error("Failed to update adventure settings:", error);
      }
    } catch (error) {
      console.error("Database write error for adventure settings:", error);
    }
  }

  // === UTILITY ===

  isAvailable(): boolean {
    return this.supabase !== null;
  }
}

// Create singleton instance
export const relationalDB = new RelationalDatabase();
