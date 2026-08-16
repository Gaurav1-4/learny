"use client"

import { useState, useEffect } from "react"
import {
  Mail,
  RefreshCw,
  CheckCircle2,
  ThumbsUp,
  ThumbsDown,
  ExternalLink,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FilteredAcademicNotice } from "@/lib/email-filter-agent"

export function EmailAlertsWidget() {
  const [notices, setNotices] = useState<FilteredAcademicNotice[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<{ totalRaw: number; filteredOut: number }>({ totalRaw: 0, filteredOut: 0 })
  const [appliedNotices, setAppliedNotices] = useState<Record<string, boolean>>({})
  const [feedbackMap, setFeedbackMap] = useState<Record<string, "relevant" | "spam">>({})

  const fetchNotices = async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/gmail/academic-alerts")
      if (res.ok) {
        const data = await res.json()
        setNotices(data.notices || [])
        setStats({
          totalRaw: data.totalRawScanned || 0,
          filteredOut: data.filteredOutCount || 0,
        })
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const savedFeedback = localStorage.getItem("learny_email_feedback_map")
    if (savedFeedback) {
      try {
        setFeedbackMap(JSON.parse(savedFeedback))
      } catch (e) {}
    }
    fetchNotices()
  }, [])

  const handleFeedback = async (noticeId: string, subject: string, feedback: "relevant" | "spam") => {
    const updated = { ...feedbackMap, [noticeId]: feedback }
    setFeedbackMap(updated)
    localStorage.setItem("learny_email_feedback_map", JSON.stringify(updated))

    try {
      await fetch("/api/gmail/academic-alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, feedback }),
      })
      if (feedback === "spam") {
        setNotices((prev) => prev.filter((n) => n.id !== noticeId))
      }
    } catch (e) {
      console.error("Failed to submit feedback:", e)
    }
  }

  const handleApplyToSchedule = (notice: FilteredAcademicNotice) => {
    setAppliedNotices((prev) => ({ ...prev, [notice.id]: true }))
    const savedShifts = localStorage.getItem("learny_timetable_email_shifts")
    const shifts = savedShifts ? JSON.parse(savedShifts) : []
    shifts.push({
      noticeId: notice.id,
      subjectCode: notice.subjectCode,
      update: notice.scheduleUpdate || { summary: notice.actionableSummary },
      appliedAt: new Date().toISOString(),
    })
    localStorage.setItem("learny_timetable_email_shifts", JSON.stringify(shifts))
  }

  return (
    <Card className="border-zinc-800 bg-zinc-900/30 overflow-hidden">
      <CardHeader className="p-4 border-b border-zinc-800 bg-zinc-900/40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-zinc-400" />
            <CardTitle className="text-xs font-semibold text-zinc-200">
              Academic Email Notice Filter
            </CardTitle>
            <span className="text-[10px] text-zinc-500 font-mono">
              (@iiitd.ac.in)
            </span>
          </div>

          <Button
            size="sm"
            variant="ghost"
            onClick={fetchNotices}
            className="h-7 px-2 text-zinc-400 hover:text-white text-[11px] gap-1"
          >
            <RefreshCw className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-3.5 space-y-2.5">
        {loading ? (
          <div className="space-y-2">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="h-16 animate-pulse rounded-lg bg-zinc-900 border border-zinc-800"
              />
            ))}
          </div>
        ) : notices.length === 0 ? (
          <div className="py-4 text-center text-xs text-zinc-500">
            No active notices requiring schedule changes.
          </div>
        ) : (
          <div className="space-y-2">
            {notices.map((notice) => {
              const isApplied = appliedNotices[notice.id]
              const userFeedback = feedbackMap[notice.id]

              return (
                <div
                  key={notice.id}
                  className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-3 transition-colors hover:border-zinc-700"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[11px] font-semibold text-zinc-200">
                          {notice.subjectCode || "Notice"}
                        </span>
                        <span className="text-[10px] text-zinc-500">
                          {notice.category}
                        </span>
                      </div>

                      <p className="text-xs text-zinc-300 font-medium leading-snug">
                        {notice.actionableSummary}
                      </p>
                    </div>

                    <div className="shrink-0 flex items-center gap-2">
                      <button
                        onClick={() => handleApplyToSchedule(notice)}
                        className={`rounded-md px-2 py-1 text-[10px] font-medium transition-colors ${
                          isApplied
                            ? "bg-zinc-800 text-zinc-300 flex items-center gap-1"
                            : "bg-white text-zinc-950 hover:bg-zinc-200"
                        }`}
                      >
                        {isApplied ? (
                          <>
                            <CheckCircle2 className="h-3 w-3" /> Updated
                          </>
                        ) : (
                          "Apply to Timetable"
                        )}
                      </button>

                      <div className="flex items-center gap-0.5">
                        <button
                          title="Relevant"
                          onClick={() => handleFeedback(notice.id, notice.subject, "relevant")}
                          className={`p-1 rounded transition-colors ${
                            userFeedback === "relevant"
                              ? "text-white bg-zinc-800"
                              : "text-zinc-500 hover:text-zinc-300"
                          }`}
                        >
                          <ThumbsUp className="h-3 w-3" />
                        </button>
                        <button
                          title="Irrelevant"
                          onClick={() => handleFeedback(notice.id, notice.subject, "spam")}
                          className={`p-1 rounded transition-colors ${
                            userFeedback === "spam"
                              ? "text-zinc-300 bg-zinc-800"
                              : "text-zinc-500 hover:text-zinc-300"
                          }`}
                        >
                          <ThumbsDown className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
