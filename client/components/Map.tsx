import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, RefreshCw } from "lucide-react";

interface HexTileProps {
  row: number;
  col: number;
  terrain: string;
}

interface HexMapData {
  success: boolean;
  width?: number;
  height?: number;
  terrains?: string[];
  hexes?: Array<{
    row: number;
    col: number;
    terrain: string;
    id: string;
  }>;
}

interface TerrainType {
  name: string;
  description: string;
  symbol: string;
}

function HexTile({ row, col, terrain }: HexTileProps) {
  const getTerrainColor = (terrain: string) => {
    switch (terrain.toLowerCase()) {
      case "plains":
        return "bg-green-100 border-green-200";
      case "forest":
        return "bg-green-300 border-green-400";
      case "dark_forest":
        return "bg-green-800 border-green-900 text-white";
      case "hills":
        return "bg-yellow-200 border-yellow-300";
      case "mountains":
        return "bg-amber-200 border-amber-300";
      case "lake":
        return "bg-blue-300 border-blue-400";
      case "marshlands":
        return "bg-green-600 border-green-700";
      case "quagmire":
        return "bg-amber-800 border-amber-900 text-white";
      case "ruins":
        return "bg-stone-400 border-stone-500";
      default:
        return "bg-green-100 border-green-200";
    }
  };

  // Calculate hex position
  const hexWidth = 80;
  const hexHeight = 70;
  const xOffset = col * (hexWidth * 0.75);
  const yOffset = row * hexHeight + (col % 2) * (hexHeight / 2);

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
      title={`Hex ${col},${row} - ${terrain.replace("_", " ")}`}
    >
      <div className="w-full h-full flex items-center justify-center">
        <span className="text-xs font-mono text-gray-600">
          {col},{row}
        </span>
      </div>
    </div>
  );
}

export default function Map() {
  const [hexMapData, setHexMapData] = useState<HexMapData | null>(null);
  const [terrainTypes, setTerrainTypes] = useState<TerrainType[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const fetchTerrainTypes = async () => {
    try {
      const response = await fetch("/api/hex-map-terrains");
      const data = await response.json();

      if (data.success && data.terrains) {
        // Convert terrain names to proper format for display
        const formattedTerrains = data.terrains.map((name: string) => ({
          name,
          description: getTerrainDescription(name),
          symbol: getTerrainSymbol(name),
        }));
        setTerrainTypes(formattedTerrains);
      }
    } catch (error) {
      console.error("Error fetching terrain types:", error);
    }
  };

  const generateHexMap = async () => {
    if (generating) return; // Prevent multiple simultaneous calls

    setGenerating(true);
    try {
      const response = await fetch("/api/generate-hex-map", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ width: 15, height: 10 }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        setHexMapData(data);
      } else {
        console.error("Hex map generation failed:", data.error);
      }
    } catch (error) {
      console.error("Error generating hex map:", error);
      // Fallback: generate a simple grid if API fails
      const fallbackData = {
        success: true,
        width: 15,
        height: 10,
        hexes: [],
      };

      const terrains = ["plains", "forest", "hills", "mountains"];
      for (let row = 0; row < 10; row++) {
        for (let col = 0; col < 15; col++) {
          fallbackData.hexes.push({
            row,
            col,
            terrain: terrains[Math.floor(Math.random() * terrains.length)],
            id: `${col}-${row}`,
          });
        }
      }
      setHexMapData(fallbackData);
    } finally {
      setGenerating(false);
    }
  };

  useEffect(() => {
    const initializeMap = async () => {
      await fetchTerrainTypes();
      await generateHexMap();
      setLoading(false);
    };

    initializeMap();
  }, []);

  const getTerrainDescription = (name: string): string => {
    const descriptions: Record<string, string> = {
      plains: "Open grasslands and fields",
      forest: "Dense woodland areas",
      dark_forest: "Corrupted or haunted forests",
      hills: "Rolling hills and elevated terrain",
      mountains: "High peaks and rocky terrain",
      lake: "Bodies of fresh water",
      marshlands: "Wet, swampy areas",
      quagmire: "Dangerous boggy terrain",
      ruins: "Ancient structures and remnants",
    };
    return descriptions[name] || "Unknown terrain";
  };

  const getTerrainSymbol = (name: string): string => {
    const symbols: Record<string, string> = {
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
    return symbols[name] || "?";
  };

  const getTerrainColor = (terrain: string) => {
    switch (terrain.toLowerCase()) {
      case "plains":
        return "bg-green-100 border-green-200";
      case "forest":
        return "bg-green-300 border-green-400";
      case "dark_forest":
        return "bg-green-800 border-green-900";
      case "hills":
        return "bg-yellow-200 border-yellow-300";
      case "mountains":
        return "bg-gray-400 border-gray-500";
      case "lake":
        return "bg-blue-300 border-blue-400";
      case "marshlands":
        return "bg-green-600 border-green-700";
      case "quagmire":
        return "bg-amber-800 border-amber-900";
      case "ruins":
        return "bg-stone-400 border-stone-500";
      default:
        return "bg-green-100 border-green-200";
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading map...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              World Map
            </CardTitle>
            <Button
              onClick={generateHexMap}
              disabled={generating}
              size="sm"
              variant="outline"
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${generating ? "animate-spin" : ""}`}
              />
              {generating ? "Generating..." : "New Map"}
            </Button>
          </div>
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
              {hexMapData?.hexes?.map((hex) => (
                <HexTile
                  key={hex.id}
                  row={hex.row}
                  col={hex.col}
                  terrain={hex.terrain}
                />
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="mt-4">
            <h4 className="font-medium mb-2">Terrain Types:</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
              {terrainTypes.map((terrain) => (
                <div key={terrain.name} className="flex items-center gap-2">
                  <div
                    className={`w-4 h-4 rounded ${getTerrainColor(terrain.name).replace("border-", "border ")}`}
                  />
                  <span className="font-mono text-xs">{terrain.symbol}</span>
                  <span className="capitalize">
                    {terrain.name.replace("_", " ")}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
