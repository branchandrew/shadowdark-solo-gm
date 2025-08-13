import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { RefreshCw, Copy, Info } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface AlignmentOption {
  value: number;
  label: string;
}

interface NameGenerationResult {
  success: boolean;
  alignment?: number;
  actualAlignment?: number;
  names?: string[];
  error?: string;
}

export default function NameGenerator() {
  const { toast } = useToast();
  const [alignmentOptions, setAlignmentOptions] = useState<AlignmentOption[]>([]);
  const [selectedAlignment, setSelectedAlignment] = useState<number>(0); // 0 = Random
  const [actualSelectedAlignment, setActualSelectedAlignment] = useState<number>(0); // Tracks what was actually used
  const [numNames, setNumNames] = useState<number>(8);
  const [generatedNames, setGeneratedNames] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingOptions, setLoadingOptions] = useState(true);

  // Load alignment options on component mount
  useEffect(() => {
    loadAlignmentOptions();
  }, []);

  const loadAlignmentOptions = async () => {
    try {
      const response = await fetch('/api/alignment-options');
      const data = await response.json();
      
      if (data.success) {
        // Add Random option as the first option
        const optionsWithRandom = [
          { value: 0, label: "Random" },
          ...data.alignments
        ];
        setAlignmentOptions(optionsWithRandom);
      } else {
        throw new Error(data.error || 'Failed to load alignment options');
      }
    } catch (error) {
      console.error('Error loading alignment options:', error);
      // Fallback options if API fails
      setAlignmentOptions([
        { value: 0, label: "Random" },
        { value: 1, label: "Evil" },
        { value: 2, label: "Slavic" },
        { value: 3, label: "Anglo-Saxon" },
        { value: 4, label: "Fae/Elvish" },
      ]);
    } finally {
      setLoadingOptions(false);
    }
  };

  const generateNames = async () => {
    setLoading(true);
    
    try {
      const response = await fetch('/api/generate-names', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          alignment: selectedAlignment,
          numNames: numNames,
        }),
      });

      const data: NameGenerationResult = await response.json();
      
      if (data.success && data.names) {
        setGeneratedNames(data.names);

        // Update the actual selected alignment if Random was used
        const usedAlignment = data.actualAlignment || selectedAlignment;
        setActualSelectedAlignment(usedAlignment);

        const alignmentName = alignmentOptions.find(opt => opt.value === usedAlignment)?.label || 'Unknown';
        toast({
          title: "Names Generated!",
          description: `Generated ${data.names.length} ${alignmentName} names.`,
        });
      } else {
        throw new Error(data.error || 'Failed to generate names');
      }
    } catch (error) {
      console.error('Error generating names:', error);
      toast({
        title: "Generation Error",
        description: "Failed to generate names. Please try again.",
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
          description: "Name copied to clipboard.",
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
            description: "Name copied to clipboard.",
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

  const copyAllNames = async () => {
    if (generatedNames.length === 0) return;
    
    const allNamesText = generatedNames.join('\n');
    await copyToClipboard(allNamesText);
    toast({
      title: "All Names Copied!",
      description: `Copied ${generatedNames.length} names to clipboard.`,
    });
  };

  if (loadingOptions) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading name generator...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 space-y-6">
        {/* Description Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <Info className="w-5 h-5 text-blue-600" />
              How Names Are Generated
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-gray-700 space-y-3">
              <p>
                Our name generator uses <strong>phoneme-based syllable construction</strong> to create authentic-sounding fantasy names.
                Each language style has three distinct phoneme sets:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-4">
                <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-blue-800 mb-1">Starting Phonemes</h4>
                  <p className="text-xs text-blue-700">Initial sounds that begin names (e.g., "Mal-", "Bri-", "Th-")</p>
                </div>
                <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                  <h4 className="font-semibold text-green-800 mb-1">Middle Phonemes</h4>
                  <p className="text-xs text-green-700">Connecting syllables that form the name's core (e.g., "-oth-", "-wy-", "-ar-")</p>
                </div>
                <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
                  <h4 className="font-semibold text-purple-800 mb-1">Ending Phonemes</h4>
                  <p className="text-xs text-purple-700">Final sounds that complete names (e.g., "-goth", "-wen", "-son")</p>
                </div>
              </div>
              <p>
                Names are constructed by intelligently combining these phoneme groups, respecting each language's
                <strong> phonotactic rules</strong> (sound patterns) and <strong>morphological structure</strong> (meaningful parts).
                For example, Celtic names favor flowing vowel combinations like "wy" and "oe", while Germanic names
                emphasize compound elements like "-fried" and "-helm".
              </p>
              <p className="text-xs text-gray-600 italic">
                Each style contains 20-30+ phonemes per category, ensuring thousands of unique name combinations
                while maintaining linguistic authenticity.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Generation Settings */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="flex items-center gap-2 text-sm font-medium mb-2">
                  Style
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-5 w-5 p-0 text-gray-400 hover:text-gray-600">
                        <Info className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Name Style Guide</DialogTitle>
                      </DialogHeader>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        {alignmentOptions.filter(alignment => alignment.value !== 0).map((alignment) => (
                          <div
                            key={alignment.value}
                            className={`p-3 rounded-md border-2 ${
                              actualSelectedAlignment === alignment.value
                                ? 'border-blue-300 bg-blue-50'
                                : 'border-gray-200 bg-gray-50'
                            }`}
                          >
                            <div className="font-semibold text-gray-800 mb-2">{alignment.label}</div>
                            <div className="text-sm text-gray-600">
                              {alignment.value === 1 && "Dark, harsh syllables for villains and evil characters"}
                              {alignment.value === 2 && "Irish/Scottish inspired names perfect for elven and druidic cultures"}
                              {alignment.value === 3 && "Old Norse names ideal for barbarian tribes and northern kingdoms"}
                              {alignment.value === 4 && "Germanic names perfect for dwarven clans and mountain craftsmen"}
                              {alignment.value === 5 && "Classical Latin names for imperial organizations and scholarly orders"}
                              {alignment.value === 6 && "Ancient Greek names for academic institutions and city-states"}
                              {alignment.value === 7 && "Slavic names great for cold empires and mystical kingdoms"}
                              {alignment.value === 8 && "Arabic/Persian names perfect for desert kingdoms and sultanates"}
                              {alignment.value === 9 && "Finnish names creating distinctive, otherworldly sounds"}
                              {alignment.value === 10 && "Basque names with unique, unusual fantasy characteristics"}
                              {alignment.value === 11 && "Tolkien-inspired elvish names for ancient, graceful beings"}
                              {alignment.value === 12 && "Harsh, ancient draconic names for dragons and their servants"}
                              {alignment.value === 13 && "Elemental primordial names for nature spirits and ancient beings"}
                              {alignment.value === 14 && "Dark, imposing infernal names for evil entities and cults"}
                              {alignment.value === 15 && "Old English Anglo-Saxon names for medieval warriors and nobles"}
                              {alignment.value === 16 && "Mongolian/Turkish inspired names for nomadic horse-riding cultures"}
                              {alignment.value === 17 && "Ancient Egyptian names for pyramid-building desert civilizations"}
                            </div>
                          </div>
                        ))}
                      </div>
                    </DialogContent>
                  </Dialog>
                </label>
                <Select
                  value={selectedAlignment.toString()}
                  onValueChange={(value) => setSelectedAlignment(parseInt(value))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select style" />
                  </SelectTrigger>
                  <SelectContent>
                    {alignmentOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value.toString()}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Number of Names</label>
                <Input
                  type="number"
                  value={numNames}
                  onChange={(e) => setNumNames(parseInt(e.target.value) || 8)}
                  min={1}
                  max={50}
                  className="w-full"
                />
              </div>
              
              <div className="flex items-end">
                <Button
                  onClick={generateNames}
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
                      Generating...
                    </>
                  ) : (
                    'Generate Names'
                  )}
                </Button>
              </div>
            </div>
            
            <div className="text-sm text-gray-600">
              <div className="font-serif">
                <strong>Selected Style:</strong> {
                  actualSelectedAlignment === 0 ? (
                    selectedAlignment === 0 ? (
                      <span className="font-serif">Random</span>
                    ) : (
                      <span className="font-serif">{alignmentOptions.find(opt => opt.value === selectedAlignment)?.label || 'Random'}</span>
                    )
                  ) : (
                    <Popover>
                      <PopoverTrigger asChild>
                        <button className="font-serif text-blue-600 hover:text-blue-800 underline cursor-pointer">
                          {alignmentOptions.find(opt => opt.value === actualSelectedAlignment)?.label || 'Unknown'}
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-80">
                        <div className="space-y-2">
                          <h4 className="font-semibold">{alignmentOptions.find(opt => opt.value === actualSelectedAlignment)?.label}</h4>
                          <p className="text-sm text-gray-600">
                            {actualSelectedAlignment === 1 && "Dark, harsh syllables for villains and evil characters"}
                            {actualSelectedAlignment === 2 && "Irish/Scottish inspired names perfect for elven and druidic cultures"}
                            {actualSelectedAlignment === 3 && "Old Norse names ideal for barbarian tribes and northern kingdoms"}
                            {actualSelectedAlignment === 4 && "Germanic names perfect for dwarven clans and mountain craftsmen"}
                            {actualSelectedAlignment === 5 && "Classical Latin names for imperial organizations and scholarly orders"}
                            {actualSelectedAlignment === 6 && "Ancient Greek names for academic institutions and city-states"}
                            {actualSelectedAlignment === 7 && "Slavic names great for cold empires and mystical kingdoms"}
                            {actualSelectedAlignment === 8 && "Arabic/Persian names perfect for desert kingdoms and sultanates"}
                            {actualSelectedAlignment === 9 && "Finnish names creating distinctive, otherworldly sounds"}
                            {actualSelectedAlignment === 10 && "Basque names with unique, unusual fantasy characteristics"}
                            {actualSelectedAlignment === 11 && "Tolkien-inspired elvish names for ancient, graceful beings"}
                            {actualSelectedAlignment === 12 && "Harsh, ancient draconic names for dragons and their servants"}
                            {actualSelectedAlignment === 13 && "Elemental primordial names for nature spirits and ancient beings"}
                            {actualSelectedAlignment === 14 && "Dark, imposing infernal names for evil entities and cults"}
                            {actualSelectedAlignment === 15 && "Old English Anglo-Saxon names for medieval warriors and nobles"}
                            {actualSelectedAlignment === 16 && "Mongolian/Turkish inspired names for nomadic horse-riding cultures"}
                            {actualSelectedAlignment === 17 && "Ancient Egyptian names for pyramid-building desert civilizations"}
                          </p>
                        </div>
                      </PopoverContent>
                    </Popover>
                  )
                }
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Generated Names */}
        {generatedNames.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Generated Names ({generatedNames.length})</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={copyAllNames}
                  className="text-gray-500 hover:text-primary"
                  title="Copy All Names"
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {generatedNames.map((name, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-md border hover:bg-gray-100 transition-colors"
                  >
                    <span className="font-serif font-semibold text-gray-800">{name}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(name)}
                      className="text-gray-400 hover:text-primary p-1 ml-2"
                      title={`Copy ${name}`}
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

      </div>
    </div>
  );
}
