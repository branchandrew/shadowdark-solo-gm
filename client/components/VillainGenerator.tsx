import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  RefreshCw,
  Edit3,
  Copy
} from "lucide-react";

interface GenerationResults {
  tarotCards: Array<{
    position: string;
    card_text: string;
  }>;
  goal: string;
  race: string;
  villainNames: string[];
  lieutenantTypes: string[];
  lieutenantNames: string[];
  factionName: string;
  factionFateQuestions: Array<{
    question: string;
    roll: string;
    interpretation: string;
    impact: string;
  }>;
  lieutenantFateQuestions: Array<{
    lieutenantName: string;
    lieutenantType: string;
    fateQuestions: Array<{
      question: string;
      roll: string;
      interpretation: string;
    }>;
  }>;
  clues: string[];
  highTowerSurprise: {
    surprise: string;
    fateQuestion: string;
    roll: string;
    interpretation: string;
    finalOutcome: string;
  };
  minions: Array<{
    type: string;
    description: string;
    count: string;
  }>;
  llmReasoning: {
    tarotInterpretation: string;
    raceRationale: string;
    goalAlignment: string;
    overallCoherence: string;
    villainNameChoice?: string;
    lieutenantNameChoices?: string;
  };
}

const GENERATION_STEPS = [
  // BBEG fieldsets
  { key: 'tarotCards', label: 'Tarot Cards', description: '6-card spread for thematic inspiration (Random table roll)', category: 'bbeg' },
  { key: 'goal', label: 'Goal', description: 'Primary motivation from 360-item table (Random table roll)', category: 'bbeg' },
  { key: 'race', label: 'Race', description: '50% Human, otherwise weighted selection from 67 types (Random with weighting)', category: 'bbeg' },
  { key: 'villainNames', label: 'Villain Names', description: '6 evil-aligned names using syllable algorithm (Algorithmic generation)', category: 'bbeg' },
  { key: 'villainNameChoice', label: 'LLM Villain Name Decision', description: 'AI reasoning for chosen villain name', category: 'bbeg' },

  // Lieutenant fieldsets
  { key: 'lieutenantTypes', label: 'Lieutenant Types', description: '2 unique creature types for servants (Random table roll)', category: 'lieutenant' },
  { key: 'lieutenantNames', label: 'Lieutenant Names', description: '6 evil-aligned names for lieutenants (Algorithmic generation)', category: 'lieutenant' },
  { key: 'lieutenantNameChoices', label: 'LLM Lieutenant Name Decisions', description: 'AI reasoning for chosen lieutenant names', category: 'lieutenant' },
  { key: 'lieutenantFateQuestions', label: 'Lieutenant Fate Questions', description: 'Yes/No questions for each lieutenant background (LLM fate decisions)', category: 'lieutenant' },

  // Faction fieldsets
  { key: 'factionName', label: 'Faction Name', description: 'Organization name using algorithmic generation (Algorithmic generation)', category: 'faction' },
  { key: 'factionFateQuestions', label: 'Faction Fate Questions', description: 'Yes/No questions determining faction properties (LLM fate decisions)', category: 'faction' },
  { key: 'clues', label: 'Investigation Clues', description: '8 clues for heroes to discover the villain (LLM generation)', category: 'faction' },
  { key: 'highTowerSurprise', label: 'High Tower Surprise', description: 'Plot twist with fate question resolution (LLM fate decisions)', category: 'faction' },

  // Minion fieldsets
  { key: 'minions', label: 'Minion Types', description: 'Standardized minion types for the villain (LLM processing)', category: 'minion' },

  { key: 'llmReasoning', label: 'LLM Reasoning Summary', description: 'AI interpretation of all random rolls and fate decisions (LLM processing)', category: 'summary' },
] as const;

interface VillainGeneratorProps {
  mobileTab?: 'step1' | 'step2';
}

export default function VillainGenerator({ mobileTab = 'step1' }: VillainGeneratorProps = {}) {
  const { toast } = useToast();
  const [generationData, setGenerationData] = useState<GenerationResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [generatingStep, setGeneratingStep] = useState<string | null>(null);
  const [narrative, setNarrative] = useState<string>("");
  const [generatingNarrative, setGeneratingNarrative] = useState(false);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Record<string, string>>({});
  const [step1Complete, setStep1Complete] = useState(false);

  const generateStep1 = async () => {
    setLoading(true);
    setGenerationData(null);
    setNarrative("");
    setStep1Complete(false);

    try {
      const response = await fetch("/api/villain-generator", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          generateIntermediateSteps: true,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate villain steps");
      }

      const data = await response.json();
      setGenerationData(data.generationResults);
      setStep1Complete(true);
    } catch (error) {
      console.error("Error generating villain steps:", error);
    } finally {
      setLoading(false);
    }
  };

  const regenerateStep = async (stepKey: string) => {
    if (!generationData) return;

    setGeneratingStep(stepKey);

    try {
      const response = await fetch("/api/villain-generator", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          regenerateIntermediateStep: stepKey,
          currentGenerationData: generationData,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to regenerate ${stepKey}`);
      }

      const data = await response.json();
      setGenerationData(data.generationResults);
    } catch (error) {
      console.error(`Error regenerating ${stepKey}:`, error);
    } finally {
      setGeneratingStep(null);
    }
  };

  const generateNarrative = async () => {
    if (!generationData) return;

    setGeneratingNarrative(true);

    try {
      const response = await fetch("/api/villain-generator", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          generateVillainFromSteps: true,
          generationData: generationData,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate narrative");
      }

      const data = await response.json();
      setNarrative(data.narrative);
    } catch (error) {
      console.error("Error generating narrative:", error);
    } finally {
      setGeneratingNarrative(false);
    }
  };

  const handleEditStart = (stepKey: string, currentValue: any) => {
    setEditingField(stepKey);
    let editValue = '';

    switch (stepKey) {
      case 'tarotCards':
        editValue = currentValue.map((card: any) => `${card.position}: ${card.card_text}`).join('\n');
        break;
      case 'villainNames':
      case 'lieutenantNames':
      case 'lieutenantTypes':
        editValue = currentValue.join(', ');
        break;
      case 'llmReasoning':
        editValue = `Tarot Interpretation: ${currentValue.tarotInterpretation}\n\nRace Rationale: ${currentValue.raceRationale}\n\nGoal Alignment: ${currentValue.goalAlignment}\n\nFate Decisions:\n${currentValue.fateDecisions.map((d: any) => `${d.question} (${d.roll}): ${d.interpretation}`).join('\n')}`;
        break;
      default:
        editValue = String(currentValue);
    }

    setEditValues({ ...editValues, [stepKey]: editValue });
  };

  const handleEditSave = (stepKey: string) => {
    if (!generationData || !editValues[stepKey]) return;

    const editValue = editValues[stepKey];
    let updatedValue: any = editValue;

    switch (stepKey) {
      case 'tarotCards':
        updatedValue = editValue.split('\n').filter(line => line.trim()).map(line => {
          const colonIndex = line.indexOf(':');
          if (colonIndex === -1) return { position: line.trim(), card_text: '' };
          return {
            position: line.substring(0, colonIndex).trim(),
            card_text: line.substring(colonIndex + 1).trim()
          };
        });
        break;
      case 'villainNames':
      case 'lieutenantNames':
      case 'lieutenantTypes':
        updatedValue = editValue.split(',').map(item => item.trim()).filter(item => item);
        break;
      case 'llmReasoning':
        // Parse the edited LLM reasoning text back into structured format
        const lines = editValue.split('\n').filter(line => line.trim());
        updatedValue = {
          tarotInterpretation: '',
          raceRationale: '',
          goalAlignment: '',
          fateDecisions: []
        };

        let currentSection = '';
        for (const line of lines) {
          if (line.startsWith('Tarot Interpretation:')) {
            currentSection = 'tarot';
            updatedValue.tarotInterpretation = line.substring('Tarot Interpretation:'.length).trim();
          } else if (line.startsWith('Race Rationale:')) {
            currentSection = 'race';
            updatedValue.raceRationale = line.substring('Race Rationale:'.length).trim();
          } else if (line.startsWith('Goal Alignment:')) {
            currentSection = 'goal';
            updatedValue.goalAlignment = line.substring('Goal Alignment:'.length).trim();
          } else if (line.startsWith('Fate Decisions:')) {
            currentSection = 'fate';
          } else if (currentSection === 'fate' && line.includes('(') && line.includes('):')) {
            const match = line.match(/^(.+?)\s*\((.+?)\):\s*(.+)$/);
            if (match) {
              updatedValue.fateDecisions.push({
                question: match[1].trim(),
                roll: match[2].trim(),
                interpretation: match[3].trim()
              });
            }
          } else {
            // Continue previous section
            if (currentSection === 'tarot') updatedValue.tarotInterpretation += ' ' + line;
            else if (currentSection === 'race') updatedValue.raceRationale += ' ' + line;
            else if (currentSection === 'goal') updatedValue.goalAlignment += ' ' + line;
          }
        }
        break;
      default:
        updatedValue = editValue;
    }

    setGenerationData({ ...generationData, [stepKey]: updatedValue });
    setEditingField(null);
  };

  const handleEditCancel = () => {
    setEditingField(null);
  };

  const copyToClipboard = async (text: string) => {
    // Try modern Clipboard API first, but catch any errors and fall back
    if (navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(text);
        return;
      } catch (err) {
        // Fall through to legacy method if clipboard API fails
        console.log('Clipboard API failed, using fallback method');
      }
    }

    // Fallback method using document.execCommand
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
          resolve();
        } else {
          reject(new Error('Copy command failed'));
        }
      } catch (err) {
        reject(err);
      } finally {
        document.body.removeChild(textArea);
      }
    });
  };

  const handleCopyField = async (stepKey: string, value: any) => {
    let textToCopy = '';

    switch (stepKey) {
      case 'tarotCards':
        textToCopy = value.map((card: any) => `${card.position}: ${card.card_text}`).join('\n');
        break;
      case 'villainNames':
      case 'lieutenantNames':
      case 'lieutenantTypes':
        textToCopy = value.join(', ');
        break;
      case 'factionFateQuestions':
        textToCopy = value.map((fate: any) => `${fate.question} (${fate.roll}) - ${fate.interpretation}. Impact: ${fate.impact}`).join('\n\n');
        break;
      case 'lieutenantFateQuestions':
        textToCopy = value.map((lieutenant: any) => {
          const questions = lieutenant.fateQuestions.map((fq: any) => `  ${fq.question} (${fq.roll}) - ${fq.interpretation}`).join('\n');
          return `${lieutenant.lieutenantName} (${lieutenant.lieutenantType}):\n${questions}`;
        }).join('\n\n');
        break;
      case 'clues':
        textToCopy = value.map((clue: string, index: number) => `${index + 1}. ${clue}`).join('\n');
        break;
      case 'highTowerSurprise':
        textToCopy = `Plot Twist: ${value.surprise}\n\nFate Question: ${value.fateQuestion}\nRoll: ${value.roll}\nInterpretation: ${value.interpretation}\nFinal Outcome: ${value.finalOutcome}`;
        break;
      case 'minions':
        textToCopy = value.map((minion: any) => `${minion.type} (${minion.count}): ${minion.description}`).join('\n');
        break;
      case 'llmReasoning':
        textToCopy = `Tarot Interpretation: ${value.tarotInterpretation}\n\nRace Rationale: ${value.raceRationale}\n\nGoal Alignment: ${value.goalAlignment}\n\nOverall Coherence: ${value.overallCoherence}`;
        break;
      case 'villainNameChoice':
      case 'lieutenantNameChoices':
        textToCopy = String(value);
        break;
      default:
        textToCopy = String(value);
    }

    try {
      await copyToClipboard(textToCopy);
      toast({
        title: "Copied to clipboard",
        description: "Content has been successfully copied.",
      });
    } catch (err) {
      console.error('Failed to copy text: ', err);
      toast({
        title: "Copy failed",
        description: "Unable to copy content to clipboard.",
        variant: "destructive",
      });
    }
  };

  const handleCopyNarrative = async () => {
    try {
      await copyToClipboard(narrative);
      toast({
        title: "Narrative copied",
        description: "AI narrative has been successfully copied.",
      });
    } catch (err) {
      console.error('Failed to copy narrative: ', err);
      toast({
        title: "Copy failed",
        description: "Unable to copy narrative to clipboard.",
        variant: "destructive",
      });
    }
  };

  const renderStepValue = (step: typeof GENERATION_STEPS[number], value: any) => {
    if (!value) return <span className="text-gray-400">Not generated</span>;

    const isEditing = editingField === step.key;

    if (isEditing) {
      return (
        <div className="space-y-2">
          <textarea
            value={editValues[step.key] || ''}
            onChange={(e) => setEditValues({ ...editValues, [step.key]: e.target.value })}
            className="w-full p-3 border border-gray-300 rounded-md font-serif resize-none"
            rows={6}
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

    switch (step.key) {
      case 'tarotCards':
        return (
          <div className="space-y-2 font-serif">
            {value.map((card: any, index: number) => (
              <div key={index} className="border-l-2 border-blue-300 pl-3">
                <div className="font-semibold text-blue-700" style={{ paddingTop: '6px' }}>{card.position}</div>
                <div className="text-sm text-gray-700">{card.card_text}</div>
              </div>
            ))}
          </div>
        );
      case 'villainNames':
      case 'lieutenantNames':
      case 'lieutenantTypes':
        return (
          <div className="flex flex-wrap gap-2">
            {value.map((item: string, index: number) => (
              <Badge key={index} variant="outline" className="text-sm font-serif">
                {item}
              </Badge>
            ))}
          </div>
        );
      case 'villainNameChoice':
        return (
          <div className="bg-purple-50 p-3 rounded border-l-2 border-purple-300 font-serif">
            <div className="font-semibold text-purple-700 mb-2">Chosen Name & Reasoning</div>
            <div className="text-sm text-gray-700">{value}</div>
          </div>
        );
      case 'lieutenantNameChoices':
        return (
          <div className="bg-purple-50 p-3 rounded border-l-2 border-purple-300 font-serif">
            <div className="font-semibold text-purple-700 mb-2">Chosen Names & Reasoning</div>
            <div className="text-sm text-gray-700">{value}</div>
          </div>
        );
      case 'factionFateQuestions':
        return (
          <div className="space-y-2 font-serif">
            {value.map((fate: any, index: number) => (
              <div key={index} className="bg-green-50 p-3 rounded border-l-2 border-green-300">
                <div className="text-xs font-semibold text-green-800">{fate.question}</div>
                <div className="text-xs text-green-600">Roll: {fate.roll}</div>
                <div className="text-sm text-gray-700">{fate.interpretation}</div>
                <div className="text-xs text-green-700 mt-1 font-semibold">Impact: {fate.impact}</div>
              </div>
            ))}
          </div>
        );
      case 'lieutenantFateQuestions':
        return (
          <div className="space-y-3 font-serif">
            {value.map((lieutenant: any, index: number) => (
              <div key={index} className="border border-orange-200 p-3 rounded">
                <div className="font-semibold text-orange-700 mb-2">{lieutenant.lieutenantName} ({lieutenant.lieutenantType})</div>
                <div className="space-y-2">
                  {lieutenant.fateQuestions.map((fate: any, fateIndex: number) => (
                    <div key={fateIndex} className="bg-orange-50 p-2 rounded border-l-2 border-orange-300">
                      <div className="text-xs font-semibold text-orange-800">{fate.question}</div>
                      <div className="text-xs text-orange-600">Roll: {fate.roll}</div>
                      <div className="text-sm text-gray-700">{fate.interpretation}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        );
      case 'clues':
        return (
          <div className="space-y-2 font-serif">
            {value.map((clue: string, index: number) => (
              <div key={index} className="bg-blue-50 p-2 rounded border-l-2 border-blue-300">
                <div className="text-sm font-semibold text-blue-700">Clue {index + 1}</div>
                <div className="text-sm text-gray-700">{clue}</div>
              </div>
            ))}
          </div>
        );
      case 'highTowerSurprise':
        return (
          <div className="bg-red-50 p-3 rounded border-l-2 border-red-300 font-serif">
            <div className="font-semibold text-red-700 mb-2">Plot Twist</div>
            <div className="text-sm text-gray-700 mb-2">{value.surprise}</div>
            <div className="bg-red-100 p-2 rounded mt-2">
              <div className="text-xs font-semibold text-red-800">Fate Question: {value.fateQuestion}</div>
              <div className="text-xs text-red-600">Roll: {value.roll}</div>
              <div className="text-sm text-gray-700">Interpretation: {value.interpretation}</div>
              <div className="text-sm font-semibold text-red-700 mt-1">Final Outcome: {value.finalOutcome}</div>
            </div>
          </div>
        );
      case 'minions':
        return (
          <div className="space-y-2 font-serif">
            {value.map((minion: any, index: number) => (
              <div key={index} className="bg-gray-100 p-2 rounded border-l-2 border-gray-400">
                <div className="font-semibold text-gray-700">{minion.type} ({minion.count})</div>
                <div className="text-sm text-gray-600">{minion.description}</div>
              </div>
            ))}
          </div>
        );
      case 'llmReasoning':
        return (
          <div className="space-y-3 font-serif">
            <div className="border-l-2 border-purple-300 pl-3">
              <div className="font-semibold text-purple-700" style={{ paddingTop: '6px' }}>Tarot Interpretation</div>
              <div className="text-sm text-gray-700">{value.tarotInterpretation}</div>
            </div>
            <div className="border-l-2 border-purple-300 pl-3">
              <div className="font-semibold text-purple-700">Race Selection Rationale</div>
              <div className="text-sm text-gray-700">{value.raceRationale}</div>
            </div>
            <div className="border-l-2 border-purple-300 pl-3">
              <div className="font-semibold text-purple-700">Goal Alignment</div>
              <div className="text-sm text-gray-700">{value.goalAlignment}</div>
            </div>
            <div className="border-l-2 border-purple-300 pl-3">
              <div className="font-semibold text-purple-700">Overall Coherence</div>
              <div className="text-sm text-gray-700">{value.overallCoherence}</div>
            </div>
          </div>
        );
      default:
        return <span className="font-serif font-semibold" style={{ paddingTop: '6px' }}>{value}</span>;
    }
  };

  return (
    <div className="flex h-full">
      {/* Step 1 - Left Panel */}
      <div className={`flex flex-col h-full flex-1 lg:border-r border-gray-300 lg:pr-3.5 ${mobileTab === 'step2' ? 'hidden lg:flex' : ''}`}>
        <div className="border-b border-gray-200 pb-4 flex-shrink-0">
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">Step 1</h2>
          <p className="text-gray-600 mb-4">Generate and edit basic information about your Villain.</p>
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
                Forging Villain...
              </>
            ) : (
              "Generate Basic Information"
            )}
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto min-h-0 mt-6">
          {generationData && (
            <div className="space-y-4 pr-2">
              {/* BBEG Section */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">BBEG (Big Bad Evil Guy)</h3>
                {GENERATION_STEPS.filter(step => step.category === 'bbeg').map((step) => {
                  let value = generationData[step.key as keyof GenerationResults];

                  // Handle special cases for LLM decisions
                  if (step.key === 'villainNameChoice') {
                    value = generationData.llmReasoning?.villainNameChoice || 'Name choice reasoning not yet generated';
                  }

                  const isGenerating = generatingStep === step.key;
                  const isEditing = editingField === step.key;

                  return (
                    <Card key={step.key} className="mb-3">
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
                          <div className={`flex gap-3 ${step.key === 'goal' || step.key === 'gender' || step.key === 'race' ? 'items-center justify-start' : 'items-start'}`}>
                            <div className="flex-1">
                              {renderStepValue(step, value)}
                            </div>
                            {step.key !== 'villainNameChoice' && (
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
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Lieutenant Section */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Lieutenants</h3>
                {GENERATION_STEPS.filter(step => step.category === 'lieutenant').map((step) => {
                  let value = generationData[step.key as keyof GenerationResults];

                  // Handle special cases for LLM decisions
                  if (step.key === 'lieutenantNameChoices') {
                    value = generationData.llmReasoning?.lieutenantNameChoices || 'Lieutenant name choices reasoning not yet generated';
                  }

                  const isGenerating = generatingStep === step.key;
                  const isEditing = editingField === step.key;

                  return (
                    <Card key={step.key} className="mb-3">
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
                          <div className={`flex gap-3 ${step.key === 'goal' || step.key === 'gender' || step.key === 'race' ? 'items-center justify-start' : 'items-start'}`}>
                            <div className="flex-1">
                              {renderStepValue(step, value)}
                            </div>
                            {step.key !== 'lieutenantNameChoices' && (
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
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Faction Section */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Faction</h3>
                {GENERATION_STEPS.filter(step => step.category === 'faction').map((step) => {
                  const value = generationData[step.key as keyof GenerationResults];
                  const isGenerating = generatingStep === step.key;
                  const isEditing = editingField === step.key;

                  return (
                    <Card key={step.key} className="mb-3">
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
                          <div className={`flex gap-3 ${step.key === 'goal' || step.key === 'gender' || step.key === 'race' ? 'items-center justify-start' : 'items-start'}`}>
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

              {/* Minions Section */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Minions</h3>
                {GENERATION_STEPS.filter(step => step.category === 'minion').map((step) => {
                  const value = generationData[step.key as keyof GenerationResults];
                  const isGenerating = generatingStep === step.key;
                  const isEditing = editingField === step.key;

                  return (
                    <Card key={step.key} className="mb-3">
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
                          <div className={`flex gap-3 ${step.key === 'goal' || step.key === 'gender' || step.key === 'race' ? 'items-center justify-start' : 'items-start'}`}>
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

              {/* Summary Section */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Summary</h3>
                {GENERATION_STEPS.filter(step => step.category === 'summary').map((step) => {
                  const value = generationData[step.key as keyof GenerationResults];
                  const isGenerating = generatingStep === step.key;
                  const isEditing = editingField === step.key;

                  return (
                    <Card key={step.key} className="mb-3">
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
                          <div className={`flex gap-3 ${step.key === 'goal' || step.key === 'gender' || step.key === 'race' ? 'items-center justify-start' : 'items-start'}`}>
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
                        {narrative.split('\n').map((line, index) => {
                          // Handle headers
                          if (line.startsWith('## ')) {
                            return (
                              <h3 key={index} className="text-lg font-bold text-gray-800 mt-6 mb-3 border-b border-gray-300 pb-1">
                                {line.replace('## ', '')}
                              </h3>
                            );
                          }
                          // Handle bullet points
                          if (line.startsWith('• ')) {
                            return (
                              <li key={index} className="ml-4 mb-1 text-sm text-gray-700">
                                {line.replace('• ', '')}
                              </li>
                            );
                          }
                          // Handle empty lines
                          if (line.trim() === '') {
                            return <div key={index} className="mb-2"></div>;
                          }
                          // Handle regular paragraphs
                          return (
                            <p key={index} className="mb-3 text-sm text-gray-700 leading-relaxed">
                              {line}
                            </p>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-gray-500 italic font-serif">
                        Click "Generate AI Narrative" to create rich storytelling content about this villain
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
