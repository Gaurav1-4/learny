"use client"

import { useState } from "react"
import Link from "next/link"
import { FileText, ArrowRight, User } from "lucide-react"

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

export function CourseCards({ courses }: CourseCardsProps) {
  const [sortBy, setSortBy] = useState<"assignments" | "name" | "priority">("priority")

  const sortedCourses = [...courses].sort((a, b) => {
    if (sortBy === "assignments") {
      return b.assignmentsCount - a.assignmentsCount
    }
    if (sortBy === "name") {
      return a.name.localeCompare(b.name)
    }
    if (b.assignmentsCount !== a.assignmentsCount) {
      return b.assignmentsCount - a.assignmentsCount
    }
    return a.name.localeCompare(b.name)
  })

  return (
    <div className="space-y-3">
      {/* Header bar */}
      <div className="flex items-center justify-between text-xs text-zinc-400">
        <span className="font-medium text-zinc-300">
          Courses ({sortedCourses.length})
        </span>
        <div className="flex items-center gap-1 rounded-lg bg-zinc-900 border border-zinc-800 p-0.5">
          <button
            onClick={() => setSortBy("priority")}
            className={`rounded-md px-2 py-0.5 text-xs font-medium transition-colors ${
              sortBy === "priority"
                ? "bg-zinc-800 text-white"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            Priority
          </button>
          <button
            onClick={() => setSortBy("assignments")}
            className={`rounded-md px-2 py-0.5 text-xs font-medium transition-colors ${
              sortBy === "assignments"
                ? "bg-zinc-800 text-white"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            Workload
          </button>
          <button
            onClick={() => setSortBy("name")}
            className={`rounded-md px-2 py-0.5 text-xs font-medium transition-colors ${
              sortBy === "name"
                ? "bg-zinc-800 text-white"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            A–Z
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid gap-3 sm:grid-cols-2">
        {sortedCourses.map((course) => {
          return (
            <Link
              key={course.id}
              href={`/courses/${course.id}`}
              className="group flex flex-col justify-between rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 transition-all hover:border-zinc-700 hover:bg-zinc-900/70"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-sm font-semibold tracking-tight text-white group-hover:text-zinc-200 transition-colors line-clamp-2 leading-snug">
                    {course.name}
                  </h3>
                  <ArrowRight className="h-4 w-4 text-zinc-500 transition-transform group-hover:translate-x-0.5 group-hover:text-white shrink-0 mt-0.5" />
                </div>

                {course.section && (
                  <span className="inline-block text-[11px] text-zinc-400">
                    {course.section}
                  </span>
                )}
              </div>

              <div className="mt-4 border-t border-zinc-800/80 pt-3 flex items-center justify-between text-xs text-zinc-400">
                <div className="flex items-center gap-1.5 truncate max-w-[60%]">
                  <User className="h-3.5 w-3.5 text-zinc-500 shrink-0" />
                  <span className="truncate">{course.teacherName || "Instructor"}</span>
                </div>

                <div className="flex items-center gap-1 text-[11px] text-zinc-400">
                  <FileText className="h-3 w-3 text-zinc-500" />
                  <span>{course.assignmentsCount} items</span>
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
