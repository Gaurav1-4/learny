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
} from 'lucide-react';
import { ClassroomCourse } from '@/types';
import { Input } from '@/components/ui/input';

export default function CoursesPage() {
  const [activeTab, setActiveTab] = useState<'active' | 'archived'>('active');
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<ClassroomCourse[]>([]);
  const [archivedCourses, setArchivedCourses] = useState<ClassroomCourse[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function fetchAllCourses() {
      try {
        setLoading(true);
        const [activeRes, archivedRes] = await Promise.all([
          fetch('/api/classroom/courses?state=ACTIVE'),
          fetch('/api/classroom/courses?state=ARCHIVED'),
        ]);

        if (activeRes.ok) {
          const data = await activeRes.json();
          setCourses(Array.isArray(data) ? data : []);
        }

        if (archivedRes.ok) {
          const data = await archivedRes.json();
          setArchivedCourses(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error('Failed to fetch courses:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchAllCourses();
  }, []);

  const currentList = activeTab === 'active' ? courses : archivedCourses;

  const filteredCourses = currentList.filter((c) => {
    const q = searchQuery.toLowerCase();
    return (
      (c.name || '').toLowerCase().includes(q) ||
      (c.section || '').toLowerCase().includes(q) ||
      (c.descriptionHeading || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
        <div>
          <div className="text-[11px] font-medium text-zinc-500">Google Classroom</div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white mt-0.5">
            Courses &amp; Archives
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

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-zinc-800/80 pb-2">
        <button
          onClick={() => setActiveTab('active')}
          className={`rounded-lg px-3.5 py-1.5 text-xs font-medium transition-colors ${
            activeTab === 'active'
              ? 'bg-zinc-800 text-white font-semibold'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          Active ({courses.length})
        </button>

        <button
          onClick={() => setActiveTab('archived')}
          className={`rounded-lg px-3.5 py-1.5 text-xs font-medium transition-colors ${
            activeTab === 'archived'
              ? 'bg-zinc-800 text-white font-semibold'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          Archived ({archivedCourses.length})
        </button>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-40 animate-pulse rounded-xl bg-zinc-900 border border-zinc-800"
            />
          ))}
        </div>
      ) : (
        <AnimatePresence mode="wait">
          {filteredCourses.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-zinc-800 border-dashed bg-zinc-900/20 p-8 text-center"
            >
              <Archive className="mb-2 h-10 w-10 text-zinc-600" />
              <h3 className="text-sm font-semibold text-zinc-200">
                No {activeTab === 'active' ? 'Active' : 'Archived'} Courses Found
              </h3>
              <p className="text-xs text-zinc-500 mt-1 max-w-sm">
                {searchQuery
                  ? 'No courses matched your search query.'
                  : `Your connected Google Classroom has no courses marked as ${activeTab}.`}
              </p>
            </motion.div>
          ) : (
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.15 }}
              className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
            >
              {filteredCourses.map((course) => (
                <Link
                  key={course.id}
                  href={`/courses/${course.id}`}
                  className="group rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 sm:p-5 transition-colors hover:border-zinc-700 hover:bg-zinc-900/70 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="rounded bg-zinc-800 px-2 py-0.5 text-[10px] font-medium text-zinc-300">
                        {course.section || (activeTab === 'archived' ? 'Archived' : 'Active')}
                      </span>
                      <ArrowRight className="h-3.5 w-3.5 text-zinc-500 transition-transform group-hover:translate-x-1 group-hover:text-white" />
                    </div>

                    <h3 className="text-sm sm:text-base font-semibold text-white group-hover:text-zinc-200 transition-colors line-clamp-2 leading-snug">
                      {course.name}
                    </h3>

                    {course.descriptionHeading && (
                      <p className="text-xs text-zinc-400 line-clamp-1">
                        {course.descriptionHeading}
                      </p>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-zinc-800/60 flex items-center justify-between text-[11px] text-zinc-500">
                    <span>{course.room ? `Room ${course.room}` : 'Classroom'}</span>
                    <span className="text-zinc-300 font-medium group-hover:text-white transition-colors">
                      Open Workspace &rarr;
                    </span>
                  </div>
                </Link>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
}
