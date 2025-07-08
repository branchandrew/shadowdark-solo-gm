import { useState, useEffect, useCallback } from "react";
import { db } from "@/lib/database";

// Hook for managing database state with automatic sync and real-time updates
export function useDatabase<T>(key: string, defaultValue: T) {
  const [data, setData] = useState<T>(defaultValue);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // During development: start with empty state, no auto-loading
  useEffect(() => {
    console.log(
      `useDatabase(${key}): Starting with empty state (development mode)`,
    );
    setIsLoading(false); // No loading needed, starting fresh
    setError(null);

    // Subscribe to real-time changes (for future cloud sync)
    const unsubscribe = db.subscribe("session", (session: any) => {
      // Extract the relevant data for this key from the session update
      const extractedData = extractFieldFromSession(session, key);
      if (extractedData !== null) {
        setData(extractedData);
      }
    });

    return unsubscribe;
  }, [key]);

  // Helper function to extract field from session (similar to database service)
  const extractFieldFromSession = (session: any, key: string) => {
    switch (key) {
      case "character":
        return session.character_data;
      case "has_character":
        return session.character_data ? "true" : "false";
      case "adventure_arc":
        return session.adventure_arc;
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
  };

  // Update data and save to database
  const updateData = useCallback(
    async (newData: T | ((prev: T) => T)) => {
      try {
        setError(null);
        const updatedData =
          typeof newData === "function"
            ? (newData as (prev: T) => T)(data)
            : newData;

        setData(updatedData);
        await db.set(key, updatedData);
      } catch (err) {
        console.error(`Failed to save ${key}:`, err);
        setError(err instanceof Error ? err.message : "Save failed");
        // Revert local state on error
        const result = await db.get<T>(key);
        if (result !== null) {
          setData(result);
        }
      }
    },
    [key, data],
  );

  // Remove data
  const removeData = useCallback(async () => {
    try {
      setError(null);
      await db.remove(key);
      setData(defaultValue);
    } catch (err) {
      console.error(`Failed to remove ${key}:`, err);
      setError(err instanceof Error ? err.message : "Remove failed");
    }
  }, [key, defaultValue]);

  return {
    data,
    updateData,
    removeData,
    isLoading,
    error,
  };
}

// Hook for cloud sync management
export function useCloudSync() {
  const [isEnabled, setIsEnabled] = useState(false);
  const [sessionInfo, setSessionInfo] = useState(db.getSessionInfo());

  useEffect(() => {
    setIsEnabled(db.isCloudSyncEnabled());
    setSessionInfo(db.getSessionInfo());
  }, []);

  const toggleCloudSync = useCallback(async (enabled: boolean) => {
    try {
      db.setCloudSync(enabled);
      setIsEnabled(enabled);
      setSessionInfo(db.getSessionInfo());
    } catch (error) {
      console.error("Failed to toggle cloud sync:", error);
    }
  }, []);

  const exportData = useCallback(async () => {
    try {
      return await db.exportAllData();
    } catch (error) {
      console.error("Failed to export data:", error);
      throw error;
    }
  }, []);

  const importData = useCallback(async (data: any) => {
    try {
      await db.importAllData(data);
    } catch (error) {
      console.error("Failed to import data:", error);
      throw error;
    }
  }, []);

  return {
    isEnabled,
    sessionInfo,
    toggleCloudSync,
    exportData,
    importData,
  };
}

// Convenience hooks for specific data types
export function useCharacter() {
  return useDatabase("character", null);
}

export function useCharacterFlag() {
  return useDatabase("has_character", "false");
}

export function useAdventureArc() {
  return useDatabase("adventure_arc", null);
}

export function useChaosFactor() {
  return useDatabase("chaos_factor", 5);
}

export function useCampaignElements() {
  return useDatabase("shadowdark_campaign_elements", {
    threads: [],
    creatures: [],
    factions: [],
    clues: [],
  });
}

export function useAdventureLog() {
  return useDatabase("adventure_log", []);
}

export function useAdventureStyle() {
  const theme = useDatabase("theme", "Dark Fantasy");
  const tone = useDatabase("tone", "Mysterious");
  const voice = useDatabase("voice", "Atmospheric");

  return { theme, tone, voice };
}
