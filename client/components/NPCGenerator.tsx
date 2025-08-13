import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  RefreshCw,
  Edit3,
  Copy
} from "lucide-react";

interface GeneratedNPC {
  race: string;
  occupation: string;
  motivation: string;
  secret: string;
  physicalAppearance: string;
  economicStatus: string;
  quirk: string;
  competence: string;
  firstName: string;
  lastName: string;
}

const GENERATION_STEPS = [
  { key: 'firstName', label: 'First Name', description: 'Character\'s given name (Algorithmic generation)' },
  { key: 'lastName', label: 'Last Name', description: 'Character\'s family name (Algorithmic generation)' },
  { key: 'race', label: 'Race', description: 'Character\'s species or ancestry (Random table roll)' },
  { key: 'occupation', label: 'Occupation', description: 'Character\'s profession or trade (Random table roll)' },
  { key: 'physicalAppearance', label: 'Physical Appearance', description: 'Character\'s looks and build (Random table roll)' },
  { key: 'economicStatus', label: 'Economic Status', description: 'Character\'s wealth level (Random table roll)' },
  { key: 'quirk', label: 'Quirk', description: 'Character\'s distinctive trait or habit (Random table roll)' },
  { key: 'competence', label: 'Competence', description: 'Character\'s skill level and effectiveness (Random table roll)' },
  { key: 'motivation', label: 'Motivation', description: 'Character\'s driving desires and goals (Random table roll)' },
  { key: 'secret', label: 'Secret', description: 'Character\'s hidden truth or mystery (Random table roll)' },
] as const;

interface NPCGeneratorProps {
  mobileTab?: 'step1' | 'step2';
}

export default function NPCGenerator({ mobileTab = 'step1' }: NPCGeneratorProps = {}) {
  const { toast } = useToast();
  const [npcData, setNpcData] = useState<GeneratedNPC | null>(null);
  const [loading, setLoading] = useState(false);
  const [generatingStep, setGeneratingStep] = useState<string | null>(null);
  const [narrative, setNarrative] = useState<string>("");
  const [generatingNarrative, setGeneratingNarrative] = useState(false);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Record<string, string>>({});
  const [step1Complete, setStep1Complete] = useState(false);

  const generateStep1 = async () => {
    setLoading(true);
    setNpcData(null);
    setNarrative('');
    setStep1Complete(false);
    
    try {
      const response = await fetch('/api/generate-npc', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (data.success) {
        setNpcData(data.npc);
        setStep1Complete(true);
        toast({
          title: "NPC Generated!",
          description: `Generated ${data.npc.firstName} ${data.npc.lastName}, a ${data.npc.race} ${data.npc.occupation}.`,
        });
      } else {
        throw new Error(data.error || 'Failed to generate NPC');
      }
    } catch (error) {
      console.error('Error generating NPC:', error);
      toast({
        title: "Generation Error",
        description: "Failed to generate NPC. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const regenerateStep = async (stepKey: string) => {
    setGeneratingStep(stepKey);
    
    try {
      const response = await fetch('/api/generate-npc-step', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ step: stepKey }),
      });

      const data = await response.json();
      
      if (data.success && npcData) {
        setNpcData({
          ...npcData,
          [stepKey]: data.result,
        });
        toast({
          title: "Field Regenerated!",
          description: `${stepKey} has been updated.`,
        });
      } else {
        throw new Error(data.error || 'Failed to regenerate step');
      }
    } catch (error) {
      console.error('Error regenerating step:', error);
      toast({
        title: "Generation Error",
        description: "Failed to regenerate field. Please try again.",
        variant: "destructive",
      });
    } finally {
      setGeneratingStep(null);
    }
  };

  const generateNarrative = async () => {
    if (!npcData) return;
    
    setGeneratingNarrative(true);
    
    try {
      const response = await fetch('/api/generate-npc-narrative', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          npc: npcData,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setNarrative(data.narrative);
        toast({
          title: "Narrative Generated!",
          description: "Character narrative has been created.",
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

  const handleEditStart = (field: string, currentValue: any) => {
    setEditingField(field);
    setEditValues({ [field]: String(currentValue || '') });
  };

  const handleEditSave = (field: string) => {
    if (npcData) {
      setNpcData({
        ...npcData,
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

  const handleCopyField = async (stepKey: string, value: any) => {
    const stepData = GENERATION_STEPS.find(step => step.key === stepKey);
    const label = stepData?.label || stepKey;
    const textToCopy = `${label}: ${String(value)}`;

    const success = await copyToClipboard(textToCopy);

    if (success) {
      toast({
        title: "Copied to clipboard",
        description: "Content has been successfully copied.",
      });
    } else {
      toast({
        title: "Copy failed",
        description: "Unable to copy content to clipboard. Please manually select and copy the text.",
        variant: "destructive",
      });
    }
  };

  const copyToClipboard = async (text: string) => {
    // Try modern Clipboard API first
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch (err) {
      console.warn('Clipboard API failed, falling back to execCommand:', err);
    }

    // Fallback to the older document.execCommand method
    try {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();

      const success = document.execCommand('copy');
      document.body.removeChild(textArea);

      if (success) {
        return true;
      } else {
        throw new Error('execCommand copy failed');
      }
    } catch (err) {
      console.error('All copy methods failed:', err);
      return false;
    }
  };

  const handleCopyNarrative = async () => {
    const success = await copyToClipboard(narrative);

    if (success) {
      toast({
        title: "Copied to clipboard",
        description: "Narrative has been successfully copied.",
      });
    } else {
      toast({
        title: "Copy failed",
        description: "Unable to copy narrative to clipboard. Please manually select and copy the text.",
        variant: "destructive",
      });
    }
  };

  const renderStepValue = (step: typeof GENERATION_STEPS[0], value: any) => {
    const isEditing = editingField === step.key;

    if (isEditing) {
      return (
        <div className="space-y-2">
          <Input
            value={editValues[step.key] || ''}
            onChange={(e) => setEditValues({ ...editValues, [step.key]: e.target.value })}
            className="w-full font-serif"
            autoFocus
          />
          <div className="flex gap-2">
            <Button size="sm" onClick={() => handleEditSave(step.key)}>
              Save
            </Button>
            <Button size="sm" variant="outline" onClick={handleEditCancel}>
              Cancel
            </Button>
          </div>
        </div>
      );
    }

    return <span className="font-serif font-semibold" style={{ paddingTop: '6px' }}>{String(value)}</span>;
  };

  return (
    <div className="flex h-full">
      {/* Step 1 - Left Panel */}
      <div className={`flex flex-col h-full flex-1 lg:border-r border-gray-300 lg:pr-3.5 ${mobileTab === 'step2' ? 'hidden lg:flex' : ''}`}>
        <div className="border-b border-gray-200 pb-4 flex-shrink-0">
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">Step 1</h2>
          <p className="text-gray-600 mb-4">Generate and edit basic information about your NPC.</p>
          
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
                Generating NPC...
              </>
            ) : (
              "Generate NPC"
            )}
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto min-h-0 mt-6">
          {npcData && (
            <div className="space-y-4 pr-2">
              {GENERATION_STEPS.filter((step) => {
                const value = npcData[step.key as keyof GeneratedNPC];
                // Only show fields that actually have values
                return value !== undefined && value !== null && value !== '';
              }).map((step) => {
                const value = npcData[step.key as keyof GeneratedNPC];
                const isGenerating = generatingStep === step.key;
                const isEditing = editingField === step.key;

                return (
                  <Card key={step.key}>
                    <CardHeader className="pb-1.5">
                      <CardTitle className="text-base">
                        <p className="flex-1 min-w-0">
                          <span className="font-bold text-sm">{step.label}</span>
                          <span className="text-sm text-gray-600 font-normal"> {step.description}</span>
                        </p>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="bg-gray-50 border border-gray-200 rounded-md p-1.5">
                        <div className={`flex gap-3 ${step.key === 'firstName' || step.key === 'lastName' || step.key === 'race' ? 'items-center justify-start' : 'items-start'}`}>
                          <div className="flex-1">
                            {renderStepValue(step, value)}
                          </div>
                          <div className="flex-shrink-0 flex items-center">
                            {!isEditing && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditStart(step.key, value)}
                                disabled={isGenerating || !value}
                                className="text-gray-500 hover:text-primary p-1"
                              >
                                <Edit3 className="w-3 h-3" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleCopyField(step.key, value)}
                              disabled={!value}
                              className="text-gray-500 hover:text-primary p-1"
                            >
                              <Copy className="w-3 h-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => regenerateStep(step.key)}
                              disabled={isGenerating || isEditing}
                              className="p-1"
                            >
                              {isGenerating ? (
                                <RefreshCw className="w-3 h-3 animate-spin" />
                              ) : (
                                <RefreshCw className="w-3 h-3" />
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
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
                        className="text-gray-500 hover:text-primary p-1"
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-50 rounded-md">
                    {narrative ? (
                      <div className="prose prose-sm max-w-none font-serif">
                        <p className="whitespace-pre-wrap text-sm text-gray-700 leading-relaxed">
                          {narrative}
                        </p>
                      </div>
                    ) : (
                      <div className="text-gray-500 italic font-serif">
                        Click "Generate AI Narrative" to create rich storytelling content about this character
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
