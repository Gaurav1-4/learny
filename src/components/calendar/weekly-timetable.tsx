"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Sparkles,
  Download,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Brain,
  BookOpen,
  ArrowRight,
  Plus,
  Flame,
  ExternalLink,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export interface ClassSlot {
  id: string
  subject: string
  code: string
  type: "Lecture" | "Tutorial" | "Lab" | "Practice" | "Test"
  room: string
  day: "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday"
  startTime: string // "11:00"
  endTime: string // "12:30"
  timeLabel: string // "11:00 AM – 12:30 PM"
  color: string
  bgLight: string
  notes?: string
  isTest?: boolean
}

export interface StudySlot {
  id: string
  title: string
  targetCourse: string
  reason: string
  day: "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday"
  timeLabel: string
  priority: "High" | "Medium" | "Urgent"
  completed?: boolean
}

export const TIMETABLE_CLASSES: ClassSlot[] = [
  // MONDAY
  {
    id: "mon-dpp-lec",
    subject: "DPP (Design Processes & Perspectives)",
    code: "DES201",
    type: "Lecture",
    room: "A106",
    day: "Monday",
    startTime: "11:00",
    endTime: "12:30",
    timeLabel: "11:00 AM – 12:30 PM",
    color: "border-purple-500/40 text-purple-300",
    bgLight: "bg-purple-500/10 hover:bg-purple-500/20",
    notes: "Design studio ideation, case studies & critique.",
  },
  {
    id: "mon-os-lec",
    subject: "Operating Systems (OS)",
    code: "CSE231",
    type: "Lecture",
    room: "C201",
    day: "Monday",
    startTime: "15:00",
    endTime: "16:30",
    timeLabel: "3:00 – 4:30 PM",
    color: "border-cyan-500/40 text-cyan-300",
    bgLight: "bg-cyan-500/10 hover:bg-cyan-500/20",
    notes: "Processes, Threads, CPU Scheduling & Concurrency.",
  },

  // TUESDAY
  {
    id: "tue-rmssd-lec",
    subject: "RMSSD (Research Methods in Social Sciences & Design)",
    code: "SSH201",
    type: "Lecture",
    room: "C11",
    day: "Tuesday",
    startTime: "11:00",
    endTime: "12:30",
    timeLabel: "11:00 AM – 12:30 PM",
    color: "border-amber-500/40 text-amber-300",
    bgLight: "bg-amber-500/10 hover:bg-amber-500/20",
    notes: "Qualitative/quantitative research methodologies.",
  },
  {
    id: "tue-m3-tut",
    subject: "Math III Tutorial (Graded Weekly Test)",
    code: "MTH201",
    type: "Test",
    room: "Tutorial Room",
    day: "Tuesday",
    startTime: "13:30",
    endTime: "15:00",
    timeLabel: "1:30 – 3:00 PM",
    color: "border-rose-500/60 text-rose-300",
    bgLight: "bg-rose-500/15 hover:bg-rose-500/25 ring-1 ring-rose-500/30",
    notes: "🔥 Weekly Graded Tutorial Test! High impact on final grade.",
    isTest: true,
  },
  {
    id: "tue-ap-lec",
    subject: "Advanced Programming (AP)",
    code: "CSE201",
    type: "Lecture",
    room: "C21",
    day: "Tuesday",
    startTime: "15:00",
    endTime: "16:30",
    timeLabel: "3:00 – 4:30 PM",
    color: "border-indigo-500/40 text-indigo-300",
    bgLight: "bg-indigo-500/10 hover:bg-indigo-500/20",
    notes: "OOP Principles, Design Patterns & Java. ⚠️ Pop quiz alert!",
  },
  {
    id: "tue-m3-lec",
    subject: "Math III Lecture",
    code: "MTH201",
    type: "Lecture",
    room: "C201",
    day: "Tuesday",
    startTime: "16:30",
    endTime: "18:00",
    timeLabel: "4:30 – 6:00 PM",
    color: "border-rose-500/40 text-rose-300",
    bgLight: "bg-rose-500/10 hover:bg-rose-500/20",
    notes: "Multivariable Calculus, PDEs & Fourier Analysis.",
  },

  // WEDNESDAY
  {
    id: "wed-os-tut",
    subject: "OS Tutorial",
    code: "CSE231",
    type: "Tutorial",
    room: "C101",
    day: "Wednesday",
    startTime: "08:30",
    endTime: "09:30",
    timeLabel: "8:30 – 9:30 AM",
    color: "border-cyan-500/40 text-cyan-300",
    bgLight: "bg-cyan-500/10 hover:bg-cyan-500/20",
    notes: "Operating Systems problem solving & synchronization drills.",
  },
  {
    id: "wed-ap-tut",
    subject: "AP Tutorial",
    code: "CSE201",
    type: "Tutorial",
    room: "Tutorial Room",
    day: "Wednesday",
    startTime: "14:00",
    endTime: "15:00",
    timeLabel: "2:00 – 3:00 PM",
    color: "border-indigo-500/40 text-indigo-300",
    bgLight: "bg-indigo-500/10 hover:bg-indigo-500/20",
    notes: "Java code reviews, concurrency drills & design pattern refactoring.",
  },
  {
    id: "wed-os-lec",
    subject: "OS Lecture",
    code: "CSE231",
    type: "Lecture",
    room: "C201",
    day: "Wednesday",
    startTime: "15:00",
    endTime: "16:30",
    timeLabel: "3:00 – 4:30 PM",
    color: "border-cyan-500/40 text-cyan-300",
    bgLight: "bg-cyan-500/10 hover:bg-cyan-500/20",
    notes: "Memory Management, Paging, Virtual Memory & TLB.",
  },

  // THURSDAY
  {
    id: "thu-rmssd-lab",
    subject: "RMSSD Lab",
    code: "SSH201",
    type: "Lab",
    room: "C01",
    day: "Thursday",
    startTime: "09:30",
    endTime: "11:00",
    timeLabel: "9:30 – 11:00 AM",
    color: "border-amber-500/40 text-amber-300",
    bgLight: "bg-amber-500/10 hover:bg-amber-500/20",
    notes: "Statistical data analysis, SPSS/R studio assignments.",
  },
  {
    id: "thu-dpp-lec",
    subject: "DPP Lecture",
    code: "DES201",
    type: "Lecture",
    room: "A106",
    day: "Thursday",
    startTime: "11:00",
    endTime: "12:30",
    timeLabel: "11:00 AM – 12:30 PM",
    color: "border-purple-500/40 text-purple-300",
    bgLight: "bg-purple-500/10 hover:bg-purple-500/20",
    notes: "Design Frameworks, Heuristic Evaluations & Usability Testing.",
  },
  {
    id: "thu-ap-lec",
    subject: "AP Lecture",
    code: "CSE201",
    type: "Lecture",
    room: "C21",
    day: "Thursday",
    startTime: "15:00",
    endTime: "16:30",
    timeLabel: "3:00 – 4:30 PM",
    color: "border-indigo-500/40 text-indigo-300",
    bgLight: "bg-indigo-500/10 hover:bg-indigo-500/20",
    notes: "SOLID Architecture & Structural Design Patterns. ⚠️ Pop quiz alert!",
  },
  {
    id: "thu-m3-lec",
    subject: "Math III Lecture",
    code: "MTH201",
    type: "Lecture",
    room: "C102",
    day: "Thursday",
    startTime: "16:30",
    endTime: "18:00",
    timeLabel: "4:30 – 6:00 PM",
    color: "border-rose-500/40 text-rose-300",
    bgLight: "bg-rose-500/10 hover:bg-rose-500/20",
    notes: "Complex Analysis, Residue Theorem & Vector Calculus.",
  },

  // FRIDAY
  {
    id: "fri-rmssd-lec",
    subject: "RMSSD Lecture",
    code: "SSH201",
    type: "Lecture",
    room: "C11",
    day: "Friday",
    startTime: "11:00",
    endTime: "12:30",
    timeLabel: "11:00 AM – 12:30 PM",
    color: "border-amber-500/40 text-amber-300",
    bgLight: "bg-amber-500/10 hover:bg-amber-500/20",
    notes: "Design research synthesis, thematic coding & interview analysis.",
  },
  {
    id: "fri-dpp-practice",
    subject: "DPP Practice Session",
    code: "DES201",
    type: "Practice",
    room: "A106",
    day: "Friday",
    startTime: "14:00",
    endTime: "16:30",
    timeLabel: "2:00 – 4:30 PM",
    color: "border-purple-500/40 text-purple-300",
    bgLight: "bg-purple-500/10 hover:bg-purple-500/20",
    notes: "Studio prototyping, physical mockup build & peer critique.",
  },
]

export const AI_STUDY_SLOTS: StudySlot[] = [
  // MONDAY
  {
    id: "study-mon-m3-morning",
    title: "Math III Tuesday Test: Deep Problem Solving",
    targetCourse: "Math III",
    reason: "Free slot (8:30-11:00 AM) allocated to master tutorial problem sheets before Tuesday's test.",
    day: "Monday",
    timeLabel: "8:30 – 10:45 AM",
    priority: "Urgent",
  },
  {
    id: "study-mon-m3-afternoon",
    title: "Math III Mock Timed Quiz & Formulas Drill",
    targetCourse: "Math III",
    reason: "Free slot (1:00-2:45 PM) to lock in speed & formulas so you feel zero stress on Tuesday.",
    day: "Monday",
    timeLabel: "1:00 – 2:45 PM",
    priority: "Urgent",
  },
  {
    id: "study-mon-os-review",
    title: "OS Lecture 1 Notes Digest & AP Quiz Flashcards",
    targetCourse: "Operating Systems",
    reason: "Immediately review Mon 3 PM OS lecture concepts & run 15-min AP flashcards for Tuesday.",
    day: "Monday",
    timeLabel: "5:00 – 6:30 PM",
    priority: "High",
  },

  // TUESDAY
  {
    id: "study-tue-os-tut-prep",
    title: "OS Tutorial Preparation (for Wed 8:30 AM)",
    targetCourse: "Operating Systems",
    reason: "Prepare OS synchronization / scheduling problem sets for tomorrow morning's 8:30 AM tutorial.",
    day: "Tuesday",
    timeLabel: "6:30 – 8:00 PM",
    priority: "High",
  },
  {
    id: "study-tue-m3-postlog",
    title: "Math III Lecture Notes Consolidation",
    targetCourse: "Math III",
    reason: "Log today's 4:30 PM lecture notes into NotebookLM to avoid post-test backlog.",
    day: "Tuesday",
    timeLabel: "8:30 – 9:30 PM",
    priority: "Medium",
  },

  // WEDNESDAY
  {
    id: "study-wed-dpp-rmssd",
    title: "DPP Studio Artifacts & RMSSD Lab Prep (for Thu)",
    targetCourse: "DPP & RMSSD",
    reason: "Free slot (10:00 AM-1:00 PM) to prep dataset for Thursday 9:30 AM RMSSD Lab (C01).",
    day: "Wednesday",
    timeLabel: "10:00 AM – 12:30 PM",
    priority: "High",
  },
  {
    id: "study-wed-ap-quiz-drill",
    title: "AP Surprise Quiz Survival Drill (for Thu 3 PM)",
    targetCourse: "Advanced Programming",
    reason: "Solve 5 quick OOP/SOLID questions to stay 100% prepared for potential unannounced quizzes.",
    day: "Wednesday",
    timeLabel: "5:00 – 6:30 PM",
    priority: "Urgent",
  },

  // THURSDAY
  {
    id: "study-thu-dpp-studio",
    title: "DPP Friday Practice Studio Materials Prep",
    targetCourse: "DPP 2026",
    reason: "Assemble prototyping materials & critique slides for Friday 2:00 PM studio session.",
    day: "Thursday",
    timeLabel: "6:30 – 8:00 PM",
    priority: "Medium",
  },

  // FRIDAY
  {
    id: "study-fri-weekly-sync",
    title: "Weekly Academic Synthesis & Weekend Plan",
    targetCourse: "All Subjects",
    reason: "Sync all newly uploaded Google Classroom slides to NotebookLM decks.",
    day: "Friday",
    timeLabel: "5:00 – 6:30 PM",
    priority: "Medium",
  },
]

const TIME_ROWS = [
  "8:30 – 9:30 AM",
  "9:30 – 11:00 AM",
  "11:00 AM – 12:30 PM",
  "12:30 – 1:30 PM",
  "1:30 – 3:00 PM",
  "2:00 – 3:00 PM",
  "3:00 – 4:30 PM",
  "4:30 – 6:00 PM",
]

const DAYS: ("Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday")[] = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
]

export function WeeklyTimetable() {
  const [selectedDay, setSelectedDay] = useState<string>("all")
  const [selectedSubject, setSelectedSubject] = useState<string>("all")
  const [showStudySlots, setShowStudySlots] = useState<boolean>(true)
  const [selectedSlot, setSelectedSlot] = useState<ClassSlot | StudySlot | null>(null)

  // Filter classes
  const filteredClasses = TIMETABLE_CLASSES.filter((slot) => {
    const matchesDay = selectedDay === "all" || slot.day === selectedDay
    const matchesSubject =
      selectedSubject === "all" ||
      slot.subject.toLowerCase().includes(selectedSubject.toLowerCase()) ||
      slot.code.toLowerCase().includes(selectedSubject.toLowerCase())
    return matchesDay && matchesSubject
  })

  // Export iCal (.ics) for Google Calendar
  const handleExportICal = () => {
    let icsContent = `BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//Learny//IIITD CSD Timetable//EN\nCALSCALE:GREGORIAN\nMETHOD:PUBLISH\nX-WR-CALNAME:IIITD CSD Sem 3 Schedule\n`

    TIMETABLE_CLASSES.forEach((slot, idx) => {
      // Map day to next occurrence
      const dayMap: Record<string, string> = {
        Monday: "MO",
        Tuesday: "TU",
        Wednesday: "WE",
        Thursday: "TH",
        Friday: "FR",
      }

      icsContent += `BEGIN:VEVENT\n`
      icsContent += `UID:learny-${slot.id}-${idx}@learny.zorx.tech\n`
      icsContent += `SUMMARY:${slot.subject} (${slot.type})\n`
      icsContent += `LOCATION:Room ${slot.room}, IIIT Delhi\n`
      icsContent += `DESCRIPTION:${slot.notes || "Class schedule"}\n`
      icsContent += `RRULE:FREQ=WEEKLY;BYDAY=${dayMap[slot.day]};COUNT=16\n`
      icsContent += `DTSTART:20260818T${slot.startTime.replace(":", "")}00\n`
      icsContent += `DTEND:20260818T${slot.endTime.replace(":", "")}00\n`
      icsContent += `END:VEVENT\n`
    })

    if (showStudySlots) {
      AI_STUDY_SLOTS.forEach((slot, idx) => {
        const dayMap: Record<string, string> = {
          Monday: "MO",
          Tuesday: "TU",
          Wednesday: "WE",
          Thursday: "TH",
          Friday: "FR",
        }
        icsContent += `BEGIN:VEVENT\n`
        icsContent += `UID:learny-study-${slot.id}-${idx}@learny.zorx.tech\n`
        icsContent += `SUMMARY:⚡ AI Study: ${slot.title}\n`
        icsContent += `LOCATION:Library / Study Desk\n`
        icsContent += `DESCRIPTION:${slot.reason}\n`
        icsContent += `RRULE:FREQ=WEEKLY;BYDAY=${dayMap[slot.day]};COUNT=16\n`
        icsContent += `DTSTART:20260818T090000\n`
        icsContent += `DTEND:20260818T103000\n`
        icsContent += `END:VEVENT\n`
      })
    }

    icsContent += `END:VCALENDAR`

    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "iiitd-csd-sem3-timetable.ics"
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-4">
      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800 pb-3 text-xs">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="font-semibold text-zinc-400 pl-1 flex items-center gap-1">
            <Filter className="h-3 w-3" /> Filter Day:
          </span>
          <button
            onClick={() => setSelectedDay("all")}
            className={`rounded-lg px-2.5 py-1 font-bold transition-all ${
              selectedDay === "all"
                ? "bg-white text-zinc-950 shadow-sm"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            Full Week (Mon–Fri)
          </button>
          {DAYS.map((d) => (
            <button
              key={d}
              onClick={() => setSelectedDay(d)}
              className={`rounded-lg px-2.5 py-1 font-bold transition-all ${
                selectedDay === d
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              {d.slice(0, 3)}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs text-zinc-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="all">All 5 Subjects</option>
            <option value="Math">Math III (Calculus & Tests)</option>
            <option value="OS">Operating Systems (OS)</option>
            <option value="AP">Advanced Programming (AP)</option>
            <option value="DPP">DPP (Design Processes)</option>
            <option value="RMSSD">RMSSD (Research Methods)</option>
          </select>
        </div>
      </div>

      {/* TIMETABLE VIEW (Day Cards Grid) */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {DAYS.filter((d) => selectedDay === "all" || selectedDay === d).map((day) => {
          const dayClasses = filteredClasses.filter((c) => c.day === day)
          const dayStudy = AI_STUDY_SLOTS.filter((s) => s.day === day)

          return (
            <Card
              key={day}
              className="border-zinc-800 bg-zinc-950/80 shadow-lg backdrop-blur-md overflow-hidden flex flex-col justify-between"
            >
              <CardHeader className="border-b border-zinc-800/80 bg-zinc-900/40 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4 text-indigo-400" />
                    <CardTitle className="text-base font-extrabold text-white">{day}</CardTitle>
                  </div>
                  <span className="rounded-full bg-zinc-800 px-2.5 py-0.5 text-[10px] font-mono text-zinc-300">
                    {dayClasses.length} Classes
                  </span>
                </div>
              </CardHeader>

              <CardContent className="p-4 space-y-3 flex-1">
                {/* Class Slots */}
                <div className="space-y-2.5">
                  {dayClasses.map((slot) => (
                    <motion.div
                      key={slot.id}
                      whileHover={{ scale: 1.01 }}
                      onClick={() => setSelectedSlot(slot)}
                      className={`cursor-pointer rounded-2xl border p-3.5 transition-all shadow-sm ${slot.bgLight} ${slot.color}`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge
                              variant="outline"
                              className={`text-[9px] font-bold uppercase tracking-wider ${
                                slot.isTest
                                  ? "bg-rose-500 text-white border-rose-400 animate-pulse"
                                  : "border-white/20 text-zinc-300"
                              }`}
                            >
                              {slot.type}
                            </Badge>
                            <span className="text-[11px] font-mono text-zinc-400">
                              {slot.code}
                            </span>
                          </div>

                          <h4 className="text-sm font-extrabold text-white leading-snug">
                            {slot.subject}
                          </h4>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="inline-flex items-center gap-1 rounded-lg bg-zinc-900/80 border border-zinc-800 px-2 py-0.5 text-[10px] font-bold text-zinc-300">
                            <MapPin className="h-2.5 w-2.5 text-indigo-400" />
                            {slot.room}
                          </span>
                        </div>
                      </div>

                      <div className="mt-2.5 flex items-center justify-between border-t border-white/5 pt-2 text-[11px] text-zinc-400">
                        <span className="flex items-center gap-1 font-medium">
                          <Clock className="h-3 w-3 text-zinc-400" />
                          {slot.timeLabel}
                        </span>
                        {slot.isTest && (
                          <span className="font-extrabold text-rose-400 text-[10px] flex items-center gap-0.5">
                            <Flame className="h-3 w-3" /> Graded Test
                          </span>
                        )}
                      </div>
                    </motion.div>
                  ))}

                  {dayClasses.length === 0 && (
                    <div className="py-6 text-center text-xs text-zinc-500">
                      No matching classes for this filter.
                    </div>
                  )}
                </div>

                {/* AI Study Slots Overlay */}
                {showStudySlots && dayStudy.length > 0 && (
                  <div className="pt-3 border-t border-zinc-800/80 space-y-2">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-emerald-400 flex items-center gap-1">
                        <Sparkles className="h-3 w-3" /> AI Study & Prep Blocks
                      </span>
                      <span className="text-[10px] text-zinc-500">Auto-Scheduled</span>
                    </div>

                    {dayStudy.map((study) => (
                      <motion.div
                        key={study.id}
                        whileHover={{ scale: 1.01 }}
                        onClick={() => setSelectedSlot(study)}
                        className="cursor-pointer rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-2.5 text-xs text-emerald-200 transition-all hover:bg-emerald-950/40"
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-bold text-[11px] text-white line-clamp-1">
                            {study.title}
                          </span>
                          <Badge
                            className={`text-[9px] px-1.5 py-0 font-bold uppercase ${
                              study.priority === "Urgent"
                                ? "bg-rose-600 text-white"
                                : "bg-emerald-700 text-emerald-100"
                            }`}
                          >
                            {study.priority}
                          </Badge>
                        </div>
                        <div className="mt-1 flex items-center justify-between text-[10px] text-zinc-400">
                          <span className="text-emerald-400/90 font-medium">
                            {study.targetCourse}
                          </span>
                          <span>{study.timeLabel}</span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Quick Class Detail Modal */}
      <AnimatePresence>
        {selectedSlot && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-in fade-in">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md rounded-3xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  {"type" in selectedSlot ? (
                    <Badge className="bg-indigo-600 text-white font-bold text-[10px]">
                      {selectedSlot.type} • {selectedSlot.code}
                    </Badge>
                  ) : (
                    <Badge className="bg-emerald-600 text-white font-bold text-[10px]">
                      ⚡ AI Study Plan
                    </Badge>
                  )}
                  <h3 className="text-lg font-extrabold text-white mt-1.5">
                    {"subject" in selectedSlot ? selectedSlot.subject : selectedSlot.title}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedSlot(null)}
                  className="rounded-xl p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white"
                >
                  &times;
                </button>
              </div>

              <div className="space-y-3 rounded-2xl bg-zinc-950 p-4 text-xs border border-zinc-800">
                <div className="flex items-center justify-between text-zinc-400">
                  <span className="font-semibold">Schedule Time:</span>
                  <span className="font-bold text-white">
                    {selectedSlot.day}, {selectedSlot.timeLabel}
                  </span>
                </div>

                {"room" in selectedSlot && (
                  <div className="flex items-center justify-between text-zinc-400">
                    <span className="font-semibold">Lecture Room:</span>
                    <span className="font-bold text-indigo-400">Room {selectedSlot.room}</span>
                  </div>
                )}

                {"notes" in selectedSlot && selectedSlot.notes && (
                  <div className="pt-2 border-t border-zinc-800 text-zinc-300">
                    <span className="font-semibold text-zinc-400 block mb-1">Academic Notes:</span>
                    <p className="text-zinc-300 leading-relaxed">{selectedSlot.notes}</p>
                  </div>
                )}

                {"reason" in selectedSlot && (
                  <div className="pt-2 border-t border-zinc-800 text-emerald-300">
                    <span className="font-semibold text-zinc-400 block mb-1">AI Prep Strategy:</span>
                    <p className="leading-relaxed">{selectedSlot.reason}</p>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setSelectedSlot(null)}
                  className="border-zinc-800 text-xs"
                >
                  Close
                </Button>
                {"subject" in selectedSlot && (
                  <a
                    href={`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
                      selectedSlot.subject
                    )}&location=${encodeURIComponent(
                      `Room ${selectedSlot.room}, IIIT Delhi`
                    )}&details=${encodeURIComponent(selectedSlot.notes || "")}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-bold text-white hover:bg-indigo-500"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    Open Google Calendar
                  </a>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
