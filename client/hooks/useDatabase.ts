import { useState, useEffect, useCallback } from "react";
import { db } from "@/lib/database";

// Hook for managing database state with automatic sync
export function useDatabase<T>(key: string, defaultValue: T) {
  const [data, setData] = useState<T>(defaultValue);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load data on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const result = await db.get<T>(key);
        if (result !== null) {
          setData(result);
        }
      } catch (err) {
        console.error(`Failed to load ${key}:`, err);
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [key]);

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
  return useDatabase("campaign_elements", {
    threads: [],
    characters: [],
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
