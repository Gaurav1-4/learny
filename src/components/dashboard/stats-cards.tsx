"use client"

import { motion } from "framer-motion"
import { BookOpen, ClipboardList, Clock, Sparkles } from "lucide-react"

export function StatsCards({
  coursesCount,
  pendingCount,
  upcomingCount,
  averageGrade,
}: {
  coursesCount: number
  pendingCount: number
  upcomingCount: number
  averageGrade: string
}) {
  const items = [
    {
      label: "Enrolled Courses",
      val: coursesCount,
      sub: "Active Classroom subjects",
      icon: BookOpen,
      color: "text-indigo-400",
      bg: "bg-indigo-500/10 border-indigo-500/20",
      glow: "from-indigo-600/15 via-zinc-900/90 to-zinc-900",
    },
    {
      label: "Pending Work",
      val: pendingCount,
      sub: "Assignments in progress",
      icon: ClipboardList,
      color: "text-amber-400",
      bg: "bg-amber-500/10 border-amber-500/20",
      glow: "from-amber-600/15 via-zinc-900/90 to-zinc-900",
    },
    {
      label: "Upcoming Deadlines",
      val: upcomingCount,
      sub: "Due within this semester",
      icon: Clock,
      color: "text-rose-400",
      bg: "bg-rose-500/10 border-rose-500/20",
      glow: "from-rose-600/15 via-zinc-900/90 to-zinc-900",
    },
    {
      label: "Evaluation Readiness",
      val: coursesCount > 0 ? "100%" : "N/A",
      sub: "Continuous assessment active",
      icon: Sparkles,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10 border-emerald-500/20",
      glow: "from-emerald-600/15 via-zinc-900/90 to-zinc-900",
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {items.map((item, idx) => (
        <motion.div
          key={item.label}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.05, duration: 0.3 }}
          className={`relative overflow-hidden rounded-2xl sm:rounded-3xl border border-white/5 bg-gradient-to-br p-3.5 sm:p-6 shadow-md backdrop-blur-xl transition-all hover:border-white/15 ${item.glow}`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-semibold text-zinc-400 truncate pr-1">{item.label}</span>
            <div className={`flex h-7 w-7 sm:h-10 sm:w-10 items-center justify-center rounded-xl sm:rounded-2xl border shrink-0 ${item.bg} ${item.color}`}>
              <item.icon className="h-3.5 w-3.5 sm:h-5 sm:w-5" />
            </div>
          </div>

          <div className="mt-2.5 sm:mt-4 space-y-0.5 sm:space-y-1">
            <div className="text-xl sm:text-3xl font-black tracking-tight text-white">{item.val}</div>
            <p className="text-[10px] sm:text-[11px] text-zinc-500 font-medium truncate">{item.sub}</p>
          </div>
        </motion.div>
      ))}
    </div>
  )
}
