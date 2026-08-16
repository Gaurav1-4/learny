"use client"

import { useState, useEffect } from "react"
import {
  Sparkles,
  BookOpen,
  Plus,
  Brain,
  RotateCcw,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ChevronRight,
  ChevronLeft,
  Shuffle,
  Download,
  Upload,
  Trash2,
  Edit3,
  Award,
  Layers,
  ArrowRight,
  Play,
  FileText,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ClassroomCourse, ClassroomCourseWork, Flashcard, QuizQuestion, StudyDeck } from "@/types"
import { calculateSM2, isDue } from "@/lib/spaced-repetition"

export function StudyDecks() {
  const [decks, setDecks] = useState<StudyDeck[]>([])
  const [courses, setCourses] = useState<ClassroomCourse[]>([])
  const [activeDeck, setActiveDeck] = useState<StudyDeck | null>(null)
  const [studyMode, setStudyMode] = useState<"flashcards" | "quiz" | null>(null)
  const [queueFilter, setQueueFilter] = useState<"all" | "due" | "mastered">("all")

  // Flashcards Player State
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)

  // Quiz Player State
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0)
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false)
  const [quizScore, setQuizScore] = useState(0)
  const [quizFinished, setQuizFinished] = useState(false)

  // Modals & Generators
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [generatorCourseId, setGeneratorCourseId] = useState("")
  const [generatorTopic, setGeneratorTopic] = useState("")
  const [pastedNotes, setPastedNotes] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)

  // 1. Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("learny-study-decks")
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed) && parsed.length > 0) {
          setDecks(parsed)
        }
      } catch (e) {
        console.error("Failed to parse study decks", e)
      }
    }
  }, [])

  // 2. Save to localStorage
  useEffect(() => {
    localStorage.setItem("learny-study-decks", JSON.stringify(decks))
  }, [decks])

  // 3. Fetch courses
  useEffect(() => {
    async function loadCourses() {
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
    loadCourses()
  }, [])

  // Keyboard Shortcuts for Flashcards
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (studyMode !== "flashcards" || !activeDeck) return

      if (e.code === "Space") {
        e.preventDefault()
        setIsFlipped((f) => !f)
      } else if (e.code === "ArrowRight") {
        e.preventDefault()
        handleNextCard()
      } else if (e.code === "ArrowLeft") {
        e.preventDefault()
        handlePrevCard()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [studyMode, activeDeck, isFlipped, currentCardIndex])

  // Derived Queue
  const currentQueue = activeDeck ? activeDeck.flashcards.filter((f) => {
    if (queueFilter === "due") return isDue(f.nextReviewDate) || f.status === "new" || f.status === "review"
    if (queueFilter === "mastered") return f.status === "mastered"
    return true
  }) : []

  // Start Flashcards
  const startFlashcards = (deck: StudyDeck) => {
    setActiveDeck(deck)
    setCurrentCardIndex(0)
    setIsFlipped(false)
    setStudyMode("flashcards")
  }

  // Start Quiz
  const startQuiz = (deck: StudyDeck) => {
    setActiveDeck(deck)
    setCurrentQuizIndex(0)
    setSelectedOption(null)
    setIsAnswerSubmitted(false)
    setQuizScore(0)
    setQuizFinished(false)
    setStudyMode("quiz")
  }

  // Next / Prev Card
  const handleNextCard = () => {
    if (!activeDeck || currentQueue.length === 0) return
    setIsFlipped(false)
    setCurrentCardIndex((prev) => (prev + 1) % currentQueue.length)
  }

  const handlePrevCard = () => {
    if (!activeDeck || currentQueue.length === 0) return
    setIsFlipped(false)
    setCurrentCardIndex(
      (prev) => (prev - 1 + currentQueue.length) % currentQueue.length
    )
  }

  // Card Status Rating
  const handleRateCard = (grade: number) => {
    if (!activeDeck || currentQueue.length === 0) return
    const card = currentQueue[currentCardIndex]
    const sm2 = calculateSM2(grade, card.repetitions, card.easeFactor, card.interval)
    
    let newStatus: "new" | "review" | "mastered" = "review"
    if (grade >= 4 && sm2.interval >= 21) newStatus = "mastered"
    else if (grade >= 3 && sm2.interval >= 3) newStatus = "review"

    const updatedCard = {
      ...card,
      status: newStatus,
      repetitions: sm2.repetitions,
      easeFactor: sm2.easeFactor,
      interval: sm2.interval,
      nextReviewDate: sm2.nextReviewDate,
      lastReviewed: new Date().toISOString()
    }

    const updatedCards = activeDeck.flashcards.map(c => c.id === card.id ? updatedCard : c)
    const updatedDeck = { ...activeDeck, flashcards: updatedCards }
    
    setActiveDeck(updatedDeck)
    setDecks(decks.map((d) => (d.id === updatedDeck.id ? updatedDeck : d)))
    
    setIsFlipped(false)
    if (currentQueue.length > 1) {
       setCurrentCardIndex((prev) => (prev === currentQueue.length - 1 ? 0 : prev))
    }
  }

  // Shuffle Deck
  const handleShuffleDeck = () => {
    if (!activeDeck) return
    const shuffled = [...activeDeck.flashcards].sort(() => Math.random() - 0.5)
    setActiveDeck({ ...activeDeck, flashcards: shuffled })
    setCurrentCardIndex(0)
    setIsFlipped(false)
  }

  // Quiz Answer Submit
  const handleSelectQuizOption = (index: number) => {
    if (isAnswerSubmitted) return
    setSelectedOption(index)
  }

  const handleSubmitQuizAnswer = () => {
    if (selectedOption === null || !activeDeck) return
    setIsAnswerSubmitted(true)
    const currentQ = activeDeck.quizQuestions[currentQuizIndex]
    if (selectedOption === currentQ.correctAnswerIndex) {
      setQuizScore((s) => s + 1)
    }
  }

  const handleNextQuizQuestion = () => {
    if (!activeDeck) return
    if (currentQuizIndex + 1 < activeDeck.quizQuestions.length) {
      setCurrentQuizIndex((i) => i + 1)
      setSelectedOption(null)
      setIsAnswerSubmitted(false)
    } else {
      setQuizFinished(true)
    }
  }

  // Smart Study Generator (Notes / Topic → Flashcards + Quizzes)
  const handleGenerateDeck = () => {
    if (!generatorTopic.trim() && !pastedNotes.trim()) return

    setIsGenerating(true)
    const course = courses.find((c) => c.id === generatorCourseId)
    const title = generatorTopic.trim() || `${course?.name || "Study"} Notes Deck`

    // Extract concepts & generate study set
    const content = pastedNotes.trim() || generatorTopic.trim()
    const lines = content.split("\n").filter((l) => l.trim().length > 0)

    const generatedFlashcards: Flashcard[] = []
    const generatedQuiz: QuizQuestion[] = []

    if (lines.length >= 2) {
      lines.forEach((line, i) => {
        if (line.includes(":") || line.includes(" - ") || line.includes("?")) {
          const parts = line.includes(":") ? line.split(":") : line.split(" - ")
          const q = parts[0].trim()
          const a = parts.slice(1).join(" ").trim()
          if (q && a) {
            generatedFlashcards.push({
              id: `gen-fc-${Date.now()}-${i}`,
              question: q.endsWith("?") ? q : `What is ${q}?`,
              answer: a,
              status: "new",
            })
          }
        }
      })
    }

    // Default fallback structured flashcards if freeform text
    if (generatedFlashcards.length === 0) {
      generatedFlashcards.push(
        {
          id: `fc-${Date.now()}-1`,
          question: `Key Principle: ${title}`,
          answer: content.slice(0, 300) || "Comprehensive study points for this topic.",
          status: "new",
        },
        {
          id: `fc-${Date.now()}-2`,
          question: `Application & Core Mechanics of ${title}`,
          answer: "Focus on definitions, theoretical implications, and problem-solving steps.",
          status: "new",
        }
      )
    }

    // Generate practice quiz
    generatedQuiz.push({
      id: `qq-${Date.now()}-1`,
      question: `Which statement best describes the primary objective of ${title}?`,
      options: [
        `It provides the foundational framework for analyzing ${title}.`,
        "It eliminates all algorithmic constraints unconditionally.",
        "It applies exclusively to deprecated legacy systems.",
        "None of the above.",
      ],
      correctAnswerIndex: 0,
      explanation: `Core theory for ${title} defines the foundational analytical properties.`,
    })

    const newDeck: StudyDeck = {
      id: `deck-${Date.now()}`,
      title,
      courseId: generatorCourseId || undefined,
      courseName: course?.name || (generatorCourseId ? "Classroom Course" : "General Topic"),
      description: `Generated study set with ${generatedFlashcards.length} flashcards and ${generatedQuiz.length} quiz questions.`,
      flashcards: generatedFlashcards,
      quizQuestions: generatedQuiz,
      createdAt: new Date().toISOString(),
    }

    setDecks([newDeck, ...decks])
    setIsGenerating(false)
    setShowCreateModal(false)
    setGeneratorTopic("")
    setPastedNotes("")
    setGeneratorCourseId("")
  }

  // Export Deck to Markdown / NotebookLM format
  const handleExportDeck = (deck: StudyDeck) => {
    let md = `# Study Guide: ${deck.title}\n`
    if (deck.courseName) md += `**Course:** ${deck.courseName}\n\n`
    md += `## Flashcards & Key Terms\n\n`

    deck.flashcards.forEach((fc, i) => {
      md += `### ${i + 1}. ${fc.question}\n**Answer:**\n${fc.answer}\n\n---\n\n`
    })

    if (deck.quizQuestions.length > 0) {
      md += `## Practice Quiz\n\n`
      deck.quizQuestions.forEach((qq, i) => {
        md += `### Q${i + 1}: ${qq.question}\n`
        qq.options.forEach((opt, oi) => {
          md += `- [${oi === qq.correctAnswerIndex ? "x" : " "}] ${opt}\n`
        })
        md += `\n*Explanation:* ${qq.explanation}\n\n`
      })
    }

    const blob = new Blob([md], { type: "text/markdown" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${deck.title.toLowerCase().replace(/[^a-z0-9]/g, "-")}-study-deck.md`
    a.click()
    URL.revokeObjectURL(url)
  }

  // Load IIITD CSD 3rd Sem AI Decks Preset
  const handleLoadIIITDDecks = () => {
    const iiitdDecks: StudyDeck[] = [
      {
        id: "deck-dpp-2026",
        title: "DPP 2026: Design Processes & Perspectives",
        description: "Design thinking, Double Diamond, affinity mapping, and heuristic evaluation.",
        courseName: "DPP 2026",
        createdAt: new Date().toISOString(),
        flashcards: [
          {
            id: "fc-dpp-1",
            question: "What are the 4 distinct phases of the British Design Council's Double Diamond Model?",
            answer: "1. Discover (Divergent research)\n2. Define (Convergent problem framing)\n3. Develop (Divergent ideation & prototyping)\n4. Deliver (Convergent testing & shipping).",
            status: "new",
          },
          {
            id: "fc-dpp-2",
            question: "What is the primary objective of an Affinity Diagram in design synthesis?",
            answer: "To cluster large volumes of qualitative user observations, quotes, and research notes into natural thematic hierarchies to uncover design insights.",
            status: "new",
          },
          {
            id: "fc-dpp-3",
            question: "State Nielsen's First Usability Heuristic.",
            answer: "Visibility of System Status: The design should always keep users informed about what is going on through appropriate feedback within a reasonable time.",
            status: "new",
          },
        ],
        quizQuestions: [
          {
            id: "q-dpp-1",
            question: "In user experience design, which stage immediately follows Empathize in the Stanford d.school model?",
            options: ["Define", "Ideate", "Prototype", "Test"],
            correctAnswerIndex: 0,
            explanation: "The 5 stages are Empathize -> Define -> Ideate -> Prototype -> Test.",
          },
        ],
      },
      {
        id: "deck-dsa-sem3",
        title: "DSA: Graphs, Trees & Dynamic Programming",
        description: "Core algorithms, complexity bounds, and tree rotations for IIITD CSD Sem 3.",
        courseName: "Data Structures & Algorithms",
        createdAt: new Date().toISOString(),
        flashcards: [
          {
            id: "fc-dsa-1",
            question: "What is the time complexity of Dijkstra's algorithm using a Min-Heap (Priority Queue)?",
            answer: "O((V + E) log V), where V is the number of vertices and E is the number of edges.",
            status: "new",
          },
          {
            id: "fc-dsa-2",
            question: "What two essential properties must a problem satisfy to be solvable via Dynamic Programming?",
            answer: "1. Optimal Substructure (optimal solution contains optimal solutions to subproblems)\n2. Overlapping Subproblems (subproblems are solved repeatedly).",
            status: "new",
          },
          {
            id: "fc-dsa-3",
            question: "What is the maximum balance factor allowed in an AVL Tree?",
            answer: "The balance factor (height(left) - height(right)) must be in {-1, 0, +1} for every node.",
            status: "new",
          },
        ],
        quizQuestions: [
          {
            id: "q-dsa-1",
            question: "Which algorithm finds the shortest paths from a single source in a graph with negative edge weights?",
            options: ["Bellman-Ford Algorithm", "Dijkstra's Algorithm", "Kruskal's Algorithm", "Prim's Algorithm"],
            correctAnswerIndex: 0,
            explanation: "Bellman-Ford handles negative edge weights and detects negative weight cycles in O(V*E) time.",
          },
        ],
      },
      {
        id: "deck-ap-sem3",
        title: "Advanced Programming: SOLID & Design Patterns",
        description: "OOP architecture, design patterns, and concurrency.",
        courseName: "Advanced Programming",
        createdAt: new Date().toISOString(),
        flashcards: [
          {
            id: "fc-ap-1",
            question: "What does each letter in SOLID represent?",
            answer: "S: Single Responsibility\nO: Open/Closed\nL: Liskov Substitution\nI: Interface Segregation\nD: Dependency Inversion",
            status: "new",
          },
          {
            id: "fc-ap-2",
            question: "Explain the Singleton Pattern and its double-checked locking mechanism.",
            answer: "Ensures a class has only one instance with global access. Double-checked locking checks null before and after acquiring the lock to prevent concurrency race conditions without locking every call.",
            status: "new",
          },
        ],
        quizQuestions: [
          {
            id: "q-ap-1",
            question: "Which creational pattern separates the construction of a complex object from its representation?",
            options: ["Builder Pattern", "Adapter Pattern", "Observer Pattern", "Decorator Pattern"],
            correctAnswerIndex: 0,
            explanation: "The Builder pattern separates constructing complex objects from their final representation.",
          },
        ],
      },
    ]
    setDecks(iiitdDecks)
    localStorage.setItem("learny-study-decks", JSON.stringify(iiitdDecks))
  }
  
  // Import Deck (JSON / Markdown)
  const handleImportDeck = () => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = ".json,.md"
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return

      const text = await file.text()
      if (file.name.endsWith(".json")) {
        try {
           const parsed = JSON.parse(text)
           if (parsed.id && parsed.flashcards) {
             setDecks([ { ...parsed, id: `deck-${Date.now()}` }, ...decks ])
           } else if (Array.isArray(parsed)) {
             setDecks([ ...parsed.map((d, i) => ({...d, id: `deck-${Date.now()}-${i}`})), ...decks ])
           }
        } catch (err) {
           console.error("Invalid JSON format")
        }
      } else if (file.name.endsWith(".md")) {
        const lines = text.split('\n')
        let title = "Imported Deck"
        const flashcards: Flashcard[] = []
        let currentQ = ""
        let currentA = ""
        let parsingAnswer = false
        
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i]
          if (line.startsWith("# Study Guide:")) {
            title = line.replace("# Study Guide:", "").trim()
          } else if (line.startsWith("### ") && !line.startsWith("### Q")) {
             if (currentQ) {
               flashcards.push({ id: `fc-${Date.now()}-${flashcards.length}`, question: currentQ, answer: currentA.trim(), status: "new" })
             }
             currentQ = line.replace(/###\s+\d+\./, "").trim()
             currentA = ""
             parsingAnswer = false
          } else if (line.startsWith("**Answer:**")) {
             parsingAnswer = true
          } else if (line.startsWith("---")) {
             if (currentQ) {
               flashcards.push({ id: `fc-${Date.now()}-${flashcards.length}`, question: currentQ, answer: currentA.trim(), status: "new" })
               currentQ = ""
               currentA = ""
               parsingAnswer = false
             }
          } else if (parsingAnswer) {
             currentA += line + "\n"
          }
        }
        if (currentQ) {
           flashcards.push({ id: `fc-${Date.now()}-${flashcards.length}`, question: currentQ, answer: currentA.trim(), status: "new" })
        }
        
        if (flashcards.length > 0) {
           setDecks([ { id: `deck-${Date.now()}`, title, flashcards, quizQuestions: [], createdAt: new Date().toISOString() }, ...decks ])
        }
      }
    }
    input.click()
  }

  // Delete Deck

  const handleDeleteDeck = (id: string) => {
    setDecks(decks.filter((d) => d.id !== id))
    if (activeDeck?.id === id) {
      setActiveDeck(null)
      setStudyMode(null)
    }
  }

  return (
    <div className="space-y-8 max-w-6xl">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-100">Study Decks & Flashcards</h1>
          <p className="text-sm text-zinc-400 mt-1">
            Active recall, practice quizzes, and AI study cards linked to your college coursework.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="outline"
            onClick={handleLoadIIITDDecks}
            className="border-indigo-500/30 bg-indigo-950/40 text-indigo-300 hover:bg-indigo-900/60 font-semibold text-xs gap-1.5 shadow-sm"
          >
            <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
            <span>Load IIITD CSD 3rd Sem Decks</span>
          </Button>
          <Button
            variant="outline"
            onClick={handleImportDeck}
            className="border-zinc-800 hover:bg-zinc-800 text-xs text-zinc-300"
          >
            <Upload className="h-4 w-4 mr-1.5" /> Import
          </Button>
          <Button
            onClick={() => setShowCreateModal(true)}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md shadow-indigo-600/20"
          >
            <Plus className="h-4 w-4 mr-1.5" /> Generate / Add Deck
          </Button>
        </div>
      </div>

      {/* FLASHCARD STUDY VIEW */}
      {studyMode === "flashcards" && activeDeck && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setStudyMode(null)}
              className="text-xs border-zinc-800 hover:bg-zinc-800"
            >
              <ChevronLeft className="h-4 w-4 mr-1" /> Back to Decks
            </Button>

            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-zinc-400">
                Card {currentCardIndex + 1} of {activeDeck.flashcards.length}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleShuffleDeck}
                className="h-8 text-xs border-zinc-800 hover:bg-zinc-800"
              >
                <Shuffle className="h-3.5 w-3.5 mr-1" /> Shuffle
              </Button>
            </div>
          </div>

          
          {/* Queue Filter */}
          <div className="flex items-center justify-center gap-2 mb-4">
            {(["all", "due", "mastered"] as const).map((f) => (
              <Badge
                key={f}
                variant={queueFilter === f ? "default" : "outline"}
                className="cursor-pointer capitalize"
                onClick={() => {
                  setQueueFilter(f)
                  setCurrentCardIndex(0)
                  setIsFlipped(false)
                }}
              >
                {f} ({activeDeck.flashcards.filter(c => f === "due" ? (isDue(c.nextReviewDate) || c.status !== "mastered") : f === "mastered" ? c.status === "mastered" : true).length})
              </Badge>
            ))}
          </div>

          {currentQueue.length === 0 ? (
            <div className="text-center py-20 text-zinc-400">
              No cards in this queue. You're all caught up!
            </div>
          ) : (
            <>
              {/* Flashcard Progress Bar */}
              <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-indigo-500 h-full transition-all duration-300"
                  style={{
                    width: `${((currentCardIndex + 1) / currentQueue.length) * 100}%`,
                  }}
                />
              </div>

              {/* Interactive Flip Card */}
              <div className="flex justify-center">
                <div
                  onClick={() => setIsFlipped(!isFlipped)}
                  className="w-full max-w-2xl min-h-[340px] cursor-pointer rounded-3xl border border-zinc-800 bg-zinc-900 p-8 shadow-2xl transition-all hover:border-zinc-700 flex flex-col justify-between select-none relative group"
                >
                  <div className="flex items-center justify-between text-xs text-zinc-500">
                    <span className="font-semibold uppercase tracking-wider">
                      {isFlipped ? "Answer" : "Question / Prompt"}
                    </span>
                    <span className="text-[11px] bg-zinc-800 px-2 py-0.5 rounded text-zinc-400">
                      Click or Space to Flip
                    </span>
                  </div>

                  <div className="my-auto py-8 text-center">
                    <h3 className="text-2xl font-bold text-zinc-100 leading-relaxed whitespace-pre-wrap">
                      {isFlipped
                        ? currentQueue[currentCardIndex]?.answer
                        : currentQueue[currentCardIndex]?.question}
                    </h3>
                  </div>

                  <div className="flex items-center justify-between text-xs text-zinc-500 pt-4 border-t border-zinc-800/80">
                    <span>Deck: {activeDeck.title}</span>
                    <Badge
                      variant={
                        currentQueue[currentCardIndex]?.status === "mastered"
                          ? "secondary"
                          : "outline"
                      }
                      className="text-[10px]"
                    >
                      {currentQueue[currentCardIndex]?.status || "new"}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Controls & Rating Bar */}
              {isFlipped ? (
                <div className="flex items-center justify-center gap-4 pt-2">
                  <Button
                    size="lg"
                    onClick={() => handleRateCard(0)}
                    className="bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs px-4 flex flex-col h-auto py-2"
                  >
                    <span>Again</span>
                    <span className="text-[10px] opacity-70">&lt; 1m</span>
                  </Button>
                  <Button
                    size="lg"
                    onClick={() => handleRateCard(3)}
                    className="bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs px-4 flex flex-col h-auto py-2"
                  >
                    <span>Hard</span>
                    <span className="text-[10px] opacity-70">
                      {calculateSM2(3, currentQueue[currentCardIndex]?.repetitions, currentQueue[currentCardIndex]?.easeFactor, currentQueue[currentCardIndex]?.interval).interval}d
                    </span>
                  </Button>
                  <Button
                    size="lg"
                    onClick={() => handleRateCard(4)}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs px-4 flex flex-col h-auto py-2"
                  >
                    <span>Good</span>
                    <span className="text-[10px] opacity-70">
                      {calculateSM2(4, currentQueue[currentCardIndex]?.repetitions, currentQueue[currentCardIndex]?.easeFactor, currentQueue[currentCardIndex]?.interval).interval}d
                    </span>
                  </Button>
                  <Button
                    size="lg"
                    onClick={() => handleRateCard(5)}
                    className="bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs px-4 flex flex-col h-auto py-2"
                  >
                    <span>Easy</span>
                    <span className="text-[10px] opacity-70">
                      {calculateSM2(5, currentQueue[currentCardIndex]?.repetitions, currentQueue[currentCardIndex]?.easeFactor, currentQueue[currentCardIndex]?.interval).interval}d
                    </span>
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-4 pt-2">
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={handlePrevCard}
                    className="border-zinc-800 hover:bg-zinc-800"
                  >
                    <ChevronLeft className="h-5 w-5 mr-1" /> Prev
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={handleNextCard}
                    className="border-zinc-800 hover:bg-zinc-800"
                  >
                    Next <ChevronRight className="h-5 w-5 ml-1" />
                  </Button>
                </div>
              )}
            </>
          )}

        </div>
      )}

      {/* QUIZ STUDY VIEW */}
      {studyMode === "quiz" && activeDeck && (
        <div className="space-y-6 max-w-3xl mx-auto animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setStudyMode(null)}
              className="text-xs border-zinc-800 hover:bg-zinc-800"
            >
              <ChevronLeft className="h-4 w-4 mr-1" /> Exit Quiz
            </Button>

            {!quizFinished && (
              <span className="text-xs font-semibold text-zinc-400">
                Question {currentQuizIndex + 1} of {activeDeck.quizQuestions.length} • Score: {quizScore}
              </span>
            )}
          </div>

          {!quizFinished ? (
            <Card className="border-zinc-800 bg-zinc-900 p-8 shadow-xl space-y-6">
              <div className="space-y-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
                  Multiple Choice Question
                </span>
                <h3 className="text-xl font-bold text-zinc-100 leading-snug">
                  {activeDeck.quizQuestions[currentQuizIndex].question}
                </h3>
              </div>

              {/* Options */}
              <div className="space-y-3">
                {activeDeck.quizQuestions[currentQuizIndex].options.map((option, idx) => {
                  const isSelected = selectedOption === idx
                  const isCorrect = idx === activeDeck.quizQuestions[currentQuizIndex].correctAnswerIndex

                  let btnStyle = "border-zinc-800 bg-zinc-950/60 hover:bg-zinc-800 text-zinc-200"
                  if (isAnswerSubmitted) {
                    if (isCorrect) {
                      btnStyle = "border-emerald-500/50 bg-emerald-950/30 text-emerald-300 font-semibold"
                    } else if (isSelected && !isCorrect) {
                      btnStyle = "border-red-500/50 bg-red-950/30 text-red-300"
                    }
                  } else if (isSelected) {
                    btnStyle = "border-indigo-500 bg-indigo-950/30 text-indigo-200 font-semibold"
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelectQuizOption(idx)}
                      disabled={isAnswerSubmitted}
                      className={`w-full text-left p-4 rounded-xl border transition-all text-sm flex items-center justify-between ${btnStyle}`}
                    >
                      <span>{option}</span>
                      {isAnswerSubmitted && isCorrect && (
                        <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 ml-2" />
                      )}
                      {isAnswerSubmitted && isSelected && !isCorrect && (
                        <XCircle className="h-4 w-4 text-red-400 shrink-0 ml-2" />
                      )}
                    </button>
                  )
                })}
              </div>

              {/* Explanation (Shown on submit) */}
              {isAnswerSubmitted && (
                <div className="rounded-xl bg-zinc-950/80 border border-zinc-800 p-4 text-sm text-zinc-300 space-y-1 animate-in fade-in">
                  <div className="font-semibold text-xs text-indigo-400 uppercase tracking-wider">
                    Explanation
                  </div>
                  <p>{activeDeck.quizQuestions[currentQuizIndex].explanation}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end pt-2">
                {!isAnswerSubmitted ? (
                  <Button
                    onClick={handleSubmitQuizAnswer}
                    disabled={selectedOption === null}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-6"
                  >
                    Check Answer
                  </Button>
                ) : (
                  <Button
                    onClick={handleNextQuizQuestion}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-6"
                  >
                    {currentQuizIndex + 1 < activeDeck.quizQuestions.length
                      ? "Next Question"
                      : "Complete Quiz"}{" "}
                    &rarr;
                  </Button>
                )}
              </div>
            </Card>
          ) : (
            /* Quiz Scoreboard */
            <Card className="border-zinc-800 bg-zinc-900 p-8 shadow-2xl text-center space-y-6">
              <div className="mx-auto w-16 h-16 rounded-full bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                <Award className="h-8 w-8" />
              </div>

              <div className="space-y-1">
                <h3 className="text-2xl font-extrabold text-zinc-100">Quiz Completed!</h3>
                <p className="text-sm text-zinc-400">Here is how you performed on {activeDeck.title}</p>
              </div>

              <div className="py-4">
                <span className="text-6xl font-black text-zinc-100">
                  {Math.round((quizScore / activeDeck.quizQuestions.length) * 100)}%
                </span>
                <p className="text-sm font-semibold text-zinc-400 mt-2">
                  {quizScore} out of {activeDeck.quizQuestions.length} questions correct
                </p>
              </div>

              <div className="flex justify-center gap-4 pt-4">
                <Button
                  variant="outline"
                  onClick={() => startQuiz(activeDeck)}
                  className="border-zinc-800 hover:bg-zinc-800 text-xs"
                >
                  <RotateCcw className="h-4 w-4 mr-1.5" /> Retake Quiz
                </Button>
                <Button
                  onClick={() => setStudyMode(null)}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
                >
                  Back to All Decks
                </Button>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* DECK GRID LIST VIEW */}
      {!studyMode && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {decks.map((deck) => {
            const masteredCount = deck.flashcards.filter((f) => f.status === "mastered").length
            const dueCount = deck.flashcards.filter((f) => isDue(f.nextReviewDate) || f.status !== "mastered").length
            const retentionPct = deck.flashcards.length > 0 
                ? Math.round(deck.flashcards.reduce((acc, f) => acc + Math.min(100, Math.max(0, (f.easeFactor || 2.5) * 10)), 0) / deck.flashcards.length)
                : 0
            const progressPct =
              deck.flashcards.length > 0
                ? Math.round((masteredCount / deck.flashcards.length) * 100)
                : 0

            return (
              <Card
                key={deck.id}
                className="group flex flex-col justify-between border-zinc-800 bg-zinc-900/80 p-6 transition-all hover:border-indigo-500/50 hover:bg-zinc-800/50 shadow-sm"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <Badge variant="outline" className="text-[10px] text-indigo-400 border-indigo-500/30">
                      {deck.courseName || "Custom Deck"}
                    </Badge>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleExportDeck(deck)}
                        title="Export Markdown / NotebookLM study guide"
                        className="p-1 text-zinc-400 hover:text-zinc-100"
                      >
                        <Download className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteDeck(deck.id)}
                        title="Delete Deck"
                        className="p-1 text-zinc-500 hover:text-red-400"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-zinc-100 group-hover:text-indigo-400 transition-colors line-clamp-1">
                      {deck.title}
                    </h3>
                    {deck.description && (
                      <p className="mt-1 text-xs text-zinc-400 line-clamp-2">{deck.description}</p>
                    )}
                  </div>

                  {/* Progress Indicator */}
                  <div className="space-y-1.5 pt-2">
                    <div className="flex justify-between text-[11px] text-zinc-400">
                      <span>{deck.flashcards.length} flashcards</span>
                      <span className="font-semibold text-amber-500">{dueCount} due for review</span>
                    </div>
                    <div className="w-full bg-zinc-800 h-1 rounded-full overflow-hidden">
                      <div className="bg-emerald-500 h-full" style={{ width: `${progressPct}%` }} />
                    </div>
                    <div className="flex justify-between text-[11px] text-zinc-500 pt-1">
                      <span>Retention: {retentionPct}%</span>
                      <span>{progressPct}% mastered</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-zinc-800/80 flex items-center justify-between gap-2">
                  <Button
                    size="sm"
                    onClick={() => startFlashcards(deck)}
                    className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold"
                  >
                    <Layers className="h-3.5 w-3.5 mr-1.5" /> Flashcards
                  </Button>

                  {deck.quizQuestions.length > 0 && (
                    <Button
                      size="sm"
                      onClick={() => startQuiz(deck)}
                      className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
                    >
                      <Brain className="h-3.5 w-3.5 mr-1.5" /> Practice Quiz
                    </Button>
                  )}
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* CREATE & GENERATE DECK MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-xl rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-indigo-400" />
                <h3 className="text-lg font-bold text-zinc-100">Create / Generate Study Deck</h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="rounded-lg p-1 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-zinc-400">Deck Title / Topic</label>
                <Input
                  placeholder="e.g. Computer Networks — TCP/IP Model & Flow Control"
                  value={generatorTopic}
                  onChange={(e) => setGeneratorTopic(e.target.value)}
                  className="mt-1"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-400">Classroom Course Link (Optional)</label>
                <select
                  value={generatorCourseId}
                  onChange={(e) => setGeneratorCourseId(e.target.value)}
                  className="mt-1 flex h-10 w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="">None (Independent Deck)</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-zinc-400">
                    Paste Lecture Notes / Syllabus / Study Text
                  </label>
                  <span className="text-[11px] text-zinc-500">Auto-converts lines to Q&A</span>
                </div>
                <textarea
                  rows={6}
                  placeholder={`Paste notes or key terms here, for example:
DNS: Domain Name System that translates domain names into IP addresses.
TCP 3-Way Handshake: SYN -> SYN-ACK -> ACK connection establishment.
HTTP vs HTTPS: HTTPS encrypts data transfer over TLS/SSL on port 443.`}
                  value={pastedNotes}
                  onChange={(e) => setPastedNotes(e.target.value)}
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-950 p-3 text-sm text-zinc-200 placeholder-zinc-600 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCreateModal(false)}
                className="border-zinc-800 text-xs"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleGenerateDeck}
                disabled={isGenerating || (!generatorTopic.trim() && !pastedNotes.trim())}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md shadow-indigo-600/20"
              >
                {isGenerating ? "Generating..." : "Create Study Deck"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
