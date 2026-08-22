"use client"

import { SubjectEvaluations } from "@/components/gpa/subject-evaluations"
import { GpaCalculator } from "@/components/gpa/gpa-calculator"
import { TargetGradeCalculator } from "@/components/gpa/target-grade-calculator"
import { SwipeableTabs, SwipeableTabItem } from "@/components/ui/swipeable-tabs"
import { Award, Calculator, Target } from "lucide-react"

export default function GpaPage() {
  const gpaTabs: SwipeableTabItem[] = [
    {
      id: "evaluations",
      label: "Subject Evaluations",
      icon: <Award className="h-3.5 w-3.5" />,
      content: <SubjectEvaluations />,
    },
    {
      id: "target",
      label: "Target Grade Planner",
      icon: <Target className="h-3.5 w-3.5" />,
      content: (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5 shadow-sm">
          <TargetGradeCalculator />
        </div>
      ),
    },
    {
      id: "quick-table",
      label: "Manual SGPA Table",
      icon: <Calculator className="h-3.5 w-3.5" />,
      content: (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5 shadow-sm">
          <GpaCalculator />
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-5 max-w-5xl">
      <header className="border-b border-zinc-800 pb-3">
        <div className="text-[11px] font-medium text-zinc-500">Academic Progress • Monsoon 2026</div>
        <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white mt-0.5">
          Grades &amp; CGPA Planning
        </h1>
      </header>

      {/* Swipeable Tabs (Click + Swipe Gestures) */}
      <SwipeableTabs tabs={gpaTabs} defaultTabId="evaluations" />
    </div>
  )
}
