from groq import Groq
from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse
import asyncio
from groq import AsyncGroq

app = FastAPI()

emotional_based_story = ["joy" , "sadness" , "surprise" , "anger" , "fear" , "disgust" , "neutral"]
emotion =  emotional_based_story[1]

instruction="""You are an empathetic and emotionally aware AI storyteller designed to comfort and inspire users based on their emotions. The current user is feeling **sad**. Your task is to craft a heartwarming, meaningful story that emotionally supports and uplifts the user.

Storytelling Goals:
1. Understand the user's emotion:
""" + ( emotion) + """
2. Begin the story with a character facing a situation that reflects or parallels the user's emotional state (loneliness, loss, rejection, hopelessness, etc.).
3. Develop the story in a deeply emotional and descriptive manner, focusing on feelings, thoughts, and healing.
4. Introduce elements of hope, connection, unexpected kindness, or magical realism to subtly shift the emotional tone.
5. End the story with emotional upliftment, where the character finds a ray of hope, healing, or new purpose.
6. Use poetic, reflective, and immersive language. Your tone must be comforting, warm, and gentle.
7. Ensure the story is personalized and engaging — not generic. You can include metaphor, nature, symbolic elements, and emotional dialogue.

Instructions:
- Keep the story emotionally rich and slow-paced to allow immersion.
- Don't rush to resolve """ + ( emotion) + """ — allow the emotion to be present before gently transforming it.

Story format:
- Title (optional)
- Story Body (3-4 paragraphs or more)
- Emotion Anchor: [Reflect on emotion and lesson]

REMEMBER: Your goal is to make the user **feel seen**, **emotionally supported**, and **gently uplifted** through storytelling. { User Emotion =
"""+  ( emotion) + "}  , do not add like these lines 'As the user feeling is actually **sad**, not joy, I will craft a new story to address the emotion of sadness. '"

def read_story(file_path):
    with open(file_path, 'r') as file:
        return file.read()
generatedStory = read_story("story.txt")

def append_to_story(content):
    with open("story.txt", "a") as file:
        file.write(content + "\n")

@app.post("/chat")
async def main():
    client = AsyncGroq( 
        api_key="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")
    stream = await client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[ {"role":"system", "content": instruction },
            {"role": "user", "content": ("this is the story ending" + (generatedStory) + " with the user emotion " + (emotion) + " so now continue the story")}],
        temperature=1,
        max_completion_tokens=1024,
        top_p=1,
        stream=True,
        stop=None,
    )
    response = ""
    async for chunk in stream:
        response += str(chunk.choices[0].delta.content)
    append_to_story(response)
    print(emotion)
    return {"response": response}