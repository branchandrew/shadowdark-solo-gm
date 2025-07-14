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
  const getTerrainImage = (terrain: string) => {
    switch (terrain.toLowerCase()) {
      case "plains":
        return "https://cdn.builder.io/api/v1/image/assets%2Fc15718245902463f92daca7d09c24b29%2F8331c1a0a00349b0a919d14a0ad18244?format=webp&width=800";
      case "forest":
        return "https://cdn.builder.io/api/v1/image/assets%2Fc15718245902463f92daca7d09c24b29%2Fcce3aa333e7046f49e09c7385e04e7c3?format=webp&width=800";
      case "dark_forest":
        return "https://cdn.builder.io/api/v1/image/assets%2Fc15718245902463f92daca7d09c24b29%2Facc77c8d8fd5477b8b56b046488c8851?format=webp&width=800";
      case "hills":
        return "https://cdn.builder.io/api/v1/image/assets%2Fc15718245902463f92daca7d09c24b29%2F8331c1a0a00349b0a919d14a0ad18244?format=webp&width=800"; // Using plains for hills
      case "mountains":
        return "https://cdn.builder.io/api/v1/image/assets%2Fc15718245902463f92daca7d09c24b29%2Fc80e68478dee4827ac1f4fd63cbc4130?format=webp&width=800";
      case "lake":
        return "https://cdn.builder.io/api/v1/image/assets%2Fc15718245902463f92daca7d09c24b29%2Fe81b6e84886a4e2399fcb77392b0c2d1?format=webp&width=800";
      case "marshlands":
        return "https://cdn.builder.io/api/v1/image/assets%2Fc15718245902463f92daca7d09c24b29%2Fcdb00a0f668448968ef40ac08a9ee7aa?format=webp&width=800";
      case "ruins":
        return "https://cdn.builder.io/api/v1/image/assets%2Fc15718245902463f92daca7d09c24b29%2F3a3f0a1f0cc44e69894c7233efa1aa33?format=webp&width=800";
      default:
        return "https://cdn.builder.io/api/v1/image/assets%2Fc15718245902463f92daca7d09c24b29%2F8331c1a0a00349b0a919d14a0ad18244?format=webp&width=800"; // Default to plains
    }
  };

  // Calculate hex position - maintaining good hex tile size
  const hexWidth = 93; // Good size for visibility
  const hexHeight = 107; // Maintains 155:179 ratio
  const xOffset = col * (hexWidth * 0.75) + (row % 2) * (hexWidth * 0.375); // Offset every other row horizontally
  const yOffset = row * (hexHeight * 0.6); // Closer vertical spacing to eliminate row gaps

  return (
    <div
      className="absolute cursor-pointer transition-all duration-200 hover:scale-105 hover:z-10"
      style={{
        left: `${xOffset}px`,
        top: `${yOffset}px`,
        width: `${hexWidth}px`,
        height: `${hexHeight}px`,
        clipPath:
          "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)",
        backgroundImage: `url(${getTerrainImage(terrain)})`,
        backgroundSize: "75%", // Smaller image to fit better within hex and reduce cropping
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
      title={`${terrain.replace("_", " ").toUpperCase()} (${col},${row})`}
    ></div>
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
        return "bg-amber-200 border-amber-300";
      case "lake":
        return "bg-blue-300 border-blue-400";
      case "marshlands":
        return "bg-green-600 border-green-700";
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
    <div className="space-y-4 w-full">
      <Card className="w-full">
        <CardContent className="p-4">
          {/* Title */}
          <div className="mb-3">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              World Map
            </h2>
          </div>

          {/* Button Row */}
          <div className="mb-4">
            <Button
              onClick={generateHexMap}
              disabled={generating}
              size="sm"
              variant="outline"
              className="flex items-center gap-2"
            >
              <RefreshCw
                className={`h-4 w-4 ${generating ? "animate-spin" : ""}`}
              />
              {generating ? "Generating..." : "Regenerate Map"}
            </Button>
          </div>

          <div
            className="w-full overflow-auto bg-gray-800 rounded-lg border"
            style={{ height: "600px" }}
          >
            {/* Hex Grid Container */}
            <div
              className="relative"
              style={{
                width: `${(hexMapData?.width || 15) * 70 + 100}px`,
                height: `${(hexMapData?.height || 10) * 80 + 100}px`,
                minWidth: "100%",
              }}
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
