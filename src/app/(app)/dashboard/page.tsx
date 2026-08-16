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
  BookOpen,
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

      // Map courses with coursework counts
      const mappedCourses: Course[] = coursesList.map((c) => ({
        id: c.id,
        name: c.name,
        section: c.section || '',
        teacherName: c.teacherGroupEmail ? c.teacherGroupEmail.split('@')[0] : 'Instructor',
        assignmentsCount: rawCoursework.filter((cw) => cw.courseId === c.id).length,
      }));

      // Parse deadlines
      const allDeadlines: Deadline[] = [];
      let pending = 0;

      for (const cw of rawCoursework) {
        const matchingCourse = coursesList.find((c) => c.id === cw.courseId);
        const courseName = matchingCourse ? matchingCourse.name : 'Unknown Course';

        let dueDateString: string | null = null;
        let isPast = false;

        if (cw.dueDate) {
          const year = cw.dueDate.year || new Date().getFullYear();
          const month = (cw.dueDate.month || 1) - 1;
          const day = cw.dueDate.day || 1;
          const hours = cw.dueTime?.hours || 23;
          const minutes = cw.dueTime?.minutes || 59;
          const dDate = new Date(year, month, day, hours, minutes);
          const isPast = dDate < new Date();
          const status: "due" | "overdue" = isPast ? 'overdue' : 'due';

          pending++;

          allDeadlines.push({
            id: cw.id,
            title: cw.title,
            courseName,
            dueDate: dDate,
            status,
          });
        }
      }

      // Sort deadlines by date ascending
      allDeadlines.sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());

      setCourses(mappedCourses);
      setDeadlines(allDeadlines);
      setPendingCount(pending);
    } catch (err: any) {
      console.error('Error fetching dashboard data:', err);
      setError(err.message || 'Failed to connect to Google Classroom.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  const isAuthIssue = errorStatus === 401 || (error && error.includes('401'));

  const quickShortcuts = [
    {
      title: 'Timetable & Schedule',
      desc: 'Monsoon 2026 calendar',
      icon: CalendarIcon,
      href: '/calendar',
    },
    {
      title: 'Continuous Evaluation',
      desc: 'Midsems & target planner',
      icon: Calculator,
      href: '/gpa',
    },
    {
      title: 'NotebookLM Dual-Hub',
      desc: 'Study decks & 5 TB vault',
      icon: Brain,
      href: '/notebooklm',
    },
    {
      title: 'Focus Chamber',
      desc: 'Pomodoro timer',
      icon: Timer,
      href: '/timer',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="space-y-6 max-w-6xl"
    >
      {/* Quiet Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-4">
        <div>
          <div className="text-[11px] font-medium text-zinc-500">
            IIIT Delhi • 3rd Semester B.Tech CSD
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white mt-0.5">
            Dashboard
          </h1>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => fetchData()}
          className="self-start sm:self-auto h-8 gap-1.5 rounded-lg border-zinc-800 bg-zinc-900 text-xs font-medium text-zinc-300 hover:text-white"
        >
          <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
          <span>Sync</span>
        </Button>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 space-y-3">
          <div className="flex items-start gap-2.5 text-zinc-300">
            <AlertCircle className="h-4 w-4 shrink-0 text-zinc-400 mt-0.5" />
            <div className="space-y-1 flex-1">
              <h3 className="font-semibold text-xs text-white">Classroom Connection</h3>
              <p className="text-xs text-zinc-400">{error}</p>
            </div>
          </div>

          {isAuthIssue && (
            <div className="pt-2 border-t border-zinc-800">
              <Button
                size="sm"
                onClick={() => {
                  signOut({ redirect: false }).then(() => {
                    signIn('google', { callbackUrl: '/dashboard' });
                  });
                }}
                className="h-8 bg-white text-zinc-950 hover:bg-zinc-200 text-xs font-medium"
              >
                <LogIn className="h-3.5 w-3.5 mr-1" />
                Reconnect Google Classroom
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Loading Skeletons */}
      {loading ? (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-24 animate-pulse rounded-xl bg-zinc-900 border border-zinc-800"
              />
            ))}
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="md:col-span-2 h-64 animate-pulse rounded-xl bg-zinc-900 border border-zinc-800" />
            <div className="h-64 animate-pulse rounded-xl bg-zinc-900 border border-zinc-800" />
          </div>
        </div>
      ) : !error ? (
        <>
          {/* Post-Class Simulator */}
          <LiveClassMockSimulator onSuccess={() => fetchData()} />

          {/* Stats Overview */}
          <StatsCards
            coursesCount={courses.length}
            pendingCount={pendingCount}
            upcomingCount={deadlines.length}
            averageGrade="Continuous"
          />

          {/* Quick Shortcuts Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {quickShortcuts.map((sc) => (
              <Link
                key={sc.title}
                href={sc.href}
                className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-3.5 transition-colors hover:border-zinc-700 hover:bg-zinc-900/70 block"
              >
                <div className="flex items-center gap-2">
                  <sc.icon className="h-4 w-4 text-zinc-400 shrink-0" />
                  <div className="text-xs font-semibold text-zinc-200 truncate">{sc.title}</div>
                </div>
                <div className="text-[10px] text-zinc-500 mt-1 truncate">{sc.desc}</div>
              </Link>
            ))}
          </div>

          {/* College Email Notice Radar */}
          <EmailAlertsWidget />

          {/* Main Grid: Active Courses + Deadlines */}
          <div className="grid gap-6 md:grid-cols-3">
            <div className="md:col-span-2 space-y-4">
              <CourseCards courses={courses} />
            </div>

            <div className="space-y-4">
              <DeadlineList deadlines={deadlines} />
            </div>
          </div>
        </>
      ) : null}
    </motion.div>
  );
}
