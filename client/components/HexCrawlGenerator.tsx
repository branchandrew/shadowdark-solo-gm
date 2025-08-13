import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { RefreshCw, Copy, Settings, ZoomIn, ZoomOut, Download } from "lucide-react";
import html2canvas from 'html2canvas';

interface HexCell {
  row: number;
  col: number;
  terrain: string;
  id: string;
}

interface HexMapData {
  success: boolean;
  width: number;
  height: number;
  terrains: string[];
  hexes: HexCell[];
  seed?: number;
}

// Terrain type images for visual display
const TERRAIN_IMAGES: Record<string, string> = {
  plains: 'https://cdn.builder.io/api/v1/image/assets%2Fc15718245902463f92daca7d09c24b29%2F47b8abc1e32f415d82500dd70c2109f0?format=webp&width=800',
  forest: 'https://cdn.builder.io/api/v1/image/assets%2Fc15718245902463f92daca7d09c24b29%2F9c7159f39c594122b4dc7ca653baf498?format=webp&width=800',
  dark_forest: 'https://cdn.builder.io/api/v1/image/assets%2Fc15718245902463f92daca7d09c24b29%2Fae9331413c3740aa9a4dc4e72aed8ae9?format=webp&width=800',
  hills: 'https://cdn.builder.io/api/v1/image/assets%2Fc15718245902463f92daca7d09c24b29%2Fc4f39be5c88a4adb9ccfa292471c25cf?format=webp&width=800',
  mountains: 'https://cdn.builder.io/api/v1/image/assets%2Fc15718245902463f92daca7d09c24b29%2Fde47ba9e83854495908e643ffb5878c1?format=webp&width=800',
  lake: 'https://cdn.builder.io/api/v1/image/assets%2Fc15718245902463f92daca7d09c24b29%2Fd58f151159cf40ccbf399ec4860664a4?format=webp&width=800',
  marshlands: 'https://cdn.builder.io/api/v1/image/assets%2Fc15718245902463f92daca7d09c24b29%2Fff291b68c895421eade5c6303133490b?format=webp&width=800',
  ruins: 'https://cdn.builder.io/api/v1/image/assets%2Fc15718245902463f92daca7d09c24b29%2Fca1d2bca8f9841d3bb87f88f6ecc5fcf?format=webp&width=800',
};

// Terrain color overlays
const TERRAIN_OVERLAYS: Record<string, string> = {
  plains: 'rgba(255, 255, 0, 0.3)',     // Yellow for fields
  forest: 'rgba(0, 128, 0, 0.3)',       // Green for forest
  dark_forest: 'rgba(0, 50, 0, 0.6)',   // Much darker green for dark forest
  hills: 'rgba(255, 0, 0, 0.3)',        // Red for hills
  mountains: 'rgba(119, 136, 153, 0.3)', // Bluish gray for mountains
  lake: 'rgba(0, 100, 255, 0.3)',       // Blue for lakes
  marshlands: 'rgba(139, 69, 19, 0.3)',  // Brown for swamp
  ruins: 'rgba(255, 255, 255, 0.4)',    // White for ruins
};

export default function HexCrawlGenerator() {
  const { toast } = useToast();
  const [hexMapData, setHexMapData] = useState<HexMapData | null>(null);
  const [loading, setLoading] = useState(false);
  const [width, setWidth] = useState(15);
  const [height, setHeight] = useState(10);
  const [seed, setSeed] = useState<string>('');
  const [zoom, setZoom] = useState(1);
  const [exporting, setExporting] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);

  const generateHexMap = async () => {
    setLoading(true);
    
    try {
      const response = await fetch('/api/generate-hex-map', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          width,
          height,
          seed: seed ? parseInt(seed) : undefined,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setHexMapData(data);
        toast({
          title: "Hex Map Generated!",
          description: `Generated a ${data.width}x${data.height} hex map with ${data.hexes.length} hexes.`,
        });
      } else {
        throw new Error(data.error || 'Failed to generate hex map');
      }
    } catch (error) {
      console.error('Error generating hex map:', error);
      toast({
        title: "Generation Error",
        description: "Failed to generate hex map. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied!",
        description: "Hex map data copied to clipboard.",
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy to clipboard.",
        variant: "destructive",
      });
    }
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.25, 3)); // Max zoom 3x
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.25, 0.5)); // Min zoom 0.5x
  };

  const exportAsImage = async (format: 'png' | 'jpg') => {
    if (!mapRef.current || !hexMapData) return;

    setExporting(true);
    try {
      // Temporarily reset zoom for consistent export
      const originalZoom = zoom;
      setZoom(1);

      // Wait for DOM to update
      await new Promise(resolve => setTimeout(resolve, 100));

      const canvas = await html2canvas(mapRef.current, {
        backgroundColor: '#ffffff',
        scale: 2, // Higher resolution
        useCORS: true,
        allowTaint: false,
        logging: false,
        removeContainer: true,
      });

      // Convert to black and white programmatically
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        // Convert to grayscale and high contrast
        for (let i = 0; i < data.length; i += 4) {
          // Calculate luminance (grayscale value)
          const gray = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);

          // Apply high contrast - convert to pure black or white
          const bw = gray > 128 ? 255 : 0;

          data[i] = bw;     // Red
          data[i + 1] = bw; // Green
          data[i + 2] = bw; // Blue
          // Alpha channel (data[i + 3]) remains unchanged
        }

        ctx.putImageData(imageData, 0, 0);
      }

      // Restore original zoom
      setZoom(originalZoom);

      const link = document.createElement('a');
      link.download = `hex-map-bw-${hexMapData.width}x${hexMapData.height}.${format}`;
      link.href = canvas.toDataURL(`image/${format === 'jpg' ? 'jpeg' : 'png'}`);
      link.click();

      toast({
        title: "Export Successful!",
        description: `Black & white hex map exported as ${format.toUpperCase()}.`,
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export Failed",
        description: "Failed to export hex map. Please try again.",
        variant: "destructive",
      });
    } finally {
      setExporting(false);
    }
  };


  const formatHexMapForCopy = () => {
    if (!hexMapData) return '';

    let result = `Hex Map (${hexMapData.width}x${hexMapData.height})${hexMapData.seed ? ` - Seed: ${hexMapData.seed}` : ''}\\n`;
    result += '='.repeat(hexMapData.width * 2 + 10) + '\\n\\n';

    // Group hexes by row for easier reading
    const rows: HexCell[][] = [];
    for (let r = 0; r < hexMapData.height; r++) {
      rows[r] = hexMapData.hexes.filter(hex => hex.row === r);
    }

    rows.forEach((row, rowIndex) => {
      result += `Row ${rowIndex + 1}: `;
      result += row.map(hex => `[${hex.col + 1}:${hex.terrain}]`).join(' ');
      result += '\\n';
    });

    return result;
  };

  const renderHexGrid = () => {
    if (!hexMapData) return null;

    // Create a grid representation
    const rows: HexCell[][] = [];
    for (let r = 0; r < hexMapData.height; r++) {
      rows[r] = hexMapData.hexes.filter(hex => hex.row === r).sort((a, b) => a.col - b.col);
    }

    return (
      <div
        className="hex-grid-container"
        style={{
          fontFamily: 'monospace',
          transform: `scale(${zoom})`,
          transformOrigin: 'top left'
        }}
      >
        {rows.map((row, rowIndex) => (
          <div 
            key={rowIndex} 
            className="hex-row"
            style={{
              display: 'flex',
              gap: '0px', // No gap between hexes
              marginBottom: '-18px', // Increased overlap to eliminate padding between rows
              paddingLeft: rowIndex % 2 === 1 ? '32px' : '0px', // Offset odd rows for hex pattern
            }}
          >
            {row.map((hex) => (
              <div
                key={hex.id}
                className="hex-cell"
                style={{
                  width: '64px',
                  height: '72px',
                  marginLeft: hex.col > 0 ? '-2px' : '0px', // Remove 2px padding between hexes
                  backgroundImage: `url(${TERRAIN_IMAGES[hex.terrain] || ''})`,
                  backgroundSize: 'contain',
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'center',
                  backgroundColor: '#CCC', // Fallback color
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  color: 'white',
                  position: 'relative',
                  clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)', // Vertically oriented hexagon
                  textShadow: '1px 1px 2px black', // Make text visible on image background
                }}
                title={`${hex.row + 1},${hex.col + 1}: ${hex.terrain}`}
              >
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    backgroundColor: TERRAIN_OVERLAYS[hex.terrain] || 'transparent',
                    mixBlendMode: 'multiply',
                    clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
                  }}
                />
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 space-y-6">
        {/* Controls */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Map Settings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-1">Width</label>
                <Input
                  type="number"
                  value={width}
                  onChange={(e) => setWidth(parseInt(e.target.value) || 15)}
                  min={5}
                  max={30}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Height</label>
                <Input
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(parseInt(e.target.value) || 10)}
                  min={5}
                  max={20}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Seed (optional)</label>
                <Input
                  type="text"
                  value={seed}
                  onChange={(e) => setSeed(e.target.value)}
                  placeholder="Random"
                  className="w-full"
                />
              </div>
              <div className="flex items-end">
                <Button
                  onClick={generateHexMap}
                  disabled={loading}
                  className="w-full"
                  style={{
                    backgroundColor: 'var(--secondary-color)',
                    borderRadius: '20px 17px 22px 15px',
                    fontFamily: 'MedievalSharp, cursive',
                  }}
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    'Generate Hex Map'
                  )}
                </Button>
              </div>
            </div>
            
            {hexMapData && (
              <div className="text-sm text-gray-600">
                Generated {hexMapData.width}×{hexMapData.height} map with {hexMapData.terrains.length} terrain types
                {hexMapData.seed && ` (Seed: ${hexMapData.seed})`}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Hex Map Display */}
        {hexMapData && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Hex Map</span>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 mr-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleZoomOut}
                      disabled={zoom <= 0.5}
                      className="text-gray-500 hover:text-primary"
                      title="Zoom Out"
                    >
                      <ZoomOut className="w-4 h-4" />
                    </Button>
                    <span className="text-sm text-gray-600 min-w-[3rem] text-center">
                      {Math.round(zoom * 100)}%
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleZoomIn}
                      disabled={zoom >= 3}
                      className="text-gray-500 hover:text-primary"
                      title="Zoom In"
                    >
                      <ZoomIn className="w-4 h-4" />
                    </Button>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => exportAsImage('jpg')}
                    disabled={exporting}
                    className="text-gray-500 hover:text-primary"
                    title="Export as Black & White JPG"
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(formatHexMapForCopy())}
                    className="text-gray-500 hover:text-primary"
                    title="Copy to Clipboard"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-auto border rounded-lg p-4 bg-gray-50" style={{ maxWidth: '100%', maxHeight: '768px' }}>
                <div ref={mapRef} style={{ minWidth: 'fit-content', padding: '20px 0' }}>
                  {renderHexGrid()}
                </div>
              </div>
              
              {/* Legend */}
              <div className="mt-4">
                <h4 className="font-semibold mb-2">Terrain Legend:</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                  {hexMapData.terrains.map((terrain) => (
                    <div key={terrain} className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 border border-gray-400 bg-gray-200 relative"
                        style={{
                          backgroundImage: `url(${TERRAIN_IMAGES[terrain] || ''})`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center'
                        }}
                      >
                        <div
                          style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            backgroundColor: TERRAIN_OVERLAYS[terrain] || 'transparent',
                            mixBlendMode: 'multiply',
                          }}
                        />
                      </div>
                      <span className="capitalize">{terrain.replace('_', ' ')}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}


      </div>
    </div>
  );
}
