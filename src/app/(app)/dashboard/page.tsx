'use client';

import { useEffect, useState } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertCircle,
  RefreshCw,
  LogIn,
  BookOpen,
  ArrowRight,
  Clock,
  CheckCircle2,
  Bell,
  Calendar as CalendarIcon,
  Sparkles,
  ExternalLink,
  Plus,
  FileText,
  Video,
  ChevronRight,
  Layers,
  Flame,
  Brain,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { ClassroomCourse, ClassroomCourseWork } from '@/types';
import { HomeworkLoggerModal } from '@/components/homework/homework-logger-modal';
import { triggerFullCloudSync } from '@/components/sync/cloud-sync-hydrator';
import { TIMETABLE_CLASSES, ClassSlot } from '@/lib/timetable-data';
import { getAcademicDateInfo } from '@/lib/academic-calendar-engine';
import { format, formatDistanceToNow, isPast } from 'date-fns';

interface DashboardDeadline {
  id: string;
  title: string;
  courseName: string;
  courseCode: string;
  dueDate: Date;
  status: 'due' | 'overdue';
  maxPoints?: number;
  alternateLink?: string;
}

interface DashboardAnnouncement {
  id: string;
  text: string;
  courseName: string;
  courseCode: string;
  creationTime?: string;
  alternateLink?: string;
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [errorStatus, setErrorStatus] = useState<number | null>(null);
  const [courses, setCourses] = useState<ClassroomCourse[]>([]);
  const [deadlines, setDeadlines] = useState<DashboardDeadline[]>([]);
  const [announcements, setAnnouncements] = useState<DashboardAnnouncement[]>([]);
  const [syncToast, setSyncToast] = useState<string | null>(null);
  const [showHomeworkModal, setShowHomeworkModal] = useState(false);
  const [dismissedBanner, setDismissedBanner] = useState(false);

  // Load dashboard data
  async function fetchDashboardData(isFresh = false) {
    try {
      if (courses.length === 0) setLoading(true);
      setError(null);
      setErrorStatus(null);

      // Non-blocking background cloud sync
      triggerFullCloudSync().catch(() => {});

      // 1. Fetch courses, coursework, and announcements in parallel
      const freshParam = isFresh ? '?fresh=true' : '';
      const [coursesRes, courseworkRes, announcementsRes] = await Promise.all([
        fetch(`/api/classroom/courses${freshParam}`),
        fetch(`/api/classroom/coursework${freshParam}`),
        fetch(`/api/classroom/announcements${freshParam}`).catch(() => null),
      ]);

      if (!coursesRes.ok) {
        setErrorStatus(coursesRes.status);
        const errJson = await coursesRes.json().catch(() => ({}));
        setError(errJson.error || `HTTP ${coursesRes.status}: Failed to fetch courses`);
        setLoading(false);
        return;
      }

      const rawCourses: ClassroomCourse[] = await coursesRes.json();
      const rawList = Array.isArray(rawCourses) ? rawCourses : [];

      // Get user-hidden courses from local storage
      const hiddenRaw = localStorage.getItem('learny_hidden_courses');
      const hiddenIds: string[] = hiddenRaw ? JSON.parse(hiddenRaw) : [];

      // Filter out past courses (like unarchived HCI from previous terms)
      const courseList = rawList.filter((c) => {
        if (hiddenIds.includes(c.id)) return false;
        const nameLower = (c.name || '').toLowerCase();
        if (nameLower.includes('human computer interaction') || nameLower.includes('hci') || nameLower.includes('des102')) {
          return false;
        }
        return true;
      });

      setCourses(courseList);
      const activeCourseIds = new Set(courseList.map((c) => c.id));

      // 2. Map Deadlines (only for active semester courses)
      const courseworkData = courseworkRes.ok ? await courseworkRes.json() : { coursework: [] };
      const rawCoursework: ClassroomCourseWork[] = courseworkData.coursework || [];

      const allDeadlines: DashboardDeadline[] = [];
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      for (const cw of rawCoursework) {
        if (!activeCourseIds.has(cw.courseId)) continue;

        const matchingCourse = courseList.find((c) => c.id === cw.courseId);
        const courseName = matchingCourse ? matchingCourse.name : 'Course';
        const courseCode = matchingCourse?.section || courseName.split(' ')[0] || 'COURSE';

        if (cw.dueDate) {
          const year = cw.dueDate.year || new Date().getFullYear();
          const month = (cw.dueDate.month || 1) - 1;
          const day = cw.dueDate.day || 1;
          const hours = cw.dueTime?.hours || 23;
          const minutes = cw.dueTime?.minutes || 59;
          const dDate = new Date(year, month, day, hours, minutes);

          if (dDate < thirtyDaysAgo) continue;

          const status: 'due' | 'overdue' = dDate < new Date() ? 'overdue' : 'due';

          allDeadlines.push({
            id: cw.id,
            title: cw.title,
            courseName,
            courseCode,
            dueDate: dDate,
            status,
            maxPoints: cw.maxPoints,
            alternateLink: cw.alternateLink,
          });
        }
      }

      allDeadlines.sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());
      setDeadlines(allDeadlines);

      // 3. Map Announcements (only for active semester courses)
      let activeAnnouncements: any[] = [];
      if (announcementsRes && announcementsRes.ok) {
        const annData = await announcementsRes.json();
        activeAnnouncements = (annData.announcements || []).filter((a: any) =>
          activeCourseIds.has(a.courseId)
        );
        setAnnouncements(activeAnnouncements.slice(0, 8));
      }

      // Persist to sessionStorage for instant 0ms subsequent page loads
      try {
        sessionStorage.setItem(
          'learny_dashboard_cache',
          JSON.stringify({
            courses: courseList,
            deadlines: allDeadlines,
            announcements: activeAnnouncements.slice(0, 8),
            cachedAt: Date.now(),
          })
        );
      } catch {}
    } catch (err: any) {
      console.error('Error fetching dashboard data:', err);
      setError(err.message || 'Failed to connect to Google Classroom.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // 0ms Instant Hydration from sessionStorage cache
    try {
      const cached = sessionStorage.getItem('learny_dashboard_cache');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed.courses?.length > 0) {
          setCourses(parsed.courses);
          if (parsed.deadlines) {
            setDeadlines(
              parsed.deadlines.map((d: any) => ({
                ...d,
                dueDate: new Date(d.dueDate),
              }))
            );
          }
          if (parsed.announcements) setAnnouncements(parsed.announcements);
          setLoading(false);
        }
      }
    } catch {}

    fetchDashboardData();
  }, []);

  const userName = session?.user?.name ? session.user.name.split(' ')[0] : 'Gaurav';
  const now = new Date();
  const academicDateInfo = getAcademicDateInfo(now);
  const currentDayName = academicDateInfo.effectiveDayOfWeek;
  const todayClasses = academicDateInfo.effectiveClasses;

  const pendingDeadlines = deadlines.filter((d) => d.status === 'due');
  const overdueDeadlines = deadlines.filter((d) => d.status === 'overdue');

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.15 }}
      className="space-y-6 max-w-6xl mx-auto"
    >
      {/* 1. Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider">
              IIIT Delhi • Monsoon 2026
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-950/40 border border-emerald-800/50 px-2 py-0.5 text-[10px] text-emerald-400 font-medium">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Firebase Cloud Synced
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white mt-1">
            Welcome back, {userName}
          </h1>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            size="sm"
            onClick={() => setShowHomeworkModal(true)}
            className="h-8 gap-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow-md shadow-indigo-600/20"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Log Homework (AI)</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={async () => {
              await fetchDashboardData(true);
              setSyncToast('Refreshed live data with Firebase & Google Classroom!');
              setTimeout(() => setSyncToast(null), 3000);
            }}
            className="h-8 gap-1.5 rounded-lg border-zinc-800 bg-zinc-900 text-xs font-medium text-zinc-300 hover:text-white hover:border-zinc-700"
          >
            <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
            <span>Sync</span>
          </Button>
        </div>
      </div>

      {/* Sync Toast */}
      <AnimatePresence>
        {syncToast && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="rounded-xl bg-zinc-900 border border-emerald-500/30 p-3 flex items-center gap-2 text-xs text-emerald-400 font-medium shadow-lg"
          >
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{syncToast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. Error Banner */}
      {error && (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4 space-y-3">
          <div className="flex items-start gap-2.5 text-zinc-300">
            <AlertCircle className="h-4 w-4 shrink-0 text-amber-400 mt-0.5" />
            <div className="space-y-0.5 flex-1">
              <h3 className="font-semibold text-xs text-white">Google Account Session</h3>
              <p className="text-xs text-zinc-400">{error}</p>
            </div>
          </div>
          {errorStatus === 401 && (
            <Button
              size="sm"
              onClick={() => signOut({ redirect: false }).then(() => signIn('google', { callbackUrl: '/dashboard' }))}
              className="h-8 bg-white text-zinc-950 hover:bg-zinc-200 text-xs font-medium"
            >
              <LogIn className="h-3.5 w-3.5 mr-1.5" />
              Reconnect Classroom Account
            </Button>
          )}
        </div>
      )}

      {/* 2. GAHA 24x7 Life Executive Manager Banner */}
      <div className="rounded-2xl border border-indigo-500/30 bg-zinc-900/70 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-start gap-3.5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400">
            <Brain className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-400">
                24x7 Life Manager
              </span>
              <span className="rounded-full bg-indigo-950/60 border border-indigo-800/50 px-2 py-0.2 text-[10px] font-mono text-indigo-300 font-medium">
                {academicDateInfo.weekLabel} • {academicDateInfo.phaseTitle}
              </span>
              {academicDateInfo.isTTA && (
                <span className="rounded-full bg-amber-950/60 border border-amber-800/50 px-2 py-0.2 text-[10px] font-mono text-amber-300 font-medium">
                  ⚡ TTA Active: {academicDateInfo.ttaTargetDay} TT
                </span>
              )}
            </div>
            <h3 className="text-sm sm:text-base font-bold text-white">
              {academicDateInfo.isHoliday
                ? `Gazetted Holiday: ${academicDateInfo.holidayName}`
                : `Today: ${academicDateInfo.effectiveClasses.length} Classes Running • ${academicDateInfo.daysToMidsem} Days to Midsems`}
            </h3>
            <p className="text-xs text-zinc-400">
              {academicDateInfo.specialNotes ||
                `Manager has synchronized your timeline, study blocks, and personal schedule.`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <a href={process.env.NODE_ENV === 'development' ? 'http://gaha.localhost:3000' : 'https://gaha.zorx.tech'}>
            <Button
              size="sm"
              className="h-8 gap-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow-md shadow-indigo-600/20"
            >
              <span>Open Command Center</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </a>
        </div>
      </div>

      {/* 3. Compact Smart Homework Banner (Only if homework prompt is active & not dismissed) */}
      {!dismissedBanner && (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 mt-0.5">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">
                  AI Homework &amp; Backlog Resolver
                </span>
              </div>
              <h3 className="text-xs sm:text-sm font-semibold text-white mt-0.5">
                Have unlogged homework or problem sets from today&apos;s lectures?
              </h3>
              <p className="text-[11px] text-zinc-400">
                Log shorthand or voice notes — Gemini automatically formats KaTeX math and syncs to your calendar.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              size="sm"
              onClick={() => setShowHomeworkModal(true)}
              className="h-8 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-3 shadow-sm shadow-indigo-600/30"
            >
              <span>+ Log Homework</span>
              <ChevronRight className="h-3.5 w-3.5 ml-1" />
            </Button>

            <button
              onClick={() => setDismissedBanner(true)}
              className="rounded-lg p-1.5 text-zinc-500 hover:text-white hover:bg-zinc-800 transition-colors"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* 4. High-Density Main Dashboard Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
          <div className="h-64 rounded-2xl bg-zinc-900/60 border border-zinc-800" />
          <div className="h-64 rounded-2xl bg-zinc-900/60 border border-zinc-800" />
          <div className="h-64 rounded-2xl bg-zinc-900/60 border border-zinc-800" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* COLUMN 1: Pending Assignments & Action Items (High Priority) */}
          <div className="lg:col-span-1 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-indigo-400" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                  Pending Assignments ({pendingDeadlines.length})
                </h2>
              </div>
              <Link href="/courses" className="text-[11px] text-indigo-400 hover:text-indigo-300 font-medium">
                View All →
              </Link>
            </div>

            {deadlines.length === 0 ? (
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-6 text-center space-y-2">
                <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto" />
                <h4 className="text-xs font-semibold text-white">All caught up!</h4>
                <p className="text-[11px] text-zinc-500">No active assignment deadlines pending.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {deadlines.slice(0, 5).map((item) => {
                  const isOverdue = item.status === 'overdue';
                  return (
                    <div
                      key={item.id}
                      className="rounded-xl border border-zinc-800/90 bg-zinc-900/50 hover:border-zinc-700 p-3.5 space-y-2 transition-all flex flex-col justify-between"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-[9px] font-mono border-zinc-700 bg-zinc-950 text-zinc-300">
                              {item.courseCode}
                            </Badge>
                            <span className="text-[10px] text-zinc-500 truncate max-w-[150px]">
                              {item.courseName}
                            </span>
                          </div>
                          <h4 className="text-xs font-semibold text-white line-clamp-2">
                            {item.title}
                          </h4>
                        </div>

                        <span
                          className={`shrink-0 rounded-md px-2 py-0.5 text-[10px] font-medium border ${
                            isOverdue
                              ? 'bg-red-950/40 border-red-800/40 text-red-400'
                              : 'bg-indigo-950/40 border-indigo-800/40 text-indigo-300'
                          }`}
                        >
                          {isOverdue ? 'Overdue' : format(item.dueDate, 'MMM d, h:mm a')}
                        </span>
                      </div>

                      <div className="flex items-center justify-between pt-1 text-[10px] text-zinc-500 border-t border-zinc-800/60">
                        <span>{item.maxPoints ? `${item.maxPoints} Points` : 'Graded'}</span>
                        {item.alternateLink && (
                          <a
                            href={item.alternateLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-zinc-400 hover:text-white inline-flex items-center gap-1"
                          >
                            <span>Open Classroom</span>
                            <ExternalLink className="h-2.5 w-2.5" />
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* COLUMN 2: Recent Academic Notifications & Announcements */}
          <div className="lg:col-span-1 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-purple-400" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                  Recent Notifications ({announcements.length})
                </h2>
              </div>
            </div>

            {announcements.length === 0 ? (
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-6 text-center space-y-2">
                <Bell className="h-8 w-8 text-zinc-600 mx-auto" />
                <h4 className="text-xs font-semibold text-white">No recent announcements</h4>
                <p className="text-[11px] text-zinc-500">Classroom notices will appear here in real time.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {announcements.map((ann) => (
                  <div
                    key={ann.id}
                    className="rounded-xl border border-zinc-800/90 bg-zinc-900/50 hover:border-zinc-700 p-3.5 space-y-1.5 transition-all"
                  >
                    <div className="flex items-center justify-between text-[10px]">
                      <Badge variant="outline" className="text-[9px] font-mono border-zinc-700 bg-zinc-950 text-purple-300">
                        {ann.courseCode}
                      </Badge>
                      {ann.creationTime && (
                        <span className="text-zinc-500">
                          {formatDistanceToNow(new Date(ann.creationTime), { addSuffix: true })}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-zinc-300 line-clamp-3 leading-relaxed">
                      {ann.text}
                    </p>

                    {ann.alternateLink && (
                      <div className="pt-1 flex justify-end">
                        <a
                          href={ann.alternateLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] text-purple-400 hover:text-purple-300 inline-flex items-center gap-1 font-medium"
                        >
                          <span>View Notice</span>
                          <ExternalLink className="h-2.5 w-2.5" />
                        </a>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* COLUMN 3: Today's Schedule & Academic Hub */}
          <div className="lg:col-span-1 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4 text-emerald-400" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                  Today&apos;s Classes ({currentDayName})
                </h2>
              </div>
              <Link href="/calendar" className="text-[11px] text-emerald-400 hover:text-emerald-300 font-medium">
                Full Schedule →
              </Link>
            </div>

            <div className="space-y-2">
              {todayClasses.length === 0 ? (
                <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-6 text-center space-y-1.5">
                  <CheckCircle2 className="h-6 w-6 text-emerald-400 mx-auto" />
                  <h4 className="text-xs font-semibold text-white">No scheduled classes today</h4>
                  <p className="text-[11px] text-zinc-500">Enjoy your weekend or study in the NotebookLM Vault.</p>
                </div>
              ) : (
                todayClasses.map((slot) => (
                  <div
                    key={slot.id}
                    className="rounded-xl border border-zinc-800/90 bg-zinc-900/50 p-3.5 space-y-1.5 transition-all"
                  >
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-white">{slot.timeLabel}</span>
                      <span className="rounded bg-zinc-800 px-2 py-0.5 text-[10px] font-mono text-zinc-300">
                        Room {slot.room}
                      </span>
                    </div>

                    <div className="text-xs font-medium text-zinc-200 truncate">
                      {slot.subject}
                    </div>

                    {slot.isTest && (
                      <div className="inline-flex items-center gap-1 rounded bg-rose-950/40 border border-rose-800/40 px-2 py-0.5 text-[10px] text-rose-300 font-bold">
                        <Flame className="h-2.5 w-2.5 text-rose-400" />
                        <span>Graded Test</span>
                      </div>
                    )}
                  </div>
                ))
              )}

              {/* Quick Jump Shortcuts */}
              <div className="pt-2">
                <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-4 space-y-2.5">
                  <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                    Quick Study Shortcuts
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      href="/study?tab=vault"
                      className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 hover:border-zinc-700 text-xs font-medium text-zinc-300 hover:text-white transition-colors flex items-center gap-2"
                    >
                      <Layers className="h-3.5 w-3.5 text-indigo-400" />
                      <span>NotebookLM Vault</span>
                    </Link>
                    <Link
                      href="/gpa"
                      className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 hover:border-zinc-700 text-xs font-medium text-zinc-300 hover:text-white transition-colors flex items-center gap-2"
                    >
                      <BookOpen className="h-3.5 w-3.5 text-emerald-400" />
                      <span>Evaluations &amp; GPA</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Homework Logger Modal with Gemini AI */}
      <HomeworkLoggerModal
        isOpen={showHomeworkModal}
        onClose={() => setShowHomeworkModal(false)}
        classItem={{
          id: 'manual-hw-log',
          courseId: courses[0]?.id || 'mth203',
          courseName: courses[0]?.name || 'Math III (Applied Mathematics III)',
          courseCode: courses[0]?.section || 'MTH203',
          dayOfWeek: now.getDay(),
          dayName: currentDayName,
          startTime: '11:00',
          endTime: '12:30',
          timeLabel: '11:00 AM – 12:30 PM',
          room: 'Lecture Hall',
          type: 'Lecture',
        }}
        onSaved={() => {
          fetchDashboardData();
          setShowHomeworkModal(false);
        }}
      />
    </motion.div>
  );
}
