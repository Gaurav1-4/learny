"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Users, FileText, ArrowRight, Sparkles, BookOpen, Clock } from "lucide-react"

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

export function CourseCards({ courses }: CourseCardsProps) {
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      {courses.map((course, idx) => {
        const gradientClass = GRADIENTS[idx % GRADIENTS.length]

        return (
          <motion.div
            key={course.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05, duration: 0.3 }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
          >
            <Link
              href={`/courses/${course.id}`}
              className={`group relative flex flex-col justify-between overflow-hidden rounded-3xl border bg-gradient-to-br p-6 shadow-lg backdrop-blur-xl transition-all duration-300 ${gradientClass}`}
            >
              {/* Header */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/5 border border-white/10 px-2.5 py-1 text-[11px] font-bold text-zinc-300 backdrop-blur-sm">
                    <BookOpen className="h-3 w-3 text-indigo-400" />
                    Section {course.section || "General"}
                  </span>
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/5 text-zinc-400 transition-transform group-hover:translate-x-1 group-hover:text-white">
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </div>

                <h3 className="text-xl font-extrabold tracking-tight text-white group-hover:text-indigo-200 transition-colors line-clamp-2 leading-snug">
                  {course.name}
                </h3>
              </div>

              {/* Footer info */}
              <div className="mt-6 border-t border-white/5 pt-4">
                <div className="flex items-center justify-between text-xs text-zinc-400 font-medium">
                  <div className="flex items-center gap-2 truncate max-w-[60%]">
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
  )
}
