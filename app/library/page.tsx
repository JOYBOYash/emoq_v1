"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Search, ArrowLeft, Trash2, BookOpen, Share } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

type Emotion = "joy" | "sadness" | "surprise" | "anger" | "fear" | "disgust" | "neutral"

type Story = {
  id: string
  title: string
  date: string
  text: string
  dominantEmotion: Emotion
}

export default function Library() {
  const router = useRouter()
  const [stories, setStories] = useState<Story[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredStories, setFilteredStories] = useState<Story[]>([])

  useEffect(() => {
    // Get stories from localStorage
    const savedStories = JSON.parse(localStorage.getItem("stories") || "[]")
    setStories(savedStories)
    setFilteredStories(savedStories)
  }, [])

  useEffect(() => {
    if (searchQuery) {
      const filtered = stories.filter(
        (story) =>
          story.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          story.text.toLowerCase().includes(searchQuery.toLowerCase()),
      )
      setFilteredStories(filtered)
    } else {
      setFilteredStories(stories)
    }
  }, [searchQuery, stories])

  const deleteStory = (id: string) => {
    const updatedStories = stories.filter((story) => story.id !== id)
    setStories(updatedStories)
    localStorage.setItem("stories", JSON.stringify(updatedStories))
  }

  const openStory = (id: string) => {
    router.push(`/story-summary?id=${id}`)
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

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
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
            <ArrowLeft className="mr-2 h-5 w-5" />
            Back to Dashboard
          </Button>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <h1 className="text-3xl font-bold">Your Story Library</h1>

            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/70" />
              <Input
                type="text"
                placeholder="Search stories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/70"
              />
            </div>
          </div>
        </header>

        {filteredStories.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <BookOpen className="h-16 w-16 mb-4 opacity-50" />
            <h2 className="text-2xl font-bold mb-2">Your Library is Empty</h2>
            <p className="text-white/80 mb-6">
              {searchQuery ? "No stories match your search." : "Start creating emotional stories to fill your library."}
            </p>
            {!searchQuery && (
              <Button
                onClick={() => router.push("/story-experience")}
                className="bg-white text-purple-700 hover:bg-white/90"
              >
                Create Your First Story
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStories.map((story) => (
              <motion.div
                key={story.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white h-full flex flex-col">
                  <CardContent className="p-6 flex-1">
                    <div className="flex justify-between items-start mb-4">
                      <h2 className="text-xl font-bold">{story.title}</h2>
                      <span className="text-2xl">{getEmotionEmoji(story.dominantEmotion)}</span>
                    </div>

                    <p className="text-white/70 text-sm mb-4">{formatDate(story.date)}</p>

                    <p className="line-clamp-4 text-white/90">{story.text.substring(0, 150)}...</p>
                  </CardContent>

                  <CardFooter className="p-6 pt-0 flex justify-between">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-white hover:bg-white/20"
                      onClick={() => openStory(story.id)}
                    >
                      <BookOpen className="mr-2 h-4 w-4" />
                      Read
                    </Button>

                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
                        <Share className="h-4 w-4" />
                      </Button>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-white text-gray-900">
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Story</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this story? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteStory(story.id)}
                              className="bg-red-500 text-white hover:bg-red-600"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
