import { RequestHandler } from "express";
import Anthropic from "@anthropic-ai/sdk";
import { spawn } from "child_process";
import path from "path";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

interface AdventureGenerationResult {
  goal: string;
  gender: string;
  race: string;
  cards: Array<{
    position: string;
    card_text: string;
  }>;
}

interface AdventureResponse {
  villainProfile: string;
  adventureHook: string;
  seedData: AdventureGenerationResult;
  success: boolean;
  error?: string;
}

export const generateAdventure: RequestHandler = async (req, res) => {
  try {
    console.log("Starting adventure generation...");

    // Step 1: Run Python script to generate random elements
    const pythonScriptPath = path.join(
      __dirname,
      "..",
      "scripts",
      "adventure_generator.py",
    );

    const pythonResult = await new Promise<AdventureGenerationResult>(
      (resolve, reject) => {
        const pythonProcess = spawn("python3", [pythonScriptPath]);
        let output = "";
        let errorOutput = "";

        pythonProcess.stdout.on("data", (data) => {
          output += data.toString();
        });

        pythonProcess.stderr.on("data", (data) => {
          errorOutput += data.toString();
        });

        pythonProcess.on("close", (code) => {
          if (code !== 0) {
            console.error("Python script error:", errorOutput);
            reject(
              new Error(
                `Python script failed with code ${code}: ${errorOutput}`,
              ),
            );
          } else {
            try {
              const result = JSON.parse(output.trim());
              resolve(result);
            } catch (e) {
              console.error("Failed to parse Python output:", output);
              reject(new Error("Failed to parse Python script output"));
            }
          }
        });
      },
    );

    console.log("Python generation complete:", pythonResult);

    // Step 2: Format data for Claude prompt
    const cardsFormatted = pythonResult.cards
      .map((card) => `${card.position}: ${card.card_text}`)
      .join("\n");

    // Step 3: Send to Claude for villain creation
    const villainPrompt = `You are a narrative design assistant. Your job is to take the goal (first value)
and combine and interpret it with the six Tarot card draws into a compelling and
multidimensional Big Bad Evil Guy (BBEG) for a TTRPG campaign.
Follow the exact structure and rules below to create the Villain's outline.

Your job is not to name the villain yet.

Here is the goal of the villain: ${pythonResult.goal}
Here is the gender of the villain: ${pythonResult.gender}
Here is the race of the villain: ${pythonResult.race}
Here are the six cards, each with its position in the Villain Life spread:
${cardsFormatted}

TASKS
A. Interpret each card in two sentences or fewer, obeying these guidelines:
   • Major Arcana = life-defining events or forces.
   • Suits: Wands = ambition or creativity; Cups = emotion or loyalty; Swords = conflict or ideology;
     Pentacles = resources or influence.
   • Numbers: Ace-Four = beginnings; Five-Seven = struggle; Eight-Ten = culmination;
     Court cards represent key NPCs (Page = scout, Knight = enforcer, Queen = strategist, King = ruler).
   • Reversed means blockage, inversion, secrecy, or excess—choose whichever fits best.

B. Using the six interpretations, write a cohesive villain profile using the Tone of this adventure:
   1. Striking visual.
   2. Core motivation (one sentence).
   3. Contradiction: show how the Virtue and Vice coexist.
   4. Primary resource or lieutenant (from Rising Power).
   5. Secret weakness or ticking clock (from Breaking Point).
   6. Worst-case future if heroes fail (from Fate).

D. Finish with a one-sentence adventure hook the GM can read aloud.`;

    const villainResponse = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 1000,
      temperature: 0.7,
      messages: [
        {
          role: "user",
          content: villainPrompt,
        },
      ],
    });

    const villainContent =
      villainResponse.content[0].type === "text"
        ? villainResponse.content[0].text
        : "Failed to generate villain profile";

    // Step 4: Generate villain name
    const namingPrompt = `You are a fantasy‑naming assistant. Your task is to prepare raw building blocks
for a compelling villain name that works with the villain's persona.

Follow Steps 1 and 2 exactly.

TASKS
Step 1. Extract three short keyword phrases from the villain profile:
    • Core mood   – one or two words that sum up personality (examples: ruthless ambition, cold logic)
    • Element or domain – one or two words tied to powers or theme (shadow, frost, plague)
    • Cultural flavor – one or two words suggesting linguistic or regional tone (Nordic, Latin, Abyssal)

Step 2. Build a phonetic palette table using the mood word from Step 1:
    • Choose 2‑3 strong consonant clusters that fit the mood
    • Choose 1‑2 vowel sounds that match the same mood
    • Present the results in a table like this:

| Mood | Consonants | Vowels | Effect |
|------|------------|--------|--------|
| <mood word> | <C1, C2, C3> | <V1, V2> | <one‑line rationale> |

OUTPUT FORMAT
Keywords:
- Core mood: <text>
- Element or domain: <text>
- Cultural flavor: <text>

Phonetic Palette:
| Mood | Consonants | Vowels | Effect |
|------|------------|--------|--------|
| ...  | ...        | ...    | ...    |

After you have completed Steps 1 and 2, output them as the example above and then
proceed to Step 3. Do not wait for user response.

Step 3. Build a phonetic palette
Use these examples of clusters that could be used to reinforce the mood of the villain:

Mood	Consonants	Vowels	Sample effect
Brutal / martial	K, G, Gr, Kr, Dr	short A, O	"Drakgor"
Sinister / occult	Sh, Zh, Th, S	long E, I, U	"Zheilith"
Noble / tragic	L, V, R, D	diphthongs Ae, Ei, Oa	"Vaelor"
Cold / calculating	X, Q, K, T	neutral A, I	"Qitali"

Pick 2–3 consonant clusters and 1–2 vowels.

Step 4. Choose a syllable template
Select one that fits the gravitas of the Villain (or create a new one):

[C]V[C]V – elegant, flows (Va‑e‑lor)

CVC‑CVC – harsh, militaristic (Drak‑gor)

CV‑CV‑CV – chant‑like, eldritch (Zi‑lo‑thu)

CVVC‑CVC – regal, archaic (Khael‑vorn)

Step 5. Forge two root morphemes

Root A – embodies the villain's domain
Example:
Use Latin, Old Norse, or a quick English syllable twist.
shadow ➜ "umbra", "skot", "dusk"

Root B – hints at motivation or fate
Example:
dominion ➜ "crat", "vald", "rex"

Step 5. Assemble 8 candidates
Slot morphemes into the template.

Swap vowels or consonants to fit the palette.

Vary accents or doubled letters for texture.

Step 6. QUALITY RULES
1. Pronounceability – must be speakable in two seconds without unusual tongue‑twisters.
2. Tone match – must evoke the "core_mood", respect the "element", and feel consistent
   with the "cultural flavor".
3. Distinctiveness – skip names that Google shows as 10+ exact matches or are obvious
   modern brands, real places, or common English words.
4. Not overly difficult to remember or pronounce

Step 7. CHOOSE ONE
A. Take the list of candidates.
B. Check guardrails from Steps 1-2 to consider mood, element, culture, consonant palette, and vowel palette. Eliminate any names that don't meet the standard.
C. Check each candidate name to pass Quality Rules
C. Of the remaining, choose the best.
D. Output
   • "name" – the final spelling, capitalized.
   • "reason" – one line explaining how it fits the guardrails and passes the rules.

Step 8. CONSIDER TITLE

If the villain has a role or occupation and it makes sense to do so,
please add the title prior to name. Ensure the role fits with the theme and
tone of the adventure.

FINAL VILLAIN OUTPUT:

{Name}

Adventure Hook:
...

Villain Profile:
1. ...
2. ...
3. ...
4. ...
5. ...
6. ...

Seed ideas:
- Original goal: ${pythonResult.goal}
- Seed: ${pythonResult.cards[0].card_text}
- Virtue: ${pythonResult.cards[1].card_text}
- Vice: ${pythonResult.cards[2].card_text}
- Rising Power: ${pythonResult.cards[3].card_text}
- Breaking Point: ${pythonResult.cards[4].card_text}
- Fate: ${pythonResult.cards[5].card_text}

Previous villain profile to work with:
${villainContent}`;

    const nameResponse = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 1500,
      temperature: 0.7,
      messages: [
        {
          role: "user",
          content: namingPrompt,
        },
      ],
    });

    const finalResult =
      nameResponse.content[0].type === "text"
        ? nameResponse.content[0].text
        : "Failed to generate villain name and final output";

    const response: AdventureResponse = {
      villainProfile: finalResult,
      adventureHook: "Adventure hook will be extracted from final result",
      seedData: pythonResult,
      success: true,
    };

    res.json(response);
  } catch (error) {
    console.error("Adventure generation error:", error);

    const response: AdventureResponse = {
      villainProfile: "Failed to generate adventure",
      adventureHook: "Error occurred during generation",
      seedData: {} as any,
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };

    res.status(500).json(response);
  }
};
