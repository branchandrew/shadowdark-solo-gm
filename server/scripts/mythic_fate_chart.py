#!/usr/bin/env python3
"""
Mythic GME Fate Chart Implementation
Handles yes/no questions based on likelihood and chaos factor
"""

import random
import json
import sys

# Fate Chart lookup table - maximum roll needed for "Yes" result
# Format: FATE_CHART[likelihood_index][chaos_factor - 1]
FATE_CHART = [
    # Impossible
    [1, 1, 1, 1, 2, 3, 5, 7, 10],
    # Nearly Impossible
    [1, 1, 1, 2, 3, 5, 7, 10, 13],
    # Very Unlikely
    [1, 1, 2, 3, 5, 7, 10, 13, 15],
    # Unlikely
    [1, 2, 3, 5, 7, 10, 13, 15, 17],
    # 50/50
    [2, 3, 5, 7, 10, 13, 15, 17, 18],
    # Likely
    [5, 7, 10, 13, 15, 17, 18, 19, 19],
    # Very Likely
    [7, 10, 13, 15, 17, 18, 19, 19, 20],
    # Nearly Certain
    [10, 13, 15, 17, 18, 19, 19, 20, 20],
    # Certain
    [13, 15, 17, 18, 19, 19, 20, 20, 20]
]

LIKELIHOOD_NAMES = [
    "Impossible",
    "Nearly Impossible",
    "Very Unlikely",
    "Unlikely",
    "50/50",
    "Likely",
    "Very Likely",
    "Nearly Certain",
    "Certain"
]

# Random Event Focus Table (d100)
RANDOM_EVENT_FOCUS_TABLE = [
    (1, 5, "Remote Event"),
    (6, 10, "Ambiguous Event"),
    (11, 20, "New NPC"),
    (21, 40, "NPC Action"),
    (41, 45, "NPC Negative"),
    (46, 50, "NPC Positive"),
    (51, 55, "Move Toward A Thread"),
    (56, 65, "Move Away From A Thread"),
    (66, 70, "Close A Thread"),
    (71, 80, "PC Negative"),
    (81, 85, "PC Positive"),
    (86, 100, "Current Context")
]

def roll_random_event():
    """Roll on the Random Event Focus Table"""
    roll = random.randint(1, 100)

    for min_val, max_val, event_type in RANDOM_EVENT_FOCUS_TABLE:
        if min_val <= roll <= max_val:
            return {
                "event_roll": roll,
                "event_type": event_type,
                "event_range": f"{min_val}-{max_val}"
            }

    # Fallback (shouldn't happen)
    return {
        "event_roll": roll,
        "event_type": "Current Context",
        "event_range": "86-100"
    }

def has_doubles(roll):
    """Check if a roll has doubles (same digit in tens and ones place)"""
    if roll < 10:
        return False  # Single digit rolls can't have doubles

    tens = roll // 10
    ones = roll % 10
    return tens == ones

def roll_fate_chart(likelihood="50/50", chaos_factor=5):
    """
    Roll on the Mythic Fate Chart

    Args:
        likelihood (str): The likelihood level (default: "50/50")
        chaos_factor (int): Current chaos factor 1-9 (default: 5)

    Returns:
        dict: Result containing roll, success, and details
    """

    # Validate chaos factor
    if not isinstance(chaos_factor, int) or chaos_factor < 1 or chaos_factor > 9:
        chaos_factor = 5

    # Find likelihood index
    likelihood_index = 4  # Default to 50/50
    if likelihood in LIKELIHOOD_NAMES:
        likelihood_index = LIKELIHOOD_NAMES.index(likelihood)

    # Roll d100 (1-99, treating 100 as 00)
    roll = random.randint(1, 99)

    # Get threshold from chart
    threshold = FATE_CHART[likelihood_index][chaos_factor - 1]

    # Determine result
    success = roll <= threshold

    # Check for exceptional results
    exceptional = False
    if success and roll <= (threshold // 5):  # Exceptional Yes (1/5 of threshold)
        exceptional = True
        result_text = "Exceptional Yes"
    elif not success and roll >= 96:  # Exceptional No (96-99)
        exceptional = True
        result_text = "Exceptional No"
    elif success:
        result_text = "Yes"
    else:
        result_text = "No"

    # Check for doubles and random events
    doubles_rolled = has_doubles(roll)
    random_event = None

    # Random events occur on doubles, but NOT on exceptional results
    if doubles_rolled and not exceptional:
        random_event = roll_random_event()

    result = {
        "roll": roll,
        "threshold": threshold,
        "success": success,
        "exceptional": exceptional,
        "result": result_text,
        "likelihood": likelihood,
        "chaos_factor": chaos_factor,
        "likelihood_index": likelihood_index,
        "doubles": doubles_rolled
    }

    # Add random event data if it occurred
    if random_event:
        result["random_event"] = random_event

    return result

def main():
    """Main function for command line usage"""
    # Parse command line arguments or use defaults
    likelihood = "50/50"
    chaos_factor = 5

    if len(sys.argv) > 1:
        likelihood = sys.argv[1]
    if len(sys.argv) > 2:
        try:
            chaos_factor = int(sys.argv[2])
        except ValueError:
            chaos_factor = 5

    result = roll_fate_chart(likelihood, chaos_factor)
    print(json.dumps(result, indent=2))

if __name__ == "__main__":
    main()
