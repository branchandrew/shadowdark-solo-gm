import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import CharacterSheet from "./CharacterSheet";
import AdventureLog from "./AdventureLog";
import DiceRoller from "./DiceRoller";
import { User, BookOpen, Dices } from "lucide-react";

export default function RightPanel() {
  return (
    <Tabs defaultValue="character" className="h-full flex flex-col">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="character" className="flex items-center gap-2">
          <User className="h-4 w-4" />
          Character
        </TabsTrigger>
        <TabsTrigger value="adventure" className="flex items-center gap-2">
          <BookOpen className="h-4 w-4" />
          Adventure Log
        </TabsTrigger>
        <TabsTrigger value="dice" className="flex items-center gap-2">
          <Dices className="h-4 w-4" />
          Dice
        </TabsTrigger>
      </TabsList>

      <TabsContent value="character" className="flex-1 mt-4">
        <ScrollArea className="h-full pr-2">
          <CharacterSheet />
        </ScrollArea>
      </TabsContent>

      <TabsContent value="adventure" className="flex-1 mt-4">
        <ScrollArea className="h-full pr-2">
          <AdventureLog />
        </ScrollArea>
      </TabsContent>

      <TabsContent value="dice" className="flex-1 mt-4">
        <DiceRoller />
      </TabsContent>
    </Tabs>
  );
}
