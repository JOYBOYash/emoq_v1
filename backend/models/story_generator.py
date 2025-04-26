def generate_story_segment(emotion: str, current_segment: int) -> dict:
    """
    Generate a story segment based on detected emotion and current progress.
    """
    story_templates = {
        "happy": [
            "Joy filled the valley as the sun rose.",
            "Smiles were exchanged as dreams blossomed."
        ],
        "sad": [
            "The night grew colder as memories faded.",
            "Silent tears fell in a forgotten corner."
        ],
        "angry": [
            "Thunder cracked in the sky as rage brewed.",
            "Every heartbeat echoed with rebellion."
        ],
        "fear": [
            "The mist thickened, and every step felt heavier.",
            "Eyes darted in search of unseen terrors."
        ],
        "surprise": [
            "The unknown revealed a gift none could imagine.",
            "Gasps filled the air as wonders appeared."
        ],
        "disgust": [
            "Shadows twisted into grotesque shapes.",
            "An eerie stench tainted the air around."
        ],
        "neutral": [
            "The journey continued quietly, steady and calm.",
            "Each step forward was a patient resolve."
        ]
    }

    options = story_templates.get(emotion, story_templates["neutral"])
    text = options[current_segment % len(options)]

    return {
        "emotion": emotion,
        "segment": current_segment,
        "text": text
    }
