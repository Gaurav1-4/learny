"use client"

import { Calendar as CalendarIcon, AlertCircle, BookOpen, Clock, FileText, Flag, Sparkles } from "lucide-react"
import { format, parseISO } from "date-fns"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ACADEMIC_MILESTONES_2026 } from "@/lib/academic-calendar-engine"

export function SemesterCalendar() {
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "EXAM": return <AlertCircle className="h-4 w-4 text-rose-400" />
      case "DEADLINE": return <Clock className="h-4 w-4 text-amber-400" />
      case "RECESS": return <Sparkles className="h-4 w-4 text-blue-400" />
      case "EVENT": return <Flag className="h-4 w-4 text-indigo-400" />
      default: return <BookOpen className="h-4 w-4 text-zinc-400" />
    }
  }

  const getCategoryColor = (category: string, important?: boolean) => {
    if (important) return "border-rose-500/50 bg-rose-500/10"
    switch (category) {
      case "EXAM": return "border-rose-500/30 bg-rose-500/5"
      case "DEADLINE": return "border-amber-500/30 bg-amber-500/5"
      case "RECESS": return "border-blue-500/30 bg-blue-500/5"
      case "EVENT": return "border-indigo-500/30 bg-indigo-500/5"
      default: return "border-zinc-800 bg-zinc-900/50"
    }
  }

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case "EXAM": return "bg-rose-500/20 text-rose-300"
      case "DEADLINE": return "bg-amber-500/20 text-amber-300"
      case "RECESS": return "bg-blue-500/20 text-blue-300"
      case "EVENT": return "bg-indigo-500/20 text-indigo-300"
      default: return "bg-zinc-800 text-zinc-300"
    }
  }

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-zinc-100 flex items-center gap-2">
          <CalendarIcon className="h-4 w-4 text-indigo-400" />
          Monsoon 2026 Academic Calendar
        </h2>
        <span className="text-xs text-zinc-500">{ACADEMIC_MILESTONES_2026.length} Milestones</span>
      </div>

      <div className="relative border-l border-zinc-800 ml-3 pl-6 space-y-6">
        {ACADEMIC_MILESTONES_2026.map((milestone) => {
          const dateObj = parseISO(milestone.dateStr)
          const formattedDate = format(dateObj, "MMM d, yyyy (EEEE)")
          const isPast = dateObj < new Date()

          return (
            <div key={milestone.id} className={`relative transition-opacity ${isPast ? 'opacity-50 hover:opacity-100' : ''}`}>
              {/* Timeline Dot */}
              <div className={`absolute -left-[31px] top-1 h-3 w-3 rounded-full border-2 ${
                milestone.important ? 'border-rose-500 bg-rose-950 shadow-[0_0_8px_rgba(244,63,94,0.5)]' : 'border-zinc-500 bg-zinc-950'
              }`} />
              
              <div className={`rounded-xl border p-4 transition-all hover:bg-zinc-900/80 ${getCategoryColor(milestone.category, milestone.important)}`}>
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      {getCategoryIcon(milestone.category)}
                      <h3 className={`font-bold text-sm ${milestone.important ? 'text-rose-100' : 'text-zinc-100'}`}>
                        {milestone.title}
                      </h3>
                    </div>
                    <p className="text-[13px] text-zinc-400 leading-relaxed">
                      {milestone.description}
                    </p>
                  </div>
                  
                  <div className="flex flex-row sm:flex-col items-center sm:items-end gap-2 shrink-0">
                    <div className="text-xs font-semibold text-zinc-300">
                      {formattedDate}
                    </div>
                    <Badge variant="outline" className={`text-[10px] uppercase tracking-wider font-bold border-0 ${getCategoryBadge(milestone.category)}`}>
                      {milestone.category}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
