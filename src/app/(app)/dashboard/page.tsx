'use client';

import { useEffect, useState } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { StatsCards } from '@/components/dashboard/stats-cards';
import { CourseCards, Course } from '@/components/dashboard/course-cards';
import { DeadlineList, Deadline } from '@/components/dashboard/deadline-list';
import { EmailAlertsWidget } from '@/components/dashboard/email-alerts-widget';
import { LiveClassMockSimulator } from '@/components/dashboard/live-class-mock-simulator';
import { ClassroomCourse, ClassroomCourseWork } from '@/types';
import {
  AlertCircle,
  RefreshCw,
  LogIn,
  ExternalLink,
  BookOpen,
  Sparkles,
  Brain,
  Timer,
  Calculator,
  Calendar as CalendarIcon,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function DashboardPage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [errorStatus, setErrorStatus] = useState<number | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [deadlines, setDeadlines] = useState<Deadline[]>([]);
  const [pendingCount, setPendingCount] = useState(0);

  async function fetchData() {
    try {
      setLoading(true);
      setError(null);
      setErrorStatus(null);

      // 1. Fetch courses
      const coursesRes = await fetch('/api/classroom/courses');

      if (!coursesRes.ok) {
        setErrorStatus(coursesRes.status);
        const errJson = await coursesRes.json().catch(() => ({}));
        const errMsg = errJson.error || `HTTP ${coursesRes.status}: Failed to fetch courses`;
        setError(errMsg);
        setLoading(false);
        return;
      }

      const rawCourses: ClassroomCourse[] = await coursesRes.json();
      const coursesList = Array.isArray(rawCourses) ? rawCourses : [];

      // 2. Fetch coursework across all courses
      const courseworkRes = await fetch('/api/classroom/coursework');
      const courseworkData = courseworkRes.ok ? await courseworkRes.json() : { coursework: [] };
      const rawCoursework: ClassroomCourseWork[] = courseworkData.coursework || [];

      // Map courses with assignment counts
      const mappedCourses: Course[] = coursesList.map((c) => {
        const assignmentsForCourse = rawCoursework.filter((w) => w.courseId === c.id);
        return {
          id: c.id,
          name: c.name,
          section: c.section || 'General',
          teacherName: c.descriptionHeading || 'Instructor',
          assignmentsCount: assignmentsForCourse.length,
        };
      });
      setCourses(mappedCourses);

      // Process upcoming deadlines
      const now = new Date();
      const upcomingDeadlines: Deadline[] = [];
      let pending = 0;

      rawCoursework.forEach((work) => {
        if (work.dueDate) {
          const dueYear = work.dueDate.year || now.getFullYear();
          const dueMonth = (work.dueDate.month || 1) - 1;
          const dueDay = work.dueDate.day || 1;
          const dueHour = work.dueTime?.hours || 23;
          const dueMinute = work.dueTime?.minutes || 59;
          const dueDate = new Date(dueYear, dueMonth, dueDay, dueHour, dueMinute);

          const course = coursesList.find((c) => c.id === work.courseId);
          const isPastDue = dueDate < now;

          if (!isPastDue) {
            pending++;
          }

          upcomingDeadlines.push({
            id: work.id,
            courseName: course?.name || 'Course',
            title: work.title,
            dueDate,
            status: isPastDue ? 'overdue' : 'due',
          });
        }
      });

      setDeadlines(upcomingDeadlines);
      setPendingCount(pending);
    } catch (err: any) {
      console.error('Error fetching dashboard data:', err);
      setError(err?.message || 'Failed to connect to Google Classroom.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  const isAuthIssue =
    errorStatus === 401 ||
    error?.toLowerCase().includes('authentication') ||
    error?.toLowerCase().includes('token') ||
    error?.toLowerCase().includes('unauthorized') ||
    error?.toLowerCase().includes('credential');

  const quickShortcuts = [
    {
      title: 'NotebookLM Compiler',
      desc: 'Export syllabus & notes',
      icon: Brain,
      href: '/notebooklm',
      color: 'text-purple-400 border-purple-500/30 bg-purple-500/10',
    },
    {
      title: 'Subject Evals & CGPA',
      desc: 'Calculate target exam marks',
      icon: Calculator,
      href: '/gpa',
      color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
    },
    {
      title: 'Deep Focus Timer',
      desc: 'Pomodoro study chamber',
      icon: Timer,
      href: '/timer',
      color: 'text-amber-400 border-amber-500/30 bg-amber-500/10',
    },
    {
      title: 'SM-2 AI Decks',
      desc: 'Active recall spaced review',
      icon: Sparkles,
      href: '/study',
      color: 'text-indigo-400 border-indigo-500/30 bg-indigo-500/10',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-8 max-w-7xl"
    >
      {/* Header with Ambient Badge */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 px-3 py-0.5 text-[11px] font-bold text-indigo-300">
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-ping" />
              IIIT Delhi • B.Tech CSD
            </div>
            <span className="rounded-full bg-zinc-800/80 border border-zinc-700/60 px-2.5 py-0.5 text-[11px] font-semibold text-zinc-300">
              3rd Semester (Monsoon)
            </span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
            Welcome back, {session?.user?.name?.split(' ')[0] || 'Gaurav'} 👋
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400">
            Here is your active coursework, continuous assessment breakdown, and AI tools.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => fetchData()}
          className="self-start md:self-auto h-9 gap-2 rounded-xl border-zinc-800 bg-zinc-900/80 text-xs font-semibold text-zinc-300 hover:text-white"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Sync Classroom</span>
        </Button>
      </div>

      {/* Error Banner if any */}
      {error && (
        <div className="rounded-3xl border border-red-500/30 bg-red-950/30 p-6 backdrop-blur-md space-y-4 shadow-xl">
          <div className="flex items-start gap-3 text-red-400">
            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
            <div className="space-y-1.5 flex-1">
              <h3 className="font-bold text-sm text-red-200">Google Classroom Connection</h3>
              <p className="text-xs text-red-300/90 leading-relaxed">{error}</p>

              {isAuthIssue && (
                <p className="text-xs text-zinc-300 pt-1">
                  Your Google Classroom session needs to be refreshed. Click below to grant permissions and reload courses.
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-1 border-t border-red-500/20">
            {isAuthIssue ? (
              <Button
                size="sm"
                onClick={() => {
                  signOut({ redirect: false }).then(() => {
                    signIn('google', { callbackUrl: '/dashboard' });
                  });
                }}
                className="h-9 bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 rounded-xl"
              >
                <LogIn className="h-3.5 w-3.5 mr-1.5" /> Sign in Again with Google Classroom
              </Button>
            ) : null}

            <Button
              size="sm"
              variant="outline"
              onClick={() => fetchData()}
              className="h-9 border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-xs font-semibold text-zinc-300 rounded-xl"
            >
              <RefreshCw className="h-3.5 w-3.5 mr-1.5" /> Try Again
            </Button>
          </div>
        </div>
      )}

      {/* Loading Skeletons */}
      {loading ? (
        <div className="space-y-8">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-28 animate-pulse rounded-3xl bg-zinc-900 border border-zinc-800"
              />
            ))}
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            <div className="md:col-span-2 h-72 animate-pulse rounded-3xl bg-zinc-900 border border-zinc-800" />
            <div className="h-72 animate-pulse rounded-3xl bg-zinc-900 border border-zinc-800" />
          </div>
        </div>
      ) : !error ? (
        <>
          {/* Live Class End & Homework Mock Simulator */}
          <LiveClassMockSimulator onSuccess={() => fetchData()} />

          {/* Stats Overview */}
          <StatsCards
            coursesCount={courses.length}
            pendingCount={pendingCount}
            upcomingCount={deadlines.length}
            averageGrade="Continuous"
          />

          {/* Quick Shortcuts Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {quickShortcuts.map((sc) => (
              <Link
                key={sc.title}
                href={sc.href}
                className="group flex items-center gap-3 rounded-2xl border border-white/5 bg-zinc-900/60 p-3.5 backdrop-blur-xl transition-all hover:border-white/15 hover:bg-zinc-800/40"
              >
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${sc.color} transition-transform group-hover:scale-105`}
                >
                  <sc.icon className="h-5 w-5" />
                </div>
                <div className="truncate">
                  <h4 className="text-xs font-bold text-zinc-100 group-hover:text-indigo-300 transition-colors">
                    {sc.title}
                  </h4>
                  <p className="text-[10px] text-zinc-500 truncate">{sc.desc}</p>
                </div>
              </Link>
            ))}
          </div>

          {/* Today's Classes & AI Prep Quick Strip */}
          <div className="rounded-3xl border border-indigo-500/30 bg-gradient-to-r from-indigo-950/40 via-zinc-900/80 to-purple-950/40 p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-300">
                <CalendarIcon className="h-5 w-5" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white">Weekly Class Timetable & AI Prep</span>
                  <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                    Math III Tuesday Test Prep Active
                  </span>
                </div>
                <p className="text-xs text-zinc-400">
                  Room coordinates, lecture times & automated revision slots mapped for all 5 CSD subjects.
                </p>
              </div>
            </div>

            <Link
              href="/calendar"
              className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-500 shadow-md shadow-indigo-600/20 shrink-0 self-start md:self-auto"
            >
              <span>Open Full Timetable</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Main Dashboard Layout */}
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Active Courses Section (2 Cols) */}
            <div className="space-y-4 lg:col-span-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-indigo-400" />
                  <h2 className="text-lg font-bold tracking-tight text-white">
                    Enrolled Courses ({courses.length})
                  </h2>
                </div>
                <Link
                  href="/courses"
                  className="inline-flex items-center gap-1 text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  <span>View All & Archive</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>

              {courses.length === 0 ? (
                <div className="flex min-h-[220px] flex-col items-center justify-center rounded-3xl border border-zinc-800 border-dashed bg-zinc-900/40 p-8 text-center">
                  <BookOpen className="mb-3 h-10 w-10 text-zinc-600" />
                  <h3 className="font-bold text-zinc-200 text-sm">No Active Courses Found</h3>
                  <p className="mt-1 text-xs text-zinc-400 max-w-sm">
                    No active courses found. If your courses are archived from past semesters, check
                    the{' '}
                    <Link href="/courses" className="text-indigo-400 hover:underline">
                      Archived Vault
                    </Link>
                    .
                  </p>
                </div>
              ) : (
                <CourseCards courses={courses} />
              )}
            </div>

            {/* Upcoming Deadlines & Email Radar (1 Col) */}
            <div className="space-y-6">
              <EmailAlertsWidget />

              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5 text-indigo-400" />
                  <h2 className="text-lg font-bold tracking-tight text-white">Classroom Deadlines</h2>
                </div>
                <DeadlineList deadlines={deadlines} />
              </div>
            </div>
          </div>
        </>
      ) : null}
    </motion.div>
  );
}
