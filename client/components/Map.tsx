import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin } from "lucide-react";

interface HexTileProps {
  x: number;
  y: number;
  terrain?: string;
}

function HexTile({ x, y, terrain = "grass" }: HexTileProps) {
  const getTerrainColor = (terrain: string) => {
    switch (terrain) {
      case "water":
        return "bg-blue-200 border-blue-300";
      case "mountain":
        return "bg-gray-300 border-gray-400";
      case "forest":
        return "bg-green-200 border-green-300";
      case "desert":
        return "bg-yellow-200 border-yellow-300";
      default:
        return "bg-green-100 border-green-200";
    }
  };

  // Calculate hex position
  const hexWidth = 80;
  const hexHeight = 70;
  const xOffset = x * (hexWidth * 0.75);
  const yOffset = y * hexHeight + (x % 2) * (hexHeight / 2);

  return (
    <div
      className={`absolute cursor-pointer transition-all duration-200 hover:scale-110 hover:z-10 ${getTerrainColor(terrain)}`}
      style={{
        left: `${xOffset}px`,
        top: `${yOffset}px`,
        width: `${hexWidth}px`,
        height: `${hexHeight}px`,
        clipPath:
          "polygon(30% 0%, 70% 0%, 100% 50%, 70% 100%, 30% 100%, 0% 50%)",
      }}
      title={`Hex ${x},${y} - ${terrain}`}
    >
      <div className="w-full h-full flex items-center justify-center">
        <span className="text-xs font-mono text-gray-600">
          {x},{y}
        </span>
      </div>
    </div>
  );
}

export default function Map() {
  // Generate random terrain for each hex
  const terrainTypes = ["grass", "forest", "water", "mountain", "desert"];
  const getRandomTerrain = () =>
    terrainTypes[Math.floor(Math.random() * terrainTypes.length)];

  // Generate hex grid (15x10 hexes)
  const hexes = [];
  for (let x = 0; x < 15; x++) {
    for (let y = 0; y < 10; y++) {
      const terrain = Math.random() > 0.7 ? getRandomTerrain() : "grass";
      hexes.push(<HexTile key={`${x}-${y}`} x={x} y={y} terrain={terrain} />);
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            World Map
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className="relative bg-blue-50 rounded-lg border overflow-auto"
            style={{ height: "600px" }}
          >
            {/* Hex Grid Container */}
            <div
              className="relative"
              style={{ width: "1200px", height: "800px" }}
            >
              {hexes}
            </div>
          </div>

          {/* Legend */}
          <div className="mt-4 flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-100 border border-green-200 rounded" />
              <span>Grassland</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-200 border border-green-300 rounded" />
              <span>Forest</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-200 border border-blue-300 rounded" />
              <span>Water</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-300 border border-gray-400 rounded" />
              <span>Mountain</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-200 border border-yellow-300 rounded" />
              <span>Desert</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
