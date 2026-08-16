"use client"

import { BookOpen, ClipboardList, Clock, CheckCircle2 } from "lucide-react"

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
      sub: "Active subjects",
      icon: BookOpen,
    },
    {
      label: "Pending Work",
      val: pendingCount,
      sub: "Assignments due",
      icon: ClipboardList,
    },
    {
      label: "Upcoming Deadlines",
      val: upcomingCount,
      sub: "This semester",
      icon: Clock,
    },
    {
      label: "Continuous Eval",
      val: coursesCount > 0 ? "Active" : "N/A",
      sub: "Evaluation tracked",
      icon: CheckCircle2,
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {items.map((item) => (
        <div
          key={item.label}
          className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 transition-colors hover:border-zinc-700"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-400 truncate pr-1">{item.label}</span>
            <item.icon className="h-4 w-4 text-zinc-500 shrink-0" />
          </div>

          <div className="mt-3">
            <div className="text-2xl font-bold tracking-tight text-white">{item.val}</div>
            <p className="text-[11px] text-zinc-500 font-medium truncate mt-0.5">{item.sub}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
