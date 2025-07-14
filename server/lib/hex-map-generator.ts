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
    ruins: 1.8,
  },
  dark_forest: {
    dark_forest: 5.0,
    forest: 3.0,
    marshlands: 3.5,
    ruins: 3.5,
    mountains: 2.0,
    hills: 1.5,
    plains: 0.5,
    lake: 0.3,
  },
  hills: {
    hills: 5.0,
    mountains: 4.0,
    plains: 3.0,
    forest: 2.8,
    dark_forest: 1.5,
    lake: 1.2,
    marshlands: 0.5,
    ruins: 2.5,
  },
  mountains: {
    mountains: 5.0,
    hills: 4.0,
    forest: 2.0,
    dark_forest: 2.0,
    lake: 1.5,
    plains: 1.2,
    marshlands: 0.2,
    ruins: 2.2,
  },
  lake: {
    lake: 4.0,
    plains: 2.0,
    forest: 2.5,
    marshlands: 3.5,
    hills: 1.2,
    mountains: 1.5,
    dark_forest: 0.3,
    ruins: 1.2,
  },
  marshlands: {
    marshlands: 5.0,
    lake: 3.5,
    dark_forest: 3.5,
    forest: 1.2,
    plains: 1.5,
    hills: 0.5,
    mountains: 0.2,
    ruins: 2.0,
  },
  ruins: {
    ruins: 3.0,
    dark_forest: 3.5,
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

    // In a hex grid, we have 6 neighbors, but since we're generating row by row,
    // we can only consider already-generated neighbors (above and to the left)

    // Top neighbor
    if (row > 0) {
      neighbors.push(this.mapGrid[row - 1][col]);
    }

    // Top-left neighbor (offset for hex grid)
    if (row > 0 && col > 0) {
      neighbors.push(this.mapGrid[row - 1][col - 1]);
    }

    // Top-right neighbor (offset for hex grid)
    if (row > 0 && col < this.width - 1) {
      // For hex grid, odd/even rows have different offsets
      const offset = col % 2 === 0 ? 0 : 1;
      if (col + offset < this.width) {
        neighbors.push(this.mapGrid[row - 1][col + offset]);
      }
    }

    // Left neighbor - CRITICAL for ruins constraint
    if (col > 0) {
      neighbors.push(this.mapGrid[row][col - 1]);
    }

    // For clustering effect, add key neighbors multiple times
    // But only add them once for ruins constraint to work properly
    if (row > 0) {
      neighbors.push(this.mapGrid[row - 1][col]); // Add top neighbor again for clustering
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

        // Special rule: Ruins can never be adjacent to other ruins
        if (terrain === "ruins") {
          const hasRuinsNeighbor = neighbors.some(
            (neighbor) => neighbor === "ruins",
          );
          if (hasRuinsNeighbor) {
            weight = 0.0; // Completely prevent ruins next to ruins
          }
        }

        // Skip compatibility calculation if weight is already 0
        if (weight > 0) {
          // Multiply by compatibility with each neighbor
          for (const neighbor of neighbors) {
            const compatibility =
              (TERRAIN_COMPATIBILITY as any)[neighbor]?.[terrain] ?? 1.0;
            // Square the compatibility to increase clustering bias
            weight *= Math.pow(compatibility, 1.5);
          }

          // Use geometric mean but with less averaging to maintain clustering
          if (neighbors.length > 1) {
            weight = Math.pow(weight, 0.8 / neighbors.length);
          }
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

  private getAllNeighbors(
    row: number,
    col: number,
  ): Array<{ row: number; col: number }> {
    const neighbors: Array<{ row: number; col: number }> = [];

    // All 6 hexagonal neighbors
    const offsets = [
      [-1, 0], // Top
      [-1, -1], // Top-left
      [-1, 1], // Top-right
      [0, -1], // Left
      [0, 1], // Right
      [1, 0], // Bottom
      [1, -1], // Bottom-left
      [1, 1], // Bottom-right
    ];

    for (const [dr, dc] of offsets) {
      const newRow = row + dr;
      const newCol = col + dc;

      if (
        newRow >= 0 &&
        newRow < this.height &&
        newCol >= 0 &&
        newCol < this.width
      ) {
        neighbors.push({ row: newRow, col: newCol });
      }
    }

    return neighbors;
  }

  private fixIsolatedTiles(): void {
    // Remove isolated single tiles by converting them to neighbor terrain
    for (let row = 0; row < this.height; row++) {
      for (let col = 0; col < this.width; col++) {
        const currentTerrain = this.mapGrid[row][col];
        const neighbors = this.getAllNeighbors(row, col);

        // Count neighbors with same terrain
        let sameTerrainCount = 0;
        const differentTerrains: string[] = [];

        for (const neighbor of neighbors) {
          const neighborTerrain = this.mapGrid[neighbor.row][neighbor.col];
          if (neighborTerrain === currentTerrain) {
            sameTerrainCount++;
          } else {
            differentTerrains.push(neighborTerrain);
          }
        }

        // If no same-terrain neighbors, convert to most common neighbor terrain
        if (sameTerrainCount === 0 && differentTerrains.length > 0) {
          const terrainCounts: Record<string, number> = {};
          for (const terrain of differentTerrains) {
            terrainCounts[terrain] = (terrainCounts[terrain] || 0) + 1;
          }

          let mostCommon = differentTerrains[0];
          let maxCount = 0;
          for (const [terrain, count] of Object.entries(terrainCounts)) {
            if (count > maxCount) {
              maxCount = count;
              mostCommon = terrain;
            }
          }

          this.mapGrid[row][col] = mostCommon;
        }
      }
    }
  }

  private fixAdjacentRuins(): void {
    // Fix any ruins that ended up adjacent to other ruins
    for (let row = 0; row < this.height; row++) {
      for (let col = 0; col < this.width; col++) {
        if (this.mapGrid[row][col] === "ruins") {
          const neighbors = this.getAllNeighbors(row, col);

          // Check if any neighbors are also ruins
          const hasRuinsNeighbor = neighbors.some(
            (neighbor) => this.mapGrid[neighbor.row][neighbor.col] === "ruins",
          );

          if (hasRuinsNeighbor) {
            // Convert this ruins to the most common non-ruins neighbor terrain
            const nonRuinsNeighbors = neighbors
              .map((neighbor) => this.mapGrid[neighbor.row][neighbor.col])
              .filter((terrain) => terrain !== "ruins");

            if (nonRuinsNeighbors.length > 0) {
              const terrainCounts: Record<string, number> = {};
              for (const terrain of nonRuinsNeighbors) {
                terrainCounts[terrain] = (terrainCounts[terrain] || 0) + 1;
              }

              let mostCommon = nonRuinsNeighbors[0];
              let maxCount = 0;
              for (const [terrain, count] of Object.entries(terrainCounts)) {
                if (count > maxCount) {
                  maxCount = count;
                  mostCommon = terrain;
                }
              }

              this.mapGrid[row][col] = mostCommon;
            }
          }
        }
      }
    }
  }

  private findConnectedGroup(
    startRow: number,
    startCol: number,
    terrain: string,
    visited: boolean[][],
  ): Array<{ row: number; col: number }> {
    const group: Array<{ row: number; col: number }> = [];
    const stack = [{ row: startRow, col: startCol }];

    while (stack.length > 0) {
      const current = stack.pop()!;
      const { row, col } = current;

      if (visited[row][col] || this.mapGrid[row][col] !== terrain) {
        continue;
      }

      visited[row][col] = true;
      group.push(current);

      // Add unvisited same-terrain neighbors to stack
      const neighbors = this.getAllNeighbors(row, col);
      for (const neighbor of neighbors) {
        if (
          !visited[neighbor.row][neighbor.col] &&
          this.mapGrid[neighbor.row][neighbor.col] === terrain
        ) {
          stack.push(neighbor);
        }
      }
    }

    return group;
  }

  private ensureMinimumGroups(): void {
    // Find all connected groups
    const visited: boolean[][] = Array(this.height)
      .fill(null)
      .map(() => Array(this.width).fill(false));
    const groups: Array<{
      terrain: string;
      positions: Array<{ row: number; col: number }>;
    }> = [];

    for (let row = 0; row < this.height; row++) {
      for (let col = 0; col < this.width; col++) {
        if (!visited[row][col]) {
          const terrain = this.mapGrid[row][col];
          const group = this.findConnectedGroup(row, col, terrain, visited);
          if (group.length >= 3) {
            groups.push({ terrain, positions: group });
          }
        }
      }
    }

    // If we don't have at least 3 groups of 3+, create them
    if (groups.length < 3) {
      const targetTerrains = this.terrains.slice(0, 3); // Use first 3 terrain types

      for (let i = groups.length; i < 3; i++) {
        const terrain = targetTerrains[i % targetTerrains.length];

        // Find a good spot to place a 3+ group
        let placed = false;
        for (let attempts = 0; attempts < 20 && !placed; attempts++) {
          const centerRow = Math.floor(Math.random() * this.height);
          const centerCol = Math.floor(Math.random() * this.width);

          // Try to place a 3-hex group around this center
          const groupPositions = [
            { row: centerRow, col: centerCol },
            { row: centerRow, col: Math.max(0, centerCol - 1) },
            { row: Math.max(0, centerRow - 1), col: centerCol },
          ].filter((pos) => pos.row < this.height && pos.col < this.width);

          if (groupPositions.length >= 3) {
            for (const pos of groupPositions) {
              this.mapGrid[pos.row][pos.col] = terrain;
            }
            placed = true;
          }
        }
      }
    }
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

      // Post-processing for better clustering
      this.fixIsolatedTiles();
      this.fixIsolatedTiles(); // Run twice for better results
      this.ensureMinimumGroups();

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
