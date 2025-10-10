"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Pause, Play, Save, X } from "lucide-react"
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
  id: string // Add unique ID to each segment
}

const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY })

const emotions: Emotion[] = ["joy", "sadness", "surprise", "anger", "fear", "disgust", "neutral"]

const toneMap: Record<Emotion, string> = {
  joy: "cheerful",
  sadness: "melancholic",
  surprise: "mysterious",
  anger: "intense",
  fear: "suspenseful",
  disgust: "disgusting",
  neutral: "neutral",
}

// Generate unique ID
const generateId = () => `segment-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`

// Function to speak text aloud
const speakText = (text: string): Promise<void> => {
  return new Promise((resolve) => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel() // Cancel any ongoing speech
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = "en-US"
      utterance.rate = 1
      utterance.pitch = 1
      utterance.onend = () => resolve() 
      window.speechSynthesis.speak(utterance)
    } else {
      resolve()
    }
  })
}

export default function StoryExperience() {

  const router = useRouter()
  const videoRef = useRef<HTMLVideoElement>(null)
  const storyContainerRef = useRef<HTMLDivElement>(null)
  const [currentEmotion, setCurrentEmotion] = useState<Emotion>("neutral")
  const [storyText, setStoryText] = useState<string>("")
  const [storyProgress, setStoryProgress] = useState(0)
  const [animatedProgress, setAnimatedProgress] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [showExitDialog, setShowExitDialog] = useState(false)
  const [emotionHistory, setEmotionHistory] = useState<StorySegment[]>([])
  const [lastSegment, setLastSegment] = useState<string>("")
  const isSpeakingRef = useRef(false)
  const [currentSpeakingId, setCurrentSpeakingId] = useState<string | null>(null)
  const [showEmotionAnimation, setShowEmotionAnimation] = useState(false)
  const [progressIncrement, setProgressIncrement] = useState(false)
  
  // Track initialization with refs to prevent unnecessary re-renders
  const isProcessingRef = useRef(false)
  const cameraInitializedRef = useRef(false)
  const isStoryInitializedRef = useRef(false)
  
  // Add state for pause/resume notification
  const [showNotification, setShowNotification] = useState(false)
  const [notificationMessage, setNotificationMessage] = useState("")

  // Function to display notification
  const displayNotification = (message: string) => {
    setNotificationMessage(message)
    setShowNotification(true)
    setTimeout(() => setShowNotification(false), 2000)
  }

  const fetchStorySegment = async (emotion: Emotion, tone: string, previousSegment: string) => {
    try {
      // Build the prompt based on whether there is a previous segment or not
      const prompt = previousSegment
        ? `You are a creative storyteller. Continue the following story segment smoothly based on the user's current emotion.\n\nPrevious Segment: "${previousSegment}"\n\nNow, generate the next short two-lines story segment in a ${tone} tone to suit the emotion: ${emotion}.`
        : `You are a creative storyteller. Start a new short two-lines story segment in a ${tone} tone to suit the emotion: ${emotion}.`;
  
      // Send POST request to Groq API
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.NEXT_PUBLIC_GROQ_API_KEY}`, // Make sure your Groq API key is securely stored
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant", // or "llama3-70b-8192" based on your preference
          messages: [
            {
              role: "system",
              content: "You are a helpful assistant that writes creative, emotional, two-line story segments."
            },
            {
              role: "user",
              content: prompt
            }
          ],
          temperature: 0.7,  // Controls creativity. 0.7 is a good balance.
          max_tokens: 150,   // Two lines is around 50–100 tokens, so 150 is safe.
          top_p: 1,
          frequency_penalty: 0,
          presence_penalty: 0
        })
      });
  
      const data = await response.json();
  
      // Check if response is okay
      if (!response.ok) {
        console.error("Groq API Error:", data);
        return "Something went wrong while generating the story.";
      }
  
      // Return the generated text
      return data.choices[0]?.message?.content?.trim() || "No story segment generated.";
      
    } catch (error) {
      console.error("Error fetching story segment from Groq AI:", error);
      return "Something went wrong while generating the story.";
    }
  };
  

  // Helper function to scroll to element by ID
  const scrollToElement = (id: string) => {
    if (!storyContainerRef.current) return;
    
    const container = storyContainerRef.current;
    const element = document.getElementById(id);
    
    if (!element) return;
    
    // Get the position of the element relative to the container
    const containerRect = container.getBoundingClientRect();
    const elementRect = element.getBoundingClientRect();
    
    // Calculate the scroll position to center the element
    const elementRelativeTop = elementRect.top - containerRect.top + container.scrollTop;
    const scrollTo = elementRelativeTop - (containerRect.height / 2) + (elementRect.height / 2);
    
    // Scroll with smooth behavior
    container.scrollTo({
      top: scrollTo,
      behavior: 'smooth'
    });
  }

  // Reset pause state when component is mounted/reloaded
  useEffect(() => {
    setIsPaused(false)
    isProcessingRef.current = false
    isStoryInitializedRef.current = false
  }, [])

  // Animate progress bar
  useEffect(() => {
    const animateProgress = () => {
      if (animatedProgress < storyProgress) {
        setAnimatedProgress(prev => Math.min(prev + 0.5, storyProgress))
        requestAnimationFrame(animateProgress)
      }
    }
    requestAnimationFrame(animateProgress)
  }, [storyProgress, animatedProgress])

  // Show progress increment animation when progress changes
  useEffect(() => {
    if (storyProgress > 0) {
      setProgressIncrement(true)
      const timer = setTimeout(() => setProgressIncrement(false), 1500)
      return () => clearTimeout(timer)
    }
  }, [storyProgress])


// Animate progress bar smoothly whenever storyProgress changes
useEffect(() => {
  let animationFrameId: number;

  const animateProgress = () => {
    setAnimatedProgress(prev => {
      if (prev < storyProgress) {
        animationFrameId = requestAnimationFrame(animateProgress);
        return Math.min(prev + 0.5, storyProgress);
      }
      return prev; // no more animation needed
    });
  };

  // Start animation
  animationFrameId = requestAnimationFrame(animateProgress);

  // Cleanup function to cancel animation if component unmounts or storyProgress changes
  return () => cancelAnimationFrame(animationFrameId);

}, [storyProgress]);



  // Effect to scroll to current segment when it changes
  useEffect(() => {
    if (currentSpeakingId) {
      // Try multiple times to ensure the element is rendered
      setTimeout(() => scrollToElement(currentSpeakingId), 50);
      setTimeout(() => scrollToElement(currentSpeakingId), 150);
      setTimeout(() => scrollToElement(currentSpeakingId), 300);
    }
  }, [currentSpeakingId]);

  // Camera initialization effect - separated from the storytelling logic
  useEffect(() => {
    const startCamera = async () => {
      try {
        if (videoRef.current && !cameraInitializedRef.current) {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true })
          videoRef.current.srcObject = stream
          cameraInitializedRef.current = true
        }
      } catch (error) {
        console.error("Error accessing camera:", error)
      }
    }

    startCamera()

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream
        stream.getTracks().forEach((track) => track.stop())
      }
    }
  }, [])
  

  // Function to handle page switch with proper cleanup and reload
const handlePageSwitch = (targetPath: string) => {
  // Cleanup all resources first
  
  // Set a flag in sessionStorage to indicate we're switching from story page
  if (typeof window !== "undefined") {
    sessionStorage.setItem('fromStoryPage', 'true');
  }
  
  // Navigate to the target path
  router.push(targetPath);
  
  // Force a reload after navigation to ensure clean state
  setTimeout(() => {
    if (typeof window !== "undefined" && sessionStorage.getItem('fromStoryPage') === 'true') {
      sessionStorage.removeItem('fromStoryPage');
      window.location.reload();
    }
  }, 100);
}
  // Comprehensive cleanup on unmount or route change
  useEffect(() => {
    return () => {
      // Cancel speech synthesis
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      
      // Stop camera/video stream
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => {
          track.stop();
          track.enabled = false;
        });
        videoRef.current.srcObject = null;
      }
      
      // Reset all refs
      isProcessingRef.current = false;
      isSpeakingRef.current = false;
      cameraInitializedRef.current = false;
      isStoryInitializedRef.current = false;
    };
  }, []);

// Only start the story ONCE (fixes duplicate segments)
  useEffect(() => {
    // Add a small delay to ensure all refs are properly initialized
    const initTimer = setTimeout(() => {
      if (!isStoryInitializedRef.current && !isPaused && !isProcessingRef.current) {
        isStoryInitializedRef.current = true;
        processNextSegment();
      }
    }, 500);

    return () => clearTimeout(initTimer);
    // eslint-disable-next-line
  }, []); // only run on mount

  // Comprehensive cleanup on unmount or route change
  useEffect(() => {
    return () => {
      // Cancel speech synthesis
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      
      // Stop camera/video stream
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => {
          track.stop();
          track.enabled = false;
        });
        videoRef.current.srcObject = null;
      }
      
      // Reset all refs
      isProcessingRef.current = false;
      isSpeakingRef.current = false;
      cameraInitializedRef.current = false;
      isStoryInitializedRef.current = false;
    };
  }, []);

  // Process next segment when unpaused
  useEffect(() => {
    // If we unpause and we're not at the end, process next segment
    if (!isPaused && isStoryInitializedRef.current && !isProcessingRef.current && storyProgress < 100) {
      processNextSegment();
    }
  }, [isPaused, storyProgress]);

  // Main function to process the next story segment
  const processNextSegment = async () => {
    // Skip if already processing or paused or at 100%
    if (isProcessingRef.current || isPaused || storyProgress >= 100) return;
    
    // Set processing flag
    isProcessingRef.current = true;
    
    try {
      // Step 1: Randomly pick new emotion
      const newEmotion = emotions[Math.floor(Math.random() * emotions.length)];
      
      // Animate emotion change
      setCurrentEmotion(newEmotion);
      setShowEmotionAnimation(true);
      setTimeout(() => setShowEmotionAnimation(false), 1000);
      
      const tone = toneMap[newEmotion];
      
      // Step 2: Fetch new story segment
      const newSegment = await fetchStorySegment(newEmotion, tone, lastSegment);
      
      // Exit if paused during API call
      if (isPaused) {
        isProcessingRef.current = false;
        return;
      }
      
      // Step 3: Create a new segment with a unique ID
      const segmentId = generateId();
      const segment: StorySegment = { 
        emotion: newEmotion, 
        text: newSegment, 
        tone,
        id: segmentId
      };
      
      // Add to history and update last segment
      setEmotionHistory(prev => [...prev, segment]);
      setLastSegment(newSegment);
      setStoryText(prev => prev + " " + newSegment);
      
      // Step 4: Set current speaking ID before speaking
      setCurrentSpeakingId(segmentId);
      
      // Give DOM time to update before scrolling
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Speak the latest segment
      isSpeakingRef.current = true;
      await speakText(newSegment);
      isSpeakingRef.current = false;
      
      // Exit if paused during speech
      if (isPaused) {
        isProcessingRef.current = false;
        return;
      }
      
      // Step 5: Update progress
      const newProgress = Math.min(storyProgress + 10, 100);
      setStoryProgress(newProgress);
      
      // Step 6: Check if story has completed
      if (newProgress >= 100) {
        setTimeout(() => {
          endStory();
        }, 500);
      } else {
        // Add a small pause between segments
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Reset processing flag
        isProcessingRef.current = false;
        
        // Only continue if not paused
        if (!isPaused) {
          processNextSegment();
        }
      }
    } catch (error) {
      console.error("Error in story segment processing:", error);
      // Reset processing flag to allow retry
      isProcessingRef.current = false;
      
      // Try again after a pause if not at the end
      if (!isPaused && storyProgress < 100) {
        setTimeout(processNextSegment, 2000);
      }
    }
  };
  
  const togglePause = () => {
    const newPausedState = !isPaused
    setIsPaused(newPausedState)
    
    // Display notification
    if (newPausedState) {
      displayNotification("Story Paused")
    } else {
      displayNotification("Story Resumed")
    }
    
    // Stop any ongoing speech when pausing
    if (!isPaused && typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel()
    }
  }

  const endStory = () => {
    try {
      window.speechSynthesis.cancel();
      const story = {
        id: Date.now().toString(),
        title: "Your Emotional Journey",
        date: new Date().toISOString(),
        text: storyText,
        emotions: emotionHistory,
        dominantEmotion: getMostFrequentEmotion(),
         // Cancel any ongoing speech
      }
  
      // Save to localStorage first
      const savedStories = JSON.parse(localStorage.getItem("stories") || "[]")
      localStorage.setItem("stories", JSON.stringify([story, ...savedStories]))
  
      // Then navigate with a slight delay to ensure localStorage is updated
      setTimeout(() => {
        window.speechSynthesis.cancel(), // Cancel any ongoing speech
     handlePageSwitch(`/story-summary?id=${story.id}`)
      }, 100);
    } catch (error) {
      console.error("Error saving story:", error);
      // Fallback navigation if there's an error
   handlePageSwitch('/dashboard');
    }
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

  // Render story with properly highlighted currently speaking text
  const renderStoryWithHighlights = () => {
    if (!storyText) {
      return (
        <p className="text-lg text-white/70">Your story will appear here as your emotions are detected...</p>
      )
    }

    return (
      <div className="space-y-4">
        {emotionHistory.map((segment) => {
          const isCurrentlySpeaking = segment.id === currentSpeakingId
          
          return (
            <motion.div
              key={segment.id}
              id={segment.id}
              className={`${isCurrentlySpeaking ? "relative bg-white/30 p-3 rounded-lg shadow-glow" : "p-3 opacity-70"} transition-all duration-300`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ 
                opacity: isCurrentlySpeaking ? 1 : 0.7, 
                y: 0,
                scale: isCurrentlySpeaking ? 1.02 : 1,
                transition: { 
                  type: "spring", 
                  stiffness: 400, 
                  damping: 30 
                }
              }}
            >
              <div className="flex items-start gap-2">
                <span className="text-lg mt-1">{getEmotionEmoji(segment.emotion)}</span>
                <p className={`text-lg ${isCurrentlySpeaking ? "text-white font-medium" : "text-white/90"}`}>
                  {segment.text}
                </p>
              </div>
              
              {isCurrentlySpeaking && (
                <>
                  {/* Enhanced glowing effect for better visibility */}
                  <motion.div 
                    className="absolute -inset-1 rounded-lg z-0"
                    initial={{ opacity: 0 }}
                    animate={{ 
                      opacity: 1,
                      boxShadow: [
                        "0 0 0px rgba(255, 255, 255, 0.3)",
                        "0 0 20px rgba(255, 255, 255, 0.7)",
                        "0 0 0px rgba(255, 255, 255, 0.3)"
                      ]
                    }}
                    transition={{ 
                      repeat: Infinity, 
                      duration: 1.5,
                    }}
                  />
                  {/* Add a vertical bar indicator on the left */}
                  <motion.div 
                    className="absolute -left-2 top-0 bottom-0 w-1 bg-white rounded-full"
                    animate={{ 
                      opacity: [0.6, 1, 0.6]
                    }}
                    transition={{ 
                      repeat: Infinity, 
                      duration: 1.2,
                    }}
                  />
                </>
              )}
            </motion.div>
          )
        })}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-500 to-indigo-700 text-white">
      <div className="container mx-auto px-4 py-4 md:py-8 flex flex-col h-screen max-w-6xl">
        <header className="flex justify-between items-center mb-2 md:mb-4">
          <h1 className="text-xl md:text-2xl font-bold">Your Story Experience</h1>
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" onClick={togglePause} className="text-white hover:bg-white/20">
              {isPaused ? <Play className="h-5 w-5" /> : <Pause className="h-5 w-5" />}
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

        <div className="flex flex-col md:flex-row gap-4 md:gap-6 flex-1 overflow-hidden">
          {/* Camera and emotion section - smaller on mobile */}
          <div className="flex-shrink-0 md:w-1/3 flex flex-col items-center">
            <div className="relative w-32 h-32 md:w-36 md:h-36 lg:w-48 lg:h-48 rounded-full overflow-hidden border-4 border-white mb-2 md:mb-4">
              <video ref={videoRef} autoPlay playsInline muted className="absolute w-full h-full object-cover" />
              <AnimatePresence>
                {showEmotionAnimation && (
                  <motion.div 
                    className="absolute inset-0 flex items-center justify-center"
                    initial={{ scale: 2, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.5, opacity: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <span className="text-4xl md:text-6xl">{getEmotionEmoji(currentEmotion)}</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
              key={currentEmotion}
              className="bg-white/20 backdrop-blur-md rounded-full px-4 md:px-6 py-2 md:py-3 text-center"
            >
              <p className="text-sm md:text-lg">
                You seem {currentEmotion} {getEmotionEmoji(currentEmotion)}
              </p>
            </motion.div>

            <div className="mt-auto w-full">
              <div className="flex justify-between text-xs md:text-sm mb-2">
                <span>Story Progress</span>
                <div className="relative">
                  <motion.span
                    key={Math.round(animatedProgress)}
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="block"
                  >
                    {Math.round(animatedProgress)}%
                  </motion.span>
                  <AnimatePresence>
                    {progressIncrement && (
                      <motion.span
                        className="absolute -right-6 -top-2 text-xs font-bold text-green-300"
                        initial={{ opacity: 0, y: 0 }}
                        animate={{ opacity: 1, y: -10 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 1.5 }}
                      >
                        +10%
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
              </div>
              
              {/* Enhanced Progress Bar */}
              <div className="relative h-2 bg-white/10 rounded-full overflow-hidden backdrop-blur-sm">
                {/* Base progress fill */}
                <motion.div 
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-white/60 to-white"
                  style={{ width: `${animatedProgress}%` }}
                  transition={{ ease: "easeOut" }}
                />
                
                {/* Small particles flowing along the progress bar */}
                <div className="absolute top-0 left-0 right-0 bottom-0 overflow-hidden">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute top-0 h-full w-1 bg-white/80 rounded-full"
                      initial={{ left: "-5%" }}
                      animate={{ 
                        left: `${Math.min(animatedProgress, 95)}%`,
                      }}
                      transition={{ 
                        repeat: Infinity,
                        duration: 2 + i * 0.7,
                        delay: i * 0.3,
                        ease: "linear",
                      }}
                      style={{ 
                        opacity: isPaused ? 0 : 0.6 + (i * 0.08),
                        height: `${60 + i * 10}%`,
                      }}
                    />
                  ))}
                </div>
                
                {/* Pulsing glow effect at progress endpoint */}
                {animatedProgress > 0 && (
                  <motion.div 
                    className="absolute top-1/2 transform -translate-y-1/2 h-4 w-4 rounded-full bg-white"
                    style={{ left: `${animatedProgress}%` }}
                    animate={{ 
                      boxShadow: [
                        "0 0 0px 0px rgba(255, 255, 255, 0.8)",
                        "0 0 8px 2px rgba(255, 255, 255, 0.8)",
                        "0 0 0px 0px rgba(255, 255, 255, 0.8)"
                      ],
                      scale: [0.8, 1.2, 0.8]
                    }}
                    transition={{ 
                      repeat: Infinity,
                      duration: 2,
                      ease: "easeInOut",
                      times: [0, 0.5, 1]
                    }}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Story Display Container - Improved for responsiveness */}
          <div className="flex-grow md:flex-grow-0 md:w-2/3 bg-white/10 backdrop-blur-md rounded-xl p-4 md:p-6 relative flex flex-col">
            <div 
              ref={storyContainerRef}
              className="prose prose-invert max-w-none h-60 sm:h-72 md:h-80 lg:h-96 overflow-y-auto overflow-x-hidden custom-scrollbar flex-grow"
              style={{ scrollBehavior: 'smooth' }}
            >
              {renderStoryWithHighlights()}
            </div>
            
            {/* Gradient fades at top and bottom for smooth scrolling appearance */}
            <div className="absolute top-0 left-0 right-0 h-8 md:h-12 bg-gradient-to-b from-purple-500/80 to-transparent pointer-events-none z-10 rounded-t-xl"></div>
            <div className="absolute bottom-0 left-0 right-0 h-8 md:h-12 bg-gradient-to-t from-indigo-700/80 to-transparent pointer-events-none z-10 rounded-b-xl"></div>
          </div>
        </div>

        <div className="mt-4 md:mt-6 flex justify-center">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button 
              onClick={endStory} 
              className="bg-white text-purple-700 hover:bg-white/90 text-sm md:text-base py-2 px-4"
            >
              <Save className="mr-2 h-4 w-4 md:h-5 md:w-5" />
              End & Save Story
            </Button>
          </motion.div>
        </div>
      </div>

      {/* Pause/Resume Notification */}
      <AnimatePresence>
        {showNotification && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-white text-purple-700 font-semibold py-2 px-4 rounded-full shadow-lg z-50 flex items-center gap-2"
          >
            {notificationMessage === "Story Paused" ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4" />
            )}
            {notificationMessage}
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        .shadow-glow {
          box-shadow: 0 0 15px rgba(255, 255, 255, 0.4);
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.3);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.5);
        }
      `}</style>

      <AlertDialog open={showExitDialog} onOpenChange={setShowExitDialog}>
        <AlertDialogContent className="bg-white text-gray-900">
          <AlertDialogHeader>
            <AlertDialogTitle>Exit Story Experience?</AlertDialogTitle>
            <AlertDialogDescription>
              Your story progress will be lost. Are you sure you want to exit?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="text-purple-500">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => handlePageSwitch("/dashboard")}>Exit</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}