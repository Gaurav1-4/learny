"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  BookOpen,
  Calculator,
  MessageSquare,
  Sparkles,
  CheckCircle2,
  ExternalLink,
  Layers,
  Search,
  FileText,
  HelpCircle,
  Brain,
  Code2,
  Palette,
  BarChart3,
  Copy,
  Check,
  Zap,
  Mic,
  MicOff,
  Flame,
  Clock,
  ChevronRight,
  BookMarked,
  Filter,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface SubjectWorkflowSuiteProps {
  courseId: string
  courseName: string
  courseSection?: string
}

interface MathProblem {
  id: string
  exercise: string
  qNum: number
  isMandatory: boolean
  title: string
  latex: string
  topic: string
  difficulty: "Easy" | "Medium" | "Hard"
  methodOfWork: string
  similarTo?: number
}

export function SubjectWorkflowSuite({ courseId, courseName, courseSection }: SubjectWorkflowSuiteProps) {
  const isMath3 = courseName.toLowerCase().includes("math") || courseName.toLowerCase().includes("mth") || courseId.includes("m3")
  const isOS = courseName.toLowerCase().includes("operating") || courseName.toLowerCase().includes("os") || courseId.includes("os")
  const isAP = courseName.toLowerCase().includes("programming") || courseName.toLowerCase().includes("ap") || courseId.includes("ap")
  const isDPP = courseName.toLowerCase().includes("dpp") || courseName.toLowerCase().includes("design") || courseId.includes("dpp")
  const isRMSSD = courseName.toLowerCase().includes("rmssd") || courseName.toLowerCase().includes("research") || courseId.includes("rmssd")

  // --- Math III State (Shorthand Parser, Voice Input, Similar Practice & OKF Manifest) ---
  const [shorthandInput, setShorthandInput] = useState("14.2 3 5, 14.3 2, 14.4 1")
  const [selectedM3Lecture, setSelectedM3Lecture] = useState<"lec-2" | "lec-1">("lec-2")
  const [filterMode, setFilterMode] = useState<"all" | "mandatory" | "similar">("all")
  const [isListening, setIsListening] = useState(false)
  const [speechTranscript, setSpeechTranscript] = useState("")
  const [solvedQuestions, setSolvedQuestions] = useState<Record<string, boolean>>({ "14.2-3": true, "14.3-2": true })
  const [okfStatus, setOkfStatus] = useState<string>("LOGGED")
  const [okfTopic, setOkfTopic] = useState<string>("Lecture 2: Cauchy's Integral Theorem & Path Independence (via NotebookLM)")

  // Pre-loaded Real Lecture 2 & Lecture 1 Problems (Sections 14.2, 14.3, 14.4)
  const [parsedProblems, setParsedProblems] = useState<MathProblem[]>([
    // Real Lecture 2: Cauchy's Integral Theorem & Formulas (Sections 14.2, 14.3, 14.4)
    {
      id: "14.2-3",
      exercise: "Ex 14.2",
      qNum: 3,
      isMandatory: true,
      title: "Cauchy's Integral Theorem on Simply Connected Contour",
      latex: "\\oint_C \\frac{z^2 + 1}{z - 3} \\, dz = 0, \\quad C: |z| = 1",
      topic: "Cauchy's Integral Theorem & Path Independence",
      difficulty: "Medium",
      methodOfWork: "Identify pole at z=3. Since z=3 lies strictly outside contour |z|=1, the integrand is analytic everywhere inside C. By Cauchy's Theorem, the closed contour integral is 0.",
    },
    {
      id: "14.2-5",
      exercise: "Ex 14.2",
      qNum: 5,
      isMandatory: true,
      title: "Path Independence Evaluation of Exponential Integral",
      latex: "\\int_{0}^{1+i\\pi} e^{2z} \\, dz = \\left[ \\frac{e^{2z}}{2} \\right]_0^{1+i\\pi} = \\frac{e^{2+2i\\pi}-1}{2} = \\frac{e^2 - 1}{2}",
      topic: "Path Independence & Complex Antiderivative",
      difficulty: "Easy",
      methodOfWork: "Because e^{2z} is entire (analytic everywhere in C), its integral is strictly path-independent. Integrate using the standard fundamental theorem of calculus.",
    },
    {
      id: "14.3-2",
      exercise: "Ex 14.3",
      qNum: 2,
      isMandatory: true,
      title: "Cauchy's Integral Formula with Singularity at Interior Pole",
      latex: "\\oint_C \\frac{e^z}{z - i} \\, dz = 2\\pi i f(i) = 2\\pi i e^i, \\quad C: |z| = 2",
      topic: "Cauchy's Integral Formula",
      difficulty: "Medium",
      methodOfWork: "Interior pole z_0 = i is inside |z|=2. Apply Cauchy's Integral Formula: \\oint_C \\frac{f(z)}{z - z_0} dz = 2\\pi i f(z_0) with f(z) = e^z.",
    },
    {
      id: "14.4-1",
      exercise: "Ex 14.4",
      qNum: 1,
      isMandatory: true,
      title: "Higher-Order Derivative Formula on Contour",
      latex: "\\oint_C \\frac{\\cos z}{(z - \\pi)^2} \\, dz = 2\\pi i f'(\\pi) = 2\\pi i (-\\sin \\pi) = 0, \\quad C: |z| = 4",
      topic: "Derivatives of Analytic Functions",
      difficulty: "Hard",
      methodOfWork: "Apply Cauchy's Derivative Formula: f'(z_0) = \\frac{1}{2\\pi i} \\oint_C \\frac{f(z)}{(z - z_0)^2} dz with f(z) = \\cos z, f'(z) = -\\sin z.",
    },
    // Similar Practice Generated from Sections 14.2 & 14.3 (Same Method of Work)
    {
      id: "14.2-4",
      exercise: "Ex 14.2",
      qNum: 4,
      isMandatory: false,
      similarTo: 3,
      title: "Similar Practice: Contour Integral around Triangle (Same Method as 14.2 Q3)",
      latex: "\\oint_C (z^3 + 2z) \\, dz = 0, \\quad C: \\text{Triangle with vertices at } 0, 1, i",
      topic: "Cauchy's Theorem Practice",
      difficulty: "Easy",
      methodOfWork: "Polynomials are entire functions (analytic everywhere). By Cauchy's Theorem, the integral along any closed path is 0.",
    },
    {
      id: "14.3-3",
      exercise: "Ex 14.3",
      qNum: 3,
      isMandatory: false,
      similarTo: 2,
      title: "Similar Practice: Cauchy Formula with Rational Pole (Same Method as 14.3 Q2)",
      latex: "\\oint_C \\frac{z^2 + 4}{z - 1} \\, dz = 2\\pi i (1^2 + 4) = 10\\pi i, \\quad C: |z| = 3",
      topic: "Cauchy Formula Practice",
      difficulty: "Medium",
      methodOfWork: "Pole z_0 = 1 lies inside contour |z|=3. Apply 2\\pi i f(1) with f(z) = z^2 + 4.",
    },
  ])

  // Web Speech API Voice Recognition
  const handleToggleVoiceInput = () => {
    if (typeof window === "undefined") return

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) {
      alert("Voice input is not supported in this browser. Please use Google Chrome or Safari.")
      return
    }

    if (isListening) {
      setIsListening(false)
      return
    }

    try {
      const recognition = new SpeechRecognition()
      recognition.continuous = false
      recognition.interimResults = true
      recognition.lang = "en-US"

      recognition.onstart = () => {
        setIsListening(true)
        setSpeechTranscript("Listening... Speak (e.g. 'Exercise 14.1 Question 1')")
      }

      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join("")
        setSpeechTranscript(transcript)

        // Parse numbers and exercise from speech
        const lower = transcript.toLowerCase()
        const exMatch = lower.match(/(?:exercise|section|chapter)?\s*(\d+[\.\s]\d+)/i)
        const qMatch = lower.match(/(?:question|problem|q|number|numbers)?\s*([\d\s,andto\-]+)/i)

        if (exMatch) {
          const exClean = exMatch[1].replace(/\s+/, ".")
          const numbers = transcript.match(/\d+/g) || []
          const qNumbers = numbers.filter((n) => n !== exClean.replace(".", ""))
          const formatted = `${exClean} ${qNumbers.length > 0 ? qNumbers.join(" ") : "1"}`
          setShorthandInput(formatted)
        }
      }

      recognition.onerror = (event: any) => {
        console.warn("Speech recognition error:", event.error)
        setIsListening(false)
      }

      recognition.onend = () => {
        setIsListening(false)
      }

      recognition.start()
    } catch (err) {
      console.error("Failed to start speech recognition:", err)
      setIsListening(false)
    }
  }

  // Parse professor shorthand (e.g. "14.1 1" or "4.1 3 4 5 6 7 8")
  const handleParseShorthand = (e: React.FormEvent) => {
    e.preventDefault()
    if (!shorthandInput.trim()) return

    const match = shorthandInput.match(/^(\d+\.\d+)\s*(.*)$/)
    if (match) {
      const exercise = match[1]
      const rawNumbers = match[2].match(/\d+/g) || ["1"]
      const mandatoryNumbers = rawNumbers.map((n) => parseInt(n, 10))

      const newProblems: MathProblem[] = []

      // Add mandatory questions
      mandatoryNumbers.forEach((qNum) => {
        newProblems.push({
          id: `${exercise}-${qNum}`,
          exercise: `Ex ${exercise}`,
          qNum,
          isMandatory: true,
          title: `Mandatory Homework Question ${qNum} (Section ${exercise})`,
          latex: `\\text{Solve Problem } ${qNum} \\text{ from Section } ${exercise} \\text{ assigned by Prof in Lecture}`,
          topic: `Chapter ${exercise.split(".")[0]} Core Syllabus`,
          difficulty: qNum % 2 === 0 ? "Medium" : "Hard",
          methodOfWork: `Standard textbook procedure for Section ${exercise}: apply definitions, compute step-by-step integrals/derivatives, and verify initial conditions.`,
        })

        // Generate 2 Similar Practice Questions (Same Method of Work)
        const sim1 = qNum + 1
        const sim2 = qNum + 2
        newProblems.push({
          id: `${exercise}-${sim1}`,
          exercise: `Ex ${exercise}`,
          qNum: sim1,
          isMandatory: false,
          similarTo: qNum,
          title: `Similar Practice Problem ${sim1} (Same Method as Q${qNum})`,
          latex: `\\text{Similar Practice Question } ${sim1} \\text{ in Section } ${exercise} \\text{ (Same Method of Work)}`,
          topic: `Chapter ${exercise.split(".")[0]} Practice`,
          difficulty: "Medium",
          methodOfWork: `Analogous to Question ${qNum}: follow the exact same substitution and integration method with altered coefficients.`,
        })
        newProblems.push({
          id: `${exercise}-${sim2}`,
          exercise: `Ex ${exercise}`,
          qNum: sim2,
          isMandatory: false,
          similarTo: qNum,
          title: `Similar Practice Problem ${sim2} (Same Method as Q${qNum})`,
          latex: `\\text{Similar Practice Question } ${sim2} \\text{ in Section } ${exercise} \\text{ (Same Method of Work)}`,
          topic: `Chapter ${exercise.split(".")[0]} Practice`,
          difficulty: "Hard",
          methodOfWork: `Same algorithmic steps as Question ${qNum}, testing edge case boundary values.`,
        })
      })

      setParsedProblems(newProblems)
    }
  }

  const toggleSolved = (id: string) => {
    setSolvedQuestions((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  // --- OS & AP State (Conversational Lecture Tutor) ---
  const [selectedLecture, setSelectedLecture] = useState("lec-1")
  const [copiedPrompt, setCopiedPrompt] = useState("")

  const osLectures = [
    {
      id: "lec-1",
      title: "Lecture 1: Processes, Dual Mode & Context Switching",
      summary: "User vs Kernel Mode, PCB structure, CPU scheduling state transitions, and context switch overhead.",
      keyConcepts: ["Process Control Block (PCB)", "Trap & System Calls", "Dual Mode Protection", "Context Switch Latency"],
    },
    {
      id: "lec-2",
      title: "Lecture 2: Threads, Concurrency & Race Conditions",
      summary: "Kernel vs User Threads, Critical Section problem, Mutual Exclusion requirements, and Peterson's Algorithm.",
      keyConcepts: ["Thread Local Storage", "Critical Section", "Atomic Operations", "Race Conditions"],
    },
    {
      id: "lec-3",
      title: "Lecture 3: Semaphores, Mutexes & Concurrency Bugs",
      summary: "Counting vs Binary Semaphores, Deadlock conditions (Coffman), Producer-Consumer, and Dining Philosophers.",
      keyConcepts: ["Semaphore Wait/Signal", "Deadlock 4 Conditions", "Priority Inversion", "Banker's Algorithm"],
    },
  ]

  const apLectures = [
    {
      id: "lec-ap-1",
      title: "Lecture 1: SOLID Principles & Object-Oriented Architecture",
      summary: "Single Responsibility, Open-Closed, Liskov Substitution, Interface Segregation, and Dependency Inversion.",
      keyConcepts: ["LSP Invariance", "Dependency Injection", "Loose Coupling", "Polymorphism"],
    },
    {
      id: "lec-ap-2",
      title: "Lecture 2: Creational & Structural Design Patterns",
      summary: "Factory Method, Abstract Factory, Singleton, Adapter, Decorator, and Composite patterns in Java.",
      keyConcepts: ["Factory vs Builder", "Decorator Composition", "Adapter Interface Matching"],
    },
  ]

  const currentLectures = isOS ? osLectures : apLectures

  const handleCopyPrompt = (promptText: string, key: string) => {
    navigator.clipboard.writeText(promptText)
    setCopiedPrompt(key)
    setTimeout(() => setCopiedPrompt(""), 3000)
  }

  // Filter problems by mandatory vs similar
  const displayedProblems = parsedProblems.filter((p) => {
    if (filterMode === "mandatory") return p.isMandatory
    if (filterMode === "similar") return !p.isMandatory
    return true
  })

  const mandatoryCount = parsedProblems.filter((p) => p.isMandatory).length
  const mandatorySolved = parsedProblems.filter((p) => p.isMandatory && solvedQuestions[p.id]).length

  return (
    <div className="space-y-6">
      {/* 1. MATH III WORKFLOW: Shorthand & Voice Parser, Homework Ledger, Similar Practice */}
      {isMath3 && (
        <Card className="border-indigo-500/30 bg-zinc-950/80 shadow-xl overflow-hidden backdrop-blur-xl">
          <CardHeader className="p-6 border-b border-zinc-800 bg-zinc-900/40">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400">
                  <Calculator className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-base font-semibold text-white">
                    Math III Homework &amp; Practice Ledger
                  </CardTitle>
                  <CardDescription className="text-xs text-zinc-500 mt-0.5">
                    Erwin Kreyszig • Mandatory problem sets &amp; similar practice
                  </CardDescription>
                </div>
              </div>

              {/* Solved Count */}
              <div className="text-right text-xs">
                <div className="text-zinc-400">
                  Completed: <span className="font-semibold text-white">{mandatorySolved} / {mandatoryCount}</span>
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-4 sm:p-5 space-y-4">
            {/* Minimal OKF Manifest Strip */}
            <div className="p-3 rounded-lg bg-zinc-900/60 border border-zinc-800 space-y-1 text-xs">
              <div className="flex items-center justify-between text-[11px] text-zinc-400">
                <span className="font-mono text-zinc-300">iiitd-mth201-lec02</span>
                <span className="text-zinc-300">🟢 Logged</span>
              </div>
              <div className="font-medium text-zinc-200">
                Lecture 2: Cauchy&apos;s Integral Theorem, Path Independence &amp; Formulas
              </div>
            </div>

            {/* Collapsible Method of Work Recipe */}
            <details className="rounded-lg border border-zinc-800 bg-zinc-900/30 p-3 text-xs group">
              <summary className="font-medium text-zinc-300 cursor-pointer flex items-center justify-between">
                <span>Method of Work: Cauchy&apos;s Theorem &amp; Integral Formula</span>
                <span className="text-zinc-500 text-[11px] group-open:rotate-180 transition-transform">▼</span>
              </summary>

              <div className="pt-3 space-y-2">
                <div className="p-2.5 rounded-md bg-zinc-950 border border-zinc-800/80 font-mono text-xs text-zinc-300 overflow-x-auto scrollbar-none">
                  <div className="whitespace-nowrap">{"\\oint_C f(z) \\, dz = 0 \\quad (\\text{Cauchy's Theorem for Analytic } f(z))"}</div>
                  <div className="text-[11px] text-zinc-400 whitespace-nowrap pt-1">{"f(z_0) = \\frac{1}{2\\pi i} \\oint_C \\frac{f(z)}{z - z_0} \\, dz \\quad (\\text{Cauchy's Integral Formula})"}</div>
                </div>

                <div className="grid gap-2 grid-cols-1 sm:grid-cols-2 text-[11px] text-zinc-400 pt-1">
                  <div className="p-2 rounded bg-zinc-900 border border-zinc-800">
                    <strong className="text-zinc-200 block">1. Check Domain &amp; Poles:</strong>
                    Find denominator roots $z_0$. Verify whether $z_0$ lies inside contour $C$.
                  </div>
                  <div className="p-2 rounded bg-zinc-900 border border-zinc-800">
                    <strong className="text-zinc-200 block">2. Apply Integral Rule:</strong>
                    If outside $\to 0$. If inside $\to 2\pi i f(z_0)$.
                  </div>
                </div>
              </div>
            </details>

            {/* Input Options: Voice Input + Shorthand Form */}
            <form onSubmit={handleParseShorthand} className="p-3 rounded-lg bg-zinc-900/40 border border-zinc-800 space-y-2">
              <div className="flex items-center justify-between text-xs text-zinc-400">
                <span className="font-medium text-zinc-300">
                  Enter Homework
                </span>
                <span className="text-[10px] text-zinc-500 font-mono">
                  e.g. <code>14.2 3 5, 14.3 2, 14.4 1</code>
                </span>
              </div>

              <div className="flex gap-2">
                <Input
                  value={shorthandInput}
                  onChange={(e) => setShorthandInput(e.target.value)}
                  placeholder="e.g. 14.2 3 5, 14.3 2, 14.4 1"
                  className="bg-zinc-950 border-zinc-800 text-xs font-mono flex-1"
                />

                <Button
                  type="button"
                  onClick={handleToggleVoiceInput}
                  className={`h-9 px-3 text-xs font-bold gap-1.5 transition-all ${
                    isListening
                      ? "bg-rose-600 hover:bg-rose-500 text-white animate-pulse"
                      : "bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700"
                  }`}
                >
                  {isListening ? (
                    <>
                      <MicOff className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">Listening...</span>
                    </>
                  ) : (
                    <>
                      <Mic className="h-3.5 w-3.5 text-indigo-400" />
                      <span className="hidden sm:inline">Voice</span>
                    </>
                  )}
                </Button>

                <Button
                  type="submit"
                  className="h-9 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-3 sm:px-4"
                >
                  Update
                </Button>
              </div>

              {speechTranscript && (
                <div className="text-[11px] text-indigo-300/90 font-mono italic">
                  🎙️ Transcribed: &quot;{speechTranscript}&quot;
                </div>
              )}
            </form>

            {/* Filter Tabs: All vs Mandatory vs Similar Practice */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-zinc-800 pb-2 gap-2">
              <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none flex-nowrap -mx-3.5 px-3.5 sm:mx-0 sm:px-0">
                <button
                  onClick={() => setFilterMode("all")}
                  className={`shrink-0 px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                    filterMode === "all" ? "bg-zinc-800 text-white" : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  All ({parsedProblems.length})
                </button>
                <button
                  onClick={() => setFilterMode("mandatory")}
                  className={`shrink-0 px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                    filterMode === "mandatory" ? "bg-zinc-800 text-white" : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  Mandatory ({mandatoryCount})
                </button>
                <button
                  onClick={() => setFilterMode("similar")}
                  className={`shrink-0 px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                    filterMode === "similar" ? "bg-zinc-800 text-white" : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  Similar ({parsedProblems.length - mandatoryCount})
                </button>
              </div>

              <span className="text-[11px] text-zinc-500">
                Mandatory homework + optional similar practice
              </span>
            </div>

            {/* Problem Ledger Grid */}
            <div className="grid gap-2.5">
              {displayedProblems.map((prob) => {
                const isSolved = solvedQuestions[prob.id]
                return (
                  <div
                    key={prob.id}
                    className="p-3.5 rounded-lg border border-zinc-800 bg-zinc-900/40 space-y-2 transition-colors hover:border-zinc-700"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1 flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-semibold text-white">
                            {prob.exercise} — Q{prob.qNum}
                          </span>
                          <span className="text-[10px] text-zinc-500">
                            {prob.isMandatory ? "Mandatory" : "Similar Practice"}
                          </span>
                        </div>

                        <h4 className="text-xs font-medium text-zinc-200">{prob.title}</h4>

                        <div className="p-2.5 rounded bg-zinc-950 border border-zinc-800 font-mono text-xs text-zinc-200 overflow-x-auto scrollbar-none">
                          <div className="whitespace-nowrap">{prob.latex}</div>
                        </div>

                        <div className="text-[11px] text-zinc-400 leading-relaxed pt-0.5">
                          <span className="text-zinc-300 font-medium">Method: </span>
                          {prob.methodOfWork}
                        </div>
                      </div>

                      <div className="shrink-0 flex items-center gap-2">
                        <button
                          onClick={() => toggleSolved(prob.id)}
                          className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors flex items-center gap-1 ${
                            isSolved
                              ? "bg-zinc-800 text-zinc-200 border border-zinc-700"
                              : "bg-white text-zinc-950 hover:bg-zinc-200"
                          }`}
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span>{isSolved ? "Completed" : "Mark Done"}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 2. OPERATING SYSTEMS & AP WORKFLOW: Conversational Lecture Tutor */}
      {(isOS || isAP) && (
        <Card className="border-zinc-800 bg-zinc-900/30 overflow-hidden">
          <CardHeader className="p-4 sm:p-5 border-b border-zinc-800 bg-zinc-900/40">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm sm:text-base font-semibold text-white">
                  {isOS ? "Operating Systems" : "Advanced Programming"} Lecture Notes &amp; Prompts
                </CardTitle>
                <CardDescription className="text-xs text-zinc-500 mt-0.5">
                  High-yield summaries and study prompts
                </CardDescription>
              </div>

              <a
                href="https://notebooklm.google.com"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 px-3 py-1.5 text-xs font-medium text-zinc-200"
              >
                <span>NotebookLM</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </CardHeader>

          <CardContent className="p-4 sm:p-5 space-y-4">
            <div className="grid gap-2 sm:grid-cols-3">
              {currentLectures.map((lec) => (
                <button
                  key={lec.id}
                  onClick={() => setSelectedLecture(lec.id)}
                  className={`p-3 rounded-lg border text-left transition-colors ${
                    selectedLecture === lec.id
                      ? "border-zinc-500 bg-zinc-800 text-white"
                      : "border-zinc-800 bg-zinc-900/50 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
                  }`}
                >
                  <div className="text-[10px] font-medium text-zinc-500">
                    Module
                  </div>
                  <h4 className="text-xs font-semibold text-white mt-0.5 line-clamp-1">{lec.title}</h4>
                </button>
              ))}
            </div>

            {(() => {
              const lec = currentLectures.find((l) => l.id === selectedLecture) || currentLectures[0]
              return (
                <div className="space-y-3 p-4 rounded-xl bg-zinc-900/50 border border-zinc-800">
                  <div className="space-y-1">
                    <h3 className="text-xs font-semibold text-white">{lec.title}</h3>
                    <p className="text-xs text-zinc-400 leading-relaxed">{lec.summary}</p>
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap pt-1">
                    <span className="text-[10px] font-medium text-zinc-500">Key Concepts:</span>
                    {lec.keyConcepts.map((k) => (
                      <span key={k} className="rounded bg-zinc-800 px-2 py-0.5 text-[10px] text-zinc-300">
                        {k}
                      </span>
                    ))}
                  </div>

                  <div className="space-y-2 pt-2 border-t border-zinc-800">
                    <div className="text-xs font-medium text-zinc-300">
                      Study Prompts:
                    </div>

                    {[
                      {
                        key: "teach",
                        label: "Teach Me Step-by-Step",
                        prompt: `Act as a senior professor at IIIT Delhi teaching ${lec.title}. Break down the concepts step-by-step with real-world analogies, code examples, and clear diagrams.`,
                      },
                      {
                        key: "quiz",
                        label: "Quiz Me on Exam Questions",
                        prompt: `Generate 3 high-probability conceptual and analytical midsem exam questions based on ${lec.title}. Ask me one question at a time and evaluate my answers.`,
                      },
                      {
                        key: "edge-cases",
                        label: "Explain Edge Cases",
                        prompt: `What is the most difficult and commonly misunderstood concept in ${lec.title}? Explain subtle edge cases.`,
                      },
                    ].map((p) => (
                      <div
                        key={p.key}
                        className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="font-medium text-zinc-200">{p.label}</div>
                          <div className="text-[10px] text-zinc-500 mt-0.5 truncate font-mono">
                            {p.prompt}
                          </div>
                        </div>

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCopyPrompt(p.prompt, `${selectedLecture}-${p.key}`)}
                          className="h-7 text-[10px] font-medium border-zinc-700 hover:bg-zinc-800 text-zinc-200 shrink-0"
                        >
                          {copiedPrompt === `${selectedLecture}-${p.key}` ? (
                            <>
                              <Check className="h-3 w-3 mr-1 text-zinc-200" /> Copied
                            </>
                          ) : (
                            <>
                              <Copy className="h-3 w-3 mr-1" /> Copy
                            </>
                          )}
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })()}
          </CardContent>
        </Card>
      )}

      {/* 3. DPP 2026 & RMSSD WORKFLOW: Master Quality Design & Research Notes */}
      {(isDPP || isRMSSD) && (
        <Card className="border-zinc-800 bg-zinc-900/30 overflow-hidden">
          <CardHeader className="p-4 sm:p-5 border-b border-zinc-800 bg-zinc-900/40">
            <div>
              <CardTitle className="text-sm sm:text-base font-semibold text-white">
                {isDPP ? "DPP 2026 Design Process Notes" : "RMSSD Research Methodology"}
              </CardTitle>
              <CardDescription className="text-xs text-zinc-500 mt-0.5">
                Core frameworks and studio reference
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="p-4 sm:p-5 space-y-3">
            <div className="grid gap-2.5 sm:grid-cols-2">
              {(isDPP
                ? [
                    { title: "Design Thinking & Empathy Mapping", desc: "User interview protocols, persona synthesis, and journey mapping frameworks." },
                    { title: "Nielsen's 10 Usability Heuristics", desc: "System status visibility, error prevention, heuristic scoring rubrics, and audit matrices." },
                    { title: "Information Architecture & Wireframing", desc: "Card sorting methodologies, low-fidelity wireframing, and interactive prototyping." },
                    { title: "Usability Testing & Studio Review", desc: "Moderated vs unmoderated testing, task success rate metrics, and SUS scoring." },
                  ]
                : [
                    { title: "Qualitative Research & Thematic Coding", desc: "Inductive vs deductive coding, thematic synthesis, and grounded theory." },
                    { title: "Quantitative Sampling & Statistics", desc: "Stratified vs cluster sampling, ANOVA, Chi-square tests, and statistical power." },
                    { title: "Survey Design & Psychometrics", desc: "Likert scale design, response bias mitigation, and Cronbach's alpha reliability." },
                    { title: "Research Ethics & IRB Protocol", desc: "Informed consent, participant anonymization, and ethical design compliance." },
                  ]
              ).map((mod, idx) => (
                <div key={idx} className="p-3.5 rounded-lg border border-zinc-800 bg-zinc-900/40 space-y-1">
                  <h4 className="text-xs font-medium text-white flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-zinc-400" />
                    <span>{mod.title}</span>
                  </h4>
                  <p className="text-[11px] text-zinc-400 leading-relaxed">{mod.desc}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
