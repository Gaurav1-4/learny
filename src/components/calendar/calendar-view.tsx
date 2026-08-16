"use client"

import { useState, useEffect } from "react"
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

        const coursesData: ClassroomCourse[] = coursesRes.ok
          ? await coursesRes.json()
          : []
        const courseworkData = courseworkRes.ok
          ? await courseworkRes.json()
          : { coursework: [] }
        const rawCoursework: ClassroomCourseWork[] = Array.isArray(courseworkData)
          ? courseworkData
          : courseworkData.coursework || []

        setCourses(Array.isArray(coursesData) ? coursesData : [])

        // Map course colors
        const courseColorMap = new Map<string, string>()
        coursesData.forEach((c, idx) => {
          courseColorMap.set(c.id, COURSE_COLORS[idx % COURSE_COLORS.length])
        })

        // Map coursework to calendar events
        const classroomEvents: CalendarEvent[] = []
        rawCoursework.forEach((cw) => {
          if (cw.dueDate) {
            const y = cw.dueDate.year || new Date().getFullYear()
            const m = String(cw.dueDate.month || 1).padStart(2, "0")
            const d = String(cw.dueDate.day || 1).padStart(2, "0")
            const dateStr = `${y}-${m}-${d}`

            let timeStr: string | undefined
            if (cw.dueTime) {
              const h = String(cw.dueTime.hours || 23).padStart(2, "0")
              const min = String(cw.dueTime.minutes || 59).padStart(2, "0")
              timeStr = `${h}:${min}`
            }

            const course = coursesData.find((c) => c.id === cw.courseId)

            classroomEvents.push({
              id: `cw-${cw.id}`,
              title: cw.title,
              date: dateStr,
              time: timeStr,
              courseId: cw.courseId,
              courseName: course?.name || "Course",
              color: courseColorMap.get(cw.courseId) || COURSE_COLORS[0],
              type: "assignment",
              maxPoints: cw.maxPoints,
              alternateLink: cw.alternateLink,
            })
          }
        })

        setEvents(classroomEvents)
      } catch (err) {
        console.error("Failed to load calendar data", err)
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
                {ev.time && <span className="mr-1 opacity-75">{ev.time}</span>}
                {ev.title}
              </button>
            ))}
            {dayEvents.length > 3 && (
              <div className="text-[10px] font-semibold text-zinc-500 pl-1">
                +{dayEvents.length - 3} more
              </div>
            )}
          </div>
        </div>
      )
      day = addDays(day, 1)
    }
    rows.push(
      <div className="grid grid-cols-7" key={day.toISOString()}>
        {days}
      </div>
    )
    days = []
  }

  const handleAddCustomEvent = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newEventTitle.trim()) return

    const course = courses.find((c) => c.id === newEventCourseId)
    const colorIndex = courses.findIndex((c) => c.id === newEventCourseId)
    const color =
      colorIndex >= 0 ? COURSE_COLORS[colorIndex % COURSE_COLORS.length] : COURSE_COLORS[0]

    const newEv: CalendarEvent = {
      id: `custom-${Date.now()}`,
      title: newEventTitle.trim(),
      date: selectedDateForNewEvent,
      time: newEventTime,
      courseId: newEventCourseId || undefined,
      courseName: course?.name || (newEventCourseId ? "Course" : "General"),
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
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-100">Academic Calendar</h1>
          <p className="text-sm text-zinc-400 mt-1">
            Deadlines, exams, and study milestones in one unified view.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Course filter */}
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

      {/* Month Navigator */}
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
          {/* Days of Week Header */}
          <div className="grid grid-cols-7 border-b border-zinc-800 bg-zinc-950/60 text-center text-xs font-semibold uppercase tracking-wider text-zinc-500 py-2.5">
            <div>Sun</div>
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div>Fri</div>
            <div>Sat</div>
          </div>

          {/* Calendar Grid */}
          <div className="border-l border-t border-zinc-800">{rows}</div>
        </CardContent>
      </Card>

      {/* Selected Event Details Modal / Sheet */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl space-y-5">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <Badge variant="outline" className="text-xs uppercase tracking-wider text-indigo-400 border-indigo-500/30">
                  {selectedEvent.type}
                </Badge>
                <h3 className="text-xl font-bold text-zinc-100 leading-snug">{selectedEvent.title}</h3>
                {selectedEvent.courseName && (
                  <p className="text-sm font-medium text-zinc-400">{selectedEvent.courseName}</p>
                )}
              </div>
              <button
                onClick={() => setSelectedEvent(null)}
                className="rounded-lg p-1 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3 rounded-xl bg-zinc-950/60 border border-zinc-800/80 p-4 text-sm">
              <div className="flex items-center gap-2 text-zinc-300">
                <CalendarIcon className="h-4 w-4 text-zinc-500" />
                <span>Date: {format(parseISO(selectedEvent.date), "EEEE, MMMM d, yyyy")}</span>
              </div>
              {selectedEvent.time && (
                <div className="flex items-center gap-2 text-zinc-300">
                  <Clock className="h-4 w-4 text-zinc-500" />
                  <span>Due/Time: {selectedEvent.time}</span>
                </div>
              )}
              {selectedEvent.maxPoints && (
                <div className="flex items-center gap-2 text-zinc-300">
                  <Tag className="h-4 w-4 text-zinc-500" />
                  <span>Maximum Points: {selectedEvent.maxPoints} pts</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-2">
              {selectedEvent.alternateLink ? (
                <a
                  href={selectedEvent.alternateLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500 transition-colors"
                >
                  Open in Classroom <ExternalLink className="h-3.5 w-3.5" />
                </a>
              ) : selectedEvent.id.startsWith("custom-") ? (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDeleteCustomEvent(selectedEvent.id)}
                  className="text-xs"
                >
                  <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete Event
                </Button>
              ) : (
                <div />
              )}

              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedEvent(null)}
                className="text-xs border-zinc-800 hover:bg-zinc-800"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Add Custom Event Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
              <h3 className="text-lg font-bold text-zinc-100">Add Academic Milestone</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="rounded-lg p-1 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddCustomEvent} className="space-y-4 pt-4">
              <div>
                <label className="text-xs font-semibold text-zinc-400">Event Title</label>
                <Input
                  autoFocus
                  placeholder="e.g. Midsem Exam / Group Meeting"
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
                <label className="text-xs font-semibold text-zinc-400">Associated Course</label>
                <select
                  value={newEventCourseId}
                  onChange={(e) => setNewEventCourseId(e.target.value)}
                  className="mt-1 flex h-10 w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="">None (General Event)</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-400">Type</label>
                <select
                  value={newEventType}
                  onChange={(e) => setNewEventType(e.target.value as any)}
                  className="mt-1 flex h-10 w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="exam">Exam / Quiz</option>
                  <option value="study">Study Session</option>
                  <option value="custom">General Task</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800">
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
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs"
                >
                  Save Event
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
