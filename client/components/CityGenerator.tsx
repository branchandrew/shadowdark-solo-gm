import { useState } from "react";
import TwoStepGeneratorLayout from './TwoStepGeneratorLayout';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  RefreshCw,
  Edit3,
  Copy
} from "lucide-react";

interface SteadingData {
  type: string;
  name: string;
  category?: string;
  nameVariations?: string[];
  population?: number;
  prosperity?: string;
  defences?: string;
  notable?: string[];
  problemsAndDangers?: string[];
  steading?: string;
  tags?: string[];
  resources?: string[];
  [key: string]: any;
}

const SETTLEMENT_TYPES = [
  { value: "Random", label: "Random" },
  { value: "Hamlet", label: "Hamlet" },
  { value: "Village", label: "Village" },
  { value: "City", label: "City" },
  { value: "Castle", label: "Castle" },
  { value: "Tower", label: "Tower" },
  { value: "Abbey", label: "Abbey" }
];

const ACTUAL_SETTLEMENT_TYPES = ["Hamlet", "Village", "City", "Castle", "Tower", "Abbey"];

const GENERATION_STEPS = [
  { key: 'name', label: 'Settlement Name', description: 'Generated using algorithmic name tables' },
  { key: 'type', label: 'Settlement Type', description: 'Type of settlement (Hamlet, Village, etc.)' },
  { key: 'category', label: 'Category', description: 'Civilian or Class settlement type' },
  { key: 'nameVariations', label: 'Name Variations', description: 'Alternative names and pronunciations' },
  { key: 'disposition', label: 'Disposition', description: 'Initial attitude toward strangers' },
  { key: 'descriptors', label: 'Mythic Descriptors', description: 'Descriptive qualities for narrative flavor' },

  // Hamlet-specific fields
  { key: 'mainBuilding', label: 'Main Building', description: 'Primary structure in hamlet' },
  { key: 'peasantHouses', label: 'Peasant Houses', description: 'Number of additional houses' },
  { key: 'totalBuildings', label: 'Total Buildings', description: 'Total number of structures' },
  { key: 'layout', label: 'Layout', description: 'Physical arrangement of buildings' },

  // Village-specific fields
  { key: 'size', label: 'Village Size', description: 'Size category of the village' },
  { key: 'population', label: 'Population', description: 'Number of inhabitants' },
  { key: 'occupation', label: 'Occupation', description: 'Primary economic activities' },
  { key: 'pointsOfInterest', label: 'Points of Interest', description: 'Notable locations in the settlement' },
  { key: 'buildingsOfInterest', label: 'Buildings of Interest', description: 'Important buildings where action takes place' },
  { key: 'defense', label: 'Defenses', description: 'Military protection and fortifications' },
  { key: 'ruler', label: 'Ruler', description: 'Who makes decisions in the settlement' },
  { key: 'rulerDisposition', label: 'Ruler Disposition', description: 'Ruler\'s attitude toward strangers' },
  { key: 'notableNPCs', label: 'Notable NPCs', description: 'Interesting characters in the settlement' },
  { key: 'events', label: 'Events', description: 'Current or upcoming events' },

  // Castle-specific fields
  { key: 'condition', label: 'Condition', description: 'Current state of the castle' },
  { key: 'keep', label: 'Keep Details', description: 'Central fortified structure information' },
  { key: 'defenses', label: 'Castle Defenses', description: 'Fortifications and military details' },

  // Tower-specific fields
  { key: 'levels', label: 'Tower Levels', description: 'Number and types of levels in the tower' },
  { key: 'connection', label: 'Connection', description: 'How the tower connects to other structures' },
  { key: 'appearance', label: 'Appearance', description: 'External appearance of the tower' },
  { key: 'insideAppearance', label: 'Inside Appearance', description: 'Interior appearance of the tower' },
  { key: 'specialEquipment', label: 'Special Equipment', description: 'Unusual equipment or features' },
  { key: 'levelUsage', label: 'Level Usage', description: 'How each level is used' },
  { key: 'inhabitants', label: 'Inhabitants', description: 'Who lives in the tower' },

  // Abbey-specific fields
  { key: 'abbeySize', label: 'Abbey Size', description: 'Small or Major abbey' },
  { key: 'abbeyPopulation', label: 'Population', description: 'Number of monks/nuns and abbot level' },
  { key: 'structureAndLand', label: 'Structure and Land', description: 'Physical layout and protection' },
  { key: 'coreLocations', label: 'Core Locations', description: 'Essential abbey buildings' },
  { key: 'additionalLocations', label: 'Additional Locations', description: 'Optional abbey areas' },
  { key: 'activities', label: 'Activities', description: 'What the abbey inhabitants do' },
  { key: 'fame', label: 'Fame', description: 'What the abbey is known for' },
  { key: 'history', label: 'History', description: 'Background of the abbey' },

  // Common fields
  { key: 'secret', label: 'Secret', description: 'Hidden truth about the settlement' },
] as const;

interface CityGeneratorProps {
  mobileTab?: 'step1' | 'step2';
}

export default function CityGenerator({ mobileTab = 'step1' }: CityGeneratorProps = {}) {
  const { toast } = useToast();
  const [selectedType, setSelectedType] = useState<string>("Random");
  const [actualGeneratedType, setActualGeneratedType] = useState<string | null>(null);
  const [steadingData, setSteadingData] = useState<SteadingData | null>(null);
  const [loading, setLoading] = useState(false);
  const [generatingStep, setGeneratingStep] = useState<string | null>(null);
  const [narrative, setNarrative] = useState<string>("");
  const [generatingNarrative, setGeneratingNarrative] = useState(false);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Record<string, string>>({});
  const [step1Complete, setStep1Complete] = useState(false);

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

  const generateStep1 = async () => {
    setLoading(true);
    setSteadingData(null);
    setNarrative("");
    setStep1Complete(false);
    setActualGeneratedType(null);

    try {
      // Determine the actual type to generate
      let typeToGenerate = selectedType;
      if (selectedType === "Random") {
        typeToGenerate = ACTUAL_SETTLEMENT_TYPES[Math.floor(Math.random() * ACTUAL_SETTLEMENT_TYPES.length)];
        setActualGeneratedType(typeToGenerate);
      }

      const response = await fetch("/api/generate-steading", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: typeToGenerate,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate settlement");
      }

      const data = await response.json();
      setSteadingData(data.steading);
      setStep1Complete(true);
    } catch (error) {
      console.error("Error generating settlement:", error);
      toast({
        title: "Generation failed",
        description: "Unable to generate settlement. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const regenerateStep = async (stepKey: string) => {
    if (!steadingData) return;

    setGeneratingStep(stepKey);

    try {
      const response = await fetch("/api/generate-steading-step", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          step: stepKey,
          currentSteading: steadingData,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to regenerate ${stepKey}. Status: ${response.status}`);
      }

      const data = await response.json();
      console.log(`Regeneration response for ${stepKey}:`, data);

      // Check if the response has the expected structure
      if (!data) {
        throw new Error(`No response data received for ${stepKey}`);
      }

      // Handle different possible response formats
      // The API returns the value as 'result', not 'stepValue'
      let newValue = data.result || data.stepValue;

      // If neither is present, try other common response formats
      if (newValue === undefined || newValue === null) {
        newValue = data[stepKey] || data.value;
      }

      // Handle empty arrays or empty strings as valid values
      if (newValue === undefined || newValue === null) {
        throw new Error(`No valid value in response for ${stepKey}. Response: ${JSON.stringify(data)}`);
      }

      // Handle empty arrays as valid (some fields like pointsOfInterest can be empty arrays)
      if (Array.isArray(newValue) && newValue.length === 0) {
        console.log(`${stepKey} regenerated with empty array - this is valid`);
      }

      // Handle empty strings as potentially valid depending on field type
      if (newValue === "" && typeof steadingData[stepKey] === "string") {
        console.log(`${stepKey} regenerated with empty string - this may be valid`);
      }

      // Only update if we have a valid new value
      setSteadingData({ ...steadingData, [stepKey]: newValue });

      toast({
        title: "Field regenerated",
        description: `Successfully regenerated ${stepKey}.`,
      });
    } catch (error) {
      console.error(`Error regenerating ${stepKey}:`, error);
      toast({
        title: "Regeneration failed",
        description: `Unable to regenerate ${stepKey}. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setGeneratingStep(null);
    }
  };

  const generateNarrative = async () => {
    if (!steadingData) return;

    setGeneratingNarrative(true);

    try {
      const response = await fetch("/api/generate-steading-narrative", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          steading: steadingData,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate narrative");
      }

      const data = await response.json();
      setNarrative(data.narrative);
    } catch (error) {
      console.error("Error generating narrative:", error);
      toast({
        title: "Narrative generation failed",
        description: "Unable to generate narrative. Please try again.",
        variant: "destructive",
      });
    } finally {
      setGeneratingNarrative(false);
    }
  };

  const handleEditStart = (stepKey: string, currentValue: any) => {
    setEditingField(stepKey);
    let editValue = '';

    switch (stepKey) {
      case 'nameVariations':
      case 'notableNPCs':
        editValue = Array.isArray(currentValue) ? currentValue.join(', ') : '';
        break;
      case 'pointsOfInterest':
        if (currentValue && typeof currentValue === 'object') {
          const special = Array.isArray(currentValue.special) ? currentValue.special.join(', ') : String(currentValue.special || '');
          editValue = `Special: ${special}`;
        }
        break;
      case 'defense':
        if (currentValue && typeof currentValue === 'object') {
          const features = Array.isArray(currentValue.features) ? currentValue.features.join(', ') : String(currentValue.features || '');
          editValue = `Features: ${features}\nGuards: ${currentValue.guards || ''}`;
        }
        break;
      case 'events':
        if (currentValue && typeof currentValue === 'object') {
          editValue = `Event: ${currentValue.event || ''}\nTiming: ${currentValue.timing || ''}`;
        }
        break;
      case 'population':
        if (currentValue && typeof currentValue === 'object') {
          editValue = Object.entries(currentValue)
            .map(([key, val]) => `${key.replace(/([A-Z])/g, ' $1').trim()}: ${val}`)
            .join('\n');
        } else {
          editValue = String(currentValue || '');
        }
        break;
      case 'abbeyPopulation':
        if (currentValue && typeof currentValue === 'object') {
          editValue = Object.entries(currentValue)
            .map(([key, val]) => `${key.replace(/([A-Z])/g, ' $1').trim()}: ${val}`)
            .join('\\n');
        } else {
          editValue = String(currentValue || '');
        }
        break;
      default:
        editValue = String(currentValue || '');
    }

    setEditValues({ ...editValues, [stepKey]: editValue });
  };

  const handleEditSave = (stepKey: string) => {
    if (!steadingData || !editValues[stepKey]) return;

    const editValue = editValues[stepKey];
    let updatedValue: any = editValue;

    switch (stepKey) {
      case 'nameVariations':
      case 'notableNPCs':
        updatedValue = editValue.split(',').map(item => item.trim()).filter(item => item);
        break;
      case 'peasantHouses':
      case 'totalBuildings':
        updatedValue = parseInt(editValue) || 0;
        break;
      case 'pointsOfInterest':
        // Parse the edited text back into structure
        const lines = editValue.split('\n');
        const specialLine = lines.find(line => line.startsWith('Special:'))?.replace('Special:', '').trim() || '';

        const special = specialLine.split(',').map(s => s.trim()).filter(s => s);
        updatedValue = { special };
        break;
      case 'defense':
        // Parse the edited text back into structure
        const defenseLines = editValue.split('\n');
        const defenseObj: any = {};

        // Parse features (for villages)
        const featuresLine = defenseLines.find(line => line.startsWith('Features:'));
        if (featuresLine) {
          defenseObj.features = featuresLine.replace('Features:', '').trim().split(',').map(s => s.trim()).filter(s => s);
        }

        // Parse walls (for cities)
        const wallsLine = defenseLines.find(line => line.startsWith('Walls:'));
        if (wallsLine) {
          const wallsText = wallsLine.replace('Walls:', '').trim().toLowerCase();
          defenseObj.walled = wallsText.includes('walled') || wallsText.includes('yes');
        }

        // Parse entrances (for cities)
        const entrancesLine = defenseLines.find(line => line.startsWith('Entrances:'));
        if (entrancesLine) {
          defenseObj.entrances = entrancesLine.replace('Entrances:', '').trim().split(';').map(s => s.trim()).filter(s => s);
        }

        // Parse siege supplies (for cities)
        const suppliesLine = defenseLines.find(line => line.startsWith('Siege Supplies:'));
        if (suppliesLine) {
          defenseObj.siegeSupplies = suppliesLine.replace('Siege Supplies:', '').trim();
        }

        // Parse guards (for all)
        const guardsLine = defenseLines.find(line => line.startsWith('Guards:'));
        if (guardsLine) {
          defenseObj.guards = parseInt(guardsLine.replace('Guards:', '').trim() || '0') || 0;
        }

        updatedValue = defenseObj;
        break;
      case 'events':
        // Parse the edited text back into structure
        const eventLines = editValue.split('\n');
        const event = eventLines.find(line => line.startsWith('Event:'))?.replace('Event:', '').trim() || '';
        const timing = eventLines.find(line => line.startsWith('Timing:'))?.replace('Timing:', '').trim() || '';
        updatedValue = { event, timing };
        break;
      case 'population':
        // Parse the edited text back into object structure
        const popLines = editValue.split('\n').filter(line => line.trim());
        const popObject: any = {};
        popLines.forEach(line => {
          const colonIndex = line.indexOf(':');
          if (colonIndex !== -1) {
            const key = line.substring(0, colonIndex).trim().replace(/\s+/g, '');
            const value = line.substring(colonIndex + 1).trim();
            // Try to convert to number if it looks like a number
            popObject[key] = isNaN(Number(value)) ? value : Number(value);
          }
        });
        updatedValue = Object.keys(popObject).length > 0 ? popObject : editValue;
        break;
      case 'abbeyPopulation':
        // Parse the edited text back into object structure
        const abbeyPopLines = editValue.split('\\n').filter(line => line.trim());
        const abbeyPopObject: any = {};
        abbeyPopLines.forEach(line => {
          const colonIndex = line.indexOf(':');
          if (colonIndex !== -1) {
            const key = line.substring(0, colonIndex).trim().replace(/\\s+/g, '');
            const value = line.substring(colonIndex + 1).trim();
            // Try to convert to number if it looks like a number
            abbeyPopObject[key] = isNaN(Number(value)) ? value : Number(value);
          }
        });
        updatedValue = Object.keys(abbeyPopObject).length > 0 ? abbeyPopObject : editValue;
        break;
      case 'descriptors':
        // Parse the edited text back into descriptor structure
        const descLines = editValue.split('\n').filter(line => line.trim());
        if (descLines.length >= 2) {
          const description = descLines[0].trim();
          const secondLine = descLines[1].replace(/[()]/g, ''); // Remove parentheses
          const adverbMatch = secondLine.match(/Adverb:\s*([^,]+)/);
          const adjectiveMatch = secondLine.match(/Adjective:\s*(.+)/);

          if (adverbMatch && adjectiveMatch) {
            updatedValue = {
              description,
              adverb: adverbMatch[1].trim(),
              adjective: adjectiveMatch[1].trim()
            };
          } else {
            updatedValue = editValue;
          }
        } else {
          updatedValue = editValue;
        }
        break;
      default:
        updatedValue = editValue;
    }

    setSteadingData({ ...steadingData, [stepKey]: updatedValue });
    setEditingField(null);
  };

  const handleEditCancel = () => {
    setEditingField(null);
  };

  const handleCopyField = async (stepKey: string, value: any) => {
    let textToCopy = '';

    switch (stepKey) {
      case 'nameVariations':
      case 'notableNPCs':
        textToCopy = Array.isArray(value) ? value.join(', ') : String(value);
        break;
      case 'pointsOfInterest':
        if (value && typeof value === 'object') {
          const general = value.general && typeof value.general === 'object' && !Array.isArray(value.general)
            ? Object.entries(value.general)
                .map(([key, count]) => `${count} ${key.replace(/_/g, ' ')}`)
                .join(', ')
            : Array.isArray(value.general)
              ? value.general.join(', ')
              : String(value.general || '');

          const special = Array.isArray(value.special)
            ? value.special.map((item: any) =>
                typeof item === 'object'
                  ? `${item.location} (${item.descriptors?.description || ''})`
                  : item
              ).join('\n')
            : String(value.special || '');

          textToCopy = `General: ${general}\n\nSpecial:\n${special}`;
        } else {
          textToCopy = String(value);
        }
        break;
      case 'buildingsOfInterest':
        if (Array.isArray(value)) {
          textToCopy = value.map((item: any) =>
            typeof item === 'object'
              ? `${item.building} (${item.descriptors?.description || ''})`
              : item
          ).join('\n');
        } else {
          textToCopy = String(value);
        }
        break;
      case 'defense':
        if (value && typeof value === 'object') {
          const parts: string[] = [];

          if (Array.isArray(value.features) && value.features.length > 0) {
            parts.push(`Features: ${value.features.join(', ')}`);
          }

          if (typeof value.walled !== 'undefined') {
            parts.push(`Walls: ${value.walled ? 'Walled city' : 'No walls'}`);
          }

          if (Array.isArray(value.entrances) && value.entrances.length > 0) {
            parts.push(`Entrances: ${value.entrances.join('; ')}`);
          }

          if (value.siegeSupplies) {
            parts.push(`Siege Supplies: ${value.siegeSupplies}`);
          }

          parts.push(`Guards: ${value.guards || 0}`);

          textToCopy = parts.join('\n');
        } else {
          textToCopy = String(value);
        }
        break;
      case 'events':
        if (value && typeof value === 'object') {
          textToCopy = `Event: ${value.event || ''}\nTiming: ${value.timing || ''}`;
        } else {
          textToCopy = String(value);
        }
        break;
      case 'population':
        if (value && typeof value === 'object') {
          textToCopy = Object.entries(value)
            .map(([key, val]) => `${key.replace(/([A-Z])/g, ' $1').trim()}: ${val}`)
            .join('\n');
        } else {
          textToCopy = String(value);
        }
        break;
      case 'abbeyPopulation':
        if (value && typeof value === 'object') {
          textToCopy = Object.entries(value)
            .map(([key, val]) => `${key.replace(/([A-Z])/g, ' $1').trim()}: ${val}`)
            .join('\\n');
        } else {
          textToCopy = String(value);
        }
        break;
      case 'descriptors':
        if (value && typeof value === 'object') {
          textToCopy = `${value.description}\n(Adverb: ${value.adverb}, Adjective: ${value.adjective})`;
        } else {
          textToCopy = String(value);
        }
        break;
      case 'levelUsage':
        if (value && typeof value === 'object') {
          const parts: string[] = [];
          if (value.ground) parts.push(`Ground: ${value.ground}`);
          if (value.top) parts.push(`Top: ${value.top}`);
          if (value.aboveground && value.aboveground.length > 0) {
            parts.push(`Aboveground:\\n${value.aboveground.map((usage: string, index: number) => `  Level ${index + 1}: ${usage}`).join('\\n')}`);
          }
          if (value.underground && value.underground.length > 0) {
            parts.push(`Underground:\\n${value.underground.map((usage: string, index: number) => `  B${index + 1}: ${usage}`).join('\\n')}`);
          }
          if (value.bottom) parts.push(`Bottom: ${value.bottom}`);
          textToCopy = parts.join('\\n\\n');
        } else {
          textToCopy = String(value);
        }
        break;
      case 'inhabitants':
        if (value && typeof value === 'object') {
          const parts: string[] = [];
          if (value.wizardLevel) parts.push(`Wizard Level: ${value.wizardLevel}`);
          if (value.apprenticeLevel) parts.push(`Apprentice Level: ${value.apprenticeLevel}`);
          if (value.monksNuns) parts.push(`Monks/Nuns: ${value.monksNuns}`);
          if (value.abbotLevel) parts.push(`Abbot Level: ${value.abbotLevel}`);
          textToCopy = parts.join('\\n');
        } else {
          textToCopy = String(value);
        }
        break;
      case 'appearance':
        if (value && typeof value === 'object') {
          const parts: string[] = [];
          parts.push(`Material: ${value.material}`);
          parts.push(`Shape: ${value.shape}`);
          if (value.details && value.details.length > 0) {
            parts.push(`Details:\n${value.details.map((d: string) => `• ${d}`).join('\n')}`);
          }
          textToCopy = parts.join('\n');
        } else {
          textToCopy = String(value);
        }
        break;
      case 'structureAndLand':
        if (value && typeof value === 'object') {
          const parts: string[] = [];
          parts.push(`Protection: ${value.protection}`);
          parts.push(`Outside Walls: ${value.outsideWalls}`);
          parts.push(`Area Within Walls: ${value.areaWithinWalls}`);
          textToCopy = parts.join('\n');
        } else {
          textToCopy = String(value);
        }
        break;
      case 'additionalLocations':
        if (value && typeof value === 'object') {
          const parts: string[] = [];
          if (value.garden && value.garden.length > 0) {
            parts.push(`Garden:\n${value.garden.map((item: string) => `• ${item}`).join('\n')}`);
          }
          if (value.infirmary && value.infirmary.length > 0) {
            parts.push(`Infirmary:\n${value.infirmary.map((item: string) => `• ${item}`).join('\n')}`);
          }
          if (value.religious && value.religious.length > 0) {
            parts.push(`Religious:\n${value.religious.map((item: string) => `• ${item}`).join('\n')}`);
          }
          if (value.other && value.other.length > 0) {
            parts.push(`Other:\n${value.other.map((item: string) => `• ${item}`).join('\n')}`);
          }
          textToCopy = parts.join('\n\n');
        } else {
          textToCopy = String(value);
        }
        break;
      case 'activities':
        if (value && typeof value === 'object') {
          const parts: string[] = [];
          if (value.farming && value.farming.length > 0) {
            parts.push(`Farming:\n${value.farming.map((item: string) => `• ${item}`).join('\n')}`);
          }
          if (value.workshop && value.workshop.length > 0) {
            parts.push(`Workshop:\n${value.workshop.map((item: string) => `• ${item}`).join('\n')}`);
          }
          if (value.other && value.other.length > 0) {
            parts.push(`Other:\n${value.other.map((item: string) => `• ${item}`).join('\n')}`);
          }
          textToCopy = parts.join('\n\n');
        } else {
          textToCopy = String(value);
        }
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
        description: "Settlement narrative has been successfully copied.",
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
            rows={4}
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
      case 'nameVariations':
      case 'notableNPCs':
        if (Array.isArray(value)) {
          return (
            <div className="flex flex-wrap gap-2">
              {value.map((item: string, index: number) => (
                <Badge key={index} variant="outline" className="text-sm font-serif">
                  {item}
                </Badge>
              ))}
            </div>
          );
        }
        return <span className="font-serif font-semibold" style={{ paddingTop: '6px' }}>{String(value)}</span>;

      case 'condition':
        return (
          <div className="font-serif">
            <span className="font-semibold text-gray-800">{value}</span>
          </div>
        );

      case 'keep':
        if (value && typeof value === 'object') {
          return (
            <div className="space-y-3 font-serif text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div><span className="font-semibold">Shape:</span> {value.shape}</div>
                <div><span className="font-semibold">Levels:</span> {value.levels}</div>
              </div>
              <div>
                <span className="font-semibold">Defensive Feature:</span> {value.defensiveFeature}
              </div>
              <div>
                <span className="font-semibold">Non-Defensive Feature:</span> {value.nonDefensiveFeature}
              </div>
              {value.jails && (
                <div className="border-t pt-2">
                  <div className="font-semibold mb-1">Jails:</div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>Commoners: {value.jails.commoners}</div>
                    <div>Nobles: {value.jails.nobles}</div>
                  </div>
                </div>
              )}
              <div>
                <span className="font-semibold">Siege Supplies:</span> {value.siegeSupplies} months
              </div>
              {value.treasure && Object.keys(value.treasure).length > 0 && (
                <div className="border-t pt-2">
                  <div className="font-semibold mb-1">Treasure:</div>
                  <div className="space-y-1 text-xs">
                    {Object.entries(value.treasure).map(([key, val]: [string, any]) => (
                      <div key={key}>
                        {key === 'gold' ? `${val.toLocaleString()} gp` :
                         key === 'additionalGold' ? `${val.toLocaleString()} gp (additional)` :
                         key === 'gems' ? `${val} gems` :
                         key === 'jewelry' ? `${val} pieces of jewelry` :
                         key === 'magicItems' ? `${val} magic items` :
                         key === 'scrolls' ? `${val} scrolls` :
                         `${key}: ${val}`}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        }
        return <span className="font-serif">{String(value)}</span>;

      case 'defenses':
        if (value && typeof value === 'object') {
          return (
            <div className="space-y-3 font-serif text-sm">
              {value.features && value.features.length > 0 && (
                <div>
                  <span className="font-semibold">Defense Features:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {value.features.map((feature: string, index: number) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {value.walls && (
                <div className="border-t pt-2">
                  <div className="font-semibold mb-1">Walls & Towers:</div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>Shape: {value.walls.shape}</div>
                    <div>Towers: {value.walls.towers} ({value.walls.towerShape})</div>
                    <div>Defensive: {value.walls.defensiveFeature}</div>
                    <div>Non-Defensive: {value.walls.nonDefensiveFeature}</div>
                  </div>
                </div>
              )}
              {value.gatehouse && (
                <div className="border-t pt-2">
                  <div className="font-semibold mb-1">Gatehouse:</div>
                  <div className="text-xs">
                    <div>Closure: {value.gatehouse.closure}</div>
                    <div>Towers: {value.gatehouse.towers}</div>
                  </div>
                </div>
              )}
              {value.moatEncounter && (
                <div className="border-t pt-2">
                  <div className="font-semibold mb-1">Moat Encounter:</div>
                  <div className="text-xs">{value.moatEncounter}</div>
                </div>
              )}
              {value.garrison && (
                <div className="border-t pt-2">
                  <div className="font-semibold mb-1">Garrison:</div>
                  <div className="space-y-1 text-xs">
                    <div>Total Fighters: {value.garrison.totalFighters}</div>
                    <div>Lord Level: {value.garrison.lordLevel}</div>
                    <div>Lieutenant Level: {value.garrison.lieutenantLevel}</div>
                    <div>Bodyguard Level: {value.garrison.bodyguardLevel} ({value.garrison.bodyguards} bodyguards)</div>
                    <div className="grid grid-cols-2 gap-1 mt-2">
                      <div>Heavy Cavalry: {value.garrison.cavaliersHeavy}</div>
                      <div>Medium Cavalry (Spear): {value.garrison.cavaliersMediumSpear}</div>
                      <div>Medium Cavalry (Bow): {value.garrison.cavaliersMediumBow}</div>
                      <div>Footmen (Sword): {value.garrison.footmenSword}</div>
                      <div>Footmen (Polearm): {value.garrison.footmenPolearm}</div>
                      <div>Footmen (Crossbow): {value.garrison.footmenCrossbow}</div>
                      <div>Footmen (Longbow): {value.garrison.footmenLongbow}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        }
        return <span className="font-serif">{String(value)}</span>;

      case 'pointsOfInterest':
        if (value && typeof value === 'object') {
          return (
            <div className="space-y-2 font-serif">
              <div className="border-l-2 border-green-300 pl-3">
                <div className="font-semibold text-green-700">Special</div>
                <div className="text-sm text-gray-700 space-y-1">
                  {Array.isArray(value.special) ?
                    value.special.map((item: any, index: number) => (
                      <div key={index} className="bg-green-50 p-2 rounded border">
                        <div className="font-medium text-green-800">
                          {typeof item === 'object' ? item.location : item}
                        </div>
                        {typeof item === 'object' && item.descriptors && (
                          <div className="text-xs text-green-600 mt-1">
                            <span className="font-semibold">{item.descriptors.description}</span>
                            <span className="text-gray-500"> ({item.descriptors.adverb} + {item.descriptors.adjective})</span>
                          </div>
                        )}
                      </div>
                    )) :
                    String(value.special || '')
                  }
                </div>
              </div>
            </div>
          );
        }
        return <span className="font-serif font-semibold" style={{ paddingTop: '6px' }}>{String(value)}</span>;

      case 'buildingsOfInterest':
        if (Array.isArray(value)) {
          return (
            <div className="space-y-2 font-serif">
              {value.map((item: any, index: number) => (
                <div key={index} className="bg-yellow-50 p-3 rounded border-l-2 border-yellow-300">
                  <div className="font-medium text-yellow-800">
                    {typeof item === 'object' ? item.building : item}
                  </div>
                  {typeof item === 'object' && item.descriptors && (
                    <div className="text-xs text-yellow-600 mt-1">
                      <span className="font-semibold">{item.descriptors.description}</span>
                      <span className="text-gray-500"> ({item.descriptors.adverb} + {item.descriptors.adjective})</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          );
        }
        return <span className="font-serif font-semibold" style={{ paddingTop: '6px' }}>{String(value)}</span>;

      case 'defense':
        if (value && typeof value === 'object') {
          return (
            <div className="space-y-2 font-serif">
              {/* Features (for villages) */}
              {Array.isArray(value.features) && value.features.length > 0 && (
                <div className="border-l-2 border-red-300 pl-3">
                  <div className="font-semibold text-red-700">Features</div>
                  <div className="text-sm text-gray-700">
                    {value.features.join(', ')}
                  </div>
                </div>
              )}

              {/* Walls info (for cities) */}
              {typeof value.walled !== 'undefined' && (
                <div className="border-l-2 border-red-300 pl-3">
                  <div className="font-semibold text-red-700">Walls</div>
                  <div className="text-sm text-gray-700">
                    {value.walled ? 'Walled city' : 'No walls'}
                  </div>
                </div>
              )}

              {/* Entrances (for walled cities) */}
              {Array.isArray(value.entrances) && value.entrances.length > 0 && (
                <div className="border-l-2 border-red-300 pl-3">
                  <div className="font-semibold text-red-700">Entrances</div>
                  <div className="text-sm text-gray-700">
                    {value.entrances.join('; ')}
                  </div>
                </div>
              )}

              {/* Siege supplies (for walled cities) */}
              {value.siegeSupplies && (
                <div className="border-l-2 border-red-300 pl-3">
                  <div className="font-semibold text-red-700">Siege Supplies</div>
                  <div className="text-sm text-gray-700">{value.siegeSupplies}</div>
                </div>
              )}

              {/* Guards (for all settlements) */}
              <div className="border-l-2 border-red-300 pl-3">
                <div className="font-semibold text-red-700">Guards</div>
                <div className="text-sm text-gray-700">{value.guards || 0} guards</div>
              </div>
            </div>
          );
        }
        return <span className="font-serif font-semibold" style={{ paddingTop: '6px' }}>{String(value)}</span>;

      case 'events':
        if (value && typeof value === 'object') {
          return (
            <div className="bg-yellow-50 p-3 rounded border-l-2 border-yellow-300 font-serif">
              <div className="font-semibold text-yellow-700">Event</div>
              <div className="text-sm text-gray-700">{String(value.event || '')}</div>
              <div className="text-xs text-yellow-600 mt-1">Timing: {String(value.timing || '')}</div>
            </div>
          );
        }
        return <span className="font-serif font-semibold" style={{ paddingTop: '6px' }}>{String(value)}</span>;

      case 'population':
        if (value && typeof value === 'object') {
          return (
            <div className="space-y-1 font-serif">
              {Object.entries(value).map(([key, val], index) => (
                <div key={index} className="border-l-2 border-indigo-300 pl-3">
                  <div className="font-semibold text-indigo-700 capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </div>
                  <div className="text-sm text-gray-700">{String(val)}</div>
                </div>
              ))}
            </div>
          );
        }
        return <span className="font-serif font-semibold" style={{ paddingTop: '6px' }}>{String(value)}</span>;

      case 'abbeySize':
        return (
          <div className="font-serif">
            <span className="font-semibold text-gray-800">{value}</span>
            {value === 'Major' && <span className="text-sm text-gray-600 ml-2">(Can own religious artifact)</span>}
          </div>
        );

      case 'abbeyPopulation':
        if (value && typeof value === 'object') {
          return (
            <div className="space-y-1 font-serif">
              {Object.entries(value).map(([key, val], index) => (
                <div key={index} className="border-l-2 border-indigo-300 pl-3">
                  <div className="font-semibold text-indigo-700 capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </div>
                  <div className="text-sm text-gray-700">{String(val)}</div>
                </div>
              ))}
            </div>
          );
        }
        return <span className="font-serif font-semibold" style={{ paddingTop: '6px' }}>{String(value)}</span>;

      case 'descriptors':
        if (value && typeof value === 'object') {
          return (
            <div className="bg-purple-50 p-3 rounded border-l-2 border-purple-300 font-serif">
              <div className="font-semibold text-purple-700 text-lg">{value.description}</div>
              <div className="text-sm text-purple-600 mt-1">
                <span className="font-medium">Adverb:</span> {value.adverb} • <span className="font-medium">Adjective:</span> {value.adjective}
              </div>
              <div className="text-xs text-gray-600 mt-2">Use these qualities to flavor the settlement's narrative and atmosphere</div>
            </div>
          );
        }
        return <span className="font-serif font-semibold" style={{ paddingTop: '6px' }}>{String(value)}</span>;

      case 'levelUsage':
        if (value && typeof value === 'object') {
          return (
            <div className="space-y-2 font-serif text-sm">
              <div><span className="font-semibold">Ground Level:</span> {value.ground}</div>
              <div><span className="font-semibold">Top Level:</span> {value.top}</div>
              {value.aboveground && value.aboveground.length > 0 && (
                <div>
                  <span className="font-semibold">Aboveground Levels:</span>
                  <div className="ml-2 space-y-1">
                    {value.aboveground.map((usage: string, index: number) => (
                      <div key={index} className="text-xs">Level {index + 1}: {usage}</div>
                    ))}
                  </div>
                </div>
              )}
              {value.underground && value.underground.length > 0 && (
                <div>
                  <span className="font-semibold">Underground Levels:</span>
                  <div className="ml-2 space-y-1">
                    {value.underground.map((usage: string, index: number) => (
                      <div key={index} className="text-xs">B{index + 1}: {usage}</div>
                    ))}
                  </div>
                </div>
              )}
              {value.bottom && (
                <div><span className="font-semibold">Bottom Level:</span> {value.bottom}</div>
              )}
            </div>
          );
        }
        return <span className="font-serif">{String(value)}</span>;

      case 'inhabitants':
        if (value && typeof value === 'object') {
          return (
            <div className="space-y-1 font-serif text-sm">
              {value.wizardLevel && (
                <div><span className="font-semibold">Wizard Level:</span> {value.wizardLevel}</div>
              )}
              {value.apprenticeLevel && (
                <div><span className="font-semibold">Apprentice Level:</span> {value.apprenticeLevel}</div>
              )}
              {value.monksNuns && (
                <div><span className="font-semibold">Monks/Nuns:</span> {value.monksNuns}</div>
              )}
              {value.abbotLevel && (
                <div><span className="font-semibold">Abbot Level:</span> {value.abbotLevel}</div>
              )}
            </div>
          );
        }
        return <span className="font-serif">{String(value)}</span>;

      case 'appearance':
        if (value && typeof value === 'object') {
          return (
            <div className="space-y-2 font-serif text-sm">
              <div><span className="font-semibold">Material:</span> {value.material}</div>
              <div><span className="font-semibold">Shape:</span> {value.shape}</div>
              {value.details && value.details.length > 0 && (
                <div>
                  <span className="font-semibold">Details:</span>
                  <div className="ml-2 space-y-1">
                    {value.details.map((detail: string, index: number) => (
                      <div key={index} className="text-xs bg-gray-50 p-1 rounded border">• {detail}</div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        }
        return <span className="font-serif">{String(value)}</span>;

      case 'structureAndLand':
        if (value && typeof value === 'object') {
          return (
            <div className="space-y-2 font-serif text-sm">
              <div><span className="font-semibold">Protection:</span> {value.protection}</div>
              <div><span className="font-semibold">Outside Walls:</span> {value.outsideWalls}</div>
              <div><span className="font-semibold">Area Within Walls:</span> {value.areaWithinWalls}</div>
            </div>
          );
        }
        return <span className="font-serif">{String(value)}</span>;

      case 'additionalLocations':
        if (value && typeof value === 'object') {
          return (
            <div className="space-y-3 font-serif text-sm">
              {value.garden && value.garden.length > 0 && (
                <div className="border-l-2 border-green-300 pl-3">
                  <div className="font-semibold text-green-700">Garden</div>
                  <div className="space-y-1">
                    {value.garden.map((item: string, index: number) => (
                      <div key={index} className="text-xs bg-green-50 p-1 rounded border">• {item}</div>
                    ))}
                  </div>
                </div>
              )}
              {value.infirmary && value.infirmary.length > 0 && (
                <div className="border-l-2 border-red-300 pl-3">
                  <div className="font-semibold text-red-700">Infirmary</div>
                  <div className="space-y-1">
                    {value.infirmary.map((item: string, index: number) => (
                      <div key={index} className="text-xs bg-red-50 p-1 rounded border">• {item}</div>
                    ))}
                  </div>
                </div>
              )}
              {value.religious && value.religious.length > 0 && (
                <div className="border-l-2 border-blue-300 pl-3">
                  <div className="font-semibold text-blue-700">Religious</div>
                  <div className="space-y-1">
                    {value.religious.map((item: string, index: number) => (
                      <div key={index} className="text-xs bg-blue-50 p-1 rounded border">• {item}</div>
                    ))}
                  </div>
                </div>
              )}
              {value.other && value.other.length > 0 && (
                <div className="border-l-2 border-gray-300 pl-3">
                  <div className="font-semibold text-gray-700">Other</div>
                  <div className="space-y-1">
                    {value.other.map((item: string, index: number) => (
                      <div key={index} className="text-xs bg-gray-50 p-1 rounded border">• {item}</div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        }
        return <span className="font-serif">{String(value)}</span>;

      case 'activities':
        if (value && typeof value === 'object') {
          return (
            <div className="space-y-3 font-serif text-sm">
              {value.farming && value.farming.length > 0 && (
                <div className="border-l-2 border-yellow-300 pl-3">
                  <div className="font-semibold text-yellow-700">Farming</div>
                  <div className="space-y-1">
                    {value.farming.map((item: string, index: number) => (
                      <div key={index} className="text-xs bg-yellow-50 p-1 rounded border">• {item}</div>
                    ))}
                  </div>
                </div>
              )}
              {value.workshop && value.workshop.length > 0 && (
                <div className="border-l-2 border-purple-300 pl-3">
                  <div className="font-semibold text-purple-700">Workshop</div>
                  <div className="space-y-1">
                    {value.workshop.map((item: string, index: number) => (
                      <div key={index} className="text-xs bg-purple-50 p-1 rounded border">• {item}</div>
                    ))}
                  </div>
                </div>
              )}
              {value.other && value.other.length > 0 && (
                <div className="border-l-2 border-gray-300 pl-3">
                  <div className="font-semibold text-gray-700">Other</div>
                  <div className="space-y-1">
                    {value.other.map((item: string, index: number) => (
                      <div key={index} className="text-xs bg-gray-50 p-1 rounded border">• {item}</div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        }
        return <span className="font-serif">{String(value)}</span>;

      default:
        return <span className="font-serif font-semibold" style={{ paddingTop: '6px' }}>{String(value)}</span>;
    }
  };

  return (
    <div className="flex h-full">
      {/* Step 1 - Left Panel */}
      <div className={`flex flex-col h-full flex-1 lg:border-r border-gray-300 lg:pr-3.5 ${mobileTab === 'step2' ? 'hidden lg:flex' : ''}`}>
        <div className="border-b border-gray-200 pb-4 flex-shrink-0">
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">Step 1</h2>
          <p className="text-gray-600 mb-4">Generate and edit basic information about your Settlement.</p>

          {/* Show randomly selected type */}
          {selectedType === "Random" && actualGeneratedType && (
            <div className="mb-4 p-2 bg-blue-50 border border-blue-200 rounded-md">
              <span className="text-sm text-blue-700 font-semibold">
                Randomly selected: {actualGeneratedType}
              </span>
            </div>
          )}
          
          {/* Settlement Type Selector */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4">
            <div className="flex-shrink-0">
              <Select value={selectedType} onValueChange={(value) => {
                setSelectedType(value);
                setActualGeneratedType(null);
              }}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select settlement type" />
                </SelectTrigger>
                <SelectContent>
                  {SETTLEMENT_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
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
                  Generating Settlement...
                </>
              ) : (
                `Generate ${selectedType === "Random" ? "Random Settlement" : selectedType}`
              )}
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto min-h-0 mt-6">
          {steadingData && (
            <div className="space-y-4 pr-2">
              {GENERATION_STEPS.filter((step) => {
                const value = steadingData[step.key as keyof SteadingData];
                // Only show fields that actually have values and are relevant to this settlement type
                return value !== undefined && value !== null && value !== '';
              }).map((step) => {
                const value = steadingData[step.key as keyof SteadingData];
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
                        <div className={`flex gap-3 ${step.key === 'name' || step.key === 'category' || step.key === 'population' ? 'items-center justify-start' : 'items-start'}`}>
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
                        Click "Generate AI Narrative" to create rich storytelling content about this settlement
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
