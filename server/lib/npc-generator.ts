/**
 * NPC Generator (TypeScript)
 *
 * Generates random NPCs with various characteristics through multiple steps.
 */

// NPC race types (different from story arc races)
export const NPC_RACES: string[] = [
  // TODO: Add race values
];

export const OCCUPATIONS: string[] = [
  // TODO: Add occupation values
];

export const MOTIVATIONS: string[] = [
  // TODO: Add motivation values
];

export const SECRETS: string[] = [
  // TODO: Add secret values
];

export const PHYSICAL_APPEARANCES: string[] = [
  // TODO: Add physical appearance values
];

export const ECONOMIC_STATUSES: string[] = [
  // TODO: Add economic status values
];

export const QUIRKS: string[] = [
  // TODO: Add quirk values
];

export const LEVELS: string[] = [
  // TODO: Add level values
];

export const FIRST_NAMES: string[] = [
  // TODO: Add first name values
];

export const LAST_NAMES: string[] = [
  // TODO: Add last name values
];

export interface GeneratedNPC {
  race: string;
  occupation: string;
  motivation: string;
  secret: string;
  physicalAppearance: string;
  economicStatus: string;
  quirk: string;
  level: string;
  firstName: string;
  lastName: string;
}

export class NPCGenerator {
  private getRandomElement<T>(array: T[]): T {
    if (array.length === 0) {
      throw new Error("Cannot select from empty array");
    }
    const randomIndex = Math.floor(Math.random() * array.length);
    return array[randomIndex];
  }

  private generateRace(): string {
    if (NPC_RACES.length === 0) {
      return "Human"; // Fallback
    }
    return this.getRandomElement(NPC_RACES);
  }

  private generateOccupation(): string {
    if (OCCUPATIONS.length === 0) {
      return "Commoner"; // Fallback
    }
    return this.getRandomElement(OCCUPATIONS);
  }

  private generateMotivation(): string {
    if (MOTIVATIONS.length === 0) {
      return "Seeking Adventure"; // Fallback
    }
    return this.getRandomElement(MOTIVATIONS);
  }

  private generateSecret(): string {
    if (SECRETS.length === 0) {
      return "Harbors a Dark Secret"; // Fallback
    }
    return this.getRandomElement(SECRETS);
  }

  private generatePhysicalAppearance(): string {
    if (PHYSICAL_APPEARANCES.length === 0) {
      return "Average Looking"; // Fallback
    }
    return this.getRandomElement(PHYSICAL_APPEARANCES);
  }

  private generateEconomicStatus(): string {
    if (ECONOMIC_STATUSES.length === 0) {
      return "Middle Class"; // Fallback
    }
    return this.getRandomElement(ECONOMIC_STATUSES);
  }

  private generateQuirk(): string {
    if (QUIRKS.length === 0) {
      return "Has an Unusual Hobby"; // Fallback
    }
    return this.getRandomElement(QUIRKS);
  }

  private generateLevel(): string {
    if (LEVELS.length === 0) {
      return "Level 1"; // Fallback
    }
    return this.getRandomElement(LEVELS);
  }

  private generateFirstName(): string {
    if (FIRST_NAMES.length === 0) {
      return "John"; // Fallback
    }
    return this.getRandomElement(FIRST_NAMES);
  }

  private generateLastName(): string {
    if (LAST_NAMES.length === 0) {
      return "Smith"; // Fallback
    }
    return this.getRandomElement(LAST_NAMES);
  }

  public generateNPC(): GeneratedNPC {
    try {
      return {
        race: this.generateRace(),
        occupation: this.generateOccupation(),
        motivation: this.generateMotivation(),
        secret: this.generateSecret(),
        physicalAppearance: this.generatePhysicalAppearance(),
        economicStatus: this.generateEconomicStatus(),
        quirk: this.generateQuirk(),
        level: this.generateLevel(),
      };
    } catch (error) {
      // Fallback NPC if generation fails
      return {
        race: "Human",
        occupation: "Commoner",
        motivation: "Seeking Adventure",
        secret: "Harbors a Dark Secret",
        physicalAppearance: "Average Looking",
        economicStatus: "Middle Class",
        quirk: "Has an Unusual Hobby",
        level: "Level 1",
      };
    }
  }

  public generateStep(step: keyof GeneratedNPC): string {
    switch (step) {
      case 'race':
        return this.generateRace();
      case 'occupation':
        return this.generateOccupation();
      case 'motivation':
        return this.generateMotivation();
      case 'secret':
        return this.generateSecret();
      case 'physicalAppearance':
        return this.generatePhysicalAppearance();
      case 'economicStatus':
        return this.generateEconomicStatus();
      case 'quirk':
        return this.generateQuirk();
      case 'level':
        return this.generateLevel();
      default:
        throw new Error(`Unknown NPC generation step: ${step}`);
    }
  }
}

export function generateNPC(): GeneratedNPC {
  const generator = new NPCGenerator();
  return generator.generateNPC();
}

export function generateNPCStep(step: keyof GeneratedNPC): string {
  const generator = new NPCGenerator();
  return generator.generateStep(step);
}
