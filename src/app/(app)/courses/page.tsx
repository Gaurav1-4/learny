'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Search, BookOpen, Archive, CheckCircle2, Clock, Filter } from 'lucide-react';
import { ClassroomCourse } from '@/types';

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

  const filteredCourses = currentList.filter((c) =>
    (c.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.section || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.descriptionHeading || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-100">Course Workspace</h1>
          <p className="text-sm text-zinc-400 mt-1">
            Access your active courses and browse previous semesters from your Google Classroom archives.
          </p>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Search courses or topics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:w-64 rounded-xl border border-zinc-800 bg-zinc-900 py-2 pl-10 pr-4 text-sm text-zinc-100 placeholder-zinc-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-sm"
          />
        </div>
      </div>

      {/* Tabs: Active vs Archived */}
      <div className="flex items-center gap-2 border-b border-zinc-800 pb-2">
        <button
          onClick={() => setActiveTab('active')}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all ${
            activeTab === 'active'
              ? 'bg-zinc-800 text-white shadow-sm border border-zinc-700/50'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
          }`}
        >
          <BookOpen className="h-4 w-4 text-indigo-400" />
          <span>Active Courses</span>
          <span className="ml-1 rounded-full bg-zinc-900 px-2 py-0.5 text-xs text-zinc-300 font-mono">
            {courses.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('archived')}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all ${
            activeTab === 'archived'
              ? 'bg-zinc-800 text-white shadow-sm border border-zinc-700/50'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
          }`}
        >
          <Archive className="h-4 w-4 text-purple-400" />
          <span>Archived Vault</span>
          <span className="ml-1 rounded-full bg-zinc-900 px-2 py-0.5 text-xs text-zinc-300 font-mono">
            {archivedCourses.length}
          </span>
        </button>
      </div>

      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-48 animate-pulse rounded-2xl bg-zinc-900 border border-zinc-800" />
          ))}
        </div>
      ) : filteredCourses.length === 0 ? (
        <div className="flex min-h-[360px] flex-col items-center justify-center rounded-2xl border border-zinc-800 border-dashed bg-zinc-900/40 p-8 text-center">
          {activeTab === 'active' ? (
            <BookOpen className="mb-4 h-12 w-12 text-zinc-600" />
          ) : (
            <Archive className="mb-4 h-12 w-12 text-purple-600/50" />
          )}
          <h3 className="text-lg font-bold text-zinc-200">
            {searchQuery
              ? "No courses matching your search."
              : activeTab === "active"
              ? "No active courses found in Google Classroom."
              : "No archived courses found in your account."}
          </h3>
          <p className="mt-1 text-sm text-zinc-400 max-w-sm">
            {activeTab === 'archived'
              ? "Courses from past semesters that have been archived in Google Classroom will appear here."
              : "Enrolled active courses will automatically sync."}
          </p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredCourses.map((course) => (
            <Link
              key={course.id}
              href={`/courses/${course.id}`}
              className="group flex flex-col justify-between rounded-2xl border border-zinc-800 bg-zinc-900/80 p-6 transition-all hover:border-indigo-500/50 hover:bg-zinc-800/60 shadow-sm"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span
                    className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-semibold ${
                      course.courseState === "ARCHIVED"
                        ? "bg-purple-950/40 text-purple-400 border border-purple-800/40"
                        : "bg-indigo-950/40 text-indigo-400 border border-indigo-800/40"
                    }`}
                  >
                    {course.courseState === "ARCHIVED" ? "Archived Semester" : "Active Subject"}
                  </span>
                  {course.section && (
                    <span className="text-xs text-zinc-400 font-medium truncate max-w-[120px]">
                      {course.section}
                    </span>
                  )}
                </div>

                <h3 className="line-clamp-2 text-lg font-bold text-zinc-100 group-hover:text-indigo-400 transition-colors">
                  {course.name}
                </h3>

                {course.descriptionHeading && (
                  <p className="mt-2 text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                    {course.descriptionHeading}
                  </p>
                )}
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-zinc-800/80 pt-4">
                <span className="text-xs text-zinc-500">
                  {course.room ? `Room ${course.room}` : "Google Classroom"}
                </span>
                <span className="text-xs font-semibold text-indigo-400 group-hover:underline flex items-center gap-1">
                  Browse materials &rarr;
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
