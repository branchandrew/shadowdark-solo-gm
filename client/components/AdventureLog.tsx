import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, BookOpen, Target, Users, Zap } from "lucide-react";

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
  const [chaosFactor, setChaosFactor] = useState(5);
  const [threads, setThreads] = useState<Thread[]>([
    {
      id: "1",
      description: "Investigate the missing villagers",
      status: "active",
    },
    {
      id: "2",
      description: "Find the ancient tomb entrance",
      status: "active",
    },
  ]);
  const [characters, setCharacters] = useState<Character[]>([
    {
      id: "1",
      name: "Elder Thorne",
      description: "Village elder who hired you",
      disposition: "friendly",
    },
    {
      id: "2",
      name: "Mysterious Hooded Figure",
      description: "Seen near the forest edge",
      disposition: "unknown",
    },
  ]);
  const [scenes, setScenes] = useState<Scene[]>([
    {
      id: "1",
      title: "Arrival at Shadowbrook Village",
      description:
        "You arrive at the small village as the sun sets. The streets are eerily quiet.",
      timestamp: new Date(),
      chaosFactor: 5,
    },
  ]);

  const [newThread, setNewThread] = useState("");
  const [newCharacterName, setNewCharacterName] = useState("");
  const [newCharacterDesc, setNewCharacterDesc] = useState("");
  const [newSceneTitle, setNewSceneTitle] = useState("");
  const [newSceneDesc, setNewSceneDesc] = useState("");

  const addThread = () => {
    if (newThread.trim()) {
      setThreads((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          description: newThread,
          status: "active",
        },
      ]);
      setNewThread("");
    }
  };

  const addCharacter = () => {
    if (newCharacterName.trim() && newCharacterDesc.trim()) {
      setCharacters((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          name: newCharacterName,
          description: newCharacterDesc,
          disposition: "unknown",
        },
      ]);
      setNewCharacterName("");
      setNewCharacterDesc("");
    }
  };

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-primary";
      case "resolved":
        return "bg-green-600";
      case "dormant":
        return "bg-yellow-600";
      default:
        return "bg-muted";
    }
  };

  const getDispositionColor = (disposition: string) => {
    switch (disposition) {
      case "friendly":
        return "bg-green-600";
      case "hostile":
        return "bg-red-600";
      case "neutral":
        return "bg-blue-600";
      case "unknown":
        return "bg-gray-600";
      default:
        return "bg-muted";
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
            <Badge variant="secondary" className="text-lg px-3 py-1">
              {chaosFactor}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Higher chaos = more unexpected events and scene interruptions
          </p>
        </CardContent>
      </Card>

      {/* Threads */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Plot Threads
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ScrollArea className="h-32">
            <div className="space-y-2">
              {threads.map((thread) => (
                <div
                  key={thread.id}
                  className="flex items-center gap-2 p-2 border rounded"
                >
                  <Badge className={getStatusColor(thread.status)}>
                    {thread.status}
                  </Badge>
                  <span className="flex-1 text-sm">{thread.description}</span>
                </div>
              ))}
            </div>
          </ScrollArea>
          <div className="flex gap-2">
            <Input
              placeholder="New plot thread..."
              value={newThread}
              onChange={(e) => setNewThread(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && addThread()}
            />
            <Button onClick={addThread} size="icon">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Characters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            NPCs & Characters
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ScrollArea className="h-40">
            <div className="space-y-3">
              {characters.map((character) => (
                <div
                  key={character.id}
                  className="p-3 border rounded space-y-2"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{character.name}</span>
                    <Badge
                      className={getDispositionColor(character.disposition)}
                    >
                      {character.disposition}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {character.description}
                  </p>
                </div>
              ))}
            </div>
          </ScrollArea>
          <div className="space-y-2">
            <div className="flex gap-2">
              <Input
                placeholder="Character name..."
                value={newCharacterName}
                onChange={(e) => setNewCharacterName(e.target.value)}
              />
              <Button onClick={addCharacter} size="icon">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <Input
              placeholder="Character description..."
              value={newCharacterDesc}
              onChange={(e) => setNewCharacterDesc(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && addCharacter()}
            />
          </div>
        </CardContent>
      </Card>

      {/* Scene Log */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Scene Log
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ScrollArea className="h-60">
            <div className="space-y-4">
              {scenes.map((scene) => (
                <div key={scene.id} className="p-3 border rounded space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">{scene.title}</h4>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Badge variant="outline">CF: {scene.chaosFactor}</Badge>
                      <span>{scene.timestamp.toLocaleTimeString()}</span>
                    </div>
                  </div>
                  <p className="text-sm">{scene.description}</p>
                </div>
              ))}
            </div>
          </ScrollArea>
          <div className="space-y-2">
            <div className="flex gap-2">
              <Input
                placeholder="Scene title..."
                value={newSceneTitle}
                onChange={(e) => setNewSceneTitle(e.target.value)}
              />
              <Button onClick={addScene} size="icon">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <Textarea
              placeholder="Scene description..."
              value={newSceneDesc}
              onChange={(e) => setNewSceneDesc(e.target.value)}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
