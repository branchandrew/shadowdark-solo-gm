import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, BookOpen, Zap, Calendar, Play } from "lucide-react";
import { useSessionState } from "../hooks/useSessionState";
import SceneManager from "./SceneManager";

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
    <Tabs defaultValue="scenes" className="space-y-6">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="scenes" className="flex items-center gap-2">
          <Play className="h-4 w-4" />
          Scene Loop
        </TabsTrigger>
        <TabsTrigger value="log" className="flex items-center gap-2">
          <BookOpen className="h-4 w-4" />
          Adventure Log
        </TabsTrigger>
      </TabsList>

      <TabsContent value="scenes">
        <SceneManager />
      </TabsContent>

      <TabsContent value="log">
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

          {/* Adventure Scenes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Adventure Log
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {scenes.length === 0 ? (
                <div className="text-center py-6">
                  <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
                    <BookOpen className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    No scenes logged yet. Add your first scene below.
                  </p>
                </div>
              ) : (
                <ScrollArea className="h-64">
                  <div className="space-y-3 pr-2">
                    {scenes.map((scene) => (
                      <div
                        key={scene.id}
                        className="p-3 border rounded space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">{scene.title}</h4>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">
                              CF: {scene.chaosFactor}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              <Calendar className="h-3 w-3 mr-1" />
                              {scene.timestamp.toLocaleDateString()}
                            </Badge>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {scene.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}

              <div className="space-y-2">
                <Input
                  placeholder="Scene title..."
                  value={newSceneTitle}
                  onChange={(e) => setNewSceneTitle(e.target.value)}
                />
                <Textarea
                  placeholder="Scene description..."
                  value={newSceneDesc}
                  onChange={(e) => setNewSceneDesc(e.target.value)}
                  rows={3}
                />
                <Button onClick={addScene} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Scene
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>
    </Tabs>
  );
}
