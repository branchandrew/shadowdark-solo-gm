import AIChat from "@/components/AIChat";
import RightPanel from "@/components/RightPanel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Sword, Moon, Star } from "lucide-react";

export default function Index() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
                <Sword className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">
                  Shadowdark Solo GM
                </h1>
                <p className="text-sm text-muted-foreground">
                  AI-Powered Mythic GME Experience
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="p-1 rounded-full bg-primary/20">
                <Moon className="h-4 w-4 text-primary" />
              </div>
              <div className="p-1 rounded-full bg-accent/20">
                <Star className="h-4 w-4 text-accent" />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="h-[calc(100vh-5rem)] overflow-hidden">
        <div className="container mx-auto px-4 py-4 h-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full">
            {/* Left Panel - AI Chat */}
            <div className="h-full">
              <AIChat />
            </div>

            {/* Right Panel - Tabs */}
            <div className="h-full">
              <RightPanel />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
