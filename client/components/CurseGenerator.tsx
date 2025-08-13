import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { RefreshCw, Copy, Zap, Info } from "lucide-react";

interface CurseGenerationResult {
  success: boolean;
  curse?: string;
  category?: string;
  error?: string;
}

interface CurseCategory {
  value: string;
  label: string;
  count: number;
}

export default function CurseGenerator() {
  const { toast } = useToast();
  const [generatedCurse, setGeneratedCurse] = useState<string>('');
  const [generatedCurseCategory, setGeneratedCurseCategory] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('random');
  const [categories, setCategories] = useState<CurseCategory[]>([]);
  const [loading, setLoading] = useState(false);

  // Load curse categories on component mount
  useEffect(() => {
    loadCurseCategories();
  }, []);

  const loadCurseCategories = async () => {
    try {
      const response = await fetch('/api/curse-categories');
      const data = await response.json();

      if (data.success) {
        setCategories(data.categories);
      }
    } catch (error) {
      console.error('Error loading curse categories:', error);
    }
  };

  const generateCurse = async () => {
    setLoading(true);

    try {
      const response = await fetch('/api/generate-curses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          category: selectedCategory,
        }),
      });

      const data: CurseGenerationResult = await response.json();

      if (data.success && data.curse) {
        setGeneratedCurse(data.curse);
        setGeneratedCurseCategory(data.category || selectedCategory);
        const categoryLabel = categories.find(c => c.value === data.category)?.label || data.category;
        toast({
          title: "Curse Generated!",
          description: `Generated a ${categoryLabel?.toLowerCase()} curse.`,
        });
      } else {
        throw new Error(data.error || 'Failed to generate curse');
      }
    } catch (error) {
      console.error('Error generating curse:', error);
      toast({
        title: "Generation Error",
        description: "Failed to generate curse. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    // Try modern Clipboard API first, but catch any errors and fall back
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        toast({
          title: "Copied!",
          description: "Curse copied to clipboard.",
        });
        return;
      }
    } catch (err) {
      console.warn('Clipboard API failed, falling back to execCommand:', err);
    }

    // Fallback to the older document.execCommand method
    return new Promise<void>((resolve, reject) => {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();

      try {
        const success = document.execCommand('copy');
        if (success) {
          toast({
            title: "Copied!",
            description: "Curse copied to clipboard.",
          });
          resolve();
        } else {
          reject(new Error('Copy command failed'));
        }
      } catch (err) {
        reject(err);
      } finally {
        document.body.removeChild(textArea);
      }
    }).catch(() => {
      toast({
        title: "Copy Failed",
        description: "Failed to copy to clipboard.",
        variant: "destructive",
      });
    });
  };

  const copyCurse = async () => {
    if (!generatedCurse) return;

    await copyToClipboard(generatedCurse);
    toast({
      title: "Curse Copied!",
      description: "Curse copied to clipboard.",
    });
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 space-y-6">
        {/* Generation Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Curse Generation Settings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-2">Curse Type</label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select curse type" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button
                  onClick={generateCurse}
                  disabled={loading}
                  className="w-full"
                  style={{
                    backgroundColor: 'var(--secondary-color)',
                    borderRadius: '20px 17px 22px 15px',
                    fontFamily: 'MedievalSharp, cursive',
                  }}
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Cursing...
                    </>
                  ) : (
                    'Generate Curse'
                  )}
                </Button>
              </div>


            </div>

            <div className="text-sm text-gray-600">
              <div className="mb-2">
                <strong>Generate a single curse</strong> from the selected category of magical afflictions.
              </div>
              <div>
                Perfect for cursed items, magical mishaps, or divine punishment in your campaign.
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Generated Curse */}
        {generatedCurse && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Generated Curse</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={copyCurse}
                  className="text-gray-500 hover:text-primary"
                  title="Copy Curse"
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="destructive" className="text-xs">
                        {categories.find(c => c.value === generatedCurseCategory)?.label || 'Random'} Curse
                      </Badge>
                    </div>
                    <p className="font-serif text-gray-800 leading-relaxed">
                      {generatedCurse}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={copyCurse}
                    className="text-gray-400 hover:text-red-600 p-1 ml-2 flex-shrink-0"
                    title="Copy Curse"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}


      </div>
    </div>
  );
}
