/**
 * Hex Map Geography Generator (TypeScript)
 *
 * Generates a 15x10 hex map with terrain types that cluster naturally.
 * Each hex considers neighboring terrain to increase odds of similar terrain types.
 */

// Default terrain types (fallback if database not available)
export const DEFAULT_TERRAINS = [
  "plains",
  "forest",
  "dark_forest",
  "hills",
  "mountains",
  "lake",
  "marshlands",
  "quagmire",
  "ruins",
] as const;

export type TerrainType = (typeof DEFAULT_TERRAINS)[number];

// Terrain compatibility weights - how likely terrain types are to be adjacent
// Higher values = more likely to appear next to each other
export const TERRAIN_COMPATIBILITY: Record<
  TerrainType,
  Record<TerrainType, number>
> = {
  plains: {
    plains: 5.0,
    forest: 3.0,
    hills: 2.5,
    lake: 2.0,
    dark_forest: 0.5,
    mountains: 1.0,
    marshlands: 1.5,
    quagmire: 0.3,
    ruins: 2.0,
  },
  forest: {
    forest: 5.0,
    plains: 3.0,
    dark_forest: 3.5,
    hills: 2.8,
    mountains: 2.0,
    lake: 2.2,
    marshlands: 1.5,
    quagmire: 0.2,
    ruins: 1.8,
  },
  dark_forest: {
    dark_forest: 3.0,
    forest: 2.0,
    marshlands: 2.5,
    quagmire: 2.0,
    ruins: 2.5,
    mountains: 1.5,
    hills: 1.2,
    plains: 0.8,
    lake: 0.5,
  },
  hills: {
    hills: 3.0,
    mountains: 2.5,
    plains: 2.0,
    forest: 2.2,
    dark_forest: 1.2,
    lake: 1.0,
    marshlands: 0.8,
    quagmire: 0.3,
    ruins: 2.0,
  },
  mountains: {
    mountains: 3.0,
    hills: 2.5,
    forest: 1.5,
    dark_forest: 1.5,
    lake: 1.2,
    plains: 1.0,
    marshlands: 0.3,
    quagmire: 0.1,
    ruins: 1.8,
  },
  lake: {
    lake: 2.5,
    plains: 1.5,
    forest: 1.8,
    marshlands: 2.5,
    quagmire: 1.8,
    hills: 1.0,
    mountains: 1.2,
    dark_forest: 0.5,
    ruins: 1.0,
  },
  marshlands: {
    marshlands: 3.0,
    quagmire: 2.8,
    lake: 2.5,
    dark_forest: 2.5,
    forest: 1.0,
    plains: 1.2,
    hills: 0.8,
    mountains: 0.3,
    ruins: 1.5,
  },
  quagmire: {
    quagmire: 3.0,
    marshlands: 2.8,
    dark_forest: 2.0,
    lake: 1.8,
    ruins: 2.0,
    forest: 0.3,
    plains: 0.5,
    hills: 0.3,
    mountains: 0.1,
  },
  ruins: {
    ruins: 2.0,
    dark_forest: 2.5,
    quagmire: 2.0,
    hills: 2.0,
    mountains: 1.8,
    plains: 1.8,
    forest: 1.5,
    marshlands: 1.5,
    lake: 1.0,
  },
};

export interface HexCell {
  row: number;
  col: number;
  terrain: string;
  id: string;
}

export interface HexMapResult {
  success: boolean;
  width?: number;
  height?: number;
  terrains?: string[];
  hexes?: HexCell[];
  error?: string;
}

export class HexMapGenerator {
  private width: number;
  private height: number;
  private terrains: string[];
  private mapGrid: string[][] = [];

  constructor(width: number = 15, height: number = 10, terrains?: string[]) {
    this.width = width;
    this.height = height;
    this.terrains = terrains || [...DEFAULT_TERRAINS];

    // Validate terrain compatibility matrix
    this.validateCompatibilityMatrix();
  }

  private validateCompatibilityMatrix(): void {
    // Ensure all terrain types have compatibility entries
    for (const terrain of this.terrains) {
      if (!(terrain in TERRAIN_COMPATIBILITY)) {
        // Create default compatibility for missing terrains
        (TERRAIN_COMPATIBILITY as any)[terrain] = {};
        for (const t of this.terrains) {
          (TERRAIN_COMPATIBILITY as any)[terrain][t] = 1.0;
        }
      }
    }

    // Ensure all terrain types are referenced in each compatibility dict
    for (const terrain of this.terrains) {
      for (const otherTerrain of this.terrains) {
        if (!(otherTerrain in (TERRAIN_COMPATIBILITY as any)[terrain])) {
          (TERRAIN_COMPATIBILITY as any)[terrain][otherTerrain] = 1.0;
        }
      }
    }
  }

  private getNeighbors(row: number, col: number): string[] {
    const neighbors: string[] = [];

    // Left neighbor
    if (col > 0) {
      neighbors.push(this.mapGrid[row][col - 1]);
    }

    // Top neighbor
    if (row > 0) {
      neighbors.push(this.mapGrid[row - 1][col]);
    }

    return neighbors;
  }

  private calculateTerrainWeights(neighbors: string[]): Record<string, number> {
    if (neighbors.length === 0) {
      // No neighbors - equal probability for all terrains
      const weights: Record<string, number> = {};
      for (const terrain of this.terrains) {
        weights[terrain] = 1.0;
      }
      return weights;
    }

    const weights: Record<string, number> = {};
    for (const terrain of this.terrains) {
      try {
        // Start with base weight
        let weight = 1.0;

        // Multiply by compatibility with each neighbor
        for (const neighbor of neighbors) {
          const compatibility =
            (TERRAIN_COMPATIBILITY as any)[neighbor]?.[terrain] ?? 1.0;
          weight *= compatibility;
        }

        // Average the influence if multiple neighbors
        if (neighbors.length > 1) {
          weight = Math.pow(weight, 1.0 / neighbors.length);
        }

        weights[terrain] = weight;
      } catch (error) {
        // Fallback to equal weight if error
        weights[terrain] = 1.0;
      }
    }

    return weights;
  }

  private weightedTerrainChoice(weights: Record<string, number>): string {
    const terrainList = Object.keys(weights);
    const weightList = Object.values(weights);

    // Normalize weights to sum to 1
    const totalWeight = weightList.reduce((sum, w) => sum + w, 0);
    let normalizedWeights: number[];

    if (totalWeight > 0) {
      normalizedWeights = weightList.map((w) => w / totalWeight);
    } else {
      // Fallback to equal weights
      normalizedWeights = new Array(terrainList.length).fill(
        1.0 / terrainList.length,
      );
    }

    // Manual weighted choice
    const randVal = Math.random();
    let cumulative = 0.0;

    for (let i = 0; i < normalizedWeights.length; i++) {
      cumulative += normalizedWeights[i];
      if (randVal <= cumulative) {
        return terrainList[i];
      }
    }

    // Fallback - return last terrain
    return terrainList[terrainList.length - 1] || this.terrains[0];
  }

  public generateMap(seed?: number): string[][] {
    try {
      if (seed !== undefined) {
        // Simple seed-based random number generator
        this.seedRandom(seed);
      }

      this.mapGrid = [];

      for (let row = 0; row < this.height; row++) {
        const currentRow: string[] = [];

        for (let col = 0; col < this.width; col++) {
          try {
            // Get neighboring terrain types
            const neighbors = this.getNeighbors(row, col);

            // Calculate weights based on neighbors
            const weights = this.calculateTerrainWeights(neighbors);

            // Choose terrain type
            const terrain = this.weightedTerrainChoice(weights);
            currentRow.push(terrain);
          } catch (error) {
            // Fallback to random terrain
            const terrain =
              this.terrains[Math.floor(Math.random() * this.terrains.length)];
            currentRow.push(terrain);
          }
        }

        this.mapGrid.push(currentRow);
      }

      return this.mapGrid;
    } catch (error) {
      // Generate simple fallback map
      this.mapGrid = [];
      for (let row = 0; row < this.height; row++) {
        const currentRow: string[] = [];
        for (let col = 0; col < this.width; col++) {
          const terrain =
            this.terrains[Math.floor(Math.random() * this.terrains.length)];
          currentRow.push(terrain);
        }
        this.mapGrid.push(currentRow);
      }
      return this.mapGrid;
    }
  }

  public mapToDict(): HexMapResult {
    const result: HexMapResult = {
      success: true,
      width: this.width,
      height: this.height,
      terrains: [...this.terrains],
      hexes: [],
    };

    for (let row = 0; row < this.height; row++) {
      for (let col = 0; col < this.width; col++) {
        result.hexes!.push({
          row,
          col,
          terrain: this.mapGrid[row][col],
          id: `hex_${row}_${col}`,
        });
      }
    }

    return result;
  }

  public printMapAscii(): string {
    const terrainSymbols: Record<string, string> = {
      plains: "P",
      forest: "F",
      dark_forest: "D",
      hills: "H",
      mountains: "M",
      lake: "L",
      marshlands: "W",
      quagmire: "Q",
      ruins: "R",
    };

    const result: string[] = [];
    result.push(`Hex Map (${this.width}x${this.height}):`);
    result.push("=".repeat(this.width * 2 + 5));

    for (let row = 0; row < this.height; row++) {
      let rowStr = `${row.toString().padStart(2)}| `;
      for (let col = 0; col < this.width; col++) {
        const terrain = this.mapGrid[row][col];
        const symbol = terrainSymbols[terrain] || "?";
        rowStr += symbol + " ";
      }
      result.push(rowStr);
    }

    // Add column numbers
    let colHeader = "   ";
    for (let col = 0; col < this.width; col++) {
      colHeader += `${col % 10} `;
    }
    result.push("=".repeat(this.width * 2 + 5));
    result.push(colHeader);

    return result.join("\n");
  }

  private seedRandom(seed: number): void {
    // Simple seeded random number generator
    let currentSeed = seed;
    Math.random = () => {
      currentSeed = (currentSeed * 9301 + 49297) % 233280;
      return currentSeed / 233280;
    };
  }
}

// Utility functions for API endpoints
export function generateHexMap(
  width: number = 15,
  height: number = 10,
  seed?: number,
): HexMapResult {
  try {
    const generator = new HexMapGenerator(width, height, [...DEFAULT_TERRAINS]);
    generator.generateMap(seed);
    const result = generator.mapToDict();
    return result;
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export function getTerrainTypes(): HexMapResult {
  return {
    success: true,
    terrains: [...DEFAULT_TERRAINS],
    compatibility_matrix: TERRAIN_COMPATIBILITY,
  } as any;
}

export function generateTestMap(): {
  success: boolean;
  ascii_output?: string;
  error?: string;
} {
  try {
    const generator = new HexMapGenerator(15, 10, [...DEFAULT_TERRAINS]);
    generator.generateMap(42); // Fixed seed for testing
    const ascii = generator.printMapAscii();

    return {
      success: true,
      ascii_output: ascii,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
