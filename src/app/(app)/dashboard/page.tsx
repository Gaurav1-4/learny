'use client';

import { useEffect, useState } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import { motion } from 'framer-motion';
import { DeadlineList, Deadline } from '@/components/dashboard/deadline-list';
import { ClassroomCourse, ClassroomCourseWork } from '@/types';
import {
  AlertCircle,
  RefreshCw,
  LogIn,
  BookOpen,
  ArrowRight,
  Clock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { PostClassBanner } from '@/components/dashboard/post-class-banner';

export default function DashboardPage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [errorStatus, setErrorStatus] = useState<number | null>(null);
  const [coursesCount, setCoursesCount] = useState(0);
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
      setCoursesCount(coursesList.length);

      // 2. Fetch coursework across all courses
      const courseworkRes = await fetch('/api/classroom/coursework');
      const courseworkData = courseworkRes.ok ? await courseworkRes.json() : { coursework: [] };
      const rawCoursework: ClassroomCourseWork[] = courseworkData.coursework || [];

      // Parse deadlines
      const allDeadlines: Deadline[] = [];
      let pending = 0;

      for (const cw of rawCoursework) {
        const matchingCourse = coursesList.find((c) => c.id === cw.courseId);
        const courseName = matchingCourse ? matchingCourse.name : 'Course';

        if (cw.dueDate) {
          const year = cw.dueDate.year || new Date().getFullYear();
          const month = (cw.dueDate.month || 1) - 1;
          const day = cw.dueDate.day || 1;
          const hours = cw.dueTime?.hours || 23;
          const minutes = cw.dueTime?.minutes || 59;
          const dDate = new Date(year, month, day, hours, minutes);
          const isPast = dDate < new Date();
          const status: 'due' | 'overdue' = isPast ? 'overdue' : 'due';

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

      allDeadlines.sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());
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
  const userName = session?.user?.name ? session.user.name.split(' ')[0] : 'Student';

  const now = new Date();
  const upcomingCount = deadlines.filter((d) => d.dueDate >= now).length;
  const overdueCount = deadlines.filter((d) => d.dueDate < now).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="space-y-5 max-w-4xl"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
        <div>
          <div className="text-[11px] font-medium text-zinc-500">
            IIIT Delhi • Monsoon 2026
          </div>
          <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white mt-0.5">
            Welcome back, {userName}
          </h1>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => fetchData()}
          className="h-8 gap-1.5 rounded-lg border-zinc-800 bg-zinc-900 text-xs font-medium text-zinc-300 hover:text-white"
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
              <h3 className="font-semibold text-xs text-white">Google Account Connection</h3>
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

      {/* Loading Skeleton */}
      {loading ? (
        <div className="space-y-4 animate-pulse">
          <div className="h-20 rounded-xl bg-zinc-900/80 border border-zinc-800" />
          <div className="h-48 rounded-xl bg-zinc-900/80 border border-zinc-800" />
        </div>
      ) : !error ? (
        <>
          {/* Post-Class Timetable Homework Check-In Banner */}
          <PostClassBanner />

          {/* Actionable Today's Summary Card */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-zinc-800 text-zinc-200 border border-zinc-700">
                <Clock className="h-5 w-5" />
              </div>
              <div className="space-y-0.5">
                <div className="text-xs font-semibold text-white">
                  {upcomingCount === 0
                    ? 'All Caught Up!'
                    : `${upcomingCount} Active Upcoming Deadlines`}
                </div>
                <div className="text-[11px] text-zinc-400">
                  {coursesCount} Enrolled Courses {overdueCount > 0 && `• ${overdueCount} Overdue items`}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/courses"
                className="inline-flex items-center gap-1.5 rounded-lg bg-white text-zinc-950 hover:bg-zinc-200 px-3.5 py-1.5 text-xs font-medium transition-colors"
              >
                <BookOpen className="h-3.5 w-3.5" />
                <span>Open Courses</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>

          {/* Upcoming Deadlines Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                Action Items &amp; Deadlines ({deadlines.length})
              </h2>
            </div>
            <DeadlineList deadlines={deadlines} />
          </div>
        </>
      ) : null}
    </motion.div>
  );
}
