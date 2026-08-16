'use client';

import { useEffect, useState } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import { StatsCards } from '@/components/dashboard/stats-cards';
import { CourseCards, Course } from '@/components/dashboard/course-cards';
import { DeadlineList, Deadline } from '@/components/dashboard/deadline-list';
import { ClassroomCourse, ClassroomCourseWork } from '@/types';
import { AlertCircle, RefreshCw, LogIn, ExternalLink, BookOpen, ShieldAlert } from 'lucide-react';
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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-100">
          Welcome back, {session?.user?.name || 'Student'}
        </h1>
        <p className="text-sm text-zinc-400">
          Here is what is happening across your Google Classroom courses today.
        </p>
      </div>

      {/* Error Banner if any */}
      {error && (
        <div className="rounded-2xl border border-red-500/30 bg-red-950/30 p-6 backdrop-blur-sm space-y-4">
          <div className="flex items-start gap-3 text-red-400">
            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
            <div className="space-y-1.5 flex-1">
              <h3 className="font-bold text-sm text-red-200">Google Classroom Connection Issue</h3>
              <p className="text-xs text-red-300/90 leading-relaxed">{error}</p>
              
              {isAuthIssue && (
                <p className="text-xs text-zinc-300 pt-1">
                  Your Google Classroom OAuth session needs to be refreshed. Click <strong>&quot;Sign in Again with Google&quot;</strong> below to grant access and reload your courses.
                </p>
              )}

              {error.includes("disabled") || error.includes("Google Classroom API") ? (
                <div className="pt-2 text-xs text-zinc-300 space-y-1">
                  <p>Enable the Google Classroom API in your Google Cloud Console project:</p>
                  <a
                    href="https://console.cloud.google.com/apis/library/classroom.googleapis.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-indigo-400 hover:underline font-semibold"
                  >
                    Open Google Classroom API in Cloud Console <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
              ) : null}
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
                className="h-9 bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white shadow-lg shadow-indigo-600/30"
              >
                <LogIn className="h-3.5 w-3.5 mr-1.5" /> Sign in Again with Google Classroom
              </Button>
            ) : null}

            <Button
              size="sm"
              variant="outline"
              onClick={() => fetchData()}
              className="h-9 border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-xs font-semibold text-zinc-300"
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
              <div key={i} className="h-28 animate-pulse rounded-2xl bg-zinc-900 border border-zinc-800" />
            ))}
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            <div className="md:col-span-2 h-64 animate-pulse rounded-2xl bg-zinc-900 border border-zinc-800" />
            <div className="h-64 animate-pulse rounded-2xl bg-zinc-900 border border-zinc-800" />
          </div>
        </div>
      ) : !error ? (
        <>
          {/* Stats Overview */}
          <StatsCards
            coursesCount={courses.length}
            pendingCount={pendingCount}
            upcomingCount={deadlines.length}
            averageGrade="N/A"
          />

          {/* Main Dashboard Layout */}
          <div className="grid gap-8 md:grid-cols-3">
            {/* Active Courses Section (2 Cols) */}
            <div className="space-y-4 md:col-span-2">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold tracking-tight text-zinc-100">Enrolled Courses</h2>
                <Link
                  href="/courses"
                  className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  View all courses & archive &rarr;
                </Link>
              </div>

              {courses.length === 0 ? (
                <div className="flex min-h-[220px] flex-col items-center justify-center rounded-2xl border border-zinc-800 border-dashed bg-zinc-900/40 p-8 text-center">
                  <BookOpen className="mb-3 h-10 w-10 text-zinc-600" />
                  <h3 className="font-bold text-zinc-200 text-sm">No Active Courses Found</h3>
                  <p className="mt-1 text-xs text-zinc-400 max-w-sm">
                    No active courses found for your Google account. If your courses belong to past semesters, check the{' '}
                    <Link href="/courses?tab=archived" className="text-indigo-400 hover:underline">
                      Archived Vault
                    </Link>.
                  </p>
                </div>
              ) : (
                <CourseCards courses={courses} />
              )}
            </div>

            {/* Upcoming Deadlines (1 Col) */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold tracking-tight text-zinc-100">Deadlines & Tasks</h2>
              <DeadlineList deadlines={deadlines} />
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
