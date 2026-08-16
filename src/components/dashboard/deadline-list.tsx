"use client"

import { formatDistanceToNow, isPast } from "date-fns"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"

type Status = "due" | "overdue" | "submitted"

export interface Deadline {
  id: string
  courseName: string
  title: string
  dueDate: Date
  status: Status
}

interface DeadlineListProps {
  deadlines: Deadline[]
}

export function DeadlineList({ deadlines }: DeadlineListProps) {
  const sortedDeadlines = [...deadlines].sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())

  return (
    <Card className="col-span-1 h-[400px] flex flex-col">
      <CardHeader>
        <CardTitle>Upcoming Deadlines</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden p-0">
        <ScrollArea className="h-full px-6 pb-6">
          <div className="space-y-4">
            {sortedDeadlines.length === 0 ? (
              <p className="text-sm text-zinc-400">No upcoming deadlines.</p>
            ) : (
              sortedDeadlines.map((deadline) => {
                const past = isPast(deadline.dueDate)
                let variant: "default" | "secondary" | "destructive" | "outline" = "outline"
                
                if (deadline.status === "submitted") variant = "secondary"
                else if (deadline.status === "overdue" || (past && deadline.status === "due")) variant = "destructive"
                else variant = "default"

                return (
                  <div
                    key={deadline.id}
                    className="flex flex-col space-y-1.5 rounded-lg border border-zinc-800 bg-zinc-900/50 p-3"
                  >
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-[10px]">
                        {deadline.courseName}
                      </Badge>
                      <Badge variant={variant} className="text-[10px]">
                        {deadline.status === "due" && past ? "overdue" : deadline.status}
                      </Badge>
                    </div>
                    <div className="font-medium text-sm">{deadline.title}</div>
                    <div className="text-xs text-zinc-400">
                      {deadline.status === "submitted" 
                        ? `Due ${deadline.dueDate.toLocaleDateString()}` 
                        : `${past ? "Was due" : "Due"} ${formatDistanceToNow(deadline.dueDate, { addSuffix: true })}`}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
