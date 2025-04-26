"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Pause, Save, X } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { GoogleGenAI } from "@google/genai"

type Emotion = "joy" | "sadness" | "surprise" | "anger" | "fear" | "disgust" | "neutral"

type StorySegment = {
  emotion: Emotion
  text: string
  tone: string
}

const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY })

const emotions: Emotion[] = ["joy", "sadness", "surprise", "anger", "fear", "disgust", "neutral"]

// Define tone mappings for emotions
const toneMap: Record<Emotion, string> = {
  joy: "cheerful",
  sadness: "melancholic",
  surprise: "mysterious",
  anger: "intense",
  fear: "suspenseful",
  disgust: "disgusting",
  neutral: "neutral",
}

export default function StoryExperience() {
  const router = useRouter()
  const videoRef = useRef<HTMLVideoElement>(null)
  const [currentEmotion, setCurrentEmotion] = useState<Emotion>("neutral")
  const [storyText, setStoryText] = useState<string>("")
  const [storyProgress, setStoryProgress] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [showExitDialog, setShowExitDialog] = useState(false)
  const [emotionHistory, setEmotionHistory] = useState<StorySegment[]>([])

  // Function to fetch story segment from Gemini AI
  const fetchStorySegment = async (emotion: Emotion, tone: string) => {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: `Generate a short two-lines story segment for the emotion: ${emotion} in the tone: ${tone} to suit the emotion of the user`,
      })
      return response.text
    } catch (error) {
      console.error("Error fetching story segment from Gemini AI:", error)
      return "Something went wrong while generating the story."
    }
  }

  // Simulate emotion detection
  useEffect(() => {
    let timer: NodeJS.Timeout

    const startCamera = async () => {
      try {
        if (videoRef.current) {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true })
          videoRef.current.srcObject = stream
        }
      } catch (error) {
        console.error("Error accessing camera:", error)
      }
    }

    startCamera()

    // Simulate emotion detection with random emotions
    if (!isPaused) {
      timer = setInterval(async () => {
        // Random emotion detection simulation
        const newEmotion = emotions[Math.floor(Math.random() * emotions.length)]
        setCurrentEmotion(newEmotion)

        // Fetch the tone based on the detected emotion
        const tone = toneMap[newEmotion]

        // Fetch the story segment from Gemini AI
        const newSegment = await fetchStorySegment(newEmotion, tone)

        // Update story text and history
        setStoryText((prev) => prev + " " + newSegment)
        setEmotionHistory((prev) => [...prev, { emotion: newEmotion, text: newSegment, tone }])

        // Update progress (max 100)
        setStoryProgress((prev) => Math.min(prev + 5, 100))

        // End story when progress reaches 100
        if (storyProgress >= 100) {
          clearInterval(timer)
          endStory()
        }
      }, 5000) // Change emotion every 5 seconds
    }

    return () => {
      clearInterval(timer)
      // Stop camera when component unmounts
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream
        stream.getTracks().forEach((track) => track.stop())
      }
    }
  }, [isPaused, storyProgress])

  const togglePause = () => {
    setIsPaused(!isPaused)
  }

  const endStory = () => {
    // Save story to localStorage
    const story = {
      id: Date.now().toString(),
      title: "Your Emotional Journey",
      date: new Date().toISOString(),
      text: storyText,
      emotions: emotionHistory,
      dominantEmotion: getMostFrequentEmotion(),
    }

    const savedStories = JSON.parse(localStorage.getItem("stories") || "[]")
    localStorage.setItem("stories", JSON.stringify([story, ...savedStories]))

    // Navigate to summary page
    router.push(`/story-summary?id=${story.id}`)
  }

  const getMostFrequentEmotion = (): Emotion => {
    const emotionCounts: Record<string, number> = {}
    emotionHistory.forEach((segment) => {
      emotionCounts[segment.emotion] = (emotionCounts[segment.emotion] || 0) + 1
    })

    let maxEmotion: Emotion = "neutral"
    let maxCount = 0

    Object.entries(emotionCounts).forEach(([emotion, count]) => {
      if (count > maxCount) {
        maxCount = count
        maxEmotion = emotion as Emotion
      }
    })

    return maxEmotion
  }

  const getEmotionEmoji = (emotion: Emotion): string => {
    const emojiMap: Record<Emotion, string> = {
      joy: "😊",
      sadness: "😢",
      surprise: "😲",
      anger: "😠",
      fear: "😨",
      disgust: "🤢",
      neutral: "😐",
    }
    return emojiMap[emotion]
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-500 to-indigo-700 text-white">
      <div className="container mx-auto px-4 py-8 flex flex-col h-screen">
        <header className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Your Story Experience</h1>
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" onClick={togglePause} className="text-white hover:bg-white/20">
              <Pause className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowExitDialog(true)}
              className="text-white hover:bg-white/20"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </header>

        <div className="flex flex-col md:flex-row gap-6 flex-1 overflow-hidden">
          <div className="md:w-1/3 flex flex-col items-center">
            <div className="relative w-48 h-48 rounded-full overflow-hidden border-4 border-white mb-4">
              <video ref={videoRef} autoPlay playsInline muted className="absolute w-full h-full object-cover" />
            </div>

            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
              key={currentEmotion}
              className="bg-white/20 backdrop-blur-md rounded-full px-6 py-3 text-center"
            >
              <p className="text-lg">
                You seem {currentEmotion} {getEmotionEmoji(currentEmotion)}
              </p>
            </motion.div>

            <div className="mt-auto w-full">
              <div className="flex justify-between text-sm mb-2">
                <span>Story Progress</span>
                <span>{storyProgress}%</span>
              </div>
              <Progress value={storyProgress} className="h-2" />
            </div>
          </div>

          <div className="md:w-2/3 bg-white/10 backdrop-blur-md rounded-xl p-6 overflow-y-auto">
            <div className="prose prose-invert max-w-none">
              {storyText ? (
                <p className="text-lg leading-relaxed">{storyText}</p>
              ) : (
                <p className="text-lg text-white/70">Your story will appear here as your emotions are detected...</p>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-center">
          <Button onClick={endStory} className="bg-white text-purple-700 hover:bg-white/90">
            <Save className="mr-2 h-5 w-5" />
            End & Save Story
          </Button>
        </div>
      </div>

      <AlertDialog open={showExitDialog} onOpenChange={setShowExitDialog}>
        <AlertDialogContent className="bg-white text-gray-900">
          <AlertDialogHeader>
            <AlertDialogTitle>Exit Story Experience?</AlertDialogTitle>
            <AlertDialogDescription>
              Your story progress will be lost. Are you sure you want to exit?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => router.push("/dashboard")}>Exit</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
