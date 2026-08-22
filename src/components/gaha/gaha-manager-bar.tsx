"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Sparkles,
  Send,
  Loader2,
  X,
  ChevronUp,
  ChevronDown,
  Cpu,
  Brain,
  Zap,
  Calculator,
  BookOpen,
  Calendar,
  CheckCircle2,
  ExternalLink,
  MessageSquare,
  Activity,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FormattedMathText } from "@/components/ui/math-view"
import Link from "next/link"

interface GahaMessage {
  id: string
  role: "user" | "gaha"
  text: string
  intent?: string
  suggestedActions?: Array<{ label: string; actionType: string; payload?: any }>
  timestamp: string
}

interface KeyStatus {
  keyIndex: number
  maskedKey: string
  isHealthy: boolean
  requestsCount: number
}

export function GahaManagerBar() {
  const [isOpen, setIsOpen] = useState(false)
  const [showPoolMonitor, setShowPoolMonitor] = useState(false)
  const [prompt, setPrompt] = useState("")
  const [loading, setLoading] = useState(false)
  const [messages, setMessages] = useState<GahaMessage[]>([
    {
      id: "welcome",
      role: "gaha",
      text: "👋 Hi Gaurav! I am **GAHA**, your Academic Intelligence Manager. I am powered by 9 load-balanced Gemini engines to solve homework with KaTeX math, synthesize NotebookLM notes, optimize your target grades, and manage your IIITD Monsoon 2026 courses.",
      timestamp: "Just now",
    },
  ])
  const [poolStatus, setPoolStatus] = useState<{ totalKeys: number; keys: KeyStatus[]; totalRequests: number }>({
    totalKeys: 9,
    keys: Array.from({ length: 9 }).map((_, i) => ({
      keyIndex: i + 1,
      maskedKey: `AQ.Ab8...${i + 1}`,
      isHealthy: true,
      requestsCount: 0,
    })),
    totalRequests: 0,
  })

  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Fetch pool status on mount
  useEffect(() => {
    async function fetchStatus() {
      try {
        const res = await fetch("/api/gaha/dispatch")
        if (res.ok) {
          const data = await res.json()
          if (data.pool) setPoolStatus(data.pool)
        }
      } catch {}
    }
    fetchStatus()
  }, [])

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages, isOpen])

  const handleSendPrompt = async (textToSend?: string) => {
    const text = (textToSend || prompt).trim()
    if (!text || loading) return

    const userMsgId = `user-${Date.now()}`
    setMessages((prev) => [
      ...prev,
      {
        id: userMsgId,
        role: "user",
        text,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ])
    setPrompt("")
    setLoading(true)

    try {
      const res = await fetch("/api/gaha/dispatch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: text }),
      })

      if (res.ok) {
        const json = await res.json()
        const gahaData = json.data
        if (json.pool) setPoolStatus(json.pool)

        setMessages((prev) => [
          ...prev,
          {
            id: `gaha-${Date.now()}`,
            role: "gaha",
            text: gahaData?.reply || "I have analyzed your request.",
            intent: gahaData?.intent,
            suggestedActions: gahaData?.suggestedActions,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          },
        ])
      } else {
        throw new Error("Failed to reach GAHA")
      }
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `gaha-${Date.now()}`,
          role: "gaha",
          text: "⚠️ Connection to GAHA intelligence layer failed. Please verify your connection.",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  const QUICK_PROMPTS = [
    { label: "🎯 Target Grade for Math III", text: "GAHA, calculate what score I need in Math III midsem & endsem to get an A grade." },
    { label: "📚 Summarize OS Paging", text: "GAHA, summarize Operating Systems paging, page tables, and TLB with key formulas." },
    { label: "⚡ Tuesday AP Quiz Prep", text: "GAHA, generate 3 high-yield questions on OOP design patterns and Java concurrency for my AP quiz." },
    { label: "📅 Plan Today's Study", text: "GAHA, plan my study session for tonight considering my Monsoon 2026 class schedule." },
  ]

  return (
    <>
      {/* Floating Manager Trigger Bar */}
      <div className="fixed bottom-20 right-4 md:bottom-8 md:right-8 z-40">
        {!isOpen && (
          <motion.button
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setIsOpen(true)}
            className="flex items-center gap-3 rounded-full border border-indigo-500/40 bg-zinc-950/90 px-4 py-2.5 shadow-2xl backdrop-blur-md hover:border-indigo-400 hover:bg-zinc-900 transition-all text-white"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 shadow-md shadow-indigo-500/30">
              <Sparkles className="h-4 w-4 text-white" />
            </div>

            <div className="text-left">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold tracking-tight text-white">GAHA Manager</span>
                <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <div className="text-[10px] text-zinc-400 font-mono flex items-center gap-1">
                <span>9 Engines Online</span>
              </div>
            </div>

            {/* Micro 9-Node Activity Indicator */}
            <div className="flex items-center gap-0.5 pl-1">
              {Array.from({ length: 9 }).map((_, i) => (
                <span
                  key={i}
                  className={`h-2.5 w-0.5 rounded-full ${
                    poolStatus.keys[i]?.isHealthy ? "bg-emerald-400/80" : "bg-zinc-600"
                  }`}
                />
              ))}
            </div>
          </motion.button>
        )}
      </div>

      {/* Expandable GAHA Copilot Drawer */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:justify-end p-0 sm:p-6 bg-black/60 backdrop-blur-sm pointer-events-auto">
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40, scale: 0.96 }}
              transition={{ duration: 0.2 }}
              className="w-full sm:w-[480px] h-[85vh] sm:h-[680px] max-h-[90vh] rounded-t-3xl sm:rounded-2xl border border-zinc-800 bg-zinc-950 shadow-2xl flex flex-col overflow-hidden"
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-900/90 px-5 py-3.5">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 shadow-md shadow-indigo-500/20 text-white">
                    <Brain className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-white">GAHA Intelligence</h3>
                      <span className="rounded bg-emerald-950/60 border border-emerald-800/60 px-1.5 py-0.2 text-[9px] text-emerald-300 font-mono font-medium">
                        9-Key Pool
                      </span>
                    </div>
                    <p className="text-[10px] text-zinc-400 font-mono">
                      {poolStatus.totalKeys * 1500} Req/Day Capacity • High-Throughput
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setShowPoolMonitor(!showPoolMonitor)}
                    title="Toggle 9-Key Pool Status"
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                  >
                    <Activity className="h-4 w-4" />
                  </button>

                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* 9-Node Key Pool Live Health Monitor (Collapsible) */}
              <AnimatePresence>
                {showPoolMonitor && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-b border-zinc-800 bg-zinc-900/50 p-3 space-y-2 overflow-hidden"
                  >
                    <div className="flex items-center justify-between text-[10px] text-zinc-400 font-mono">
                      <span>9-Key Gemini Load-Balancing Pool</span>
                      <span>Total Requests: {poolStatus.totalRequests}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-1.5">
                      {poolStatus.keys.map((k) => (
                        <div
                          key={k.keyIndex}
                          className="rounded-lg border border-zinc-800 bg-zinc-950 p-1.5 text-[10px] space-y-0.5"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-zinc-300 font-bold">Key #{k.keyIndex}</span>
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${
                                k.isHealthy ? "bg-emerald-400 animate-pulse" : "bg-amber-400"
                              }`}
                            />
                          </div>
                          <div className="text-zinc-500 font-mono text-[9px] truncate">
                            {k.requestsCount} reqs
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Conversation Messages Scroll Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
                {messages.map((msg) => {
                  const isUser = msg.role === "user"

                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isUser ? "items-end" : "items-start"} space-y-1`}
                    >
                      <div
                        className={`max-w-[90%] rounded-2xl p-4 text-xs leading-relaxed ${
                          isUser
                            ? "bg-indigo-600 text-white rounded-br-none shadow-md"
                            : "bg-zinc-900/90 border border-zinc-800 text-zinc-200 rounded-bl-none shadow-sm"
                        }`}
                      >
                        {isUser ? (
                          <p>{msg.text}</p>
                        ) : (
                          <div className="space-y-2">
                            <FormattedMathText text={msg.text} />

                            {msg.suggestedActions && (
                              <div className="flex flex-wrap gap-1.5 pt-2 border-t border-zinc-800/80">
                                {msg.suggestedActions.map((action, aIdx) => (
                                  <Link
                                    key={aIdx}
                                    href={action.payload || "#"}
                                    onClick={() => setIsOpen(false)}
                                    className="inline-flex items-center gap-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 px-2.5 py-1 text-[10px] font-semibold text-indigo-300 border border-zinc-700 transition-colors"
                                  >
                                    <span>{action.label}</span>
                                    <ExternalLink className="h-2.5 w-2.5 opacity-70" />
                                  </Link>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      <span className="text-[9px] text-zinc-500 font-mono px-1">
                        {msg.timestamp}
                      </span>
                    </div>
                  )
                })}

                {loading && (
                  <div className="flex items-center gap-2 rounded-2xl bg-zinc-900/80 border border-zinc-800 p-3 text-xs text-zinc-400 w-fit">
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-indigo-400" />
                    <span>GAHA is synthesizing via 9 Gemini engines...</span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Prompt Suggestions */}
              <div className="px-4 py-2 border-t border-zinc-800/80 bg-zinc-950 flex gap-1.5 overflow-x-auto scrollbar-none">
                {QUICK_PROMPTS.map((qp, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendPrompt(qp.text)}
                    disabled={loading}
                    className="shrink-0 rounded-full border border-zinc-800 bg-zinc-900 hover:border-indigo-500/40 hover:bg-zinc-800 px-3 py-1 text-[10px] font-medium text-zinc-300 transition-colors"
                  >
                    {qp.label}
                  </button>
                ))}
              </div>

              {/* Input Bar */}
              <div className="p-3 border-t border-zinc-800 bg-zinc-900/90">
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    handleSendPrompt()
                  }}
                  className="flex items-center gap-2"
                >
                  <input
                    type="text"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Ask GAHA anything (math, grades, lectures, schedule)..."
                    disabled={loading}
                    className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                  <Button
                    type="submit"
                    size="sm"
                    disabled={!prompt.trim() || loading}
                    className="h-9 w-9 p-0 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 shrink-0"
                  >
                    <Send className="h-3.5 w-3.5" />
                  </Button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}
