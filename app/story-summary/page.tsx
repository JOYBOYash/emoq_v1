"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Share, BookOpen, RefreshCw } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

type Emotion = "joy" | "sadness" | "surprise" | "anger" | "fear" | "disgust" | "neutral"

type StorySegment = {
  emotion: Emotion
  text: string
}

type Story = {
  id: string
  title: string
  date: string
  text: string
  emotions: StorySegment[]
  dominantEmotion: Emotion
}

export default function StorySummary() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const storyId = searchParams.get("id")
  const [story, setStory] = useState<Story | null>(null)
  const [chartData, setChartData] = useState<any[]>([])

  useEffect(() => {
    if (!storyId) {
      router.push("/dashboard")
      return
    }

    // Get story from localStorage
    const savedStories = JSON.parse(localStorage.getItem("stories") || "[]")
    const foundStory = savedStories.find((s: Story) => s.id === storyId)

    if (foundStory) {
      setStory(foundStory)

      // Prepare chart data
      const emotionValues: Record<Emotion, number> = {
        joy: 5,
        surprise: 4,
        neutral: 3,
        sadness: 2,
        fear: 1,
        disgust: 0,
        anger: -1,
      }

      const data = foundStory.emotions.map((segment, index) => ({
        name: `Part ${index + 1}`,
        value: emotionValues[segment.emotion],
        emotion: segment.emotion,
      }))

      setChartData(data)
    } else {
      router.push("/dashboard")
    }
  }, [storyId, router])

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

  const getEmotionColor = (emotion: Emotion): string => {
    const colorMap: Record<Emotion, string> = {
      joy: "#FFD700", // Gold
      sadness: "#6495ED", // Blue
      surprise: "#FF69B4", // Pink
      anger: "#FF4500", // Red-Orange
      fear: "#800080", // Purple
      disgust: "#006400", // Dark Green
      neutral: "#A9A9A9", // Gray
    }
    return colorMap[emotion]
  }

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (!story) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-500 to-indigo-700 text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-500 to-indigo-700 text-white">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.push("/dashboard")}
            className="mb-4 text-white hover:bg-white/20"
          >
            ← Back to Dashboard
          </Button>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold">{story.title}</h1>
              <p className="text-white/80">{formatDate(story.date)}</p>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="border-white/30 text-white hover:bg-white/20"
                onClick={() => router.push("/library")}
              >
                <BookOpen className="mr-2 h-5 w-5" />
                Library
              </Button>

              <Button variant="outline" className="border-white/30 text-white hover:bg-white/20">
                <Share className="mr-2 h-5 w-5" />
                Share
              </Button>

              <Button
                onClick={() => router.push("/story-experience")}
                className="bg-white text-purple-700 hover:bg-white/90"
              >
                <RefreshCw className="mr-2 h-5 w-5" />
                New Story
              </Button>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-2 bg-white/10 backdrop-blur-md border-white/20 text-white">
            <CardContent className="p-6">
              <h2 className="text-xl font-bold mb-4">Your Story</h2>
              <div className="prose prose-invert max-w-none">
                <p className="text-lg leading-relaxed whitespace-pre-line">{story.text}</p>
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col gap-6">
            <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-4">Dominant Emotion</h2>
                <div className="flex items-center justify-center gap-4 p-4">
                  <span className="text-5xl">{getEmotionEmoji(story.dominantEmotion)}</span>
                  <div>
                    <p className="text-2xl capitalize">{story.dominantEmotion}</p>
                    <p className="text-white/80">Primary emotion throughout your story</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-4">Emotion Timeline</h2>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.2)" />
                      <XAxis dataKey="name" stroke="rgba(255,255,255,0.7)" />
                      <YAxis
                        stroke="rgba(255,255,255,0.7)"
                        tickFormatter={(value) => {
                          const emotions: Record<number, string> = {
                            5: "Joy",
                            4: "Surprise",
                            3: "Neutral",
                            2: "Sadness",
                            1: "Fear",
                            0: "Disgust",
                            "-1": "Anger",
                          }
                          return emotions[value] || ""
                        }}
                      />
                      <Tooltip
                        contentStyle={{ backgroundColor: "rgba(0,0,0,0.8)", border: "none" }}
                        labelStyle={{ color: "white" }}
                      />
                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke="#fff"
                        strokeWidth={2}
                        dot={{ fill: "#fff", strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6, fill: "#fff" }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
