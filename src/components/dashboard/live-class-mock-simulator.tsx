"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Bell,
  CheckCircle2,
  Mic,
  MicOff,
  X,
  Play,
  ArrowRight,
} from "lucide-react"
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
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

    addLog(`1. Detecting uploaded classroom file: ${fileName}...`)
    await new Promise((r) => setTimeout(r, 500))

    addLog(`2. Ingesting into NotebookLM (studyonly.co@gmail.com)...`)
    await new Promise((r) => setTimeout(r, 600))
    addLog(`3. Topic extracted: "${lecName}"`)
    await new Promise((r) => setTimeout(r, 400))

    const storagePath = `Learny Vault/Sem 3/Math III/Notes/${fileName}`
    addLog(`4. Saved to 5 TB Storage: ${storagePath}`)
    await new Promise((r) => setTimeout(r, 500))

    addLog(`5. Created OKF Manifest [${lecId}] with assigned homework.`)
    OKFRegistry.updateLectureHomework(lecId, homeworkInput)
    await new Promise((r) => setTimeout(r, 400))

    addLog(`6. Cross-referenced textbook exercises & similar practice problems.`)
    await new Promise((r) => setTimeout(r, 300))

    setActiveStep("completed")
    if (onSuccess) onSuccess()
  }

  return (
    <>
      {/* Trigger Card in Dashboard */}
      <Card className="border-zinc-800 bg-zinc-900/30 overflow-hidden">
        <CardHeader className="p-4 bg-zinc-900/40">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <CardTitle className="text-xs font-semibold text-zinc-200">
                Post-Class Homework &amp; OKF Sync Simulation
              </CardTitle>
              <CardDescription className="text-[11px] text-zinc-500 mt-0.5">
                Simulate class completion, voice/text homework submission, and automated cloud sync.
              </CardDescription>
            </div>

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleStartSimulation("lec-1")}
                className="h-7 border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 text-[11px] font-medium gap-1"
              >
                <Play className="h-3 w-3" />
                <span>Simulate Lecture 1</span>
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleStartSimulation("lec-2")}
                className="h-7 border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 text-[11px] font-medium gap-1"
              >
                <Play className="h-3 w-3" />
                <span>Simulate Lecture 2</span>
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Clean Modal Pop-up */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="w-full max-w-md rounded-2xl bg-zinc-950 border border-zinc-800 shadow-2xl p-5 space-y-4"
            >
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-200">
                    <Bell className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">
                      Math III {lectureToSimulate === "lec-1" ? "Lecture 1" : "Lecture 2"} Ended
                    </h3>
                    <p className="text-[11px] text-zinc-500">
                      Uploaded: <code className="text-zinc-300">{lectureToSimulate === "lec-1" ? "Lecture1_Notes.pdf" : "Lecture2_Notes.pdf"}</code>
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsOpen(false)}
                  className="rounded-md p-1 text-zinc-500 hover:text-white transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {activeStep === "alert" && (
                <form onSubmit={handleExecuteMockPipeline} className="space-y-3.5">
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Enter the homework assigned in today&apos;s Math III lecture. Type shorthand (e.g. <code>4.1 3 4 5</code>) or use voice input.
                  </p>

                  <div className="space-y-1.5">
                    <div className="flex gap-2">
                      <Input
                        value={homeworkInput}
                        onChange={(e) => setHomeworkInput(e.target.value)}
                        placeholder="e.g. 4.1 3 4 5, 13.1 1 5"
                        className="bg-zinc-900 border-zinc-800 text-xs font-mono flex-1 h-9"
                        required
                      />

                      <Button
                        type="button"
                        onClick={handleToggleVoice}
                        variant="outline"
                        className={`h-9 px-2.5 text-xs font-medium gap-1 border-zinc-700 ${
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

                  <div className="flex items-center justify-between pt-2">
                    <button
                      type="button"
                      onClick={() => setIsOpen(false)}
                      className="text-xs text-zinc-500 hover:text-zinc-400 transition-colors"
                    >
                      No Homework Today
                    </button>

                    <Button
                      type="submit"
                      className="bg-white text-zinc-950 hover:bg-zinc-200 text-xs font-semibold gap-1.5 h-8"
                    >
                      <span>Submit</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </form>
              )}

              {activeStep === "processing" && (
                <div className="space-y-2 py-2">
                  <div className="text-xs font-medium text-zinc-300">
                    Processing &amp; Syncing Manifest...
                  </div>

                  <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800 space-y-1 font-mono text-[11px] text-zinc-400">
                    {executionLogs.map((log, idx) => (
                      <div key={idx} className="leading-relaxed">
                        {log}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeStep === "completed" && (
                <div className="space-y-3">
                  <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800 space-y-1.5 text-xs text-zinc-300">
                    <div className="flex items-center gap-1.5 font-semibold text-white">
                      <CheckCircle2 className="h-4 w-4 text-zinc-200" />
                      <span>OKF Manifest &amp; Storage Synced</span>
                    </div>
                    <div className="text-[11px] text-zinc-400 space-y-0.5 pt-1">
                      <div>• Topic: {lectureToSimulate === "lec-1" ? "Lecture 1: Linear ODEs & Complex Numbers" : "Lecture 2: Cauchy Theorem & Formulas"}</div>
                      <div>• Storage: {lectureToSimulate === "lec-1" ? "Notes/Lecture1_Notes_ODEs.pdf" : "Notes/Lecture2_Notes_Cauchy.pdf"}</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end">
                    <Button
                      onClick={() => setIsOpen(false)}
                      className="bg-white text-zinc-950 hover:bg-zinc-200 text-xs font-medium h-8"
                    >
                      Done
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
