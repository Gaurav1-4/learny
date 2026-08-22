"use client"

import { useState, useEffect } from "react"
import {
  BookOpen,
  ChevronDown,
  ChevronRight,
  TrendingUp,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { pushToFirestore } from "@/lib/firebase/firestore-sync"

export interface EvaluationItem {
  id: string
  name: string
  maxMarks: number
  marksObtained: number
  weightPercent: number
}

export interface SubjectEvaluation {
  courseId: string
  courseName: string
  credits: number
  targetGrade?: string
  evaluations: EvaluationItem[]
}

export interface PreviousSemester {
  id: string
  name: string
  totalCredits: number
  sgpa: number
}

const GRADE_TABLE: { grade: string; minPercent: number; points: number }[] = [
  { grade: "O", minPercent: 90, points: 10 },
  { grade: "A+", minPercent: 80, points: 9 },
  { grade: "A", minPercent: 70, points: 8 },
  { grade: "B+", minPercent: 60, points: 7 },
  { grade: "B", minPercent: 55, points: 6 },
  { grade: "C", minPercent: 50, points: 5 },
  { grade: "P", minPercent: 40, points: 4 },
  { grade: "F", minPercent: 0, points: 0 },
]

export function getGradeFromPercent(percent: number): { grade: string; points: number } {
  for (const g of GRADE_TABLE) {
    if (percent >= g.minPercent) {
      return { grade: g.grade, points: g.points }
    }
  }
  return { grade: "F", points: 0 }
}

export const DEFAULT_IIITD_SEM3_EVALS: SubjectEvaluation[] = [
  {
    courseId: "iiitd-csd-m3",
    courseName: "Math III: Applied Mathematics (MTH201 / Thomas' Calculus)",
    credits: 4,
    evaluations: [
      { id: "m3-1", name: "Weekly Tutorial Quizzes (n-2 policy: best 10 of 12 @ 3%; Tuesdays 1:30 PM)", maxMarks: 30, marksObtained: 0, weightPercent: 30 },
      { id: "m3-2", name: "Mid-Semester Exam", maxMarks: 30, marksObtained: 0, weightPercent: 30 },
      { id: "m3-3", name: "End-Semester Exam", maxMarks: 40, marksObtained: 0, weightPercent: 40 },
    ],
  },
  {
    courseId: "iiitd-csd-os",
    courseName: "Operating Systems (OS / CSE231 - Section A)",
    credits: 4,
    evaluations: [
      { id: "os-1", name: "Quizzes (10% with N-1 policy; lecture hours ~20 mins)", maxMarks: 10, marksObtained: 0, weightPercent: 10 },
      { id: "os-2", name: "Take Home Assignments (No N-1 policy)", maxMarks: 35, marksObtained: 0, weightPercent: 35 },
      { id: "os-3", name: "Mid-Semester Exam", maxMarks: 20, marksObtained: 0, weightPercent: 20 },
      { id: "os-4", name: "End-Semester Exam", maxMarks: 35, marksObtained: 0, weightPercent: 35 },
    ],
  },
  {
    courseId: "iiitd-csd-ap",
    courseName: "Advanced Programming (AP / CSE201)",
    credits: 4,
    evaluations: [
      { id: "ap-1", name: "Assignments (Total 4 assignments @ 7.5%)", maxMarks: 30, marksObtained: 0, weightPercent: 30 },
      { id: "ap-2", name: "Quizzes (Best 5 out of 6; 3 pre-midsem, 3 post-midsem)", maxMarks: 10, marksObtained: 0, weightPercent: 10 },
      { id: "ap-3", name: "Midsem Exam", maxMarks: 25, marksObtained: 0, weightPercent: 25 },
      { id: "ap-4", name: "Final Exam", maxMarks: 35, marksObtained: 0, weightPercent: 35 },
    ],
  },
  {
    courseId: "iiitd-csd-dpp",
    courseName: "DPP (Design Processes & Perspectives)",
    credits: 4,
    evaluations: [
      { id: "dpp-1", name: "Assignments (Individual) - 4 tasks @ 2.5%", maxMarks: 10, marksObtained: 0, weightPercent: 10 },
      { id: "dpp-2", name: "Assignments (Group) - 2 tasks @ 5%", maxMarks: 10, marksObtained: 0, weightPercent: 10 },
      { id: "dpp-3", name: "Mid-term Exam / Jury", maxMarks: 20, marksObtained: 0, weightPercent: 20 },
      { id: "dpp-4", name: "Class Participation and Attendance", maxMarks: 10, marksObtained: 0, weightPercent: 10 },
      { id: "dpp-5", name: "Project (Design Process & Prototype)", maxMarks: 20, marksObtained: 0, weightPercent: 20 },
      { id: "dpp-6", name: "Maintenance of a Journal", maxMarks: 10, marksObtained: 0, weightPercent: 10 },
      { id: "dpp-7", name: "End-Sem Exam / Jury", maxMarks: 20, marksObtained: 0, weightPercent: 20 },
    ],
  },
  {
    courseId: "iiitd-csd-rmssd-1",
    courseName: "RMSSD Part 1: Pre-Midsem Module (SSH201)",
    credits: 2,
    evaluations: [
      { id: "rmssd1-1", name: "Tutorial Exercises (As per schedule)", maxMarks: 40, marksObtained: 0, weightPercent: 40 },
      { id: "rmssd1-2", name: "Home Assignment 1 (Deadline: 7th Sep, 11:59 PM)", maxMarks: 20, marksObtained: 0, weightPercent: 20 },
      { id: "rmssd1-3", name: "Mid-Semester Exam", maxMarks: 40, marksObtained: 0, weightPercent: 40 },
    ],
  },
  {
    courseId: "iiitd-csd-rmssd-2",
    courseName: "RMSSD Part 2: Post-Midsem Module (SSH201)",
    credits: 2,
    evaluations: [
      { id: "rmssd2-1", name: "Tutorial Exercises & Qualitative Labs", maxMarks: 40, marksObtained: 0, weightPercent: 40 },
      { id: "rmssd2-2", name: "Home Assignment / Fieldwork", maxMarks: 20, marksObtained: 0, weightPercent: 20 },
      { id: "rmssd2-3", name: "End-Semester Exam / Report", maxMarks: 40, marksObtained: 0, weightPercent: 40 },
    ],
  },
]

export function SubjectEvaluations() {
  const [subjectEvals, setSubjectEvals] = useState<SubjectEvaluation[]>(DEFAULT_IIITD_SEM3_EVALS)
  const [prevSemesters, setPrevSemesters] = useState<PreviousSemester[]>([
    { id: "sem-1", name: "Semester 1 (IP, HCI, LA, COM, DC)", totalCredits: 20, sgpa: 8.6 },
    { id: "sem-2", name: "Semester 2 (Winter)", totalCredits: 20, sgpa: 9.0 },
  ])
  const [expandedSubject, setExpandedSubject] = useState<string | null>(null)

  // Load saved marks from localStorage
  useEffect(() => {
    const savedSubjects = localStorage.getItem("learny_subject_evals_v3")
    if (savedSubjects) {
      try {
        const parsed = JSON.parse(savedSubjects)
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Merge saved marks into the canonical subject structure
          const merged = DEFAULT_IIITD_SEM3_EVALS.map(defaultSub => {
            const saved = parsed.find((s: SubjectEvaluation) => s.courseId === defaultSub.courseId)
            if (saved) {
              return {
                ...defaultSub,
                evaluations: defaultSub.evaluations.map(defEval => {
                  const savedEval = saved.evaluations?.find((e: EvaluationItem) => e.id === defEval.id)
                  return savedEval ? { ...defEval, marksObtained: savedEval.marksObtained } : defEval
                }),
              }
            }
            return defaultSub
          })
          setSubjectEvals(merged)
        }
      } catch (e) {
        console.error(e)
      }
    }

    const savedPrevSems = localStorage.getItem("learny_prev_semesters")
    if (savedPrevSems) {
      try {
        const parsed = JSON.parse(savedPrevSems)
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Only use if it looks like real data
          const hasRealData = parsed.some((s: PreviousSemester) => s.sgpa === 8.6 || s.sgpa === 9.0)
          if (hasRealData) {
            setPrevSemesters(parsed)
          }
        }
      } catch (e) {
        console.error(e)
      }
    }
  }, [])

  // Save to localStorage & Cloud
  useEffect(() => {
    localStorage.setItem("learny_subject_evals_v3", JSON.stringify(subjectEvals))
    if (subjectEvals.length > 0) {
      pushToFirestore({ subjectEvaluations: subjectEvals })
    }
  }, [subjectEvals])

  useEffect(() => {
    localStorage.setItem("learny_prev_semesters", JSON.stringify(prevSemesters))
    if (prevSemesters.length > 0) {
      pushToFirestore({ prevSemesters })
    }
  }, [prevSemesters])

  // Update only marksObtained for an evaluation item
  const handleUpdateMarks = (courseId: string, evalId: string, marks: number) => {
    setSubjectEvals((prev) =>
      prev.map((sub) => {
        if (sub.courseId === courseId) {
          return {
            ...sub,
            evaluations: sub.evaluations.map((ev) => {
              if (ev.id === evalId) {
                return { ...ev, marksObtained: marks }
              }
              return ev
            }),
          }
        }
        return sub
      })
    )
  }

  // CGPA from past semesters only (current sem is ongoing — don't include it)
  let pastTotalCredits = 0
  let pastTotalPoints = 0
  prevSemesters.forEach((sem) => {
    pastTotalCredits += Number(sem.totalCredits)
    pastTotalPoints += Number(sem.totalCredits) * Number(sem.sgpa)
  })
  const pastCGPA = pastTotalCredits > 0 ? (pastTotalPoints / pastTotalCredits).toFixed(2) : "—"

  return (
    <div className="space-y-8">
      {/* Past Semesters CGPA - compact banner */}
      <Card className="border-zinc-800 bg-zinc-950 p-5">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
              Cumulative CGPA (Sem 1 & 2)
            </span>
            <div className="text-3xl font-extrabold text-white mt-0.5">{pastCGPA}</div>
            <p className="text-xs text-zinc-500 mt-0.5">
              {pastTotalCredits} credits completed across {prevSemesters.length} semesters
            </p>
          </div>
          <TrendingUp className="h-8 w-8 text-zinc-800" />
        </div>
      </Card>

      {/* Subject Evaluation Cards */}
      <div className="space-y-4">
        <div>
          <h2 className="text-base font-bold text-zinc-100 flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-indigo-400" />
            Semester 3 — Evaluation Components
          </h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            {subjectEvals.length} subjects • {subjectEvals.reduce((sum, s) => sum + s.credits, 0)} credits registered
          </p>
        </div>

        <div className="space-y-3">
          {subjectEvals.map((sub) => {
            const isExpanded = expandedSubject === sub.courseId

            return (
              <Card
                key={sub.courseId}
                className="border-zinc-800 bg-zinc-900/80 overflow-hidden"
              >
                {/* Subject Header — click to expand */}
                <div
                  onClick={() => setExpandedSubject(isExpanded ? null : sub.courseId)}
                  className="flex items-center justify-between p-4 cursor-pointer hover:bg-zinc-800/30 transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-zinc-500 shrink-0">
                      {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </span>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-zinc-100 text-sm truncate">{sub.courseName}</h3>
                      <span className="text-[11px] text-zinc-500">
                        {sub.credits} credits • {sub.evaluations.length} components
                      </span>
                    </div>
                  </div>
                </div>

                {/* Expanded: Evaluation Table */}
                {isExpanded && (
                  <div className="border-t border-zinc-800 bg-zinc-950/60">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-zinc-800/60">
                            <th className="text-left text-[11px] font-semibold uppercase tracking-wider text-zinc-500 px-4 py-2.5">
                              Component
                            </th>
                            <th className="text-center text-[11px] font-semibold uppercase tracking-wider text-zinc-500 px-3 py-2.5 w-20">
                              Weight
                            </th>
                            <th className="text-center text-[11px] font-semibold uppercase tracking-wider text-zinc-500 px-3 py-2.5 w-20">
                              Max
                            </th>
                            <th className="text-center text-[11px] font-semibold uppercase tracking-wider text-zinc-500 px-3 py-2.5 w-24">
                              Obtained
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {sub.evaluations.map((ev) => (
                            <tr key={ev.id} className="border-b border-zinc-800/40 last:border-0">
                              <td className="px-4 py-2.5 text-zinc-300 text-xs leading-relaxed">
                                {ev.name}
                              </td>
                              <td className="px-3 py-2.5 text-center text-zinc-400 text-xs font-medium">
                                {ev.weightPercent}%
                              </td>
                              <td className="px-3 py-2.5 text-center text-zinc-400 text-xs font-medium">
                                {ev.maxMarks}
                              </td>
                              <td className="px-3 py-2.5 text-center">
                                <Input
                                  type="number"
                                  min={0}
                                  max={ev.maxMarks}
                                  value={ev.marksObtained || ""}
                                  onChange={(e) =>
                                    handleUpdateMarks(sub.courseId, ev.id, Number(e.target.value))
                                  }
                                  placeholder="—"
                                  className="h-7 w-16 mx-auto bg-zinc-900 border-zinc-700 text-xs text-center"
                                />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </Card>
            )
          })}
        </div>
      </div>

      {/* Previous Semesters — read-only summary */}
      <Card className="border-zinc-800 bg-zinc-900/80">
        <CardHeader className="pb-3 border-b border-zinc-800">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-emerald-400" />
            Previous Semesters
          </CardTitle>
          <CardDescription className="text-xs text-zinc-500">
            Completed semesters contributing to your CGPA
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4">
          <div className="space-y-2">
            {prevSemesters.map((sem) => (
              <div
                key={sem.id}
                className="flex items-center justify-between py-2.5 px-3 rounded-lg bg-zinc-950/60 border border-zinc-800/50"
              >
                <div>
                  <div className="text-sm font-medium text-zinc-200">{sem.name}</div>
                  <div className="text-[11px] text-zinc-500">{sem.totalCredits} credits</div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-emerald-400">{sem.sgpa}</div>
                  <div className="text-[11px] text-zinc-500">SGPA</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
