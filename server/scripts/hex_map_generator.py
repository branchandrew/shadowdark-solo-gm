#!/usr/bin/env python3
"""
Hex Map Geography Generator

Generates a 15x10 hex map with terrain types that cluster naturally.
Each hex considers neighboring terrain to increase odds of similar terrain types.
"""

import random
import json
import sys
from typing import List, Tuple, Optional, Dict

# Default terrain types (fallback if database not available)
DEFAULT_TERRAINS = (
    "plains", "forest", "dark_forest", "hills", "mountains",
    "lake", "marshlands", "quagmire", "ruins"
)

# Terrain compatibility weights - how likely terrain types are to be adjacent
# Higher values = more likely to appear next to each other
TERRAIN_COMPATIBILITY = {
    "plains": {
        "plains": 3.0, "forest": 2.5, "hills": 2.0, "lake": 1.5,
        "dark_forest": 0.8, "mountains": 1.0, "marshlands": 1.2,
        "quagmire": 0.5, "ruins": 1.8
    },
    "forest": {
        "forest": 3.0, "plains": 2.5, "dark_forest": 2.0, "hills": 2.2,
        "mountains": 1.5, "lake": 1.8, "marshlands": 1.0,
        "quagmire": 0.3, "ruins": 1.5
    },
    "dark_forest": {
        "dark_forest": 3.0, "forest": 2.0, "marshlands": 2.5, "quagmire": 2.0,
        "ruins": 2.5, "mountains": 1.5, "hills": 1.2,
        "plains": 0.8, "lake": 0.5
    },
    "hills": {
        "hills": 3.0, "mountains": 2.5, "plains": 2.0, "forest": 2.2,
        "dark_forest": 1.2, "lake": 1.0, "marshlands": 0.8,
        "quagmire": 0.3, "ruins": 2.0
    },
    "mountains": {
        "mountains": 3.0, "hills": 2.5, "forest": 1.5, "dark_forest": 1.5,
        "lake": 1.2, "plains": 1.0, "marshlands": 0.3,
        "quagmire": 0.1, "ruins": 1.8
    },
    "lake": {
        "lake": 2.5, "plains": 1.5, "forest": 1.8, "marshlands": 2.5,
        "quagmire": 1.8, "hills": 1.0, "mountains": 1.2,
        "dark_forest": 0.5, "ruins": 1.0
    },
    "marshlands": {
        "marshlands": 3.0, "quagmire": 2.8, "lake": 2.5, "dark_forest": 2.5,
        "forest": 1.0, "plains": 1.2, "hills": 0.8,
        "mountains": 0.3, "ruins": 1.5
    },
    "quagmire": {
        "quagmire": 3.0, "marshlands": 2.8, "dark_forest": 2.0, "lake": 1.8,
        "ruins": 2.0, "forest": 0.3, "plains": 0.5,
        "hills": 0.3, "mountains": 0.1
    },
    "ruins": {
        "ruins": 2.0, "dark_forest": 2.5, "quagmire": 2.0, "hills": 2.0,
        "mountains": 1.8, "plains": 1.8, "forest": 1.5,
        "marshlands": 1.5, "lake": 1.0
    }
}

class HexMapGenerator:
    def __init__(self, width: int = 15, height: int = 10, terrains: Tuple[str, ...] = None):
        self.width = width
        self.height = height
        self.terrains = terrains or DEFAULT_TERRAINS
        self.map_grid: List[List[str]] = []

        # Validate terrain compatibility matrix
        self._validate_compatibility_matrix()

    def _validate_compatibility_matrix(self):
        """Ensure all terrain types have compatibility entries"""
        for terrain in self.terrains:
            if terrain not in TERRAIN_COMPATIBILITY:
                # Create default compatibility for missing terrains
                TERRAIN_COMPATIBILITY[terrain] = {t: 1.0 for t in self.terrains}

        # Ensure all terrain types are referenced in each compatibility dict
        for terrain in self.terrains:
            for other_terrain in self.terrains:
                if other_terrain not in TERRAIN_COMPATIBILITY[terrain]:
                    TERRAIN_COMPATIBILITY[terrain][other_terrain] = 1.0

    def get_neighbors(self, row: int, col: int) -> List[str]:
        """Get terrain types of neighboring hexes (left and above)"""
        neighbors = []

        # Left neighbor
        if col > 0:
            neighbors.append(self.map_grid[row][col - 1])

        # Top neighbor
        if row > 0:
            neighbors.append(self.map_grid[row - 1][col])

        return neighbors

    def calculate_terrain_weights(self, neighbors: List[str]) -> Dict[str, float]:
        """Calculate weighted probabilities for terrain types based on neighbors"""
        if not neighbors:
            # No neighbors - equal probability for all terrains
            return {terrain: 1.0 for terrain in self.terrains}

        weights = {}
        for terrain in self.terrains:
            # Start with base weight
            weight = 1.0

            # Multiply by compatibility with each neighbor
            for neighbor in neighbors:
                compatibility = TERRAIN_COMPATIBILITY.get(neighbor, {}).get(terrain, 1.0)
                weight *= compatibility

            # Average the influence if multiple neighbors
            if len(neighbors) > 1:
                weight = weight ** (1.0 / len(neighbors))

            weights[terrain] = weight

        return weights

    def weighted_terrain_choice(self, weights: Dict[str, float]) -> str:
        """Choose a terrain type based on weighted probabilities"""
        terrain_list = list(weights.keys())
        weight_list = list(weights.values())

        # Normalize weights to sum to 1
        total_weight = sum(weight_list)
        if total_weight > 0:
            weight_list = [w / total_weight for w in weight_list]
        else:
            # Fallback to equal weights
            weight_list = [1.0 / len(terrain_list)] * len(terrain_list)

        # Manual weighted choice for better compatibility
        rand_val = random.random()
        cumulative = 0.0

        for i, weight in enumerate(weight_list):
            cumulative += weight
            if rand_val <= cumulative:
                return terrain_list[i]

        # Fallback - return last terrain
        return terrain_list[-1] if terrain_list else self.terrains[0]

    def generate_map(self, seed: Optional[int] = None) -> List[List[str]]:
        """Generate the complete hex map"""
        if seed is not None:
            random.seed(seed)

        self.map_grid = []

        for row in range(self.height):
            current_row = []

            for col in range(self.width):
                # Get neighboring terrain types
                neighbors = self.get_neighbors(row, col)

                # Calculate weights based on neighbors
                weights = self.calculate_terrain_weights(neighbors)

                # Choose terrain type
                terrain = self.weighted_terrain_choice(weights)
                current_row.append(terrain)

            self.map_grid.append(current_row)

        return self.map_grid

    def map_to_dict(self) -> Dict:
        """Convert map to dictionary format for JSON output"""
        result = {
            "width": self.width,
            "height": self.height,
            "terrains": list(self.terrains),
            "hexes": []
        }

        for row in range(self.height):
            for col in range(self.width):
                result["hexes"].append({
                    "row": row,
                    "col": col,
                    "terrain": self.map_grid[row][col],
                    "id": f"hex_{row}_{col}"
                })

        return result

    def print_map_ascii(self) -> str:
        """Generate ASCII representation of the map for debugging"""
        terrain_symbols = {
            "plains": "P", "forest": "F", "dark_forest": "D", "hills": "H",
            "mountains": "M", "lake": "L", "marshlands": "W", "quagmire": "Q", "ruins": "R"
        }

        result = []
        result.append(f"Hex Map ({self.width}x{self.height}):")
        result.append("=" * (self.width * 2 + 5))

        for row in range(self.height):
            row_str = f"{row:2d}| "
            for col in range(self.width):
                terrain = self.map_grid[row][col]
                symbol = terrain_symbols.get(terrain, "?")
                row_str += symbol + " "
            result.append(row_str)

        # Add column numbers
        col_header = "   "
        for col in range(self.width):
            col_header += f"{col % 10} "
        result.append("=" * (self.width * 2 + 5))
        result.append(col_header)

        return "\n".join(result)


def main():
    """Main function for command line usage"""
    # Parse command line arguments
    if len(sys.argv) > 1:
        command = sys.argv[1]

        if command == "generate":
            # Get optional parameters
            width = int(sys.argv[2]) if len(sys.argv) > 2 else 15
            height = int(sys.argv[3]) if len(sys.argv) > 3 else 10
            seed = int(sys.argv[4]) if len(sys.argv) > 4 else None

            # Generate map
            generator = HexMapGenerator(width, height, DEFAULT_TERRAINS)
            hex_map = generator.generate_map(seed)

            # Output JSON
            result = generator.map_to_dict()
            result["success"] = True
            print(json.dumps(result))

        elif command == "test":
            # Generate test map and show ASCII
            generator = HexMapGenerator(15, 10, DEFAULT_TERRAINS)
            hex_map = generator.generate_map(42)  # Fixed seed for testing

            print(generator.print_map_ascii())
            print("\nJSON Preview:")
            result = generator.map_to_dict()
            result["success"] = True
            print(json.dumps(result, indent=2)[:500] + "...")

        elif command == "terrains":
            # Return available terrain types
            result = {
                "success": True,
                "terrains": list(DEFAULT_TERRAINS),
                "compatibility_matrix": TERRAIN_COMPATIBILITY
            }
            print(json.dumps(result))

        else:
            # Unknown command
            result = {
                "success": False,
                "error": f"Unknown command: {command}",
                "available_commands": ["generate", "test", "terrains"]
            }
            print(json.dumps(result))

    else:
        # Default behavior - generate a standard map
        generator = HexMapGenerator()
        hex_map = generator.generate_map()
        result = generator.map_to_dict()
        result["success"] = True
        print(json.dumps(result))


if __name__ == "__main__":
    main()
