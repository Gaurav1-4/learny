"use client"

import Link from "next/link"
import { Users, FileText } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

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
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {courses.map((course) => (
        <Link key={course.id} href={`/courses/${course.id}`}>
          <Card className="h-full transition-colors hover:bg-zinc-800/50">
            <CardHeader className="pb-3">
              <CardTitle className="line-clamp-1">{course.name}</CardTitle>
              <CardDescription>Section {course.section}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between text-sm text-zinc-400">
                <div className="flex items-center gap-1.5">
                  <Users className="h-4 w-4" />
                  <span className="line-clamp-1">{course.teacherName}</span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <FileText className="h-4 w-4" />
                  <span>{course.assignmentsCount} assignments</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  )
}
