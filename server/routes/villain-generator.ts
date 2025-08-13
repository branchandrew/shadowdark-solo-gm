import { RequestHandler } from "express";
import Anthropic from "@anthropic-ai/sdk";
import { getGlobalNarrativeRestrictions } from "../lib/llm-instructions.js";
import { relationalDB } from "../lib/relational-database";
import {
  generateNames as generateNamesTS,
  isValidAlignment,
} from "../lib/name-generator";
import {
  generateNamesWithIntelligentLanguageChoice,
  generateSingleIntelligentName
} from "../lib/intelligent-name-generator.js";
import {
  getRandomLieutenantTypes,
  getVillainTypes,
  generateAdventureSeeds,
  SHADOWDARK_VILLAIN_TYPES,
} from "../lib/adventure-utilities";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY ?? "",
});

interface VillainGenerationRequest {
  generateAll?: boolean;
  regenerateStep?: string;
  currentVillain?: any;
  generateNarrative?: boolean;
  villain?: any;
  generateIntermediateSteps?: boolean;
  regenerateIntermediateStep?: string;
  currentGenerationData?: any;
  generateVillainFromSteps?: boolean;
  generationData?: any;
}

interface Lieutenant {
  name: string;
  description: string;
  minions?: string;
}

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

interface GeneratedVillain {
  name: string;
  villainType: string;
  motivation: string;
  hook: string;
  detailedDescription: string;
  faction: {
    name: string;
    description: string;
  };
  lieutenants: Lieutenant[];
  minions: string;
  powerLevel: string;
  weaknesses: string[];
  resources: string[];
}

/**
 * Generates names using the TypeScript name generation implementation
 */
const generateNames = (
  alignment: number,
  numNames: number,
): Promise<{ success: boolean; names?: string[]; error?: string }> => {
  try {
    if (!isValidAlignment(alignment)) {
      return Promise.resolve({
        success: false,
        error: "Alignment must be between 1 and 4",
      });
    }

    const result = generateNamesTS(alignment, numNames);
    return Promise.resolve(result);
  } catch (error) {
    return Promise.resolve({
      success: false,
      error: error instanceof Error ? error.message : "Name generation failed",
    });
  }
};

/**
 * Gets random lieutenant types
 */
const getLieutenantTypes = (count: number = 2) => {
  try {
    const result = getRandomLieutenantTypes(count);
    return Promise.resolve(result);
  } catch (error) {
    return Promise.resolve({
      success: false,
      error: error instanceof Error ? error.message : "Lieutenant types generation failed",
    });
  }
};

/**
 * Gets a random villain type
 */
const getRandomVillainType = (): string => {
  const randomIndex = Math.floor(Math.random() * SHADOWDARK_VILLAIN_TYPES.length);
  return SHADOWDARK_VILLAIN_TYPES[randomIndex];
};

/**
 * Generates intermediate steps with complete villain generation process
 */
const generateIntermediateSteps = async (): Promise<GenerationResults> => {
  // Get tarot spread for inspiration
  const adventureSeeds = generateAdventureSeeds();

  // Generate villain names using intelligent language selection
  const nameResult = await generateNamesWithIntelligentLanguageChoice({
    characterType: "villain",
    race: adventureSeeds.race,
    goal: adventureSeeds.goal,
    description: "A main antagonist/villain for the campaign"
  }, 6);
  const villainNames = nameResult.success ? nameResult.names : ["Malachar", "Zygrath", "Nethys", "Vorthak", "Xantheus", "Balthazor"];

  // Generate lieutenant types
  const lieutenantResult = await getLieutenantTypes(2);
  const lieutenantTypes = lieutenantResult.success ?
    lieutenantResult.lieutenant_types : ["Assassin", "Cultist"];

  // Generate lieutenant names using intelligent language selection
  const lieutenantNameResult = await generateNamesWithIntelligentLanguageChoice({
    characterType: "lieutenant",
    race: adventureSeeds.race,
    goal: adventureSeeds.goal,
    description: `Lieutenants serving under the villain: ${lieutenantTypes.join(", ")}`
  }, 6);
  const lieutenantNames = lieutenantNameResult.success ?
    lieutenantNameResult.names : ["Vex", "Korran", "Silith", "Drak", "Nereth", "Zylara"];

  // Generate faction name using intelligent language selection
  const factionNameResult = await generateSingleIntelligentName({
    characterType: "faction",
    race: adventureSeeds.race,
    goal: adventureSeeds.goal,
    description: "An evil organization/cult/faction serving the villain"
  });
  const factionName = factionNameResult.success ?
    `The ${factionNameResult.name} Covenant` : "The Obsidian Covenant";

  // Generate all elements with LLM
  const expandedElements = await generateAllVillainElements({
    tarotCards: adventureSeeds.cards,
    goal: adventureSeeds.goal,
    race: adventureSeeds.race,
    villainNames: villainNames || [],
    lieutenantTypes: lieutenantTypes || [],
    lieutenantNames: lieutenantNames || [],
    factionName
  });

  return {
    tarotCards: adventureSeeds.cards,
    goal: adventureSeeds.goal,
    race: adventureSeeds.race,
    villainNames: villainNames || [],
    lieutenantTypes: lieutenantTypes || [],
    lieutenantNames: lieutenantNames || [],
    factionName,
    ...expandedElements
  };
};

/**
 * Regenerates a specific intermediate step
 */
const regenerateIntermediateStep = async (stepKey: string, currentData: GenerationResults): Promise<GenerationResults> => {
  const updatedData = { ...currentData };

  switch (stepKey) {
    case 'tarotCards':
      const adventureSeeds = generateAdventureSeeds();
      updatedData.tarotCards = adventureSeeds.cards;
      break;
    case 'goal':
      const newAdventureSeeds = generateAdventureSeeds();
      updatedData.goal = newAdventureSeeds.goal;
      break;
    case 'race':
      const raceSeeds = generateAdventureSeeds();
      updatedData.race = raceSeeds.race;
      break;
    case 'villainNames':
      const nameResult = await generateNamesWithIntelligentLanguageChoice({
        characterType: "villain",
        race: updatedData.race,
        goal: updatedData.goal,
        description: "A main antagonist/villain for the campaign"
      }, 6);
      updatedData.villainNames = nameResult.success ? nameResult.names : ["Malachar", "Zygrath", "Nethys", "Vorthak", "Xantheus", "Balthazor"];
      break;
    case 'lieutenantTypes':
      const lieutenantResult = await getLieutenantTypes(2);
      updatedData.lieutenantTypes = lieutenantResult.success ?
        lieutenantResult.lieutenant_types : ["Assassin", "Cultist"];
      break;
    case 'lieutenantNames':
      const lieutenantNameResult = await generateNamesWithIntelligentLanguageChoice({
        characterType: "lieutenant",
        race: updatedData.race,
        goal: updatedData.goal,
        description: `Lieutenants serving under the villain: ${updatedData.lieutenantTypes.join(", ")}`
      }, 6);
      updatedData.lieutenantNames = lieutenantNameResult.success ?
        lieutenantNameResult.names : ["Vex", "Korran", "Silith", "Drak", "Nereth", "Zylara"];
      break;
    case 'llmReasoning':
      // Regenerate LLM reasoning based on current data
      updatedData.llmReasoning = await generateLLMReasoning({
        tarotCards: updatedData.tarotCards,
        goal: updatedData.goal,
        race: updatedData.race,
        villainNames: updatedData.villainNames,
        lieutenantTypes: updatedData.lieutenantTypes,
        lieutenantNames: updatedData.lieutenantNames
      });
      break;
  }

  return updatedData;
};

/**
 * Generates all villain elements including fate questions, clues, surprises, etc.
 */
const generateAllVillainElements = async (baseData: {
  tarotCards: any[];
  goal: string;
  race: string;
  villainNames: string[];
  lieutenantTypes: string[];
  lieutenantNames: string[];
  factionName: string;
}): Promise<Omit<GenerationResults, 'tarotCards' | 'goal' | 'race' | 'villainNames' | 'lieutenantTypes' | 'lieutenantNames' | 'factionName'>> => {

  const prompt = `You are an expert RPG designer creating a complete villain generation process. Based on the following elements, generate ALL the missing components with fate questions and detailed reasoning:

BASE ELEMENTS:
Tarot Cards: ${JSON.stringify(baseData.tarotCards, null, 2)}
Goal: ${baseData.goal}
Race: ${baseData.race}
Villain Names: ${baseData.villainNames.join(", ")}
Lieutenant Types: ${baseData.lieutenantTypes.join(", ")}
Lieutenant Names: ${baseData.lieutenantNames.join(", ")}
Faction Name: ${baseData.factionName}

Generate the following components in JSON format:

{
  "factionFateQuestions": [
    {
      "question": "Yes/No question about faction's origin or nature",
      "roll": "Yes/No with mythic reasoning",
      "interpretation": "What this means for the faction",
      "impact": "How this affects their operations"
    }
    // Generate 3-4 faction fate questions
  ],
  "lieutenantFateQuestions": [
    {
      "lieutenantName": "First lieutenant name from list",
      "lieutenantType": "First lieutenant type from list",
      "fateQuestions": [
        {
          "question": "Yes/No question about this lieutenant's background",
          "roll": "Yes/No with mythic reasoning",
          "interpretation": "What this means for their role"
        }
        // 2-3 questions per lieutenant
      ]
    },
    {
      "lieutenantName": "Second lieutenant name from list",
      "lieutenantType": "Second lieutenant type from list",
      "fateQuestions": [
        // 2-3 questions for second lieutenant
      ]
    }
  ],
  "clues": [
    "8 investigation clues that heroes can discover about the villain",
    "Each clue should reveal different aspects",
    "Mix of physical evidence, witness accounts, documents, etc.",
    "Clues should build toward revealing the villain's plan"
  ],
  "highTowerSurprise": {
    "surprise": "A major plot twist or revelation about the villain",
    "fateQuestion": "Yes/No question about how this surprise unfolds",
    "roll": "Yes/No with mythic reasoning",
    "interpretation": "How the fate roll affects the surprise",
    "finalOutcome": "The actual result after the fate decision"
  },
  "minions": [
    {
      "type": "Primary minion type",
      "description": "What they do and how they serve the villain",
      "count": "Approximate numbers (e.g., 'dozens', 'a handful', 'scores')"
    }
    // 3-4 different minion types
  ],
  "llmReasoning": {
    "tarotInterpretation": "How the tarot cards influence the overall villain concept",
    "raceRationale": "Why this race works perfectly with the goal and tarot themes",
    "goalAlignment": "How all elements align to create a coherent villain",
    "overallCoherence": "Summary of how all fate decisions create a compelling antagonist",
    "villainNameChoice": "Which villain name from the generated list works best and why (include the chosen name)",
    "lieutenantNameChoices": "Which lieutenant names from the generated list work best for each lieutenant type and why (include the chosen names)"
  }
}

Make all fate questions meaningful and let the Yes/No rolls genuinely influence the outcomes. Use mythic GME style reasoning for the rolls.`;

  try {
    const response = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 3000,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const content = response.content[0];
    if (content.type !== "text") {
      throw new Error("Unexpected response type from Claude");
    }

    // Extract JSON from the response
    const jsonMatch = content.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No JSON found in response");
    }

    const elements = JSON.parse(jsonMatch[0]);
    return elements;
  } catch (error) {
    console.error("Error generating villain elements:", error);

    // Fallback elements
    return {
      factionFateQuestions: [
        {
          question: "Was this faction founded by the villain personally?",
          roll: "Yes - The villain created this organization from nothing",
          interpretation: "The faction is deeply loyal and reflects the villain's personal vision",
          impact: "Members are fanatically devoted and difficult to turn against their leader"
        }
      ],
      lieutenantFateQuestions: [
        {
          lieutenantName: baseData.lieutenantNames[0] || "Vex",
          lieutenantType: baseData.lieutenantTypes[0] || "Assassin",
          fateQuestions: [
            {
              question: "Does this lieutenant have a personal grudge motivating their service?",
              roll: "Yes - They seek revenge against the same enemies",
              interpretation: "Their loyalty is based on shared hatred rather than mere employment"
            }
          ]
        },
        {
          lieutenantName: baseData.lieutenantNames[1] || "Korran",
          lieutenantType: baseData.lieutenantTypes[1] || "Cultist",
          fateQuestions: [
            {
              question: "Is this lieutenant secretly plotting against the villain?",
              roll: "No - They are completely devoted to the cause",
              interpretation: "This lieutenant can be trusted absolutely and will never betray the villain"
            }
          ]
        }
      ],
      clues: [
        "Strange symbols carved into stone at crime scenes",
        "Witnesses report seeing the villain's distinctive appearance",
        "Documents bearing the faction's seal found at key locations",
        "Pattern of attacks targeting specific types of victims",
        "Unusual magical residue left at sites of villain activity",
        "Intercepted communications between faction members",
        "Financial records showing suspicious transactions",
        "Artifacts or weapons with unique craftsmanship signatures"
      ],
      highTowerSurprise: {
        surprise: "The villain's true plan is far grander than initially apparent",
        fateQuestion: "Does the villain's plan succeed partially before heroes can stop it?",
        roll: "Yes - But only the first phase completes",
        interpretation: "The heroes arrive just as the villain achieves a significant milestone",
        finalOutcome: "The villain has gained considerable power but their ultimate goal remains unfinished"
      },
      minions: [
        {
          type: "Elite Guards",
          description: "Highly trained warriors who serve as the villain's personal protection",
          count: "A dozen"
        },
        {
          type: "Cult Followers",
          description: "Fanatical believers who spread the villain's influence",
          count: "Scores"
        },
        {
          type: "Infiltrators",
          description: "Spies and saboteurs placed throughout society",
          count: "A handful"
        }
      ],
      llmReasoning: {
        tarotInterpretation: `The tarot spread of ${baseData.tarotCards.map(c => c.card_text).join(', ')} creates a complex narrative foundation for this villain.`,
        raceRationale: `The choice of ${baseData.race} as the villain's race provides excellent opportunities for developing their motivations and methods.`,
        goalAlignment: `The goal of "${baseData.goal}" aligns perfectly with the tarot themes and racial background.`,
        overallCoherence: "All elements combine to create a multi-layered antagonist with clear motivations and compelling story potential.",
        villainNameChoice: `From the names ${baseData.villainNames.join(', ')}, I choose ${baseData.villainNames[0]} as it resonates with the dark themes and provides gravitas suitable for the villain's goal.`,
        lieutenantNameChoices: `For the lieutenants: ${baseData.lieutenantNames[0]} works perfectly as the ${baseData.lieutenantTypes[0]}, while ${baseData.lieutenantNames[1]} suits the ${baseData.lieutenantTypes[1]} role. These names complement the villain's scheme.`
      }
    };
  }
};

/**
 * Generates LLM reasoning about the random rolls and algorithmic choices
 */
const generateLLMReasoning = async (data: Omit<GenerationResults, 'llmReasoning'>): Promise<GenerationResults['llmReasoning']> => {
  const prompt = `You are an expert RPG designer analyzing the results of various generation systems. Provide reasoning and interpretation for the following randomly generated and algorithmic results:

TAROT CARDS (Random table rolls):
${JSON.stringify(data.tarotCards, null, 2)}

GOAL (Random from 360-item table): ${data.goal}

RACE (Weighted random selection): ${data.race}

VILLAIN NAMES (Algorithmic evil-name generation): ${data.villainNames.join(", ")}

LIEUTENANT TYPES (Random table rolls): ${data.lieutenantTypes.join(", ")}

LIEUTENANT NAMES (Algorithmic evil-name generation): ${data.lieutenantNames.join(", ")}

Provide analysis in the following format:

TAROT INTERPRETATION:
[How do these 6 tarot cards work together thematically? What narrative themes do they suggest?]

RACE SELECTION RATIONALE:
[Why does this race choice work well with the goal and tarot themes? What does it add to the villain concept?]

GOAL ALIGNMENT:
[How does the randomly selected goal align with or contrast with the tarot spread? What interesting tensions or synergies exist?]

OVERALL COHERENCE:
[Summary of how all elements work together to create a compelling villain concept]

VILLAIN NAME CHOICE:
[From the generated villain names, pick the one that works best with the concept and explain why. Include the chosen name in your reasoning.]

LIEUTENANT NAME CHOICES:
[From the generated lieutenant names, assign the best names to each lieutenant type and explain the reasoning. Include the chosen names for each type.]

Keep your reasoning concise but insightful. Focus on how the random elements can create unexpected but compelling villain concepts.`;

  try {
    const response = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 1200,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const content = response.content[0];
    if (content.type !== "text") {
      throw new Error("Unexpected response type from Claude");
    }

    // Parse the response into structured format
    const text = content.text;
    const reasoning = {
      tarotInterpretation: '',
      raceRationale: '',
      goalAlignment: '',
      overallCoherence: '',
      villainNameChoice: '',
      lieutenantNameChoices: ''
    };

    const sections = text.split(/(?=TAROT INTERPRETATION:|RACE SELECTION RATIONALE:|GOAL ALIGNMENT:|OVERALL COHERENCE:|VILLAIN NAME CHOICE:|LIEUTENANT NAME CHOICES:)/);

    for (const section of sections) {
      if (section.includes('TAROT INTERPRETATION:')) {
        reasoning.tarotInterpretation = section.replace('TAROT INTERPRETATION:', '').trim();
      } else if (section.includes('RACE SELECTION RATIONALE:')) {
        reasoning.raceRationale = section.replace('RACE SELECTION RATIONALE:', '').trim();
      } else if (section.includes('GOAL ALIGNMENT:')) {
        reasoning.goalAlignment = section.replace('GOAL ALIGNMENT:', '').trim();
      } else if (section.includes('OVERALL COHERENCE:')) {
        reasoning.overallCoherence = section.replace('OVERALL COHERENCE:', '').trim();
      } else if (section.includes('VILLAIN NAME CHOICE:')) {
        reasoning.villainNameChoice = section.replace('VILLAIN NAME CHOICE:', '').trim();
      } else if (section.includes('LIEUTENANT NAME CHOICES:')) {
        reasoning.lieutenantNameChoices = section.replace('LIEUTENANT NAME CHOICES:', '').trim();
      }
    }

    return reasoning;
  } catch (error) {
    console.error("Error generating LLM reasoning:", error);
    return {
      tarotInterpretation: "The tarot cards suggest a complex narrative with multiple layers of meaning that will shape this villain's story.",
      raceRationale: `The selection of ${data.race} as the villain's race provides interesting opportunities for developing their background and motivations.`,
      goalAlignment: `The goal of "${data.goal}" creates compelling possibilities when combined with the other generated elements.`,
      overallCoherence: "All elements combine to create a multi-layered antagonist with clear motivations and compelling story potential.",
      villainNameChoice: `From the names ${data.villainNames.join(', ')}, I choose ${data.villainNames[0]} as it resonates with the dark themes established by the tarot and race.`,
      lieutenantNameChoices: `For the lieutenants: ${data.lieutenantNames[0]} works well as the ${data.lieutenantTypes?.[0] || 'first lieutenant'}, while ${data.lieutenantNames[1]} suits the ${data.lieutenantTypes?.[1] || 'second lieutenant'} role.`
    };
  }
};

/**
 * Generates a villain narrative from intermediate generation steps
 */
const generateVillainNarrativeFromSteps = async (generationData: GenerationResults): Promise<string> => {
  const prompt = `You are an expert dungeon master creating a structured narrative about a villain for a fantasy RPG campaign. Based on the following generation results, create a well-organized story with specific headers and sections:

TAROT INSPIRATION:
${JSON.stringify(generationData.tarotCards, null, 2)}

GENERATED ELEMENTS:
- Goal: ${generationData.goal}
- Race: ${generationData.race}
- Potential Names: ${generationData.villainNames.join(", ")}
- Lieutenant Types: ${generationData.lieutenantTypes.join(", ")}
- Lieutenant Names: ${generationData.lieutenantNames.join(", ")}
- Faction Name: ${generationData.factionName}

FATE DECISIONS:
Faction: ${generationData.factionFateQuestions.map(f => `${f.question} (${f.roll}) - ${f.interpretation}`).join('; ')}
Lieutenants: ${generationData.lieutenantFateQuestions.map(lt => `${lt.lieutenantName}: ${lt.fateQuestions.map(fq => `${fq.question} (${fq.roll})`).join(', ')}`).join('; ')}
High Tower Surprise: ${generationData.highTowerSurprise.fateQuestion} (${generationData.highTowerSurprise.roll}) - ${generationData.highTowerSurprise.finalOutcome}

INVESTIGATION CLUES:
${generationData.clues.map((clue, index) => `${index + 1}. ${clue}`).join('\n')}

MINIONS:
${generationData.minions.map(m => `${m.type} (${m.count}): ${m.description}`).join('\n')}

Create a structured narrative with these EXACT headers and sections:

## Villain / BBEG
[Choose the best name from the potential names list. Write 2-3 paragraphs about their background, rise to power, motivations influenced by the tarot themes and goal. Include their race and how the fate decisions shaped their story.]

## The High Tower Surprise
[Write 1-2 paragraphs about the plot twist: ${generationData.highTowerSurprise.surprise}. Incorporate how the fate question outcome (${generationData.highTowerSurprise.roll}) affects this surprise, leading to: ${generationData.highTowerSurprise.finalOutcome}]

## Clues About the BBEG
[Format the investigation clues as a bulleted list using markdown bullet points (•), incorporating each clue into the narrative context]

## ${generationData.lieutenantFateQuestions[0]?.lieutenantName || generationData.lieutenantNames[0]} - ${generationData.lieutenantFateQuestions[0]?.lieutenantType || generationData.lieutenantTypes[0]}
[Write 1-2 paragraphs about this lieutenant, incorporating their fate question outcomes and role]

## ${generationData.lieutenantFateQuestions[1]?.lieutenantName || generationData.lieutenantNames[1]} - ${generationData.lieutenantFateQuestions[1]?.lieutenantType || generationData.lieutenantTypes[1]}
[Write 1-2 paragraphs about this lieutenant, incorporating their fate question outcomes and role]

## The ${generationData.factionName}
[Write 2-3 paragraphs about the faction, incorporating the faction fate decisions and how the organization operates]

## Minions
[Write 1-2 paragraphs describing the various minion types and how they serve the villain's goals]

Use the fate decision outcomes to shape each section. Write in an engaging, atmospheric style that a dungeon master could read aloud. Make sure each section flows naturally but maintains clear organization.

${getGlobalNarrativeRestrictions()}`;

  try {
    const response = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 1000,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const content = response.content[0];
    if (content.type !== "text") {
      throw new Error("Unexpected response type from Claude");
    }

    return content.text;
  } catch (error) {
    console.error("Error generating narrative from steps:", error);
    return `The legend of ${generationData.villainNames[0] || "this villain"} spreads across the land like a dark shadow. Born of ${generationData.race.toLowerCase()} heritage and driven by an insatiable desire to ${generationData.goal.toLowerCase()}, this antagonist has become a force to be reckoned with.

Their rise to power was foretold in the ancient cards - ${generationData.tarotCards.map(card => card.card_text).join(', ')} - and now their influence spreads through trusted lieutenants of varying races and backgrounds.

Those who dare oppose them must be prepared for a cunning adversary who will stop at nothing to achieve their dark ambitions.`;
  }
};

/**
 * Generates a complete villain using AI
 */
const generateCompleteVillain = async (): Promise<GeneratedVillain> => {
  // Get tarot spread for inspiration
  const adventureSeeds = generateAdventureSeeds();
  const villainType = getRandomVillainType();
  
  // Generate villain names using intelligent language selection
  const nameResult = await generateNamesWithIntelligentLanguageChoice({
    characterType: "villain",
    race: adventureSeeds.race,
    goal: adventureSeeds.goal,
    description: `${villainType} - A main antagonist/villain for the campaign`
  }, 3);
  const villainNames = nameResult.success ? nameResult.names : ["Malachar", "Zygrath", "Nethys"];
  
  // Generate lieutenant types
  const lieutenantResult = await getLieutenantTypes(2);
  const lieutenantTypes = lieutenantResult.success ? 
    lieutenantResult.lieutenant_types : ["Assassin", "Cultist"];

  // Generate lieutenant names using intelligent language selection
  const lieutenantNameResult = await generateNamesWithIntelligentLanguageChoice({
    characterType: "lieutenant",
    race: adventureSeeds.race,
    goal: adventureSeeds.goal,
    description: `Lieutenants serving under the ${villainType}: ${lieutenantTypes.join(", ")}`
  }, 4);
  const lieutenantNames = lieutenantNameResult.success ?
    lieutenantNameResult.names : ["Vex", "Korran", "Silith", "Drak"];

  const prompt = `You are an expert dungeon master creating a compelling villain for a fantasy RPG campaign. Generate a detailed BBEG (Big Bad Evil Guy) based on the following constraints:

TAROT INSPIRATION:
${JSON.stringify(adventureSeeds, null, 2)}

VILLAIN TYPE: ${villainType}
POTENTIAL NAMES: ${villainNames?.join(", ")}
LIEUTENANT TYPES: ${lieutenantTypes?.join(", ")}
LIEUTENANT NAMES: ${lieutenantNames?.join(", ")}

Generate a JSON response with the following structure:
{
  "name": "Choose the best name from the list or create a variation",
  "villainType": "${villainType}",
  "motivation": "What drives this villain's actions (1-2 sentences)",
  "hook": "How this villain enters or affects the story (1-2 sentences)",
  "detailedDescription": "Detailed physical description, personality, and background (2-3 sentences)",
  "faction": {
    "name": "Name of the villain's organization/cult/army",
    "description": "Brief description of the faction's goals and methods"
  },
  "lieutenants": [
    {
      "name": "Use one of the lieutenant names",
      "description": "Description of this lieutenant (their role, personality, abilities)",
      "minions": "Optional: what type of minions they command"
    },
    {
      "name": "Use another lieutenant name", 
      "description": "Description of this lieutenant",
      "minions": "Optional: what type of minions they command"
    }
  ],
  "minions": "General description of the villain's common followers/army",
  "powerLevel": "Description of the villain's capabilities and threat level",
  "weaknesses": ["List", "of", "potential", "weaknesses", "or", "ways", "to", "defeat", "them"]
}

Make the villain compelling, memorable, and thematically appropriate for the tarot inspiration. Ensure the villain feels dangerous but defeatable with clever planning.`;

  try {
    const response = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 2000,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const content = response.content[0];
    if (content.type !== "text") {
      throw new Error("Unexpected response type from Claude");
    }

    // Extract JSON from the response
    const jsonMatch = content.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No JSON found in response");
    }

    const villainData = JSON.parse(jsonMatch[0]);
    return villainData as GeneratedVillain;
  } catch (error) {
    console.error("Error generating villain:", error);
    
    // Fallback villain in case of API failure
    return {
      name: villainNames?.[0] || "Malachar the Dark",
      villainType: villainType,
      motivation: "Seeks to corrupt the natural order and spread darkness across the land.",
      hook: "Ancient seals binding this entity are beginning to weaken, causing strange omens.",
      detailedDescription: "A towering figure shrouded in dark robes, with eyes that burn like cold stars. Their presence fills the air with dread and whispers of forgotten curses.",
      faction: {
        name: "The Obsidian Covenant",
        description: "A cult of fanatics devoted to bringing about eternal darkness through ancient rituals."
      },
      lieutenants: [
        {
          name: lieutenantNames?.[0] || "Vex",
          description: "A cunning spymaster who gathers information through fear and manipulation.",
          minions: "Thieves and informants throughout the city"
        },
        {
          name: lieutenantNames?.[1] || "Korran", 
          description: "A brutal enforcer who leads the villain's military forces with an iron fist.",
          minions: "Elite soldiers and mercenaries"
        }
      ],
      minions: "Cultists, corrupted creatures, and hired mercenaries",
      powerLevel: "Extremely dangerous with powerful magic and numerous followers",
      weaknesses: ["Ancient binding rituals", "Holy artifacts", "Unity among heroes", "Their own arrogance"]
    };
  }
};

/**
 * Regenerates a specific step of the villain
 */
const regenerateVillainStep = async (step: string, currentVillain: GeneratedVillain): Promise<GeneratedVillain> => {
  const prompt = `You are updating a specific aspect of an existing villain. Here is the current villain:

${JSON.stringify(currentVillain, null, 2)}

Regenerate ONLY the "${step}" field with new content while keeping everything else the same. Return the complete villain JSON with only the "${step}" field changed. Make sure the new content fits with the existing villain's theme and background.`;

  try {
    const response = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 1500,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const content = response.content[0];
    if (content.type !== "text") {
      throw new Error("Unexpected response type from Claude");
    }

    const jsonMatch = content.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No JSON found in response");
    }

    return JSON.parse(jsonMatch[0]) as GeneratedVillain;
  } catch (error) {
    console.error(`Error regenerating step ${step}:`, error);
    return currentVillain; // Return unchanged if regeneration fails
  }
};

/**
 * Generates an AI narrative about the villain
 */
const generateVillainNarrative = async (villain: GeneratedVillain): Promise<string> => {
  const prompt = `You are a skilled storyteller creating an engaging narrative about a villain for a fantasy RPG campaign. Here is the villain:

${JSON.stringify(villain, null, 2)}

Write a compelling 3-4 paragraph narrative that brings this villain to life. Include:
- Their rise to power or origin story
- How they operate and influence the world
- What makes them a credible threat to heroes
- Hints about how they might be encountered or defeated

Write in an engaging, atmospheric style that a dungeon master could read aloud or adapt for their campaign. Make it feel like a legend or dark tale that characters might hear whispered in taverns.

${getGlobalNarrativeRestrictions()}`;

  try {
    const response = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 1000,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const content = response.content[0];
    if (content.type !== "text") {
      throw new Error("Unexpected response type from Claude");
    }

    return content.text;
  } catch (error) {
    console.error("Error generating narrative:", error);
    return "The dark legend of this villain is shrouded in mystery, their true story lost to time and shadow...";
  }
};

export const villainGenerator: RequestHandler = async (req, res) => {
  try {
    const body = req.body as VillainGenerationRequest;

    if (body.generateIntermediateSteps) {
      // Generate intermediate generation steps
      const generationResults = await generateIntermediateSteps();

      res.json({
        success: true,
        generationResults,
      });
    } else if (body.regenerateIntermediateStep && body.currentGenerationData) {
      // Regenerate a specific intermediate step
      const updatedResults = await regenerateIntermediateStep(body.regenerateIntermediateStep, body.currentGenerationData);

      res.json({
        success: true,
        generationResults: updatedResults,
      });
    } else if (body.generateVillainFromSteps && body.generationData) {
      // Generate final villain narrative from intermediate steps
      const narrative = await generateVillainNarrativeFromSteps(body.generationData);

      res.json({
        success: true,
        narrative,
      });
    } else if (body.generateAll) {
      // Generate a complete new villain
      const villain = await generateCompleteVillain();

      res.json({
        success: true,
        villain,
      });
    } else if (body.regenerateStep && body.currentVillain) {
      // Regenerate a specific step
      const updatedVillain = await regenerateVillainStep(body.regenerateStep, body.currentVillain);

      res.json({
        success: true,
        villain: updatedVillain,
      });
    } else if (body.generateNarrative && body.villain) {
      // Generate AI narrative
      const narrative = await generateVillainNarrative(body.villain);

      res.json({
        success: true,
        narrative,
      });
    } else {
      res.status(400).json({
        success: false,
        error: "Invalid request parameters",
      });
    }
  } catch (error) {
    console.error("Villain generator error:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    });
  }
};
