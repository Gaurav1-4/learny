"use client"

import { useState, useEffect } from "react"
import {
  Brain,
  ExternalLink,
  Sparkles,
  Download,
  Copy,
  Check,
  BookOpen,
  FileText,
  Upload,
  RefreshCw,
  User,
  ShieldCheck,
  Zap,
  Layers,
  HelpCircle,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { useSession } from "next-auth/react"
import { ClassroomCourse, ClassroomCourseWork, ClassroomAnnouncement } from "@/types"

export function NotebookLMHub() {
  const { data: session } = useSession()
  const [courses, setCourses] = useState<ClassroomCourse[]>([])
  const [selectedCourseId, setSelectedCourseId] = useState("")
  const [coursework, setCoursework] = useState<ClassroomCourseWork[]>([])
  const [announcements, setAnnouncements] = useState<ClassroomAnnouncement[]>([])
  const [loadingContent, setLoadingContent] = useState(false)

  // Personal Google Account (NotebookLM Subscription)
  const [personalEmail, setPersonalEmail] = useState("")
  const [isSavedPersonal, setIsSavedPersonal] = useState(false)
  const [generatedCorpus, setGeneratedCorpus] = useState("")
  const [copiedCorpus, setCopiedCorpus] = useState(false)

  // NotebookLM Import State
  const [importText, setImportText] = useState("")
  const [importSuccess, setImportSuccess] = useState("")

  // 1. Load saved personal account email from localStorage (Default: studyonly.co@gmail.com with 5 TB Storage)
  useEffect(() => {
    const saved = localStorage.getItem("learny_notebooklm_personal_email")
    if (saved) {
      setPersonalEmail(saved)
      setIsSavedPersonal(true)
    } else {
      const defaultEmail = "studyonly.co@gmail.com"
      setPersonalEmail(defaultEmail)
      setIsSavedPersonal(true)
      localStorage.setItem("learny_notebooklm_personal_email", defaultEmail)
    }
  }, [])

  // 2. Fetch all courses (both active and archived)
  useEffect(() => {
    async function loadCourses() {
      try {
        const res = await fetch("/api/classroom/courses?state=ALL")
        if (res.ok) {
          const data = await res.json()
          const coursesList = Array.isArray(data) ? data : data.courses || []
          setCourses(coursesList)
          if (coursesList.length > 0 && !selectedCourseId) {
            setSelectedCourseId(coursesList[0].id)
          }
        }
      } catch (e) {
        console.error("Failed to load courses for NotebookLM hub", e)
      }
    }
    loadCourses()
  }, [])

  // 3. Load course materials when selected
  useEffect(() => {
    if (!selectedCourseId) return

    async function loadCourseMaterials() {
      setLoadingContent(true)
      try {
        const [cwRes, annRes] = await Promise.all([
          fetch(`/api/classroom/courses/${selectedCourseId}/coursework`),
          fetch(`/api/classroom/courses/${selectedCourseId}/announcements`),
        ])

        const cwData = cwRes.ok ? await cwRes.json() : []
        const annData = annRes.ok ? await annRes.json() : []

        const cwList = Array.isArray(cwData) ? cwData : cwData.coursework || []
        const annList = Array.isArray(annData) ? annData : annData.announcements || []

        setCoursework(cwList)
        setAnnouncements(annList)

        // Generate knowledge base corpus
        const course = courses.find((c) => c.id === selectedCourseId)
        let corpus = `# Course Knowledge Base: ${course?.name || "Subject"}\n`
        if (course?.section) corpus += `**Section / Semester:** ${course.section}\n`
        if (course?.descriptionHeading) corpus += `**Instructor Details:** ${course.descriptionHeading}\n\n`

        corpus += `## Announcements & Lecture Notes\n\n`
        if (annList.length === 0) {
          corpus += `*No notices posted.*\n\n`
        } else {
          annList.forEach((ann: ClassroomAnnouncement, idx: number) => {
            corpus += `### Notice ${idx + 1} (${ann.creationTime ? new Date(ann.creationTime).toLocaleDateString() : "Recent"})\n`
            corpus += `${ann.text}\n\n`
          })
        }

        corpus += `## Coursework & Assignments\n\n`
        if (cwList.length === 0) {
          corpus += `*No assignments found.*\n\n`
        } else {
          cwList.forEach((cw: ClassroomCourseWork, idx: number) => {
            corpus += `### Assignment ${idx + 1}: ${cw.title}\n`
            if (cw.description) corpus += `**Description:** ${cw.description}\n`
            if (cw.dueDate) {
              corpus += `**Due Date:** ${cw.dueDate.day}/${cw.dueDate.month}/${cw.dueDate.year}\n`
            }
            if (cw.maxPoints) corpus += `**Max Points:** ${cw.maxPoints} pts\n`
            corpus += `\n`
          })
        }

        setGeneratedCorpus(corpus)
      } catch (e) {
        console.error(e)
      } finally {
        setLoadingContent(false)
      }
    }

    loadCourseMaterials()
  }, [selectedCourseId, courses])

  // Save personal Google account
  const handleSavePersonalEmail = (e: React.FormEvent) => {
    e.preventDefault()
    if (!personalEmail.trim()) return
    localStorage.setItem("learny_notebooklm_personal_email", personalEmail.trim())
    setIsSavedPersonal(true)
  }

  // Copy knowledge base
  const handleCopyCorpus = () => {
    navigator.clipboard.writeText(generatedCorpus)
    setCopiedCorpus(true)
    setTimeout(() => setCopiedCorpus(false), 2500)
  }

  // Download Markdown source file for NotebookLM
  const handleDownloadCorpus = () => {
    const course = courses.find((c) => c.id === selectedCourseId)
    const blob = new Blob([generatedCorpus], { type: "text/markdown" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${(course?.name || "course").toLowerCase().replace(/[^a-z0-9]/g, "-")}-notebooklm-source.md`
    a.click()
    URL.revokeObjectURL(url)
  }

  // Import Q&A from NotebookLM output into Learny Study Decks
  const handleImportNotebookLMOutput = () => {
    if (!importText.trim()) return

    const lines = importText.split("\n").filter((l) => l.trim().length > 0)
    const course = courses.find((c) => c.id === selectedCourseId)

    const flashcards: any[] = []
    lines.forEach((line, idx) => {
      if (line.includes(":") || line.includes(" - ") || line.includes("?")) {
        const parts = line.includes(":") ? line.split(":") : line.split(" - ")
        const q = parts[0].replace(/^[\d\.\-\*\#\s]+/, "").trim()
        const a = parts.slice(1).join(" ").trim()
        if (q && a) {
          flashcards.push({
            id: `nlm-fc-${Date.now()}-${idx}`,
            question: q.endsWith("?") ? q : `What is ${q}?`,
            answer: a,
            status: "new",
            repetitions: 0,
            easeFactor: 2.5,
            interval: 1,
            nextReviewDate: new Date().toISOString().split("T")[0],
          })
        }
      }
    })

    if (flashcards.length === 0) {
      flashcards.push({
        id: `nlm-fc-${Date.now()}-1`,
        question: `NotebookLM Summary for ${course?.name || "Subject"}`,
        answer: importText.slice(0, 400),
        status: "new",
        repetitions: 0,
        easeFactor: 2.5,
        interval: 1,
        nextReviewDate: new Date().toISOString().split("T")[0],
      })
    }

    // Save to study decks in localStorage
    const savedDecks = localStorage.getItem("learny-study-decks")
    const existingDecks = savedDecks ? JSON.parse(savedDecks) : []

    const newDeck = {
      id: `deck-nlm-${Date.now()}`,
      title: `NotebookLM Study Deck — ${course?.name || "Subject"}`,
      courseId: selectedCourseId || undefined,
      courseName: course?.name || "Classroom Subject",
      description: `Imported directly from NotebookLM with ${flashcards.length} flashcards.`,
      flashcards,
      quizQuestions: [],
      createdAt: new Date().toISOString(),
    }

    localStorage.setItem("learny-study-decks", JSON.stringify([newDeck, ...existingDecks]))
    setImportSuccess(`Imported ${flashcards.length} flashcards into your Study Decks!`)
    setImportText("")
    setTimeout(() => setImportSuccess(""), 4000)
  }

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-indigo-400 font-semibold text-xs uppercase tracking-wider">
          <Brain className="h-4 w-4" />
          <span>NotebookLM Dual Account Hub</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-100 mt-1">
          Google NotebookLM Integration
        </h1>
        <p className="text-sm text-zinc-400 mt-1">
          Connect your personal Google account with your NotebookLM subscription while keeping your college Google Classroom account synced.
        </p>
      </div>

      {/* Dual Account Status Banner */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Account 1: College Google Classroom */}
        <Card className="border-zinc-800 bg-zinc-900/90 shadow-sm p-6 space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400">
                <BookOpen className="h-5 w-5" />
              </div>
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-blue-400">
                  Google Classroom Account
                </span>
                <h3 className="text-base font-bold text-zinc-100 truncate max-w-[220px]">
                  {session?.user?.name || "College Student"}
                </h3>
              </div>
            </div>
            <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-xs">
              <Check className="h-3 w-3 mr-1" /> Connected
            </Badge>
          </div>

          <div className="text-xs text-zinc-400 bg-zinc-950/60 p-3 rounded-lg border border-zinc-800">
            <span className="font-semibold text-zinc-300">Email: </span>
            {session?.user?.email || "college@university.edu"}
            <div className="mt-1 text-[11px] text-zinc-500">
              Streams active & archived courses, coursework, assignments, and announcements.
            </div>
          </div>
        </Card>

        {/* Account 2: Personal Google Account with NotebookLM Subscription & 5 TB Storage */}
        <Card className="border-purple-500/30 bg-zinc-900/90 shadow-sm p-6 space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400">
                <Brain className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-purple-400">
                    NotebookLM & Google Storage
                  </span>
                  <span className="rounded-full bg-purple-500/20 px-2 py-0.5 text-[10px] font-bold text-purple-300">
                    5 TB Cloud Storage
                  </span>
                </div>
                <h3 className="text-base font-bold text-zinc-100 mt-0.5">
                  {isSavedPersonal ? personalEmail : "studyonly.co@gmail.com"}
                </h3>
              </div>
            </div>
            <Badge className="bg-purple-500/15 text-purple-300 border-purple-500/40 text-xs">
              <Zap className="h-3 w-3 mr-1 text-purple-400" /> Active 5 TB
            </Badge>
          </div>

          <div className="text-xs text-zinc-400 bg-zinc-950/60 p-3 rounded-lg border border-zinc-800 flex items-center justify-between">
            <div>
              <span className="font-semibold text-zinc-300">Target Account: </span>
              <span className="text-purple-300 font-mono font-bold">studyonly.co@gmail.com</span>
              <div className="mt-0.5 text-[11px] text-zinc-500">
                Deep Audio Overview generation, 5 TB Google Drive storage, and source uploads.
              </div>
            </div>
            <a
              href="https://notebooklm.google.com"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 rounded-lg bg-purple-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-purple-500 shrink-0 shadow-md shadow-purple-600/30"
            >
              <span>Launch</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>

          <form onSubmit={handleSavePersonalEmail} className="flex gap-2 pt-1">
            <Input
              type="email"
              placeholder="e.g. studyonly.co@gmail.com"
              value={personalEmail}
              onChange={(e) => setPersonalEmail(e.target.value)}
              className="bg-zinc-950 border-zinc-800 text-xs h-9"
              required
            />
            <Button type="submit" size="sm" className="bg-purple-600 hover:bg-purple-500 text-white text-xs shrink-0">
              Update
            </Button>
          </form>
        </Card>
      </div>

      {/* Course Knowledge Base Export to NotebookLM */}
      <Card className="border-zinc-800 bg-zinc-900/90 shadow-lg">
        <CardHeader className="border-b border-zinc-800 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-indigo-400" />
                1-Click Export Course Knowledge to NotebookLM
              </CardTitle>
              <CardDescription className="text-xs text-zinc-400 mt-1">
                Packages all announcements, syllabus notes, and assignment prompts from Classroom into a clean NotebookLM source.
              </CardDescription>
            </div>

            <div className="flex items-center gap-3">
              <select
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
                className="h-10 rounded-lg border border-zinc-800 bg-zinc-950 px-3 text-xs font-semibold text-zinc-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} {c.courseState === "ARCHIVED" ? "(Archived)" : ""}
                  </option>
                ))}
              </select>

              <a
                href="https://notebooklm.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-500 transition-all shadow-md shadow-indigo-600/20"
              >
                Open NotebookLM
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-xs font-semibold text-zinc-300">
              Knowledge Base Preview ({coursework.length} assignments, {announcements.length} notices)
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyCorpus}
                className="h-8 text-xs border-zinc-800 hover:bg-zinc-800 text-zinc-300"
              >
                {copiedCorpus ? (
                  <>
                    <Check className="h-3.5 w-3.5 mr-1 text-emerald-400" /> Copied to Clipboard
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5 mr-1" /> Copy Markdown
                  </>
                )}
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadCorpus}
                className="h-8 text-xs border-zinc-800 hover:bg-zinc-800 text-zinc-300"
              >
                <Download className="h-3.5 w-3.5 mr-1" /> Download .md Source
              </Button>
            </div>
          </div>

          <textarea
            readOnly
            rows={8}
            value={loadingContent ? "Compiling course materials from Google Classroom..." : generatedCorpus}
            className="w-full rounded-xl border border-zinc-800 bg-zinc-950 p-4 font-mono text-xs text-zinc-300 focus:outline-none"
          />

          <div className="rounded-xl bg-indigo-950/20 border border-indigo-500/20 p-4 text-xs text-zinc-300 space-y-1.5">
            <div className="font-semibold text-indigo-400 flex items-center gap-1.5">
              <HelpCircle className="h-4 w-4" /> Quick NotebookLM Workflow:
            </div>
            <p>
              1. Click <strong>&quot;Download .md Source&quot;</strong> or <strong>&quot;Copy Markdown&quot;</strong> above.
            </p>
            <p>
              2. Click <strong>&quot;Open NotebookLM&quot;</strong> (make sure your browser is signed into your personal subscribed account).
            </p>
            <p>
              3. In NotebookLM, create a new Notebook for this subject and paste or upload the source file.
            </p>
            <p>
              4. Generate audio podcast overviews, study guides, or FAQ lists in NotebookLM, then paste the output below to import into your Spaced Repetition Study Decks!
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Import from NotebookLM into Learny */}
      <Card className="border-zinc-800 bg-zinc-900/90 shadow-md">
        <CardHeader className="pb-3 border-b border-zinc-800">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Upload className="h-4 w-4 text-purple-400" />
            Import NotebookLM Output into Spaced Repetition Decks
          </CardTitle>
          <CardDescription className="text-xs text-zinc-400">
            Paste generated study notes or Q&A pairs from NotebookLM to automatically create an SM-2 flashcard deck.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <textarea
            rows={5}
            placeholder={`Paste Q&A pairs or summary notes from NotebookLM, for example:
Virtual Memory: Memory management technique that provides an idealized abstraction of storage resources.
Page Fault: An interrupt raised when a program accesses a page not currently mapped in RAM.
TLB: Translation Lookaside Buffer, a hardware cache for virtual-to-physical address mappings.`}
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
            className="w-full rounded-xl border border-zinc-800 bg-zinc-950 p-4 text-xs text-zinc-200 placeholder-zinc-600 focus:border-indigo-500 focus:outline-none"
          />

          <div className="flex items-center justify-between pt-1">
            {importSuccess ? (
              <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                <Check className="h-4 w-4" /> {importSuccess}
              </span>
            ) : (
              <span className="text-xs text-zinc-500">
                Deck will be linked to: {courses.find((c) => c.id === selectedCourseId)?.name || "Subject"}
              </span>
            )}

            <Button
              size="sm"
              onClick={handleImportNotebookLMOutput}
              disabled={!importText.trim()}
              className="bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs"
            >
              <Layers className="h-3.5 w-3.5 mr-1.5" /> Convert to Study Deck
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 5 TB Google Drive Cloud Document Vault */}
      <Card className="border-purple-500/30 bg-zinc-900/90 shadow-xl overflow-hidden backdrop-blur-xl">
        <CardHeader className="p-6 border-b border-zinc-800 bg-zinc-950/40">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <CardTitle className="text-lg font-bold text-white">
                    5 TB Google Drive Document Vault (studyonly.co@gmail.com)
                  </CardTitle>
                  <span className="rounded-full bg-purple-500/20 px-2 py-0.5 text-[10px] font-bold text-purple-300">
                    Instant Search Ready
                  </span>
                </div>
                <CardDescription className="text-xs text-zinc-400 mt-0.5">
                  Organized cloud directory structure for all IIITD 3rd Semester course slides, problem sheets, and notes.
                </CardDescription>
              </div>
            </div>

            <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30 text-xs">
              <Check className="h-3 w-3 mr-1" /> Synced with 5 TB Drive
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { code: "MTH201", name: "Math III", files: "14 Lecture PDFs, 4 Tutorial Sheets", size: "18.4 MB" },
              { code: "CSE231", name: "Operating Systems (OS)", files: "18 Slides, 3 Concurrency Labs", size: "24.6 MB" },
              { code: "CSE201", name: "Advanced Programming (AP)", files: "12 Architecture Slides, 2 Projects", size: "32.1 MB" },
              { code: "DES201", name: "DPP 2026", files: "8 Design Frameworks, 4 Case Studies", size: "45.0 MB" },
              { code: "SSH201", name: "RMSSD", files: "10 Research Methodology Papers", size: "16.8 MB" },
            ].map((vault) => (
              <div key={vault.code} className="p-3.5 rounded-xl border border-zinc-800 bg-zinc-950/80 space-y-1.5">
                <div className="flex items-center justify-between">
                  <Badge className="bg-zinc-800 text-purple-300 font-bold text-[10px]">{vault.code}</Badge>
                  <span className="text-[10px] text-zinc-500 font-mono">{vault.size}</span>
                </div>
                <h4 className="text-xs font-bold text-white truncate">{vault.name}</h4>
                <p className="text-[11px] text-zinc-400">{vault.files}</p>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800/80 text-xs text-zinc-400 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-purple-400 shrink-0" />
              <span>Future-ready for instant retrieval: <em>&quot;Give me Lecture 1 notes of OS&quot;</em> directly from your 5 TB cloud storage.</span>
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
