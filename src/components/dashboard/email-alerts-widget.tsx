"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Mail,
  AlertTriangle,
  Flame,
  Clock,
  Sparkles,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  ShieldAlert,
  Calendar,
  CheckCircle2,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AcademicNotice } from "@/lib/gmail"

export function EmailAlertsWidget() {
  const [notices, setNotices] = useState<AcademicNotice[]>([])
  const [loading, setLoading] = useState(true)
  const [source, setSource] = useState<"live" | "demo">("demo")
  const [appliedNotices, setAppliedNotices] = useState<Record<string, boolean>>({})

  const fetchNotices = async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/gmail/academic-alerts")
      if (res.ok) {
        const data = await res.json()
        setNotices(data.notices || [])
        setSource(data.source || "demo")
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNotices()
  }, [])

  const handleApplyToSchedule = (noticeId: string) => {
    setAppliedNotices((prev) => ({ ...prev, [noticeId]: true }))
  }

  return (
    <Card className="border-indigo-500/30 bg-zinc-950/80 shadow-xl overflow-hidden backdrop-blur-xl">
      <CardHeader className="p-5 border-b border-zinc-800/80 bg-zinc-900/40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400">
              <Mail className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-base font-extrabold text-white">
                  College Email Radar (@iiitd.ac.in)
                </CardTitle>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                  Live Sync
                </span>
              </div>
              <CardDescription className="text-xs text-zinc-400 mt-0.5">
                Autonomous scanner detecting room changes, pop quizzes, and TA notices.
              </CardDescription>
            </div>
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={fetchNotices}
            className="h-8 border-zinc-800 text-zinc-400 hover:text-white text-xs gap-1"
          >
            <RefreshCw className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} />
            <span>Scan</span>
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-3">
        {loading ? (
          <div className="space-y-2.5">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="h-20 animate-pulse rounded-2xl bg-zinc-900 border border-zinc-800"
              />
            ))}
          </div>
        ) : notices.length === 0 ? (
          <div className="py-6 text-center text-xs text-zinc-500">
            No urgent academic notices detected in your college email.
          </div>
        ) : (
          <div className="space-y-3">
            {notices.slice(0, 3).map((notice) => {
              const isApplied = appliedNotices[notice.id]

              return (
                <motion.div
                  key={notice.id}
                  whileHover={{ y: -1 }}
                  className={`rounded-2xl border p-3.5 transition-all shadow-sm ${
                    notice.urgency === "Urgent"
                      ? "border-rose-500/40 bg-rose-950/15 hover:bg-rose-950/25"
                      : "border-zinc-800 bg-zinc-900/60 hover:bg-zinc-900"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge
                          variant="outline"
                          className={`text-[9px] font-bold uppercase tracking-wider ${
                            notice.category === "Surprise Quiz Alert"
                              ? "bg-rose-600 text-white border-rose-500"
                              : notice.category === "Room Change"
                              ? "bg-amber-600 text-white border-amber-500"
                              : "border-indigo-500/30 text-indigo-300"
                          }`}
                        >
                          {notice.category}
                        </Badge>
                        <Badge className="bg-zinc-800 text-zinc-300 text-[9px] font-bold">
                          {notice.subjectCode}
                        </Badge>
                        <span className="text-[10px] text-zinc-400 truncate max-w-[160px]">
                          {notice.senderName}
                        </span>
                      </div>

                      <h4 className="text-xs font-bold text-white leading-snug">
                        {notice.subject}
                      </h4>
                      <p className="text-[11px] text-zinc-300 line-clamp-2 leading-relaxed">
                        {notice.actionableSummary}
                      </p>
                    </div>

                    <div className="shrink-0 flex flex-col items-end gap-1.5">
                      <button
                        onClick={() => handleApplyToSchedule(notice.id)}
                        className={`rounded-lg px-2.5 py-1 text-[10px] font-bold transition-all ${
                          isApplied
                            ? "bg-emerald-600/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1"
                            : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm"
                        }`}
                      >
                        {isApplied ? (
                          <>
                            <CheckCircle2 className="h-3 w-3" /> Synced
                          </>
                        ) : (
                          "Apply to Timetable"
                        )}
                      </button>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
