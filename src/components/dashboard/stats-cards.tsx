"use client"

import { BookOpen, ClipboardList, Clock, TrendingUp } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function StatsCards({
  coursesCount,
  pendingCount,
  upcomingCount,
  averageGrade,
}: {
  coursesCount: number
  pendingCount: number
  upcomingCount: number
  averageGrade: string
}) {
  const items = [
    { label: "Total Courses", val: coursesCount, icon: BookOpen },
    { label: "Pending Assignments", val: pendingCount, icon: ClipboardList },
    { label: "Upcoming Deadlines", val: upcomingCount, icon: Clock },
    { label: "Average Grade", val: averageGrade, icon: TrendingUp },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {items.map((item) => (
        <Card key={item.label}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{item.label}</CardTitle>
            <item.icon className="h-4 w-4 text-zinc-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{item.val}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
