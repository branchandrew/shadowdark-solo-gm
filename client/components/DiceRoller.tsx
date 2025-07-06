import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dice1,
  Dice2,
  Dice3,
  Dice4,
  Dice5,
  Dice6,
  RotateCcw,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface DiceRoll {
  id: string;
  type: string;
  result: number;
  timestamp: Date;
}

const diceIcons = {
  1: Dice1,
  2: Dice2,
  3: Dice3,
  4: Dice4,
  5: Dice5,
  6: Dice6,
};

export default function DiceRoller() {
  const [rolling, setRolling] = useState(false);
  const [currentRoll, setCurrentRoll] = useState<number | null>(null);
  const [rollHistory, setRollHistory] = useState<DiceRoll[]>([]);

  const rollDice = (sides: number, label: string) => {
    if (rolling) return;

    setRolling(true);
    setCurrentRoll(null);

    // Simulate rolling animation
    let animationFrames = 0;
    const maxFrames = 20;

    const animate = () => {
      if (animationFrames < maxFrames) {
        setCurrentRoll(Math.floor(Math.random() * sides) + 1);
        animationFrames++;
        setTimeout(animate, 50);
      } else {
        const finalResult = Math.floor(Math.random() * sides) + 1;
        setCurrentRoll(finalResult);
        setRolling(false);

        // Add to history
        const newRoll: DiceRoll = {
          id: Date.now().toString(),
          type: label,
          result: finalResult,
          timestamp: new Date(),
        };
        setRollHistory((prev) => [newRoll, ...prev.slice(0, 9)]); // Keep last 10 rolls
      }
    };

    animate();
  };

  const getDiceIcon = (value: number) => {
    if (value >= 1 && value <= 6) {
      const Icon = diceIcons[value as keyof typeof diceIcons];
      return <Icon className="h-12 w-12" />;
    }
    return (
      <div className="h-12 w-12 rounded border-2 border-primary flex items-center justify-center text-xl font-bold">
        {value}
      </div>
    );
  };

  const clearHistory = () => {
    setRollHistory([]);
    setCurrentRoll(null);
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Dice Roller
          <Button variant="ghost" size="sm" onClick={clearHistory}>
            <RotateCcw className="h-4 w-4" />
          </Button>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Current Roll Display */}
        <div className="text-center space-y-4">
          <div
            className={cn(
              "flex items-center justify-center h-24 w-24 mx-auto rounded-lg border-2 transition-all duration-200",
              rolling
                ? "border-primary animate-pulse scale-110"
                : "border-muted",
              currentRoll !== null ? "bg-primary/10" : "bg-muted/20",
            )}
          >
            {currentRoll !== null ? (
              <div className="text-primary">{getDiceIcon(currentRoll)}</div>
            ) : (
              <div className="text-muted-foreground">
                <Dice1 className="h-12 w-12" />
              </div>
            )}
          </div>

          {currentRoll !== null && !rolling && (
            <Badge variant="secondary" className="text-lg px-4 py-2">
              Result: {currentRoll}
            </Badge>
          )}
        </div>

        <Separator />

        {/* Dice Buttons */}
        <div className="space-y-4">
          <h3 className="font-medium text-sm text-muted-foreground">
            Common Rolls
          </h3>
          <div className="grid grid-cols-2 gap-2">
            <Button
              onClick={() => rollDice(20, "d20")}
              disabled={rolling}
              variant="outline"
              className="h-12"
            >
              d20
            </Button>
            <Button
              onClick={() => rollDice(12, "d12")}
              disabled={rolling}
              variant="outline"
              className="h-12"
            >
              d12
            </Button>
            <Button
              onClick={() => rollDice(10, "d10")}
              disabled={rolling}
              variant="outline"
              className="h-12"
            >
              d10
            </Button>
            <Button
              onClick={() => rollDice(8, "d8")}
              disabled={rolling}
              variant="outline"
              className="h-12"
            >
              d8
            </Button>
            <Button
              onClick={() => rollDice(6, "d6")}
              disabled={rolling}
              variant="outline"
              className="h-12"
            >
              d6
            </Button>
            <Button
              onClick={() => rollDice(4, "d4")}
              disabled={rolling}
              variant="outline"
              className="h-12"
            >
              d4
            </Button>
          </div>
        </div>

        <Separator />

        {/* Oracle/Mythic Rolls */}
        <div className="space-y-4">
          <h3 className="font-medium text-sm text-muted-foreground">
            Oracle & Mythic
          </h3>
          <div className="space-y-2">
            <Button
              onClick={() => rollDice(100, "Fate Question")}
              disabled={rolling}
              variant="secondary"
              className="w-full"
            >
              Fate Question (d100)
            </Button>
            <Button
              onClick={() => rollDice(100, "Event Focus")}
              disabled={rolling}
              variant="secondary"
              className="w-full"
            >
              Event Focus (d100)
            </Button>
            <Button
              onClick={() => rollDice(100, "Random Event")}
              disabled={rolling}
              variant="secondary"
              className="w-full"
            >
              Random Event (d100)
            </Button>
          </div>
        </div>

        {/* Roll History */}
        {rollHistory.length > 0 && (
          <>
            <Separator />
            <div className="space-y-2">
              <h3 className="font-medium text-sm text-muted-foreground">
                Recent Rolls
              </h3>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {rollHistory.map((roll) => (
                  <div
                    key={roll.id}
                    className="flex justify-between items-center text-sm p-2 rounded bg-muted/50"
                  >
                    <span>{roll.type}</span>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{roll.result}</Badge>
                      <span className="text-xs text-muted-foreground">
                        {roll.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
