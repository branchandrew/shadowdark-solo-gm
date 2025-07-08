import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import CharacterSheet from "./CharacterSheet";
import AdventureLog from "./AdventureLog";
import CampaignElements from "./CampaignElements";
import BTSPanel from "./BTSPanel";
import Map from "./Map";
import { User, BookOpen, Network, Eye, MapPin } from "lucide-react";
import { useSessionState } from "../hooks/useSessionState";

export default function RightPanel() {
  const [activeTab, setActiveTab] = useSessionState(
    "right_panel_tab",
    "character",
  );

  return (
    <Tabs
      value={activeTab}
      onValueChange={setActiveTab}
      className="h-full flex flex-col"
    >
      <TabsList className="grid w-full grid-cols-5">
        <TabsTrigger value="character" className="flex items-center gap-2">
          <User className="h-4 w-4" />
          Character
        </TabsTrigger>
        <TabsTrigger value="adventure" className="flex items-center gap-2">
          <BookOpen className="h-4 w-4" />
          Adventure Log
        </TabsTrigger>
        <TabsTrigger value="elements" className="flex items-center gap-2">
          <Network className="h-4 w-4" />
          Campaign Elements
        </TabsTrigger>
        <TabsTrigger value="map" className="flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          Map
        </TabsTrigger>
        <TabsTrigger value="bts" className="flex items-center gap-2">
          <Eye className="h-4 w-4" />
          BTS
        </TabsTrigger>
      </TabsList>

      <TabsContent value="character" className="flex-1 mt-4 overflow-hidden">
        <ScrollArea className="h-[calc(100vh-12rem)] pr-2">
          <CharacterSheet />
        </ScrollArea>
      </TabsContent>

      <TabsContent value="adventure" className="flex-1 mt-4 overflow-hidden">
        <ScrollArea className="h-[calc(100vh-12rem)] pr-2">
          <AdventureLog />
        </ScrollArea>
      </TabsContent>

      <TabsContent value="elements" className="flex-1 mt-4 overflow-hidden">
        <div className="h-full pr-2">
          <CampaignElements />
        </div>
      </TabsContent>

      <TabsContent value="map" className="flex-1 mt-4 overflow-hidden">
        <ScrollArea className="h-[calc(100vh-12rem)] pr-2">
          <Map />
        </ScrollArea>
      </TabsContent>

      <TabsContent value="bts" className="flex-1 mt-4 overflow-hidden">
        <ScrollArea className="h-[calc(100vh-12rem)] pr-2">
          <BTSPanel />
        </ScrollArea>
      </TabsContent>
    </Tabs>
  );
}
