#!/usr/bin/env python3
"""
AI Chat Fallback Response Generator
Provides random fallback responses for AI chat when external services fail
"""

import random
import json
import sys

# Fallback responses for when AI services are unavailable
FALLBACK_RESPONSES = [
    "The shadows deepen around you as you consider your next move.",
    "Your torch flickers as you sense something watching from the darkness.",
    "The ancient stones seem to whisper forgotten secrets. Roll a d20 for perception.",
    "A chill wind carries the scent of danger. How do you proceed?",
]

# Common suggestions for player actions
FALLBACK_SUGGESTIONS = [
    "Roll d20",
    "Ask oracle question", 
    "Check for traps",
    "Listen carefully",
    "Examine surroundings",
    "Rest and recover",
    "Consult your equipment",
    "Search the area"
]

def get_fallback_response():
    """
    Get a random fallback response with suggestions
    
    Returns:
        dict: Response data with message and suggestions
    """
    response = random.choice(FALLBACK_RESPONSES)
    
    # Get 2-3 random suggestions
    num_suggestions = random.randint(2, 3)
    suggestions = random.sample(FALLBACK_SUGGESTIONS, num_suggestions)
    
    return {
        "response": response,
        "suggestions": suggestions,
        "type": "fallback",
        "timestamp": "auto_generated"
    }

def main():
    """Main function for command line usage"""
    result = get_fallback_response()
    print(json.dumps(result))

if __name__ == "__main__":
    main()
