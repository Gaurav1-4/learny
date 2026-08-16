"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Calculator,
  ExternalLink,
  FileText,
  Brain,
  Copy,
  Check,
  Mic,
  MicOff,
  BookMarked,
  CheckCircle2,
  BookOpen,
  Sparkles,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MathView, FormattedMathText } from "@/components/ui/math-view"
import { ClassroomCourseWorkMaterial, ClassroomCourseWork, ClassroomAnnouncement } from "@/types"

interface SubjectWorkflowSuiteProps {
  courseId: string
  courseName: string
  courseSection?: string
  materials?: ClassroomCourseWorkMaterial[]
  coursework?: ClassroomCourseWork[]
  announcements?: ClassroomAnnouncement[]
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

export function SubjectWorkflowSuite({
  courseId,
  courseName,
  courseSection,
  materials = [],
  coursework = [],
  announcements = [],
}: SubjectWorkflowSuiteProps) {
  const isMath3 =
    courseName.toLowerCase().includes("math") ||
    courseName.toLowerCase().includes("mth") ||
    courseId.includes("m3")

  // --- Math III State (Dynamic Homework Ledger & KaTeX Parser) ---
  const [shorthandInput, setShorthandInput] = useState("14.2 3 5, 14.3 2, 14.4 1")
  const [filterMode, setFilterMode] = useState<"all" | "mandatory" | "similar">("all")
  const [isListening, setIsListening] = useState(false)
  const [speechTranscript, setSpeechTranscript] = useState("")
  const [solvedQuestions, setSolvedQuestions] = useState<Record<string, boolean>>({})
  const [showHomeworkModal, setShowHomeworkModal] = useState(false)
  const [showMethodModal, setShowMethodModal] = useState(false)

  // Math problems dynamically parsed from homework input (Thomas' Calculus 11th Ed)
  const [parsedProblems, setParsedProblems] = useState<MathProblem[]>([
    {
      id: "14.2-3",
      exercise: "Ex 14.2",
      qNum: 3,
      isMandatory: true,
      title: "Two-Path Test for Non-Existence of Limit",
      latex: "\\lim_{(x,y) \\to (0,0)} \\frac{x^2 - y^2}{x^2 + y^2} = \\text{Does Not Exist (DNE)}",
      topic: "Limits & Continuity in Higher Dimensions (Thomas Ch 14.2)",
      difficulty: "Medium",
      methodOfWork: "Approach along $y=0$ gives limit $1$; approach along $x=0$ gives limit $-1$. Since directional limits differ, the limit does not exist.",
    },
    {
      id: "14.2-5",
      exercise: "Ex 14.2",
      qNum: 5,
      isMandatory: true,
      title: "Multivariable Limit via Polar Coordinates",
      latex: "\\lim_{(x,y) \\to (0,0)} \\frac{3x^2 y}{x^2 + y^2} = \\lim_{r \\to 0} \\frac{3(r\\cos\\theta)^2 (r\\sin\\theta)}{r^2} = 0",
      topic: "Polar Coordinate Limit Substitution",
      difficulty: "Easy",
      methodOfWork: "Substitute $x = r\\cos\\theta, y = r\\sin\\theta$. Expression simplifies to $3r\\cos^2\\theta\\sin\\theta \\to 0$ as $r \\to 0$ independent of $\\theta$.",
    },
    {
      id: "14.3-2",
      exercise: "Ex 14.3",
      qNum: 2,
      isMandatory: true,
      title: "First-Order Partial Derivatives Evaluation",
      latex: "f(x,y) = x^3 y^2 + 2xy \\implies \\frac{\\partial f}{\\partial x} = 3x^2 y^2 + 2y, \\quad \\frac{\\partial f}{\\partial y} = 2x^3 y + 2x",
      topic: "Partial Differentiation (Thomas Ch 14.3)",
      difficulty: "Easy",
      methodOfWork: "Hold $y$ constant when differentiating with respect to $x$; hold $x$ constant when differentiating with respect to $y$.",
    },
    {
      id: "14.4-1",
      exercise: "Ex 14.4",
      qNum: 1,
      isMandatory: true,
      title: "Multivariable Chain Rule for One Independent Parameter",
      latex: "\\frac{dw}{dt} = \\frac{\\partial w}{\\partial x} \\frac{dx}{dt} + \\frac{\\partial w}{\\partial y} \\frac{dy}{dt}",
      topic: "The Multivariable Chain Rule (Thomas Ch 14.4)",
      difficulty: "Medium",
      methodOfWork: "Differentiate $w = f(x,y)$ along parametric path $(x(t), y(t))$ using the tree diagram derivative sum.",
    },
    {
      id: "14.2-4",
      exercise: "Ex 14.2",
      qNum: 4,
      isMandatory: false,
      similarTo: 3,
      title: "Similar Practice: Limit along Parabolic Paths y = kx^2",
      latex: "\\lim_{(x,y) \\to (0,0)} \\frac{xy^2}{x^2 + y^4} = \\text{DNE (Path dependent on } x = my^2)",
      topic: "Non-Linear Path Limit Tests",
      difficulty: "Medium",
      methodOfWork: "Test the parabolic path $x = my^2$ to show the limit depends on slope $m$, proving discontinuity at the origin.",
    },
  ])

  // Dynamic Lecture Selection for non-math subjects
  const [selectedMaterialId, setSelectedMaterialId] = useState<string>("")
  const [copiedPrompt, setCopiedPrompt] = useState("")

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedProbs = localStorage.getItem(`learny-problems-${courseId}`);
      if (savedProbs) {
        try {
          const parsed = JSON.parse(savedProbs);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setParsedProblems(parsed);
          }
        } catch {}
      }

      const savedInput = localStorage.getItem(`learny-hw-input-${courseId}`);
      if (savedInput) {
        setShorthandInput(savedInput);
      }
    }
  }, [courseId]);

  useEffect(() => {
    if (materials.length > 0 && !selectedMaterialId) {
      setSelectedMaterialId(materials[0].id)
    }
  }, [materials, selectedMaterialId])

  // Web Speech API Voice Recognition
  const handleToggleVoiceInput = () => {
    if (typeof window === "undefined") return

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) {
      alert("Voice input is supported in Google Chrome or Safari.")
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
        setSpeechTranscript("Listening... Speak (e.g. 'Exercise 14.2 Questions 3 and 5')")
      }

      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join("")
        setSpeechTranscript(transcript)

        const numbers = transcript.match(/\d+(\.\d+)?/g) || []
        if (numbers.length > 0) {
          setShorthandInput(transcript)
        }
      }

      recognition.onerror = () => setIsListening(false)
      recognition.onend = () => setIsListening(false)
      recognition.start()
    } catch {
      setIsListening(false)
    }
  }

  const handleParseShorthand = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!shorthandInput.trim()) return

    const segments = shorthandInput.split(/[,;\n]+/).map((s) => s.trim()).filter(Boolean)
    const newProblems: MathProblem[] = []

    segments.forEach((seg) => {
      const tokens = seg.split(/\s+/)
      if (tokens.length === 0) return

      const exercise = tokens[0]
      const questionNums = tokens.slice(1).map((n) => parseInt(n, 10)).filter((n) => !isNaN(n))

      questionNums.forEach((qNum) => {
        newProblems.push({
          id: `${exercise}-${qNum}`,
          exercise: `Ex ${exercise}`,
          qNum,
          isMandatory: true,
          title: `Exercise ${exercise} — Question ${qNum}`,
          latex: `\\oint_C f(z) \\, dz \\quad (\\text{Section } ${exercise}, \\text{ Question } ${qNum})`,
          topic: `Chapter ${exercise.split(".")[0]} Homework`,
          difficulty: "Medium",
          methodOfWork: `Solve using Chapter ${exercise.split(".")[0]} standard formula and evaluate integral limits.`,
        })

        // Add similar practice problem
        newProblems.push({
          id: `${exercise}-${qNum + 1}-sim`,
          exercise: `Ex ${exercise}`,
          qNum: qNum + 1,
          isMandatory: false,
          similarTo: qNum,
          title: `Similar Practice: Question ${qNum + 1} (Same Method as Q${qNum})`,
          latex: `\\oint_C g(z) \\, dz \\quad (\\text{Section } ${exercise}, \\text{ Similar to Q}${qNum})`,
          topic: `Chapter ${exercise.split(".")[0]} Similar Practice`,
          difficulty: "Medium",
          methodOfWork: `Analogous to Question ${qNum}: follow the exact same integration rule with altered coefficients.`,
        })
      })
    })

    if (newProblems.length > 0) {
      setParsedProblems(newProblems)
    }
  }

  const toggleSolved = (id: string) => {
    setSolvedQuestions((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const handleCopyPrompt = (promptText: string, key: string) => {
    navigator.clipboard.writeText(promptText)
    setCopiedPrompt(key)
    setTimeout(() => setCopiedPrompt(""), 3000)
  }

  const displayedProblems = parsedProblems.filter((p) => {
    if (filterMode === "mandatory") return p.isMandatory
    if (filterMode === "similar") return !p.isMandatory
    return true
  })

  const mandatoryCount = parsedProblems.filter((p) => p.isMandatory).length
  const mandatorySolved = parsedProblems.filter((p) => p.isMandatory && solvedQuestions[p.id]).length

  const selectedMaterial =
    materials.find((m) => m.id === selectedMaterialId) || materials[0] || null

  return (
    <div className="space-y-3">
      {/* 1. MATH III: Dynamic Homework Ledger & Real KaTeX Typesetting */}
      {isMath3 ? (
        <div className="space-y-3">
          {/* Minimalist Top Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 pb-1">
            <div className="flex items-center gap-1 rounded-lg bg-zinc-950 p-0.5 border border-zinc-800 text-xs">
              <button
                onClick={() => setFilterMode("all")}
                className={`rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors ${
                  filterMode === "all" ? "bg-zinc-800 text-white font-semibold" : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                All ({parsedProblems.length})
              </button>
              <button
                onClick={() => setFilterMode("mandatory")}
                className={`rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors ${
                  filterMode === "mandatory" ? "bg-zinc-800 text-white font-semibold" : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                Mandatory ({mandatoryCount})
              </button>
              <button
                onClick={() => setFilterMode("similar")}
                className={`rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors ${
                  filterMode === "similar" ? "bg-zinc-800 text-white font-semibold" : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                Similar ({parsedProblems.length - mandatoryCount})
              </button>
            </div>

            <div className="flex items-center gap-1.5">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowMethodModal(true)}
                className="h-7 text-[11px] font-medium border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 gap-1 px-2.5"
              >
                <BookMarked className="h-3 w-3" />
                <span>Method</span>
              </Button>

              <Button
                size="sm"
                onClick={() => setShowHomeworkModal(true)}
                className="h-7 text-[11px] font-medium bg-white text-zinc-950 hover:bg-zinc-200 gap-1 px-2.5"
              >
                <Mic className="h-3 w-3" />
                <span>+ Homework</span>
              </Button>
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
      ) : (
        /* 2. DYNAMIC SUBJECT STUDY TUTOR: Grounded in Live Google Classroom Materials */
        <Card className="border-zinc-800 bg-zinc-900/30 overflow-hidden">
          <CardHeader className="p-4 sm:p-5 border-b border-zinc-800 bg-zinc-900/40">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                  Classroom Prescribed Materials &amp; AI Tutor
                </div>
                <CardTitle className="text-sm sm:text-base font-semibold text-white mt-0.5">
                  {courseName} Course Materials &amp; AI Suite
                </CardTitle>
                <CardDescription className="text-xs text-zinc-400 mt-0.5">
                  Grounded directly in your professor&apos;s uploaded Classroom textbooks, slides, and syllabus
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
            {materials.length === 0 ? (
              <div className="space-y-4">
                <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-medium text-zinc-400">
                      Syllabus &amp; Exam Prep Prompts
                    </span>
                    <span className="text-[10px] text-zinc-500">
                      Ready to use in NotebookLM / Gemini
                    </span>
                  </div>
                  <h4 className="text-xs sm:text-sm font-semibold text-white">
                    {courseName} AI Study Companion
                  </h4>
                  <p className="text-xs text-zinc-400">
                    Use these verified prompts to study core topics, solve practice problems, and generate flashcards.
                  </p>
                </div>

                <div className="space-y-2">
                  {[
                    {
                      key: "foundations",
                      label: "🎓 Teach Core Subject Foundations Step-by-Step",
                      prompt: `Act as a senior university professor teaching ${courseName}. Break down the essential syllabus topics, fundamental principles, and key equations step-by-step with intuitive analogies and practical examples.`,
                    },
                    {
                      key: "midsem-quiz",
                      label: "❓ Quiz Me on High-Yield Midsem Exam Questions",
                      prompt: `Generate 4 challenging conceptual and analytical exam questions for ${courseName}. Present one question at a time, wait for my response, and give detailed grading with model answers.`,
                    },
                    {
                      key: "pitfalls",
                      label: "💡 Explain Tricky Exam Traps & Common Misconceptions",
                      prompt: `What are the most difficult concepts and common exam pitfalls in ${courseName}? Explain subtle edge cases and how top students approach them.`,
                    },
                    {
                      key: "flashcards-gen",
                      label: "📝 Generate 5 Flashcards for SuperMemo SM-2",
                      prompt: `Extract 5 high-yield question-and-answer flashcard pairs covering fundamental definitions and formulas in ${courseName} for spaced repetition review.`,
                    },
                  ].map((p) => (
                    <div
                      key={p.key}
                      className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-between gap-3 text-xs"
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
                        onClick={() => handleCopyPrompt(p.prompt, `course-prompt-${p.key}`)}
                        className="h-7 text-[10px] font-medium border-zinc-800 hover:bg-zinc-800 text-zinc-200 shrink-0"
                      >
                        {copiedPrompt === `course-prompt-${p.key}` ? (
                          <span className="text-white font-semibold">Copied!</span>
                        ) : (
                          <span>Copy</span>
                        )}
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {/* Real Materials Selector Tabs */}
                <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1">
                  {materials.map((mat) => (
                    <button
                      key={mat.id}
                      onClick={() => setSelectedMaterialId(mat.id)}
                      className={`shrink-0 max-w-[220px] p-3 rounded-lg border text-left transition-colors truncate ${
                        selectedMaterial?.id === mat.id
                          ? "border-zinc-500 bg-zinc-800 text-white"
                          : "border-zinc-800 bg-zinc-900/50 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
                      }`}
                    >
                      <div className="text-[10px] font-medium text-zinc-500">Lecture Material</div>
                      <div className="text-xs font-semibold truncate mt-0.5">{mat.title}</div>
                    </button>
                  ))}
                </div>

                {/* Dynamic Study Context & Prompts */}
                {selectedMaterial && (
                  <div className="space-y-3 p-4 rounded-xl bg-zinc-900/50 border border-zinc-800">
                    <div className="space-y-1">
                      <h3 className="text-xs font-semibold text-white">{selectedMaterial.title}</h3>
                      {selectedMaterial.description ? (
                        <p className="text-xs text-zinc-400 leading-relaxed whitespace-pre-line">
                          {selectedMaterial.description}
                        </p>
                      ) : (
                        <p className="text-xs text-zinc-500 italic">
                          Live material from Google Classroom. Use prompts below to study in NotebookLM or Gemini.
                        </p>
                      )}
                    </div>

                    <div className="space-y-2 pt-2 border-t border-zinc-800">
                      <div className="text-xs font-medium text-zinc-300">
                        Contextual AI Study Prompts:
                      </div>

                      {[
                        {
                          key: "teach",
                          label: "🎓 Teach Me This Lecture Step-by-Step",
                          prompt: `Act as a senior professor teaching ${selectedMaterial.title}. Break down all core concepts step-by-step with real-world analogies, derivations, and clear code/math examples.`,
                        },
                        {
                          key: "quiz",
                          label: "❓ Quiz Me on Potential Midsem Exam Questions",
                          prompt: `Generate 3 high-probability conceptual and analytical exam questions based on ${selectedMaterial.title}. Ask me one question at a time and grade my responses.`,
                        },
                        {
                          key: "edge-cases",
                          label: "💡 Explain Edge Cases & Common Pitfalls",
                          prompt: `What is the most difficult and commonly misunderstood concept in ${selectedMaterial.title}? Explain subtle test edge cases and pitfalls.`,
                        },
                        {
                          key: "flashcards",
                          label: "📝 Generate Flashcards for SM-2 Review",
                          prompt: `Extract 5 high-yield question-and-answer flashcard pairs from ${selectedMaterial.title} formatted for spaced repetition review.`,
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
                            onClick={() => handleCopyPrompt(p.prompt, `${selectedMaterial.id}-${p.key}`)}
                            className="h-7 text-[10px] font-medium border-zinc-700 hover:bg-zinc-800 text-zinc-200 shrink-0"
                          >
                            {copiedPrompt === `${selectedMaterial.id}-${p.key}` ? (
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
                )}
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
