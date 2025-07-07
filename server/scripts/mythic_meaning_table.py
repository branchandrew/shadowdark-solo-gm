#!/usr/bin/env python3
"""
Mythic GME Meaning Table Implementation
Handles Action/Subject generation with 2d100 rolls
"""

import random
import json
import sys

# ─────────────────────────────────────────────────────────────
# ACTION TABLE (two d100 columns, a.k.a. Action & Subject)
# ─────────────────────────────────────────────────────────────
ACTION_VERB = [
    "Abandon","Accompany","Activate","Agree","Ambush","Arrive","Assist","Attack",
    "Attain","Bargain","Befriend","Bestow","Betray","Block","Break","Carry",
    "Celebrate","Change","Close","Combine","Communicate","Conceal","Continue",
    "Control","Create","Deceive","Decrease","Defend","Delay","Deny","Depart",
    "Deposit","Destroy","Dispute","Disrupt","Distrust","Divide","Drop","Easy",
    "Energize","Escape","Expose","Fail","Fight","Flee","Free","Guide","Harm",
    "Heal","Hinder","Imitate","Imprison","Increase","Indulge","Inform","Inquire",
    "Inspect","Invade","Leave","Lure","Misuse","Move","Neglect","Observe","Open",
    "Oppose","Overthrow","Praise","Proceed","Protect","Punish","Pursue","Recruit",
    "Refuse","Release","Relinquish","Repair","Repulse","Return","Reward",
    "Representative","Riches","Safety","Strength","Success","Suffering","Surprise",
    "Tactic","Technology","Tension","Time","Trial","Value","Vehicle","Victory",
    "Vulnerability","Weapon","Weather","Work","Wound"
]

ACTION_SUBJECT = [
    "Advantage","Adversity","Agreement","Animal","Attention","Balance","Battle",
    "Benefits","Building","Burden","Bureaucracy","Business","Chaos","Comfort",
    "Completion","Conflict","Cooperation","Danger","Defense","Depletion",
    "Disadvantage","Distraction","Elements","Emotion","Enemy","Energy",
    "Environment","Expectation","Exterior","Extravagance","Failure","Fame","Fear",
    "Freedom","Friend","Goal","Group","Health","Hindrance","Home","Hope","Idea",
    "Illness","Illusion","Individual","Information","Innocent","Intellect",
    "Interior","Investment","Leadership","Legal","Location","Military",
    "Misfortune","Mundane","Nature","Needs","News","Normal","Object","Obscurity",
    "Official","Opposition","Outside","Pain","Path","Peace","People","Personal",
    "Physical","Plot","Portal","Possessions","Poverty","Power","Prison","Project",
    "Protection","Reassurance","Ruin","Separate","Start","Stop","Strange",
    "Struggle","Succeed","Support","Suppress","Take","Threaten","Transform",
    "Trap","Travel","Triumph","Truce","Trust","Use","Usurp","Waste"
]

def roll_meaning_table():
    """
    Roll on the Mythic Meaning Table (Action/Subject)
    
    Returns:
        dict: Result containing verb and subject with roll values
    """
    
    # Roll 2d100 for verb and subject
    verb_roll = random.randint(1, 100)
    subject_roll = random.randint(1, 100)
    
    # Get verb (1-indexed, so subtract 1 for array access)
    verb_index = min(verb_roll - 1, len(ACTION_VERB) - 1)
    verb = ACTION_VERB[verb_index]
    
    # Get subject (1-indexed, so subtract 1 for array access)
    subject_index = min(subject_roll - 1, len(ACTION_SUBJECT) - 1)
    subject = ACTION_SUBJECT[subject_index]
    
    return {
        "verb_roll": verb_roll,
        "verb": verb,
        "verb_index": verb_index + 1,  # Return 1-indexed for display
        "subject_roll": subject_roll,
        "subject": subject,
        "subject_index": subject_index + 1,  # Return 1-indexed for display
        "meaning": f"{verb} {subject}"
    }

def main():
    """Main function for command line usage"""
    result = roll_meaning_table()
    print(json.dumps(result, indent=2))

if __name__ == "__main__":
    main()
