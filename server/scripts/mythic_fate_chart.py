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
    
    return {
        "roll": roll,
        "threshold": threshold,
        "success": success,
        "exceptional": exceptional,
        "result": result_text,
        "likelihood": likelihood,
        "chaos_factor": chaos_factor,
        "likelihood_index": likelihood_index
    }

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
