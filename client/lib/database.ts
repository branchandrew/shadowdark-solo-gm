import {
  createClient,
  SupabaseClient,
  RealtimeChannel,
} from "@supabase/supabase-js";
import type {
  GameSession,
  DatabaseChange,
  Character,
  AdventureArc,
  CampaignElements,
  AdventureLogEntry,
  ChatMessage,
} from "../../shared/types";

export interface DatabaseOptions {
  enableCloudSync?: boolean;
  sessionId?: string;
}

class HybridDatabase {
  private supabase: SupabaseClient | null = null;
  private isCloudEnabled = false;
  private currentSessionId: string | null = null;
  private realtimeChannel: RealtimeChannel | null = null;
  private subscribers: Map<string, Array<(data: any) => void>> = new Map();

  constructor() {
    // Initialize Supabase if environment variables are available
    this.initializeSupabase();

    // Generate or load session ID
    this.currentSessionId = this.getOrCreateSessionId();

    // Set up real-time subscriptions if cloud is available
    this.setupRealtimeSubscriptions();
  }

  private initializeSupabase() {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseKey) {
      try {
        this.supabase = createClient(supabaseUrl, supabaseKey);
        console.log("Supabase initialized successfully");
      } catch (error) {
        console.warn("Failed to initialize Supabase:", error);
      }
    } else {
      console.log(
        "Supabase credentials not found - running in localStorage-only mode",
      );
    }
  }

  private getOrCreateSessionId(): string {
    let sessionId = localStorage.getItem("shadowdark_session_id");
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem("shadowdark_session_id", sessionId);
    }
    return sessionId;
  }

  // Enable/disable cloud sync
  setCloudSync(enabled: boolean) {
    this.isCloudEnabled = enabled && this.supabase !== null;
    localStorage.setItem("shadowdark_cloud_sync", enabled.toString());

    if (this.isCloudEnabled) {
      // Sync current localStorage data to cloud
      this.syncToCloud();
    }
  }

  isCloudSyncEnabled(): boolean {
    const stored = localStorage.getItem("shadowdark_cloud_sync");
    return stored === "true" && this.supabase !== null;
  }

  // Generic get method that checks both localStorage and cloud
  async get<T>(key: string): Promise<T | null> {
    // Always try localStorage first (faster)
    const localData = localStorage.getItem(`shadowdark_${key}`);

    if (localData) {
      try {
        return JSON.parse(localData);
      } catch (error) {
        console.error(`Failed to parse localStorage data for ${key}:`, error);
      }
    }

    // If cloud sync is enabled and no local data, try cloud
    if (this.isCloudSyncEnabled() && this.supabase) {
      try {
        const { data, error } = await this.supabase
          .from("game_sessions")
          .select("*")
          .eq("id", this.currentSessionId)
          .single();

        if (error && error.code !== "PGRST116") {
          // PGRST116 = no rows returned
          console.error("Supabase fetch error:", error);
          return null;
        }

        if (data) {
          // Extract the specific field and cache locally
          const fieldValue = this.extractFieldFromSession(data, key);
          if (fieldValue !== null) {
            localStorage.setItem(
              `shadowdark_${key}`,
              JSON.stringify(fieldValue),
            );
            return fieldValue;
          }
        }
      } catch (error) {
        console.error("Cloud fetch error:", error);
      }
    }

    return null;
  }

  // Generic set method that saves to both localStorage and cloud
  async set<T>(key: string, value: T): Promise<void> {
    // Always save to localStorage
    localStorage.setItem(`shadowdark_${key}`, JSON.stringify(value));

    // If cloud sync is enabled, also save to cloud
    if (this.isCloudSyncEnabled() && this.supabase) {
      try {
        await this.saveToCloud(key, value);
      } catch (error) {
        console.error("Failed to sync to cloud:", error);
        // Continue anyway - localStorage is the primary storage
      }
    }
  }

  // Remove data
  async remove(key: string): Promise<void> {
    localStorage.removeItem(`shadowdark_${key}`);

    if (this.isCloudSyncEnabled() && this.supabase) {
      try {
        await this.saveToCloud(key, null);
      } catch (error) {
        console.error("Failed to remove from cloud:", error);
      }
    }
  }

  private extractFieldFromSession(session: GameSession, key: string): any {
    switch (key) {
      case "character":
        return session.character_data;
      case "has_character":
        return session.character_data ? "true" : null;
      case "adventure_arc":
        return session.adventure_arc;
      case "raw_adventure_data":
        return session.adventure_arc; // Assuming same data
      case "chaos_factor":
        return session.chaos_factor;
      case "theme":
        return session.theme;
      case "tone":
        return session.tone;
      case "voice":
        return session.voice;
      case "campaign_elements":
        return session.campaign_elements;
      case "adventure_log":
        return session.adventure_log;
      default:
        return null;
    }
  }

  private async saveToCloud(key: string, value: any): Promise<void> {
    if (!this.supabase || !this.currentSessionId) return;

    // Build the update object based on the key
    const updateData: Partial<GameSession> = {
      id: this.currentSessionId,
      updated_at: new Date().toISOString(),
    };

    switch (key) {
      case "character":
        updateData.character_data = value;
        break;
      case "adventure_arc":
      case "raw_adventure_data":
        updateData.adventure_arc = value;
        break;
      case "chaos_factor":
        updateData.chaos_factor = value;
        break;
      case "theme":
        updateData.theme = value;
        break;
      case "tone":
        updateData.tone = value;
        break;
      case "voice":
        updateData.voice = value;
        break;
      case "campaign_elements":
        updateData.campaign_elements = value;
        break;
      case "adventure_log":
        updateData.adventure_log = value;
        break;
    }

    // Upsert the session data
    const { error } = await this.supabase
      .from("game_sessions")
      .upsert(updateData, { onConflict: "id" });

    if (error) {
      throw error;
    }
  }

  // Sync all localStorage data to cloud
  private async syncToCloud(): Promise<void> {
    if (!this.isCloudSyncEnabled() || !this.supabase) return;

    const keys = [
      "character",
      "adventure_arc",
      "chaos_factor",
      "theme",
      "tone",
      "voice",
      "campaign_elements",
      "adventure_log",
    ];

    const sessionData: GameSession = {
      id: this.currentSessionId!,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Collect all data from localStorage
    for (const key of keys) {
      const value = await this.get(key);
      if (value !== null) {
        switch (key) {
          case "character":
            sessionData.character_data = value;
            break;
          case "adventure_arc":
            sessionData.adventure_arc = value;
            break;
          case "chaos_factor":
            sessionData.chaos_factor = value;
            break;
          case "theme":
            sessionData.theme = value;
            break;
          case "tone":
            sessionData.tone = value;
            break;
          case "voice":
            sessionData.voice = value;
            break;
          case "campaign_elements":
            sessionData.campaign_elements = value;
            break;
          case "adventure_log":
            sessionData.adventure_log = value;
            break;
        }
      }
    }

    const { error } = await this.supabase
      .from("game_sessions")
      .upsert(sessionData, { onConflict: "id" });

    if (error) {
      console.error("Failed to sync to cloud:", error);
    } else {
      console.log("Successfully synced to cloud");
    }
  }

  // Export all data for backup/sharing
  async exportAllData(): Promise<GameSession> {
    const data: GameSession = {
      id: this.currentSessionId!,
    };

    const keys = [
      "character",
      "adventure_arc",
      "chaos_factor",
      "theme",
      "tone",
      "voice",
      "campaign_elements",
      "adventure_log",
    ];

    for (const key of keys) {
      const value = await this.get(key);
      if (value !== null) {
        switch (key) {
          case "character":
            data.character_data = value;
            break;
          case "adventure_arc":
            data.adventure_arc = value;
            break;
          case "chaos_factor":
            data.chaos_factor = value;
            break;
          case "theme":
            data.theme = value;
            break;
          case "tone":
            data.tone = value;
            break;
          case "voice":
            data.voice = value;
            break;
          case "campaign_elements":
            data.campaign_elements = value;
            break;
          case "adventure_log":
            data.adventure_log = value;
            break;
        }
      }
    }

    return data;
  }

  // Import data from backup
  async importAllData(data: GameSession): Promise<void> {
    if (data.character_data) await this.set("character", data.character_data);
    if (data.adventure_arc) await this.set("adventure_arc", data.adventure_arc);
    if (data.chaos_factor) await this.set("chaos_factor", data.chaos_factor);
    if (data.theme) await this.set("theme", data.theme);
    if (data.tone) await this.set("tone", data.tone);
    if (data.voice) await this.set("voice", data.voice);
    if (data.campaign_elements)
      await this.set("campaign_elements", data.campaign_elements);
    if (data.adventure_log) await this.set("adventure_log", data.adventure_log);
  }

  // Get current session info
  getSessionInfo() {
    return {
      sessionId: this.currentSessionId,
      cloudSyncEnabled: this.isCloudSyncEnabled(),
      hasSupabase: this.supabase !== null,
    };
  }
}

// Create a singleton instance
export const db = new HybridDatabase();
