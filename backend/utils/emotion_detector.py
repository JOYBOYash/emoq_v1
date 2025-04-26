from deepface import DeepFace
import os

def detect_emotion(image_path: str) -> str:
    """
    Analyze image and return dominant emotion.
    """
    try:
        result = DeepFace.analyze(img_path=image_path, actions=['emotion'], enforce_detection=False)
        emotion = result[0]['dominant_emotion']
        return emotion
    except Exception as e:
        print(f"Emotion detection failed: {e}")
        return "neutral"
