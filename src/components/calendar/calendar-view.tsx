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
  MapPin,
  Flame,
  RefreshCw,
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
} from "date-fns"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ClassroomCourse, ClassroomCourseWork } from "@/types"
import { WeeklyTimetable } from "@/components/calendar/weekly-timetable"
import { TIMETABLE_CLASSES, ClassSlot } from "@/lib/timetable-data"
import { BacklogResolverModal } from "@/components/backlog/backlog-resolver-modal"
import { getBacklogStatus } from "@/lib/backlog-engine"

export interface CalendarEvent {
  id: string
  title: string
  date: string // YYYY-MM-DD
  time?: string // HH:mm
  courseId?: string
  courseName?: string
  color?: string
  type: "assignment" | "exam" | "study" | "class" | "custom"
  maxPoints?: number
  alternateLink?: string
  completed?: boolean
  room?: string
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
  const [activeTab, setActiveTab] = useState<"timetable" | "month">("timetable")
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [courses, setCourses] = useState<ClassroomCourse[]>([])
  const [monthFilter, setMonthFilter] = useState<"all" | "classes" | "homework">("all")
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [customEvents, setCustomEvents] = useState<CalendarEvent[]>([])
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedDateForNewEvent, setSelectedDateForNewEvent] = useState<string>(
    format(new Date(), "yyyy-MM-dd")
  )
  const [showBacklogModal, setShowBacklogModal] = useState(false)
  const [backlogStatus, setBacklogStatus] = useState(getBacklogStatus())
  const [googleSyncLoading, setGoogleSyncLoading] = useState(false)
  const [calendarToast, setCalendarToast] = useState<string | null>(null)

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

          const mappedEvents: CalendarEvent[] = []
          workList.forEach((w) => {
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

  // Calendar navigation
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1))
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1))
  const goToToday = () => setCurrentMonth(new Date())

  // Generate days matrix with real recurring semester classes + homework
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
      const dayName = format(day, "EEEE")
      const currentDay = day
      const isCurrentMonth = isSameMonth(day, monthStart)
      const isToday = isSameDay(day, new Date())

      // 1. Get recurring classes for this day of the week
      const classSlotsForDay: CalendarEvent[] = isCurrentMonth
        ? TIMETABLE_CLASSES.filter((c) => c.day === dayName).map((slot) => ({
            id: `class-${formattedDate}-${slot.id}`,
            title: `${slot.code} (${slot.room})`,
            date: formattedDate,
            time: slot.startTime,
            courseName: slot.subject,
            room: slot.room,
            type: slot.isTest ? "exam" : "class",
            color: slot.isTest
              ? "bg-rose-500/25 text-rose-300 border-rose-500/40 font-bold"
              : slot.type === "Practice" || slot.type === "Tutorial"
              ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
              : "bg-zinc-800/80 text-zinc-300 border-zinc-700/60",
          }))
        : []

      // 2. Get specific homework & custom events
      const homeworkAndCustom = [...events, ...customEvents].filter((e) => e.date === formattedDate)

      // 3. Filter based on user selection
      let combinedDayEvents: CalendarEvent[] = []
      if (monthFilter === "all") {
        combinedDayEvents = [...homeworkAndCustom, ...classSlotsForDay]
      } else if (monthFilter === "classes") {
        combinedDayEvents = classSlotsForDay
      } else {
        combinedDayEvents = homeworkAndCustom
      }

      days.push(
        <div
          key={formattedDate}
          onClick={() => setSelectedDateForNewEvent(formattedDate)}
          className={`min-h-[105px] border-b border-r border-zinc-800/70 p-1.5 transition-colors flex flex-col justify-between ${
            !isCurrentMonth ? "bg-zinc-950/40 text-zinc-600" : "bg-zinc-900/30 text-zinc-300"
          } ${isToday ? "ring-1 ring-inset ring-blue-500/60 bg-blue-950/15" : ""}`}
        >
          <div className="flex items-center justify-between">
            <span
              className={`text-[11px] font-semibold rounded-full h-5 w-5 flex items-center justify-center ${
                isToday
                  ? "bg-blue-600 text-white font-bold"
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
                className="opacity-0 hover:opacity-100 p-0.5 text-zinc-400 hover:text-zinc-100 transition-opacity"
                title="Add event"
              >
                <Plus className="h-3 w-3" />
              </button>
            )}
          </div>

          <div className="space-y-1 mt-1 overflow-hidden">
            {combinedDayEvents.slice(0, 3).map((ev) => (
              <button
                key={ev.id}
                onClick={(e) => {
                  e.stopPropagation()
                  setSelectedEvent(ev)
                }}
                className={`w-full text-left truncate text-[10px] px-1.5 py-0.5 rounded border font-medium transition-all ${
                  ev.color || "bg-zinc-800 text-zinc-300 border-zinc-700"
                } hover:scale-[1.02]`}
              >
                {ev.time ? `${ev.time} ` : ""}
                {ev.title}
              </button>
            ))}
            {combinedDayEvents.length > 3 && (
              <span className="text-[9px] text-zinc-500 font-semibold px-1">
                +{combinedDayEvents.length - 3} more
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
      title: newEventTitle.trim(),
      date: selectedDateForNewEvent,
      time: newEventTime,
      courseId: newEventCourseId || undefined,
      courseName: course?.name,
      type: newEventType,
      color,
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
    <div className="space-y-4 max-w-5xl">
      {/* Clean Minimalist Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800/80 pb-3">
        <div>
          <div className="text-[11px] font-medium text-zinc-500">Monsoon 2026 • IIIT Delhi</div>
          <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white mt-0.5">
            Schedule &amp; Timetable
          </h1>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Tab Switcher */}
          <div className="flex items-center gap-1 rounded-lg bg-zinc-950 p-0.5 border border-zinc-800 text-xs">
            <button
              onClick={() => setActiveTab("timetable")}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                activeTab === "timetable"
                  ? "bg-zinc-800 text-white font-semibold"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              Weekly Timetable
            </button>
            <button
              onClick={() => setActiveTab("month")}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                activeTab === "month"
                  ? "bg-zinc-800 text-white font-semibold"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              Month Calendar
            </button>
          </div>

          {/* Apple Calendar iCloud 1-Tap Link */}
          <a
            href="webcal://learny.zorx.tech/api/calendar/feed.ics"
            className="h-8 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700 px-3 flex items-center gap-1.5 text-xs font-semibold shadow-sm transition-colors"
            title="1-Tap Subscribe in Apple Calendar (Syncs across Mac, iPhone, iPad via iCloud)"
          >
            <CalendarIcon className="h-3.5 w-3.5 text-zinc-300" />
            <span>Apple Calendar (iCloud)</span>
          </a>

          {/* Google Calendar Sync */}
          <Button
            size="sm"
            onClick={async () => {
              try {
                setGoogleSyncLoading(true)
                const res = await fetch("/api/calendar/google-sync", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ events: [...events, ...customEvents] }),
                })
                const json = await res.json()
                if (res.ok) {
                  setCalendarToast(json.message || "Synced to Google Calendar!")
                } else {
                  setCalendarToast(json.error || "Google Calendar sync failed. Please reconnect Google account.")
                }
              } catch {
                setCalendarToast("Failed to sync to Google Calendar")
              } finally {
                setGoogleSyncLoading(false)
                setTimeout(() => setCalendarToast(null), 4000)
              }
            }}
            disabled={googleSyncLoading}
            className="h-8 bg-blue-600/90 hover:bg-blue-600 text-white text-xs font-semibold px-3 gap-1.5 shadow-sm"
          >
            {googleSyncLoading ? (
              <RefreshCw className="h-3 w-3 animate-spin" />
            ) : (
              <CalendarIcon className="h-3.5 w-3.5" />
            )}
            <span className="hidden sm:inline">Sync Google Calendar</span>
            <span className="sm:hidden">GCal</span>
          </Button>

          {/* 1-Week Backlog Trigger */}
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setShowBacklogModal(true)}
            className="h-8 text-zinc-400 hover:text-white text-xs font-medium px-2 gap-1"
          >
            <Sparkles className="h-3.5 w-3.5 text-zinc-400" />
            <span>Backlog</span>
          </Button>
        </div>
      </div>

      {/* Calendar Toast Notification */}
      <AnimatePresence>
        {calendarToast && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="rounded-lg bg-zinc-900 border border-blue-500/30 p-2.5 flex items-center gap-2 text-xs text-blue-400 font-medium"
          >
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{calendarToast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Backlog Resolver Modal */}
      <BacklogResolverModal
        isOpen={showBacklogModal}
        onClose={() => setShowBacklogModal(false)}
        onUpdated={() => {
          setBacklogStatus(getBacklogStatus())
          const saved = localStorage.getItem("learny-calendar-custom-events")
          if (saved) setCustomEvents(JSON.parse(saved))
        }}
      />

      {/* TAB 1: WEEKLY TIMETABLE */}
      {activeTab === "timetable" && <WeeklyTimetable />}

      {/* TAB 2: MONTH CALENDAR */}
      {activeTab === "month" && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-400">View:</span>
              <div className="flex items-center gap-1 rounded-lg bg-zinc-900 p-0.5 border border-zinc-800 text-xs">
                <button
                  onClick={() => setMonthFilter("all")}
                  className={`rounded px-2 py-1 text-[11px] font-medium transition-colors ${
                    monthFilter === "all" ? "bg-zinc-800 text-white font-semibold" : "text-zinc-400"
                  }`}
                >
                  All (Classes + Deadlines)
                </button>
                <button
                  onClick={() => setMonthFilter("classes")}
                  className={`rounded px-2 py-1 text-[11px] font-medium transition-colors ${
                    monthFilter === "classes" ? "bg-zinc-800 text-white font-semibold" : "text-zinc-400"
                  }`}
                >
                  Classes Only
                </button>
                <button
                  onClick={() => setMonthFilter("homework")}
                  className={`rounded px-2 py-1 text-[11px] font-medium transition-colors ${
                    monthFilter === "homework" ? "bg-zinc-800 text-white font-semibold" : "text-zinc-400"
                  }`}
                >
                  Deadlines Only
                </button>
              </div>
            </div>

            <Button
              size="sm"
              onClick={() => setShowAddModal(true)}
              className="h-8 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-medium border border-zinc-700"
            >
              <Plus className="h-3.5 w-3.5 mr-1" /> Add Milestone
            </Button>
          </div>

          <Card className="border-zinc-800 bg-zinc-900/60 shadow-sm overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between py-3 px-4 border-b border-zinc-800 bg-zinc-950/40">
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4 text-blue-400" />
                <h2 className="text-base font-bold text-zinc-100">
                  {format(currentMonth, "MMMM yyyy")}
                </h2>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToToday}
                  className="h-7 text-xs border-zinc-800 hover:bg-zinc-800 px-2.5"
                >
                  Today
                </Button>
                <div className="flex items-center rounded-lg border border-zinc-800 bg-zinc-900">
                  <button
                    onClick={prevMonth}
                    className="p-1 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-l-md transition-colors"
                    title="Previous Month"
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                  </button>
                  <div className="h-3.5 w-[1px] bg-zinc-800" />
                  <button
                    onClick={nextMonth}
                    className="p-1 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-r-md transition-colors"
                    title="Next Month"
                  >
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              {/* Day headers */}
              <div className="grid grid-cols-7 border-b border-zinc-800 bg-zinc-950/20 text-center py-2 text-xs font-semibold text-zinc-400">
                <span>Sun</span>
                <span>Mon</span>
                <span>Tue</span>
                <span>Wed</span>
                <span>Thu</span>
                <span>Fri</span>
                <span>Sat</span>
              </div>

              {/* Day grid */}
              <div className="bg-zinc-950/10">{rows}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Add Custom Event Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-base font-bold text-white">Add Study Milestone</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-zinc-400 hover:text-zinc-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateEvent} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-zinc-300">Title</label>
                <Input
                  value={newEventTitle}
                  onChange={(e) => setNewEventTitle(e.target.value)}
                  placeholder="e.g. Thomas Calculus Practice, Lab Submission"
                  className="mt-1 bg-zinc-950 border-zinc-800 text-xs"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-zinc-300">Date</label>
                  <Input
                    type="date"
                    value={selectedDateForNewEvent}
                    onChange={(e) => setSelectedDateForNewEvent(e.target.value)}
                    className="mt-1 bg-zinc-950 border-zinc-800 text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-zinc-300">Time</label>
                  <Input
                    type="time"
                    value={newEventTime}
                    onChange={(e) => setNewEventTime(e.target.value)}
                    className="mt-1 bg-zinc-950 border-zinc-800 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-300">Associated Course</label>
                <select
                  value={newEventCourseId}
                  onChange={(e) => setNewEventCourseId(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-950 p-2 text-xs text-zinc-200"
                >
                  <option value="">General / None</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-300">Type</label>
                <div className="grid grid-cols-3 gap-2 mt-1">
                  {(["study", "exam", "custom"] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setNewEventType(t)}
                      className={`rounded-lg border py-1.5 text-xs font-semibold capitalize transition-all ${
                        newEventType === t
                          ? "border-blue-500 bg-blue-500/20 text-blue-300"
                          : "border-zinc-800 bg-zinc-950 text-zinc-400"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-zinc-800">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAddModal(false)}
                  className="border-zinc-800 text-xs"
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm" className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold">
                  Save Event
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Event Details Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-5 shadow-xl space-y-4">
            <div className="flex items-start justify-between border-b border-zinc-800 pb-3">
              <div>
                <Badge
                  variant="outline"
                  className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${
                    selectedEvent.type === "exam"
                      ? "border-rose-500/40 bg-rose-500/20 text-rose-300"
                      : "border-blue-500/40 bg-blue-500/20 text-blue-300"
                  }`}
                >
                  {selectedEvent.type}
                </Badge>
                <h3 className="text-base font-bold text-white">{selectedEvent.title}</h3>
                {selectedEvent.courseName && (
                  <p className="text-xs text-zinc-400 mt-0.5">{selectedEvent.courseName}</p>
                )}
              </div>
              <button
                onClick={() => setSelectedEvent(null)}
                className="text-zinc-400 hover:text-zinc-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs text-zinc-300">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-zinc-400">Date:</span>
                <span className="text-zinc-200">{selectedEvent.date}</span>
              </div>
              {selectedEvent.time && (
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-zinc-400">Time:</span>
                  <span className="text-zinc-200">{selectedEvent.time}</span>
                </div>
              )}
              {selectedEvent.room && (
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-zinc-400">Location:</span>
                  <span className="text-zinc-200">Room {selectedEvent.room}</span>
                </div>
              )}
              {selectedEvent.maxPoints !== undefined && (
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-zinc-400">Maximum Points:</span>
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
                <span className="text-[11px] text-zinc-500">Official Monsoon 2026 Timetable</span>
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
