#!/usr/bin/env python3
"""
Scene Generation System for Mythic GME
Handles all scene generation logic including chaos rolls, scene setup, and random events
"""

import random
import json
import sys
import os

# Add the scripts directory to path so we can import other modules
script_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.append(script_dir)

# Import Mythic modules
from mythic_fate_chart import roll_fate_chart
from mythic_meaning_table import roll_meaning_table

# Random Event Focus Table (d100) - from Mythic GME
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

def roll_chaos_factor(chaos_factor=5):
    """
    Roll a d10 for chaos factor determination
    
    Args:
        chaos_factor (int): Current chaos factor (1-9)
        
    Returns:
        dict: Chaos roll result and scene determination
    """
    chaos_roll = random.randint(1, 10)
    
    if chaos_roll > chaos_factor:
        scene_type = "expected"
    elif chaos_roll < chaos_factor:
        scene_type = "altered"
    else:
        scene_type = "interrupted"
    
    return {
        "chaos_roll": chaos_roll,
        "chaos_factor": chaos_factor,
        "scene_type": scene_type
    }

def roll_random_event_focus():
    """
    Roll on the Random Event Focus Table
    
    Returns:
        dict: Random event focus result
    """
    roll = random.randint(1, 100)
    
    for min_val, max_val, event_type in RANDOM_EVENT_FOCUS_TABLE:
        if min_val <= roll <= max_val:
            return {
                "focus_roll": roll,
                "focus": event_type,
                "focus_range": f"{min_val}-{max_val}"
            }
    
    # Fallback (shouldn't happen)
    return {
        "focus_roll": roll,
        "focus": "Current Context",
        "focus_range": "86-100"
    }

def generate_random_event():
    """
    Generate a complete random event with focus and meaning
    
    Returns:
        dict: Complete random event data
    """
    focus_result = roll_random_event_focus()
    meaning_result = roll_meaning_table()
    
    return {
        "focus": focus_result["focus"],
        "focus_roll": focus_result["focus_roll"],
        "focus_range": focus_result["focus_range"],
        "meaning_action": meaning_result["verb"],
        "meaning_subject": meaning_result["subject"],
        "meaning_roll_verb": meaning_result["verb_roll"],
        "meaning_roll_subject": meaning_result["subject_roll"],
        "meaning": meaning_result["meaning"],
        "description": f"Random event involves {focus_result['focus']}: {meaning_result['meaning']}"
    }

def process_scene_setup(chaos_factor=5):
    """
    Process complete scene setup including chaos roll and potential random events
    
    Args:
        chaos_factor (int): Current chaos factor (1-9)
        
    Returns:
        dict: Complete scene setup result
    """
    chaos_result = roll_chaos_factor(chaos_factor)
    
    result = {
        "chaos_roll": chaos_result["chaos_roll"],
        "chaos_factor": chaos_result["chaos_factor"],
        "scene_type": chaos_result["scene_type"],
        "random_event": None
    }
    
    # Generate random event for altered or interrupted scenes
    if chaos_result["scene_type"] in ["altered", "interrupted"]:
        result["random_event"] = generate_random_event()
    
    return result

def process_fate_rolls(fate_questions, chaos_factor=5):
    """
    Process multiple fate roll questions
    
    Args:
        fate_questions (list): List of fate questions with likelihood
        chaos_factor (int): Current chaos factor for rolls
        
    Returns:
        list: Processed fate roll results
    """
    results = []
    
    for question in fate_questions:
        likelihood = question.get("likelihood", "50/50")
        fate_result = roll_fate_chart(likelihood, chaos_factor)
        
        results.append({
            "question": question.get("question", "Unknown question"),
            "likelihood": likelihood,
            "roll": fate_result["roll"],
            "threshold": fate_result["threshold"],
            "result": fate_result["result"],
            "success": fate_result["success"],
            "exceptional": fate_result["exceptional"],
            "doubles": fate_result["doubles"],
            "random_event": fate_result.get("random_event")
        })
    
    return results

def generate_scene_id():
    """Generate a unique scene ID"""
    timestamp = int(random.random() * 1000000)
    random_part = ''.join(random.choices('abcdefghijklmnopqrstuvwxyz0123456789', k=9))
    return f"scene_{timestamp}_{random_part}"

def main():
    """Main function for command line usage"""
    if len(sys.argv) < 2:
        print(json.dumps({"error": "Usage: python scene_generator.py <command> [args...]"}))
        return
    
    command = sys.argv[1]
    
    try:
        if command == "chaos_roll":
            chaos_factor = int(sys.argv[2]) if len(sys.argv) > 2 else 5
            result = roll_chaos_factor(chaos_factor)
            print(json.dumps(result))
            
        elif command == "random_event":
            result = generate_random_event()
            print(json.dumps(result))
            
        elif command == "scene_setup":
            chaos_factor = int(sys.argv[2]) if len(sys.argv) > 2 else 5
            result = process_scene_setup(chaos_factor)
            print(json.dumps(result))
            
        elif command == "fate_rolls":
            # Expect JSON input for fate questions
            fate_questions_json = sys.argv[2] if len(sys.argv) > 2 else "[]"
            chaos_factor = int(sys.argv[3]) if len(sys.argv) > 3 else 5
            
            fate_questions = json.loads(fate_questions_json)
            result = process_fate_rolls(fate_questions, chaos_factor)
            print(json.dumps(result))
            
        elif command == "scene_id":
            result = {"scene_id": generate_scene_id()}
            print(json.dumps(result))
            
        else:
            print(json.dumps({"error": f"Unknown command: {command}"}))
            
    except Exception as e:
        print(json.dumps({"error": str(e)}))

if __name__ == "__main__":
    main()
