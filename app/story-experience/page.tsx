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


type Emotion = "joy" | "sadness" | "surprise" | "anger" | "fear" | "disgust" | "neutral"


type StorySegment = {
  emotion: Emotion
  text: string
}


const storySegments: Record<Emotion, string[]> = {
  joy: [
    "The sun broke through the clouds, casting golden rays across the meadow. You couldn't help but smile.",
    "Children's laughter echoed through the park as colorful balloons danced in the gentle breeze.",
    "The taste of fresh strawberries brought back memories of carefree summer days and endless possibilities.",
  ],
  sadness: [
    "Rain tapped gently against the window, mirroring the tears that threatened to fall from your eyes.",
    "The empty house felt larger somehow, each room filled with echoes of what once was.",
    "Letters, never sent, piled on the desk - words that would never reach their intended recipient.",
  ],
  surprise: [
    "A door appeared in the middle of the forest, its ornate handle gleaming with an invitation to the unknown.",
    "The package arrived unmarked, and inside was exactly what you had been dreaming of but never told anyone.",
    "The old map revealed a hidden passage that wasn't there yesterday, promising adventure and mystery.",
  ],
  anger: [
    "The betrayal burned like fire in your veins, demanding justice that seemed forever out of reach.",
    "Words spoken in haste created walls that seemed impossible to tear down.",
    "The injustice of the situation fueled a determination to fight against all odds.",
  ],
  fear: [
    "Shadows stretched longer as the sun set, and something seemed to move just beyond your field of vision.",
    "The old house creaked and groaned as if telling secrets you weren't sure you wanted to hear.",
    "Each step deeper into the cave took you further from safety and closer to the unknown darkness.",
  ],
  disgust: [
    "The once beautiful garden had been overtaken by decay, nature reclaiming what humans had abandoned.",
    "Corruption had seeped into every corner of the institution, leaving nothing untainted by greed.",
    "What was once pure had been twisted into something unrecognizable, a perversion of its former self.",
  ],
  neutral: [
    "The path continued ahead, neither inviting nor threatening, simply existing as a way forward.",
    "Clouds drifted across the sky, changing shape with the wind's direction.",
    "The routine of daily life continued, a comfortable rhythm in an unpredictable world.",
  ],
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
    const emotions: Emotion[] = ["joy", "sadness", "surprise", "anger", "fear", "disgust", "neutral"]

    if (!isPaused) {
      timer = setInterval(() => {
        // Random emotion detection simulation
        const newEmotion = emotions[Math.floor(Math.random() * emotions.length)]
        setCurrentEmotion(newEmotion)

        // Add story segment based on emotion
        const newSegment = storySegments[newEmotion][Math.floor(Math.random() * storySegments[newEmotion].length)]
        setStoryText((prev) => prev + " " + newSegment)

        // Track emotion history
        setEmotionHistory((prev) => [...prev, { emotion: newEmotion, text: newSegment }])

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
