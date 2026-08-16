"use client"

import { useState } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { formatDistanceToNow, isPast, format } from "date-fns"
import { Calendar, Clock, CheckCircle2, ArrowRight, AlertCircle } from "lucide-react"

type Status = "due" | "overdue" | "submitted"

export interface Deadline {
  id: string
  courseName: string
  title: string
  dueDate: Date
  status: Status
}

interface DeadlineListProps {
  deadlines: Deadline[]
}

export function DeadlineList({ deadlines }: DeadlineListProps) {
  const [filter, setFilter] = useState<"upcoming" | "overdue" | "all">("upcoming")
  const now = new Date()

  // Strict temporal filtering based on current timestamp
  const upcomingDeadlines = deadlines.filter((d) => d.dueDate >= now)
  const overdueDeadlines = deadlines.filter((d) => d.dueDate < now)

  // Sort upcoming ascending (soonest first), overdue descending (most recently passed first)
  upcomingDeadlines.sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())
  overdueDeadlines.sort((a, b) => b.dueDate.getTime() - a.dueDate.getTime())

  const displayedList =
    filter === "upcoming"
      ? upcomingDeadlines
      : filter === "overdue"
      ? overdueDeadlines
      : [...upcomingDeadlines, ...overdueDeadlines]

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 overflow-hidden">
      {/* Header & Filter Controls */}
      <div className="p-3.5 sm:p-4 border-b border-zinc-800 bg-zinc-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-zinc-400" />
          <h3 className="text-xs font-semibold text-zinc-200">
            {filter === "upcoming"
              ? "Upcoming Deadlines"
              : filter === "overdue"
              ? "Past & Overdue Deadlines"
              : "All Deadlines"}
          </h3>
        </div>

        <div className="flex items-center gap-2">
          {/* Segmented Filter */}
          <div className="flex rounded-lg bg-zinc-950 p-0.5 border border-zinc-800 text-xs">
            <button
              onClick={() => setFilter("upcoming")}
              className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-colors ${
                filter === "upcoming"
                  ? "bg-zinc-800 text-white font-semibold"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              Upcoming ({upcomingDeadlines.length})
            </button>

            {overdueDeadlines.length > 0 && (
              <button
                onClick={() => setFilter("overdue")}
                className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-colors ${
                  filter === "overdue"
                    ? "bg-zinc-800 text-white font-semibold"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                Overdue ({overdueDeadlines.length})
              </button>
            )}

            <button
              onClick={() => setFilter("all")}
              className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-colors ${
                filter === "all"
                  ? "bg-zinc-800 text-white font-semibold"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              All ({deadlines.length})
            </button>
          </div>

          <Link
            href="/calendar"
            className="hidden sm:inline-flex items-center gap-1 text-[11px] font-medium text-zinc-400 hover:text-white transition-colors ml-1"
          >
            <span>Calendar</span>
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </div>

      {/* List Content */}
      <div className="p-3.5 sm:p-4 space-y-2">
        <AnimatePresence mode="wait">
          {displayedList.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-8 text-center"
            >
              <CheckCircle2 className="h-7 w-7 text-zinc-500 mx-auto mb-2" />
              <p className="text-xs font-semibold text-zinc-300">
                {filter === "upcoming"
                  ? "No upcoming deadlines!"
                  : filter === "overdue"
                  ? "No overdue submissions!"
                  : "No deadlines found"}
              </p>
              <p className="text-[11px] text-zinc-500 mt-0.5">
                {filter === "upcoming"
                  ? "You have completed all active assignments on your schedule."
                  : "All assignments are up to date."}
              </p>
            </motion.div>
          ) : (
            <motion.div
              key={filter}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
              className="space-y-2"
            >
              {displayedList.map((item) => {
                const past = isPast(item.dueDate)

                return (
                  <div
                    key={item.id}
                    className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-3 transition-colors hover:border-zinc-700 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
                  >
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="rounded bg-zinc-800 px-2 py-0.5 text-[10px] font-medium text-zinc-300">
                          {item.courseName}
                        </span>

                        {past ? (
                          <span className="rounded bg-red-950/40 text-red-400 border border-red-800/40 px-1.5 py-0.5 text-[10px] font-medium">
                            Overdue
                          </span>
                        ) : (
                          <span className="rounded bg-zinc-800 text-zinc-200 border border-zinc-700 px-1.5 py-0.5 text-[10px] font-medium">
                            Due in {formatDistanceToNow(item.dueDate, { addSuffix: false })}
                          </span>
                        )}
                      </div>

                      <h4 className="text-xs font-semibold text-white truncate">
                        {item.title}
                      </h4>
                    </div>

                    <div className="shrink-0 flex items-center justify-between sm:justify-end gap-3 text-[11px] text-zinc-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-zinc-500" />
                        {format(item.dueDate, "MMM d, h:mm a")}
                      </span>

                      {past && (
                        <span className="text-[10px] text-zinc-500">
                          ({formatDistanceToNow(item.dueDate, { addSuffix: true })})
                        </span>
                      )}
                    </div>
                  </div>
                )
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
