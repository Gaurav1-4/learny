"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
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
  Circle,
  BookOpen,
  Sparkles,
  Plus,
  Loader2,
  Edit3,
  Timer,
  Clock,
  ChevronDown,
  ChevronUp,
  Flame,
  Layers,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MathView, FormattedMathText } from "@/components/ui/math-view"
import { ClassroomCourseWorkMaterial, ClassroomCourseWork, ClassroomAnnouncement } from "@/types"
import { isHomeworkDone, toggleHomeworkStatus } from "@/lib/backlog-engine"

interface SubjectWorkflowSuiteProps {
  courseId: string
  courseName: string
  courseSection?: string
  materials?: ClassroomCourseWorkMaterial[]
  coursework?: ClassroomCourseWork[]
  announcements?: ClassroomAnnouncement[]
}

export interface MathProblem {
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
  dueDate?: string
  isDone?: boolean
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
    courseId.includes("m3") ||
    courseName.toLowerCase().includes("calculus")

  const [shorthandInput, setShorthandInput] = useState("")
  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "done">("pending")
  const [isListening, setIsListening] = useState(false)
  const [speechTranscript, setSpeechTranscript] = useState("")
  const [solvedQuestions, setSolvedQuestions] = useState<Record<string, boolean>>({})
  const [showHomeworkModal, setShowHomeworkModal] = useState(false)
  const [showMethodModal, setShowMethodModal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [expandedMethodMap, setExpandedMethodMap] = useState<Record<string, boolean>>({})
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Editing state
  const [editingProblem, setEditingProblem] = useState<MathProblem | null>(null)
  const [editTitle, setEditTitle] = useState("")
  const [editMethod, setEditMethod] = useState("")
  const [editLatex, setEditLatex] = useState("")

  // Math problems dynamically parsed from authentic student input
  const [parsedProblems, setParsedProblems] = useState<MathProblem[]>([])

  // Dynamic Lecture Selection for non-math subjects
  const [selectedMaterialId, setSelectedMaterialId] = useState<string>("")
  const [copiedPrompt, setCopiedPrompt] = useState("")

  // Show auto-dismiss toast
  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3000)
  }

  // Comprehensive Course Matcher for IIIT Delhi Monsoon 2026 courses
  const isMatchingCourse = (
    itemCode: string = "",
    itemName: string = "",
    targetId: string = "",
    targetName: string = ""
  ) => {
    const norm = (s: string) => (s || "").toLowerCase().replace(/[^a-z0-9]/g, "")
    const tName = norm(targetName)
    const tId = norm(targetId)
    const iCode = norm(itemCode)
    const iName = norm(itemName)

    if (iCode && (tName.includes(iCode) || tId.includes(iCode))) return true
    if (iName && (tName.includes(iName) || iName.includes(tName))) return true

    // Math / Calculus (MTH201, MTH203, Math III, Multivariate Calculus)
    const isTargetMath = tName.includes("math") || tName.includes("mth") || tName.includes("calculus") || tId.includes("mth") || tId.includes("math")
    const isItemMath = iName.includes("math") || iName.includes("mth") || iName.includes("calculus") || iCode.includes("mth") || iCode.includes("math")
    if (isTargetMath && isItemMath) return true

    // Operating Systems (CSE231, OS)
    const isTargetOS = tName.includes("os") || tName.includes("operating") || tId.includes("231") || tId.includes("os")
    const isItemOS = iName.includes("os") || iName.includes("operating") || iCode.includes("231") || iCode.includes("os")
    if (isTargetOS && isItemOS) return true

    // Advanced Programming (CSE201, AP)
    const isTargetAP = tName.includes("ap") || tName.includes("programming") || tId.includes("201") || tId.includes("ap")
    const isItemAP = iName.includes("ap") || iName.includes("programming") || iCode.includes("201") || iCode.includes("ap")
    if (isTargetAP && isItemAP) return true

    // DPP (DES201)
    const isTargetDPP = tName.includes("dpp") || tName.includes("design") || tId.includes("des") || tId.includes("dpp")
    const isItemDPP = iName.includes("dpp") || iName.includes("design") || iCode.includes("des") || iCode.includes("dpp")
    if (isTargetDPP && isItemDPP) return true

    // RMSSD (SSH201)
    const isTargetRMSSD = tName.includes("rmssd") || tName.includes("research") || tId.includes("ssh") || tId.includes("rmssd")
    const isItemRMSSD = iName.includes("rmssd") || iName.includes("research") || iCode.includes("ssh") || iCode.includes("rmssd")
    if (isTargetRMSSD && isItemRMSSD) return true

    return false
  }

  // Load authentic problems from student's local and cloud state
  useEffect(() => {
    if (typeof window === "undefined") return

    const collectedProblems: MathProblem[] = []
    const solvedMap: Record<string, boolean> = {}

    // 1. Scan direct course problem ledgers in localStorage
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith("learny-problems-")) {
        const storedKeySuffix = key.replace("learny-problems-", "")
        if (isMatchingCourse(storedKeySuffix, storedKeySuffix, courseId, courseName)) {
          try {
            const raw = localStorage.getItem(key)
            if (raw) {
              const parsed = JSON.parse(raw)
              if (Array.isArray(parsed)) {
                collectedProblems.push(...parsed)
              }
            }
          } catch {}
        }
      }
    }

    // 2. Scan specific backlog lecture keys: `learny-backlog-hw-*`
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith("learny-backlog-hw-")) {
        try {
          const raw = localStorage.getItem(key)
          if (raw) {
            const item = JSON.parse(raw)
            if (item && item.rawInput && item.rawInput.trim()) {
              const itemCode = item.courseCode || key.split("-").slice(3).join("-")
              const itemName = item.courseName || ""
              if (isMatchingCourse(itemCode, itemName, courseId, courseName)) {
                if (Array.isArray(item.problems) && item.problems.length > 0) {
                  collectedProblems.push(...item.problems)
                } else {
                  const rawText = item.rawInput || item.summary || "Homework"
                  const segments = rawText.split(/[,;\n]+/).map((s: string) => s.trim()).filter(Boolean)
                  segments.forEach((seg: string, sIdx: number) => {
                    const tokens = seg.split(/\s+/)
                    const exercise = tokens[0]
                    const questionNums = tokens.slice(1).map((n: string) => parseInt(n, 10)).filter((n: number) => !isNaN(n))

                    if (questionNums.length === 0) {
                      collectedProblems.push({
                        id: `hw-${key}-${sIdx}`,
                        exercise: itemCode || "HW",
                        qNum: sIdx + 1,
                        isMandatory: true,
                        title: seg,
                        latex: "\\text{" + seg.replace(/[^a-zA-Z0-9\s+=()/-]/g, "") + "}",
                        topic: `${courseName} Assignment`,
                        difficulty: "Medium",
                        methodOfWork: item.summary || "Solve assignment problems according to lecture notes.",
                        dueDate: item.dueDate || "2026-08-18",
                      })
                    } else {
                      questionNums.forEach((qNum: number) => {
                        collectedProblems.push({
                          id: `${exercise}-${qNum}-${sIdx}`,
                          exercise: `Ex ${exercise}`,
                          qNum,
                          isMandatory: true,
                          title: `Exercise ${exercise} — Question ${qNum}`,
                          latex: `\\text{Solve Exercise } ${exercise} \\text{ Question } ${qNum}`,
                          topic: `Chapter ${exercise.split(".")[0]} Homework`,
                          difficulty: "Medium",
                          methodOfWork: `Solve using Chapter ${exercise.split(".")[0]} standard formula and check limit conditions.`,
                          dueDate: item.dueDate || "2026-08-18",
                        })
                      })
                    }
                  })
                }
              }
            }
          }
        } catch {}
      }
    }

    // 3. Fallback to Google Classroom Coursework
    if (collectedProblems.length === 0 && coursework.length > 0) {
      const cwProblems: MathProblem[] = coursework.map((cw, idx) => ({
        id: cw.id,
        exercise: "Assignment",
        qNum: idx + 1,
        isMandatory: true,
        title: cw.title,
        latex: "\\text{" + (cw.title || "Classroom Assignment").replace(/[^a-zA-Z0-9\s+=()/-]/g, "") + "}",
        topic: cw.description ? cw.description.slice(0, 50) + "..." : "Classroom CourseWork",
        difficulty: "Medium",
        methodOfWork: cw.description || "Refer to instructions provided on Google Classroom.",
      }))
      collectedProblems.push(...cwProblems)
    }

    // Deduplicate problems by title / id and load completion states
    const uniqueMap = new Map<string, MathProblem>()
    collectedProblems.forEach((p) => {
      const key = `${p.exercise}-${p.qNum}-${p.title}`
      if (!uniqueMap.has(key)) {
        uniqueMap.set(key, p)
        const done = isHomeworkDone(p.id)
        solvedMap[p.id] = done
      }
    })

    setParsedProblems(Array.from(uniqueMap.values()))
    setSolvedQuestions(solvedMap)
  }, [courseId, courseName, coursework])

  useEffect(() => {
    if (materials.length > 0 && !selectedMaterialId) {
      setSelectedMaterialId(materials[0].id)
    }
  }, [materials, selectedMaterialId])

  // Voice recognition
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

  // Parse and save new homework
  const handleParseShorthand = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!shorthandInput.trim()) return

    setIsSubmitting(true)
    try {
      const res = await fetch("/api/homework/ai-format", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rawInput: shorthandInput,
          courseName,
          courseCode: courseName.split(" ")[0] || "COURSE",
          topic: `${courseName} Homework`,
        }),
      })

      const json = await res.json()
      const segments = shorthandInput.split(/[,;\n]+/).map((s) => s.trim()).filter(Boolean)
      const newProblems: MathProblem[] = []

      segments.forEach((seg, sIdx) => {
        const tokens = seg.split(/\s+/)
        const exercise = tokens[0]
        const questionNums = tokens.slice(1).map((n) => parseInt(n, 10)).filter((n) => !isNaN(n))

        if (questionNums.length === 0) {
          newProblems.push({
            id: `hw-${Date.now()}-${sIdx}`,
            exercise: "HW",
            qNum: sIdx + 1,
            isMandatory: true,
            title: seg,
            latex: "\\text{" + seg.replace(/[^a-zA-Z0-9\s+=()/-]/g, "") + "}",
            topic: `${courseName} Assignment`,
            difficulty: "Medium",
            methodOfWork: json.formattedText || "Solve problems according to lecture methodology.",
            dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
          })
        } else {
          questionNums.forEach((qNum) => {
            newProblems.push({
              id: `${exercise}-${qNum}-${Date.now()}`,
              exercise: `Ex ${exercise}`,
              qNum,
              isMandatory: true,
              title: `Exercise ${exercise} — Question ${qNum}`,
              latex: `\\text{Solve Exercise } ${exercise} \\text{ Question } ${qNum}`,
              topic: `Chapter ${exercise.split(".")[0]} Homework`,
              difficulty: "Medium",
              methodOfWork: `Solve using Chapter ${exercise.split(".")[0]} standard formula and evaluate integral limits.`,
              dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
            })
          })
        }
      })

      if (newProblems.length > 0) {
        const updated = [...newProblems, ...parsedProblems]
        setParsedProblems(updated)
        localStorage.setItem(`learny-problems-${courseId}`, JSON.stringify(updated))
        showToast("Homework added and synced!")
      }

      setShorthandInput("")
      setShowHomeworkModal(false)
    } catch {
      const newProb: MathProblem = {
        id: `hw-${Date.now()}`,
        exercise: "HW",
        qNum: 1,
        isMandatory: true,
        title: shorthandInput,
        latex: "\\text{" + shorthandInput.replace(/[^a-zA-Z0-9\s+=()/-]/g, "") + "}",
        topic: `${courseName} Homework`,
        difficulty: "Medium",
        methodOfWork: "Complete problem set.",
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      }
      const updated = [newProb, ...parsedProblems]
      setParsedProblems(updated)
      localStorage.setItem(`learny-problems-${courseId}`, JSON.stringify(updated))
      setShorthandInput("")
      setShowHomeworkModal(false)
      showToast("Homework saved locally!")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Set explicit Done status (Yes/No toggle)
  const handleSetDoneStatus = (problemId: string, isDoneVal: boolean) => {
    toggleHomeworkStatus(problemId, isDoneVal)
    setSolvedQuestions((prev) => ({ ...prev, [problemId]: isDoneVal }))
    showToast(isDoneVal ? "Marked as Done! Moved to Done section." : "Marked as Pending.")
  }

  // Open Edit Modal
  const handleOpenEdit = (prob: MathProblem) => {
    setEditingProblem(prob)
    setEditTitle(prob.title)
    setEditMethod(prob.methodOfWork)
    setEditLatex(prob.latex)
  }

  // Save Edit
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingProblem) return

    const updatedList = parsedProblems.map((p) => {
      if (p.id === editingProblem.id) {
        return {
          ...p,
          title: editTitle,
          methodOfWork: editMethod,
          latex: editLatex,
        }
      }
      return p
    })

    setParsedProblems(updatedList)
    localStorage.setItem(`learny-problems-${courseId}`, JSON.stringify(updatedList))
    setEditingProblem(null)
    showToast("Homework details updated successfully!")
  }

  // Quick Flashcard generator
  const handleCreateFlashcard = (prob: MathProblem) => {
    if (typeof window === "undefined") return
    try {
      const flashcardsRaw = localStorage.getItem("learny-flashcards")
      const cards = flashcardsRaw ? JSON.parse(flashcardsRaw) : []
      const newCard = {
        id: `fc-${Date.now()}`,
        deckId: "mth203-core",
        front: `Solve ${prob.title}: ${prob.latex}`,
        back: prob.methodOfWork,
        tags: [courseName, prob.exercise],
        easeFactor: 2.5,
        repetitions: 0,
        interval: 1,
        nextReviewDate: new Date().toISOString().split("T")[0],
      }
      cards.push(newCard)
      localStorage.setItem("learny-flashcards", JSON.stringify(cards))
      showToast("Flashcard created for SM-2 Spaced Repetition!")
    } catch {}
  }

  const toggleMethodExpand = (id: string) => {
    setExpandedMethodMap((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const handleCopyPrompt = (promptText: string, key: string) => {
    navigator.clipboard.writeText(promptText)
    setCopiedPrompt(key)
    setTimeout(() => setCopiedPrompt(""), 3000)
  }

  // Filter problems by Pending vs Done
  const pendingProblems = parsedProblems.filter((p) => !solvedQuestions[p.id])
  const doneProblems = parsedProblems.filter((p) => solvedQuestions[p.id])

  const displayedProblems =
    filterStatus === "pending"
      ? pendingProblems
      : filterStatus === "done"
      ? doneProblems
      : parsedProblems

  const selectedMaterial =
    materials.find((m) => m.id === selectedMaterialId) || materials[0] || null

  return (
    <div className="space-y-3">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="fixed top-5 right-5 z-50 rounded-xl bg-zinc-900 border border-zinc-700 px-4 py-2.5 text-xs text-white shadow-2xl flex items-center gap-2"
          >
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 1. MATH III / PROBLEM SET VIEW: Dynamic Homework Ledger */}
      {isMath3 ? (
        <div className="space-y-3">
          {/* Minimalist Top Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 pb-1">
            {/* Pending vs Done Section Switcher */}
            <div className="flex items-center gap-1 rounded-lg bg-zinc-950 p-0.5 border border-zinc-800 text-xs">
              <button
                onClick={() => setFilterStatus("pending")}
                className={`rounded-md px-3 py-1 text-[11px] font-medium transition-colors flex items-center gap-1.5 ${
                  filterStatus === "pending"
                    ? "bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                <Clock className="h-3 w-3 text-amber-400" />
                <span>Pending ({pendingProblems.length})</span>
              </button>

              <button
                onClick={() => setFilterStatus("done")}
                className={`rounded-md px-3 py-1 text-[11px] font-medium transition-colors flex items-center gap-1.5 ${
                  filterStatus === "done"
                    ? "bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                <span>Done ({doneProblems.length})</span>
              </button>

              <button
                onClick={() => setFilterStatus("all")}
                className={`rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors ${
                  filterStatus === "all"
                    ? "bg-zinc-800 text-white font-semibold"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                All ({parsedProblems.length})
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
                <span>Method Guide</span>
              </Button>

              <Button
                size="sm"
                onClick={() => setShowHomeworkModal(true)}
                className="h-7 text-[11px] font-medium bg-white text-zinc-950 hover:bg-zinc-200 gap-1 px-2.5"
              >
                <Plus className="h-3 w-3" />
                <span>+ Homework</span>
              </Button>
            </div>
          </div>

          {/* Clean Problem Cards with KaTeX Math Typesetting & Yes/No Done Toggle */}
          <div className="space-y-3">
            {displayedProblems.map((prob) => {
              const isDone = solvedQuestions[prob.id]
              const isExpanded = expandedMethodMap[prob.id]

              return (
                <div
                  key={prob.id}
                  className={`rounded-xl border p-4 sm:p-5 transition-all ${
                    isDone
                      ? "border-zinc-800/60 bg-zinc-950/40 opacity-75"
                      : "border-zinc-800 bg-zinc-900/40 hover:border-zinc-700"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4 flex-wrap sm:flex-nowrap">
                    <div className="space-y-2 flex-1 min-w-0">
                      {/* Problem Header */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-semibold text-white">
                          {prob.exercise} — Question {prob.qNum}
                        </span>
                        <span className="text-zinc-600">•</span>
                        <span className="text-[11px] text-zinc-400 font-medium">
                          {prob.topic || "Homework"}
                        </span>
                        {prob.difficulty && (
                          <>
                            <span className="text-zinc-600">•</span>
                            <Badge
                              variant="outline"
                              className="text-[9px] font-semibold border-zinc-800 text-zinc-400"
                            >
                              {prob.difficulty}
                            </Badge>
                          </>
                        )}
                        {/* Due badge */}
                        <Badge
                          variant="outline"
                          className={`text-[9px] font-semibold ${
                            isDone
                              ? "border-emerald-800/40 text-emerald-400 bg-emerald-950/20"
                              : "border-amber-800/40 text-amber-300 bg-amber-950/20"
                          }`}
                        >
                          {isDone ? "Completed" : "Due in 2 days"}
                        </Badge>
                      </div>

                      {/* Problem Title */}
                      <h4
                        className={`text-sm font-semibold ${
                          isDone ? "line-through text-zinc-400" : "text-zinc-100"
                        }`}
                      >
                        {prob.title}
                      </h4>

                      {/* KaTeX Math Problem Display */}
                      <div className="rounded-lg border border-zinc-800/80 bg-zinc-950 p-3.5 overflow-x-auto">
                        <MathView math={prob.latex} displayMode={true} />
                      </div>

                      {/* Method of Work */}
                      <div className="text-xs text-zinc-400 leading-relaxed pt-0.5">
                        <span className="font-semibold text-zinc-300">Method of Work: </span>
                        <FormattedMathText text={prob.methodOfWork} />
                      </div>

                      {/* AI Intelligence Shortcuts */}
                      <div className="flex items-center gap-2 pt-2 border-t border-zinc-800/60 flex-wrap text-xs">
                        {/* 1-Click Timer Link */}
                        <Link
                          href={`/timer?task=${encodeURIComponent(`${courseName}: ${prob.title}`)}`}
                          className="inline-flex items-center gap-1 rounded-md bg-zinc-950 border border-zinc-800 hover:border-zinc-700 px-2 py-1 text-[11px] text-zinc-300 hover:text-white transition-colors"
                        >
                          <Timer className="h-3 w-3 text-zinc-400" />
                          <span>25m Focus Session</span>
                        </Link>

                        {/* Create Flashcard */}
                        <button
                          onClick={() => handleCreateFlashcard(prob)}
                          className="inline-flex items-center gap-1 rounded-md bg-zinc-950 border border-zinc-800 hover:border-zinc-700 px-2 py-1 text-[11px] text-zinc-300 hover:text-white transition-colors"
                        >
                          <Sparkles className="h-3 w-3 text-amber-400" />
                          <span>Add to SM-2 Deck</span>
                        </button>

                        {/* Edit Homework Button */}
                        <button
                          onClick={() => handleOpenEdit(prob)}
                          className="inline-flex items-center gap-1 rounded-md bg-zinc-950 border border-zinc-800 hover:border-zinc-700 px-2 py-1 text-[11px] text-zinc-400 hover:text-zinc-200 transition-colors ml-auto"
                        >
                          <Edit3 className="h-3 w-3" />
                          <span>Edit</span>
                        </button>
                      </div>
                    </div>

                    {/* Interactive Yes / No Done Toggle */}
                    <div className="shrink-0 flex flex-col items-end gap-1 bg-zinc-950 p-2 rounded-xl border border-zinc-800">
                      <span className="text-[10px] uppercase tracking-wider font-semibold text-zinc-500">
                        Done?
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleSetDoneStatus(prob.id, true)}
                          className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
                            isDone
                              ? "bg-emerald-500 text-zinc-950 shadow-md font-bold"
                              : "bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-emerald-300 border border-zinc-800"
                          }`}
                        >
                          <Check className="h-3 w-3" />
                          <span>Yes</span>
                        </button>

                        <button
                          onClick={() => handleSetDoneStatus(prob.id, false)}
                          className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
                            !isDone
                              ? "bg-amber-500 text-zinc-950 shadow-md font-bold"
                              : "bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-amber-300 border border-zinc-800"
                          }`}
                        >
                          <Clock className="h-3 w-3" />
                          <span>No</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}

            {/* Empty State */}
            {displayedProblems.length === 0 && (
              <div className="rounded-2xl border border-dashed border-zinc-800 bg-zinc-950/40 p-8 text-center space-y-3">
                <BookOpen className="h-8 w-8 text-zinc-600 mx-auto" />
                <div className="space-y-1">
                  <h4 className="text-sm font-semibold text-white">
                    {filterStatus === "done"
                      ? "No Completed Homework Yet"
                      : filterStatus === "pending"
                      ? "All Homework Completed! 🎉"
                      : "No Homework Logged"}
                  </h4>
                  <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                    {filterStatus === "pending"
                      ? "You've resolved all pending assignments for this course."
                      : "Click '+ Homework' to log problems or add from your Dashboard."}
                  </p>
                </div>
                <Button
                  size="sm"
                  onClick={() => setShowHomeworkModal(true)}
                  className="bg-white text-zinc-950 hover:bg-zinc-200 text-xs font-semibold"
                >
                  <Plus className="h-3.5 w-3.5 mr-1" /> Log Homework
                </Button>
              </div>
            )}
          </div>

          {/* Modal: Edit Homework Item */}
          <AnimatePresence>
            {editingProblem && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl space-y-4"
                >
                  <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                    <div className="flex items-center gap-2">
                      <Edit3 className="h-4 w-4 text-white" />
                      <h3 className="text-sm font-semibold text-white">
                        Edit Homework Assignment
                      </h3>
                    </div>
                    <button
                      onClick={() => setEditingProblem(null)}
                      className="text-xs text-zinc-400 hover:text-white p-1"
                    >
                      ✕
                    </button>
                  </div>

                  <form onSubmit={handleSaveEdit} className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-medium text-zinc-400">
                        Problem Title
                      </label>
                      <Input
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="bg-zinc-950 border-zinc-800 text-xs"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-medium text-zinc-400">
                        LaTeX Equation / Code Expression
                      </label>
                      <Input
                        value={editLatex}
                        onChange={(e) => setEditLatex(e.target.value)}
                        className="bg-zinc-950 border-zinc-800 text-xs font-mono"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-medium text-zinc-400">
                        Method of Work &amp; Solution Notes
                      </label>
                      <textarea
                        value={editMethod}
                        onChange={(e) => setEditMethod(e.target.value)}
                        rows={3}
                        className="w-full rounded-md border border-zinc-800 bg-zinc-950 p-2 text-xs text-zinc-200 focus:outline-none focus:ring-1 focus:ring-zinc-600"
                        required
                      />
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-800">
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => setEditingProblem(null)}
                        className="h-8 text-xs text-zinc-400"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        className="h-8 bg-white text-zinc-950 hover:bg-zinc-200 text-xs font-semibold"
                      >
                        Save Changes
                      </Button>
                    </div>
                  </form>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          {/* Modal: Method Guide */}
          <AnimatePresence>
            {showMethodModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="w-full max-w-lg rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl space-y-4"
                >
                  <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                    <div className="flex items-center gap-2">
                      <BookMarked className="h-4 w-4 text-white" />
                      <h3 className="text-sm font-semibold text-white">
                        Standard Solution Methodologies
                      </h3>
                    </div>
                    <button
                      onClick={() => setShowMethodModal(false)}
                      className="text-xs text-zinc-400 hover:text-white p-1"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="space-y-3 text-xs text-zinc-300 max-h-[60vh] overflow-y-auto pr-1">
                    <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-3.5 space-y-1.5">
                      <div className="font-semibold text-white flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                        Multivariable Limits &amp; Continuity
                      </div>
                      <p className="text-zinc-400 leading-relaxed">
                        To prove non-existence, test two distinct straight paths $y=mx$ or parabolic paths $y=kx^2$. If limits differ, the limit does not exist.
                      </p>
                    </div>

                    <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-3.5 space-y-1.5">
                      <div className="font-semibold text-white flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                        Partial Derivatives &amp; Chain Rule
                      </div>
                      <p className="text-zinc-400 leading-relaxed">
                        Treat independent variables as constants. Apply tree diagrams for composite multivariable functions $w = f(x(t), y(t))$.
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-end pt-2 border-t border-zinc-800">
                    <Button
                      size="sm"
                      onClick={() => setShowMethodModal(false)}
                      className="h-8 bg-white text-zinc-950 hover:bg-zinc-200 text-xs font-semibold"
                    >
                      Done
                    </Button>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          {/* Modal: Shorthand Voice/Text Homework Logger */}
          <AnimatePresence>
            {showHomeworkModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl space-y-4"
                >
                  <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-white" />
                      <h3 className="text-sm font-semibold text-white">
                        Log Homework Problems
                      </h3>
                    </div>
                    <button
                      onClick={() => setShowHomeworkModal(false)}
                      className="text-xs text-zinc-400 hover:text-white p-1"
                    >
                      ✕
                    </button>
                  </div>

                  <form onSubmit={handleParseShorthand} className="space-y-3">
                    <div className="space-y-1.5">
                      <div className="flex gap-2">
                        <Input
                          value={shorthandInput}
                          onChange={(e) => setShorthandInput(e.target.value)}
                          placeholder="e.g. 14.2 3 5, 14.3 2, 14.4 1"
                          className="bg-zinc-900 border-zinc-800 text-xs font-mono flex-1 h-9"
                          required
                          disabled={isSubmitting}
                        />

                        <Button
                          type="button"
                          onClick={handleToggleVoiceInput}
                          variant="outline"
                          disabled={isSubmitting}
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

                    <div className="text-[11px] text-zinc-400 leading-relaxed">
                      💡 Tip: Type or speak shorthand numbers like <code className="text-zinc-200">14.2 3 5</code> for Exercise 14.2 Questions 3 and 5.
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2">
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => setShowHomeworkModal(false)}
                        className="h-8 text-xs text-zinc-400"
                        disabled={isSubmitting}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="h-8 bg-white text-zinc-950 hover:bg-zinc-200 text-xs font-semibold gap-1.5"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            <span>Processing...</span>
                          </>
                        ) : (
                          <span>Save &amp; Parse</span>
                        )}
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
                      ) : null}
                    </div>

                    <div className="pt-2 border-t border-zinc-800/80 space-y-2">
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
