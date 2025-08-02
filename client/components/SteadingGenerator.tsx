import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Castle,
  Building,
  RefreshCw,
  Dice1,
  Home,
  MapPin,
  Users,
  Shield,
  Scroll,
  Crown
} from "lucide-react";

interface GeneratedSteading {
  category: "Civilian" | "Class-related";
  type: string;
  name: string;
  nameVariations: string[];
  disposition: string;
  [key: string]: any; // Allow for type-specific properties
}

const STEADING_TYPES = ["Hamlet", "Village", "City", "Castle", "Tower", "Abbey"];

const STEADING_ICONS: Record<string, any> = {
  Hamlet: Home,
  Village: Building,
  City: Building,
  Castle: Castle,
  Tower: Castle,
  Abbey: Crown
};

export default function SteadingGenerator() {
  const [steading, setSteading] = useState<GeneratedSteading | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedType, setSelectedType] = useState<string>("random");
  const [userValues, setUserValues] = useState<Partial<GeneratedSteading>>({});
  const [narrative, setNarrative] = useState<string>("");
  const [generatingNarrative, setGeneratingNarrative] = useState(false);

  const generateCompleteSteading = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/generate-steading", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: selectedType === "random" ? undefined : selectedType
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        // Merge generated steading with user-entered values
        const mergedSteading = { ...data.steading, ...userValues };
        setSteading(mergedSteading);
      } else {
        console.error("Steading generation failed:", data.error);
      }
    } catch (error) {
      console.error("Error generating steading:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateSteadingStep = async (step: keyof GeneratedSteading) => {
    try {
      const response = await fetch("/api/generate-steading-step", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ step }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        setSteading(prev => prev ? { ...prev, [step]: data.result } : null);
        // Remove this field from user values since it was regenerated
        setUserValues(prev => {
          const updated = { ...prev };
          delete updated[step];
          return updated;
        });
      } else {
        console.error("Steading step generation failed:", data.error);
      }
    } catch (error) {
      console.error("Error generating steading step:", error);
    }
  };

  const handleInputChange = (field: keyof GeneratedSteading, value: string) => {
    // Update the steading display
    setSteading(prev => prev ? { ...prev, [field]: value } : null);

    // Store user-entered value
    if (value.trim() === '') {
      // Remove from user values if empty
      setUserValues(prev => {
        const updated = { ...prev };
        delete updated[field];
        return updated;
      });
    } else {
      // Store user value
      setUserValues(prev => ({ ...prev, [field]: value }));
    }
  };

  const generateNarrative = async () => {
    if (!steading) return;

    setGeneratingNarrative(true);
    try {
      const response = await fetch("/api/generate-steading-narrative", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ steading }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        setNarrative(data.narrative);
      } else {
        console.error("Narrative generation failed:", data.error);
      }
    } catch (error) {
      console.error("Error generating narrative:", error);
    } finally {
      setGeneratingNarrative(false);
    }
  };

  const resetSteading = () => {
    setSteading(null);
    setUserValues({});
    setNarrative("");
  };

  const renderField = (key: string, value: any, icon: any) => {
    const Icon = icon;
    const displayValue = formatComplexValue(value);
    const isComplexObject = typeof value === 'object' && value !== null && !Array.isArray(value);

    return (
      <div key={key} className="space-y-2">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-muted-foreground" />
          <label className="text-sm font-medium capitalize">
            {key.replace(/([A-Z])/g, ' $1').trim()}
          </label>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => generateSteadingStep(key as keyof GeneratedSteading)}
            className="h-6 w-6 p-0"
            title="Regenerate this field"
          >
            <Dice1 className="h-3 w-3" />
          </Button>
        </div>
        {isComplexObject ? (
          <Textarea
            value={displayValue}
            onChange={(e) => {
              try {
                const parsed = JSON.parse(e.target.value);
                handleInputChange(key as keyof GeneratedSteading, parsed);
              } catch {
                // If not valid JSON, store as string
                handleInputChange(key as keyof GeneratedSteading, e.target.value);
              }
            }}
            className="min-h-[100px] font-mono text-xs"
            placeholder="Enter JSON data..."
          />
        ) : (
          <Input
            value={displayValue}
            onChange={(e) => handleInputChange(key as keyof GeneratedSteading, e.target.value)}
            placeholder={`Enter ${key.replace(/([A-Z])/g, ' $1').trim().toLowerCase()}...`}
          />
        )}
      </div>
    );
  };

  const formatSteadingForDisplay = (steading: GeneratedSteading) => {
    // Create a structured display of the steading data
    const basicFields = {
      name: steading.name,
      type: steading.type,
      category: steading.category,
      disposition: steading.disposition
    };

    const otherFields: Record<string, any> = {};
    Object.keys(steading).forEach(key => {
      if (!basicFields.hasOwnProperty(key) && key !== 'nameVariations') {
        otherFields[key] = steading[key];
      }
    });

    return { basicFields, otherFields };
  };

  const formatComplexValue = (value: any): string => {
    if (Array.isArray(value)) {
      return value.join(", ");
    }
    if (typeof value === 'object' && value !== null) {
      // Format objects in a more readable way
      const entries = Object.entries(value);
      if (entries.length <= 3) {
        return entries.map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`).join(" | ");
      }
      return JSON.stringify(value, null, 2);
    }
    return String(value);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Castle className="h-6 w-6" />
            Steading Generator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select steading type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="random">Random Type</SelectItem>
                {STEADING_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              onClick={generateCompleteSteading}
              disabled={loading}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              {loading ? "Generating..." : "Generate Steading"}
            </Button>
            {steading && (
              <Button
                onClick={resetSteading}
                variant="outline"
              >
                Clear Steading
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Generated Steading Details */}
      {steading && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {(() => {
                const Icon = STEADING_ICONS[steading.type] || Building;
                return <Icon className="h-5 w-5" />;
              })()}
              {steading.name}
              <Badge variant="outline" className="ml-2">
                {steading.type}
              </Badge>
              <Badge variant="secondary" className="ml-1">
                {steading.category}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {(() => {
              const { basicFields, otherFields } = formatSteadingForDisplay(steading);

              return (
                <>
                  {/* Basic Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {renderField('name', basicFields.name, MapPin)}
                    {renderField('type', basicFields.type, Building)}
                    {renderField('category', basicFields.category, Crown)}
                    {renderField('disposition', basicFields.disposition, Users)}
                  </div>

                  {/* Other Fields */}
                  {Object.keys(otherFields).length > 0 && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Shield className="h-5 w-5" />
                        Additional Details
                      </h3>
                      <div className="grid grid-cols-1 gap-4">
                        {Object.entries(otherFields).map(([key, value]) =>
                          renderField(key, value, Scroll)
                        )}
                      </div>
                    </div>
                  )}
                </>
              );
            })()}
          </CardContent>
        </Card>
      )}

      {/* Narrative Generation Section */}
      {steading && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Scroll className="h-5 w-5" />
              Steading Narrative
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={generateNarrative}
              disabled={generatingNarrative}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${generatingNarrative ? "animate-spin" : ""}`} />
              {generatingNarrative ? "Generating Narrative..." : "Generate Story"}
            </Button>

            {narrative && (
              <div className="space-y-2">
                <h3 className="font-medium">Generated Narrative</h3>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-800 dark:text-gray-200">
                    {narrative}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
