'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  BookOpen,
  Archive,
  ArrowRight,
  User,
  EyeOff,
  Eye,
  CheckCircle2,
} from 'lucide-react';
import { ClassroomCourse } from '@/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { pushToFirestore } from '@/lib/firebase/firestore-sync';
import { SwipeableTabs, SwipeableTabItem } from '@/components/ui/swipeable-tabs';

export default function CoursesPage() {
  const [activeTab, setActiveTab] = useState<'active' | 'hidden' | 'archived'>('active');
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<ClassroomCourse[]>([]);
  const [archivedCourses, setArchivedCourses] = useState<ClassroomCourse[]>([]);
  const [hiddenCourseIds, setHiddenCourseIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    // 1. Load hidden courses from localStorage
    const savedHidden = localStorage.getItem('learny_hidden_courses');
    if (savedHidden) {
      try {
        setHiddenCourseIds(JSON.parse(savedHidden));
      } catch {}
    }

    // 0ms instant cache hydration
    try {
      const cached = sessionStorage.getItem('learny_courses_cache');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed.active?.length > 0) {
          setCourses(parsed.active);
          if (parsed.archived) setArchivedCourses(parsed.archived);
          setLoading(false);
        }
      }
    } catch {}

    async function fetchAllCourses() {
      try {
        if (courses.length === 0) setLoading(true);
        const [activeRes, archivedRes] = await Promise.all([
          fetch('/api/classroom/courses?state=ACTIVE'),
          fetch('/api/classroom/courses?state=ARCHIVED'),
        ]);

        let activeData: ClassroomCourse[] = [];
        let archivedData: ClassroomCourse[] = [];

        if (activeRes.ok) {
          const data = await activeRes.json();
          activeData = Array.isArray(data) ? data : [];
          setCourses(activeData);
        }

        if (archivedRes.ok) {
          const data = await archivedRes.json();
          archivedData = Array.isArray(data) ? data : [];
          setArchivedCourses(archivedData);
        }

        try {
          sessionStorage.setItem(
            'learny_courses_cache',
            JSON.stringify({ active: activeData, archived: archivedData })
          );
        } catch {}
      } catch (error) {
        console.error('Failed to fetch courses:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchAllCourses();
  }, []);

  const toggleHideCourse = (courseId: string, courseName: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    let updated: string[];
    const isCurrentlyHidden = hiddenCourseIds.includes(courseId) || courseName.toLowerCase().includes('hci');

    if (isCurrentlyHidden) {
      updated = hiddenCourseIds.filter((id) => id !== courseId);
      setToastMessage(`Unhid "${courseName}" - added back to active dashboard`);
    } else {
      updated = [...hiddenCourseIds, courseId];
      setToastMessage(`Hidden "${courseName}" from dashboard & deadlines`);
    }

    setHiddenCourseIds(updated);
    localStorage.setItem('learny_hidden_courses', JSON.stringify(updated));
    pushToFirestore({ settings: { hiddenCourseIds: updated } });
    setTimeout(() => setToastMessage(null), 3000);
  };

  const isCourseHidden = (c: ClassroomCourse) => {
    return hiddenCourseIds.includes(c.id) || (c.name || '').toLowerCase().includes('hci');
  };

  const renderCourseGrid = (courseList: ClassroomCourse[], emptyTitle: string) => {
    const filtered = courseList.filter((c) => {
      const q = searchQuery.toLowerCase();
      return (
        (c.name || '').toLowerCase().includes(q) ||
        (c.section || '').toLowerCase().includes(q) ||
        (c.descriptionHeading || '').toLowerCase().includes(q)
      );
    });

    if (loading && courses.length === 0) {
      return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-40 animate-pulse rounded-xl bg-zinc-900 border border-zinc-800" />
          ))}
        </div>
      );
    }

    if (filtered.length === 0) {
      return (
        <div className="flex min-h-[260px] flex-col items-center justify-center rounded-2xl border border-zinc-800 border-dashed bg-zinc-900/20 p-8 text-center">
          <Archive className="mb-2 h-10 w-10 text-zinc-600" />
          <h3 className="text-sm font-semibold text-zinc-200">{emptyTitle}</h3>
          <p className="text-xs text-zinc-500 mt-1 max-w-sm">
            {searchQuery ? 'No courses matched your search query.' : 'No courses in this category.'}
          </p>
        </div>
      );
    }

    return (
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((course) => {
          const hidden = isCourseHidden(course);

          return (
            <div
              key={course.id}
              className="group relative rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 transition-all hover:border-zinc-700 hover:bg-zinc-900/70 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="rounded bg-zinc-800 px-2 py-0.5 text-[10px] font-medium text-zinc-300 font-mono">
                    {course.section || 'ACTIVE'}
                  </span>

                  {/* Hide / Unhide Toggle */}
                  <button
                    onClick={(e) => toggleHideCourse(course.id, course.name, e)}
                    title={hidden ? 'Add back to Active Semester' : 'Hide from Dashboard & Deadlines'}
                    className={`rounded-lg p-1.5 text-xs transition-colors flex items-center gap-1 ${
                      hidden
                        ? 'bg-zinc-800 text-zinc-400 hover:text-white'
                        : 'text-zinc-500 hover:text-amber-400 hover:bg-zinc-800'
                    }`}
                  >
                    {hidden ? (
                      <>
                        <Eye className="h-3.5 w-3.5 text-emerald-400" />
                        <span className="text-[10px] text-emerald-400">Unhide</span>
                      </>
                    ) : (
                      <>
                        <EyeOff className="h-3.5 w-3.5" />
                        <span className="text-[10px]">Hide</span>
                      </>
                    )}
                  </button>
                </div>

                <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-zinc-200 transition-colors line-clamp-2 leading-snug">
                  {course.name}
                </h3>

                {course.descriptionHeading && (
                  <p className="text-xs text-zinc-400 line-clamp-1">
                    {course.descriptionHeading}
                  </p>
                )}
              </div>

              <div className="pt-4 mt-2 border-t border-zinc-800/80 flex items-center justify-between">
                <Link
                  href={`/courses/${course.id}`}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-400 group-hover:text-indigo-300 transition-colors"
                >
                  <span>Open Subject Hub</span>
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </Link>

                {course.alternateLink && (
                  <a
                    href={course.alternateLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-zinc-500 hover:text-zinc-300 text-[11px]"
                    title="Open in Google Classroom"
                  >
                    Classroom ↗
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const activeCourseList = courses.filter((c) => !isCourseHidden(c));
  const hiddenCourseList = courses.filter((c) => isCourseHidden(c));

  const coursesTabs: SwipeableTabItem[] = [
    {
      id: 'active',
      label: 'Active Semester',
      badge: activeCourseList.length,
      icon: <BookOpen className="h-3.5 w-3.5" />,
      content: renderCourseGrid(activeCourseList, 'No Active Courses Found'),
    },
    {
      id: 'hidden',
      label: 'Past / Hidden',
      badge: hiddenCourseList.length,
      icon: <EyeOff className="h-3.5 w-3.5" />,
      content: renderCourseGrid(hiddenCourseList, 'No Hidden Courses Found'),
    },
    {
      id: 'archived',
      label: 'Archived',
      badge: archivedCourses.length,
      icon: <Archive className="h-3.5 w-3.5" />,
      content: renderCourseGrid(archivedCourses, 'No Archived Courses Found'),
    },
  ];

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="rounded-xl bg-zinc-900 border border-emerald-500/30 p-3 flex items-center gap-2 text-xs text-emerald-400 font-medium shadow-lg"
          >
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
        <div>
          <div className="text-[11px] font-medium text-zinc-500">Google Classroom Sync</div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white mt-0.5">
            Courses &amp; Semester Subjects
          </h1>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
          <Input
            placeholder="Search subjects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 bg-zinc-900 border-zinc-800 text-xs text-zinc-100 rounded-lg"
          />
        </div>
      </div>

      {/* Swipeable Tabs (Click + Swipe Gestures) */}
      <SwipeableTabs
        tabs={coursesTabs}
        activeTabId={activeTab}
        onTabChange={(id) => setActiveTab(id as any)}
      />
    </div>
  );
}
