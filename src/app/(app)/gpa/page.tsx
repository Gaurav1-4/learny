import { SubjectEvaluations } from "@/components/gpa/subject-evaluations"
import { GpaCalculator } from "@/components/gpa/gpa-calculator"
import { TargetGradeCalculator } from "@/components/gpa/target-grade-calculator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function GpaPage() {
  return (
    <div className="space-y-6 max-w-6xl">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-100">Grades, Evaluations & CGPA Hub</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Track continuous evaluation components for every subject, compute degree-wide CGPA across semesters, and plan target exam scores.
        </p>
      </header>

      <Tabs defaultValue="evaluations" className="w-full">
        <TabsList className="mb-4 bg-zinc-900 border border-zinc-800 p-1">
          <TabsTrigger value="evaluations">Subject Evaluations & CGPA</TabsTrigger>
          <TabsTrigger value="target">Target Grade Planner</TabsTrigger>
          <TabsTrigger value="quick-table">Manual SGPA / CGPA Table</TabsTrigger>
        </TabsList>

        <TabsContent value="evaluations">
          <SubjectEvaluations />
        </TabsContent>

        <TabsContent value="target">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/90 p-8 shadow-sm">
            <TargetGradeCalculator />
          </div>
        </TabsContent>

        <TabsContent value="quick-table">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/90 p-8 shadow-sm">
            <GpaCalculator />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
