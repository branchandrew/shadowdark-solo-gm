import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  User, 
  Briefcase, 
  Heart, 
  Eye, 
  Palette, 
  DollarSign, 
  Zap, 
  Star, 
  RefreshCw,
  Dice1
} from "lucide-react";

interface GeneratedNPC {
  race: string;
  occupation: string;
  motivation: string;
  secret: string;
  physicalAppearance: string;
  economicStatus: string;
  quirk: string;
  level: string;
}

const NPC_STEPS = [
  { key: 'race', label: 'Race', icon: User, description: 'The racial heritage of the NPC' },
  { key: 'occupation', label: 'Occupation', icon: Briefcase, description: 'What the NPC does for work' },
  { key: 'motivation', label: 'Motivation', icon: Heart, description: 'What drives the NPC' },
  { key: 'secret', label: 'Secret', icon: Eye, description: 'Hidden information about the NPC' },
  { key: 'physicalAppearance', label: 'Physical Appearance', icon: Palette, description: 'How the NPC looks' },
  { key: 'economicStatus', label: 'Economic Status', icon: DollarSign, description: 'The NPC\'s wealth level' },
  { key: 'quirk', label: 'Quirk', icon: Zap, description: 'Unique behavioral trait' },
  { key: 'level', label: 'Level', icon: Star, description: 'The NPC\'s power level' },
] as const;

export default function NPCGenerator() {
  const [npc, setNpc] = useState<GeneratedNPC | null>(null);
  const [loading, setLoading] = useState(false);
  const [generatingStep, setGeneratingStep] = useState<string | null>(null);

  const generateCompleteNPC = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/generate-npc", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        setNpc(data.npc);
      } else {
        console.error("NPC generation failed:", data.error);
      }
    } catch (error) {
      console.error("Error generating NPC:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateNPCStep = async (step: keyof GeneratedNPC) => {
    setGeneratingStep(step);
    try {
      const response = await fetch("/api/generate-npc-step", {
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
        setNpc(prev => prev ? { ...prev, [step]: data.result } : null);
      } else {
        console.error("NPC step generation failed:", data.error);
      }
    } catch (error) {
      console.error("Error generating NPC step:", error);
    } finally {
      setGeneratingStep(null);
    }
  };

  const resetNPC = () => {
    setNpc(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-6 w-6" />
            NPC Generator
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Button
              onClick={generateCompleteNPC}
              disabled={loading}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              {loading ? "Generating..." : "Generate Complete NPC"}
            </Button>
            {npc && (
              <Button
                onClick={resetNPC}
                variant="outline"
              >
                Clear NPC
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Generated NPC Display */}
      {npc && (
        <Card>
          <CardHeader>
            <CardTitle>Generated NPC</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {NPC_STEPS.map(({ key, label, icon: Icon, description }) => (
                <div key={key} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Icon className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="font-medium">{label}</div>
                      <div className="text-sm text-muted-foreground">{description}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="font-mono">
                      {npc[key as keyof GeneratedNPC]}
                    </Badge>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => generateNPCStep(key as keyof GeneratedNPC)}
                      disabled={generatingStep === key}
                    >
                      <Dice1 className={`h-4 w-4 ${generatingStep === key ? "animate-spin" : ""}`} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step-by-Step Generation */}
      <Card>
        <CardHeader>
          <CardTitle>Step-by-Step Generation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2">
            {NPC_STEPS.map(({ key, label, icon: Icon, description }) => (
              <div key={key} className="flex items-center justify-between p-3 border rounded">
                <div className="flex items-center gap-3">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="font-medium text-sm">{label}</div>
                    <div className="text-xs text-muted-foreground">{description}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {npc && (
                    <Badge variant="outline" className="text-xs">
                      {npc[key as keyof GeneratedNPC]}
                    </Badge>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      if (!npc) {
                        setNpc({
                          race: '',
                          occupation: '',
                          motivation: '',
                          secret: '',
                          physicalAppearance: '',
                          economicStatus: '',
                          quirk: '',
                          level: '',
                        });
                      }
                      generateNPCStep(key as keyof GeneratedNPC);
                    }}
                    disabled={generatingStep === key}
                  >
                    <Dice1 className={`h-3 w-3 ${generatingStep === key ? "animate-spin" : ""}`} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
