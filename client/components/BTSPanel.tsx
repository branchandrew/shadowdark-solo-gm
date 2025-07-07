import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Eye, Crown, Skull, Users, RefreshCw } from "lucide-react";

interface AdventureArc {
  bbeg: {
    name: string;
    description: string;
    motivation: string;
    hook: string;
  };
  clues: string[];
  secrets: string[];
  highTowerSurprise: string;
  lieutenants: Array<{
    name: string;
    tarot_spread: {
      seed: string;
      background: string;
      location: string;
      why_protect: string;
      how_protect: string;
      reward: string;
    };
  }>;
  faction: {
    name: string;
    description: string;
  };
  minions: string;
}

export default function BTSPanel() {
  const [adventureArc, setAdventureArc] = useState<AdventureArc | null>(null);
  const [rawAdventureData, setRawAdventureData] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [theme, setTheme] = useState("");
  const [tone, setTone] = useState("");
  const [voice, setVoice] = useState("");

  // Load persisted data on component mount
  useEffect(() => {
    const savedAdventureArc = localStorage.getItem("shadowdark_adventure_arc");
    const savedRawData = localStorage.getItem("shadowdark_raw_adventure_data");
    const savedTheme = localStorage.getItem("shadowdark_theme");
    const savedTone = localStorage.getItem("shadowdark_tone");
    const savedVoice = localStorage.getItem("shadowdark_voice");

    if (savedAdventureArc) {
      try {
        setAdventureArc(JSON.parse(savedAdventureArc));
      } catch (error) {
        console.error("Failed to parse saved adventure arc:", error);
      }
    }

    if (savedRawData) {
      try {
        setRawAdventureData(JSON.parse(savedRawData));
      } catch (error) {
        console.error("Failed to parse saved raw adventure data:", error);
      }
    }

    if (savedTheme) setTheme(savedTheme);
    if (savedTone) setTone(savedTone);
    if (savedVoice) setVoice(savedVoice);
  }, []);

  // Save data to localStorage whenever it changes
  const saveToLocalStorage = (adventureData: AdventureArc, rawData: any) => {
    localStorage.setItem(
      "shadowdark_adventure_arc",
      JSON.stringify(adventureData),
    );
    localStorage.setItem(
      "shadowdark_raw_adventure_data",
      JSON.stringify(rawData),
    );
  };

  // Save theme/tone/voice to localStorage
  const saveStyleToLocalStorage = (
    newTheme: string,
    newTone: string,
    newVoice: string,
  ) => {
    localStorage.setItem("shadowdark_theme", newTheme);
    localStorage.setItem("shadowdark_tone", newTone);
    localStorage.setItem("shadowdark_voice", newVoice);
  };

  const regenerateAdventure = async () => {
    console.log("Starting regenerate adventure...");
    setIsGenerating(true);

    try {
      console.log("Making fetch request to /api/generate-adventure...");
      const response = await fetch("/api/generate-adventure", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          theme: theme.trim() || "Dark Fantasy",
          tone: tone.trim() || "Mysterious",
          voice: voice.trim() || "Atmospheric",
        }),
      });

      console.log("Response status:", response.status);
      console.log("Response ok:", response.ok);

      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (parseError) {
          console.error("Failed to parse error response:", parseError);
          // Use the HTTP status as the error message if we can't parse JSON
          errorMessage = `Server error (${response.status}): ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log("Received data:", data);

      if (data.success) {
        console.log("Adventure generation succeeded! BBEG:", data.bbeg_name);

        // Store the raw JSON response
        setRawAdventureData(data);

        // Use the new response structure
        const newAdventure: AdventureArc = {
          bbeg: {
            name: data.bbeg_name,
            description: data.bbeg_detailed_description,
            motivation: data.bbeg_motivation,
            hook: data.bbeg_hook,
          },
          clues: data.clues || [],
          secrets: [],
          highTowerSurprise: data.high_tower_surprise || "",
          lieutenants: data.lieutenants || [],
          faction: {
            name: data.faction_name || "",
            description: data.faction_description || "",
          },
          minions: data.minions || "",
        };

        console.log("Setting new adventure arc...");
        setAdventureArc(newAdventure);

        // Save to localStorage
        saveToLocalStorage(newAdventure, data);
        saveStyleToLocalStorage(
          theme.trim() || "Dark Fantasy",
          tone.trim() || "Mysterious",
          voice.trim() || "Atmospheric",
        );

        // Combine all the BBEG information for display
        const fullProfile = `${data.bbeg_detailed_description}\n\nMotivation: ${data.bbeg_motivation}\n\nAdventure Hook: ${data.bbeg_hook}`;

        // Send the villain profile to the AI chat
        console.log("Sending villain profile to AI chat...");
        await sendVillainToChat(`**${data.bbeg_name}**\n\n${fullProfile}`);

        console.log("Adventure generation complete!");
      } else {
        console.error("Adventure generation failed:", data.error);

        // Show user-friendly error message
        alert(
          `Adventure generation failed: ${data.error || "Unknown error occurred"}`,
        );
      }
    } catch (error) {
      console.error("Error generating adventure:", error);

      // Show user-friendly error message
      let errorMessage = "Unknown error occurred";

      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === "string") {
        errorMessage = error;
      } else {
        console.error("Unexpected error type:", typeof error, error);
      }

      alert(`Error generating adventure: ${errorMessage}`);
    } finally {
      console.log("Setting isGenerating to false");
      setIsGenerating(false);
    }
  };

  const sendVillainToChat = async (villainProfile: string) => {
    try {
      console.log("Making request to add villain to chat...");

      // We'll create a custom message that gets added directly to the chat
      // by dispatching a custom event that the AIChat component can listen for
      const event = new CustomEvent("addChatMessage", {
        detail: {
          type: "gm",
          content: `🎭 **New Adventure Arc Generated!**\n\n${villainProfile}`,
          timestamp: new Date(),
        },
      });

      window.dispatchEvent(event);
      console.log("Dispatched chat message event");
    } catch (error) {
      console.error("Error sending villain to chat:", error);
    }
  };

  const sendCompleteAdventureToChat = () => {
    if (!rawAdventureData || !adventureArc) {
      console.error("No adventure data to send");
      return;
    }

    try {
      // Format the complete adventure data for chat
      const formattedContent = `🎭 **Complete Adventure Arc Details**

**${adventureArc.bbeg.name}**
${adventureArc.bbeg.hook}

**Motivation:** ${adventureArc.bbeg.motivation}

**Description:** ${adventureArc.bbeg.description}

**Clues:**
${adventureArc.clues.map((clue, index) => `${index + 1}. ${clue}`).join("\n")}

**High Tower Surprise:** ${adventureArc.highTowerSurprise}

**Lieutenants:**
${adventureArc.lieutenants
  .map(
    (lt, index) => `
**${lt.name}**
- Background: ${lt.tarot_spread.background}
- Nature: ${lt.tarot_spread.seed}
- Occupation: ${lt.tarot_spread.location}
- Why Protect: ${lt.tarot_spread.why_protect}
- How Protect: ${lt.tarot_spread.how_protect}
- Reward: ${lt.tarot_spread.reward}`,
  )
  .join("\n")}

**Faction:** ${adventureArc.faction.name}
${adventureArc.faction.description}

**Minions:** ${adventureArc.minions}`;

      const event = new CustomEvent("addChatMessage", {
        detail: {
          type: "gm",
          content: formattedContent,
          timestamp: new Date(),
        },
      });

      window.dispatchEvent(event);
      console.log("Dispatched complete adventure data to chat");
    } catch (error) {
      console.error("Error sending complete adventure to chat:", error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Adventure Generation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-primary" />
            Adventure Arc Generator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Theme, Tone, Voice Fields */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="theme">Theme</Label>
              <Input
                id="theme"
                placeholder="e.g., Gothic Horror, High Fantasy"
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tone">Tone</Label>
              <Input
                id="tone"
                placeholder="e.g., Dark, Gritty, Heroic"
                value={tone}
                onChange={(e) => setTone(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="voice">Voice</Label>
              <Input
                id="voice"
                placeholder="e.g., Mysterious, Direct, Poetic"
                value={voice}
                onChange={(e) => setVoice(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={regenerateAdventure}
              disabled={isGenerating}
              variant="outline"
              className="flex-1"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                  Regenerating...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Regenerate Adventure Arc
                </>
              )}
            </Button>
            {adventureArc && (
              <Button
                onClick={sendCompleteAdventureToChat}
                variant="outline"
                size="sm"
              >
                Send to Chat
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Adventure Arc Display */}
      {adventureArc ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Skull className="h-5 w-5 text-destructive" />
              Current Adventure Arc
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* BBEG */}
            <div className="space-y-3">
              <h4 className="font-semibold flex items-center gap-2">
                <Crown className="h-4 w-4" />
                Big Bad Evil Guy (BBEG)
              </h4>
              <div className="p-4 border rounded space-y-4">
                <div>
                  <span className="font-medium text-sm">Name:</span>
                  <h5 className="font-medium text-primary text-lg mt-1">
                    {adventureArc.bbeg.name}
                  </h5>
                </div>

                <div>
                  <span className="font-medium text-sm">Hook:</span>
                  <p className="text-sm text-muted-foreground mt-1">
                    {adventureArc.bbeg.hook}
                  </p>
                </div>

                <div>
                  <span className="font-medium text-sm">Motivation:</span>
                  <p className="text-sm text-muted-foreground mt-1">
                    {adventureArc.bbeg.motivation}
                  </p>
                </div>

                <div>
                  <span className="font-medium text-sm">
                    Detailed Description:
                  </span>
                  <ScrollArea className="h-32 w-full mt-1">
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap pr-2">
                      {adventureArc.bbeg.description}
                    </p>
                  </ScrollArea>
                </div>
              </div>
            </div>

            <Separator />

            {/* Clues */}
            <div className="space-y-3">
              <h4 className="font-semibold flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Clues about the BBEG
              </h4>
              <div className="space-y-2">
                {adventureArc.clues.map((clue, index) => (
                  <div key={index} className="p-3 border rounded space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">Clue {index + 1}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{clue}</p>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* High Tower Surprise */}
            <div className="space-y-3">
              <h4 className="font-semibold">High Tower Surprise</h4>
              <div className="p-3 border rounded bg-accent/10">
                <p className="text-sm whitespace-pre-wrap">
                  {adventureArc.highTowerSurprise}
                </p>
              </div>
            </div>

            <Separator />

            {/* Lieutenants */}
            {adventureArc.lieutenants.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-semibold flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Lieutenants
                </h4>
                <div className="space-y-4">
                  {adventureArc.lieutenants.map((lieutenant, index) => (
                    <div key={index} className="p-4 border rounded space-y-3">
                      <h5 className="font-medium text-primary text-lg">
                        {lieutenant.name}
                      </h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Badge variant="outline" className="text-xs">
                            Seed
                          </Badge>
                          <p className="text-sm text-muted-foreground">
                            {lieutenant.tarot_spread.seed}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <Badge variant="outline" className="text-xs">
                            Background
                          </Badge>
                          <p className="text-sm text-muted-foreground">
                            {lieutenant.tarot_spread.background}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <Badge variant="outline" className="text-xs">
                            Occupation
                          </Badge>
                          <p className="text-sm text-muted-foreground">
                            {lieutenant.tarot_spread.location}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <Badge variant="outline" className="text-xs">
                            Why Protect
                          </Badge>
                          <p className="text-sm text-muted-foreground">
                            {lieutenant.tarot_spread.why_protect}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <Badge variant="outline" className="text-xs">
                            How Protect
                          </Badge>
                          <p className="text-sm text-muted-foreground">
                            {lieutenant.tarot_spread.how_protect}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <Badge variant="outline" className="text-xs">
                            Reward
                          </Badge>
                          <p className="text-sm text-muted-foreground">
                            {lieutenant.tarot_spread.reward}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Separator />

            {/* Faction */}
            {adventureArc.faction?.name && (
              <div className="space-y-3">
                <h4 className="font-semibold">Aligned Faction</h4>
                <div className="p-3 border rounded space-y-2">
                  <h5 className="font-medium text-primary">
                    {adventureArc.faction.name}
                  </h5>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {adventureArc.faction.description}
                  </p>
                </div>
              </div>
            )}

            <Separator />

            {/* Minions */}
            {adventureArc.minions && (
              <div className="space-y-3">
                <h4 className="font-semibold">Minions</h4>
                <div className="p-3 border rounded">
                  <p className="text-sm whitespace-pre-wrap">
                    {adventureArc.minions}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-muted-foreground" />
              Adventure Arc
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <Skull className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">
                No Adventure Generated
              </h3>
              <p className="text-muted-foreground mb-4">
                Click "Regenerate Adventure Arc" to generate a new BBEG, plot
                threads, and adventure details using AI and tarot cards.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
