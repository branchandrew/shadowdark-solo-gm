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

    // Generate fresh session ID each time (no persistence during development)
    this.currentSessionId = this.generateSessionId();

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

  private generateSessionId(): string {
    // Generate fresh session ID each time - no persistence during development
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    console.log("Generated fresh session ID:", sessionId);
    return sessionId;
  }

  // Set up real-time subscriptions
  private setupRealtimeSubscriptions() {
    if (!this.supabase || !this.currentSessionId) return;

    this.realtimeChannel = this.supabase
      .channel(`session-${this.currentSessionId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "game_sessions",
          filter: `id=eq.${this.currentSessionId}`,
        },
        (payload) => {
          console.log("Real-time database change:", payload);
          this.handleRealtimeUpdate(payload);
        },
      )
      .subscribe();
  }

  // Handle real-time updates from database
  private handleRealtimeUpdate(payload: any) {
    const { eventType, new: newRecord, old: oldRecord } = payload;

    if (eventType === "UPDATE" && newRecord) {
      // Update localStorage with new data from database
      this.syncRealtimeToLocalStorage(newRecord);

      // Notify subscribers
      this.notifySubscribers("session", newRecord);
    }
  }

  // Sync real-time changes to localStorage
  private syncRealtimeToLocalStorage(session: GameSession) {
    if (session.character_data) {
      localStorage.setItem(
        "shadowdark_character",
        JSON.stringify(session.character_data),
      );
      localStorage.setItem("shadowdark_has_character", "true");
    }
    if (session.adventure_arc) {
      localStorage.setItem(
        "shadowdark_adventure_arc",
        JSON.stringify(session.adventure_arc),
      );
    }
    if (session.chaos_factor) {
      localStorage.setItem(
        "shadowdark_chaos_factor",
        session.chaos_factor.toString(),
      );
    }
    if (session.campaign_elements) {
      localStorage.setItem(
        "shadowdark_campaign_elements",
        JSON.stringify(session.campaign_elements),
      );
    }
    if (session.adventure_log) {
      localStorage.setItem(
        "shadowdark_adventure_log",
        JSON.stringify(session.adventure_log),
      );
    }
    if (session.theme) localStorage.setItem("shadowdark_theme", session.theme);
    if (session.tone) localStorage.setItem("shadowdark_tone", session.tone);
    if (session.voice) localStorage.setItem("shadowdark_voice", session.voice);
  }

  // Subscribe to real-time changes
  subscribe(key: string, callback: (data: any) => void) {
    if (!this.subscribers.has(key)) {
      this.subscribers.set(key, []);
    }
    this.subscribers.get(key)!.push(callback);

    // Return unsubscribe function
    return () => {
      const callbacks = this.subscribers.get(key);
      if (callbacks) {
        const index = callbacks.indexOf(callback);
        if (index > -1) {
          callbacks.splice(index, 1);
        }
      }
    };
  }

  // Notify subscribers of changes
  private notifySubscribers(key: string, data: any) {
    const callbacks = this.subscribers.get(key);
    if (callbacks) {
      callbacks.forEach((callback) => callback(data));
    }
  }

  // Enable/disable cloud sync
  setCloudSync(enabled: boolean) {
    this.isCloudEnabled = enabled && this.supabase !== null;
    localStorage.setItem("shadowdark_cloud_sync", enabled.toString());

    if (this.isCloudEnabled) {
      // Set up real-time subscriptions
      this.setupRealtimeSubscriptions();
      // Sync current localStorage data to cloud
      this.syncToCloud();
    } else {
      // Clean up subscriptions
      if (this.realtimeChannel) {
        this.realtimeChannel.unsubscribe();
        this.realtimeChannel = null;
      }
    }
  }

  isCloudSyncEnabled(): boolean {
    const stored = localStorage.getItem("shadowdark_cloud_sync");
    return stored === "true" && this.supabase !== null;
  }

  // Generic get method - reads from localStorage during current session
  async get<T>(key: string): Promise<T | null> {
    console.log(
      `Database.get(${key}): Attempting to read from localStorage...`,
    );
    try {
      // Read from localStorage (this preserves data during tab switches)
      const stored = localStorage.getItem(`shadowdark_${key}`);
      console.log(`Database.get(${key}): localStorage value =`, stored);
      if (stored) {
        const parsed = JSON.parse(stored);
        console.log(`Database.get(${key}): Parsed value =`, parsed);
        return parsed;
      }
    } catch (error) {
      console.warn(
        `Database.get(${key}): Failed to read from localStorage:`,
        error,
      );
    }

    console.log(`Database.get(${key}): No data found, returning null`);
    return null;
  }

  // Generic set method - save to localStorage only during development
  async set<T>(key: string, value: T): Promise<void> {
    // Save to localStorage for current session only
    localStorage.setItem(`shadowdark_${key}`, JSON.stringify(value));
    console.log(
      `Saved ${key} to localStorage (session-only during development)`,
    );
  }

  // Remove data - localStorage only during development
  async remove(key: string): Promise<void> {
    localStorage.removeItem(`shadowdark_${key}`);
    console.log(`Removed ${key} from localStorage`);
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
