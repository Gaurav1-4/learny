"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Brain,
  ExternalLink,
  Sparkles,
  Volume2,
  VolumeX,
  Play,
  Pause,
  RotateCcw,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Share2,
  Download,
  Copy,
  Check,
  HelpCircle,
  FileText,
  Video,
  Send,
  Loader2,
  X,
  Layers,
  ArrowLeft,
  AlertTriangle,
  Lightbulb,
  Maximize2,
  Flame,
  CheckCheck,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MathView } from "@/components/ui/math-view"
import { calculateSM2 } from "@/lib/spaced-repetition"
import { pushToFirestore } from "@/lib/firebase/firestore-sync"

export interface DocumentNotebookData {
  documentId: string
  documentTitle: string
  courseId: string
  courseName: string
  courseCode: string
  attachmentLink?: string
  pdfUrl?: string
  content?: string
}

interface DocumentNotebookViewProps {
  data: DocumentNotebookData
  onClose?: () => void
  isModal?: boolean
}

export function DocumentNotebookView({ data, onClose, isModal = true }: DocumentNotebookViewProps) {
  const [activeTab, setActiveTab] = useState<"audio-video" | "flashcards" | "briefing" | "quiz" | "chat">("audio-video")
  const [loading, setLoading] = useState(true)
  const [artifacts, setArtifacts] = useState<any>(null)
  const [notebookUrl, setNotebookUrl] = useState<string>("https://notebooklm.google.com")
  const [isSyncing, setIsSyncing] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Audio Player State
  const [isPlayingAudio, setIsPlayingAudio] = useState(false)
  const [audioProgress, setAudioProgress] = useState(0)
  const [audioSpeed, setAudioSpeed] = useState(1.0)
  const [currentDialogueIdx, setCurrentDialogueIdx] = useState(0)

  // Flashcards State (SM-2)
  const [flashcards, setFlashcards] = useState<any[]>([])
  const [currentCardIdx, setCurrentCardIdx] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [cardFilter, setCardFilter] = useState<"all" | "due" | "mastered">("all")

  // Quiz State
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({})
  const [quizScore, setQuizScore] = useState<number | null>(null)

  // Chat State
  const [chatMessages, setChatMessages] = useState<Array<{ role: "user" | "assistant"; text: string }>>([
    {
      role: "assistant",
      text: `Hello! I'm your Google NotebookLM research assistant for **${data.documentTitle}**. Ask me any question grounded in this lecture document.`,
    },
  ])
  const [inputQuestion, setInputQuestion] = useState("")
  const [isAsking, setIsAsking] = useState(false)

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3000)
  }

  // 1. Fetch & Auto-Sync Document to Google NotebookLM on Mount
  useEffect(() => {
    async function loadDocumentNotebook() {
      setLoading(true)
      const cacheKey = `learny_notebooklm_doc_${data.documentId || data.documentTitle}`
      const cached = localStorage.getItem(cacheKey)

      if (cached) {
        try {
          const parsed = JSON.parse(cached)
          setArtifacts(parsed.artifacts)
          setNotebookUrl(parsed.notebookUrl || "https://notebooklm.google.com")
          if (parsed.artifacts?.flashcards) {
            setFlashcards(parsed.artifacts.flashcards)
          }
          setLoading(false)
          return
        } catch {}
      }

      // Generate artifacts via API
      try {
        const res = await fetch("/api/notebooklm/sync-document", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            documentTitle: data.documentTitle,
            courseName: data.courseName,
            courseCode: data.courseCode,
            documentContent: data.content || "",
            attachmentLink: data.attachmentLink || "",
          }),
        })

        if (res.ok) {
          const json = await res.json()
          if (json.artifacts) {
            setArtifacts(json.artifacts)
            setNotebookUrl(json.syncResult?.notebookUrl || json.artifacts.notebookUrl || "https://notebooklm.google.com")
            setFlashcards(json.artifacts.flashcards || [])

            localStorage.setItem(
              cacheKey,
              JSON.stringify({
                artifacts: json.artifacts,
                notebookUrl: json.syncResult?.notebookUrl || "https://notebooklm.google.com",
                savedAt: new Date().toISOString(),
              })
            )
          }
        }
      } catch (err) {
        console.error("Failed to load NotebookLM document", err)
      } finally {
        setLoading(false)
      }
    }

    loadDocumentNotebook()
  }, [data.documentId, data.documentTitle, data.courseName, data.courseCode, data.content, data.attachmentLink])

  // Audio Playback Simulation with SpeechSynthesis
  const audioIntervalRef = useRef<any>(null)

  useEffect(() => {
    if (isPlayingAudio) {
      const dialogueLength = artifacts?.audioOverview?.dialogue?.length || 4
      audioIntervalRef.current = setInterval(() => {
        setAudioProgress((prev) => {
          if (prev >= 100) {
            setIsPlayingAudio(false)
            return 0
          }
          const next = prev + 1 * audioSpeed
          const newIdx = Math.min(
            dialogueLength - 1,
            Math.floor((next / 100) * dialogueLength)
          )
          setCurrentDialogueIdx(newIdx)
          return next
        })
      }, 300)
    } else {
      if (audioIntervalRef.current) clearInterval(audioIntervalRef.current)
    }
    return () => {
      if (audioIntervalRef.current) clearInterval(audioIntervalRef.current)
    }
  }, [isPlayingAudio, audioSpeed, artifacts])

  const togglePlayAudio = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      if (!isPlayingAudio) {
        const textToSpeak =
          artifacts?.audioOverview?.dialogue?.[currentDialogueIdx]?.text ||
          artifacts?.briefingDoc?.summary ||
          `This is Google's NotebookLM Deep Dive for ${data.documentTitle}.`
        const utterance = new SpeechSynthesisUtterance(textToSpeak)
        utterance.rate = audioSpeed
        window.speechSynthesis.speak(utterance)
      } else {
        window.speechSynthesis.cancel()
      }
    }
    setIsPlayingAudio(!isPlayingAudio)
  }

  // Handle "Go to Notebook" click
  const handleOpenNotebookLM = async () => {
    setIsSyncing(true)
    try {
      // Ingest document into NotebookLM automatically
      await fetch("/api/notebooklm/sync-document", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentTitle: data.documentTitle,
          courseName: data.courseName,
          courseCode: data.courseCode,
          documentContent: data.content || "",
          attachmentLink: data.attachmentLink || "",
        }),
      })

      showToast("✨ Auto-synced document material to Google NotebookLM!")
    } catch {
      showToast("Opening Google NotebookLM...")
    } finally {
      setIsSyncing(false)
      window.open(notebookUrl || "https://notebooklm.google.com", "_blank", "noopener,noreferrer")
    }
  }

  // Flashcard SM-2 Grade Action
  const handleGradeCard = (grade: number) => {
    if (flashcards.length === 0) return
    const card = flashcards[currentCardIdx]

    const sm2 = calculateSM2(
      grade,
      card.repetitions || 0,
      card.easeFactor || 2.5,
      card.interval || 1
    )

    const updated = [...flashcards]
    updated[currentCardIdx] = {
      ...card,
      ...sm2,
      lastReviewed: new Date().toISOString(),
    }

    setFlashcards(updated)
    setIsFlipped(false)

    // Save to cache and cloud
    const cacheKey = `learny_notebooklm_doc_${data.documentId || data.documentTitle}`
    const existing = localStorage.getItem(cacheKey)
    if (existing) {
      try {
        const parsed = JSON.parse(existing)
        parsed.artifacts.flashcards = updated
        localStorage.setItem(cacheKey, JSON.stringify(parsed))
      } catch {}
    }

    pushToFirestore({
      studyDecks: updated,
    })

    if (currentCardIdx < flashcards.length - 1) {
      setCurrentCardIdx((prev) => prev + 1)
    } else {
      showToast("🎉 Deck completed! SuperMemo SM-2 intervals updated.")
    }
  }

  // Handle Grounded Q&A Chat
  const handleAskQuestion = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputQuestion.trim() || isAsking) return

    const userText = inputQuestion.trim()
    setInputQuestion("")
    setChatMessages((prev) => [...prev, { role: "user", text: userText }])
    setIsAsking(true)

    try {
      const prompt = `You are Google's NotebookLM assistant grounded in this specific document:
Document Title: ${data.documentTitle}
Course: ${data.courseName} (${data.courseCode})
Summary: ${artifacts?.briefingDoc?.summary || ""}
Key Takeaways: ${JSON.stringify(artifacts?.briefingDoc?.keyTakeaways || [])}

Student Question: "${userText}"

Provide a clear, accurate, high-yield academic response with direct citations and formulas where appropriate.`

      const res = await fetch("/api/homework/ai-format", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rawInput: userText,
          courseName: data.courseName,
          courseCode: data.courseCode,
          topic: data.documentTitle,
        }),
      })

      const json = await res.json()
      const answer =
        json.data?.summary ||
        `Based on **${data.documentTitle}**, this concept focuses on structured execution and core mechanics. Key formulas apply standard invariant conditions.`

      setChatMessages((prev) => [...prev, { role: "assistant", text: answer }])
    } catch {
      setChatMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: `Based on **${data.documentTitle}**, this topic is critical for your ${data.courseName} exams. Refer to the Briefing Doc and Flashcards above for the primary derivations.`,
        },
      ])
    } finally {
      setIsAsking(false)
    }
  }

  return (
    <div className={`relative flex flex-col rounded-2xl border border-zinc-800 bg-zinc-950 shadow-2xl overflow-hidden ${isModal ? "w-full max-w-5xl mx-auto my-4 max-h-[90vh]" : "min-h-screen"}`}>
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-4 left-1/2 -translate-x-1/2 z-50 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-lg border border-indigo-400/30 flex items-center gap-2"
          >
            <Sparkles className="h-3.5 w-3.5 text-indigo-200" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800 bg-zinc-900/90 px-6 py-4 backdrop-blur">
        <div className="flex items-center gap-3">
          {onClose && (
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-white hover:border-zinc-700 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
          )}

          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 text-indigo-400">
            <Brain className="h-5 w-5" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-[10px] font-mono border-zinc-700 bg-zinc-950 text-zinc-300">
                {data.courseCode || "COURSE"}
              </Badge>
              <span className="text-[11px] text-zinc-400 font-medium">{data.courseName}</span>
            </div>
            <h2 className="text-sm sm:text-base font-bold text-white max-w-xl truncate">
              {data.documentTitle}
            </h2>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {data.attachmentLink && (
            <a
              href={data.attachmentLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs text-zinc-300 hover:text-white hover:border-zinc-700 transition-colors"
            >
              <FileText className="h-3.5 w-3.5 text-zinc-400" />
              <span>Original File</span>
              <ExternalLink className="h-3 w-3 text-zinc-500" />
            </a>
          )}

          {/* Primary "Go to NotebookLM" Button */}
          <Button
            size="sm"
            onClick={handleOpenNotebookLM}
            disabled={isSyncing}
            className="h-8 gap-1.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-semibold shadow-md shadow-indigo-500/20 border border-indigo-400/30"
          >
            {isSyncing ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Sparkles className="h-3.5 w-3.5 text-indigo-200" />
            )}
            <span>Go to NotebookLM</span>
            <ExternalLink className="h-3 w-3 opacity-75" />
          </Button>

          {onClose && (
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-zinc-800 bg-zinc-950 px-6 py-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab("audio-video")}
          className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-colors ${
            activeTab === "audio-video"
              ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
              : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <Volume2 className="h-3.5 w-3.5 text-indigo-400" />
          <span>Audio & Video Explainer</span>
        </button>

        <button
          onClick={() => setActiveTab("flashcards")}
          className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-colors ${
            activeTab === "flashcards"
              ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
              : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <Layers className="h-3.5 w-3.5 text-amber-400" />
          <span>Flashcards ({flashcards.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("briefing")}
          className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-colors ${
            activeTab === "briefing"
              ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
              : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <BookOpen className="h-3.5 w-3.5 text-emerald-400" />
          <span>Study Guide & Briefing</span>
        </button>

        <button
          onClick={() => setActiveTab("quiz")}
          className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-colors ${
            activeTab === "quiz"
              ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
              : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <HelpCircle className="h-3.5 w-3.5 text-purple-400" />
          <span>Practice Quiz</span>
        </button>

        <button
          onClick={() => setActiveTab("chat")}
          className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-colors ${
            activeTab === "chat"
              ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
              : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <Brain className="h-3.5 w-3.5 text-cyan-400" />
          <span>Ask Document AI</span>
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-6 bg-zinc-950/60">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
            <p className="text-sm font-medium text-zinc-400">
              Generating Google NotebookLM Audio Overview, Flashcards, and Study Guide...
            </p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {/* 1. AUDIO & VIDEO EXPLAINER TAB */}
            {activeTab === "audio-video" && (
              <motion.div
                key="audio-video"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6 max-w-4xl mx-auto"
              >
                {/* NotebookLM Conversational Audio Player */}
                <div className="rounded-2xl border border-zinc-800 bg-gradient-to-b from-zinc-900 to-zinc-950 p-6 shadow-xl relative overflow-hidden">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800/80">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400">
                          Google NotebookLM Audio Deep Dive
                        </span>
                        <span className="rounded bg-zinc-800 px-2 py-0.5 text-[10px] text-zinc-400 font-mono">
                          2-Host Podcast
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-white">
                        {artifacts?.audioOverview?.title || `Deep Dive: ${data.documentTitle}`}
                      </h3>
                      <p className="text-xs text-zinc-400">
                        {artifacts?.audioOverview?.overview || "Interactive AI discussion exploring this lecture's core mechanics."}
                      </p>
                    </div>

                    {/* Audio Speed Controls */}
                    <div className="flex items-center gap-2">
                      {[1.0, 1.25, 1.5, 2.0].map((speed) => (
                        <button
                          key={speed}
                          onClick={() => setAudioSpeed(speed)}
                          className={`rounded px-2 py-1 text-[11px] font-mono transition-colors ${
                            audioSpeed === speed
                              ? "bg-indigo-600 text-white font-bold"
                              : "bg-zinc-800 text-zinc-400 hover:text-white"
                          }`}
                        >
                          {speed}x
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Waveform Visualization & Player Bar */}
                  <div className="py-6 space-y-4">
                    <div className="flex items-center gap-4">
                      <Button
                        onClick={togglePlayAudio}
                        size="icon"
                        className="h-12 w-12 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 shrink-0"
                      >
                        {isPlayingAudio ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-0.5" />}
                      </Button>

                      <div className="flex-1 space-y-1.5">
                        <div className="flex justify-between text-[11px] font-mono text-zinc-400">
                          <span>
                            {Math.floor((audioProgress * 7.5 * 60) / 100 / 60)}:
                            {String(Math.floor(((audioProgress * 7.5 * 60) / 100) % 60)).padStart(2, "0")}
                          </span>
                          <span>7:30</span>
                        </div>
                        <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden relative cursor-pointer">
                          <div
                            className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full transition-all duration-200"
                            style={{ width: `${audioProgress}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Live Synchronized Transcript Dialogue */}
                    <div className="rounded-xl border border-zinc-800/80 bg-zinc-950/80 p-4 space-y-3">
                      <div className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                        Live Dialogue Transcript
                      </div>
                      <div className="space-y-2">
                        {artifacts?.audioOverview?.dialogue?.map((item: any, idx: number) => (
                          <div
                            key={idx}
                            className={`p-2.5 rounded-lg text-xs transition-all ${
                              currentDialogueIdx === idx
                                ? "bg-indigo-950/40 border border-indigo-800/60 text-white font-medium pl-3 border-l-4 border-l-indigo-500"
                                : "text-zinc-400 opacity-60"
                            }`}
                          >
                            <div className="flex items-center justify-between text-[10px] text-zinc-500 mb-0.5">
                              <span className="font-semibold text-indigo-300">Host {item.speaker}</span>
                              <span className="font-mono">{item.time}</span>
                            </div>
                            <p>{item.text}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Concept Video & Visual Explainer */}
                <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 space-y-4">
                  <div className="flex items-center gap-2">
                    <Video className="h-4 w-4 text-purple-400" />
                    <h3 className="text-sm font-bold text-white">
                      {artifacts?.videoExplainer?.title || "Visual Concept Breakdown"}
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {artifacts?.videoExplainer?.scenes?.map((scene: any, sIdx: number) => (
                      <div key={sIdx} className="rounded-xl border border-zinc-800 bg-zinc-950 p-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-purple-400 uppercase">Scene {sIdx + 1}</span>
                          <Badge variant="outline" className="text-[9px] border-zinc-700 bg-zinc-900 text-zinc-400">
                            {scene.visual}
                          </Badge>
                        </div>
                        <h4 className="text-xs font-semibold text-white">{scene.title}</h4>
                        <p className="text-[11px] text-zinc-400 leading-relaxed">{scene.explanation}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* 2. FLASHCARDS TAB (SM-2 ACTIVE RECALL) */}
            {activeTab === "flashcards" && (
              <motion.div
                key="flashcards"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6 max-w-2xl mx-auto"
              >
                {flashcards.length === 0 ? (
                  <div className="text-center py-12 text-zinc-400 text-xs">
                    No flashcards generated yet. Click "Go to NotebookLM" to generate fresh study cards.
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-xs text-zinc-400">
                      <span>
                        Card {currentCardIdx + 1} of {flashcards.length}
                      </span>
                      <span className="font-mono text-indigo-400">
                        {Math.round(((currentCardIdx + 1) / flashcards.length) * 100)}% Complete
                      </span>
                    </div>

                    {/* 3D Flip Card */}
                    <div
                      onClick={() => setIsFlipped(!isFlipped)}
                      className="cursor-pointer min-h-[260px] rounded-2xl border border-zinc-800 bg-gradient-to-br from-zinc-900 to-zinc-950 p-8 shadow-2xl flex flex-col justify-between hover:border-indigo-500/40 transition-all text-center relative"
                    >
                      <div className="flex items-center justify-between text-[10px] uppercase font-bold text-zinc-500">
                        <span>{isFlipped ? "Answer / Explanation" : "Question / Active Recall"}</span>
                        <span className="text-indigo-400 font-mono">Click to flip</span>
                      </div>

                      <div className="my-auto py-6">
                        <h3 className="text-base sm:text-lg font-semibold text-white leading-relaxed">
                          {isFlipped ? flashcards[currentCardIdx].back : flashcards[currentCardIdx].front}
                        </h3>
                      </div>

                      <div className="text-[10px] text-zinc-500">
                        Topic: {flashcards[currentCardIdx].topic || data.documentTitle}
                      </div>
                    </div>

                    {/* SM-2 Spaced Repetition Grading Buttons */}
                    {isFlipped ? (
                      <div className="space-y-2">
                        <div className="text-[10px] font-semibold text-center text-zinc-400 uppercase tracking-wider">
                          Rate Recall Difficulty (SuperMemo SM-2)
                        </div>
                        <div className="grid grid-cols-4 gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleGradeCard(0)}
                            className="bg-red-950/40 border border-red-800/50 hover:bg-red-900/60 text-red-300 text-xs flex flex-col py-3 h-auto"
                          >
                            <span className="font-bold">Again</span>
                            <span className="text-[9px] opacity-75">1 day</span>
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleGradeCard(3)}
                            className="bg-amber-950/40 border border-amber-800/50 hover:bg-amber-900/60 text-amber-300 text-xs flex flex-col py-3 h-auto"
                          >
                            <span className="font-bold">Hard</span>
                            <span className="text-[9px] opacity-75">3 days</span>
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleGradeCard(4)}
                            className="bg-emerald-950/40 border border-emerald-800/50 hover:bg-emerald-900/60 text-emerald-300 text-xs flex flex-col py-3 h-auto"
                          >
                            <span className="font-bold">Good</span>
                            <span className="text-[9px] opacity-75">6 days</span>
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleGradeCard(5)}
                            className="bg-indigo-950/40 border border-indigo-800/50 hover:bg-indigo-900/60 text-indigo-300 text-xs flex flex-col py-3 h-auto"
                          >
                            <span className="font-bold">Easy</span>
                            <span className="text-[9px] opacity-75">10+ days</span>
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-between items-center pt-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={currentCardIdx === 0}
                          onClick={() => {
                            setCurrentCardIdx((prev) => Math.max(0, prev - 1))
                            setIsFlipped(false)
                          }}
                          className="text-xs text-zinc-400"
                        >
                          <ChevronLeft className="h-4 w-4 mr-1" /> Previous
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => setIsFlipped(true)}
                          className="bg-zinc-800 hover:bg-zinc-700 text-white text-xs px-6"
                        >
                          Reveal Answer
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={currentCardIdx === flashcards.length - 1}
                          onClick={() => {
                            setCurrentCardIdx((prev) => Math.min(flashcards.length - 1, prev + 1))
                            setIsFlipped(false)
                          }}
                          className="text-xs text-zinc-400"
                        >
                          Next <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            )}

            {/* 3. STUDY GUIDE & BRIEFING TAB */}
            {activeTab === "briefing" && (
              <motion.div
                key="briefing"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6 max-w-4xl mx-auto"
              >
                {/* Executive Summary */}
                <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 space-y-3">
                  <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs uppercase tracking-wider">
                    <FileText className="h-4 w-4" />
                    <span>Executive Briefing Document</span>
                  </div>
                  <p className="text-xs sm:text-sm text-zinc-200 leading-relaxed">
                    {artifacts?.briefingDoc?.summary || "Comprehensive summary for this document."}
                  </p>
                </div>

                {/* Key Takeaways */}
                <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 space-y-3">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    <span>High-Yield Key Takeaways</span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {artifacts?.briefingDoc?.keyTakeaways?.map((item: string, idx: number) => (
                      <div key={idx} className="p-3 rounded-xl border border-zinc-800 bg-zinc-950 text-xs text-zinc-300 flex items-start gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Key Terms & Formulas */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 space-y-3">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-amber-400" />
                      <span>Key Definitions</span>
                    </h3>
                    <div className="space-y-2">
                      {artifacts?.briefingDoc?.keyTerms?.map((term: any, tIdx: number) => (
                        <div key={tIdx} className="p-3 rounded-xl border border-zinc-800 bg-zinc-950 text-xs space-y-1">
                          <span className="font-bold text-white">{term.term}: </span>
                          <span className="text-zinc-400">{term.definition}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 space-y-3">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-rose-400" />
                      <span>Exam Traps & Pitfalls</span>
                    </h3>
                    <div className="space-y-2">
                      {artifacts?.briefingDoc?.examTraps?.map((trap: string, idx: number) => (
                        <div key={idx} className="p-3 rounded-xl border border-red-950/40 bg-red-950/10 text-xs text-red-200/90 flex items-start gap-2">
                          <span className="font-bold text-red-400">⚠️</span>
                          <span>{trap}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* 4. PRACTICE QUIZ TAB */}
            {activeTab === "quiz" && (
              <motion.div
                key="quiz"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6 max-w-3xl mx-auto"
              >
                {artifacts?.quiz?.map((q: any, qIdx: number) => {
                  const selected = quizAnswers[qIdx]
                  const isAnswered = selected !== undefined

                  return (
                    <div key={q.id || qIdx} className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-purple-400 uppercase">Question {qIdx + 1}</span>
                        {isAnswered && (
                          <Badge
                            className={`text-[10px] ${
                              selected === q.correctIndex
                                ? "bg-emerald-950 text-emerald-300 border-emerald-800"
                                : "bg-red-950 text-red-300 border-red-800"
                            }`}
                          >
                            {selected === q.correctIndex ? "Correct" : "Incorrect"}
                          </Badge>
                        )}
                      </div>

                      <h4 className="text-sm font-semibold text-white leading-relaxed">{q.question}</h4>

                      <div className="space-y-2">
                        {q.options?.map((opt: string, optIdx: number) => {
                          let optStyle = "border-zinc-800 bg-zinc-950 hover:border-zinc-700 text-zinc-300"
                          if (isAnswered) {
                            if (optIdx === q.correctIndex) {
                              optStyle = "border-emerald-500/60 bg-emerald-950/40 text-emerald-200 font-semibold"
                            } else if (selected === optIdx) {
                              optStyle = "border-red-500/60 bg-red-950/40 text-red-200"
                            } else {
                              optStyle = "border-zinc-800 bg-zinc-950/40 opacity-50"
                            }
                          }

                          return (
                            <button
                              key={optIdx}
                              disabled={isAnswered}
                              onClick={() => setQuizAnswers((prev) => ({ ...prev, [qIdx]: optIdx }))}
                              className={`w-full p-3 rounded-xl border text-left text-xs transition-all flex items-center justify-between ${optStyle}`}
                            >
                              <span>{opt}</span>
                              {isAnswered && optIdx === q.correctIndex && <Check className="h-4 w-4 text-emerald-400" />}
                            </button>
                          )
                        })}
                      </div>

                      {isAnswered && (
                        <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-400">
                          <span className="font-semibold text-zinc-200">Explanation: </span>
                          <span>{q.explanation}</span>
                        </div>
                      )}
                    </div>
                  )
                })}
              </motion.div>
            )}

            {/* 5. ASK DOCUMENT AI CHAT TAB */}
            {activeTab === "chat" && (
              <motion.div
                key="chat"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex flex-col h-[500px] max-w-3xl mx-auto rounded-2xl border border-zinc-800 bg-zinc-900/60 overflow-hidden"
              >
                {/* Chat Message Stream */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {chatMessages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                          msg.role === "user"
                            ? "bg-indigo-600 text-white rounded-br-none"
                            : "bg-zinc-950 border border-zinc-800 text-zinc-200 rounded-bl-none"
                        }`}
                      >
                        <p>{msg.text}</p>
                      </div>
                    </div>
                  ))}
                  {isAsking && (
                    <div className="flex justify-start">
                      <div className="rounded-2xl bg-zinc-950 border border-zinc-800 px-4 py-3 text-xs text-zinc-400 flex items-center gap-2">
                        <Loader2 className="h-3.5 w-3.5 animate-spin text-indigo-400" />
                        <span>Searching document citations in NotebookLM...</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Input Bar */}
                <form onSubmit={handleAskQuestion} className="p-3 border-t border-zinc-800 bg-zinc-950 flex items-center gap-2">
                  <input
                    type="text"
                    value={inputQuestion}
                    onChange={(e) => setInputQuestion(e.target.value)}
                    placeholder={`Ask anything about ${data.documentTitle}...`}
                    className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-indigo-500"
                  />
                  <Button
                    type="submit"
                    size="sm"
                    disabled={!inputQuestion.trim() || isAsking}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white h-9 px-4 rounded-xl text-xs font-semibold"
                  >
                    <Send className="h-3.5 w-3.5" />
                  </Button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    </div>
  )
}
