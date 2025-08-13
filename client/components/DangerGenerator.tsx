import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { RefreshCw, Copy, AlertTriangle, Edit3, Check, X } from "lucide-react";

interface DangerResult {
  category: string;
  subcategory: string;
  specificResult: string;
  rolls: {
    categoryRoll: number;
    subcategoryRoll: number;
    specificRoll: number;
  };
}

interface DangerGenerationResult {
  success: boolean;
  dangers?: DangerResult[];
  count?: number;
  error?: string;
}

interface DangerGeneratorProps {
  mobileTab?: 'step1' | 'step2';
}

export default function DangerGenerator({ mobileTab = 'step1' }: DangerGeneratorProps = {}) {
  const { toast } = useToast();
  const [generatedDanger, setGeneratedDanger] = useState<DangerResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [narrative, setNarrative] = useState<string>("");
  const [generatingNarrative, setGeneratingNarrative] = useState(false);
  const [step1Complete, setStep1Complete] = useState(false);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Record<string, string>>({});

  const generateStep1 = async () => {
    setLoading(true);
    setGeneratedDanger(null);
    setNarrative('');
    setStep1Complete(false);

    try {
      const response = await fetch('/api/generate-dangers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          numDangers: 1,
        }),
      });

      const data: DangerGenerationResult = await response.json();

      if (data.success && data.dangers && data.dangers[0]) {
        setGeneratedDanger(data.dangers[0]);
        setStep1Complete(true);
        toast({
          title: "Danger Generated!",
          description: `Generated ${data.dangers[0].category} danger using 1d12 rolls.`,
        });
      } else {
        throw new Error(data.error || 'Failed to generate danger');
      }
    } catch (error) {
      console.error('Error generating danger:', error);
      toast({
        title: "Generation Error",
        description: "Failed to generate danger. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const generateNarrative = async () => {
    if (!generatedDanger) return;

    setGeneratingNarrative(true);

    try {
      const response = await fetch('/api/generate-danger-narrative', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          danger: generatedDanger,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setNarrative(data.narrative);
        toast({
          title: "Narrative Generated!",
          description: "Danger narrative has been created.",
        });
      } else {
        throw new Error(data.error || 'Failed to generate narrative');
      }
    } catch (error) {
      console.error('Error generating narrative:', error);
      toast({
        title: "Generation Error",
        description: "Failed to generate narrative. Please try again.",
        variant: "destructive",
      });
    } finally {
      setGeneratingNarrative(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    // Try modern Clipboard API first, but catch any errors and fall back
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        toast({
          title: "Copied!",
          description: "Danger copied to clipboard.",
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
            description: "Danger copied to clipboard.",
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

  const formatDangerForCopy = (danger: DangerResult) => {
    return `Category: ${danger.category}\nSubcategory: ${danger.subcategory}\nSpecific Result: ${danger.specificResult}\n\nDice Rolls: ${danger.rolls.categoryRoll}, ${danger.rolls.subcategoryRoll}, ${danger.rolls.specificRoll}`;
  };

  const handleCopyDanger = async () => {
    if (!generatedDanger) return;
    await copyToClipboard(formatDangerForCopy(generatedDanger));
    toast({
      title: "Danger Copied!",
      description: "Danger copied to clipboard.",
    });
  };

  const handleCopyNarrative = async () => {
    if (!narrative) return;
    await copyToClipboard(narrative);
    toast({
      title: "Narrative Copied!",
      description: "Narrative copied to clipboard.",
    });
  };

  const handleEditStart = (field: string, currentValue: any) => {
    setEditingField(field);
    setEditValues({ [field]: String(currentValue || '') });
  };

  const handleEditSave = (field: string) => {
    if (generatedDanger) {
      setGeneratedDanger({
        ...generatedDanger,
        [field]: editValues[field],
      });
    }
    setEditingField(null);
    setEditValues({});
  };

  const handleEditCancel = () => {
    setEditingField(null);
    setEditValues({});
  };

  const handleCopyField = async (field: string, value: any) => {
    const fieldLabels: Record<string, string> = {
      category: 'Category',
      subcategory: 'Subcategory',
      specificResult: 'Specific Result'
    };

    const label = fieldLabels[field] || field;
    const textToCopy = `${label}: ${String(value)}`;

    await copyToClipboard(textToCopy);
    toast({
      title: "Field Copied!",
      description: `${label} copied to clipboard.`,
    });
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'UNNATURAL ENTITY':
        return 'bg-purple-50 border-purple-200 text-purple-800';
      case 'HAZARD':
        return 'bg-orange-50 border-orange-200 text-orange-800';
      case 'CREATURE':
        return 'bg-red-50 border-red-200 text-red-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  return (
    <div className="flex h-full">
      {/* Step 1 - Left Panel */}
      <div className={`flex flex-col h-full flex-1 lg:border-r border-gray-300 lg:pr-3.5 ${mobileTab === 'step2' ? 'hidden lg:flex' : ''}`}>
        <div className="border-b border-gray-200 pb-4 flex-shrink-0">
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">Step 1</h2>
          <p className="text-gray-600 mb-4">Generate and edit basic information about your Danger.</p>

          <Button
            onClick={generateStep1}
            disabled={loading}
            className="w-auto"
            style={{
              backgroundColor: 'var(--secondary-color)',
              borderRadius: '20px 17px 22px 15px',
              fontFamily: 'MedievalSharp, cursive',
            }}
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Generating Danger...
              </>
            ) : (
              "Generate Danger"
            )}
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto min-h-0 mt-6">
          {generatedDanger && (
            <div className="space-y-4 pr-2">
              <Card>
                <CardHeader className="pb-1.5">
                  <CardTitle className="text-base">
                    <p className="flex-1 min-w-0">
                      <span className="font-bold text-sm">Category</span>
                    </p>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="bg-gray-50 border border-gray-200 rounded-md p-1.5">
                    <div className="flex gap-3 items-center justify-start">
                      <div className="flex-1">
                        {editingField === 'category' ? (
                          <Input
                            value={editValues.category || ''}
                            onChange={(e) => setEditValues({ ...editValues, category: e.target.value })}
                            className="font-serif font-semibold text-sm"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleEditSave('category');
                              if (e.key === 'Escape') handleEditCancel();
                            }}
                            autoFocus
                          />
                        ) : (
                          <span className="font-serif font-semibold">{generatedDanger.category}</span>
                        )}
                      </div>
                      <div className="flex-shrink-0 flex items-center">
                        {editingField === 'category' ? (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditSave('category')}
                              className="text-green-600 hover:text-green-800 p-1"
                            >
                              <Check className="w-3 h-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={handleEditCancel}
                              className="text-red-600 hover:text-red-800 p-1"
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditStart('category', generatedDanger.category)}
                              className="text-gray-500 hover:text-primary p-1"
                            >
                              <Edit3 className="w-3 h-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleCopyField('category', generatedDanger.category)}
                              className="text-gray-500 hover:text-primary p-1"
                            >
                              <Copy className="w-3 h-3" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-1.5">
                  <CardTitle className="text-base">
                    <p className="flex-1 min-w-0">
                      <span className="font-bold text-sm">Subcategory</span>
                    </p>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="bg-gray-50 border border-gray-200 rounded-md p-1.5">
                    <div className="flex gap-3 items-start">
                      <div className="flex-1">
                        {editingField === 'subcategory' ? (
                          <Input
                            value={editValues.subcategory || ''}
                            onChange={(e) => setEditValues({ ...editValues, subcategory: e.target.value })}
                            className="font-serif font-semibold text-sm"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleEditSave('subcategory');
                              if (e.key === 'Escape') handleEditCancel();
                            }}
                            autoFocus
                          />
                        ) : (
                          <span className="font-serif font-semibold">{generatedDanger.subcategory}</span>
                        )}
                      </div>
                      <div className="flex-shrink-0 flex items-center">
                        {editingField === 'subcategory' ? (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditSave('subcategory')}
                              className="text-green-600 hover:text-green-800 p-1"
                            >
                              <Check className="w-3 h-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={handleEditCancel}
                              className="text-red-600 hover:text-red-800 p-1"
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditStart('subcategory', generatedDanger.subcategory)}
                              className="text-gray-500 hover:text-primary p-1"
                            >
                              <Edit3 className="w-3 h-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleCopyField('subcategory', generatedDanger.subcategory)}
                              className="text-gray-500 hover:text-primary p-1"
                            >
                              <Copy className="w-3 h-3" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-1.5">
                  <CardTitle className="text-base">
                    <p className="flex-1 min-w-0">
                      <span className="font-bold text-sm">Specific Result</span>
                    </p>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="bg-gray-50 border border-gray-200 rounded-md p-1.5">
                    <div className="flex gap-3 items-start">
                      <div className="flex-1">
                        {editingField === 'specificResult' ? (
                          <Input
                            value={editValues.specificResult || ''}
                            onChange={(e) => setEditValues({ ...editValues, specificResult: e.target.value })}
                            className="font-serif font-semibold text-sm"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleEditSave('specificResult');
                              if (e.key === 'Escape') handleEditCancel();
                            }}
                            autoFocus
                          />
                        ) : (
                          <span className="font-serif font-semibold">{generatedDanger.specificResult.replace(/\s*\[p\d+\]\s*/g, '')}</span>
                        )}
                      </div>
                      <div className="flex-shrink-0 flex items-center">
                        {editingField === 'specificResult' ? (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditSave('specificResult')}
                              className="text-green-600 hover:text-green-800 p-1"
                            >
                              <Check className="w-3 h-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={handleEditCancel}
                              className="text-red-600 hover:text-red-800 p-1"
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditStart('specificResult', generatedDanger.specificResult)}
                              className="text-gray-500 hover:text-primary p-1"
                            >
                              <Edit3 className="w-3 h-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleCopyField('specificResult', generatedDanger.specificResult)}
                              className="text-gray-500 hover:text-primary p-1"
                            >
                              <Copy className="w-3 h-3" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>

      {/* Step 2 - Right Panel */}
      <div className={`flex flex-col h-full flex-1 lg:pl-3.5 ${mobileTab === 'step1' ? 'hidden lg:flex' : ''}`}>
        <div className="border-b border-gray-200 pb-4 flex-shrink-0">
          <h2 className={`text-2xl font-semibold mb-2 ${step1Complete ? 'text-gray-800' : 'text-gray-400'}`}>Step 2</h2>
          <p className={`mb-4 ${step1Complete ? 'text-gray-600' : 'text-gray-400'}`}>Generate AI narrative and storytelling content.</p>
          <Button
            onClick={generateNarrative}
            disabled={generatingNarrative || !step1Complete}
            className="w-auto"
            style={{
              backgroundColor: step1Complete ? 'var(--secondary-color)' : '#9CA3AF',
              borderRadius: '18px 24px 16px 21px',
              fontFamily: 'MedievalSharp, cursive',
            }}
          >
            {generatingNarrative ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Generating Narrative...
              </>
            ) : (
              "Generate AI Narrative"
            )}
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto min-h-0 mt-6">
          {step1Complete && (
            <div className="pr-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <span>AI Narrative</span>
                      <span className="text-sm text-gray-600 font-normal">Rich storytelling for DM use</span>
                    </div>
                    {narrative && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleCopyNarrative}
                        className="text-gray-500 hover:text-primary"
                        title="Copy Narrative"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {narrative ? (
                    <div className="prose prose-sm max-w-none">
                      <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                        {narrative}
                      </div>
                    </div>
                  ) : (
                    <div className="text-gray-500 italic text-center py-8">
                      Click "Generate AI Narrative" to create a rich story around your danger.
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
