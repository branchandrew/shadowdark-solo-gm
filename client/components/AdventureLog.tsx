import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, BookOpen, Zap, Calendar } from "lucide-react";
import { useSessionState } from "../hooks/useSessionState";

interface Thread {
  id: string;
  description: string;
  status: "active" | "resolved" | "dormant";
}

interface Character {
  id: string;
  name: string;
  description: string;
  disposition: "friendly" | "neutral" | "hostile" | "unknown";
}

interface Scene {
  id: string;
  title: string;
  description: string;
  timestamp: Date;
  chaosFactor: number;
}

export default function AdventureLog() {
  const [chaosFactor, setChaosFactor] = useSessionState(
    "adventure_chaos_factor",
    5,
  );
  const [scenes, setScenes] = useSessionState<Scene[]>("adventure_scenes", []);

  const [newSceneTitle, setNewSceneTitle] = useSessionState(
    "adventure_new_scene_title",
    "",
  );
  const [newSceneDesc, setNewSceneDesc] = useSessionState(
    "adventure_new_scene_desc",
    "",
  );

  const addScene = () => {
    if (newSceneTitle.trim() && newSceneDesc.trim()) {
      setScenes((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          title: newSceneTitle,
          description: newSceneDesc,
          timestamp: new Date(),
          chaosFactor: chaosFactor,
        },
      ]);
      setNewSceneTitle("");
      setNewSceneDesc("");
    }
  };

  return (
    <div className="space-y-6">
      {/* Chaos Factor */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Chaos Factor
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Label>Current Chaos Factor:</Label>
            <Input
              type="number"
              min="1"
              max="9"
              value={chaosFactor}
              onChange={(e) => setChaosFactor(parseInt(e.target.value))}
              className="w-20"
            />
          </div>
        </CardContent>
      </Card>

      {/* Scenes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Adventure Scenes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {scenes.length === 0 ? (
            <div className="text-center py-8">
              <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <BookOpen className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No Scenes Yet</h3>
              <p className="text-muted-foreground mb-4">
                Start documenting your adventure by adding your first scene
                below.
              </p>
            </div>
          ) : (
            <ScrollArea className="h-96">
              <div className="space-y-4">
                {scenes.map((scene, index) => (
                  <div
                    key={scene.id}
                    className="p-4 border rounded-lg space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          Scene {index + 1}
                        </Badge>
                        <h4 className="font-medium">{scene.title}</h4>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Badge variant="outline">CF: {scene.chaosFactor}</Badge>
                        <span>
                          {scene.timestamp.toLocaleDateString()}{" "}
                          {scene.timestamp.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm leading-relaxed">
                      {scene.description}
                    </p>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}

          {/* Add New Scene */}
          <div className="border-t pt-4 space-y-3">
            <h4 className="font-medium text-sm">Add New Scene</h4>
            <div className="space-y-2">
              <Input
                placeholder="Scene title..."
                value={newSceneTitle}
                onChange={(e) => setNewSceneTitle(e.target.value)}
              />
              <Textarea
                placeholder="Describe what happens in this scene..."
                value={newSceneDesc}
                onChange={(e) => setNewSceneDesc(e.target.value)}
                rows={4}
              />
              <Button
                onClick={addScene}
                disabled={!newSceneTitle.trim() || !newSceneDesc.trim()}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Scene
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
