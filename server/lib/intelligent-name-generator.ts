/**
 * Intelligent Name Generator with LLM Language Selection and Mythic Fate Confirmation
 * Uses AI reasoning to choose appropriate language styles, then Mythic fate table for confirmation
 */

import Anthropic from "@anthropic-ai/sdk";
import { generateNames, ALIGNMENT_NAMES, type NameAlignment } from "./name-generator.js";
import { rollFateChart } from "./mythic-fate-chart.js";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY ?? "",
});

export interface LanguageChoice {
  alignment: NameAlignment;
  languageName: string;
  reasoning: string;
}

export interface IntelligentNameResult {
  success: boolean;
  names?: string[];
  languageChoice?: LanguageChoice;
  fateDecisions?: Array<{
    question: string;
    alignment: NameAlignment;
    languageName: string;
    roll: number;
    result: string;
    accepted: boolean;
  }>;
  error?: string;
}

/**
 * Choose language style using LLM reasoning and Mythic fate confirmation
 */
async function chooseLanguageWithFate(context: {
  characterType: string; // "villain", "npc", "lieutenant", etc.
  race?: string;
  occupation?: string;
  motivation?: string;
  goal?: string;
  faction?: string;
  description?: string;
}): Promise<LanguageChoice> {
  
  // Step 1: Ask LLM to rank the top 3 language choices with reasoning
  const prompt = `You are an expert in fantasy linguistics and world-building. Based on the following character context, choose the 3 MOST APPROPRIATE language styles for generating this character's name, ranked from best to worst.

CHARACTER CONTEXT:
Type: ${context.characterType}
${context.race ? `Race: ${context.race}` : ''}
${context.occupation ? `Occupation: ${context.occupation}` : ''}
${context.motivation ? `Motivation: ${context.motivation}` : ''}
${context.goal ? `Goal: ${context.goal}` : ''}
${context.faction ? `Faction: ${context.faction}` : ''}
${context.description ? `Description: ${context.description}` : ''}

AVAILABLE LANGUAGE STYLES:
1. Evil - Dark, harsh syllables for villains and evil characters
2. Celtic (Gaelic) - Irish/Scottish inspired names perfect for elven and druidic cultures
3. Nordic (Old Norse) - Old Norse names ideal for barbarian tribes and northern kingdoms
4. Germanic - Germanic names perfect for dwarven clans and mountain craftsmen
5. Latin - Classical Latin names for imperial organizations and scholarly orders
6. Ancient Greek - Ancient Greek names for academic institutions and city-states
7. Slavic - Slavic names great for cold empires and mystical kingdoms
8. Arabic/Persian - Arabic/Persian names perfect for desert kingdoms and sultanates
9. Finnish - Finnish names creating distinctive, otherworldly sounds
10. Basque - Basque names with unique, unusual fantasy characteristics
11. Elvish - Tolkien-inspired elvish names for ancient, graceful beings
12. Draconic - Harsh, ancient draconic names for dragons and their servants
13. Primordial - Elemental primordial names for nature spirits and ancient beings
14. Infernal - Dark, imposing infernal names for evil entities and cults
15. Anglo-Saxon - Old English Anglo-Saxon names for medieval warriors and nobles
16. Steppe Nomad - Mongolian/Turkish inspired names for nomadic horse-riding cultures
17. Ancient Egyptian - Ancient Egyptian names for pyramid-building desert civilizations

Respond with EXACTLY this format:

FIRST CHOICE: [Number]. [Language Name]
REASONING: [1-2 sentences explaining why this language fits perfectly]

SECOND CHOICE: [Number]. [Language Name]  
REASONING: [1-2 sentences explaining why this would also work well]

THIRD CHOICE: [Number]. [Language Name]
REASONING: [1-2 sentences explaining why this could work as a backup]

Consider the character's race, role, cultural background, and thematic elements when making your choices.`;

  try {
    const response = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 800,
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

    // Parse the LLM response to extract choices
    const text = content.text;
    const choices: LanguageChoice[] = [];

    const choicePattern = /(FIRST|SECOND|THIRD) CHOICE:\s*(\d+)\.\s*([^\n]+)\s*REASONING:\s*([^\n]+(?:\n[^\n]*(?!CHOICE:))*)/g;
    let match;

    while ((match = choicePattern.exec(text)) !== null) {
      const alignment = parseInt(match[2]) as NameAlignment;
      const languageName = match[3].trim();
      const reasoning = match[4].trim();

      if (alignment >= 1 && alignment <= 17) {
        choices.push({
          alignment,
          languageName,
          reasoning
        });
      }
    }

    if (choices.length === 0) {
      throw new Error("Failed to parse LLM language choices");
    }

    // Step 2: Use Mythic fate to confirm choices in order
    const fateDecisions: IntelligentNameResult['fateDecisions'] = [];

    for (const choice of choices) {
      const question = `Is ${choice.languageName} the right language style for this ${context.characterType}'s name?`;
      
      // Ask with "Likely" probability since LLM already reasoned this is a good choice
      const fateResult = rollFateChart("Likely", 5);
      
      fateDecisions.push({
        question,
        alignment: choice.alignment,
        languageName: choice.languageName,
        roll: fateResult.roll,
        result: fateResult.result,
        accepted: fateResult.success
      });

      // If fate says "Yes", use this choice
      if (fateResult.success) {
        return choice;
      }
    }

    // If all choices were rejected by fate, fall back to the first choice with reasoning
    const fallbackChoice = choices[0];
    
    fateDecisions.push({
      question: `Should we use ${fallbackChoice.languageName} despite fate's previous rejections?`,
      alignment: fallbackChoice.alignment,
      languageName: fallbackChoice.languageName,
      roll: 0, // No actual roll, just accepting
      result: "Fallback - Accepted",
      accepted: true
    });

    return fallbackChoice;

  } catch (error) {
    console.error("Error in LLM language selection:", error);
    
    // Fallback to Evil alignment for villains, Celtic for others
    const fallbackAlignment: NameAlignment = context.characterType.toLowerCase().includes('villain') ? 1 : 2;
    return {
      alignment: fallbackAlignment,
      languageName: ALIGNMENT_NAMES[fallbackAlignment],
      reasoning: "Fallback choice due to LLM error"
    };
  }
}

/**
 * Generate names with intelligent language selection
 */
export async function generateNamesWithIntelligentLanguageChoice(
  context: {
    characterType: string;
    race?: string;
    occupation?: string;
    motivation?: string;
    goal?: string;
    faction?: string;
    description?: string;
  },
  numNames: number = 3
): Promise<IntelligentNameResult> {
  try {
    // Step 1: Choose language style with LLM + Mythic fate
    const languageChoice = await chooseLanguageWithFate(context);

    // Step 2: Generate names using the chosen language
    const nameResult = generateNames(languageChoice.alignment, numNames);

    if (!nameResult.success) {
      return {
        success: false,
        error: nameResult.error || "Name generation failed"
      };
    }

    return {
      success: true,
      names: nameResult.names,
      languageChoice,
      // Note: fateDecisions would be populated in a full implementation
      // but for now we'll keep it simple and just return the final choice
    };

  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred"
    };
  }
}

/**
 * Generate a single name with intelligent language selection (for when you need just one name)
 */
export async function generateSingleIntelligentName(
  context: {
    characterType: string;
    race?: string;
    occupation?: string;
    motivation?: string;
    goal?: string;
    faction?: string;
    description?: string;
  }
): Promise<{ success: boolean; name?: string; languageChoice?: LanguageChoice; error?: string }> {
  const result = await generateNamesWithIntelligentLanguageChoice(context, 1);
  
  if (!result.success || !result.names || result.names.length === 0) {
    return {
      success: false,
      error: result.error || "Failed to generate name"
    };
  }

  return {
    success: true,
    name: result.names[0],
    languageChoice: result.languageChoice
  };
}
