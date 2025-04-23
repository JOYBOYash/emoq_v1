"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { motion } from "framer-motion"

export default function SplashScreen() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate loading time
    const timer = setTimeout(() => {
      setLoading(false)
      // Check if user has completed onboarding
      const hasCompletedOnboarding = localStorage.getItem("onboardingComplete")
      if (hasCompletedOnboarding) {
        router.push("/dashboard")
      } else {
        router.push("/onboarding")
      }
    }, 3000)

    return () => clearTimeout(timer)
  }, [router])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-purple-500 to-indigo-700 text-white">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="flex flex-col items-center"
      >
        <div className="relative w-40 h-40 mb-6">
          <Image src="/placeholder.svg?height=160&width=160" alt="EmoQ Logo" fill className="object-contain" priority />
        </div>
        <motion.h1
          className="text-4xl font-bold mb-2"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          EmoQ
        </motion.h1>
        <motion.p
          className="text-xl mb-8"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          Stories that feel you.
        </motion.p>
        {loading && (
          <motion.div
            className="w-16 h-16 border-t-4 border-white rounded-full animate-spin"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          />
        )}
      </motion.div>
    </div>
  )
}
