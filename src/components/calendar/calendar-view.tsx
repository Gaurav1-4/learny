"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar as CalendarIcon,
  Clock,
  ExternalLink,
  Trash2,
  CheckCircle2,
  Tag,
  BookOpen,
  X,
  Sparkles,
  Brain,
  Layers,
  LayoutGrid,
} from "lucide-react"
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  isSameMonth,
  isSameDay,
  addDays,
  parseISO,
} from "date-fns"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ClassroomCourse, ClassroomCourseWork } from "@/types"
import { WeeklyTimetable } from "@/components/calendar/weekly-timetable"
import { StudyPlannerView } from "@/components/calendar/study-planner-view"

export interface CalendarEvent {
  id: string
  title: string
  date: string // YYYY-MM-DD
  time?: string // HH:mm
  courseId?: string
  courseName?: string
  color?: string
  type: "assignment" | "exam" | "study" | "custom"
  maxPoints?: number
  alternateLink?: string
  completed?: boolean
}

const COURSE_COLORS = [
  "bg-blue-500/20 text-blue-300 border-blue-500/30",
  "bg-purple-500/20 text-purple-300 border-purple-500/30",
  "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  "bg-amber-500/20 text-amber-300 border-amber-500/30",
  "bg-rose-500/20 text-rose-300 border-rose-500/30",
  "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
  "bg-indigo-500/20 text-indigo-300 border-indigo-500/30",
]

export function CalendarView() {
  const [activeTab, setActiveTab] = useState<"timetable" | "planner" | "month">("timetable")
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [courses, setCourses] = useState<ClassroomCourse[]>([])
  const [selectedCourseFilter, setSelectedCourseFilter] = useState<string>("all")
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [customEvents, setCustomEvents] = useState<CalendarEvent[]>([])
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedDateForNewEvent, setSelectedDateForNewEvent] = useState<string>(
    format(new Date(), "yyyy-MM-dd")
  )

  // New event form state
  const [newEventTitle, setNewEventTitle] = useState("")
  const [newEventTime, setNewEventTime] = useState("10:00")
  const [newEventCourseId, setNewEventCourseId] = useState("")
  const [newEventType, setNewEventType] = useState<"exam" | "study" | "custom">("study")

  // 1. Load custom events from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("learny-calendar-custom-events")
    if (saved) {
      try {
        setCustomEvents(JSON.parse(saved))
      } catch (e) {
        console.error("Failed to parse custom events", e)
      }
    }
  }, [])

  // 2. Save custom events to localStorage
  useEffect(() => {
    localStorage.setItem("learny-calendar-custom-events", JSON.stringify(customEvents))
  }, [customEvents])

  // 3. Fetch courses and coursework from Google Classroom API
  useEffect(() => {
    async function loadData() {
      try {
        const [coursesRes, courseworkRes] = await Promise.all([
          fetch("/api/classroom/courses"),
          fetch("/api/classroom/coursework"),
        ])

        let courseList: ClassroomCourse[] = []
        if (coursesRes.ok) {
          const data = await coursesRes.json()
          courseList = Array.isArray(data) ? data : data.courses || []
          setCourses(courseList)
        }

        if (courseworkRes.ok) {
          const data = await courseworkRes.json()
          const workList: ClassroomCourseWork[] = Array.isArray(data) ? data : data.courseWork || []

          // Map coursework to calendar events
          const mappedEvents: CalendarEvent[] = []
          workList.forEach((w, idx) => {
            if (w.dueDate) {
              const { year, month, day } = w.dueDate
              if (year && month && day) {
                const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`
                const course = courseList.find((c) => c.id === w.courseId)
                const colorIdx = courseList.findIndex((c) => c.id === w.courseId)
                const color =
                  colorIdx !== -1
                    ? COURSE_COLORS[colorIdx % COURSE_COLORS.length]
                    : "bg-indigo-500/20 text-indigo-300 border-indigo-500/30"

                let timeStr = undefined
                if (w.dueTime && w.dueTime.hours !== undefined) {
                  timeStr = `${String(w.dueTime.hours).padStart(2, "0")}:${String(
                    w.dueTime.minutes || 0
                  ).padStart(2, "0")}`
                }

                mappedEvents.push({
                  id: w.id,
                  title: w.title,
                  date: dateStr,
                  time: timeStr,
                  courseId: w.courseId,
                  courseName: course?.name || "Classroom Assignment",
                  color,
                  type: "assignment",
                  maxPoints: w.maxPoints,
                  alternateLink: w.alternateLink,
                })
              }
            }
          })
          setEvents(mappedEvents)
        }
      } catch (err) {
        console.error("Error loading calendar data", err)
      }
    }

    loadData()
  }, [])

  // Combine classroom events and custom events
  const allEvents = [...events, ...customEvents].filter((ev) => {
    if (selectedCourseFilter === "all") return true
    return ev.courseId === selectedCourseFilter
  })

  // Calendar navigation
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1))
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1))
  const goToToday = () => setCurrentMonth(new Date())

  // Generate days matrix
  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(monthStart)
  const startDate = startOfWeek(monthStart)
  const endDate = endOfWeek(monthEnd)

  const rows = []
  let days = []
  let day = startDate

  while (day <= endDate) {
    for (let i = 0; i < 7; i++) {
      const formattedDate = format(day, "yyyy-MM-dd")
      const currentDay = day
      const dayEvents = allEvents.filter((e) => e.date === formattedDate)
      const isCurrentMonth = isSameMonth(day, monthStart)
      const isToday = isSameDay(day, new Date())

      days.push(
        <div
          key={formattedDate}
          onClick={() => {
            setSelectedDateForNewEvent(formattedDate)
          }}
          className={`min-h-[110px] border-b border-r border-zinc-800/80 p-2 transition-colors flex flex-col justify-between ${
            !isCurrentMonth ? "bg-zinc-950/40 text-zinc-600" : "bg-zinc-900/40 text-zinc-300"
          } ${isToday ? "ring-1 ring-inset ring-indigo-500/60 bg-indigo-950/10" : ""}`}
        >
          <div className="flex items-center justify-between">
            <span
              className={`text-xs font-semibold rounded-full h-6 w-6 flex items-center justify-center ${
                isToday
                  ? "bg-indigo-600 text-white font-bold"
                  : isCurrentMonth
                  ? "text-zinc-200"
                  : "text-zinc-600"
              }`}
            >
              {format(currentDay, "d")}
            </span>
            {isCurrentMonth && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setSelectedDateForNewEvent(formattedDate)
                  setShowAddModal(true)
                }}
                className="opacity-0 hover:opacity-100 p-1 text-zinc-400 hover:text-zinc-100 transition-opacity"
                title="Add event"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <div className="space-y-1 mt-1.5 overflow-hidden">
            {dayEvents.slice(0, 3).map((ev) => (
              <button
                key={ev.id}
                onClick={(e) => {
                  e.stopPropagation()
                  setSelectedEvent(ev)
                }}
                className={`w-full text-left truncate text-[11px] px-1.5 py-0.5 rounded border font-medium transition-all ${
                  ev.color || "bg-zinc-800 text-zinc-300 border-zinc-700"
                } hover:scale-[1.02]`}
              >
                {ev.time ? `${ev.time} ` : ""}
                {ev.title}
              </button>
            ))}
            {dayEvents.length > 3 && (
              <span className="text-[10px] text-zinc-500 font-semibold px-1">
                +{dayEvents.length - 3} more
              </span>
            )}
          </div>
        </div>
      )
      day = addDays(day, 1)
    }
    rows.push(
      <div key={day.toString()} className="grid grid-cols-7 border-l border-zinc-800">
        {days}
      </div>
    )
    days = []
  }

  // Create custom milestone event
  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newEventTitle.trim()) return

    const course = courses.find((c) => c.id === newEventCourseId)
    const colorIdx = courses.findIndex((c) => c.id === newEventCourseId)
    let color =
      colorIdx !== -1
        ? COURSE_COLORS[colorIdx % COURSE_COLORS.length]
        : "bg-indigo-500/20 text-indigo-300 border-indigo-500/30"

    if (newEventType === "exam") {
      color = "bg-rose-500/20 text-rose-300 border-rose-500/30"
    } else if (newEventType === "study") {
      color = "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
    }

    const newEv: CalendarEvent = {
      id: `custom-${Date.now()}`,
      title: newEventTitle,
      date: selectedDateForNewEvent,
      time: newEventTime,
      courseId: newEventCourseId,
      courseName: course?.name,
      color,
      type: newEventType,
    }

    setCustomEvents([...customEvents, newEv])
    setNewEventTitle("")
    setShowAddModal(false)
  }

  const handleDeleteCustomEvent = (id: string) => {
    setCustomEvents(customEvents.filter((e) => e.id !== id))
    if (selectedEvent?.id === id) {
      setSelectedEvent(null)
    }
  }

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header with 3 Core Tab Selectors */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-2.5">
            <CalendarIcon className="h-8 w-8 text-indigo-400" />
            Academic Calendar & Schedule Hub
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Weekly class timetable, autonomous AI study planner, and Google Classroom deadline calendar.
          </p>
        </div>

        {/* Tab Switcher Pills */}
        <div className="flex items-center gap-2 rounded-2xl bg-zinc-900 border border-zinc-800 p-1.5 shadow-sm">
          <button
            onClick={() => setActiveTab("timetable")}
            className={`relative flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-extrabold transition-all ${
              activeTab === "timetable" ? "text-white" : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <LayoutGrid className="h-4 w-4 text-indigo-400" />
            <span>Weekly Timetable</span>
            {activeTab === "timetable" && (
              <motion.div
                layoutId="calendarActiveTabPill"
                className="absolute inset-0 -z-10 rounded-xl bg-indigo-600 shadow-md"
                transition={{ type: "spring", stiffness: 450, damping: 35 }}
              />
            )}
          </button>

          <button
            onClick={() => setActiveTab("planner")}
            className={`relative flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-extrabold transition-all ${
              activeTab === "planner" ? "text-white" : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Brain className="h-4 w-4 text-emerald-400" />
            <span>AI Study Planner</span>
            {activeTab === "planner" && (
              <motion.div
                layoutId="calendarActiveTabPill"
                className="absolute inset-0 -z-10 rounded-xl bg-indigo-600 shadow-md"
                transition={{ type: "spring", stiffness: 450, damping: 35 }}
              />
            )}
          </button>

          <button
            onClick={() => setActiveTab("month")}
            className={`relative flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-extrabold transition-all ${
              activeTab === "month" ? "text-white" : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <CalendarIcon className="h-4 w-4 text-purple-400" />
            <span>Month Deadlines</span>
            {activeTab === "month" && (
              <motion.div
                layoutId="calendarActiveTabPill"
                className="absolute inset-0 -z-10 rounded-xl bg-indigo-600 shadow-md"
                transition={{ type: "spring", stiffness: 450, damping: 35 }}
              />
            )}
          </button>
        </div>
      </div>

      {/* TAB 1: WEEKLY TIMETABLE */}
      {activeTab === "timetable" && <WeeklyTimetable />}

      {/* TAB 2: AI STUDY PLANNER & PREP MATRIX */}
      {activeTab === "planner" && <StudyPlannerView />}

      {/* TAB 3: MONTH CALENDAR & CLASSROOM DEADLINES */}
      {activeTab === "month" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-white">Month Calendar & Classroom Deadlines</h2>
              <p className="text-xs text-zinc-400">All coursework due dates automatically populated from your active classes.</p>
            </div>

            <div className="flex items-center gap-3">
              <select
                value={selectedCourseFilter}
                onChange={(e) => setSelectedCourseFilter(e.target.value)}
                className="h-9 rounded-lg border border-zinc-800 bg-zinc-900 px-3 text-xs font-medium text-zinc-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="all">All Courses</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>

              <Button
                size="sm"
                onClick={() => setShowAddModal(true)}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md shadow-indigo-600/20"
              >
                <Plus className="h-4 w-4 mr-1.5" /> Add Milestone
              </Button>
            </div>
          </div>

          <Card className="border-zinc-800 bg-zinc-900/90 shadow-sm overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between py-4 px-6 border-b border-zinc-800 bg-zinc-950/40">
              <div className="flex items-center gap-3">
                <CalendarIcon className="h-5 w-5 text-indigo-400" />
                <h2 className="text-lg font-bold text-zinc-100">
                  {format(currentMonth, "MMMM yyyy")}
                </h2>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToToday}
                  className="h-8 text-xs border-zinc-800 hover:bg-zinc-800"
                >
                  Today
                </Button>
                <div className="flex items-center rounded-lg border border-zinc-800 bg-zinc-900">
                  <button
                    onClick={prevMonth}
                    className="p-1.5 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-l-md transition-colors"
                    title="Previous Month"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <div className="h-4 w-[1px] bg-zinc-800" />
                  <button
                    onClick={nextMonth}
                    className="p-1.5 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-r-md transition-colors"
                    title="Next Month"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              <div className="grid grid-cols-7 border-b border-zinc-800 bg-zinc-950/60 text-center text-xs font-semibold uppercase tracking-wider text-zinc-500 py-2.5">
                <div>Sun</div>
                <div>Mon</div>
                <div>Tue</div>
                <div>Wed</div>
                <div>Thu</div>
                <div>Fri</div>
                <div>Sat</div>
              </div>
              <div className="border-t border-zinc-800/80">{rows}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Add Milestone Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-zinc-100">Add Academic Milestone</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="rounded-lg p-1 text-zinc-400 hover:text-zinc-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateEvent} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-zinc-400">Milestone Title</label>
                <Input
                  placeholder="e.g. Midsem Exam / Lab Submission"
                  value={newEventTitle}
                  onChange={(e) => setNewEventTitle(e.target.value)}
                  className="mt-1"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-zinc-400">Date</label>
                  <Input
                    type="date"
                    value={selectedDateForNewEvent}
                    onChange={(e) => setSelectedDateForNewEvent(e.target.value)}
                    className="mt-1"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-zinc-400">Time</label>
                  <Input
                    type="time"
                    value={newEventTime}
                    onChange={(e) => setNewEventTime(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-400">Type</label>
                <select
                  value={newEventType}
                  onChange={(e: any) => setNewEventType(e.target.value)}
                  className="mt-1 flex h-10 w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="exam">Exam / Test (Rose)</option>
                  <option value="study">Deep Study Block (Emerald)</option>
                  <option value="custom">General Deadline (Indigo)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAddModal(false)}
                  className="border-zinc-800 text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
                >
                  Save Milestone
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Selected Event Details Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-xl space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <Badge
                  variant={selectedEvent.type === "assignment" ? "default" : "secondary"}
                  className="text-[10px] uppercase font-bold tracking-wider"
                >
                  {selectedEvent.type}
                </Badge>
                <h3 className="text-lg font-bold text-zinc-100 mt-2">{selectedEvent.title}</h3>
              </div>
              <button
                onClick={() => setSelectedEvent(null)}
                className="rounded-lg p-1 text-zinc-400 hover:text-zinc-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-2 rounded-xl bg-zinc-950 p-4 text-xs text-zinc-400 border border-zinc-800/80">
              {selectedEvent.courseName && (
                <div className="flex items-center justify-between">
                  <span className="font-semibold">Course:</span>
                  <span className="text-zinc-200">{selectedEvent.courseName}</span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="font-semibold">Due Date:</span>
                <span className="text-zinc-200">{selectedEvent.date}</span>
              </div>
              {selectedEvent.time && (
                <div className="flex items-center justify-between">
                  <span className="font-semibold">Due Time:</span>
                  <span className="text-zinc-200">{selectedEvent.time}</span>
                </div>
              )}
              {selectedEvent.maxPoints !== undefined && (
                <div className="flex items-center justify-between">
                  <span className="font-semibold">Maximum Score:</span>
                  <span className="font-bold text-emerald-400">{selectedEvent.maxPoints} pts</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-2">
              {selectedEvent.id.startsWith("custom-") ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteCustomEvent(selectedEvent.id)}
                  className="text-red-400 hover:text-red-300 hover:bg-red-500/10 text-xs"
                >
                  <Trash2 className="h-4 w-4 mr-1" /> Delete
                </Button>
              ) : (
                <span className="text-[11px] text-zinc-500">Google Classroom Sync</span>
              )}

              <div className="flex items-center gap-2">
                {selectedEvent.alternateLink && (
                  <a
                    href={selectedEvent.alternateLink}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 px-3 py-1.5 rounded-lg border border-indigo-500/20"
                  >
                    Open in Classroom <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setSelectedEvent(null)}
                  className="border-zinc-800 text-xs"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
