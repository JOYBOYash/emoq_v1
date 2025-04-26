// "use client"

// import { useEffect, useRef, useState } from "react"
// import { useRouter } from "next/navigation"
// import { motion } from "framer-motion"
// import { Button } from "@/components/ui/button"
// import { Progress } from "@/components/ui/progress"
// import { Pause, Save, X } from "lucide-react"
// import {
//   AlertDialog,
//   AlertDialogAction,
//   AlertDialogCancel,
//   AlertDialogContent,
//   AlertDialogDescription,
//   AlertDialogFooter,
//   AlertDialogHeader,
//   AlertDialogTitle,
// } from "@/components/ui/alert-dialog"
// import { GoogleGenAI } from "@google/genai"

// type Emotion = "joy" | "sadness" | "surprise" | "anger" | "fear" | "disgust" | "neutral"

// type StorySegment = {
//   emotion: Emotion
//   text: string
//   tone: string
// }

// const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY })

// const emotions: Emotion[] = ["joy", "sadness", "surprise", "anger", "fear", "disgust", "neutral"]

// // Define tone mappings for emotions
// const toneMap: Record<Emotion, string> = {
//   joy: "cheerful",
//   sadness: "melancholic",
//   surprise: "mysterious",
//   anger: "intense",
//   fear: "suspenseful",
//   disgust: "disgusting",
//   neutral: "neutral",
// }

// // Function to speak text aloud
// const speakText = (text: string): Promise<void> => {
//   return new Promise((resolve) => {
//     if (typeof window !== "undefined" && "speechSynthesis" in window) {
//       const utterance = new SpeechSynthesisUtterance(text)
//       utterance.lang = "en-US"
//       utterance.rate = 1
//       utterance.pitch = 1
//       utterance.onend = () => resolve() // Promise resolves when speaking finishes
//       window.speechSynthesis.speak(utterance)
//     } else {
//       resolve() // If speechSynthesis not available, resolve immediately
//     }
//   })
// }

// export default function StoryExperience() {
//   const router = useRouter()
//   const videoRef = useRef<HTMLVideoElement>(null)
//   const [currentEmotion, setCurrentEmotion] = useState<Emotion>("neutral")
//   const [storyText, setStoryText] = useState<string>("")
//   const [storyProgress, setStoryProgress] = useState(0)
//   const [isPaused, setIsPaused] = useState(false)
//   const [showExitDialog, setShowExitDialog] = useState(false)
//   const [emotionHistory, setEmotionHistory] = useState<StorySegment[]>([])
//   const [lastSegment, setLastSegment] = useState<string>("")
//   const [isSpeaking, setIsSpeaking] = useState(false)
//   const [isGeneratingStory, setIsGeneratingStory] = useState(false)
//   const storyIntervalRef = useRef<NodeJS.Timeout | null>(null)

//   // Function to fetch story segment from Gemini AI
//   const fetchStorySegment = async (emotion: Emotion, tone: string, previousSegment: string) => {
//     try {
//       const prompt = previousSegment
//         ? `Continue the following story segment smoothly based on the user's current emotion.\n\nPrevious Segment: "${previousSegment}"\n\nNow, generate the next short two-lines story segment in a ${tone} tone to suit the emotion: ${emotion}.`
//         : `Start a new short two-lines story segment in a ${tone} tone to suit the emotion: ${emotion}.`
  
//       const response = await ai.models.generateContent({
//         model: "gemini-2.0-flash",
//         contents: prompt,
//       })
  
//       return response.text
//     } catch (error) {
//       console.error("Error fetching story segment from Gemini AI:", error)
//       return "Something went wrong while generating the story."
//     }
//   }

//   // Process a new emotion and generate story segment
//   const processNewEmotion = async () => {
//     if (isPaused || isSpeaking || isGeneratingStory || storyProgress >= 100) {
//       return
//     }

//     setIsGeneratingStory(true)
    
//     // Random emotion detection simulation
//     const newEmotion = emotions[Math.floor(Math.random() * emotions.length)]
//     setCurrentEmotion(newEmotion)

//     // Fetch the tone based on the detected emotion
//     const tone = toneMap[newEmotion]

//     // Fetch the story segment from Gemini AI
//     const newSegment = await fetchStorySegment(newEmotion, tone, lastSegment)

//     // Update story text and history
//     const updatedStoryText = storyText ? `${storyText} ${newSegment}` : newSegment
//     setStoryText(updatedStoryText)
//     setEmotionHistory((prev) => [...prev, { emotion: newEmotion, text: newSegment, tone }])
//     setLastSegment(newSegment)

//     // Update progress (max 100)
//     setStoryProgress((prev) => Math.min(prev + 5, 100))

//     setIsGeneratingStory(false)
    
//     // Speak the new segment
//     setIsSpeaking(true)
//     await speakText(newSegment)
//     setIsSpeaking(false)

//     // End story when progress reaches 100
//     if (storyProgress >= 95) {
//       endStory()
//     }
//   }

//   // Handle story generation loop
//   useEffect(() => {
//     // Start camera
//     const startCamera = async () => {
//       try {
//         if (videoRef.current) {
//           const stream = await navigator.mediaDevices.getUserMedia({ video: true })
//           videoRef.current.srcObject = stream
//         }
//       } catch (error) {
//         console.error("Error accessing camera:", error)
//       }
//     }

//     startCamera()

//     // Initialize story generation loop
//     const initializeStoryLoop = () => {
//       // Clear any existing interval
//       if (storyIntervalRef.current) {
//         clearInterval(storyIntervalRef.current)
//       }

//       // Start a timing loop to check if we can process a new emotion
//       storyIntervalRef.current = setInterval(() => {
//         // Only try to process new emotions if not paused, not speaking, and not already generating
//         if (!isPaused && !isSpeaking && !isGeneratingStory) {
//           processNewEmotion()
//         }
//       }, 1000) // Check every second if we're ready for a new segment
//     }

//     initializeStoryLoop()

//     return () => {
//       // Clean up interval on unmount
//       if (storyIntervalRef.current) {
//         clearInterval(storyIntervalRef.current)
//       }
      
//       // Stop camera when component unmounts
//       if (videoRef.current && videoRef.current.srcObject) {
//         const stream = videoRef.current.srcObject as MediaStream
//         stream.getTracks().forEach((track) => track.stop())
//       }
      
//       // Stop any ongoing speech
//       if (typeof window !== "undefined" && "speechSynthesis" in window) {
//         window.speechSynthesis.cancel()
//       }
//     }
//   }, [isPaused])

//   // Monitor state changes to potentially process new emotions
//   useEffect(() => {
//     // If everything is ready, try processing a new emotion
//     if (!isPaused && !isSpeaking && !isGeneratingStory && storyProgress < 100) {
//       if (!emotionHistory.length) {
//         // If this is the first segment, process it immediately
//         processNewEmotion()
//       }
//     }
//   }, [isSpeaking, isPaused, isGeneratingStory])

//   const togglePause = () => {
//     setIsPaused(!isPaused)
    
//     // Cancel any ongoing speech when pausing
//     if (!isPaused && typeof window !== "undefined" && "speechSynthesis" in window) {
//       window.speechSynthesis.cancel()
//       setIsSpeaking(false)
//     }
//   }

//   const endStory = () => {
//     // Cancel any ongoing processes
//     if (storyIntervalRef.current) {
//       clearInterval(storyIntervalRef.current)
//     }
    
//     if (typeof window !== "undefined" && "speechSynthesis" in window) {
//       window.speechSynthesis.cancel()
//     }
    
//     // Save story to localStorage
//     const story = {
//       id: Date.now().toString(),
//       title: "Your Emotional Journey",
//       date: new Date().toISOString(),
//       text: storyText,
//       emotions: emotionHistory,
//       dominantEmotion: getMostFrequentEmotion(),
//     }

//     const savedStories = JSON.parse(localStorage.getItem("stories") || "[]")
//     localStorage.setItem("stories", JSON.stringify([story, ...savedStories]))

//     // Navigate to summary page
//     router.push(`/story-summary?id=${story.id}`)
//   }

//   const getMostFrequentEmotion = (): Emotion => {
//     const emotionCounts: Record<string, number> = {}
//     emotionHistory.forEach((segment) => {
//       emotionCounts[segment.emotion] = (emotionCounts[segment.emotion] || 0) + 1
//     })

//     let maxEmotion: Emotion = "neutral"
//     let maxCount = 0

//     Object.entries(emotionCounts).forEach(([emotion, count]) => {
//       if (count > maxCount) {
//         maxCount = count
//         maxEmotion = emotion as Emotion
//       }
//     })

//     return maxEmotion
//   }

//   const getEmotionEmoji = (emotion: Emotion): string => {
//     const emojiMap: Record<Emotion, string> = {
//       joy: "😊",
//       sadness: "😢",
//       surprise: "😲",
//       anger: "😠",
//       fear: "😨",
//       disgust: "🤢",
//       neutral: "😐",
//     }
//     return emojiMap[emotion]
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-b from-purple-500 to-indigo-700 text-white">
//       <div className="container mx-auto px-4 py-8 flex flex-col h-screen">
//         <header className="flex justify-between items-center mb-4">
//           <h1 className="text-2xl font-bold">Your Story Experience</h1>
//           <div className="flex gap-2">
//             <Button variant="ghost" size="icon" onClick={togglePause} className="text-white hover:bg-white/20">
//               <Pause className="h-5 w-5" />
//             </Button>
//             <Button
//               variant="ghost"
//               size="icon"
//               onClick={() => setShowExitDialog(true)}
//               className="text-white hover:bg-white/20"
//             >
//               <X className="h-5 w-5" />
//             </Button>
//           </div>
//         </header>

//         <div className="flex flex-col md:flex-row gap-6 flex-1 overflow-hidden">
//           <div className="md:w-1/3 flex flex-col items-center">
//             <div className="relative w-48 h-48 rounded-full overflow-hidden border-4 border-white mb-4">
//               <video ref={videoRef} autoPlay playsInline muted className="absolute w-full h-full object-cover" />
//             </div>

//             <motion.div
//               initial={{ scale: 0.9, opacity: 0 }}
//               animate={{ scale: 1, opacity: 1 }}
//               transition={{ duration: 0.3 }}
//               key={currentEmotion}
//               className="bg-white/20 backdrop-blur-md rounded-full px-6 py-3 text-center"
//             >
//               <p className="text-lg">
//                 You seem {currentEmotion} {getEmotionEmoji(currentEmotion)}
//               </p>
//             </motion.div>

//             <div className="mt-4 text-center">
//               {isSpeaking && (
//                 <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 animate-pulse">
//                   Speaking...
//                 </div>
//               )}
//             </div>

//             <div className="mt-auto w-full">
//               <div className="flex justify-between text-sm mb-2">
//                 <span>Story Progress</span>
//                 <span>{storyProgress}%</span>
//               </div>
//               <Progress value={storyProgress} className="h-2" />
//             </div>
//           </div>

//           <div className="md:w-2/3 bg-white/10 backdrop-blur-md rounded-xl p-6 overflow-y-auto">
//             <div className="prose prose-invert max-w-none">
//               {storyText ? (
//                 <p className="text-lg leading-relaxed">{storyText}</p>
//               ) : (
//                 <p className="text-lg text-white/70">Your story will appear here as your emotions are detected...</p>
//               )}
//             </div>
//           </div>
//         </div>

//         <div className="mt-6 flex justify-center">
//           <Button onClick={endStory} className="bg-white text-purple-700 hover:bg-white/90">
//             <Save className="mr-2 h-5 w-5" />
//             End & Save Story
//           </Button>
//         </div>
//       </div>

//       <AlertDialog open={showExitDialog} onOpenChange={setShowExitDialog}>
//         <AlertDialogContent className="bg-white text-gray-900">
//           <AlertDialogHeader>
//             <AlertDialogTitle>Exit Story Experience?</AlertDialogTitle>
//             <AlertDialogDescription>
//               Your story progress will be lost. Are you sure you want to exit?
//             </AlertDialogDescription>
//           </AlertDialogHeader>
//           <AlertDialogFooter>
//             <AlertDialogCancel className='text-purple-500'>Cancel</AlertDialogCancel>
//             <AlertDialogAction onClick={() => router.push("/dashboard")}>Exit</AlertDialogAction>
//           </AlertDialogFooter>
//         </AlertDialogContent>
//       </AlertDialog>
//     </div>
//   )
// }


// Old Version 


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

// Function to speak text aloud
const speakText = (text: string): Promise<void> => {
  return new Promise((resolve) => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = "en-US"
      utterance.rate = 1
      utterance.pitch = 1
      utterance.onend = () => resolve() // <-- Promise resolves when speaking finishes
      window.speechSynthesis.speak(utterance)
    } else {
      resolve() // If speechSynthesis not available, resolve immediately
    }
  })
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
  const [lastSegment, setLastSegment] = useState<string>("")
  const isSpeakingRef = useRef(false)

  // Function to fetch story segment from Gemini AI
  const fetchStorySegment = async (emotion: Emotion, tone: string, previousSegment: string) => {
    try {
      const prompt = previousSegment
        ? `Continue the following story segment smoothly based on the user's current emotion.\n\nPrevious Segment: "${previousSegment}"\n\nNow, generate the next short two-lines story segment in a ${tone} tone to suit the emotion: ${emotion}.`
        : `Start a new short two-lines story segment in a ${tone} tone to suit the emotion: ${emotion}.`
  
      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: prompt,
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
        const newSegment = await fetchStorySegment(newEmotion, tone, lastSegment)

        // Update story text and history
        setStoryText((prev) => prev + " " + newSegment)
        setEmotionHistory((prev) => [...prev, { emotion: newEmotion, text: newSegment, tone }])
        setLastSegment(newSegment) // <-- Add this line


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
            <AlertDialogCancel className='text-purple-500'>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => router.push("/dashboard")}>Exit</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
