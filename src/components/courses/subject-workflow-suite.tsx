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
import { MathView, FormattedMathText } from "@/components/ui/math-view"

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
  const [showHomeworkModal, setShowHomeworkModal] = useState(false)
  const [showMethodModal, setShowMethodModal] = useState(false)

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
      {/* 1. MATH III WORKFLOW: Zero-Clutter, Real KaTeX Mathematical Typesetting */}
      {isMath3 && (
        <div className="space-y-4">
          {/* Top Clean Header & Actions Toolbar */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 sm:p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono text-zinc-400">iiitd-mth201-lec02</span>
                  <span className="text-zinc-500">•</span>
                  <span className="text-[11px] text-zinc-400">Erwin Kreyszig Chapter 14</span>
                </div>
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight mt-0.5">
                  Lecture 2: Cauchy&apos;s Integral Theorem &amp; Formulas
                </h2>
                <div className="text-xs text-zinc-400 mt-1">
                  Homework: <code className="text-zinc-200 font-mono">{shorthandInput}</code>
                  <span className="text-zinc-500 mx-2">•</span>
                  Completed <span className="font-semibold text-white">{mandatorySolved} / {mandatoryCount}</span> mandatory
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowMethodModal(true)}
                  className="h-8 text-xs font-medium border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 gap-1.5"
                >
                  <BookMarked className="h-3.5 w-3.5" />
                  <span>Method of Work</span>
                </Button>

                <Button
                  size="sm"
                  onClick={() => setShowHomeworkModal(true)}
                  className="h-8 text-xs font-medium bg-white text-zinc-950 hover:bg-zinc-200 gap-1.5"
                >
                  <Mic className="h-3.5 w-3.5" />
                  <span>Update Homework</span>
                </Button>
              </div>
            </div>

            {/* Segmented Filter Control */}
            <div className="flex items-center justify-between border-t border-zinc-800/80 pt-3 mt-4 text-xs">
              <div className="flex items-center gap-1 rounded-lg bg-zinc-950/60 p-1 border border-zinc-800">
                <button
                  onClick={() => setFilterMode("all")}
                  className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                    filterMode === "all" ? "bg-zinc-800 text-white" : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  All ({parsedProblems.length})
                </button>
                <button
                  onClick={() => setFilterMode("mandatory")}
                  className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                    filterMode === "mandatory" ? "bg-zinc-800 text-white" : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  Mandatory ({mandatoryCount})
                </button>
                <button
                  onClick={() => setFilterMode("similar")}
                  className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                    filterMode === "similar" ? "bg-zinc-800 text-white" : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  Similar Practice ({parsedProblems.length - mandatoryCount})
                </button>
              </div>

              <div className="text-[11px] text-zinc-500 hidden sm:block">
                Assigned in class &amp; textbook similar exercises
              </div>
            </div>
          </div>

          {/* Clean Problem Cards with KaTeX Math Typesetting */}
          <div className="space-y-3">
            {displayedProblems.map((prob) => {
              const isSolved = solvedQuestions[prob.id]
              return (
                <div
                  key={prob.id}
                  className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 sm:p-5 transition-colors hover:border-zinc-700"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-2 flex-1 min-w-0">
                      {/* Problem Header */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-semibold text-white">
                          {prob.exercise} — Question {prob.qNum}
                        </span>
                        <span className="text-zinc-600">•</span>
                        <span className="text-[11px] text-zinc-400 font-medium">
                          {prob.isMandatory ? "Mandatory Homework" : "Similar Practice"}
                        </span>
                      </div>

                      {/* Problem Title */}
                      <h3 className="text-xs sm:text-sm font-medium text-zinc-200">
                        {prob.title}
                      </h3>

                      {/* Beautiful KaTeX Typeset Formula Block */}
                      <div className="my-2.5 p-3 rounded-lg bg-zinc-950/80 border border-zinc-800/80 text-center overflow-x-auto scrollbar-none text-zinc-100">
                        <MathView math={prob.latex} displayMode={true} />
                      </div>

                      {/* Method of Work Explanation with Inline KaTeX */}
                      <div className="text-xs text-zinc-400 leading-relaxed pt-1">
                        <span className="text-zinc-200 font-medium">Method of Work: </span>
                        <FormattedMathText text={prob.methodOfWork} />
                      </div>
                    </div>

                    {/* Completion Action */}
                    <div className="shrink-0 pt-1">
                      <button
                        onClick={() => toggleSolved(prob.id)}
                        className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors flex items-center gap-1.5 ${
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

          {/* Modal 1: Method of Work Reference (KaTeX Typeset) */}
          <AnimatePresence>
            {showMethodModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
                <motion.div
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  className="w-full max-w-lg rounded-2xl bg-zinc-950 border border-zinc-800 p-5 space-y-4 shadow-2xl"
                >
                  <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                    <div>
                      <h3 className="text-sm font-semibold text-white">
                        Method of Work: Cauchy&apos;s Theorem &amp; Formulas
                      </h3>
                      <p className="text-[11px] text-zinc-500 mt-0.5">
                        Erwin Kreyszig Sections 14.2, 14.3, 14.4
                      </p>
                    </div>
                    <button
                      onClick={() => setShowMethodModal(false)}
                      className="text-xs text-zinc-400 hover:text-white p-1"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="space-y-3 text-xs text-zinc-300">
                    <div className="p-3 rounded-lg bg-zinc-900/60 border border-zinc-800 text-center space-y-2">
                      <div className="text-[11px] text-zinc-400">1. Cauchy&apos;s Theorem (Analytic function along closed contour):</div>
                      <MathView math="\\oint_C f(z) \\, dz = 0" displayMode={true} />
                      <div className="text-[11px] text-zinc-400 pt-2">2. Cauchy&apos;s Integral Formula (Pole inside contour):</div>
                      <MathView math="f(z_0) = \\frac{1}{2\\pi i} \\oint_C \\frac{f(z)}{z - z_0} \\, dz" displayMode={true} />
                    </div>

                    <div className="grid gap-2 grid-cols-1 sm:grid-cols-2 text-[11px]">
                      <div className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-800">
                        <strong className="text-white block mb-0.5">Step 1: Check Domain &amp; Poles</strong>
                        Find denominator roots <MathView math="z_0" />. Determine whether <MathView math="z_0" /> is strictly inside or outside contour <MathView math="C" />.
                      </div>
                      <div className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-800">
                        <strong className="text-white block mb-0.5">Step 2: Apply Integral Rule</strong>
                        If pole is outside <MathView math="C" /> $\to$ integral is $0$. If pole is inside $\to$ evaluate <MathView math="2\\pi i f(z_0)" />.
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <Button
                      onClick={() => setShowMethodModal(false)}
                      className="h-8 bg-zinc-800 hover:bg-zinc-700 text-xs text-white"
                    >
                      Close
                    </Button>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          {/* Modal 2: Edit Homework (Voice & Shorthand) */}
          <AnimatePresence>
            {showHomeworkModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
                <motion.div
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  className="w-full max-w-md rounded-2xl bg-zinc-950 border border-zinc-800 p-5 space-y-4 shadow-2xl"
                >
                  <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                    <div>
                      <h3 className="text-sm font-semibold text-white">Update Math III Homework</h3>
                      <p className="text-[11px] text-zinc-500 mt-0.5">
                        Type shorthand (e.g. <code>14.2 3 5, 14.3 2, 14.4 1</code>) or speak
                      </p>
                    </div>
                    <button
                      onClick={() => setShowHomeworkModal(false)}
                      className="text-xs text-zinc-400 hover:text-white p-1"
                    >
                      ✕
                    </button>
                  </div>

                  <form
                    onSubmit={(e) => {
                      handleParseShorthand(e)
                      setShowHomeworkModal(false)
                    }}
                    className="space-y-3"
                  >
                    <div className="space-y-1.5">
                      <div className="flex gap-2">
                        <Input
                          value={shorthandInput}
                          onChange={(e) => setShorthandInput(e.target.value)}
                          placeholder="e.g. 14.2 3 5, 14.3 2, 14.4 1"
                          className="bg-zinc-900 border-zinc-800 text-xs font-mono flex-1 h-9"
                          required
                        />

                        <Button
                          type="button"
                          onClick={handleToggleVoiceInput}
                          variant="outline"
                          className={`h-9 px-3 text-xs font-medium gap-1.5 border-zinc-700 ${
                            isListening ? "bg-zinc-800 text-white" : "text-zinc-300"
                          }`}
                        >
                          {isListening ? (
                            <>
                              <MicOff className="h-3.5 w-3.5" />
                              <span>Listening</span>
                            </>
                          ) : (
                            <>
                              <Mic className="h-3.5 w-3.5" />
                              <span>Voice</span>
                            </>
                          )}
                        </Button>
                      </div>

                      {speechTranscript && (
                        <div className="text-[11px] text-zinc-400 font-mono italic">
                          &quot;{speechTranscript}&quot;
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2">
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => setShowHomeworkModal(false)}
                        className="h-8 text-xs text-zinc-400"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        className="h-8 bg-white text-zinc-950 hover:bg-zinc-200 text-xs font-semibold"
                      >
                        Save &amp; Parse
                      </Button>
                    </div>
                  </form>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </div>
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
