import random
import json
import sys
from pprint import pprint

# ───────────────────────────────────────────────────────────
# 1. GOAL
goal = [
    "Absolute negation", "Absolute power", "Apocalyptic destruction", "Artistic cruelty", "Ascension to demonhood", "Authoritarian control", "Beautiful destruction", "Become a god", "Binary justice", "Bond symbiotically with a host", "Break the vigilante protector", "Brutal enforcement of order", "Bureaucratic control", "Chaos and destruction", "Chaos and madness", "Chaotic domination", "Chaotic fun", "Collect knowledge", "Collect shiny things", "Complete a perfect contract", "Complete the mission at any cost", "Conquer death", "Conquer dimensions", "Conquer the empire", "Control games and contests", "Control others", "Control a crime‑ridden city", "Corporate advancement", "Corporate efficiency", "Corporate evil", "Corporate heroism", "Corrupt the world", "Cosmic experimentation", "Cosmic survival", "Create a horror movie in reality", "Criminal enterprise", "Criminal empire", "Criminal success", "Cure a loved one", "Cult leadership", "Dark‑order domination", "Defeat an eternal child hero", "Demon army", "Destroy everything", "Destroy galactic hunter", "Destroy heroic speedster", "Destroy jungle island", "Destroy positive matter universe", "Destroy rival speedster", "Destroy the happiness of the local hero", "Destroy the realm tower", "Destroy the world", "Dimensional control", "Divine vengeance", "Dominate dragons", "Dominate the realm", "Dream domination", "Draconic supremacy", "Eliminate anomalies", "Efficient world through optimization", "Endless strength", "Energy absorption", "Entertainment above all", "Environmental protection by force", "Escape imprisonment", "Escape the island", "Escape the underworld", "Eternal grudge", "Eternal undeath", "Eternal youth", "Exact revenge for personal tragedy", "Exact revenge on elusive nemesis", "Family business success", "Family legacy", "Family survival at any cost", "Fashion supremacy", "Flamboyant tyranny", "Forced assimilation", "Galactic domination", "Genetic perfection", "Genocidal extermination", "Guide destiny", "Guide the future of humanity", "Hand leadership of secret cult", "Harlem control", "Heavenly authority", "Heavenly order", "Heavenly stories collection", "Human extinction", "Human replacement", "Human superiority", "Human‑supremacist ideology", "Immortal dominance", "Immortal power", "Immortal survival", "Imperial doctrine enforcement", "Independence from rulers", "Information control", "Inherit power", "Institutional control", "Intellectual supremacy", "Insanity definition experiment", "Kinetic speed domination", "Knowledge and order", "Knowledge perfection", "Lawful evil order", "Leave the island", "Magical supremacy", "Maintain a dying empire", "Maintain evil balance", "Maintain the apocalypse timeline", "Matrix‑like reality perfection", "Mechanical evolution", "Merge realms", "Meta‑human extinction", "Mission completion for reward", "Musical immortality", "Mutated freedom", "Mutated supremacy", "Narrative control", "Necromantic power", "Nihilistic chaos", "Organic harvest", "Organic‑synthetic unity", "Orc supremacy", "Parasitic domination", "Perfect assimilation", "Perfect bounty", "Perfect combat", "Perfect organism", "Perfect soldier creation", "Perfect weapon", "Phazon corruption spreading", "Possess a loved one from past life", "Possess and control a talented creator", "Possess innocence", "Possess powerful artifact", "Power supremacy", "Predatory supremacy", "Prevent emergence of rival intelligence", "Profit from children", "Prophetic madness", "Protect her children", "Protect his people", "Protect territory", "Provide for family", "Psyche domination", "Pure corruption", "Purify a grand city", "Racial supremacy", "Reality manipulation", "Reclaim the world", "Release the archdemon", "Remain fairest in the land", "Revenge and honor", "Revenge obsession", "Revenge on rival kingdom", "Rule a crime‑ridden city underworld", "Rule all worlds", "Rule an alien empire", "Rule the desert kingdom", "Rule the kingdom", "Rule the realm of seas", "Rule the savannah kingdom", "Rule the towered city", "Rule worlds through temporal manipulation", "Rural success and stability", "Sage‑king guidance of nation", "Savior leadership of settlement", "Scientific advancement", "Scientific testing on subjects", "Serve a dark master", "Serve the destruction of the knightly order", "Shokan honor preservation", "Social advancement", "Social dominance", "Sorcerous power", "Species evolution", "Species propagation", "Speed god worship", "Resource monopoly", "Spread fear", "Spread her curse", "Spreading darkness", "Spreading evil", "Survival and expansion", "Technological dominance", "Technological tyranny", "Temporal manipulation of history", "Temporal obsession", "Territorial balance of nature", "Territorial conquest", "Territorial feeding", "Time compression of reality", "Torture humanity for pleasure", "Total control of reality", "Transfer soul into new vessel", "Tournament dominance", "Twilight supremacy", "Undead army", "Undead supremacy", "Unleash pure id", "Universal balance", "Universal domination", "Universal perfection", "Unleash primordial destruction", "Vampiric supremacy", "Vengeful colonialism", "World domination", "World peace through force", "World purification", "Wizarding supremacy", "Worship as a deity"
]

# ───────────────────────────────────────────────────────────
# Races and Genders
nimble_races = ["Human", "Elf", "Dwarf", "Halfling", "Gnome","Goblin", "Dragonborn", "Kobold", "Orc", "Fiendkin", "Bunbun",  "Birdfolk", "Celestial", "Changeling", "Crystalborn", "Half‑Giant", "Minotaur/Beastfolk", "Dryad/Shroomling", "Ratfolk", "Turtlefolk", "Wyrdling"]

# Weighted list for gender: Male is 4 times more likely than Female
genders = ["Male", "Female"] # Corrected gender list

# ───────────────────────────────────────────────────────────
# Tarot Cards
tarot_cards = [
    # Major Arcana
    "The Fool", "The Magician", "The High Priestess", "The Empress", "The Emperor",
    "The Hierophant", "The Lovers", "The Chariot", "Strength", "The Hermit",
    "Wheel of Fortune", "Justice", "The Hanged Man", "Death", "Temperance",
    "The Devil", "The Tower", "The Star", "The Moon", "The Sun",
    "Judgement", "The World",

    # Minor Arcana – Wands
    "Ace of Wands", "Two of Wands", "Three of Wands", "Four of Wands", "Five of Wands",
    "Six of Wands", "Seven of Wands", "Eight of Wands", "Nine of Wands", "Ten of Wands",
    "Page of Wands", "Knight of Wands", "Queen of Wands", "King of Wands",

    # Minor Arcana – Cups
    "Ace of Cups", "Two of Cups", "Three of Cups", "Four of Cups", "Five of Cups",
    "Six of Cups", "Seven of Cups", "Eight of Cups", "Nine of Cups", "Ten of Cups",
    "Page of Cups", "Knight of Cups", "Queen of Cups", "King of Cups",

    # Minor Arcana – Swords
    "Ace of Swords", "Two of Swords", "Three of Swords", "Four of Swords", "Five of Swords",
    "Six of Swords", "Seven of Swords", "Eight of Swords", "Nine of Swords", "Ten of Swords",
    "Page of Swords", "Knight of Swords", "Queen of Swords", "King of Swords",

    # Minor Arcana – Pentacles
    "Ace of Pentacles", "Two of Pentacles", "Three of Pentacles", "Four of Pentacles", "Five of Pentacles",
    "Six of Pentacles", "Seven of Pentacles", "Eight of Pentacles", "Nine of Pentacles", "Ten of Pentacles",
    "Page of Pentacles", "Knight of Pentacles", "Queen of Pentacles", "King of Pentacles"
]

# ───────────────────────────────────────────────────────────
def generate_reading():
    """
    Draw a random goal, gender, race, and 6 random tarot cards with orientations.
    """
    selected_goal = random.choice(goal)
    selected_gender = random.choices(genders, weights=[4, 1], k=1)[0] # Select one gender with weights
    # 50/50 chance for race to be the first race in array (should be Human) vs another type of race
    if (random.random() < 0.5):
        selected_race = nimble_races[0]
    else:
        # Highly weighted random selection for race (earlier elements more likely)
        num_races = len(nimble_races)
        race_weights = [(num_races - i)**2 for i in range(num_races)]
        selected_race = random.choices(nimble_races, weights=race_weights, k=1)[0] # Select one race with weights

    drawn_cards = []
    for _ in range(6):
        card = random.choice(tarot_cards)
        orientation = "Reversed" if random.random() < 0.33 else "Upright" # ~33% chance of reversed
        drawn_cards.append(f"{card} ({orientation})")

    return selected_goal, selected_gender, selected_race, drawn_cards

if __name__ == "__main__":
    goal, gender, race, cards = generate_reading()
    card_positions = ["Seed", "Virtue", "Vice", "Rising Power", "Breaking Point", "Fate"]

    # Format cards with positions for output
    formatted_cards = []
    for i, card in enumerate(cards):
        formatted_cards.append({
            "position": card_positions[i],
            "card_text": card
        })

    result = {
        "goal": goal,
        "gender": gender,
        "race": race,
        "cards": formatted_cards
    }
    print(json.dumps(result, indent=2))
