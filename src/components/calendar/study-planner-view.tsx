"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  Brain,
  Sparkles,
  Flame,
  CheckCircle2,
  AlertTriangle,
  Clock,
  BookOpen,
  Plus,
  Trash2,
  RefreshCw,
  Zap,
  Target,
  ArrowRight,
  HelpCircle,
  FileText,
  Calendar,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

export interface HomeworkTask {
  id: string
  title: string
  subject: string
  dueDate: string
  estimatedMinutes: number
  scheduledSlot: string
  completed: boolean
}

export function StudyPlannerView() {
  const [tasks, setTasks] = useState<HomeworkTask[]>([
    {
      id: "task-1",
      title: "Math III Tutorial Problem Sheet 3 (Partial Derivatives & Chain Rule)",
      subject: "Math III",
      dueDate: "Tuesday 1:30 PM",
      estimatedMinutes: 90,
      scheduledSlot: "Monday 8:30 – 10:45 AM",
      completed: false,
    },
    {
      id: "task-2",
      title: "OS Synchronization & Semaphores Review (for Wed 8:30 AM Tutorial)",
      subject: "Operating Systems",
      dueDate: "Wednesday 8:30 AM",
      estimatedMinutes: 60,
      scheduledSlot: "Tuesday 6:30 – 8:00 PM",
      completed: false,
    },
    {
      id: "task-3",
      title: "AP Structural Design Patterns Flashcard Drill (Surprise Quiz Prep)",
      subject: "Advanced Programming",
      dueDate: "Thursday 3:00 PM",
      estimatedMinutes: 45,
      scheduledSlot: "Wednesday 5:00 – 6:30 PM",
      completed: true,
    },
    {
      id: "task-4",
      title: "RMSSD Data Sampling & Hypothesis Testing Lab Exercise",
      subject: "RMSSD",
      dueDate: "Thursday 9:30 AM",
      estimatedMinutes: 60,
      scheduledSlot: "Wednesday 10:00 AM – 12:30 PM",
      completed: false,
    },
  ])

  // New task state
  const [newTitle, setNewTitle] = useState("")
  const [newSubject, setNewSubject] = useState("Math III")
  const [newDueDate, setNewDueDate] = useState("")
  const [newMinutes, setNewMinutes] = useState(60)

  // Math III Readiness State
  const [mathChecked, setMathChecked] = useState<Record<string, boolean>>({
    "m3-1": true,
    "m3-2": true,
    "m3-3": false,
    "m3-4": false,
  })

  // OS Revision State
  const [osChecked, setOsChecked] = useState<Record<string, boolean>>({
    "os-1": true,
    "os-2": false,
    "os-3": false,
  })

  // AP Surprise Quiz State
  const [apChecked, setApChecked] = useState<Record<string, boolean>>({
    "ap-1": true,
    "ap-2": true,
    "ap-3": false,
  })

  // 1. Load tasks from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("learny_ai_planner_tasks")
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed) && parsed.length > 0) setTasks(parsed)
      } catch (e) {
        console.error(e)
      }
    }
  }, [])

  // 2. Save tasks to localStorage
  useEffect(() => {
    localStorage.setItem("learny_ai_planner_tasks", JSON.stringify(tasks))
  }, [tasks])

  const handleToggleTask = (id: string) => {
    setTasks(tasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)))
  }

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTitle.trim()) return

    // Auto-allocate optimal timetable slot
    let slot = "Monday 1:00 – 2:45 PM (Free Slot)"
    if (newSubject.includes("OS")) slot = "Tuesday 6:30 – 8:00 PM"
    if (newSubject.includes("AP")) slot = "Wednesday 5:00 – 6:30 PM"
    if (newSubject.includes("DPP") || newSubject.includes("RMSSD")) slot = "Wednesday 10:00 AM – 12:30 PM"

    const newTask: HomeworkTask = {
      id: `task-${Date.now()}`,
      title: newTitle,
      subject: newSubject,
      dueDate: newDueDate || "Next Class",
      estimatedMinutes: Number(newMinutes) || 60,
      scheduledSlot: slot,
      completed: false,
    }

    setTasks([...tasks, newTask])
    setNewTitle("")
    setNewDueDate("")
  }

  const handleDeleteTask = (id: string) => {
    setTasks(tasks.filter((t) => t.id !== id))
  }

  const mathReadinessPercent = Math.round(
    (Object.values(mathChecked).filter(Boolean).length / Object.keys(mathChecked).length) * 100
  )

  const osReadinessPercent = Math.round(
    (Object.values(osChecked).filter(Boolean).length / Object.keys(osChecked).length) * 100
  )

  const apReadinessPercent = Math.round(
    (Object.values(apChecked).filter(Boolean).length / Object.keys(apChecked).length) * 100
  )

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="rounded-3xl border border-emerald-500/30 bg-gradient-to-r from-emerald-950/60 via-zinc-900/90 to-teal-950/60 p-6 shadow-xl backdrop-blur-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 px-2.5 py-0.5 text-[10px] font-bold text-emerald-300">
                <Zap className="h-3 w-3 text-emerald-400" /> Autonomous Agent Active
              </span>
              <span className="text-xs font-semibold text-zinc-400">
                Zero-Stress Class & Test Execution
              </span>
            </div>
            <h2 className="text-2xl font-extrabold text-white">
              Academic Strategy & Prep Readiness Engine
            </h2>
            <p className="text-xs text-zinc-300 max-w-2xl">
              Distributes your heavy study workloads into Monday free slots, reinforces OS lecture memorization before tutorials, and keeps you primed for unannounced AP pop quizzes.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-center">
              <span className="block text-[10px] font-bold uppercase text-zinc-400">
                Classroom Ingestion
              </span>
              <span className="text-xs font-extrabold text-emerald-400 flex items-center justify-center gap-1 mt-0.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                Live / Real-Time
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3 Core Strategy Radars */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* RADAR 1: Math III Tuesday Test */}
        <Card className="border-rose-500/30 bg-zinc-900/90 shadow-lg relative overflow-hidden flex flex-col justify-between">
          <div className="absolute -top-12 -right-12 h-32 w-32 rounded-full bg-rose-500/10 blur-2xl pointer-events-none" />
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <Badge className="bg-rose-600 text-white font-extrabold text-[10px] gap-1">
                <Flame className="h-3 w-3" /> Tuesday 1:30 PM
              </Badge>
              <span className="text-xs font-bold text-rose-400">{mathReadinessPercent}% Ready</span>
            </div>
            <CardTitle className="text-lg font-bold text-white mt-1">
              Math III Graded Tutorial Test
            </CardTitle>
            <CardDescription className="text-xs text-zinc-400">
              Monday has extensive free space (8:30–11:00 AM & 1:00–3:00 PM) designated for deep problem solving.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-2.5 text-xs">
            <div className="space-y-2 rounded-xl bg-zinc-950/80 p-3 border border-zinc-800">
              {[
                { id: "m3-1", label: "Solve Tutorial Problem Sheet Exercises" },
                { id: "m3-2", label: "Memorize PDE & Multivariable Calculus Formulas" },
                { id: "m3-3", label: "Complete 45-min Timed Mock Test on Monday afternoon" },
                { id: "m3-4", label: "Review Thursday Lecture Notes in NotebookLM" },
              ].map((item) => (
                <label
                  key={item.id}
                  className="flex items-start gap-2.5 cursor-pointer select-none text-zinc-300 hover:text-white"
                >
                  <input
                    type="checkbox"
                    checked={!!mathChecked[item.id]}
                    onChange={() =>
                      setMathChecked({ ...mathChecked, [item.id]: !mathChecked[item.id] })
                    }
                    className="mt-0.5 rounded border-zinc-700 bg-zinc-900 text-rose-600 focus:ring-rose-500"
                  />
                  <span className={mathChecked[item.id] ? "line-through text-zinc-500" : ""}>
                    {item.label}
                  </span>
                </label>
              ))}
            </div>

            <div className="pt-2 flex items-center justify-between text-[11px] text-zinc-400">
              <span className="font-semibold text-rose-400">Next Slot: Monday 8:30 AM</span>
              <span className="text-zinc-500">Weight: 20% Course Total</span>
            </div>
          </CardContent>
        </Card>

        {/* RADAR 2: OS Pre-Lecture & Tutorial Memorization */}
        <Card className="border-cyan-500/30 bg-zinc-900/90 shadow-lg relative overflow-hidden flex flex-col justify-between">
          <div className="absolute -top-12 -right-12 h-32 w-32 rounded-full bg-cyan-500/10 blur-2xl pointer-events-none" />
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <Badge className="bg-cyan-600 text-white font-extrabold text-[10px] gap-1">
                <Clock className="h-3 w-3" /> Mon 3 PM & Wed 8:30 AM
              </Badge>
              <span className="text-xs font-bold text-cyan-400">{osReadinessPercent}% Revised</span>
            </div>
            <CardTitle className="text-lg font-bold text-white mt-1">
              OS Pre-Lecture & Tutorial Radar
            </CardTitle>
            <CardDescription className="text-xs text-zinc-400">
              Ensures previous lecture concepts are memorized so you are 100% fluent before the next class.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-2.5 text-xs">
            <div className="space-y-2 rounded-xl bg-zinc-950/80 p-3 border border-zinc-800">
              {[
                { id: "os-1", label: "Processes vs Threads & Context Switching Recap" },
                { id: "os-2", label: "Semaphores, Mutex & Deadlock Conditions Drill" },
                { id: "os-3", label: "Tuesday Evening Tutorial Prep (for Wed 8:30 AM)" },
              ].map((item) => (
                <label
                  key={item.id}
                  className="flex items-start gap-2.5 cursor-pointer select-none text-zinc-300 hover:text-white"
                >
                  <input
                    type="checkbox"
                    checked={!!osChecked[item.id]}
                    onChange={() =>
                      setOsChecked({ ...osChecked, [item.id]: !osChecked[item.id] })
                    }
                    className="mt-0.5 rounded border-zinc-700 bg-zinc-900 text-cyan-600 focus:ring-cyan-500"
                  />
                  <span className={osChecked[item.id] ? "line-through text-zinc-500" : ""}>
                    {item.label}
                  </span>
                </label>
              ))}
            </div>

            <div className="pt-2 flex items-center justify-between text-[11px] text-zinc-400">
              <span className="font-semibold text-cyan-400">Auto-Revision: Tuesday 6:30 PM</span>
              <span className="text-zinc-500">Room C101 / C201</span>
            </div>
          </CardContent>
        </Card>

        {/* RADAR 3: AP Surprise Quiz Survival */}
        <Card className="border-indigo-500/30 bg-zinc-900/90 shadow-lg relative overflow-hidden flex flex-col justify-between">
          <div className="absolute -top-12 -right-12 h-32 w-32 rounded-full bg-indigo-500/10 blur-2xl pointer-events-none" />
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <Badge className="bg-indigo-600 text-white font-extrabold text-[10px] gap-1">
                <AlertTriangle className="h-3 w-3" /> Tue & Thu 3 PM
              </Badge>
              <span className="text-xs font-bold text-indigo-400">{apReadinessPercent}% Quiz Ready</span>
            </div>
            <CardTitle className="text-lg font-bold text-white mt-1">
              AP Surprise Quiz Survival
            </CardTitle>
            <CardDescription className="text-xs text-zinc-400">
              Daily rapid-fire code drills so unannounced pop quizzes in Room C21 never catch you off-guard.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-2.5 text-xs">
            <div className="space-y-2 rounded-xl bg-zinc-950/80 p-3 border border-zinc-800">
              {[
                { id: "ap-1", label: "SOLID Architecture & Class Diagrams Flashcards" },
                { id: "ap-2", label: "Java Generics, Streams & Exception Hierarchy" },
                { id: "ap-3", label: "Wednesday 5 PM Rapid 5-Question Code Drill" },
              ].map((item) => (
                <label
                  key={item.id}
                  className="flex items-start gap-2.5 cursor-pointer select-none text-zinc-300 hover:text-white"
                >
                  <input
                    type="checkbox"
                    checked={!!apChecked[item.id]}
                    onChange={() =>
                      setApChecked({ ...apChecked, [item.id]: !apChecked[item.id] })
                    }
                    className="mt-0.5 rounded border-zinc-700 bg-zinc-900 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className={apChecked[item.id] ? "line-through text-zinc-500" : ""}>
                    {item.label}
                  </span>
                </label>
              ))}
            </div>

            <div className="pt-2 flex items-center justify-between text-[11px] text-zinc-400">
              <span className="font-semibold text-indigo-400">Pre-Lecture Drill: Wed 5:00 PM</span>
              <span className="text-zinc-500">Weight: 20% Quizzes</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Homework & Academic Task Pipeline */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Target className="h-5 w-5 text-indigo-400" />
              Autonomous Homework & Prep Pipeline
            </h3>
            <p className="text-xs text-zinc-400">
              Add assignments or preparation tasks — the AI agent automatically slots them into your free timetable windows.
            </p>
          </div>
        </div>

        {/* Task Entry Form */}
        <form
          onSubmit={handleAddTask}
          className="flex flex-col md:flex-row items-center gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-3 shadow-inner"
        >
          <Input
            placeholder="e.g. Solve Math III Question 4 to 12 from Sheet 2..."
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="bg-zinc-950 border-zinc-800 text-xs text-zinc-100 h-10 flex-1"
            required
          />

          <select
            value={newSubject}
            onChange={(e) => setNewSubject(e.target.value)}
            className="h-10 rounded-md border border-zinc-800 bg-zinc-950 px-3 text-xs text-zinc-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="Math III">Math III</option>
            <option value="Operating Systems">Operating Systems</option>
            <option value="Advanced Programming">Advanced Programming</option>
            <option value="DPP 2026">DPP 2026</option>
            <option value="RMSSD">RMSSD</option>
          </select>

          <Input
            placeholder="Due (e.g. Tuesday 1:30 PM)"
            value={newDueDate}
            onChange={(e) => setNewDueDate(e.target.value)}
            className="bg-zinc-950 border-zinc-800 text-xs text-zinc-100 h-10 w-44"
          />

          <Button
            type="submit"
            size="sm"
            className="h-10 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs gap-1.5 px-4 shrink-0"
          >
            <Plus className="h-4 w-4" /> Add & Schedule
          </Button>
        </form>

        {/* Task Cards List */}
        <div className="grid gap-3 sm:grid-cols-2">
          {tasks.map((task) => (
            <motion.div
              key={task.id}
              whileHover={{ y: -2 }}
              className={`flex items-start justify-between gap-3 rounded-2xl border p-4 transition-all ${
                task.completed
                  ? "border-zinc-800/60 bg-zinc-950/40 opacity-60"
                  : "border-zinc-800 bg-zinc-900/80 hover:border-indigo-500/40"
              }`}
            >
              <div className="flex items-start gap-3 flex-1">
                <button
                  type="button"
                  onClick={() => handleToggleTask(task.id)}
                  className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-lg border transition-colors ${
                    task.completed
                      ? "border-emerald-500 bg-emerald-500/20 text-emerald-400"
                      : "border-zinc-700 bg-zinc-950 hover:border-indigo-500"
                  }`}
                >
                  {task.completed && <CheckCircle2 className="h-3.5 w-3.5" />}
                </button>

                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="outline" className="text-[10px] font-bold border-indigo-500/30 text-indigo-300">
                      {task.subject}
                    </Badge>
                    <span className="text-[11px] text-zinc-400 flex items-center gap-1 font-medium">
                      <Clock className="h-3 w-3" /> Due: {task.dueDate}
                    </span>
                  </div>

                  <p className={`text-xs font-bold leading-snug ${task.completed ? "line-through text-zinc-500" : "text-zinc-200"}`}>
                    {task.title}
                  </p>

                  <div className="pt-1 flex items-center gap-1 text-[11px] text-emerald-400 font-semibold">
                    <Sparkles className="h-3 w-3 shrink-0" />
                    <span>Auto-Slot: {task.scheduledSlot}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleDeleteTask(task.id)}
                className="text-zinc-600 hover:text-red-400 p-1 transition-colors shrink-0"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
