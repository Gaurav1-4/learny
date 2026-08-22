"use client"

import { useState, useEffect } from "react"
import { Plus, Trash2, Calculator as CalcIcon } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

type Grade = "O" | "A+" | "A" | "B+" | "B" | "C" | "P" | "F" | ""

interface CourseEntry {
  id: string
  name: string
  credits: number | ""
  grade: Grade
}

interface Semester {
  id: string
  name: string
  courses: CourseEntry[]
}

const GRADE_POINTS: Record<string, number> = {
  "O": 10,
  "A+": 9,
  "A": 8,
  "B+": 7,
  "B": 6,
  "C": 5,
  "P": 4,
  "F": 0,
}

export function GpaCalculator() {
  const [semesters, setSemesters] = useState<Semester[]>([
    {
      id: "sem-1",
      name: "Semester 1",
      courses: [
        { id: "c1-1", name: "Intro to Programming", credits: 4, grade: "B+" },
        { id: "c1-2", name: "HCI", credits: 4, grade: "A+" },
        { id: "c1-3", name: "Linear Algebra", credits: 4, grade: "A" },
        { id: "c1-4", name: "Communication Skills", credits: 4, grade: "A+" },
        { id: "c1-5", name: "Digital Circuits", credits: 4, grade: "O" },
      ],
    },
    {
      id: "sem-2",
      name: "Semester 2",
      courses: [
        { id: "c2-1", name: "Data Structures & Algorithms", credits: 4, grade: "A+" },
        { id: "c2-2", name: "Computer Organization", credits: 4, grade: "A+" },
        { id: "c2-3", name: "Probability & Statistics", credits: 4, grade: "A+" },
        { id: "c2-4", name: "Intro to Engineering Design", credits: 4, grade: "A+" },
        { id: "c2-5", name: "SSH Elective", credits: 4, grade: "A+" },
      ],
    },
  ])

  // Load from local storage
  useEffect(() => {
    const saved = localStorage.getItem("learny-gpa-data")
    if (saved) {
      try {
        let parsed = JSON.parse(saved)
        // Migration: If they have the old generic empty template, overwrite with real grades
        if (parsed.length === 1 && parsed[0].courses && parsed[0].courses[0].name === "") {
          parsed = semesters // Use the newly seeded real grades
          localStorage.setItem("learny-gpa-data", JSON.stringify(parsed))
        }
        setSemesters(parsed)
      } catch (e) {
        console.error("Failed to parse GPA data", e)
      }
    }
  }, [])

  // Save to local storage
  useEffect(() => {
    localStorage.setItem("learny-gpa-data", JSON.stringify(semesters))
  }, [semesters])

  const addSemester = () => {
    setSemesters([
      ...semesters,
      {
        id: `sem-${Date.now()}`,
        name: `Semester ${semesters.length + 1}`,
        courses: Array.from({ length: 5 }).map((_, i) => ({
          id: `course-${Date.now()}-${i}`,
          name: "",
          credits: "",
          grade: "",
        })),
      },
    ])
  }

  const addCourse = (semId: string) => {
    setSemesters(semesters.map(sem => {
      if (sem.id === semId) {
        return {
          ...sem,
          courses: [
            ...sem.courses,
            { id: `course-${Date.now()}`, name: "", credits: "", grade: "" }
          ]
        }
      }
      return sem
    }))
  }

  const updateCourse = (semId: string, courseId: string, field: keyof CourseEntry, value: any) => {
    setSemesters(semesters.map(sem => {
      if (sem.id === semId) {
        return {
          ...sem,
          courses: sem.courses.map(course => {
            if (course.id === courseId) {
              return { ...course, [field]: value }
            }
            return course
          })
        }
      }
      return sem
    }))
  }

  const removeCourse = (semId: string, courseId: string) => {
    setSemesters(semesters.map(sem => {
      if (sem.id === semId) {
        return {
          ...sem,
          courses: sem.courses.filter(course => course.id !== courseId)
        }
      }
      return sem
    }))
  }

  const calculateSgpa = (courses: CourseEntry[]) => {
    let totalCredits = 0
    let earnedPoints = 0

    courses.forEach(course => {
      if (course.credits !== "" && course.grade && GRADE_POINTS[course.grade] !== undefined) {
        totalCredits += Number(course.credits)
        earnedPoints += Number(course.credits) * GRADE_POINTS[course.grade]
      }
    })

    return totalCredits > 0 ? (earnedPoints / totalCredits).toFixed(2) : "0.00"
  }

  const calculateCgpa = () => {
    let totalCredits = 0
    let earnedPoints = 0

    semesters.forEach(sem => {
      sem.courses.forEach(course => {
        if (course.credits !== "" && course.grade && GRADE_POINTS[course.grade] !== undefined) {
          totalCredits += Number(course.credits)
          earnedPoints += Number(course.credits) * GRADE_POINTS[course.grade]
        }
      })
    })

    return totalCredits > 0 ? (earnedPoints / totalCredits).toFixed(2) : "0.00"
  }

  return (
    <div className="space-y-6">
      <Card className="bg-zinc-950 border-zinc-800">
        <CardContent className="flex items-center justify-between p-6">
          <div>
            <h2 className="text-sm font-medium text-zinc-400">Cumulative GPA (CGPA)</h2>
            <div className="text-4xl font-bold mt-1 text-zinc-100">{calculateCgpa()}</div>
          </div>
          <CalcIcon className="h-12 w-12 text-zinc-800" />
        </CardContent>
      </Card>

      {semesters.map((semester) => (
        <Card key={semester.id} className="border-zinc-800 bg-zinc-900">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <div>
              <CardTitle>{semester.name}</CardTitle>
              <CardDescription>SGPA: {calculateSgpa(semester.courses)}</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={() => addCourse(semester.id)}>
              <Plus className="mr-2 h-4 w-4" /> Add Course
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="grid grid-cols-[1fr_100px_100px_40px] gap-3 text-sm font-medium text-zinc-400 px-1">
                <div>Course Name</div>
                <div>Credits</div>
                <div>Grade</div>
                <div></div>
              </div>
              
              {semester.courses.map((course) => (
                <div key={course.id} className="grid grid-cols-[1fr_100px_100px_40px] gap-3 items-center">
                  <Input 
                    placeholder="e.g. Data Structures" 
                    value={course.name}
                    onChange={(e) => updateCourse(semester.id, course.id, "name", e.target.value)}
                  />
                  <Input 
                    type="number" 
                    min="1" 
                    max="10"
                    placeholder="Cr" 
                    value={course.credits}
                    onChange={(e) => updateCourse(semester.id, course.id, "credits", e.target.value ? Number(e.target.value) : "")}
                  />
                  <select
                    className="flex h-10 w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 ring-offset-zinc-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-300"
                    value={course.grade}
                    onChange={(e) => updateCourse(semester.id, course.id, "grade", e.target.value as Grade)}
                  >
                    <option value="" disabled>Grade</option>
                    <option value="O">O (10)</option>
                    <option value="A+">A+ (9)</option>
                    <option value="A">A (8)</option>
                    <option value="B+">B+ (7)</option>
                    <option value="B">B (6)</option>
                    <option value="C">C (5)</option>
                    <option value="P">P (4)</option>
                    <option value="F">F (0)</option>
                  </select>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-zinc-500 hover:text-red-400 hover:bg-zinc-800"
                    onClick={() => removeCourse(semester.id, course.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}

      <Button onClick={addSemester} className="w-full border-dashed" variant="outline">
        <Plus className="mr-2 h-4 w-4" /> Add Another Semester
      </Button>
    </div>
  )
}
