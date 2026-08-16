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
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-lg font-bold text-white">
                      Math III Homework & Similar Practice Suite
                    </CardTitle>
                    <Badge className="bg-indigo-500/20 text-indigo-300 border-indigo-500/40 text-[10px] font-bold">
                      Erwin Kreyszig Bible
                    </Badge>
                  </div>
                  <CardDescription className="text-xs text-zinc-400 mt-0.5">
                    Extracts mandatory homework questions and auto-generates similar practice problems with identical methods of work.
                  </CardDescription>
                </div>
              </div>

              {/* Mandatory Readiness Meter */}
              <div className="text-right">
                <div className="text-xs text-zinc-400">
                  Mandatory Homework:{" "}
                  <span className="font-bold text-emerald-400">
                    {mandatorySolved} / {mandatoryCount}
                  </span>
                </div>
                <div className="text-[10px] text-indigo-400 font-medium">
                  {parsedProblems.length - mandatoryCount} Similar Practice Problems Available
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-6 space-y-6">
            {/* OKF Semantic Manifest Banner (NotebookLM Topic + User Homework) */}
            <div className="p-4 rounded-2xl bg-zinc-900/90 border border-indigo-500/40 space-y-2">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <Badge className="bg-indigo-600 text-white font-mono text-[10px] font-bold">
                    🏷️ OKF Semantic Manifest
                  </Badge>
                  <span className="font-mono text-xs text-indigo-300 font-bold">
                    iiitd-mth201-lec02
                  </span>
                </div>
                <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/40 text-[10px] font-bold">
                  Status: 🟢 Homework Logged (14.2, 14.3, 14.4)
                </Badge>
              </div>

              <div className="text-xs text-zinc-200 font-medium">
                <span className="text-zinc-400">NotebookLM Extracted Topic: </span>
                <span className="text-indigo-300 font-bold">
                  Lecture 2: Cauchy&apos;s Integral Theorem, Path Independence &amp; Cauchy Formulas (Sections 14.2, 14.3, 14.4)
                </span>
              </div>
              <div className="text-[11px] text-zinc-400">
                Storage: <span className="font-mono text-zinc-300">Learny Vault / Sem 3 / Math III / Notes / Lecture2_ComplexLineIntegrals.pdf</span>
              </div>
            </div>

            {/* Textbook 'Method of Work' Recipe Card (Erwin Kreyszig Chapter 14) */}
            <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-indigo-300">
                  <BookMarked className="h-4 w-4 text-indigo-400" />
                  <span>Textbook Bible Method of Work (Chapter 14: Cauchy&apos;s Theorem &amp; Formula)</span>
                </div>
                <Badge className="bg-indigo-600/30 text-indigo-200 text-[9px] font-mono">
                  Kreyszig Section 14.2 &amp; 14.3
                </Badge>
              </div>

              <div className="p-3 rounded-xl bg-zinc-950/80 border border-zinc-800 font-mono text-xs text-indigo-300 space-y-1">
                <div>{"\\oint_C f(z) \\, dz = 0 \\quad (\\text{Cauchy's Theorem for Analytic } f(z))"}</div>
                <div className="text-[11px] text-zinc-400">{"f(z_0) = \\frac{1}{2\\pi i} \\oint_C \\frac{f(z)}{z - z_0} \\, dz \\quad (\\text{Cauchy's Integral Formula})"}</div>
              </div>

              <div className="grid gap-2 sm:grid-cols-4 text-xs text-zinc-300">
                <div className="p-2.5 rounded-lg bg-zinc-900/80 border border-zinc-800">
                  <span className="font-bold text-white block mb-0.5">Step 1: Check Domain</span>
                  <span className="text-[11px] text-zinc-400">Verify if contour C is simple, closed, and simply connected.</span>
                </div>
                <div className="p-2.5 rounded-lg bg-zinc-900/80 border border-zinc-800">
                  <span className="font-bold text-white block mb-0.5">Step 2: Locate Singularities</span>
                  <span className="text-[11px] text-zinc-400">Find denominator roots z_0. Determine if inside or outside C.</span>
                </div>
                <div className="p-2.5 rounded-lg bg-zinc-900/80 border border-zinc-800">
                  <span className="font-bold text-white block mb-0.5">Step 3: Apply Theorem</span>
                  <span className="text-[11px] text-zinc-400">If pole is outside C → Integral is 0 (by Cauchy&apos;s Theorem).</span>
                </div>
                <div className="p-2.5 rounded-lg bg-zinc-900/80 border border-zinc-800">
                  <span className="font-bold text-white block mb-0.5">Step 4: Integral Formula</span>
                  <span className="text-[11px] text-zinc-400">If pole is inside C → Evaluate 2\pi i f(z_0).</span>
                </div>
              </div>
            </div>

            {/* Input Options: Voice Input + Shorthand Form */}
            <form onSubmit={handleParseShorthand} className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-200">
                  Homework Entry (Type Shorthand or Click Mic to Speak)
                </span>
                <span className="text-[10px] text-zinc-500 font-mono">
                  Example: <code>14.1 1</code> or <code>4.1 3 4 5 6 7 8</code>
                </span>
              </div>

              <div className="flex gap-2">
                <Input
                  value={shorthandInput}
                  onChange={(e) => setShorthandInput(e.target.value)}
                  placeholder="e.g. 14.1 1 or 4.1 3 4 5 6 7 8"
                  className="bg-zinc-950 border-zinc-800 text-xs font-mono flex-1"
                />

                {/* Voice Input Button */}
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
                      <span>Listening...</span>
                    </>
                  ) : (
                    <>
                      <Mic className="h-3.5 w-3.5 text-indigo-400" />
                      <span>Voice Input</span>
                    </>
                  )}
                </Button>

                <Button type="submit" size="sm" className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs shrink-0 font-bold">
                  Extract & Generate Similar
                </Button>
              </div>

              {speechTranscript && (
                <div className="text-[11px] text-indigo-300/90 font-mono italic">
                  🎙️ Transcribed: &quot;{speechTranscript}&quot;
                </div>
              )}
            </form>

            {/* Filter Tabs: All vs Mandatory vs Similar Practice */}
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setFilterMode("all")}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    filterMode === "all" ? "bg-zinc-800 text-white" : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  All Questions ({parsedProblems.length})
                </button>
                <button
                  onClick={() => setFilterMode("mandatory")}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    filterMode === "mandatory" ? "bg-rose-950/60 text-rose-300 border border-rose-500/30" : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  <Flame className="h-3 w-3 text-rose-400" />
                  <span>Mandatory Homework ({mandatoryCount})</span>
                </button>
                <button
                  onClick={() => setFilterMode("similar")}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    filterMode === "similar" ? "bg-emerald-950/60 text-emerald-300 border border-emerald-500/30" : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  <Sparkles className="h-3 w-3 text-emerald-400" />
                  <span>Similar Practice ({parsedProblems.length - mandatoryCount})</span>
                </button>
              </div>

              <span className="text-[11px] text-zinc-500">
                Professor rule: &quot;Solve homework + try similar questions in spare time&quot;
              </span>
            </div>

            {/* Problem Ledger Grid */}
            <div className="grid gap-3">
              {displayedProblems.map((prob) => {
                const isSolved = solvedQuestions[prob.id]
                return (
                  <motion.div
                    key={prob.id}
                    whileHover={{ y: -1 }}
                    className={`p-4 rounded-xl border transition-all ${
                      isSolved
                        ? "border-emerald-500/30 bg-emerald-950/10"
                        : prob.isMandatory
                        ? "border-rose-500/30 bg-rose-950/10"
                        : "border-zinc-800 bg-zinc-900/60"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge
                            className={`font-mono text-xs font-bold ${
                              prob.isMandatory
                                ? "bg-rose-600 text-white"
                                : "bg-emerald-600/30 text-emerald-300 border border-emerald-500/40"
                            }`}
                          >
                            {prob.exercise} — Q{prob.qNum}
                          </Badge>

                          <Badge
                            variant="outline"
                            className={`text-[9px] font-bold uppercase tracking-wider ${
                              prob.isMandatory
                                ? "border-rose-500/40 text-rose-300 bg-rose-950/30"
                                : "border-emerald-500/40 text-emerald-300 bg-emerald-950/30"
                            }`}
                          >
                            {prob.isMandatory ? "🔴 Mandatory Homework" : "🟢 Spare Time Practice"}
                          </Badge>

                          <Badge variant="outline" className="text-[10px] border-zinc-700 text-zinc-300">
                            {prob.topic}
                          </Badge>
                        </div>

                        <h4 className="text-xs font-bold text-zinc-100">{prob.title}</h4>

                        <div className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-800/80 font-mono text-xs text-indigo-300">
                          {prob.latex}
                        </div>

                        <div className="text-[11px] text-zinc-400 leading-relaxed pt-1">
                          <span className="font-bold text-zinc-300">Method of Work: </span>
                          {prob.methodOfWork}
                        </div>
                      </div>

                      <div className="shrink-0 flex flex-col items-end gap-2">
                        <button
                          onClick={() => toggleSolved(prob.id)}
                          className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all flex items-center gap-1.5 ${
                            isSolved
                              ? "bg-emerald-600 text-white shadow-sm"
                              : "bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
                          }`}
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span>{isSolved ? "Solved" : "Mark Solved"}</span>
                        </button>

                        <a
                          href="https://notebooklm.google.com"
                          target="_blank"
                          rel="noreferrer"
                          className="text-[10px] text-indigo-400 hover:underline flex items-center gap-1"
                        >
                          <span>NotebookLM proof</span>
                          <ExternalLink className="h-2.5 w-2.5" />
                        </a>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 2. OPERATING SYSTEMS & AP WORKFLOW: Conversational Lecture Tutor */}
      {(isOS || isAP) && (
        <Card className="border-purple-500/30 bg-zinc-950/80 shadow-xl overflow-hidden backdrop-blur-xl">
          <CardHeader className="p-6 border-b border-zinc-800 bg-zinc-900/40">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-600/20 border border-purple-500/30 text-purple-400">
                  {isOS ? <Code2 className="h-5 w-5" /> : <Layers className="h-5 w-5" />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-lg font-bold text-white">
                      {isOS ? "Operating Systems" : "Advanced Programming"} Conversational Lecture Tutor
                    </CardTitle>
                    <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/40 text-[10px] font-bold">
                      Pre-Written Prompts & Dialogue
                    </Badge>
                  </div>
                  <CardDescription className="text-xs text-zinc-400 mt-0.5">
                    Click any lecture to study in conversational tutor mode with pre-crafted doubt & exam question prompts.
                  </CardDescription>
                </div>
              </div>

              <a
                href="https://notebooklm.google.com"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg bg-purple-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-purple-500 shadow-md shadow-purple-600/30"
              >
                <span>Launch in NotebookLM</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </CardHeader>

          <CardContent className="p-6 space-y-6">
            <div className="grid gap-3 sm:grid-cols-3">
              {currentLectures.map((lec) => (
                <button
                  key={lec.id}
                  onClick={() => setSelectedLecture(lec.id)}
                  className={`p-3.5 rounded-xl border text-left transition-all ${
                    selectedLecture === lec.id
                      ? "border-purple-500 bg-purple-950/20 text-white ring-1 ring-purple-500"
                      : "border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
                  }`}
                >
                  <div className="text-[10px] font-bold uppercase tracking-wider text-purple-400">
                    Lecture Module
                  </div>
                  <h4 className="text-xs font-bold text-white mt-0.5 line-clamp-1">{lec.title}</h4>
                </button>
              ))}
            </div>

            {(() => {
              const lec = currentLectures.find((l) => l.id === selectedLecture) || currentLectures[0]
              return (
                <div className="space-y-4 p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800">
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-white">{lec.title}</h3>
                    <p className="text-xs text-zinc-300 leading-relaxed">{lec.summary}</p>
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap pt-1">
                    <span className="text-[10px] font-bold text-zinc-400">Core Concepts:</span>
                    {lec.keyConcepts.map((k) => (
                      <Badge key={k} className="bg-zinc-950 text-purple-300 border border-purple-500/20 text-[10px]">
                        {k}
                      </Badge>
                    ))}
                  </div>

                  <div className="space-y-2.5 pt-3 border-t border-zinc-800">
                    <div className="text-xs font-bold text-zinc-300">
                      ⚡ 1-Click Pre-Written Study & Tutor Prompts:
                    </div>

                    {[
                      {
                        key: "teach",
                        label: "🎓 Teach Me This Lecture Step-by-Step",
                        prompt: `Act as a senior professor at IIIT Delhi teaching ${lec.title}. Break down the concepts step-by-step with real-world analogies, code examples, and clear diagrams.`,
                      },
                      {
                        key: "quiz",
                        label: "❓ Quiz Me on Potential Midsem Exam Questions",
                        prompt: `Generate 3 high-probability conceptual and analytical midsem exam questions based on ${lec.title}. Ask me one question at a time and evaluate my answers.`,
                      },
                      {
                        key: "edge-cases",
                        label: "💡 Explain the Hardest Concept & Concurrency Edge Cases",
                        prompt: `What is the most difficult and commonly misunderstood concept in ${lec.title}? Explain the subtle edge cases and race conditions students often fail in tests.`,
                      },
                    ].map((p) => (
                      <div
                        key={p.key}
                        className="p-3 rounded-xl bg-zinc-950 border border-zinc-800/80 flex items-center justify-between gap-3 text-xs"
                      >
                        <div>
                          <div className="font-bold text-purple-200">{p.label}</div>
                          <div className="text-[11px] text-zinc-400 mt-0.5 font-mono line-clamp-1">
                            {p.prompt}
                          </div>
                        </div>

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCopyPrompt(p.prompt, `${selectedLecture}-${p.key}`)}
                          className="h-7 text-[10px] font-bold border-zinc-700 hover:bg-zinc-800 text-zinc-200 shrink-0"
                        >
                          {copiedPrompt === `${selectedLecture}-${p.key}` ? (
                            <>
                              <Check className="h-3 w-3 mr-1 text-emerald-400" /> Copied
                            </>
                          ) : (
                            <>
                              <Copy className="h-3 w-3 mr-1" /> Copy Prompt
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
        <Card className="border-emerald-500/30 bg-zinc-950/80 shadow-xl overflow-hidden backdrop-blur-xl">
          <CardHeader className="p-6 border-b border-zinc-800 bg-zinc-900/40">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600/20 border border-emerald-500/30 text-emerald-400">
                  {isDPP ? <Palette className="h-5 w-5" /> : <BarChart3 className="h-5 w-5" />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-lg font-bold text-white">
                      {isDPP ? "DPP 2026 Master Quality Design Notes" : "RMSSD Comprehensive Research Methodology"}
                    </CardTitle>
                    <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/40 text-[10px] font-bold">
                      Zero-Loss Documentation
                    </Badge>
                  </div>
                  <CardDescription className="text-xs text-zinc-400 mt-0.5">
                    Complete, exhaustive notes capturing design thinking frameworks, heuristics, qualitative coding, and statistics.
                  </CardDescription>
                </div>
              </div>

              <Badge className="bg-zinc-800 text-zinc-300 text-xs">
                Full Studio Fidelity
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="p-6 space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              {(isDPP
                ? [
                    { title: "Design Thinking & Empathy Mapping", desc: "User interview protocols, persona synthesis, and journey mapping frameworks for Friday studio critiques." },
                    { title: "Nielsen's 10 Usability Heuristics", desc: "System status visibility, error prevention, heuristic scoring rubrics, and usability audit matrices." },
                    { title: "Information Architecture & Wireframing", desc: "Card sorting methodologies, low-fidelity wireframing, and interactive prototyping guidelines." },
                    { title: "Usability Testing & Studio Review", desc: "Moderated vs unmoderated testing, task success rate metrics, and SUS (System Usability Scale) scoring." },
                  ]
                : [
                    { title: "Qualitative Research & Thematic Coding", desc: "Inductive vs deductive coding, thematic synthesis, inter-rater reliability, and grounded theory." },
                    { title: "Quantitative Sampling & SPSS/R Statistics", desc: "Stratified vs cluster sampling, ANOVA, Chi-square tests, p-values, and statistical power." },
                    { title: "Survey Design & Psychometric Scales", desc: "Likert scale design, response bias mitigation, validity, and Cronbach's alpha reliability." },
                    { title: "Research Ethics & IRB Protocol", desc: "Informed consent, participant anonymization, and ethical design compliance for academic studies." },
                  ]
              ).map((mod, idx) => (
                <div key={idx} className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/60 space-y-1.5">
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
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
