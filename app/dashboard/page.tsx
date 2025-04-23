"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Settings, Play, BookOpen, Heart, History } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

type StoryCard = {
  id: string
  title: string
  date: string
  emotion: string
  emoji: string
}

export default function Dashboard() {
  const router = useRouter()
  const [userName, setUserName] = useState("Friend")
  const [recentStories, setRecentStories] = useState<StoryCard[]>([])

  useEffect(() => {
    // Check if permissions are granted
    const permissionsGranted = localStorage.getItem("permissionsGranted")
    if (!permissionsGranted) {
      router.push("/permissions")
    }

    // Mock data for recent stories
    setRecentStories([
      { id: "1", title: "The Enchanted Forest", date: "2 days ago", emotion: "Joy", emoji: "😊" },
      { id: "2", title: "The Lost City", date: "1 week ago", emotion: "Surprise", emoji: "😲" },
    ])
  }, [router])

  const startStory = () => {
    router.push("/story-experience")
  }

  const openSettings = () => {
    router.push("/settings")
  }

  const openLibrary = () => {
    router.push("/library")
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-500 to-indigo-700 text-white">
      <div className="container mx-auto px-4 py-8">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Welcome, {userName}</h1>
            <p className="text-white/80">Ready for an emotional journey?</p>
          </div>

          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={openSettings} className="text-white hover:bg-white/20">
              <Settings className="h-6 w-6" />
            </Button>
            <Avatar className="h-10 w-10 border-2 border-white">
              <AvatarImage src="/placeholder.svg?height=40&width=40" alt="User" />
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
          </div>
        </header>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
            <CardContent className="pt-6 flex flex-col items-center">
              <div className="mb-6 text-center">
                <h2 className="text-2xl font-bold mb-2">Begin Your Emotional Story</h2>
                <p className="text-white/80">
                  Our AI will craft a unique story that adapts to your emotions in real-time.
                </p>
              </div>

              <Button
                onClick={startStory}
                size="lg"
                className="bg-white text-purple-700 hover:bg-white/90 w-full sm:w-auto"
              >
                <Play className="mr-2 h-5 w-5" />
                Start Emotion Story
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
            <CardHeader>
              <CardTitle className="flex items-center">
                <History className="mr-2 h-5 w-5" />
                Last Story
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentStories.length > 0 ? (
                <div>
                  <h3 className="font-medium">{recentStories[0].title}</h3>
                  <p className="text-sm text-white/70">{recentStories[0].date}</p>
                  <div className="mt-2 flex items-center">
                    <span className="text-xl mr-2">{recentStories[0].emoji}</span>
                    <span>{recentStories[0].emotion}</span>
                  </div>
                </div>
              ) : (
                <p>No stories yet</p>
              )}
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Heart className="mr-2 h-5 w-5" />
                Emotions Detected
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                <span className="bg-white/20 px-3 py-1 rounded-full text-sm">Joy 😊</span>
                <span className="bg-white/20 px-3 py-1 rounded-full text-sm">Surprise 😲</span>
                <span className="bg-white/20 px-3 py-1 rounded-full text-sm">Calm 😌</span>
                <span className="bg-white/20 px-3 py-1 rounded-full text-sm">Sadness 😢</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
            <CardHeader>
              <CardTitle className="flex items-center">
                <BookOpen className="mr-2 h-5 w-5" />
                Story Library
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-4">
              <p className="mb-4">Access all your past emotional journeys.</p>
            </CardContent>
            <CardFooter>
              <Button
                variant="outline"
                onClick={openLibrary}
                className="w-full border-white/30 text-white hover:bg-white/20"
              >
                View Library
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}
