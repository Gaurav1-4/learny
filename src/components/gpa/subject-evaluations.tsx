"use client"

import { useState, useEffect } from "react"
import {
  Plus,
  Trash2,
  Calculator,
  Award,
  BookOpen,
  ChevronDown,
  ChevronRight,
  TrendingUp,
  CheckCircle2,
  Edit3,
  Sparkles,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { ClassroomCourse } from "@/types"

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

export function SubjectEvaluations() {
  const [courses, setCourses] = useState<ClassroomCourse[]>([])
  const [subjectEvals, setSubjectEvals] = useState<SubjectEvaluation[]>([])
  const [prevSemesters, setPrevSemesters] = useState<PreviousSemester[]>([])
  const [expandedSubject, setExpandedSubject] = useState<string | null>(null)

  // 1. Load from localStorage
  useEffect(() => {
    const savedSubjects = localStorage.getItem("learny_subject_evaluations")
    const savedPrevSems = localStorage.getItem("learny_prev_semesters")

    if (savedSubjects) {
      try {
        setSubjectEvals(JSON.parse(savedSubjects))
      } catch (e) {
        console.error(e)
      }
    }
    if (savedPrevSems) {
      try {
        setPrevSemesters(JSON.parse(savedPrevSems))
      } catch (e) {
        console.error(e)
      }
    }
  }, [])

  // 2. Save to localStorage
  useEffect(() => {
    localStorage.setItem("learny_subject_evaluations", JSON.stringify(subjectEvals))
  }, [subjectEvals])

  useEffect(() => {
    localStorage.setItem("learny_prev_semesters", JSON.stringify(prevSemesters))
  }, [prevSemesters])

  // 3. Fetch courses from Google Classroom
  useEffect(() => {
    async function loadCourses() {
      try {
        const res = await fetch("/api/classroom/courses?state=ACTIVE")
        if (res.ok) {
          const data: ClassroomCourse[] = await res.json()
          setCourses(Array.isArray(data) ? data : [])

          // Initialize subject evaluation records for courses not yet created
          setSubjectEvals((existing) => {
            const updated = [...existing]
            data.forEach((course) => {
              const found = updated.find((s) => s.courseId === course.id)
              if (!found) {
                updated.push({
                  courseId: course.id,
                  courseName: course.name,
                  credits: 4,
                  evaluations: [
                    { id: `eval-${Date.now()}-1`, name: "Quiz / Tests", maxMarks: 20, marksObtained: 18, weightPercent: 15 },
                    { id: `eval-${Date.now()}-2`, name: "Assignments", maxMarks: 50, marksObtained: 45, weightPercent: 15 },
                    { id: `eval-${Date.now()}-3`, name: "Midsem Exam", maxMarks: 30, marksObtained: 24, weightPercent: 30 },
                    { id: `eval-${Date.now()}-4`, name: "Endsem Final Exam", maxMarks: 100, marksObtained: 85, weightPercent: 40 },
                  ],
                })
              }
            })
            return updated
          })

          if (data.length > 0 && !expandedSubject) {
            setExpandedSubject(data[0].id)
          }
        }
      } catch (e) {
        console.error(e)
      }
    }
    loadCourses()
  }, [])

  // Add Custom Subject Evaluation
  const handleAddCustomSubject = () => {
    const newId = `custom-subject-${Date.now()}`
    const newSub: SubjectEvaluation = {
      courseId: newId,
      courseName: `New Subject ${subjectEvals.length + 1}`,
      credits: 4,
      evaluations: [
        { id: `eval-${Date.now()}-1`, name: "Continuous Assessment", maxMarks: 50, marksObtained: 40, weightPercent: 40 },
        { id: `eval-${Date.now()}-2`, name: "Endsem Exam", maxMarks: 100, marksObtained: 80, weightPercent: 60 },
      ],
    }
    setSubjectEvals([...subjectEvals, newSub])
    setExpandedSubject(newId)
  }

  // Update Evaluation Item
  const handleUpdateEvaluation = (
    courseId: string,
    evalId: string,
    field: keyof EvaluationItem,
    value: string | number
  ) => {
    setSubjectEvals((prev) =>
      prev.map((sub) => {
        if (sub.courseId === courseId) {
          return {
            ...sub,
            evaluations: sub.evaluations.map((ev) => {
              if (ev.id === evalId) {
                return { ...ev, [field]: value }
              }
              return ev
            }),
          }
        }
        return sub
      })
    )
  }

  // Add Evaluation Item
  const handleAddEvaluationItem = (courseId: string) => {
    setSubjectEvals((prev) =>
      prev.map((sub) => {
        if (sub.courseId === courseId) {
          return {
            ...sub,
            evaluations: [
              ...sub.evaluations,
              {
                id: `eval-${Date.now()}`,
                name: "New Evaluation Component",
                maxMarks: 100,
                marksObtained: 80,
                weightPercent: 10,
              },
            ],
          }
        }
        return sub
      })
    )
  }

  // Remove Evaluation Item
  const handleRemoveEvaluationItem = (courseId: string, evalId: string) => {
    setSubjectEvals((prev) =>
      prev.map((sub) => {
        if (sub.courseId === courseId) {
          return {
            ...sub,
            evaluations: sub.evaluations.filter((ev) => ev.id !== evalId),
          }
        }
        return sub
      })
    )
  }

  // Update Subject Credits / Name
  const handleUpdateSubjectMeta = (courseId: string, field: "courseName" | "credits", val: any) => {
    setSubjectEvals((prev) =>
      prev.map((sub) => {
        if (sub.courseId === courseId) {
          return { ...sub, [field]: val }
        }
        return sub
      })
    )
  }

  // Calculate Subject Weighted Percentage & Projected Grade
  const calculateSubjectResult = (sub: SubjectEvaluation) => {
    let totalWeightedPercent = 0
    let totalWeight = 0

    sub.evaluations.forEach((ev) => {
      if (ev.maxMarks > 0) {
        const itemPercent = (Number(ev.marksObtained) / Number(ev.maxMarks)) * 100
        totalWeightedPercent += (itemPercent * Number(ev.weightPercent)) / 100
        totalWeight += Number(ev.weightPercent)
      }
    })

    const gradeInfo = getGradeFromPercent(totalWeightedPercent)
    return {
      percentage: totalWeightedPercent,
      totalWeight,
      grade: gradeInfo.grade,
      points: gradeInfo.points,
    }
  }

  // Calculate Current Semester SGPA
  let currentSemTotalCredits = 0
  let currentSemEarnedPoints = 0

  subjectEvals.forEach((sub) => {
    const res = calculateSubjectResult(sub)
    currentSemTotalCredits += Number(sub.credits)
    currentSemEarnedPoints += Number(sub.credits) * res.points
  })

  const currentSemesterSGPA =
    currentSemTotalCredits > 0 ? (currentSemEarnedPoints / currentSemTotalCredits).toFixed(2) : "0.00"

  // Previous Semester Handlers
  const handleAddPreviousSemester = () => {
    const newSem: PreviousSemester = {
      id: `prev-sem-${Date.now()}`,
      name: `Semester ${prevSemesters.length + 1}`,
      totalCredits: 22,
      sgpa: 9.0,
    }
    setPrevSemesters([...prevSemesters, newSem])
  }

  const handleUpdatePreviousSemester = (id: string, field: keyof PreviousSemester, val: any) => {
    setPrevSemesters(
      prevSemesters.map((s) => {
        if (s.id === id) {
          return { ...s, [field]: val }
        }
        return s
      })
    )
  }

  const handleRemovePreviousSemester = (id: string) => {
    setPrevSemesters(prevSemesters.filter((s) => s.id !== id))
  }

  // Combined Cumulative CGPA (Previous Semesters + Current Semester)
  let totalCumulativeCredits = currentSemTotalCredits
  let totalCumulativePoints = currentSemEarnedPoints

  prevSemesters.forEach((sem) => {
    totalCumulativeCredits += Number(sem.totalCredits)
    totalCumulativePoints += Number(sem.totalCredits) * Number(sem.sgpa)
  })

  const cumulativeCGPA =
    totalCumulativeCredits > 0 ? (totalCumulativePoints / totalCumulativeCredits).toFixed(2) : currentSemesterSGPA

  return (
    <div className="space-y-8">
      {/* Overview Metric Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-zinc-800 bg-zinc-950 p-6">
          <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
            Overall Cumulative CGPA
          </span>
          <div className="text-4xl font-extrabold text-white mt-1">{cumulativeCGPA}</div>
          <p className="text-xs text-zinc-400 mt-1">
            Across {prevSemesters.length + 1} total semesters ({totalCumulativeCredits} credits)
          </p>
        </Card>

        <Card className="border-zinc-800 bg-zinc-950 p-6">
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
            Current Semester SGPA
          </span>
          <div className="text-4xl font-extrabold text-emerald-400 mt-1">{currentSemesterSGPA}</div>
          <p className="text-xs text-zinc-400 mt-1">
            Calculated live from {subjectEvals.length} subject evaluation breakdowns
          </p>
        </Card>

        <Card className="border-zinc-800 bg-zinc-950 p-6">
          <span className="text-xs font-semibold uppercase tracking-wider text-purple-400">
            Total Subjects Evaluated
          </span>
          <div className="text-4xl font-extrabold text-purple-400 mt-1">{subjectEvals.length}</div>
          <p className="text-xs text-zinc-400 mt-1">{currentSemTotalCredits} credits registered this semester</p>
        </Card>
      </div>

      {/* SECTION 1: Subject-by-Subject Evaluation Breakdown */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-zinc-100 flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-indigo-400" />
              Subject Evaluation Components (Current Semester)
            </h2>
            <p className="text-xs text-zinc-400">
              Break down Quizzes, Midsems, Assignments, and Endsem weights for every subject to project exact grades.
            </p>
          </div>

          <Button
            size="sm"
            onClick={handleAddCustomSubject}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs"
          >
            <Plus className="h-4 w-4 mr-1" /> Add Subject
          </Button>
        </div>

        <div className="space-y-4">
          {subjectEvals.map((sub) => {
            const isExpanded = expandedSubject === sub.courseId
            const result = calculateSubjectResult(sub)

            return (
              <Card
                key={sub.courseId}
                className="border-zinc-800 bg-zinc-900/90 shadow-md overflow-hidden transition-all"
              >
                {/* Subject Header Banner */}
                <div
                  onClick={() => setExpandedSubject(isExpanded ? null : sub.courseId)}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-5 cursor-pointer hover:bg-zinc-800/40 transition-colors gap-4"
                >
                  <div className="flex items-center gap-3">
                    <button className="text-zinc-400 hover:text-zinc-200">
                      {isExpanded ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                    </button>
                    <div>
                      <h3 className="font-bold text-zinc-100 text-base">{sub.courseName}</h3>
                      <div className="flex items-center gap-3 text-xs text-zinc-400 mt-0.5">
                        <span>{sub.credits} Credits</span>
                        <span>•</span>
                        <span>{sub.evaluations.length} Components ({result.totalWeight}% total weight)</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 self-end sm:self-center">
                    <div className="text-right">
                      <div className="text-xs text-zinc-400">Projected Score</div>
                      <div className="text-lg font-extrabold text-zinc-100">{result.percentage.toFixed(1)}%</div>
                    </div>
                    <Badge className="bg-indigo-600 text-white font-bold text-sm px-3 py-1">
                      Grade {result.grade} ({result.points} pts)
                    </Badge>
                  </div>
                </div>

                {/* Expanded Evaluation Table */}
                {isExpanded && (
                  <div className="p-6 border-t border-zinc-800 bg-zinc-950/70 space-y-4 animate-in fade-in duration-150">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="grid grid-cols-2 gap-4 w-full sm:w-auto">
                        <div>
                          <Label className="text-[11px] text-zinc-400">Subject Name</Label>
                          <Input
                            value={sub.courseName}
                            onChange={(e) => handleUpdateSubjectMeta(sub.courseId, "courseName", e.target.value)}
                            className="h-8 bg-zinc-900 border-zinc-800 text-xs mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-[11px] text-zinc-400">Course Credits</Label>
                          <Input
                            type="number"
                            value={sub.credits}
                            onChange={(e) => handleUpdateSubjectMeta(sub.courseId, "credits", Number(e.target.value))}
                            className="h-8 bg-zinc-900 border-zinc-800 text-xs mt-1 w-24"
                          />
                        </div>
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAddEvaluationItem(sub.courseId)}
                        className="text-xs border-zinc-800 hover:bg-zinc-800"
                      >
                        <Plus className="h-3.5 w-3.5 mr-1" /> Add Component (e.g. Lab/Midsem)
                      </Button>
                    </div>

                    <div className="space-y-2 pt-2">
                      <div className="grid grid-cols-[1fr_90px_90px_90px_70px_40px] gap-3 px-2 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                        <div>Evaluation Component</div>
                        <div>Weight (%)</div>
                        <div>Max Marks</div>
                        <div>Obtained</div>
                        <div>Weighted %</div>
                        <div></div>
                      </div>

                      {sub.evaluations.map((ev) => {
                        const componentPct = ev.maxMarks > 0 ? (ev.marksObtained / ev.maxMarks) * 100 : 0
                        const weightedScore = (componentPct * ev.weightPercent) / 100

                        return (
                          <div
                            key={ev.id}
                            className="grid grid-cols-[1fr_90px_90px_90px_70px_40px] gap-3 items-center bg-zinc-900/60 p-2 rounded-lg border border-zinc-800/80"
                          >
                            <Input
                              value={ev.name}
                              onChange={(e) =>
                                handleUpdateEvaluation(sub.courseId, ev.id, "name", e.target.value)
                              }
                              placeholder="e.g. Midsem Exam"
                              className="h-8 bg-zinc-950 border-zinc-800 text-xs"
                            />
                            <Input
                              type="number"
                              value={ev.weightPercent || ""}
                              onChange={(e) =>
                                handleUpdateEvaluation(sub.courseId, ev.id, "weightPercent", Number(e.target.value))
                              }
                              placeholder="Weight %"
                              className="h-8 bg-zinc-950 border-zinc-800 text-xs"
                            />
                            <Input
                              type="number"
                              value={ev.maxMarks || ""}
                              onChange={(e) =>
                                handleUpdateEvaluation(sub.courseId, ev.id, "maxMarks", Number(e.target.value))
                              }
                              placeholder="Max"
                              className="h-8 bg-zinc-950 border-zinc-800 text-xs"
                            />
                            <Input
                              type="number"
                              value={ev.marksObtained || ""}
                              onChange={(e) =>
                                handleUpdateEvaluation(sub.courseId, ev.id, "marksObtained", Number(e.target.value))
                              }
                              placeholder="Scored"
                              className="h-8 bg-zinc-950 border-zinc-800 text-xs"
                            />
                            <div className="text-xs font-semibold text-zinc-300 pl-1">
                              {weightedScore.toFixed(1)}%
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemoveEvaluationItem(sub.courseId, ev.id)}
                              className="h-7 w-7 text-zinc-500 hover:text-red-400"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </Card>
            )
          })}
        </div>
      </div>

      {/* SECTION 2: Previous Semesters Historical CGPA Tracker */}
      <Card className="border-zinc-800 bg-zinc-900/90 shadow-md">
        <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-zinc-800">
          <div>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-emerald-400" />
              Previous Semesters CGPA History
            </CardTitle>
            <CardDescription className="text-xs text-zinc-400">
              Add your past semester credits and SGPA to compute your exact degree-wide Cumulative CGPA.
            </CardDescription>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleAddPreviousSemester}
            className="border-zinc-700 bg-zinc-950 hover:bg-zinc-800 text-xs font-semibold"
          >
            <Plus className="h-4 w-4 mr-1" /> Add Past Semester
          </Button>
        </CardHeader>

        <CardContent className="p-6 space-y-4">
          {prevSemesters.length === 0 ? (
            <div className="rounded-xl border border-zinc-800 border-dashed p-8 text-center text-zinc-500 text-xs">
              No previous semesters added yet. Click &quot;Add Past Semester&quot; to include Semester 1, Semester 2, etc.
            </div>
          ) : (
            <div className="space-y-3">
              <div className="grid grid-cols-[1fr_120px_120px_100px_40px] gap-3 px-2 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                <div>Semester</div>
                <div>Total Credits</div>
                <div>SGPA (0 - 10)</div>
                <div>Grade Points</div>
                <div></div>
              </div>

              {prevSemesters.map((sem) => (
                <div
                  key={sem.id}
                  className="grid grid-cols-[1fr_120px_120px_100px_40px] gap-3 items-center bg-zinc-950/70 p-3 rounded-xl border border-zinc-800/80"
                >
                  <Input
                    value={sem.name}
                    onChange={(e) => handleUpdatePreviousSemester(sem.id, "name", e.target.value)}
                    className="bg-zinc-900 border-zinc-800 text-xs h-9"
                  />
                  <Input
                    type="number"
                    value={sem.totalCredits || ""}
                    onChange={(e) => handleUpdatePreviousSemester(sem.id, "totalCredits", Number(e.target.value))}
                    placeholder="e.g. 22"
                    className="bg-zinc-900 border-zinc-800 text-xs h-9"
                  />
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    max="10"
                    value={sem.sgpa || ""}
                    onChange={(e) => handleUpdatePreviousSemester(sem.id, "sgpa", Number(e.target.value))}
                    placeholder="e.g. 8.85"
                    className="bg-zinc-900 border-zinc-800 text-xs h-9"
                  />
                  <div className="text-xs font-bold text-emerald-400 pl-2">
                    {(Number(sem.totalCredits) * Number(sem.sgpa)).toFixed(1)} pts
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemovePreviousSemester(sem.id)}
                    className="text-zinc-500 hover:text-red-400"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
