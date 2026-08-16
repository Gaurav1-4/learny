import { SubjectEvaluations } from "@/components/gpa/subject-evaluations"
import { GpaCalculator } from "@/components/gpa/gpa-calculator"
import { TargetGradeCalculator } from "@/components/gpa/target-grade-calculator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function GpaPage() {
  return (
    <div className="space-y-5 max-w-5xl">
      <header className="border-b border-zinc-800 pb-3">
        <div className="text-[11px] font-medium text-zinc-500">Academic Progress • Monsoon 2026</div>
        <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white mt-0.5">
          Grades &amp; CGPA Planning
        </h1>
      </header>

      <Tabs defaultValue="evaluations" className="w-full">
        <TabsList className="mb-4 bg-zinc-950 border border-zinc-800 p-0.5 rounded-lg text-xs">
          <TabsTrigger value="evaluations" className="rounded-md px-3 py-1.5 text-xs data-[state=active]:bg-zinc-800 data-[state=active]:text-white">
            Subject Evaluations
          </TabsTrigger>
          <TabsTrigger value="target" className="rounded-md px-3 py-1.5 text-xs data-[state=active]:bg-zinc-800 data-[state=active]:text-white">
            Target Grade Planner
          </TabsTrigger>
          <TabsTrigger value="quick-table" className="rounded-md px-3 py-1.5 text-xs data-[state=active]:bg-zinc-800 data-[state=active]:text-white">
            Manual SGPA Table
          </TabsTrigger>
        </TabsList>

        <TabsContent value="evaluations">
          <SubjectEvaluations />
        </TabsContent>

        <TabsContent value="target">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5 shadow-sm">
            <TargetGradeCalculator />
          </div>
        </TabsContent>

        <TabsContent value="quick-table">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5 shadow-sm">
            <GpaCalculator />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
