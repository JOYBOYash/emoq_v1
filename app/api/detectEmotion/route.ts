// app/api/detectEmotion/route.ts

import { NextResponse } from 'next/server'
import Groq from "groq-sdk"

const groq = new Groq({ apiKey: process.env.NEXT_PUBLIC_XAI_API_KEY })

export async function POST(req: Request) {
  try {
    const { imageBase64 } = await req.json()

    // Prompt to detect emotion from image
    const prompt = `
You are an expert emotion detection AI. Based only on the photo provided (in base64), detect the user's primary emotion.
Possible emotions: joy, sadness, surprise, anger, fear, disgust, neutral.

Photo base64: ${imageBase64}

Respond with only the emotion word (joy, sadness, etc.), nothing else.
    `

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: "user", content: prompt }
      ],
      model: "llama3-70b-8192"  // or use 70b-versatile if you want
    })

    const emotion = chatCompletion.choices[0]?.message?.content?.toLowerCase().trim() || "neutral"

    return NextResponse.json({ emotion })
  } catch (error) {
    console.error('Error detecting emotion:', error)
    return NextResponse.json({ emotion: "neutral" }, { status: 500 })
  }
}
