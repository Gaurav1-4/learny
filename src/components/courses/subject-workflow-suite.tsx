"use client"

import { useState } from "react"
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

export function SubjectWorkflowSuite({ courseId, courseName, courseSection }: SubjectWorkflowSuiteProps) {
  const isMath3 = courseName.toLowerCase().includes("math") || courseName.toLowerCase().includes("mth") || courseId.includes("m3")
  const isOS = courseName.toLowerCase().includes("operating") || courseName.toLowerCase().includes("os") || courseId.includes("os")
  const isAP = courseName.toLowerCase().includes("programming") || courseName.toLowerCase().includes("ap") || courseId.includes("ap")
  const isDPP = courseName.toLowerCase().includes("dpp") || courseName.toLowerCase().includes("design") || courseId.includes("dpp")
  const isRMSSD = courseName.toLowerCase().includes("rmssd") || courseName.toLowerCase().includes("research") || courseId.includes("rmssd")

  // --- Math III State (Shorthand Parser & Problem Ledger) ---
  const [shorthandInput, setShorthandInput] = useState("4.1 3 4 5 6 7 8")
  const [solvedQuestions, setSolvedQuestions] = useState<Record<string, boolean>>({ "4.1-3": true, "4.1-4": true })
  const [parsedProblems, setParsedProblems] = useState<Array<{ id: string; exercise: string; qNum: number; title: string; latex: string; topic: string; difficulty: string }>>([
    {
      id: "4.1-3",
      exercise: "Ex 4.1",
      qNum: 3,
      title: "Homogeneous Linear ODE with Constant Coefficients",
      latex: "y'' - 4y' + 4y = 0, \\quad y(0) = 3, \\, y'(0) = 1",
      topic: "Higher-Order Linear ODEs",
      difficulty: "Medium",
    },
    {
      id: "4.1-4",
      exercise: "Ex 4.1",
      qNum: 4,
      title: "Wronskian & Linear Independence Proof",
      latex: "W(y_1, y_2) = \\begin{vmatrix} e^{2x} & x e^{2x} \\\\ 2e^{2x} & (1+2x)e^{2x} \\end{vmatrix} = e^{4x} \\neq 0",
      topic: "Wronskian Determinant",
      difficulty: "Medium",
    },
    {
      id: "4.1-5",
      exercise: "Ex 4.1",
      qNum: 5,
      title: "Distinct Real Roots Initial Value Problem",
      latex: "y'' + 5y' + 6y = 0, \\quad y(0) = 2, \\, y'(0) = -1",
      topic: "Characteristic Roots",
      difficulty: "Easy",
    },
    {
      id: "4.1-6",
      exercise: "Ex 4.1",
      qNum: 6,
      title: "Complex Conjugate Characteristic Roots",
      latex: "y'' + 4y' + 13y = 0 \\implies r = -2 \\pm 3i, \\quad y(x) = e^{-2x}(c_1 \\cos 3x + c_2 \\sin 3x)",
      topic: "Euler-Cauchy & Complex Roots",
      difficulty: "Hard",
    },
    {
      id: "4.1-7",
      exercise: "Ex 4.1",
      qNum: 7,
      title: "Third-Order Homogeneous Equation",
      latex: "y''' - 6y'' + 11y' - 6y = 0 \\implies (r-1)(r-2)(r-3) = 0",
      topic: "Third-Order Differential Equations",
      difficulty: "Hard",
    },
    {
      id: "4.1-8",
      exercise: "Ex 4.1",
      qNum: 8,
      title: "Boundary Value Problem (BVP)",
      latex: "y'' + \\pi^2 y = 0, \\quad y(0) = 1, \\, y(1) = -1",
      topic: "Boundary Value Problems",
      difficulty: "Medium",
    },
  ])

  // Parse professor shorthand (e.g. "4.1 3 4 5 6 7 8" or "10.3 1, 4, 9, 12")
  const handleParseShorthand = (e: React.FormEvent) => {
    e.preventDefault()
    if (!shorthandInput.trim()) return

    const match = shorthandInput.match(/^(\d+\.\d+)\s+(.+)$/)
    if (match) {
      const exercise = match[1]
      const rawNumbers = match[2].match(/\d+/g) || []
      const newProblems = rawNumbers.map((numStr) => {
        const qNum = parseInt(numStr, 10)
        return {
          id: `${exercise}-${qNum}`,
          exercise: `Ex ${exercise}`,
          qNum,
          title: `Textbook Resolved Problem ${qNum} (Section ${exercise})`,
          latex: `\\text{Problem } ${qNum} \\text{ from Section } ${exercise} \\text{ in Kreyszig Advanced Engineering Math}`,
          topic: `Chapter ${exercise.split(".")[0]} Exercises`,
          difficulty: qNum % 2 === 0 ? "Medium" : "Hard",
        }
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

  return (
    <div className="space-y-6">
      {/* 1. MATH III WORKFLOW: Shorthand Parser & Problem Ledger */}
      {isMath3 && (
        <Card className="border-indigo-500/30 bg-zinc-950/80 shadow-xl overflow-hidden backdrop-blur-xl">
          <CardHeader className="p-6 border-b border-zinc-800 bg-zinc-900/40">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400">
                  <Calculator className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-lg font-bold text-white">
                      Math III Homework & Problem Ledger
                    </CardTitle>
                    <Badge className="bg-indigo-500/20 text-indigo-300 border-indigo-500/40 text-[10px] font-bold">
                      Textbook Cross-Reference Engine
                    </Badge>
                  </div>
                  <CardDescription className="text-xs text-zinc-400 mt-0.5">
                    Solves messy handwriting by parsing raw numbers (e.g. <code>4.1 3 4 5 6 7 8</code>) against the clean Classroom textbook.
                  </CardDescription>
                </div>
              </div>

              <div className="text-right text-xs text-zinc-400">
                <span className="font-bold text-emerald-400">
                  {Object.values(solvedQuestions).filter(Boolean).length} / {parsedProblems.length}
                </span>{" "}
                Solved for Tuesday Test
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-6 space-y-6">
            {/* Shorthand Parser Form */}
            <form onSubmit={handleParseShorthand} className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-200">
                  Paste Professor Shorthand from Notes
                </span>
                <span className="text-[10px] text-zinc-500 font-mono">Format: [Exercise] [Q1 Q2 Q3...]</span>
              </div>
              <div className="flex gap-2">
                <Input
                  value={shorthandInput}
                  onChange={(e) => setShorthandInput(e.target.value)}
                  placeholder="e.g. 4.1 3 4 5 6 7 8 or 10.3 1 4 9 12 15"
                  className="bg-zinc-950 border-zinc-800 text-xs font-mono"
                />
                <Button type="submit" size="sm" className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs shrink-0 font-bold">
                  Resolve from Textbook
                </Button>
              </div>
            </form>

            {/* Resolved Problem Ledger Table */}
            <div className="space-y-3">
              <div className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
                Resolved Questions from Erwin Kreyszig Textbook ({parsedProblems.length} Questions)
              </div>

              <div className="grid gap-3">
                {parsedProblems.map((prob) => {
                  const isSolved = solvedQuestions[prob.id]
                  return (
                    <motion.div
                      key={prob.id}
                      whileHover={{ y: -1 }}
                      className={`p-4 rounded-xl border transition-all ${
                        isSolved
                          ? "border-emerald-500/30 bg-emerald-950/10"
                          : "border-zinc-800 bg-zinc-900/60"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1.5 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge className="bg-indigo-600 text-white font-mono text-xs font-bold">
                              {prob.exercise} — Q{prob.qNum}
                            </Badge>
                            <Badge variant="outline" className="text-[10px] border-zinc-700 text-zinc-300">
                              {prob.topic}
                            </Badge>
                            <Badge
                              className={`text-[9px] font-bold ${
                                prob.difficulty === "Hard"
                                  ? "bg-rose-500/20 text-rose-300 border-rose-500/30"
                                  : "bg-amber-500/20 text-amber-300 border-amber-500/30"
                              }`}
                            >
                              {prob.difficulty}
                            </Badge>
                          </div>

                          <h4 className="text-xs font-bold text-zinc-100">{prob.title}</h4>

                          <div className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-800/80 font-mono text-xs text-indigo-300">
                            {prob.latex}
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
                            <span>Step-by-step proof</span>
                            <ExternalLink className="h-2.5 w-2.5" />
                          </a>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
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
            {/* Lecture Selector Tabs */}
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

            {/* Selected Lecture Tutor Workspace */}
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

                  {/* Pre-Written Tutor Prompts */}
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
