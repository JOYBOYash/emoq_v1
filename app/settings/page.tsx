"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Camera, BookOpen, MessageSquareText, Shield } from "lucide-react"

export default function Settings() {
  const router = useRouter()
  const [cameraEnabled, setCameraEnabled] = useState(true)
  const [storyMode, setStoryMode] = useState("fantasy")
  const [language, setLanguage] = useState("english")
  const [emotionSensitivity, setEmotionSensitivity] = useState([50])

  const saveSettings = () => {
    // Save settings to localStorage
    const settings = {
      cameraEnabled,
      storyMode,
      language,
      emotionSensitivity: emotionSensitivity[0],
    }
    localStorage.setItem("settings", JSON.stringify(settings))

    // Navigate back to dashboard
    router.push("/dashboard")
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

          <h1 className="text-3xl font-bold">Settings</h1>
        </header>

        <div className="grid gap-6 md:grid-cols-2">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Camera className="mr-2 h-5 w-5" />
                  Camera Settings
                </CardTitle>
                <CardDescription className="text-white/70">
                  Configure how EmoQ uses your camera for emotion detection
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="camera-toggle">Enable Camera</Label>
                    <p className="text-sm text-white/70">Required for emotion detection</p>
                  </div>
                  <Switch id="camera-toggle" checked={cameraEnabled} onCheckedChange={setCameraEnabled} />
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <Label>Emotion Sensitivity</Label>
                    <span className="text-sm text-white/70">{emotionSensitivity[0]}%</span>
                  </div>
                  <Slider
                    defaultValue={emotionSensitivity}
                    max={100}
                    step={1}
                    onValueChange={setEmotionSensitivity}
                    className="[&>span]:bg-white"
                  />
                  <p className="text-xs text-white/70">Higher sensitivity detects subtle emotional changes</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BookOpen className="mr-2 h-5 w-5" />
                  Storytelling Preferences
                </CardTitle>
                <CardDescription className="text-white/70">Customize how stories are generated</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="story-mode">Story Mode</Label>
                  <Select value={storyMode} onValueChange={setStoryMode}>
                    <SelectTrigger id="story-mode" className="bg-white/10 border-white/20 text-white">
                      <SelectValue placeholder="Select a story mode" />
                    </SelectTrigger>
                    <SelectContent className="bg-purple-900 text-white border-white/20">
                      <SelectItem value="realistic">Realistic</SelectItem>
                      <SelectItem value="fantasy">Fantasy</SelectItem>
                      <SelectItem value="scifi">Sci-Fi</SelectItem>
                      <SelectItem value="mystery">Mystery</SelectItem>
                      <SelectItem value="horror">Horror</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-white/70">Determines the genre and style of generated stories</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="language">Language</Label>
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger id="language" className="bg-white/10 border-white/20 text-white">
                      <SelectValue placeholder="Select a language" />
                    </SelectTrigger>
                    <SelectContent className="bg-purple-900 text-white border-white/20">
                      <SelectItem value="english">English</SelectItem>
                      <SelectItem value="spanish">Spanish</SelectItem>
                      <SelectItem value="french">French</SelectItem>
                      <SelectItem value="german">German</SelectItem>
                      <SelectItem value="japanese">Japanese</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="mr-2 h-5 w-5" />
                  Privacy & Data
                </CardTitle>
                <CardDescription className="text-white/70">Manage your data and privacy settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Save Stories Locally</Label>
                    <p className="text-sm text-white/70">Store stories on your device</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Anonymous Analytics</Label>
                    <p className="text-sm text-white/70">Help improve EmoQ with anonymous usage data</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <Button variant="outline" className="w-full mt-4 border-white/30 text-white hover:bg-white/20">
                  View Privacy Policy
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageSquareText className="mr-2 h-5 w-5" />
                  Support & Feedback
                </CardTitle>
                <CardDescription className="text-white/70">Get help or provide feedback</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button variant="outline" className="w-full border-white/30 text-white hover:bg-white/20">
                  Contact Support
                </Button>

                <Button variant="outline" className="w-full border-white/30 text-white hover:bg-white/20">
                  Send Feedback
                </Button>

                <Button variant="outline" className="w-full border-white/30 text-white hover:bg-white/20">
                  Report a Bug
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <div className="mt-8 flex justify-center">
          <Button onClick={saveSettings} size="lg" className="bg-white text-purple-700 hover:bg-white/90">
            Save Settings
          </Button>
        </div>
      </div>
    </div>
  )
}
