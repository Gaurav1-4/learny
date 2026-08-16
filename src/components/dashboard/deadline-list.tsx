"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { formatDistanceToNow, isPast, format } from "date-fns"
import { Calendar, Clock, CheckCircle2, AlertTriangle, ArrowRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"

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
  const sortedDeadlines = [...deadlines].sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())

  return (
    <div className="relative flex flex-col overflow-hidden rounded-3xl border border-white/5 bg-zinc-900/80 p-6 shadow-xl backdrop-blur-2xl">
      <div className="flex items-center justify-between pb-4 border-b border-white/5">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-indigo-400" />
          <h3 className="text-sm font-bold text-white">Upcoming Deadlines</h3>
        </div>
        <Link
          href="/calendar"
          className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-400 hover:text-indigo-300 transition-colors"
        >
          <span>Calendar</span>
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      <div className="mt-4 flex-1 overflow-y-auto max-h-[380px] pr-1 space-y-3">
        {sortedDeadlines.length === 0 ? (
          <div className="flex min-h-[200px] flex-col items-center justify-center text-center p-6">
            <CheckCircle2 className="h-8 w-8 text-emerald-400/80 mb-2" />
            <p className="text-xs font-bold text-zinc-300">All caught up!</p>
            <p className="text-[11px] text-zinc-500 mt-0.5">No pending deadlines on your radar.</p>
          </div>
        ) : (
          sortedDeadlines.map((deadline, idx) => {
            const past = isPast(deadline.dueDate)

            return (
              <motion.div
                key={deadline.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.04, duration: 0.2 }}
                className="group relative rounded-2xl border border-white/5 bg-zinc-950/60 p-4 transition-all hover:border-indigo-500/30 hover:bg-zinc-950/90"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate rounded-md bg-white/5 px-2 py-0.5 text-[10px] font-bold text-zinc-300 border border-white/10 max-w-[65%]">
                    {deadline.courseName}
                  </span>

                  {past ? (
                    <Badge className="bg-red-500/15 text-red-400 border-red-500/30 text-[10px] font-bold">
                      Overdue
                    </Badge>
                  ) : (
                    <Badge className="bg-indigo-500/15 text-indigo-400 border-indigo-500/30 text-[10px] font-bold">
                      Due Soon
                    </Badge>
                  )}
                </div>

                <h4 className="mt-2 text-xs font-bold text-zinc-100 line-clamp-1 group-hover:text-indigo-200 transition-colors">
                  {deadline.title}
                </h4>

                <div className="mt-2 flex items-center justify-between text-[10px] text-zinc-400 font-medium">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3 text-zinc-500" />
                    {format(deadline.dueDate, "dd MMM, hh:mm a")}
                  </span>
                  <span className={past ? "text-red-400 font-bold" : "text-amber-400 font-semibold"}>
                    {past ? "Passed " : "in "}
                    {formatDistanceToNow(deadline.dueDate, { addSuffix: false })}
                  </span>
                </div>
              </motion.div>
            )
          })
        )}
      </div>
    </div>
  )
}
