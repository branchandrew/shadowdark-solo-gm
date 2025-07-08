import AIChat from "@/components/AIChatEnhanced";
import RightPanel from "@/components/RightPanel";
import ThemeToggle from "@/components/ThemeToggle";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Sword } from "lucide-react";

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
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="h-[calc(100vh-5rem)] overflow-hidden">
        <div className="w-full px-4 py-4 h-full">
          <ResizablePanelGroup direction="horizontal" className="h-full">
            {/* Left Panel - AI Chat */}
            <ResizablePanel defaultSize={33} minSize={20} maxSize={50}>
              <div className="h-full pr-2">
                <AIChat />
              </div>
            </ResizablePanel>

            <ResizableHandle />

            {/* Right Panel - Tabs */}
            <ResizablePanel defaultSize={67} minSize={50}>
              <div className="h-full pl-2">
                <RightPanel />
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
      </main>
    </div>
  );
}
