"use client"

import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Users, FileText, ArrowRight, Sparkles, BookOpen, Clock, Tag, Brain } from "lucide-react"

export interface Course {
  id: string
  name: string
  section: string
  teacherName: string
  assignmentsCount: number
}

interface CourseCardsProps {
  courses: Course[]
}

const GRADIENTS = [
  "from-indigo-600/20 via-zinc-900/90 to-purple-600/10 border-indigo-500/30 hover:border-indigo-400/60",
  "from-emerald-600/20 via-zinc-900/90 to-teal-600/10 border-emerald-500/30 hover:border-emerald-400/60",
  "from-violet-600/20 via-zinc-900/90 to-fuchsia-600/10 border-violet-500/30 hover:border-violet-400/60",
  "from-cyan-600/20 via-zinc-900/90 to-blue-600/10 border-cyan-500/30 hover:border-cyan-400/60",
  "from-amber-600/20 via-zinc-900/90 to-orange-600/10 border-amber-500/30 hover:border-amber-400/60",
  "from-rose-600/20 via-zinc-900/90 to-pink-600/10 border-rose-500/30 hover:border-rose-400/60",
]

function getCourseTrack(name: string): { track: string; color: string } {
  const lower = name.toLowerCase()
  if (lower.includes("dpp") || lower.includes("design") || lower.includes("vdc") || lower.includes("hci")) {
    return { track: "Design & UX Track", color: "bg-purple-500/15 text-purple-300 border-purple-500/30" }
  }
  if (lower.includes("dsa") || lower.includes("structure") || lower.includes("algorithm")) {
    return { track: "Core CS / Algorithms", color: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30" }
  }
  if (lower.includes("prog") || lower.includes("ap") || lower.includes("oop") || lower.includes("java")) {
    return { track: "Software Engineering", color: "bg-indigo-500/15 text-indigo-300 border-indigo-500/30" }
  }
  if (lower.includes("org") || lower.includes("arch") || lower.includes("hardware") || lower.includes("circuit")) {
    return { track: "Systems & Architecture", color: "bg-cyan-500/15 text-cyan-300 border-cyan-500/30" }
  }
  return { track: "IIITD CSD Core", color: "bg-zinc-800 text-zinc-300 border-zinc-700" }
}

export function CourseCards({ courses }: CourseCardsProps) {
  const [sortBy, setSortBy] = useState<"assignments" | "name" | "priority">("priority")

  const sortedCourses = [...courses].sort((a, b) => {
    if (sortBy === "assignments") {
      return b.assignmentsCount - a.assignmentsCount
    }
    if (sortBy === "name") {
      return a.name.localeCompare(b.name)
    }
    // Priority: Courses with coursework first, then DPP/Design, then alphabetical
    if (b.assignmentsCount !== a.assignmentsCount) {
      return b.assignmentsCount - a.assignmentsCount
    }
    return a.name.localeCompare(b.name)
  })

  return (
    <div className="space-y-4">
      {/* Sorting Tabs Bar */}
      <div className="flex items-center justify-between text-xs text-zinc-400">
        <span className="font-semibold text-zinc-300">
          Showing {sortedCourses.length} Subjects
        </span>
        <div className="flex items-center gap-1.5 rounded-xl bg-zinc-900 border border-zinc-800 p-1">
          <button
            onClick={() => setSortBy("priority")}
            className={`rounded-lg px-2.5 py-1 font-bold transition-all ${
              sortBy === "priority"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            Priority
          </button>
          <button
            onClick={() => setSortBy("assignments")}
            className={`rounded-lg px-2.5 py-1 font-bold transition-all ${
              sortBy === "assignments"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            Most Work
          </button>
          <button
            onClick={() => setSortBy("name")}
            className={`rounded-lg px-2.5 py-1 font-bold transition-all ${
              sortBy === "name"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            A-Z
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid gap-5 sm:grid-cols-2">
        {sortedCourses.map((course, idx) => {
          const gradientClass = GRADIENTS[idx % GRADIENTS.length]
          const trackInfo = getCourseTrack(course.name)

          return (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.04, duration: 0.3 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
            >
              <Link
                href={`/courses/${course.id}`}
                className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl sm:rounded-3xl border bg-gradient-to-br p-4 sm:p-6 shadow-lg backdrop-blur-xl transition-all duration-300 ${gradientClass}`}
              >
                {/* Header */}
                <div className="space-y-2.5 sm:space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${trackInfo.color}`}
                    >
                      <Tag className="h-3 w-3" />
                      {trackInfo.track}
                    </span>
                    <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-xl bg-white/5 text-zinc-400 transition-transform group-hover:translate-x-1 group-hover:text-white">
                      <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    </div>
                  </div>

                  <h3 className="text-base sm:text-xl font-extrabold tracking-tight text-white group-hover:text-indigo-200 transition-colors line-clamp-2 leading-snug">
                    {course.name}
                  </h3>
                </div>

                {/* Footer info */}
                <div className="mt-6 border-t border-white/5 pt-4">
                  <div className="flex items-center justify-between text-xs text-zinc-400 font-medium">
                    <div className="flex items-center gap-2 truncate max-w-[55%]">
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-zinc-300 font-bold text-[10px]">
                        {course.teacherName[0] || "I"}
                      </div>
                      <span className="truncate">{course.teacherName}</span>
                    </div>

                    <div className="flex items-center gap-1.5 rounded-lg bg-white/5 px-2.5 py-1 text-zinc-300 font-semibold text-[11px]">
                      <FileText className="h-3.5 w-3.5 text-indigo-400" />
                      <span>{course.assignmentsCount} assignments</span>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
