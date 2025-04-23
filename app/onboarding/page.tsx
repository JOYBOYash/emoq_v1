"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ChevronRight, ChevronLeft, X } from "lucide-react"

const slides = [
  {
    title: "Welcome to EmoQ",
    description: "Discover stories that adapt to your emotions in real-time, creating a truly personalized experience.",
    image: "/placeholder.svg?height=300&width=300",
  },
  {
    title: "Emotion Detection",
    description:
      "Our app uses your camera to detect emotions as you read. Don't worry, we never store your video data and prioritize your privacy.",
    image: "/placeholder.svg?height=300&width=300",
  },
  {
    title: "Personalized Storytelling",
    description: "Watch as stories transform based on your emotional responses, creating a unique journey every time.",
    image: "/placeholder.svg?height=300&width=300",
  },
]

export default function Onboarding() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const router = useRouter()

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1)
    } else {
      completeOnboarding()
    }
  }

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1)
    }
  }

  const completeOnboarding = () => {
    localStorage.setItem("onboardingComplete", "true")
    router.push("/permissions")
  }

  return (
    <div className="flex flex-col items-center justify-between min-h-screen bg-gradient-to-b from-purple-500 to-indigo-700 text-white p-6">
      <div className="absolute top-4 right-4">
        <Button variant="ghost" size="sm" className="text-white hover:bg-white/20" onClick={completeOnboarding}>
          <X className="w-5 h-5" />
          <span className="ml-1">Skip</span>
        </Button>
      </div>

      <div className="flex-1 flex items-center justify-center w-full max-w-md">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center text-center"
          >
            <div className="relative w-64 h-64 mb-8">
              <Image
                src={slides[currentSlide].image || "/placeholder.svg"}
                alt={slides[currentSlide].title}
                fill
                className="object-contain"
              />
            </div>
            <h2 className="text-2xl font-bold mb-4">{slides[currentSlide].title}</h2>
            <p className="text-lg mb-8">{slides[currentSlide].description}</p>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="w-full max-w-md mb-8">
        <div className="flex justify-center mb-8">
          {slides.map((_, index) => (
            <div
              key={index}
              className={`w-3 h-3 mx-1 rounded-full ${index === currentSlide ? "bg-white" : "bg-white/30"}`}
            />
          ))}
        </div>

        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={prevSlide}
            disabled={currentSlide === 0}
            className="border-white text-white hover:bg-white/20 hover:text-white"
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back
          </Button>

          <Button onClick={nextSlide} className="bg-white text-purple-700 hover:bg-white/90">
            {currentSlide === slides.length - 1 ? "Get Started" : "Next"}
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
