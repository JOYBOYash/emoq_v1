"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Camera, Mic, Info } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export default function Permissions() {
  const router = useRouter()
  const [cameraPermission, setCameraPermission] = useState<boolean | null>(null)
  const [micPermission, setMicPermission] = useState<boolean | null>(null)

  const requestCameraPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      stream.getTracks().forEach((track) => track.stop())
      setCameraPermission(true)

      if (micPermission === true) {
        localStorage.setItem("permissionsGranted", "true")
        router.push("/dashboard")
      }
    } catch (error) {
      console.error("Camera permission denied:", error)
      setCameraPermission(false)
    }
  }

  const requestMicPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      stream.getTracks().forEach((track) => track.stop())
      setMicPermission(true)


      if (cameraPermission === true) {
        localStorage.setItem("permissionsGranted", "true")
        router.push("/dashboard")
      }
    } catch (error) {
      console.error("Microphone permission denied:", error)
      setMicPermission(false)
    }
  }




  useEffect(() => {
    if (cameraPermission === true && micPermission === true) {
      localStorage.setItem("permissionsGranted", "true")
      router.push("/dashboard")
    }
  }, [cameraPermission, micPermission, router])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-purple-500 to-indigo-700 text-white p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full bg-white/10 backdrop-blur-md rounded-xl p-8 shadow-lg"
      >
        <h1 className="text-2xl font-bold mb-6 text-center">We Need Your Permission</h1>

        <p className="mb-8 text-center">
          EmoQ needs access to your camera to detect emotions and microphone for voice interactions. Your privacy is
          important to us - we never store video or audio data.
        </p>

        <div className="space-y-6">
          <Button
            onClick={requestCameraPermission}
            className="w-full bg-white/20 hover:bg-white/30 text-white border border-white/30 h-16"
            disabled={cameraPermission === true}
          >
            <Camera className="mr-2 h-5 w-5" />
            {cameraPermission === null && "Grant Camera Access"}
            {cameraPermission === true && "Camera Access Granted ✓"}
            {cameraPermission === false && "Camera Access Denied ✗"}
          </Button>

          <Button
            onClick={requestMicPermission}
            className="w-full bg-white/20 hover:bg-white/30 text-white border border-white/30 h-16"
            disabled={micPermission === true}
          >
            <Mic className="mr-2 h-5 w-5" />
            {micPermission === null && "Grant Microphone Access"}
            {micPermission === true && "Microphone Access Granted ✓"}
            {micPermission === false && "Microphone Access Denied ✗"}
          </Button>
        </div>

        <div className="mt-8 text-sm text-center flex items-center justify-center">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-white hover:bg-white/20">
                  <Info className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">
                  We use your camera only to detect emotions in real-time. No video is ever recorded or stored on our
                  servers.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <span>Your data stays on your device and is never stored.</span>
        </div>
      </motion.div>
    </div>
  )
}
