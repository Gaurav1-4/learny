"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Bell,
  Sparkles,
  CheckCircle2,
  Mic,
  MicOff,
  Calculator,
  Send,
  X,
  Play,
  FileText,
  Cloud,
  Layers,
  ArrowRight,
  ExternalLink,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { OKFRegistry } from "@/lib/okf-indexer"

interface LiveClassMockSimulatorProps {
  onSuccess?: () => void
}

export function LiveClassMockSimulator({ onSuccess }: LiveClassMockSimulatorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [activeStep, setActiveStep] = useState<"alert" | "processing" | "completed">("alert")
  const [lectureToSimulate, setLectureToSimulate] = useState<"lec-1" | "lec-2">("lec-1")
  const [homeworkInput, setHomeworkInput] = useState("4.1 3 4 5, 13.1 1 5")
  const [isListening, setIsListening] = useState(false)
  const [speechTranscript, setSpeechTranscript] = useState("")
  const [executionLogs, setExecutionLogs] = useState<string[]>([])

  const handleStartSimulation = (lec: "lec-1" | "lec-2") => {
    setLectureToSimulate(lec)
    setHomeworkInput(lec === "lec-1" ? "4.1 3 4 5, 13.1 1 5" : "14.2 3 5, 14.3 2, 14.4 1")
    setActiveStep("alert")
    setIsOpen(true)
    setExecutionLogs([])
  }

  const handleToggleVoice = () => {
    if (typeof window === "undefined") return

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
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
        setSpeechTranscript("Listening... Speak (e.g. 'Exercise 4.1 question 3 4 5')")
      }

      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join("")
        setSpeechTranscript(transcript)

        // Parse speech
        const numbers = transcript.match(/\d+/g) || []
        if (numbers.length > 0) {
          setHomeworkInput(transcript)
        }
      }

      recognition.onerror = () => setIsListening(false)
      recognition.onend = () => setIsListening(false)
      recognition.start()
    } catch {
      setIsListening(false)
    }
  }

  const handleExecuteMockPipeline = async (e: React.FormEvent) => {
    e.preventDefault()
    setActiveStep("processing")
    setExecutionLogs([])

    const addLog = (msg: string) => {
      setExecutionLogs((prev) => [...prev, msg])
    }

    const lecId = lectureToSimulate === "lec-1" ? "iiitd-mth201-lec01" : "iiitd-mth201-lec02"
    const lecName = lectureToSimulate === "lec-1" ? "Lecture 1: Higher-Order Linear ODEs & Complex Numbers" : "Lecture 2: Cauchy's Integral Theorem & Path Independence"
    const fileName = lectureToSimulate === "lec-1" ? "Lecture1_Notes_ODEs.pdf" : "Lecture2_Notes_Cauchy.pdf"

    // Step 1: Detect PDF
    addLog(`📥 1. Detecting uploaded classroom file: ${fileName}...`)
    await new Promise((r) => setTimeout(r, 600))

    // Step 2: NotebookLM Ingestion
    addLog(`🧠 2. Ingesting full PDF into NotebookLM (studyonly.co@gmail.com)...`)
    await new Promise((r) => setTimeout(r, 800))
    addLog(`✨ 3. NotebookLM extracted authoritative topic: "${lecName}"`)
    await new Promise((r) => setTimeout(r, 500))

    // Step 3: Save to 5 TB Storage Vault
    const storagePath = `Learny Vault/Sem 3/Math III/Notes/${fileName}`
    addLog(`☁️ 4. Synchronizing raw binary PDF into 5 TB Cloud Vault: ${storagePath}`)
    await new Promise((r) => setTimeout(r, 600))

    // Step 4: Update OKF Manifest
    addLog(`🏷️ 5. Creating OKF Manifest [${lecId}] with user homework: "${homeworkInput}"...`)
    OKFRegistry.updateLectureHomework(lecId, homeworkInput)
    await new Promise((r) => setTimeout(r, 600))

    // Step 5: Problem Ledger & Similar Practice
    addLog(`📐 6. Cross-referenced textbook exercises & generated similar practice problems.`)
    await new Promise((r) => setTimeout(r, 400))
    addLog(`🎉 7. Complete end-to-end workflow executed successfully!`)

    setActiveStep("completed")
    if (onSuccess) onSuccess()
  }

  return (
    <>
      {/* Trigger Card in Dashboard */}
      <Card className="border-indigo-500/30 bg-zinc-950/90 shadow-xl overflow-hidden backdrop-blur-xl">
        <CardHeader className="p-5 border-b border-zinc-800 bg-zinc-900/40">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400">
                <Play className="h-5 w-5 fill-indigo-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <CardTitle className="text-base font-bold text-white">
                    Live Class End &amp; Homework Mock Simulator
                  </CardTitle>
                  <Badge className="bg-indigo-500/20 text-indigo-300 border-indigo-500/40 text-[10px] font-bold">
                    Interactive Demo
                  </Badge>
                </div>
                <CardDescription className="text-xs text-zinc-400 mt-0.5">
                  Test the complete end-to-end post-class alert, voice/text homework submission, NotebookLM topic extraction, and OKF storage sync.
                </CardDescription>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                onClick={() => handleStartSimulation("lec-1")}
                className="h-9 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs gap-1.5 shadow-md shadow-indigo-600/30"
              >
                <Play className="h-3.5 w-3.5 fill-white" />
                <span>Simulate Lecture 1</span>
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleStartSimulation("lec-2")}
                className="h-9 border-zinc-700 hover:bg-zinc-800 text-zinc-200 font-bold text-xs gap-1.5"
              >
                <Play className="h-3.5 w-3.5" />
                <span>Simulate Lecture 2</span>
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Interactive Mock Modal Pop-up */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-lg rounded-3xl bg-zinc-950 border border-indigo-500/40 shadow-2xl overflow-hidden p-6 space-y-5"
            >
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-600/20 border border-indigo-500/40 text-indigo-400 animate-pulse">
                    <Bell className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">
                      Math III {lectureToSimulate === "lec-1" ? "Lecture 1" : "Lecture 2"} Just Ended!
                    </h3>
                    <p className="text-xs text-zinc-400">
                      Class finished at 10:00 AM • New PDF uploaded: <code className="text-indigo-300">{lectureToSimulate === "lec-1" ? "Lecture1_Notes.pdf" : "Lecture2_Notes.pdf"}</code>
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsOpen(false)}
                  className="rounded-full p-1 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-all"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {activeStep === "alert" && (
                <form onSubmit={handleExecuteMockPipeline} className="space-y-4">
                  <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-500/30 text-xs text-zinc-300 space-y-2">
                    <div className="font-bold text-indigo-300 flex items-center gap-1.5">
                      <Sparkles className="h-4 w-4 text-indigo-400" />
                      <span>Post-Class Homework Check</span>
                    </div>
                    <p className="leading-relaxed">
                      Did the professor assign homework in today&apos;s Math III lecture? Type the exercise numbers or speak into the microphone.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-zinc-200">Enter Assigned Homework:</span>
                      <span className="text-[10px] text-zinc-500 font-mono">Format: [Ex] [Q1 Q2...]</span>
                    </div>

                    <div className="flex gap-2">
                      <Input
                        value={homeworkInput}
                        onChange={(e) => setHomeworkInput(e.target.value)}
                        placeholder="e.g. 4.1 3 4 5, 13.1 1 5 or 14.2 3 5"
                        className="bg-zinc-900 border-zinc-800 text-xs font-mono flex-1"
                        required
                      />

                      <Button
                        type="button"
                        onClick={handleToggleVoice}
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
                            <span>Speak</span>
                          </>
                        )}
                      </Button>
                    </div>

                    {speechTranscript && (
                      <div className="text-[11px] text-indigo-300 font-mono italic">
                        🎙️ &quot;{speechTranscript}&quot;
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <button
                      type="button"
                      onClick={() => setIsOpen(false)}
                      className="text-xs text-zinc-500 hover:text-zinc-300 transition-all"
                    >
                      No Homework Assigned Today
                    </button>

                    <Button
                      type="submit"
                      className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold gap-1.5 shadow-lg shadow-indigo-600/30"
                    >
                      <span>Submit &amp; Run Pipeline</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </form>
              )}

              {activeStep === "processing" && (
                <div className="space-y-3 py-4">
                  <div className="text-xs font-bold text-indigo-300 flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-indigo-400 animate-spin" />
                    <span>Executing Real-Time Academic Ingestion Pipeline...</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-1.5 font-mono text-[11px] text-zinc-300">
                    {executionLogs.map((log, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -5 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="leading-relaxed"
                      >
                        {log}
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {activeStep === "completed" && (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-emerald-300">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                      <span>Pipeline Complete! OKF Manifest &amp; Storage Synced</span>
                    </div>
                    <div className="text-xs text-zinc-300 space-y-1">
                      <div>
                        • <strong>Topic (NotebookLM)</strong>:{" "}
                        <span className="text-indigo-300 font-bold">
                          {lectureToSimulate === "lec-1"
                            ? "Lecture 1: Higher-Order Linear ODEs & Complex Numbers"
                            : "Lecture 2: Cauchy's Integral Theorem & Path Independence"}
                        </span>
                      </div>
                      <div>
                        • <strong>5 TB Cloud Storage</strong>:{" "}
                        <span className="font-mono text-[11px] text-zinc-400">
                          Learny Vault / Sem 3 / Math III / Notes / {lectureToSimulate === "lec-1" ? "Lecture1_Notes_ODEs.pdf" : "Lecture2_Notes_Cauchy.pdf"}
                        </span>
                      </div>
                      <div>
                        • <strong>OKF Manifest</strong>:{" "}
                        <span className="font-mono text-emerald-300">
                          {lectureToSimulate === "lec-1" ? "iiitd-mth201-lec01" : "iiitd-mth201-lec02"}
                        </span>{" "}
                        (Status: 🟢 Homework Logged)
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2">
                    <Button
                      onClick={() => setIsOpen(false)}
                      className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold"
                    >
                      Done &amp; View Ledger
                    </Button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}
