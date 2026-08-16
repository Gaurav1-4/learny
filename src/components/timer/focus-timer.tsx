"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import {
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  Volume2,
  VolumeX,
  Plus,
  Flame,
  CheckCircle2,
  Clock,
  BookOpen,
  History,
  Coffee,
  Sparkles,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ClassroomCourse } from "@/types"

type TimerMode = "focus" | "shortBreak" | "longBreak"

interface StudySession {
  id: string
  timestamp: string
  courseName: string
  taskDescription: string
  durationMinutes: number
}

const DEFAULT_DURATIONS: Record<TimerMode, number> = {
  focus: 25 * 60,
  shortBreak: 5 * 60,
  longBreak: 15 * 60,
}

export function FocusTimer() {
  const [mode, setMode] = useState<TimerMode>("focus")
  const [timeLeft, setTimeLeft] = useState(DEFAULT_DURATIONS.focus)
  const [isRunning, setIsRunning] = useState(false)
  const [customFocusDuration, setCustomFocusDuration] = useState(25)
  const [soundEnabled, setSoundEnabled] = useState(true)

  // Course linking & task description
  const [courses, setCourses] = useState<ClassroomCourse[]>([])
  const [selectedCourseId, setSelectedCourseId] = useState("")
  const [taskDescription, setTaskDescription] = useState("")

  // Stats & History
  const [sessions, setSessions] = useState<StudySession[]>([])
  const [streakDays, setStreakDays] = useState(1)

  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const initialDuration = mode === "focus" ? customFocusDuration * 60 : DEFAULT_DURATIONS[mode]

  // Play Web Audio Chime without any external audio file
  const playChime = useCallback(() => {
    if (!soundEnabled) return
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
      if (!AudioCtx) return
      const ctx = new AudioCtx()

      const now = ctx.currentTime
      const notes = [523.25, 659.25, 783.99, 1046.5] // C5, E5, G5, C6 chime chord

      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()

        osc.type = "sine"
        osc.frequency.setValueAtTime(freq, now + i * 0.12)

        gain.gain.setValueAtTime(0.001, now + i * 0.12)
        gain.gain.exponentialRampToValueAtTime(0.3, now + i * 0.12 + 0.04)
        gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.12 + 0.8)

        osc.connect(gain)
        gain.connect(ctx.destination)

        osc.start(now + i * 0.12)
        osc.stop(now + i * 0.12 + 0.85)
      })
    } catch (e) {
      console.error("Audio chime error", e)
    }
  }, [soundEnabled])

  // 1. Load history from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("learny-focus-sessions")
    if (saved) {
      try {
        setSessions(JSON.parse(saved))
      } catch (e) {
        console.error(e)
      }
    }
  }, [])

  // 2. Save history to localStorage
  useEffect(() => {
    localStorage.setItem("learny-focus-sessions", JSON.stringify(sessions))
  }, [sessions])

  // 3. Fetch courses
  useEffect(() => {
    async function fetchCourses() {
      try {
        const res = await fetch("/api/classroom/courses")
        if (res.ok) {
          const data = await res.json()
          setCourses(Array.isArray(data) ? data : data.courses || [])
        }
      } catch (e) {
        console.error(e)
      }
    }
    fetchCourses()
  }, [])

  // Timer Tick
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!)
            setIsRunning(false)
            playChime()

            // If focus completed, log session
            if (mode === "focus") {
              const course = courses.find((c) => c.id === selectedCourseId)
              const newSession: StudySession = {
                id: `session-${Date.now()}`,
                timestamp: new Date().toISOString(),
                courseName: course?.name || (selectedCourseId ? "Classroom Course" : "General Study"),
                taskDescription: taskDescription.trim() || "Deep Work Session",
                durationMinutes: customFocusDuration,
              }
              setSessions((prevSessions) => [newSession, ...prevSessions])
            }
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else {
      if (timerRef.current) clearInterval(timerRef.current)
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [isRunning, mode, customFocusDuration, selectedCourseId, taskDescription, courses, playChime])

  // Switch Modes
  const handleModeChange = (newMode: TimerMode) => {
    setIsRunning(false)
    setMode(newMode)
    if (newMode === "focus") {
      setTimeLeft(customFocusDuration * 60)
    } else {
      setTimeLeft(DEFAULT_DURATIONS[newMode])
    }
  }

  // Reset
  const handleReset = () => {
    setIsRunning(false)
    setTimeLeft(mode === "focus" ? customFocusDuration * 60 : DEFAULT_DURATIONS[mode])
  }

  // Quick Add 5 mins
  const handleAddFiveMins = () => {
    setTimeLeft((prev) => prev + 5 * 60)
  }

  // Format Time (MM:SS)
  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60
  const formattedTime = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`

  // Progress Percentage
  const progress = ((initialDuration - timeLeft) / initialDuration) * 100

  // Calculate Today's Stats
  const todayStr = new Date().toDateString()
  const todaySessions = sessions.filter(
    (s) => new Date(s.timestamp).toDateString() === todayStr
  )
  const totalMinutesToday = todaySessions.reduce((acc, s) => acc + s.durationMinutes, 0)

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-100">Focus Timer & Deep Work</h1>
        <p className="text-sm text-zinc-400 mt-1">
          Eliminate distractions, link sessions to your coursework, and maintain your daily study momentum.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Timer Display Card */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-zinc-800 bg-zinc-900/90 shadow-xl overflow-hidden">
            {/* Mode Switcher Tabs */}
            <div className="flex border-b border-zinc-800 bg-zinc-950/60 p-2">
              <button
                onClick={() => handleModeChange("focus")}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                  mode === "focus"
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
                }`}
              >
                <Sparkles className="h-4 w-4" /> Focus ({customFocusDuration}m)
              </button>
              <button
                onClick={() => handleModeChange("shortBreak")}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                  mode === "shortBreak"
                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
                }`}
              >
                <Coffee className="h-4 w-4" /> Short Break (5m)
              </button>
              <button
                onClick={() => handleModeChange("longBreak")}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                  mode === "longBreak"
                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
                }`}
              >
                <Coffee className="h-4 w-4" /> Long Break (15m)
              </button>
            </div>

            <CardContent className="flex flex-col items-center justify-center py-12 px-6">
              {/* Circular Ring Timer */}
              <div className="relative flex items-center justify-center w-72 h-72">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 240 240">
                  {/* Background Track */}
                  <circle
                    cx="120"
                    cy="120"
                    r="100"
                    className="stroke-zinc-800"
                    strokeWidth="12"
                    fill="transparent"
                  />
                  {/* Progress Ring */}
                  <circle
                    cx="120"
                    cy="120"
                    r="100"
                    className={`transition-all duration-1000 ease-linear ${
                      mode === "focus"
                        ? "stroke-indigo-500"
                        : mode === "shortBreak"
                        ? "stroke-emerald-500"
                        : "stroke-blue-500"
                    }`}
                    strokeWidth="12"
                    strokeDasharray={2 * Math.PI * 100}
                    strokeDashoffset={2 * Math.PI * 100 * (1 - progress / 100)}
                    strokeLinecap="round"
                    fill="transparent"
                  />
                </svg>

                <div className="absolute flex flex-col items-center justify-center">
                  <span className="font-mono text-6xl font-extrabold tracking-tighter text-zinc-100">
                    {formattedTime}
                  </span>
                  <span className="text-xs font-semibold uppercase tracking-widest text-zinc-400 mt-2">
                    {isRunning ? "Session in Progress" : "Paused / Ready"}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-8 flex items-center gap-4">
                <Button
                  size="lg"
                  onClick={() => setIsRunning(!isRunning)}
                  className={`h-14 px-8 rounded-xl font-bold text-base shadow-xl transition-all ${
                    isRunning
                      ? "bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/20"
                      : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30 scale-105"
                  }`}
                >
                  {isRunning ? (
                    <>
                      <Pause className="mr-2 h-5 w-5 fill-current" /> Pause
                    </>
                  ) : (
                    <>
                      <Play className="mr-2 h-5 w-5 fill-current" /> Start Focus
                    </>
                  )}
                </Button>

                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleReset}
                  title="Reset Timer"
                  className="h-12 w-12 rounded-xl border-zinc-800 hover:bg-zinc-800 text-zinc-300"
                >
                  <RotateCcw className="h-5 w-5" />
                </Button>

                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleAddFiveMins}
                  title="Add 5 Minutes"
                  className="h-12 w-12 rounded-xl border-zinc-800 hover:bg-zinc-800 text-zinc-300"
                >
                  <Plus className="h-5 w-5" />
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  title={soundEnabled ? "Mute Bell" : "Enable Bell"}
                  className="h-12 w-12 rounded-xl text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
                >
                  {soundEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5 text-zinc-600" />}
                </Button>
              </div>
            </CardContent>

            {/* Session Context Config (Course & Task) */}
            <div className="border-t border-zinc-800 bg-zinc-950/70 p-6 space-y-4">
              <div className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Session Target & Course Link
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-medium text-zinc-400">Classroom Course</label>
                  <select
                    value={selectedCourseId}
                    onChange={(e) => setSelectedCourseId(e.target.value)}
                    className="mt-1 flex h-10 w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="">General (No specific course)</option>
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-zinc-400">Task / Goal Note</label>
                  <Input
                    placeholder="e.g. Chapter 4 Practice Derivations"
                    value={taskDescription}
                    onChange={(e) => setTaskDescription(e.target.value)}
                    className="mt-1 bg-zinc-900 border-zinc-800"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <span className="text-xs font-medium text-zinc-400">Custom Focus Interval:</span>
                {[15, 25, 45, 60].map((dur) => (
                  <button
                    key={dur}
                    onClick={() => {
                      setCustomFocusDuration(dur)
                      if (mode === "focus") {
                        setIsRunning(false)
                        setTimeLeft(dur * 60)
                      }
                    }}
                    className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors ${
                      customFocusDuration === dur
                        ? "bg-indigo-600/30 text-indigo-300 border border-indigo-500/50"
                        : "bg-zinc-900 text-zinc-400 border border-zinc-800 hover:text-zinc-200"
                    }`}
                  >
                    {dur}m
                  </button>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* Sidebar Stats & History */}
        <div className="space-y-6">
          {/* Daily Metric Cards */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="border-zinc-800 bg-zinc-900/90 p-4">
              <div className="flex items-center justify-between text-zinc-400 mb-2">
                <span className="text-xs font-medium">Focus Today</span>
                <Clock className="h-4 w-4 text-indigo-400" />
              </div>
              <div className="text-2xl font-bold text-zinc-100">{totalMinutesToday}m</div>
              <div className="text-[11px] text-zinc-500 mt-1">{todaySessions.length} sessions finished</div>
            </Card>

            <Card className="border-zinc-800 bg-zinc-900/90 p-4">
              <div className="flex items-center justify-between text-zinc-400 mb-2">
                <span className="text-xs font-medium">Day Streak</span>
                <Flame className="h-4 w-4 text-amber-500 fill-amber-500/20" />
              </div>
              <div className="text-2xl font-bold text-zinc-100">{todaySessions.length > 0 ? streakDays : 0}</div>
              <div className="text-[11px] text-zinc-500 mt-1">Keep it rolling!</div>
            </Card>
          </div>

          {/* Recent Study Log */}
          <Card className="border-zinc-800 bg-zinc-900/90">
            <CardHeader className="pb-3 border-b border-zinc-800">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold">Study History</CardTitle>
                <History className="h-4 w-4 text-zinc-500" />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-zinc-800/60 max-h-[380px] overflow-y-auto">
                {sessions.length === 0 ? (
                  <div className="p-6 text-center text-xs text-zinc-500">
                    No sessions logged yet. Hit start to record your first deep work block!
                  </div>
                ) : (
                  sessions.slice(0, 10).map((session) => (
                    <div key={session.id} className="p-3.5 hover:bg-zinc-800/30 transition-colors space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-zinc-200 truncate max-w-[160px]">
                          {session.courseName}
                        </span>
                        <Badge variant="outline" className="text-[10px] text-indigo-400 border-indigo-500/30">
                          {session.durationMinutes} mins
                        </Badge>
                      </div>
                      <p className="text-xs text-zinc-400 truncate">{session.taskDescription}</p>
                      <div className="text-[10px] text-zinc-500">
                        {new Date(session.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} •{" "}
                        {new Date(session.timestamp).toLocaleDateString([], { month: "short", day: "numeric" })}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
