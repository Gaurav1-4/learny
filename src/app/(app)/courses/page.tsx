'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  BookOpen,
  Archive,
  ArrowRight,
  ExternalLink,
  Sparkles,
  Layers,
  GraduationCap,
  User,
  Hash,
} from 'lucide-react';
import { ClassroomCourse } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

const GRADIENTS = [
  'from-indigo-600/20 via-zinc-900/90 to-purple-600/10 border-indigo-500/30 hover:border-indigo-400/60',
  'from-emerald-600/20 via-zinc-900/90 to-teal-600/10 border-emerald-500/30 hover:border-emerald-400/60',
  'from-violet-600/20 via-zinc-900/90 to-fuchsia-600/10 border-violet-500/30 hover:border-violet-400/60',
  'from-cyan-600/20 via-zinc-900/90 to-blue-600/10 border-cyan-500/30 hover:border-cyan-400/60',
  'from-amber-600/20 via-zinc-900/90 to-orange-600/10 border-amber-500/30 hover:border-amber-400/60',
  'from-rose-600/20 via-zinc-900/90 to-pink-600/10 border-rose-500/30 hover:border-rose-400/60',
];

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

  const filteredCourses = currentList.filter(
    (c) =>
      (c.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.section || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.descriptionHeading || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-2.5">
            <BookOpen className="h-8 w-8 text-indigo-400" />
            Course Workspace & Archives
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Browse your current semester subjects and retrieve study materials from archived courses.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <Input
            placeholder="Search subjects or teachers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-11 bg-zinc-900/90 border-zinc-800 text-xs text-zinc-100 rounded-2xl focus:border-indigo-500/50 shadow-inner"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-3 border-b border-white/5 pb-3">
        <button
          onClick={() => setActiveTab('active')}
          className={`relative flex items-center gap-2 rounded-2xl px-5 py-2.5 text-xs font-bold transition-all ${
            activeTab === 'active' ? 'text-white' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Sparkles className="h-4 w-4 text-indigo-400" />
          <span>Active Subjects</span>
          <span className="rounded-full bg-zinc-800 px-2.5 py-0.5 text-[11px] font-mono text-zinc-300">
            {courses.length}
          </span>
          {activeTab === 'active' && (
            <motion.div
              layoutId="activeCoursesTabIndicator"
              className="absolute inset-0 -z-10 rounded-2xl bg-zinc-800/90 border border-zinc-700/60 shadow-sm"
              transition={{ type: 'spring', stiffness: 450, damping: 35 }}
            />
          )}
        </button>

        <button
          onClick={() => setActiveTab('archived')}
          className={`relative flex items-center gap-2 rounded-2xl px-5 py-2.5 text-xs font-bold transition-all ${
            activeTab === 'archived' ? 'text-white' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Archive className="h-4 w-4 text-amber-400" />
          <span>Archived Vault</span>
          <span className="rounded-full bg-zinc-800 px-2.5 py-0.5 text-[11px] font-mono text-zinc-300">
            {archivedCourses.length}
          </span>
          {activeTab === 'archived' && (
            <motion.div
              layoutId="activeCoursesTabIndicator"
              className="absolute inset-0 -z-10 rounded-2xl bg-zinc-800/90 border border-zinc-700/60 shadow-sm"
              transition={{ type: 'spring', stiffness: 450, damping: 35 }}
            />
          )}
        </button>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-56 animate-pulse rounded-3xl bg-zinc-900 border border-zinc-800"
            />
          ))}
        </div>
      ) : (
        <AnimatePresence mode="wait">
          {filteredCourses.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex min-h-[350px] flex-col items-center justify-center rounded-3xl border border-zinc-800 border-dashed bg-zinc-900/30 p-12 text-center"
            >
              <BookOpen className="mb-3 h-12 w-12 text-zinc-600" />
              <h3 className="text-base font-bold text-zinc-200">
                No {activeTab === 'active' ? 'Active' : 'Archived'} Courses Found
              </h3>
              <p className="text-xs text-zinc-400 mt-1 max-w-sm">
                {searchQuery
                  ? 'No courses matched your search keyword.'
                  : `Your Google Classroom has no courses marked as ${activeTab}.`}
              </p>
            </motion.div>
          ) : (
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
            >
              {filteredCourses.map((course, idx) => {
                const gradientClass = GRADIENTS[idx % GRADIENTS.length];

                return (
                  <motion.div
                    key={course.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.04, duration: 0.25 }}
                    whileHover={{ y: -4, transition: { duration: 0.2 } }}
                  >
                    <Link
                      href={`/courses/${course.id}`}
                      className={`group relative flex h-full flex-col justify-between overflow-hidden rounded-3xl border bg-gradient-to-br p-6 shadow-xl backdrop-blur-xl transition-all ${gradientClass}`}
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/5 border border-white/10 px-2.5 py-1 text-[11px] font-bold text-zinc-300">
                            <Hash className="h-3 w-3 text-indigo-400" />
                            {course.section || 'General'}
                          </span>

                          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/5 text-zinc-400 transition-transform group-hover:translate-x-1 group-hover:text-white">
                            <ArrowRight className="h-4 w-4" />
                          </div>
                        </div>

                        <h3 className="text-xl font-extrabold tracking-tight text-white group-hover:text-indigo-200 transition-colors line-clamp-2 leading-snug">
                          {course.name}
                        </h3>

                        {course.descriptionHeading && (
                          <p className="text-xs text-zinc-400 flex items-center gap-1.5 line-clamp-1">
                            <User className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
                            <span>{course.descriptionHeading}</span>
                          </p>
                        )}
                      </div>

                      <div className="mt-6 border-t border-white/5 pt-4 flex items-center justify-between text-xs text-zinc-400">
                        <span className="text-[11px] font-medium text-zinc-500">
                          {activeTab === 'archived' ? 'Archived Record' : 'Active Subject'}
                        </span>
                        <span className="inline-flex items-center gap-1 font-bold text-indigo-400 group-hover:text-indigo-300">
                          View Workspace &rarr;
                        </span>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
}
