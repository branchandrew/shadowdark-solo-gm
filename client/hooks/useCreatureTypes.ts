import { useState, useEffect } from "react";

export interface CreatureTypesResponse {
  success: boolean;
  creature_types: string[];
  source: "python" | "fallback";
}

const FALLBACK_CREATURE_TYPES = [
  "Human",
  "Elf",
  "Dwarf",
  "Halfling",
  "Hobgoblin",
  "Drow",
  "Duergar",
  "Giant",
  "Devil",
  "Demon",
  "Elemental",
  "Fairy",
  "Oni",
  "Hag",
  "Dragon",
  "Orc",
  "Goblin",
  "Skeleton",
  "Zombie",
  "Ghost",
  "Spirit",
  "Wraith",
  "Vampire",
  "Werewolf",
  "Troll",
  "Ogre",
  "Golem",
  "Construct",
  "Undead",
  "Fiend",
  "Celestial",
  "Fey",
  "Beast",
  "Monstrosity",
];

let cachedCreatureTypes: string[] | null = null;

export function useCreatureTypes() {
  const [creatureTypes, setCreatureTypes] = useState<string[]>(
    FALLBACK_CREATURE_TYPES,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCreatureTypes = async () => {
      // Use cached types if available
      if (cachedCreatureTypes) {
        setCreatureTypes(cachedCreatureTypes);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/creature-types");
        const data: CreatureTypesResponse = await response.json();

        if (data.success && data.creature_types.length > 0) {
          cachedCreatureTypes = data.creature_types;
          setCreatureTypes(data.creature_types);
        } else {
          throw new Error("Invalid response from creature types API");
        }
      } catch (err) {
        console.warn("Failed to fetch creature types, using fallback:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
        setCreatureTypes(FALLBACK_CREATURE_TYPES);
        cachedCreatureTypes = FALLBACK_CREATURE_TYPES;
      } finally {
        setIsLoading(false);
      }
    };

    fetchCreatureTypes();
  }, []);

  return { creatureTypes, isLoading, error };
}

/**
 * Helper function to extract race from description using creature types
 */
export function extractRaceFromDescription(
  description: string,
  creatureTypes: string[],
): string | null {
  const lowerDescription = description.toLowerCase();

  // Look for explicit race mentions
  for (const race of creatureTypes) {
    if (lowerDescription.includes(race.toLowerCase())) {
      return race;
    }
  }

  // Look for common descriptive terms that indicate race
  if (
    lowerDescription.includes("squire") ||
    lowerDescription.includes("knight") ||
    lowerDescription.includes("soldier")
  ) {
    return "Human";
  }
  if (
    lowerDescription.includes("frost") ||
    lowerDescription.includes("ice") ||
    lowerDescription.includes("cold")
  ) {
    return "Elemental";
  }
  if (
    lowerDescription.includes("shadow") ||
    lowerDescription.includes("dark") ||
    lowerDescription.includes("soul")
  ) {
    return "Undead";
  }
  if (
    lowerDescription.includes("trader") ||
    lowerDescription.includes("merchant") ||
    lowerDescription.includes("crystal")
  ) {
    return "Human";
  }

  return null;
}
