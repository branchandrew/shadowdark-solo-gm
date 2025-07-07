import { createClient, SupabaseClient } from "@supabase/supabase-js";
import type {
  GameSession,
  AdventureArc,
  Thread,
  CampaignCharacter,
  Faction,
  Clue,
} from "../../shared/types";

class ServerDatabase {
  private supabase: SupabaseClient | null = null;

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

  // Write adventure arc to database
  async writeAdventureArc(
    sessionId: string,
    adventureArc: AdventureArc,
  ): Promise<void> {
    if (!this.supabase) {
      console.log("Supabase not available - skipping database write");
      return;
    }

    try {
      const { error } = await this.supabase.from("game_sessions").upsert(
        {
          id: sessionId,
          adventure_arc: adventureArc,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" },
      );

      if (error) {
        console.error("Failed to write adventure arc to database:", error);
      } else {
        console.log("Adventure arc written to database successfully");
      }
    } catch (error) {
      console.error("Database write error:", error);
    }
  }

  // Add hidden campaign elements from adventure generation
  async addHiddenCampaignElements(
    sessionId: string,
    elements: {
      threads?: Thread[];
      characters?: CampaignCharacter[];
      factions?: Faction[];
      clues?: Clue[];
    },
  ): Promise<void> {
    if (!this.supabase) {
      console.log("Supabase not available - skipping hidden elements write");
      return;
    }

    try {
      // Get current campaign elements
      const { data: session, error: fetchError } = await this.supabase
        .from("game_sessions")
        .select("campaign_elements")
        .eq("id", sessionId)
        .single();

      if (fetchError && fetchError.code !== "PGRST116") {
        console.error("Failed to fetch current campaign elements:", fetchError);
        return;
      }

      const currentElements = session?.campaign_elements || {
        threads: [],
        characters: [],
        factions: [],
        clues: [],
      };

      // Add new hidden elements
      if (elements.threads) {
        currentElements.threads.push(...elements.threads);
      }
      if (elements.characters) {
        currentElements.characters.push(...elements.characters);
      }
      if (elements.factions) {
        currentElements.factions.push(...elements.factions);
      }
      if (elements.clues) {
        currentElements.clues.push(...elements.clues);
      }

      // Update database
      const { error } = await this.supabase.from("game_sessions").upsert(
        {
          id: sessionId,
          campaign_elements: currentElements,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" },
      );

      if (error) {
        console.error("Failed to write hidden campaign elements:", error);
      } else {
        console.log("Hidden campaign elements added to database");
      }
    } catch (error) {
      console.error("Database write error for campaign elements:", error);
    }
  }

  // Update chaos factor
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

  // Add chat message
  async addChatMessage(
    sessionId: string,
    message: { type: string; content: string; timestamp: string },
  ): Promise<void> {
    if (!this.supabase) return;

    try {
      // Get current chat messages
      const { data: session, error: fetchError } = await this.supabase
        .from("game_sessions")
        .select("chat_messages")
        .eq("id", sessionId)
        .single();

      const currentMessages = session?.chat_messages || [];

      const newMessage = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        session_id: sessionId,
        created_at: new Date().toISOString(),
        ...message,
      };

      currentMessages.push(newMessage);

      const { error } = await this.supabase.from("game_sessions").upsert(
        {
          id: sessionId,
          chat_messages: currentMessages,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" },
      );

      if (error) {
        console.error("Failed to add chat message:", error);
      }
    } catch (error) {
      console.error("Database write error for chat message:", error);
    }
  }

  // Check if database is available
  isAvailable(): boolean {
    return this.supabase !== null;
  }
}

// Create singleton instance
export const serverDB = new ServerDatabase();
