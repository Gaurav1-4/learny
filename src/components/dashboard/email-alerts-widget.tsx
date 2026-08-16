"use client"

import { useState, useEffect } from "react"
import {
  Mail,
  RefreshCw,
  CheckCircle2,
  ThumbsUp,
  ThumbsDown,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FilteredAcademicNotice } from "@/lib/email-filter-agent"

export function EmailAlertsWidget() {
  const [notices, setNotices] = useState<FilteredAcademicNotice[]>([])
  const [loading, setLoading] = useState(true)
  const [filterMode, setFilterMode] = useState<"urgent" | "all">("urgent")
  const [appliedNotices, setAppliedNotices] = useState<Record<string, boolean>>({})
  const [feedbackMap, setFeedbackMap] = useState<Record<string, "relevant" | "spam">>({})
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const fetchNotices = async (mode = filterMode) => {
    try {
      setLoading(true)
      const res = await fetch(`/api/gmail/academic-alerts${mode === "all" ? "?all=true" : ""}`)
      if (res.ok) {
        const data = await res.json()
        setNotices(data.notices || [])
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
      } catch {}
    }
    fetchNotices(filterMode)
  }, [filterMode])

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
      <CardHeader className="p-3.5 sm:p-4 border-b border-zinc-800 bg-zinc-900/40">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-zinc-400" />
            <CardTitle className="text-xs font-semibold text-zinc-200">
              College Email Radar
            </CardTitle>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Filter Toggle */}
            <div className="flex rounded-md bg-zinc-950 p-0.5 border border-zinc-800">
              <button
                onClick={() => setFilterMode("urgent")}
                className={`px-2 py-0.5 text-[10px] font-medium rounded transition-colors ${
                  filterMode === "urgent"
                    ? "bg-zinc-800 text-white"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                Action Items
              </button>
              <button
                onClick={() => setFilterMode("all")}
                className={`px-2 py-0.5 text-[10px] font-medium rounded transition-colors ${
                  filterMode === "all"
                    ? "bg-zinc-800 text-white"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                All Emails
              </button>
            </div>

            <Button
              size="sm"
              variant="ghost"
              onClick={() => fetchNotices(filterMode)}
              className="h-6 px-1.5 text-zinc-400 hover:text-white text-[10px]"
            >
              <RefreshCw className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-3.5 space-y-2">
        {loading ? (
          <div className="space-y-2">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="h-14 animate-pulse rounded-lg bg-zinc-900 border border-zinc-800"
              />
            ))}
          </div>
        ) : notices.length === 0 ? (
          <div className="py-6 text-center text-xs text-zinc-500">
            No active college emails found in your inbox.
          </div>
        ) : (
          <div className="space-y-2">
            {notices.map((notice) => {
              const isApplied = appliedNotices[notice.id]
              const userFeedback = feedbackMap[notice.id]
              const isExpanded = expandedId === notice.id

              return (
                <div
                  key={notice.id}
                  className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-3 transition-colors hover:border-zinc-700"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[11px] font-semibold text-zinc-200">
                          {notice.senderName || notice.subjectCode}
                        </span>
                        <span className="text-[10px] text-zinc-500">
                          • {notice.category}
                        </span>
                      </div>

                      <div className="text-xs text-zinc-300 font-medium leading-snug">
                        {notice.subject}
                      </div>

                      {notice.actionableSummary && (
                        <p className="text-[11px] text-zinc-400 pt-0.5 line-clamp-2">
                          {notice.actionableSummary}
                        </p>
                      )}

                      {isExpanded && notice.snippet && (
                        <p className="text-[11px] text-zinc-500 pt-1 font-mono leading-relaxed border-t border-zinc-800/60 mt-1">
                          {notice.snippet}
                        </p>
                      )}
                    </div>

                    <div className="shrink-0 flex items-center gap-1.5">
                      {notice.scheduleUpdate && (
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
                            "Apply"
                          )}
                        </button>
                      )}

                      <button
                        onClick={() => setExpandedId(isExpanded ? null : notice.id)}
                        className="p-1 rounded text-zinc-500 hover:text-zinc-300"
                        title={isExpanded ? "Collapse" : "Expand"}
                      >
                        {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                      </button>

                      <button
                        title="Irrelevant"
                        onClick={() => handleFeedback(notice.id, notice.subject, "spam")}
                        className={`p-1 rounded transition-colors ${
                          userFeedback === "spam"
                            ? "text-zinc-300 bg-zinc-800"
                            : "text-zinc-600 hover:text-zinc-400"
                        }`}
                      >
                        <ThumbsDown className="h-3 w-3" />
                      </button>
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
